from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.elder import Elder
from app.models.caregiver import CaregiverProfile
from app.models.matching import CaregiverShortlist
from app.schemas.caregiver import (
    CaregiverProfileResponse, CaregiverRecommendationResponse,
    ShortlistCreateRequest, ShortlistResponse
)
from app.services.matching_service import get_recommendations

router = APIRouter(tags=["Caregiver Matching (Phase B1)"])

@router.get("/elders/{elder_id}/caregiver-recommendations/", response_model=CaregiverRecommendationResponse)
async def get_elder_caregiver_recommendations(
    elder_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve scored caregiver recommendations for an elder based on Phase A persona requirements."""
    result = await db.execute(select(Elder).where(Elder.id == elder_id))
    elder = result.scalars().first()
    if not elder:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Elder profile not found.")
    if elder.familyId != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access recommendations for this elder.")

    recommendations = await get_recommendations(db, elder)
    return {
        "elderId": elder_id,
        "totalMatches": len(recommendations),
        "recommendations": recommendations
    }


@router.get("/caregivers/{caregiver_id}/", response_model=CaregiverProfileResponse)
async def get_caregiver_by_id(
    caregiver_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve full profile details of a verified caregiver."""
    result = await db.execute(select(CaregiverProfile).where(CaregiverProfile.id == caregiver_id))
    caregiver = result.scalars().first()
    if not caregiver:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Caregiver not found.")
    return caregiver


@router.post("/elders/{elder_id}/shortlist/", response_model=ShortlistResponse, status_code=status.HTTP_201_CREATED)
async def add_caregiver_to_shortlist(
    elder_id: str,
    body: ShortlistCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a caregiver to the sponsor shortlist for an elder."""
    # Check existing shortlist
    result = await db.execute(
        select(CaregiverShortlist).where(
            CaregiverShortlist.elderId == elder_id,
            CaregiverShortlist.caregiverId == body.caregiverId
        )
    )
    existing = result.scalars().first()
    if existing:
        return existing

    shortlist_item = CaregiverShortlist(
        familyId=current_user.id,
        elderId=elder_id,
        caregiverId=body.caregiverId,
        status="SHORTLISTED"
    )
    db.add(shortlist_item)
    await db.commit()
    await db.refresh(shortlist_item)
    return shortlist_item


@router.get("/elders/{elder_id}/shortlist/", response_model=List[ShortlistResponse])
async def get_elder_shortlist(
    elder_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all shortlisted caregivers for an elder."""
    result = await db.execute(
        select(CaregiverShortlist).where(
            CaregiverShortlist.elderId == elder_id,
            CaregiverShortlist.status == "SHORTLISTED"
        )
    )
    return result.scalars().all()


@router.delete("/elders/{elder_id}/shortlist/{caregiver_id}/", status_code=status.HTTP_204_NO_CONTENT)
async def remove_caregiver_from_shortlist(
    elder_id: str,
    caregiver_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Remove a caregiver from the elder shortlist."""
    result = await db.execute(
        select(CaregiverShortlist).where(
            CaregiverShortlist.elderId == elder_id,
            CaregiverShortlist.caregiverId == caregiver_id
        )
    )
    item = result.scalars().first()
    if item:
        await db.delete(item)
        await db.commit()
    return None

