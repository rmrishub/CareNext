import uuid
from datetime import datetime, timezone, date
from sqlalchemy import Column, String, Integer, Date, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class Elder(Base):
    __tablename__ = "elders"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    familyId = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    dateOfBirth = Column(Date, nullable=True)
    age = Column(Integer, nullable=False, default=70)
    gender = Column(String(20), nullable=False, default="FEMALE")
    locationId = Column(String(36), nullable=True)
    
    # Clinical & Lifestyle Persona Fields
    mobilityLevel = Column(String(50), nullable=False, default="INDEPENDENT")
    medicalConditions = Column(JSON, nullable=False, default=list)
    careRequirements = Column(JSON, nullable=False, default=list)
    medicalDevices = Column(JSON, nullable=False, default=list)
    dietaryPreferences = Column(JSON, nullable=False, default=list)
    languages = Column(JSON, nullable=False, default=list)
    primaryLanguage = Column(String(50), nullable=False, default="Tamil")
    lifestylePreferences = Column(JSON, nullable=False, default=list)
    dailyRoutine = Column(JSON, nullable=True, default=dict)
    shiftPreference = Column(String(50), nullable=False, default="EIGHT_HOUR_DAY")
    additionalNotes = Column(Text, nullable=True)
    
    # Workflow Status: DRAFT, IN_PROGRESS, REVIEW, SAVED
    personaStatus = Column(String(50), nullable=False, default="DRAFT")
    
    createdAt = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updatedAt = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    family = relationship("User", back_populates="elders")
    location = relationship(
        "ElderLocation",
        back_populates="elder",
        uselist=False,
        lazy="selectin",
        cascade="all, delete-orphan",
        primaryjoin="Elder.id == foreign(ElderLocation.elderId)"
    )
    assessments = relationship("HomeAssessmentRequest", back_populates="elder", cascade="all, delete-orphan")
