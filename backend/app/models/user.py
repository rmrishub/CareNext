import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    role = Column(String(50), nullable=False, default="FAMILY_SPONSOR")
    fullName = Column(String(255), nullable=False)
    phone = Column(String(30), nullable=True, index=True)
    email = Column(String(255), nullable=True, index=True)
    authProvider = Column(String(50), nullable=False, default="PHONE_OTP")
    createdAt = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updatedAt = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    elders = relationship("Elder", back_populates="family", cascade="all, delete-orphan")
    assessments = relationship("HomeAssessmentRequest", back_populates="requester")

