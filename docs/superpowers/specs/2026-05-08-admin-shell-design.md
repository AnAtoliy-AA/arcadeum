# Admin Shell — Design

**Date:** 2026-05-08
**Branch:** ARC-602
**Status:** Approved (pending final spec review)

## Context

The user wants an admin page that will eventually let staff start tournaments,
edit user roles, broadcast announcements, and view payment history. The page
must not be indexed by search engines.

The codebase today has:

- `User.role` with `admin` already in `USER_ROLES`
  ([apps/be/src/auth/lib/roles.ts](../../../apps/be/src/auth/lib/roles.ts),
  [apps/be/src/auth/schemas/user.schema.ts](../../../apps/be/src/auth/schemas/user.schema.ts))
- `JwtAuthGuard` and `GET /auth/me`
  ([apps/be/src/auth/auth.controller.ts](../../../apps/be/src/auth/auth.controller.ts))
  but **no** `RolesGuard` / `@Roles()` decorator and **no** admin endpoints.
  Important: `JwtStrategy.validate()` returns
  `AuthenticatedUser = { userId, email, username }` — **no `role` field** on
  `req.user`. The admin gate must therefore read role from the DB, not from
  the JWT.
- `getServerAccessToken()` for reading the auth cookie in Server Components
  ([apps/web/src/entities/session/api/serverTokens.ts](../../../apps/web/src/entities/session/api/serverTokens.ts))
- `fetchProfile(accessToken)` already typed `Promise<AuthUserProfile>` in
  [apps/web/src/entities/session/api/authApi.ts](../../../apps/web/src/entities/session/api/authApi.ts)
- `robots.ts` already disallows `/admin/`
  ([apps/web/src/app/robots.ts](../../../apps/web/src/app/robots.ts))
- `@arcadeum/ui` exports `Container`, `GlassCard`, `XStack`, `YStack`,
  `PageLayout`, `Typography` (verified in
  [packages/ui/src/index.ts](../../../packages/ui/src/index.ts)). No new
  shared components needed for this spec.
- A static "coming soon" `/tournaments` page; no tournaments backend
- A `payment-note` schema with paginated `getNotes`; no full payment-history
  persistence
- No announcements / notifications module
- Locale files at `apps/web/src/shared/i18n/messages/pages/{en,ru,es,fr,by}.ts`

## Scope

This spec covers **only the admin shell foundation**. Each future feature
(role editor, payments history, announcements, tournaments) will get its own
spec → plan → implementation cycle and slot into the shell defined here.

### In scope (v1)

1. Reusable `RolesGuard` + `@Roles()` decorator on the backend, with the
   guard performing a DB lookup to resolve the current user's role
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
- Per-section role gating (e.g. moderators getting partial access). Note:
  `RolesGuard` accepts a variadic `...roles: UserRole[]` so future specs can
  add `@Roles('moderator', 'admin')` without changing the guard. This is
  intentional foundation, not premature generalization.
- Audit logging of admin actions
- Adding `role` to the JWT payload (would require token rotation; we do a
  fresh DB lookup instead)

## Architecture

### Routing

```
apps/web/src/app/admin/
├── layout.tsx            Server Component: calls requireAdmin(), exports noindex metadata
├── page.tsx              Landing dashboard inside the shell (placeholder for v1)
├── error.tsx             'use client' Client Component (Next.js requirement) — local error boundary
├── not-found.tsx         Renders the same neutral "Page not found" as the global 404
└── AdminLayoutClient.tsx 'use client' — Tamagui shell (sidebar + content slot)

apps/web/src/app/admin/_components/
└── sidebarItems.ts       Static config for the 4 future-section nav items (kept tiny)
```

### Backend module

```
apps/be/src/admin/
├── admin.controller.ts        GET /admin/ping → { ok: true }, guarded
├── admin.module.ts            Imports AuthModule (for JwtAuthGuard) and User model
└── admin.controller.spec.ts

apps/be/src/auth/guards/
├── roles.constants.ts         export const ROLES_KEY = 'roles'
├── roles.decorator.ts         @Roles(...roles: UserRole[]) via SetMetadata(ROLES_KEY, roles)
├── roles.guard.ts             Reflector-based, looks up user in DB to read role
└── roles.guard.spec.ts
```

