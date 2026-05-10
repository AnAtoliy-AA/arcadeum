# ARC-619 — Admin-tunable Economy Settings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate the six existing economy env-vars (`GAME_WIN_COIN_REWARD`, `GEM_TO_COIN_RATE`, `REFERRAL_REWARD_COINS_PER`, `REFERRAL_TIER_{1,2,3}_BONUS_COINS`) to admin-tunable Mongo-backed settings with a runtime override layer, a 60s TTL cache, and an append-only audit log.

**Architecture:** New `EconomyModule` exports `EconomySettingsService` with a typed key registry, `getNumber(key)` resolver (cache → DB → env → code default), and `setNumber`/`resetToDefault` writes wrapped in a Mongo transaction with the audit log. Three consumer services (`GamesService`, `GemConversionService`, `ReferralService`) drop their constructor env-reads and inject the new service. New `/admin/economy` page lets admins read, override, reset, and view audit history per key.

**Tech Stack:** NestJS, Mongoose, class-validator, Next.js App Router (Server Components + Server Actions for admin), Vitest (web), Jest (BE), Playwright (e2e).

**Spec:** [docs/superpowers/specs/2026-05-10-economy-settings-admin-design.md](../specs/2026-05-10-economy-settings-admin-design.md)

---

## File structure

### Backend

| Path                                                             | Action | Responsibility                                                                                         |
| ---------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------ |
| `apps/be/src/economy/economy.module.ts`                          | Create | Nest module wiring.                                                                                    |
| `apps/be/src/economy/economy-keys.ts`                            | Create | Typed `ECONOMY_KEYS_CONFIG` registry + `EconomyKey` union.                                             |
| `apps/be/src/economy/schemas/economy-setting.schema.ts`          | Create | Per-key Mongoose schema.                                                                               |
| `apps/be/src/economy/schemas/economy-settings-audit.schema.ts`   | Create | Append-only audit schema.                                                                              |
| `apps/be/src/economy/interfaces/economy-setting.interface.ts`    | Create | `EconomySettingView`.                                                                                  |
| `apps/be/src/economy/interfaces/economy-audit.interface.ts`      | Create | `EconomyAuditView`.                                                                                    |
| `apps/be/src/economy/dto/set-economy-value.dto.ts`               | Create | `{ value: number }` DTO.                                                                               |
| `apps/be/src/economy/economy-settings.service.ts`                | Create | Service: getNumber + setNumber + reset + listAll + getAuditFor + refreshCache.                         |
| `apps/be/src/economy/economy-settings.service.spec.ts`           | Create | Unit tests.                                                                                            |
| `apps/be/src/economy/economy-settings.integration-spec.ts`       | Create | Real-Mongo integration tests.                                                                          |
| `apps/be/src/economy/admin-economy.controller.ts`                | Create | Admin REST endpoints.                                                                                  |
| `apps/be/src/economy/admin-economy.controller.spec.ts`           | Create | Controller tests.                                                                                      |
| `apps/be/src/app.module.ts`                                      | Modify | Register `EconomyModule`.                                                                              |
| `apps/be/src/games/games.service.ts`                             | Modify | Drop env read; inject + use `EconomySettingsService`.                                                  |
| `apps/be/src/games/games.service.spec.ts`                        | Modify | Replace ConfigService mock with EconomySettingsService mock for the migrated env.                      |
| `apps/be/src/games/games.module.ts`                              | Modify | Import `EconomyModule`.                                                                                |
| `apps/be/src/gems/services/gem-conversion.service.ts`            | Modify | Drop env read; `getRate()` becomes async.                                                              |
| `apps/be/src/gems/services/gem-conversion.service.spec.ts`       | Modify | Mock EconomySettingsService.                                                                           |
| `apps/be/src/gems/controllers/gem-conversion-info.controller.ts` | Modify | Await the now-async `getRate()`.                                                                       |
| `apps/be/src/gems/gems.module.ts`                                | Modify | Import `EconomyModule`.                                                                                |
| `apps/be/src/referrals/referral.service.ts`                      | Modify | Drop env reads; add `tierKeys` lookup; inject EconomySettingsService.                                  |
| `apps/be/src/referrals/referral.service.spec.ts`                 | Modify | Mock EconomySettingsService.                                                                           |
| `apps/be/src/referrals/referral.module.ts`                       | Modify | Import `EconomyModule`.                                                                                |
| `apps/be/.env.example`                                           | Modify | Annotate env vars as "fallbacks; admin can override at runtime". Document `ECONOMY_CACHE_TTL_SECONDS`. |

### Web

| Path                                                                        | Action | Responsibility                                                                                        |
| --------------------------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------- |
| `apps/web/src/features/admin-economy/server/economy.types.ts`               | Create | TS view types mirroring BE.                                                                           |
| `apps/web/src/features/admin-economy/server/economy.server.ts`              | Create | `listEconomySettings`, `getEconomyAudit`.                                                             |
| `apps/web/src/features/admin-economy/server/economy.actions.ts`             | Create | `setEconomyValueAction`, `resetEconomyValueAction`, `refreshCacheAction`, `loadEconomyHistoryAction`. |
| `apps/web/src/features/admin-economy/ui/AdminEconomyTable.tsx`              | Create | Server Component table.                                                                               |
| `apps/web/src/features/admin-economy/ui/EconomyRow.tsx`                     | Create | Single row with edit + reset + history buttons.                                                       |
| `apps/web/src/features/admin-economy/ui/EconomyEditDialog.tsx`              | Create | Client edit dialog.                                                                                   |
| `apps/web/src/features/admin-economy/ui/EconomyAuditDrawer.tsx`             | Create | Client audit drawer.                                                                                  |
| `apps/web/src/app/[locale]/admin/economy/page.tsx`                          | Create | Server Component page entry.                                                                          |
| `apps/web/src/shared/i18n/messages/pages/admin-economy/{en,ru,es,fr,by}.ts` | Create | 5 locale files.                                                                                       |
| `apps/web/src/shared/i18n/messages/pages/index.ts` (or registry)            | Modify | Wire new namespace.                                                                                   |

### E2E

| Path                                       | Action | Responsibility                 |
| ------------------------------------------ | ------ | ------------------------------ |
| `apps/web/e2e/admin/admin-economy.spec.ts` | Create | Mocked + skip-annotated specs. |

---

## Phase 1 — Economy module foundation

### Task 1 — Key registry

**Files:**

- Create: `apps/be/src/economy/economy-keys.ts`

