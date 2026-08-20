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
  AI_VS_AI_GAME_IDS,
} from '../common/ai-vs-ai';
import { ChessService } from '../chess/chess.service';
import { CheckersService } from '../checkers/checkers.service';
import { TicTacToeService } from '../tic-tac-toe/tic-tac-toe.service';
import { CascadeService } from '../cascade/cascade.service';
import { CatDashService } from '../cat-dash/cat-dash.service';
import { SeaBattleService } from '../sea-battle/sea-battle.service';
import { CriticalService } from '../critical/critical.service';

const AI_VS_AI_ROOM_NAME = 'AI vs AI';

/**
 * Creates and auto-starts "AI vs AI" rooms: two expert bots play each other
 * in a public room that anyone can spectate. The requesting user is the
 * room creator (a spectator) — no human is a participant.
 */
@Injectable()
export class AiVsAiService {
  private readonly logger = new Logger(AiVsAiService.name);

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
  ) {}

  async createAIvsAIRoom(
    userId: string,
    dto: {
      gameId: string;
      variant?: string;
      theme?: string;
      aiMoveDelayMs?: number;
    },
  ): Promise<GameRoomSummary> {
    if (
      !AI_VS_AI_GAME_IDS.includes(
        dto.gameId as (typeof AI_VS_AI_GAME_IDS)[number],
      )
    ) {
      throw new BadRequestException(
        `AI vs AI is not supported for game: ${dto.gameId}`,
      );
    }

    const aiMoveDelayMs = this.resolveDelay(dto.aiMoveDelayMs);
    const botA = `bot-ai-${randomBytes(5).toString('hex')}`;
    const botB = `bot-ai-${randomBytes(5).toString('hex')}`;
    const now = new Date();

    const gameOptions: Record<string, unknown> = {
      aiVsAi: true,
      aiMoveDelayMs,
      botDifficulty: 'expert',
      aiDifficulty: 'expert',
      ...(dto.variant ? { variant: dto.variant } : {}),
      theme: dto.theme || 'adventure',
    };

    const room = await this.gameRoomModel.create({
      gameId: dto.gameId,
      name: AI_VS_AI_ROOM_NAME,
      hostId: botA,
      visibility: 'public',
      maxPlayers: 2,
      participants: [
        { userId: botA, joinedAt: now },
        { userId: botB, joinedAt: now },
      ],
      status: 'lobby',
      gameOptions,
      createdAt: now,
      updatedAt: now,
    });

    const summary = await this.gameRoomsMapper.prepareRoomSummary(room, userId);
    this.realtimeService.emitRoomCreated(summary);

    await this.startAiSession(
      room._id.toString(),
      dto.gameId,
      botA,
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

  private async startAiSession(
    roomId: string,
    gameId: string,
    botHostId: string,
    aiMoveDelayMs: number,
  ): Promise<void> {
    const extras = { aiVsAi: true, aiMoveDelayMs };
    try {
      switch (gameId) {
        case 'chess_v1':
          await this.chessService.startSession(botHostId, roomId, false, 0, {
            ...extras,
            botDifficulty: 'expert',
          });
          break;
        case 'checkers_v1':
          await this.checkersService.startSession(
            botHostId,
            roomId,
            false,
            0,
            extras,
          );
          break;
        case 'tic_tac_toe_v1':
          await this.ticTacToeService.startSession(
            botHostId,
            roomId,
            false,
            0,
            extras,
          );
          break;
        case 'cascade_v1':
          await this.cascadeService.startSession(
            botHostId,
            roomId,
            false,
            0,
            extras,
          );
          break;
        case 'cat_dash_v1':
          await this.catDashService.startSession(
            botHostId,
            roomId,
            false,
            0,
            extras,
          );
          break;
        case 'sea_battle_v1':
          await this.seaBattleService.startSession(
            botHostId,
            roomId,
            false,
            0,
            {
              ...extras,
              difficulty: 'expert',
            },
          );
          break;
        case 'critical_v1':
          await this.criticalService.startSession(
            botHostId,
            roomId,
            false,
            0,
            undefined,
            extras,
          );
          break;
        default:
          throw new BadRequestException(
            `AI vs AI is not supported for game: ${gameId}`,
          );
      }
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
