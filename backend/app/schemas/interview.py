from typing import Optional, Any
from pydantic import BaseModel, ConfigDict
from app.schemas.caregiver import CaregiverProfileResponse

class InterviewCreateRequest(BaseModel):
    elderId: str
    caregiverId: str
    scheduledStart: str  # ISO timestamp
    durationMinutes: Optional[int] = 10
    meetingType: Optional[str] = "VIDEO_CALL"
    notes: Optional[str] = None

class InterviewResponse(BaseModel):
    id: str
    familyId: str
    elderId: str
    caregiverId: str
    scheduledStart: Any
    scheduledEnd: Any
    durationMinutes: int
    meetingType: str
    meetingReference: Optional[str] = None
    notes: Optional[str] = None
    status: str
    createdAt: Any
    updatedAt: Any
    caregiver: Optional[CaregiverProfileResponse] = None

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

class CaregiverSelectionRequest(BaseModel):
    elderId: str
    caregiverId: str
