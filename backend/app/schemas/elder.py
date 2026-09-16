from datetime import datetime, date
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.location import ElderLocationResponse

class MobilityLevel:
    INDEPENDENT = "INDEPENDENT"
    CANE_WALKER = "CANE_WALKER"
    WHEELCHAIR = "WHEELCHAIR"
    BEDRIDDEN = "BEDRIDDEN"

class PersonaStatus:
    DRAFT = "DRAFT"
    IN_PROGRESS = "IN_PROGRESS"
    REVIEW = "REVIEW"
    SAVED = "SAVED"

class ShiftPreference:
    EIGHT_HOUR_DAY = "EIGHT_HOUR_DAY"
    TWELVE_HOUR_DAY_NIGHT = "TWELVE_HOUR_DAY_NIGHT"
    TWENTY_FOUR_HOUR_LIVE_IN = "TWENTY_FOUR_HOUR_LIVE_IN"

class ElderCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    age: int = Field(..., ge=18, le=125)
    gender: str = Field("FEMALE", pattern="^(MALE|FEMALE|OTHER)$")
    dateOfBirth: Optional[date] = None

class ElderUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    dateOfBirth: Optional[date] = None
    locationId: Optional[str] = None
    mobilityLevel: Optional[str] = None
    medicalConditions: Optional[List[str]] = None
    careRequirements: Optional[List[str]] = None
    medicalDevices: Optional[List[str]] = None
    dietaryPreferences: Optional[List[str]] = None
    languages: Optional[List[str]] = None
    primaryLanguage: Optional[str] = None
    lifestylePreferences: Optional[List[str]] = None
    dailyRoutine: Optional[Dict[str, Any]] = None
    shiftPreference: Optional[str] = None
    additionalNotes: Optional[str] = None
    personaStatus: Optional[str] = None

class ElderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    familyId: str
    name: str
    dateOfBirth: Optional[date] = None
    age: int
    gender: str
    locationId: Optional[str] = None
    mobilityLevel: str
    medicalConditions: List[str] = []
    careRequirements: List[str] = []
    medicalDevices: List[str] = []
    dietaryPreferences: List[str] = []
    languages: List[str] = []
    primaryLanguage: str
    lifestylePreferences: List[str] = []
    dailyRoutine: Optional[Dict[str, Any]] = None
    shiftPreference: str
    additionalNotes: Optional[str] = None
    personaStatus: str
    createdAt: datetime
    updatedAt: datetime
    location: Optional[ElderLocationResponse] = None
