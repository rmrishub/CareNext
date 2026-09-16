from datetime import datetime, timezone
from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.sla import SLAAgreement, PhaseBState
from app.models.caregiver import CaregiverProfile
from app.models.elder import Elder

DEFAULT_SLA_TEXT = """
CARECONNECT SERVICE LEVEL AGREEMENT (SLA) — PHASE B
Version: v1.0

1. SERVICE OBLIGATIONS:
CareConnect agrees to provide a verified professional caregiver for elder care services as selected. The caregiver will perform duties including mobility assistance, vitals logging, and daily activity support.

2. ADVANCE DEPOSIT & REFUND POLICY:
The advance deposit paid is held securely. If the service is cancelled prior to caregiver deployment, a full refund will be processed within 5 business days.

3. CODE OF CONDUCT & SAFETY:
Caregivers will adhere to professional standards. Geofenced attendance validation is strictly enforced upon shift start and completion.

4. EMERGENCY PROTOCOLS:
In the event of a medical emergency, the caregiver will immediately trigger the CareConnect SOS escalation workflow and inform the primary family sponsor.
"""

async def get_or_create_phase_b_state(db: AsyncSession, family_id: str, elder_id: str) -> PhaseBState:
    result = await db.execute(select(PhaseBState).where(PhaseBState.elderId == elder_id))
    state = result.scalars().first()
    if not state:
        state = PhaseBState(
            familyId=family_id,
            elderId=elder_id,
            matchingStatus="IN_PROGRESS",
            interviewStatus="NOT_STARTED",
            paymentStatus="NOT_STARTED",
            slaStatus="NOT_STARTED",
            phaseStatus="IN_PROGRESS"
        )
        db.add(state)
        await db.commit()
        await db.refresh(state)
    return state

async def get_sla_agreement(db: AsyncSession, family_id: str, elder_id: str, caregiver_id: str) -> SLAAgreement:
    result = await db.execute(
        select(SLAAgreement).where(
            SLAAgreement.elderId == elder_id,
            SLAAgreement.caregiverId == caregiver_id
        )
    )
    sla = result.scalars().first()
    if not sla:
        sla = SLAAgreement(
            familyId=family_id,
            elderId=elder_id,
            caregiverId=caregiver_id,
            version="v1.0",
            title="CareConnect Elder Care Service Level Agreement",
            content=DEFAULT_SLA_TEXT,
            status="PENDING"
        )
        db.add(sla)
        await db.commit()
        await db.refresh(sla)
    return sla

async def accept_sla_agreement(db: AsyncSession, sla_id: str, family_id: str, accepted_by: str) -> SLAAgreement:
    result = await db.execute(select(SLAAgreement).where(SLAAgreement.id == sla_id))
    sla = result.scalars().first()
    if not sla:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="SLA agreement not found.")

    sla.status = "ACCEPTED"
    sla.acceptedAt = datetime.now(timezone.utc)
    sla.acceptedBy = accepted_by

    # Update Phase B overall completion state
    state = await get_or_create_phase_b_state(db, family_id, sla.elderId)
    state.slaStatus = "ACCEPTED"
    state.phaseStatus = "COMPLETED"

    await db.commit()
    await db.refresh(sla)
    return sla

