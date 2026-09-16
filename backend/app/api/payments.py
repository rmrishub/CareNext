from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.payment import PaymentOrder
from app.schemas.payment import (
    PaymentOrderCreateRequest, PaymentOrderResponse,
    PaymentVerifyRequest, PaymentVerifyResponse
)
from app.services.payment_service import create_payment_order, verify_payment
from app.services.sla_service import get_or_create_phase_b_state

router = APIRouter(tags=["Advance Payment (Phase B3)"])

@router.post("/payments/create-order/", response_model=PaymentOrderResponse, status_code=status.HTTP_201_CREATED)
async def create_new_payment_order(
    body: PaymentOrderCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a trusted payment order for advance deposit."""
    order = await create_payment_order(
        db=db,
        family_id=current_user.id,
        elder_id=body.elderId,
        caregiver_id=body.caregiverId,
        amount=body.amount,
        currency=body.currency or "INR",
        description=body.description or "CareConnect Phase B Advance Deposit"
    )

    # Update Phase B state
    state = await get_or_create_phase_b_state(db, current_user.id, body.elderId)
    state.paymentStatus = "ORDER_CREATED"
    await db.commit()

    return order


@router.post("/payments/verify/", response_model=PaymentVerifyResponse)
async def verify_payment_transaction(
    body: PaymentVerifyRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Verify server-side payment signature and update transaction state."""
    tx = await verify_payment(
        db=db,
        payment_order_id=body.paymentOrderId,
        gateway_transaction_id=body.gatewayTransactionId,
        gateway_signature=body.gatewaySignature
    )

    result = await db.execute(select(PaymentOrder).where(PaymentOrder.id == body.paymentOrderId))
    order = result.scalars().first()

    if order:
        state = await get_or_create_phase_b_state(db, current_user.id, order.elderId)
        state.paymentStatus = "PAID"
        await db.commit()

    return {
        "success": True,
        "message": "Payment verified and recorded successfully.",
        "paymentOrderId": body.paymentOrderId,
        "status": tx.status
    }


@router.get("/payments/{order_id}/status/", response_model=PaymentOrderResponse)
async def get_payment_order_status(
    order_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get status of a payment order."""
    result = await db.execute(select(PaymentOrder).where(PaymentOrder.id == order_id))
    order = result.scalars().first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment order not found.")
    return order
