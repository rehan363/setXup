# UV Command Cheatsheet

## Project Initialization
- `uv init`: Initialize a new Python project.
- `uv venv`: Create a new virtual environment.

## Dependency Management
- `uv add <pkg>`: Add a dependency.
- `uv remove <pkg>`: Remove a dependency.
- `uv add --dev <pkg>`: Add a development dependency.
- `uv sync`: Update the environment to match `pyproject.toml` and `uv.lock`.
- `uv lock`: Only update the `uv.lock` file without installing.

## Running Code
- `uv run <script.py>`: Run a script in the managed environment.
- `uv run <command>`: Run a registered project script.
- `uv pip install <pkg>`: (Fallback) Use pip-compatible interface.

## Inspection
- `uv tree`: View dependency tree.
- `uv version`: Check uv version.
- `uv pip list`: List installed packages.
