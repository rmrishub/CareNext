import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_booking_rejected_without_verified_location(client: AsyncClient, auth_headers: dict):
    # Create elder
    elder_res = await client.post("/api/elders", headers=auth_headers, json={
        "name": "Narayanan Nair",
        "age": 82,
        "gender": "MALE"
    })
    elder_id = elder_res.json()["id"]

    # Try booking home assessment
    book_res = await client.post("/api/home-assessments", headers=auth_headers, json={
        "elderId": elder_id,
        "preferredDate": "2026-09-25",
        "preferredTime": "MORNING_9_12",
        "notes": "Elder has mild knee pain, morning preferred."
    })
    assert book_res.status_code == 400
    assert "verified Chennai service address is required" in book_res.json()["detail"]

@pytest.mark.asyncio
async def test_booking_success_with_verified_location(client: AsyncClient, auth_headers: dict):
    # 1. Create elder
    elder_res = await client.post("/api/elders", headers=auth_headers, json={
        "name": "Narayanan Nair",
        "age": 82,
        "gender": "MALE"
    })
    elder_id = elder_res.json()["id"]

    # 2. Add verified location in Anna Nagar
    await client.patch(f"/api/elders/{elder_id}/location", headers=auth_headers, json={
        "addressLine1": "W-Block, 12th Street, 4th Avenue",
        "addressLine2": "Anna Nagar West",
        "locality": "Anna Nagar",
        "city": "Chennai",
        "state": "Tamil Nadu",
        "postalCode": "600040",
        "landmark": "Near Roundtana",
        "latitude": 13.0850,
        "longitude": 80.2101
    })

    # 3. Book home assessment
    book_res = await client.post("/api/home-assessments", headers=auth_headers, json={
        "elderId": elder_id,
        "preferredDate": "2026-09-25",
        "preferredTime": "MORNING_9_12",
        "notes": "Care Manager home clinical assessment requested."
    })
    assert book_res.status_code == 201
    data = book_res.json()
    assert data["elderId"] == elder_id
    assert data["status"] == "CONFIRMED"
    assert data["preferredTime"] == "MORNING_9_12"
    assert data["addressSnapshot"]["locality"] == "Anna Nagar"
    assert data["addressSnapshot"]["postalCode"] == "600040"

    assessment_id = data["id"]

    # 4. Fetch assessment by ID
    get_res = await client.get(f"/api/home-assessments/{assessment_id}", headers=auth_headers)
    assert get_res.status_code == 200
    assert get_res.json()["id"] == assessment_id

    # 5. List assessments
    list_res = await client.get("/api/home-assessments", headers=auth_headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1

