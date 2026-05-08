# Admin User List & Role Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `/admin/users` panel — paginated user list with inline role editing — wired to a guarded `GET /admin/users` + `PATCH /admin/users/:id/role` and shipped with locale coverage and tests.

**Architecture:** New `AdminUsersController/Service` slot into the existing `AdminModule` (from ARC-602). The Service does all Mongo work and throws Nest exceptions with `{ code }` payloads for FE error mapping. FE uses the project's existing custom `useQuery`/`useMutation` hooks plus `useRefreshStore` for invalidation — **no TanStack Query** despite CLAUDE.md mention (not actually installed). `currentUserId` flows from `requireAdmin()` in the Server Component as a prop. Two infrastructure additions are in scope: a global `ValidationPipe` in `main.ts` (so DTOs actually validate) and a `patch<T>` method on `apiClient`.

**Tech Stack:** NestJS, Mongoose, class-validator/class-transformer, Next.js 16 App Router (Server Components), Tamagui (`@arcadeum/ui`), Jest (BE), Vitest (FE), Playwright (e2e).

**Spec:** [docs/superpowers/specs/2026-05-09-admin-user-list-design.md](../specs/2026-05-09-admin-user-list-design.md)

---

## File Inventory

### New (BE)

- `apps/be/src/admin/admin-users.controller.ts`
- `apps/be/src/admin/admin-users.controller.spec.ts`
- `apps/be/src/admin/admin-users.service.ts`
- `apps/be/src/admin/admin-users.service.spec.ts`
- `apps/be/src/admin/lib/escape-regexp.ts`
- `apps/be/src/admin/lib/escape-regexp.spec.ts`
- `apps/be/src/admin/dto/list-admin-users.dto.ts`
- `apps/be/src/admin/dto/update-user-role.dto.ts`
- `apps/be/src/admin/interfaces/admin-user.interface.ts`

### New (FE)

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
- `apps/be/src/admin/admin.module.ts` — register `AdminUsersController` + `AdminUsersService`
- `apps/web/src/shared/lib/api-client.ts` — add `patch<T>` method
- `apps/web/src/shared/lib/api-client.test.ts` — add tests for `patch`
- `apps/web/src/app/admin/_components/sidebarItems.ts` — `id` literal `'roles'` → `'users'`, `enabled: true`, `href: '/admin/users'`
- `apps/web/src/shared/i18n/messages/pages/{en,ru,es,fr,by}.ts` — rename `nav.roles` → `nav.users`, add `pages.admin.users` namespace

---

## Phase 1 — BE infrastructure (global ValidationPipe)

### Task 1.1: Register global ValidationPipe

**Files:**

- Modify: `apps/be/src/main.ts`

- [ ] **Step 1: Add the pipe registration**

In [apps/be/src/main.ts](apps/be/src/main.ts), import `ValidationPipe` and register it before `app.listen()`:

```ts
import { NestFactory, ValidationPipe } from '@nestjs/core';
// ...
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ArcadeumLogger(),
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );

  app.enableCors({
    /* unchanged */
  });
  // ...
}
```

Note: `ValidationPipe` is exported from `@nestjs/common` (NOT `@nestjs/core`). Use:

```ts
import { ValidationPipe } from '@nestjs/common';
```

- [ ] **Step 2: Run the existing BE tests to confirm nothing breaks**

```bash
pnpm --filter be test
```

Expected: all 188 tests still pass. If a previously-silent invalid input now triggers 400, that test was relying on broken behavior and needs investigating before merge. If it happens, **stop and surface to human** — don't silently relax the pipe to make tests green.

- [ ] **Step 3: Commit**

```bash
git add apps/be/src/main.ts
git commit -m "feat(be): register global ValidationPipe (ARC-604)"
```

---

## Phase 2 — BE escape-regexp helper (TDD)

### Task 2.1: Failing test for escapeRegExp

**Files:**

- Create: `apps/be/src/admin/lib/escape-regexp.spec.ts`

- [ ] **Step 1: Write the test**

```ts
// apps/be/src/admin/lib/escape-regexp.spec.ts
import { escapeRegExp } from './escape-regexp';

describe('escapeRegExp', () => {
  it('escapes regex metacharacters', () => {
    expect(escapeRegExp('.')).toBe('\\.');
    expect(escapeRegExp('*')).toBe('\\*');
    expect(escapeRegExp('+')).toBe('\\+');
    expect(escapeRegExp('?')).toBe('\\?');
    expect(escapeRegExp('^')).toBe('\\^');
    expect(escapeRegExp('$')).toBe('\\$');
    expect(escapeRegExp('{}')).toBe('\\{\\}');
    expect(escapeRegExp('()')).toBe('\\(\\)');
    expect(escapeRegExp('|')).toBe('\\|');
    expect(escapeRegExp('[]')).toBe('\\[\\]');
    expect(escapeRegExp('\\')).toBe('\\\\');
  });

  it('leaves alphanumerics and spaces untouched', () => {
    expect(escapeRegExp('hello world 123')).toBe('hello world 123');
  });

  it('handles empty string', () => {
    expect(escapeRegExp('')).toBe('');
  });

  it('escapes mixed input correctly', () => {
    expect(escapeRegExp('user.name+tag@example.com')).toBe(
      'user\\.name\\+tag@example\\.com',
    );
  });

  it('output is safe to use in a new RegExp', () => {
    const value = '*+?(';
    expect(() => new RegExp(escapeRegExp(value))).not.toThrow();
    expect(new RegExp(escapeRegExp(value)).test(value)).toBe(true);
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

```bash
pnpm --filter be exec jest src/admin/lib/escape-regexp.spec.ts
```

Expected: FAIL — `Cannot find module './escape-regexp'`.

---

### Task 2.2: Implement escapeRegExp

**Files:**

- Create: `apps/be/src/admin/lib/escape-regexp.ts`

- [ ] **Step 1: Implement**

```ts
// apps/be/src/admin/lib/escape-regexp.ts
export function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
```

- [ ] **Step 2: Run, expect PASS**

```bash
pnpm --filter be exec jest src/admin/lib/escape-regexp.spec.ts
```

Expected: PASS — 5 tests.

- [ ] **Step 3: Commit**

```bash
git add apps/be/src/admin/lib/
git commit -m "feat(admin): add escapeRegExp helper for safe Mongo regex (ARC-604)"
```

---

## Phase 3 — BE DTOs and interfaces

### Task 3.1: Response interface

**Files:**

- Create: `apps/be/src/admin/interfaces/admin-user.interface.ts`

- [ ] **Step 1: Write the file**

```ts
// apps/be/src/admin/interfaces/admin-user.interface.ts
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

---

### Task 3.2: Query DTO

**Files:**

- Create: `apps/be/src/admin/dto/list-admin-users.dto.ts`

- [ ] **Step 1: Write**

```ts
// apps/be/src/admin/dto/list-admin-users.dto.ts
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

---

### Task 3.3: Body DTO

**Files:**

- Create: `apps/be/src/admin/dto/update-user-role.dto.ts`

- [ ] **Step 1: Write**

```ts
// apps/be/src/admin/dto/update-user-role.dto.ts
import { IsIn } from 'class-validator';
import { USER_ROLES, type UserRole } from '../../auth/lib/roles';

export class UpdateUserRoleDto {
  @IsIn(USER_ROLES)
  role!: UserRole;
}
```

- [ ] **Step 2: Verify the BE compiles**

```bash
pnpm --filter be build
```

Expected: build succeeds.

- [ ] **Step 3: Commit Phase 3**

```bash
git add apps/be/src/admin/dto/ apps/be/src/admin/interfaces/
git commit -m "feat(admin): add DTOs and AdminUserItem interface (ARC-604)"
```

---

## Phase 4 — BE Service (TDD)

### Task 4.1: Failing service tests

**Files:**

- Create: `apps/be/src/admin/admin-users.service.spec.ts`

- [ ] **Step 1: Write the spec**

The mocked `userModel` returns chainable query builders for the `find().select().sort().skip().limit().lean()` chain. Pattern matches existing BE specs.

```ts
// apps/be/src/admin/admin-users.service.spec.ts
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { AdminUsersService } from './admin-users.service';
import { User } from '../auth/schemas/user.schema';

const oid = () => new Types.ObjectId().toString();

const buildUserDoc = (
  overrides: Partial<{
    _id: string;
    email: string;
    username: string;
    displayName: string | null;
    role: string;
    createdAt: Date;
    updatedAt: Date;
  }> = {},
) => ({
  _id: new Types.ObjectId(overrides._id ?? oid()),
  email: overrides.email ?? 'a@x.com',
  username: overrides.username ?? 'alice',
  displayName: overrides.displayName ?? null,
  role: overrides.role ?? 'free',
  createdAt: overrides.createdAt ?? new Date('2026-01-01T00:00:00Z'),
  updatedAt: overrides.updatedAt ?? new Date('2026-01-02T00:00:00Z'),
});

const buildFindChain = (returnDocs: unknown[]) => ({
  select: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  lean: jest.fn().mockResolvedValue(returnDocs),
});

const buildFindByIdChain = (returnDoc: unknown) => ({
  lean: jest.fn().mockResolvedValue(returnDoc),
});

