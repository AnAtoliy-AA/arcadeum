# Admin User List & Role Editor — Design

**Date:** 2026-05-09
**Branch:** ARC-604
**Builds on:** ARC-602 admin shell foundation
**Status:** Approved (pending spec review)

## Context

ARC-602 landed the `/admin` shell with `RolesGuard`, `@Roles()` decorator, and a
placeholder sidebar listing 4 future feature panels (Roles, Payments,
Announcements, Tournaments). The "Roles" item is a disabled link.

This spec delivers the first real feature panel: a paginated list of all users
with the ability to edit any user's role inline. It also resolves the original
"change users role" request that motivated the admin work.

The admin UI is the entry point most admins will use; previously the only way
to change a role was direct DB write.

## Scope

### In scope (v1)

1. `GET /admin/users` — paginated, searchable, role-filterable
2. `PATCH /admin/users/:id/role` — update a single user's role
3. `/admin/users` page — table UI with inline role dropdown per row, search
   box, role filter, pagination footer, role chips
4. Sidebar update: rename the disabled "Roles" item to "Users", enable it,
   point at `/admin/users`
5. i18n in all 5 locales (en, ru, es, fr, by) with real translations
6. Tests: BE unit + integration, FE Vitest, Playwright e2e for navigation +
   accessibility (not the list/edit flow itself — same Server Component fetch
   constraint as ARC-602)

### Safety rules (BE-enforced, FE mirrors)

- **Self-edit forbidden:** if `:id === requester.userId`, BE returns
  `403 ForbiddenException` with code `SELF_ROLE_CHANGE_FORBIDDEN`. The FE
  disables the row for the current user as a UX hint, but the BE is the
  source of truth.
- **Last-admin protection:** demoting a user whose current role is `'admin'`
  to anything else is allowed only if at least one other admin remains.
  Otherwise BE returns `409 ConflictException` with code
  `LAST_ADMIN_PROTECTED`.

### Out of scope (deferred)

- Audit log of role changes (separate spec; this v1 has no historical record
  beyond Mongo `updatedAt`)
- Real-time updates when another admin changes a user (no socket; refetch on
  window focus only)
- Bulk multi-select / bulk role change
- Editing fields other than role (email, username, displayName)
- Pagination via cursor (offset/limit is sufficient at current user count)
- Search across regions, countries, or other future PII

## Architecture

### Backend

```
apps/be/src/admin/
├── admin-users.controller.ts    GET /admin/users, PATCH /admin/users/:id/role
├── admin-users.service.ts       Mongo queries + business rules
├── admin-users.controller.spec.ts
├── admin-users.service.spec.ts
├── dto/
│   ├── list-admin-users.dto.ts  Query DTO with class-validator
│   └── update-user-role.dto.ts  Body DTO with @IsIn(USER_ROLES)
└── interfaces/
    └── admin-user.interface.ts  Response shape
```

`AdminModule` (from ARC-602) gains `AdminUsersController` +
`AdminUsersService` in `controllers` and `providers`. The `User` model is
already registered locally in `AdminModule` from the foundation work, so no
module-import changes are required.

Both endpoints are guarded by `@UseGuards(JwtAuthGuard, RolesGuard)`

- `@Roles('admin')` at the controller level — same pattern as
  `AdminController` from ARC-602.

### Frontend

```
apps/web/src/app/admin/users/
├── page.tsx                     Server Component; calls requireAdmin() + renders client
└── AdminUsersClient.tsx         'use client'; full UI

apps/web/src/features/admin-users/
├── api.ts                       fetchAdminUsers(), updateUserRole()
├── hooks.ts                     useAdminUsers(), useUpdateUserRole()
├── hooks.test.ts
└── ui/
    ├── RoleBadge.tsx            small role-coloured chip
    ├── RoleSelect.tsx           inline dropdown (controlled)
    ├── UsersTable.tsx           the table itself
    ├── UsersTableRow.tsx        single row (split for clarity / file size)
    └── UsersFilters.tsx         search + role filter bar
```

Sidebar update: edit
[apps/web/src/app/admin/\_components/sidebarItems.ts](../../../apps/web/src/app/admin/_components/sidebarItems.ts)
to rename the `roles` item to `users` with
`href: '/admin/users', enabled: true`.

i18n: new `pages.admin.users` namespace in all 5 locale files.

## Endpoints

### `GET /admin/users`

Guarded by `JwtAuthGuard + RolesGuard + @Roles('admin')`.

**Query (validated via DTO):**

```ts
class ListAdminUsersDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(200)
  @Type(() => Number)
  pageSize?: number = 50;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  q?: string;

  @IsOptional()
  @IsIn(USER_ROLES)
  role?: UserRole;
}
```

**Response:**

