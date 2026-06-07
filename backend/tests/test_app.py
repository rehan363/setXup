import pytest

def test_full_application_flow_with_user_isolation(client):
    # ─── 1. Setup Test Users ────────────────────────────────────────────────
    # User A credentials
    user_a_payload = {
        "email": "user_a@example.com",
        "password": "password123",
        "name": "User A"
    }
    # User B credentials
    user_b_payload = {
        "email": "user_b@example.com",
        "password": "password123",
        "name": "User B"
    }
    
    # Register both users
    res_a = client.post("/api/auth/register", json=user_a_payload)
    assert res_a.status_code == 201
    
    res_b = client.post("/api/auth/register", json=user_b_payload)
    assert res_b.status_code == 201

    # Log in both users to obtain JWTs
    login_a = client.post("/api/auth/login", json={"email": "user_a@example.com", "password": "password123"})
    assert login_a.status_code == 200
    token_a = login_a.json()["token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    login_b = client.post("/api/auth/login", json={"email": "user_b@example.com", "password": "password123"})
    assert login_b.status_code == 200
    token_b = login_b.json()["token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # ─── 2. Create Organization as User A ───────────────────────────────────
    org_payload = {
        "name": "Acme Corp Workspace",
        "brand_color": "#00607a"
    }
    res_org = client.post("/api/orgs/", json=org_payload, headers=headers_a)
    assert res_org.status_code == 201
    org_data = res_org.json()
    assert org_data["name"] == org_payload["name"]
    org_id = org_data["id"]

    # Verify User A can list their new organization
    res_org_list_a = client.get("/api/orgs/", headers=headers_a)
    assert res_org_list_a.status_code == 200
    assert len(res_org_list_a.json()) == 1
    assert res_org_list_a.json()[0]["id"] == org_id

    # Verify User B sees NO organizations (Isolating Workspaces)
    res_org_list_b = client.get("/api/orgs/", headers=headers_b)
    assert res_org_list_b.status_code == 200
    assert len(res_org_list_b.json()) == 0

    # ─── 3. Create Space inside Organization as User A ───────────────────────
    space_payload = {
        "name": "Engineering Team",
        "description": "Where magic happens",
        "is_private": False
    }
    res_space = client.post(f"/api/orgs/{org_id}/spaces", json=space_payload, headers=headers_a)
    assert res_space.status_code == 201
    space_data = res_space.json()
    assert space_data["name"] == space_payload["name"]
    space_id = space_data["id"]

    # Verify User B cannot access User A's spaces (Unauthorized)
    res_spaces_b = client.get(f"/api/orgs/{org_id}/spaces", headers=headers_b)
    assert res_spaces_b.status_code == 403

    # ─── 4. Create Task as User A ───────────────────────────────────────────
    task_payload = {
        "title": "Build integration tests",
        "description": "Cover all endpoints with pytest",
        "priority": "high",
        "completed": False
    }
    res_task = client.post("/api/tasks", json=task_payload, headers=headers_a)
    assert res_task.status_code == 201
    task_data = res_task.json()
    assert task_data["title"] == task_payload["title"]
    task_id = task_data["id"]

    # Verify User A can list their own task
    res_tasks_a = client.get("/api/tasks", headers=headers_a)
    assert res_tasks_a.status_code == 200
    tasks_list_a = res_tasks_a.json()["tasks"]
    assert len(tasks_list_a) == 1
    assert tasks_list_a[0]["id"] == task_id
    assert tasks_list_a[0]["title"] == task_payload["title"]

    # Verify User B cannot see User A's task (Isolating Tasks)
    res_tasks_b = client.get("/api/tasks", headers=headers_b)
    assert res_tasks_b.status_code == 200
    tasks_list_b = res_tasks_b.json()["tasks"]
    assert len(tasks_list_b) == 0

    # Verify User B cannot get User A's task directly (Isolating individual Task Fetch)
    res_get_task_b = client.get(f"/api/tasks/{task_id}", headers=headers_b)
    assert res_get_task_b.status_code == 403


def test_workspace_deletion_by_non_owner_member(client):
    # 1. Setup Test Users
    user_a_payload = {"email": "owner@example.com", "password": "password123", "name": "Owner User"}
    user_b_payload = {"email": "member@example.com", "password": "password123", "name": "Member User"}
    user_c_payload = {"email": "stranger@example.com", "password": "password123", "name": "Stranger User"}
    
    client.post("/api/auth/register", json=user_a_payload)
    client.post("/api/auth/register", json=user_b_payload)
    client.post("/api/auth/register", json=user_c_payload)
    
    # Log in all users
    token_a = client.post("/api/auth/login", json={"email": "owner@example.com", "password": "password123"}).json()["token"]
    token_b = client.post("/api/auth/login", json={"email": "member@example.com", "password": "password123"}).json()["token"]
    token_c = client.post("/api/auth/login", json={"email": "stranger@example.com", "password": "password123"}).json()["token"]
    
    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}
    headers_c = {"Authorization": f"Bearer {token_c}"}
    
    # 2. Create organization as User A
    org = client.post("/api/orgs/", json={"name": "Test Org"}, headers=headers_a).json()
    org_id = org["id"]
    
    # 3. Invite User B as a member
    invite_res = client.post(
        f"/api/orgs/{org_id}/members/invite",
        json={"email": "member@example.com", "role": "member"},
        headers=headers_a
    )
    assert invite_res.status_code == 201
    
    # 4. User C (non-member) tries to delete - should be Forbidden
    del_c = client.delete(f"/api/orgs/{org_id}", headers=headers_c)
    assert del_c.status_code == 403
    
    # 5. User B (non-owner member) deletes organization - should be successful
    del_b = client.delete(f"/api/orgs/{org_id}", headers=headers_b)
    assert del_b.status_code == 204
    
    # 6. Verify organization is deleted (404)
    get_org = client.get(f"/api/orgs/{org_id}", headers=headers_a)
    assert get_org.status_code == 404


