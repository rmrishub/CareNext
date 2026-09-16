from datetime import datetime, timezone
import uuid
import hmac
import hashlib
from typing import Optional, Dict
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.payment import PaymentOrder, PaymentTransaction
from app.core.config import settings

async def create_payment_order(
    db: AsyncSession,
    family_id: str,
    elder_id: str,
    caregiver_id: str,
    amount: float,
    currency: str = "INR",
    description: str = "CareConnect Phase B Advance Deposit"
) -> PaymentOrder:
    # Generate mock/real gateway order ID
    gateway_order_id = f"order_rzp_{uuid.uuid4().hex[:12]}"

    order = PaymentOrder(
        familyId=family_id,
        elderId=elder_id,
        caregiverId=caregiver_id,
        amount=amount,
        currency=currency,
        description=description,
        gateway="RAZORPAY",
        gatewayOrderId=gateway_order_id,
        status="CREATED"
    )
    db.add(order)
    await db.commit()
    await db.refresh(order)
    return order


async def verify_payment(
    db: AsyncSession,
    payment_order_id: str,
    gateway_transaction_id: str,
    gateway_signature: Optional[str] = None
) -> PaymentTransaction:
    result = await db.execute(select(PaymentOrder).where(PaymentOrder.id == payment_order_id))
    order = result.scalars().first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment order not found.")

    # Check idempotency: If already paid, return existing transaction
    tx_result = await db.execute(
        select(PaymentTransaction).where(PaymentTransaction.paymentOrderId == payment_order_id)
    )
    existing_tx = tx_result.scalars().first()
    if existing_tx and existing_tx.status == "SUCCESS":
        return existing_tx

    # In production with Razorpay:
    # expected_sig = hmac.new(settings.RAZORPAY_KEY_SECRET.encode(), f"{order.gatewayOrderId}|{gateway_transaction_id}".encode(), hashlib.sha256).hexdigest()
    
    # Mark order as PAID and record transaction
    order.status = "PAID"
    
    transaction = PaymentTransaction(
        paymentOrderId=order.id,
        gatewayTransactionId=gateway_transaction_id,
        gatewaySignature=gateway_signature or "mock_sig_verified",
        status="SUCCESS",
        verifiedAt=datetime.now(timezone.utc)
    )
    db.add(transaction)
    await db.commit()
    await db.refresh(transaction)
    return transaction

