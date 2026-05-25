# ARC-710 — Admin Game/Variant Visibility — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let admins gate whole games and built-in variants behind `all` / `premium_plus` / `vip_plus` tiers, with BE-enforced read filtering and write blocking, and a new `/admin/games` page in the web app.

**Architecture:** A new Mongo overlay collection `game_visibility` (one row per game or `(game, variant)` pair). `GameVisibilityService` keeps an in-process 30s-TTL map. Tier checks reuse the existing `ROLE_INFO.priority` ladder. A new `GET /games/catalog` endpoint returns the registry filtered to the caller's role; room/session creation calls `assertVisible` to throw `ForbiddenException` on restricted entries; `listRooms` runs results through `filterVisible` to hide rooms the caller can't see.

**Tech Stack:** NestJS 10 + Mongoose for BE, Next.js 14 App Router + Tamagui for web, Jest (BE), Vitest (web), Playwright (e2e). Pattern reference: `EconomySettingsService` / `admin-economy` (ARC-619).

**Spec:** [docs/superpowers/specs/2026-05-19-admin-game-visibility-design.md](../specs/2026-05-19-admin-game-visibility-design.md)

---

## Pre-flight notes for the implementer

You're working on branch `ARC-710` (already created off `develop`). The spec doc is committed at `docs/superpowers/specs/2026-05-19-admin-game-visibility-design.md` — re-read it once before starting. Highlights you must keep in mind while coding:

- **Default = `all`.** If no DB row exists for a `(gameId, variantId?)`, the caller can see it. Do not invert this anywhere.
- **Effective tier = `max(gameTier, variantTier)`** when checking a variant. If the game itself is restricted, the variant inherits that restriction even if its own row says `all`.
- **Anonymous = `free`.** Whenever you can't infer a role (anonymous, JWT-optional endpoints), treat the caller as `free`.
- **Cache invalidation is per-instance only** (single `Map` cleared on write). 30s TTL handles cross-instance drift. Do not add Redis pub/sub or any other broadcast.
- **`assertVisible` (throws) vs `filterVisible` (prunes silently)** — they are not interchangeable. Single-item create paths call `assertVisible`. The `listRooms` filter calls `filterVisible`. If you confuse them, free users browsing the lobby will see 403 errors.
- **There are two `USER_ROLES` constants today** — one in [apps/be/src/auth/lib/types.ts](../../../apps/be/src/auth/lib/types.ts), one in [apps/be/src/auth/lib/roles.ts](../../../apps/be/src/auth/lib/roles.ts). `roles.ts` is the one with `ROLE_INFO` and the priority ladder — that's where the new helper goes. Do not consolidate the two as part of this ticket; out of scope.
- **`AuthenticatedUser` does not carry `role`.** The existing pattern (see [apps/be/src/auth/guards/roles.guard.ts](../../../apps/be/src/auth/guards/roles.guard.ts)) is to look up `User` by `userId` and read `role`. Reuse that pattern via a small helper rather than re-implementing it inline.
- **Frequent commits.** Every Task ends with a commit. Conventional Commits with scope `admin` (BE) or `admin-games` (web). Footer: `(ARC-710)`.
- **TDD.** Every Task starts with a failing test. Implement only enough to pass.

---

## File structure (locked-in decomposition)

### Backend — create

```
apps/be/src/admin/game-visibility/
├── game-visibility.types.ts            // VISIBILITY_TIERS, VisibilityTier, types
├── game-visibility.schema.ts           // Mongoose schema + compound unique index
├── game-visibility.service.ts          // cached read/write, assertVisible, filterVisible
├── game-visibility.service.spec.ts     // unit tests for the service
├── game-visibility.controller.ts       // admin-only HTTP endpoints
├── game-visibility.controller.spec.ts  // unit tests for the controller
├── game-visibility.integration-spec.ts // mongo-memory-server integration
├── game-visibility.module.ts           // exports service for cross-module DI
└── dto/
    └── set-tier.dto.ts                 // { tier: VisibilityTier }  @IsEnum

apps/be/src/games/
├── games.catalog.ts                    // GAME_CATALOG: gameId → variants list
└── games.catalog.spec.ts               // shape test
```

### Backend — modify

- [apps/be/src/auth/lib/roles.ts](../../../apps/be/src/auth/lib/roles.ts) — append `VISIBILITY_TIERS`, `VisibilityTier`, `TIER_MIN_PRIORITY`, `canSeeAtTier`.
- [apps/be/src/admin/admin.module.ts](../../../apps/be/src/admin/admin.module.ts) — register `GameVisibilityModule`.
- [apps/be/src/games/games.module.ts](../../../apps/be/src/games/games.module.ts) — import `GameVisibilityModule` (for use by controller/services) and add a `UserRoleResolver` provider.
- [apps/be/src/games/games.controller.ts](../../../apps/be/src/games/games.controller.ts) — add `GET /games/catalog`, gate `createRoom` / `quickplay` / `rooms/start`, filter `listRooms` results.
- [apps/be/src/games/glimworm.gateway.ts](../../../apps/be/src/games/glimworm.gateway.ts) — gate Glimworm session creation.

### Web — create

```
apps/web/src/features/admin-games/
├── types.ts                            // VisibilityTier (mirror), AdminGameRow types
├── server/
│   ├── admin-games.server.ts           // listAdminGames(), with cookies
│   ├── admin-games.server.test.ts
│   ├── admin-games.actions.ts          // setGameTierAction, setVariantTierAction
│   └── admin-games.actions.test.ts
└── ui/
    ├── AdminGamesTable.tsx
    └── AdminGamesTable.test.tsx

apps/web/src/app/[locale]/admin/games/
└── page.tsx                            // Server Component

apps/web/src/shared/i18n/messages/pages/admin-games/
├── en.ts
├── ru.ts
├── es.ts
├── fr.ts
└── by.ts

apps/web/e2e/
└── admin-game-visibility.spec.ts       // Playwright flow
```

### Web — modify

- [apps/web/src/app/\[locale\]/admin/\_components/sidebarItems.ts](../../../apps/web/src/app/[locale]/admin/_components/sidebarItems.ts) — add `games` entry.
- [apps/web/src/app/\[locale\]/admin/AdminLayoutShell.tsx](../../../apps/web/src/app/[locale]/admin/AdminLayoutShell.tsx) — add label for new sidebar entry.
- [apps/web/src/features/games/api.ts](../../../apps/web/src/features/games/api.ts) — add `getCatalog()`.
- [apps/web/src/widgets/GlimwormGame/ui/GlimwormLobby.tsx](../../../apps/web/src/widgets/GlimwormGame/ui/GlimwormLobby.tsx) — filter `GLIMWORM_VARIANTS` against the catalog.

---

## Task list

Each task ends with a commit. Steps are TDD-shaped: write the failing test, watch it fail, implement minimal code, watch it pass, commit. Run BE tests from repo root with `pnpm --filter @arcadeum/be test -- --testPathPattern=<pattern>`; web tests with `pnpm --filter @arcadeum/web test -- <pattern>`. (If filter names differ in package.json, fall back to `cd apps/be && pnpm test -- <pattern>`.)

---

### Task 1: Tier helper in roles.ts

**Files:**

- Modify: [apps/be/src/auth/lib/roles.ts](../../../apps/be/src/auth/lib/roles.ts) — append at end
- Test: `apps/be/src/auth/lib/roles.spec.ts` (create — file does not exist today)

- [ ] **Step 1: Write the failing tests**

Create `apps/be/src/auth/lib/roles.spec.ts`:

```ts
import { canSeeAtTier, VISIBILITY_TIERS } from './roles';

describe('canSeeAtTier', () => {
  it('all tier is visible to everyone, including free', () => {
    expect(canSeeAtTier('free', 'all')).toBe(true);
    expect(canSeeAtTier('admin', 'all')).toBe(true);
  });

  it('premium_plus is visible to premium and higher-priority roles, not to free', () => {
    expect(canSeeAtTier('free', 'premium_plus')).toBe(false);
    expect(canSeeAtTier('premium', 'premium_plus')).toBe(true);
    expect(canSeeAtTier('supporter', 'premium_plus')).toBe(true); // priority 15 >= 10
    expect(canSeeAtTier('vip', 'premium_plus')).toBe(true);
    expect(canSeeAtTier('moderator', 'premium_plus')).toBe(true);
    expect(canSeeAtTier('admin', 'premium_plus')).toBe(true);
  });

  it('vip_plus is visible to vip and higher-priority roles, not to premium or supporter', () => {
    expect(canSeeAtTier('free', 'vip_plus')).toBe(false);
    expect(canSeeAtTier('premium', 'vip_plus')).toBe(false);
    expect(canSeeAtTier('supporter', 'vip_plus')).toBe(false); // priority 15 < 20
    expect(canSeeAtTier('vip', 'vip_plus')).toBe(true);
    expect(canSeeAtTier('tester', 'vip_plus')).toBe(true);
    expect(canSeeAtTier('moderator', 'vip_plus')).toBe(true);
    expect(canSeeAtTier('admin', 'vip_plus')).toBe(true);
  });

  it('exposes the canonical tier list', () => {
    expect(VISIBILITY_TIERS).toEqual(['all', 'premium_plus', 'vip_plus']);
  });
});
```

