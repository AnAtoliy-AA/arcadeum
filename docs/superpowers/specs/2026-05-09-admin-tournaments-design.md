# Admin Tournaments — Design Spec (ARC-610)

**Status:** Draft
**Date:** 2026-05-09
**Owner:** AnAtoliy-AA
**Ticket:** ARC-610 — feat admin tournaments

## Goal

Let admins create scheduled tournaments for the existing game variants and let signed-in players register for them. Closes the "start tournament" branch of the original admin epic without coupling to the live game-play engines.

## Non-goals

- No automated bracket generation, no in-engine match orchestration, no live result tracking. Admin manages lifecycle by clicking buttons; results are recorded as free text on the tournament after `completed`.
- No prize distribution / payouts.
- No team / squad tournaments — individual players only.
- No notifications / email — tournaments surface via the existing announcement banner if an admin chooses to broadcast one.
- No ratings / seeding integration with the existing leaderboards.

## Product decisions (locked)

| Decision        | Choice                                                                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Scope           | Tournament listings + sign-ups. Admin manages lifecycle manually.                                                                                 |
| Game options    | `critical_v1` \| `sea_battle_v1` (existing GameType union).                                                                                       |
| Lifecycle       | `scheduled` → `registration_open` → `live` → `completed`. Admin can `cancelled` from any non-completed state.                                     |
| Schedule        | Required `scheduledAt`. Optional `registrationOpensAt` / `registrationClosesAt`. Defaults: opens at scheduledAt − 7d, closes at scheduledAt − 1h. |
| Capacity        | Required `maxPlayers` (2–256). Beyond cap → waitlist.                                                                                             |
| Prize           | Optional plain-text `prizeDescription`.                                                                                                           |
| Audience        | Authenticated users only can register. Public list is anonymous-visible.                                                                          |
| i18n of content | `name` and `description` are per-locale `{en, ru?, es?, fr?, by?}` map; en required; fallback to en.                                              |
| SEO             | `/tournaments` (public) indexable; `/admin/tournaments` inherits noindex from admin layout.                                                       |
| Sidebar         | Flip the disabled `tournaments` slot to enabled `/admin/tournaments`.                                                                             |

## Architecture

### Backend module — `apps/be/src/tournaments/`

```
tournaments.module.ts
schemas/tournament.schema.ts                   // Tournament document + nested registrations subschema
interfaces/tournament.interface.ts             // shared types
dto/
  create-tournament.dto.ts                     // POST body
  update-tournament.dto.ts                     // PATCH body (all optional)
  list-admin-tournaments.dto.ts                // GET admin query
  list-public-tournaments.dto.ts               // GET public query (locale, cursor)
  transition-status.dto.ts                     // POST :id/transition body
tournaments.service.ts                         // CRUD + status transition + registration helpers
tournaments.service.spec.ts
admin-tournaments.controller.ts                // /admin/tournaments (RolesGuard 'admin')
admin-tournaments.controller.spec.ts
public-tournaments.controller.ts               // GET /tournaments + POST /tournaments/:id/register
public-tournaments.controller.spec.ts
lib/derive-effective-window.ts                 // pure helper for default registration window
lib/derive-effective-window.spec.ts
```

Wired into `app.module.ts`. Uses the global `ValidationPipe` already enabled in `main.ts`.

### Frontend admin feature — `apps/web/src/features/admin-tournaments/`

```
api.ts + api.test.ts                           // typed CRUD + transition + listRegistrations
hooks.ts + hooks.test.ts                       // useAdminTournaments + create/update/delete/transition
lib/
  formatTournamentSchedule.ts (+ test)         // locale-aware date formatter for the table
  statusChip.ts (+ test)                       // status → token color
ui/
  AdminTournamentsFilters.tsx (+ test)
  AdminTournamentsTable.tsx (+ test)
  AdminTournamentForm.tsx (+ test)             // create/edit modal with locale tabs
  TournamentRegistrationsModal.tsx (+ test)    // shows registered players + waitlist
```

### Frontend admin route — `apps/web/src/app/admin/tournaments/`

```
page.tsx                                       // Server Component, requireAdmin()
AdminTournamentsClient.tsx                     // 'use client' shell composing filters + table + form + reg modal
```

### Frontend public surface — replace existing `apps/web/src/app/tournaments/`

```
page.tsx                                       // Server Component fetches public list, hydrates client
PublicTournamentsClient.tsx                    // 'use client' shell with register/unregister actions
```

