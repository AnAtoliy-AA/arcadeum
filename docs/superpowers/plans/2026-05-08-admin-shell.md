# Admin Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the foundation for `/admin` — a server-gated admin shell route, a reusable `RolesGuard`, and a placeholder UI with disabled nav for future feature panels.

**Architecture:** Server Component layout calls `requireAdmin()`, which fetches `/auth/me` with the cookie token and `notFound()`s on any non-admin outcome. On the BE, a `RolesGuard` reads `@Roles()` metadata via Reflector and looks up the user's role from MongoDB (since the JWT payload doesn't carry role). One demo `GET /admin/ping` validates the wiring; future feature controllers slot into `AdminModule`.

**Tech Stack:** NestJS, Mongoose, Next.js 16 App Router (Server Components), Tamagui (`@arcadeum/ui`), Jest (BE), Vitest (FE), Playwright (e2e).

**Spec:** [docs/superpowers/specs/2026-05-08-admin-shell-design.md](../specs/2026-05-08-admin-shell-design.md)

---

## File Inventory

### New (BE)

- `apps/be/src/auth/guards/roles.constants.ts` — `ROLES_KEY` constant
- `apps/be/src/auth/guards/roles.decorator.ts` — `@Roles(...roles)` decorator
- `apps/be/src/auth/guards/roles.guard.ts` — guard with DB role lookup
- `apps/be/src/auth/guards/roles.guard.spec.ts` — unit tests
- `apps/be/src/admin/admin.module.ts`
- `apps/be/src/admin/admin.controller.ts` — `GET /admin/ping`
- `apps/be/src/admin/admin.controller.spec.ts` — integration tests

### New (FE)

- `apps/web/src/entities/session/api/requireAdmin.ts`
- `apps/web/src/entities/session/api/requireAdmin.test.ts`
- `apps/web/src/app/admin/layout.tsx` — Server Component gate
- `apps/web/src/app/admin/page.tsx` — landing dashboard
- `apps/web/src/app/admin/error.tsx` — local error boundary (`'use client'`)
- `apps/web/src/app/admin/not-found.tsx` — local 404 (matches global)
- `apps/web/src/app/admin/AdminLayoutClient.tsx` — shell UI (`'use client'`)
- `apps/web/src/app/admin/_components/sidebarItems.ts` — static nav config
- `apps/web/e2e/admin.spec.ts` — Playwright e2e

### Modified

- `apps/be/src/app.module.ts` — register `AdminModule`
- `apps/web/src/shared/i18n/messages/pages/{en,ru,es,fr,by}.ts` — add `admin` namespace
- `apps/web/e2e/fixtures/utils/auth.ts` — extend `mockSession` to accept `role` override

### Unchanged but verified

- `apps/web/src/app/robots.ts` — already disallows `/admin/`
- `apps/web/src/app/sitemap.ts` — does not list `/admin`

---

## Phase 1 — Backend `RolesGuard` (TDD)

### Task 1.1: Roles constants + decorator

**Files:**

- Create: `apps/be/src/auth/guards/roles.constants.ts`
- Create: `apps/be/src/auth/guards/roles.decorator.ts`

- [ ] **Step 1: Create the constants file**

```ts
// apps/be/src/auth/guards/roles.constants.ts
export const ROLES_KEY = 'roles';
```

- [ ] **Step 2: Create the decorator**

```ts
// apps/be/src/auth/guards/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import type { UserRole } from '../lib/roles';
import { ROLES_KEY } from './roles.constants';

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
```

- [ ] **Step 3: Verify it compiles**

```bash
pnpm --filter be build
```

Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add apps/be/src/auth/guards/roles.constants.ts apps/be/src/auth/guards/roles.decorator.ts
git commit -m "feat(auth): add ROLES_KEY constant and @Roles() decorator (ARC-602)"
```

---

### Task 1.2: `RolesGuard` — failing tests first

**Files:**

- Create: `apps/be/src/auth/guards/roles.guard.spec.ts`

- [ ] **Step 1: Write the spec with all five test cases**

```ts
// apps/be/src/auth/guards/roles.guard.spec.ts
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { RolesGuard } from './roles.guard';
import { ROLES_KEY } from './roles.constants';
import { User } from '../schemas/user.schema';

type MockUserModel = {
  findById: jest.Mock;
};

const buildContext = (
  user: { userId?: string } | undefined,
): ExecutionContext => {
  const handler = function handler() {};
  const cls = class Anon {};
  return {
    getHandler: () => handler,
    getClass: () => cls,
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  } as unknown as ExecutionContext;
};

const buildModel = (role: string | null): MockUserModel => ({
  findById: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue(role === null ? null : { role }),
    }),
  }),
});

