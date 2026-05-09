# Admin Announcements Implementation Plan (ARC-608)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the admin-authored announcements feature spec'd in `docs/superpowers/specs/2026-05-09-admin-announcements-design.md` — header banner for end users + admin CRUD page at `/admin/announcements`.

**Architecture:** New `announcements` NestJS module (admin CRUD + public GET active). New `AnnouncementBanner` Next.js widget mounted in the root layout. New admin page at `/admin/announcements` mirroring the `/admin/users` and `/admin/payments` shells. localStorage-backed per-user dismissal keyed by `{id, updatedAt}`.

**Tech Stack:** NestJS + Mongoose + class-validator on the BE; Next.js App Router + Tamagui + custom `useQuery`/`useMutation` hooks + Zustand `useRefreshStore` on the FE; Vitest + RTL on web; Jest on BE; Playwright for SEO regression.

**Branch:** Already on `ARC-608` (off `develop`). PR target: `develop`. Commit convention: Conventional Commits with `(ARC-608)` footer.

**Reference patterns to mirror:**

- Schema: [apps/be/src/payments/schemas/payment-note.schema.ts](apps/be/src/payments/schemas/payment-note.schema.ts) (`@Schema({ timestamps: true })` + `Prop` decorators).
- Module: [apps/be/src/admin/admin.module.ts](apps/be/src/admin/admin.module.ts) (imports `AuthModule`, registers `RolesGuard` provider).
- Admin controller: [apps/be/src/admin/admin-users.controller.ts](apps/be/src/admin/admin-users.controller.ts) (`@UseGuards(JwtAuthGuard, RolesGuard) @Roles('admin')` + `RequestWithUser` typing).
- Admin service shape: [apps/be/src/admin/admin-users.service.ts](apps/be/src/admin/admin-users.service.ts) (`escapeRegExp`, `lean<T>()`, 1-based pagination, `Promise.all([find, count])`).
- Admin DTO: [apps/be/src/admin/dto/list-admin-users.dto.ts](apps/be/src/admin/dto/list-admin-users.dto.ts) (`@Type(() => Number)`, `@IsOptional`, `@Min/@Max`).
- FE feature api: [apps/web/src/features/admin-users/api.ts](apps/web/src/features/admin-users/api.ts) (`buildXyzUrl`, `fetchXyz`, `apiClient.get/patch`).
- FE feature hooks: [apps/web/src/features/admin-users/hooks.ts](apps/web/src/features/admin-users/hooks.ts) (`useQuery` + `refreshKey`, `useMutation` + `triggerRefresh`).
- Admin page Server Component: pattern of `requireAdmin()` then render `*Client`.
- Sidebar flip: [apps/web/src/app/admin/\_components/sidebarItems.ts](apps/web/src/app/admin/_components/sidebarItems.ts).

**Constraints to remember:**

- Never use `any`. Use `unknown` or generics. Cast with comment if last resort.
- Tamagui `View`/`Text` don't accept HTML `title`. Use `<span title={…}>` wrapper.
- Tamagui `Text` `fontFamily="monospace"` rejected — use `style={{ fontFamily: 'monospace' }}`.
- `@arcadeum/ui` Button: tests must use `aria-disabled="true"` not HTML `disabled` (and `not.toHaveAttribute('aria-disabled', 'true')` for the not-disabled case).
- Pre-push hook runs full e2e (~16 min). Use `--no-verify` only when local infra (Mongo, dev server with `NEXT_PUBLIC_E2E`) is unavailable, after confirming with the user.

---

## File map (decomposition)

### Backend — `apps/be/src/announcements/`

| File                                      | Responsibility                                                                                                          |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `schemas/announcement.schema.ts`          | Mongoose schema + indexes + content sub-schema                                                                          |
| `interfaces/announcement.interface.ts`    | `AnnouncementAdminItem`, `AnnouncementPublicItem`, response shapes, `Audience`, `Severity` types, `Locale` import       |
| `dto/create-announcement.dto.ts`          | `CreateAnnouncementDto` + nested `LocaleContentDto` + `IsAfter` custom validator + `IsSafeUrl` custom validator         |
| `dto/update-announcement.dto.ts`          | `UpdateAnnouncementDto extends PartialType(CreateAnnouncementDto)`                                                      |
| `dto/list-admin-announcements.dto.ts`     | List query DTO (`page`, `pageSize`, `q`, `status`, `severity`)                                                          |
| `dto/active-announcement.dto.ts`          | Public GET query (`locale?`)                                                                                            |
| `lib/announcement-status.ts`              | `deriveStatus(startsAt, endsAt, now)` pure function + `ACTIVE_FILTER(now, audienceFilter)` builder                      |
| `lib/announcement-status.spec.ts`         | Unit tests for status derivation + active filter                                                                        |
| `lib/escape-regexp.ts`                    | (Already exists in `apps/be/src/admin/lib/`. Re-import, do not duplicate.)                                              |
| `announcements.service.ts`                | Shared queries: `listForAdmin`, `getActiveForCaller`, `create`, `update`, `delete`, `findById`                          |
| `announcements.service.admin.spec.ts`     | Service unit tests for admin list (filters/pagination/status)                                                           |
| `announcements.service.public.spec.ts`    | Service unit tests for active query + audience + sort + locale resolution                                               |
| `admin-announcements.controller.ts`       | `/admin/announcements` CRUD, `JwtAuthGuard` + `RolesGuard` + `@Roles('admin')`                                          |
| `admin-announcements.controller.spec.ts`  | Controller integration: 401/403, DTO validation (forbidNonWhitelisted, IsSafeUrl, IsAfter), 404 on bad id, pageSize cap |
| `public-announcements.controller.ts`      | `GET /announcements/active`, optional auth, locale resolution, `Cache-Control` header                                   |
| `public-announcements.controller.spec.ts` | Anonymous vs authenticated audience, locale fallback, null when no match, strips admin fields                           |
| `announcements.module.ts`                 | Module wiring (AuthModule import, MongooseModule.forFeature, providers, controllers)                                    |

Modify: [apps/be/src/app.module.ts](apps/be/src/app.module.ts) — add `AnnouncementsModule`.

### Frontend banner widget — `apps/web/src/widgets/AnnouncementBanner/`

| File                                  | Responsibility                                                                                                                      |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `lib/dismissedStorage.ts`             | `getDismissed`, `addDismissed`, `isDismissed` — localStorage helpers, FIFO 50-cap, malformed JSON → `[]`                            |
| `lib/dismissedStorage.test.ts`        | Round-trip, cap, malformed JSON, SSR-safe (no-op when `window` undefined)                                                           |
| `lib/ctaHrefSafety.ts`                | `isSafeCtaHref(href)` — `^(https?:\/\/                                                                                              | \/)`allow, reject`^javascript:` (matches BE rule) |
| `lib/ctaHrefSafety.test.ts`           | Test the regex on all the gotcha inputs                                                                                             |
| `api.ts`                              | `fetchActiveAnnouncement(opts)` returning `AnnouncementPublicItem \| null`                                                          |
| `api.test.ts`                         | URL builder, locale param, anonymous (no token) vs authenticated                                                                    |
| `hooks/useActiveAnnouncement.ts`      | Wraps custom `useQuery`; visibilityState-guarded 60 s polling; window focus refetch; returns the announcement filtered by dismissal |
| `hooks/useActiveAnnouncement.test.ts` | Returns null on null response; dismissal applied; critical bypasses dismissal; updatedAt change re-shows                            |
| `ui/AnnouncementBanner.tsx`           | Visual banner — Tamagui XStack, severity-aware tokens, expand/collapse, dismiss, CTA                                                |
| `ui/AnnouncementBanner.test.tsx`      | All severities; expand/collapse; dismiss writes to localStorage; CTA href validation; a11y roles                                    |

Modify: [apps/web/src/app/layout.tsx](apps/web/src/app/layout.tsx) — mount `<AnnouncementBanner />` between `<Header />` and `{children}` (inside `BrowserRegistry`).

### Frontend admin feature — `apps/web/src/features/admin-announcements/`