### Frontend public feature — `apps/web/src/features/tournaments/`

```
api.ts + api.test.ts                           // listPublicTournaments, register, unregister
hooks.ts + hooks.test.ts                       // useTournaments + useRegisterTournament/Unregister
ui/
  TournamentCard.tsx (+ test)                  // single tournament tile w/ register button
```

### Sidebar / SEO

- Modify `apps/web/src/app/admin/_components/sidebarItems.ts` — flip `tournaments` to `{ href: '/admin/tournaments', enabled: true }`.
- Create `apps/web/e2e/admin-tournaments.spec.ts` — robots.txt + sitemap exclusion regression.

### i18n

- New per-locale file `apps/web/src/shared/i18n/messages/pages/admin-tournaments/{en,ru,es,fr,by}.ts` (mirrors the announcements split done during ARC-608 to keep page files under 500 lines).
- New `pages.tournaments.list` namespace inline in each `pages/{lang}.ts` (small).
- Validated by `pnpm check-translations`.

## Data model

`Tournament` Mongoose document:

```ts
{
  _id: ObjectId,
  status: 'scheduled' | 'registration_open' | 'live' | 'completed' | 'cancelled',
  gameType: 'critical_v1' | 'sea_battle_v1',
  scheduledAt: Date,                // required
  registrationOpensAt: Date | null, // null => derive scheduledAt - 7d
  registrationClosesAt: Date | null,// null => derive scheduledAt - 1h
  maxPlayers: number,               // 2..256
  prizeDescription: string | null,  // ≤ 500 chars
  resultText: string | null,        // ≤ 1000 chars, set when transitioning to 'completed'
  content: {
    en: { name: string, description?: string },
    ru?: { name: string, description?: string },
    es?: { ... }, fr?: { ... }, by?: { ... },
  },
  registrations: Array<{
    userId: ObjectId,               // ref User
    displayName: string | null,     // denormalized at register time for fast list
    registeredAt: Date,
    waitlist: boolean,              // true if registered after maxPlayers reached
  }>,
  createdBy: ObjectId,              // User ref
  createdAt: Date, updatedAt: Date, // auto via timestamps
}
```

### Indexes

- `{ status: 1, scheduledAt: 1 }` — public list filters by upcoming + sorts by date.
- `{ scheduledAt: -1 }` — admin default sort (newest-first).
- `{ 'registrations.userId': 1, status: 1 }` — for "is current user registered?" lookups.

### Validation rules (DTOs)

- `status` only set by service (initial = `scheduled`); transition endpoint enforces allowed paths.
- `gameType` ∈ `IsIn(['critical_v1', 'sea_battle_v1'])`.
- `scheduledAt` required, `IsDate`, must be `> now` on create.
- `registrationOpensAt` ≤ `registrationClosesAt` ≤ `scheduledAt` (custom validator); each may be null.
- `maxPlayers` `IsInt`, 2 ≤ x ≤ 256.
- `prizeDescription` `IsString @MaxLength(500)`, optional.
- `content.en.name` required, ≤ 120 chars; `description` ≤ 1000 chars per locale.
- `forbidNonWhitelisted` rejects unknown body fields (already enabled globally).

### Status derivation (effective)

For the **public** list we compute an effective state per request (does not mutate the doc):

```
now < registrationOpensAt          → 'scheduled'
registrationOpensAt ≤ now < registrationClosesAt  → 'registration_open'
registrationClosesAt ≤ now < scheduledAt          → 'registration_closed'   (UI-only)
scheduledAt ≤ now ≤ scheduledAt + 24h             → 'live' or 'awaiting_results' (UI-only)
…unless explicit doc.status is 'completed' or 'cancelled'
```

Admin sees `doc.status` directly.

## API surface

### Public

- `GET /tournaments?locale=&cursor=` — list. Filters to `status ∈ {scheduled, registration_open, live, completed}` (i.e. not cancelled) and sorts by `scheduledAt` ASC for upcoming, DESC for completed. Returns `{ items: TournamentPublicDto[], nextCursor }`. Locale resolved server-side, EN fallback. `Cache-Control: public, max-age=60, stale-while-revalidate=300`.
- `POST /tournaments/:id/register` — auth required. Adds caller to `registrations`. If reg window not open or status not `registration_open` → 409. Idempotent (re-register no-op). Returns `{ ok: true, waitlist: boolean }`.
- `DELETE /tournaments/:id/register` — auth required. Removes caller. Idempotent.

