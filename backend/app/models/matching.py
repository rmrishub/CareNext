import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class CaregiverShortlist(Base):
    __tablename__ = "caregiver_shortlists"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    familyId = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    elderId = Column(String(36), ForeignKey("elders.id", ondelete="CASCADE"), nullable=False, index=True)
    caregiverId = Column(String(36), ForeignKey("caregiver_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(50), nullable=False, default="SHORTLISTED")  # SHORTLISTED, SELECTED, REMOVED
    createdAt = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    caregiver = relationship("CaregiverProfile", lazy="selectin")
    elder = relationship("Elder", lazy="selectin")


class MatchResult(Base):
    __tablename__ = "match_results"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    elderId = Column(String(36), ForeignKey("elders.id", ondelete="CASCADE"), nullable=False, index=True)
    caregiverId = Column(String(36), ForeignKey("caregiver_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    eligibilityStatus = Column(String(50), nullable=False, default="ELIGIBLE")
    score = Column(Float, nullable=False, default=85.0)
    matchContext = Column(JSON, nullable=False, default=dict)  # breakdown of match (language, locality, etc.)
    createdAt = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    caregiver = relationship("CaregiverProfile", lazy="selectin")