describe('RolesGuard', () => {
  let reflector: Reflector;

  const setup = async (model: MockUserModel) => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        RolesGuard,
        Reflector,
        { provide: getModelToken(User.name), useValue: model },
      ],
    }).compile();
    reflector = moduleRef.get(Reflector);
    return moduleRef.get(RolesGuard);
  };

  it('falls open when no @Roles() metadata is present', async () => {
    const model = buildModel('free');
    const guard = await setup(model);
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const ok = await guard.canActivate(buildContext({ userId: 'u1' }));
    expect(ok).toBe(true);
    expect(model.findById).not.toHaveBeenCalled();
  });

  it('allows when DB role matches one of the required roles', async () => {
    const model = buildModel('admin');
    const guard = await setup(model);
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
    const ok = await guard.canActivate(buildContext({ userId: 'u1' }));
    expect(ok).toBe(true);
  });

  it('denies when DB role does not match', async () => {
    const model = buildModel('developer');
    const guard = await setup(model);
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
    const ok = await guard.canActivate(buildContext({ userId: 'u1' }));
    expect(ok).toBe(false);
  });

  it('throws ForbiddenException when DB lookup returns null (deleted user)', async () => {
    const model = buildModel(null);
    const guard = await setup(model);
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
    await expect(
      guard.canActivate(buildContext({ userId: 'u1' })),
    ).rejects.toThrow(ForbiddenException);
  });

  it('throws ForbiddenException when req.user is missing', async () => {
    const model = buildModel('admin');
    const guard = await setup(model);
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
    await expect(guard.canActivate(buildContext(undefined))).rejects.toThrow(
      ForbiddenException,
    );
  });
});
```

- [ ] **Step 2: Run the test, expect failure**

```bash
pnpm --filter be exec jest src/auth/guards/roles.guard.spec.ts
```

Expected: FAIL — `RolesGuard` module not found.

---

### Task 1.3: `RolesGuard` — implementation

**Files:**

- Create: `apps/be/src/auth/guards/roles.guard.ts`

- [ ] **Step 1: Implement the guard**

```ts
// apps/be/src/auth/guards/roles.guard.ts
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
import type { UserRole } from '../lib/roles';
import type { AuthenticatedUser } from '../jwt/jwt.strategy';
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

- [ ] **Step 2: Run the test, expect pass**

```bash
pnpm --filter be exec jest src/auth/guards/roles.guard.spec.ts
```

Expected: PASS — 5 tests.

- [ ] **Step 3: Commit**

```bash
git add apps/be/src/auth/guards/roles.guard.ts apps/be/src/auth/guards/roles.guard.spec.ts
git commit -m "feat(auth): add RolesGuard with DB-backed role lookup (ARC-602)"
```

---

## Phase 2 — Backend `AdminModule`

### Task 2.1: Admin controller (write code first, then integration test)

**Files:**

- Create: `apps/be/src/admin/admin.controller.ts`
- Create: `apps/be/src/admin/admin.module.ts`

- [ ] **Step 1: Write the controller**

```ts
// apps/be/src/admin/admin.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';

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

- [ ] **Step 2: Write the module**

```ts
// apps/be/src/admin/admin.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { User, UserSchema } from '../auth/schemas/user.schema';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AdminController } from './admin.controller';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [AdminController],
  providers: [RolesGuard],
})
export class AdminModule {}
```

- [ ] **Step 3: Register in `app.module.ts`**

Open `apps/be/src/app.module.ts`. Add the import near the others:

```ts
import { AdminModule } from './admin/admin.module';
```

Add `AdminModule` to the `imports` array (place after `LeaderboardsModule` to match alphabetical-ish order).

- [ ] **Step 4: Verify the BE builds and starts**

```bash
pnpm --filter be build
```

Expected: build succeeds.

- [ ] **Step 5: Commit**

```bash
git add apps/be/src/admin/ apps/be/src/app.module.ts
git commit -m "feat(admin): add AdminModule with /admin/ping demo endpoint (ARC-602)"
```

---

### Task 2.2: Admin controller integration tests

**Files:**

- Create: `apps/be/src/admin/admin.controller.spec.ts`

**Approach:** there is no existing precedent in `apps/be` for HTTP integration tests with `JwtStrategy`/Passport (verified — `chat.controller.spec.ts` only does direct controller method calls, no supertest). Wiring `JwtStrategy` with a real `ConfigService` is fragile and out of scope.

Instead, use Nest's `Test.createTestingModule` with `.overrideGuard(JwtAuthGuard)` to short-circuit `JwtAuthGuard` (it just sets `req.user`), then let `RolesGuard` run for real against a mocked `userModel`. The 401 case (no token) is `JwtAuthGuard`'s responsibility; that guard comes from `@nestjs/passport` and is verified at the e2e layer (Playwright Task 6.2).

- [ ] **Step 1: Write the spec**

```ts
// apps/be/src/admin/admin.controller.spec.ts
import { INestApplication, ExecutionContext } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import * as request from 'supertest';
import { AdminController } from './admin.controller';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { User } from '../auth/schemas/user.schema';

