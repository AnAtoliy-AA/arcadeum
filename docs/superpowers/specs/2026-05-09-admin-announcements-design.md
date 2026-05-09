# Admin Announcements — Design Spec (ARC-608)

**Status:** Draft
**Date:** 2026-05-09
**Owner:** AnAtoliy-AA
**Ticket:** ARC-608 — feat admin announcements

## Goal

Let admins broadcast time-bounded notices (tournaments, maintenance, feature launches) to end users via a header banner. Admins manage announcements through a dedicated `/admin/announcements` page; the banner surfaces the highest-priority active announcement to each visitor.

The page must inherit `noindex/nofollow` from the existing admin shell.

## Non-goals

- No inbox / archive page for users (no `/announcements`).
- No markdown / HTML in announcement content (plain text only — XSS surface zero).
- No backend-persisted dismissal (anonymous and per-device only).
- No read receipts, analytics, or A/B targeting.
- No push notifications / email — banner only.
- No per-locale targeting (one announcement renders to all locales it has translations for; English fallback otherwise).

## Product decisions (locked)

| Decision               | Choice                                                                                | Rationale                                                               |
| ---------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Surface point          | Global header banner                                                                  | Highest visibility, single component, every page sees it.               |
| Lifecycle              | Scheduled window (`startsAt` / `endsAt`, both optional)                               | Admin can pre-stage future announcements without flipping switches.     |
| Dismissal              | localStorage, per-user, per-device                                                    | No backend write; survives navigation; resets when admin edits content. |
| Audience               | Per-announcement `audience: 'all' \| 'authenticated' \| 'anonymous'`                  | Lets admin target e.g. "sign up" copy at anonymous only.                |
| Content shape          | `title` + optional `body` + optional `ctaLabel`/`ctaHref`                             | Banner-sized title, expandable body for detail, optional CTA link.      |
| Localization           | Per-locale `content[locale]` map; English required, others optional; English fallback | Matches the 5-locale product (en/ru/es/fr/by).                          |
| Severity               | `info` / `warning` / `critical`; critical is non-dismissable                          | Visual distinction between routine and urgent.                          |
| Multi-active selection | Show one: highest severity, then newest by `startsAt`                                 | Keeps the header clean.                                                 |

## Architecture

### Backend module — `apps/be/src/announcements/`

```
announcements.module.ts
schemas/announcement.schema.ts
interfaces/announcement.interface.ts
dto/
  create-announcement.dto.ts
  update-announcement.dto.ts
  list-admin-announcements.dto.ts
announcements.service.ts                 // shared queries
admin-announcements.controller.ts        // /admin/announcements (RolesGuard 'admin')
public-announcements.controller.ts       // GET /announcements/active
```

Wired into `app.module.ts` like every other feature module. Uses the global `ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true })` already enabled in `apps/be/src/main.ts`.

### Frontend widget — `apps/web/src/widgets/AnnouncementBanner/`

```
ui/AnnouncementBanner.tsx
ui/AnnouncementBanner.test.tsx
hooks/useActiveAnnouncement.ts
hooks/useActiveAnnouncement.test.ts
lib/dismissedStorage.ts
lib/dismissedStorage.test.ts
api.ts
api.test.ts
```

Mounted in `apps/web/src/app/layout.tsx` between `<Header />` and `{children}`. The widget renders nothing when there is no active announcement.

### Frontend admin feature — `apps/web/src/features/admin-announcements/`

```
api.ts + api.test.ts                     // CRUD calls
hooks.ts + hooks.test.ts                 // useAdminAnnouncements + create/update/delete mutations
ui/AdminAnnouncementsTable.tsx (+test)
ui/AdminAnnouncementsFilters.tsx (+test)
ui/AdminAnnouncementForm.tsx (+test)     // create/edit modal with locale tabs + preview
```

### Frontend route — `apps/web/src/app/admin/announcements/`

```
page.tsx                                 // Server Component → requireAdmin()
AdminAnnouncementsClient.tsx             // 'use client' shell composing filters + table + form
```

Sidebar entry in `apps/web/src/app/admin/_components/sidebarItems.ts` flips from `{ id: 'announcements', href: null, enabled: false }` to `{ id: 'announcements', href: '/admin/announcements', enabled: true }`.

## Data model

`Announcement` Mongoose document:

```ts
{
  _id: ObjectId,
  severity: 'info' | 'warning' | 'critical',          // required
  audience: 'all' | 'authenticated' | 'anonymous',    // required, default 'all'
  startsAt: Date | null,                              // null = active immediately
  endsAt:   Date | null,                              // null = no expiry
  content: {
    en: { title: string, body?: string, ctaLabel?: string, ctaHref?: string },  // en required
    ru?: { title, body?, ctaLabel?, ctaHref? },
    es?: { ... },
    fr?: { ... },
    by?: { ... },
  },
  createdBy: ObjectId,    // user ref — admin who created
  createdAt: Date,        // auto via { timestamps: true }
  updatedAt: Date,
}
```

### Indexes

- `{ startsAt: 1, endsAt: 1 }` — public endpoint hits this on every request.
- `{ severity: -1, startsAt: -1 }` — primary sort for the "highest, newest" pick.

### Validation rules

- `severity` ∈ `IsIn(['info','warning','critical'])`.
- `audience` ∈ `IsIn(['all','authenticated','anonymous'])`, defaults `'all'`.
- `content.en.title` required, ≤ 120 chars; `body` (when present) ≤ 500 chars.
- `ctaHref` (when present) must match `^(https?:\/\/|\/)` and must not match `^javascript:`.
- `endsAt > startsAt` when both set (custom validator using `class-validator`'s `@ValidateBy`).
- Unknown fields rejected by `forbidNonWhitelisted`.

### Active-now query

```js
{
  $and: [
    { $or: [{ startsAt: null }, { startsAt: { $lte: now } }] },
    { $or: [{ endsAt: null }, { endsAt: { $gt: now } }] },
    audienceFilter, // see below
  ];
}
```

Sort `{ severity: -1, startsAt: -1 }`, limit 1 for the public endpoint.

`audienceFilter`:

- Authenticated caller → `{ audience: { $in: ['all', 'authenticated'] } }`
- Anonymous caller → `{ audience: { $in: ['all', 'anonymous'] } }`

## API surface

### Public

- `GET /announcements/active`
  - Optional auth (anonymous allowed).
  - Reads caller locale from `?locale=` query param if present, else `Accept-Language`, else `en`.
  - Response shape: `{ announcement: AnnouncementPublicDto | null }`.
  - `AnnouncementPublicDto` = `{ id, severity, updatedAt, title, body?, ctaLabel?, ctaHref? }` — locale already resolved server-side with English fallback. Admin-only fields stripped (`createdBy`, full `content` map, `audience`).
  - `Cache-Control: private, max-age=30, stale-while-revalidate=60`.

### Admin (guarded by `JwtAuthGuard + RolesGuard + @Roles('admin')`)

- `GET /admin/announcements?page=&pageSize=&q=&status=&severity=`
  - `page` 1-based (admin convention), `pageSize` ≤ 100.
  - `status` ∈ `'all' | 'active' | 'scheduled' | 'expired'` — derived from `startsAt`/`endsAt` vs `now()` in the aggregation.
  - `q` matches `content.en.title` (escaped via `escapeRegExp`, case-insensitive).
  - Response: `{ items: AnnouncementAdminDto[], total, page, pageSize }`. `AnnouncementAdminDto` includes the full `content` map plus `createdBy.displayName` joined in.
- `POST /admin/announcements` — body `CreateAnnouncementDto`. Returns the created `AnnouncementAdminDto`.
- `PATCH /admin/announcements/:id` — body `UpdateAnnouncementDto` (`PartialType(CreateAnnouncementDto)`). Touching the document increments `updatedAt`, which invalidates client dismissals.
- `DELETE /admin/announcements/:id` — hard delete. Returns 204.

### Status derivation

```
now < startsAt              → 'scheduled'
startsAt ≤ now < endsAt     → 'active'   (or endsAt null + startsAt ≤ now)
now ≥ endsAt                → 'expired'
```

Note: `startsAt: null` means "active immediately" — treated as `-∞`.
`endsAt: null` means "no expiry" — treated as `+∞`.

## FE banner behavior

- `useActiveAnnouncement()` wraps the existing custom `useQuery` hook (same pattern as `useAdminPaymentNotes`). Refetches on window focus + every 60 s while tab is visible.
- Dismissal store: `localStorage['arc:announcements:dismissed']` = JSON `Array<{ id: string, updatedAt: string }>`. Cap 50 entries (FIFO eviction). Malformed JSON → treated as empty.
- A banner is hidden if `dismissedIds` contains a matching `{id, updatedAt}` pair AND `severity !== 'critical'`.
- When admin edits content, `updatedAt` changes → previous dismissal entry no longer matches → banner re-appears with the new content.
- `critical` severity ignores localStorage entirely — close button is hidden.

### Visual

- Tamagui `XStack`, 40–48 px tall on desktop, 36 px collapsed on mobile.
- Severity colors map to design tokens:
  - `info` → `$infoBackground` / `$infoText`
  - `warning` → `$warningBackground` / `$warningText`
  - `critical` → `$errorBackground` / `$errorText`
- Layout (left → right): icon · title · CTA link · `×` close button.
- When `body` is non-empty, clicking the title expands the banner inline to show body + CTA. Click again to collapse. Mobile: chevron toggle replaces title click target.
- A11y: `role="status"` for `info`/`warning`, `role="alert"` for `critical`. Close-button `aria-label` from i18n.

### XSS / safety

- `ctaHref` re-validated client-side before render (`https?://` or relative path starting with `/`). Anything else → CTA hidden.
- All other fields rendered as text via React, never `dangerouslySetInnerHTML`.

## Admin UI

`/admin/announcements` route layout, mirroring `/admin/payments`:

- **`AdminAnnouncementsFilters`** — debounced search by title (300 ms), `status` dropdown, `severity` dropdown, "+ New announcement" button on the right. Filter changes reset `page` to 1.
- **`AdminAnnouncementsTable`** — columns:
  - Title (en) — truncated at 60 chars with native HTML `title` attr for full text.
  - Severity — chip colored per severity.
  - Audience — chip ("All" / "Signed in" / "Anonymous").
  - Window — formatted `startsAt → endsAt` (e.g. "May 9 — May 16"), with "Now" pill if currently active.
  - Created by — `displayName` joined from `createdBy`.
  - Actions — Edit / Delete icon buttons.
- Pagination — 25 per page; "Showing 1–25 of 47" total label.

### Form modal — `AdminAnnouncementForm`

Three logical sections in one modal (no wizard):

1. **Settings** — severity radio group, audience radio group, `startsAt` & `endsAt` `DateTimeInput` (each clearable for "now" / "forever").
2. **Content** — locale tabs (EN, RU, ES, FR, BY). Each tab has `title` (required for EN, optional for others), `body` (textarea), `ctaLabel`, `ctaHref`.
3. **Preview** — read-only render of the banner using current form state in the selected locale + severity. Includes the dismiss button styling so admin sees exactly what users will see.

Submit:

- Create → `POST /admin/announcements` → invalidate admin list query → invalidate public `useActiveAnnouncement` → close modal.
- Edit → `PATCH /admin/announcements/:id` → same invalidations.

Validation errors render inline below each field; submit button disabled until EN title is non-empty and `endsAt > startsAt` (when both set).

### Delete

Confirmation dialog: "Delete announcement '<title>'? This cannot be undone." → `DELETE /admin/announcements/:id` → invalidate queries.

## i18n

### New namespaces

- `pages.admin.announcements` — admin page strings, mirroring the `pages.admin.payments` pattern. Keys: `title`, `actions.{new,edit,delete,cancel,save}`, `filters.{searchPlaceholder,status,severity}.*`, `table.{title,severity,audience,window,createdBy,actions}`, `severity.{info,warning,critical}`, `audience.{all,authenticated,anonymous}`, `status.{active,scheduled,expired,all}`, `form.{settings,content,preview,startsAt,endsAt,...}`, `confirm.delete`, `empty.{noResults,noAnnouncements}`, `pagination.{prev,next,of}`, `totalLabel`.
- `widgets.announcementBanner` — banner-side strings: `dismissAriaLabel`, `expandAriaLabel`, `collapseAriaLabel`, `defaultStatusLabel`.

Both namespaces added to all 5 locale files: `apps/web/src/shared/i18n/messages/{en,ru,es,fr,by}.ts` (plus `pages/{en,ru,es,fr,by}.ts` for `pages.admin.announcements`). Validated by `pnpm check-translations`.

### Sidebar key

`pages.admin.nav.announcements` — already exists in all locale files. No change.

### Announcement content

Comes from the document's `content[locale]` map, **not** from i18n bundles.

## Testing

### Backend (Jest)

- `announcements.service.spec.ts` (~12 tests):
  - Active-now query with `startsAt: null`, `endsAt: null`, both, neither (boundary).
  - Audience filter for anonymous vs authenticated.
  - Sort order: critical ranks above warning ranks above info; ties broken by `startsAt` desc.
  - Status derivation function: scheduled / active / expired.
- `admin-announcements.controller.spec.ts` (~7 tests):
  - 403 when caller has `role: 'user'`.
  - 401 when no token.
  - DTO rejects unknown fields (`forbidNonWhitelisted`).
  - DTO rejects `ctaHref: 'javascript:alert(1)'`.
  - DTO rejects `endsAt < startsAt`.
  - 404 on `PATCH` / `DELETE` of missing id.
  - `pageSize=999` → 400.
- `public-announcements.controller.spec.ts` (~5 tests):
  - Anonymous → only `all` + `anonymous` audience.
  - Authenticated → only `all` + `authenticated`.
  - Locale resolution: `?locale=ru` returns RU content; `?locale=ru` with no RU translation falls back to EN.
  - Returns `null` when no active match.
  - Strips `createdBy` and full `content` map.

### Frontend (Vitest + RTL)

- `dismissedStorage.test.ts` — round-trip, FIFO cap at 50, malformed JSON → `[]`.
- `useActiveAnnouncement.test.ts` — fetches; returns `null` on 200 with `null` body; applies dismissal; ignores dismissal for `critical`; re-shows after `updatedAt` changes.
- `AnnouncementBanner.test.tsx` — renders all 3 severities; expand/collapse on title click; dismiss removes from view + writes to localStorage; CTA href validation; a11y roles per severity; renders nothing when hook returns `null`.
- `admin-announcements/api.test.ts` — URL builders for list/create/update/delete; auth header attached.
- `admin-announcements/hooks.test.ts` — list query; create/update/delete mutations invalidate refresh keys.
- `AdminAnnouncementsTable.test.tsx` — columns render, status pill correct, edit/delete buttons fire callbacks, pagination wiring, empty state.
- `AdminAnnouncementsFilters.test.tsx` — debounced search resets page, dropdowns wired.
- `AdminAnnouncementForm.test.tsx` — locale tabs preserve state, EN title required validation, `endsAt > startsAt` validation, submit shape correct on create vs edit, preview reflects current form.

### E2E (Playwright)

- `apps/web/e2e/admin-announcements.spec.ts`:
  - `robots.txt` still disallows `/admin/`.
  - `sitemap.xml` does not include `/admin/announcements`.

### Manual smoke

- Sign in as admin → create announcement → see it in header banner across the app.
- Dismiss → reload → still gone.
- Admin edits title → banner reappears with new title.
- Set `severity: critical` → close button absent.
- Set `audience: anonymous` → sign out → see banner; sign in → banner hidden.
- Schedule `startsAt: tomorrow` → banner hidden today; admin list shows "Scheduled" pill.

## Rollout

- Single PR to `develop`.
- No feature flag — `RolesGuard` is the only gate.
- Sidebar link enabled in the same PR.
- No data migration; collection starts empty. Public endpoint returns `null` → `useActiveAnnouncement` → banner renders nothing.
- Pre-push e2e is full-suite (~16 min); follow the established pattern of `--no-verify` push when local infrastructure is unavailable, with explicit user authorization.

## Risks & mitigations

| Risk                                                          | Mitigation                                                                                                                                                                                         |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Banner adds layout shift on every page load.                  | Reserve banner height via CSS (always 0 px when hook returns `null`; height applied only when content arrives — accept 1-frame paint flash, no layout shift since banner is above scroll content). |
| Admin posts an XSS payload.                                   | Plain-text rendering; `ctaHref` regex; client and server validation.                                                                                                                               |
| Critical announcement gets stuck (admin sets endsAt too far). | Admin UI shows live "Now" pill so admin sees what's active and can edit/delete immediately.                                                                                                        |
| Public endpoint hit on every page nav inflates DB load.       | Single small index, `Cache-Control: private, max-age=30`, focus refetch only — bounded.                                                                                                            |
| Stale dismissal after content edit confuses users.            | `updatedAt`-keyed dismissal — edits re-show banner intentionally.                                                                                                                                  |

## Open questions

None — all product decisions resolved during brainstorming. Implementation plan can proceed.
