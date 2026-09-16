from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.interview import Interview
from app.models.sla import PhaseBState
from app.schemas.caregiver import CaregiverAvailabilitySchema
from app.schemas.interview import (
    InterviewCreateRequest, InterviewResponse, CaregiverSelectionRequest
)
from app.services.interview_service import (
    get_caregiver_availability, schedule_interview, cancel_interview
)
from app.services.sla_service import get_or_create_phase_b_state

router = APIRouter(tags=["Intro Call & Selection (Phase B2)"])

@router.get("/caregivers/{caregiver_id}/availability/", response_model=List[CaregiverAvailabilitySchema])
async def get_availability_slots(
    caregiver_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get available schedule slots for a caregiver."""
    return await get_caregiver_availability(db, caregiver_id)


@router.post("/interviews/", response_model=InterviewResponse, status_code=status.HTTP_201_CREATED)
async def create_interview(
    body: InterviewCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Schedule a 10-minute introductory call with a caregiver."""
    try:
        dt = datetime.fromisoformat(body.scheduledStart.replace("Z", "+00:00"))
    except ValueError:
        dt = datetime.now(timezone.utc)

    interview = await schedule_interview(
        db=db,
        family_id=current_user.id,
        elder_id=body.elderId,
        caregiver_id=body.caregiverId,
        scheduled_start=dt,
        duration_minutes=body.durationMinutes or 10,
        meeting_type=body.meetingType or "VIDEO_CALL",
        notes=body.notes
    )

    # Update Phase B State to SCHEDULED
    state = await get_or_create_phase_b_state(db, current_user.id, body.elderId)
    state.interviewStatus = "SCHEDULED"
    state.selectedCaregiverId = body.caregiverId
    await db.commit()

    return interview


@router.get("/interviews/{interview_id}/", response_model=InterviewResponse)
async def get_interview_details(
    interview_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get details of a scheduled interview."""
    result = await db.execute(select(Interview).where(Interview.id == interview_id))
    interview = result.scalars().first()
    if not interview:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview not found.")
    return interview


@router.post("/interviews/{interview_id}/cancel/", response_model=InterviewResponse)
async def cancel_scheduled_interview(
    interview_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Cancel a scheduled interview."""
    return await cancel_interview(db, interview_id, current_user.id)


@router.post("/caregiver-selection/", response_model=dict)
async def confirm_caregiver_selection(
    body: CaregiverSelectionRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Confirm selection of a caregiver for an elder post-interview."""
    state = await get_or_create_phase_b_state(db, current_user.id, body.elderId)
    state.selectedCaregiverId = body.caregiverId
    state.matchingStatus = "SELECTED"
    state.interviewStatus = "PASSED"
    await db.commit()

    return {
        "success": True,
        "elderId": body.elderId,
        "selectedCaregiverId": body.caregiverId,
        "message": "Caregiver selection confirmed successfully."
    }