- [ ] **Step 2: Verify it fails**

```bash
cd apps/be && pnpm test -- roles.spec
```

Expected: cannot find `canSeeAtTier` / `VISIBILITY_TIERS` (module export error).

- [ ] **Step 3: Add helper to roles.ts**

Append to [apps/be/src/auth/lib/roles.ts](../../../apps/be/src/auth/lib/roles.ts):

```ts
export const VISIBILITY_TIERS = ['all', 'premium_plus', 'vip_plus'] as const;
export type VisibilityTier = (typeof VISIBILITY_TIERS)[number];

const TIER_MIN_PRIORITY: Record<VisibilityTier, number> = {
  all: 0,
  premium_plus: ROLE_INFO.premium.priority,
  vip_plus: ROLE_INFO.vip.priority,
};

export function canSeeAtTier(role: UserRole, tier: VisibilityTier): boolean {
  return ROLE_INFO[role].priority >= TIER_MIN_PRIORITY[tier];
}
```

- [ ] **Step 4: Verify tests pass**

```bash
cd apps/be && pnpm test -- roles.spec
```

Expected: 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add apps/be/src/auth/lib/roles.ts apps/be/src/auth/lib/roles.spec.ts
git commit -m "feat(admin): tier helper for visibility (ARC-710)"
```

---

### Task 2: BE-side game catalog (registry shim)

**Files:**

- Create: `apps/be/src/games/games.catalog.ts`
- Create: `apps/be/src/games/games.catalog.spec.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { GAME_CATALOG, getCatalogEntry, hasVariant } from './games.catalog';

describe('GAME_CATALOG', () => {
  it('includes glimworm with its three variants', () => {
    const entry = getCatalogEntry('glimworm_v1');
    expect(entry).toBeDefined();
    expect(entry?.variants).toEqual([
      'battle_royale',
      'time_attack',
      'lives_heats',
    ]);
  });

  it('includes critical, sea-battle, texas-holdem without variants', () => {
    expect(getCatalogEntry('critical_v1')?.variants).toEqual([]);
    expect(getCatalogEntry('sea_battle_v1')?.variants).toEqual([]);
    expect(getCatalogEntry('texas_holdem_v1')?.variants).toEqual([]);
  });

  it('hasVariant returns true only for known game/variant pairs', () => {
    expect(hasVariant('glimworm_v1', 'time_attack')).toBe(true);
    expect(hasVariant('glimworm_v1', 'nonexistent')).toBe(false);
    expect(hasVariant('critical_v1', 'time_attack')).toBe(false);
    expect(hasVariant('unknown_game', 'time_attack')).toBe(false);
  });

  it('GAME_CATALOG entries are unique by gameId', () => {
    const ids = GAME_CATALOG.map((g) => g.gameId);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
```

- [ ] **Step 2: Verify it fails** — module not found.

- [ ] **Step 3: Create the catalog**

```ts
// apps/be/src/games/games.catalog.ts
export interface GameCatalogEntry {
  gameId: string;
  variants: ReadonlyArray<string>;
}

export const GAME_CATALOG: ReadonlyArray<GameCatalogEntry> = [
  { gameId: 'critical_v1', variants: [] },
  { gameId: 'sea_battle_v1', variants: [] },
  { gameId: 'texas_holdem_v1', variants: [] },
  {
    gameId: 'glimworm_v1',
    variants: ['battle_royale', 'time_attack', 'lives_heats'],
  },
];

const CATALOG_INDEX = new Map<string, GameCatalogEntry>(
  GAME_CATALOG.map((g) => [g.gameId, g]),
);

export function getCatalogEntry(gameId: string): GameCatalogEntry | undefined {
  return CATALOG_INDEX.get(gameId);
}

export function hasVariant(gameId: string, variantId: string): boolean {
  return getCatalogEntry(gameId)?.variants.includes(variantId) ?? false;
}
```

- [ ] **Step 4: Verify tests pass.**

- [ ] **Step 5: Commit**

```bash
git add apps/be/src/games/games.catalog.ts apps/be/src/games/games.catalog.spec.ts
git commit -m "feat(admin): BE-side game catalog shim (ARC-710)"
```

---

### Task 3: Mongoose schema + types

**Files:**

- Create: `apps/be/src/admin/game-visibility/game-visibility.types.ts`
- Create: `apps/be/src/admin/game-visibility/game-visibility.schema.ts`

- [ ] **Step 1: Create the types file**

```ts
// game-visibility.types.ts
export { VISIBILITY_TIERS, type VisibilityTier } from '../../auth/lib/roles';

export interface AdminGameVisibilityRow {
  gameId: string;
  tier: import('../../auth/lib/roles').VisibilityTier;
  variants: Array<{
    variantId: string;
    tier: import('../../auth/lib/roles').VisibilityTier;
  }>;
}
```

- [ ] **Step 2: Create the schema**

```ts
// game-visibility.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { VISIBILITY_TIERS, type VisibilityTier } from '../../auth/lib/roles';

@Schema({ timestamps: true, collection: 'game_visibility' })
export class GameVisibility extends Document {
  declare _id: Types.ObjectId;

  @Prop({ required: true, trim: true, index: true })
  gameId!: string;

  @Prop({ type: String, default: null })
  variantId!: string | null;

  @Prop({ required: true, type: String, enum: VISIBILITY_TIERS })
  tier!: VisibilityTier;

  @Prop({ required: true, trim: true })
  updatedBy!: string;
}

export type GameVisibilityDocument = GameVisibility;
export const GameVisibilitySchema =
  SchemaFactory.createForClass(GameVisibility);
GameVisibilitySchema.index({ gameId: 1, variantId: 1 }, { unique: true });
```

- [ ] **Step 3: Commit** (no tests for schema files alone; coverage comes via the service spec)

```bash
git add apps/be/src/admin/game-visibility/game-visibility.types.ts \
        apps/be/src/admin/game-visibility/game-visibility.schema.ts
git commit -m "feat(admin): game_visibility schema (ARC-710)"
```

---

### Task 4: GameVisibilityService — read & cache

**Files:**

- Create: `apps/be/src/admin/game-visibility/game-visibility.service.ts`
- Create: `apps/be/src/admin/game-visibility/game-visibility.service.spec.ts`
- Create: `apps/be/src/admin/game-visibility/game-visibility.module.ts`

- [ ] **Step 1: Write the failing test**

```ts
// game-visibility.service.spec.ts
import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { GameVisibilityService } from './game-visibility.service';
import { GameVisibility } from './game-visibility.schema';

function makeModelMock(rows: Array<Record<string, unknown>>) {
  return {
    find: jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue(rows),
    }),
    findOneAndUpdate: jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue({}),
    }),
  };
}

