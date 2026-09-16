from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class LocationVerificationStatus:
    PENDING = "PENDING"
    VERIFYING = "VERIFYING"
    VERIFIED = "VERIFIED"
    NOT_SERVICEABLE = "NOT_SERVICEABLE"
    INVALID_ADDRESS = "INVALID_ADDRESS"
    UNABLE_TO_VERIFY = "UNABLE_TO_VERIFY"
    PERMISSION_DENIED = "PERMISSION_DENIED"

class LocationVerifyRequest(BaseModel):
    addressLine1: str
    addressLine2: Optional[str] = None
    locality: str
    city: str = "Chennai"
    state: str = "Tamil Nadu"
    postalCode: str
    landmark: Optional[str] = None
    simulateState: Optional[str] = None  # Optional parameter to simulate edge cases (PERMISSION_DENIED, UNABLE_TO_VERIFY)

class LocationVerifyResponse(BaseModel):
    serviceable: bool
    verificationStatus: str
    message: str
    latitude: float
    longitude: float
    locality: str
    city: str
    postalCode: str
    assignedHub: Optional[str] = None

class ElderLocationPersistRequest(BaseModel):
    addressLine1: str
    addressLine2: Optional[str] = None
    locality: str
    city: str = "Chennai"
    state: str = "Tamil Nadu"
    postalCode: str
    landmark: Optional[str] = None
    latitude: float
    longitude: float

class ElderLocationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    elderId: str
    addressLine1: str
    addressLine2: Optional[str] = None
    locality: str
    city: str
    state: str
    postalCode: str
    landmark: Optional[str] = None
    latitude: float
    longitude: float
    verificationStatus: str
    serviceable: bool
    verifiedAt: Optional[datetime] = None
    createdAt: datetime
    updatedAt: datetime
