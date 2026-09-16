import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.models.elder import Elder
from app.models.caregiver import CaregiverProfile

@pytest.mark.asyncio
async def test_phase_b_full_workflow(client: AsyncClient, test_db: AsyncSession, sponsor_user: User, auth_headers: dict):
    # 1. Create Elder Profile
    elder = Elder(
        familyId=sponsor_user.id,
        name="Ramanathan",
        age=74,
        gender="MALE",
        mobilityLevel="WHEELCHAIR",
        medicalConditions=["Dementia", "Diabetes"],
        primaryLanguage="Tamil",
        shiftPreference="EIGHT_HOUR_DAY",
        personaStatus="SAVED"
    )
    test_db.add(elder)

    # 2. Add Caregiver
    cg = CaregiverProfile(
        fullName="Lakshmi Sundaram",
        languages=["Tamil", "English"],
        primaryLanguage="Tamil",
        skills=["Vitals Monitoring", "Dementia Care"],
        mobilityExperience=["WHEELCHAIR", "BEDRIDDEN"],
        medicalConditions=["Dementia", "Diabetes"],
        shiftPreferences=["EIGHT_HOUR_DAY"],
        serviceLocalities=["Adyar", "Mylapore"],
        hourlyRate=250.0,
        dailyRate=1800.0,
        rating=4.9,
        isAvailable=True
    )
    test_db.add(cg)
    await test_db.commit()

    # 3. Recommendations Endpoint
    rec_res = await client.get(f"/api/v1/elders/{elder.id}/caregiver-recommendations/", headers=auth_headers)
    assert rec_res.status_code == 200
    rec_data = rec_res.json()
    assert rec_data["totalMatches"] > 0
    assert rec_data["recommendations"][0]["matchScore"] >= 50.0

    # 4. Shortlist Caregiver
    shortlist_res = await client.post(
        f"/api/v1/elders/{elder.id}/shortlist/",
        json={"caregiverId": cg.id},
        headers=auth_headers
    )
    assert shortlist_res.status_code == 201

    # 5. Schedule 10-Minute Intro Call
    interview_res = await client.post(
        "/api/v1/interviews/",
        json={
            "elderId": elder.id,
            "caregiverId": cg.id,
            "scheduledStart": "2026-09-18T10:00:00Z",
            "durationMinutes": 10,
            "meetingType": "VIDEO_CALL"
        },
        headers=auth_headers
    )
    assert interview_res.status_code == 201
    assert interview_res.json()["status"] == "SCHEDULED"

    # 6. Confirm Selection
    select_res = await client.post(
        "/api/v1/caregiver-selection/",
        json={"elderId": elder.id, "caregiverId": cg.id},
        headers=auth_headers
    )
    assert select_res.status_code == 200
    assert select_res.json()["success"] is True

    # 7. Create Payment Order
    order_res = await client.post(
        "/api/v1/payments/create-order/",
        json={
            "elderId": elder.id,
            "caregiverId": cg.id,
            "amount": 1800.0,
            "currency": "INR",
            "description": "Advance Deposit"
        },
        headers=auth_headers
    )
    assert order_res.status_code == 201
    order_id = order_res.json()["id"]

    # 8. Verify Payment
    verify_res = await client.post(
        "/api/v1/payments/verify/",
        json={
            "paymentOrderId": order_id,
            "gatewayTransactionId": "pay_mock_123456"
        },
        headers=auth_headers
    )
    assert verify_res.status_code == 200
    assert verify_res.json()["success"] is True

    # 9. Get SLA Agreement
    sla_res = await client.get(
        f"/api/v1/sla/current/?elder_id={elder.id}&caregiver_id={cg.id}",
        headers=auth_headers
    )
    assert sla_res.status_code == 200
    sla_id = sla_res.json()["id"]

    # 10. Accept SLA
    accept_res = await client.post(
        f"/api/v1/sla/{sla_id}/accept/",
        json={"acceptedBy": "Suresh Kumar"},
        headers=auth_headers
    )
    assert accept_res.status_code == 200
    assert accept_res.json()["status"] == "ACCEPTED"

    # 11. Verify Final Phase B Completed Status
    status_res = await client.get(f"/api/v1/phase-b/{elder.id}/status/", headers=auth_headers)
    assert status_res.status_code == 200
    assert status_res.json()["phaseStatus"] == "COMPLETED"
