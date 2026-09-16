from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.auth import (
    SendOtpRequest, SendOtpResponse, VerifyOtpRequest,
    GoogleAuthRequest, TokenResponse
)
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/otp/send", response_model=SendOtpResponse, status_code=status.HTTP_200_OK)
async def send_otp(payload: SendOtpRequest):
    """Dispatch OTP via WhatsApp or SMS to sponsor's mobile number."""
    result = AuthService.send_otp(phone=payload.phone, channel=payload.channel)
    return result

@router.post("/otp/verify", response_model=TokenResponse, status_code=status.HTTP_200_OK)
async def verify_otp(payload: VerifyOtpRequest, db: AsyncSession = Depends(get_db)):
    """Verify submitted OTP and authenticate or register family sponsor."""
    result = await AuthService.verify_otp_and_login(
        db=db,
        phone=payload.phone,
        otp=payload.otp,
        fullName=payload.fullName,
        email=payload.email
    )
    return result

@router.post("/google", response_model=TokenResponse, status_code=status.HTTP_200_OK)
async def login_google(payload: GoogleAuthRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate or register sponsor via Google Sign-In."""
    result = await AuthService.login_with_google(
        db=db,
        idToken=payload.idToken,
        fullName=payload.fullName,
        email=payload.email
    )
    return result