`AdminModule` is registered in
[apps/be/src/app.module.ts](../../../apps/be/src/app.module.ts).

`AdminModule` imports:

- `AuthModule` — strictly speaking optional, since `JwtModule` is registered
  with `global: true` in `AuthModule` so `JwtAuthGuard`/the JWT strategy
  resolves from anywhere. We import it for explicitness and to keep the
  module's dependencies legible.
- `MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])` —
  required for the `RolesGuard` DB lookup. **Register the User model locally
  in `AdminModule`**; do not attempt to re-export it from `AuthModule`. This
  matches the convention already used by `payments.module.ts`,
  `chat.module.ts`, `referrals/referral.module.ts`, and `games/games.module.ts`.

### Shared FE helper

```
apps/web/src/entities/session/api/
├── requireAdmin.ts        Server-only: reads cookie, fetches /auth/me, returns AuthUserProfile or notFound()
└── requireAdmin.test.ts
```

## Data Flow

**Gate flow in `apps/web/src/app/admin/layout.tsx`:**

```text
1. user = await requireAdmin()       // throws notFound() on any failure
2. render <AdminLayoutClient username={user.username}>{children}</AdminLayoutClient>
```

(Pass only `username` across the Server → Client boundary, not the full
`AuthUserProfile` — see `AdminLayoutClient` Components section.)

**`requireAdmin()` internals (returns `AuthUserProfile`):**

```text
1. token = await getServerAccessToken()
2. if (!token) → notFound()
3. try {
     res = await fetch(resolveApiUrl('/auth/me'), {
       headers: { Authorization: `Bearer ${token}` },
       cache: 'no-store',
     })
   } catch { → notFound() }            // network errors collapse to 404 too
4. if (!res.ok) → notFound()           // 401 expired, 5xx — same outcome
5. user = (await res.json()) as AuthUserProfile
6. if (user.role !== 'admin') → notFound()
7. return user
```

`requireAdmin()` does **not** reuse `fetchProfile()` because that helper
throws on non-2xx and lacks `cache: 'no-store'`. We could extend `fetchProfile`
to accept options, but doing so changes its public surface for callers we
don't need to touch. Inlining a small server-side fetch keeps blast radius
contained. The response is typed via the existing `AuthUserProfile` type.
The URL is built via the already-public `resolveApiUrl(path)` helper from
`@/shared/lib/api-base` — do **not** import the module-private `api()` from
`authApi.ts`, and do not duplicate URL-joining logic.

**Backend `RolesGuard` flow:**

```text
1. JwtAuthGuard runs   → populates req.user = { userId, email, username }, 401 if invalid
2. RolesGuard runs:
   a. required = reflector.getAllAndOverride(ROLES_KEY, [handler, class])
   b. if (!required || required.length === 0) return true   // fall-open
   c. if (!req.user?.userId) throw ForbiddenException()
   d. user = await this.userModel.findById(req.user.userId).select('role').lean()
   e. if (!user) throw ForbiddenException()
   f. return required.includes(user.role)   // false → throws ForbiddenException
3. Handler executes
```

The DB lookup is acceptable because:

- It only runs on routes that opt in via `@Roles()` (admin/staff routes —
  low-frequency by definition)
- It guarantees role changes take effect immediately (no token rotation)
- It avoids JWT schema migration

`RolesGuard` is **not** registered globally in `APP_GUARD` for v1. It is
applied per-controller via `@UseGuards(JwtAuthGuard, RolesGuard)` on
`AdminController`. Future specs may register it globally when more controllers
need it; that decision is deferred.

### Key design choices

- **Single failure mode = 404.** Every non-admin path (no token, expired
  token, BE down, network throw, role !== admin) collapses to `notFound()`.
  No information leak about whether the user is signed in or whether the
  route exists. Pairs with `robots.ts` `Disallow: /admin/`.
