import uuid

import pytest


@pytest.mark.asyncio
async def test_create_and_list_links(client):
    user_data = {
        "email": f"linkuser-{uuid.uuid4()}@example.com",
        "password": "password123",
    }

    # Signup
    signup_response = await client.post("/auth/signup", json=user_data)
    assert signup_response.status_code in [200, 201]

    # Login
    login_response = await client.post(
        "/auth/login",
        data={
            "username": user_data["email"],
            "password": user_data["password"],
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )

    assert login_response.status_code == 200

    token = login_response.json()["access_token"]

    headers = {
        "Authorization": f"Bearer {token}",
    }

    # Create short URL
    create_response = await client.post(
        "/links/shorten",
        json={
            "original_url": "https://google.com",
        },
        headers=headers,
    )

    assert create_response.status_code in [200, 201]

    # List links
    list_response = await client.get(
        "/links",
        headers=headers,
    )

    assert list_response.status_code == 200
    assert len(list_response.json()) > 0
