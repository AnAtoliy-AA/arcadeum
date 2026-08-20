import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';
import { GameRoomsService } from '../rooms/game-rooms.service';
import { GameSessionsService } from '../sessions/game-sessions.service';
import { GamesRealtimeService } from '../games.realtime.service';
import {
  MIN_PLAYERS,
  MAX_PLAYERS,
} from '../engines/cat-dash/cat-dash.constants';
import { CatDashBotService } from './cat-dash-bot.service';
import { BaseGameService } from '../common/base-game.service';

@Injectable()
export class CatDashService extends BaseGameService {
  protected readonly logger = new Logger(CatDashService.name);
  readonly gameId = 'cat_dash_v1';
  readonly gameName = 'Cat Dash';
  readonly minPlayers = MIN_PLAYERS;
  readonly maxPlayers = MAX_PLAYERS;

  constructor(
    roomsService: GameRoomsService,
    sessionsService: GameSessionsService,
    realtimeService: GamesRealtimeService,
    @Inject(forwardRef(() => CatDashBotService))
    botService: CatDashBotService,
    @InjectConnection() mongoConnection: Connection,
  ) {
    super(
      roomsService,
      sessionsService,
      realtimeService,
      botService,
      mongoConnection,
    );
  }

  async rollDice(userId: string, roomId: string) {
    return this.runAction(userId, roomId, 'rollDice', {});
  }

  async useAbility(userId: string, roomId: string, abilityId: string) {
    return this.runAction(userId, roomId, 'useAbility', { abilityId });
  }

  async choosePath(userId: string, roomId: string, pathIndex: number) {
    return this.runAction(userId, roomId, 'choosePath', { pathIndex });
  }

  protected resolveOptions(raw: unknown): {
    trackType: string;
    theme: string;
  } {
    const r = (raw ?? {}) as Partial<{
      variant: string;
      trackType: string;
      theme: string;
    }>;
    return {
      trackType: r.trackType || 'linear',
      theme: r.theme || 'village',
    };
  }
}
