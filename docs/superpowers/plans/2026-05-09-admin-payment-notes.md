# Admin Payment Notes Viewer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an admin-only `/admin/payments` page backed by `GET /admin/payments/notes` that lists every entry in the existing `payment-notes` collection (public + private), with search and visibility filter, mirroring the patterns from ARC-604 (admin user list).

**Architecture:** Read-only feature. New `AdminPaymentNotesController` + new `listForAdmin()` method on the existing `PaymentNotesService`. FE follows the ARC-604 layout: Server Component `page.tsx` → `'use client'` `AdminPaymentsClient.tsx` → `useAdminPaymentNotes` hook → `apiClient.get` → BE. Sidebar's previously-disabled `payments` item flips to enabled and links here. No mutations in v1.

**Tech Stack:** NestJS, Mongoose (`PaymentNote`, `User`), class-validator/class-transformer, Next.js 16 (Server Components), Tamagui (`@arcadeum/ui`), Jest (BE), Vitest (FE), Playwright (e2e).

**Spec:** [docs/superpowers/specs/2026-05-09-admin-payment-notes-design.md](../specs/2026-05-09-admin-payment-notes-design.md)

---

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
- `apps/web/src/app/admin/_components/sidebarItems.ts` — flip `payments`
  entry: `enabled: true, href: '/admin/payments'`
- `apps/web/src/shared/i18n/messages/pages/{en,ru,es,fr,by}.ts` — add
  `pages.admin.payments` namespace

---

## Phase 1 — BE DTO + interfaces

### Task 1.1: Response interface

**Files:**

- Create: `apps/be/src/payments/interfaces/admin-payment-note.interface.ts`

- [ ] **Step 1: Write the file**

```ts
// apps/be/src/payments/interfaces/admin-payment-note.interface.ts
export interface AdminPaymentNoteItem {
  id: string;
  note: string;
  amount: number;
  currency: string;
  displayName: string | null;
  createdAt: string; // ISO
  transactionId: string;
  isPublic: boolean;
  userId: string | null;
}

export interface AdminPaymentNotesResponse {
  items: AdminPaymentNoteItem[];
  total: number;
  page: number;
  pageSize: number;
}
```

---

### Task 1.2: Query DTO

**Files:**

- Create: `apps/be/src/payments/dto/list-admin-notes.dto.ts`

- [ ] **Step 1: Write the file**

```ts
// apps/be/src/payments/dto/list-admin-notes.dto.ts
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

- [ ] **Step 2: Verify BE compiles**

```bash
pnpm --filter be build
```

Expected: clean.

- [ ] **Step 3: Commit Phase 1**

```bash
git add apps/be/src/payments/dto/ apps/be/src/payments/interfaces/
git commit -m "feat(payments): add admin DTO + AdminPaymentNoteItem interface (ARC-607)"
```

---

## Phase 2 — `PaymentNotesService.listForAdmin` (TDD)

### Task 2.1: Failing service tests

**Files:**

- Create: `apps/be/src/payments/payment-notes.service.admin.spec.ts`

- [ ] **Step 1: Write the spec**

The mocked `noteModel`/`userModel` return chainable query builders for
the `find().sort().skip().limit().lean()` chain. Pattern matches
`apps/be/src/admin/admin-users.service.spec.ts` from ARC-604.

```ts
// apps/be/src/payments/payment-notes.service.admin.spec.ts
import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { PaymentNotesService } from './payment-notes.service';
import { PaymentNote } from './schemas/payment-note.schema';
import { User } from '../auth/schemas/user.schema';

const oid = () => new Types.ObjectId();

const buildNote = (
  overrides: Partial<{
    _id: Types.ObjectId;
    note: string;
    amount: number;
    currency: string;
    userId: Types.ObjectId | null;
    displayName: string | null;
    transactionId: string;
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
  }> = {},
) => ({
  _id: overrides._id ?? oid(),
  note: overrides.note ?? 'Thanks',
  amount: overrides.amount ?? 5,
  currency: overrides.currency ?? 'USD',
  userId: overrides.userId ?? null,
  displayName: overrides.displayName ?? null,
  transactionId: overrides.transactionId ?? 'tx_1',
  isPublic: overrides.isPublic ?? true,
  createdAt: overrides.createdAt ?? new Date('2026-01-01T00:00:00Z'),
  updatedAt: overrides.updatedAt ?? new Date('2026-01-02T00:00:00Z'),
});

const buildFindChain = (returnDocs: unknown[]) => ({
  sort: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  lean: jest.fn().mockResolvedValue(returnDocs),
});

const buildUserFindChain = (returnDocs: unknown[]) => ({
  select: jest.fn().mockReturnThis(),
  lean: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue(returnDocs),
});

