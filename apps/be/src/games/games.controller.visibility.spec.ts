import type { Request } from 'express';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { CriticalService } from './critical/critical.service';
import { TexasHoldemService } from './texas-holdem/texas-holdem.service';
import { GameVisibilityService } from '../admin/game-visibility/game-visibility.service';
import { GameRuleVisibilityService } from '../admin/game-visibility/game-rule-visibility.service';
import { UserRoleResolver } from '../auth/lib/user-role-resolver.service';
import { CreateGameRoomDto } from './dtos/create-game-room.dto';
import { QuickplayGameDto } from './dtos/quickplay-game.dto';

const ruleVis = {
  getAllRules: jest.fn().mockResolvedValue(new Map()),
} as unknown as GameRuleVisibilityService;

function buildController(
  games: GamesService,
  vis: GameVisibilityService,
  resolver: UserRoleResolver,
): GamesController {
  return new GamesController(
    games,
    {} as unknown as CriticalService,
    {} as unknown as TexasHoldemService,
    vis,
    ruleVis,
    resolver,
  );
}

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
    const games = { createRoom: jest.fn() } as unknown as GamesService;
    const controller = buildController(games, vis, resolver);
    await expect(
      controller.createRoom(
        { user: { userId: 'u-1' } } as unknown as Request,
        {
          gameId: 'glimworm_v1',
          name: 'x',
          visibility: 'public',
        } as CreateGameRoomDto,
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
    const games = {
      createRoom: jest.fn().mockResolvedValue({ id: 'r-1' }),
    } as unknown as GamesService;
    const controller = buildController(games, vis, resolver);
    await controller.createRoom(
      { user: { userId: 'u-1' } } as unknown as Request,
      {
        gameId: 'glimworm_v1',
        name: 'x',
        visibility: 'public',
        gameOptions: { variant: 'time_attack' },
      } as unknown as CreateGameRoomDto,
    );
    expect(vis.assertVisible).toHaveBeenCalledWith(
      'vip',
      'glimworm_v1',
      'time_attack',
    );
    expect(games.createRoom).toHaveBeenCalled();
  });

  it('passes undefined variant when gameOptions has no variant key', async () => {
    const vis = {
      canSee: jest.fn().mockResolvedValue(true),
      assertVisible: jest.fn().mockResolvedValue(undefined),
    } as unknown as GameVisibilityService;
    const resolver = {
      resolveRole: jest.fn().mockResolvedValue('premium'),
    } as unknown as UserRoleResolver;
    const games = {
      createRoom: jest.fn().mockResolvedValue({ id: 'r-2' }),
    } as unknown as GamesService;
    const controller = buildController(games, vis, resolver);
    await controller.createRoom(
      { user: { userId: 'u-1' } } as unknown as Request,
      {
        gameId: 'critical_v1',
        name: 'x',
        visibility: 'public',
      } as CreateGameRoomDto,
    );
    expect(vis.assertVisible).toHaveBeenCalledWith(
      'premium',
      'critical_v1',
      undefined,
    );
  });

  it('ignores non-string variant values in gameOptions', async () => {
    const vis = {
      canSee: jest.fn().mockResolvedValue(true),
      assertVisible: jest.fn().mockResolvedValue(undefined),
    } as unknown as GameVisibilityService;
    const resolver = {
      resolveRole: jest.fn().mockResolvedValue('free'),
    } as unknown as UserRoleResolver;
    const games = {
      createRoom: jest.fn().mockResolvedValue({ id: 'r-3' }),
    } as unknown as GamesService;
    const controller = buildController(games, vis, resolver);
    await controller.createRoom(
      { user: { userId: 'u-1' } } as unknown as Request,
      {
        gameId: 'glimworm_v1',
        name: 'x',
        visibility: 'public',
        gameOptions: { variant: 42 },
      } as unknown as CreateGameRoomDto,
    );
    expect(vis.assertVisible).toHaveBeenCalledWith(
      'free',
      'glimworm_v1',
      undefined,
    );
  });

  it('extracts variant from gameOptions.cardVariant (Critical convention)', async () => {
    const vis = {
      canSee: jest.fn().mockResolvedValue(true),
      assertVisible: jest.fn().mockResolvedValue(undefined),
    } as unknown as GameVisibilityService;
    const resolver = {
      resolveRole: jest.fn().mockResolvedValue('free'),
    } as unknown as UserRoleResolver;
    const games = {
      createRoom: jest.fn().mockResolvedValue({ id: 'r-1' }),
    } as unknown as GamesService;
    const controller = buildController(games, vis, resolver);
    await controller.createRoom(
      { user: { userId: 'u-1' } } as unknown as Request,
      {
        gameId: 'critical_v1',
        name: 'x',
        visibility: 'public',
        gameOptions: { cardVariant: 'crime' },
      } as unknown as CreateGameRoomDto,
    );
    expect(vis.assertVisible).toHaveBeenCalledWith(
      'free',
      'critical_v1',
      'crime',
    );
  });

  it('prefers gameOptions.variant over gameOptions.cardVariant', async () => {
    const vis = {
      canSee: jest.fn().mockResolvedValue(true),
      assertVisible: jest.fn().mockResolvedValue(undefined),
    } as unknown as GameVisibilityService;
    const resolver = {
      resolveRole: jest.fn().mockResolvedValue('free'),
    } as unknown as UserRoleResolver;
    const games = {
      createRoom: jest.fn().mockResolvedValue({ id: 'r-1' }),
    } as unknown as GamesService;
    const controller = buildController(games, vis, resolver);
    await controller.createRoom(
      { user: { userId: 'u-1' } } as unknown as Request,
      {
        gameId: 'sea_battle_v1',
        name: 'x',
        visibility: 'public',
        gameOptions: { variant: 'classic', cardVariant: 'should-be-ignored' },
      } as unknown as CreateGameRoomDto,
    );
    expect(vis.assertVisible).toHaveBeenCalledWith(
      'free',
      'sea_battle_v1',
      'classic',
    );
  });
});