- [ ] **Step 1: Create the typed registry**

```ts
/**
 * Registry of all runtime-tunable economy values.
 *
 * Each key has an env-var name (used as the fallback when no DB override
 * exists) and a code-level default (used when neither DB nor env is set).
 * Adding a new knob is a single entry in this map.
 */
export const ECONOMY_KEYS_CONFIG = {
  game_win_coin_reward: { env: 'GAME_WIN_COIN_REWARD', default: 50 },
  gem_to_coin_rate: { env: 'GEM_TO_COIN_RATE', default: 100 },
  referral_reward_coins_per: {
    env: 'REFERRAL_REWARD_COINS_PER',
    default: 50,
  },
  referral_tier_1_bonus_coins: {
    env: 'REFERRAL_TIER_1_BONUS_COINS',
    default: 100,
  },
  referral_tier_2_bonus_coins: {
    env: 'REFERRAL_TIER_2_BONUS_COINS',
    default: 200,
  },
  referral_tier_3_bonus_coins: {
    env: 'REFERRAL_TIER_3_BONUS_COINS',
    default: 500,
  },
} as const;

export type EconomyKey = keyof typeof ECONOMY_KEYS_CONFIG;

export const ECONOMY_KEYS = Object.keys(
  ECONOMY_KEYS_CONFIG,
) as readonly EconomyKey[];

export function isEconomyKey(key: string): key is EconomyKey {
  return (ECONOMY_KEYS as readonly string[]).includes(key);
}
```

- [ ] **Step 2: Typecheck + commit**

```bash
pnpm --filter be exec tsc --noEmit
git add apps/be/src/economy/economy-keys.ts
git commit -m "feat(economy): add typed economy key registry (ARC-619)"
```

### Task 2 — Schemas + interfaces + DTO

**Files:**

- Create: `apps/be/src/economy/schemas/economy-setting.schema.ts`
- Create: `apps/be/src/economy/schemas/economy-settings-audit.schema.ts`
- Create: `apps/be/src/economy/interfaces/economy-setting.interface.ts`
- Create: `apps/be/src/economy/interfaces/economy-audit.interface.ts`
- Create: `apps/be/src/economy/dto/set-economy-value.dto.ts`

- [ ] **Step 1: `EconomySetting` schema**

```ts
import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { WalletService } from '../../wallet/wallet.service';

@Schema({ timestamps: true })
export class EconomySetting {
  @Prop({ required: true, unique: true, index: true })
  key!: string;

  @Prop({
    required: true,
    type: Number,
    min: 1,
    max: WalletService.MAX_TRANSACTION_AMOUNT,
  })
  value!: number;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy?: Types.ObjectId;
}

export type EconomySettingDocument = EconomySetting & Document;
export const EconomySettingSchema =
  SchemaFactory.createForClass(EconomySetting);
```

- [ ] **Step 2: `EconomySettingsAudit` schema**

```ts
@Schema({ timestamps: true })
export class EconomySettingsAudit {
  @Prop({ required: true, index: true })
  key!: string;

  @Prop({ required: true, type: Number })
  fromValue!: number;

  @Prop({ required: true, type: Number })
  toValue!: number;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  adminUserId!: Types.ObjectId;
}

export type EconomySettingsAuditDocument = EconomySettingsAudit & Document;
export const EconomySettingsAuditSchema =
  SchemaFactory.createForClass(EconomySettingsAudit);
EconomySettingsAuditSchema.index({ key: 1, createdAt: -1 });
```

- [ ] **Step 3: Interfaces**

```ts
// economy-setting.interface.ts
import type { EconomyKey } from '../economy-keys';

export interface EconomySettingView {
  key: EconomyKey;
  currentValue: number;
  defaultValue: number;
  source: 'override' | 'env' | 'default';
  updatedAt: string | null;
  updatedByLabel: string | null;
}
```

```ts
// economy-audit.interface.ts
export interface EconomyAuditView {
  id: string;
  fromValue: number;
  toValue: number;
  adminLabel: string;
  changedAt: string;
}
```

- [ ] **Step 4: DTO**

```ts
import { IsInt, Max, Min } from 'class-validator';
import { WalletService } from '../../wallet/wallet.service';

export class SetEconomyValueDto {
  @IsInt()
  @Min(1)
  @Max(WalletService.MAX_TRANSACTION_AMOUNT)
  value!: number;
}
```

- [ ] **Step 5: Typecheck + commit**

```bash
git commit -m "feat(economy): add EconomySetting + audit schemas, interfaces, DTO (ARC-619)"
```

### Task 3 — Module scaffold

**Files:**

- Create: `apps/be/src/economy/economy.module.ts`
- Modify: `apps/be/src/app.module.ts`

- [ ] **Step 1: Module (controllers + service added in later tasks)**

```ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { WalletModule } from '../wallet/wallet.module';
import {
  EconomySetting,
  EconomySettingSchema,
} from './schemas/economy-setting.schema';
import {
  EconomySettingsAudit,
  EconomySettingsAuditSchema,
} from './schemas/economy-settings-audit.schema';
import { User, UserSchema } from '../auth/schemas/user.schema';

@Module({
  imports: [
    AuthModule,
    WalletModule,
    ConfigModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: EconomySetting.name, schema: EconomySettingSchema },
      { name: EconomySettingsAudit.name, schema: EconomySettingsAuditSchema },
    ]),
  ],
  providers: [],
  controllers: [],
  exports: [],
})
export class EconomyModule {}
```

- [ ] **Step 2: Register `EconomyModule` in `AppModule.imports`.**

- [ ] **Step 3: Typecheck + commit**

```bash
git commit -m "feat(economy): scaffold EconomyModule and register in AppModule (ARC-619)"
```

---

## Phase 2 — EconomySettingsService (TDD)

### Task 4 — `getNumber` happy paths + cache (TDD)

**Files:**

- Create: `apps/be/src/economy/economy-settings.service.ts`
- Create: `apps/be/src/economy/economy-settings.service.spec.ts`
- Modify: `apps/be/src/economy/economy.module.ts` (add to providers + exports)

- [ ] **Step 1: Failing tests for `getNumber`**

