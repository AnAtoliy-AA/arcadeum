import type { Request } from 'express';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { CriticalService } from './critical/critical.service';
import { TexasHoldemService } from './texas-holdem/texas-holdem.service';
import { GameVisibilityService } from '../admin/game-visibility/game-visibility.service';
import { UserRoleResolver } from '../auth/lib/user-role-resolver.service';

function reqWithUser(userId: string | undefined): Request {
  return (userId
    ? { user: { userId } }
    : { user: undefined }) as unknown as Request;
}

function buildController(
  visibility: GameVisibilityService,
  resolver: UserRoleResolver,
): GamesController {
  return new GamesController(
    {} as unknown as GamesService,
    {} as unknown as CriticalService,
    {} as unknown as TexasHoldemService,
    visibility,
    resolver,
  );
}

describe('GamesController.getCatalog', () => {
  it('returns the full catalog for an admin', async () => {
    const vis = {
      canSee: jest.fn().mockResolvedValue(true),
    } as unknown as GameVisibilityService;
    const resolver = {
      resolveRole: jest.fn().mockResolvedValue('admin'),
    } as unknown as UserRoleResolver;
    const controller = buildController(vis, resolver);

    const res = await controller.getCatalog(reqWithUser('admin-1'));
    const ids = res.games.map((g) => g.gameId);
    expect(ids).toEqual(expect.arrayContaining(['glimworm_v1', 'critical_v1']));
    const glim = res.games.find((g) => g.gameId === 'glimworm_v1');
    expect(glim?.variants).toEqual(
      expect.arrayContaining(['battle_royale', 'time_attack', 'lives_heats']),
    );
  });

  it('filters out games and variants the caller cannot see', async () => {
    const vis = {
      canSee: jest.fn((_role: string, gameId: string, variantId?: string) => {
        if (gameId === 'glimworm_v1' && variantId === 'time_attack') {
          return Promise.resolve(false);
        }
        return Promise.resolve(true);
      }),
    } as unknown as GameVisibilityService;
    const resolver = {
      resolveRole: jest.fn().mockResolvedValue('free'),
    } as unknown as UserRoleResolver;
    const controller = buildController(vis, resolver);

    const res = await controller.getCatalog(reqWithUser(undefined));
    const glim = res.games.find((g) => g.gameId === 'glimworm_v1');
    expect(glim?.variants).not.toContain('time_attack');
    expect(glim?.variants).toEqual(
      expect.arrayContaining(['battle_royale', 'lives_heats']),
    );
  });

  it('drops the whole game if not visible', async () => {
    const vis = {
      canSee: jest.fn((_role: string, gameId: string) =>
        Promise.resolve(gameId !== 'glimworm_v1'),
      ),
    } as unknown as GameVisibilityService;
    const resolver = {
      resolveRole: jest.fn().mockResolvedValue('free'),
    } as unknown as UserRoleResolver;
    const controller = buildController(vis, resolver);

    const res = await controller.getCatalog(reqWithUser(undefined));
    expect(res.games.find((g) => g.gameId === 'glimworm_v1')).toBeUndefined();
  });

  it('treats synthetic anon_ users as anonymous (resolveRole receives the raw id; resolver short-circuits in real life)', async () => {
    const resolveRole = jest.fn().mockResolvedValue('free');
    const vis = {
      canSee: jest.fn().mockResolvedValue(true),
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
