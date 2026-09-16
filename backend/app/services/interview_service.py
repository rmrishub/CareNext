from datetime import datetime, timezone, timedelta
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.interview import Interview
from app.models.caregiver import CaregiverAvailability

async def get_caregiver_availability(db: AsyncSession, caregiver_id: str) -> List[CaregiverAvailability]:
    result = await db.execute(
        select(CaregiverAvailability).where(
            CaregiverAvailability.caregiverId == caregiver_id
        )
    )
    return result.scalars().all()

async def schedule_interview(
    db: AsyncSession,
    family_id: str,
    elder_id: str,
    caregiver_id: str,
    scheduled_start: datetime,
    duration_minutes: int = 10,
    meeting_type: str = "VIDEO_CALL",
    notes: Optional[str] = None
) -> Interview:
    scheduled_end = scheduled_start + timedelta(minutes=duration_minutes)

    # Check double booking for the caregiver
    existing = await db.execute(
        select(Interview).where(
            Interview.caregiverId == caregiver_id,
            Interview.status == "SCHEDULED",
            Interview.scheduledStart < scheduled_end,
            Interview.scheduledEnd > scheduled_start
        )
    )
    if existing.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Caregiver is already booked for an interview during this time slot."
        )

    room_id = f"meet-careconnect-{int(datetime.now().timestamp())}"
    meeting_ref = f"https://meet.jit.si/{room_id}"

    interview = Interview(
        familyId=family_id,
        elderId=elder_id,
        caregiverId=caregiver_id,
        scheduledStart=scheduled_start,
        scheduledEnd=scheduled_end,
        durationMinutes=duration_minutes,
        meetingType=meeting_type,
        meetingReference=meeting_ref,
        notes=notes,
        status="SCHEDULED"
    )
    db.add(interview)
    await db.commit()
    await db.refresh(interview)
    return interview

async def cancel_interview(db: AsyncSession, interview_id: str, family_id: str) -> Interview:
    result = await db.execute(select(Interview).where(Interview.id == interview_id))
    interview = result.scalars().first()
    if not interview:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview not found.")
    if interview.familyId != family_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to cancel this interview.")

    interview.status = "CANCELLED"
    await db.commit()
    await db.refresh(interview)
    return interview

