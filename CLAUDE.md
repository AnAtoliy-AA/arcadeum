# Arcadeum Monorepo

## Structure

- `apps/web` — Next.js web app
- `apps/be` — NestJS backend
- `apps/mobile` — React Native / Expo mobile app
- `packages/ui` — Shared UI component library (`@arcadeum/ui`)

## Package Manager & Build

- **pnpm** (v9.15.0) with workspaces
- **Turborepo** orchestrates builds across apps/packages
- Run tasks from repo root: `pnpm dev`, `pnpm build`, `pnpm test`, `pnpm lint`

## Coding Rules

### TypeScript

- **Never use `any`** — use `unknown`, a specific type, or a generic instead. Cast with `as` only as a last resort and add a comment explaining why.
- **Define types for all API payloads and responses** — never rely on inferred `any` from fetch/axios calls.

### Next.js

- **Prefer Server Components** — use `'use client'` only when the component needs browser APIs, event handlers, or React hooks. Fetch data and pass it as props from Server Components instead of fetching on the client.

### UI & Design

- **Modern UI design** — use clean layouts, consistent spacing, and design tokens from `packages/ui/src/tamagui.config.ts`. Prefer polished, contemporary aesthetics over generic defaults.
- **Reuse `@arcadeum/ui` components** — run `/check-ui-components` before writing any UI component. It audits the full component catalog, identifies reuse opportunities, and guides adding new components to `packages/ui` when nothing fits.
- **Handle all UI states** — every data-fetching UI must handle loading, error, and empty states explicitly.

### i18n

- **No hardcoded user-facing strings** — all text must go through the i18n system (`getTranslations()` on web server components, `useTranslation()` on web client/mobile). Add keys to all locale files (`en`, `ru`, `es`, `fr`, `by`).

### Data fetching & state

- **Web: use Zustand stores** for global client state — do not prop-drill across more than two levels.
- **Real-time: use the shared socket infrastructure** (`@/shared/lib/socket`) — do not create ad-hoc `socket.io-client` connections.

### Backend

- **Always validate DTOs** with `class-validator` decorators — never trust raw request bodies.
- **Protect routes** with `@UseGuards(JwtAuthGuard)` — unauthenticated access must be an explicit, documented decision.
- **Use `ConfigService`** for all environment variables — never access `process.env` directly in application code.

### File size

- **Max 500 lines per file** — enforced by `pnpm check-file-length`. Split large files into focused modules before they hit the limit.

### Tests

- **Write unit tests** (Vitest for web, Jest for BE/mobile) and **Playwright e2e tests** for all user-facing features. Cover: happy path, edge cases, and error states.

## Commit Convention

Conventional Commits are enforced via commitlint:

```
<type>(scope): <subject>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

Branch naming: `ARC-XXX` (Jira tickets). Footer: `(ARC-XXX)` for issue tracking.

### Git rules

- **Never push directly to `main`, `staging`, or `develop`** — always create a feature branch and open a PR. These are protected branches; direct pushes bypass review.
- **Pull `develop` before opening a PR** — run `git fetch origin && git merge origin/develop` on your branch to catch merge conflicts early and keep the PR diff minimal.
- **Never use `git push --force`** — CI blocks force pushes on branches with open PRs. If you need to rebase, push to a new branch and open a new PR instead.
- **Always create new commits** — never `git commit --amend`. Amend rewrites history and causes the same CI failure as force push. If the last commit needs updating, create a new commit on top.

## Skills

### Project skills

- `/pr-description` — write PR descriptions (runs `git diff main...HEAD`, formats as What/Why/Changes)
- `/commit` — create a commit following Conventional Commits with ARC-XXX scope
- `/new-web-page` — add a Next.js App Router page (`page.tsx` + `*Client.tsx` + `*View.tsx` + i18n)
- `/new-be-module` — add a NestJS module (controller, service, module, DTOs, Mongoose schema)
- `/new-game` — add a complete multiplayer game end-to-end (BE engine/service/gateway/bot, web widget, landing, registries, i18n, tests, PR)
- `/new-mobile-screen` — add an Expo Router screen with i18n and Tamagui UI
- `/new-ui-component` — add a shared Tamagui component to `packages/ui` (`@arcadeum/ui`)
- `/check-ui-components` — audit existing `@arcadeum/ui` components before implementing any UI; reuse or add to `packages/ui`

### Global superpowers skills

- `/brainstorming` — explore intent and design before implementing features
- `/writing-plans` — produce a step-by-step implementation plan from a spec
- `/executing-plans` — execute a written plan with review checkpoints
- `/systematic-debugging` — structured root-cause analysis before proposing fixes
- `/test-driven-development` — write tests before implementation code
- `/verification-before-completion` — run verification commands before claiming work is done
- `/requesting-code-review` — review completed work against requirements before merging
- `/finishing-a-development-branch` — choose how to integrate completed work (PR, merge, cleanup)
- `/frontend-design` — build polished, production-grade frontend components
