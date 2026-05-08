# Admin Shell — Design

**Date:** 2026-05-08
**Branch:** ARC-602
**Status:** Approved (pending spec review)

## Context

The user wants an admin page that will eventually let staff start tournaments,
edit user roles, broadcast announcements, and view payment history. The page
must not be indexed by search engines.

The codebase today has:

- `User.role` with `admin` already in `USER_ROLES`
  ([apps/be/src/auth/lib/roles.ts](../../apps/be/src/auth/lib/roles.ts),
  [apps/be/src/auth/schemas/user.schema.ts](../../apps/be/src/auth/schemas/user.schema.ts))
- `JwtAuthGuard` and `GET /auth/me`
  ([apps/be/src/auth/auth.controller.ts](../../apps/be/src/auth/auth.controller.ts))
  but **no** `RolesGuard` / `@Roles()` decorator and **no** admin endpoints
- `getServerAccessToken()` for reading the auth cookie in Server Components
  ([apps/web/src/entities/session/api/serverTokens.ts](../../apps/web/src/entities/session/api/serverTokens.ts))
- `robots.ts` already disallows `/admin/`
  ([apps/web/src/app/robots.ts](../../apps/web/src/app/robots.ts))
- A static "coming soon" `/tournaments` page; no tournaments backend
- A `payment-note` schema with paginated `getNotes`; no full payment-history
  persistence
- No announcements / notifications module

## Scope

This spec covers **only the admin shell foundation**. Each future feature
(role editor, payments history, announcements, tournaments) will get its own
spec → plan → implementation cycle and slot into the shell defined here.

### In scope (v1)

1. Reusable `RolesGuard` + `@Roles()` decorator on the backend
2. A trivial `GET /admin/ping` endpoint to validate the wiring end-to-end
3. `/admin` Server Component route on web, gated to `role === 'admin'`,
   non-admins get `notFound()` (HTTP 404)
4. `noindex, nofollow` metadata on `/admin`
5. Placeholder shell UI: sidebar listing the 4 future sections (Roles,
   Payments, Announcements, Tournaments) as disabled "coming soon" links
6. i18n keys in all 5 locale files (`en`, `ru`, `es`, `fr`, `by`)
7. Tests: BE unit + integration, FE unit, Playwright e2e

### Out of scope

- Role editing UI / `PATCH /users/:id/role` endpoint
- Payment history viewer (only the existing `/payments/notes` listing exists)
- Announcement broadcast module
- Tournament engine, schema, or "start" action
- Per-section role gating (e.g. moderators getting partial access)
- Audit logging of admin actions

## Architecture

### Routing

```
apps/web/src/app/admin/
├── layout.tsx        Server Component, calls requireAdmin(), exports noindex metadata
├── page.tsx          Landing dashboard inside the shell (placeholder for v1)
├── error.tsx         Local error boundary so admin failures don't fall back to global error
└── AdminLayoutClient.tsx   'use client' — Tamagui shell (sidebar + content slot)
```

### Backend module

```
apps/be/src/admin/
├── admin.controller.ts    GET /admin/ping → { ok: true }, guarded
├── admin.module.ts
└── admin.controller.spec.ts

apps/be/src/auth/guards/
├── roles.decorator.ts     @Roles(...roles: UserRole[]) via SetMetadata
├── roles.guard.ts         Reflector-based, expects req.user from JwtAuthGuard
└── roles.guard.spec.ts
```

`AdminModule` is registered in `apps/be/src/app.module.ts`.

### Shared FE helper

```
apps/web/src/entities/session/api/
├── requireAdmin.ts        Server-only: reads cookie, fetches /auth/me, returns admin user or notFound()
└── requireAdmin.test.ts
```

## Data Flow

**Gate flow in `apps/web/src/app/admin/layout.tsx`:**

```text
1. user = await requireAdmin()       // throws notFound() on any failure
2. render <AdminLayoutClient user={user}>{children}</AdminLayoutClient>
```

**`requireAdmin()` internals:**

```text
1. token = await getServerAccessToken()
2. if (!token) → notFound()
3. res = await fetch(`${BE}/auth/me`, {
     headers: { Authorization: `Bearer ${token}` },
     cache: 'no-store',
   })
4. if (!res.ok) → notFound()         // 401 expired, 5xx, network — all collapse to 404
5. user = await res.json()
6. if (user.role !== 'admin') → notFound()
7. return user
```

