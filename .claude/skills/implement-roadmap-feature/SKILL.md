---
name: implement-roadmap-feature
description: Implement a feature from docs/ROADMAP.md end-to-end: branch, code, test, commit, push, open PR, fix CI. Use when user says "implement feature X from roadmap" or "start with feature X".
---

This skill turns a roadmap item into a shippable PR. Follow every step — skipping steps causes rework.

## Reference

- Roadmap: `docs/ROADMAP.md` — has ARC ticket reference table with branch names and statuses
- Commit convention: `/commit` skill
- PR descriptions: `/pr-description` skill
- Tests: Vitest for web (`pnpm --filter web test`), Jest for BE (`pnpm --filter be test`)

## Step-by-step workflow

### 1. Identify the feature

Read `docs/ROADMAP.md` to find the feature. Note:
- ARC ticket number (e.g. `ARC-872`)
- Branch name (e.g. `ARC-872-emotes`)
- Implementation status (Not started / Partial / Implemented)
- Effort estimate
- Files to create/modify listed in the roadmap

### 2. Create the branch

```bash
git checkout develop && git pull origin develop
git checkout -b ARC-XXX-feature-name
```

Branch naming: `ARC-<number>-<short-kebab-description>`

### 3. Explore the codebase

Before writing code, understand existing patterns:
- Use `explore` subagent or grep/glob to find related code
- Read existing implementations of similar features
- Check `packages/ui` for reusable components (`/check-ui-components`)
- Identify integration points (socket events, hooks, stores, pages)

### 4. Implement the feature

Follow existing code conventions:
- **TypeScript**: never use `any`, define proper types
- **React**: Server Components by default, `'use client'` only when needed
- **State**: Zustand stores with `persist` middleware for localStorage
- **Styling**: Tamagui components from `@arcadeum/ui`, use `styled()` for custom styles
- **i18n**: all user-facing strings through `useTranslation()`, add keys to all 5 locales (en, es, fr, ru, by)
- **Backend**: validate DTOs with `class-validator`, protect routes with `JwtAuthGuard`

### 5. Write tests

**Every feature MUST have tests.** Create test files alongside source files.

For web (Vitest):
- Unit tests for pure functions, stores, hooks
- Component tests with `@testing-library/react`
- Test file naming: `*.test.ts` or `*.test.tsx`

For backend (Jest):
- Unit tests for services, validators, utils
- Integration tests for controllers with mocked dependencies
- Test file naming: `*.spec.ts`

Test coverage requirements:
- Happy path
- Edge cases (empty state, null values, boundary conditions)
- Error states

Run tests before committing:
```bash
pnpm --filter web test        # web unit tests
pnpm --filter be test         # backend unit tests
pnpm test                     # all tests via turborepo
```

### 6. Verify code quality

Run all checks before committing:
```bash
# Type check
cd apps/web && npx tsc --noEmit
cd apps/be && npx tsc --noEmit

# Lint
pnpm --filter web lint
pnpm --filter be lint

# i18n completeness
pnpm --filter web test -- --run src/shared/i18n/messages/completeness.test.ts

# File length check (max 500 lines)
pnpm check-file-length
```

### 7. Commit

Follow Conventional Commits with ARC scope:

```bash
git add <specific files>
git commit -m "<type>(ARC-XXX): <short description>"
```

Rules:
- Stage specific files, never `git add -A` or `git add .`
- Type: `feat`, `fix`, `docs`, `test`, `refactor`, etc.
- Scope: `ARC-XXX` from the branch name
- Subject: lowercase, imperative mood, no period, under 72 chars
- Body: explain **why**, not **what** (if needed)
- Pre-commit hooks will run lint, tests, type check — they must pass

Make **multiple atomic commits** for large features:
1. `feat(ARC-XXX): add store and types` — core logic
2. `feat(ARC-XXX): add UI components` — frontend
3. `feat(ARC-XXX): integrate with game widgets` — wiring
4. `feat(ARC-XXX): add i18n keys` — translations
5. `test(ARC-XXX): add unit tests` — tests (if committed separately)

### 8. Push and open PR

```bash
git push --no-verify -u origin ARC-XXX-feature-name
```

Open PR:
```bash
gh pr create --base develop --title "<type>(ARC-XXX): <description>" --body "$(cat <<'EOF'
## What
<one sentence>

## Why
<context>

## Changes
- <bullet points>

## Test plan
- [x] Unit tests pass
- [x] Type check passes
- [x] Lint passes
- [x] i18n completeness passes
EOF
)"
```

### 9. Monitor CI/CD

After PR is created, check CI status:

```bash
gh pr checks <PR_NUMBER>
# or
gh pr view <PR_NUMBER> --json statusCheckRollup
```

If CI fails:
1. Read the failure logs: `gh run view <run-id> --log-failed`
2. Fix the issue
3. Commit the fix: `git commit -m "fix(ARC-XXX): <description>"`
4. Push: `git push --no-verify`
5. Re-check CI

Common CI failures:
- **Lint errors**: run `eslint --fix` on affected files
- **Type errors**: run `tsc --noEmit` and fix
- **Test failures**: run tests locally, fix, re-run
- **i18n missing keys**: add keys to all 5 locale files
- **File too long**: split into smaller modules

### 10. Update roadmap status

After PR is merged, update `docs/ROADMAP.md`:
- Change status from "Not started" to "**Implemented**"
- Remove the branch name from the reference table (or mark as merged)

## Gotchas

- **Never push to `main`, `staging`, or `develop`** — always use feature branches
- **Never use `git commit --amend`** — create new commits instead
- **Never use `git push --force`** — CI blocks force pushes on branches with open PRs
- **Always pull develop before opening PR** — `git fetch origin && git merge origin/develop`
- **Pre-commit hooks run full test suites** — they take ~2 minutes, be patient
- **localStorage keys must be versioned** — use `arcadeum_<feature>_v1` format
- **Zustand persist requires `createJSONStorage(() => localStorage)`** — SSR-safe pattern
- **Tests must pass before commit** — hooks will block the commit otherwise
