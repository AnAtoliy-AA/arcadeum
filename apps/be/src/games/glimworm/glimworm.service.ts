import { Injectable, Logger, OnModuleDestroy, Optional } from '@nestjs/common';
import {
  GLIMWORM_BASE_SPEED,
  GLIMWORM_COUNTDOWN_MS,
  GLIMWORM_INPUT_RATE_LIMIT_HZ,
  GLIMWORM_TICK_MS,
} from './glimworm.constants';
import { GlimwormStateStore } from './glimworm.state';
import { GlimwormBotService } from './glimworm-bot.service';
import { GamesRealtimeService } from '../games.realtime.service';
import { getPowerup } from './powerups/powerup.def';
// Importing power-ups for side-effect registration in the registry.
import './powerups/speed.powerup';
import './powerups/shield.powerup';
import './powerups/ghost.powerup';
import './powerups/shrink.powerup';
import {
  createVariantStrategy,
  type VariantStrategy,
} from './variants/variant.strategy';
import {
  buildSnapshotForViewer,
  fillWithBots,
  nextFreeColor,
  type RandomFn,
} from './glimworm.service.tick';
import {
  resetWormsForLobby,
  runGameTick,
  seedWormSpawns,
} from './glimworm.service.lifecycle';
import type {
  GlimwormDiscreteEvent,
  GlimwormInputPayload,
  GlimwormSession,
  GlimwormVariant,
  Worm,
  WormId,
} from './glimworm.types';

export interface GlimwormStartOpts {
  variant: GlimwormVariant;
  powerupsEnabled: boolean;
  fillWithBots?: boolean;
  /**
   * Desired bot count when `fillWithBots` is true. Bots are added on top of
   * the existing players (humans + already-joined bots) up to this many bots
   * total. Clamped to [1, MAX_WORMS - 1]. Defaults to enough bots to reach
   * the legacy SOLO_FILL_TARGET (3) of total worms.
   */
  botCount?: number;
}

const MAX_WORMS = 10;
const INPUT_MIN_INTERVAL_MS = 1000 / GLIMWORM_INPUT_RATE_LIMIT_HZ;

@Injectable()
export class GlimwormService implements OnModuleDestroy {
  private readonly logger = new Logger(GlimwormService.name);
  private readonly tickIntervals = new Map<string, NodeJS.Timeout>();
  private readonly strategies = new Map<string, VariantStrategy>();
  private readonly growthTargets = new Map<string, Map<WormId, number>>();
  private readonly random: RandomFn;

  constructor(
    private readonly stateStore: GlimwormStateStore,
    private readonly realtimeService: GamesRealtimeService,
    private readonly botService: GlimwormBotService,
    @Optional() random?: RandomFn,
  ) {
    this.random = random ?? Math.random;
  }

  /** Minimum total worms required to start. Used when filling with bots. */
  private static readonly SOLO_FILL_TARGET = 3;

  onModuleDestroy(): void {
    for (const [, timer] of this.tickIntervals) {
      clearInterval(timer);
    }
    this.tickIntervals.clear();
  }

  // ========== Lobby / lifecycle ==========

  joinRoom(roomId: string, userId: string, color?: string): Worm {
    let session = this.stateStore.get(roomId);
    if (!session) {
      session = this.stateStore.create({
        roomId,
        hostUserId: userId,
        variant: 'battle_royale',
        powerupsEnabled: true,
      });
    }

    if (Object.keys(session.worms).length >= MAX_WORMS) {
      throw new Error('Room full');
    }
    if (session.worms[userId]) {
      // Idempotent rejoin: clear disconnected flag if set.
      const existing = session.worms[userId];
      existing.disconnected = false;
      delete existing.disconnectedAt;
      this.emitSnapshots(session);
      return existing;
    }

    const pickedColor = nextFreeColor(session, color);
    const worm: Worm = {
      id: userId,
      color: pickedColor,
      segments: [],
      heading: 0,
      speed: GLIMWORM_BASE_SPEED,
      alive: true,
      livesLeft: 1,
      score: 0,
      ready: false,
      activePowerup: null,
      inventoryPowerup: null,
    };
    session.worms[userId] = worm;
    // Push a lobby snapshot so every player's lobby UI sees the new worm
    // (and which colors are now taken).
    this.emitSnapshots(session);
    return worm;
  }

  leaveRoom(roomId: string, userId: string): void {
    const session = this.stateStore.get(roomId);
    if (!session) return;
    const worm = session.worms[userId];
    if (!worm) return;

    if (session.status === 'lobby' || session.status === 'ended') {
      delete session.worms[userId];
      delete session.lastInputAt[userId];
      delete session.damageTickAt[userId];
      this.emitSnapshots(session);
      return;
    }

    // playing | countdown — keep worm during grace, freeze heading
    worm.disconnected = true;
    worm.disconnectedAt = Date.now();
  }

