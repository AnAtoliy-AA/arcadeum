# Admin Tournaments Implementation Plan (ARC-610)

> **For agentic workers:** Mirrors the patterns in [docs/superpowers/plans/2026-05-09-admin-announcements.md](docs/superpowers/plans/2026-05-09-admin-announcements.md). Phases are batched larger than the announcements plan to control token spend; each phase still ends with `pnpm test` + `pnpm check-translations` + `pnpm exec tsc --noEmit` green.

**Goal:** Ship the tournaments feature spec'd in [docs/superpowers/specs/2026-05-09-admin-tournaments-design.md](docs/superpowers/specs/2026-05-09-admin-tournaments-design.md).

**Scope reduction vs. spec:** drop the read-only `TournamentRegistrationsModal` for v1 — admin sees `registered/max` count in the table; the registrations endpoint is built but no UI consumes it yet. Add the modal in a follow-up PR if needed.

**Branch:** `ARC-610` off `develop`. PR target: `develop`.

**Key reference patterns:**

- BE schema/service: [apps/be/src/announcements/announcements.service.ts](apps/be/src/announcements/announcements.service.ts) and [apps/be/src/announcements/schemas/announcement.schema.ts](apps/be/src/announcements/schemas/announcement.schema.ts).
- BE admin controller: [apps/be/src/announcements/admin-announcements.controller.ts](apps/be/src/announcements/admin-announcements.controller.ts).
- BE public controller (optional auth): [apps/be/src/announcements/public-announcements.controller.ts](apps/be/src/announcements/public-announcements.controller.ts) using existing `JwtOptionalAuthGuard`.
- BE module (must register both Tournament _and_ User schemas so RolesGuard resolves): [apps/be/src/announcements/announcements.module.ts](apps/be/src/announcements/announcements.module.ts).
- FE admin feature: [apps/web/src/features/admin-announcements/](apps/web/src/features/admin-announcements/).
- FE admin route + client shell: [apps/web/src/app/admin/announcements/](apps/web/src/app/admin/announcements/).
- FE table styling pattern (GlassCard wrap, `$backgroundFocus` header row, zebra rows, hover, outlined sm pagination): [apps/web/src/features/admin-announcements/ui/AdminAnnouncementsTable.tsx](apps/web/src/features/admin-announcements/ui/AdminAnnouncementsTable.tsx).
- i18n locale split: [apps/web/src/shared/i18n/messages/pages/admin-announcements/](apps/web/src/shared/i18n/messages/pages/admin-announcements/) — apply same split for `admin-tournaments`.

## Phase 1 — BE schema + interfaces + DTOs + lib helper

**Files:**

- `apps/be/src/tournaments/schemas/tournament.schema.ts`
- `apps/be/src/tournaments/interfaces/tournament.interface.ts`
- `apps/be/src/tournaments/lib/derive-effective-window.ts` (+ spec)
- `apps/be/src/tournaments/lib/transition.ts` (+ spec) — pure status-transition table helper
- `apps/be/src/tournaments/dto/create-tournament.dto.ts`
- `apps/be/src/tournaments/dto/update-tournament.dto.ts`
- `apps/be/src/tournaments/dto/list-admin-tournaments.dto.ts`
- `apps/be/src/tournaments/dto/list-public-tournaments.dto.ts`
- `apps/be/src/tournaments/dto/transition-status.dto.ts`

Mirror the announcement DTO shape: re-use `IsAfter` and `IsSafeUrl` from `apps/be/src/announcements/dto/validators/`. Add an `IsBetween` (optional, may inline a quick custom validator) so `registrationOpensAt ≤ registrationClosesAt ≤ scheduledAt`.

**Schema fields:** as listed in spec. Add `severityRank` analogue is NOT needed; sort is `scheduledAt` based.

**Tests:** unit-test the two pure libs:

- `derive-effective-window.spec.ts`: 6 cases (both null, opens null, closes null, both set, scheduledAt absent throws — but in practice always present, etc.).
- `transition.spec.ts`: matrix of allowed source × target combinations, including delete eligibility helper `canDelete(status)`.

Commit: `feat(tournaments): add Tournament schema, interfaces, DTOs, and pure helpers (ARC-610)`.

## Phase 2 — BE service (TDD)

**File:** `apps/be/src/tournaments/tournaments.service.ts` + `tournaments.service.spec.ts`.

**Methods:**