describe('AdminController (integration)', () => {
  let app: INestApplication;
  let userModel: { findById: jest.Mock };

  const mockRole = (role: string | null) =>
    userModel.findById.mockReturnValue({
      select: () => ({
        lean: () => Promise.resolve(role === null ? null : { role }),
      }),
    });

  beforeAll(async () => {
    userModel = { findById: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        RolesGuard,
        { provide: getModelToken(User.name), useValue: userModel },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx: ExecutionContext) => {
          ctx.switchToHttp().getRequest().user = {
            userId: 'u1',
            email: 'u@x',
            username: 'u',
          };
          return true;
        },
      })
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    userModel.findById.mockReset();
  });

  it('returns 403 for a non-admin role', async () => {
    mockRole('developer');
    await request(app.getHttpServer()).get('/admin/ping').expect(403);
  });

  it('returns 403 when the user record was deleted', async () => {
    mockRole(null);
    await request(app.getHttpServer()).get('/admin/ping').expect(403);
  });

  it('returns 200 { ok: true } for an admin role', async () => {
    mockRole('admin');
    const res = await request(app.getHttpServer())
      .get('/admin/ping')
      .expect(200);
    expect(res.body).toEqual({ ok: true });
  });
});
```

This isn't strict supertest-with-real-JWT, but it exercises `RolesGuard` against the real controller via the HTTP pipeline — which is the wiring this PR actually adds.

- [ ] **Step 2: Verify `supertest` is a BE dev dependency, install if missing**

```bash
grep -q '"supertest"' apps/be/package.json && echo OK || pnpm --filter be add -D supertest @types/supertest
```

- [ ] **Step 3: Run the spec**

```bash
pnpm --filter be exec jest src/admin/admin.controller.spec.ts
```

Expected: all 3 tests pass.

- [ ] **Step 4: Commit**

```bash
git add apps/be/src/admin/admin.controller.spec.ts apps/be/package.json pnpm-lock.yaml 2>/dev/null || git add apps/be/src/admin/admin.controller.spec.ts
git commit -m "test(admin): add /admin/ping integration tests (ARC-602)"
```

---

## Phase 3 — Frontend `requireAdmin` (TDD)

### Task 3.1: Failing tests for `requireAdmin`

**Files:**

- Create: `apps/web/src/entities/session/api/requireAdmin.test.ts`

- [ ] **Step 1: Write the test file**

```ts
// apps/web/src/entities/session/api/requireAdmin.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const cookiesMock = vi.fn();
const notFoundMock = vi.fn(() => {
  throw new Error('NEXT_NOT_FOUND');
});

vi.mock('next/headers', () => ({
  cookies: () => cookiesMock(),
}));

vi.mock('next/navigation', () => ({
  notFound: () => notFoundMock(),
}));

vi.mock('@/shared/lib/api-base', () => ({
  resolveApiUrl: (p: string) => `http://test${p}`,
}));

const setCookie = (token: string | null) => {
  cookiesMock.mockResolvedValue({
    get: (name: string) =>
      name === 'web_access_token' && token ? { value: token } : undefined,
  });
};

const setFetch = (impl: () => Promise<Response> | Response) => {
  vi.stubGlobal('fetch', vi.fn(impl as never));
};

const setFetchThrow = (err: Error) => {
  vi.stubGlobal(
    'fetch',
    vi.fn(() => Promise.reject(err)),
  );
};

const okJson = (body: unknown) =>
  new Response(JSON.stringify(body), { status: 200 });
const errStatus = (status: number) => new Response('', { status });

