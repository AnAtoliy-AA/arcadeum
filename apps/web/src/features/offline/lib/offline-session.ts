import type {
  BaseGameState,
  GameActionContext,
  IGameEngine,
} from '@arcadeum/games-core';
import type { GameSessionSummary } from '@/shared/types/games';
import { offlineBusEmit } from './offline-bus';

/** Delay between bot moves so offline play feels like a real opponent. */
const BOT_THINK_MS = 450;

interface OfflineSessionOptions {
  roomId: string;
  engineId: string;
  engine: IGameEngine;
  humanId: string;
}

export class OfflineSession {
  readonly roomId: string;
  readonly engineId: string;
  readonly engine: IGameEngine;
  readonly humanId: string;
  status: GameSessionSummary['status'] = 'waiting';
  state: BaseGameState | null = null;

  constructor(opts: OfflineSessionOptions) {
    this.roomId = opts.roomId;
    this.engineId = opts.engineId;
    this.engine = opts.engine;
    this.humanId = opts.humanId;
  }

  start(playerIds: string[], config?: Record<string, unknown>): void {
    this.state = this.engine.initializeState(playerIds, config);
    this.status = 'active';
    this.publishStarted();
    void this.runBots();
  }

  context(userId: string): GameActionContext {
    return {
      userId,
      roomId: this.roomId,
      sessionId: this.roomId,
      timestamp: new Date(),
    };
  }

  applyAction(
    userId: string,
    action: string,
    payload?: unknown,
  ): { ok: boolean; error?: string } {
    if (!this.state || this.status !== 'active') {
      return { ok: false, error: 'No active offline game' };
    }
    const context = this.context(userId);
    let state = this.state;
    try {
      state = this.engine.normalizeState?.(state) ?? state;
      if (!this.engine.validateAction(state, action, context, payload)) {
        return { ok: false, error: `Invalid action: ${action}` };
      }
      const result = this.engine.executeAction(state, action, context, payload);
      if (!result.success || !result.state) {
        return { ok: false, error: result.error ?? 'Action failed' };
      }
      this.state = result.state;
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
    this.publishSnapshot();
    return { ok: true };
  }

  isGameOver(): boolean {
    if (!this.state || this.status !== 'active') return false;
    try {
      return this.engine.isGameOver(this.state);
    } catch {
      return false;
    }
  }

  currentTurnPlayerId(): string | null {
    const state = this.state as {
      playerOrder?: string[];
      currentPlayerIndex?: number;
      currentTurnIndex?: number;
      players?: Array<{ playerId: string; color?: string }>;
      currentTurnColor?: string;
    } | null;
    if (!state) return null;
    if (typeof state.currentTurnIndex === 'number' && state.playerOrder) {
      return state.playerOrder[state.currentTurnIndex] ?? null;
    }
    if (state.currentTurnColor && state.players) {
      return (
        state.players.find((p) => p.color === state.currentTurnColor)
          ?.playerId ?? null
      );
    }
    if (typeof state.currentPlayerIndex === 'number' && state.players) {
      return state.players[state.currentPlayerIndex]?.playerId ?? null;
    }
    return null;
  }

  /** Run bot turns until it's the human's turn again or the game ends. */
  async runBots(): Promise<void> {
    while (this.status === 'active' && this.state && !this.isGameOver()) {
      const turnId = this.currentTurnPlayerId();
      if (!turnId || !turnId.startsWith('bot-')) break;
      await sleep(BOT_THINK_MS);
      if (this.status !== 'active' || !this.state) break;
      // Re-check whose turn it is after the delay.
      if (this.currentTurnPlayerId() !== turnId) continue;
      const entry = registryEntryFor(this.engineId);
      const decision = await entry?.botDecide(this.state, this.engine, turnId);
      if (!decision) break;
      const res = this.applyAction(turnId, decision.action, decision.payload);
      if (!res.ok) break;
    }
    if (this.isGameOver()) {
      this.status = 'completed';
      if (this.state) {
        try {
          this.state.gameResult = this.engine.getResult(this.state);
        } catch {
          /* getResult may throw on malformed states; leave result unset */
        }
        this.publishSnapshot();
      }
    }
  }

  toSummary(): GameSessionSummary {
    return {
      id: this.roomId,
      roomId: this.roomId,
      gameId: this.roomId.replace(/^offline_/, '').replace(/_[^_]+$/, ''),
      engine: this.engineId,
      status: this.status,
      state: (this.state ?? {}) as Record<string, unknown>,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  publishSnapshot(): void {
    offlineBusEmit('games.session.snapshot', {
      roomId: this.roomId,
      session: this.toSummary(),
    });
  }

  private publishStarted(): void {
    offlineBusEmit('games.session.started', {
      roomId: this.roomId,
      session: this.toSummary(),
    });
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Late-bound to avoid a circular import (registry imports types only).
import { OFFLINE_GAMES, type OfflineGameEntry } from './offline-registry';

function registryEntryFor(engineId: string): OfflineGameEntry | undefined {
  return OFFLINE_GAMES[engineId];
}