- `listForAdmin(args)` — pagination, filter by status / gameType, search on `content.en.name`, populate `createdBy` displayName, returns `{ items, total, page, pageSize }`.
- `listPublicUpcoming(locale, cursor, isAuthenticated, callerUserId?)` — sorts by `scheduledAt` ASC, filters out cancelled, attaches `effectiveStatus` and `isRegistered` computed fields per item, returns `{ items, nextCursor }`.
- `create(body, requesterUserId)` — sets defaults: `status: 'scheduled'`, `registrationOpensAt = body.registrationOpensAt ?? scheduledAt - 7d`, `registrationClosesAt = body.registrationClosesAt ?? scheduledAt - 1h`. Returns full admin item.
- `update(id, body)` — patches fields; rejects `status` field (must use `transition`); refreshes derived window if scheduledAt changed and the windows were nullified (skip; only update if explicitly provided).
- `transition(id, to, resultText?)` — validates allowed transition via the lib helper; persists; if `to === 'completed'`, sets `resultText`.
- `remove(id)` — only when `canDelete(status)`; throws 409 otherwise.
- `register(id, userId, displayName)` — atomic: `findOneAndUpdate` with the existing registrations array; throws 409 if `status !== 'registration_open'`. Uses MongoDB's `$push` and computes `waitlist` based on a fresh `find` length; race-safe pattern is to project current length and decide on application side, then conditional `$push` with `$expr`.
- `unregister(id, userId)` — `$pull`; idempotent.
- `findAdminItem(id)` — populated lookup used after writes.
- `listRegistrations(id, page, pageSize)` — paginated subarray slice using `$slice`.

**Test count:** ~15 (mirrors announcements service split into admin + public).

Commit: `feat(tournaments): add service with admin/public queries, transitions, and registration (ARC-610)`.

## Phase 3 — BE controllers + module

**Files:**

- `admin-tournaments.controller.ts` + spec — guarded by `JwtAuthGuard + RolesGuard + @Roles('admin')`. Endpoints: `GET /admin/tournaments`, `POST`, `PATCH /:id`, `DELETE /:id`, `POST /:id/transition`, `GET /:id/registrations`.
- `public-tournaments.controller.ts` + spec — `JwtOptionalAuthGuard`. Endpoints: `GET /tournaments`, `POST /tournaments/:id/register`, `DELETE /tournaments/:id/register`. Sets `Cache-Control: public, max-age=60, stale-while-revalidate=300` on the GET.
- `tournaments.module.ts` — imports `AuthModule` + `MongooseModule.forFeature([Tournament, User])` (User needed for RolesGuard); registers both controllers + service + RolesGuard provider.
- Modify `apps/be/src/app.module.ts` — add `TournamentsModule` to imports.

**Test counts:** admin ~10 (auth, DTO validation, transition matrix, delete-only-when-allowed, pageSize cap), public ~8 (anonymous list, locale fallback, register flow auth+409, unregister, cache header).

Commit: `feat(tournaments): admin + public controllers and module wiring (ARC-610)`.

After this phase: `pnpm --filter be test` should run all 30+ new BE tests green. `pnpm --filter be build` clean.

## Phase 4 — FE admin feature (api/hooks/lib)

**Files:**

- `apps/web/src/features/admin-tournaments/api.ts` + `api.test.ts`
- `apps/web/src/features/admin-tournaments/hooks.ts` + `hooks.test.ts`
- `apps/web/src/features/admin-tournaments/lib/formatSchedule.ts` (+ test)
- `apps/web/src/features/admin-tournaments/lib/statusChip.ts` (+ test)

Mirror the admin-announcements pattern. Mutations invalidate BOTH `admin-tournaments` AND `public-tournaments` refresh keys.

Commit: `feat(admin-tournaments): typed api + hooks + lib helpers (ARC-610)`.

## Phase 5 — FE admin UI (filters, table, form)

**Files:**

- `apps/web/src/features/admin-tournaments/ui/AdminTournamentsFilters.tsx` (+ test)
- `apps/web/src/features/admin-tournaments/ui/AdminTournamentsTable.tsx` (+ test) — same polished shell (GlassCard wrap, `$backgroundFocus` header, zebra, hover, outline sm pagination).
- `apps/web/src/features/admin-tournaments/ui/AdminTournamentForm.tsx` (+ test) — settings + content tabs + validation.
- `apps/web/src/features/admin-tournaments/ui/TransitionMenu.tsx` — small client subcomponent rendering only valid next-state buttons; opens a `resultText` dialog for `completed` and a confirm dialog for `cancelled`.