`TournamentPublicDto` = `{ id, gameType, scheduledAt, registrationOpensAt, registrationClosesAt, maxPlayers, prizeDescription, resultText, status, effectiveStatus, registeredCount, waitlistCount, isRegistered, name, description }` (locale-resolved name/description, no internal `content` map; `isRegistered` only when authenticated).

### Admin (JwtAuthGuard + RolesGuard + @Roles('admin'))

- `GET /admin/tournaments?page=&pageSize=&q=&status=&gameType=` — paginated list. Returns full `AdminTournamentDto` (full content map, registration counts, populated createdBy displayName).
- `POST /admin/tournaments` — body `CreateTournamentDto`. Returns created.
- `PATCH /admin/tournaments/:id` — body `UpdateTournamentDto` (all fields optional, no status changes).
- `POST /admin/tournaments/:id/transition` — body `{ to: 'registration_open' | 'live' | 'completed' | 'cancelled', resultText?: string }`. Validates allowed source → target transitions; for `completed`, persists `resultText`.
- `DELETE /admin/tournaments/:id` — hard delete only when `status` ∈ `{scheduled, cancelled}` (avoid losing registration data on a real tournament). Returns 204.
- `GET /admin/tournaments/:id/registrations?page=&pageSize=` — paginated registration list. Each row: userId, displayName, registeredAt, waitlist.

### Allowed transitions

```
scheduled        → registration_open | cancelled
registration_open → live | cancelled
live             → completed | cancelled
completed        → (terminal)
cancelled        → (terminal)
```

Server enforces; FE shows only valid next-state buttons.

## FE admin UI

`/admin/tournaments` — Server Component → `requireAdmin()` → `AdminTournamentsClient`.

- **`AdminTournamentsFilters`**: debounced search (matches `content.en.name`), status dropdown, game-type dropdown, "+ New tournament" button.
- **`AdminTournamentsTable`** (mirrors the polished users/payments/announcements pattern: GlassCard wrap, header row with `$backgroundFocus`, zebra rows, hover, outlined sm pagination):
  - Columns: Name (en, truncated 60), Game type, Scheduled, Status chip, Registered (`registered/max`), Created by, Actions (Edit / Transition / Registrations / Delete).
- **`AdminTournamentForm`** modal:
  - Settings: `gameType` radio, `scheduledAt` datetime, `registrationOpensAt` datetime (clearable → derived), `registrationClosesAt` datetime (clearable → derived), `maxPlayers` number, `prizeDescription` textarea.
  - Content: 5 locale tabs (en required, others optional). Each tab has `name` (required for en) and `description` (textarea).
  - Validation: en name required, capacity 2–256, registration window monotonic, scheduled in the future on create.
  - Submit invalidates `admin-tournaments` and `public-tournaments` refresh keys.
- **`TournamentRegistrationsModal`**: read-only list of registrations with displayName + registeredAt + waitlist chip. Pagination 50/page.
- **Transition buttons**: each renders only valid next states. `completed` opens a small dialog asking for optional `resultText`; `cancelled` opens a confirm dialog.

## FE public UI

`/tournaments` — replace the current "coming soon" content. Server Component fetches the first page of upcoming tournaments via SSR for fast first paint, then hydrates `PublicTournamentsClient`.

- **`PublicTournamentsClient`** lays out `TournamentCard` tiles in a responsive grid (1 col mobile, 2 col tablet, 3 col desktop).
- **`TournamentCard`** shows: name, game-type chip, locale-formatted scheduled time + relative ("in 3 days"), status chip with `effectiveStatus`, prize description, `Registered N / max` progress strip, register/unregister button (or sign-in prompt for anonymous). Disabled states for `live`/`completed`/`cancelled`.

Banner integration: when admin creates/transitions a tournament, the existing `AnnouncementBanner` is unchanged — admin can manually create an announcement that links to `/tournaments`.

## i18n

