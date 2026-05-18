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

describe('GameVisibilityService (write paths)', () => {
  it('setGameTier upserts and invalidates cache', async () => {
    const upsertMock = jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue({}),
    });
    const model = {
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
    const model = {
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

it('listForAdmin returns the full catalog joined with tiers (defaults to all)', async () => {
  const model = {
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
