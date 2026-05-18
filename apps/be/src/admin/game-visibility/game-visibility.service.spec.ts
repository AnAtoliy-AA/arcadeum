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
