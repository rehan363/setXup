# API Contracts: Phase II Full-Stack Web Application

## Overview

REST API for task management with JWT authentication. All endpoints except `/api/auth/register` and `/api/auth/login` require a valid Bearer token in the `Authorization` header.

**Base URL**: `http://localhost:8000`

---

## Authentication Endpoints

### POST /api/auth/register

Register a new user account.

**Request**:
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response** (201 Created):
```json
{
  "id": 1,
  "email": "user@example.com",
  "created_at": "2026-04-27T10:00:00Z"
}
```

**Errors**:
- `400 Bad Request`: Invalid email format or password too short
- `409 Conflict`: Email already registered

---

### POST /api/auth/login

Authenticate and receive JWT token.

**Request**:
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response** (200 OK):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "created_at": "2026-04-27T10:00:00Z"
  }
}
```

**Errors**:
- `401 Unauthorized`: Invalid credentials

---

## Task Endpoints

All task endpoints require `Authorization: Bearer <token>` header.

### GET /api/tasks

List all tasks for the authenticated user.

**Request Headers**:
```
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "tasks": [
    {
      "id": 1,
      "user_id": 1,
      "title": "Buy groceries",
      "description": "Milk, eggs, bread",
      "completed": false,
      "created_at": "2026-04-27T10:00:00Z",
      "updated_at": null
    }
  ]
}
```

**Errors**:
- `401 Unauthorized`: Missing or invalid token

---

### POST /api/tasks

Create a new task.

**Request Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "title": "New task",
  "description": "Optional description"
}
```

**Response** (201 Created):
```json
{
  "id": 2,
  "user_id": 1,
  "title": "New task",
  "description": "Optional description",
  "completed": false,
  "created_at": "2026-04-27T10:05:00Z",
  "updated_at": null
}
```

**Errors**:
- `400 Bad Request`: Title missing or exceeds 200 chars
- `401 Unauthorized`: Missing or invalid token

---

### GET /api/tasks/{task_id}

Get a specific task.

**Request Headers**:
```
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "id": 1,
  "user_id": 1,
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "created_at": "2026-04-27T10:00:00Z",
  "updated_at": null
}
```

**Errors**:
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Task belongs to another user
- `404 Not Found`: Task does not exist

---

### PATCH /api/tasks/{task_id}

Update a task (partial update).

**Request Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body** (any combination):
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "completed": true
}
```

**Response** (200 OK):
```json
{
  "id": 1,
  "user_id": 1,
  "title": "Updated title",
  "description": "Updated description",
  "completed": true,
  "created_at": "2026-04-27T10:00:00Z",
  "updated_at": "2026-04-27T10:10:00Z"
}
```

**Errors**:
- `400 Bad Request`: Invalid field values
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Task belongs to another user
- `404 Not Found`: Task does not exist

---

### DELETE /api/tasks/{task_id}

Delete a task.

**Request Headers**:
```
Authorization: Bearer <token>
```

**Response** (204 No Content): Empty body

**Errors**:
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Task belongs to another user
- `404 Not Found`: Task does not exist

---

## Error Response Format

All error responses follow this structure:

```json
{
  "detail": "Human-readable error message"
}
```

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 204 | No Content (delete success) |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (auth required or invalid) |
| 403 | Forbidden (access denied) |
| 404 | Not Found |
| 409 | Conflict (duplicate resource) |
| 500 | Internal Server Error |