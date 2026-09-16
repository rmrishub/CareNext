from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.elder import Elder
from app.models.assessment import HomeAssessmentRequest
from app.schemas.assessment import AssessmentCreate, AssessmentResponse
from app.services.persona_service import PersonaService

router = APIRouter(prefix="/home-assessments", tags=["Home Assessment Booking"])

@router.post("", response_model=AssessmentResponse, status_code=status.HTTP_201_CREATED)
async def create_home_assessment(
    payload: AssessmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Book a clinical home assessment by Care Manager.
    Automatically captures a frozen snapshot of the elder's verified address.
    """
    elder = await PersonaService.get_elder_for_sponsor(db, payload.elderId, current_user.id)
    
    # Check elder's verified location
    result = await db.execute(
        select(Elder)
        .where(Elder.id == elder.id)
        .options(selectinload(Elder.location))
    )
    loaded_elder = result.scalar_one()
    
    if not loaded_elder.location or not loaded_elder.location.serviceable:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A verified Chennai service address is required before booking a home assessment."
        )

    # Address snapshot
    loc = loaded_elder.location
    address_snapshot = {
        "addressLine1": loc.addressLine1,
        "addressLine2": loc.addressLine2,
        "locality": loc.locality,
        "city": loc.city,
        "state": loc.state,
        "postalCode": loc.postalCode,
        "landmark": loc.landmark,
        "latitude": loc.latitude,
        "longitude": loc.longitude,
        "verificationStatus": loc.verificationStatus
    }

    assessment = HomeAssessmentRequest(
        elderId=elder.id,
        requestedBy=current_user.id,
        addressSnapshot=address_snapshot,
        preferredDate=payload.preferredDate,
        preferredTime=payload.preferredTime,
        notes=payload.notes,
        status="CONFIRMED"
    )
    db.add(assessment)
    await db.commit()
    await db.refresh(assessment)
    return assessment

@router.get("", response_model=List[AssessmentResponse])
async def list_home_assessments(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List home assessment bookings created by authenticated family sponsor."""
    result = await db.execute(
        select(HomeAssessmentRequest)
        .where(HomeAssessmentRequest.requestedBy == current_user.id)
        .order_by(HomeAssessmentRequest.createdAt.desc())
    )
    assessments = result.scalars().all()
    return assessments

@router.get("/{assessment_id}", response_model=AssessmentResponse)
async def get_home_assessment(
    assessment_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve home assessment booking details and status."""
    result = await db.execute(
        select(HomeAssessmentRequest)
        .where(HomeAssessmentRequest.id == assessment_id)
    )
    assessment = result.scalar_one_or_none()
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Home assessment booking not found"
        )
    if assessment.requestedBy != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to view this home assessment request"
        )
    return assessment

