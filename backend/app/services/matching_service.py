from typing import List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.caregiver import CaregiverProfile
from app.models.elder import Elder
from app.models.location import ElderLocation

def calculate_match_score(elder: Elder, caregiver: CaregiverProfile) -> Tuple[float, List[str], bool, bool]:
    score = 40.0  # Base score for verified caregiver
    reasons = []

    # 1. Primary Language Match
    primary_lang_match = elder.primaryLanguage.lower() in [l.lower() for l in (caregiver.languages or [])]
    if primary_lang_match or elder.primaryLanguage.lower() == caregiver.primaryLanguage.lower():
        score += 25.0
        reasons.append(f"Fluent in primary language ({elder.primaryLanguage})")

    # 2. Locality Match
    locality_match = False
    if elder.location and elder.location.locality:
        elder_loc = elder.location.locality.lower()
        caregiver_locs = [loc.lower() for loc in (caregiver.serviceLocalities or [])]
        if elder_loc in caregiver_locs or any(elder_loc in loc for loc in caregiver_locs):
            locality_match = True
            score += 20.0
            reasons.append(f"Serves elder's locality ({elder.location.locality})")

    # 3. Mobility Experience Match
    caregiver_mobility = [m.upper() for m in (caregiver.mobilityExperience or [])]
    if elder.mobilityLevel.upper() in caregiver_mobility:
        score += 15.0
        reasons.append(f"Experienced in {elder.mobilityLevel.replace('_', ' ').title()} care")

    # 4. Shift Preference Match
    caregiver_shifts = [s.upper() for s in (caregiver.shiftPreferences or [])]
    if elder.shiftPreference.upper() in caregiver_shifts:
        score += 10.0
        reasons.append(f"Available for {elder.shiftPreference.replace('_', ' ').title()} shifts")

    # 5. Medical Conditions Experience Match
    elder_conditions = [c.lower() for c in (elder.medicalConditions or [])]
    caregiver_conditions = [c.lower() for c in (caregiver.medicalConditions or [])]
    matched_conditions = [c for c in elder_conditions if any(c in cg_c for cg_c in caregiver_conditions)]
    if matched_conditions:
        score += 10.0
        reasons.append(f"Specialized in: {', '.join(matched_conditions).title()}")

    # 6. Rating Bonus
    if caregiver.rating >= 4.5:
        score += 5.0
        reasons.append(f"Top-rated caregiver ({caregiver.rating}★)")

    final_score = round(min(score, 99.0), 1)
    return final_score, reasons, locality_match, primary_lang_match


async def get_recommendations(db: AsyncSession, elder: Elder) -> List[dict]:
    result = await db.execute(select(CaregiverProfile).where(CaregiverProfile.isAvailable == True))
    caregivers = result.scalars().all()

    matches = []
    for cg in caregivers:
        score, reasons, locality_match, lang_match = calculate_match_score(elder, cg)
        matches.append({
            "caregiver": cg,
            "matchScore": score,
            "eligibilityStatus": "ELIGIBLE" if score >= 50.0 else "CONDITIONAL",
            "matchReasons": reasons,
            "localityMatch": locality_match,
            "languageMatch": lang_match
        })

    # Sort descending by matchScore
    matches.sort(key=lambda x: x["matchScore"], reverse=True)
    return matches