- **`cache: 'no-store'`** on the role check. Role can change; never cache
  "you are admin".
- **No token refresh inside the gate.** Refresh lives on the client. Expired
  access tokens fall through to `notFound()`; the user re-authenticates
  normally and tries again.
- **`RolesGuard` falls open when `@Roles()` is absent.** Lets the guard
  eventually be applied broadly without breaking unannotated routes. v1 only
  applies it on `AdminController`; the fall-open behavior is foundation for
  later.
- **FE gate is UX, BE guard is the security boundary.** Every admin BE
  endpoint must use `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles('admin')`
  — that's the real defense. The FE gate just avoids shipping a 403-then-
  redirect UX.
- **Server Component for the gate.** No client flash; no admin HTML shipped
  to non-admins; SEO-safe by construction.
- **Two layers of no-index** — `robots.ts` (already in place) plus per-page
  `metadata.robots = { index: false, follow: false }` on the admin layout.

## Components

### `RolesGuard` (`apps/be/src/auth/guards/roles.guard.ts`)

```ts
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { UserRole } from '../lib/roles';
import { AuthenticatedUser } from '../jwt/jwt.strategy';
import { ROLES_KEY } from './roles.constants';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<UserRole[] | undefined>(
      ROLES_KEY,
      [ctx.getHandler(), ctx.getClass()],
    );
    if (!required || required.length === 0) return true;

    const req = ctx.switchToHttp().getRequest<{ user?: AuthenticatedUser }>();
    const userId = req.user?.userId;
    if (!userId) throw new ForbiddenException();

    const user = await this.userModel
      .findById(userId)
      .select('role')
      .lean<{ role: UserRole } | null>();
    if (!user) throw new ForbiddenException();
    return required.includes(user.role);
  }
}
```

### `roles.constants.ts` (`apps/be/src/auth/guards/roles.constants.ts`)

```ts
export const ROLES_KEY = 'roles';
```

### `@Roles()` decorator (`apps/be/src/auth/guards/roles.decorator.ts`)

```ts
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
```

### `AdminController` (`apps/be/src/admin/admin.controller.ts`)

```ts
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  @Get('ping')
  ping(): { ok: true } {
    return { ok: true };
  }
}
```

### `requireAdmin()` (`apps/web/src/entities/session/api/requireAdmin.ts`)

Server-only helper. Encapsulates the gate flow above. Returns the typed
`AuthUserProfile` so consumers can use the user without a second fetch.

### `AdminLayoutClient` (`apps/web/src/app/admin/AdminLayoutClient.tsx`)

`'use client'` (Tamagui requires it).

**Server → Client boundary:** the layout is a Server Component that calls
`requireAdmin()` and gets a full `AuthUserProfile`. It must pass **only
`{ username: string }`** to `AdminLayoutClient`, not the whole profile —
the greeting only needs the username, and we don't want `email`/`id`
serialized into the client bundle. Component prop type:

```ts
interface AdminLayoutClientProps {
  username: string;
  children: React.ReactNode;
}
```

Renders:

- A two-column layout using `@arcadeum/ui`: `PageLayout` → `Container` →
  `XStack` with a sidebar `YStack` and a content `YStack`
- Sidebar items pulled from `_components/sidebarItems.ts`: Dashboard
  (active), Roles, Payments, Announcements, Tournaments — all but Dashboard
  are visually disabled with a "coming soon" caption
- A simple greeting strip: "Signed in as `<username>`". **No role badge** in
  v1 (only admins reach this page; the badge is redundant). Avoids extra i18n
  keys and a new `RoleBadge` component.
- Children rendered in the content column

If `AdminLayoutClient.tsx` exceeds 200 lines, split the sidebar into its own
`AdminSidebar.tsx`. The 500-line ceiling enforced by `pnpm check-file-length`
must be respected.

### `/admin/page.tsx`