describe('quickplay visibility gate', () => {
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
    const games = {
      quickplay: jest.fn(),
      findHumanMatch: jest.fn(),
    } as unknown as GamesService;
    const controller = buildController(games, vis, resolver);
    await expect(
      controller.quickplay(
        { user: { userId: 'u-1' } } as unknown as Request,
        { gameId: 'glimworm_v1', variant: 'time_attack' } as QuickplayGameDto,
      ),
    ).rejects.toThrow();
    expect(games.quickplay).not.toHaveBeenCalled();
    expect(games.findHumanMatch).not.toHaveBeenCalled();
  });

  it('passes through when visible (ai mode)', async () => {
    const vis = {
      canSee: jest.fn().mockResolvedValue(true),
      assertVisible: jest.fn().mockResolvedValue(undefined),
    } as unknown as GameVisibilityService;
    const resolver = {
      resolveRole: jest.fn().mockResolvedValue('vip'),
    } as unknown as UserRoleResolver;
    const games = {
      quickplay: jest.fn().mockResolvedValue({ id: 'r-1' }),
      findHumanMatch: jest.fn(),
    } as unknown as GamesService;
    const controller = buildController(games, vis, resolver);
    await controller.quickplay(
      { user: { userId: 'u-1' } } as unknown as Request,
      { gameId: 'glimworm_v1', variant: 'time_attack' } as QuickplayGameDto,
    );
    expect(vis.assertVisible).toHaveBeenCalledWith(
      'vip',
      'glimworm_v1',
      'time_attack',
    );
    expect(games.quickplay).toHaveBeenCalled();
  });

  it('passes through when visible (human mode)', async () => {
    const vis = {
      canSee: jest.fn().mockResolvedValue(true),
      assertVisible: jest.fn().mockResolvedValue(undefined),
    } as unknown as GameVisibilityService;
    const resolver = {
      resolveRole: jest.fn().mockResolvedValue('premium'),
    } as unknown as UserRoleResolver;
    const games = {
      quickplay: jest.fn(),
      findHumanMatch: jest.fn().mockResolvedValue({ id: 'r-2' }),
    } as unknown as GamesService;
    const controller = buildController(games, vis, resolver);
    await controller.quickplay(
      { user: { userId: 'u-1' } } as unknown as Request,
      {
        gameId: 'glimworm_v1',
        mode: 'human',
        variant: 'battle_royale',
      } as QuickplayGameDto,
    );
    expect(vis.assertVisible).toHaveBeenCalledWith(
      'premium',
      'glimworm_v1',
      'battle_royale',
    );
    expect(games.findHumanMatch).toHaveBeenCalled();
  });
});

describe('listRooms visibility filter', () => {
  it('listRooms filters out rooms the caller cannot see', async () => {
    const canSee = jest.fn(
      (_role: string, gameId: string, variantId?: string) =>
        Promise.resolve(
          !(gameId === 'glimworm_v1' && variantId === 'time_attack'),
        ),
    );
    const filterVisible = jest.fn(
      async <T>(
        role: string,
        items: T[],
        key: (t: T) => { gameId: string; variantId?: string },
      ) => {
        const out: T[] = [];
        for (const item of items) {
          const { gameId, variantId } = key(item);
          if (await canSee(role, gameId, variantId)) out.push(item);
        }
        return out;
      },
    );
    const vis = {
      canSee,
      filterVisible,
    } as unknown as GameVisibilityService;
    const resolver = {
      resolveRole: jest.fn().mockResolvedValue('free'),
    } as unknown as UserRoleResolver;
    const games = {
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
    } as unknown as GamesService;
    const controller = buildController(games, vis, resolver);
    const res = await controller.listRooms({
      user: undefined,
    } as unknown as Request);
    expect(
      (res as { rooms: Array<{ id: string }> }).rooms.map((r) => r.id),
    ).toEqual(['r-2', 'r-3']);
  });
});
