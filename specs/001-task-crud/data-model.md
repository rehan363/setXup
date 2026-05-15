# Data Model: Task CRUD Operations

## Task Entity

```python
from dataclasses import dataclass, field
from typing import Optional
from datetime import datetime

@dataclass
class Task:
    id: int
    title: str
    description: Optional[str] = None
    completed: bool = False
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: Optional[datetime] = None
```

## Field Validation

| Field | Type | Constraints |
|-------|------|------------|
| id | int | Auto-incremented, unique |
| title | str | Required, 1-200 chars |
| description | str | Optional, max 1000 chars |
| completed | bool | Default False |
| created_at | datetime | Auto-set on creation |
| updated_at | datetime | Auto-set on modification |

## State Transitions

```
[NEW] --create--> [PENDING] --toggle--> [COMPLETED]
                           <--toggle--
```

## Storage

```python
# In-memory task store
tasks: list[Task] = []

# ID generation
next_id: int = 1
```