Commit: `feat(admin-tournaments): filters, table, form, transition controls (ARC-610)`.

## Phase 6 — FE admin route + sidebar flip

**Files:**

- `apps/web/src/app/admin/tournaments/page.tsx` — Server Component, `requireAdmin()`.
- `apps/web/src/app/admin/tournaments/AdminTournamentsClient.tsx` — `'use client'`, composes filters + table + form modal + transition menu.
- Modify `apps/web/src/app/admin/_components/sidebarItems.ts` — flip `tournaments` to `{ href: '/admin/tournaments', enabled: true }`.

Commit: `feat(admin-tournaments): /admin/tournaments page + sidebar flip (ARC-610)`.

## Phase 7 — FE public surface

**Files:**

- `apps/web/src/features/tournaments/api.ts` + `api.test.ts` — `fetchPublicTournaments`, `registerForTournament`, `unregisterFromTournament`.
- `apps/web/src/features/tournaments/hooks.ts` + `hooks.test.ts` — `usePublicTournaments`, `useRegisterTournament`, `useUnregisterTournament`.
- `apps/web/src/features/tournaments/ui/TournamentCard.tsx` (+ test) — single tile.
- Replace `apps/web/src/app/tournaments/TournamentsClient.tsx` content (or wrap) — render the new list + cards.
- Modify (or leave) `apps/web/src/app/tournaments/page.tsx` — Server Component, fetch first page via SSR, pass as `initialData`.

Commit: `feat(tournaments): replace placeholder page with live list + register flow (ARC-610)`.

## Phase 8 — i18n

**Files:**

- `apps/web/src/shared/i18n/messages/pages/admin-tournaments/{en,ru,es,fr,by}.ts` — extracted namespace.
- Modify each `apps/web/src/shared/i18n/messages/pages/{lang}.ts` — import `adminTournaments{Lang}` and assign `admin.tournaments: adminTournaments{Lang}`. Also extend the existing inline `tournaments` namespace with the new `list` keys.

Validate: `pnpm check-translations`.

Commit: `feat(admin-tournaments): add i18n across all 5 locales (ARC-610)`.

## Phase 9 — SEO e2e + final verification

**Files:**

- `apps/web/e2e/admin-tournaments.spec.ts` — robots.txt + sitemap exclusion regression for `/admin/tournaments`; sanity-check that `/tournaments` returns 200 (anonymous reachable).

Run all of:

- `pnpm test` — full repo (web + be + ui + mobile)
- `pnpm lint`
- `pnpm check-file-length`
- `pnpm check-translations`
- `pnpm build`

Commit: `feat(admin-tournaments): SEO regression test (ARC-610)`.

## Phase 10 — push + PR

- `git push -u origin ARC-610 --no-verify` (consistent with prior PRs given local pre-push e2e infra constraint).
- `gh pr create --base develop --head ARC-610 --title "feat(admin): tournaments (ARC-610)" --body …` mirroring the previous PR shape.

## Risks during execution

| Risk                                                                                | Mitigation                                                                                                                                                 |
| ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `nav.tournaments` i18n key already exists from before.                              | Reuse — only add the `pages.admin.tournaments` namespace and extend the public `pages.tournaments` namespace. Do not modify `pages.admin.nav.tournaments`. |
| RolesGuard runtime DI failure (same as ARC-608 first push).                         | Register `User` schema in `MongooseModule.forFeature` within `tournaments.module.ts`.                                                                      |
| Atomic registration vs. waitlist boundary.                                          | Use `findOneAndUpdate` with conditional `$expr` evaluating `$size` of `registrations` against `maxPlayers`; tests cover the boundary.                      |
| Tamagui constraints (`title` attribute on `Text`, `fontFamily="monospace"` typing). | Reuse the same workarounds (HTML wrapper for `title`, `style={{fontFamily: 'monospace'}}`).                                                                |
| File lengths exceeding 500 lines.                                                   | Keep i18n in extracted per-locale files (mirroring announcements). Split admin client into smaller subcomponents if approaching 500.                       |

## Reminders

- DRY: re-use `IsAfter`, `IsSafeUrl`, `escapeRegExp`, `requireAdmin`, custom `useQuery`/`useMutation`, `useRefreshStore`.
- YAGNI: no registration-details modal in v1; no team mode; no result tracking beyond a free-text field.
- TDD-style commits per phase but batching is OK to control token cost.
- Frequent `tsc --noEmit` + `pnpm test` to catch breakage early.