```ts
interface AdminUserItem {
  id: string; // user _id as string
  email: string;
  username: string;
  displayName: string | null;
  role: UserRole;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

interface AdminUsersResponse {
  items: AdminUserItem[];
  total: number;
  page: number;
  pageSize: number;
}
```

**Mongo query:**

- Base filter: `{}` (or `{ role }` when filter set)
- When `q` is non-empty, AND with `{ $or: [
  { username: { $regex: <escaped>, $options: 'i' } },
  { email: { $regex: <escaped>, $options: 'i' } },
  { displayName: { $regex: <escaped>, $options: 'i' } },
] }`
- Sort: `{ createdAt: -1 }`
- `skip: (page - 1) * pageSize`, `limit: pageSize`
- `total`: separate `countDocuments` with the same filter
- Project `passwordHash` out of every result (defensive — never return it)

The regex value must be **escaped** to prevent ReDoS / injection.
Use a small `escapeRegExp(input)` helper.

### `PATCH /admin/users/:id/role`

**Body:**

```ts
class UpdateUserRoleDto {
  @IsIn(USER_ROLES)
  role!: UserRole;
}
```

**Logic (in `AdminUsersService.updateRole`):**

```text
1. Validate :id is a valid ObjectId — else throw BadRequestException
2. If id === requester.userId
     → throw ForbiddenException('SELF_ROLE_CHANGE_FORBIDDEN')
3. Load target user (findById)
     → if missing, throw NotFoundException
4. If newRole !== 'admin' AND target.role === 'admin':
     count = userModel.countDocuments({ role: 'admin' })
     if (count <= 1)
       → throw ConflictException('LAST_ADMIN_PROTECTED')
5. Update target.role = newRole, save
6. Return AdminUserItem
```

The error message strings double as machine-readable codes. The FE maps them
to localized toasts via i18n keys. To make this clean, the controller should
attach a `code` field to the response when known — see "Error codes" below.

### Error codes

To keep FE error handling robust, the `AdminUsersController` catches the
service-thrown exceptions and re-throws them with a structured body:

```ts
{
  statusCode: 403,
  code: 'SELF_ROLE_CHANGE_FORBIDDEN',
  message: 'You cannot change your own role.',
}
```

The codes used:

- `SELF_ROLE_CHANGE_FORBIDDEN` (403)
- `LAST_ADMIN_PROTECTED` (409)
- `INVALID_USER_ID` (400)
- `USER_NOT_FOUND` (404)

Implement using NestJS exception classes with a payload object — Nest will
serialize the object to the JSON body. The `code` field is the FE contract.

## Frontend

### Server Component (page.tsx)

```tsx
import { requireAdmin } from '@/entities/session/api/requireAdmin';
import AdminUsersClient from './AdminUsersClient';

export default async function AdminUsersPage() {
  await requireAdmin(); // defense in depth — layout already gates
  return <AdminUsersClient />;
}
```

The layout's `requireAdmin()` already gates this subtree, but calling it again
here keeps the page self-contained and resilient to future refactors. The
extra fetch is acceptable because admin pages are low-traffic.

### Data layer (`features/admin-users/`)

`api.ts`:

```ts
export async function fetchAdminUsers(
  args: ListAdminUsersArgs,
  accessToken: string,
): Promise<AdminUsersResponse>;

export async function updateUserRole(
  userId: string,
  newRole: UserRole,
  accessToken: string,
): Promise<AdminUserItem>;
```

Both use `apiClient` (existing wrapper at `@/shared/lib/api-client`) and
respect the `code` field on errors.

`hooks.ts`:

- `useAdminUsers(args)` — `useQuery` with key
  `['admin-users', args.page, args.pageSize, args.q, args.role]`,
  `staleTime: 30_000`, `refetchOnWindowFocus: true`
- `useUpdateUserRole()` — `useMutation` with optimistic updates:
  - `onMutate`: snapshot the current query cache; patch the matching item's
    `role` to the new value; return `{ previousData }` for rollback
  - `onError`: restore `previousData`, surface the toast with the localized
    error message
  - `onSettled`: invalidate `['admin-users']` so the count and any role-filter
    views resync

### UI (`features/admin-users/ui/`)

