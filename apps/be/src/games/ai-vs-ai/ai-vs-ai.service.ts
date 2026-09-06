import { randomBytes } from 'crypto';
import {
  BadRequestException,
  Injectable,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { GameRoom } from '../schemas/game-room.schema';
import { GameRoomsMapper } from '../rooms/game-rooms.mapper';
import type { GameRoomSummary } from '../rooms/game-rooms.types';
import { GamesRealtimeService } from '../games.realtime.service';
import { OCI_CONNECTION } from '../../common/providers/mongo-connections.provider';
import {
  AI_VS_AI_DEFAULT_DELAY_MS,
  AI_VS_AI_DELAYS_MS,
} from '../common/ai-vs-ai';
import { ChessService } from '../chess/chess.service';
import { CheckersService } from '../checkers/checkers.service';
import { TicTacToeService } from '../tic-tac-toe/tic-tac-toe.service';
import { CascadeService } from '../cascade/cascade.service';
import { CatDashService } from '../cat-dash/cat-dash.service';
import { SeaBattleService } from '../sea-battle/sea-battle.service';
import { CriticalService } from '../critical/critical.service';
import { BackgammonService } from '../backgammon/backgammon.service';
import { HeartsService } from '../hearts/hearts.service';
import { SpadesService } from '../spades/spades.service';
import { GoService } from '../go/go.service';
import { PachisiService } from '../pachisi/pachisi.service';
import { GameEngineRegistry } from '../engines/registry/game-engine.registry';
import { BOT_PERSONALITIES } from '@arcadeum/games-core/games/chess/chess-bot-personalities';

const AI_VS_AI_ROOM_NAME = 'AI vs AI';

type AiVsAiStartFn = (
  botHostId: string,
  roomId: string,
  extras: Record<string, unknown>,
) => Promise<unknown>;

/**
 * Creates and auto-starts "AI vs AI" rooms: expert bots play each other
 * in a public room that anyone can spectate. The requesting user is the
 * room creator (a spectator) — no human is a participant.
 *
 * Supported games are defined by exactly one thing: the {@link startFns} map.
 * To add a game, add its entry here AND mirror the gameId into
 * `AI_VS_AI_SUPPORTED_GAME_IDS` on the web (`features/games/lib/aiVsAi.ts`) so
 * the landing-page CTA renders — see the `/new-game` skill checklist.
 *
 * Seat count comes from the game engine's metadata: 1v1 games keep the classic
 * two-bot layout while full-table games like Hearts field all four seats.
 */
@Injectable()
export class AiVsAiService {
  private readonly logger = new Logger(AiVsAiService.name);
  private readonly startFns: Record<string, AiVsAiStartFn>;

  constructor(
    @InjectModel(GameRoom.name, OCI_CONNECTION)
    private readonly gameRoomModel: Model<GameRoom>,
    private readonly gameRoomsMapper: GameRoomsMapper,
    private readonly realtimeService: GamesRealtimeService,
    private readonly chessService: ChessService,
    private readonly checkersService: CheckersService,
    private readonly ticTacToeService: TicTacToeService,
    private readonly cascadeService: CascadeService,
    private readonly catDashService: CatDashService,
    @Inject(forwardRef(() => SeaBattleService))
    private readonly seaBattleService: SeaBattleService,
    @Inject(forwardRef(() => CriticalService))
    private readonly criticalService: CriticalService,
    @Inject(forwardRef(() => BackgammonService))
    private readonly backgammonService: BackgammonService,
    @Inject(forwardRef(() => HeartsService))
    private readonly heartsService: HeartsService,
    @Inject(forwardRef(() => SpadesService))
    private readonly spadesService: SpadesService,
    @Inject(forwardRef(() => GoService))
    private readonly goService: GoService,
    @Inject(forwardRef(() => PachisiService))
    private readonly pachisiService: PachisiService,
    private readonly engineRegistry: GameEngineRegistry,
  ) {
    this.startFns = {
      chess_v1: (hostId, roomId, extras) =>
        this.chessService.startSession(hostId, roomId, false, 0, {
          ...extras,
          botDifficulty: 'expert',
          // Pass per-color personalities from gameOptions
          botPersonality:
            (extras as Record<string, unknown>).botPersonalityWhite as string,
        }),
      checkers_v1: (hostId, roomId, extras) =>
        this.checkersService.startSession(hostId, roomId, false, 0, extras),
      tic_tac_toe_v1: (hostId, roomId, extras) =>
        this.ticTacToeService.startSession(hostId, roomId, false, 0, extras),
      cascade_v1: (hostId, roomId, extras) =>
        this.cascadeService.startSession(hostId, roomId, false, 0, extras),
      cat_dash_v1: (hostId, roomId, extras) =>
        this.catDashService.startSession(hostId, roomId, false, 0, extras),
      sea_battle_v1: (hostId, roomId, extras) =>
        this.seaBattleService.startSession(hostId, roomId, false, 0, {
          ...extras,
          difficulty: 'expert',
        }),
      critical_v1: (hostId, roomId, extras) =>
        this.criticalService.startSession(
          hostId,
          roomId,
          false,
          0,
          undefined,
          extras,
        ),
      backgammon_v1: (hostId, roomId, extras) =>
        this.backgammonService.startSession(hostId, roomId, false, 0, extras),
      hearts_v1: (hostId, roomId, extras) =>
        this.heartsService.startSession(hostId, roomId, false, 0, extras),
      spades_v1: (hostId, roomId, extras) =>
        this.spadesService.startSession(hostId, roomId, false, 0, extras),
      go_v1: (hostId, roomId, extras) =>
        this.goService.startSession(hostId, roomId, false, 0, extras),
      pachisi_v1: (hostId, roomId, extras) =>
        this.pachisiService.startSession(hostId, roomId, false, 0, extras),
    };
  }

  async createAIvsAIRoom(
    userId: string,
    dto: {
      gameId: string;
      variant?: string;
      theme?: string;
      aiMoveDelayMs?: number;
      botPersonalityWhite?: string;
      botPersonalityBlack?: string;
    },
  ): Promise<GameRoomSummary> {
    const startGame = this.startFns[dto.gameId];
    if (!startGame) {
      throw new BadRequestException(
        `AI vs AI is not supported for game: ${dto.gameId}`,
      );
    }

    const aiMoveDelayMs = this.resolveDelay(dto.aiMoveDelayMs);

    // Resolve bot personalities — pick random if not specified
    const whitePersonality = dto.botPersonalityWhite ?? this.randomPersonality();
    const blackPersonality = dto.botPersonalityBlack ?? this.randomPersonality();

    const { minPlayers } = this.engineRegistry.getMetadata(dto.gameId);
    const seatCount = Math.max(2, minPlayers);
    const botIds = Array.from(
      { length: seatCount },
      () => `bot-ai-${randomBytes(5).toString('hex')}`,
    );
    const now = new Date();

    const gameOptions: Record<string, unknown> = {
      aiVsAi: true,
      aiMoveDelayMs,
      botDifficulty: 'expert',
      aiDifficulty: 'expert',
      botPersonalityWhite,
      botPersonalityBlack,
      ...(dto.variant ? { variant: dto.variant } : {}),
      theme: dto.theme || 'adventure',
    };

    const category = this.engineRegistry.getMetadata(dto.gameId).category;

    const room = await this.gameRoomModel.create({
      gameId: dto.gameId,
      category,
      name: AI_VS_AI_ROOM_NAME,
      hostId: botIds[0],
      visibility: 'public',
      maxPlayers: seatCount,
      participants: botIds.map((userId) => ({ userId, joinedAt: now })),
      status: 'lobby',
      gameOptions,
      createdAt: now,
      updatedAt: now,
    });

    const summary = await this.gameRoomsMapper.prepareRoomSummary(room, userId);
    this.realtimeService.emitRoomCreated(summary);

    await this.startAiSession(
      room._id.toString(),
      startGame,
      botIds[0],
      aiMoveDelayMs,
    );

    return summary;
  }

  private resolveDelay(delay?: number): (typeof AI_VS_AI_DELAYS_MS)[number] {
    if (
      delay !== undefined &&
      (AI_VS_AI_DELAYS_MS as readonly number[]).includes(delay)
    ) {
      return delay as (typeof AI_VS_AI_DELAYS_MS)[number];
    }
    return AI_VS_AI_DEFAULT_DELAY_MS;
  }

  private randomPersonality(): string {
    const idx = Math.floor(Math.random() * BOT_PERSONALITIES.length);
    return BOT_PERSONALITIES[idx].id;
  }

  private async startAiSession(
    roomId: string,
    startGame: AiVsAiStartFn,
    botHostId: string,
    aiMoveDelayMs: number,
  ): Promise<void> {
    const extras = { aiVsAi: true, aiMoveDelayMs };
    try {
      await startGame(botHostId, roomId, extras);
    } catch (error) {
      this.logger.error(
        `AI vs AI session start failed for room ${roomId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      throw error;
    }
  }
}
