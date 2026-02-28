# ChemDraw Clone - Project Context

This document serves as the context guide for the development of the "ChemDraw Clone" application.

## 🛠 Tech Stack

- **Frontend:** TypeScript, HTML5 Canvas API, Vite.
- **Error Handling:** `neverthrow` (ResultAsync) for complex operations that may fail.
- **Architecture:** Domain-Driven Design (DDD).

## 📁 File Structure (DDD)

- `src/domain/`: Pure business logic, entities, value objects, and domain services.
  - `base/`: Base abstract classes (`Entity`, `ValueObject`).
  - `entities/`: Domain entities (e.g., `Atom`, `Bond`, `Molecule`).
  - `value-objects/`: Immutable objects like `Point` or `Element`.
  - `services/`: Domain-specific calculations (e.g., bond angles, valence validation).
- `src/application/`: Use cases and commands.
- `src/infrastructure/`: Concrete implementations (e.g., `CanvasRenderer`, `InputHandler`).
- `src/presentation/`: UI components and layout.

## 🧠 General Principles

- **Clean Code over Comments:** Code should be self-documenting. Use comments only for "why", not "what".
- **Strict Typing:** Always use TypeScript's strict mode. Avoid `any` at all costs.
- **DDD Purity:** The domain layer must remain agnostic of the infrastructure (no DOM or Canvas logic in `src/domain`).
- **Error Handling:** Use `neverthrow` for all domain services and application use cases that can fail.

## 🎨 UI Style Guide

- Minimalist "whiteboard" aesthetic.
- Clean vector-like rendering of chemical structures.

## 🛠 Available Skills

- **lib-enforcer**: Enforces DDD architectural patterns and library usage (like `neverthrow`).
- **git-commit-helper**: Assists in generating conventional commits based on project style.
