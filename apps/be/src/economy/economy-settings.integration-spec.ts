/**
 * EconomySettingsService integration tests — real Mongo replica set via
 * mongodb-memory-server. Mirrors wallet.service.integration-spec.ts.
 *
 * Tests cover: getNumber (env, default), setNumber (writes setting + audit,
 * cache invalidation), resetToDefault (removes row + audit), listAll,
 * transactional rollback on audit-insert failure, concurrent setNumber.
 */
import { Test } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { Model, Types } from 'mongoose';
import { EconomySettingsService } from './economy-settings.service';
import { EconomyModule } from './economy.module';
import { WalletModule } from '../wallet/wallet.module';
import { WalletGateway } from '../wallet/wallet.gateway';
import { AuthModule } from '../auth/auth.module';
import {
  EconomySetting,
  EconomySettingDocument,
} from './schemas/economy-setting.schema';
import {
  EconomySettingsAudit,
  EconomySettingsAuditDocument,
} from './schemas/economy-settings-audit.schema';
import { ECONOMY_KEYS } from './economy-keys';

describe('EconomySettingsService (integration)', () => {
  let replSet: MongoMemoryReplSet;
  let service: EconomySettingsService;
  let settingModel: Model<EconomySettingDocument>;
  let auditModel: Model<EconomySettingsAuditDocument>;

  const adminId = new Types.ObjectId().toHexString();

  beforeAll(async () => {
    // Set env var before module bootstrap so ConfigService picks it up
    process.env.GAME_WIN_COIN_REWARD ??= '77';
    // Ensure gem_to_coin_rate has no env override so it falls through to default
    delete process.env.GEM_TO_COIN_RATE;

    replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
    const uri = replSet.getUri();

    const moduleRef = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }),
        AuthModule,
        WalletModule,
        EconomyModule,
      ],
    })
      .overrideProvider(WalletGateway)
      .useValue({ emitBalance: jest.fn() })
      .compile();

    service = moduleRef.get(EconomySettingsService);
    settingModel = moduleRef.get<Model<EconomySettingDocument>>(
      getModelToken(EconomySetting.name),
    );
    auditModel = moduleRef.get<Model<EconomySettingsAuditDocument>>(
      getModelToken(EconomySettingsAudit.name),
    );

    // Sync indexes so unique constraints are enforced
    await settingModel.syncIndexes();
    await auditModel.syncIndexes();
  }, 60_000);

  afterAll(async () => {
    await replSet.stop();
  }, 30_000);

  afterEach(async () => {
    await settingModel.deleteMany({});
    await auditModel.deleteMany({});
    // Reset the in-memory cache between tests
    service.refreshCache();
  });

  // ─── Test 1: Empty DB + env present ────────────────────────────────────────
  it('getNumber returns env value when DB is empty and env is set', async () => {
    // GAME_WIN_COIN_REWARD=77 is set in beforeAll
    const value = await service.getNumber('game_win_coin_reward');
    expect(value).toBe(77);
  });

  // ─── Test 2: Empty DB + no env ─────────────────────────────────────────────
  it('getNumber returns code default when DB is empty and env is not set', async () => {
    // GEM_TO_COIN_RATE was deleted in beforeAll
    const value = await service.getNumber('gem_to_coin_rate');
    expect(value).toBe(100); // code default from ECONOMY_KEYS_CONFIG
  });

  // ─── Test 3: setNumber writes setting + audit transactionally ──────────────
  it('setNumber writes both EconomySetting and EconomySettingsAudit rows', async () => {
    await service.setNumber('game_win_coin_reward', 200, adminId);

    const setting = await settingModel
      .findOne({ key: 'game_win_coin_reward' })
      .lean();
    expect(setting).not.toBeNull();
    expect(setting?.value).toBe(200);

    const audits = await auditModel
      .find({ key: 'game_win_coin_reward' })
      .lean();
    expect(audits).toHaveLength(1);
    expect(audits[0].toValue).toBe(200);
    // fromValue should be the env fallback (77) since no prior DB row existed
    expect(audits[0].fromValue).toBe(77);
  });

  // ─── Test 4: Cache invalidation after setNumber ────────────────────────────
  it('getNumber returns the new value immediately after setNumber (cache invalidated)', async () => {
    // First call to seed the cache with the env value (77)
    const before = await service.getNumber('game_win_coin_reward');
    expect(before).toBe(77);

    // setNumber should invalidate the cache entry
    await service.setNumber('game_win_coin_reward', 200, adminId);

    // Second call must return 200 without waiting for TTL to expire
    const after = await service.getNumber('game_win_coin_reward');
    expect(after).toBe(200);
  });

  // ─── Test 5: resetToDefault removes the row + writes audit ─────────────────
  it('resetToDefault removes EconomySetting row and writes audit with env toValue', async () => {
    // First set a value so there is a row to delete
    await service.setNumber('game_win_coin_reward', 200, adminId);

    // Now reset it
    await service.resetToDefault('game_win_coin_reward', adminId);

    const setting = await settingModel
      .findOne({ key: 'game_win_coin_reward' })
      .lean();
    expect(setting).toBeNull();

    const audits = await auditModel
      .find({ key: 'game_win_coin_reward' })
      .sort({ createdAt: 1 })
      .lean();
    // Should have two audit rows: one from setNumber, one from resetToDefault
    expect(audits.length).toBeGreaterThanOrEqual(2);

    const resetAudit = audits[audits.length - 1];
    expect(resetAudit.fromValue).toBe(200);
    // toValue should be the env/default fallback (77 from env)
    expect(resetAudit.toValue).toBe(77);
  });

  // ─── Test 6: listAll returns all registered keys ───────────────────────────
  it('listAll returns all economy keys including those with no DB rows', async () => {
    const all = await service.listAll();
    expect(all).toHaveLength(ECONOMY_KEYS.length);

    // Each entry has the required shape
    for (const entry of all) {
      expect(ECONOMY_KEYS).toContain(entry.key);
      expect(typeof entry.currentValue).toBe('number');
      expect(['override', 'env', 'default']).toContain(entry.source);
    }

    // Keys with no DB row should show env or default source
    const gemRate = all.find((v) => v.key === 'gem_to_coin_rate');
    expect(gemRate?.source).toBe('default'); // no env set in these tests
  });

  // ─── Test 7: setNumber rolls back when audit insert fails ──────────────────
  it('setNumber rolls back EconomySetting row when audit insert throws', async () => {
    // Spy on auditModel.create to throw on the NEXT call only
    const createSpy = jest
      .spyOn(auditModel, 'create')
      .mockImplementationOnce(() => {
        throw new Error('fake-audit-failure');
      });

    await expect(
      service.setNumber('game_win_coin_reward', 333, adminId),
    ).rejects.toThrow('fake-audit-failure');

    // The transaction should have rolled back — no EconomySetting row for this key
    const setting = await settingModel
      .findOne({ key: 'game_win_coin_reward' })
      .lean();
    expect(setting).toBeNull();

    // No audit row either
    const audits = await auditModel
      .find({ key: 'game_win_coin_reward' })
      .lean();
    expect(audits).toHaveLength(0);

    createSpy.mockRestore();
  });

  // ─── Bonus: Concurrent setNumber — last write wins, both audits present ────
  it('concurrent setNumber calls: last write wins and both audit rows are written', async () => {
    // Run two concurrent setNumber calls for the same key
    const results = await Promise.allSettled([
      service.setNumber('gem_to_coin_rate', 150, adminId),
      service.setNumber('gem_to_coin_rate', 250, adminId),
    ]);

    // Both should complete (with possible retries inside withTransaction)
    const failed = results.filter((r) => r.status === 'rejected');
    expect(failed).toHaveLength(0);

    // The final setting value is either 150 or 250 (whichever committed last)
    const setting = await settingModel
      .findOne({ key: 'gem_to_coin_rate' })
      .lean();
    expect(setting).not.toBeNull();
    expect([150, 250]).toContain(setting?.value);

    // Both writes produced audit rows
    const audits = await auditModel.find({ key: 'gem_to_coin_rate' }).lean();
    expect(audits).toHaveLength(2);
  });
});
