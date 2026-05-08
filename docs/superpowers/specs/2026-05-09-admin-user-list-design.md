# Admin User List & Role Editor — Design

**Date:** 2026-05-09
**Branch:** ARC-604
**Builds on:** ARC-602 admin shell foundation
**Status:** Approved (pending final spec review)

## Context

ARC-602 landed the `/admin` shell with `RolesGuard`, `@Roles()` decorator, and a
placeholder sidebar listing 4 future feature panels. The "Roles" item is a
disabled link.

This spec delivers the first real feature panel: a paginated list of all users
with the ability to edit any user's role inline. It also resolves the original
"change users role" ask that motivated the admin work.

### Codebase realities discovered during planning (verified)

These influence the design and override CLAUDE.md guidance where they
conflict:

- **`@nestjs/common`'s `ValidationPipe` is NOT registered globally** in
  [apps/be/src/main.ts](../../../apps/be/src/main.ts). DTOs decorated with
  `class-validator` (`@IsInt()`, `@IsIn()`, etc.) and `class-transformer`
  (`@Type(() => Number)`) silently no-op without it. Existing DTOs in the
  codebase (e.g. `apps/be/src/leaderboards/dtos/get-leaderboard.dto.ts`) are
  similarly unguarded. **Registering the global ValidationPipe is in scope
  for this PR** — small, one-line addition that enables every existing DTO,
  not just ours.
- **TanStack Query is NOT installed.** Despite CLAUDE.md guidance, the project
  uses custom hooks at
  [apps/web/src/shared/hooks/useQuery.ts](../../../apps/web/src/shared/hooks/useQuery.ts)
  and [useMutation.ts](../../../apps/web/src/shared/hooks/useMutation.ts).
  The custom `useMutation` has no `onMutate` and no shared cache; cache
  invalidation runs through
  [`useRefreshStore`](../../../apps/web/src/shared/model/useRefreshStore.ts)
  (Zustand `triggerRefresh(key)` → `useQuery({ refreshKey })`). **Do not
  install TanStack Query in this PR.** The data layer described below uses
  the existing custom hooks.
- **No `useSession` hook exists.** The simplest source of `currentUserId`
  is to take it from `requireAdmin()` (which already returns the full
  `AuthUserProfile`) in the Server Component and pass it as a prop.

## Scope

### In scope (v1)

1. Register a global `ValidationPipe` in `apps/be/src/main.ts` with
   `transform: true, whitelist: true, forbidNonWhitelisted: true` so DTOs
   actually validate.
2. `GET /admin/users` — paginated, searchable, role-filterable
3. `PATCH /admin/users/:id/role` — update a single user's role
4. `/admin/users` page — table UI with inline role dropdown, search box,
   role filter, pagination footer, role chips
5. Sidebar: rename the `'roles'` item literal to `'users'` (changes the
   sidebar `id` union type), enable it, point at `/admin/users`. Rename
   `pages.admin.nav.roles` → `pages.admin.nav.users` in all 5 locales.
6. i18n in all 5 locales for the new `pages.admin.users` namespace
7. Tests: BE unit + integration, FE Vitest, Playwright e2e for navigation +
   accessibility (not the list/edit flow itself — same Server Component
   fetch constraint as ARC-602)

### Safety rules (BE-enforced, FE mirrors)

- **Self-edit forbidden:** if `:id === requester.userId`, BE throws
  `ForbiddenException` with payload `{ code: 'SELF_ROLE_CHANGE_FORBIDDEN' }`.
  The FE disables the row's `RoleSelect` for the current user as a UX hint;
  the BE is the source of truth.
- **Last-admin protection:** demoting the only user with `role: 'admin'` is
  rejected with `ConflictException` payload
  `{ code: 'LAST_ADMIN_PROTECTED' }`.
- **No-op when role unchanged:** if `newRole === target.role`, return the
  existing `AdminUserItem` without saving (idempotent; no `updatedAt` bump).

### Out of scope (deferred)

- Audit log of role changes
- Real-time updates via socket
- Bulk multi-select role changes
- Editing fields other than role
- Cursor-based pagination
- Soft-delete / disable user
- Validation pipe coverage of pre-existing DTOs (the global registration
  benefits them, but auditing each is out of scope)

## Architecture

### Backend