  markReady(roomId: string, userId: string, ready: boolean): void {
    const session = this.stateStore.get(roomId);
    if (!session) throw new Error('No session for room');
    const worm = session.worms[userId];
    if (!worm) throw new Error('No worm for user');
    worm.ready = ready;
    this.emitSnapshots(session);
  }

  start(roomId: string, hostUserId: string, opts: GlimwormStartOpts): void {
    // Lazy-create the session if no auto-join reached the BE yet.
    // The caller becomes the host of the new in-memory session.
    let session = this.stateStore.get(roomId);
    if (!session) {
      this.joinRoom(roomId, hostUserId);
      session = this.stateStore.get(roomId);
      if (!session) throw new Error('No session for room');
    }
    if (session.hostUserId !== hostUserId) {
      throw new Error('Only host can start');
    }
    // Ensure the host is registered as a worm.
    if (!session.worms[hostUserId]) {
      this.joinRoom(roomId, hostUserId);
    }

    if (opts.fillWithBots) {
      const humans = Object.values(session.worms).filter(
        (w) => !w.isBot,
      ).length;
      // Caller-requested bot count, clamped. With no botCount, fall back to
      // SOLO_FILL_TARGET (3 total worms — 1 human + 2 bots).
      const requested =
        typeof opts.botCount === 'number' && Number.isFinite(opts.botCount)
          ? Math.max(1, Math.min(MAX_WORMS - humans, Math.floor(opts.botCount)))
          : Math.max(1, GlimwormService.SOLO_FILL_TARGET - humans);
      fillWithBots(session, humans + requested);
    }

    // Host clicking Start commits the current roster to playing — auto-ready
    // everyone so we don't need a separate per-player Ready handshake (which
    // ReusableGameLobby doesn't surface).
    for (const w of Object.values(session.worms)) {
      w.ready = true;
    }

    const totalWorms = Object.keys(session.worms).length;
    if (totalWorms < 2) {
      throw new Error(
        `Need at least 2 players (have ${totalWorms}); add a guest or start with bots.`,
      );
    }

    session.variant = opts.variant;
    session.powerupsEnabled = opts.powerupsEnabled;
    // Snapshot the opts so rematch() can replay them.
    session.lastStartOpts = {
      variant: opts.variant,
      powerupsEnabled: opts.powerupsEnabled,
      fillWithBots: opts.fillWithBots,
      botCount: opts.botCount,
    };
    seedWormSpawns(session, this.random);

    const strategy = createVariantStrategy(opts.variant);
    session.startedAt = Date.now();
    strategy.initSession(session);
    this.strategies.set(roomId, strategy);
    this.growthTargets.set(roomId, new Map<WormId, number>());

    session.status = 'countdown';

    this.emitEvents(roomId, [
      {
        type: 'round_started',
        tickNum: session.tickNum,
        serverTime: session.startedAt,
      },
    ]);

    this.startTickLoop(roomId);
  }

  // ========== Gameplay ==========

  submitInput(
    roomId: string,
    userId: string,
    payload: GlimwormInputPayload,
  ): void {
    const session = this.stateStore.get(roomId);
    if (!session) throw new Error('No session for room');
    const worm = session.worms[userId];
    if (!worm) throw new Error('No worm for user');

    if (typeof payload.angle !== 'number' || Number.isNaN(payload.angle)) {
      throw new Error('Invalid angle');
    }
    let angle = payload.angle;
    if (!Number.isFinite(angle)) {
      throw new Error('Invalid angle');
    }
    if (angle < -Math.PI) angle = -Math.PI;
    if (angle > Math.PI) angle = Math.PI;

    const now = Date.now();
    const last = session.lastInputAt[userId] ?? 0;
    if (now - last < INPUT_MIN_INTERVAL_MS) {
      // Rate-limited; silently drop.
      return;
    }

    worm.heading = angle;
    session.lastInputAt[userId] = now;

    if (payload.usePowerup && worm.inventoryPowerup) {
      const kind = worm.inventoryPowerup;
      const def = getPowerup(kind);
      def.apply(worm, session, now);
      worm.inventoryPowerup = null;
      this.emitEvents(roomId, [
        {
          type: 'powerup_used',
          wormId: worm.id,
          kind,
          tickNum: session.tickNum,
        },
      ]);
    }
  }

  setColor(roomId: string, userId: string, color: string): string {
    const session = this.stateStore.get(roomId);
    if (!session) throw new Error('No session for room');
    const worm = session.worms[userId];
    if (!worm) throw new Error('No worm for user');
    // Exclude this worm from the "used" set so it can re-pick its own color
    // (otherwise nextFreeColor would see worm.color as taken and reassign).
    const picked = nextFreeColor(session, color, worm.id);
    if (picked !== worm.color) {
      worm.color = picked;
      // Broadcast so every player's lobby sees who claimed which color.
      this.emitSnapshots(session);
    }
    return picked;
  }

