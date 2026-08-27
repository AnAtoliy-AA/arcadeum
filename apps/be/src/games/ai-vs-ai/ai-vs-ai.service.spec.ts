import { BadRequestException } from '@nestjs/common';
import { AiVsAiService } from './ai-vs-ai.service';
import { AI_VS_AI_GAME_IDS } from '../common/ai-vs-ai';
import type { GameRoomsMapper } from '../rooms/game-rooms.mapper';
import type { GamesRealtimeService } from '../games.realtime.service';
import type { Model } from 'mongoose';
import type { GameRoom } from '../schemas/game-room.schema';
import type { ChessService } from '../chess/chess.service';
import type { CheckersService } from '../checkers/checkers.service';
import type { TicTacToeService } from '../tic-tac-toe/tic-tac-toe.service';
import type { CascadeService } from '../cascade/cascade.service';
import type { CatDashService } from '../cat-dash/cat-dash.service';
import type { SeaBattleService } from '../sea-battle/sea-battle.service';
import type { CriticalService } from '../critical/critical.service';
import type { BackgammonService } from '../backgammon/backgammon.service';
import type { HeartsService } from '../hearts/hearts.service';
import type { SpadesService } from '../spades/spades.service';
import type { GoService } from '../go/go.service';
import type { PachisiService } from '../pachisi/pachisi.service';
import type { GameEngineRegistry } from '../engines/registry/game-engine.registry';

interface RoomArg {
  hostId: string;
  maxPlayers: number;
  participants: Array<{ userId: string }>;
  gameOptions: Record<string, unknown>;
}

function createdRoomArg(gameRoomModel: Model<GameRoom>): RoomArg {
  // Test helper: read the payload passed to the mocked model.create.
  const calls = (
    gameRoomModel.create as unknown as { mock: { calls: RoomArg[][] } }
  ).mock.calls;
  return calls[0][0];
}

function buildService() {
  const roomDoc = {
    _id: { toString: () => 'room-1' },
  } as unknown as GameRoom;
  const gameRoomModel = {
    create: jest.fn().mockResolvedValue(roomDoc),
  } as unknown as Model<GameRoom>;
  const summary = { id: 'room-1', name: 'AI vs AI' };
  const gameRoomsMapper = {
    prepareRoomSummary: jest.fn().mockResolvedValue(summary),
  } as unknown as GameRoomsMapper;
  const realtimeService = {
    emitRoomCreated: jest.fn(),
  } as unknown as GamesRealtimeService;
  const services = {
    chess: { startSession: jest.fn() } as unknown as ChessService,
    checkers: { startSession: jest.fn() } as unknown as CheckersService,
    ticTacToe: { startSession: jest.fn() } as unknown as TicTacToeService,
    cascade: { startSession: jest.fn() } as unknown as CascadeService,
    catDash: { startSession: jest.fn() } as unknown as CatDashService,
    seaBattle: { startSession: jest.fn() } as unknown as SeaBattleService,
    critical: { startSession: jest.fn() } as unknown as CriticalService,
    backgammon: { startSession: jest.fn() } as unknown as BackgammonService,
    hearts: { startSession: jest.fn() } as unknown as HeartsService,
    spades: { startSession: jest.fn() } as unknown as SpadesService,
    go: { startSession: jest.fn() } as unknown as GoService,
    pachisi: { startSession: jest.fn() } as unknown as PachisiService,
  };
  const engineMetadata: Record<
    string,
    { minPlayers: number; maxPlayers: number }
  > = {
    chess_v1: { minPlayers: 2, maxPlayers: 2 },
    checkers_v1: { minPlayers: 2, maxPlayers: 2 },
    sea_battle_v1: { minPlayers: 2, maxPlayers: 2 },
    hearts_v1: { minPlayers: 4, maxPlayers: 4 },
    spades_v1: { minPlayers: 4, maxPlayers: 4 },
  };
  const engineRegistry = {
    // Legacy AI-vs-AI games are all 1v1; only hearts_v1 overrides the table.
    getMetadata: jest.fn(
      (gameId: string) =>
        engineMetadata[gameId] ?? { minPlayers: 2, maxPlayers: 2 },
    ),
  } as unknown as GameEngineRegistry;
  const service = new AiVsAiService(
    gameRoomModel,
    gameRoomsMapper,
    realtimeService,
    services.chess,
    services.checkers,
    services.ticTacToe,
    services.cascade,
    services.catDash,
    services.seaBattle,
    services.critical,
    services.backgammon,
    services.hearts,
    services.spades,
    services.go,
    services.pachisi,
    engineRegistry,
  );
  return { service, gameRoomModel, gameRoomsMapper, realtimeService, services };
}