```ts
import { Test } from '@nestjs/testing';
import { getModelToken, getConnectionToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { EconomySettingsService } from './economy-settings.service';
import {
  EconomySetting,
  EconomySettingDocument,
} from './schemas/economy-setting.schema';
import { EconomySettingsAudit } from './schemas/economy-settings-audit.schema';

describe('EconomySettingsService', () => {
  let service: EconomySettingsService;
  let settingModel: {
    findOne: jest.Mock;
    create: jest.Mock;
    deleteOne: jest.Mock;
  };
  let auditModel: { create: jest.Mock; find: jest.Mock };
  let configService: { get: jest.Mock };
  let connection: { startSession: jest.Mock };
  let session: { withTransaction: jest.Mock; endSession: jest.Mock };

  beforeEach(async () => {
    settingModel = {
      findOne: jest.fn(),
      create: jest.fn(),
      deleteOne: jest.fn(),
    };
    auditModel = { create: jest.fn(), find: jest.fn() };
    configService = { get: jest.fn() };
    session = {
      withTransaction: jest.fn(async (cb) => cb()),
      endSession: jest.fn(),
    };
    connection = { startSession: jest.fn().mockResolvedValue(session) };

    const moduleRef = await Test.createTestingModule({
      providers: [
        EconomySettingsService,
        { provide: getConnectionToken(), useValue: connection },
        { provide: getModelToken(EconomySetting.name), useValue: settingModel },
        {
          provide: getModelToken(EconomySettingsAudit.name),
          useValue: auditModel,
        },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = moduleRef.get(EconomySettingsService);
  });

  describe('getNumber', () => {
    it('returns DB value when row exists', async () => {
      settingModel.findOne.mockReturnValueOnce({
        lean: () => Promise.resolve({ value: 77 }),
      });
      const v = await service.getNumber('game_win_coin_reward');
      expect(v).toBe(77);
    });

    it('returns env value when no DB row but env is set', async () => {
      settingModel.findOne.mockReturnValueOnce({
        lean: () => Promise.resolve(null),
      });
      configService.get.mockImplementation((k: string) =>
        k === 'GAME_WIN_COIN_REWARD' ? '88' : undefined,
      );
      const v = await service.getNumber('game_win_coin_reward');
      expect(v).toBe(88);
    });

    it('returns code default when neither DB nor env is set', async () => {
      settingModel.findOne.mockReturnValueOnce({
        lean: () => Promise.resolve(null),
      });
      configService.get.mockReturnValue(undefined);
      const v = await service.getNumber('game_win_coin_reward');
      expect(v).toBe(50); // ECONOMY_KEYS_CONFIG default
    });

    it('falls through to env when DB value is invalid (e.g. negative)', async () => {
      settingModel.findOne.mockReturnValueOnce({
        lean: () => Promise.resolve({ value: -5 }),
      });
      configService.get.mockReturnValue('99');
      const v = await service.getNumber('game_win_coin_reward');
      expect(v).toBe(99);
    });

    it('caches the resolved value (second call no DB hit)', async () => {
      settingModel.findOne.mockReturnValueOnce({
        lean: () => Promise.resolve({ value: 77 }),
      });
      await service.getNumber('game_win_coin_reward');
      await service.getNumber('game_win_coin_reward');
      expect(settingModel.findOne).toHaveBeenCalledTimes(1);
    });
  });
});
```

- [ ] **Step 2: Run, expect FAIL.**

```bash
pnpm --filter be exec jest economy-settings.service.spec --silent
```

- [ ] **Step 3: Implement `getNumber` + cache**

```ts
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { ECONOMY_KEYS_CONFIG, EconomyKey, isEconomyKey } from './economy-keys';
import {
  EconomySetting,
  EconomySettingDocument,
} from './schemas/economy-setting.schema';
import {
  EconomySettingsAudit,
  EconomySettingsAuditDocument,
} from './schemas/economy-settings-audit.schema';
import { WalletService } from '../wallet/wallet.service';
import type { EconomySettingView } from './interfaces/economy-setting.interface';
import type { EconomyAuditView } from './interfaces/economy-audit.interface';

interface CacheEntry {
  value: number;
  expiresAt: number;
}

@Injectable()
export class EconomySettingsService {
  private readonly logger = new Logger(EconomySettingsService.name);
  private readonly cache = new Map<EconomyKey, CacheEntry>();
  private readonly ttlMs: number;

  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(EconomySetting.name)
    private readonly settingModel: Model<EconomySettingDocument>,
    @InjectModel(EconomySettingsAudit.name)
    private readonly auditModel: Model<EconomySettingsAuditDocument>,
    private readonly config: ConfigService,
  ) {
    const raw = this.config.get<string>('ECONOMY_CACHE_TTL_SECONDS');
    const parsed = raw ? Number(raw) : 60;
    this.ttlMs =
      Number.isFinite(parsed) && parsed >= 0 ? parsed * 1000 : 60_000;
  }

  async getNumber(key: EconomyKey): Promise<number> {
    if (!isEconomyKey(key)) {
      throw new BadRequestException('economy.unknownKey');
    }
    const now = Date.now();
    const cached = this.cache.get(key);
    if (cached && cached.expiresAt > now) {
      return cached.value;
    }
    const resolved = await this.resolve(key);
    if (this.ttlMs > 0) {
      this.cache.set(key, { value: resolved, expiresAt: now + this.ttlMs });
    }
    return resolved;
  }

  private async resolve(key: EconomyKey): Promise<number> {
    const cfg = ECONOMY_KEYS_CONFIG[key];
    const doc = await this.settingModel.findOne({ key }).lean();
    if (doc && this.isValidValue(doc.value)) {
      return doc.value;
    }
    const envRaw = this.config.get<string>(cfg.env);
    const env = envRaw ? Number(envRaw) : NaN;
    if (this.isValidValue(env)) {
      return env;
    }
    return cfg.default;
  }

  private isValidValue(v: unknown): v is number {
    return (
      typeof v === 'number' &&
      Number.isInteger(v) &&
      v >= 1 &&
      v <= WalletService.MAX_TRANSACTION_AMOUNT
    );
  }

  private invalidateKey(key: EconomyKey): void {
    this.cache.delete(key);
  }

  refreshCache(): void {
    this.cache.clear();
  }
}
```

- [ ] **Step 4: Add `EconomySettingsService` to `EconomyModule.providers` and `exports`.**

- [ ] **Step 5: Run, expect PASS.**

```bash
pnpm --filter be exec jest economy-settings.service.spec --silent
```

- [ ] **Step 6: Commit**

```bash
git commit -m "feat(economy): add EconomySettingsService.getNumber with TTL cache (ARC-619)"
```

### Task 5 — `setNumber` + `resetToDefault` (TDD)

**Files:**

- Modify: `apps/be/src/economy/economy-settings.service.ts`
- Modify: `apps/be/src/economy/economy-settings.service.spec.ts`

