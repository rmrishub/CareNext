import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class PaymentOrder(Base):
    __tablename__ = "payment_orders"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    familyId = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    elderId = Column(String(36), ForeignKey("elders.id", ondelete="CASCADE"), nullable=False, index=True)
    caregiverId = Column(String(36), ForeignKey("caregiver_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    
    amount = Column(Float, nullable=False)
    currency = Column(String(10), nullable=False, default="INR")
    description = Column(String(255), nullable=False, default="CareConnect Phase B Advance Deposit")
    gateway = Column(String(50), nullable=False, default="RAZORPAY")
    gatewayOrderId = Column(String(255), nullable=True, index=True)
    
    # CREATED, PAID, FAILED, CANCELLED
    status = Column(String(50), nullable=False, default="CREATED")
    
    createdAt = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updatedAt = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    caregiver = relationship("CaregiverProfile", lazy="selectin")
    transactions = relationship("PaymentTransaction", back_populates="order", cascade="all, delete-orphan")


class PaymentTransaction(Base):
    __tablename__ = "payment_transactions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    paymentOrderId = Column(String(36), ForeignKey("payment_orders.id", ondelete="CASCADE"), nullable=False, index=True)
    gatewayTransactionId = Column(String(255), nullable=True, index=True)
    gatewaySignature = Column(String(255), nullable=True)
    status = Column(String(50), nullable=False, default="SUCCESS")  # SUCCESS, FAILED
    failureReason = Column(Text, nullable=True)
    verifiedAt = Column(DateTime(timezone=True), nullable=True)
    createdAt = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    order = relationship("PaymentOrder", back_populates="transactions")
