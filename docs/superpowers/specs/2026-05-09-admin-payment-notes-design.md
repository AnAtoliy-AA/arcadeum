# Admin Payment Notes Viewer — Design

**Date:** 2026-05-09
**Branch:** ARC-607
**Builds on:** ARC-602 (admin shell), ARC-604 (admin users + global ValidationPipe + apiClient.patch)
**Status:** Approved (pending spec review)

## Context

The admin shell from ARC-602 left four placeholder sidebar items: Roles
(now Users — shipped via ARC-604), Payments, Announcements, Tournaments.
This spec ships the Payments item.

What "payments" actually means in this codebase today:

- `payments-notes` collection (`apps/be/src/payments/schemas/payment-note.schema.ts`)
  stores user-attached notes about payments — typically a thank-you blurb,
  amount, currency, optional displayName, and a Stripe `transactionId`
  reference.
- The public-facing `/notes` page reads via `GET /payments/notes` which
  filters to `isPublic: true`.
- There is **no** persisted record of actual Stripe charges, refunds, or
  failures. Stripe sessions are created at checkout but the resulting
  transactions are not stored in MongoDB.

This spec ships an **admin-only viewer** for the existing payment-notes
collection that surfaces both public and private records, plus the
`transactionId` and `isPublic` fields the public endpoint hides. It does
not add Stripe transaction persistence — that's a separate, larger spec
(see Deferred section).

## Scope

### In scope (v1)

1. New endpoint `GET /admin/payments/notes` (admin-guarded), paginated
   list with optional free-text search and visibility filter.
2. New page `/admin/payments` rendering a table of all notes.
3. Sidebar's `payments` item flipped from disabled placeholder to an
   enabled link to `/admin/payments`.
4. i18n in all 5 locales for the new `pages.admin.payments` namespace
   (using real translations, not English placeholders).
5. Tests: BE service unit + controller integration, FE Vitest (api,
   hooks, table component), Playwright e2e SEO regression pin.

### Safety rules

- Endpoint is guarded `@UseGuards(JwtAuthGuard, RolesGuard) @Roles('admin')`
  at the controller level — same pattern as `AdminUsersController`.
- Response strips `passwordHash` and other sensitive User fields from the
  enriched display name. This is implicit because the existing
  `payment-notes.service.ts` only `.select('_id displayName username')`
  on the User join — confirmed during planning.

### Out of scope (deferred)

- Live Stripe API fetcher (real charges, refunds, disputes)
- Persisted Stripe webhook events (new collection, signature
  verification, idempotency)
- Modifying / deleting notes from the admin (read-only v1)
- Per-user filter beyond free-text search
- CSV export
- Date-range filter

## Architecture

### Backend

```
apps/be/src/payments/
├── admin-payment-notes.controller.ts          NEW: GET /admin/payments/notes
├── admin-payment-notes.controller.spec.ts     NEW: integration tests
├── payment-notes.service.ts                   MODIFY: add listForAdmin()
├── payment-notes.service.admin.spec.ts        NEW: unit tests for listForAdmin
├── dto/
│   └── list-admin-notes.dto.ts                NEW: query DTO
├── interfaces/
│   └── admin-payment-note.interface.ts        NEW: response shape
└── payments.module.ts                         MODIFY: register new controller
```

`PaymentsModule` already registers `User` and `PaymentNote` Mongoose
models (verified). `RolesGuard` is exported via `AuthModule` /
`AdminModule`-pattern; `PaymentsModule` will need to add `RolesGuard` to
its providers and `MongooseModule.forFeature([User])` is already there.

The controller imports `JwtAuthGuard` from `../auth/jwt/jwt.guard` and
`RolesGuard` + `@Roles` from `../auth/guards/`. Same pattern as
`AdminController` and `AdminUsersController`.

### Frontend

```
apps/web/src/app/admin/payments/
├── page.tsx                       NEW: Server Component
└── AdminPaymentsClient.tsx        NEW: 'use client' shell

apps/web/src/features/admin-payments/
├── api.ts                         NEW: fetchAdminPaymentNotes()
├── api.test.ts                    NEW
├── hooks.ts                       NEW: useAdminPaymentNotes()
├── hooks.test.ts                  NEW
└── ui/
    ├── AdminPaymentsFilters.tsx   NEW: search + visibility filter
    ├── AdminPaymentsTable.tsx     NEW: rows + pagination
    └── AdminPaymentsTable.test.tsx
```