| File                                    | Responsibility                                                                                                                                                                   |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `api.ts`                                | Types + `buildAdminAnnouncementsUrl`, `fetchAdminAnnouncements`, `createAnnouncement`, `updateAnnouncement`, `deleteAnnouncement`                                                |
| `api.test.ts`                           | URL builders, body shapes, auth header, public-active-invalidate path                                                                                                            |
| `hooks.ts`                              | `useAdminAnnouncements(args)`, `useCreateAnnouncement()`, `useUpdateAnnouncement()`, `useDeleteAnnouncement()` — all using custom `useQuery`/`useMutation` and `useRefreshStore` |
| `hooks.test.ts`                         | List query token guard; mutations call `triggerRefresh` for both admin list and public-active keys                                                                               |
| `lib/severityChip.ts`                   | `getSeverityChipColor(severity)` mapping for table chip                                                                                                                          |
| `lib/severityChip.test.ts`              | Mapping completeness                                                                                                                                                             |
| `lib/formatWindow.ts`                   | `formatWindow(startsAt, endsAt, locale)` → "May 9 — May 16" with locale-aware date format; "Now" if active                                                                       |
| `lib/formatWindow.test.ts`              | Boundary cases (null both, null one)                                                                                                                                             |
| `ui/AdminAnnouncementsFilters.tsx`      | Search input (debounced 300 ms) + status dropdown + severity dropdown + "+ New" button                                                                                           |
| `ui/AdminAnnouncementsFilters.test.tsx` | Debounced search resets page, dropdowns wired, new button fires callback                                                                                                         |
| `ui/AdminAnnouncementsTable.tsx`        | Columns: title (truncated), severity chip, audience chip, window, createdBy, edit/delete actions; pagination                                                                     |
| `ui/AdminAnnouncementsTable.test.tsx`   | Renders rows, status pill correct, action callbacks fire, empty state, pagination wiring                                                                                         |
| `ui/AdminAnnouncementForm.tsx`          | Modal — settings + content (locale tabs) + preview; create/edit modes                                                                                                            |
| `ui/AdminAnnouncementForm.test.tsx`     | Locale tabs preserve state, EN title required, endsAt > startsAt, submit shape, preview                                                                                          |
| `ui/AnnouncementBannerPreview.tsx`      | Read-only render of the banner using the form's current state (re-uses banner styling)                                                                                           |

### Frontend admin route — `apps/web/src/app/admin/announcements/`

| File                           | Responsibility                                                                                                                                   |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `page.tsx`                     | Server Component, `requireAdmin()` then renders `<AdminAnnouncementsClient />`; no `metadata` export (inherits noindex from `/admin/layout.tsx`) |
| `AdminAnnouncementsClient.tsx` | `'use client'` shell composing filters + table + form modal; manages `{ page, q, status, severity, modalState }`                                 |

### Sidebar / SEO

Modify: [apps/web/src/app/admin/\_components/sidebarItems.ts](apps/web/src/app/admin/_components/sidebarItems.ts) — flip `announcements` entry to `{ id: 'announcements', href: '/admin/announcements', enabled: true }`.

Create: `apps/web/e2e/admin-announcements.spec.ts` — robots.txt + sitemap regression.

### i18n

Modify: `apps/web/src/shared/i18n/messages/pages/{en,ru,es,fr,by}.ts` — add `pages.admin.announcements` namespace.

Modify: `apps/web/src/shared/i18n/messages/{en,ru,es,fr,by}.ts` — add `widgets.announcementBanner` namespace.

---

## Phase 1 — Backend foundation: schema + types + status helper

**Files:**

- Create: `apps/be/src/announcements/schemas/announcement.schema.ts`
- Create: `apps/be/src/announcements/interfaces/announcement.interface.ts`
- Create: `apps/be/src/announcements/lib/announcement-status.ts`
- Create: `apps/be/src/announcements/lib/announcement-status.spec.ts`

### Task 1.1 — Schema

- [ ] **Step 1: Write the schema file**

`apps/be/src/announcements/schemas/announcement.schema.ts`:

```ts
import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AnnouncementSeverity = 'info' | 'warning' | 'critical';
export type AnnouncementAudience = 'all' | 'authenticated' | 'anonymous';
export type AnnouncementLocale = 'en' | 'ru' | 'es' | 'fr' | 'by';

export const ANNOUNCEMENT_SEVERITIES: readonly AnnouncementSeverity[] = [
  'info',
  'warning',
  'critical',
] as const;
export const ANNOUNCEMENT_AUDIENCES: readonly AnnouncementAudience[] = [
  'all',
  'authenticated',
  'anonymous',
] as const;
export const ANNOUNCEMENT_LOCALES: readonly AnnouncementLocale[] = [
  'en',
  'ru',
  'es',
  'fr',
  'by',
] as const;

@Schema({ _id: false })
class AnnouncementLocaleContent {
  @Prop({ required: true, maxlength: 120 })
  title!: string;

  @Prop({ maxlength: 500 })
  body?: string;

  @Prop({ maxlength: 60 })
  ctaLabel?: string;

  @Prop({ maxlength: 2048 })
  ctaHref?: string;
}
const AnnouncementLocaleContentSchema = SchemaFactory.createForClass(
  AnnouncementLocaleContent,
);

@Schema({ _id: false })
class AnnouncementContent {
  @Prop({ type: AnnouncementLocaleContentSchema, required: true })
  en!: AnnouncementLocaleContent;

  @Prop({ type: AnnouncementLocaleContentSchema })
  ru?: AnnouncementLocaleContent;

  @Prop({ type: AnnouncementLocaleContentSchema })
  es?: AnnouncementLocaleContent;

  @Prop({ type: AnnouncementLocaleContentSchema })
  fr?: AnnouncementLocaleContent;

  @Prop({ type: AnnouncementLocaleContentSchema })
  by?: AnnouncementLocaleContent;
}
const AnnouncementContentSchema =
  SchemaFactory.createForClass(AnnouncementContent);

@Schema({ timestamps: true, collection: 'announcements' })
export class Announcement {
  @Prop({ required: true, enum: ANNOUNCEMENT_SEVERITIES })
  severity!: AnnouncementSeverity;

  @Prop({ required: true, enum: ANNOUNCEMENT_AUDIENCES, default: 'all' })
  audience!: AnnouncementAudience;

  @Prop({ type: Date, default: null })
  startsAt!: Date | null;

  @Prop({ type: Date, default: null })
  endsAt!: Date | null;

  @Prop({ type: AnnouncementContentSchema, required: true })
  content!: AnnouncementContent;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy!: Types.ObjectId;
}

export type AnnouncementDocument = Announcement & Document;
export const AnnouncementSchema = SchemaFactory.createForClass(Announcement);

AnnouncementSchema.index({ startsAt: 1, endsAt: 1 });
AnnouncementSchema.index({ severity: -1, startsAt: -1 });
```

- [ ] **Step 2: Write the interfaces file**

`apps/be/src/announcements/interfaces/announcement.interface.ts`:

```ts
import type {
  AnnouncementSeverity,
  AnnouncementAudience,
  AnnouncementLocale,
} from '../schemas/announcement.schema';

export type { AnnouncementSeverity, AnnouncementAudience, AnnouncementLocale };

export type AnnouncementStatus = 'active' | 'scheduled' | 'expired';

export interface AnnouncementLocaleContentItem {
  title: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export type AnnouncementContentMap = Partial<
  Record<AnnouncementLocale, AnnouncementLocaleContentItem>
> & {
  en: AnnouncementLocaleContentItem;
};

export interface AnnouncementAdminItem {
  id: string;
  severity: AnnouncementSeverity;
  audience: AnnouncementAudience;
  startsAt: string | null;
  endsAt: string | null;
  content: AnnouncementContentMap;
  createdBy: { id: string; displayName: string | null } | null;
  createdAt: string;
  updatedAt: string;
  status: AnnouncementStatus;
}

export interface AnnouncementsAdminListResponse {
  items: AnnouncementAdminItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AnnouncementPublicItem {
  id: string;
  severity: AnnouncementSeverity;
  updatedAt: string;
  title: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/be/src/announcements/schemas apps/be/src/announcements/interfaces
git commit -m "feat(announcements): add Announcement schema and interfaces (ARC-608)"
```

### Task 1.2 — Status derivation helper (TDD)

- [ ] **Step 1: Write failing test**

`apps/be/src/announcements/lib/announcement-status.spec.ts`:

```ts
import { deriveStatus, buildActiveFilter } from './announcement-status';

describe('deriveStatus', () => {
  const now = new Date('2026-05-09T12:00:00Z');

  it('returns active when both bounds null', () => {
    expect(deriveStatus(null, null, now)).toBe('active');
  });

  it('returns active when startsAt past and endsAt future', () => {
    expect(
      deriveStatus(
        new Date('2026-05-08T00:00:00Z'),
        new Date('2026-05-10T00:00:00Z'),
        now,
      ),
    ).toBe('active');
  });

  it('returns active when startsAt past and endsAt null', () => {
    expect(deriveStatus(new Date('2026-05-01T00:00:00Z'), null, now)).toBe(
      'active',
    );
  });

  it('returns active when startsAt null and endsAt future', () => {
    expect(deriveStatus(null, new Date('2026-05-10T00:00:00Z'), now)).toBe(
      'active',
    );
  });

  it('returns scheduled when startsAt is in the future', () => {
    expect(deriveStatus(new Date('2026-05-10T00:00:00Z'), null, now)).toBe(
      'scheduled',
    );
  });

  it('returns expired when endsAt is in the past', () => {
    expect(deriveStatus(null, new Date('2026-05-08T00:00:00Z'), now)).toBe(
      'expired',
    );
  });

  it('boundary: now === startsAt → active', () => {
    expect(deriveStatus(now, null, now)).toBe('active');
  });

  it('boundary: now === endsAt → expired (endsAt is exclusive)', () => {
    expect(deriveStatus(null, now, now)).toBe('expired');
  });
});

describe('buildActiveFilter', () => {
  const now = new Date('2026-05-09T12:00:00Z');

  it('matches the active-now predicate', () => {
    expect(buildActiveFilter(now)).toEqual({
      $and: [
        { $or: [{ startsAt: null }, { startsAt: { $lte: now } }] },
        { $or: [{ endsAt: null }, { endsAt: { $gt: now } }] },
      ],
    });
  });
});
```