describe('requireAdmin', () => {
  beforeEach(() => {
    vi.resetModules();
    cookiesMock.mockReset();
    notFoundMock.mockClear();
  });

  it('calls notFound when no token cookie', async () => {
    setCookie(null);
    const { requireAdmin } = await import('./requireAdmin');
    await expect(requireAdmin()).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFoundMock).toHaveBeenCalledTimes(1);
  });

  it('calls notFound when fetch throws (network error)', async () => {
    setCookie('t');
    setFetchThrow(new Error('ECONNREFUSED'));
    const { requireAdmin } = await import('./requireAdmin');
    await expect(requireAdmin()).rejects.toThrow('NEXT_NOT_FOUND');
  });

  it('calls notFound when /auth/me returns 401', async () => {
    setCookie('t');
    setFetch(() => errStatus(401));
    const { requireAdmin } = await import('./requireAdmin');
    await expect(requireAdmin()).rejects.toThrow('NEXT_NOT_FOUND');
  });

  it('calls notFound when /auth/me returns 5xx', async () => {
    setCookie('t');
    setFetch(() => errStatus(503));
    const { requireAdmin } = await import('./requireAdmin');
    await expect(requireAdmin()).rejects.toThrow('NEXT_NOT_FOUND');
  });

  it.each([
    'free',
    'developer',
    'moderator',
    'supporter',
    'vip',
    'premium',
    'tester',
  ])('calls notFound when role is %s', async (role) => {
    setCookie('t');
    setFetch(() =>
      okJson({ id: '1', email: 'a', username: 'b', displayName: 'c', role }),
    );
    const { requireAdmin } = await import('./requireAdmin');
    await expect(requireAdmin()).rejects.toThrow('NEXT_NOT_FOUND');
  });

  it('returns the user when role is admin', async () => {
    setCookie('t');
    const profile = {
      id: '1',
      email: 'a',
      username: 'b',
      displayName: 'c',
      role: 'admin',
    };
    setFetch(() => okJson(profile));
    const { requireAdmin } = await import('./requireAdmin');
    await expect(requireAdmin()).resolves.toEqual(profile);
  });
});
```

- [ ] **Step 2: Run, expect fail**

```bash
pnpm --filter web exec vitest run src/entities/session/api/requireAdmin.test.ts
```

Expected: FAIL — module not found.

---

### Task 3.2: Implement `requireAdmin`

**Files:**

- Create: `apps/web/src/entities/session/api/requireAdmin.ts`

- [ ] **Step 1: Implement**

```ts
// apps/web/src/entities/session/api/requireAdmin.ts
import 'server-only';
import { notFound } from 'next/navigation';
import { resolveApiUrl } from '@/shared/lib/api-base';
import { getServerAccessToken } from './serverTokens';
import type { AuthUserProfile } from './authApi';

