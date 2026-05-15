# Research: Python Console Todo App

## Decision: Use dataclass for Task Model

**Choice**: Python dataclass for Task entity

**Rationale**:
- Native to Python 3.7+ (no external dependency)
- Provides `__init__`, `__repr__` automatically
- Type hints supported
- Lightweight alternative to Pydantic for simple models

**Alternatives Considered**:
- Namedtuple: Less flexible for updates
- TypedDict: No default values, verbose initialization
- attrs: Requires third-party dependency

---

## Decision: In-Memory List for Task Storage

**Choice**: Python list with dict-based lookup

**Rationale**:
- Standard library only
- Simple CRUD operations
- Session-scoped persistence
- Auto-cleanup on exit

**Alternatives Considered**:
- dict with integer keys: More complex than needed
- SQLite: Violates Phase I constraints
- JSON file: Violates Phase I constraints

---

## Decision: Simple Text Input/Output

**Choice**: Input prompts with print output

**Rationale**:
- Works across all platforms
- No dependencies
- Clear user feedback
- Easy to test

**Alternatives Considered**:
- argparse: Overkill for interactive CLI
- cmd module: More complex setup
- Prompt toolkit: Third-party dependency