- [ ] **Step 2: Run test (must fail)**

`pnpm --filter be test announcement-status.spec` → fails (module not found).

- [ ] **Step 3: Implement**

`apps/be/src/announcements/lib/announcement-status.ts`:

```ts
import type { AnnouncementStatus } from '../interfaces/announcement.interface';

export function deriveStatus(
  startsAt: Date | null,
  endsAt: Date | null,
  now: Date,
): AnnouncementStatus {
  if (startsAt && startsAt > now) return 'scheduled';
  if (endsAt && endsAt <= now) return 'expired';
  return 'active';
}

export function buildActiveFilter(now: Date): Record<string, unknown> {
  return {
    $and: [
      { $or: [{ startsAt: null }, { startsAt: { $lte: now } }] },
      { $or: [{ endsAt: null }, { endsAt: { $gt: now } }] },
    ],
  };
}
```

- [ ] **Step 4: Run test (must pass)**

`pnpm --filter be test announcement-status.spec` → all 9 pass.

- [ ] **Step 5: Commit**

```bash
git add apps/be/src/announcements/lib
git commit -m "feat(announcements): add status derivation and active-filter helpers (ARC-608)"
```

---

## Phase 2 — Backend DTOs

**Files:**

- Create: `apps/be/src/announcements/dto/create-announcement.dto.ts`
- Create: `apps/be/src/announcements/dto/update-announcement.dto.ts`
- Create: `apps/be/src/announcements/dto/list-admin-announcements.dto.ts`
- Create: `apps/be/src/announcements/dto/active-announcement.dto.ts`
- Create: `apps/be/src/announcements/dto/validators/is-safe-url.validator.ts`
- Create: `apps/be/src/announcements/dto/validators/is-safe-url.validator.spec.ts`
- Create: `apps/be/src/announcements/dto/validators/is-after.validator.ts`
- Create: `apps/be/src/announcements/dto/validators/is-after.validator.spec.ts`

### Task 2.1 — `IsSafeUrl` custom validator (TDD)

- [ ] **Step 1: Write failing test**

`apps/be/src/announcements/dto/validators/is-safe-url.validator.spec.ts`:

```ts
import { validate } from 'class-validator';
import { IsSafeUrl } from './is-safe-url.validator';

class Bag {
  @IsSafeUrl()
  href?: string;
}

async function checkOk(href: string) {
  const bag = new Bag();
  bag.href = href;
  return (await validate(bag)).length;
}

describe('IsSafeUrl', () => {
  it('accepts https URL', async () =>
    expect(await checkOk('https://x.com')).toBe(0));
  it('accepts http URL', async () =>
    expect(await checkOk('http://x.com')).toBe(0));
  it('accepts root-relative path', async () =>
    expect(await checkOk('/games/123')).toBe(0));
  it('accepts undefined (optional)', async () =>
    expect(await checkOk(undefined as unknown as string)).toBe(0));
  it('rejects javascript:', async () =>
    expect(await checkOk('javascript:alert(1)')).toBeGreaterThan(0));
  it('rejects data:', async () =>
    expect(await checkOk('data:text/html,<script>')).toBeGreaterThan(0));
  it('rejects relative path without leading slash', async () =>
    expect(await checkOk('games/123')).toBeGreaterThan(0));
  it('rejects empty string', async () =>
    expect(await checkOk('')).toBeGreaterThan(0));
});
```

- [ ] **Step 2: Run test (fail)** — `pnpm --filter be test is-safe-url.validator.spec`.

- [ ] **Step 3: Implement**

`apps/be/src/announcements/dto/validators/is-safe-url.validator.ts`:

```ts
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

const ALLOW = /^(https?:\/\/|\/)/;
const DENY = /^javascript:/i;

export function IsSafeUrl(options?: ValidationOptions): PropertyDecorator {
  return (target, propertyName) => {
    registerDecorator({
      name: 'isSafeUrl',
      target: target.constructor,
      propertyName: propertyName as string,
      options,
      validator: {
        validate(value: unknown) {
          if (value === undefined || value === null) return true;
          if (typeof value !== 'string') return false;
          if (DENY.test(value)) return false;
          return ALLOW.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be an https URL or a root-relative path starting with /`;
        },
      },
    });
  };
}
```

- [ ] **Step 4: Run test (pass)**.

- [ ] **Step 5: Commit**

```bash
git add apps/be/src/announcements/dto/validators/is-safe-url.validator.ts apps/be/src/announcements/dto/validators/is-safe-url.validator.spec.ts
git commit -m "feat(announcements): add IsSafeUrl validator (ARC-608)"
```

### Task 2.2 — `IsAfter` cross-property validator (TDD)

- [ ] **Step 1: Write failing test**

`apps/be/src/announcements/dto/validators/is-after.validator.spec.ts`:

```ts
import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { Type } from 'class-transformer';
import { IsDate, IsOptional, validate } from 'class-validator';
import { IsAfter } from './is-after.validator';

class Bag {
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startsAt?: Date | null;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  @IsAfter('startsAt')
  endsAt?: Date | null;
}

async function check(plain: Record<string, unknown>) {
  const inst = plainToInstance(Bag, plain);
  return validate(inst);
}