**Backend request flow:**

```text
1. JwtAuthGuard runs → populates req.user from JWT, 401 if missing/invalid
2. RolesGuard runs   → checks req.user.role against @Roles(...), 403 if mismatch
3. Handler executes
```

### Key design choices

- **Single failure mode = 404.** Every non-admin path (no token, expired token,
  BE down, role !== admin) collapses to `notFound()`. No information leak about
  whether the user is signed in or whether the route exists. This pairs with
  `robots.ts` `Disallow: /admin/` to keep the route invisible.
- **`cache: 'no-store'`** on the role check. Role can change; never cache "you
  are admin".
- **No token refresh inside the gate.** Refresh lives on the client. Expired
  access tokens fall through to `notFound()`; the user re-authenticates
  normally and tries again. Adding refresh to a server gate widens attack
  surface for a v1 admin shell.
- **`RolesGuard` falls open when `@Roles()` is absent.** Lets the guard be
  applied broadly (e.g. globally on a controller) without breaking unannotated
  routes. The decorator is the explicit opt-in.
- **FE gate is UX, BE guard is the security boundary.** The frontend never
  sees a 403 because the layout filters non-admins client-side-of-the-network.
  But every admin BE endpoint must use `@UseGuards(JwtAuthGuard, RolesGuard)`
  - `@Roles('admin')` — that's the real defense.
- **Server Component for the gate.** No client flash of admin UI before the
  redirect/404; no admin HTML shipped to non-admins; SEO-safe by construction.
- **Two layers of no-index** — `robots.ts` (already in place) plus per-page
  `metadata.robots = { index: false, follow: false }` on the layout. Belt
  and braces.

## Components

### `RolesGuard` (`apps/be/src/auth/guards/roles.guard.ts`)

```ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<UserRole[] | undefined>(
      'roles',
      [ctx.getHandler(), ctx.getClass()],
    );
    if (!required || required.length === 0) return true;

    const req = ctx.switchToHttp().getRequest();
    const user = req.user as { role?: UserRole } | undefined;
    if (!user?.role) throw new ForbiddenException();
    return required.includes(user.role);
  }
}
```

### `@Roles()` decorator (`apps/be/src/auth/guards/roles.decorator.ts`)

```ts
export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
```

### `AdminController` (`apps/be/src/admin/admin.controller.ts`)

```ts
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  @Get('ping')
  ping() {
    return { ok: true };
  }
}
```

### `requireAdmin()` (`apps/web/src/entities/session/api/requireAdmin.ts`)

Server-only helper. Encapsulates the gate flow above. Returns the typed admin
user object so consumers can use it without a second fetch.

### `AdminLayoutClient` (`apps/web/src/app/admin/AdminLayoutClient.tsx`)

`'use client'` (Tamagui requires it). Renders:

- A two-column layout using `@arcadeum/ui`: `Container` → `XStack` with a
  sidebar `YStack` and a content `YStack`
- Sidebar items: Dashboard (active), Roles, Payments, Announcements,
  Tournaments — all but Dashboard are disabled with a "coming soon" caption
- Header strip showing the current admin's username + role badge
- Children rendered in the content column

### `/admin/page.tsx`

Minimal landing dashboard. v1 content: a `GlassCard` with a welcome heading
and a short note that feature panels will appear here as they ship. No live
data.

### `/admin/error.tsx`

Local error boundary. Renders a "Something went wrong" card so a thrown error
in any future panel doesn't fall through to the global error page.

## i18n

New `pages.admin` namespace. Minimum keys for v1:

- `pages.admin.title` — "Admin"
- `pages.admin.welcome` — heading on the landing page
- `pages.admin.welcomeBody` — short description
- `pages.admin.nav.dashboard`
- `pages.admin.nav.roles`
- `pages.admin.nav.payments`
- `pages.admin.nav.announcements`
- `pages.admin.nav.tournaments`
- `pages.admin.nav.comingSoon` — caption shown next to disabled items
- `pages.admin.error.title`
- `pages.admin.error.body`