### Modified existing files

- `apps/web/src/app/admin/_components/sidebarItems.ts` — flip the
  `payments` entry to `{ id: 'payments', href: '/admin/payments',
enabled: true }`.
- `apps/web/src/shared/i18n/messages/pages/{en,ru,es,fr,by}.ts` — add
  the `pages.admin.payments` namespace.

## BE — Endpoint

### `GET /admin/payments/notes`

Guarded by `JwtAuthGuard + RolesGuard + @Roles('admin')`.

**Query DTO** (`list-admin-notes.dto.ts`):

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

export type AdminNotesVisibility = 'public' | 'private' | 'all';
export const ADMIN_NOTES_VISIBILITY: AdminNotesVisibility[] = [
  'public',
  'private',
  'all',
];

export class ListAdminNotesDto {
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
  @IsIn(ADMIN_NOTES_VISIBILITY)
  visibility?: AdminNotesVisibility = 'all';
}
```

**Response interface** (`admin-payment-note.interface.ts`):

```ts
export interface AdminPaymentNoteItem {
  id: string;
  note: string;
  amount: number;
  currency: string;
  displayName: string | null;
  createdAt: string; // ISO
  transactionId: string;
  isPublic: boolean;
  userId: string | null; // null when the note was anonymous
}

export interface AdminPaymentNotesResponse {
  items: AdminPaymentNoteItem[];
  total: number;
  page: number;
  pageSize: number;
}
```

**Lean document type** (declared in `payment-notes.service.ts` next to
the new method to avoid `as unknown as` casts):

```ts
import type { Types } from 'mongoose';

