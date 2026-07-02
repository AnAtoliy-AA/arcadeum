import type { Request } from 'express';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { CriticalService } from './critical/critical.service';
import { TexasHoldemService } from './texas-holdem/texas-holdem.service';
import { GameVisibilityService } from '../admin/game-visibility/game-visibility.service';
import { GameRuleVisibilityService } from '../admin/game-visibility/game-rule-visibility.service';
import { UserRoleResolver } from '../auth/lib/user-role-resolver.service';

function reqWithUser(userId: string | undefined): Request {
  return (userId
    ? { user: { userId } }
    : { user: undefined }) as unknown as Request;
}

const ruleVis = {
  getAllRules: jest.fn().mockResolvedValue(new Map()),
} as unknown as GameRuleVisibilityService;

function buildController(
  visibility: GameVisibilityService,
  resolver: UserRoleResolver,
): GamesController {
  return new GamesController(
    {} as unknown as GamesService,
    {} as unknown as CriticalService,
    {} as unknown as TexasHoldemService,
    visibility,
    ruleVis,
    resolver,
  );
}

describe('GamesController.getCatalog', () => {
  it('returns the full catalog for an admin', async () => {
    const vis = {
      canSee: jest.fn().mockResolvedValue(true),
      getEffectiveTier: jest.fn().mockResolvedValue('all'),
    } as unknown as GameVisibilityService;
    const resolver = {
      resolveRole: jest.fn().mockResolvedValue('admin'),
    } as unknown as UserRoleResolver;
    const controller = buildController(vis, resolver);

    const res = await controller.getCatalog(reqWithUser('admin-1'));
    const ids = res.games.map((g) => g.gameId);
    expect(ids).toEqual(expect.arrayContaining(['glimworm_v1', 'critical_v1']));
    const glim = res.games.find((g) => g.gameId === 'glimworm_v1');
    expect(glim?.variants.map((v) => v.id)).toEqual(
      expect.arrayContaining(['battle_royale', 'time_attack', 'lives_heats']),
    );
  });

  it('includes a restricted variant (vip_plus) as comingSoon=true for a free caller', async () => {
    const vis = {
      canSee: jest.fn((_role: string, gameId: string, variantId?: string) => {
        if (gameId === 'glimworm_v1' && variantId === 'time_attack') {
          return Promise.resolve(false);
        }
        return Promise.resolve(true);
      }),
      getEffectiveTier: jest.fn((_gameId: string, variantId?: string) => {
        if (variantId === 'time_attack') return Promise.resolve('vip_plus');
        return Promise.resolve('all');
      }),
    } as unknown as GameVisibilityService;
    const resolver = {
      resolveRole: jest.fn().mockResolvedValue('free'),
    } as unknown as UserRoleResolver;
    const controller = buildController(vis, resolver);

    const res = await controller.getCatalog(reqWithUser(undefined));
    const glim = res.games.find((g) => g.gameId === 'glimworm_v1');
    expect(glim?.variants).toContainEqual({
      id: 'time_attack',
      comingSoon: true,
    });
    expect(glim?.variants).toContainEqual(
      expect.objectContaining({ id: 'battle_royale', comingSoon: false }),
    );
    expect(glim?.variants).toContainEqual(
      expect.objectContaining({ id: 'lives_heats', comingSoon: false }),
    );
  });

  it('includes a non-visible game with comingSoon=true', async () => {
    const vis = {
      canSee: jest.fn((_role: string, gameId: string) =>
        Promise.resolve(gameId !== 'glimworm_v1'),
      ),
      getEffectiveTier: jest.fn().mockResolvedValue('all'),
    } as unknown as GameVisibilityService;
    const resolver = {
      resolveRole: jest.fn().mockResolvedValue('free'),
    } as unknown as UserRoleResolver;
    const controller = buildController(vis, resolver);

    const res = await controller.getCatalog(reqWithUser(undefined));
    const game = res.games.find((g) => g.gameId === 'glimworm_v1');
    expect(game).toBeDefined();
    expect(game).toEqual({
      gameId: 'glimworm_v1',
      comingSoon: true,
      variants: [],
      rules: [
        { ruleId: 'idle', comingSoon: true },
        { ruleId: 'spectators', comingSoon: true },
      ],
    });
  });

  it('treats synthetic anon_ users as anonymous (resolveRole receives the raw id; resolver short-circuits in real life)', async () => {
    const resolveRole = jest.fn().mockResolvedValue('free');
    const vis = {
      canSee: jest.fn().mockResolvedValue(true),
      getEffectiveTier: jest.fn().mockResolvedValue('all'),
    } as unknown as GameVisibilityService;
    const resolver = { resolveRole } as unknown as UserRoleResolver;
    const controller = buildController(vis, resolver);
    await controller.getCatalog({
      user: { userId: 'anon_abcd' },
    } as unknown as Request);
    expect(resolveRole).toHaveBeenCalledWith('anon_abcd');
    // The unit test passes the raw id; the resolver (tested separately) short-circuits to 'free'.
  });
});