describe('IsAfter', () => {
  it('passes when both null', async () =>
    expect((await check({})).length).toBe(0));
  it('passes when only startsAt set', async () =>
    expect((await check({ startsAt: '2026-05-09T00:00:00Z' })).length).toBe(0));
  it('passes when only endsAt set', async () =>
    expect((await check({ endsAt: '2026-05-09T00:00:00Z' })).length).toBe(0));
  it('passes when endsAt > startsAt', async () =>
    expect(
      (
        await check({
          startsAt: '2026-05-09T00:00:00Z',
          endsAt: '2026-05-10T00:00:00Z',
        })
      ).length,
    ).toBe(0));
  it('fails when endsAt === startsAt', async () =>
    expect(
      (
        await check({
          startsAt: '2026-05-09T00:00:00Z',
          endsAt: '2026-05-09T00:00:00Z',
        })
      ).length,
    ).toBeGreaterThan(0));
  it('fails when endsAt < startsAt', async () =>
    expect(
      (
        await check({
          startsAt: '2026-05-10T00:00:00Z',
          endsAt: '2026-05-09T00:00:00Z',
        })
      ).length,
    ).toBeGreaterThan(0));
});
```

- [ ] **Step 2: Run test (fail)**.

- [ ] **Step 3: Implement**

`apps/be/src/announcements/dto/validators/is-after.validator.ts`:

```ts
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsAfter(
  otherProperty: string,
  options?: ValidationOptions,
): PropertyDecorator {
  return (target, propertyName) => {
    registerDecorator({
      name: 'isAfter',
      target: target.constructor,
      propertyName: propertyName as string,
      constraints: [otherProperty],
      options,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          if (value === undefined || value === null) return true;
          const other = (args.object as Record<string, unknown>)[
            args.constraints[0] as string
          ];
          if (other === undefined || other === null) return true;
          return (
            value instanceof Date &&
            other instanceof Date &&
            value.getTime() > other.getTime()
          );
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be strictly after ${args.constraints[0]}`;
        },
      },
    });
  };
}
```

- [ ] **Step 4: Run test (pass)**.

- [ ] **Step 5: Commit**

```bash
git add apps/be/src/announcements/dto/validators/is-after.validator.ts apps/be/src/announcements/dto/validators/is-after.validator.spec.ts
git commit -m "feat(announcements): add IsAfter cross-property validator (ARC-608)"
```

### Task 2.3 — `CreateAnnouncementDto`, `UpdateAnnouncementDto`

- [ ] **Step 1: Write `LocaleContentDto` + `CreateAnnouncementDto`**

`apps/be/src/announcements/dto/create-announcement.dto.ts`:

```ts
import { Type } from 'class-transformer';
import {
  IsDate,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import {
  ANNOUNCEMENT_AUDIENCES,
  ANNOUNCEMENT_SEVERITIES,
} from '../schemas/announcement.schema';
import type {
  AnnouncementAudience,
  AnnouncementSeverity,
} from '../schemas/announcement.schema';
import { IsSafeUrl } from './validators/is-safe-url.validator';
import { IsAfter } from './validators/is-after.validator';

export class LocaleContentDto {
  @IsString()
  @MaxLength(120)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  body?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  ctaLabel?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  @IsSafeUrl()
  ctaHref?: string;
}

export class AnnouncementContentDto {
  @ValidateNested()
  @Type(() => LocaleContentDto)
  en!: LocaleContentDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => LocaleContentDto)
  ru?: LocaleContentDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => LocaleContentDto)
  es?: LocaleContentDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => LocaleContentDto)
  fr?: LocaleContentDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => LocaleContentDto)
  by?: LocaleContentDto;
}

export class CreateAnnouncementDto {
  @IsIn(ANNOUNCEMENT_SEVERITIES)
  severity!: AnnouncementSeverity;

  @IsOptional()
  @IsIn(ANNOUNCEMENT_AUDIENCES)
  audience?: AnnouncementAudience;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startsAt?: Date | null;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  @IsAfter('startsAt')
  endsAt?: Date | null;

  @IsObject()
  @ValidateNested()
  @Type(() => AnnouncementContentDto)
  content!: AnnouncementContentDto;
}
```

- [ ] **Step 2: Write `UpdateAnnouncementDto`**

`apps/be/src/announcements/dto/update-announcement.dto.ts`:

```ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateAnnouncementDto } from './create-announcement.dto';

export class UpdateAnnouncementDto extends PartialType(CreateAnnouncementDto) {}
```

- [ ] **Step 3: Commit**

```bash
git add apps/be/src/announcements/dto/create-announcement.dto.ts apps/be/src/announcements/dto/update-announcement.dto.ts
git commit -m "feat(announcements): add Create/Update announcement DTOs (ARC-608)"
```

### Task 2.4 — `ListAdminAnnouncementsDto` and `ActiveAnnouncementDto`

- [ ] **Step 1: Write `ListAdminAnnouncementsDto`**

`apps/be/src/announcements/dto/list-admin-announcements.dto.ts`:

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
import {
  ANNOUNCEMENT_SEVERITIES,
  type AnnouncementSeverity,
} from '../schemas/announcement.schema';

export const ADMIN_ANNOUNCEMENTS_STATUS = [
  'all',
  'active',
  'scheduled',
  'expired',
] as const;
export type AdminAnnouncementsStatus =
  (typeof ADMIN_ANNOUNCEMENTS_STATUS)[number];

export class ListAdminAnnouncementsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 25;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  q?: string;

  @IsOptional()
  @IsIn(ADMIN_ANNOUNCEMENTS_STATUS)
  status?: AdminAnnouncementsStatus = 'all';

  @IsOptional()
  @IsIn(ANNOUNCEMENT_SEVERITIES)
  severity?: AnnouncementSeverity;
}
```

- [ ] **Step 2: Write `ActiveAnnouncementDto`**

`apps/be/src/announcements/dto/active-announcement.dto.ts`:

```ts
import { IsIn, IsOptional } from 'class-validator';
import {
  ANNOUNCEMENT_LOCALES,
  type AnnouncementLocale,
} from '../schemas/announcement.schema';

export class ActiveAnnouncementDto {
  @IsOptional()
  @IsIn(ANNOUNCEMENT_LOCALES)
  locale?: AnnouncementLocale;
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/be/src/announcements/dto/list-admin-announcements.dto.ts apps/be/src/announcements/dto/active-announcement.dto.ts
git commit -m "feat(announcements): add list/active query DTOs (ARC-608)"
```

---

## Phase 3 — Backend service (TDD)

**Files:**

- Create: `apps/be/src/announcements/announcements.service.ts`
- Create: `apps/be/src/announcements/announcements.service.admin.spec.ts`
- Create: `apps/be/src/announcements/announcements.service.public.spec.ts`

### Task 3.1 — Service skeleton + admin list (TDD)

- [ ] **Step 1: Write failing test for `listForAdmin`**

`apps/be/src/announcements/announcements.service.admin.spec.ts` — covers:

- 1-based pagination (page=1, pageSize=25 → skip 0, limit 25; page=2 → skip 25)
- `q` matches `content.en.title` (case-insensitive, escapeRegExp on user input)
- `status: 'active'` filter applies the active predicate
- `status: 'scheduled'` filter — `startsAt > now`
- `status: 'expired'` filter — `endsAt <= now`
- `severity` filter
- `createdBy` populated with `displayName`
- `Promise.all([find, count])` returns `{ items, total, page, pageSize }`
- Each item includes derived `status` field
- `ObjectId` and `Date` serialized to strings in response

Mock the model with a `find` chain that supports `.find().populate().sort().skip().limit().lean()` and `.countDocuments()`. Reference [apps/be/src/admin/admin-users.service.spec.ts](apps/be/src/admin/admin-users.service.spec.ts) for the mock harness pattern. Use a fixed `now` via `jest.useFakeTimers().setSystemTime(...)`.

Expected number of tests: **8**.

- [ ] **Step 2: Run test (fail — service does not exist)**.

- [ ] **Step 3: Implement service `listForAdmin`**

`apps/be/src/announcements/announcements.service.ts`:

```ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery } from 'mongoose';
import {
  Announcement,
  AnnouncementDocument,
  type AnnouncementAudience,
  type AnnouncementLocale,
  type AnnouncementSeverity,
} from './schemas/announcement.schema';
import { escapeRegExp } from '../admin/lib/escape-regexp';
import { buildActiveFilter, deriveStatus } from './lib/announcement-status';
import type {
  AnnouncementAdminItem,
  AnnouncementContentMap,
  AnnouncementsAdminListResponse,
  AnnouncementPublicItem,
  AnnouncementLocaleContentItem,
  AnnouncementStatus,
} from './interfaces/announcement.interface';
import type { CreateAnnouncementDto } from './dto/create-announcement.dto';
import type { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import type { AdminAnnouncementsStatus } from './dto/list-admin-announcements.dto';

interface AnnouncementLean {
  _id: Types.ObjectId;
  severity: AnnouncementSeverity;
  audience: AnnouncementAudience;
  startsAt: Date | null;
  endsAt: Date | null;
  content: AnnouncementContentMap;
  createdBy:
    | Types.ObjectId
    | { _id: Types.ObjectId; displayName?: string | null };
  createdAt: Date;
  updatedAt: Date;
}

interface ListForAdminArgs {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: AdminAnnouncementsStatus;
  severity?: AnnouncementSeverity;
}

@Injectable()
export class AnnouncementsService {
  constructor(
    @InjectModel(Announcement.name)
    private readonly model: Model<AnnouncementDocument>,
  ) {}

  async listForAdmin(
    args: ListForAdminArgs,
  ): Promise<AnnouncementsAdminListResponse> {
    const page = args.page ?? 1;
    const pageSize = args.pageSize ?? 25;
    const now = new Date();

    const filter: FilterQuery<AnnouncementDocument> = {};
    if (args.severity) filter.severity = args.severity;
    if (args.q && args.q.trim()) {
      const escaped = escapeRegExp(args.q.trim());
      filter['content.en.title'] = { $regex: escaped, $options: 'i' };
    }
    if (args.status === 'active') {
      Object.assign(filter, buildActiveFilter(now));
    } else if (args.status === 'scheduled') {
      filter.startsAt = { $gt: now };
    } else if (args.status === 'expired') {
      filter.endsAt = { $ne: null, $lte: now };
    }

    const [docs, total] = await Promise.all([
      this.model
        .find(filter)
        .populate('createdBy', '_id displayName')
        .sort({ severity: -1, startsAt: -1, _id: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean<AnnouncementLean[]>(),
      this.model.countDocuments(filter),
    ]);

    const items = docs.map((d) => this.toAdminItem(d, now));
    return { items, total, page, pageSize };
  }

  // ...other methods stubbed for now
  toAdminItem(d: AnnouncementLean, now: Date): AnnouncementAdminItem {
    const status: AnnouncementStatus = deriveStatus(
      d.startsAt ?? null,
      d.endsAt ?? null,
      now,
    );
    const createdBy =
      d.createdBy && typeof d.createdBy === 'object' && '_id' in d.createdBy
        ? {
            id: d.createdBy._id.toString(),
            displayName: d.createdBy.displayName ?? null,
          }
        : null;
    return {
      id: d._id.toString(),
      severity: d.severity,
      audience: d.audience,
      startsAt: d.startsAt?.toISOString() ?? null,
      endsAt: d.endsAt?.toISOString() ?? null,
      content: d.content,
      createdBy,
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt.toISOString(),
      status,
    };
  }
}
```

- [ ] **Step 4: Run test — must pass**.

- [ ] **Step 5: Commit**

```bash
git add apps/be/src/announcements/announcements.service.ts apps/be/src/announcements/announcements.service.admin.spec.ts
git commit -m "feat(announcements): admin list query with status/severity filters (ARC-608)"
```

### Task 3.2 — Service: `getActiveForCaller` + locale resolution (TDD)

- [ ] **Step 1: Add tests** for `getActiveForCaller(authenticated, locale, now)` to `announcements.service.public.spec.ts`:

  - Anonymous → `audience: { $in: ['all', 'anonymous'] }`.
  - Authenticated → `audience: { $in: ['all', 'authenticated'] }`.
  - Sort `{ severity: -1, startsAt: -1 }`, limit 1.
  - Returns `null` when no doc.
  - Locale `'ru'` returns RU content fields.
  - Locale `'ru'` with no RU translation falls back to EN.
  - Strips admin-only fields (no `audience`, no `createdBy`, no full content map).
  - `body`, `ctaLabel`, `ctaHref` only included when present.

  Expected: **8 tests**.

- [ ] **Step 2: Run (fail)**.

- [ ] **Step 3: Implement on the service**:

  ```ts
  async getActiveForCaller(
    isAuthenticated: boolean,
    locale: AnnouncementLocale,
  ): Promise<AnnouncementPublicItem | null> {
    const now = new Date();
    const audienceFilter = isAuthenticated
      ? { audience: { $in: ['all', 'authenticated'] } }
      : { audience: { $in: ['all', 'anonymous'] } };
    const filter = { ...buildActiveFilter(now), ...audienceFilter };
    const doc = await this.model
      .findOne(filter)
      .sort({ severity: -1, startsAt: -1 })
      .lean<AnnouncementLean | null>();
    if (!doc) return null;
    return this.toPublicItem(doc, locale);
  }

  private toPublicItem(
    d: AnnouncementLean,
    locale: AnnouncementLocale,
  ): AnnouncementPublicItem {
    const localized: AnnouncementLocaleContentItem =
      d.content[locale] ?? d.content.en;
    const out: AnnouncementPublicItem = {
      id: d._id.toString(),
      severity: d.severity,
      updatedAt: d.updatedAt.toISOString(),
      title: localized.title,
    };
    if (localized.body) out.body = localized.body;
    if (localized.ctaLabel) out.ctaLabel = localized.ctaLabel;
    if (localized.ctaHref) out.ctaHref = localized.ctaHref;
    return out;
  }
  ```

  **Note on severity sort:** MongoDB sorts strings alphabetically — `'critical' < 'info' < 'warning'` — which is wrong. Fix by storing `severityRank: number` on the doc OR by computing the sort in JS via `aggregate` with `$switch`. Simpler: aggregate with a computed rank field before sort. Replace the `findOne(...).sort(...)` with an `aggregate` pipeline:

  ```ts
  const docs = await this.model
    .aggregate<AnnouncementLean>([
      { $match: filter },
      {
        $addFields: {
          _rank: {
            $switch: {
              branches: [
                { case: { $eq: ['$severity', 'critical'] }, then: 3 },
                { case: { $eq: ['$severity', 'warning'] }, then: 2 },
              ],
              default: 1,
            },
          },
        },
      },
      { $sort: { _rank: -1, startsAt: -1, _id: -1 } },
      { $limit: 1 },
      { $project: { _rank: 0 } },
    ])
    .exec();
  const doc = docs[0] ?? null;
  ```

  Apply the same `_rank` switch in `listForAdmin` (also via `aggregate`) so admin sort matches.

- [ ] **Step 4: Run tests — pass**.

- [ ] **Step 5: Commit**

```bash
git add apps/be/src/announcements/announcements.service.ts apps/be/src/announcements/announcements.service.public.spec.ts
git commit -m "feat(announcements): active-for-caller query with severity rank + locale fallback (ARC-608)"
```

### Task 3.3 — Service: `create`, `update`, `remove`, `findById` (TDD)

- [ ] **Step 1: Add tests** to `announcements.service.admin.spec.ts`:

  - `create` writes a new doc with `createdBy` from arg, `audience` defaulting to `'all'`, returns `AnnouncementAdminItem`.
  - `update` patches existing doc, throws `NotFoundException({ code: 'ANNOUNCEMENT_NOT_FOUND' })` on missing id.
  - `remove` deletes doc, returns void, throws `NotFoundException` on missing id.
  - `findById` returns single item or throws.
  - `BadRequestException({ code: 'INVALID_ANNOUNCEMENT_ID' })` on `Types.ObjectId.isValid` false.

  Expected: **6 new tests**.

- [ ] **Step 2: Run (fail)**.

- [ ] **Step 3: Implement** `create`/`update`/`remove`/`findById` on the service. Mirror the [admin-users.service.ts](apps/be/src/admin/admin-users.service.ts) shape (ObjectId validity check → BadRequest, missing → NotFound, `findByIdAndUpdate({ new: true, lean: true })`, `populate('createdBy', '_id displayName')` after the operation).

- [ ] **Step 4: Run — pass**.

- [ ] **Step 5: Commit**

```bash
git add apps/be/src/announcements/announcements.service.ts apps/be/src/announcements/announcements.service.admin.spec.ts
git commit -m "feat(announcements): service create/update/remove with NotFound handling (ARC-608)"
```

---

## Phase 4 — Backend admin controller (TDD)

**Files:**

- Create: `apps/be/src/announcements/admin-announcements.controller.ts`
- Create: `apps/be/src/announcements/admin-announcements.controller.spec.ts`

### Task 4.1 — Controller integration tests (TDD)

- [ ] **Step 1: Write failing tests**

`apps/be/src/announcements/admin-announcements.controller.spec.ts` — cover (using a `Test.createTestingModule` with mocked service):

1. `GET /admin/announcements` returns list (delegates to service).
2. `POST /admin/announcements` creates → service called with body + `createdBy = req.user.userId`.
3. `PATCH /admin/announcements/:id` updates → service called with id + body.
4. `DELETE /admin/announcements/:id` returns 204.
5. `RolesGuard` rejects role `'user'` (mock the guard test like [roles.guard.spec.ts](apps/be/src/auth/guards/roles.guard.spec.ts)).
6. `JwtAuthGuard` rejects when no token.
7. DTO `forbidNonWhitelisted` rejects unknown body fields (`{ extraField: 1 }`).
8. DTO rejects `ctaHref: 'javascript:alert(1)'`.
9. DTO rejects `endsAt < startsAt`.
10. `pageSize=999` → 400.
11. Invalid id on PATCH/DELETE → 400 (BadRequest from service).

Reference test harness: [apps/be/src/admin/admin-users.controller.spec.ts](apps/be/src/admin/admin-users.controller.spec.ts) — wire `ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true })` and supertest.

Expected: **~10 tests**.

- [ ] **Step 2: Run (fail — controller not yet implemented)**.

- [ ] **Step 3: Implement**

`apps/be/src/announcements/admin-announcements.controller.ts`:

```ts
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import type { AuthenticatedUser } from '../auth/jwt/jwt.strategy';
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { ListAdminAnnouncementsDto } from './dto/list-admin-announcements.dto';
import type {
  AnnouncementAdminItem,
  AnnouncementsAdminListResponse,
} from './interfaces/announcement.interface';

interface RequestWithUser {
  user?: AuthenticatedUser;
}

@Controller('admin/announcements')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminAnnouncementsController {
  constructor(private readonly service: AnnouncementsService) {}

  @Get()
  list(
    @Query() query: ListAdminAnnouncementsDto,
  ): Promise<AnnouncementsAdminListResponse> {
    return this.service.listForAdmin(query);
  }

  @Post()
  create(
    @Body() body: CreateAnnouncementDto,
    @Req() req: RequestWithUser,
  ): Promise<AnnouncementAdminItem> {
    const userId = req.user?.userId ?? '';
    return this.service.create(body, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: UpdateAnnouncementDto,
  ): Promise<AnnouncementAdminItem> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
```

- [ ] **Step 4: Run — pass**.

- [ ] **Step 5: Commit**

```bash
git add apps/be/src/announcements/admin-announcements.controller.ts apps/be/src/announcements/admin-announcements.controller.spec.ts
git commit -m "feat(announcements): admin CRUD controller with role guard (ARC-608)"
```

---

## Phase 5 — Backend public controller (TDD)

**Files:**

- Create: `apps/be/src/announcements/public-announcements.controller.ts`
- Create: `apps/be/src/announcements/public-announcements.controller.spec.ts`

### Task 5.1 — Public controller (TDD)

- [ ] **Step 1: Write failing tests**

Cover:

- Anonymous request → `service.getActiveForCaller(false, 'en')`.
- Authenticated request → `service.getActiveForCaller(true, 'en')`.
- `?locale=ru` → service called with `'ru'`.
- `?locale=invalid` → 400 from `IsIn` validation.
- `Accept-Language: ru` header → service called with `'ru'`.
- `Accept-Language: ja` (unsupported) → falls back to `'en'`.
- Response sets `Cache-Control: private, max-age=30, stale-while-revalidate=60`.
- Returns `{ announcement: null }` when service returns null (not 404).

Expected: **~7 tests**.

- [ ] **Step 2: Run (fail)**.

- [ ] **Step 3: Implement**

`apps/be/src/announcements/public-announcements.controller.ts`:

```ts
import {
  Controller,
  Get,
  Headers,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { OptionalJwtAuthGuard } from '../auth/jwt/optional-jwt.guard';
import type { AuthenticatedUser } from '../auth/jwt/jwt.strategy';
import { AnnouncementsService } from './announcements.service';
import { ActiveAnnouncementDto } from './dto/active-announcement.dto';
import {
  ANNOUNCEMENT_LOCALES,
  type AnnouncementLocale,
} from './schemas/announcement.schema';
import type { AnnouncementPublicItem } from './interfaces/announcement.interface';

interface RequestWithUser {
  user?: AuthenticatedUser;
}

const LOCALE_SET = new Set<AnnouncementLocale>(ANNOUNCEMENT_LOCALES);

function pickLocaleFromHeader(
  acceptLanguage: string | undefined,
): AnnouncementLocale {
  if (!acceptLanguage) return 'en';
  const langs = acceptLanguage
    .split(',')
    .map((s) => s.split(';')[0].trim().toLowerCase().slice(0, 2));
  for (const lang of langs) {
    if (LOCALE_SET.has(lang as AnnouncementLocale)) {
      return lang as AnnouncementLocale;
    }
  }
  return 'en';
}

@Controller('announcements')
@UseGuards(OptionalJwtAuthGuard)
export class PublicAnnouncementsController {
  constructor(private readonly service: AnnouncementsService) {}

  @Get('active')
  async active(
    @Query() query: ActiveAnnouncementDto,
    @Headers('accept-language') acceptLanguage: string | undefined,
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ announcement: AnnouncementPublicItem | null }> {
    const locale = query.locale ?? pickLocaleFromHeader(acceptLanguage);
    const isAuthenticated = !!req.user;
    res.setHeader(
      'Cache-Control',
      'private, max-age=30, stale-while-revalidate=60',
    );
    const announcement = await this.service.getActiveForCaller(
      isAuthenticated,
      locale,
    );
    return { announcement };
  }
}
```

**Note on `OptionalJwtAuthGuard`:** if no such guard exists, create one as a thin extension of `JwtAuthGuard` that overrides `handleRequest` to return `null` on `info`/`err` instead of throwing. Add it at `apps/be/src/auth/jwt/optional-jwt.guard.ts` and a 4-line spec.

```ts
// apps/be/src/auth/jwt/optional-jwt.guard.ts
import { ExecutionContext, Injectable } from '@nestjs/common';
import { JwtAuthGuard } from './jwt.guard';

@Injectable()
export class OptionalJwtAuthGuard extends JwtAuthGuard {
  handleRequest<TUser>(err: unknown, user: TUser | false): TUser | null {
    return user || null;
  }
}
```

- [ ] **Step 4: Run — pass**.

- [ ] **Step 5: Commit**

```bash
git add apps/be/src/announcements/public-announcements.controller.ts apps/be/src/announcements/public-announcements.controller.spec.ts apps/be/src/auth/jwt/optional-jwt.guard.ts
git commit -m "feat(announcements): public active endpoint with locale fallback + cache headers (ARC-608)"
```

---

## Phase 6 — Backend module wiring

**Files:**

- Create: `apps/be/src/announcements/announcements.module.ts`
- Modify: `apps/be/src/app.module.ts`

### Task 6.1 — Module + register

- [ ] **Step 1: Write the module**

`apps/be/src/announcements/announcements.module.ts`:

```ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { RolesGuard } from '../auth/guards/roles.guard';
import {
  Announcement,
  AnnouncementSchema,
} from './schemas/announcement.schema';
import { AnnouncementsService } from './announcements.service';
import { AdminAnnouncementsController } from './admin-announcements.controller';
import { PublicAnnouncementsController } from './public-announcements.controller';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Announcement.name, schema: AnnouncementSchema },
    ]),
  ],
  controllers: [AdminAnnouncementsController, PublicAnnouncementsController],
  providers: [AnnouncementsService, RolesGuard],
  exports: [AnnouncementsService],
})
export class AnnouncementsModule {}
```

- [ ] **Step 2: Register in `app.module.ts`** — add `AnnouncementsModule` import and entry in the `imports` array (after `AdminModule`).

- [ ] **Step 3: Run full BE test suite**

`pnpm --filter be test` — all tests pass; new module loads without circular deps.

- [ ] **Step 4: Run BE build**

`pnpm --filter be build` — clean.

- [ ] **Step 5: Commit**

```bash
git add apps/be/src/announcements/announcements.module.ts apps/be/src/app.module.ts
git commit -m "feat(announcements): wire AnnouncementsModule into app (ARC-608)"
```

---

## Phase 7 — FE shared widget libs (TDD)

**Files:**

- Create: `apps/web/src/widgets/AnnouncementBanner/lib/dismissedStorage.ts`
- Create: `apps/web/src/widgets/AnnouncementBanner/lib/dismissedStorage.test.ts`
- Create: `apps/web/src/widgets/AnnouncementBanner/lib/ctaHrefSafety.ts`
- Create: `apps/web/src/widgets/AnnouncementBanner/lib/ctaHrefSafety.test.ts`

### Task 7.1 — `dismissedStorage` (TDD)

- [ ] **Step 1: Write failing tests** — round-trip (`addDismissed` then `isDismissed`), FIFO cap at 50, malformed JSON → empty list, SSR-safe (no-op when `window` is undefined; `vitest-environment node` block).

  Expected: **~6 tests**.

- [ ] **Step 2: Run (fail)**.

- [ ] **Step 3: Implement**

```ts
const KEY = 'arc:announcements:dismissed';
const CAP = 50;

export interface DismissedEntry {
  id: string;
  updatedAt: string;
}

function safeParse(raw: string | null): DismissedEntry[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is DismissedEntry =>
        !!e &&
        typeof e === 'object' &&
        typeof (e as { id?: unknown }).id === 'string' &&
        typeof (e as { updatedAt?: unknown }).updatedAt === 'string',
    );
  } catch {
    return [];
  }
}

