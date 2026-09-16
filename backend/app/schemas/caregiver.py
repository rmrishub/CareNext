from typing import List, Optional, Any, Dict
from pydantic import BaseModel, ConfigDict

class CaregiverExperienceSchema(BaseModel):
    id: str
    caregiverId: str
    category: str
    yearsExperience: int
    description: Optional[str] = None

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

class CaregiverAvailabilitySchema(BaseModel):
    id: str
    caregiverId: str
    slotDate: str
    startTime: str
    endTime: str
    status: str

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

class CaregiverProfileResponse(BaseModel):
    id: str
    userId: Optional[str] = None
    fullName: str
    phone: Optional[str] = None
    email: Optional[str] = None
    profilePhoto: Optional[str] = None
    gender: str
    age: int
    languages: List[str]
    primaryLanguage: str
    skills: List[str]
    mobilityExperience: List[str]
    medicalConditions: List[str]
    shiftPreferences: List[str]
    serviceLocalities: List[str]
    hourlyRate: float
    dailyRate: float
    rating: float
    reviewCount: int
    verificationStatus: str
    isAvailable: bool
    experiences: List[CaregiverExperienceSchema] = []

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

class RecommendationMatch(BaseModel):
    caregiver: CaregiverProfileResponse
    matchScore: float
    eligibilityStatus: str
    matchReasons: List[str]
    localityMatch: bool
    languageMatch: bool

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

class CaregiverRecommendationResponse(BaseModel):
    elderId: str
    totalMatches: int
    recommendations: List[RecommendationMatch]

class ShortlistCreateRequest(BaseModel):
    caregiverId: str

class ShortlistResponse(BaseModel):
    id: str
    familyId: str
    elderId: str
    caregiverId: str
    status: str
    createdAt: Any
    caregiver: CaregiverProfileResponse

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