- `pages.admin.tournaments` namespace — extracted to `apps/web/src/shared/i18n/messages/pages/admin-tournaments/{lang}.ts` (5 files, imported from each `pages/{lang}.ts`). Keys cover: `title`, `actions.{new,edit,delete,cancel,save,transition,manageRegistrations}`, `filters.{searchPlaceholder,status,gameType}`, `table.{name,gameType,scheduled,status,registered,createdBy,actions}`, `status.{scheduled,registration_open,live,completed,cancelled}`, `gameType.{critical_v1,sea_battle_v1}`, `transitions.{to,resultText,cancelConfirm,completeConfirm}`, `form.{settings,content,sections,…}`, `registrations.{title,empty,column.*,waitlist}`, `confirm.{delete,cancel}`, `empty.*`, `pagination.*`, `totalLabel`.
- `pages.tournaments` namespace updated inline (small): `loading`, `empty`, `card.{registered,prize,registerCta,unregisterCta,signInToRegister,full,registrationCloses}`, `effectiveStatus.{scheduled,registration_open,registration_closed,live,awaiting_results,completed,cancelled}`.
- All strings translated to RU / ES / FR / BY (no copy-paste of EN).

## Testing

### Backend (Jest)

- `tournaments.service.spec.ts` (~12 tests): create defaults registration window from scheduledAt; status transitions allowed/forbidden table; effective-status helper boundaries; admin list filters; pagination; populated createdBy.
- `lib/derive-effective-window.spec.ts` (~6 tests): both null → +/- defaults; one set → other derived; both set → passthrough; passthrough rejects invalid order at validator layer (covered in DTO test).
- `admin-tournaments.controller.spec.ts` (~10 tests): 401/403 guards; DTO `forbidNonWhitelisted`; `endsAt > startsAt` validator coverage; transition endpoint enforces allowed paths; delete only when status ∈ {scheduled, cancelled}; pageSize cap.
- `public-tournaments.controller.spec.ts` (~8 tests): list returns only non-cancelled; register requires auth, idempotent, waitlist when full, 409 when reg window closed; unregister; locale fallback; cache header.

### Frontend (Vitest + RTL)

- `api.test.ts` for both feature folders (URL builders, body shapes, auth header).
- `hooks.test.ts` for both (token guard, mutations invalidate both refresh keys).
- `formatTournamentSchedule.test.ts`, `statusChip.test.ts` — pure helpers.
- `AdminTournamentsTable.test.tsx` (~10 tests): rows render, status pill correct, edit/delete/transition/registrations callbacks fire, empty states, pagination wiring.
- `AdminTournamentsFilters.test.tsx` (~5 tests): debounced search resets page, dropdowns wired, new button.
- `AdminTournamentForm.test.tsx` (~8 tests): locale tabs preserve state, en name required, capacity bounds, registration window monotonic, submit shape correct.
- `TournamentRegistrationsModal.test.tsx` (~4 tests): renders rows, waitlist chip, pagination, empty state.
- `TournamentCard.test.tsx` (~6 tests): renders fields, register button hidden when reg not open, unregister when registered, sign-in prompt when anonymous, full state.

### E2E (Playwright)

- `apps/web/e2e/admin-tournaments.spec.ts`:
  - `robots.txt` still disallows `/admin/`.
  - `sitemap.xml` does not include `/admin/tournaments`.
  - `/tournaments` is reachable to anonymous users (200 OK) — sanity check that we didn't accidentally noindex the public page.

## Rollout

- Single PR against `develop`.
- No feature flag — `RolesGuard` is the only admin gate.
- No data migration; collection starts empty. Public `/tournaments` returns empty list until admin creates one; client renders the friendly empty state.
- Sidebar entry flipped on in the same PR.
- Pre-push e2e takes ~16 min; follow established `--no-verify` push pattern when local infra is unavailable.

## Risks & mitigations

| Risk                                                          | Mitigation                                                                                                                                                                 |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Admin transitions a tournament past expected order.           | Server-enforced allowed-transitions table; client only shows valid next-state buttons.                                                                                     |
| Mass-register denial-of-service on the registration endpoint. | Idempotent register/unregister, plus the global rate-limit middleware already in place; capacity enforced server-side via the doc's `registrations` array length.          |
| Concurrent registrations exceed `maxPlayers`.                 | Use `findOneAndUpdate` with `$push` and a conditional `$expr` (or transaction) to set `waitlist: registrations.length >= maxPlayers` atomically. Tests cover the boundary. |
| Public list could be expensive.                               | `Cache-Control: public, max-age=60, stale-while-revalidate=300`; cursor-paginated; the `{status: 1, scheduledAt: 1}` index covers the query.                               |
| Admin deletes a tournament with registrations.                | Server rejects delete unless status ∈ `{scheduled, cancelled}`; for non-cancellable historical records, admin must transition to `completed` (preserves the row).          |

## Open questions

None — all product decisions resolved upfront. Implementation plan can proceed.
