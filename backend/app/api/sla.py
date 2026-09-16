from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.sla import (
    SLAAgreementResponse, SLAAcceptRequest, PhaseBStateResponse
)
from app.services.sla_service import (
    get_sla_agreement, accept_sla_agreement, get_or_create_phase_b_state
)

router = APIRouter(tags=["SLA & Phase B Completion (Phase B4)"])

@router.get("/sla/current/", response_model=SLAAgreementResponse)
async def get_current_sla(
    elder_id: str,
    caregiver_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve the SLA agreement document for an elder and caregiver pair."""
    return await get_sla_agreement(db, current_user.id, elder_id, caregiver_id)


@router.post("/sla/{id}/accept/", response_model=SLAAgreementResponse)
async def accept_sla(
    id: str,
    body: SLAAcceptRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Record explicit digital acceptance of the SLA agreement."""
    return await accept_sla_agreement(db, id, current_user.id, body.acceptedBy)


@router.get("/phase-b/{elder_id}/status/", response_model=PhaseBStateResponse)
async def get_phase_b_status(
    elder_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get the overall Phase B status and progress tracker for an elder."""
    return await get_or_create_phase_b_state(db, current_user.id, elder_id)
