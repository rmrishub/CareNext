import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class ElderLocation(Base):
    __tablename__ = "elder_locations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    elderId = Column(String(36), ForeignKey("elders.id", ondelete="CASCADE"), nullable=False, unique=True)
    addressLine1 = Column(String(255), nullable=False)
    addressLine2 = Column(String(255), nullable=True)
    locality = Column(String(100), nullable=False)
    city = Column(String(100), nullable=False, default="Chennai")
    state = Column(String(100), nullable=False, default="Tamil Nadu")
    postalCode = Column(String(20), nullable=False)
    landmark = Column(String(255), nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    verificationStatus = Column(String(50), nullable=False, default="PENDING")
    serviceable = Column(Boolean, nullable=False, default=False)
    verifiedAt = Column(DateTime(timezone=True), nullable=True)
    createdAt = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updatedAt = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    elder = relationship("Elder", back_populates="location", foreign_keys=[elderId])

