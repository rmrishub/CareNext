import uuid
from datetime import datetime, timezone, date
from sqlalchemy import Column, String, Date, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class HomeAssessmentRequest(Base):
    __tablename__ = "home_assessment_requests"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    elderId = Column(String(36), ForeignKey("elders.id", ondelete="CASCADE"), nullable=False, index=True)
    requestedBy = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    addressSnapshot = Column(JSON, nullable=False, default=dict)
    preferredDate = Column(Date, nullable=False)
    preferredTime = Column(String(50), nullable=False, default="MORNING_9_12")
    notes = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="CONFIRMED")
    createdAt = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updatedAt = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    elder = relationship("Elder", back_populates="assessments")
    requester = relationship("User", back_populates="assessments")