```
apps/be/src/main.ts                      MODIFY: app.useGlobalPipes(new ValidationPipe(...))
apps/be/src/admin/
├── admin.module.ts                      MODIFY: register new controller + service
├── admin-users.controller.ts            NEW: GET /admin/users, PATCH /admin/users/:id/role
├── admin-users.service.ts               NEW: Mongo queries + business rules
├── admin-users.controller.spec.ts       NEW
├── admin-users.service.spec.ts          NEW
├── lib/escape-regexp.ts                 NEW: shared regex-escape helper
├── dto/
│   ├── list-admin-users.dto.ts          NEW: query DTO
│   └── update-user-role.dto.ts          NEW: body DTO
└── interfaces/
    └── admin-user.interface.ts          NEW: response shape
```

`AdminModule` (from ARC-602) already registers the `User` Mongoose model
locally, so no module-import changes are required. Add the new controller
to `controllers` and the service + escape-regexp helper to `providers` if
needed.

Both endpoints are guarded at the controller level:
`@UseGuards(JwtAuthGuard, RolesGuard) @Roles('admin')` — same pattern as
`AdminController` from ARC-602.

### Frontend

```
apps/web/src/app/admin/users/
├── page.tsx                             NEW: Server Component
└── AdminUsersClient.tsx                 NEW: 'use client'

apps/web/src/features/admin-users/
├── api.ts                               NEW: fetchAdminUsers, updateUserRole
├── hooks.ts                             NEW: useAdminUsers, useUpdateUserRole
├── hooks.test.ts                        NEW
├── lib/roleColors.ts                    NEW: ROLE_COLORS const
└── ui/
    ├── RoleBadge.tsx                    NEW
    ├── RoleSelect.tsx                   NEW
    ├── UsersTable.tsx                   NEW
    ├── UsersTableRow.tsx                NEW
    └── UsersFilters.tsx                 NEW
```

### Modified existing files

- [apps/web/src/app/admin/\_components/sidebarItems.ts](../../../apps/web/src/app/admin/_components/sidebarItems.ts):
  - Change `id` union type literal from `'roles'` → `'users'`
  - Set `href: '/admin/users'`, `enabled: true`
- All 5 locale files at
  [apps/web/src/shared/i18n/messages/pages/{en,ru,es,fr,by}.ts](../../../apps/web/src/shared/i18n/messages/pages/):
  - Rename `pages.admin.nav.roles` → `pages.admin.nav.users` (label text
    also updated to "Users" / "Пользователи" / "Usuarios" / "Utilisateurs"
    / "Карыстальнікі")
  - Add the full `pages.admin.users` namespace (see "i18n keys" below)

## BE — Endpoints

### `GET /admin/users`

Guarded by `JwtAuthGuard + RolesGuard + @Roles('admin')`.

**Query DTO** (`list-admin-users.dto.ts`):

```ts
import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { USER_ROLES, type UserRole } from '../../auth/lib/roles';

export class ListAdminUsersDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
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

The global `ValidationPipe(transform: true)` ensures `page`/`pageSize` arrive
as `number`, not string.

**Response interface** (`admin-user.interface.ts`):

```ts
import type { UserRole } from '../../auth/lib/roles';

