# Arcadeum Games Monorepo

## Structure

- `apps/web` — Next.js web app
- `apps/be` — NestJS backend
- `apps/mobile` — React Native / Expo mobile app
- `packages/ui` — Shared UI component library (`@arcadeum/ui`)

## Package Manager & Build

- **pnpm** (v9.15.9) with workspaces
- **Turborepo** orchestrates builds across apps/packages
- Run tasks from repo root: `pnpm dev`, `pnpm build`, `pnpm test`, `pnpm lint`

## Coding Rules

### TypeScript

- **Never use `any`** — use `unknown`, a specific type, or a generic instead. Cast with `as` only as a last resort and add a comment explaining why.
- **Define types for all API payloads and responses** — never rely on inferred `any` from fetch/axios calls.

### Next.js

- **Prefer Server Components** — use `'use client'` only when the component needs browser APIs, event handlers, or React hooks. Fetch data and pass it as props from Server Components instead of fetching on the client.

### UI & Design

- **Modern UI design** — use clean layouts, consistent spacing, and design tokens. Tokens are CSS variables minted on `<html>` by the theme provider from `packages/ui/src/themeDefinitions.ts` (use `var(--primary)`, `var(--glassBg)`, `bg-[var(--success)]`, etc.); static palettes (genres, roles, gold) are hex literals. See `/tailwind-pro` for the full token → class map. Prefer polished, contemporary aesthetics over generic defaults.
- **Tailwind CSS is the only styling system** — Tamagui was fully removed (see `docs/plans/2026-08-15-tamagui-to-tailwind.md`). Never write `styled()`, `XStack`/`YStack`, `$tokens`, `hoverStyle`, or `onPress`. Use plain React + Tailwind classes; merge classes with `cx` from `@arcadeum/ui/utils/cx`.
- **Reuse `@arcadeum/ui` components** — run `/check-ui-components` before writing any UI component. It audits the full component catalog, identifies reuse opportunities, and guides adding new components to `packages/ui` when nothing fits.
- **Handle all UI states** — every data-fetching UI must handle loading, error, and empty states explicitly.

### Game Visual Themes & Variants

- **Unified Shared Themes across ALL games** — all games (current and future) MUST use the unified visual themes defined in `apps/web/src/features/games/lib/shared-themes.ts` (`SHARED_THEMES`) and `apps/be/src/games/common/shared-themes.ts` (`SHARED_VISUAL_THEMES`).
- **Separate Themes from Modes** — visual themes (`cyberpunk`, `underwater`, `zen`, etc.) are skins/palettes/backgrounds. Game modes (`standard`, `chess960`, `battle_royale`, `speed`) are gameplay rules. Never conflate them.
- **Theme Adapter Pattern** — every game widget must implement `lib/theme-adapter.ts` (`sharedThemeTo<Game>(theme: GameTheme): <Game>Theme`), `lib/theme.ts` (`get<Game>Theme(variant?: string)`), and `lib/<Game>ThemeContext.tsx` (`createGameThemeContext`).
- **Adding New Themes** — when adding a new theme to `SHARED_THEMES` (with background image and palette tokens), it MUST automatically propagate to all games without altering individual game engines.
- **No Hardcoded Theme CSS in Games** — never write hardcoded per-theme CSS/SCSS selectors (e.g. `[data-theme='cyberpunk'] { ... }`). Instead, map `theme.colors.*` in `lib/theme-adapter.ts` to game-specific tokens, mint scoped CSS custom properties on the root board container via a `boardVars(theme)` helper (as in `BackgammonBoard` and `HeartsBoard`), and have stylesheets strictly consume `var(--...)`. Any new theme added to `SHARED_THEMES` must immediately work with zero CSS modifications.
- **Two-Player Board Orientation** — in all two-player games (Chess, Checkers, Backgammon, etc.), the current local player's side/home board/pieces must ALWAYS be oriented at the bottom. The view must dynamically flip or invert coordinates based on `currentUserId` so the player always plays upwards from their perspective.

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

### Deprecated patterns — do not use

- **Sass: no `@import`** — use `@use` (with `as *` for plain CSS partials). `@import` is deprecated and emits build warnings.
- **Next.js: no `export const runtime = 'edge'`** on API routes unless edge features are actually needed. It disables static generation and emits build warnings.

### Tests

- **Write unit tests** (Vitest for web, Jest for BE/mobile) and **Playwright e2e tests** for all user-facing features. Cover: happy path, edge cases, and error states.

## Commit Convention

Conventional Commits are enforced via commitlint:

