import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class CaregiverProfile(Base):
    __tablename__ = "caregiver_profiles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    userId = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    fullName = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    email = Column(String(255), nullable=True)
    profilePhoto = Column(Text, nullable=True)
    gender = Column(String(20), nullable=False, default="FEMALE")
    age = Column(Integer, nullable=False, default=35)
    
    # Matching Attributes
    languages = Column(JSON, nullable=False, default=list)  # e.g., ["Tamil", "English"]
    primaryLanguage = Column(String(50), nullable=False, default="Tamil")
    skills = Column(JSON, nullable=False, default=list)  # e.g., ["Vitals Monitoring", "Feeding", "Bathing"]
    mobilityExperience = Column(JSON, nullable=False, default=list)  # e.g., ["WHEELCHAIR", "BEDRIDDEN"]
    medicalConditions = Column(JSON, nullable=False, default=list)  # e.g., ["Dementia", "Diabetes", "Post-Stroke"]
    shiftPreferences = Column(JSON, nullable=False, default=list)  # e.g., ["EIGHT_HOUR_DAY", "TWELVE_HOUR_DAY_NIGHT"]
    serviceLocalities = Column(JSON, nullable=False, default=list)  # e.g., ["Adyar", "Mylapore", "Velachery", "T. Nagar"]
    
    # Ratings & Rates
    hourlyRate = Column(Float, nullable=False, default=250.0)
    dailyRate = Column(Float, nullable=False, default=1800.0)
    rating = Column(Float, nullable=False, default=4.8)
    reviewCount = Column(Integer, nullable=False, default=12)
    verificationStatus = Column(String(50), nullable=False, default="VERIFIED")
    isAvailable = Column(Boolean, nullable=False, default=True)

    createdAt = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updatedAt = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    experiences = relationship("CaregiverExperience", back_populates="caregiver", cascade="all, delete-orphan")
    availabilities = relationship("CaregiverAvailability", back_populates="caregiver", cascade="all, delete-orphan")


class CaregiverExperience(Base):
    __tablename__ = "caregiver_experiences"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    caregiverId = Column(String(36), ForeignKey("caregiver_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    category = Column(String(100), nullable=False)  # e.g. "Dementia Care", "Palliative Care"
    yearsExperience = Column(Integer, nullable=False, default=3)
    description = Column(Text, nullable=True)

    createdAt = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    caregiver = relationship("CaregiverProfile", back_populates="experiences")


class CaregiverAvailability(Base):
    __tablename__ = "caregiver_availabilities"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    caregiverId = Column(String(36), ForeignKey("caregiver_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    slotDate = Column(String(10), nullable=False)  # YYYY-MM-DD
    startTime = Column(String(10), nullable=False)  # e.g., "10:00"
    endTime = Column(String(10), nullable=False)    # e.g., "10:15"
    status = Column(String(30), nullable=False, default="AVAILABLE")  # AVAILABLE, BOOKED, BLOCKED

    createdAt = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    caregiver = relationship("CaregiverProfile", back_populates="availabilities")
