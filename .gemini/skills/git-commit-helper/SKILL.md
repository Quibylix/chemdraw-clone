---
name: git-commit-helper
description: Assists in generating and preparing Git commits following the project's Conventional Commits style. Use when the user says "commit this", "wrap up", or "prepare a commit".
---

# Git Commit Helper

This skill ensures all commits follow the repository's established style.

## Commit Style: Conventional Commits

Format: `<type>: <description>`

### Allowed Types

- `feat`: A new feature (e.g., `feat: add order listing`).
- `fix`: A bug fix.
- `chore`: Maintenance tasks, dependencies, or configuration (e.g., `chore: update .gitignore`).
- `refactor`: Code changes that neither fix a bug nor add a feature.
- `docs`: Documentation only changes.
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc).

## Rules

1. **Lowercase Type**: Types must always be lowercase.
2. **Concise Description**: Use the imperative, present tense: "change" not "changed" nor "changes".
3. **No Period**: Do not end the description with a period.
4. **Context over Content**: Focus on _why_ the change was made if the _what_ is not obvious from the type.
5. **Single Line**: Keep the commit message to a single line unless additional context is necessary (in which case, separate with a blank line).
6. **No Emoji**: Do not use emojis in commit messages.
7. **Atomic Commits**: Each commit should represent a single logical change.

## Workflow

1. Run `git status` and `git diff --cached` to see what is being committed.
2. Draft a message based on the changes.
3. Propose the message to the user before committing.

For examples, see [EXAMPLES.md](references/EXAMPLES.md).