Minimal landing dashboard. v1 content: a `GlassCard` with a welcome heading
and a short note that feature panels will appear here as they ship. No live
data.

### `/admin/error.tsx`

```tsx
'use client';

export default function AdminError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  // Renders a localized "Something went wrong" card with a retry button.
}
```

(`'use client'` is mandatory — Next.js requires error boundaries to be
Client Components.)

### `/admin/not-found.tsx`

Renders the same neutral 404 the rest of the site uses (or a minimal local
copy if no shared 404 component exists). Critical: it must look identical to
the global 404 to a non-admin viewer — no admin chrome, no admin nav. The
Playwright tests assert on this.

## i18n

New `pages.admin` namespace. Minimum keys for v1:

- `pages.admin.title` — "Admin"
- `pages.admin.welcome` — heading on the landing page
- `pages.admin.welcomeBody` — short description
- `pages.admin.signedInAs` — "Signed in as {username}"
- `pages.admin.nav.dashboard`
- `pages.admin.nav.roles`
- `pages.admin.nav.payments`
- `pages.admin.nav.announcements`
- `pages.admin.nav.tournaments`
- `pages.admin.nav.comingSoon` — caption shown next to disabled items
- `pages.admin.error.title`
- `pages.admin.error.body`
- `pages.admin.error.retry`

Add to all 5 locale files at
`apps/web/src/shared/i18n/messages/pages/{en,ru,es,fr,by}.ts`.

## Testing

### Backend (Jest)

`roles.guard.spec.ts`:

- allows when DB lookup returns a role matching one of `@Roles(...)`
- denies (`ForbiddenException`) when the DB role doesn't match
- denies (`ForbiddenException`) when DB lookup returns null (deleted user)
- falls open (allows, no DB lookup) when no `@Roles()` metadata is present
- denies when `req.user` is missing (defensive — should be unreachable
  behind `JwtAuthGuard`)
- mocks the `userModel` so the spec is a pure unit test (no real DB)

`admin.controller.spec.ts` (Nest test module integration):

- 401 with no token (real `JwtAuthGuard`)
- 403 with token for non-admin user (e.g. `developer`, `moderator`)
- 403 with valid admin-issued token but the user record was deleted
  between token issuance and the request (mocked `userModel.findById`
  returns null) — exercises both guards in sequence
- 200 `{ ok: true }` with admin token

The spec uses Nest's `Test.createTestingModule` with the real guards, JWT
secret resolved via `resolveJwtSecret(config)` (test value), and a mocked
`userModel` so role lookups are deterministic. The pattern matches existing
auth-touching specs (e.g. `chat.controller.spec.ts`).

### Frontend unit (Vitest)

`requireAdmin.test.ts` — mocks `next/headers#cookies` and `fetch`:

- calls `notFound()` when no token cookie is present
- calls `notFound()` when `fetch` throws (network error)
- calls `notFound()` when `/auth/me` returns 401
- calls `notFound()` when `/auth/me` returns 5xx
- calls `notFound()` when role is `free`, `developer`, `moderator`,
  `supporter`, `vip`, `premium`, or `tester`
- returns the typed `AuthUserProfile` when role is `admin`

### Frontend e2e (Playwright)

`apps/web/e2e/admin.spec.ts`:

- **Anonymous user navigates to `/admin`** → `not-found.tsx` rendered
  (assert visible "Page not found" text and absence of admin sidebar)
- **Logged-in non-admin user** → same not-found page
- **Logged-in admin user** → admin shell visible (sidebar + welcome card)
- **SEO:** `<meta name="robots" content="noindex, nofollow">` present on
  `/admin` HTML
- **`GET /robots.txt`** includes `Disallow: /admin/` (regression pin)
- **`GET /sitemap.xml`** does NOT contain `/admin` (regression pin)

**Admin user fixture:** the e2e suite needs a way to log in as an admin.
The existing `apps/web/e2e/fixtures/test-utils.ts` provides login helpers
for normal users, but no admin role is seeded. Add to v1:

