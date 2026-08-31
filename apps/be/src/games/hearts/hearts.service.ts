import { Inject, Injectable, Logger, Optional, forwardRef } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';
import type Redis from 'ioredis';
import { GameRoomsService } from '../rooms/game-rooms.service';
import { GameSessionsService } from '../sessions/game-sessions.service';
import { GamesRealtimeService } from '../games.realtime.service';
import {
  DEFAULT_OPTIONS,
  MAX_PLAYERS,
  MIN_PLAYERS,
} from '../engines/hearts/hearts.constants';
import type { HeartsOptions } from '../engines/hearts/hearts.constants';
import type {
  PassCardsPayload,
  PlayCardPayload,
} from '../engines/hearts/hearts.types';
import { HeartsBotService } from './hearts-bot.service';
import { isAiDifficulty } from '../ai-difficulty';
import { BaseGameService } from '../common/base-game.service';

@Injectable()
export class HeartsService extends BaseGameService<HeartsOptions> {
  protected readonly logger = new Logger(HeartsService.name);
  readonly gameId = 'hearts_v1';
  readonly gameName = 'Hearts';
  readonly minPlayers = MIN_PLAYERS;
  readonly maxPlayers = MAX_PLAYERS;

  constructor(
    roomsService: GameRoomsService,
    sessionsService: GameSessionsService,
    realtimeService: GamesRealtimeService,
    @Inject(forwardRef(() => HeartsBotService))
    botService: HeartsBotService,
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

  async passCards(userId: string, roomId: string, payload: PassCardsPayload) {
    return this.runAction(userId, roomId, 'pass_cards', payload);
  }

  async playCard(userId: string, roomId: string, payload: PlayCardPayload) {
    return this.runAction(userId, roomId, 'play_card', payload);
  }

  protected getMaxPlayersForOptions(_options: HeartsOptions): number {
    return MAX_PLAYERS;
  }

  protected resolveOptions(raw: unknown): HeartsOptions {
    const r = (raw ?? {}) as Partial<{
      passingEnabled: boolean;
      targetScore: number;
      aiDifficulty: string;
    }>;
    return {
      passingEnabled:
        typeof r.passingEnabled === 'boolean'
          ? r.passingEnabled
          : DEFAULT_OPTIONS.passingEnabled,
      targetScore:
        r.targetScore === 50 || r.targetScore === 100
          ? r.targetScore
          : DEFAULT_OPTIONS.targetScore,
      aiDifficulty: isAiDifficulty(r.aiDifficulty)
        ? r.aiDifficulty
        : DEFAULT_OPTIONS.aiDifficulty,
    };
  }
}