describe('PaymentNotesService.listForAdmin', () => {
  let service: PaymentNotesService;
  let noteModel: {
    find: jest.Mock;
    countDocuments: jest.Mock;
  };
  let userModel: { find: jest.Mock };

  beforeEach(async () => {
    noteModel = {
      find: jest.fn(),
      countDocuments: jest.fn(),
    };
    userModel = { find: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        PaymentNotesService,
        { provide: getModelToken(PaymentNote.name), useValue: noteModel },
        { provide: getModelToken(User.name), useValue: userModel },
      ],
    }).compile();

    service = moduleRef.get(PaymentNotesService);
  });

  it('returns paginated results sorted by { createdAt: -1, _id: -1 }', async () => {
    const docs = [buildNote()];
    const findChain = buildFindChain(docs);
    noteModel.find.mockReturnValue(findChain);
    noteModel.countDocuments.mockResolvedValue(1);

    const result = await service.listForAdmin({ page: 1, pageSize: 50 });

    expect(noteModel.find).toHaveBeenCalledWith({});
    expect(findChain.sort).toHaveBeenCalledWith({ createdAt: -1, _id: -1 });
    expect(findChain.skip).toHaveBeenCalledWith(0);
    expect(findChain.limit).toHaveBeenCalledWith(50);
    expect(result.total).toBe(1);
    expect(result.items[0]?.note).toBe('Thanks');
  });

  it('skips correctly for higher pages (1-based)', async () => {
    const findChain = buildFindChain([]);
    noteModel.find.mockReturnValue(findChain);
    noteModel.countDocuments.mockResolvedValue(0);

    await service.listForAdmin({ page: 3, pageSize: 25 });
    expect(findChain.skip).toHaveBeenCalledWith(50);
  });

  it("visibility 'public' filters to { isPublic: true }", async () => {
    noteModel.find.mockReturnValue(buildFindChain([]));
    noteModel.countDocuments.mockResolvedValue(0);
    await service.listForAdmin({ visibility: 'public' });
    expect(noteModel.find).toHaveBeenCalledWith({ isPublic: true });
  });

  it("visibility 'private' filters to { isPublic: false }", async () => {
    noteModel.find.mockReturnValue(buildFindChain([]));
    noteModel.countDocuments.mockResolvedValue(0);
    await service.listForAdmin({ visibility: 'private' });
    expect(noteModel.find).toHaveBeenCalledWith({ isPublic: false });
  });

  it("visibility 'all' applies no isPublic constraint", async () => {
    noteModel.find.mockReturnValue(buildFindChain([]));
    noteModel.countDocuments.mockResolvedValue(0);
    await service.listForAdmin({ visibility: 'all' });
    const calls = noteModel.find.mock.calls as unknown as Array<unknown[]>;
    const filter = calls[0]?.[0] as Record<string, unknown>;
    expect(filter).not.toHaveProperty('isPublic');
  });

  it('q matches across note, displayName, transactionId case-insensitively', async () => {
    noteModel.find.mockReturnValue(buildFindChain([]));
    noteModel.countDocuments.mockResolvedValue(0);
    await service.listForAdmin({ q: 'alice' });

    const calls = noteModel.find.mock.calls as unknown as Array<unknown[]>;
    expect(calls[0]?.[0]).toEqual({
      $or: [
        { note: { $regex: 'alice', $options: 'i' } },
        { displayName: { $regex: 'alice', $options: 'i' } },
        { transactionId: { $regex: 'alice', $options: 'i' } },
      ],
    });
  });

  it('treats whitespace-only q as no filter', async () => {
    noteModel.find.mockReturnValue(buildFindChain([]));
    noteModel.countDocuments.mockResolvedValue(0);
    await service.listForAdmin({ q: '   ' });

    const calls = noteModel.find.mock.calls as unknown as Array<unknown[]>;
    expect(calls[0]?.[0]).toEqual({});
  });

  it('escapes regex metacharacters in q', async () => {
    noteModel.find.mockReturnValue(buildFindChain([]));
    noteModel.countDocuments.mockResolvedValue(0);
    await service.listForAdmin({ q: 'a*b+c(d' });

    const calls = noteModel.find.mock.calls as unknown as Array<unknown[]>;
    const filter = calls[0]?.[0] as {
      $or: Array<{ note: { $regex: string } }>;
    };
    expect(filter.$or?.[0]?.note?.$regex).toBe('a\\*b\\+c\\(d');
  });

  it('combines q + visibility', async () => {
    noteModel.find.mockReturnValue(buildFindChain([]));
    noteModel.countDocuments.mockResolvedValue(0);
    await service.listForAdmin({ q: 'a', visibility: 'private' });

    const calls = noteModel.find.mock.calls as unknown as Array<unknown[]>;
    const filter = calls[0]?.[0] as Record<string, unknown>;
    expect(filter.isPublic).toBe(false);
    expect(filter.$or).toBeDefined();
  });

  it('enriches userId-bearing notes with User.displayName', async () => {
    const userId = oid();
    const note = buildNote({ userId });
    noteModel.find.mockReturnValue(buildFindChain([note]));
    noteModel.countDocuments.mockResolvedValue(1);
    userModel.find.mockReturnValue(
      buildUserFindChain([
        { _id: userId, displayName: 'Alice', username: 'alice' },
      ]),
    );

    const result = await service.listForAdmin({});

    expect(result.items[0]?.displayName).toBe('Alice');
  });

  it('regression: User join uses .select("_id displayName username")', async () => {
    const userId = oid();
    const note = buildNote({ userId });
    noteModel.find.mockReturnValue(buildFindChain([note]));
    noteModel.countDocuments.mockResolvedValue(1);
    const userChain = buildUserFindChain([
      { _id: userId, displayName: 'Alice', username: 'alice' },
    ]);
    userModel.find.mockReturnValue(userChain);

    await service.listForAdmin({});

    expect(userChain.select).toHaveBeenCalledWith('_id displayName username');
  });

  it('falls back to displayName field when userId is null', async () => {
    const note = buildNote({ userId: null, displayName: 'Anon McGuest' });
    noteModel.find.mockReturnValue(buildFindChain([note]));
    noteModel.countDocuments.mockResolvedValue(1);

    const result = await service.listForAdmin({});

    expect(result.items[0]?.displayName).toBe('Anon McGuest');
  });

  it('maps doc -> AdminPaymentNoteItem with all admin fields', async () => {
    const noteId = oid();
    const note = buildNote({
      _id: noteId,
      transactionId: 'tx_42',
      isPublic: false,
      userId: null,
      displayName: 'Anon',
    });
    noteModel.find.mockReturnValue(buildFindChain([note]));
    noteModel.countDocuments.mockResolvedValue(1);

    const result = await service.listForAdmin({});
    const item = result.items[0];
    expect(item).toBeDefined();
    if (!item) return;

    expect(item).toEqual({
      id: noteId.toString(),
      note: 'Thanks',
      amount: 5,
      currency: 'USD',
      displayName: 'Anon',
      createdAt: note.createdAt.toISOString(),
      transactionId: 'tx_42',
      isPublic: false,
      userId: null,
    });
  });

  it('total is independent of pagination slice', async () => {
    noteModel.find.mockReturnValue(buildFindChain([buildNote()]));
    noteModel.countDocuments.mockResolvedValue(123);

    const result = await service.listForAdmin({ page: 1, pageSize: 1 });
    expect(result.total).toBe(123);
    expect(result.items.length).toBe(1);
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

```bash
pnpm --filter be exec jest src/payments/payment-notes.service.admin.spec.ts
```

Expected: FAIL — `service.listForAdmin is not a function`.

---

### Task 2.2: Implement `listForAdmin`

**Files:**

- Modify: `apps/be/src/payments/payment-notes.service.ts`

- [ ] **Step 1: Add the lean type + new method**

In `payment-notes.service.ts`, add the `LeanPaymentNote` interface near
the top (after the existing `NoteWithUser` / `PaginatedNotes` exports)
and append the `listForAdmin` method to the class. Required imports:

```ts
import { escapeRegExp } from '../admin/lib/escape-regexp';
import type {
  AdminPaymentNoteItem,
  AdminPaymentNotesResponse,
} from './interfaces/admin-payment-note.interface';
import type { AdminNotesVisibility } from './dto/list-admin-notes.dto';
```

Then below the existing `getNotes`:

```ts
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

interface ListForAdminArgs {
  page?: number;
  pageSize?: number;
  q?: string;
  visibility?: AdminNotesVisibility;
}

async listForAdmin(args: ListForAdminArgs): Promise<AdminPaymentNotesResponse> {
  const page = args.page ?? 1;
  const pageSize = args.pageSize ?? 50;
  const visibility = args.visibility ?? 'all';

  const filter: Record<string, unknown> = {};
  if (visibility === 'public') filter.isPublic = true;
  else if (visibility === 'private') filter.isPublic = false;

  const trimmed = args.q?.trim();
  if (trimmed) {
    const escaped = escapeRegExp(trimmed);
    filter.$or = [
      { note: { $regex: escaped, $options: 'i' } },
      { displayName: { $regex: escaped, $options: 'i' } },
      { transactionId: { $regex: escaped, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * pageSize;

  const [docs, total] = await Promise.all([
    this.noteModel
      .find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(pageSize)
      .lean<LeanPaymentNote[]>(),
    this.noteModel.countDocuments(filter),
  ]);

  // Enrich userId-bearing notes (mirror the pattern in getNotes).
  const userIds = docs
    .filter((d): d is LeanPaymentNote & { userId: Types.ObjectId } =>
      d.userId !== null && d.userId !== undefined,
    )
    .map((d) => d.userId);

  const users =
    userIds.length > 0
      ? await this.userModel
          .find({ _id: { $in: userIds } })
          .select('_id displayName username')
          .lean()
          .exec()
      : [];

  const userMap = new Map(
    users.map((u) => [
      (u._id as Types.ObjectId).toString(),
      u.displayName || u.username,
    ]),
  );

  const items: AdminPaymentNoteItem[] = docs.map((d) => ({
    id: d._id.toString(),
    note: d.note,
    amount: d.amount,
    currency: d.currency,
    displayName: d.userId
      ? userMap.get(d.userId.toString()) || null
      : d.displayName ?? null,
    createdAt: d.createdAt.toISOString(),
    transactionId: d.transactionId,
    isPublic: d.isPublic,
    userId: d.userId ? d.userId.toString() : null,
  }));

  return { items, total, page, pageSize };
}
```

- [ ] **Step 2: Run, expect PASS**

```bash
pnpm --filter be exec jest src/payments/payment-notes.service.admin.spec.ts
```

Expected: 14 tests pass.

- [ ] **Step 3: Commit Phase 2**

```bash
git add apps/be/src/payments/payment-notes.service.ts apps/be/src/payments/payment-notes.service.admin.spec.ts
git commit -m "feat(payments): add PaymentNotesService.listForAdmin (ARC-607)

Paginated, searchable, visibility-filterable lookup over the
payment-notes collection. Reuses escapeRegExp helper from ARC-604.
Pins User join to .select('_id displayName username') so
passwordHash never ships.

14 unit tests cover pagination, visibility branches, q escaping,
whitespace-only q, User enrichment + .select() regression,
displayName fallback for anonymous notes, and total independence
from pagination.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Phase 3 — BE controller + module wiring

### Task 3.1: Controller

**Files:**

- Create: `apps/be/src/payments/admin-payment-notes.controller.ts`

- [ ] **Step 1: Write**

```ts
// apps/be/src/payments/admin-payment-notes.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { PaymentNotesService } from './payment-notes.service';
import { ListAdminNotesDto } from './dto/list-admin-notes.dto';
import type { AdminPaymentNotesResponse } from './interfaces/admin-payment-note.interface';

@Controller('admin/payments/notes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminPaymentNotesController {
  constructor(private readonly notesService: PaymentNotesService) {}

  @Get()
  list(@Query() query: ListAdminNotesDto): Promise<AdminPaymentNotesResponse> {
    return this.notesService.listForAdmin(query);
  }
}
```

---

### Task 3.2: Register in PaymentsModule

**Files:**

- Modify: `apps/be/src/payments/payments.module.ts`

- [ ] **Step 1: Add controller and RolesGuard provider**

Add the imports near the top:

```ts
import { AdminPaymentNotesController } from './admin-payment-notes.controller';
import { RolesGuard } from '../auth/guards/roles.guard';
```

Update the `@Module` decorator:

```ts
controllers: [PaymentsController, AdminPaymentNotesController],
providers: [PaymentsService, PaymentNotesService, RolesGuard],
```

(`exports` stays unchanged. `RolesGuard` doesn't need to be exported.)

- [ ] **Step 2: Verify build**

```bash
pnpm --filter be build
```

Expected: clean.

---

### Task 3.3: Controller integration test

**Files:**

- Create: `apps/be/src/payments/admin-payment-notes.controller.spec.ts`

This follows the same pattern as `apps/be/src/admin/admin-users.controller.spec.ts`
from ARC-604: override `JwtAuthGuard` and `RolesGuard` to short-circuit
both, register a global `ValidationPipe` in the test app to mirror
production, and exercise the controller's wiring + DTO validation.

- [ ] **Step 1: Write the spec**

```ts
// apps/be/src/payments/admin-payment-notes.controller.spec.ts
import {
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AdminPaymentNotesController } from './admin-payment-notes.controller';
import { PaymentNotesService } from './payment-notes.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { PaymentNote } from './schemas/payment-note.schema';
import { User } from '../auth/schemas/user.schema';

interface ResponseBody {
  items: unknown[];
  total: number;
  page: number;
  pageSize: number;
}
type ServerHandle = Parameters<typeof request>[0];

describe('AdminPaymentNotesController (integration)', () => {
  let app: INestApplication<App>;
  const server = (): ServerHandle => app.getHttpServer();
  let noteModel: { find: jest.Mock; countDocuments: jest.Mock };
  let userModel: { find: jest.Mock };

  const buildFindChain = (returnDocs: unknown[]) => ({
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue(returnDocs),
  });

  beforeAll(async () => {
    noteModel = { find: jest.fn(), countDocuments: jest.fn() };
    userModel = { find: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      controllers: [AdminPaymentNotesController],
      providers: [
        PaymentNotesService,
        { provide: getModelToken(PaymentNote.name), useValue: noteModel },
        { provide: getModelToken(User.name), useValue: userModel },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx: ExecutionContext) => {
          ctx.switchToHttp().getRequest().user = {
            userId: 'u1',
            email: 'me@x',
            username: 'me',
          };
          return true;
        },
      })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    noteModel.find.mockReset();
    noteModel.countDocuments.mockReset();
    userModel.find.mockReset();
  });

  it('returns 200 with default pagination', async () => {
    noteModel.find.mockReturnValue(buildFindChain([]));
    noteModel.countDocuments.mockResolvedValue(0);

    const res = await request(server())
      .get('/admin/payments/notes')
      .expect(200);
    expect(res.body as unknown).toEqual({
      items: [],
      total: 0,
      page: 1,
      pageSize: 50,
    });
  });

  it('rejects pageSize=999 with 400 (proves global ValidationPipe registered)', async () => {
    await request(server())
      .get('/admin/payments/notes?pageSize=999')
      .expect(400);
  });

  it('rejects unknown query param (forbidNonWhitelisted)', async () => {
    await request(server()).get('/admin/payments/notes?nope=1').expect(400);
  });

  it('rejects invalid visibility enum with 400', async () => {
    await request(server())
      .get('/admin/payments/notes?visibility=invalid')
      .expect(400);
  });

  it('passes query through to service (page=2, pageSize=25, visibility=private)', async () => {
    noteModel.find.mockReturnValue(buildFindChain([]));
    noteModel.countDocuments.mockResolvedValue(0);

    const res = await request(server())
      .get('/admin/payments/notes?page=2&pageSize=25&visibility=private')
      .expect(200);

    const body = res.body as ResponseBody;
    expect(body.page).toBe(2);
    expect(body.pageSize).toBe(25);
    expect(noteModel.find).toHaveBeenCalledWith({ isPublic: false });
  });
});
```

- [ ] **Step 2: Run, expect PASS**

```bash
pnpm --filter be exec jest src/payments/admin-payment-notes.controller.spec.ts
```

Expected: 5 tests pass.

- [ ] **Step 3: Commit Phase 3**

```bash
git add apps/be/src/payments/admin-payment-notes.controller.ts apps/be/src/payments/admin-payment-notes.controller.spec.ts apps/be/src/payments/payments.module.ts
git commit -m "feat(payments): add AdminPaymentNotesController (ARC-607)

Admin-guarded GET /admin/payments/notes wires PaymentNotesService.
listForAdmin into the HTTP pipeline. 5 integration tests including
the pageSize=999 -> 400 proof that the global ValidationPipe is
registered.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Phase 4 — FE api.ts (TDD)

### Task 4.1: Failing api tests

**Files:**

- Create: `apps/web/src/features/admin-payments/api.test.ts`

- [ ] **Step 1: Write**

```ts
// apps/web/src/features/admin-payments/api.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/shared/lib/api-client', () => ({
  apiClient: { get: vi.fn() },
}));

import { apiClient } from '@/shared/lib/api-client';
import { buildAdminPaymentsUrl, fetchAdminPaymentNotes } from './api';

const apiGetMock = apiClient.get as unknown as ReturnType<typeof vi.fn>;

beforeEach(() => {
  apiGetMock.mockReset();
});

describe('buildAdminPaymentsUrl', () => {
  it('returns plain path when args empty', () => {
    expect(buildAdminPaymentsUrl({})).toBe('/admin/payments/notes');
  });

  it('serializes page + pageSize', () => {
    expect(buildAdminPaymentsUrl({ page: 2, pageSize: 25 })).toBe(
      '/admin/payments/notes?page=2&pageSize=25',
    );
  });

  it('serializes q + visibility', () => {
    expect(buildAdminPaymentsUrl({ q: 'al', visibility: 'private' })).toBe(
      '/admin/payments/notes?q=al&visibility=private',
    );
  });

  it("omits visibility when 'all' (default)", () => {
    expect(buildAdminPaymentsUrl({ visibility: 'all' })).toBe(
      '/admin/payments/notes',
    );
  });

  it('omits empty/whitespace q', () => {
    expect(buildAdminPaymentsUrl({ q: '   ' })).toBe('/admin/payments/notes');
  });
});

describe('fetchAdminPaymentNotes', () => {
  it('calls apiClient.get with built URL and token', async () => {
    apiGetMock.mockResolvedValueOnce({
      items: [],
      total: 0,
      page: 1,
      pageSize: 50,
    });

    await fetchAdminPaymentNotes({ page: 2 }, 'tok');

    expect(apiGetMock).toHaveBeenCalledWith('/admin/payments/notes?page=2', {
      token: 'tok',
    });
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

---

### Task 4.2: Implement `api.ts`

**Files:**

- Create: `apps/web/src/features/admin-payments/api.ts`

- [ ] **Step 1: Write**

```ts
// apps/web/src/features/admin-payments/api.ts
import { apiClient } from '@/shared/lib/api-client';

export type AdminNotesVisibility = 'public' | 'private' | 'all';

export interface AdminPaymentNoteItem {
  id: string;
  note: string;
  amount: number;
  currency: string;
  displayName: string | null;
  createdAt: string;
  transactionId: string;
  isPublic: boolean;
  userId: string | null;
}

export interface AdminPaymentNotesResponse {
  items: AdminPaymentNoteItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ListAdminPaymentNotesArgs {
  page?: number;
  pageSize?: number;
  q?: string;
  visibility?: AdminNotesVisibility;
}

export function buildAdminPaymentsUrl(args: ListAdminPaymentNotesArgs): string {
  const qs = new URLSearchParams();
  if (args.page) qs.set('page', String(args.page));
  if (args.pageSize) qs.set('pageSize', String(args.pageSize));
  if (args.q && args.q.trim()) qs.set('q', args.q);
  if (args.visibility && args.visibility !== 'all') {
    qs.set('visibility', args.visibility);
  }
  const qsStr = qs.toString();
  return qsStr ? `/admin/payments/notes?${qsStr}` : '/admin/payments/notes';
}

export async function fetchAdminPaymentNotes(
  args: ListAdminPaymentNotesArgs,
  accessToken: string,
): Promise<AdminPaymentNotesResponse> {
  return apiClient.get<AdminPaymentNotesResponse>(buildAdminPaymentsUrl(args), {
    token: accessToken,
  });
}
```

- [ ] **Step 2: Run, expect PASS**

- [ ] **Step 3: Commit Phase 4**

```bash
git add apps/web/src/features/admin-payments/api.ts apps/web/src/features/admin-payments/api.test.ts
git commit -m "feat(admin-payments): add api.ts (ARC-607)"
```

---

## Phase 5 — FE hooks.ts (TDD)

### Task 5.1: Hook tests

**Files:**

- Create: `apps/web/src/features/admin-payments/hooks.test.ts`

- [ ] **Step 1: Write** (mirrors `apps/web/src/features/admin-users/hooks.test.ts`)

```ts
// apps/web/src/features/admin-payments/hooks.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

vi.mock('@/shared/lib/api-client', () => ({
  apiClient: { get: vi.fn() },
}));

const triggerRefreshMock = vi.fn();
vi.mock('@/shared/model/useRefreshStore', () => ({
  useRefreshStore: (
    selector: (state: {
      triggerRefresh: typeof triggerRefreshMock;
      getSignal: () => number;
    }) => unknown,
  ) =>
    selector({
      triggerRefresh: triggerRefreshMock,
      getSignal: () => 0,
    }),
}));

const sessionStateRef: { accessToken: string | null } = { accessToken: 'tok' };
vi.mock('@/entities/session/store/sessionStore', () => ({
  useSessionStore: (
    selector: (state: { snapshot: { accessToken: string | null } }) => unknown,
  ) => selector({ snapshot: sessionStateRef }),
}));

import { apiClient } from '@/shared/lib/api-client';
import { useAdminPaymentNotes } from './hooks';

const apiGetMock = apiClient.get as unknown as ReturnType<typeof vi.fn>;

beforeEach(() => {
  apiGetMock.mockReset();
  sessionStateRef.accessToken = 'tok';
});

describe('useAdminPaymentNotes', () => {
  it('fetches when token present', async () => {
    apiGetMock.mockResolvedValueOnce({
      items: [],
      total: 0,
      page: 1,
      pageSize: 50,
    });

    renderHook(() => useAdminPaymentNotes({ page: 1, pageSize: 50 }));
    await waitFor(() => expect(apiGetMock).toHaveBeenCalled());
  });

  it('is disabled when no access token', async () => {
    sessionStateRef.accessToken = null;
    const { result } = renderHook(() =>
      useAdminPaymentNotes({ page: 1, pageSize: 50 }),
    );
    await new Promise((r) => setTimeout(r, 50));
    expect(apiGetMock).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeNull();
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

---

### Task 5.2: Implement `hooks.ts`

**Files:**

- Create: `apps/web/src/features/admin-payments/hooks.ts`

- [ ] **Step 1: Write**

```ts
// apps/web/src/features/admin-payments/hooks.ts
'use client';

import { useQuery } from '@/shared/hooks/useQuery';
import { useSessionStore } from '@/entities/session/store/sessionStore';
import {
  fetchAdminPaymentNotes,
  type AdminPaymentNotesResponse,
  type ListAdminPaymentNotesArgs,
} from './api';

export const ADMIN_PAYMENTS_REFRESH_KEY = 'admin-payments';

export function useAdminPaymentNotes(args: ListAdminPaymentNotesArgs) {
  const accessToken = useSessionStore((s) => s.snapshot.accessToken);
  return useQuery<AdminPaymentNotesResponse>({
    queryKey: [
      'admin-payments',
      args.page ?? 1,
      args.pageSize ?? 50,
      args.q ?? '',
      args.visibility ?? 'all',
    ],
    queryFn: () => fetchAdminPaymentNotes(args, accessToken!),
    refreshKey: ADMIN_PAYMENTS_REFRESH_KEY,
    enabled: !!accessToken,
  });
}
```

- [ ] **Step 2: Run, expect PASS**

- [ ] **Step 3: Commit Phase 5**

```bash
git add apps/web/src/features/admin-payments/hooks.ts apps/web/src/features/admin-payments/hooks.test.ts
git commit -m "feat(admin-payments): add useAdminPaymentNotes hook (ARC-607)"
```

---

## Phase 6 — FE UI components

### Task 6.1: AdminPaymentsFilters

**Files:**

- Create: `apps/web/src/features/admin-payments/ui/AdminPaymentsFilters.tsx`

- [ ] **Step 1: Write** (no separate test file — covered by AdminPaymentsTable.test.tsx integration)

```tsx
// apps/web/src/features/admin-payments/ui/AdminPaymentsFilters.tsx
'use client';
import { useEffect, useState } from 'react';
import { XStack } from 'tamagui';
import { useDebounce } from '@/shared/hooks/useDebounce';
import type { AdminNotesVisibility } from '../api';

export interface AdminPaymentsFiltersLabels {
  searchPlaceholder: string;
  visibilityLabel: string;
  visibilityAll: string;
  visibilityPublic: string;
  visibilityPrivate: string;
}

export interface AdminPaymentsFiltersProps {
  q: string;
  visibility: AdminNotesVisibility;
  onChange: (next: { q: string; visibility: AdminNotesVisibility }) => void;
  labels: AdminPaymentsFiltersLabels;
}

export function AdminPaymentsFilters({
  q,
  visibility,
  onChange,
  labels,
}: AdminPaymentsFiltersProps) {
  const [localQ, setLocalQ] = useState(q);
  const debouncedQ = useDebounce(localQ, 300);

  useEffect(() => {
    if (debouncedQ !== q) {
      onChange({ q: debouncedQ, visibility });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ]);

  return (
    <XStack gap="$3" alignItems="center" flexWrap="wrap">
      <input
        placeholder={labels.searchPlaceholder}
        value={localQ}
        onChange={(e) => setLocalQ(e.target.value)}
        style={{
          padding: '6px 10px',
          borderRadius: 6,
          border: '1px solid #555',
          background: 'transparent',
          color: 'inherit',
          minWidth: 260,
        }}
      />
      <select
        data-testid="visibility-filter"
        value={visibility}
        onChange={(e) =>
          onChange({
            q: localQ,
            visibility: e.target.value as AdminNotesVisibility,
          })
        }
        style={{
          padding: '6px 10px',
          borderRadius: 6,
          border: '1px solid #555',
          background: 'transparent',
          color: 'inherit',
        }}
      >
        <option value="all">{labels.visibilityAll}</option>
        <option value="public">{labels.visibilityPublic}</option>
        <option value="private">{labels.visibilityPrivate}</option>
      </select>
    </XStack>
  );
}
```

---

### Task 6.2: AdminPaymentsTable

**Files:**

- Create: `apps/web/src/features/admin-payments/ui/AdminPaymentsTable.tsx`

- [ ] **Step 1: Write**

```tsx
// apps/web/src/features/admin-payments/ui/AdminPaymentsTable.tsx
'use client';
import { Button, YStack, XStack } from '@arcadeum/ui';
import { Spinner, Text, View } from 'tamagui';
import type { AdminPaymentNoteItem } from '../api';

export interface AdminPaymentsTableLabels {
  empty: { noNotes: string; noResults: string };
  pagination: { prev: string; next: string; of: string };
  totalLabel: string;
  chipPublic: string;
  chipPrivate: string;
  anonymous: string;
}

export interface AdminPaymentsTableProps {
  items: AdminPaymentNoteItem[];
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  isError: boolean;
  hasFilter: boolean;
  onPageChange: (next: number) => void;
  labels: AdminPaymentsTableLabels;
}

function formatAmount(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

function truncate(s: string, max: number): string {
  return s.length > max ? `${s.slice(0, max)}…` : s;
}

export function AdminPaymentsTable({
  items,
  total,
  page,
  pageSize,
  isLoading,
  hasFilter,
  onPageChange,
  labels,
}: AdminPaymentsTableProps) {
  if (isLoading && items.length === 0) {
    return (
      <YStack alignItems="center" padding="$4">
        <Spinner />
      </YStack>
    );
  }

  if (!isLoading && items.length === 0) {
    return (
      <YStack
        alignItems="center"
        padding="$4"
        data-testid="admin-payments-empty"
      >
        <Text opacity={0.7}>
          {hasFilter ? labels.empty.noResults : labels.empty.noNotes}
        </Text>
      </YStack>
    );
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <YStack gap="$2" data-testid="admin-payments-table">
      <Text opacity={0.7} fontSize="$1">
        {labels.totalLabel.replace('{total}', String(total))}
      </Text>
      {items.map((it) => (
        <XStack
          key={it.id}
          gap="$3"
          alignItems="center"
          paddingVertical="$2"
          borderBottomWidth={1}
          borderColor="$borderColor"
          data-testid={`payment-row-${it.id}`}
        >
          <View flex={1}>
            <Text fontWeight="700">{it.displayName ?? labels.anonymous}</Text>
            <Text opacity={0.5} fontSize="$1" fontFamily="monospace">
              {it.transactionId}
            </Text>
          </View>
          <Text width={120} textAlign="right">
            {formatAmount(it.amount, it.currency)}
          </Text>
          <Text flex={2} title={it.note}>
            {truncate(it.note, 200)}
          </Text>
          <View
            paddingHorizontal="$2"
            paddingVertical="$1"
            borderRadius="$2"
            backgroundColor={it.isPublic ? '$green3' : '$gray3'}
            data-testid={`visibility-${it.id}`}
          >
            <Text
              fontSize="$1"
              fontWeight="700"
              color={it.isPublic ? '$green9' : '$gray9'}
            >
              {it.isPublic ? labels.chipPublic : labels.chipPrivate}
            </Text>
          </View>
          <Text opacity={0.6} fontSize="$1">
            {new Date(it.createdAt).toLocaleString()}
          </Text>
        </XStack>
      ))}
      <XStack
        gap="$3"
        alignItems="center"
        justifyContent="center"
        paddingTop="$3"
      >
        <Button onPress={() => onPageChange(page - 1)} disabled={page <= 1}>
          {labels.pagination.prev}
        </Button>
        <Text>
          {labels.pagination.of
            .replace('{current}', String(page))
            .replace('{total}', String(totalPages))}
        </Text>
        <Button
          onPress={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          {labels.pagination.next}
        </Button>
      </XStack>
    </YStack>
  );
}
```

---

### Task 6.3: AdminPaymentsTable tests

**Files:**

- Create: `apps/web/src/features/admin-payments/ui/AdminPaymentsTable.test.tsx`

- [ ] **Step 1: Write**

```tsx
// apps/web/src/features/admin-payments/ui/AdminPaymentsTable.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TamaguiProvider } from 'tamagui';
import config from '@/shared/config/tamagui.config';
import {
  AdminPaymentsTable,
  type AdminPaymentsTableLabels,
} from './AdminPaymentsTable';
import type { AdminPaymentNoteItem } from '../api';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <TamaguiProvider config={config} defaultTheme="dark">
    {children}
  </TamaguiProvider>
);

const renderWith = (ui: React.ReactElement) => render(<Wrapper>{ui}</Wrapper>);

const labels: AdminPaymentsTableLabels = {
  empty: { noNotes: 'no notes', noResults: 'no results' },
  pagination: {
    prev: 'Prev',
    next: 'Next',
    of: 'Page {current} of {total}',
  },
  totalLabel: '{total} notes',
  chipPublic: 'Public',
  chipPrivate: 'Private',
  anonymous: 'Anonymous',
};

const baseProps = {
  items: [],
  total: 0,
  page: 1,
  pageSize: 50,
  isLoading: false,
  isError: false,
  hasFilter: false,
  onPageChange: () => {},
  labels,
};

const sampleItem: AdminPaymentNoteItem = {
  id: 'n1',
  note: 'Thanks for the donation!',
  amount: 5,
  currency: 'USD',
  displayName: 'Alice',
  createdAt: '2026-01-01T00:00:00Z',
  transactionId: 'tx_abc',
  isPublic: true,
  userId: null,
};

describe('AdminPaymentsTable', () => {
  it('shows noNotes when empty + no filter', () => {
    renderWith(<AdminPaymentsTable {...baseProps} />);
    expect(screen.getByText('no notes')).toBeInTheDocument();
  });

  it('shows noResults when empty + filter active', () => {
    renderWith(<AdminPaymentsTable {...baseProps} hasFilter />);
    expect(screen.getByText('no results')).toBeInTheDocument();
  });

  it('renders rows with displayName, transactionId, formatted amount', () => {
    renderWith(
      <AdminPaymentsTable {...baseProps} items={[sampleItem]} total={1} />,
    );
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('tx_abc')).toBeInTheDocument();
    expect(screen.getByText(/Thanks for the donation/)).toBeInTheDocument();
  });

  it('renders Anonymous placeholder when displayName is null', () => {
    renderWith(
      <AdminPaymentsTable
        {...baseProps}
        items={[{ ...sampleItem, displayName: null }]}
        total={1}
      />,
    );
    expect(screen.getByText('Anonymous')).toBeInTheDocument();
  });

  it('renders Public chip for isPublic: true', () => {
    renderWith(
      <AdminPaymentsTable {...baseProps} items={[sampleItem]} total={1} />,
    );
    expect(screen.getByText('Public')).toBeInTheDocument();
  });

  it('renders Private chip for isPublic: false', () => {
    renderWith(
      <AdminPaymentsTable
        {...baseProps}
        items={[{ ...sampleItem, isPublic: false }]}
        total={1}
      />,
    );
    expect(screen.getByText('Private')).toBeInTheDocument();
  });

  it('falls back to "<amount> <currency>" when Intl.NumberFormat throws', () => {
    renderWith(
      <AdminPaymentsTable
        {...baseProps}
        items={[{ ...sampleItem, currency: 'NOTACURRENCY' }]}
        total={1}
      />,
    );
    expect(screen.getByText('5 NOTACURRENCY')).toBeInTheDocument();
  });

  it('renders pagination text', () => {
    renderWith(
      <AdminPaymentsTable {...baseProps} items={[sampleItem]} total={120} />,
    );
    expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run, expect PASS**

```bash
pnpm --filter web exec vitest run src/features/admin-payments/
```

Expected: api/hooks/UI tests all pass.

- [ ] **Step 3: Commit Phase 6**

```bash
git add apps/web/src/features/admin-payments/ui/
git commit -m "feat(admin-payments): add UI primitives (Filters, Table) (ARC-607)

AdminPaymentsFilters has debounced search + visibility dropdown.
AdminPaymentsTable handles empty/loading/loaded states, public/private
chips, anonymous fallback, Intl.NumberFormat with try/catch fallback,
pagination footer.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Phase 7 — i18n in 5 locales

### Task 7.1: Add `pages.admin.payments` namespace

**Files:**

- Modify: `apps/web/src/shared/i18n/messages/pages/{en,ru,es,fr,by}.ts`

For each locale: add a new `payments` block under the existing `admin`
namespace (alongside `users`, `nav`, `error`).

- [ ] **Step 1: Add to `en.ts`**

```ts
// Inside admin: { ... }, after the existing `users` block:
payments: {
  title: 'Payments',
  search: { placeholder: 'Search by note, name, or transaction id' },
  filter: {
    visibility: {
      label: 'Visibility',
      all: 'All',
      public: 'Public only',
      private: 'Private only',
    },
  },
  table: {
    user: 'User',
    amount: 'Amount',
    note: 'Note',
    visibility: 'Visibility',
    createdAt: 'Created',
    transactionId: 'Transaction',
  },
  chip: {
    public: 'Public',
    private: 'Private',
    anonymous: 'Anonymous',
  },
  empty: {
    noResults: 'No payment notes match your filters.',
    noNotes: 'No payment notes yet.',
  },
  pagination: {
    prev: 'Previous',
    next: 'Next',
    of: 'Page {current} of {total}',
  },
  totalLabel: '{total} notes',
},
```

- [ ] **Step 2: Add the same shape to `ru.ts`, `es.ts`, `fr.ts`, `by.ts`**

Use these translations:

**`ru.ts`:**

```ts
payments: {
  title: 'Платежи',
  search: { placeholder: 'Поиск по тексту, имени или ID транзакции' },
  filter: {
    visibility: {
      label: 'Видимость',
      all: 'Все',
      public: 'Только публичные',
      private: 'Только приватные',
    },
  },
  table: {
    user: 'Пользователь',
    amount: 'Сумма',
    note: 'Заметка',
    visibility: 'Видимость',
    createdAt: 'Создано',
    transactionId: 'Транзакция',
  },
  chip: {
    public: 'Публичная',
    private: 'Приватная',
    anonymous: 'Аноним',
  },
  empty: {
    noResults: 'Нет платежей по фильтру.',
    noNotes: 'Платежей пока нет.',
  },
  pagination: {
    prev: 'Назад',
    next: 'Вперёд',
    of: 'Страница {current} из {total}',
  },
  totalLabel: '{total} платежей',
},
```

**`es.ts`:**

```ts
payments: {
  title: 'Pagos',
  search: { placeholder: 'Buscar por nota, nombre o ID de transacción' },
  filter: {
    visibility: {
      label: 'Visibilidad',
      all: 'Todos',
      public: 'Solo públicos',
      private: 'Solo privados',
    },
  },
  table: {
    user: 'Usuario',
    amount: 'Monto',
    note: 'Nota',
    visibility: 'Visibilidad',
    createdAt: 'Creado',
    transactionId: 'Transacción',
  },
  chip: { public: 'Público', private: 'Privado', anonymous: 'Anónimo' },
  empty: {
    noResults: 'No hay pagos que coincidan con los filtros.',
    noNotes: 'Aún no hay pagos.',
  },
  pagination: {
    prev: 'Anterior',
    next: 'Siguiente',
    of: 'Página {current} de {total}',
  },
  totalLabel: '{total} notas',
},
```

**`fr.ts`:**

```ts
payments: {
  title: 'Paiements',
  search: { placeholder: 'Recherche par note, nom ou ID de transaction' },
  filter: {
    visibility: {
      label: 'Visibilité',
      all: 'Tous',
      public: 'Publics seulement',
      private: 'Privés seulement',
    },
  },
  table: {
    user: 'Utilisateur',
    amount: 'Montant',
    note: 'Note',
    visibility: 'Visibilité',
    createdAt: 'Créé le',
    transactionId: 'Transaction',
  },
  chip: { public: 'Public', private: 'Privé', anonymous: 'Anonyme' },
  empty: {
    noResults: 'Aucun paiement ne correspond aux filtres.',
    noNotes: 'Aucun paiement pour le moment.',
  },
  pagination: {
    prev: 'Précédent',
    next: 'Suivant',
    of: 'Page {current} sur {total}',
  },
  totalLabel: '{total} notes',
},
```

**`by.ts`:**

```ts
payments: {
  title: 'Плацяжы',
  search: { placeholder: 'Пошук па нататцы, імі або ID транзакцыі' },
  filter: {
    visibility: {
      label: 'Бачнасць',
      all: 'Усе',
      public: 'Толькі публічныя',
      private: 'Толькі прыватныя',
    },
  },
  table: {
    user: 'Карыстальнік',
    amount: 'Сума',
    note: 'Нататка',
    visibility: 'Бачнасць',
    createdAt: 'Створана',
    transactionId: 'Транзакцыя',
  },
  chip: {
    public: 'Публічная',
    private: 'Прыватная',
    anonymous: 'Аноним',
  },
  empty: {
    noResults: 'Няма плацяжоў па фільтру.',
    noNotes: 'Плацяжоў пакуль няма.',
  },
  pagination: {
    prev: 'Назад',
    next: 'Наперад',
    of: 'Старонка {current} з {total}',
  },
  totalLabel: '{total} плацяжоў',
},
```

- [ ] **Step 3: Verify**

```bash
pnpm check-translations
```

Expected: ✅ all keys present.

- [ ] **Step 4: Commit Phase 7**

```bash
git add apps/web/src/shared/i18n/messages/pages/
git commit -m "feat(i18n): add admin.payments namespace in 5 locales (ARC-607)"
```

---

## Phase 8 — Sidebar update

### Task 8.1: Enable the payments sidebar item

**Files:**

- Modify: `apps/web/src/app/admin/_components/sidebarItems.ts`

- [ ] **Step 1: Edit**

Change the `payments` entry from `{ id: 'payments', href: null,
enabled: false }` to:

```ts
{ id: 'payments', href: '/admin/payments', enabled: true },
```

The `id` literal is already in the union type (from ARC-602/604).

- [ ] **Step 2: Type-check**

```bash
cd apps/web && pnpm exec tsc --noEmit
```

Expected: clean.

- [ ] **Step 3: Commit Phase 8**

```bash
git add apps/web/src/app/admin/_components/sidebarItems.ts
git commit -m "feat(admin): enable Payments sidebar item linking to /admin/payments (ARC-607)"
```

---

## Phase 9 — `/admin/payments` route

### Task 9.1: page.tsx + AdminPaymentsClient

**Files:**

- Create: `apps/web/src/app/admin/payments/page.tsx`
- Create: `apps/web/src/app/admin/payments/AdminPaymentsClient.tsx`

- [ ] **Step 1: page.tsx**

```tsx
// apps/web/src/app/admin/payments/page.tsx
import { requireAdmin } from '@/entities/session/api/requireAdmin';
import AdminPaymentsClient from './AdminPaymentsClient';

// No metadata export — inherit noindex/nofollow from /admin/layout.tsx.

export default async function AdminPaymentsPage() {
  await requireAdmin();
  return <AdminPaymentsClient />;
}
```

- [ ] **Step 2: AdminPaymentsClient**

```tsx
// apps/web/src/app/admin/payments/AdminPaymentsClient.tsx
'use client';
import { useState } from 'react';
import { Container, PageLayout, PageTitle, YStack } from '@arcadeum/ui';
import { useLanguage } from '@/shared/i18n/context';
import { useAdminPaymentNotes } from '@/features/admin-payments/hooks';
import type { AdminNotesVisibility } from '@/features/admin-payments/api';
import { AdminPaymentsFilters } from '@/features/admin-payments/ui/AdminPaymentsFilters';
import { AdminPaymentsTable } from '@/features/admin-payments/ui/AdminPaymentsTable';

interface PaymentsI18n {
  title: string;
  search: { placeholder: string };
  filter: {
    visibility: {
      label: string;
      all: string;
      public: string;
      private: string;
    };
  };
  table: {
    user: string;
    amount: string;
    note: string;
    visibility: string;
    createdAt: string;
    transactionId: string;
  };
  chip: { public: string; private: string; anonymous: string };
  empty: { noResults: string; noNotes: string };
  pagination: { prev: string; next: string; of: string };
  totalLabel: string;
}

const PAGE_SIZE = 50;

export default function AdminPaymentsClient() {
  const { messages } = useLanguage();
  const t = messages.pages?.admin?.payments as PaymentsI18n | undefined;

  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [visibility, setVisibility] = useState<AdminNotesVisibility>('all');

  const {
    data,
    isLoading,
    error: queryError,
  } = useAdminPaymentNotes({
    page,
    pageSize: PAGE_SIZE,
    q,
    visibility,
  });

  const onFilterChange = (next: {
    q: string;
    visibility: AdminNotesVisibility;
  }) => {
    setQ(next.q);
    setVisibility(next.visibility);
    setPage(1);
  };

  const filtersLabels = t
    ? {
        searchPlaceholder: t.search.placeholder,
        visibilityLabel: t.filter.visibility.label,
        visibilityAll: t.filter.visibility.all,
        visibilityPublic: t.filter.visibility.public,
        visibilityPrivate: t.filter.visibility.private,
      }
    : null;

  const tableLabels = t
    ? {
        empty: t.empty,
        pagination: t.pagination,
        totalLabel: t.totalLabel,
        chipPublic: t.chip.public,
        chipPrivate: t.chip.private,
        anonymous: t.chip.anonymous,
      }
    : null;

  return (
    <PageLayout>
      <Container size="lg">
        <YStack gap="$3">
          <PageTitle size="lg">{t?.title ?? 'Payments'}</PageTitle>
          {filtersLabels && (
            <AdminPaymentsFilters
              q={q}
              visibility={visibility}
              onChange={onFilterChange}
              labels={filtersLabels}
            />
          )}
          {tableLabels && (
            <AdminPaymentsTable
              items={data?.items ?? []}
              total={data?.total ?? 0}
              page={page}
              pageSize={PAGE_SIZE}
              isLoading={isLoading}
              isError={!!queryError}
              hasFilter={!!q || visibility !== 'all'}
              onPageChange={setPage}
              labels={tableLabels}
            />
          )}
        </YStack>
      </Container>
    </PageLayout>
  );
}
```

- [ ] **Step 3: Verify build**

```bash
pnpm --filter web build
```

Expected: build clean. `/admin/payments` shows in route table.

- [ ] **Step 4: Commit Phase 9**

```bash
git add apps/web/src/app/admin/payments/
git commit -m "feat(admin): add /admin/payments page (ARC-607)

Server Component calls requireAdmin(); 'use client' shell composes
AdminPaymentsFilters + AdminPaymentsTable backed by
useAdminPaymentNotes. State: { page, q, visibility }. Read-only,
no mutations.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Phase 10 — Playwright e2e SEO regression

### Task 10.1: SEO pin

**Files:**

- Create: `apps/web/e2e/admin-payments.spec.ts`

- [ ] **Step 1: Write**

```ts
// apps/web/e2e/admin-payments.spec.ts
import { test, expect } from '@playwright/test';

/**
 * The role-based gate behavior of /admin/payments isn't e2e'd here for
 * the same reason as ARC-602/604/606: the Server Component fetch in
 * requireAdmin() runs in the Next.js Node process and Playwright's
 * page.route() only intercepts browser requests. Unit + integration
 * tests cover the behavior at the function level.
 */

test.describe('/admin/payments SEO regression', () => {
  test('robots.txt still disallows /admin/', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.status()).toBe(200);
    expect(await res.text()).toMatch(/Disallow:\s*\/admin\//);
  });

  test('sitemap.xml does not include /admin/payments', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.status()).toBe(200);
    expect(await res.text()).not.toMatch(/\/admin\/payments/);
  });
});
```

- [ ] **Step 2: Run**

```bash
cd apps/web && pnpm exec playwright test e2e/admin-payments.spec.ts --project=chromium --reporter=list
```

Expected: 2/2 pass.

- [ ] **Step 3: Commit Phase 10**

```bash
git add apps/web/e2e/admin-payments.spec.ts
git commit -m "test(e2e): add /admin/payments SEO regression pins (ARC-607)"
```

---

## Phase 11 — Final verification

### Task 11.1: Full repo

- [ ] **Step 1: Build**

```bash
pnpm build
```

Expected: clean.

- [ ] **Step 2: Tests**

```bash
pnpm test
```

Expected: prior totals + ~14 new BE service tests + 5 new BE controller
tests + ~7 new FE api tests + 2 new FE hook tests + ~8 new FE table
tests = roughly +36 tests over the baseline. Don't pin an absolute
count; other PRs can shift it.

- [ ] **Step 3: Lint + file-length + translations**

```bash
pnpm lint
pnpm check-file-length
pnpm check-translations
```

Expected: all green.

- [ ] **Step 4: Manual smoke**

- Promote a real user to admin (or use an existing admin)
- Visit `/admin` → click "Payments" in sidebar
- Verify the table renders with whatever payment-notes exist in the DB
- Try search across note/displayName/transactionId
- Try the visibility filter (All / Public / Private)
- Try pagination (if there are >50 notes)

If there are no notes, the empty-state message should render.

---

## Done When

- `GET /admin/payments/notes` returns paginated list of payment-notes
  with optional `q`/`visibility` filter, admin-only
- `/admin/payments` page renders the table behind the admin gate
- Sidebar's Payments item is enabled and links to `/admin/payments`
- Public/private chip displayed; anonymous notes show "Anonymous"
- Amount formatted via `Intl.NumberFormat` with try/catch fallback
- All 5 locales contain `pages.admin.payments.*`
- BE service: 14 unit tests pass; controller integration: 5 tests pass
- FE: api/hooks/table tests pass
- e2e SEO regression pins pass
- `pnpm build`, `pnpm test`, `pnpm lint`, `pnpm check-file-length`,
  `pnpm check-translations` all green

## Notes for the Implementer

- **Don't add features not in this plan.** No edit/delete of notes, no
  Stripe API integration, no per-user filter, no CSV export, no
  date-range filter.
- **Don't change `getNotes`.** The public endpoint is unchanged.
- **Reuse `escapeRegExp`** from `apps/be/src/admin/lib/escape-regexp.ts`
  — don't duplicate.
- **Pin the User join's `.select('_id displayName username')`** — the
  regression test asserts this exact projection string. This is the
  contract that prevents `passwordHash` leakage.
- **Frequent commits.** Each phase ends in a commit; don't bundle.