```
<type>(scope): <subject>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

Branch naming: `ARC-XXX` (Jira tickets). Footer: `(ARC-XXX)` for issue tracking.

### PR title rules

PR titles are validated by CI (`branch-guard.yml`). The title must match the target branch:

| Target branch | Title prefix | Example            |
| ------------- | ------------ | ------------------ |
| `staging`     | `demo`       | `demo: v1.23.84`   |
| `main`        | `release`    | `release: v1.24.0` |

### Git rules

- **Never push directly to `main`, `staging`, or `develop`** — always create a feature branch and open a PR targeting `develop`. These are protected branches; direct pushes bypass review.
- **Pull `develop` before opening a PR** — run `git fetch origin && git merge origin/develop` on your branch to catch merge conflicts early and keep the PR diff minimal.
- **Never use `git push --force`** — CI blocks force pushes on branches with open PRs. If you need to rebase, push to a new branch and open a new PR instead.
- **Always create new commits** — never `git commit --amend`. Amend rewrites history and causes the same CI failure as force push. If the last commit needs updating, create a new commit on top.

## Skills

### Project skills

- `/pr-description` — write PR descriptions (runs `git diff develop...HEAD`, formats as What/Why/Changes)
- `/commit` — create a commit following Conventional Commits with ARC-XXX scope
- `/new-web-page` — add a Next.js App Router page (`page.tsx` + `*Client.tsx` + `*View.tsx` + i18n)
- `/new-be-module` — add a NestJS module (controller, service, module, DTOs, Mongoose schema)
- `/new-game` — add a complete multiplayer game end-to-end (BE engine/service/gateway/bot, web widget, landing, registries, i18n, tests, PR) for Arcadeum Games
- `/new-mobile-screen` — add an Expo Router screen with i18n and RN styling (StyleSheet + useThemedStyles)
- `/new-ui-component` — add a shared Tailwind component to `packages/ui` (`@arcadeum/ui`)
- `/check-ui-components` — audit existing `@arcadeum/ui` components before implementing any UI; reuse or add to `packages/ui`
- `/tailwind-pro` — project-specific Tailwind reference: token → class maps, CSS-variable theming, responsive variants, layout gotchas. Load before any UI work.
- `/ui-ux-design` — comprehensive UI/UX design intelligence with priority-based rules for accessibility, touch, performance, style, layout, typography, animation, forms, navigation, and data visualization
- `/baseline-ui` — quick UI cleanup/polish pass for spacing, hierarchy, typography, and layout issues
- `/fixing-accessibility` — comprehensive a11y audit with priority-based rules and common fixes
- `/fixing-motion-performance` — animation performance optimization (layout thrashing, compositor props, scroll-linked motion)
- `/design-system` — generate and maintain design systems with colors, typography, spacing, and effects
- `/aesthetic-literacy` — understand and characterize any named aesthetic across formal dimensions
- `/image-analysis` — extract implementable CSS values and design tokens from reference images
- `/animation` — implement smooth animations using CSS transitions, Tailwind keyframes, and spring-like easing
- `/dark-mode` — implement dark mode with proper color tokens, contrast ratios, and platform patterns
- `/form-patterns` — build accessible forms with validation, error handling, and progressive disclosure
- `/data-visualization` — implement accessible charts, graphs, and data tables with proper color and tooltips
- `/nestjs-expert` — create and configure NestJS modules, controllers, services, DTOs, guards, and interceptors
- `/secure-code-guardian` — implement authentication/authorization, secure input, and prevent OWASP Top 10 vulnerabilities
- `/security-reviewer` — review code for security vulnerabilities, audit auth flows, and identify attack vectors
- `/database-optimizer` — optimize MongoDB queries, analyze execution plans, and improve database performance
- `/test-master` — write comprehensive unit, integration, and E2E tests with proper mocking and coverage
- `/typescript-pro` — write type-safe TypeScript with advanced patterns, generics, and utility types
- `/react-native-expert` — build cross-platform mobile apps with React Native and Expo
- `/nextjs-developer` — build modern web apps with Next.js App Router, Server Components, and Server Actions
- `/websocket-engineer` — implement real-time WebSocket connections with Socket.IO for live updates and chat
- `/code-reviewer` — review code for quality, best practices, and potential issues
- `/debugging-wizard` — systematically debug issues with structured root-cause analysis
- `/api-designer` — design RESTful APIs with proper endpoints, status codes, and Swagger documentation
- `/microservices-architect` — design and implement microservice architectures with proper boundaries
- `/implement-roadmap-feature` — implement a roadmap feature end-to-end: branch, code, test, commit, push, open PR, fix CI

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

## Skills Location

Project skills are located in `.claude/skills/` (30 skills). Use the `skill` tool with the skill name to load them:

- `/check-ui-components` → loads `.claude/skills/check-ui-components/SKILL.md`
- `/new-game` → loads `.claude/skills/new-game/SKILL.md`
- etc.

## Imported Claude Cowork project instructions
