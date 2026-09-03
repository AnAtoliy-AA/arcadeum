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
  MAX_PLAYERS,
  MIN_PLAYERS,
  MODES,
  type Mode,
} from '../engines/cascade/cascade.constants';
import type {
  CascadeOptions,
  NameColorPayload,
  PlayCardPayload,
} from '../engines/cascade/cascade.types';
import { CascadeBotService } from './cascade-bot.service';
import { isAiDifficulty } from '../ai-difficulty';
import { BaseGameService } from '../common/base-game.service';

@Injectable()
export class CascadeService extends BaseGameService<CascadeOptions> {
  protected readonly logger = new Logger(CascadeService.name);
  readonly gameId = 'cascade_v1';
  readonly gameName = 'Cascade';
  readonly minPlayers = MIN_PLAYERS;
  readonly maxPlayers = MAX_PLAYERS;

  constructor(
    roomsService: GameRoomsService,
    sessionsService: GameSessionsService,
    realtimeService: GamesRealtimeService,
    @Inject(forwardRef(() => CascadeBotService))
    botService: CascadeBotService,
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

  async playCard(userId: string, roomId: string, payload: PlayCardPayload) {
    return this.runAction(userId, roomId, 'play_card', payload);
  }

  async draw(userId: string, roomId: string) {
    return this.runAction(userId, roomId, 'draw', {});
  }

  async nameColor(userId: string, roomId: string, payload: NameColorPayload) {
    return this.runAction(userId, roomId, 'name_color', payload);
  }

  async callCascade(userId: string, roomId: string) {
    return this.runAction(userId, roomId, 'call_cascade', {});
  }

  protected resolveOptions(raw: unknown): CascadeOptions {
    const r = (raw ?? {}) as Partial<{
      theme: string;
      variant: string;
      mode: string;
      stackingEnabled: boolean;
      lastCardCallEnabled: boolean;
      aiDifficulty: string;
    }>;
    const isValidMode = (m: unknown): m is Mode =>
      typeof m === 'string' && (MODES as ReadonlyArray<string>).includes(m);
    const mode: Mode = isValidMode(r.mode) ? r.mode : DEFAULT_OPTIONS.mode;
    return {
      theme: r.theme ?? r.variant ?? DEFAULT_OPTIONS.theme,
      mode,
      stackingEnabled: mode !== 'pure',
      lastCardCallEnabled:
        typeof r.lastCardCallEnabled === 'boolean'
          ? r.lastCardCallEnabled
          : DEFAULT_OPTIONS.lastCardCallEnabled,
      aiDifficulty: isAiDifficulty(r.aiDifficulty)
        ? r.aiDifficulty
        : DEFAULT_OPTIONS.aiDifficulty,
    };
  }
}
