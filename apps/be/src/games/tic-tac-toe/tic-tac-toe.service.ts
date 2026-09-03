import {
  Inject,
  Injectable,
  Logger,
  Optional,
  forwardRef,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';
import type Redis from 'ioredis';
import { GameRoomsService } from '../rooms/game-rooms.service';
import { GameSessionsService } from '../sessions/game-sessions.service';
import { GamesRealtimeService } from '../games.realtime.service';
import {
  DEFAULT_OPTIONS,
  MAX_PLAYERS_BY_BOARD_SIZE,
  MIN_PLAYERS,
  type BoardSize,
} from '../engines/tic-tac-toe/tic-tac-toe.constants';
import type {
  PlaceMarkPayload,
  TicTacToeOptions,
  TicTacToeState,
} from '../engines/tic-tac-toe/tic-tac-toe.types';
import { TicTacToeBotService } from './tic-tac-toe-bot.service';
import { isAiDifficulty } from '../ai-difficulty';
import { BaseGameService } from '../common/base-game.service';

@Injectable()
export class TicTacToeService extends BaseGameService<TicTacToeOptions> {
  protected readonly logger = new Logger(TicTacToeService.name);
  readonly gameId = 'tic_tac_toe_v1';
  readonly gameName = 'Tic-Tac-Toe';
  readonly minPlayers = MIN_PLAYERS;
  readonly maxPlayers = 5;

  constructor(
    roomsService: GameRoomsService,
    sessionsService: GameSessionsService,
    realtimeService: GamesRealtimeService,
    @Inject(forwardRef(() => TicTacToeBotService))
    botService: TicTacToeBotService,
    @InjectConnection() mongoConnection: Connection,
    @Optional() @Inject('REDIS_CLIENT') redis?: Redis | null,
  ) {
    super(
      roomsService,
      sessionsService,
      realtimeService,
      botService,
      mongoConnection,
      undefined,
      redis,
    );
  }

  async placeMark(userId: string, roomId: string, payload: PlaceMarkPayload) {
    return this.runAction(userId, roomId, 'place_mark', payload);
  }

  protected getMaxPlayersForOptions(options: TicTacToeOptions): number {
    const boardSize = options.boardSize;
    return MAX_PLAYERS_BY_BOARD_SIZE[boardSize] ?? this.maxPlayers;
  }

  protected resolveOptions(raw: unknown): TicTacToeOptions {
    const r = (raw ?? {}) as Partial<{
      theme: string;
      variant: string;
      boardSize: number | string;
      teamMode: boolean;
      expansionMargin: number;
      infinityWinLength: number;
      aiDifficulty: string;
    }>;
    const allowedSizes: number[] = [3, 5, 7, 9];
    const rawSize = r.boardSize;
    let boardSize: BoardSize;
    if (rawSize === 'infinity') {
      boardSize = 'infinity';
    } else {
      const numSize: number =
        Number(rawSize) || (DEFAULT_OPTIONS.boardSize as number);
      boardSize = (
        allowedSizes.includes(numSize) ? numSize : DEFAULT_OPTIONS.boardSize
      ) as BoardSize;
    }
    const isMargin = (n: number | undefined): n is 1 | 2 | 3 =>
      n === 1 || n === 2 || n === 3;
    const isWinLen = (n: number | undefined): n is 4 | 5 => n === 4 || n === 5;
    return {
      theme: ((r.theme ?? r.variant) as string) ?? DEFAULT_OPTIONS.theme,
      boardSize,
      teamMode: !!r.teamMode,
      expansionMargin: isMargin(r.expansionMargin)
        ? r.expansionMargin
        : DEFAULT_OPTIONS.expansionMargin,
      infinityWinLength: isWinLen(r.infinityWinLength)
        ? r.infinityWinLength
        : DEFAULT_OPTIONS.infinityWinLength,
      aiDifficulty: isAiDifficulty(r.aiDifficulty)
        ? r.aiDifficulty
        : DEFAULT_OPTIONS.aiDifficulty,
    };
  }
}

void ({} as TicTacToeState);