describe('AiVsAiService', () => {
  it('can start every game listed in AI_VS_AI_GAME_IDS (no drift)', async () => {
    const { service } = buildService();
    for (const gameId of AI_VS_AI_GAME_IDS) {
      await expect(
        service.createAIvsAIRoom('user-1', { gameId }),
      ).resolves.toBeDefined();
    }
  });

  it('rejects games outside the supported list', async () => {
    const { service } = buildService();
    await expect(
      service.createAIvsAIRoom('user-1', { gameId: 'glimworm_v1' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('creates a public room owned by two bots with expert difficulty', async () => {
    const { service, gameRoomModel, gameRoomsMapper, realtimeService } =
      buildService();
    const result = await service.createAIvsAIRoom('user-1', {
      gameId: 'checkers_v1',
      aiMoveDelayMs: 1000,
    });

    const roomArg = createdRoomArg(gameRoomModel);
    expect(roomArg).toMatchObject({
      gameId: 'checkers_v1',
      name: 'AI vs AI',
      visibility: 'public',
      maxPlayers: 2,
      status: 'lobby',
      gameOptions: {
        aiVsAi: true,
        aiMoveDelayMs: 1000,
        botDifficulty: 'expert',
        aiDifficulty: 'expert',
      },
    });
    expect(roomArg.hostId).toMatch(/^bot-ai-[0-9a-f]{10}$/);
    expect(roomArg.participants).toHaveLength(2);
    expect(roomArg.participants[0].userId).toMatch(/^bot-ai-/);
    expect(roomArg.participants[1].userId).toMatch(/^bot-ai-/);
    expect(roomArg.participants[0].userId).not.toBe(
      roomArg.participants[1].userId,
    );
    expect(gameRoomsMapper.prepareRoomSummary).toHaveBeenCalledWith(
      expect.anything(),
      'user-1',
    );
    expect(realtimeService.emitRoomCreated).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'room-1' }),
    );
    expect(result).toEqual(expect.objectContaining({ id: 'room-1' }));
  });

  it('falls back to the 2s default delay for invalid values', async () => {
    const { service, gameRoomModel } = buildService();
    await service.createAIvsAIRoom('user-1', {
      gameId: 'chess_v1',
      aiMoveDelayMs: 1500,
    });
    const roomArg = createdRoomArg(gameRoomModel);
    expect(roomArg.gameOptions.aiMoveDelayMs).toBe(2000);
  });

  it('starts chess with expert bot difficulty in the extras', async () => {
    const { service, services } = buildService();
    await service.createAIvsAIRoom('user-1', { gameId: 'chess_v1' });
    expect(services.chess.startSession).toHaveBeenCalledWith(
      expect.stringMatching(/^bot-ai-/),
      'room-1',
      false,
      0,
      expect.objectContaining({ aiVsAi: true, botDifficulty: 'expert' }),
    );
  });

  it('starts sea battle with expert difficulty in the extras', async () => {
    const { service, services } = buildService();
    await service.createAIvsAIRoom('user-1', { gameId: 'sea_battle_v1' });
    expect(services.seaBattle.startSession).toHaveBeenCalledWith(
      expect.stringMatching(/^bot-ai-/),
      'room-1',
      false,
      0,
      expect.objectContaining({ aiVsAi: true, difficulty: 'expert' }),
    );
  });

  it('passes extras as the sixth argument for critical', async () => {
    const { service, services } = buildService();
    await service.createAIvsAIRoom('user-1', { gameId: 'critical_v1' });
    expect(services.critical.startSession).toHaveBeenCalledWith(
      expect.stringMatching(/^bot-ai-/),
      'room-1',
      false,
      0,
      undefined,
      expect.objectContaining({ aiVsAi: true }),
    );
  });

  it('starts backgammon with extras in startSession', async () => {
    const { service, services } = buildService();
    await service.createAIvsAIRoom('user-1', { gameId: 'backgammon_v1' });
    expect(services.backgammon.startSession).toHaveBeenCalledWith(
      expect.stringMatching(/^bot-ai-/),
      'room-1',
      false,
      0,
      expect.objectContaining({ aiVsAi: true }),
    );
  });

  it('fields a full four-bot table for hearts', async () => {
    const { service, gameRoomModel, services } = buildService();
    await service.createAIvsAIRoom('user-1', { gameId: 'hearts_v1' });

    const roomArg = createdRoomArg(gameRoomModel);
    expect(roomArg.maxPlayers).toBe(4);
    expect(roomArg.participants).toHaveLength(4);
    const seatIds = new Set(roomArg.participants.map((p) => p.userId));
    expect(seatIds.size).toBe(4);
    expect(roomArg.hostId).toBe(roomArg.participants[0].userId);

    expect(services.hearts.startSession).toHaveBeenCalledWith(
      roomArg.hostId,
      'room-1',
      false,
      0,
      expect.objectContaining({ aiVsAi: true }),
    );
  });

  it('fields a full four-bot table for spades', async () => {
    const { service, gameRoomModel, services } = buildService();
    await service.createAIvsAIRoom('user-1', { gameId: 'spades_v1' });

    const roomArg = createdRoomArg(gameRoomModel);
    expect(roomArg.maxPlayers).toBe(4);
    expect(roomArg.participants).toHaveLength(4);
    const seatIds = new Set(roomArg.participants.map((p) => p.userId));
    expect(seatIds.size).toBe(4);

    expect(services.spades.startSession).toHaveBeenCalledWith(
      roomArg.hostId,
      'room-1',
      false,
      0,
      expect.objectContaining({ aiVsAi: true }),
    );
  });

  it('keeps the two-bot layout for 1v1 games', async () => {
    const { service, gameRoomModel } = buildService();
    await service.createAIvsAIRoom('user-1', { gameId: 'checkers_v1' });

    const roomArg = createdRoomArg(gameRoomModel);
    expect(roomArg.maxPlayers).toBe(2);
    expect(roomArg.participants).toHaveLength(2);
  });
});