- [ ] **Step 1: Failing tests**

```ts
describe('setNumber', () => {
  it('writes a setting + audit inside a transaction and invalidates the cache', async () => {
    settingModel.findOne.mockReturnValueOnce({
      lean: () => Promise.resolve({ value: 50 }),
    });
    settingModel.create.mockResolvedValue([{ _id: oid() }]); // upsert path may differ
    auditModel.create.mockResolvedValue([{ _id: oid() }]);

    await service.setNumber('game_win_coin_reward', 77, adminId);

    expect(connection.startSession).toHaveBeenCalled();
    expect(session.withTransaction).toHaveBeenCalled();
    // Audit row recorded fromValue = 50 (previous resolved value), toValue = 77.
    // Cache for that key cleared (next getNumber hits DB again).
  });

  it('rejects invalid values (DTO catches most; service is defensive)', async () => {
    await expect(
      service.setNumber('game_win_coin_reward', 0, adminId),
    ).rejects.toThrow(/invalidValue/);
    await expect(
      service.setNumber('game_win_coin_reward', 1_000_001, adminId),
    ).rejects.toThrow(/invalidValue/);
  });

  it('rejects unknown keys', async () => {
    await expect(
      service.setNumber('not_a_real_key' as any, 50, adminId),
    ).rejects.toThrow(/unknownKey/);
  });
});

describe('resetToDefault', () => {
  it('deletes the row + writes audit + invalidates cache', async () => {
    settingModel.findOne.mockReturnValueOnce({
      lean: () => Promise.resolve({ value: 77 }),
    });
    settingModel.deleteOne.mockResolvedValue({ deletedCount: 1 });

    await service.resetToDefault('game_win_coin_reward', adminId);

    expect(session.withTransaction).toHaveBeenCalled();
    // toValue on audit = resolved fallback (env or default).
  });
});
```

- [ ] **Step 2: Implement `setNumber` + `resetToDefault`**

```ts
async setNumber(
  key: EconomyKey,
  value: number,
  adminUserId: string,
): Promise<void> {
  if (!isEconomyKey(key)) {
    throw new BadRequestException('economy.unknownKey');
  }
  if (!this.isValidValue(value)) {
    throw new BadRequestException('economy.invalidValue');
  }

  const fromValue = await this.resolve(key);

  const session = await this.connection.startSession();
  try {
    await session.withTransaction(async () => {
      await this.settingModel.findOneAndUpdate(
        { key },
        {
          $set: { value, updatedBy: new Types.ObjectId(adminUserId) },
        },
        { upsert: true, session, new: true },
      );
      await this.auditModel.create(
        [
          {
            key,
            fromValue,
            toValue: value,
            adminUserId: new Types.ObjectId(adminUserId),
          },
        ],
        { session },
      );
    });
  } finally {
    await session.endSession();
  }

  this.invalidateKey(key);
}

async resetToDefault(
  key: EconomyKey,
  adminUserId: string,
): Promise<void> {
  if (!isEconomyKey(key)) {
    throw new BadRequestException('economy.unknownKey');
  }
  const fromValue = await this.resolve(key);

  const session = await this.connection.startSession();
  try {
    await session.withTransaction(async () => {
      await this.settingModel.deleteOne({ key }, { session });
      // After deleting the row, re-resolve so the audit toValue reflects
      // the post-delete state (env or default).
      const toValue = await this.resolveWithoutDb(key);
      await this.auditModel.create(
        [
          {
            key,
            fromValue,
            toValue,
            adminUserId: new Types.ObjectId(adminUserId),
          },
        ],
        { session },
      );
    });
  } finally {
    await session.endSession();
  }

  this.invalidateKey(key);
}

private async resolveWithoutDb(key: EconomyKey): Promise<number> {
  const cfg = ECONOMY_KEYS_CONFIG[key];
  const envRaw = this.config.get<string>(cfg.env);
  const env = envRaw ? Number(envRaw) : NaN;
  if (this.isValidValue(env)) return env;
  return cfg.default;
}
```

- [ ] **Step 3: Run, expect PASS.**

- [ ] **Step 4: Commit**

```bash
git commit -m "feat(economy): setNumber + resetToDefault with transactional audit (ARC-619)"
```

### Task 6 — `listAll` + `getAuditFor` (TDD)

**Files:**

- Modify: `apps/be/src/economy/economy-settings.service.ts`
- Modify: `apps/be/src/economy/economy-settings.service.spec.ts`

- [ ] **Step 1: Failing tests**

```ts
describe('listAll', () => {
  it('returns one view per registered key including those with no DB row', async () => {
    settingModel.find.mockReturnValueOnce({
      populate: () => ({
        lean: () =>
          Promise.resolve([
            {
              key: 'game_win_coin_reward',
              value: 77,
              updatedAt: new Date(),
              updatedBy: { _id: oid(), displayName: 'Alice' },
            },
          ]),
      }),
    });
    configService.get.mockImplementation((k: string) =>
      k === 'GEM_TO_COIN_RATE' ? '150' : undefined,
    );

    const all = await service.listAll();
    expect(all).toHaveLength(ECONOMY_KEYS.length);
    const game = all.find((v) => v.key === 'game_win_coin_reward')!;
    expect(game.currentValue).toBe(77);
    expect(game.source).toBe('override');
    expect(game.updatedByLabel).toBe('Alice');

    const gems = all.find((v) => v.key === 'gem_to_coin_rate')!;
    expect(gems.currentValue).toBe(150);
    expect(gems.source).toBe('env');

    const tier3 = all.find((v) => v.key === 'referral_tier_3_bonus_coins')!;
    expect(tier3.currentValue).toBe(500);
    expect(tier3.source).toBe('default');
  });
});

describe('getAuditFor', () => {
  it('returns recent rows for the key, sorted by changedAt desc', async () => {
    auditModel.find.mockReturnValueOnce({
      sort: () => ({
        limit: () => ({
          populate: () => ({
            lean: () =>
              Promise.resolve([
                {
                  _id: oid(),
                  fromValue: 50,
                  toValue: 100,
                  adminUserId: { _id: oid(), displayName: 'Alice' },
                  createdAt: new Date('2026-05-09T00:00:00Z'),
                },
              ]),
          }),
        }),
      }),
    });

    const rows = await service.getAuditFor('game_win_coin_reward');
    expect(rows).toHaveLength(1);
    expect(rows[0].fromValue).toBe(50);
    expect(rows[0].toValue).toBe(100);
    expect(rows[0].adminLabel).toBe('Alice');
  });
});
```