export interface AdminUserItem {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUsersResponse {
  items: AdminUserItem[];
  total: number;
  page: number;
  pageSize: number;
}
```

**Service logic** (`admin-users.service.ts:list`):

```text
1. Build base filter:
   - { role } if role provided
2. If q non-empty:
   - escaped = escapeRegExp(q.trim())
   - AND { $or: [
       { username: { $regex: escaped, $options: 'i' } },
       { email: { $regex: escaped, $options: 'i' } },
       { displayName: { $regex: escaped, $options: 'i' } },
     ] }
3. const skip = (page - 1) * pageSize
4. Run two queries in parallel (Promise.all):
   - userModel.find(filter)
       .select('-passwordHash -referralCode -referredBy -usernameNormalized -blockedUsers')
       .sort({ createdAt: -1, _id: -1 })   // tiebreaker for stable paging
       .skip(skip).limit(pageSize).lean()
   - userModel.countDocuments(filter)
5. Map raw documents to AdminUserItem explicitly:
   { id: doc._id.toString(), email: doc.email, username: doc.username,
     displayName: doc.displayName ?? null, role: doc.role,
     createdAt: doc.createdAt.toISOString(),
     updatedAt: doc.updatedAt.toISOString() }
6. Return { items, total, page, pageSize }
```

**Why both `.select(-...)` AND explicit projection?** Defense in depth.
`.select()` keeps the wire payload small; explicit construction prevents
accidentally adding a sensitive field to the schema and shipping it.

`escapeRegExp` lives at `apps/be/src/admin/lib/escape-regexp.ts`:

```ts
export function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
```

Co-located so the unit tests in `admin-users.service.spec.ts` can import the
same function.

### `PATCH /admin/users/:id/role`

Guarded same as above.

**Body DTO** (`update-user-role.dto.ts`):

```ts
import { IsIn } from 'class-validator';
import { USER_ROLES, type UserRole } from '../../auth/lib/roles';

export class UpdateUserRoleDto {
  @IsIn(USER_ROLES)
  role!: UserRole;
}
```

**Service logic** (`admin-users.service.ts:updateRole`):

Step ordering is deliberate — checks proceed from cheapest to most
expensive. The self-check fires before the existence check because the
requester's ID came from a valid JWT for a real user; if `:id` matches,
both users are guaranteed real.

```text
1. If !Types.ObjectId.isValid(id):
   throw new BadRequestException({ code: 'INVALID_USER_ID' })

2. If id === requesterUserId:
   throw new ForbiddenException({ code: 'SELF_ROLE_CHANGE_FORBIDDEN' })

3. target = await userModel.findById(id).lean()
   if (!target):
     throw new NotFoundException({ code: 'USER_NOT_FOUND' })

4. If target.role === newRole:
   return mapToAdminUserItem(target)   // no-op, idempotent

5. If newRole !== 'admin' && target.role === 'admin':
   const otherAdminCount = await userModel.countDocuments(
     { role: 'admin', _id: { $ne: target._id } }
   )
   if (otherAdminCount === 0):
     throw new ConflictException({ code: 'LAST_ADMIN_PROTECTED' })

6. const updated = await userModel.findByIdAndUpdate(
     id,
     { $set: { role: newRole } },
     { new: true, lean: true }
   )
   return mapToAdminUserItem(updated)
```

**TOCTOU on the last-admin check (acknowledged):** between step 5's count
and step 6's update, another admin could be demoted concurrently — both
requests would see `otherAdminCount === 1` and both proceed, leaving zero
admins. Mitigation deferred to a future audit-log spec that can wrap the
check + update in a Mongo transaction (replica-set required). Acceptable
for v1 because (a) admin count is small, (b) two simultaneous demotions
of the only two admins is a vanishingly rare scenario, (c) the recovery
path is direct DB write with `mongosh`. Documented as a known risk.

### Error codes

NestJS exception classes accept an object as the response body:

```ts
throw new ForbiddenException({ code: 'SELF_ROLE_CHANGE_FORBIDDEN' });
```

Nest serializes that object as the JSON body. The FE's `apiClient.ApiError`
exposes the `data` field which contains the parsed object. **Do not** add a
controller-level catch/rethrow layer — the service throws, the controller
passes through, the global exception filter handles serialization.

Codes used:

| Code                         | HTTP | Where                      |
| ---------------------------- | ---- | -------------------------- |
| `INVALID_USER_ID`            | 400  | `:id` not a valid ObjectId |
| `SELF_ROLE_CHANGE_FORBIDDEN` | 403  | `:id === requester.userId` |
| `USER_NOT_FOUND`             | 404  | target missing             |
| `LAST_ADMIN_PROTECTED`       | 409  | demoting only admin        |

## FE — Architecture

### Page (Server Component)

`apps/web/src/app/admin/users/page.tsx`:

```tsx
import { requireAdmin } from '@/entities/session/api/requireAdmin';
import AdminUsersClient from './AdminUsersClient';

// Do NOT export `metadata` here — let the layout's noindex/nofollow inherit.

export default async function AdminUsersPage() {
  const user = await requireAdmin();
  return <AdminUsersClient currentUserId={user.id} />;
}
```

`requireAdmin()` returns the full `AuthUserProfile`. Pass only the `id`
across the Server → Client boundary (avoids serializing email/username
into the client bundle props for no reason). The layout's `metadata` is
inherited; the page intentionally exports nothing to avoid overriding
`noindex`.

### Data layer

`features/admin-users/api.ts`:

```ts
import { apiClient } from '@/shared/lib/api-client';
import type { UserRole } from '@/entities/session/model/types';

// (Verify the FE UserRole import path during implementation; if FE doesn't
// have a public UserRole export yet, add one to entities/session.)

export interface AdminUserItem {
  /* matches BE AdminUserItem */
}
export interface AdminUsersResponse {
  /* matches BE response */
}
export interface ListAdminUsersArgs {
  page?: number;
  pageSize?: number;
  q?: string;
  role?: UserRole | null;
}

export function buildAdminUsersUrl(args: ListAdminUsersArgs): string {
  const qs = new URLSearchParams();
  if (args.page) qs.set('page', String(args.page));
  if (args.pageSize) qs.set('pageSize', String(args.pageSize));
  if (args.q) qs.set('q', args.q);
  if (args.role) qs.set('role', args.role);
  const qsStr = qs.toString();
  return qsStr ? `/admin/users?${qsStr}` : '/admin/users';
}

export async function fetchAdminUsers(
  args: ListAdminUsersArgs,
  accessToken: string,
): Promise<AdminUsersResponse> {
  return apiClient.get<AdminUsersResponse>(buildAdminUsersUrl(args), {
    token: accessToken,
  });
}

export async function updateUserRole(
  userId: string,
  newRole: UserRole,
  accessToken: string,
): Promise<AdminUserItem> {
  return apiClient.patch<AdminUserItem>(
    `/admin/users/${encodeURIComponent(userId)}/role`,
    { role: newRole },
    { token: accessToken },
  );
}
```

`features/admin-users/hooks.ts` uses the **existing** custom hooks:

```ts
import { useQuery } from '@/shared/hooks/useQuery';
import { useMutation } from '@/shared/hooks/useMutation';
import { useRefreshStore } from '@/shared/model/useRefreshStore';
import { useSessionStore } from '@/entities/session/store/sessionStore';
// (Verify session store path during implementation; this is the canonical
// place where the access token lives client-side.)

const ADMIN_USERS_REFRESH_KEY = 'admin-users';

export function useAdminUsers(args: ListAdminUsersArgs) {
  const accessToken = useSessionStore((s) => s.snapshot.accessToken);
  return useQuery<AdminUsersResponse>({
    queryKey: ['admin-users', args.page, args.pageSize, args.q, args.role],
    queryFn: () => fetchAdminUsers(args, accessToken!),
    refreshKey: ADMIN_USERS_REFRESH_KEY,
    enabled: !!accessToken,
  });
}

export function useUpdateUserRole() {
  const accessToken = useSessionStore((s) => s.snapshot.accessToken);
  const triggerRefresh = useRefreshStore((s) => s.triggerRefresh);
  return useMutation<AdminUserItem, { userId: string; role: UserRole }>({
    mutationFn: ({ userId, role }) =>
      updateUserRole(userId, role, accessToken!),
    onSettled: () => triggerRefresh(ADMIN_USERS_REFRESH_KEY),
  });
}
```

**Optimistic UI** — since `useMutation` has no `onMutate` cache hook, the
optimistic effect is implemented in the `AdminUsersClient` component via
local state:

1. Component holds `localOverrides: Map<userId, UserRole>` from `useState`
2. Display merges: `displayedRole = localOverrides.get(item.id) ?? item.role`
3. On `RoleSelect` change:
   - `localOverrides.set(item.id, newRole)` immediately
   - Call `mutation.mutate({ userId, role: newRole })`
4. On `mutation.onError` (variables in scope):
   - `localOverrides.delete(variables.userId)` — rolls back
   - Surface localized error toast
5. On `mutation.onSuccess`:
   - Don't clear the override yet — wait for the refresh to bring fresh
     data, then `useEffect` clears overrides for IDs whose fresh role now
     equals the override. (A simpler v1: clear on `onSettled` after
     `triggerRefresh`; the brief flash is acceptable.)

If the optimistic logic adds substantial complexity, ship without it for
v1: the user clicks the dropdown, sees a brief loading state on the row,
then the new role appears after the refetch. The mutation hook's
`isPending` gives us per-row loading state. Spec recommends shipping
without optimistic in v1 to keep the surface area small; revisit if UX
feedback demands faster apparent response.

**v1 commitment:** ship **without** optimistic UI. Per-row spinner during
mutation; refetch on settle; user sees ~300-500ms latency. The
`localOverrides` design above is documented for a future enhancement, not
v1 scope.

### UI components

- **`RoleBadge.tsx`** — props: `role: UserRole`. Renders a Tamagui chip
  with localized label and colour from `lib/roleColors.ts`. Always shows
  text, so colour is decorative (a11y).
- **`RoleSelect.tsx`** — props: `value: UserRole, onChange, disabled,
isPending`. Renders a Tamagui-styled `<select>` (native is fine — best
  a11y by default). Verify `@arcadeum/ui` doesn't already have a `Select`
  component during implementation; if it does, prefer it.
- **`UsersTable.tsx`** — props: `items, total, page, pageSize, isLoading,
isError, currentUserId, onRoleChange, mutationState`. Renders header,
  body rows, footer. Empty states distinguish "no users in this filter"
  vs "no users at all".
- **`UsersTableRow.tsx`** — props: `item, currentUserId, onRoleChange,
isPending`. Disables `RoleSelect` when `item.id === currentUserId`
  with a tooltip via Tamagui `title` attribute.
- **`UsersFilters.tsx`** — props: `q, role, onChange`. Search input
  debounced 300ms via existing `useDebounce` hook
  ([apps/web/src/shared/hooks/useDebounce.ts](../../../apps/web/src/shared/hooks/useDebounce.ts)).
  Reset button clears both. **Clamps `pageSize`** between 1 and 200
  client-side before passing to the query (defensive — also prevents a
  user from triggering 400s by typing arbitrary values).
- **`AdminUsersClient.tsx`** — props: `currentUserId: string`. Composes
  the above. Local state: `{ page, pageSize, q, role }`. Resets `page`
  to `1` whenever any filter changes. Calls `useAdminUsers` and
  `useUpdateUserRole`.

### `lib/roleColors.ts`

```ts
import type { UserRole } from '@/entities/session/model/types';

export const ROLE_COLORS: Record<UserRole, { fg: string; bg: string }> = {
  admin: { fg: '$red9', bg: '$red3' },
  developer: { fg: '$violet9', bg: '$violet3' },
  moderator: { fg: '$orange9', bg: '$orange3' },
  vip: { fg: '$yellow9', bg: '$yellow3' },
  supporter: { fg: '$pink9', bg: '$pink3' },
  tester: { fg: '$blue9', bg: '$blue3' },
  premium: { fg: '$green9', bg: '$green3' },
  free: { fg: '$gray9', bg: '$gray3' },
};
```

A unit test asserts every `UserRole` literal has a mapping (use
`USER_ROLES.forEach`). This keeps the FE in sync if the BE adds a role.

### i18n keys (`pages.admin.users`)

- `pages.admin.users.title`
- `pages.admin.users.search.placeholder`
- `pages.admin.users.filter.role.all` — "All roles"
- `pages.admin.users.filter.role.placeholder`
- `pages.admin.users.table.username`
- `pages.admin.users.table.email`
- `pages.admin.users.table.role`
- `pages.admin.users.table.createdAt`
- `pages.admin.users.table.actions`
- `pages.admin.users.empty.noResults` — when filter excludes everything
- `pages.admin.users.empty.noUsers` — when total is zero (unfiltered)
- `pages.admin.users.pagination.prev`
- `pages.admin.users.pagination.next`
- `pages.admin.users.pagination.of` — "Page {current} of {total}"
- `pages.admin.users.role.{free|premium|vip|supporter|moderator|tester|developer|admin}` — 8 entries
- `pages.admin.users.errors.SELF_ROLE_CHANGE_FORBIDDEN`
- `pages.admin.users.errors.LAST_ADMIN_PROTECTED`
- `pages.admin.users.errors.USER_NOT_FOUND`
- `pages.admin.users.errors.INVALID_USER_ID`
- `pages.admin.users.errors.generic`
- `pages.admin.users.selfTooltip` — disabled-row reason
- `pages.admin.users.totalLabel` — "{total} users"

Plus the rename of `pages.admin.nav.roles` → `pages.admin.nav.users` in
all 5 locales (text changes from "Roles" / "Роли" / etc. to "Users" /
"Пользователи" / etc.). Real translations in every locale; no English
placeholders.

## Testing

### Backend (Jest)

`escape-regexp.spec.ts`:

- escapes `.*+?^${}()|[]\\` correctly
- leaves alphanumerics untouched
- handles empty string

`admin-users.service.spec.ts`:

- `list` returns paginated results sorted by `{ createdAt: -1, _id: -1 }`
- `list` applies `q` substring across username/email/displayName
  (case-insensitive)
- `list` escapes regex metacharacters in `q` (test with `*`, `+`, `(`)
- `list` applies `role` filter
- `list` returns correct `total` independent of pagination slice
- `list` never includes `passwordHash`, `referralCode`, `referredBy`,
  `usernameNormalized`, `blockedUsers` in items
- `updateRole` happy path returns mapped `AdminUserItem`
- `updateRole` returns existing item without saving when role unchanged
  (verify `findByIdAndUpdate` not called)
- `updateRole` rejects `INVALID_USER_ID` for malformed `:id`
- `updateRole` rejects `SELF_ROLE_CHANGE_FORBIDDEN` when ids match
- `updateRole` rejects `USER_NOT_FOUND` when target missing
- `updateRole` rejects `LAST_ADMIN_PROTECTED` when demoting only admin
- `updateRole` allows admin demotion when other admins exist
- self-check fires before existence check (test by passing same id as
  requester for a non-existent user — must get 403, not 404)

`admin-users.controller.spec.ts` (integration):

- Uses the same `.overrideGuard(JwtAuthGuard)` pattern from ARC-602's
  `admin.controller.spec.ts` so JWT validation is bypassed and we can
  exercise `RolesGuard` against a mocked `userModel`
- `GET /admin/users` 200 with valid query
- `GET /admin/users` 400 on `pageSize=999` — **crucial test that proves
  the global `ValidationPipe` is registered**
- `GET /admin/users` 403 when `RolesGuard` rejects (mock userModel returns
  non-admin)
- `PATCH /admin/users/:id/role` 200 + updated item on success
- `PATCH /admin/users/:id/role` 400 with `INVALID_USER_ID` on bad `:id`
- `PATCH /admin/users/:id/role` 400 on invalid body
- `PATCH /admin/users/:id/role` 403 with `SELF_ROLE_CHANGE_FORBIDDEN`
- `PATCH /admin/users/:id/role` 404 with `USER_NOT_FOUND`
- `PATCH /admin/users/:id/role` 409 with `LAST_ADMIN_PROTECTED`

### Frontend (Vitest)

`features/admin-users/lib/roleColors.test.ts`:

- every `UserRole` literal in `USER_ROLES` has a matching entry in
  `ROLE_COLORS`

`features/admin-users/api.test.ts`:

- `buildAdminUsersUrl` builds correct query strings for each combo
- `fetchAdminUsers` calls `apiClient.get` with the right URL + token
- `updateUserRole` calls `apiClient.patch` with the right body

`features/admin-users/hooks.test.ts`:

- `useAdminUsers` keys include all 4 args; key changes when args change
- `useAdminUsers` is `enabled: false` when no access token
- `useUpdateUserRole.onSettled` calls `triggerRefresh('admin-users')`

`features/admin-users/ui/RoleBadge.test.tsx` — renders localized label
`features/admin-users/ui/RoleSelect.test.tsx` — fires onChange; respects
disabled
`features/admin-users/ui/UsersTableRow.test.tsx` — disables RoleSelect
when `item.id === currentUserId`
`features/admin-users/ui/UsersTable.test.tsx` — empty-state branches
`features/admin-users/ui/UsersFilters.test.tsx` — debounced search
calls `onChange` after delay

`app/admin/users/AdminUsersClient.test.tsx`:

- renders error toast when mutation fails
- resets page to 1 when q/role changes
- clamps `pageSize` to [1, 200]

### Playwright e2e

`apps/web/e2e/admin-users.spec.ts`:

- Sidebar nav: `/admin` → "Users" item is enabled and clickable;
  navigation lands on `/admin/users`
- `/admin/users` returns 200 (BE not asserted; gate not asserted —
  same Server-Component-fetch-not-mockable issue from ARC-602)
- `/admin/users` HTML has `<meta name="robots" content="noindex,
nofollow">` — confirms layout metadata inherits
- robots.txt unchanged (regression pin from ARC-602 still passes)

**Deliberately not e2e'd:** the actual list/edit flow. The service +
hook unit tests are the source of truth for behavior.

## File Inventory

(See "Architecture" section above. Full deduped list:)

### New BE

- `apps/be/src/admin/admin-users.controller.ts`
- `apps/be/src/admin/admin-users.controller.spec.ts`
- `apps/be/src/admin/admin-users.service.ts`
- `apps/be/src/admin/admin-users.service.spec.ts`
- `apps/be/src/admin/lib/escape-regexp.ts`
- `apps/be/src/admin/lib/escape-regexp.spec.ts`
- `apps/be/src/admin/dto/list-admin-users.dto.ts`
- `apps/be/src/admin/dto/update-user-role.dto.ts`
- `apps/be/src/admin/interfaces/admin-user.interface.ts`

### New FE

- `apps/web/src/app/admin/users/page.tsx`
- `apps/web/src/app/admin/users/AdminUsersClient.tsx`
- `apps/web/src/app/admin/users/AdminUsersClient.test.tsx`
- `apps/web/src/features/admin-users/api.ts`
- `apps/web/src/features/admin-users/api.test.ts`
- `apps/web/src/features/admin-users/hooks.ts`
- `apps/web/src/features/admin-users/hooks.test.ts`
- `apps/web/src/features/admin-users/lib/roleColors.ts`
- `apps/web/src/features/admin-users/lib/roleColors.test.ts`
- `apps/web/src/features/admin-users/ui/RoleBadge.tsx`
- `apps/web/src/features/admin-users/ui/RoleBadge.test.tsx`
- `apps/web/src/features/admin-users/ui/RoleSelect.tsx`
- `apps/web/src/features/admin-users/ui/RoleSelect.test.tsx`
- `apps/web/src/features/admin-users/ui/UsersTable.tsx`
- `apps/web/src/features/admin-users/ui/UsersTable.test.tsx`
- `apps/web/src/features/admin-users/ui/UsersTableRow.tsx`
- `apps/web/src/features/admin-users/ui/UsersTableRow.test.tsx`
- `apps/web/src/features/admin-users/ui/UsersFilters.tsx`
- `apps/web/src/features/admin-users/ui/UsersFilters.test.tsx`
- `apps/web/e2e/admin-users.spec.ts`

### Modified

- `apps/be/src/main.ts` — register global `ValidationPipe`
- `apps/be/src/admin/admin.module.ts` — add new controller/service
- `apps/web/src/app/admin/_components/sidebarItems.ts` — `id` literal
  union changes; the `'roles'` item becomes `'users'`, enabled, with
  `href`
- `apps/web/src/shared/i18n/messages/pages/{en,ru,es,fr,by}.ts` — rename
  `nav.roles` → `nav.users`, add `pages.admin.users` namespace
- (If `UserRole` isn't currently exported from
  `@/entities/session/model/types`, add the export — verified during
  implementation)

## Risks & Mitigations

- **Global `ValidationPipe` rollout effects:** registering it enables
  every existing DTO project-wide. Existing endpoints that previously
  silently accepted invalid input might now return 400s.
  **Mitigation:** check usage of all existing DTOs (file count is small
  per `find apps/be/src -name "*.dto.ts"`) and run the existing BE test
  suite + e2e before merging. The risk is contained because most
  existing DTOs already pair with `class-validator` decorators that
  describe the intended valid input — turning the pipe on enforces the
  intent.
- **TOCTOU on last-admin check** (documented above): acceptable for v1.
- **ReDoS via `q`:** mitigated by `escapeRegExp`. Tested.
- **Offset pagination at scale:** acceptable for current user count.
- **Role colour decorative-only a11y:** `RoleBadge` always renders the
  localized text label; colour is supplemental.
- **`forbidNonWhitelisted: true` strictness:** any client sending an
  unknown query param will now get 400. Acceptable — narrow contract.
  If existing tests break, reduce to `whitelist: true` only (drops
  unknown params silently) and document the trade-off.

## Deferred to Future Specs

- Audit log of role changes
- Real-time updates via socket
- Bulk multi-select role changes
- Editing fields other than role
- Cursor-based pagination
- Soft-delete / disable user
- Export user list to CSV
- Optimistic UI for role changes (designed above as a future enhancement)
