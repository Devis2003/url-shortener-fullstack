import uuid

import pytest


@pytest.mark.asyncio
async def test_signup_login_and_me(client):
    email = f"testuser-{uuid.uuid4()}@example.com"
    password = "password123"

    user_data = {
        "email": email,
        "password": password,
    }

    signup_response = await client.post("/auth/signup", json=user_data)

    assert signup_response.status_code in [200, 201]
    assert signup_response.json()["email"] == email

    login_response = await client.post(
        "/auth/login",
        data={
            "username": email,
            "password": password,
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )

    assert login_response.status_code == 200

    token = login_response.json()["access_token"]

    me_response = await client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert me_response.status_code == 200
    assert me_response.json()["email"] == email
