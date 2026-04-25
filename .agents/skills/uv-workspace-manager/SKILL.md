---
name: uv-workspace-manager
description: "Efficiently manage Python dependencies, virtual environments, and monorepo project structures using the `uv` tool. Use this skill when: (1) Adding or removing packages with `uv add` or `uv remove`, (2) Synchronizing environments with `uv sync`, (3) Troubleshooting virtual environment issues, (4) Managing `pyproject.toml` configurations, or (5) Registering project scripts for Phase I console applications."
---

# UV Workspace Manager

## Overview
This skill provides a standardized workflow for managing Python environments in the Hackathon II project using `uv`. It ensures that dependencies are added correctly to the `backend` or root, and that the developer environment remains in sync with the `pyproject.toml`.

## Core Tasks

### 1. Dependency Management
Always use `uv` commands instead of `pip` to ensure lockfile integrity.

*   **Add a package:** `uv add <package_name>`
*   **Add a dev package:** `uv add --dev <package_name>`
*   **Remove a package:** `uv remove <package_name>`

### 2. Environment Synchronization
If dependencies feel "out of sync" or imports are failing:
1. Run `uv sync` to update the `.venv` based on the `uv.lock`.
2. If issues persist, run `uv venv` to recreate the virtual environment.

### 3. Project Scripts (Phase I)
For Phase I console apps, register scripts in `pyproject.toml` to allow running them as commands:
```toml
[project.scripts]
todo-app = "todo_app.main:main"
```
Then run with: `uv run todo-app`

### 4. Monorepo Handling
When working in the `backend/` directory, ensure you are using the local context if a separate `pyproject.toml` exists, or the root context if it's a unified workspace.

## Best Practices
- **Never manually edit `uv.lock`**: Always let `uv` update it.
- **Python Version**: Ensure `requires-python = ">=3.13"` is set in `pyproject.toml`.
- **Sync after pull**: Always run `uv sync` after pulling changes from Git.

## Resources
- **Reference**: See [references/uv_cheatsheet.md](references/uv_cheatsheet.md) for a full command list.
- **Scripts**: Use `scripts/uv_helper.py` for automated health checks.