export async function requireAdmin(): Promise<AuthUserProfile> {
  const token = await getServerAccessToken();
  if (!token) notFound();

  let res: Response;
  try {
    res = await fetch(resolveApiUrl('/auth/me'), {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
  } catch {
    notFound();
  }
  if (!res.ok) notFound();

  const user = (await res.json()) as AuthUserProfile;
  if (user.role !== 'admin') notFound();
  return user;
}
```

Note: TypeScript will warn that `notFound()` returns `never`, so the explicit `return` after each `notFound()` is unnecessary. Keep the code as written; the type system handles flow.

- [ ] **Step 2: Run tests, expect pass**

```bash
pnpm --filter web exec vitest run src/entities/session/api/requireAdmin.test.ts
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/entities/session/api/requireAdmin.ts apps/web/src/entities/session/api/requireAdmin.test.ts
git commit -m "feat(web): add requireAdmin server helper for /admin gate (ARC-602)"
```

---

## Phase 4 — i18n

### Task 4.1: Add `admin` namespace to all 5 locales

**Files:**

- Modify: `apps/web/src/shared/i18n/messages/pages/{en,ru,es,fr,by}.ts`

Each locale file is an object literal where each top-level key is a page namespace (e.g. `tournaments`, `blog`). Add a new `admin` key to each.

- [ ] **Step 1: Add to `en.ts`**

Insert after the `tournaments` block (or anywhere in the object — keep alphabetical-ish):

```ts
admin: {
  title: 'Admin',
  welcome: 'Welcome to the admin area',
  welcomeBody:
    'Feature panels will appear here as they ship. Use the sidebar to navigate.',
  signedInAs: 'Signed in as {username}',
  nav: {
    dashboard: 'Dashboard',
    roles: 'Roles',
    payments: 'Payments',
    announcements: 'Announcements',
    tournaments: 'Tournaments',
    comingSoon: 'Coming soon',
  },
  error: {
    title: 'Something went wrong',
    body: 'An error occurred while loading this admin page.',
    retry: 'Try again',
  },
},
```

- [ ] **Step 2: Add the same shape to `ru.ts`, `es.ts`, `fr.ts`, `by.ts` with locale-appropriate translations**

Provide actual translations — do **not** leave English strings in non-English locale files. Use the suggested values below as a starting point; refine if the locale already has an established term in adjacent namespaces (e.g. how `tournaments` translates "Welcome" in `ru.ts`).

- `ru.ts` — `title: 'Админ'`, `welcome: 'Добро пожаловать в панель администратора'`, `welcomeBody: 'Панели функций будут появляться здесь по мере готовности. Используйте боковое меню для навигации.'`, `signedInAs: 'Вы вошли как {username}'`, `nav.dashboard: 'Панель'`, `nav.roles: 'Роли'`, `nav.payments: 'Платежи'`, `nav.announcements: 'Объявления'`, `nav.tournaments: 'Турниры'`, `nav.comingSoon: 'Скоро'`, `error.title: 'Что-то пошло не так'`, `error.body: 'Произошла ошибка при загрузке этой страницы.'`, `error.retry: 'Повторить'`.
- `es.ts` — `title: 'Administración'`, `welcome: 'Bienvenido al panel de administración'`, `welcomeBody: 'Los paneles aparecerán aquí a medida que se publiquen. Usa la barra lateral para navegar.'`, `signedInAs: 'Sesión iniciada como {username}'`, `nav.dashboard: 'Panel'`, `nav.roles: 'Roles'`, `nav.payments: 'Pagos'`, `nav.announcements: 'Anuncios'`, `nav.tournaments: 'Torneos'`, `nav.comingSoon: 'Próximamente'`, `error.title: 'Algo salió mal'`, `error.body: 'Se produjo un error al cargar esta página.'`, `error.retry: 'Reintentar'`.
- `fr.ts` — `title: 'Administration'`, `welcome: "Bienvenue dans l'espace administrateur"`, `welcomeBody: 'Les panneaux apparaîtront ici au fur et à mesure de leur publication. Utilisez la barre latérale pour naviguer.'`, `signedInAs: 'Connecté en tant que {username}'`, `nav.dashboard: 'Tableau de bord'`, `nav.roles: 'Rôles'`, `nav.payments: 'Paiements'`, `nav.announcements: 'Annonces'`, `nav.tournaments: 'Tournois'`, `nav.comingSoon: 'Bientôt'`, `error.title: "Une erreur s'est produite"`, `error.body: 'Une erreur est survenue lors du chargement de cette page.'`, `error.retry: 'Réessayer'`.
- `by.ts` — `title: 'Адмін'`, `welcome: 'Сардэчна запрашаем у панэль адміністратара'`, `welcomeBody: 'Панэлі функцый будуць з\'яўляцца тут па меры гатоўнасці. Выкарыстоўвайце бакавое меню для навігацыі.'`, `signedInAs: 'Вы ўвайшлі як {username}'`, `nav.dashboard: 'Панэль'`, `nav.roles: 'Ролі'`, `nav.payments: 'Плацяжы'`, `nav.announcements: 'Аб\'явы'`, `nav.tournaments: 'Турніры'`, `nav.comingSoon: 'Хутка'`, `error.title: 'Нешта пайшло не так'`, `error.body: 'Адбылася памылка пры загрузцы гэтай старонкі.'`, `error.retry: 'Паўтарыць'`.

The `pnpm check-translations` script will fail if any key is missing in any locale.

- [ ] **Step 3: Verify translations validate**

```bash
pnpm check-translations
```

Expected: ✅ All translation keys are present.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/shared/i18n/messages/pages/
git commit -m "feat(i18n): add admin namespace to all 5 locales (ARC-602)"
```

---

## Phase 5 — Frontend shell

### Task 5.1: Sidebar items config

**Files:**

- Create: `apps/web/src/app/admin/_components/sidebarItems.ts`

- [ ] **Step 1: Create the file**

```ts
// apps/web/src/app/admin/_components/sidebarItems.ts
export interface AdminSidebarItem {
  id: 'dashboard' | 'roles' | 'payments' | 'announcements' | 'tournaments';
  href: string | null;
  enabled: boolean;
}

export const ADMIN_SIDEBAR_ITEMS: readonly AdminSidebarItem[] = [
  { id: 'dashboard', href: '/admin', enabled: true },
  { id: 'roles', href: null, enabled: false },
  { id: 'payments', href: null, enabled: false },
  { id: 'announcements', href: null, enabled: false },
  { id: 'tournaments', href: null, enabled: false },
];
```

The labels come from i18n at render time via `nav[id]`.

---

### Task 5.2: `AdminLayoutClient`

**Files:**

- Create: `apps/web/src/app/admin/AdminLayoutClient.tsx`

- [ ] **Step 1: Create the component**

Use `@arcadeum/ui` primitives only — no new shared components. Follow patterns from existing pages (e.g. `apps/web/src/app/tournaments/TournamentsPageContent.tsx` for `PageLayout`/`Container`/`GlassCard`/`Typography`).

```tsx
// apps/web/src/app/admin/AdminLayoutClient.tsx
'use client';

import {
  PageLayout,
  Container,
  GlassCard,
  Typography,
  XStack,
  YStack,
} from '@arcadeum/ui';
import type { ReactNode } from 'react';
import { useLanguage } from '@/shared/i18n/context';
import { ADMIN_SIDEBAR_ITEMS } from './_components/sidebarItems';

interface AdminLayoutClientProps {
  username: string;
  children: ReactNode;
}

export default function AdminLayoutClient({
  username,
  children,
}: AdminLayoutClientProps) {
  const { messages } = useLanguage();
  const t = messages.pages?.admin;
  const navT = t?.nav;

  return (
    <PageLayout>
      <Container size="lg">
        <GlassCard p="$3" mb="$3">
          <Typography variant="caption" alpha="medium">
            {(t?.signedInAs ?? 'Signed in as {username}').replace(
              '{username}',
              username,
            )}
          </Typography>
        </GlassCard>

        <XStack gap="$4" flexWrap="wrap">
          <YStack
            gap="$2"
            width={220}
            minWidth={200}
            data-testid="admin-sidebar"
          >
            {ADMIN_SIDEBAR_ITEMS.map((item) => (
              <GlassCard
                key={item.id}
                p="$3"
                opacity={item.enabled ? 1 : 0.5}
                data-testid={`admin-nav-${item.id}`}
              >
                <Typography variant="label" uiSize="md" fontWeight="700">
                  {navT?.[item.id] ?? item.id}
                </Typography>
                {!item.enabled && (
                  <Typography variant="caption" alpha="low">
                    {navT?.comingSoon ?? 'Coming soon'}
                  </Typography>
                )}
              </GlassCard>
            ))}
          </YStack>

          <YStack flex={1} minWidth={280}>
            {children}
          </YStack>
        </XStack>
      </Container>
    </PageLayout>
  );
}
```

If this file approaches 200 lines, split the sidebar into its own component. (Currently ~70 lines, well under.)

- [ ] **Step 2: Verify compile**

```bash
pnpm --filter web exec tsc --noEmit
```

Expected: no errors.

---

### Task 5.3: `layout.tsx`, `page.tsx`, `error.tsx`, `not-found.tsx`

**Files:**

- Create: `apps/web/src/app/admin/layout.tsx`
- Create: `apps/web/src/app/admin/page.tsx`
- Create: `apps/web/src/app/admin/error.tsx`
- Create: `apps/web/src/app/admin/not-found.tsx`

- [ ] **Step 1: layout.tsx (Server Component, the gate)**

```tsx
// apps/web/src/app/admin/layout.tsx
import type { Metadata, ReactNode } from 'next';
import { requireAdmin } from '@/entities/session/api/requireAdmin';
import AdminLayoutClient from './AdminLayoutClient';

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireAdmin();
  return (
    <AdminLayoutClient username={user.username}>{children}</AdminLayoutClient>
  );
}
```

- [ ] **Step 2: page.tsx (landing dashboard)**

```tsx
// apps/web/src/app/admin/page.tsx
import { GlassCard, PageTitle, Typography } from '@arcadeum/ui';
import { getTranslations } from '@/shared/i18n/server';

export default async function AdminPage() {
  const messages = await getTranslations();
  const t = messages.pages?.admin;

  return (
    <GlassCard p="$4" data-testid="admin-dashboard">
      <PageTitle size="lg" gradient>
        {t?.welcome ?? 'Welcome to the admin area'}
      </PageTitle>
      <Typography variant="body" uiSize="md" alpha="medium">
        {t?.welcomeBody ??
          'Feature panels will appear here as they ship. Use the sidebar to navigate.'}
      </Typography>
    </GlassCard>
  );
}
```

- [ ] **Step 3: error.tsx (Client Component — Next.js requirement)**

```tsx
// apps/web/src/app/admin/error.tsx
'use client';

import { GlassCard, Typography, Button } from '@arcadeum/ui';
import { useLanguage } from '@/shared/i18n/context';

export default function AdminError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const { messages } = useLanguage();
  const t = messages.pages?.admin?.error;

  return (
    <GlassCard p="$4" data-testid="admin-error">
      <Typography variant="label" uiSize="lg" fontWeight="700">
        {t?.title ?? 'Something went wrong'}
      </Typography>
      <Typography variant="body" uiSize="md" alpha="medium">
        {t?.body ?? 'An error occurred while loading this admin page.'}
      </Typography>
      <Button onPress={reset} mt="$3">
        {t?.retry ?? 'Try again'}
      </Button>
    </GlassCard>
  );
}
```

(`Button` is verified to be exported from `@arcadeum/ui` at `packages/ui/src/index.ts`.)

- [ ] **Step 4: not-found.tsx (must look like the global 404)**

There is no project-wide `not-found.tsx` at the root currently (verified during planning). Create a minimal one here:

```tsx
// apps/web/src/app/admin/not-found.tsx
import {
  PageLayout,
  Container,
  GlassCard,
  PageTitle,
  Typography,
} from '@arcadeum/ui';

export default function AdminNotFound() {
  return (
    <PageLayout>
      <Container size="md">
        <GlassCard p="$5" data-testid="admin-not-found">
          <PageTitle size="xl" gradient>
            404
          </PageTitle>
          <Typography variant="body" uiSize="md" alpha="medium">
            Page not found.
          </Typography>
        </GlassCard>
      </Container>
    </PageLayout>
  );
}
```

**Critical:** this page must NOT show the admin sidebar. Because the layout threw via `notFound()`, the admin shell layout never mounts; this `not-found.tsx` is rendered standalone (Next.js routes the response to the closest `not-found.tsx` outside the failing layout). Just keep it free of `AdminLayoutClient` imports and admin nav. The Playwright tests assert this.

- [ ] **Step 5: Verify the build**

```bash
pnpm --filter web build
```

Expected: build succeeds and `/admin` shows as a route.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/app/admin/
git commit -m "feat(web): add /admin shell with server-side admin gate (ARC-602)"
```

---

## Phase 6 — E2E tests

### Task 6.1: Extend `mockSession` to support role override

**Files:**

- Modify: `apps/web/e2e/fixtures/utils/auth.ts`

**Spec deviation note:** the spec's "Admin user fixture" section describes 3 alternatives (test-only seed endpoint / DB write / env-seeded admin). Task 6.1 supersedes that — we use route-mocking via Playwright's `page.route('**/auth/me', ...)`, which matches the existing `mockSession` pattern and avoids any BE seeding work. This is a strict improvement: same coverage, zero new infrastructure.

**Mock-shape commitment:** the existing `mockSession` mocks `/auth/me` with `{ user: { ... } }` (a wrapped shape), but the real BE `GET /auth/me` returns the raw `AuthUserProfile` (verified at [apps/be/src/auth/auth.controller.ts:83-91](../../../apps/be/src/auth/auth.controller.ts#L83-L91)). The new `requireAdmin()` consumes the raw shape. **Decision:** do not modify the shared `mockSession` `/auth/me` route (existing tests rely on the wrapped shape, however buggy). Instead, the admin e2e (Task 6.2) overrides the `/auth/me` route inline with the raw shape. The shared `mockSession` only needs to set the auth cookie; we don't need it to return the right profile shape for the admin tests.

This means Task 6.1's role parameter is used only to set the cookie/session-state; the actual profile response is mocked in Task 6.2.

- [ ] **Step 1: Add a `role` option to `MockSessionOptions`**

In `apps/web/e2e/fixtures/utils/auth.ts`:

```ts
export interface MockSessionOptions {
  persistent?: boolean;
  role?:
    | 'free'
    | 'admin'
    | 'developer'
    | 'moderator'
    | 'tester'
    | 'premium'
    | 'vip'
    | 'supporter'
    | null;
}
```

In the function body, replace the literal `role: null` inside `snapshot` with `role: options.role ?? null`. **Do not change the `/auth/me` route mock** — existing tests rely on its current shape; Task 6.2 overrides the route inline.

- [ ] **Step 2: Verify the existing auth e2e suite still passes**

```bash
pnpm --filter web exec playwright test e2e/auth.spec.ts
```

Expected: still passing.

- [ ] **Step 3: Commit**

```bash
git add apps/web/e2e/fixtures/utils/auth.ts
git commit -m "test(e2e): add role option to mockSession (ARC-602)"
```

---

### Task 6.2: Write admin e2e spec

**Files:**

- Create: `apps/web/e2e/admin.spec.ts`

- [ ] **Step 1: Verify `mockSession` is re-exported from `test-utils`**

```bash
grep -n "auth" apps/web/e2e/fixtures/test-utils.ts
```

Expected: a line like `export * from './utils/auth';`. (Verified during planning that this re-export exists. If it doesn't, add it.)

- [ ] **Step 2: Write the spec**

The admin tests override `/auth/me` inline with the raw `AuthUserProfile` shape (matches the real BE), independent of `mockSession`'s mock shape. The anonymous-user test uses an explicit 401 response to avoid any flakiness from the `/auth/me` route hitting a real (or missing) BE.

```ts
// apps/web/e2e/admin.spec.ts
import { test, expect, type Page, type Route } from '@playwright/test';
import { mockSession, MOCK_OBJECT_ID } from './fixtures/test-utils';

const profile = (role: string) => ({
  id: MOCK_OBJECT_ID,
  email: 'admin@example.com',
  username: 'adminuser',
  displayName: 'Admin',
  role,
});

const stubAuthMe = async (page: Page, body: unknown, status = 200) => {
  await page.route('**/auth/me', (route: Route) =>
    route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(body),
    }),
  );
};

