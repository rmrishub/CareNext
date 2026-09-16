from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict

class UserRole(str):
    FAMILY_SPONSOR = "FAMILY_SPONSOR"
    CAREGIVER = "CAREGIVER"
    OPS_MANAGER = "OPS_MANAGER"
    ADMIN = "ADMIN"

class SendOtpRequest(BaseModel):
    phone: str
    channel: str = "WHATSAPP"

class SendOtpResponse(BaseModel):
    success: bool
    message: str
    phone: str
    dev_otp: Optional[str] = None  # Provided in dev/testing mode

class VerifyOtpRequest(BaseModel):
    phone: str
    otp: str
    fullName: Optional[str] = "Family Sponsor"
    email: Optional[str] = None

class GoogleAuthRequest(BaseModel):
    idToken: str
    fullName: Optional[str] = None
    email: Optional[str] = None

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    role: str
    fullName: str
    phone: Optional[str] = None
    email: Optional[str] = None
    authProvider: str
    createdAt: datetime
    updatedAt: datetime

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