describe('GameVisibilityService (read paths)', () => {
  it('returns all when no row exists', async () => {
    const model = makeModelMock([]);
    const moduleRef = await Test.createTestingModule({
      providers: [
        GameVisibilityService,
        { provide: getModelToken(GameVisibility.name), useValue: model },
      ],
    }).compile();
    const svc = moduleRef.get(GameVisibilityService);
    await expect(svc.getEffectiveTier('glimworm_v1')).resolves.toBe('all');
    await expect(
      svc.getEffectiveTier('glimworm_v1', 'time_attack'),
    ).resolves.toBe('all');
  });

  it('reads the game-level row when present', async () => {
    const model = makeModelMock([
      { gameId: 'glimworm_v1', variantId: null, tier: 'vip_plus' },
    ]);
    const moduleRef = await Test.createTestingModule({
      providers: [
        GameVisibilityService,
        { provide: getModelToken(GameVisibility.name), useValue: model },
      ],
    }).compile();
    const svc = moduleRef.get(GameVisibilityService);
    await expect(svc.getEffectiveTier('glimworm_v1')).resolves.toBe('vip_plus');
  });

  it('effective tier = max(game, variant)', async () => {
    const model = makeModelMock([
      { gameId: 'glimworm_v1', variantId: null, tier: 'all' },
      { gameId: 'glimworm_v1', variantId: 'time_attack', tier: 'vip_plus' },
    ]);
    const moduleRef = await Test.createTestingModule({
      providers: [
        GameVisibilityService,
        { provide: getModelToken(GameVisibility.name), useValue: model },
      ],
    }).compile();
    const svc = moduleRef.get(GameVisibilityService);
    await expect(
      svc.getEffectiveTier('glimworm_v1', 'time_attack'),
    ).resolves.toBe('vip_plus');
  });

  it('variant row without parent game row falls back to all for the game', async () => {
    const model = makeModelMock([
      { gameId: 'glimworm_v1', variantId: 'time_attack', tier: 'vip_plus' },
    ]);
    const moduleRef = await Test.createTestingModule({
      providers: [
        GameVisibilityService,
        { provide: getModelToken(GameVisibility.name), useValue: model },
      ],
    }).compile();
    const svc = moduleRef.get(GameVisibilityService);
    await expect(svc.getEffectiveTier('glimworm_v1')).resolves.toBe('all');
    await expect(
      svc.getEffectiveTier('glimworm_v1', 'time_attack'),
    ).resolves.toBe('vip_plus');
  });

  it('caches between reads within TTL', async () => {
    const model = makeModelMock([]);
    const moduleRef = await Test.createTestingModule({
      providers: [
        GameVisibilityService,
        { provide: getModelToken(GameVisibility.name), useValue: model },
      ],
    }).compile();
    const svc = moduleRef.get(GameVisibilityService);
    await svc.getEffectiveTier('glimworm_v1');
    await svc.getEffectiveTier('glimworm_v1');
    expect(model.find).toHaveBeenCalledTimes(1);
  });

  it('canSee respects effective tier and role', async () => {
    const model = makeModelMock([
      { gameId: 'glimworm_v1', variantId: 'time_attack', tier: 'vip_plus' },
    ]);
    const moduleRef = await Test.createTestingModule({
      providers: [
        GameVisibilityService,
        { provide: getModelToken(GameVisibility.name), useValue: model },
      ],
    }).compile();
    const svc = moduleRef.get(GameVisibilityService);
    await expect(
      svc.canSee('free', 'glimworm_v1', 'time_attack'),
    ).resolves.toBe(false);
    await expect(svc.canSee('vip', 'glimworm_v1', 'time_attack')).resolves.toBe(
      true,
    );
  });
});
```

- [ ] **Step 2: Verify it fails** — service does not exist.

- [ ] **Step 3: Implement the service (read paths only)**

```ts
// game-visibility.service.ts
import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  GameVisibility,
  type GameVisibilityDocument,
} from './game-visibility.schema';
import {
  canSeeAtTier,
  type UserRole,
  type VisibilityTier,
} from '../../auth/lib/roles';

const TIER_RANK: Record<VisibilityTier, number> = {
  all: 0,
  premium_plus: 1,
  vip_plus: 2,
};
const CACHE_TTL_MS = 30_000;

function variantKey(gameId: string, variantId: string): string {
  return `${gameId}::${variantId}`;
}

@Injectable()
export class GameVisibilityService {
  private readonly logger = new Logger(GameVisibilityService.name);
  private map: Map<string, VisibilityTier> | null = null;
  private loadedAt = 0;

  constructor(
    @InjectModel(GameVisibility.name)
    private readonly model: Model<GameVisibilityDocument>,
  ) {}

  async getEffectiveTier(
    gameId: string,
    variantId?: string,
  ): Promise<VisibilityTier> {
    const map = await this.getMap();
    const gameTier = map.get(gameId) ?? 'all';
    if (!variantId) return gameTier;
    const variantTier = map.get(variantKey(gameId, variantId)) ?? 'all';
    return TIER_RANK[gameTier] >= TIER_RANK[variantTier]
      ? gameTier
      : variantTier;
  }

  async canSee(
    role: UserRole,
    gameId: string,
    variantId?: string,
  ): Promise<boolean> {
    const tier = await this.getEffectiveTier(gameId, variantId);
    return canSeeAtTier(role, tier);
  }

  async assertVisible(
    role: UserRole,
    gameId: string,
    variantId?: string,
  ): Promise<void> {
    if (await this.canSee(role, gameId, variantId)) return;
    throw new ForbiddenException({
      code: 'GAME_VISIBILITY_DENIED',
      gameId,
      variantId: variantId ?? null,
    });
  }

  async filterVisible<T>(
    role: UserRole,
    items: T[],
    key: (t: T) => { gameId: string; variantId?: string },
  ): Promise<T[]> {
    const out: T[] = [];
    for (const item of items) {
      const { gameId, variantId } = key(item);
      if (await this.canSee(role, gameId, variantId)) out.push(item);
    }
    return out;
  }

  private async getMap(): Promise<Map<string, VisibilityTier>> {
    if (this.map && Date.now() - this.loadedAt < CACHE_TTL_MS) {
      return this.map;
    }
    const rows = await this.model.find().lean<
      Array<{
        gameId: string;
        variantId: string | null;
        tier: VisibilityTier;
      }>
    >();
    const fresh = new Map<string, VisibilityTier>();
    for (const r of rows) {
      const k = r.variantId ? variantKey(r.gameId, r.variantId) : r.gameId;
      fresh.set(k, r.tier);
    }
    this.map = fresh;
    this.loadedAt = Date.now();
    return fresh;
  }

  invalidateCache(): void {
    this.map = null;
    this.loadedAt = 0;
  }
}
```

- [ ] **Step 4: Create the module**

```ts
// game-visibility.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GameVisibility, GameVisibilitySchema } from './game-visibility.schema';
import { GameVisibilityService } from './game-visibility.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GameVisibility.name, schema: GameVisibilitySchema },
    ]),
  ],
  providers: [GameVisibilityService],
  exports: [GameVisibilityService, MongooseModule],
})
export class GameVisibilityModule {}
```

- [ ] **Step 5: Verify tests pass.**

- [ ] **Step 6: Commit**

```bash
git add apps/be/src/admin/game-visibility/
git commit -m "feat(admin): GameVisibilityService with TTL cache (ARC-710)"
```

---

### Task 5: GameVisibilityService — write paths

**Files:**

- Modify: `apps/be/src/admin/game-visibility/game-visibility.service.ts`
- Modify: `apps/be/src/admin/game-visibility/game-visibility.service.spec.ts`

- [ ] **Step 1: Add failing tests**

Append to the spec:

```ts
describe('GameVisibilityService (write paths)', () => {
  it('setGameTier upserts and invalidates cache', async () => {
    const upsertMock = jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue({}),
    });
    const model: any = {
      find: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([]),
      }),
      findOneAndUpdate: upsertMock,
    };
    const moduleRef = await Test.createTestingModule({
      providers: [
        GameVisibilityService,
        { provide: getModelToken(GameVisibility.name), useValue: model },
      ],
    }).compile();
    const svc = moduleRef.get(GameVisibilityService);
    await svc.setGameTier('glimworm_v1', 'vip_plus', 'admin-1');
    expect(upsertMock).toHaveBeenCalledWith(
      { gameId: 'glimworm_v1', variantId: null },
      { $set: { tier: 'vip_plus', updatedBy: 'admin-1' } },
      { upsert: true, new: true },
    );
    // After write, next read forces re-query
    await svc.getEffectiveTier('glimworm_v1');
    expect(model.find).toHaveBeenCalledTimes(1); // map was reloaded
  });

  it('setVariantTier rejects unknown variant', async () => {
    const model: any = {
      find: jest
        .fn()
        .mockReturnValue({ lean: jest.fn().mockResolvedValue([]) }),
      findOneAndUpdate: jest.fn(),
    };
    const moduleRef = await Test.createTestingModule({
      providers: [
        GameVisibilityService,
        { provide: getModelToken(GameVisibility.name), useValue: model },
      ],
    }).compile();
    const svc = moduleRef.get(GameVisibilityService);
    await expect(
      svc.setVariantTier('glimworm_v1', 'bogus', 'vip_plus', 'admin-1'),
    ).rejects.toThrow(/unknown variant/i);
  });
});
```

- [ ] **Step 2: Verify it fails.**

- [ ] **Step 3: Add `setGameTier` and `setVariantTier` to the service**

```ts
import { BadRequestException } from '@nestjs/common';
import { getCatalogEntry, hasVariant } from '../../games/games.catalog';