- [ ] **Step 2: Implement**

```ts
async listAll(): Promise<EconomySettingView[]> {
  const docs = await this.settingModel
    .find()
    .populate<{ updatedBy: { _id: Types.ObjectId; displayName?: string; username?: string } | null }>('updatedBy', 'displayName username')
    .lean();
  const byKey = new Map<string, typeof docs[number]>();
  for (const d of docs) byKey.set(d.key, d);

  return ECONOMY_KEYS.map((key) => {
    const cfg = ECONOMY_KEYS_CONFIG[key];
    const doc = byKey.get(key);
    let currentValue: number;
    let source: 'override' | 'env' | 'default';
    if (doc && this.isValidValue(doc.value)) {
      currentValue = doc.value;
      source = 'override';
    } else {
      const envRaw = this.config.get<string>(cfg.env);
      const env = envRaw ? Number(envRaw) : NaN;
      if (this.isValidValue(env)) {
        currentValue = env;
        source = 'env';
      } else {
        currentValue = cfg.default;
        source = 'default';
      }
    }
    return {
      key,
      currentValue,
      defaultValue: cfg.default,
      source,
      updatedAt: doc?.updatedAt ? new Date(doc.updatedAt).toISOString() : null,
      updatedByLabel: doc?.updatedBy
        ? doc.updatedBy.displayName ?? doc.updatedBy.username ?? null
        : null,
    };
  });
}

async getAuditFor(
  key: EconomyKey,
  opts: { limit?: number } = {},
): Promise<EconomyAuditView[]> {
  if (!isEconomyKey(key)) {
    throw new BadRequestException('economy.unknownKey');
  }
  const limit = Math.min(Math.max(opts.limit ?? 50, 1), 200);
  const rows = await this.auditModel
    .find({ key })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate<{ adminUserId: { _id: Types.ObjectId; displayName?: string; username?: string } }>('adminUserId', 'displayName username')
    .lean();
  return rows.map((r) => ({
    id: String(r._id),
    fromValue: r.fromValue,
    toValue: r.toValue,
    adminLabel:
      r.adminUserId?.displayName ?? r.adminUserId?.username ?? 'admin',
    changedAt: new Date(r.createdAt).toISOString(),
  }));
}
```

- [ ] **Step 3: Run, expect PASS.**

- [ ] **Step 4: Commit**

```bash
git commit -m "feat(economy): listAll + getAuditFor (ARC-619)"
```

---

## Phase 3 — Admin controller

### Task 7 — `AdminEconomyController` + tests

**Files:**

- Create: `apps/be/src/economy/admin-economy.controller.ts`
- Create: `apps/be/src/economy/admin-economy.controller.spec.ts`
- Modify: `apps/be/src/economy/economy.module.ts` (add controller)

- [ ] **Step 1: Failing tests**

Mirror the supertest + overrideGuard pattern from `apps/be/src/admin/admin-users.controller.spec.ts`. Cover:

- All routes 401/403 without admin role.
- `GET /admin/economy` returns the list.
- `PUT /admin/economy/:key` with invalid value → 400 (DTO).
- `PUT /admin/economy/:key` with unknown key → 404.
- `PUT /admin/economy/:key` happy path → returns new view.
- `DELETE /admin/economy/:key` → 204.
- `GET /admin/economy/:key/audit` → returns rows.
- `POST /admin/economy/refresh-cache` → 204 + service.refreshCache called.

- [ ] **Step 2: Implement**

```ts
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { EconomySettingsService } from './economy-settings.service';
import { SetEconomyValueDto } from './dto/set-economy-value.dto';
import { ECONOMY_KEYS, EconomyKey, isEconomyKey } from './economy-keys';
import type { AuthenticatedUser } from '../auth/jwt/jwt.strategy';

@Controller('admin/economy')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminEconomyController {
  constructor(private readonly service: EconomySettingsService) {}

  @Get()
  list() {
    return this.service.listAll();
  }

  @Put(':key')
  async set(
    @Req() req: { user: AuthenticatedUser },
    @Param('key') key: string,
    @Body() dto: SetEconomyValueDto,
  ) {
    if (!isEconomyKey(key)) {
      throw new NotFoundException('economy.keyNotFound');
    }
    await this.service.setNumber(key, dto.value, req.user.userId);
    const all = await this.service.listAll();
    return all.find((v) => v.key === key);
  }

  @Delete(':key')
  @HttpCode(HttpStatus.NO_CONTENT)
  async reset(
    @Req() req: { user: AuthenticatedUser },
    @Param('key') key: string,
  ) {
    if (!isEconomyKey(key)) {
      throw new NotFoundException('economy.keyNotFound');
    }
    await this.service.resetToDefault(key, req.user.userId);
  }

  @Get(':key/audit')
  audit(@Param('key') key: string, @Query('limit') limit?: string) {
    if (!isEconomyKey(key)) {
      throw new NotFoundException('economy.keyNotFound');
    }
    const parsedLimit = limit ? Math.max(parseInt(limit, 10), 1) : undefined;
    return this.service.getAuditFor(key, { limit: parsedLimit });
  }

  @Post('refresh-cache')
  @HttpCode(HttpStatus.NO_CONTENT)
  refresh() {
    this.service.refreshCache();
  }
}
```

- [ ] **Step 3: Add controller to `EconomyModule.controllers` and `RolesGuard` to providers.**

- [ ] **Step 4: Run, expect PASS; commit**

```bash
git commit -m "feat(economy): add AdminEconomyController with CRUD + audit routes (ARC-619)"
```

---

## Phase 4 — Integration tests

### Task 8 — Real-Mongo integration tests

**Files:**

- Create: `apps/be/src/economy/economy-settings.integration-spec.ts`

Mirror `apps/be/src/wallet/wallet.service.integration-spec.ts`:

- `MongoMemoryReplSet({ replSet: { count: 1 } })`.
- Real `EconomyModule + WalletModule + MongooseModule.forRoot(uri)`.

Tests:

1. `getNumber` empty DB + env present → env value.
2. `getNumber` empty DB + no env → code default.
3. `setNumber` writes both setting + audit rows in one transaction; rollback if audit insert fails (force via duplicate-key error or schema validation failure).
4. `setNumber` invalidates cache; next `getNumber` returns new value without TTL wait.
5. `resetToDefault` removes the row and writes audit with the env/default `toValue`.
6. `listAll` returns all 6 keys including those without DB rows.
7. Concurrent `setNumber` from two callers: last write wins; audit has both rows.