- **`UsersTable.tsx`** — accepts `items, total, page, pageSize, isLoading,
isError`. Renders the header row, body rows, footer pagination. Empty
  state when `items.length === 0` (different message for "no users in this
  filter" vs "no users at all"). Loading skeleton uses existing
  `@arcadeum/ui` skeleton primitive.
- **`UsersTableRow.tsx`** — receives `item, currentUserId, onRoleChange`.
  When `item.id === currentUserId`, the role select is rendered disabled
  with a tooltip explaining why ("can't edit your own role").
- **`RoleBadge.tsx`** — small chip; colour comes from a per-role mapping
  in `RoleBadge.tsx` (use existing Tamagui tokens):
  - admin → `$red9` text on `$red3` background
  - developer → `$violet9`/`$violet3`
  - moderator → `$orange9`/`$orange3`
  - vip → `$yellow9`/`$yellow3`
  - supporter → `$pink9`/`$pink3`
  - tester → `$blue9`/`$blue3`
  - premium → `$green9`/`$green3`
  - free → `$gray9`/`$gray3`
- **`RoleSelect.tsx`** — controlled select bound to a row. On change, calls
  `onRoleChange(newRole)`. Uses `@arcadeum/ui`'s existing `Select` if
  available; otherwise a native `<select>` styled with Tamagui (preferred
  for accessibility — keyboard, screen-reader). Verify component exists
  during implementation; the plan documents the fallback.
- **`UsersFilters.tsx`** — search input (debounced 300ms with `useDebounce`)
  and role filter dropdown. Reset button clears both.
- **`AdminUsersClient.tsx`** — composes the above. Reads `currentUserId`
  from a session hook (existing `useSession` or equivalent — verified
  during implementation; if not, the BE response could include a `me`
  echo, but the simpler path is the FE already has it from cookie/JWT
  decoding via existing hooks).

If any leaf file approaches 200 lines, split. The 500-line ceiling is
enforced by `pnpm check-file-length`.

### State sketch

```text
AdminUsersClient
├── filters (page, pageSize=50, q, role) — local useState
├── debouncedQ (q debounced 300ms) — useDebounce
├── { data, isLoading, error } = useAdminUsers({ page, pageSize, q: debouncedQ, role })
├── mutation = useUpdateUserRole()
└── Renders:
    ├── UsersFilters
    ├── UsersTable
    └── ErrorToast (when mutation.isError)
```

When the user changes any filter, reset `page` to `1`. Pagination footer
exposes prev/next and a numeric jumper for pages within `±2` of current.

### i18n keys (`pages.admin.users`)

Minimum:

- `pages.admin.users.title`
- `pages.admin.users.search.placeholder`
- `pages.admin.users.filter.role.all`
- `pages.admin.users.filter.role.placeholder`
- `pages.admin.users.table.username`
- `pages.admin.users.table.email`
- `pages.admin.users.table.role`
- `pages.admin.users.table.createdAt`
- `pages.admin.users.table.actions`
- `pages.admin.users.empty.noResults`
- `pages.admin.users.empty.noUsers`
- `pages.admin.users.pagination.prev`
- `pages.admin.users.pagination.next`
- `pages.admin.users.pagination.of` ("Page {current} of {total}")
- `pages.admin.users.role.{free|premium|vip|supporter|moderator|tester|developer|admin}`
- `pages.admin.users.errors.SELF_ROLE_CHANGE_FORBIDDEN`
- `pages.admin.users.errors.LAST_ADMIN_PROTECTED`
- `pages.admin.users.errors.USER_NOT_FOUND`
- `pages.admin.users.errors.generic`
- `pages.admin.users.selfTooltip`
- `pages.admin.users.totalLabel` ("{total} users")

Real translations in all 5 locales. Same standard as ARC-602's i18n.

## Testing

### Backend (Jest)

`admin-users.service.spec.ts`:

- list returns paginated results sorted by createdAt desc
- list applies `q` substring match across username/email/displayName
  (case-insensitive)
- list applies `role` filter
- list returns correct `total` independent of pagination
- list `total` matches actual filtered count
- regex search escapes special characters in `q` (verify by passing `*` or `+`)
- `passwordHash` is never present in returned items
- `updateRole` happy path
- `updateRole` rejects self-edit (matches `requester.userId`)
- `updateRole` rejects last-admin demotion when count is 1
- `updateRole` allows admin demotion when other admins exist
- `updateRole` throws `NotFoundException` on missing user
- `updateRole` throws `BadRequestException` on invalid ObjectId

`admin-users.controller.spec.ts` (integration):

- `GET /admin/users` returns 200 with valid query
- `GET /admin/users` returns 400 on invalid query (e.g. `pageSize=999`)
- `GET /admin/users` returns 401 with no token (uses overrideGuard pattern
  from ARC-602 — note this validates the wiring, not real Passport)
- `GET /admin/users` returns 403 for non-admin role
- `PATCH /admin/users/:id/role` returns 200 + updated item on success
- `PATCH /admin/users/:id/role` returns 400 on invalid `:id`
- `PATCH /admin/users/:id/role` returns 400 on invalid body
- `PATCH /admin/users/:id/role` returns 403 with code
  `SELF_ROLE_CHANGE_FORBIDDEN` when self-editing
- `PATCH /admin/users/:id/role` returns 404 when user missing
- `PATCH /admin/users/:id/role` returns 409 with code `LAST_ADMIN_PROTECTED`
  when demoting the only admin

### Frontend (Vitest)

`features/admin-users/hooks.test.ts`:

- `useAdminUsers` calls API with the right query string for each filter
- `useAdminUsers` re-fetches when filters change (key changes)
- `useUpdateUserRole` patches cache optimistically on `onMutate`
- `useUpdateUserRole` rolls back cache on `onError`
- `useUpdateUserRole` invalidates the list on `onSettled`

UI components (Vitest + RTL):

- `RoleBadge` renders the localized role label and applies the colour
  mapping
- `RoleSelect` fires `onRoleChange` with the new role and is `disabled`
  when prop is set
- `UsersTableRow` renders a disabled `RoleSelect` when
  `item.id === currentUserId`
- `UsersTable` renders empty-state for empty `items`
- `UsersTable` distinguishes "no results" vs "no users" empty state
- `AdminUsersClient` renders error toast when mutation fails

### Playwright e2e

`apps/web/e2e/admin-users.spec.ts`:

- `/admin/users` route exists and returns the page (mock `/auth/me` admin
  via inline route override, same pattern as ARC-602)
- Sidebar nav from `/admin` to `/admin/users` works
- The Users sidebar item is no longer disabled
- Page has `noindex` meta (inherited from layout)

**Deliberately not e2e'd:** the actual list rendering and the role-edit
mutation. Same Server-Component-fetch-not-mockable issue as ARC-602; the
unit + integration tests above cover the behavior end-to-end at the
function level.

## File Inventory

### New (BE)

- `apps/be/src/admin/admin-users.controller.ts`
- `apps/be/src/admin/admin-users.service.ts`
- `apps/be/src/admin/admin-users.controller.spec.ts`
- `apps/be/src/admin/admin-users.service.spec.ts`
- `apps/be/src/admin/dto/list-admin-users.dto.ts`
- `apps/be/src/admin/dto/update-user-role.dto.ts`
- `apps/be/src/admin/interfaces/admin-user.interface.ts`

### New (FE)

- `apps/web/src/app/admin/users/page.tsx`
- `apps/web/src/app/admin/users/AdminUsersClient.tsx`
- `apps/web/src/features/admin-users/api.ts`
- `apps/web/src/features/admin-users/hooks.ts`
- `apps/web/src/features/admin-users/hooks.test.ts`
- `apps/web/src/features/admin-users/ui/RoleBadge.tsx`
- `apps/web/src/features/admin-users/ui/RoleSelect.tsx`
- `apps/web/src/features/admin-users/ui/UsersTable.tsx`
- `apps/web/src/features/admin-users/ui/UsersTableRow.tsx`
- `apps/web/src/features/admin-users/ui/UsersFilters.tsx`
- `apps/web/e2e/admin-users.spec.ts`

### Modified

- `apps/be/src/admin/admin.module.ts` — register
  `AdminUsersController` + `AdminUsersService`
- `apps/web/src/app/admin/_components/sidebarItems.ts` — rename `roles`
  item to `users`, set `enabled: true`, set `href: '/admin/users'`
- `apps/web/src/shared/i18n/messages/pages/{en,ru,es,fr,by}.ts` — add
  `pages.admin.users` namespace

### Unchanged but relied on

- `apps/be/src/auth/guards/roles.guard.ts` (ARC-602)
- `apps/be/src/auth/guards/roles.decorator.ts` (ARC-602)
- `apps/web/src/entities/session/api/requireAdmin.ts` (ARC-602)
- `apps/web/src/app/admin/layout.tsx` (ARC-602) — already gates this subtree

## Risks & Mitigations

- **Race on concurrent role updates:** two admins editing the same user
  simultaneously. Last write wins. v1 acceptable; future audit log spec
  makes this debuggable.
- **ReDoS via `q`:** mitigated by escaping all regex metacharacters before
  use. Tested.
- **Performance at scale:** offset/limit on a large `users` collection slows
  with high page numbers. Current population is small. Future spec can swap
  to cursor-based pagination if needed.
- **`passwordHash` leak:** mitigated with explicit projection in every
  query and a unit test asserting it's never present.
- **i18n drift:** translations diverge across locales over time. The
  `pnpm check-translations` script catches missing keys; periodic
  copy-review by a native speaker is out of scope.
- **Role colour mapping accessibility:** colour-only signal is poor for
  colour-blind users. The `RoleBadge` always shows the role label as text,
  so colour is decorative.

## Deferred to Future Specs

- Audit log of role changes (who/when/from/to)
- Real-time list updates via socket
- Bulk multi-select role changes
- Admin-side editing of email/username/displayName
- Cursor-based pagination
- Soft-delete / disable user
- Export user list to CSV
