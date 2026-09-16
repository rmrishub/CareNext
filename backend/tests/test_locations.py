import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_verify_chennai_serviceable_location(client: AsyncClient, auth_headers: dict):
    response = await client.post("/api/elder-locations/verify", headers=auth_headers, json={
        "addressLine1": "Flat 3B, Shanthi Apartments, 2nd Main Road",
        "locality": "Adyar",
        "city": "Chennai",
        "state": "Tamil Nadu",
        "postalCode": "600020",
        "landmark": "Near Adyar Signal"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["serviceable"] is True
    assert data["verificationStatus"] == "VERIFIED"
    assert data["latitude"] > 12.0
    assert data["longitude"] > 80.0
    assert data["assignedHub"] == "South Chennai Hub"

@pytest.mark.asyncio
async def test_verify_out_of_service_location(client: AsyncClient, auth_headers: dict):
    response = await client.post("/api/elder-locations/verify", headers=auth_headers, json={
        "addressLine1": "12, 100 Feet Road, Indiranagar",
        "locality": "Indiranagar",
        "city": "Bengaluru",
        "state": "Karnataka",
        "postalCode": "560038"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["serviceable"] is False
    assert data["verificationStatus"] == "NOT_SERVICEABLE"

@pytest.mark.asyncio
async def test_verify_invalid_address(client: AsyncClient, auth_headers: dict):
    # Missing/too short street address
    res1 = await client.post("/api/elder-locations/verify", headers=auth_headers, json={
        "addressLine1": "A",
        "locality": "Adyar",
        "city": "Chennai",
        "state": "Tamil Nadu",
        "postalCode": "600020"
    })
    assert res1.status_code == 200
    assert res1.json()["verificationStatus"] == "INVALID_ADDRESS"

    # Malformed pincode
    res2 = await client.post("/api/elder-locations/verify", headers=auth_headers, json={
        "addressLine1": "24 Kasturibai Nagar",
        "locality": "Adyar",
        "city": "Chennai",
        "state": "Tamil Nadu",
        "postalCode": "6000"
    })
    assert res2.status_code == 200
    assert res2.json()["verificationStatus"] == "INVALID_ADDRESS"

@pytest.mark.asyncio
async def test_verify_simulated_edge_cases(client: AsyncClient, auth_headers: dict):
    res_perm = await client.post("/api/elder-locations/verify", headers=auth_headers, json={
        "addressLine1": "24 Kasturibai Nagar",
        "locality": "Adyar",
        "city": "Chennai",
        "state": "Tamil Nadu",
        "postalCode": "600020",
        "simulateState": "PERMISSION_DENIED"
    })
    assert res_perm.status_code == 200
    assert res_perm.json()["verificationStatus"] == "PERMISSION_DENIED"
    assert res_perm.json()["serviceable"] is False

    res_unable = await client.post("/api/elder-locations/verify", headers=auth_headers, json={
        "addressLine1": "24 Kasturibai Nagar",
        "locality": "Adyar",
        "city": "Chennai",
        "state": "Tamil Nadu",
        "postalCode": "600020",
        "simulateState": "UNABLE_TO_VERIFY"
    })
    assert res_unable.status_code == 200
    assert res_unable.json()["verificationStatus"] == "UNABLE_TO_VERIFY"

@pytest.mark.asyncio
async def test_persist_elder_location(client: AsyncClient, auth_headers: dict):
    # First create an elder
    elder_res = await client.post("/api/elders", headers=auth_headers, json={
        "name": "Kalyani Ammal",
        "age": 76,
        "gender": "FEMALE"
    })
    elder_id = elder_res.json()["id"]

    # Now persist verified location
    loc_res = await client.patch(f"/api/elders/{elder_id}/location", headers=auth_headers, json={
        "addressLine1": "Old #14, New #28, 4th Cross Street",
        "addressLine2": "R.A. Puram",
        "locality": "R.A. Puram",
        "city": "Chennai",
        "state": "Tamil Nadu",
        "postalCode": "600028",
        "landmark": "Opposite Sangeetha Restaurant",
        "latitude": 13.0270,
        "longitude": 80.2580
    })
    assert loc_res.status_code == 200
    loc_data = loc_res.json()
    assert loc_data["elderId"] == elder_id
    assert loc_data["serviceable"] is True
    assert loc_data["verificationStatus"] == "VERIFIED"

    # Verify elder lookup now returns location
    get_elder = await client.get(f"/api/elders/{elder_id}", headers=auth_headers)
    assert get_elder.status_code == 200
    assert get_elder.json()["location"]["postalCode"] == "600028"