// inside class:
async setGameTier(gameId: string, tier: VisibilityTier, adminId: string): Promise<void> {
  if (!getCatalogEntry(gameId)) {
    throw new BadRequestException(`unknown gameId: ${gameId}`);
  }
  await this.model
    .findOneAndUpdate(
      { gameId, variantId: null },
      { $set: { tier, updatedBy: adminId } },
      { upsert: true, new: true },
    )
    .lean();
  this.invalidateCache();
}

async setVariantTier(
  gameId: string,
  variantId: string,
  tier: VisibilityTier,
  adminId: string,
): Promise<void> {
  if (!hasVariant(gameId, variantId)) {
    throw new BadRequestException(
      `unknown variant: ${gameId}/${variantId}`,
    );
  }
  await this.model
    .findOneAndUpdate(
      { gameId, variantId },
      { $set: { tier, updatedBy: adminId } },
      { upsert: true, new: true },
    )
    .lean();
  this.invalidateCache();
}
```

- [ ] **Step 4: Verify tests pass.**

- [ ] **Step 5: Commit**

```bash
git add apps/be/src/admin/game-visibility/game-visibility.service.ts \
        apps/be/src/admin/game-visibility/game-visibility.service.spec.ts
git commit -m "feat(admin): visibility service write paths with catalog validation (ARC-710)"
```

---

### Task 6: GameVisibilityService — listForAdmin

**Files:**

- Modify: `apps/be/src/admin/game-visibility/game-visibility.service.ts`
- Modify: `apps/be/src/admin/game-visibility/game-visibility.service.spec.ts`

- [ ] **Step 1: Add failing test**

```ts
it('listForAdmin returns the full catalog joined with tiers (defaults to all)', async () => {
  const model: any = {
    find: jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue([
        { gameId: 'glimworm_v1', variantId: null, tier: 'premium_plus' },
        { gameId: 'glimworm_v1', variantId: 'time_attack', tier: 'vip_plus' },
      ]),
    }),
    findOneAndUpdate: jest.fn(),
  };
  const moduleRef = await Test.createTestingModule({
    providers: [
      GameVisibilityService,
      { provide: getModelToken(GameVisibility.name), useValue: model },
    ],
  }).compile();
  const svc = moduleRef.get(GameVisibilityService);
  const rows = await svc.listForAdmin();
  const glim = rows.find((r) => r.gameId === 'glimworm_v1');
  expect(glim?.tier).toBe('premium_plus');
  expect(glim?.variants).toEqual(
    expect.arrayContaining([
      { variantId: 'battle_royale', tier: 'all' },
      { variantId: 'time_attack', tier: 'vip_plus' },
      { variantId: 'lives_heats', tier: 'all' },
    ]),
  );
  const critical = rows.find((r) => r.gameId === 'critical_v1');
  expect(critical?.tier).toBe('all');
  expect(critical?.variants).toEqual([]);
});
```

- [ ] **Step 2: Verify it fails.**

- [ ] **Step 3: Implement**

```ts
import { GAME_CATALOG } from '../../games/games.catalog';
import type { AdminGameVisibilityRow } from './game-visibility.types';

// inside class:
async listForAdmin(): Promise<AdminGameVisibilityRow[]> {
  const map = await this.getMap();
  return GAME_CATALOG.map((g) => ({
    gameId: g.gameId,
    tier: map.get(g.gameId) ?? 'all',
    variants: g.variants.map((variantId) => ({
      variantId,
      tier: map.get(variantKey(g.gameId, variantId)) ?? 'all',
    })),
  }));
}
```

- [ ] **Step 4: Verify tests pass.**

- [ ] **Step 5: Commit**

```bash
git add apps/be/src/admin/game-visibility/
git commit -m "feat(admin): listForAdmin joins catalog with tiers (ARC-710)"
```

---

### Task 7: Admin DTO + controller

**Files:**

- Create: `apps/be/src/admin/game-visibility/dto/set-tier.dto.ts`
- Create: `apps/be/src/admin/game-visibility/game-visibility.controller.ts`
- Create: `apps/be/src/admin/game-visibility/game-visibility.controller.spec.ts`
- Modify: `apps/be/src/admin/admin.module.ts`
- Modify: `apps/be/src/admin/game-visibility/game-visibility.module.ts`

- [ ] **Step 1: Write the failing controller test**

```ts
// game-visibility.controller.spec.ts
import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { GameVisibilityController } from './game-visibility.controller';
import { GameVisibilityService } from './game-visibility.service';

describe('GameVisibilityController', () => {
  let controller: GameVisibilityController;
  let service: {
    listForAdmin: jest.Mock;
    setGameTier: jest.Mock;
    setVariantTier: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      listForAdmin: jest.fn().mockResolvedValue([]),
      setGameTier: jest.fn().mockResolvedValue(undefined),
      setVariantTier: jest.fn().mockResolvedValue(undefined),
    };
    const moduleRef = await Test.createTestingModule({
      controllers: [GameVisibilityController],
      providers: [{ provide: GameVisibilityService, useValue: service }],
    }).compile();
    controller = moduleRef.get(GameVisibilityController);
  });

  it('GET visibility returns the joined catalog', async () => {
    service.listForAdmin.mockResolvedValueOnce([
      { gameId: 'critical_v1', tier: 'all', variants: [] },
    ]);
    await expect(controller.list()).resolves.toEqual([
      { gameId: 'critical_v1', tier: 'all', variants: [] },
    ]);
  });

  it('PUT game visibility passes through to service', async () => {
    await controller.setGameTier(
      { user: { userId: 'admin-1' } } as any,
      'glimworm_v1',
      { tier: 'vip_plus' },
    );
    expect(service.setGameTier).toHaveBeenCalledWith(
      'glimworm_v1',
      'vip_plus',
      'admin-1',
    );
  });

  it('PUT variant visibility passes through to service', async () => {
    await controller.setVariantTier(
      { user: { userId: 'admin-1' } } as any,
      'glimworm_v1',
      'time_attack',
      { tier: 'premium_plus' },
    );
    expect(service.setVariantTier).toHaveBeenCalledWith(
      'glimworm_v1',
      'time_attack',
      'premium_plus',
      'admin-1',
    );
  });
});
```

- [ ] **Step 2: Verify it fails.**

- [ ] **Step 3: Create DTO**

```ts
// dto/set-tier.dto.ts
import { IsIn } from 'class-validator';
import { VISIBILITY_TIERS, type VisibilityTier } from '../../../auth/lib/roles';

export class SetTierDto {
  @IsIn(VISIBILITY_TIERS as unknown as string[])
  tier!: VisibilityTier;
}
```

- [ ] **Step 4: Create controller**

```ts
// game-visibility.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../auth/jwt/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/guards/roles.decorator';
import type { AuthenticatedUser } from '../../auth/jwt/jwt.strategy';
import { GameVisibilityService } from './game-visibility.service';
import { SetTierDto } from './dto/set-tier.dto';
import type { AdminGameVisibilityRow } from './game-visibility.types';

@Controller('admin/games')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class GameVisibilityController {
  constructor(private readonly service: GameVisibilityService) {}

  @Get('visibility')
  list(): Promise<AdminGameVisibilityRow[]> {
    return this.service.listForAdmin();
  }

  @Put(':gameId/visibility')
  async setGameTier(
    @Req() req: Request,
    @Param('gameId') gameId: string,
    @Body() dto: SetTierDto,
  ): Promise<{ ok: true }> {
    const adminId = (req.user as AuthenticatedUser).userId;
    await this.service.setGameTier(gameId, dto.tier, adminId);
    return { ok: true };
  }

  @Put(':gameId/variants/:variantId/visibility')
  async setVariantTier(
    @Req() req: Request,
    @Param('gameId') gameId: string,
    @Param('variantId') variantId: string,
    @Body() dto: SetTierDto,
  ): Promise<{ ok: true }> {
    const adminId = (req.user as AuthenticatedUser).userId;
    await this.service.setVariantTier(gameId, variantId, dto.tier, adminId);
    return { ok: true };
  }
}
```

- [ ] **Step 5: Register in module**

Update `apps/be/src/admin/game-visibility/game-visibility.module.ts` to add `controllers: [GameVisibilityController]`. Update [apps/be/src/admin/admin.module.ts](../../../apps/be/src/admin/admin.module.ts) to import `GameVisibilityModule`:

```ts
import { GameVisibilityModule } from './game-visibility/game-visibility.module';
// in @Module({ imports: [...GameVisibilityModule] })
```

- [ ] **Step 6: Verify tests pass.**

- [ ] **Step 7: Commit**

```bash
git add apps/be/src/admin/
git commit -m "feat(admin): admin endpoints for game visibility (ARC-710)"
```

---

### Task 8: Integration test — admin endpoints with real Mongo

**Files:**

- Create: `apps/be/src/admin/game-visibility/game-visibility.integration-spec.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { GameVisibilityModule } from './game-visibility.module';

