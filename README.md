# ChemDraw Clone

A chemical structure editor built with TypeScript using Domain-Driven Design (DDD) principles and HTML5 Canvas.

## Project Structure

The project follows a strict DDD architectural layout:

- **src/domain**: Core chemical logic, entities, and value objects.
  - `base/`: Base abstract classes (`Entity`, `ValueObject`, `AggregateRoot`).
  - `entities/`: Domain entities (e.g., `Atom`, `Bond`, `Molecule`).
  - `value-objects/`: Immutable data objects like `Point` and `Element`.
  - `services/`: Domain-specific calculations (valence, bond angles).
  - `types.ts`: Centralized domain types and basic class definitions.
- **src/application**: Use cases and commands (e.g., `AddAtom`, `MoveAtom`).
- **src/infrastructure**: Implementation-specific details like the `CanvasRenderer` and `InputHandler`.
- **src/presentation**: UI components (toolbar, canvas container).

## Tech Stack

- **TypeScript**: Ensuring type safety for chemical logic.
- **HTML5 Canvas API**: High-performance vector-like rendering.
- **neverthrow**: Functional error handling using `Result` and `ResultAsync`.
- **Vite**: Modern, fast build tool.

## Development Workflow

- **Linting & Formatting**: ESLint and Prettier are configured to maintain code quality.
- **Git Hooks**: Husky runs `lint-staged` and `typecheck` on every commit.
- **Gemini Skills**: Custom agent skills (`lib-enforcer`, `git-commit-helper`) are available in `.gemini/skills/` to assist with development and architectural consistency.

## Implementation Progress

- [x] Initial project scaffolding and DDD directory structure.
- [x] Base DDD classes (`Entity`, `ValueObject`, `AggregateRoot`).
- [x] Core domain types and preliminary entity structures.
- [x] Application use-case and infrastructure interfaces.
- [x] Quality assurance setup (ESLint, Prettier, Husky).
- [ ] Atom and Bond implementations.
- [ ] Molecule aggregate logic and invariant enforcement.
- [ ] Canvas rendering logic.
- [ ] User interaction and drawing tools.