```bash
git commit -m "test(economy): integration tests for setting + audit transactional writes (ARC-619)"
```

---

## Phase 5 — Consumer service refactors

### Task 9 — `GamesService` refactor

**Files:**

- Modify: `apps/be/src/games/games.module.ts`
- Modify: `apps/be/src/games/games.service.ts`
- Modify: `apps/be/src/games/games.service.spec.ts`

- [ ] **Step 1: Import `EconomyModule` in `GamesModule`.**

- [ ] **Step 2: Inject `EconomySettingsService` into `GamesService`. Drop the constructor env-read + the `private readonly gameWinCoinReward: number` field. Drop `ConfigService` injection if not used elsewhere in the file (verify first — it might still be used for unrelated config).**

- [ ] **Step 3: Replace `this.gameWinCoinReward` use-site(s) in `payoutGameWin` with `const amount = await this.economy.getNumber('game_win_coin_reward');`.**

- [ ] **Step 4: Update `games.service.spec.ts`:**

  - Replace ConfigService mock for `GAME_WIN_COIN_REWARD` with EconomySettingsService mock: `{ getNumber: jest.fn().mockResolvedValue(50) }`.
  - Existing assertions about credit amounts unchanged (the service returns the same number).

- [ ] **Step 5: Run all games tests; ensure they pass.**

```bash
pnpm --filter be exec jest games.service.spec --silent
```

- [ ] **Step 6: Commit**

```bash
git commit -m "refactor(games): read game_win_coin_reward from EconomySettings (ARC-619)"
```

### Task 10 — `GemConversionService` refactor + async `getRate`

**Files:**

- Modify: `apps/be/src/gems/gems.module.ts`
- Modify: `apps/be/src/gems/services/gem-conversion.service.ts`
- Modify: `apps/be/src/gems/services/gem-conversion.service.spec.ts`
- Modify: `apps/be/src/gems/controllers/gem-conversion-info.controller.ts`
- Modify: `apps/be/src/gems/controllers/gem-conversion-info.controller.spec.ts`

- [ ] **Step 1: Import `EconomyModule` in `GemsModule`.**

- [ ] **Step 2: Inject `EconomySettingsService` into `GemConversionService`. Drop the constructor env-read + `rate` field.**

- [ ] **Step 3: In `convertGemsToCoins`, read the rate at the top: `const rate = await this.economy.getNumber('gem_to_coin_rate');` and use it for the multiplication.**

- [ ] **Step 4: Change `getRate()` from `(): number` to `async (): Promise<number>` — return `await this.economy.getNumber('gem_to_coin_rate')`.**

- [ ] **Step 5: Update the controller** at `gem-conversion-info.controller.ts`:

```ts
@Get()
async rate(): Promise<{ rate: number }> {
  return { rate: await this.service.getRate() };
}
```

- [ ] **Step 6: Update all spec files. The `gem-conversion.service.spec.ts` becomes the bulk of changes — every test that depended on `service.rate` or `service.getRate()` returning sync must adapt.**

- [ ] **Step 7: Run, expect pass; commit**

```bash
git commit -m "refactor(gems): read gem_to_coin_rate from EconomySettings, getRate now async (ARC-619)"
```

### Task 11 — `ReferralService` refactor

**Files:**

- Modify: `apps/be/src/referrals/referral.module.ts`
- Modify: `apps/be/src/referrals/referral.service.ts`
- Modify: `apps/be/src/referrals/referral.service.spec.ts`

- [ ] **Step 1: Import `EconomyModule` in `ReferralModule`.**

- [ ] **Step 2: Refactor service**:

Replace the constructor reads of `REFERRAL_REWARD_COINS_PER` and `REFERRAL_TIER_{1,2,3}_BONUS_COINS` with `EconomySettingsService` use. Drop `perReferralCoins`, `tierBonusCoins`, and the `readPositiveInt` helper.

```ts
private readonly tierKeys = {
  1: 'referral_tier_1_bonus_coins',
  2: 'referral_tier_2_bonus_coins',
  3: 'referral_tier_3_bonus_coins',
} as const satisfies Record<number, EconomyKey>;

// In payoutPerReferral:
const amount = await this.economy.getNumber('referral_reward_coins_per');
if (amount <= 0) return; // skip if effectively disabled via env=0

// In payoutTierBonus:
const key = this.tierKeys[tier];
if (!key) return;
const amount = await this.economy.getNumber(key);
if (amount <= 0) return;
```

- [ ] **Step 3: Update spec — replace `ConfigService` mocks for the migrated envs with `EconomySettingsService` mocks. Existing test expectations on amounts unchanged.**

- [ ] **Step 4: Run, expect pass; commit**

```bash
git commit -m "refactor(referrals): read coin rewards from EconomySettings (ARC-619)"
```

---

## Phase 6 — Web admin UI

### Task 12 — Server module + types

**Files:**

- Create: `apps/web/src/features/admin-economy/server/economy.types.ts`
- Create: `apps/web/src/features/admin-economy/server/economy.server.ts`

```ts
// economy.types.ts
export type EconomyKey =
  | 'game_win_coin_reward'
  | 'gem_to_coin_rate'
  | 'referral_reward_coins_per'
  | 'referral_tier_1_bonus_coins'
  | 'referral_tier_2_bonus_coins'
  | 'referral_tier_3_bonus_coins';

export interface EconomySettingView {
  key: EconomyKey;
  currentValue: number;
  defaultValue: number;
  source: 'override' | 'env' | 'default';
  updatedAt: string | null;
  updatedByLabel: string | null;
}

export interface EconomyAuditView {
  id: string;
  fromValue: number;
  toValue: number;
  adminLabel: string;
  changedAt: string;
}
```

```ts
// economy.server.ts
import 'server-only';
import { cookies } from 'next/headers';
import { resolveApiUrl } from '@/shared/lib/api-base';
import type {
  EconomyAuditView,
  EconomyKey,
  EconomySettingView,
} from './economy.types';

async function adminFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = (await cookies()).get('web_access_token')?.value;
  return fetch(resolveApiUrl(path), {
    ...init,
    cache: 'no-store',
    headers: {
      ...(init?.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'Content-Type': 'application/json',
    },
  });
}

export async function listEconomySettings(): Promise<EconomySettingView[]> {
  const res = await adminFetch('/admin/economy');
  if (!res.ok) throw new Error(`listEconomySettings failed: ${res.status}`);
  return (await res.json()) as EconomySettingView[];
}

export async function getEconomyAudit(
  key: EconomyKey,
): Promise<EconomyAuditView[]> {
  const res = await adminFetch(
    `/admin/economy/${encodeURIComponent(key)}/audit`,
  );
  if (!res.ok) throw new Error(`getEconomyAudit failed: ${res.status}`);
  return (await res.json()) as EconomyAuditView[];
}
```