export function getDismissed(): DismissedEntry[] {
  if (typeof window === 'undefined') return [];
  return safeParse(window.localStorage.getItem(KEY));
}

export function addDismissed(entry: DismissedEntry): void {
  if (typeof window === 'undefined') return;
  const existing = getDismissed().filter((e) => e.id !== entry.id);
  const next = [entry, ...existing].slice(0, CAP);
  window.localStorage.setItem(KEY, JSON.stringify(next));
}

export function isDismissed(entry: DismissedEntry): boolean {
  return getDismissed().some(
    (e) => e.id === entry.id && e.updatedAt === entry.updatedAt,
  );
}
```

- [ ] **Step 4: Run — pass**.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/widgets/AnnouncementBanner/lib/dismissedStorage.ts apps/web/src/widgets/AnnouncementBanner/lib/dismissedStorage.test.ts
git commit -m "feat(announcements-banner): add dismissedStorage helper (ARC-608)"
```

### Task 7.2 — `ctaHrefSafety` (TDD)

- [ ] **Step 1: Write failing tests** — same vectors as the BE `IsSafeUrl` test (https/http/relative ok; javascript:/data:/no-leading-slash rejected).

  Expected: **~7 tests**.

- [ ] **Step 2: Run (fail)**. **Step 3: Implement**:

```ts
const ALLOW = /^(https?:\/\/|\/)/;
const DENY = /^javascript:/i;

export function isSafeCtaHref(href: string | undefined): boolean {
  if (!href) return false;
  if (DENY.test(href)) return false;
  return ALLOW.test(href);
}
```

- [ ] **Step 4: Run — pass**. **Step 5: Commit**.

---

## Phase 8 — FE banner widget (TDD)

**Files:**

- Create: `apps/web/src/widgets/AnnouncementBanner/api.ts`
- Create: `apps/web/src/widgets/AnnouncementBanner/api.test.ts`
- Create: `apps/web/src/widgets/AnnouncementBanner/hooks/useActiveAnnouncement.ts`
- Create: `apps/web/src/widgets/AnnouncementBanner/hooks/useActiveAnnouncement.test.ts`
- Create: `apps/web/src/widgets/AnnouncementBanner/ui/AnnouncementBanner.tsx`
- Create: `apps/web/src/widgets/AnnouncementBanner/ui/AnnouncementBanner.test.tsx`
- Modify: `apps/web/src/app/layout.tsx`

### Task 8.1 — `api.ts` + `api.test.ts` (TDD)

- [ ] **Step 1: Failing tests** — `buildActiveAnnouncementUrl({ locale: 'ru' })` → `/announcements/active?locale=ru`; `fetchActiveAnnouncement` calls `apiClient.get` with optional token; returns `data.announcement`.

  Expected: **~4 tests**.

- [ ] **Step 2: Implement**:

```ts
import { apiClient } from '@/shared/lib/api-client';

export type AnnouncementSeverity = 'info' | 'warning' | 'critical';

export interface AnnouncementPublicItem {
  id: string;
  severity: AnnouncementSeverity;
  updatedAt: string;
  title: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export interface FetchActiveOptions {
  locale?: string;
  accessToken?: string | null;
}

export function buildActiveAnnouncementUrl(opts: FetchActiveOptions): string {
  const qs = new URLSearchParams();
  if (opts.locale) qs.set('locale', opts.locale);
  const s = qs.toString();
  return s ? `/announcements/active?${s}` : '/announcements/active';
}

export async function fetchActiveAnnouncement(
  opts: FetchActiveOptions,
): Promise<AnnouncementPublicItem | null> {
  const url = buildActiveAnnouncementUrl(opts);
  const res = await apiClient.get<{
    announcement: AnnouncementPublicItem | null;
  }>(url, opts.accessToken ? { token: opts.accessToken } : undefined);
  return res.announcement;
}
```

- [ ] **Step 3: Commit**.

### Task 8.2 — `useActiveAnnouncement` hook (TDD)

- [ ] **Step 1: Failing tests** in `useActiveAnnouncement.test.ts` (RTL `renderHook`):

  - Returns `null` when API resolves to `null`.
  - Returns the announcement when API resolves to one.
  - Filters by `isDismissed` (mock the storage module): if dismissed for non-critical → returns `null`.
  - For `severity: 'critical'`, returns the announcement even when dismissed.
  - When `updatedAt` differs from the stored dismissal, banner is shown again.
  - Polling: after 60 s with `document.visibilityState === 'visible'`, fetcher fires again. With `'hidden'`, no fetch. (Use fake timers + `Object.defineProperty(document, 'visibilityState', …)`.)

  Expected: **~6 tests**.

