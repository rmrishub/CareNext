from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.elder import Elder
from app.models.location import ElderLocation
from app.schemas.elder import ElderCreate, ElderUpdate, ElderResponse
from app.services.persona_service import PersonaService

router = APIRouter(prefix="/elders", tags=["Elders & Persona Intake"])

@router.post("", response_model=ElderResponse, status_code=status.HTTP_201_CREATED)
async def create_elder(
    payload: ElderCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Register an elder under the authenticated family sponsor account."""
    elder = Elder(
        familyId=current_user.id,
        name=payload.name,
        age=payload.age,
        gender=payload.gender,
        dateOfBirth=payload.dateOfBirth,
        personaStatus="DRAFT"
    )
    db.add(elder)
    await db.commit()
    await db.refresh(elder, attribute_names=["location"])
    return elder

@router.get("", response_model=List[ElderResponse])
async def list_elders(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all elders associated with authenticated family sponsor."""
    result = await db.execute(
        select(Elder)
        .where(Elder.familyId == current_user.id)
        .options(selectinload(Elder.location))
        .order_by(Elder.createdAt.desc())
    )
    elders = result.scalars().all()
    return elders

@router.get("/{elder_id}", response_model=ElderResponse)
async def get_elder(
    elder_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve structured persona and location for a specific elder."""
    await PersonaService.get_elder_for_sponsor(db, elder_id, current_user.id)
    
    result = await db.execute(
        select(Elder)
        .where(Elder.id == elder_id)
        .options(selectinload(Elder.location))
    )
    elder = result.scalar_one()
    return elder

@router.patch("/{elder_id}", response_model=ElderResponse)
async def update_elder_persona(
    elder_id: str,
    payload: ElderUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update clinical intake and lifestyle persona fields for an elder.
    Enforces family sponsor ownership and calculates persona progression.
    """
    elder = await PersonaService.get_elder_for_sponsor(db, elder_id, current_user.id)
    
    update_data = payload.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(elder, field, val)

    # Recalculate persona status if not explicitly overridden
    if "personaStatus" not in update_data:
        elder.personaStatus = PersonaService.calculate_persona_status(elder)

    await db.commit()
    
    result = await db.execute(
        select(Elder)
        .where(Elder.id == elder.id)
        .options(selectinload(Elder.location))
    )
    refreshed_elder = result.scalar_one()
    return refreshed_elder