- [ ] **Step 1: Create both files.**
- [ ] **Step 2: Vitest for `listEconomySettings` + `getEconomyAudit` (mock fetch).**
- [ ] **Step 3: Commit**

```bash
git commit -m "feat(admin-economy): add web server module for economy settings (ARC-619)"
```

### Task 13 — Server actions

**Files:**

- Create: `apps/web/src/features/admin-economy/server/economy.actions.ts`

```ts
'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { resolveApiUrl } from '@/shared/lib/api-base';
import type {
  EconomyAuditView,
  EconomyKey,
  EconomySettingView,
} from './economy.types';

export type EconomyActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: 'validation' | 'not_found' | 'forbidden' | 'generic' };

async function adminFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = (await cookies()).get('web_access_token')?.value;
  return fetch(resolveApiUrl(path), {
    ...init,
    cache: 'no-store',
    headers: {
      ...(init?.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'Content-Type': 'application/json',
    },
  });
}

export async function setEconomyValueAction(input: {
  key: EconomyKey;
  value: number;
}): Promise<EconomyActionResult<EconomySettingView>> {
  if (!Number.isInteger(input.value) || input.value < 1) {
    return { ok: false, error: 'validation' };
  }
  const res = await adminFetch(
    `/admin/economy/${encodeURIComponent(input.key)}`,
    {
      method: 'PUT',
      body: JSON.stringify({ value: input.value }),
    },
  );
  if (res.status === 400) return { ok: false, error: 'validation' };
  if (res.status === 404) return { ok: false, error: 'not_found' };
  if (res.status === 403) return { ok: false, error: 'forbidden' };
  if (!res.ok) return { ok: false, error: 'generic' };
  const data = (await res.json()) as EconomySettingView;
  revalidatePath('/admin/economy');
  return { ok: true, data };
}

export async function resetEconomyValueAction(input: {
  key: EconomyKey;
}): Promise<EconomyActionResult<{ reset: true }>> {
  const res = await adminFetch(
    `/admin/economy/${encodeURIComponent(input.key)}`,
    { method: 'DELETE' },
  );
  if (res.status === 404) return { ok: false, error: 'not_found' };
  if (res.status === 403) return { ok: false, error: 'forbidden' };
  if (!res.ok) return { ok: false, error: 'generic' };
  revalidatePath('/admin/economy');
  return { ok: true, data: { reset: true } };
}

export async function refreshCacheAction(): Promise<
  EconomyActionResult<{ refreshed: true }>
> {
  const res = await adminFetch('/admin/economy/refresh-cache', {
    method: 'POST',
  });
  if (res.status === 403) return { ok: false, error: 'forbidden' };
  if (!res.ok) return { ok: false, error: 'generic' };
  revalidatePath('/admin/economy');
  return { ok: true, data: { refreshed: true } };
}

export async function loadEconomyHistoryAction(input: {
  key: EconomyKey;
}): Promise<EconomyActionResult<EconomyAuditView[]>> {
  const res = await adminFetch(
    `/admin/economy/${encodeURIComponent(input.key)}/audit`,
  );
  if (res.status === 404) return { ok: false, error: 'not_found' };
  if (res.status === 403) return { ok: false, error: 'forbidden' };
  if (!res.ok) return { ok: false, error: 'generic' };
  const data = (await res.json()) as EconomyAuditView[];
  return { ok: true, data };
}
```

- [ ] **Step 1: Implement. Step 2: Vitest for each action. Step 3: Commit.**

```bash
git commit -m "feat(admin-economy): add server actions for set/reset/refresh/history (ARC-619)"
```

### Task 14 — `AdminEconomyTable` + `EconomyRow` + page

**Files:**

- Create: `apps/web/src/features/admin-economy/ui/AdminEconomyTable.tsx`
- Create: `apps/web/src/features/admin-economy/ui/EconomyRow.tsx`
- Create: `apps/web/src/app/[locale]/admin/economy/page.tsx`

`AdminEconomyTable` (Server Component): fetches `listEconomySettings()`, renders a table with one `<EconomyRow />` per result.

`EconomyRow`: Server Component holding the row markup (key, current, default, source badge, last-changed, action buttons). Edit + reset + history buttons are client islands that wrap the corresponding server actions / drawer state.

`page.tsx` (Server Component) at `apps/web/src/app/[locale]/admin/economy/page.tsx`:

```tsx
import { Suspense } from 'react';
import { AdminEconomyTable } from '@/features/admin-economy/ui/AdminEconomyTable';

export default function AdminEconomyPage() {
  return (
    <Suspense fallback={<div>Loading…</div>}>
      <AdminEconomyTable />
    </Suspense>
  );
}
```

- [ ] **Step 1: `/check-ui-components`** for table primitives in `@arcadeum/ui`.
- [ ] **Step 2: Implement.**
- [ ] **Step 3: Vitest for `AdminEconomyTable` (mocks `listEconomySettings`).**
- [ ] **Step 4: Commit**

```bash
git commit -m "feat(admin-economy): add admin page with settings table (ARC-619)"
```

### Task 15 — `EconomyEditDialog` (client)

**Files:**

- Create: `apps/web/src/features/admin-economy/ui/EconomyEditDialog.tsx`

`'use client'`. Props: `open`, `onClose`, `economyKey`, `currentValue`, `defaultValue`. Controlled input for new value. Submit calls `setEconomyValueAction` in `useTransition`. Inline `validation` error on bad input. Toast on success. Reset button calls `resetEconomyValueAction`.

- [ ] **Step 1: Implement. Step 2: Vitest. Step 3: Commit.**

```bash
git commit -m "feat(admin-economy): add edit dialog with reset action (ARC-619)"
```

### Task 16 — `EconomyAuditDrawer` (client)

**Files:**

- Create: `apps/web/src/features/admin-economy/ui/EconomyAuditDrawer.tsx`

`'use client'`. Opens with the per-row "History" button. On open: calls `loadEconomyHistoryAction({ key })` in `useTransition`, renders the list (from / to / admin / when).

- [ ] **Step 1: Implement. Step 2: Vitest. Step 3: Commit.**