  /**
   * One-click rematch: reset the session and immediately start a new round
   * with the same options the host picked last time (variant, power-ups,
   * fillWithBots/botCount). Falls back to plain restart if no prior opts
   * are remembered.
   */
  rematch(roomId: string, hostUserId: string): void {
    const session = this.stateStore.get(roomId);
    if (!session) throw new Error('No session for room');
    if (session.hostUserId !== hostUserId) {
      throw new Error('Only host can rematch');
    }
    const opts = session.lastStartOpts;
    this.restart(roomId, hostUserId);
    if (opts) {
      this.start(roomId, hostUserId, {
        variant: opts.variant,
        powerupsEnabled: opts.powerupsEnabled,
        fillWithBots: opts.fillWithBots,
        botCount: opts.botCount,
      });
    }
  }

  /**
   * Reset the session back to lobby state without removing players. The host
   * can then call `start()` again. Bots remain in the session.
   */
  restart(roomId: string, hostUserId: string): void {
    const session = this.stateStore.get(roomId);
    if (!session) throw new Error('No session for room');
    if (session.hostUserId !== hostUserId) {
      throw new Error('Only host can restart');
    }
    this.stopTickLoop(roomId);
    this.strategies.delete(roomId);
    this.growthTargets.delete(roomId);

    session.status = 'lobby';
    session.startedAt = null;
    session.endsAt = null;
    session.winner = null;
    session.tickNum = 0;
    session.food = [];
    session.powerups = [];
    session.lastInputAt = {};
    session.damageTickAt = {};
    session.lastPowerupSpawnAt = 0;
    delete session.arena.safeZone;

    resetWormsForLobby(session);

    // Push a fresh snapshot so clients see the lobby state.
    this.emitSnapshots(session);
  }

  endSession(roomId: string, winner: WormId | null): void {
    const session = this.stateStore.get(roomId);
    if (!session) return;
    session.status = 'ended';
    session.winner = winner;

    const scoreboard = Object.values(session.worms)
      .map((w) => ({ id: w.id, score: w.score }))
      .sort((a, b) => b.score - a.score);

    this.emitEvents(roomId, [
      {
        type: 'round_ended',
        winner,
        scoreboard,
        tickNum: session.tickNum,
      },
    ]);

    this.stopTickLoop(roomId);
  }

  // ========== Tick orchestration ==========

  private startTickLoop(roomId: string): void {
    if (this.tickIntervals.has(roomId)) return;
    // Schedule the countdown→playing transition. Until then the tick loop
    // emits snapshots without running the simulation.
    setTimeout(() => {
      const session = this.stateStore.get(roomId);
      if (session && session.status === 'countdown') {
        session.status = 'playing';
      }
    }, GLIMWORM_COUNTDOWN_MS);

    const timer = setInterval(() => {
      try {
        this.tick(roomId);
      } catch (err) {
        this.logger.error(
          `Tick failed for room ${roomId}: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }, GLIMWORM_TICK_MS);
    this.tickIntervals.set(roomId, timer);
  }

  private stopTickLoop(roomId: string): void {
    const timer = this.tickIntervals.get(roomId);
    if (timer) {
      clearInterval(timer);
      this.tickIntervals.delete(roomId);
    }
  }

  tick(roomId: string): void {
    const session = this.stateStore.get(roomId);
    if (!session) return;

    let growthTargets = this.growthTargets.get(roomId);
    if (!growthTargets) {
      growthTargets = new Map<WormId, number>();
      this.growthTargets.set(roomId, growthTargets);
    }

    const result = runGameTick({
      session,
      growthTargets,
      strategy: this.strategies.get(roomId),
      random: this.random,
      pickBotAngle: (s, w) => this.botService.pickAngle(s, w),
      emitEvents: (events) => this.emitEvents(roomId, events),
      emitSnapshots: (s) => this.emitSnapshots(s),
    });

    if (result.ended) {
      this.endSession(roomId, result.winner);
    }
  }

  private emitSnapshots(session: GlimwormSession): void {
    const now = Date.now();
    for (const viewer of Object.values(session.worms)) {
      const snapshot = buildSnapshotForViewer(session, viewer.id, now);
      // Personalised snapshot — fire-and-forget; failures are logged.
      void this.realtimeService
        .emitToClientInRoom(
          session.roomId,
          viewer.id,
          'glimworm.snapshot',
          snapshot,
        )
        .catch((err: unknown) => {
          this.logger.warn(
            `Snapshot emit failed for ${viewer.id} in ${session.roomId}: ${err instanceof Error ? err.message : String(err)}`,
          );
        });
    }
  }

  private emitEvents(roomId: string, events: GlimwormDiscreteEvent[]): void {
    for (const evt of events) {
      this.realtimeService.emitToRoom(roomId, 'glimworm.event', evt);
    }
  }
}