interface LeanPaymentNote {
  _id: Types.ObjectId;
  note: string;
  amount: number;
  currency: string;
  userId?: Types.ObjectId | null;
  displayName?: string | null;
  transactionId: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

**Service method** (`payment-notes.service.ts:listForAdmin`):

```text
1. Build base filter:
   - visibility === 'public'  → { isPublic: true }
   - visibility === 'private' → { isPublic: false }
   - visibility === 'all'     → {}
2. If q AND q.trim() is non-empty (whitespace-only treated as no-filter):
   - escaped = escapeRegExp(q.trim())
   - AND { $or: [
       { note:          { $regex: escaped, $options: 'i' } },
       { displayName:   { $regex: escaped, $options: 'i' } },
       { transactionId: { $regex: escaped, $options: 'i' } },
     ] }
3. const skip = (page - 1) * pageSize
   (Note: 1-based pagination, matches admin-users convention. The
    public getNotes endpoint uses 0-based; do NOT harmonize.)
4. Run two queries in parallel:
   - this.noteModel.find(filter)
       .sort({ createdAt: -1, _id: -1 })
       .skip(skip).limit(pageSize).lean<LeanPaymentNote[]>()
   - this.noteModel.countDocuments(filter)
5. Enrich userId-bearing notes with display name (existing pattern from
   getNotes — fetch users by _id with .select('_id displayName username'),
   build a Map, merge). The .select() is the contract that prevents
   passwordHash leaks; a unit test pins it.
6. Map docs → AdminPaymentNoteItem using the LeanPaymentNote type so no
   ad-hoc casts are needed. doc.createdAt is a Date (call .toISOString());
   doc._id is a Types.ObjectId (call .toString()).
7. Return { items, total, page, pageSize }.
```

The `escapeRegExp` helper currently lives at
`apps/be/src/admin/lib/escape-regexp.ts` (from ARC-604). The cleanest
re-use is to import it directly from there. No need to duplicate.

**Default pagination divergence (intentional):** admin defaults are
`pageSize=50` capped at `200`, mirroring `ListAdminUsersDto`. The public
`getNotes` defaults to `limit=20` capped at `100`. Do not harmonize
either way — admin and public endpoints have different access patterns.

## FE — Page + components

### Server Component (`page.tsx`)

```tsx
import { requireAdmin } from '@/entities/session/api/requireAdmin';
import AdminPaymentsClient from './AdminPaymentsClient';

// No metadata export — inherit noindex from /admin/layout.tsx.

export default async function AdminPaymentsPage() {
  await requireAdmin(); // defense in depth; layout already gates
  return <AdminPaymentsClient />;
}
```

### Client (`AdminPaymentsClient.tsx`)

`'use client'`. State: `{ page, q, visibility }`. Calls
`useAdminPaymentNotes` (custom `useQuery` + `useRefreshStore` — same
pattern as `useAdminUsers`).

Composition:

```tsx
'use client';
// ...imports

<PageLayout>
  <Container size="lg">
    <YStack gap="$3">
      <PageTitle size="lg">{t.title}</PageTitle>
      <AdminPaymentsFilters
        q={q}
        visibility={visibility}
        onChange={(next) => { setQ(next.q); setVisibility(next.visibility); setPage(1); }}
        labels={{ ... }}
      />
      <AdminPaymentsTable
        items={data?.items ?? []}
        total={data?.total ?? 0}
        page={page}
        pageSize={50}
        isLoading={isLoading}
        isError={!!queryError}
        onPageChange={setPage}
        labels={{ ... }}
      />
    </YStack>
  </Container>
</PageLayout>
```

No mutations in v1, so no `mutateAsync` / error toast / per-row pending
state. Read-only.

### Filters (`AdminPaymentsFilters.tsx`)

- Search input debounced 300ms via existing `useDebounce`
- Visibility dropdown: `All` / `Public only` / `Private only`

### Table (`AdminPaymentsTable.tsx`)

Columns:

- `displayName` (or localized `Anonymous` placeholder when null)
- `amount` formatted via `new Intl.NumberFormat(undefined, { style:
'currency', currency }).format(amount)`. Wrap in try/catch: if
  `currency` is somehow invalid (the schema upper-cases on write but
  doesn't validate), fall back to `${amount} ${currency}`.
- `note` (truncated to 200 chars in display, full visible on hover via
  `title` attribute)
- `isPublic` chip — `Public` (green) or `Private` (gray)
- `createdAt` — locale-formatted date+time
- `transactionId` — small monospace, plain text in v1 (no copy button)

Empty / loading / error states. Pagination footer with prev/next + page
indicator (same pattern as `UsersTable`).

### i18n keys (`pages.admin.payments`)

- `title`
- `search.placeholder` — "Search by note, name, or transaction id"
- `filter.visibility.label`
- `filter.visibility.all`
- `filter.visibility.public`
- `filter.visibility.private`
- `table.user`
- `table.amount`
- `table.note`
- `table.visibility`
- `table.createdAt`
- `table.transactionId`
- `chip.public`
- `chip.private`
- `chip.anonymous` — when `displayName` is null
- `empty.noResults`
- `empty.noNotes`
- `pagination.prev`
- `pagination.next`
- `pagination.of` — "Page {current} of {total}"
- `totalLabel` — "{total} notes"

All 5 locales with real translations. No English placeholders in
non-English files.

## Testing

### Backend (Jest)

`payment-notes.service.admin.spec.ts`:

- `listForAdmin` returns paginated results sorted by
  `{ createdAt: -1, _id: -1 }`
- `visibility: 'public'` filters to `{ isPublic: true }`
- `visibility: 'private'` filters to `{ isPublic: false }`
- `visibility: 'all'` (default) applies no `isPublic` constraint
- `q` matches across `note`, `displayName`, `transactionId`
  case-insensitively
- whitespace-only `q` (e.g. `'   '`) is treated as no filter
- regex metacharacters in `q` are escaped (test with `*`, `+`, `(`)
- combines `q` + `visibility`
- enriches `userId`-bearing notes with `displayName` from User model
- **regression: User join uses `.select('_id displayName username')`**
  — pins the contract that prevents `passwordHash` leakage. Assert via
  the mocked `userModel.find().select` mock that the exact projection
  string is passed.
- maps doc → `AdminPaymentNoteItem` exposing
  `transactionId`/`isPublic`/`userId`
- `total` is independent of pagination slice

`admin-payment-notes.controller.spec.ts` (integration, same harness as
`admin-users.controller.spec.ts`):

- 200 with default args
- 400 with `pageSize=999` (proves global ValidationPipe is registered
  and applies to this controller)
- 400 with `visibility=invalid`
- 400 with unknown query param (`forbidNonWhitelisted`)
- (Use `.overrideGuard(JwtAuthGuard).useValue({canActivate: () => true})`
  and `.overrideGuard(RolesGuard).useValue({canActivate: () => true})` —
  RolesGuard's behavior is unit-tested in ARC-602's
  `roles.guard.spec.ts`.)

### Frontend (Vitest)

`features/admin-payments/api.test.ts`:

- `buildAdminPaymentsUrl` builds correct query strings
- `fetchAdminPaymentNotes` calls `apiClient.get` with the right URL +
  token

`features/admin-payments/hooks.test.ts`:

- `useAdminPaymentNotes` query key includes all args
- disabled when no access token

`features/admin-payments/ui/AdminPaymentsTable.test.tsx`:

- empty branch (no filter) → `noNotes`
- empty branch (filter active) → `noResults`
- renders rows with amount/currency, note text, isPublic chip
- public/private chip rendering
- pagination footer prev/next disabled at boundaries
- "Anonymous" placeholder when `displayName` is null

### Playwright e2e

`apps/web/e2e/admin-payments.spec.ts`:

- robots.txt still disallows `/admin/`
- sitemap.xml does not include `/admin/payments`

(Same Server-Component-fetch caveat from ARC-602/604/606 — gate
behavior isn't e2e-tested at this layer; covered by unit + integration.)

## File Inventory

### New (BE)

- `apps/be/src/payments/admin-payment-notes.controller.ts`
- `apps/be/src/payments/admin-payment-notes.controller.spec.ts`
- `apps/be/src/payments/payment-notes.service.admin.spec.ts`
- `apps/be/src/payments/dto/list-admin-notes.dto.ts`
- `apps/be/src/payments/interfaces/admin-payment-note.interface.ts`

### New (FE)

- `apps/web/src/app/admin/payments/page.tsx`
- `apps/web/src/app/admin/payments/AdminPaymentsClient.tsx`
- `apps/web/src/features/admin-payments/api.ts`
- `apps/web/src/features/admin-payments/api.test.ts`
- `apps/web/src/features/admin-payments/hooks.ts`
- `apps/web/src/features/admin-payments/hooks.test.ts`
- `apps/web/src/features/admin-payments/ui/AdminPaymentsFilters.tsx`
- `apps/web/src/features/admin-payments/ui/AdminPaymentsTable.tsx`
- `apps/web/src/features/admin-payments/ui/AdminPaymentsTable.test.tsx`
- `apps/web/e2e/admin-payments.spec.ts`

### Modified

- `apps/be/src/payments/payment-notes.service.ts` — add `listForAdmin()`
- `apps/be/src/payments/payments.module.ts` — register
  `AdminPaymentNotesController` and `RolesGuard` in providers
- `apps/web/src/app/admin/_components/sidebarItems.ts` — flip
  `payments` entry to enabled with href
- `apps/web/src/shared/i18n/messages/pages/{en,ru,es,fr,by}.ts` — add
  `pages.admin.payments` namespace

### Reused (verified)

- `apps/be/src/admin/lib/escape-regexp.ts` (from ARC-604)
- `apps/be/src/auth/guards/{roles.guard.ts, roles.decorator.ts}` (from ARC-602)
- `apps/be/src/auth/jwt/jwt.guard.ts`
- `apps/be/src/auth/schemas/user.schema.ts`
- `apps/web/src/entities/session/api/requireAdmin.ts` (from ARC-602)
- `apps/web/src/shared/lib/api-client.ts` (with `patch` from ARC-604,
  not used here — read-only)
- `apps/web/src/shared/hooks/{useQuery, useMutation, useDebounce}.ts`
- `apps/web/src/shared/model/useRefreshStore.ts`

## Risks & Mitigations

- **Legacy notes without `isPublic`**: the schema defaults `isPublic` to
  `true` (`@Prop({ default: true })`), so historical records should
  always have it set. If any are missing, `visibility: 'all'` still
  shows them; `visibility: 'private'` filters strict and would skip
  them. Acceptable.
- **No transaction-id verification**: the admin sees the
  `transactionId` field as-stored, with no cross-check against Stripe.
  Documented as part of the larger Stripe persistence spec follow-up.
- **PII in the note text**: notes are user-authored free text; admins
  should already be expected to handle PII responsibly. No redaction in
  v1.
- **Total count on a large collection**: `countDocuments` with no index
  on `isPublic` could be slow at scale. Current scale is small.
  Defer.

## Deferred to Future Specs

- Live Stripe charges/refunds/disputes via the Stripe API
- Persisted Stripe webhook events with idempotency + signature
  verification (the "real" payment history)
- Edit/delete notes from the admin
- Per-user filter (drill-in from `/admin/users` row → that user's notes)
- CSV export
- Date-range filter
- Audit logging of admin actions