test.describe('/admin gate', () => {
  test('anonymous user gets the local 404 page', async ({ page }) => {
    // Stub /auth/me to 401 so the gate does not depend on BE availability.
    await stubAuthMe(page, { error: 'unauthorized' }, 401);
    const res = await page.goto('/admin');
    expect(res?.status()).toBe(404);
    await expect(page.getByTestId('admin-not-found')).toBeVisible();
    await expect(page.getByTestId('admin-sidebar')).toHaveCount(0);
  });

  test('logged-in non-admin user gets 404', async ({ page }) => {
    await mockSession(page, { role: 'free' });
    await stubAuthMe(page, profile('free'));
    const res = await page.goto('/admin');
    expect(res?.status()).toBe(404);
    await expect(page.getByTestId('admin-not-found')).toBeVisible();
    await expect(page.getByTestId('admin-sidebar')).toHaveCount(0);
  });

  test('logged-in admin user sees the admin shell', async ({ page }) => {
    await mockSession(page, { role: 'admin' });
    await stubAuthMe(page, profile('admin'));
    await page.goto('/admin');
    await expect(page.getByTestId('admin-sidebar')).toBeVisible();
    await expect(page.getByTestId('admin-dashboard')).toBeVisible();
    await expect(page.getByTestId('admin-nav-roles')).toBeVisible();
  });

  test('admin page has noindex robots meta', async ({ page }) => {
    await mockSession(page, { role: 'admin' });
    await stubAuthMe(page, profile('admin'));
    await page.goto('/admin');
    const robotsMeta = await page
      .locator('meta[name="robots"]')
      .getAttribute('content');
    expect(robotsMeta).toMatch(/noindex/);
    expect(robotsMeta).toMatch(/nofollow/);
  });

  test('robots.txt disallows /admin/', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toMatch(/Disallow:\s*\/admin\//);
  });

  test('sitemap.xml does not include /admin', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).not.toMatch(/\/admin/);
  });
});
```

**`page.route` ordering caveat:** `mockSession` also calls `page.route('**/auth/me', ...)`. Playwright runs registered routes in **last-added first** order, so calling `stubAuthMe` after `mockSession` should win. Verify this empirically — if the wrong handler answers, use `page.unroute('**/auth/me')` before adding the new one.

**`data-testid` caveat:** the admin shell uses `data-testid` on Tamagui-styled `GlassCard`/`YStack` components, which forward `data-*` attributes to the rendered DOM by default. If `getByTestId` fails to locate a node despite the attribute being present in the props, the Tamagui wrapper may strip it; in that case switch to a stable `id`-based selector.

- [ ] **Step 3: Run the spec**

```bash
pnpm --filter web exec playwright test e2e/admin.spec.ts
```

Expected: all 6 tests pass.

- [ ] **Step 4: Commit**

```bash
git add apps/web/e2e/admin.spec.ts
git commit -m "test(e2e): add /admin gate, SEO, robots, sitemap regression tests (ARC-602)"
```

---

## Phase 7 — Final verification

### Task 7.1: Full repo build + tests

- [ ] **Step 1: Run the whole pipeline**

```bash
pnpm build
pnpm test
```

Expected: all green.

- [ ] **Step 2: Run lint**

```bash
pnpm lint
```

Expected: clean.

- [ ] **Step 3: Run the file-length check (commit hook does this too, but run explicitly)**

```bash
pnpm check-file-length
```

Expected: no files over 500 lines.

- [ ] **Step 4: Manual smoke (optional but recommended for FE work)**

```bash
pnpm dev
```

Then in a browser:

- Visit `http://localhost:3000/admin` while logged out → see the local 404
- Promote a real DB user to `role: 'admin'` (or use a mock) and visit again → see the shell
- View page source → confirm `<meta name="robots" content="noindex, nofollow">` is present