describe('getCatalog (comingSoon + new tiers)', () => {
  it('includes a none-tier variant with comingSoon=true for a free caller', async () => {
    const vis = {
      canSee: jest.fn((_role: string, gameId: string, variantId?: string) => {
        if (gameId === 'critical_v1' && variantId === 'crime') {
          return Promise.resolve(false);
        }
        return Promise.resolve(true);
      }),
      getEffectiveTier: jest.fn((_gameId: string, variantId?: string) => {
        if (variantId === 'crime') return Promise.resolve('none');
        return Promise.resolve('all');
      }),
    } as unknown as GameVisibilityService;
    const resolver = {
      resolveRole: jest.fn().mockResolvedValue('free'),
    } as unknown as UserRoleResolver;
    const controller = buildController(vis, resolver);

    const res = await controller.getCatalog(reqWithUser('user-1'));
    const game = res.games.find((g) => g.gameId === 'critical_v1');
    expect(game).toBeDefined();
    expect(game?.variants).toContainEqual({ id: 'crime', comingSoon: true });
    expect(game?.variants).toContainEqual(
      expect.objectContaining({ id: 'cyberpunk', comingSoon: false }),
    );
  });

  it('includes a none-tier variant with comingSoon=true for an admin caller (no bypass)', async () => {
    const vis = {
      canSee: jest.fn((_role: string, gameId: string, variantId?: string) => {
        if (gameId === 'critical_v1' && variantId === 'crime') {
          return Promise.resolve(false);
        }
        return Promise.resolve(true);
      }),
      getEffectiveTier: jest.fn((_gameId: string, variantId?: string) => {
        if (variantId === 'crime') return Promise.resolve('none');
        return Promise.resolve('all');
      }),
    } as unknown as GameVisibilityService;
    const resolver = {
      resolveRole: jest.fn().mockResolvedValue('admin'),
    } as unknown as UserRoleResolver;
    const controller = buildController(vis, resolver);

    const res = await controller.getCatalog(reqWithUser('admin-1'));
    const game = res.games.find((g) => g.gameId === 'critical_v1');
    expect(game).toBeDefined();
    expect(game?.variants).toContainEqual({ id: 'crime', comingSoon: true });
  });

  it('includes a developers_plus variant with comingSoon: true for a free caller', async () => {
    const vis = {
      canSee: jest.fn((_role: string, gameId: string, variantId?: string) => {
        if (gameId === 'critical_v1' && variantId === 'crime') {
          return Promise.resolve(false);
        }
        return Promise.resolve(true);
      }),
      getEffectiveTier: jest.fn((_gameId: string, variantId?: string) => {
        if (variantId === 'crime') return Promise.resolve('developers_plus');
        return Promise.resolve('all');
      }),
    } as unknown as GameVisibilityService;
    const resolver = {
      resolveRole: jest.fn().mockResolvedValue('free'),
    } as unknown as UserRoleResolver;
    const controller = buildController(vis, resolver);

    const res = await controller.getCatalog(reqWithUser('user-1'));
    const game = res.games.find((g) => g.gameId === 'critical_v1');
    expect(game).toBeDefined();
    expect(game?.variants).toContainEqual({ id: 'crime', comingSoon: true });
  });

  it('includes a developers_plus variant with comingSoon=false for a developer caller', async () => {
    const vis = {
      canSee: jest.fn().mockResolvedValue(true),
      getEffectiveTier: jest.fn((_gameId: string, variantId?: string) => {
        if (variantId === 'crime') return Promise.resolve('developers_plus');
        return Promise.resolve('all');
      }),
    } as unknown as GameVisibilityService;
    const resolver = {
      resolveRole: jest.fn().mockResolvedValue('developer'),
    } as unknown as UserRoleResolver;
    const controller = buildController(vis, resolver);

    const res = await controller.getCatalog(reqWithUser('dev-1'));
    const game = res.games.find((g) => g.gameId === 'critical_v1');
    expect(game).toBeDefined();
    expect(game?.variants).toContainEqual({ id: 'crime', comingSoon: false });
  });

  it('includes a whole-game none with comingSoon: true at the game level (for any role)', async () => {
    const makeVis = () =>
      ({
        canSee: jest.fn((_role: string, gameId: string, variantId?: string) => {
          if (gameId === 'critical_v1' && variantId === undefined) {
            return Promise.resolve(false);
          }
          return Promise.resolve(true);
        }),
        getEffectiveTier: jest.fn().mockResolvedValue('all'),
      }) as unknown as GameVisibilityService;

    for (const role of ['free', 'admin'] as const) {
      const resolver = {
        resolveRole: jest.fn().mockResolvedValue(role),
      } as unknown as UserRoleResolver;
      const controller = buildController(makeVis(), resolver);

      const res = await controller.getCatalog(reqWithUser('user-1'));
      const game = res.games.find((g) => g.gameId === 'critical_v1');
      expect(game).toBeDefined();
      expect(game).toEqual({
        gameId: 'critical_v1',
        comingSoon: true,
        variants: [],
        rules: [
          { ruleId: 'combos', comingSoon: true },
          { ruleId: 'idle', comingSoon: true },
          { ruleId: 'spectators', comingSoon: true },
        ],
      });
    }
  });

  it('includes a whole-game developers_plus with comingSoon: true at the game level for a free caller', async () => {
    const vis = {
      canSee: jest.fn((_role: string, gameId: string, variantId?: string) => {
        if (gameId === 'critical_v1' && variantId === undefined) {
          return Promise.resolve(false);
        }
        return Promise.resolve(true);
      }),
      getEffectiveTier: jest.fn().mockResolvedValue('all'),
    } as unknown as GameVisibilityService;
    const resolver = {
      resolveRole: jest.fn().mockResolvedValue('free'),
    } as unknown as UserRoleResolver;
    const controller = buildController(vis, resolver);

    const res = await controller.getCatalog(reqWithUser('user-1'));
    const game = res.games.find((g) => g.gameId === 'critical_v1');
    expect(game).toBeDefined();
    expect(game).toMatchObject({
      gameId: 'critical_v1',
      comingSoon: true,
      variants: [],
    });
  });

  it('includes a whole-game developers_plus with comingSoon: false for a developer caller', async () => {
    const vis = {
      canSee: jest.fn().mockResolvedValue(true),
      getEffectiveTier: jest.fn().mockResolvedValue('all'),
    } as unknown as GameVisibilityService;
    const resolver = {
      resolveRole: jest.fn().mockResolvedValue('developer'),
    } as unknown as UserRoleResolver;
    const controller = buildController(vis, resolver);

    const res = await controller.getCatalog(reqWithUser('dev-1'));
    const game = res.games.find((g) => g.gameId === 'critical_v1');
    expect(game).toBeDefined();
    expect(game).toMatchObject({ gameId: 'critical_v1', comingSoon: false });
    expect(game?.variants.length).toBeGreaterThan(0);
  });

  it('includes a vip_plus variant with comingSoon: true for a free caller (non-VIP)', async () => {
    // arrange: critical_v1 game tier 'all', variant 'crime' tier 'vip_plus'
    const vis = {
      canSee: jest.fn((_role: string, gameId: string, variantId?: string) => {
        if (gameId === 'critical_v1' && variantId === 'crime') {
          return Promise.resolve(false);
        }
        return Promise.resolve(true);
      }),
      getEffectiveTier: jest.fn((_gameId: string, variantId?: string) => {
        if (variantId === 'crime') return Promise.resolve('vip_plus');
        return Promise.resolve('all');
      }),
    } as unknown as GameVisibilityService;
    const resolver = {
      resolveRole: jest.fn().mockResolvedValue('free'),
    } as unknown as UserRoleResolver;
    const controller = buildController(vis, resolver);

    // act: role 'free'
    const res = await controller.getCatalog(reqWithUser('user-1'));
    // assert: critical entry's variants contains { id: 'crime', comingSoon: true }
    const game = res.games.find((g) => g.gameId === 'critical_v1');
    expect(game).toBeDefined();
    expect(game?.variants).toContainEqual({ id: 'crime', comingSoon: true });
  });

  it('includes a vip_plus variant with comingSoon: false for a vip caller', async () => {
    // arrange: critical_v1 game tier 'all', variant 'crime' tier 'vip_plus'
    const vis = {
      canSee: jest.fn().mockResolvedValue(true),
      getEffectiveTier: jest.fn((_gameId: string, variantId?: string) => {
        if (variantId === 'crime') return Promise.resolve('vip_plus');
        return Promise.resolve('all');
      }),
    } as unknown as GameVisibilityService;
    const resolver = {
      resolveRole: jest.fn().mockResolvedValue('vip'),
    } as unknown as UserRoleResolver;
    const controller = buildController(vis, resolver);

    // act: role 'vip'
    const res = await controller.getCatalog(reqWithUser('vip-1'));
    // assert: critical entry's variants contains { id: 'crime', comingSoon: false }
    const game = res.games.find((g) => g.gameId === 'critical_v1');
    expect(game).toBeDefined();
    expect(game?.variants).toContainEqual({ id: 'crime', comingSoon: false });
  });
});
