import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
  forwardRef,
} from '@nestjs/common';
import { GameRoomsService } from '../rooms/game-rooms.service';
import {
  GameSessionsService,
  type GameSessionSummary,
} from '../sessions/game-sessions.service';
import { GameHistoryService } from '../history/game-history.service';
import { GamesRealtimeService } from '../games.realtime.service';
import type { StartGameSessionResult } from '../games.types';
import {
  DEFAULT_OPTIONS,
  MAX_PLAYERS,
  MIN_PLAYERS,
  MODES,
  type Mode,
  type Variant,
} from '../engines/cascade/cascade.constants';
import type {
  CascadeOptions,
  NameColorPayload,
  PlayCardPayload,
} from '../engines/cascade/cascade.types';
import { CascadeBotService } from './cascade-bot.service';

const WATCHDOG_INTERVAL_MS = 10000;
const WATCHDOG_STALE_THRESHOLD_MS = 20000;

@Injectable()
export class CascadeService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CascadeService.name);
  private watchdogInterval: NodeJS.Timeout | null = null;
  /** Per-room mutex to serialize action execution and prevent TOCTOU races. */
  private readonly roomLocks = new Map<string, Promise<void>>();

  constructor(
    private readonly roomsService: GameRoomsService,
    private readonly sessionsService: GameSessionsService,
    private readonly historyService: GameHistoryService,
    private readonly realtimeService: GamesRealtimeService,
    @Inject(forwardRef(() => CascadeBotService))
    private readonly botService: CascadeBotService,
  ) {}

  onModuleInit() {
    this.watchdogInterval = setInterval(() => {
      void this.runWatchdog();
    }, WATCHDOG_INTERVAL_MS);
  }

  onModuleDestroy() {
    if (this.watchdogInterval) {
      clearInterval(this.watchdogInterval);
      this.watchdogInterval = null;
    }
  }

  async findSessionByRoom(roomId: string) {
    const session = await this.sessionsService.findSessionByRoom(roomId);
    if (!session) return null;
    return this.afterSessionStep(session);
  }

  async startSession(
    userId: string,
    roomId: string,
    withBots?: boolean,
    botCount?: number,
  ): Promise<StartGameSessionResult> {
    const room = await this.roomsService.getRoom(roomId, userId);
    if (room.hostId !== userId) {
      throw new Error('Only the host can start the game');
    }

    const options = this.resolveOptions(room.gameOptions);
    const participants = await this.roomsService.getRoomParticipants(roomId);
    const playerIds = [...participants];

    if (withBots || playerIds.length === 1) {
      const desiredCount =
        botCount !== undefined ? botCount : Math.max(0, 2 - playerIds.length);
      const cap = Math.min(MAX_PLAYERS - playerIds.length, desiredCount);
      for (let i = 0; i < cap; i++) {
        playerIds.push(`bot-${Math.random().toString(36).slice(2, 10)}`);
      }
    }

    if (playerIds.length < MIN_PLAYERS) {
      throw new Error('Not enough players to start Cascade (minimum 2)');
    }
    if (playerIds.length > MAX_PLAYERS) {
      throw new Error(`Cascade supports up to ${MAX_PLAYERS} players.`);
    }

    const session = await this.sessionsService.createSession({
      roomId,
      gameId: 'cascade_v1',
      playerIds,
      config: { options },
    });

    await this.roomsService.updateRoomStatus(roomId, 'in_progress');
    await this.realtimeService.emitGameStarted(
      room,
      session,
      async (s, pId) => {
        const sanitized = await this.sessionsService.getSanitizedStateForPlayer(
          s.id,
          pId,
        );
        if (sanitized && typeof sanitized === 'object') {
          return { ...s, state: sanitized as Record<string, unknown> };
        }
        return s;
      },
    );

    const updatedSession = await this.afterSessionStep(session);
    return { room, session: updatedSession };
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

  async forfeit(userId: string, roomId: string) {
    return this.runAction(userId, roomId, 'forfeit', {});
  }

  private async runAction(
    userId: string,
    roomId: string,
    action: string,
    payload: unknown,
  ) {
    // Serialize all actions per room to prevent race conditions (e.g. two
    // concurrent call_cascade requests both passing validation on the same
    // snapshot).
    const prev = this.roomLocks.get(roomId) ?? Promise.resolve();
    let release: () => void;
    const next = new Promise<void>((resolve) => {
      release = resolve;
    });
    this.roomLocks.set(roomId, next);
    await prev;

    try {
      const session = await this.sessionsService.findSessionByRoom(roomId);
      if (!session) throw new Error('Session not found');

      const updatedSession = await this.sessionsService.executeAction({
        sessionId: session.id,
        userId,
        action,
        payload,
      });

      await this.afterSessionStep(updatedSession);
      await this.emitSessionUpdate(updatedSession);
      return updatedSession;
    } finally {
      release!();
      if (this.roomLocks.get(roomId) === next) {
        this.roomLocks.delete(roomId);
      }
    }
  }

  private async afterSessionStep(session: GameSessionSummary) {
    if (session.status === 'completed') {
      await this.roomsService.updateRoomStatus(session.roomId, 'completed');
    } else {
      this.botService.checkAndPlay(session).catch((err: unknown) => {
        const message = err instanceof Error ? err.message : String(err);
        this.logger.error(
          `Bot turn failed for room ${session.roomId}: ${message}`,
        );
      });
    }
    return session;
  }

  private async emitSessionUpdate(session: GameSessionSummary) {
    await this.realtimeService.emitSessionSnapshot(
      session.roomId,
      session,
      (s, pId) => {
        const sanitized = this.sessionsService.sanitizeSummaryForPlayer(s, pId);
        if (sanitized && typeof sanitized === 'object') {
          return Promise.resolve({
            ...s,
            state: sanitized as Record<string, unknown>,
          });
        }
        return Promise.resolve(s);
      },
    );
  }

  private async runWatchdog() {
    try {
      const stale = await this.sessionsService.findStaleActiveSessions(
        'cascade_v1',
        WATCHDOG_STALE_THRESHOLD_MS,
        100,
      );
      for (const session of stale) {
        this.botService
          .checkAndPlay(session)
          .catch((err) =>
            this.logger.error(
              `Watchdog trigger failed for room ${session.roomId}: ${err}`,
            ),
          );
      }
    } catch (err) {
      this.logger.error(`Watchdog failed: ${err}`);
    }
  }

  private resolveOptions(raw: unknown): CascadeOptions {
    const r = (raw ?? {}) as Partial<{
      variant: string;
      mode: string;
      stackingEnabled: boolean;
      lastCardCallEnabled: boolean;
    }>;
    const isValidMode = (m: unknown): m is Mode =>
      typeof m === 'string' && (MODES as ReadonlyArray<string>).includes(m);
    const mode: Mode = isValidMode(r.mode) ? r.mode : DEFAULT_OPTIONS.mode;
    // Mode determines stacking; the lobby option is informational only.
    return {
      variant: (r.variant as Variant) ?? DEFAULT_OPTIONS.variant,
      mode,
      stackingEnabled: mode !== 'pure',
      lastCardCallEnabled:
        typeof r.lastCardCallEnabled === 'boolean'
          ? r.lastCardCallEnabled
          : DEFAULT_OPTIONS.lastCardCallEnabled,
    };
  }
}