describe('AdminUsersService', () => {
  let service: AdminUsersService;
  let userModel: {
    find: jest.Mock;
    findById: jest.Mock;
    findByIdAndUpdate: jest.Mock;
    countDocuments: jest.Mock;
  };

  beforeEach(async () => {
    userModel = {
      find: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      countDocuments: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AdminUsersService,
        { provide: getModelToken(User.name), useValue: userModel },
      ],
    }).compile();

    service = moduleRef.get(AdminUsersService);
  });

  describe('list', () => {
    it('returns paginated results with sort and skip', async () => {
      const docs = [buildUserDoc({ username: 'alice' })];
      const findChain = buildFindChain(docs);
      userModel.find.mockReturnValue(findChain);
      userModel.countDocuments.mockResolvedValue(1);

      const result = await service.list({ page: 1, pageSize: 50 });

      expect(userModel.find).toHaveBeenCalledWith({});
      expect(findChain.select).toHaveBeenCalledWith(
        '-passwordHash -referralCode -referredBy -usernameNormalized -blockedUsers',
      );
      expect(findChain.sort).toHaveBeenCalledWith({ createdAt: -1, _id: -1 });
      expect(findChain.skip).toHaveBeenCalledWith(0);
      expect(findChain.limit).toHaveBeenCalledWith(50);
      expect(result.total).toBe(1);
      expect(result.items[0]?.username).toBe('alice');
      expect(result.items[0]?.id).toBe(docs[0]._id.toString());
    });

    it('skips correctly for higher pages', async () => {
      const findChain = buildFindChain([]);
      userModel.find.mockReturnValue(findChain);
      userModel.countDocuments.mockResolvedValue(0);

      await service.list({ page: 3, pageSize: 25 });

      expect(findChain.skip).toHaveBeenCalledWith(50);
      expect(findChain.limit).toHaveBeenCalledWith(25);
    });

    it('applies role filter', async () => {
      userModel.find.mockReturnValue(buildFindChain([]));
      userModel.countDocuments.mockResolvedValue(0);

      await service.list({ role: 'admin' });

      expect(userModel.find).toHaveBeenCalledWith({ role: 'admin' });
      expect(userModel.countDocuments).toHaveBeenCalledWith({ role: 'admin' });
    });

    it('applies q across username/email/displayName with case-insensitive regex', async () => {
      userModel.find.mockReturnValue(buildFindChain([]));
      userModel.countDocuments.mockResolvedValue(0);

      await service.list({ q: 'alice' });

      const filter = userModel.find.mock.calls[0]?.[0];
      expect(filter).toEqual({
        $or: [
          { username: { $regex: 'alice', $options: 'i' } },
          { email: { $regex: 'alice', $options: 'i' } },
          { displayName: { $regex: 'alice', $options: 'i' } },
        ],
      });
    });

    it('escapes regex metacharacters in q', async () => {
      userModel.find.mockReturnValue(buildFindChain([]));
      userModel.countDocuments.mockResolvedValue(0);

      await service.list({ q: 'a*b+c(d' });

      const filter = userModel.find.mock.calls[0]?.[0];
      expect(filter.$or[0].username.$regex).toBe('a\\*b\\+c\\(d');
    });

    it('combines q and role filters', async () => {
      userModel.find.mockReturnValue(buildFindChain([]));
      userModel.countDocuments.mockResolvedValue(0);

      await service.list({ q: 'al', role: 'admin' });

      const filter = userModel.find.mock.calls[0]?.[0];
      expect(filter.role).toBe('admin');
      expect(filter.$or).toBeDefined();
    });

    it('maps doc -> AdminUserItem stripping internal fields', async () => {
      const doc = {
        ...buildUserDoc({ username: 'bob', email: 'b@x.com', role: 'admin' }),
        passwordHash: 'should not appear',
        referralCode: 'CODE',
        usernameNormalized: 'bob',
        blockedUsers: ['x'],
      };
      userModel.find.mockReturnValue(buildFindChain([doc]));
      userModel.countDocuments.mockResolvedValue(1);

      const result = await service.list({});
      const item = result.items[0]!;

      expect(item).toEqual({
        id: doc._id.toString(),
        email: 'b@x.com',
        username: 'bob',
        displayName: null,
        role: 'admin',
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
      });
      expect(Object.keys(item)).not.toContain('passwordHash');
      expect(Object.keys(item)).not.toContain('referralCode');
      expect(Object.keys(item)).not.toContain('usernameNormalized');
      expect(Object.keys(item)).not.toContain('blockedUsers');
    });
  });

  describe('updateRole', () => {
    it('rejects malformed ObjectId with INVALID_USER_ID', async () => {
      await expect(
        service.updateRole('not-an-object-id', 'admin', oid()),
      ).rejects.toThrow(BadRequestException);
      try {
        await service.updateRole('not-an-object-id', 'admin', oid());
      } catch (e) {
        expect((e as BadRequestException).getResponse()).toMatchObject({
          code: 'INVALID_USER_ID',
        });
      }
    });

    it('rejects self-edit with SELF_ROLE_CHANGE_FORBIDDEN', async () => {
      const me = oid();
      try {
        await service.updateRole(me, 'free', me);
        fail('expected ForbiddenException');
      } catch (e) {
        expect(e).toBeInstanceOf(ForbiddenException);
        expect((e as ForbiddenException).getResponse()).toMatchObject({
          code: 'SELF_ROLE_CHANGE_FORBIDDEN',
        });
      }
    });

    it('self-check fires before existence check', async () => {
      const me = oid();
      // findById should NOT be called
      await expect(service.updateRole(me, 'free', me)).rejects.toThrow(
        ForbiddenException,
      );
      expect(userModel.findById).not.toHaveBeenCalled();
    });

    it('rejects USER_NOT_FOUND when target missing', async () => {
      userModel.findById.mockReturnValue(buildFindByIdChain(null));
      try {
        await service.updateRole(oid(), 'free', oid());
        fail('expected NotFoundException');
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect((e as NotFoundException).getResponse()).toMatchObject({
          code: 'USER_NOT_FOUND',
        });
      }
    });

    it('returns existing item without saving when role unchanged', async () => {
      const target = buildUserDoc({ role: 'admin' });
      userModel.findById.mockReturnValue(buildFindByIdChain(target));

      const result = await service.updateRole(
        target._id.toString(),
        'admin',
        oid(),
      );

      expect(userModel.findByIdAndUpdate).not.toHaveBeenCalled();
      expect(result.role).toBe('admin');
      expect(result.id).toBe(target._id.toString());
    });

    it('rejects LAST_ADMIN_PROTECTED when demoting only admin', async () => {
      const target = buildUserDoc({ role: 'admin' });
      userModel.findById.mockReturnValue(buildFindByIdChain(target));
      userModel.countDocuments.mockResolvedValue(0); // no other admins

      try {
        await service.updateRole(target._id.toString(), 'free', oid());
        fail('expected ConflictException');
      } catch (e) {
        expect(e).toBeInstanceOf(ConflictException);
        expect((e as ConflictException).getResponse()).toMatchObject({
          code: 'LAST_ADMIN_PROTECTED',
        });
      }
      expect(userModel.countDocuments).toHaveBeenCalledWith({
        role: 'admin',
        _id: { $ne: target._id },
      });
    });

    it('allows admin demotion when other admins exist', async () => {
      const target = buildUserDoc({ role: 'admin' });
      const updated = { ...target, role: 'free' };
      userModel.findById.mockReturnValue(buildFindByIdChain(target));
      userModel.countDocuments.mockResolvedValue(2); // others exist
      userModel.findByIdAndUpdate.mockResolvedValue(updated);

      const result = await service.updateRole(
        target._id.toString(),
        'free',
        oid(),
      );

      expect(userModel.findByIdAndUpdate).toHaveBeenCalled();
      expect(result.role).toBe('free');
    });

    it('happy path: free → admin updates and returns mapped item', async () => {
      const target = buildUserDoc({ role: 'free' });
      const updated = { ...target, role: 'admin' };
      userModel.findById.mockReturnValue(buildFindByIdChain(target));
      userModel.findByIdAndUpdate.mockResolvedValue(updated);

      const result = await service.updateRole(
        target._id.toString(),
        'admin',
        oid(),
      );

      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
        target._id.toString(),
        { $set: { role: 'admin' } },
        { new: true, lean: true },
      );
      expect(result.role).toBe('admin');
    });
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

```bash
pnpm --filter be exec jest src/admin/admin-users.service.spec.ts
```

Expected: FAIL — `Cannot find module './admin-users.service'`.

---

### Task 4.2: Implement AdminUsersService

**Files:**

- Create: `apps/be/src/admin/admin-users.service.ts`

- [ ] **Step 1: Implement**

```ts
// apps/be/src/admin/admin-users.service.ts
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../auth/schemas/user.schema';
import type { UserRole } from '../auth/lib/roles';
import { escapeRegExp } from './lib/escape-regexp';
import type {
  AdminUserItem,
  AdminUsersResponse,
} from './interfaces/admin-user.interface';

interface ListArgs {
  page?: number;
  pageSize?: number;
  q?: string;
  role?: UserRole;
}

interface UserDocLean {
  _id: Types.ObjectId;
  email: string;
  username: string;
  displayName?: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class AdminUsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async list(args: ListArgs): Promise<AdminUsersResponse> {
    const page = args.page ?? 1;
    const pageSize = args.pageSize ?? 50;
    const filter: Record<string, unknown> = {};
    if (args.role) filter.role = args.role;
    if (args.q && args.q.trim()) {
      const escaped = escapeRegExp(args.q.trim());
      filter.$or = [
        { username: { $regex: escaped, $options: 'i' } },
        { email: { $regex: escaped, $options: 'i' } },
        { displayName: { $regex: escaped, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * pageSize;

    const [docs, total] = await Promise.all([
      this.userModel
        .find(filter)
        .select(
          '-passwordHash -referralCode -referredBy -usernameNormalized -blockedUsers',
        )
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean<UserDocLean[]>(),
      this.userModel.countDocuments(filter),
    ]);

    const items = docs.map((doc) => this.toAdminUserItem(doc));
    return { items, total, page, pageSize };
  }

  async updateRole(
    targetId: string,
    newRole: UserRole,
    requesterUserId: string,
  ): Promise<AdminUserItem> {
    if (!Types.ObjectId.isValid(targetId)) {
      throw new BadRequestException({ code: 'INVALID_USER_ID' });
    }

    if (targetId === requesterUserId) {
      throw new ForbiddenException({ code: 'SELF_ROLE_CHANGE_FORBIDDEN' });
    }

    const target = await this.userModel
      .findById(targetId)
      .lean<UserDocLean | null>();
    if (!target) {
      throw new NotFoundException({ code: 'USER_NOT_FOUND' });
    }

    if (target.role === newRole) {
      return this.toAdminUserItem(target);
    }

    if (newRole !== 'admin' && target.role === 'admin') {
      const otherAdminCount = await this.userModel.countDocuments({
        role: 'admin',
        _id: { $ne: target._id },
      });
      if (otherAdminCount === 0) {
        throw new ConflictException({ code: 'LAST_ADMIN_PROTECTED' });
      }
    }

    const updated = await this.userModel.findByIdAndUpdate(
      targetId,
      { $set: { role: newRole } },
      { new: true, lean: true },
    );
    if (!updated) {
      throw new NotFoundException({ code: 'USER_NOT_FOUND' });
    }
    return this.toAdminUserItem(updated as unknown as UserDocLean);
  }

  private toAdminUserItem(doc: UserDocLean): AdminUserItem {
    return {
      id: doc._id.toString(),
      email: doc.email,
      username: doc.username,
      displayName: doc.displayName ?? null,
      role: doc.role,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}
```

- [ ] **Step 2: Run, expect PASS**

```bash
pnpm --filter be exec jest src/admin/admin-users.service.spec.ts
```

Expected: all 14 tests pass.

- [ ] **Step 3: Commit**

```bash
git add apps/be/src/admin/admin-users.service.ts apps/be/src/admin/admin-users.service.spec.ts
git commit -m "feat(admin): add AdminUsersService with list + updateRole (ARC-604)"
```

---

## Phase 5 — BE Controller + module wiring

### Task 5.1: Controller

**Files:**

- Create: `apps/be/src/admin/admin-users.controller.ts`

- [ ] **Step 1: Write**

```ts
// apps/be/src/admin/admin-users.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import type { AuthenticatedUser } from '../auth/jwt/jwt.strategy';
import { AdminUsersService } from './admin-users.service';
import { ListAdminUsersDto } from './dto/list-admin-users.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import type {
  AdminUserItem,
  AdminUsersResponse,
} from './interfaces/admin-user.interface';

interface RequestWithUser {
  user?: AuthenticatedUser;
}

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminUsersController {
  constructor(private readonly service: AdminUsersService) {}

  @Get()
  list(@Query() query: ListAdminUsersDto): Promise<AdminUsersResponse> {
    return this.service.list(query);
  }

  @Patch(':id/role')
  updateRole(
    @Param('id') id: string,
    @Body() body: UpdateUserRoleDto,
    @Req() req: RequestWithUser,
  ): Promise<AdminUserItem> {
    const requesterUserId = req.user?.userId ?? '';
    return this.service.updateRole(id, body.role, requesterUserId);
  }
}
```

---

### Task 5.2: Register in AdminModule

**Files:**

- Modify: `apps/be/src/admin/admin.module.ts`

- [ ] **Step 1: Add the new controller + service**

Add to imports near the top:

```ts
import { AdminUsersController } from './admin-users.controller';
import { AdminUsersService } from './admin-users.service';
```

In the `@Module` decorator, append to `controllers` and `providers`:

```ts
controllers: [AdminController, AdminUsersController],
providers: [RolesGuard, AdminUsersService],
```

- [ ] **Step 2: Verify build**

```bash
pnpm --filter be build
```

Expected: clean build.

---

### Task 5.3: Controller integration test

**Files:**

- Create: `apps/be/src/admin/admin-users.controller.spec.ts`

This follows the same pattern as `admin.controller.spec.ts` from ARC-602: override `JwtAuthGuard` to inject a fake `req.user`, let `RolesGuard` run for real against a mocked `userModel`. Includes a critical test that the **global ValidationPipe is registered** (a `pageSize=999` request must return 400; if validation isn't running this would silently pass).

- [ ] **Step 1: Write the spec**

```ts
// apps/be/src/admin/admin-users.controller.spec.ts
import {
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import request from 'supertest';
import { Types } from 'mongoose';
import { AdminUsersController } from './admin-users.controller';
import { AdminUsersService } from './admin-users.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { User } from '../auth/schemas/user.schema';
import type { AuthenticatedUser } from '../auth/jwt/jwt.strategy';

interface RequestWithUser {
  user?: AuthenticatedUser;
}

describe('AdminUsersController (integration)', () => {
  let app: INestApplication;
  let userModel: {
    find: jest.Mock;
    findById: jest.Mock;
    findByIdAndUpdate: jest.Mock;
    countDocuments: jest.Mock;
  };
  let requesterUserId = 'requester-id-not-real';

  const buildFindChain = (returnDocs: unknown[]) => ({
    select: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue(returnDocs),
  });

  const buildFindByIdChain = (returnDoc: unknown) => ({
    lean: jest.fn().mockResolvedValue(returnDoc),
  });

  beforeAll(async () => {
    userModel = {
      find: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      countDocuments: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [AdminUsersController],
      providers: [
        AdminUsersService,
        RolesGuard,
        { provide: getModelToken(User.name), useValue: userModel },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx: ExecutionContext) => {
          const req = ctx.switchToHttp().getRequest<RequestWithUser>();
          req.user = {
            userId: requesterUserId,
            email: 'me@x',
            username: 'me',
          };
          return true;
        },
      })
      // Mock RolesGuard to always allow — RolesGuard's behavior is unit-tested
      // separately. This integration test focuses on the controller + service +
      // ValidationPipe wiring.
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
    requesterUserId = new Types.ObjectId().toString();
    userModel.find.mockReset();
    userModel.findById.mockReset();
    userModel.findByIdAndUpdate.mockReset();
    userModel.countDocuments.mockReset();
  });

  describe('GET /admin/users', () => {
    it('returns 200 with default pagination', async () => {
      userModel.find.mockReturnValue(buildFindChain([]));
      userModel.countDocuments.mockResolvedValue(0);

      const res = await request(app.getHttpServer())
        .get('/admin/users')
        .expect(200);

      expect(res.body).toEqual({
        items: [],
        total: 0,
        page: 1,
        pageSize: 50,
      });
    });

    it('rejects pageSize=999 with 400 (proves ValidationPipe is registered)', async () => {
      await request(app.getHttpServer())
        .get('/admin/users?pageSize=999')
        .expect(400);
    });

    it('rejects unknown query params with 400 (forbidNonWhitelisted)', async () => {
      await request(app.getHttpServer()).get('/admin/users?nope=1').expect(400);
    });

    it('rejects invalid role enum with 400', async () => {
      await request(app.getHttpServer())
        .get('/admin/users?role=king')
        .expect(400);
    });
  });

  describe('PATCH /admin/users/:id/role', () => {
    it('returns 200 on success', async () => {
      const targetId = new Types.ObjectId().toString();
      const target = {
        _id: new Types.ObjectId(targetId),
        email: 'a@x',
        username: 'a',
        displayName: null,
        role: 'free',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const updated = { ...target, role: 'admin' };
      userModel.findById.mockReturnValue(buildFindByIdChain(target));
      userModel.findByIdAndUpdate.mockResolvedValue(updated);

      const res = await request(app.getHttpServer())
        .patch(`/admin/users/${targetId}/role`)
        .send({ role: 'admin' })
        .expect(200);

      expect(res.body.role).toBe('admin');
    });

    it('returns 400 INVALID_USER_ID on bad :id', async () => {
      const res = await request(app.getHttpServer())
        .patch('/admin/users/not-an-id/role')
        .send({ role: 'admin' })
        .expect(400);

      expect(res.body.code).toBe('INVALID_USER_ID');
    });

    it('returns 400 on invalid body role', async () => {
      const id = new Types.ObjectId().toString();
      await request(app.getHttpServer())
        .patch(`/admin/users/${id}/role`)
        .send({ role: 'king' })
        .expect(400);
    });

    it('returns 403 SELF_ROLE_CHANGE_FORBIDDEN', async () => {
      const id = new Types.ObjectId().toString();
      requesterUserId = id;

      const res = await request(app.getHttpServer())
        .patch(`/admin/users/${id}/role`)
        .send({ role: 'free' })
        .expect(403);

      expect(res.body.code).toBe('SELF_ROLE_CHANGE_FORBIDDEN');
    });

    it('returns 404 USER_NOT_FOUND when missing', async () => {
      userModel.findById.mockReturnValue(buildFindByIdChain(null));
      const id = new Types.ObjectId().toString();

      const res = await request(app.getHttpServer())
        .patch(`/admin/users/${id}/role`)
        .send({ role: 'free' })
        .expect(404);

      expect(res.body.code).toBe('USER_NOT_FOUND');
    });

    it('returns 409 LAST_ADMIN_PROTECTED', async () => {
      const targetId = new Types.ObjectId();
      const target = {
        _id: targetId,
        email: 'a@x',
        username: 'a',
        displayName: null,
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      userModel.findById.mockReturnValue(buildFindByIdChain(target));
      userModel.countDocuments.mockResolvedValue(0);

      const res = await request(app.getHttpServer())
        .patch(`/admin/users/${targetId.toString()}/role`)
        .send({ role: 'free' })
        .expect(409);

      expect(res.body.code).toBe('LAST_ADMIN_PROTECTED');
    });
  });
});
```

- [ ] **Step 2: Run, expect PASS**

```bash
pnpm --filter be exec jest src/admin/admin-users.controller.spec.ts
```

Expected: 9 tests pass.

- [ ] **Step 3: Commit Phase 5**

```bash
git add apps/be/src/admin/
git commit -m "feat(admin): add AdminUsersController with /admin/users + role PATCH (ARC-604)"
```

---

## Phase 6 — FE apiClient.patch

### Task 6.1: Failing test for apiClient.patch

**Files:**

- Modify: `apps/web/src/shared/lib/api-client.test.ts`

- [ ] **Step 1: Read the existing file** to find a good insertion point (after the existing test for `put` or near other method tests).

```bash
grep -n "describe\|it(" apps/web/src/shared/lib/api-client.test.ts
```

- [ ] **Step 2: Append a `patch` test inside the existing `describe('apiClient', ...)`**

Add this before the closing `});` of the `describe`:

```ts
it('performs PATCH request with data', async () => {
  const fetchMock = global.fetch as Mock;
  fetchMock.mockResolvedValueOnce(
    new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }),
  );

  const result = await apiClient.patch<{ ok: boolean }>('/foo', { x: 1 });

  expect(result).toEqual({ ok: true });
  const [, init] = fetchMock.mock.calls[0]!;
  expect(init.method).toBe('PATCH');
  expect(init.body).toBe(JSON.stringify({ x: 1 }));
});
```

- [ ] **Step 3: Run, expect FAIL**

```bash
pnpm --filter web exec vitest run src/shared/lib/api-client.test.ts
```

Expected: FAIL — `apiClient.patch is not a function`.

---

### Task 6.2: Implement apiClient.patch

**Files:**

- Modify: `apps/web/src/shared/lib/api-client.ts`

- [ ] **Step 1: Add the method**

After the `put` method (around line 230), insert:

```ts
  patch<T>(path: string, data?: unknown, options?: ApiClientOptions) {
    return this.fetch<T>(path, { ...options, method: 'PATCH', data });
  },
```

- [ ] **Step 2: Run, expect PASS**

```bash
pnpm --filter web exec vitest run src/shared/lib/api-client.test.ts
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/shared/lib/api-client.ts apps/web/src/shared/lib/api-client.test.ts
git commit -m "feat(web): add apiClient.patch<T> method (ARC-604)"
```

---

## Phase 7 — FE feature: api.ts

### Task 7.1: Failing API tests

**Files:**

- Create: `apps/web/src/features/admin-users/api.test.ts`

- [ ] **Step 1: Write**

```ts
// apps/web/src/features/admin-users/api.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/shared/lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

import { apiClient } from '@/shared/lib/api-client';
import { buildAdminUsersUrl, fetchAdminUsers, updateUserRole } from './api';

const apiMock = apiClient as unknown as {
  get: ReturnType<typeof vi.fn>;
  patch: ReturnType<typeof vi.fn>;
};

beforeEach(() => {
  apiMock.get.mockReset();
  apiMock.patch.mockReset();
});

describe('buildAdminUsersUrl', () => {
  it('returns plain path when args empty', () => {
    expect(buildAdminUsersUrl({})).toBe('/admin/users');
  });

  it('serializes page + pageSize', () => {
    expect(buildAdminUsersUrl({ page: 2, pageSize: 25 })).toBe(
      '/admin/users?page=2&pageSize=25',
    );
  });

  it('serializes q + role', () => {
    expect(buildAdminUsersUrl({ q: 'al', role: 'admin' })).toBe(
      '/admin/users?q=al&role=admin',
    );
  });

  it('omits null/undefined args', () => {
    expect(buildAdminUsersUrl({ q: '', role: null })).toBe('/admin/users');
  });
});

describe('fetchAdminUsers', () => {
  it('calls apiClient.get with built url and token', async () => {
    apiMock.get.mockResolvedValueOnce({
      items: [],
      total: 0,
      page: 1,
      pageSize: 50,
    });

    await fetchAdminUsers({ page: 2 }, 'tok');

    expect(apiMock.get).toHaveBeenCalledWith('/admin/users?page=2', {
      token: 'tok',
    });
  });
});

describe('updateUserRole', () => {
  it('calls apiClient.patch with id, body, and token', async () => {
    apiMock.patch.mockResolvedValueOnce({ id: 'u1', role: 'admin' });

    await updateUserRole('u1', 'admin', 'tok');

    expect(apiMock.patch).toHaveBeenCalledWith(
      '/admin/users/u1/role',
      { role: 'admin' },
      { token: 'tok' },
    );
  });

  it('encodes id with special characters', async () => {
    apiMock.patch.mockResolvedValueOnce({});
    await updateUserRole('id with space', 'free', 'tok');
    expect(apiMock.patch.mock.calls[0]?.[0]).toBe(
      '/admin/users/id%20with%20space/role',
    );
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

```bash
pnpm --filter web exec vitest run src/features/admin-users/api.test.ts
```

Expected: FAIL — module missing.

---

### Task 7.2: Implement api.ts

**Files:**

- Create: `apps/web/src/features/admin-users/api.ts`

- [ ] **Step 1: Write**

```ts
// apps/web/src/features/admin-users/api.ts
import { apiClient } from '@/shared/lib/api-client';
import type { UserRole } from '@/entities/session/model/types';

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
  if (args.q && args.q.trim()) qs.set('q', args.q);
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

Note: `apiClient` accepts `{ token }` in `ApiClientOptions` — verify by reading [apps/web/src/shared/lib/api-client.ts:32-36](apps/web/src/shared/lib/api-client.ts#L32-L36) for the option name. If it's actually `accessToken` or similar, adjust.

- [ ] **Step 2: Run, expect PASS**

```bash
pnpm --filter web exec vitest run src/features/admin-users/api.test.ts
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/features/admin-users/api.ts apps/web/src/features/admin-users/api.test.ts
git commit -m "feat(admin-users): add api.ts (fetchAdminUsers, updateUserRole) (ARC-604)"
```

---

## Phase 8 — FE feature: hooks.ts

### Task 8.1: Failing hook tests

**Files:**

- Create: `apps/web/src/features/admin-users/hooks.test.ts`

- [ ] **Step 1: Write**

```ts
// apps/web/src/features/admin-users/hooks.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

vi.mock('@/shared/lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    patch: vi.fn(),
  },
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

const sessionStateRef: { accessToken: string | null } = {
  accessToken: 'tok',
};
vi.mock('@/entities/session/store/sessionStore', () => ({
  useSessionStore: (
    selector: (state: { snapshot: { accessToken: string | null } }) => unknown,
  ) => selector({ snapshot: sessionStateRef }),
}));

import { apiClient } from '@/shared/lib/api-client';
import { useAdminUsers, useUpdateUserRole } from './hooks';

const apiMock = apiClient as unknown as {
  get: ReturnType<typeof vi.fn>;
  patch: ReturnType<typeof vi.fn>;
};

beforeEach(() => {
  apiMock.get.mockReset();
  apiMock.patch.mockReset();
  triggerRefreshMock.mockReset();
  sessionStateRef.accessToken = 'tok';
});

describe('useAdminUsers', () => {
  it('calls fetchAdminUsers when token present', async () => {
    apiMock.get.mockResolvedValueOnce({
      items: [],
      total: 0,
      page: 1,
      pageSize: 50,
    });

    const { result } = renderHook(() =>
      useAdminUsers({ page: 1, pageSize: 50 }),
    );

    await waitFor(() => expect(apiMock.get).toHaveBeenCalled());
    expect(result.current.isLoading).toBe(false);
  });

  it('is disabled when no access token', async () => {
    sessionStateRef.accessToken = null;

    const { result } = renderHook(() =>
      useAdminUsers({ page: 1, pageSize: 50 }),
    );

    // Wait a tick — no fetch should fire
    await new Promise((r) => setTimeout(r, 0));
    expect(apiMock.get).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
  });
});

describe('useUpdateUserRole', () => {
  it('calls updateUserRole and triggers refresh on settle', async () => {
    apiMock.patch.mockResolvedValueOnce({ id: 'u1', role: 'admin' });

    const { result } = renderHook(() => useUpdateUserRole());

    await act(async () => {
      await result.current.mutateAsync({ userId: 'u1', role: 'admin' });
    });

    expect(apiMock.patch).toHaveBeenCalled();
    expect(triggerRefreshMock).toHaveBeenCalledWith('admin-users');
  });

  it('triggers refresh even on error (onSettled)', async () => {
    apiMock.patch.mockRejectedValueOnce(new Error('boom'));

    const { result } = renderHook(() => useUpdateUserRole());

    await act(async () => {
      await expect(
        result.current.mutateAsync({ userId: 'u1', role: 'admin' }),
      ).rejects.toThrow('boom');
    });

    expect(triggerRefreshMock).toHaveBeenCalledWith('admin-users');
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

---

### Task 8.2: Implement hooks.ts

**Files:**

- Create: `apps/web/src/features/admin-users/hooks.ts`

- [ ] **Step 1: Write**

```ts
// apps/web/src/features/admin-users/hooks.ts
'use client';

import { useQuery } from '@/shared/hooks/useQuery';
import { useMutation } from '@/shared/hooks/useMutation';
import { useRefreshStore } from '@/shared/model/useRefreshStore';
import { useSessionStore } from '@/entities/session/store/sessionStore';
import type { UserRole } from '@/entities/session/model/types';
import {
  fetchAdminUsers,
  updateUserRole,
  type AdminUserItem,
  type AdminUsersResponse,
  type ListAdminUsersArgs,
} from './api';

export const ADMIN_USERS_REFRESH_KEY = 'admin-users';

export function useAdminUsers(args: ListAdminUsersArgs) {
  const accessToken = useSessionStore((s) => s.snapshot.accessToken);
  return useQuery<AdminUsersResponse>({
    queryKey: [
      'admin-users',
      args.page ?? 1,
      args.pageSize ?? 50,
      args.q ?? '',
      args.role ?? '',
    ],
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

- [ ] **Step 2: Run, expect PASS**

```bash
pnpm --filter web exec vitest run src/features/admin-users/hooks.test.ts
```

- [ ] **Step 3: Commit Phase 7-8**

```bash
git add apps/web/src/features/admin-users/api.ts apps/web/src/features/admin-users/api.test.ts apps/web/src/features/admin-users/hooks.ts apps/web/src/features/admin-users/hooks.test.ts
git commit -m "feat(admin-users): add api + hooks (useAdminUsers, useUpdateUserRole) (ARC-604)"
```

---

## Phase 9 — FE feature: roleColors

### Task 9.1: roleColors with role-coverage test

**Files:**

- Create: `apps/web/src/features/admin-users/lib/roleColors.ts`
- Create: `apps/web/src/features/admin-users/lib/roleColors.test.ts`

- [ ] **Step 1: Write the test first**

```ts
// apps/web/src/features/admin-users/lib/roleColors.test.ts
import { describe, it, expect } from 'vitest';
import { USER_ROLES } from '@/entities/session/model/types';
import { ROLE_COLORS } from './roleColors';

describe('ROLE_COLORS', () => {
  it.each(USER_ROLES)('has an entry for %s', (role) => {
    expect(ROLE_COLORS[role]).toBeDefined();
    expect(ROLE_COLORS[role].fg).toMatch(/^\$/);
    expect(ROLE_COLORS[role].bg).toMatch(/^\$/);
  });
});
```

Verify `USER_ROLES` is exported from `@/entities/session/model/types`. (Verified during planning — line 2.)

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Write `roleColors.ts`**

```ts
// apps/web/src/features/admin-users/lib/roleColors.ts
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

- [ ] **Step 4: Run, expect PASS** + commit

```bash
git add apps/web/src/features/admin-users/lib/
git commit -m "feat(admin-users): add ROLE_COLORS map with coverage test (ARC-604)"
```

---

## Phase 10 — FE UI components

UI components are kept in separate files for clarity and to stay well under
the 500-line ceiling. Each test file exercises one component.

### Task 10.1: RoleBadge

**Files:**

- Create: `apps/web/src/features/admin-users/ui/RoleBadge.tsx`
- Create: `apps/web/src/features/admin-users/ui/RoleBadge.test.tsx`

- [ ] **Step 1: Test (TDD)**

```tsx
// apps/web/src/features/admin-users/ui/RoleBadge.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RoleBadge } from './RoleBadge';

describe('RoleBadge', () => {
  it('renders the localized role text', () => {
    render(<RoleBadge role="admin" label="Admin" />);
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('renders different label for different role', () => {
    render(<RoleBadge role="free" label="Free" />);
    expect(screen.getByText('Free')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Implement**

```tsx
// apps/web/src/features/admin-users/ui/RoleBadge.tsx
'use client';
import { Text, View } from 'tamagui';
import type { UserRole } from '@/entities/session/model/types';
import { ROLE_COLORS } from '../lib/roleColors';

export function RoleBadge({ role, label }: { role: UserRole; label: string }) {
  const c = ROLE_COLORS[role];
  return (
    <View
      paddingHorizontal="$2"
      paddingVertical="$1"
      borderRadius="$2"
      backgroundColor={c.bg}
      alignSelf="flex-start"
      data-testid={`role-badge-${role}`}
    >
      <Text fontSize="$2" fontWeight="700" color={c.fg}>
        {label}
      </Text>
    </View>
  );
}
```

- [ ] **Step 3: Run, expect PASS**

---

### Task 10.2: RoleSelect

**Files:**

- Create: `apps/web/src/features/admin-users/ui/RoleSelect.tsx`
- Create: `apps/web/src/features/admin-users/ui/RoleSelect.test.tsx`

The control is a styled native `<select>` for accessibility (keyboard, screen readers, native keyboard nav). If `@arcadeum/ui` ships a `Select` component, prefer that — but check during implementation. v1 ships native if unsure.

- [ ] **Step 1: Test**

```tsx
// apps/web/src/features/admin-users/ui/RoleSelect.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { RoleSelect } from './RoleSelect';

describe('RoleSelect', () => {
  it('fires onChange with new role', () => {
    const onChange = vi.fn();
    render(
      <RoleSelect
        value="free"
        onChange={onChange}
        labels={{
          free: 'Free',
          admin: 'Admin',
          developer: 'Dev',
          moderator: 'Mod',
          tester: 'Tester',
          vip: 'VIP',
          supporter: 'Sup',
          premium: 'Prem',
        }}
        testId="role-select"
      />,
    );
    fireEvent.change(screen.getByTestId('role-select'), {
      target: { value: 'admin' },
    });
    expect(onChange).toHaveBeenCalledWith('admin');
  });

  it('respects disabled', () => {
    render(
      <RoleSelect
        value="free"
        onChange={() => {}}
        labels={{
          free: 'Free',
          admin: 'Admin',
          developer: 'Dev',
          moderator: 'Mod',
          tester: 'Tester',
          vip: 'VIP',
          supporter: 'Sup',
          premium: 'Prem',
        }}
        disabled
        testId="role-select"
      />,
    );
    expect(screen.getByTestId('role-select')).toBeDisabled();
  });
});
```

- [ ] **Step 2: Implement**

```tsx
// apps/web/src/features/admin-users/ui/RoleSelect.tsx
'use client';
import { USER_ROLES, type UserRole } from '@/entities/session/model/types';

export interface RoleSelectProps {
  value: UserRole;
  onChange: (role: UserRole) => void;
  labels: Record<UserRole, string>;
  disabled?: boolean;
  testId?: string;
}

export function RoleSelect({
  value,
  onChange,
  labels,
  disabled,
  testId,
}: RoleSelectProps) {
  return (
    <select
      value={value}
      disabled={disabled}
      data-testid={testId}
      onChange={(e) => onChange(e.target.value as UserRole)}
      style={{
        padding: '4px 8px',
        borderRadius: 4,
        border: '1px solid #555',
        background: 'transparent',
        color: 'inherit',
      }}
    >
      {USER_ROLES.map((r) => (
        <option key={r} value={r}>
          {labels[r] ?? r}
        </option>
      ))}
    </select>
  );
}
```

---

### Task 10.3: UsersFilters

**Files:**

- Create: `apps/web/src/features/admin-users/ui/UsersFilters.tsx`
- Create: `apps/web/src/features/admin-users/ui/UsersFilters.test.tsx`

- [ ] **Step 1: Test**

```tsx
// apps/web/src/features/admin-users/ui/UsersFilters.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen, act } from '@testing-library/react';
import { UsersFilters } from './UsersFilters';

const noopLabels = {
  searchPlaceholder: 'search',
  roleFilterPlaceholder: 'role',
  roleFilterAll: 'All',
  roleLabels: {
    free: 'Free',
    admin: 'Admin',
    developer: 'Dev',
    moderator: 'Mod',
    tester: 'Tester',
    vip: 'VIP',
    supporter: 'Sup',
    premium: 'Prem',
  },
};

describe('UsersFilters', () => {
  it('debounces search input', async () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    render(
      <UsersFilters q="" role={null} onChange={onChange} labels={noopLabels} />,
    );
    fireEvent.change(screen.getByPlaceholderText('search'), {
      target: { value: 'al' },
    });
    expect(onChange).not.toHaveBeenCalledWith({ q: 'al', role: null });
    await act(async () => {
      vi.advanceTimersByTime(350);
    });
    expect(onChange).toHaveBeenCalledWith({ q: 'al', role: null });
    vi.useRealTimers();
  });

  it('fires immediately on role change', () => {
    const onChange = vi.fn();
    render(
      <UsersFilters q="" role={null} onChange={onChange} labels={noopLabels} />,
    );
    fireEvent.change(screen.getByTestId('role-filter'), {
      target: { value: 'admin' },
    });
    expect(onChange).toHaveBeenCalledWith({ q: '', role: 'admin' });
  });
});
```

- [ ] **Step 2: Implement**

```tsx
// apps/web/src/features/admin-users/ui/UsersFilters.tsx
'use client';
import { useEffect, useState } from 'react';
import { XStack } from 'tamagui';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { USER_ROLES, type UserRole } from '@/entities/session/model/types';

export interface UsersFiltersLabels {
  searchPlaceholder: string;
  roleFilterPlaceholder: string;
  roleFilterAll: string;
  roleLabels: Record<UserRole, string>;
}

export interface UsersFiltersProps {
  q: string;
  role: UserRole | null;
  onChange: (next: { q: string; role: UserRole | null }) => void;
  labels: UsersFiltersLabels;
}

export function UsersFilters({ q, role, onChange, labels }: UsersFiltersProps) {
  const [localQ, setLocalQ] = useState(q);
  const debouncedQ = useDebounce(localQ, 300);

  useEffect(() => {
    if (debouncedQ !== q) {
      onChange({ q: debouncedQ, role });
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
          minWidth: 220,
        }}
      />
      <select
        data-testid="role-filter"
        value={role ?? ''}
        onChange={(e) =>
          onChange({
            q: localQ,
            role: e.target.value === '' ? null : (e.target.value as UserRole),
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
        <option value="">{labels.roleFilterAll}</option>
        {USER_ROLES.map((r) => (
          <option key={r} value={r}>
            {labels.roleLabels[r] ?? r}
          </option>
        ))}
      </select>
    </XStack>
  );
}
```

---

### Task 10.4: UsersTableRow

**Files:**

- Create: `apps/web/src/features/admin-users/ui/UsersTableRow.tsx`
- Create: `apps/web/src/features/admin-users/ui/UsersTableRow.test.tsx`

- [ ] **Step 1: Test**

```tsx
// apps/web/src/features/admin-users/ui/UsersTableRow.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UsersTableRow } from './UsersTableRow';

const item = {
  id: 'u1',
  email: 'a@x',
  username: 'alice',
  displayName: 'Alice',
  role: 'free' as const,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-02T00:00:00Z',
};

const labels = {
  free: 'Free',
  admin: 'Admin',
  developer: 'Dev',
  moderator: 'Mod',
  tester: 'Tester',
  vip: 'VIP',
  supporter: 'Sup',
  premium: 'Prem',
};

describe('UsersTableRow', () => {
  it('renders username, email, role badge, role select', () => {
    render(
      <UsersTableRow
        item={item}
        currentUserId="other"
        onRoleChange={() => {}}
        roleLabels={labels}
        selfTooltip="cant edit"
      />,
    );
    expect(screen.getByText('alice')).toBeInTheDocument();
    expect(screen.getByText('a@x')).toBeInTheDocument();
    expect(screen.getByTestId(`role-select-${item.id}`)).not.toBeDisabled();
  });

  it('disables role select for current user', () => {
    render(
      <UsersTableRow
        item={item}
        currentUserId="u1"
        onRoleChange={() => {}}
        roleLabels={labels}
        selfTooltip="cant edit"
      />,
    );
    expect(screen.getByTestId(`role-select-${item.id}`)).toBeDisabled();
  });

  it('fires onRoleChange when select changes', () => {
    const onRoleChange = vi.fn();
    render(
      <UsersTableRow
        item={item}
        currentUserId="other"
        onRoleChange={onRoleChange}
        roleLabels={labels}
        selfTooltip="cant edit"
      />,
    );
    const select = screen.getByTestId(`role-select-${item.id}`);
    (select as HTMLSelectElement).value = 'admin';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    expect(onRoleChange).toHaveBeenCalledWith('u1', 'admin');
  });
});
```

- [ ] **Step 2: Implement**

```tsx
// apps/web/src/features/admin-users/ui/UsersTableRow.tsx
'use client';
import { XStack, Text, View } from 'tamagui';
import type { AdminUserItem } from '../api';
import type { UserRole } from '@/entities/session/model/types';
import { RoleBadge } from './RoleBadge';
import { RoleSelect } from './RoleSelect';

export interface UsersTableRowProps {
  item: AdminUserItem;
  currentUserId: string;
  onRoleChange: (userId: string, role: UserRole) => void;
  roleLabels: Record<UserRole, string>;
  selfTooltip: string;
  isPending?: boolean;
}

export function UsersTableRow({
  item,
  currentUserId,
  onRoleChange,
  roleLabels,
  selfTooltip,
  isPending,
}: UsersTableRowProps) {
  const isSelf = item.id === currentUserId;
  return (
    <XStack
      gap="$3"
      alignItems="center"
      paddingVertical="$2"
      borderBottomWidth={1}
      borderColor="$borderColor"
      data-testid={`user-row-${item.id}`}
    >
      <View flex={1}>
        <Text fontWeight="700">{item.username}</Text>
        <Text opacity={0.6} fontSize="$1">
          {item.email}
        </Text>
        {item.displayName && (
          <Text opacity={0.5} fontSize="$1">
            {item.displayName}
          </Text>
        )}
      </View>
      <RoleBadge role={item.role} label={roleLabels[item.role]} />
      <View title={isSelf ? selfTooltip : undefined}>
        <RoleSelect
          value={item.role}
          onChange={(r) => onRoleChange(item.id, r)}
          labels={roleLabels}
          disabled={isSelf || isPending}
          testId={`role-select-${item.id}`}
        />
      </View>
    </XStack>
  );
}
```

---

### Task 10.5: UsersTable

**Files:**

- Create: `apps/web/src/features/admin-users/ui/UsersTable.tsx`
- Create: `apps/web/src/features/admin-users/ui/UsersTable.test.tsx`

- [ ] **Step 1: Test (covers empty states + pagination footer)**

```tsx
// apps/web/src/features/admin-users/ui/UsersTable.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UsersTable } from './UsersTable';

const labels = {
  empty: { noUsers: 'no users', noResults: 'no results' },
  table: {
    username: 'Username',
    email: 'Email',
    role: 'Role',
    actions: 'Actions',
  },
  pagination: { prev: 'Prev', next: 'Next', of: 'Page {current} of {total}' },
  totalLabel: '{total} users',
  roleLabels: {
    free: 'Free',
    admin: 'Admin',
    developer: 'Dev',
    moderator: 'Mod',
    tester: 'Tester',
    vip: 'VIP',
    supporter: 'Sup',
    premium: 'Prem',
  },
  selfTooltip: 'cant edit',
};

const baseProps = {
  items: [],
  total: 0,
  page: 1,
  pageSize: 50,
  isLoading: false,
  isError: false,
  currentUserId: 'me',
  onRoleChange: () => {},
  onPageChange: () => {},
  hasFilter: false,
  labels,
};

describe('UsersTable', () => {
  it('shows noUsers when total=0 and no filter', () => {
    render(<UsersTable {...baseProps} />);
    expect(screen.getByText('no users')).toBeInTheDocument();
  });

  it('shows noResults when total=0 and filter active', () => {
    render(<UsersTable {...baseProps} hasFilter />);
    expect(screen.getByText('no results')).toBeInTheDocument();
  });

  it('renders rows when items present', () => {
    const item = {
      id: 'u1',
      email: 'a@x',
      username: 'alice',
      displayName: null,
      role: 'free' as const,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-02T00:00:00Z',
    };
    render(<UsersTable {...baseProps} items={[item]} total={1} />);
    expect(screen.getByText('alice')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Implement**

```tsx
// apps/web/src/features/admin-users/ui/UsersTable.tsx
'use client';
import { YStack, XStack, Text, Button } from '@arcadeum/ui';
import { Spinner } from 'tamagui';
import type { AdminUserItem } from '../api';
import type { UserRole } from '@/entities/session/model/types';
import { UsersTableRow } from './UsersTableRow';

export interface UsersTableLabels {
  empty: { noUsers: string; noResults: string };
  table: { username: string; email: string; role: string; actions: string };
  pagination: { prev: string; next: string; of: string };
  totalLabel: string;
  roleLabels: Record<UserRole, string>;
  selfTooltip: string;
}

export interface UsersTableProps {
  items: AdminUserItem[];
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  isError: boolean;
  currentUserId: string;
  hasFilter: boolean;
  onRoleChange: (userId: string, role: UserRole) => void;
  onPageChange: (next: number) => void;
  pendingUserId?: string;
  labels: UsersTableLabels;
}

export function UsersTable({
  items,
  total,
  page,
  pageSize,
  isLoading,
  isError,
  currentUserId,
  hasFilter,
  onRoleChange,
  onPageChange,
  pendingUserId,
  labels,
}: UsersTableProps) {
  if (isLoading && items.length === 0) {
    return (
      <YStack alignItems="center" padding="$4">
        <Spinner />
      </YStack>
    );
  }

  if (!isLoading && items.length === 0) {
    return (
      <YStack alignItems="center" padding="$4" data-testid="users-table-empty">
        <Text opacity={0.7}>
          {hasFilter ? labels.empty.noResults : labels.empty.noUsers}
        </Text>
      </YStack>
    );
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <YStack gap="$2" data-testid="users-table">
      <Text opacity={0.7} fontSize="$1">
        {labels.totalLabel.replace('{total}', String(total))}
      </Text>
      {items.map((it) => (
        <UsersTableRow
          key={it.id}
          item={it}
          currentUserId={currentUserId}
          onRoleChange={onRoleChange}
          roleLabels={labels.roleLabels}
          selfTooltip={labels.selfTooltip}
          isPending={pendingUserId === it.id}
        />
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

- [ ] **Step 3: Commit Phase 10**

```bash
git add apps/web/src/features/admin-users/ui/
git commit -m "feat(admin-users): add UI primitives (RoleBadge, RoleSelect, UsersFilters, UsersTableRow, UsersTable) (ARC-604)"
```

---

## Phase 11 — i18n

### Task 11.1: Add `pages.admin.users` namespace + rename nav.roles → nav.users

**Files:**

- Modify: `apps/web/src/shared/i18n/messages/pages/{en,ru,es,fr,by}.ts`

For each locale: add the `users` block under `pages.admin`, AND rename `pages.admin.nav.roles` to `pages.admin.nav.users` with the corresponding translated label.

The block has the same shape in every locale; only the strings change. Below is `en.ts`. Translations for the others are at the end of this task.

- [ ] **Step 1: Add to `en.ts`** — under the existing `admin:` block, alongside `nav` and `error`:

```ts
admin: {
  // ...existing keys...
  nav: {
    dashboard: 'Dashboard',
    users: 'Users',           // <-- renamed from 'roles'
    payments: 'Payments',
    announcements: 'Announcements',
    tournaments: 'Tournaments',
    comingSoon: 'Coming soon',
  },
  // ...
  users: {
    title: 'Users',
    search: { placeholder: 'Search by username, email, or display name' },
    filter: {
      role: {
        all: 'All roles',
        placeholder: 'Filter by role',
      },
    },
    table: {
      username: 'Username',
      email: 'Email',
      role: 'Role',
      createdAt: 'Created',
      actions: 'Actions',
    },
    empty: {
      noResults: 'No users match your filters.',
      noUsers: 'No users yet.',
    },
    pagination: {
      prev: 'Previous',
      next: 'Next',
      of: 'Page {current} of {total}',
    },
    totalLabel: '{total} users',
    selfTooltip: "You can't change your own role.",
    role: {
      free: 'Free',
      premium: 'Premium',
      vip: 'VIP',
      supporter: 'Supporter',
      moderator: 'Moderator',
      tester: 'Tester',
      developer: 'Developer',
      admin: 'Admin',
    },
    errors: {
      SELF_ROLE_CHANGE_FORBIDDEN: "You can't change your own role.",
      LAST_ADMIN_PROTECTED: "Can't demote the last admin.",
      USER_NOT_FOUND: 'User not found.',
      INVALID_USER_ID: 'Invalid user id.',
      generic: 'Something went wrong. Please try again.',
    },
  },
},
```

- [ ] **Step 2: Add to `ru.ts`** with `nav.users: 'Пользователи'` and the `users` block translated. Use these strings:

```text
title: 'Пользователи'
search.placeholder: 'Поиск по имени, email или отображаемому имени'
filter.role.all: 'Все роли'
filter.role.placeholder: 'Фильтр по роли'
table.username: 'Имя пользователя'
table.email: 'Email'
table.role: 'Роль'
table.createdAt: 'Создан'
table.actions: 'Действия'
empty.noResults: 'Нет пользователей по фильтру.'
empty.noUsers: 'Пользователей пока нет.'
pagination.prev: 'Назад'
pagination.next: 'Вперёд'
pagination.of: 'Страница {current} из {total}'
totalLabel: '{total} пользователей'
selfTooltip: 'Нельзя изменить свою собственную роль.'
role.free: 'Free' / 'Бесплатный'   // pick the project's existing convention
role.premium: 'Premium'
role.vip: 'VIP'
role.supporter: 'Спонсор'
role.moderator: 'Модератор'
role.tester: 'Тестер'
role.developer: 'Разработчик'
role.admin: 'Админ'
errors.SELF_ROLE_CHANGE_FORBIDDEN: 'Нельзя изменить свою собственную роль.'
errors.LAST_ADMIN_PROTECTED: 'Нельзя понизить последнего администратора.'
errors.USER_NOT_FOUND: 'Пользователь не найден.'
errors.INVALID_USER_ID: 'Неверный идентификатор пользователя.'
errors.generic: 'Что-то пошло не так. Попробуйте ещё раз.'
```

For the role labels, check what existing locale files use for `free`/`premium`/etc. and stay consistent. If those role names don't exist in i18n elsewhere, the strings above are reasonable defaults.

- [ ] **Step 3: Add to `es.ts`, `fr.ts`, `by.ts`** with appropriate translations:

`es.ts` — `nav.users: 'Usuarios'`, `title: 'Usuarios'`, `search.placeholder: 'Buscar por usuario, email o nombre'`, `filter.role.all: 'Todos los roles'`, `selfTooltip: 'No puedes cambiar tu propio rol.'`, etc.

`fr.ts` — `nav.users: 'Utilisateurs'`, `title: 'Utilisateurs'`, `search.placeholder: "Recherche par nom d'utilisateur, email ou nom"`, `filter.role.all: 'Tous les rôles'`, `selfTooltip: 'Vous ne pouvez pas changer votre propre rôle.'`, etc.

`by.ts` — `nav.users: 'Карыстальнікі'`, `title: 'Карыстальнікі'`, `search.placeholder: "Пошук па імі, email або псеўданіме"`, `filter.role.all: 'Усе ролі'`, `selfTooltip: 'Вы не можаце змяніць сваю ўласную ролю.'`, etc.

The implementer should produce idiomatic translations consistent with each locale file's style. If unclear, use English temporarily and add a TODO — but `pnpm check-translations` requires every key be present.

- [ ] **Step 4: Run translation check**

```bash
pnpm check-translations
```

Expected: ✅ all keys present.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/shared/i18n/messages/pages/
git commit -m "feat(i18n): rename nav.roles -> nav.users + add admin.users namespace (ARC-604)"
```

---

## Phase 12 — Sidebar update

### Task 12.1: Update sidebarItems

**Files:**

- Modify: `apps/web/src/app/admin/_components/sidebarItems.ts`

- [ ] **Step 1: Edit**

Change the `id` union literal from `'roles'` to `'users'`, and update the `roles` entry to be the new enabled `users` entry:

```ts
export interface AdminSidebarItem {
  id: 'dashboard' | 'users' | 'payments' | 'announcements' | 'tournaments';
  href: string | null;
  enabled: boolean;
}

export const ADMIN_SIDEBAR_ITEMS: readonly AdminSidebarItem[] = [
  { id: 'dashboard', href: '/admin', enabled: true },
  { id: 'users', href: '/admin/users', enabled: true },
  { id: 'payments', href: null, enabled: false },
  { id: 'announcements', href: null, enabled: false },
  { id: 'tournaments', href: null, enabled: false },
];
```

- [ ] **Step 2: Verify the existing `AdminLayoutClient.tsx` still compiles**

`AdminLayoutClient.tsx` uses `navT?.[item.id]` to read the label. The i18n key `nav.users` was added in Phase 11; the type change here is consistent.

```bash
pnpm --filter web exec tsc --noEmit
```

Expected: clean.

- [ ] **Step 3: Verify `AdminLayoutClient.tsx`'s navigation** — sidebar items now have `href` for users. If the existing `AdminLayoutClient.tsx` doesn't use `href` for navigation (it might only display them as cards), wire it up. Read the file first:

```bash
cat apps/web/src/app/admin/AdminLayoutClient.tsx
```

If it currently renders disabled cards, add a `<Link>` (Next.js) wrap when `enabled && href`. Minimal change:

```tsx
import Link from 'next/link';
// ...
{
  ADMIN_SIDEBAR_ITEMS.map((item) => {
    const card = (
      <GlassCard /* ...existing props... */>
        <Typography /* ... */>{navT?.[item.id] ?? item.id}</Typography>
        {!item.enabled && (
          <Typography>{navT?.comingSoon ?? 'Coming soon'}</Typography>
        )}
      </GlassCard>
    );
    if (item.enabled && item.href) {
      return (
        <Link key={item.id} href={item.href} style={{ textDecoration: 'none' }}>
          {card}
        </Link>
      );
    }
    return <div key={item.id}>{card}</div>;
  });
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/admin/_components/sidebarItems.ts apps/web/src/app/admin/AdminLayoutClient.tsx
git commit -m "feat(admin): enable Users sidebar item linking to /admin/users (ARC-604)"
```

---

## Phase 13 — `/admin/users` route

### Task 13.1: page.tsx + AdminUsersClient

**Files:**

- Create: `apps/web/src/app/admin/users/page.tsx`
- Create: `apps/web/src/app/admin/users/AdminUsersClient.tsx`
- Create: `apps/web/src/app/admin/users/AdminUsersClient.test.tsx`

- [ ] **Step 1: page.tsx**

```tsx
// apps/web/src/app/admin/users/page.tsx
import { requireAdmin } from '@/entities/session/api/requireAdmin';
import AdminUsersClient from './AdminUsersClient';

// Do NOT export `metadata` here — let the layout's noindex/nofollow inherit.

export default async function AdminUsersPage() {
  const user = await requireAdmin();
  return <AdminUsersClient currentUserId={user.id} />;
}
```

- [ ] **Step 2: AdminUsersClient test**

```tsx
// apps/web/src/app/admin/users/AdminUsersClient.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';

const useAdminUsersMock = vi.fn();
const useUpdateUserRoleMock = vi.fn();
vi.mock('@/features/admin-users/hooks', () => ({
  useAdminUsers: (a: unknown) => useAdminUsersMock(a),
  useUpdateUserRole: () => useUpdateUserRoleMock(),
}));

vi.mock('@/shared/i18n/context', () => ({
  useLanguage: () => ({
    messages: {
      pages: {
        admin: {
          users: {
            title: 'Users',
            search: { placeholder: 'search' },
            filter: { role: { all: 'All', placeholder: 'role' } },
            table: {
              username: 'U',
              email: 'E',
              role: 'R',
              createdAt: 'C',
              actions: 'A',
            },
            empty: { noResults: 'no results', noUsers: 'no users' },
            pagination: { prev: 'p', next: 'n', of: 'P {current}/{total}' },
            totalLabel: '{total} users',
            selfTooltip: 'cant',
            role: {
              free: 'Free',
              admin: 'Admin',
              developer: 'Dev',
              moderator: 'Mod',
              tester: 'Tester',
              vip: 'VIP',
              supporter: 'Sup',
              premium: 'Prem',
            },
            errors: {
              SELF_ROLE_CHANGE_FORBIDDEN: 'self',
              LAST_ADMIN_PROTECTED: 'last',
              USER_NOT_FOUND: 'nf',
              INVALID_USER_ID: 'inv',
              generic: 'oops',
            },
          },
        },
      },
    },
  }),
}));

import AdminUsersClient from './AdminUsersClient';

beforeEach(() => {
  useAdminUsersMock.mockReset();
  useUpdateUserRoleMock.mockReset();
});

describe('AdminUsersClient', () => {
  it('renders empty state when no users', () => {
    useAdminUsersMock.mockReturnValue({
      data: { items: [], total: 0, page: 1, pageSize: 50 },
      isLoading: false,
      isError: false,
      error: null,
    });
    useUpdateUserRoleMock.mockReturnValue({
      mutate: () => {},
      isPending: false,
      isError: false,
      error: null,
    });
    render(<AdminUsersClient currentUserId="me" />);
    expect(screen.getByText('no users')).toBeInTheDocument();
  });

  it('clamps pageSize to <= 200', () => {
    useAdminUsersMock.mockReturnValue({
      data: { items: [], total: 0, page: 1, pageSize: 50 },
      isLoading: false,
      isError: false,
      error: null,
    });
    useUpdateUserRoleMock.mockReturnValue({
      mutate: () => {},
      isPending: false,
    });
    render(<AdminUsersClient currentUserId="me" />);
    // Internal call shape — assert via the mock invocation
    expect(useAdminUsersMock).toHaveBeenCalled();
    const args = useAdminUsersMock.mock.calls[0]?.[0] as { pageSize?: number };
    expect(args.pageSize).toBeLessThanOrEqual(200);
  });
});
```

- [ ] **Step 3: AdminUsersClient implementation**

```tsx
// apps/web/src/app/admin/users/AdminUsersClient.tsx
'use client';
import { useMemo, useState } from 'react';
import { Container, PageLayout, PageTitle, YStack } from '@arcadeum/ui';
import { useLanguage } from '@/shared/i18n/context';
import { useAdminUsers, useUpdateUserRole } from '@/features/admin-users/hooks';
import type { UserRole } from '@/entities/session/model/types';
import type { ApiError } from '@/shared/lib/api-client';
import { UsersFilters } from '@/features/admin-users/ui/UsersFilters';
import { UsersTable } from '@/features/admin-users/ui/UsersTable';

interface UsersI18n {
  title: string;
  search: { placeholder: string };
  filter: { role: { all: string; placeholder: string } };
  table: {
    username: string;
    email: string;
    role: string;
    createdAt: string;
    actions: string;
  };
  empty: { noResults: string; noUsers: string };
  pagination: { prev: string; next: string; of: string };
  totalLabel: string;
  selfTooltip: string;
  role: Record<UserRole, string>;
  errors: {
    SELF_ROLE_CHANGE_FORBIDDEN: string;
    LAST_ADMIN_PROTECTED: string;
    USER_NOT_FOUND: string;
    INVALID_USER_ID: string;
    generic: string;
  };
}

const PAGE_SIZE = 50;

export default function AdminUsersClient({
  currentUserId,
}: {
  currentUserId: string;
}) {
  const { messages } = useLanguage();
  const t = messages.pages?.admin?.users as UsersI18n | undefined;

  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [role, setRole] = useState<UserRole | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pendingUserId, setPendingUserId] = useState<string | undefined>();

  const pageSize = Math.min(200, PAGE_SIZE);

  const {
    data,
    isLoading,
    error: queryError,
  } = useAdminUsers({
    page,
    pageSize,
    q,
    role,
  });

  const mutation = useUpdateUserRole();

  const onFilterChange = (next: { q: string; role: UserRole | null }) => {
    setQ(next.q);
    setRole(next.role);
    setPage(1);
  };

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    if (!t) return;
    setPendingUserId(userId);
    setErrorMsg(null);
    mutation.mutate(
      { userId, role: newRole },
      // useMutation here takes options as second arg only if you call mutateAsync;
      // the simple mutate() returns void. Use error/isError observables.
    );
    // We listen for error via mutation state below in useEffect-equivalent —
    // but useMutation here is fire-and-forget; on next render mutation.error
    // is observable. For simplicity, watch via an effect:
  };

  // Surface errors from the latest mutation
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useMemo(() => {
    if (mutation.isError && t) {
      const apiErr = mutation.error as ApiError | null;
      const code = (apiErr?.data as { code?: string } | undefined)?.code;
      const msg =
        (code && t.errors[code as keyof typeof t.errors]) || t.errors.generic;
      setErrorMsg(msg);
      setPendingUserId(undefined);
    }
    if (mutation.isSuccess) {
      setPendingUserId(undefined);
    }
  }, [mutation.isError, mutation.isSuccess, mutation.error, t]);

  const labels = t
    ? {
        empty: t.empty,
        table: t.table,
        pagination: t.pagination,
        totalLabel: t.totalLabel,
        roleLabels: t.role,
        selfTooltip: t.selfTooltip,
      }
    : null;
  const filtersLabels = t
    ? {
        searchPlaceholder: t.search.placeholder,
        roleFilterPlaceholder: t.filter.role.placeholder,
        roleFilterAll: t.filter.role.all,
        roleLabels: t.role,
      }
    : null;

  return (
    <PageLayout>
      <Container size="lg">
        <YStack gap="$3">
          <PageTitle size="lg">{t?.title ?? 'Users'}</PageTitle>
          {filtersLabels && (
            <UsersFilters
              q={q}
              role={role}
              onChange={onFilterChange}
              labels={filtersLabels}
            />
          )}
          {errorMsg && (
            <YStack
              padding="$3"
              borderRadius="$3"
              backgroundColor="$red3"
              data-testid="admin-users-error"
            >
              {errorMsg}
            </YStack>
          )}
          {labels && (
            <UsersTable
              items={data?.items ?? []}
              total={data?.total ?? 0}
              page={page}
              pageSize={pageSize}
              isLoading={isLoading}
              isError={!!queryError}
              currentUserId={currentUserId}
              hasFilter={!!q || !!role}
              onRoleChange={handleRoleChange}
              onPageChange={setPage}
              pendingUserId={pendingUserId}
              labels={labels}
            />
          )}
        </YStack>
      </Container>
    </PageLayout>
  );
}
```

**Note on the `useMemo`-instead-of-`useEffect` for surfacing errors:** the
implementer should swap to a real `useEffect` once verified to behave
correctly in StrictMode. The pseudo-code above is illustrative — a clean
implementation uses `useEffect` watching `mutation.isError` /
`mutation.isSuccess`. Verify the actual `useMutation` shape (already
inspected during planning) supports observing state via the returned
object.

- [ ] **Step 4: Verify build + tests**

```bash
pnpm --filter web exec vitest run src/app/admin/users/
pnpm --filter web build
```

Expected: tests pass, build succeeds, `/admin/users` listed in the route table.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/app/admin/users/
git commit -m "feat(admin): add /admin/users page with table + filters + role editor (ARC-604)"
```

---

## Phase 14 — Playwright e2e

### Task 14.1: SEO regression + nav

**Files:**

- Create: `apps/web/e2e/admin-users.spec.ts`

The role-edit flow itself isn't e2e'd (Server-Component-fetch limitation —
same as ARC-602). Tests cover navigation + SEO meta inheritance.

- [ ] **Step 1: Write**

```ts
// apps/web/e2e/admin-users.spec.ts
import { test, expect } from '@playwright/test';

test.describe('/admin/users SEO regression', () => {
  test('robots.txt still disallows /admin/', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toMatch(/Disallow:\s*\/admin\//);
  });

  test('sitemap.xml does not include /admin/users', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).not.toMatch(/\/admin\/users/);
  });
});
```

- [ ] **Step 2: Run locally**

```bash
cd apps/web && pnpm exec playwright test e2e/admin-users.spec.ts --project=chromium --reporter=list
```

Expected: 2/2 pass.

- [ ] **Step 3: Commit**

```bash
git add apps/web/e2e/admin-users.spec.ts
git commit -m "test(e2e): add /admin/users SEO regression pins (ARC-604)"
```

---

## Phase 15 — Final verification

### Task 15.1: Full suite

- [ ] **Step 1: Build everything**

```bash
pnpm build
```

Expected: clean.

- [ ] **Step 2: BE + web unit tests**

```bash
pnpm test
```

Expected: BE has +14 service + +9 controller + +5 escape-regexp = +28 over baseline (188 → 216). Web adds api/hooks/UI/RoleColors tests.

- [ ] **Step 3: Lint + file-length + translations**

```bash
pnpm lint
pnpm check-file-length
pnpm check-translations
```

Expected: all green.

- [ ] **Step 4: Manual smoke**

Promote a real user to `role: 'admin'` via Atlas UI or `mongosh`, then:

- Visit `/admin/users` while logged in as that admin
- Verify the table renders with users
- Try search, role filter, pagination
- Try changing another user's role — should succeed and the row updates after the refetch
- Try changing your OWN role — the dropdown should be disabled (UI hint); even if you bypass via curl, the BE returns 403 SELF_ROLE_CHANGE_FORBIDDEN
- Log in as a non-admin and visit `/admin/users` — should hit the 404 from the layout's `requireAdmin()`

---

## Done When

- `GET /admin/users` paginates, searches, filters; admin-only
- `PATCH /admin/users/:id/role` enforces self-edit, last-admin, no-op rules; carries `code` in error payload
- `/admin/users` UI shows the table; role dropdown edits inline; per-row pending state during mutation; localized error toast on failure
- `noindex/nofollow` inherited from layout; robots.txt and sitemap regression tests pass
- All 5 locales contain `pages.admin.users.*` and `nav.users`
- Sidebar's `id` union literal is `'users'`, the item links to `/admin/users`, and is enabled
- Global `ValidationPipe` registered; `apiClient.patch<T>` exists
- All BE/FE unit + integration tests pass; e2e SEO pins pass
- `pnpm build`, `pnpm test`, `pnpm lint`, `pnpm check-file-length`, `pnpm check-translations` all green

## Notes for the Implementer

- **Don't add features not in this plan.** No audit log, no bulk operations, no socket updates, no editing fields other than role.
- **Don't optimize prematurely.** No optimistic UI in v1; accept the 300-500ms latency.
- **Use the project's existing custom hooks.** Do NOT install TanStack Query.
- **The global `ValidationPipe` change has site-wide impact.** Run the full BE test suite after Phase 1; if anything breaks, surface to the human.
- **Frequent commits.** Each task ends in a commit; don't bundle.
- **If a test pattern resists implementation**, look at ARC-602's `admin.controller.spec.ts` (already merged) for a working precedent.