describe('GameVisibility integration', () => {
  let app: INestApplication;
  let mongo: MongoMemoryServer;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [MongooseModule.forRoot(mongo.getUri()), GameVisibilityModule],
    })
      // Replace JwtAuthGuard / RolesGuard with permissive guards for this test
      .overrideGuard(require('../../auth/jwt/jwt.guard').JwtAuthGuard)
      .useValue({
        canActivate: (ctx: any) => {
          ctx.switchToHttp().getRequest().user = { userId: 'admin-1' };
          return true;
        },
      })
      .overrideGuard(require('../../auth/guards/roles.guard').RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await mongo.stop();
  });

  it('PUT then GET returns the new tier', async () => {
    await request(app.getHttpServer())
      .put('/admin/games/glimworm_v1/visibility')
      .send({ tier: 'vip_plus' })
      .expect(200);
    const res = await request(app.getHttpServer())
      .get('/admin/games/visibility')
      .expect(200);
    const glim = (res.body as any[]).find((r) => r.gameId === 'glimworm_v1');
    expect(glim.tier).toBe('vip_plus');
  });

  it('PUT with invalid tier returns 400', async () => {
    await request(app.getHttpServer())
      .put('/admin/games/glimworm_v1/visibility')
      .send({ tier: 'bogus' })
      .expect(400);
  });

  it('PUT with unknown gameId returns 400', async () => {
    await request(app.getHttpServer())
      .put('/admin/games/unknown_v1/visibility')
      .send({ tier: 'vip_plus' })
      .expect(400);
  });

  it('PUT variant with unknown variant returns 400', async () => {
    await request(app.getHttpServer())
      .put('/admin/games/glimworm_v1/variants/bogus/visibility')
      .send({ tier: 'vip_plus' })
      .expect(400);
  });
});
```

- [ ] **Step 2: Verify it passes (you've already built the controller).**

- [ ] **Step 3: Commit**

```bash
git add apps/be/src/admin/game-visibility/game-visibility.integration-spec.ts
git commit -m "test(admin): integration tests for visibility endpoints (ARC-710)"
```

---

### Task 9: UserRoleResolver helper

**Files:**

- Create: `apps/be/src/auth/lib/user-role-resolver.service.ts`
- Create: `apps/be/src/auth/lib/user-role-resolver.service.spec.ts`
- Modify: `apps/be/src/auth/auth.module.ts` — register & export the provider

The existing `RolesGuard` does a Mongo lookup per request. We need the same lookup from controllers that aren't guarded by `RolesGuard` (catalog, listRooms, createRoom) so the tier check knows the caller's role.

- [ ] **Step 1: Write the failing test**

```ts
import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UserRoleResolver } from './user-role-resolver.service';
import { User } from '../schemas/user.schema';

describe('UserRoleResolver', () => {
  it('returns "free" for null/undefined userId (anonymous)', async () => {
    const model: any = { findById: jest.fn() };
    const moduleRef = await Test.createTestingModule({
      providers: [
        UserRoleResolver,
        { provide: getModelToken(User.name), useValue: model },
      ],
    }).compile();
    const svc = moduleRef.get(UserRoleResolver);
    await expect(svc.resolveRole(undefined)).resolves.toBe('free');
    await expect(svc.resolveRole(null)).resolves.toBe('free');
    expect(model.findById).not.toHaveBeenCalled();
  });

  it('reads role from User collection', async () => {
    const model: any = {
      findById: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({ role: 'vip' }),
        }),
      }),
    };
    const moduleRef = await Test.createTestingModule({
      providers: [
        UserRoleResolver,
        { provide: getModelToken(User.name), useValue: model },
      ],
    }).compile();
    const svc = moduleRef.get(UserRoleResolver);
    await expect(svc.resolveRole('u-1')).resolves.toBe('vip');
  });

  it('returns "free" if user not found', async () => {
    const model: any = {
      findById: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(null),
        }),
      }),
    };
    const moduleRef = await Test.createTestingModule({
      providers: [
        UserRoleResolver,
        { provide: getModelToken(User.name), useValue: model },
      ],
    }).compile();
    const svc = moduleRef.get(UserRoleResolver);
    await expect(svc.resolveRole('ghost')).resolves.toBe('free');
  });
});
```

- [ ] **Step 2: Verify it fails.**

- [ ] **Step 3: Implement**

```ts
// user-role-resolver.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, type UserDocument } from '../schemas/user.schema';
import type { UserRole } from './roles';

@Injectable()
export class UserRoleResolver {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async resolveRole(userId: string | null | undefined): Promise<UserRole> {
    if (!userId) return 'free';
    const doc = await this.userModel
      .findById(userId)
      .select('role')
      .lean<{ role: UserRole } | null>();
    return doc?.role ?? 'free';
  }
}
```

- [ ] **Step 4: Register in AuthModule** — add to `providers` and `exports`.

- [ ] **Step 5: Verify tests pass.**

- [ ] **Step 6: Commit**

```bash
git add apps/be/src/auth/lib/user-role-resolver.service.ts \
        apps/be/src/auth/lib/user-role-resolver.service.spec.ts \
        apps/be/src/auth/auth.module.ts
git commit -m "feat(admin): UserRoleResolver helper for tier checks (ARC-710)"
```

---

### Task 10: GET /games/catalog endpoint

**Files:**

- Modify: [apps/be/src/games/games.controller.ts](../../../apps/be/src/games/games.controller.ts) — add endpoint
- Modify: [apps/be/src/games/games.module.ts](../../../apps/be/src/games/games.module.ts) — import GameVisibilityModule
- Create: `apps/be/src/games/games.catalog.controller.spec.ts` (or extend existing controller spec)

- [ ] **Step 1: Write the failing test**

```ts
// at the bottom of an existing spec for GamesController, or a new spec file:
import { Test } from '@nestjs/testing';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { GameVisibilityService } from '../admin/game-visibility/game-visibility.service';
import { UserRoleResolver } from '../auth/lib/user-role-resolver.service';

describe('GamesController.getCatalog', () => {
  function build(
    visibility: GameVisibilityService,
    resolver: UserRoleResolver,
  ) {
    return new GamesController(
      {} as GamesService,
      {} as any, // criticalService
      {} as any, // texasHoldemService
      visibility,
      resolver,
    );
  }

  it('returns the full catalog for an admin', async () => {
    const vis = {
      canSee: jest.fn().mockResolvedValue(true),
    } as unknown as GameVisibilityService;
    const resolver = {
      resolveRole: jest.fn().mockResolvedValue('admin'),
    } as unknown as UserRoleResolver;
    const controller = build(vis, resolver);
    const res = await controller.getCatalog({
      user: { userId: 'admin-1' },
    } as any);
    const ids = res.games.map((g) => g.gameId);
    expect(ids).toEqual(expect.arrayContaining(['glimworm_v1', 'critical_v1']));
    const glim = res.games.find((g) => g.gameId === 'glimworm_v1');
    expect(glim?.variants).toEqual(
      expect.arrayContaining(['battle_royale', 'time_attack', 'lives_heats']),
    );
  });

  it('filters out games and variants the caller cannot see', async () => {
    const vis = {
      canSee: jest.fn(async (_role, gameId, variantId) => {
        if (gameId === 'glimworm_v1' && variantId === 'time_attack')
          return false;
        return true;
      }),
    } as unknown as GameVisibilityService;
    const resolver = {
      resolveRole: jest.fn().mockResolvedValue('free'),
    } as unknown as UserRoleResolver;
    const controller = build(vis, resolver);
    const res = await controller.getCatalog({ user: undefined } as any);
    const glim = res.games.find((g) => g.gameId === 'glimworm_v1');
    expect(glim?.variants).not.toContain('time_attack');
    expect(glim?.variants).toEqual(
      expect.arrayContaining(['battle_royale', 'lives_heats']),
    );
  });

  it('drops the whole game if not visible', async () => {
    const vis = {
      canSee: jest.fn(async (_role, gameId) => gameId !== 'glimworm_v1'),
    } as unknown as GameVisibilityService;
    const resolver = {
      resolveRole: jest.fn().mockResolvedValue('free'),
    } as unknown as UserRoleResolver;
    const controller = build(vis, resolver);
    const res = await controller.getCatalog({ user: undefined } as any);
    expect(res.games.find((g) => g.gameId === 'glimworm_v1')).toBeUndefined();
  });
});
```

- [ ] **Step 2: Verify it fails** — `getCatalog` does not exist, constructor signature differs.

- [ ] **Step 3: Wire DI**

Update `apps/be/src/games/games.module.ts`:

```ts
import { GameVisibilityModule } from '../admin/game-visibility/game-visibility.module';
// imports: [...GameVisibilityModule]
// providers: [...UserRoleResolver]  // imported via AuthModule's exports
```

Update controller constructor:

```ts
constructor(
  private readonly gamesService: GamesService,
  private readonly criticalService: CriticalService,
  private readonly texasHoldemService: TexasHoldemService,
  private readonly visibility: GameVisibilityService,
  private readonly roleResolver: UserRoleResolver,
) {}
```

- [ ] **Step 4: Add endpoint**

```ts
import { GAME_CATALOG } from './games.catalog';

