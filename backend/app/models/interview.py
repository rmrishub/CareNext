import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class Interview(Base):
    __tablename__ = "interviews"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    familyId = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    elderId = Column(String(36), ForeignKey("elders.id", ondelete="CASCADE"), nullable=False, index=True)
    caregiverId = Column(String(36), ForeignKey("caregiver_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    
    scheduledStart = Column(DateTime(timezone=True), nullable=False)
    scheduledEnd = Column(DateTime(timezone=True), nullable=False)
    durationMinutes = Column(Integer, nullable=False, default=10)
    meetingType = Column(String(50), nullable=False, default="VIDEO_CALL")  # VIDEO_CALL, AUDIO_CALL
    meetingReference = Column(String(255), nullable=True)  # Meet link or room ID
    notes = Column(Text, nullable=True)
    
    # SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW
    status = Column(String(50), nullable=False, default="SCHEDULED")
    
    createdAt = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updatedAt = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    caregiver = relationship("CaregiverProfile", lazy="selectin")
    elder = relationship("Elder", lazy="selectin")

