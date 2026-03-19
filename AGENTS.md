# ChemDraw Clone - Project Context

This document serves as the context guide for the development of the "ChemDraw Clone" application.

## Tech Stack

- **Frontend:** TypeScript, HTML5 Canvas API, Vite.
- **Error Handling:** `neverthrow` (Result, ResultAsync) for operations that may fail.
- **Architecture:** Domain-Driven Design (DDD) with feature-based organization.

## File Structure (Feature-Based DDD)

```
src/
├── [feature]/
│   ├── domain/
│   │   ├── entities/
│   │   ├── value-objects/
│   │   ├── events/
│   │   └── services/
│   ├── application/
│   │   └── use-cases/
│   └── infrastructure/
│       └── repositories/
├── shared/
│   └── domain/
│       └── base/           # Entity, ValueObject base classes
├── process-managers/
│   └── application/
│       └── use-cases/      # Sagas for cross-context orchestration
└── ui/
    ├── tools/
    ├── rendering/
    └── events/
```

### Bounded Contexts

- **chemistry/**: Molecules, atoms, bonds, chemical properties
- **spatial/**: Drawing surfaces, atom nodes, bond edges, visual positioning

### DDD Layers

- **domain/**: Pure business logic, no external dependencies
- **application/**: Use cases, commands, services that orchestrate domain operations
- **infrastructure/**: Repository implementations, external integrations

## General Principles

- **Clean Code over Comments:** Code should be self-documenting. Use comments only for "why", not "what".
- **Strict Typing:** Always use TypeScript's strict mode. Avoid `any` at all costs.
- **DDD Purity:** Domain layer must remain agnostic of infrastructure (no DOM, Canvas, or framework logic in `domain/`).
- **No Barrel Files:** Avoid `index.ts` barrel exports. Import directly from specific files.
- **Error Handling:** Use `neverthrow` for all domain services and application use cases that can fail.
- **Aggregate Roots:** All state mutations go through the Aggregate Root.
- **Cross-Context Communication:** Use Sagas to orchestrate operations across bounded contexts via IDs.

## UI Style Guide

- Minimalist "whiteboard" aesthetic.
- Clean vector-like rendering of chemical structures.

## Available Skills

- **ddd-architecture**: Enforces Domain-Driven Design principles and proper layer separation.
- **lib-enforcer**: Enforces DDD architectural patterns and library usage (like `neverthrow`).
- **git-commit-helper**: Assists in generating conventional commits based on project style.
