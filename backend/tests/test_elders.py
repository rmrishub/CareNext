import pytest
from httpx import AsyncClient
from app.core.security import create_access_token
from app.models.user import User

@pytest.mark.asyncio
async def test_create_elder(client: AsyncClient, auth_headers: dict):
    response = await client.post("/api/elders", headers=auth_headers, json={
        "name": "Venkatesan Swaminathan",
        "age": 78,
        "gender": "MALE",
        "dateOfBirth": "1948-05-12"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Venkatesan Swaminathan"
    assert data["age"] == 78
    assert data["gender"] == "MALE"
    assert data["personaStatus"] == "DRAFT"
    assert data["mobilityLevel"] == "INDEPENDENT"

@pytest.mark.asyncio
async def test_update_elder_persona_steps(client: AsyncClient, auth_headers: dict):
    # 1. Create
    create_res = await client.post("/api/elders", headers=auth_headers, json={
        "name": "Subbalakshmi R",
        "age": 74,
        "gender": "FEMALE"
    })
    elder_id = create_res.json()["id"]

    # 2. Update mobility & clinical requirements
    clinical_res = await client.patch(f"/api/elders/{elder_id}", headers=auth_headers, json={
        "mobilityLevel": "CANE_WALKER",
        "medicalConditions": ["diabetes", "hypertension", "post_stroke"],
        "careRequirements": ["medication_management", "mobility_support", "vitals_monitoring"],
        "medicalDevices": ["walker", "blood_glucose_monitor"]
    })
    assert clinical_res.status_code == 200
    clinical_data = clinical_res.json()
    assert clinical_data["mobilityLevel"] == "CANE_WALKER"
    assert "post_stroke" in clinical_data["medicalConditions"]
    assert "walker" in clinical_data["medicalDevices"]
    assert clinical_data["personaStatus"] == "IN_PROGRESS"

    # 3. Update lifestyle & dietary preferences
    lifestyle_res = await client.patch(f"/api/elders/{elder_id}", headers=auth_headers, json={
        "dietaryPreferences": ["vegetarian", "diabetic_diet", "low_sodium"],
        "languages": ["Tamil", "English"],
        "primaryLanguage": "Tamil",
        "lifestylePreferences": ["morning_walks", "religious_puja", "carnatic_music"],
        "dailyRoutine": {
            "wakeTime": "05:30",
            "breakfastTime": "08:00",
            "pujaTime": "06:30",
            "bedTime": "21:30"
        },
        "shiftPreference": "TWELVE_HOUR_DAY_NIGHT",
        "additionalNotes": "Needs gentle encouragement with walking exercise; prefers Tamil-speaking attendant."
    })
    assert lifestyle_res.status_code == 200
    life_data = lifestyle_res.json()
    assert life_data["primaryLanguage"] == "Tamil"
    assert life_data["shiftPreference"] == "TWELVE_HOUR_DAY_NIGHT"
    assert life_data["personaStatus"] == "REVIEW"

    # 4. Finalize persona to SAVED
    final_res = await client.patch(f"/api/elders/{elder_id}", headers=auth_headers, json={
        "personaStatus": "SAVED"
    })
    assert final_res.status_code == 200
    assert final_res.json()["personaStatus"] == "SAVED"

@pytest.mark.asyncio
async def test_unauthorized_access_prevented(client: AsyncClient, auth_headers: dict, test_db):
    # Create elder under default sponsor
    create_res = await client.post("/api/elders", headers=auth_headers, json={
        "name": "Elder Under Sponsor A",
        "age": 80,
        "gender": "MALE"
    })
    elder_id = create_res.json()["id"]

    # Create Sponsor B
    sponsor_b = User(
        fullName="Sponsor B",
        phone="+919876599999",
        email="sponsor.b@example.com",
        role="FAMILY_SPONSOR"
    )
    test_db.add(sponsor_b)
    await test_db.commit()
    await test_db.refresh(sponsor_b)

    token_b = create_access_token({"sub": sponsor_b.id, "role": sponsor_b.role})
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # Sponsor B attempts to access Sponsor A's elder
    get_res = await client.get(f"/api/elders/{elder_id}", headers=headers_b)
    assert get_res.status_code == 403

    # Sponsor B attempts to update Sponsor A's elder
    patch_res = await client.patch(f"/api/elders/{elder_id}", headers=headers_b, json={
        "name": "Hacked Name"
    })
    assert patch_res.status_code == 403

