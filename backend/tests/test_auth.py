import pytest
from httpx import AsyncClient
from app.models.user import User

@pytest.mark.asyncio
async def test_send_otp_success(client: AsyncClient):
    response = await client.post("/api/auth/otp/send", json={
        "phone": "+919876500001",
        "channel": "WHATSAPP"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["phone"] == "+919876500001"
    assert data["dev_otp"] == "123456"

@pytest.mark.asyncio
async def test_verify_otp_creates_new_sponsor(client: AsyncClient):
    # First send OTP
    await client.post("/api/auth/otp/send", json={"phone": "+919876500002"})
    
    # Verify with correct code
    response = await client.post("/api/auth/otp/verify", json={
        "phone": "+919876500002",
        "otp": "123456",
        "fullName": "Meenakshi Sundaram",
        "email": "meenakshi@example.com"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["fullName"] == "Meenakshi Sundaram"
    assert data["user"]["role"] == "FAMILY_SPONSOR"
    assert data["user"]["authProvider"] == "PHONE_OTP"

@pytest.mark.asyncio
async def test_google_login(client: AsyncClient):
    response = await client.post("/api/auth/google", json={
        "idToken": "mock-google-id-token-chennai",
        "fullName": "Anand R",
        "email": "anand.r@gmail.com"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["fullName"] == "Anand R"
    assert data["user"]["email"] == "anand.r@gmail.com"
    assert data["user"]["authProvider"] == "GOOGLE"

@pytest.mark.asyncio
async def test_get_me_profile(client: AsyncClient, auth_headers: dict, sponsor_user: User):
    response = await client.get("/api/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == sponsor_user.id
    assert data["fullName"] == sponsor_user.fullName
    assert data["email"] == sponsor_user.email

@pytest.mark.asyncio
async def test_get_me_unauthorized(client: AsyncClient):
    response = await client.get("/api/me")
    assert response.status_code == 401

