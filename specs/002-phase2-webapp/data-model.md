# Data Model: Phase II Full-Stack Web Application

## User Entity (SQLModel)

```python
from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional

class User(SQLModel, table=True):
    __tablename__ = "users"
    
    id: int | None = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    password: str = Field()  # bcrypt hashed
    created_at: datetime = Field(default_factory=datetime.utcnow)
```

**Field Constraints**:
| Field | Type | Constraints |
|-------|------|-------------|
| id | int | Auto-generated, primary key |
| email | str | Required, unique, valid email format, max 255 chars |
| password | str | Required, bcrypt hashed (not stored plaintext) |
| created_at | datetime | Auto-set on creation |

---

## Task Entity (SQLModel)

```python
from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional

class Task(SQLModel, table=True):
    __tablename__ = "tasks"
    
    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    title: str = Field(max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
    completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime | None = Field(default=None)
```

**Field Constraints**:
| Field | Type | Constraints |
|-------|------|-------------|
| id | int | Auto-generated, primary key |
| user_id | int | Required, foreign key to users.id, indexed |
| title | str | Required, 1-200 chars |
| description | str | Optional, max 1000 chars |
| completed | bool | Default False |
| created_at | datetime | Auto-set on creation |
| updated_at | datetime | Auto-set on modification |

**User Isolation**: Every query MUST include `WHERE user_id = :current_user_id`

---

## State Transitions

### Task Lifecycle

```
[NEW] --create--> [PENDING] --toggle--> [COMPLETED]
                           <--toggle--
```

- **Create**: Initial state is `completed=False` (PENDING)
- **Toggle**: Invert `completed` between True/False
- **Update**: Any field can be modified, `updated_at` refreshed
- **Delete**: Hard delete (no soft delete for Phase II)

---

## API Schemas (Pydantic Request/Response)

### Auth Schemas

```python
# Registration
class UserCreate(BaseModel):
    email: str
    password: str  # min 8 chars

# Response
class UserResponse(BaseModel):
    id: int
    email: str
    created_at: datetime

# Login (returns JWT)
class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    token: str
    user: UserResponse
```

### Task Schemas

```python
class TaskCreate(BaseModel):
    title: str  # 1-200 chars
    description: str | None = None  # optional, max 1000

class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    completed: bool | None = None

class TaskResponse(BaseModel):
    id: int
    user_id: int
    title: str
    description: str | None
    completed: bool
    created_at: datetime
    updated_at: datetime | None
```

---

## Database Schema (SQL)

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
```