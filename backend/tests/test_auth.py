import pytest

def test_register_and_login_flow(client):
    # 1. Register a new user
    reg_payload = {
        "email": "testuser@example.com",
        "password": "securepassword123",
        "name": "Test User"
    }
    
    response = client.post("/api/auth/register", json=reg_payload)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == reg_payload["email"]
    assert "id" in data
    assert "password" not in data  # Ensure hashed password is never returned
    
    # 2. Try to register duplicate email (should fail with 409)
    response = client.post("/api/auth/register", json=reg_payload)
    assert response.status_code == 409
    
    # 3. Log in with correct credentials
    login_payload = {
        "email": "testuser@example.com",
        "password": "securepassword123"
    }
    response = client.post("/api/auth/login", json=login_payload)
    assert response.status_code == 200
    login_data = response.json()
    assert "token" in login_data
    assert login_data["user"]["email"] == reg_payload["email"]
    
    # 4. Log in with incorrect credentials (should fail with 401)
    bad_login_payload = {
        "email": "testuser@example.com",
        "password": "wrongpassword"
    }
    response = client.post("/api/auth/login", json=bad_login_payload)
    assert response.status_code == 401
