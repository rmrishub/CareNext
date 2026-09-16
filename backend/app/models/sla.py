import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class SLAAgreement(Base):
    __tablename__ = "sla_agreements"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    familyId = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    elderId = Column(String(36), ForeignKey("elders.id", ondelete="CASCADE"), nullable=False, index=True)
    caregiverId = Column(String(36), ForeignKey("caregiver_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    
    version = Column(String(20), nullable=False, default="v1.0")
    title = Column(String(255), nullable=False, default="CareConnect Elder Care Service Level Agreement")
    content = Column(Text, nullable=False)
    status = Column(String(50), nullable=False, default="ACCEPTED")  # PENDING, ACCEPTED, REJECTED
    acceptedAt = Column(DateTime(timezone=True), nullable=True)
    acceptedBy = Column(String(255), nullable=True)

    createdAt = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    caregiver = relationship("CaregiverProfile", lazy="selectin")
    elder = relationship("Elder", lazy="selectin")


class PhaseBState(Base):
    __tablename__ = "phase_b_states"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    familyId = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    elderId = Column(String(36), ForeignKey("elders.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    selectedCaregiverId = Column(String(36), ForeignKey("caregiver_profiles.id", ondelete="SET NULL"), nullable=True)
    
    # States
    matchingStatus = Column(String(50), nullable=False, default="NOT_STARTED")  # NOT_STARTED, IN_PROGRESS, SHORTLISTED, SELECTED
    interviewStatus = Column(String(50), nullable=False, default="NOT_STARTED") # NOT_STARTED, SCHEDULED, COMPLETED, PASSED
    paymentStatus = Column(String(50), nullable=False, default="NOT_STARTED")   # NOT_STARTED, ORDER_CREATED, PAID
    slaStatus = Column(String(50), nullable=False, default="NOT_STARTED")       # NOT_STARTED, ACCEPTED
    phaseStatus = Column(String(50), nullable=False, default="IN_PROGRESS")     # IN_PROGRESS, COMPLETED

    updatedAt = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    selectedCaregiver = relationship("CaregiverProfile", lazy="selectin")
