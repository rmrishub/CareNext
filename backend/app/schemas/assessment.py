from datetime import datetime, date
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict

class AssessmentStatus:
    DRAFT = "DRAFT"
    SUBMITTED = "SUBMITTED"
    CONFIRMED = "CONFIRMED"
    FAILED = "FAILED"
    CANCELLED = "CANCELLED"

class AssessmentCreate(BaseModel):
    elderId: str
    preferredDate: date
    preferredTime: str = Field("MORNING_9_12", pattern="^(MORNING_9_12|AFTERNOON_12_4|EVENING_4_7)$")
    notes: Optional[str] = None

class AssessmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    elderId: str
    requestedBy: str
    addressSnapshot: Dict[str, Any]
    preferredDate: date
    preferredTime: str
    notes: Optional[str] = None
    status: str
    createdAt: datetime
    updatedAt: datetime
