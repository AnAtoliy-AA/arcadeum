---
name: verify-before-commit
description: Run all verification checks before committing code changes. Use after writing/editing code and before running /commit. Covers type-check, lint, tests, file length, and i18n completeness.
---

Run every check that applies to the files you changed. Skip checks for apps you didn't touch.

## Step 1 — Identify affected apps

Look at `git diff --name-only` (or your staged files) to determine which apps/packages changed:

- `apps/web/**` → run web checks
- `apps/be/**` → run backend checks
- `apps/tg-bot/**` or `bots/**` → run tg-bot checks
- `apps/mobile/**` → run mobile checks
- `packages/**` → run checks for all apps that import from the package

## Step 2 — Type check

```bash
# Web (if web files changed)
pnpm --filter web type-check 2>&1 | tail -20

# Backend (if BE files changed)
pnpm --filter be type-check 2>&1 | tail -20

# Tg-bot (if tg-bot files changed)
cd apps/tg-bot && npx tsc --noEmit 2>&1 | tail -20

# Task-bot (if bots/task-bot files changed)
cd bots/task-bot && npx tsc --noEmit 2>&1 | tail -20
```

## Step 3 — Lint

```bash
# Web
pnpm --filter web lint 2>&1 | tail -20

# Backend
pnpm --filter be lint 2>&1 | tail -20

# Tg-bot
cd apps/tg-bot && pnpm lint 2>&1 | tail -20
```

## Step 4 — Tests

```bash
# Web (run specific test file if available, else all)
pnpm --filter web test -- --run 2>&1 | tail -20

# Backend (run specific test file if available, else all)
pnpm --filter be test -- --run 2>&1 | tail -20

# Tg-bot
cd apps/tg-bot && npm test 2>&1 | tail -20
```

## Step 5 — File length (max 500 lines)

```bash
# From repo root
pnpm check-file-length 2>&1

# Or check specific files
wc -l <changed-file>
```

If any file exceeds 500 lines, extract cohesive groups into sibling modules before committing.

## Step 6 — i18n completeness (web changes only)

```bash
pnpm --filter web test -- --run src/shared/i18n/messages/completeness.test.ts 2>&1 | tail -10
```

If new user-facing strings were added, ensure keys exist in all 5 locale files (`en`, `ru`, `es`, `fr`, `by`).

## Decision

- **All green** → proceed to `/commit`
- **Errors found** → fix them, re-run the failing check, then commit
- **Pre-existing failures** (e.g. `admin-users.controller.spec.ts` timeout) → note them and proceed if unrelated to your changes
