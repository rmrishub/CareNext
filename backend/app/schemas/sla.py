from typing import Optional, Any
from pydantic import BaseModel, ConfigDict
from app.schemas.caregiver import CaregiverProfileResponse

class SLAAgreementResponse(BaseModel):
    id: str
    familyId: str
    elderId: str
    caregiverId: str
    version: str
    title: str
    content: str
    status: str
    acceptedAt: Optional[Any] = None
    acceptedBy: Optional[str] = None
    createdAt: Any
    caregiver: Optional[CaregiverProfileResponse] = None

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

class SLAAcceptRequest(BaseModel):
    acceptedBy: str  # Full name or digital signature string

class PhaseBStateResponse(BaseModel):
    id: str
    familyId: str
    elderId: str
    selectedCaregiverId: Optional[str] = None
    matchingStatus: str
    interviewStatus: str
    paymentStatus: str
    slaStatus: str
    phaseStatus: str
    updatedAt: Any
    selectedCaregiver: Optional[CaregiverProfileResponse] = None

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