@UseGuards(JwtOptionalAuthGuard)
@Get('catalog')
async getCatalog(@Req() req: Request): Promise<{
  games: Array<{ gameId: string; variants: string[] }>;
}> {
  const user = req.user as AuthenticatedUser | undefined | null;
  const role = await this.roleResolver.resolveRole(user?.userId);
  const games: Array<{ gameId: string; variants: string[] }> = [];
  for (const entry of GAME_CATALOG) {
    if (!(await this.visibility.canSee(role, entry.gameId))) continue;
    const variants: string[] = [];
    for (const v of entry.variants) {
      if (await this.visibility.canSee(role, entry.gameId, v)) variants.push(v);
    }
    games.push({ gameId: entry.gameId, variants });
  }
  return { games };
}
```

- [ ] **Step 5: Verify tests pass.**

- [ ] **Step 6: Commit**

```bash
git add apps/be/src/games/games.controller.ts apps/be/src/games/games.module.ts \
        apps/be/src/games/games.catalog.controller.spec.ts
git commit -m "feat(admin): GET /games/catalog returns role-filtered list (ARC-710)"
```

---

### Task 11: Block room creation for restricted games/variants

**Files:**

- Modify: [apps/be/src/games/games.controller.ts](../../../apps/be/src/games/games.controller.ts) — `createRoom`, `quickplay`
- Modify: existing `games.controller.spec.ts` or add new spec

- [ ] **Step 1: Write the failing tests**

> **Note for the implementer:** the real `GamesController` constructor has more injected services than the snippets show (`CriticalService`, `TexasHoldemService`, etc., and possibly others added since this plan was written). Mirror the current constructor signature when instantiating in tests; pass `{} as any` for any service the test doesn't exercise. Same applies to Task 10 and Task 12.

```ts
describe('createRoom visibility gate', () => {
  it('throws 403 when caller cannot see the game', async () => {
    const vis = {
      canSee: jest.fn().mockResolvedValue(false),
      assertVisible: jest
        .fn()
        .mockRejectedValue(Object.assign(new Error('denied'), { status: 403 })),
    } as unknown as GameVisibilityService;
    const resolver = {
      resolveRole: jest.fn().mockResolvedValue('free'),
    } as unknown as UserRoleResolver;
    const games: any = { createRoom: jest.fn() };
    const controller = new GamesController(
      games,
      {} as any,
      {} as any,
      vis,
      resolver,
    );
    await expect(
      controller.createRoom(
        { user: { userId: 'u-1' } } as any,
        { gameId: 'glimworm_v1', name: 'x', visibility: 'public' } as any,
      ),
    ).rejects.toThrow();
    expect(games.createRoom).not.toHaveBeenCalled();
  });

  it('passes through when visible', async () => {
    const vis = {
      canSee: jest.fn().mockResolvedValue(true),
      assertVisible: jest.fn().mockResolvedValue(undefined),
    } as unknown as GameVisibilityService;
    const resolver = {
      resolveRole: jest.fn().mockResolvedValue('vip'),
    } as unknown as UserRoleResolver;
    const games: any = {
      createRoom: jest.fn().mockResolvedValue({ id: 'r-1' }),
    };
    const controller = new GamesController(
      games,
      {} as any,
      {} as any,
      vis,
      resolver,
    );
    await controller.createRoom(
      { user: { userId: 'u-1' } } as any,
      {
        gameId: 'glimworm_v1',
        name: 'x',
        visibility: 'public',
        gameOptions: { variant: 'time_attack' },
      } as any,
    );
    expect(vis.assertVisible).toHaveBeenCalledWith(
      'vip',
      'glimworm_v1',
      'time_attack',
    );
    expect(games.createRoom).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Verify it fails.**

- [ ] **Step 3: Add the gates**

In `createRoom`, before calling `gamesService.createRoom`:

```ts
const role = await this.roleResolver.resolveRole(user.userId);
const variantOpt =
  dto.gameOptions && typeof dto.gameOptions === 'object'
    ? (dto.gameOptions as Record<string, unknown>).variant
    : undefined;
const variant = typeof variantOpt === 'string' ? variantOpt : undefined;
await this.visibility.assertVisible(role, dto.gameId, variant);
```

Apply the same pattern in `quickplay` (uses `dto.variant` directly).

- [ ] **Step 4: Verify tests pass.**

- [ ] **Step 5: Commit**

```bash
git add apps/be/src/games/games.controller.ts apps/be/src/games/games.controller.spec.ts
git commit -m "feat(admin): block room/quickplay for restricted games (ARC-710)"
```

---

### Task 12: Filter listRooms results

**Files:**

- Modify: [apps/be/src/games/games.controller.ts](../../../apps/be/src/games/games.controller.ts) — wrap `listRooms` output

The simplest place to filter is at the controller layer: after `gamesService.listRooms` returns its `{ rooms, total, … }` shape, drop rooms whose `gameId` (and stored `gameOptions.variant` if present) the caller can't see. Note: total counts become approximate after filtering — that's acceptable for an admin-controlled feature.

- [ ] **Step 1: Write failing test**

```ts
it('listRooms filters out rooms the caller cannot see', async () => {
  const vis = {
    canSee: jest.fn(async (_role, gameId, variantId) => {
      if (gameId === 'glimworm_v1' && variantId === 'time_attack') return false;
      return true;
    }),
  } as unknown as GameVisibilityService;
  const resolver = {
    resolveRole: jest.fn().mockResolvedValue('free'),
  } as unknown as UserRoleResolver;
  const games: any = {
    listRooms: jest.fn().mockResolvedValue({
      rooms: [
        {
          id: 'r-1',
          gameId: 'glimworm_v1',
          gameOptions: { variant: 'time_attack' },
        },
        {
          id: 'r-2',
          gameId: 'glimworm_v1',
          gameOptions: { variant: 'battle_royale' },
        },
        { id: 'r-3', gameId: 'critical_v1' },
      ],
      total: 3,
      page: 0,
      limit: 12,
      hasMore: false,
    }),
  };
  const controller = new GamesController(
    games,
    {} as any,
    {} as any,
    vis,
    resolver,
  );
  const res = await controller.listRooms({ user: undefined } as any);
  expect((res as any).rooms.map((r: any) => r.id)).toEqual(['r-2', 'r-3']);
});
```

- [ ] **Step 2: Verify it fails.**

- [ ] **Step 3: Wrap the existing listRooms response**

After the call to `this.gamesService.listRooms(...)`:

```ts
const role = await this.roleResolver.resolveRole(user?.userId);
const filtered = await this.visibility.filterVisible(
  role,
  result.rooms,
  (r) => ({
    gameId: r.gameId,
    variantId:
      r.gameOptions && typeof r.gameOptions === 'object'
        ? typeof (r.gameOptions as Record<string, unknown>).variant === 'string'
          ? ((r.gameOptions as Record<string, unknown>).variant as string)
          : undefined
        : undefined,
  }),
);
return { ...result, rooms: filtered };
```

- [ ] **Step 4: Verify tests pass.**

- [ ] **Step 5: Commit**

```bash
git add apps/be/src/games/games.controller.ts apps/be/src/games/games.controller.spec.ts
git commit -m "feat(admin): hide restricted rooms in listRooms (ARC-710)"
```

---

### Task 13: Glimworm gateway gate

**Files:**

- Modify: [apps/be/src/games/glimworm.gateway.ts](../../../apps/be/src/games/glimworm.gateway.ts)
- Add: corresponding spec (if a glimworm.gateway.spec.ts exists, extend it; otherwise create `glimworm.gateway.visibility-spec.ts`)

- [ ] **Step 1: Read [glimworm.gateway.ts](../../../apps/be/src/games/glimworm.gateway.ts) to identify the "start session" entry points** — likely a `start_glimworm_session` (or similar) handler that takes `{ gameId: 'glimworm_v1', variant }`.

- [ ] **Step 2: Write failing test** — mock `GameVisibilityService` to deny `vip_plus` for free role and expect the gateway handler to refuse (emit error or throw).

- [ ] **Step 3: Inject `GameVisibilityService` + `UserRoleResolver`** into the gateway and call `assertVisible(role, 'glimworm_v1', variant)` at the start of the handler.

- [ ] **Step 4: Verify tests pass.**

- [ ] **Step 5: Commit**

```bash
git add apps/be/src/games/glimworm.gateway.ts apps/be/src/games/glimworm.gateway.spec.ts
git commit -m "feat(admin): glimworm gateway honors visibility (ARC-710)"
```

---

### Task 14: Web — types + server fetchers

**Files:**

- Create: `apps/web/src/features/admin-games/types.ts`
- Create: `apps/web/src/features/admin-games/server/admin-games.server.ts`
- Create: `apps/web/src/features/admin-games/server/admin-games.server.test.ts`

- [ ] **Step 1: Define types**

```ts
// types.ts
export const VISIBILITY_TIERS = ['all', 'premium_plus', 'vip_plus'] as const;
export type VisibilityTier = (typeof VISIBILITY_TIERS)[number];

export interface AdminGameRow {
  gameId: string;
  tier: VisibilityTier;
  variants: Array<{ variantId: string; tier: VisibilityTier }>;
}
```

- [ ] **Step 2: Write the failing test for the server fetcher**

```ts
// admin-games.server.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({ get: () => ({ value: 'tok' }) }),
}));
vi.mock('@/shared/lib/api-base', () => ({
  resolveApiUrl: (p: string) => `http://api${p}`,
}));
const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

import { listAdminGames } from './admin-games.server';

beforeEach(() => fetchMock.mockReset());

describe('listAdminGames', () => {
  it('GETs /admin/games/visibility and returns the rows', async () => {
    const rows = [{ gameId: 'critical_v1', tier: 'all', variants: [] }];
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(rows),
    });
    await expect(listAdminGames()).resolves.toEqual(rows);
    expect(fetchMock).toHaveBeenCalledWith(
      'http://api/admin/games/visibility',
      expect.objectContaining({ cache: 'no-store' }),
    );
  });

  it('throws on non-ok response', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 500 });
    await expect(listAdminGames()).rejects.toThrow();
  });
});
```

- [ ] **Step 3: Implement (modeled on `admin-economy/server/economy.server.ts`)**

```ts
// admin-games.server.ts
import 'server-only';
import { cookies } from 'next/headers';
import { resolveApiUrl } from '@/shared/lib/api-base';
import type { AdminGameRow } from '../types';

