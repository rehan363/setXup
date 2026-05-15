"""Task services for CRUD operations"""

from datetime import datetime
from typing import Optional

from src.models import Task


class TaskStore:
    def __init__(self):
        self.tasks: list[Task] = []
        self._next_id: int = 1

    def validate_title(self, title: str) -> tuple[bool, Optional[str]]:
        if not title or not title.strip():
            return False, "Title is required"
        if len(title) > 200:
            return False, "Title must be 200 characters or less"
        return True, None

    def validate_description(self, desc: Optional[str]) -> tuple[bool, Optional[str]]:
        if desc is None:
            return True, None
        if len(desc) > 1000:
            return False, "Description must be 1000 characters or less"
        return True, None

    def add_task(self, title: str, description: Optional[str] = None) -> tuple[Task, Optional[str]]:
        valid, error = self.validate_title(title)
        if not valid:
            return None, error

        valid, error = self.validate_description(description)
        if not valid:
            return None, error

        task = Task(
            id=self._next_id,
            title=title.strip(),
            description=description.strip() if description else None,
        )
        self._next_id += 1
        self.tasks.append(task)
        return task, None

    def list_tasks(self) -> list[Task]:
        return self.tasks

    def get_task(self, task_id: int) -> Optional[Task]:
        for task in self.tasks:
            if task.id == task_id:
                return task
        return None

    def delete_task(self, task_id: int) -> tuple[bool, Optional[str]]:
        task = self.get_task(task_id)
        if not task:
            return False, f"Task {task_id} not found"
        self.tasks.remove(task)
        return True, None

    def update_task(
        self, task_id: int, title: Optional[str] = None, description: Optional[str] = None
    ) -> tuple[Optional[Task], Optional[str]]:
        task = self.get_task(task_id)
        if not task:
            return None, f"Task {task_id} not found"

        if title is not None:
            valid, error = self.validate_title(title)
            if not valid:
                return None, error
            task.title = title.strip()

        if description is not None:
            valid, error = self.validate_description(description)
            if not valid:
                return None, error
            task.description = description.strip() if description else None

        task.updated_at = datetime.now()
        return task, None

    def toggle_complete(self, task_id: int) -> tuple[Optional[Task], Optional[str]]:
        task = self.get_task(task_id)
        if not task:
            return None, f"Task {task_id} not found"
        task.completed = not task.completed
        task.updated_at = datetime.now()
        return task, None