If any of these fail, the build/test passing is not enough — debug before declaring done.

- [ ] **Step 5: Final pre-PR commit (if any cleanup)**

If anything was missed (e.g. translation polish, cleanup), make a small final commit. Otherwise, the branch is ready to push.

---

## Done When

- `GET /admin/ping` returns 200 for admin tokens, 401/403 otherwise
- `/admin` 404s for anonymous and non-admin users (verified in Playwright)
- `/admin` shell renders for admins with disabled "coming soon" nav for the 4 future sections
- `<meta name="robots" content="noindex, nofollow">` present on `/admin`
- robots.txt disallows `/admin/`; sitemap excludes it (regression-pinned in Playwright)
- All BE and FE unit tests pass; e2e admin spec passes
- All 5 locales contain the `admin` namespace
- `pnpm build`, `pnpm test`, `pnpm lint`, `pnpm check-file-length` all green

## Notes for the Implementer

- **Don't add features not in this plan.** No role editor, no payment history, no tournament start button. Those are separate specs.
- **Don't add `RolesGuard` to other controllers** in this PR. The guard exists; future specs will adopt it as needed.
- **Don't change `AuthModule`.** Register the User model in `AdminModule` locally (matches every other domain module).
- **Frequent commits.** Each task ends in a commit; don't bundle tasks into one mega-commit. The plan is structured so each commit leaves the repo in a passing state.
- **If a test pattern in the integration spec resists implementation**, look at `apps/be/src/chat/chat.controller.spec.ts` for a working precedent that mixes `JwtAuthGuard` with mocked Mongoose providers.