- A small fixture helper `loginAsAdmin(page)` in
  `apps/web/e2e/fixtures/test-utils.ts` (or a new
  `apps/web/e2e/fixtures/admin-utils.ts`) that:
  1. Calls a test-only BE seed endpoint **OR** uses an existing test user
     promoted via direct DB write **OR** depends on a seeded admin in the
     test environment.
- Choice between (1)/(2)/(3) is implementation detail, but the spec mandates
  **one** of the following be true before the e2e is written:
  - The BE has a documented test-only mechanism for setting a user's role
    (e.g. `apps/be/test/seed.ts` or an existing fixture script)
  - OR the test environment is seeded with one known admin user whose
    credentials are read from env vars

If neither exists, the implementation plan must add a minimal seed step.
Document the chosen approach in the e2e file's header comment.

### Out of scope for v1 tests

- Behavior of disabled sidebar links — their target features own those tests
- Load/perf tests on the gate — one cheap fetch + DB lookup per `/admin`
  navigation

## File Inventory

### New files

**Backend:**

- `apps/be/src/auth/guards/roles.constants.ts`
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
- `apps/web/src/app/admin/not-found.tsx`
- `apps/web/src/app/admin/AdminLayoutClient.tsx`
- `apps/web/src/app/admin/_components/sidebarItems.ts`
- `apps/web/e2e/admin.spec.ts`
- (Maybe) `apps/web/e2e/fixtures/admin-utils.ts` — see Testing → fixture
  section

### Modified files

- `apps/be/src/app.module.ts` — register `AdminModule`
- `apps/web/src/shared/i18n/messages/pages/{en,ru,es,fr,by}.ts` — add
  `pages.admin` namespace in all 5 locales
- (If chosen) `apps/web/e2e/fixtures/test-utils.ts` — add `loginAsAdmin`

### Unchanged but relied upon

- `apps/web/src/app/robots.ts` — already disallows `/admin/`
- `apps/web/src/app/sitemap.ts` — does not list `/admin`; the e2e regression
  pins this
- `apps/be/src/auth/auth.module.ts` — exports the JWT plumbing

## Risks & Mitigations

- **Risk:** Future admin sub-routes forget to add `@UseGuards(JwtAuthGuard,
RolesGuard)` to their controllers.
  **Mitigation:** the `AdminController` is the reference implementation;
  `JwtAuthGuard, RolesGuard` together is the canonical incantation.
  Future spec may switch to a global guard registration in `APP_GUARD`.

- **Risk:** Server-side `/auth/me` fetch + DB lookup on every `/admin`
  navigation adds latency.
  **Mitigation:** acceptable for an admin-only route. If admin usage grows,
  revisit by caching the role in a short-TTL signed cookie or by adding it
  to the JWT payload (with token-rotation cost).

- **Risk:** `notFound()` for expired tokens is confusing to admins ("page
  vanished after lunch break").
  **Mitigation:** documented behavior; admin re-auths and reloads. Refresh
  inside the gate is explicitly out of scope for v1.

- **Risk:** The DB lookup in `RolesGuard` introduces a Mongoose dependency
  to anything that imports the guard.
  **Mitigation:** every module that uses `RolesGuard` must register the
  User model locally via `MongooseModule.forFeature(...)` (same pattern as
  every existing domain module). The guard does **not** rely on
  `AuthModule` re-exporting the model — `AuthModule` does not currently do
  that, and the v1 spec deliberately does not change `AuthModule`. If
  adoption grows, a future spec may either move the User-model registration
  into a shared `UsersModule` or have `AuthModule` re-export it; that's a
  follow-up decision.

## Deferred to Future Specs

- Whether `/admin/roles` needs an audit log of role changes
- Whether `/admin/payments` shows raw Stripe transactions vs. just our
  `payment-note` records
- Whether announcements push to socket subscribers or just persist for pull
- The full tournament lifecycle (draft → open → live → finished)
- Whether `RolesGuard` should be promoted to a global guard via `APP_GUARD`
