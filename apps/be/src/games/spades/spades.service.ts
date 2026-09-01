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
} from '../engines/spades/spades.constants';
import type { SpadesOptions } from '../engines/spades/spades.constants';
import type {
  BidPayload,
  PlayCardPayload,
} from '../engines/spades/spades.types';
import { SpadesBotService } from './spades-bot.service';
import { isAiDifficulty } from '../ai-difficulty';
import { BaseGameService } from '../common/base-game.service';

@Injectable()
export class SpadesService extends BaseGameService<SpadesOptions> {
  protected readonly logger = new Logger(SpadesService.name);
  readonly gameId = 'spades_v1';
  readonly gameName = 'Spades';
  readonly minPlayers = MIN_PLAYERS;
  readonly maxPlayers = MAX_PLAYERS;

  constructor(
    roomsService: GameRoomsService,
    sessionsService: GameSessionsService,
    realtimeService: GamesRealtimeService,
    @Inject(forwardRef(() => SpadesBotService))
    botService: SpadesBotService,
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

  async bid(userId: string, roomId: string, payload: BidPayload) {
    return this.runAction(userId, roomId, 'bid', payload);
  }

  async playCard(userId: string, roomId: string, payload: PlayCardPayload) {
    return this.runAction(userId, roomId, 'play_card', payload);
  }

  protected getMaxPlayersForOptions(_options: SpadesOptions): number {
    return MAX_PLAYERS;
  }

  protected resolveOptions(raw: unknown): SpadesOptions {
    const r = (raw ?? {}) as Partial<{
      nilEnabled: boolean;
      targetScore: number;
      aiDifficulty: string;
    }>;
    return {
      nilEnabled:
        typeof r.nilEnabled === 'boolean'
          ? r.nilEnabled
          : DEFAULT_OPTIONS.nilEnabled,
      targetScore:
        r.targetScore === 300 || r.targetScore === 500
          ? r.targetScore
          : DEFAULT_OPTIONS.targetScore,
      aiDifficulty: isAiDifficulty(r.aiDifficulty)
        ? r.aiDifficulty
        : DEFAULT_OPTIONS.aiDifficulty,
    };
  }
}