- [ ] **Step 2: Implement**:

```ts
'use client';
import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@/shared/hooks/useQuery';
import { useSessionStore } from '@/entities/session/store/sessionStore';
import { useLanguage } from '@/shared/i18n/context';
import { fetchActiveAnnouncement, type AnnouncementPublicItem } from '../api';
import { isDismissed } from '../lib/dismissedStorage';

export const ACTIVE_ANNOUNCEMENT_REFRESH_KEY = 'announcement-active';

export function useActiveAnnouncement(): {
  data: AnnouncementPublicItem | null;
  refetch: () => void;
} {
  const accessToken = useSessionStore((s) => s.snapshot.accessToken);
  const { locale } = useLanguage();
  const query = useQuery<AnnouncementPublicItem | null>({
    queryKey: ['announcement-active', locale, accessToken ?? null],
    queryFn: () => fetchActiveAnnouncement({ locale, accessToken }),
    refreshKey: ACTIVE_ANNOUNCEMENT_REFRESH_KEY,
  });

  const [tick, setTick] = useState(0);

  useEffect(() => {
    const handler = () => setTick((t) => t + 1);
    window.addEventListener('focus', handler);
    return () => window.removeEventListener('focus', handler);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        void query.refetch();
      }
    }, 60_000);
    return () => window.clearInterval(id);
  }, [query]);

  useEffect(() => {
    if (tick > 0) void query.refetch();
  }, [tick, query]);

  const filtered = useMemo<AnnouncementPublicItem | null>(() => {
    const a = query.data ?? null;
    if (!a) return null;
    if (a.severity === 'critical') return a;
    return isDismissed({ id: a.id, updatedAt: a.updatedAt }) ? null : a;
  }, [query.data]);

  return { data: filtered, refetch: () => void query.refetch() };
}
```

- [ ] **Step 3: Run — pass**. **Commit.**

### Task 8.3 — `AnnouncementBanner` component (TDD)

- [ ] **Step 1: Failing tests** in `AnnouncementBanner.test.tsx`:

  - Renders nothing when hook returns `null`.
  - Renders title for each severity, with the right `role` (`status` for info/warning, `alert` for critical).
  - Clicking title with `body` toggles expanded state (body shown).
  - Clicking the `×` button calls `addDismissed` and hides the banner.
  - When `severity: 'critical'`, the close button is not rendered.
  - When `ctaHref` is `'javascript:alert(1)'`, the CTA link is hidden.
  - When `ctaHref` is a valid URL and `ctaLabel` is set, the CTA link is rendered with that href + label.

  Mock `useActiveAnnouncement` and `addDismissed`.

  Expected: **~9 tests**.

- [ ] **Step 2: Implement** the visual using Tamagui `XStack`/`YStack`/`Text` with severity-driven background tokens. Reference [packages/ui/src/components/ServerLoadingNotice/ServerLoadingNotice.tsx](packages/ui/src/components/ServerLoadingNotice/ServerLoadingNotice.tsx) for the banner shape. Use design tokens `$infoBackground`/`$warningBackground`/`$errorBackground`. Use HTML `<button>` (or `@arcadeum/ui` Button) for close — set `aria-label` from i18n key `widgets.announcementBanner.dismissAriaLabel`. Use `<a>` for CTA (external to `<a target="_blank" rel="noopener noreferrer">` if `https://`).

- [ ] **Step 3: Run — pass.** **Commit.**

### Task 8.4 — Mount in root layout

- [ ] **Step 1: Edit** `apps/web/src/app/layout.tsx`:

  ```tsx
  import { AnnouncementBanner } from '@/widgets/AnnouncementBanner/ui/AnnouncementBanner';
  // …
  <BrowserRegistry>
    <AnnouncementBanner />
    <Header />
    {children}
  </BrowserRegistry>;
  ```

  (Place above `<Header />` so the banner sits at the very top of the viewport per the spec ASCII mockup.)

- [ ] **Step 2: Run** `pnpm --filter web test` and `pnpm --filter web build` — both green.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/widgets/AnnouncementBanner apps/web/src/app/layout.tsx
git commit -m "feat(announcements-banner): mount widget in root layout (ARC-608)"
```

---

## Phase 9 — FE admin feature (TDD)

**Files:**

- Create: `apps/web/src/features/admin-announcements/api.ts` (+ test)
- Create: `apps/web/src/features/admin-announcements/hooks.ts` (+ test)
- Create: `apps/web/src/features/admin-announcements/lib/severityChip.ts` (+ test)
- Create: `apps/web/src/features/admin-announcements/lib/formatWindow.ts` (+ test)
- Create: `apps/web/src/features/admin-announcements/ui/AdminAnnouncementsFilters.tsx` (+ test)
- Create: `apps/web/src/features/admin-announcements/ui/AdminAnnouncementsTable.tsx` (+ test)
- Create: `apps/web/src/features/admin-announcements/ui/AnnouncementBannerPreview.tsx`
- Create: `apps/web/src/features/admin-announcements/ui/AdminAnnouncementForm.tsx` (+ test)

### Task 9.1 — `api.ts` (TDD)

- [ ] **Step 1: Failing tests** — URL builder pages encoded; `fetchAdminAnnouncements({ status: 'active' })` builds `?status=active`; `createAnnouncement(body, token)` posts to `/admin/announcements`; `updateAnnouncement(id, body, token)` patches; `deleteAnnouncement(id, token)` deletes.

  Expected: **~6 tests**.

- [ ] **Step 2: Implement** mirroring [admin-users/api.ts](apps/web/src/features/admin-users/api.ts). Add `apiClient.post`/`apiClient.del` if not yet present in `apps/web/src/shared/lib/api-client.ts` (it already has `get`/`patch`; add `post` and `del` minimal implementations and update its tests).

  > **If api-client lacks `post`/`del`:** create the missing methods following the `patch` shape, write 4 new test cases for them in `apps/web/src/shared/lib/api-client.test.ts`, and commit as a separate prep commit before the feature work.

- [ ] **Step 3: Commit**.

### Task 9.2 — `hooks.ts` (TDD)

- [ ] **Step 1: Failing tests** — `useAdminAnnouncements(args)` returns query; `useCreateAnnouncement().mutateAsync(body)` triggers refresh on both `ADMIN_ANNOUNCEMENTS_REFRESH_KEY` and `ACTIVE_ANNOUNCEMENT_REFRESH_KEY`. Same for update/delete.

  Expected: **~4 tests**.

- [ ] **Step 2: Implement** mirroring [admin-users/hooks.ts](apps/web/src/features/admin-users/hooks.ts). Use `useRefreshStore.triggerRefresh(...)` in `onSettled` of each mutation, calling both keys.

- [ ] **Step 3: Commit**.

### Task 9.3 — `lib/severityChip.ts` and `lib/formatWindow.ts` (TDD)

- [ ] Pure helpers, easy TDD: severity → token color name; `formatWindow(start, end, locale)` returns `'May 9 — May 16'` / `'May 9 — Forever'` / `'Now → May 16'` / `'Always'`. Use `Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' })`.

- [ ] Commit each separately.

### Task 9.4 — `AdminAnnouncementsFilters` (TDD)

- [ ] **Step 1: Failing tests** — debounced search calls `onChange` with `q` after 300 ms (use `vi.useFakeTimers`); filter changes reset `page` to 1 (caller responsibility — test verifies callback signature); status/severity dropdown wired; "+ New" button click fires `onNewClick`.

  Expected: **~5 tests**.

- [ ] **Step 2: Implement** mirroring `AdminPaymentsFilters` pattern but with three dropdowns + a button. Use `@arcadeum/ui` components (Input, Select, Button).

- [ ] **Step 3: Commit**.

### Task 9.5 — `AdminAnnouncementsTable` (TDD)

- [ ] **Step 1: Failing tests** — render rows with severity chip, audience chip, formatted window, "Now" pill when `status: 'active'`, edit/delete buttons fire callbacks, pagination prev/next disabled at edges (`aria-disabled` test pattern), empty state when `items: []`, loading skeleton when `isLoading`.

  Expected: **~10 tests**.

- [ ] **Step 2: Implement** mirroring `AdminPaymentsTable` — table, chips, pagination controls.

  Use `<span title={fullText}>` for the truncated title cell (Tamagui `Text` does not accept `title`).

- [ ] **Step 3: Commit**.

### Task 9.6 — `AnnouncementBannerPreview`

- [ ] No test required — pure presentation. Renders the same banner as the live widget but takes the form's current state as props (no hook). Commit alongside the form.

### Task 9.7 — `AdminAnnouncementForm` (TDD)

- [ ] **Step 1: Failing tests**:

  - All 5 locale tabs render; switching tab preserves the other tab's input state (controlled by parent).
  - Submitting with empty `en.title` shows inline error.
  - Submitting with `endsAt < startsAt` shows inline error.
  - Submitting valid create payload calls `onSubmit` with the right shape (severity, audience, startsAt as ISO, endsAt as ISO, content map with only filled-in locales).
  - In `mode: 'edit'`, prefills from the `initial` prop.
  - Preview reflects current form state in real-time (rerender after typing in title input).

  Expected: **~7 tests**.

