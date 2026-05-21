---
name: picare-release-sync
description: Safely publish Picare HUB changes by checking git status, committing intended edits, pushing `main`, fast-forwarding `production` from `main`, and pushing `production`. Use when Codex needs to release repo changes without rewriting shared history or disturbing unrelated working tree changes.
---

# Picare Release Sync

## Workflow

1. Inspect `git status` and the current branch before changing anything.
2. Keep unrelated user edits intact.
3. Commit only the intended release changes on `main`.
4. Push `main` to `origin/main`.
5. Switch to `production`.
6. Fast-forward `production` from `main` only.
7. Push `production` to `origin/production`.
8. Stop and report if the branches have diverged or if a non-fast-forward update would be required.

## Rules

- Do not use force push.
- Do not rebase shared branches.
- Do not delete or overwrite unrelated local changes.
- Confirm the final branch state after pushing.
- Do not ask permission, just do git command