Add to `en`, `ru`, `es`, `fr`, `by`.

## Testing

### Backend (Jest)

`roles.guard.spec.ts`:

- allows when `req.user.role` matches one of `@Roles(...)`
- denies (`ForbiddenException`) when role doesn't match
- falls open (allows) when no `@Roles()` metadata is present
- denies when `req.user` is missing (defensive — should be unreachable behind
  `JwtAuthGuard`, but worth pinning)

`admin.controller.spec.ts` (integration via Nest test module):

- 401 with no token
- 403 with token for non-admin user (e.g. `developer`, `moderator`, `free`)
- 200 `{ ok: true }` with admin token

### Frontend unit (Vitest)

`requireAdmin.test.ts` — mocks `cookies()` and `fetch`:

- calls `notFound()` when no token cookie
- calls `notFound()` when `/auth/me` returns 401
- calls `notFound()` when `/auth/me` returns 5xx
- calls `notFound()` when role is `free`, `developer`, `moderator`,
  `supporter`, `vip`, `premium`, `tester`
- returns the user object when role is `admin`

### Frontend e2e (Playwright)

`apps/web/e2e/admin.spec.ts`:

- Anonymous user navigates to `/admin` → 404 page (not the admin shell, not a
  redirect)
- Logged-in non-admin user → 404
- Logged-in admin user → sees the admin shell with sidebar items
- SEO: `<meta name="robots" content="noindex, nofollow">` present on `/admin`
- `GET /robots.txt` includes `Disallow: /admin/` (regression pin)

### Out of scope for v1 tests

- Behavior of disabled sidebar links — their target features own those tests
- Load/perf tests on the gate — one cheap fetch per `/admin` navigation

## File Inventory

### New files

**Backend:**

- `apps/be/src/auth/guards/roles.decorator.ts`
- `apps/be/src/auth/guards/roles.guard.ts`
- `apps/be/src/auth/guards/roles.guard.spec.ts`
- `apps/be/src/admin/admin.controller.ts`
- `apps/be/src/admin/admin.module.ts`
- `apps/be/src/admin/admin.controller.spec.ts`

**Frontend:**

- `apps/web/src/entities/session/api/requireAdmin.ts`
- `apps/web/src/entities/session/api/requireAdmin.test.ts`
- `apps/web/src/app/admin/layout.tsx`
- `apps/web/src/app/admin/page.tsx`
- `apps/web/src/app/admin/error.tsx`
- `apps/web/src/app/admin/AdminLayoutClient.tsx`
- `apps/web/e2e/admin.spec.ts`

### Modified files

- `apps/be/src/app.module.ts` — register `AdminModule`
- `apps/web/src/shared/i18n/messages/*.ts` — add `pages.admin` namespace in
  all 5 locales
- (Verify `apps/web/src/app/sitemap.ts` does not list `/admin`. It currently
  doesn't, but pin it.)

### Unchanged but relied upon

- `apps/web/src/app/robots.ts` — already disallows `/admin/`

## Risks & Mitigations

- **Risk:** Future admin sub-routes forget to add `@UseGuards(JwtAuthGuard,
RolesGuard)` to their controllers.
  **Mitigation:** spec the convention here; the `AdminController` is the
  reference. Optionally future work: apply `RolesGuard` globally so missing
  `@Roles()` is fail-open but every controller still benefits from
  `JwtAuthGuard`-+-Reflector wiring. Not done in v1 to keep blast radius small.

- **Risk:** Server-side `/auth/me` fetch on every `/admin` navigation adds
  latency.
  **Mitigation:** acceptable for an admin-only route; alternative is a signed
  role claim in the JWT, which is much more code and creates revocation
  problems. Revisit if admin usage grows.

- **Risk:** `notFound()` for expired tokens is confusing to admins ("page
  vanished after lunch break").
  **Mitigation:** documented behavior; admin re-auths and reloads. Refresh
  inside the gate is explicitly out of scope for v1.

## Open Questions

None blocking. Future specs will decide:

- Whether `/admin/roles` needs an audit log
- Whether `/admin/payments` shows Stripe transactions vs. just our
  `payment-note` records
- Whether announcements push to socket subscribers or just persist for pull
- The full tournament lifecycle (draft → open → live → finished)
