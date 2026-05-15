# Todo App - Phase I

A Python console application for managing todo tasks with in-memory storage.

## Requirements

- Python 3.13+

## Setup

```bash
# Verify Python version
python --version
```

## Running

```bash
# Run the CLI
python -m src.cli
```

## Commands

| Command | Description |
|---------|-------------|
| add <title> [desc] | Add a new task |
| list | View all tasks |
| update <id> <title> [desc] | Update a task |
| delete <id> | Delete a task |
| complete <id> | Toggle completion |
| help | Show help |
| exit | Exit |