```bash
git commit -m "feat(admin-economy): add audit history drawer (ARC-619)"
```

---

## Phase 7 — i18n

### Task 17 — Admin-economy namespace (5 locales)

**Files:**

- Create: `apps/web/src/shared/i18n/messages/pages/admin-economy/{en,ru,es,fr,by}.ts`
- Modify: existing i18n registry file (look at how `admin-tournaments` registered itself; mirror that)

`en.ts`:

```ts
export const adminEconomyEn = {
  title: 'Economy settings',
  table: {
    key: 'Key',
    current: 'Current value',
    default: 'Default',
    source: 'Source',
    lastChanged: 'Last changed',
    actions: 'Actions',
  },
  sources: {
    override: 'Admin override',
    env: 'Environment',
    default: 'Code default',
  },
  buttons: {
    edit: 'Edit',
    reset: 'Reset to default',
    history: 'History',
    refreshCache: 'Refresh cache',
  },
  editDialog: {
    title: 'Edit {{key}}',
    currentLabel: 'Current',
    newValueLabel: 'New value',
    save: 'Save',
    cancel: 'Cancel',
  },
  auditDrawer: {
    title: 'History for {{key}}',
    empty: 'No changes yet.',
    from: 'From',
    to: 'To',
    changedBy: '{{name}}',
    changedAt: '{{date}}',
  },
  errors: {
    invalidValue: 'Value must be a positive integer up to 1,000,000.',
    keyNotFound: 'Unknown setting.',
    forbidden: 'You do not have permission.',
    generic: 'Could not save. Please retry.',
  },
  toasts: {
    saved: 'Saved {{key}} = {{value}}.',
    reset: 'Reset {{key}} to default.',
    cacheCleared: 'Cache cleared on this instance.',
  },
} as const;
export type AdminEconomyI18n = typeof adminEconomyEn;
```

Other locales follow the same pattern with translations. Belarusian can mirror Russian for these short admin labels.

- [ ] **Step 1: Create the 5 locale files.**
- [ ] **Step 2: Wire into the i18n registry.**
- [ ] **Step 3: Commit**

```bash
git commit -m "feat(admin-economy): i18n namespace in 5 locales (ARC-619)"
```

---

## Phase 8 — Env doc + E2E

### Task 18 — Update `.env.example`

**Files:**

- Modify: `apps/be/.env.example`

Annotate the existing economy block with a header note that these are now overridable at runtime via `/admin/economy`. Add `ECONOMY_CACHE_TTL_SECONDS=60` with a comment.

- [ ] **Step 1: Edit.**
- [ ] **Step 2: Commit**

```bash
git commit -m "docs(economy): annotate env vars as overridable; document cache TTL (ARC-619)"
```

### Task 19 — E2E scaffold

**Files:**

- Create: `apps/web/e2e/admin/admin-economy.spec.ts`

Follow the pattern from `apps/web/e2e/wallet/admin-grant.spec.ts`. Mocked block: route reaches /admin/economy without 5xx; the table renders. Skip-annotated block documents live-flow requirements (admin login + signup admin token).

- [ ] **Step 1: Implement. Step 2: Run. Step 3: Commit**

```bash
git commit -m "test(admin-economy/e2e): scaffold admin economy spec (ARC-619)"
```

---

## Phase 9 — Final verification

### Task 20 — Cross-cutting verification

- [ ] BE: `pnpm --filter be test` — all pass (existing 558 + new economy unit + integration + controller, plus refactored consumer specs).
- [ ] Web: `pnpm --filter web test` and `pnpm --filter web exec tsc --noEmit 2>&1 | grep -v "next.config.ts(5,32)"`.
- [ ] Mobile: `pnpm --filter mobile test`.
- [ ] `pnpm check-file-length`.
- [ ] `pnpm --filter be lint`.
- [ ] Manual smoke (requires Docker + Mongo + dev servers):

  1. Restart BE. Confirm `/admin/economy` lists all 6 keys with `source: 'env'` or `'default'`.
  2. As admin, set `game_win_coin_reward` to 100. Source changes to `override`.
  3. Win a game (or trigger session-complete). Wallet shows `+100 coins`, not 50.
  4. Click Reset on `game_win_coin_reward`. Source back to `env`/`default`. Next game-win returns to the prior value.
  5. Click History. Shows two rows (set + reset) with the admin's name.

- [ ] Push branch, open PR (follow the established `--no-verify` exception if the pre-push e2e hook needs Mongo and your local env doesn't have it).

```bash
git push -u origin ARC-619
# fallback if hook needs Mongo: git push -u origin ARC-619 --no-verify
gh pr create --base develop --head ARC-619 ...
```

---

## Acceptance criteria

- [ ] `EconomyModule` exists with `EconomySetting` + `EconomySettingsAudit` schemas, `EconomySettingsService`, `AdminEconomyController`. Registered in `AppModule`.
- [ ] `getNumber(key)` resolves cache → DB → env → code default; values validated as positive integers ≤ `WalletService.MAX_TRANSACTION_AMOUNT`.
- [ ] `setNumber` and `resetToDefault` are transactional (setting + audit commit together).
- [ ] In-memory TTL cache (default 60s, env-tunable via `ECONOMY_CACHE_TTL_SECONDS`).
- [ ] `GamesService`, `GemConversionService`, `ReferralService` read their respective coin/rate values from `EconomySettingsService.getNumber(...)` at use-time. No more constructor env-reads for the migrated knobs.
- [ ] `GemConversionService.getRate()` is async; `gem-conversion-info.controller.ts` awaits it.
- [ ] `/admin/economy` web page: lists all 6 keys, shows source, supports edit/reset/history/refresh-cache via server actions.
- [ ] Admin routes guarded by `JwtAuthGuard + RolesGuard + @Roles('admin')`.
- [ ] DTOs reject value <= 0 and > 1_000_000.
- [ ] Unknown key → 404.
- [ ] 5 web locales (en/ru/es/fr/by) for the new `admin-economy` namespace.
- [ ] BE unit tests cover all resolver branches, cache TTL, set/reset/audit, invalid input.
- [ ] BE integration tests against real Mongo verify transactional writes + concurrent setter behaviour.
- [ ] Web Vitest covers server module, all 4 server actions, table + edit dialog + audit drawer.
- [ ] E2E spec scaffolded with `test.skip`.
- [ ] No `any`. File-length check passes. Lint clean.
- [ ] `.env.example` annotated; `ECONOMY_CACHE_TTL_SECONDS` documented.
