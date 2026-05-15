# Quickstart: Todo CLI App

## Setup

```bash
# Create project (run in project root)
mkdir -p src tests

# Verify Python version
python --version  # Should be 3.13+
```

## Running

```bash
# Run the CLI
python -m src.cli

# Or with uv
uv run python -m src.cli
```

## Commands

| Command | Description |
|---------|-------------|
| add <title> [description] | Add a new task |
| list | View all tasks |
| update <id> <title> [description] | Update a task |
| delete <id> | Delete a task |
| complete <id> | Toggle task completion |
| help | Show help |
| exit | Exit the application |