# Todo App Constitution

## Core Principles

### I. Spec-First Development (NON-NEGOTIABLE)
Every feature MUST be defined in a specification before implementation begins. The specification MUST contain user stories, acceptance criteria, and clear scope boundaries. opencode SHALL NOT generate any code without a referenced Task ID from the specification. This ensures traceable requirements and eliminates scope creep.

### II. No Manual Code Generation
The developer SHALL NOT write code manually. All implementation MUST be generated through opencode from specifications. If the generated code does not match requirements, the specification SHALL be refined until opencode produces correct output. This enforces the spec-driven development methodology central to the hackathon.

### III. Clean Architecture
All code MUST follow clean code principles: single responsibility, clear naming conventions, and proper separation of concerns. Python projects MUST use proper module structure with separate directories for models, services, and CLI interface. No procedural code in module root unless it's a simple wrapper.

### IV. In-Memory State Management
For Phase I, all data MUST be stored in memory only. No database, file persistence, or external storage. Task state MUST be managed through proper data structures (list/dict) with clean accessor methods. State MUST survive process restarts only within a single session.

### V. CLI-First Interface
The application MUST expose a command-line interface as the primary user interaction method. All five basic features (Add, Delete, Update, View, Mark Complete) MUST be accessible via text commands. Output MUST be user-friendly with clear status indicators and helpful error messages.

## Additional Constraints

### Technology Stack
- **Language**: Python 3.13+
- **Package Manager**: UV
- **AI Agent**: opencode
- **Specification**: Spec-Kit
- **No Manual Code**: All code generated via opencode from specs

### Project Structure
```
project/
├── constitution.md          # This file
├── README.md              # Setup instructions
├── agents.md             # opencode instructions
├── src/                 # Python source
│   ├── __init__.py
│   ├── models.py         # Task data structures
│   ├── services.py      # Business logic
│   └── cli.py          # Command-line interface
└── specs/               # Feature specifications
    └── task-crud.md    # Task CRUD features
```

### Code Generation Workflow
1. Write specification in `/specs/`
2. Use `/speckit.specify` to create structured spec
3. Use `/speckit.plan` to generate technical plan
4. Use `/speckit.tasks` to break into tasks
5. Use `/speckit.implement` to generate code via opencode

## Development Workflow

### Specification Requirements
Every feature specification MUST include:
- User stories with clear acceptance criteria
- Clear scope boundaries (what is in/out of scope)
- Technical constraints and assumptions
- Edge cases and error scenarios

### Implementation Rules
- opencode SHALL reference Task IDs when generating code
- Code MUST pass basic validation (syntax, imports)
- Features MUST be testable manually via CLI
- No speculative features - implement only what's specified

### Deliverable Checkpoints
For Phase I submission, the project MUST demonstrate:
1. Adding tasks with title and description
2. Listing all tasks with status indicators
3. Updating task details
4. Deleting tasks by ID
5. Marking tasks as complete/incomplete

## Governance

### Amendment Procedure
Constitution amendments REQUIRE:
1. Clear rationale for the change
2. Consistency check with all templates
3. Version bump following semantic versioning rules

### Versioning Policy
- MAJOR: Backward incompatible principle removal or redefinition
- MINOR: New principle added or materially expanded guidance
- PATCH: Clarifications, wording fixes, non-semantic refinements

### Compliance Review
All implementations SHALL verify compliance with:
- Spec-first requirement (spec exists before code)
- No manual coding constraint
- Clean architecture principles
- Spec-Kit workflow adherence

**Version**: 1.0.0 | **Ratified**: 2026-04-25 | **Last Amended**: 2026-04-25