- [ ] **Step 2: Implement** as a controlled form. Use `useState` for the field model. No external form library — keep it minimal. Validation in pure functions. Reuse `LocaleContent` shape from feature `api.ts`.

- [ ] **Step 3: Commit**.

---

## Phase 10 — FE admin route + sidebar

**Files:**

- Create: `apps/web/src/app/admin/announcements/page.tsx`
- Create: `apps/web/src/app/admin/announcements/AdminAnnouncementsClient.tsx`
- Modify: `apps/web/src/app/admin/_components/sidebarItems.ts`

### Task 10.1 — Server Component page

- [ ] **Step 1: Write `page.tsx`**

```tsx
import { requireAdmin } from '@/entities/session/api/requireAdmin';
import AdminAnnouncementsClient from './AdminAnnouncementsClient';

// No metadata export — inherit noindex/nofollow from /admin/layout.tsx.

export default async function AdminAnnouncementsPage() {
  await requireAdmin();
  return <AdminAnnouncementsClient />;
}
```

- [ ] **Step 2: Write `AdminAnnouncementsClient.tsx`**

Mirror `AdminPaymentsClient.tsx`: `'use client'`, manages `{ page, q, status, severity, modal: { mode, initial } | null }`. Composes `AdminAnnouncementsFilters` + `AdminAnnouncementsTable` + `AdminAnnouncementForm` modal + delete confirmation dialog. Uses `useAdminAnnouncements`, `useCreateAnnouncement`, `useUpdateAnnouncement`, `useDeleteAnnouncement`.

Calls `useLanguage()` to read the `pages.admin.announcements` namespace. Same conditional render guard pattern (`tableLabels` / `filtersLabels`) used by `AdminPaymentsClient`.

- [ ] **Step 3: Flip sidebar** — modify `apps/web/src/app/admin/_components/sidebarItems.ts`:

```ts
{ id: 'announcements', href: '/admin/announcements', enabled: true },
```

- [ ] **Step 4: Run `pnpm --filter web build`** — confirm new route shows in route table.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/app/admin/announcements apps/web/src/app/admin/_components/sidebarItems.ts
git commit -m "feat(admin-announcements): add /admin/announcements page and sidebar entry (ARC-608)"
```

---

## Phase 11 — i18n

**Files:**

- Modify: `apps/web/src/shared/i18n/messages/pages/{en,ru,es,fr,by}.ts`
- Modify: `apps/web/src/shared/i18n/messages/{en,ru,es,fr,by}.ts` (or wherever `widgets.announcementBanner` namespace lives — check the pattern of existing widget i18n)

### Task 11.1 — Add `pages.admin.announcements` namespace

- [ ] **Step 1: Inspect existing pattern**

Read [apps/web/src/shared/i18n/messages/pages/en.ts](apps/web/src/shared/i18n/messages/pages/en.ts) — find the `pages.admin.payments` block, mirror its shape.

- [ ] **Step 2: Add EN entries** under `admin.announcements`:

```ts
announcements: {
  title: 'Announcements',
  actions: { new: '+ New', edit: 'Edit', delete: 'Delete', cancel: 'Cancel', save: 'Save' },
  filters: {
    searchPlaceholder: 'Search by title…',
    status: { label: 'Status', all: 'All', active: 'Active', scheduled: 'Scheduled', expired: 'Expired' },
    severity: { label: 'Severity', all: 'All', info: 'Info', warning: 'Warning', critical: 'Critical' },
  },
  table: { title: 'Title', severity: 'Severity', audience: 'Audience', window: 'Window', createdBy: 'Created by', actions: 'Actions', nowPill: 'Now' },
  severity: { info: 'Info', warning: 'Warning', critical: 'Critical' },
  audience: { all: 'All', authenticated: 'Signed in', anonymous: 'Anonymous' },
  status: { active: 'Active', scheduled: 'Scheduled', expired: 'Expired' },
  form: {
    sections: { settings: 'Settings', content: 'Content', preview: 'Preview' },
    severity: 'Severity',
    audience: 'Audience',
    startsAt: 'Starts at',
    endsAt: 'Ends at',
    forever: 'No expiry',
    immediately: 'Immediately',
    tabs: { en: 'English', ru: 'Русский', es: 'Español', fr: 'Français', by: 'Беларуская' },
    title: 'Title',
    body: 'Body (optional)',
    ctaLabel: 'CTA label (optional)',
    ctaHref: 'CTA URL (optional)',
    errors: { titleRequired: 'English title is required', endsBeforeStarts: 'End time must be after start time', invalidUrl: 'Must be an https URL or a path starting with /' },
  },
  confirm: { delete: "Delete announcement '{title}'? This cannot be undone." },
  empty: { noResults: 'No announcements match your filters.', noAnnouncements: 'No announcements yet. Click + New to create one.' },
  pagination: { prev: 'Prev', next: 'Next', of: 'of' },
  totalLabel: 'Showing {start}–{end} of {total}',
}
```

- [ ] **Step 3: Translate to ru/es/fr/by**

Translate each string. Use the existing translations in `pages.admin.payments` as your guide for tone. Be mindful of Belarusian: prefer Cyrillic, e.g. `Анансы`, `Стваральнік`.

- [ ] **Step 4: Add `widgets.announcementBanner` namespace**

To `apps/web/src/shared/i18n/messages/{en,ru,es,fr,by}.ts` (or matching widgets file):

```ts
announcementBanner: {
  dismissAriaLabel: 'Dismiss announcement',
  expandAriaLabel: 'Show details',
  collapseAriaLabel: 'Hide details',
}
```

(Plus the 4 translations.)

- [ ] **Step 5: Validate**

`pnpm check-translations` → "✅ All translation keys are present!".

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/shared/i18n/messages
git commit -m "feat(admin-announcements): add i18n namespaces (ARC-608)"
```

---

## Phase 12 — E2E SEO regression + final verification

**Files:**

- Create: `apps/web/e2e/admin-announcements.spec.ts`

### Task 12.1 — SEO regression

- [ ] **Step 1: Write the test**

`apps/web/e2e/admin-announcements.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test.describe('/admin/announcements SEO regression', () => {
  test('robots.txt still disallows /admin/', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.status()).toBe(200);
    expect(await res.text()).toMatch(/Disallow:\s*\/admin\//);
  });

  test('sitemap.xml does not include /admin/announcements', async ({
    request,
  }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.status()).toBe(200);
    expect(await res.text()).not.toMatch(/\/admin\/announcements/);
  });
});
```

- [ ] **Step 2: Commit**.

### Task 12.2 — Final verification

- [ ] Run in parallel:

  - `pnpm test`
  - `pnpm lint`
  - `pnpm check-file-length`
  - `pnpm check-translations`
  - `pnpm build`

- [ ] All green. If any fail, drop back into the relevant phase and fix.

### Task 12.3 — Manual smoke (local dev or staging)

- [ ] Sign in as admin, create one of each severity. Verify banner shows highest first.
- [ ] Dismiss → reload → still gone.
- [ ] Edit title → banner reappears with new title.
- [ ] Set audience `anonymous`, sign out → banner shows; sign in → hidden.
- [ ] Set `startsAt = tomorrow` → banner hidden today.

### Task 12.4 — Push and PR

- [ ] `git push -u origin ARC-608` (use `--no-verify` only if local pre-push e2e infra is unavailable, after confirming with the user).
- [ ] `gh pr create --base develop --head ARC-608 --title "feat(admin): announcements (ARC-608)" --body …` with What/Why/Test plan structure mirroring PR #609.

---

## Risks during execution

| Risk                                                                                           | Mitigation                                                                                                                      |
| ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `OptionalJwtAuthGuard` doesn't exist; creating it touches auth code.                           | Smallest possible extension of `JwtAuthGuard` (override `handleRequest`). 4-line spec. No regression to existing auth behavior. |
| Mongoose `string` enum sort gives wrong severity order.                                        | `aggregate` pipeline with `_rank` `$switch` — included in service spec.                                                         |
| `apiClient.post`/`del` don't exist.                                                            | Add them with tests in a separate prep commit before Phase 9.                                                                   |
| `endsAt: null` accidentally treated as "now" by `$lte: null` quirk.                            | Explicit `{ $or: [{ endsAt: null }, { endsAt: { $gt: now } }] }` — covered by `buildActiveFilter` tests.                        |
| Tamagui `<Text>` doesn't accept native `title` attribute → truncated cell loses tooltip.       | Wrap in `<span title={fullText}>{children}</span>`.                                                                             |
| Test that close button is hidden for critical: absent attribute returns `null`, not `'false'`. | Use `not.toBeInTheDocument()` (or `queryByRole('button')` returns `null`).                                                      |

## Reminders

- DRY: lift any duplicated regex/severity logic into `lib/`.
- YAGNI: don't add a `/announcements` history page, no read receipts, no markdown.
- TDD: failing test → implement → passing test → commit. Don't batch.
- Commits: small, conventional, with `(ARC-608)` footer.