async function adminFetch(path: string, init?: RequestInit): Promise<Response> {
  const cookieJar = await cookies();
  const token = cookieJar.get('web_access_token')?.value;
  return fetch(resolveApiUrl(path), {
    ...init,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

export async function listAdminGames(): Promise<AdminGameRow[]> {
  const res = await adminFetch('/admin/games/visibility');
  if (!res.ok) throw new Error(`listAdminGames failed: ${res.status}`);
  return (await res.json()) as AdminGameRow[];
}
```

- [ ] **Step 4: Verify tests pass.**

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/features/admin-games/types.ts \
        apps/web/src/features/admin-games/server/admin-games.server.ts \
        apps/web/src/features/admin-games/server/admin-games.server.test.ts
git commit -m "feat(admin-games): server-side fetcher (ARC-710)"
```

---

### Task 15: Web — server actions

**Files:**

- Create: `apps/web/src/features/admin-games/server/admin-games.actions.ts`
- Create: `apps/web/src/features/admin-games/server/admin-games.actions.test.ts`

- [ ] **Step 1: Write failing tests** (modeled on `economy.actions.test.ts`, two cases each: ok and forbidden/validation).

- [ ] **Step 2: Implement**

```ts
// admin-games.actions.ts
'use server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { resolveApiUrl } from '@/shared/lib/api-base';
import type { VisibilityTier } from '../types';

export type AdminGamesActionResult =
  | { ok: true }
  | { ok: false; error: 'validation' | 'forbidden' | 'generic' };

async function adminFetch(path: string, init?: RequestInit): Promise<Response> {
  const cookieJar = await cookies();
  const token = cookieJar.get('web_access_token')?.value;
  return fetch(resolveApiUrl(path), {
    ...init,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

export async function setGameTierAction(input: {
  gameId: string;
  tier: VisibilityTier;
}): Promise<AdminGamesActionResult> {
  const res = await adminFetch(
    `/admin/games/${encodeURIComponent(input.gameId)}/visibility`,
    { method: 'PUT', body: JSON.stringify({ tier: input.tier }) },
  );
  if (res.status === 400) return { ok: false, error: 'validation' };
  if (res.status === 403) return { ok: false, error: 'forbidden' };
  if (!res.ok) return { ok: false, error: 'generic' };
  revalidatePath('/admin/games');
  return { ok: true };
}

export async function setVariantTierAction(input: {
  gameId: string;
  variantId: string;
  tier: VisibilityTier;
}): Promise<AdminGamesActionResult> {
  const res = await adminFetch(
    `/admin/games/${encodeURIComponent(input.gameId)}/variants/${encodeURIComponent(
      input.variantId,
    )}/visibility`,
    { method: 'PUT', body: JSON.stringify({ tier: input.tier }) },
  );
  if (res.status === 400) return { ok: false, error: 'validation' };
  if (res.status === 403) return { ok: false, error: 'forbidden' };
  if (!res.ok) return { ok: false, error: 'generic' };
  revalidatePath('/admin/games');
  return { ok: true };
}
```

- [ ] **Step 3: Verify tests pass.**

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/features/admin-games/server/admin-games.actions.ts \
        apps/web/src/features/admin-games/server/admin-games.actions.test.ts
git commit -m "feat(admin-games): server actions for tier updates (ARC-710)"
```

---

### Task 16: Web — i18n (all 5 locales)

**Files:**

- Create: `apps/web/src/shared/i18n/messages/pages/admin-games/en.ts`
- Create: `apps/web/src/shared/i18n/messages/pages/admin-games/ru.ts`
- Create: `apps/web/src/shared/i18n/messages/pages/admin-games/es.ts`
- Create: `apps/web/src/shared/i18n/messages/pages/admin-games/fr.ts`
- Create: `apps/web/src/shared/i18n/messages/pages/admin-games/by.ts`
- Modify: any aggregate locale file that re-exports per-page bundles (mirror what `admin-economy` does — search for `adminEconomy` in the i18n index files and add `adminGames` in the same places).
- Modify: nav strings — add a `games` entry under `pages.admin.nav.games` in every locale.

- [ ] **Step 1: Author `en.ts`** as the canonical source:

```ts
export const adminGamesEn = {
  title: 'Games & variants visibility',
  subtitle:
    'Restrict who can see and play each game or built-in variant. Changes take effect within 30 seconds.',
  loading: 'Loading…',
  empty: 'No games registered.',
  game: 'Game',
  variants: 'Variants',
  tier: 'Visibility',
  save: 'Save',
  saving: 'Saving…',
  saveSuccess: 'Saved',
  saveFailed: 'Could not save',
  tiers: {
    all: 'All players',
    premium_plus: 'Premium+',
    vip_plus: 'VIP+',
  },
} as const;

export type AdminGamesMessages = typeof adminGamesEn;
```

- [ ] **Step 2: Translate the other four locales** — `ru`, `es`, `fr`, `by` — preserving the same shape.

- [ ] **Step 3: Wire into the i18n aggregator**

Grep for `adminEconomy` under `apps/web/src/shared/i18n/`:

```bash
grep -rn "adminEconomy" apps/web/src/shared/i18n/
```

Add `adminGames` next to every match.

- [ ] **Step 4: Add `nav.games`** to every locale's admin nav block (search for `nav: { dashboard:` or `pages.admin.nav` to find the file).

- [ ] **Step 5: Run translation validation**

```bash
pnpm check-translations
```

Expected: ✅ All translation keys are present.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/shared/i18n/messages/pages/admin-games/ apps/web/src/shared/i18n/
git commit -m "feat(admin-games): i18n for visibility page (ARC-710)"
```

---

### Task 17: Web — admin sidebar entry

**Files:**

- Modify: [apps/web/src/app/\[locale\]/admin/\_components/sidebarItems.ts](../../../apps/web/src/app/[locale]/admin/_components/sidebarItems.ts)
- Modify: [apps/web/src/app/\[locale\]/admin/AdminLayoutShell.tsx](../../../apps/web/src/app/[locale]/admin/AdminLayoutShell.tsx) — pull `nav.games` label into `sidebarLabels.items.games`.

- [ ] **Step 1: Add `'games'` to the `AdminSidebarItem['id']` union and append `{ id: 'games', href: '/admin/games', enabled: true }`** to `ADMIN_SIDEBAR_ITEMS`.

- [ ] **Step 2: Add `games?: string` to `AdminNavTranslations`** in `AdminLayoutShell.tsx`, and include `games: navT?.games` in `sidebarLabels.items`.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/[locale]/admin/_components/sidebarItems.ts \
        apps/web/src/app/[locale]/admin/AdminLayoutShell.tsx
git commit -m "feat(admin-games): sidebar entry (ARC-710)"
```

---

### Task 18: Web — AdminGamesTable component

**Files:**

- Create: `apps/web/src/features/admin-games/ui/AdminGamesTable.tsx`
- Create: `apps/web/src/features/admin-games/ui/AdminGamesTable.test.tsx`

- [ ] **Step 1: Use `/check-ui-components` skill first** to identify existing `@arcadeum/ui` components for table rows, selects, and toasts. Reuse them; only add to `packages/ui` if a needed primitive is missing.

- [ ] **Step 2: Write failing component test** asserting:

  - All catalog rows render with their current tier.
  - Each game row exposes a select that fires `setGameTierAction` on change.
  - Expanding a game with variants reveals variant rows with their own selects.
  - Failed saves show an error toast.

- [ ] **Step 3: Implement the component.** Server component fetches data via `listAdminGames()` and renders an `AdminGamesTable` (client) with the rows; the table calls the server actions on tier changes (optimistic UI; rollback + toast on failure).

- [ ] **Step 4: Verify tests pass.**

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/features/admin-games/ui/
git commit -m "feat(admin-games): table UI (ARC-710)"
```

---

### Task 19: Web — page.tsx

**Files:**

- Create: `apps/web/src/app/[locale]/admin/games/page.tsx`

- [ ] **Step 1: Mirror `admin/economy/page.tsx`** — Server Component, `requireAdmin()`, `getTranslations()`, render `AdminGamesTable` inside the existing `AdminLayoutShell`.

- [ ] **Step 2: Smoke-test locally**

```bash
pnpm --filter @arcadeum/web dev
```

Open `/admin/games`, confirm the page loads with all rows.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/[locale]/admin/games/page.tsx
git commit -m "feat(admin-games): admin page (ARC-710)"
```

---

### Task 20: Web — gamesApi.getCatalog client

**Files:**

- Modify: [apps/web/src/features/games/api.ts](../../../apps/web/src/features/games/api.ts)
- Add: a test in the file's existing test suite

- [ ] **Step 1: Write failing test** asserting `gamesApi.getCatalog()` GETs `/games/catalog` and returns `{ games: [...] }`.

- [ ] **Step 2: Implement** following the existing api client pattern in `api.ts`.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/features/games/api.ts apps/web/src/features/games/api.test.ts
git commit -m "feat(admin-games): web client for /games/catalog (ARC-710)"
```

---

### Task 21: Web — Glimworm lobby filters variants

**Files:**

- Modify: [apps/web/src/widgets/GlimwormGame/ui/GlimwormLobby.tsx](../../../apps/web/src/widgets/GlimwormGame/ui/GlimwormLobby.tsx)

- [ ] **Step 1: Identify the right hook point** — `GlimwormLobby` consumes `GLIMWORM_VARIANTS` directly (see line 13). Add a one-shot fetch of `/games/catalog` (via the existing api client) on mount; filter `GLIMWORM_VARIANTS` against the catalog's `glimworm_v1.variants`. While loading, show the full list disabled (or a small spinner where the variant cards are) to avoid flicker.

- [ ] **Step 2: Add a Vitest test** stubbing the catalog response to verify the picker hides `time_attack` when not in the response.

- [ ] **Step 3: Sanity-check no other widget consumes `GLIMWORM_VARIANTS` for variant _selection_** (the variant _resolver_ in `variantRegistry.ts` is name-lookup, not picker — leave it alone).

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/widgets/GlimwormGame/ui/GlimwormLobby.tsx
git commit -m "feat(admin-games): glimworm lobby honors visibility (ARC-710)"
```

---

### Task 22: Playwright e2e

**Files:**

- Create: `apps/web/e2e/admin-game-visibility.spec.ts`

- [ ] **Step 1: Read an existing admin e2e** (e.g. `apps/web/e2e/admin-economy/...` or `admin-announcements.spec.ts`) to copy its login + fixture pattern.

- [ ] **Step 2: Write the spec**

Flow:

1. Log in as admin.
2. Navigate to `/admin/games`, set Glimworm `time_attack` to `vip_plus`. Confirm toast success.
3. Log out, log in as a free user.
4. Navigate to the Glimworm lobby. Assert the `time_attack` variant tile is **not** in the DOM.
5. Issue a direct API call to start a session with `variant: 'time_attack'` and assert HTTP 403.
6. Log out, log in as a VIP user.
7. Navigate to the Glimworm lobby. Assert the `time_attack` tile **is** present.
8. Tear down: PUT the tier back to `all`.

- [ ] **Step 3: Run**

```bash
pnpm --filter @arcadeum/web exec playwright test admin-game-visibility
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/e2e/admin-game-visibility.spec.ts
git commit -m "test(admin-games): e2e for admin visibility flow (ARC-710)"
```

---

### Task 23: Final verification

- [ ] **Step 1: Run the full BE suite**

```bash
pnpm --filter @arcadeum/be test
```

Expected: all green.

- [ ] **Step 2: Run the full web suite**

```bash
pnpm --filter @arcadeum/web test
```

Expected: all green.

- [ ] **Step 3: Run lint, type-check, file-length, translations**

```bash
pnpm lint && pnpm typecheck && pnpm check-file-length && pnpm check-translations
```

Expected: all pass.

- [ ] **Step 4: Smoke-test the admin flow in the dev environment**

```bash
pnpm dev
```

Walk through:

- Log in as admin → `/admin/games` → restrict Glimworm `time_attack` → reset.
- Open the lobby as free → variant hidden.
- Confirm `GET /games/catalog` returns expected shape via DevTools or `curl`.

- [ ] **Step 5: Open the PR**

```bash
gh pr create --title "feat(admin): show/hide games and variants by tier (ARC-710)" --body "$(cat <<'EOF'
## Summary
- Admins can gate whole games and built-in variants behind `all` / `premium_plus` / `vip_plus` from a new `/admin/games` page.
- BE enforces visibility on the catalog endpoint, room/session creation, and room listing.
- Defaults to `all` when no row exists, so the rollout is a no-op for current users.

## Test plan
- [ ] BE unit + integration tests cover service, controller, catalog endpoint, and create-room gate.
- [ ] Web unit tests cover server fetcher, actions, and admin table.
- [ ] Playwright e2e covers admin set → free user hidden → vip user visible.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Skills to reference during implementation

- @check-ui-components — before writing any new UI primitive (Task 18).
- @new-be-module — pattern reference if questions come up while wiring `GameVisibilityModule` (Task 4, 7).
- @new-web-page — pattern reference for the admin page wiring (Task 19).
- @superpowers:test-driven-development — every Task is TDD-shaped; do not skip Step 1 (failing test) and Step 2 (verify it fails).
- @superpowers:verification-before-completion — Task 23 is the verification gate; do not declare done before all of Step 1–4 pass.

## Out of scope for this plan

- Migrating the web game registry (`registry.ts`) into the BE. The BE catalog shim stays minimal.
- Mobile admin parity. Mobile reads the filtered catalog only.
- Audit log of admin tier changes (the `updatedBy`/`updatedAt` fields are sufficient for this ticket).
- Visibility scheduling, A/B segments, per-region rules.
- Creating, editing, or deleting variant strategies from the admin UI.
