from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status
from app.models.elder import Elder
from app.models.user import User

class PersonaService:
    @staticmethod
    async def get_elder_for_sponsor(db: AsyncSession, elder_id: str, sponsor_id: str) -> Elder:
        """Fetch elder and assert family sponsor ownership."""
        result = await db.execute(
            select(Elder).where(Elder.id == elder_id)
        )
        elder = result.scalar_one_or_none()
        if not elder:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Elder profile not found"
            )
        if elder.familyId != sponsor_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have authorization to view or update this elder profile"
            )
        return elder

    @staticmethod
    def calculate_persona_status(elder: Elder) -> str:
        """
        Dynamically calculate persona completeness status:
        - DRAFT: newly created basic profile
        - IN_PROGRESS: partial clinical/lifestyle selections
        - REVIEW: core fields filled and ready for family review
        - SAVED: explicitly submitted and finalized by family sponsor
        """
        if elder.personaStatus == "SAVED":
            return "SAVED"
        
        has_clinical = bool(elder.mobilityLevel or elder.medicalConditions or elder.careRequirements)
        has_lifestyle = bool(elder.dietaryPreferences or elder.languages or elder.lifestylePreferences)
        
        if has_clinical and has_lifestyle:
            return "REVIEW"
        elif has_clinical or has_lifestyle:
            return "IN_PROGRESS"
        return "DRAFT"

