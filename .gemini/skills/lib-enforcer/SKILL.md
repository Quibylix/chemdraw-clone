---
name: lib-enforcer
description: Enforces the proper use of DDD layers and library usage (e.g., neverthrow).
---

# Lib Enforcer

This skill ensures that the DDD architectural layers are respected and that the preferred libraries (like `neverthrow`) are used for error handling.

## Rules

1. **🚫 No Infrastructure in Domain**: Never put infrastructure-specific logic (e.g., DOM, Canvas, LocalStorage) in the `src/domain` layer.
2. **✅ Use neverthrow**: All domain services and application use cases that can fail MUST use `neverthrow` and return `ResultAsync` or `Result`.
3. **✅ Domain Purity**: The domain layer should only contain business logic, entities, and value objects.
4. **✅ Base Classes**: Ensure that new entities extend the `Entity` base class and value objects extend the `ValueObject` base class from `src/domain/base`.

## Why?

- **Testability**: Pure domain logic is easy to unit test without mocking complex infrastructure.
- **Maintainability**: Clear separation of concerns makes it easier to change implementations (e.g., swapping Canvas for SVG) without touching business logic.
- **Reliability**: Using `neverthrow` forces explicit error handling, making the application more robust.
