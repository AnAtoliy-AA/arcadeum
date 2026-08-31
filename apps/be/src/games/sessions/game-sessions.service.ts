import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  GameSession,
  type GameSessionStatus,
} from '../schemas/game-session.schema';
import { GameEngineRegistry } from '../engines/registry/game-engine.registry';
import {
  GameActionContext,
  BaseGameState,
} from '../engines/base/game-engine.interface';
import { OCI_CONNECTION } from '../../common/providers/mongo-connections.provider';
import { enforceStateSizeLimit } from './game-sessions.size-check';

export interface GameSessionSummary {
  id: string;
  roomId: string;
  gameId: string;
  engine: string;
  status: GameSessionStatus;
  state: Record<string, unknown>;
  options?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSessionOptions {
  roomId: string;
  gameId: string;
  playerIds: string[];
  config?: Record<string, unknown>;
  options?: Record<string, unknown>;
}

export interface UpdateSessionStateOptions {
  sessionId: string;
  state: Record<string, unknown>;
  status?: GameSessionStatus;
}

export interface ExecuteActionOptions {
  sessionId: string;
  action: string;
  userId: string;
  payload?: unknown;
}

/**
 * Game Sessions Service
 * Handles game session lifecycle and state management
 */

@Injectable()
export class GameSessionsService {
  private readonly logger = new Logger(GameSessionsService.name);
  private readonly sessionLocks = new Map<string, Promise<void>>();

  constructor(
    @InjectModel(GameSession.name, OCI_CONNECTION)
    private readonly ociSessionModel: Model<GameSession>,
    private readonly engineRegistry: GameEngineRegistry,
  ) {}

  private async acquireSessionLock(sessionId: string): Promise<() => void> {
    let release: () => void;
    const prev = this.sessionLocks.get(sessionId) ?? Promise.resolve();
    const next = new Promise<void>((resolve) => {
      release = () => {
        resolve();
        this.sessionLocks.delete(sessionId);
      };
    });
    this.sessionLocks.set(sessionId, next);
    await prev;
    return release!;
  }

  /**
   * Create a new game session
   */
  async createSession(
    options: CreateSessionOptions,
  ): Promise<GameSessionSummary> {
    const {
      roomId,
      gameId,
      playerIds,
      config,
      options: sessionOptions,
    } = options;
    const engine = this.engineRegistry.getEngine(gameId);
    const initialState = engine.initializeState(playerIds, config);
    const session = await this.ociSessionModel.create({
      roomId,
      gameId,
      engine: gameId, // Engine identifier
      state: initialState as unknown as Record<string, unknown>,
      options: sessionOptions,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.toSessionSummary(session);
  }

  async findSessionByRoom(roomId: string): Promise<GameSessionSummary | null> {
    if (typeof roomId !== 'string') return null;
    const session = await this.ociSessionModel
      .findOne({ roomId: String(roomId) })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    return session
      ? this.toSessionSummary(session as unknown as GameSession)
      : null;
  }

  async findStaleActiveSessions(
    gameId: string,
    staleThresholdMs: number,
    limit: number = 100,
    maxAgeMs?: number,
  ): Promise<GameSessionSummary[]> {
    const filter: Record<string, unknown> = {
      gameId,
      status: 'active',
      updatedAt: { $lt: new Date(Date.now() - staleThresholdMs) },
    };
    if (maxAgeMs) {
      filter.updatedAt = {
        $lt: new Date(Date.now() - staleThresholdMs),
        $gt: new Date(Date.now() - maxAgeMs),
      };
    }
    const sessions = await this.ociSessionModel
      .find(filter)
      .limit(limit)
      .lean()
      .exec();
    return sessions.map((s) =>
      this.toSessionSummary(s as unknown as GameSession),
    );
  }

  /**
   * Get session by ID
   */
  async getSession(sessionId: string): Promise<GameSessionSummary> {
    const session = await this.ociSessionModel
      .findById(sessionId)
      .lean()
      .exec();
    if (!session)
      throw new NotFoundException(`Session not found: ${sessionId}`);
    return this.toSessionSummary(session as unknown as GameSession);
  }

  async updateSessionState(
    options: UpdateSessionStateOptions,
  ): Promise<GameSessionSummary> {
    const { sessionId, state, status } = options;
    const session = await this.ociSessionModel.findById(sessionId).exec();
    if (!session)
      throw new NotFoundException(`Session not found: ${sessionId}`);
    session.state = state;
    session.markModified('state');
    if (status) session.status = status;
    enforceStateSizeLimit(session, sessionId, this.logger);
    session.updatedAt = new Date();
    await session.save();
    return this.toSessionSummary(session);
  }

  async pushChatLog(
    roomId: string,
    userId: string,
    message: string,
    scope: string,
    senderName?: string,
  ): Promise<GameSessionSummary | null> {
    const session = await this.ociSessionModel
      .findOne({ roomId })
      .sort({ createdAt: -1 })
      .exec();
    if (!session) return null;
    const state = session.state;
    if (!Array.isArray(state.logs)) state.logs = [];
    (state.logs as Array<Record<string, unknown>>).push({
      id: globalThis.crypto.randomUUID().slice(0, 12),
      type: 'message',
      message,
      createdAt: new Date().toISOString(),
      scope,
      senderId: userId,
      senderName: senderName ?? null,
    });
    session.markModified('state');
    session.updatedAt = new Date();
    await session.save();
    return this.toSessionSummary(session);
  }

  async deleteChatLog(
    roomId: string,
    callerId: string,
    messageId: string,
  ): Promise<GameSessionSummary | null> {
    const session = await this.ociSessionModel
      .findOne({ roomId })
      .sort({ createdAt: -1 })
      .exec();
    if (!session) return null;
    const state = session.state;
    const logs = state.logs as Array<Record<string, unknown>> | undefined;
    if (!Array.isArray(logs)) return null;
    const target = logs.find((l) => l.id === messageId);
    if (!target) return null;
    const isHost =
      Array.isArray(state.playerOrder) && state.playerOrder[0] === callerId;
    if (!isHost && target.senderId !== callerId) return null;
    state.logs = logs.filter((l) => l.id !== messageId);
    session.markModified('state');
    session.updatedAt = new Date();
    await session.save();
    return this.toSessionSummary(session);
  }

  /**
   * Execute a player action using the game engine
   */
  async executeAction(
    options: ExecuteActionOptions,
  ): Promise<GameSessionSummary> {
    const { sessionId, action, userId, payload } = options;

    const release = await this.acquireSessionLock(sessionId);
    try {
      const session = await this.ociSessionModel.findById(sessionId).exec();

      if (!session) {
        throw new NotFoundException(`Session not found: ${sessionId}`);
      }

      if (session.status !== 'active') {
        throw new BadRequestException('Session is not active');
      }

      // Get the game engine
      const engine = this.engineRegistry.getEngine(session.gameId);

      // Self-heal any drifted state before validation/execution. Engines opt in
      // via the optional normalizeState hook; must be idempotent.
      if (engine.normalizeState) {
        session.state = engine.normalizeState(
          session.state as unknown as BaseGameState,
        );
        session.markModified('state');
      }

      // Create action context
      const context: GameActionContext = {
        userId,
        roomId: session.roomId,
        sessionId: session._id.toString(),
        timestamp: new Date(),
      };

      // Execute the action (engines validate internally and return errorResult
      // with the actual error message on failure).
      const result = engine.executeAction(
        session.state as unknown as BaseGameState,
        action,
        context,
        payload,
      );

      if (!result.success) {
        throw new BadRequestException(result.error || 'Invalid action');
      }

      // Update session with new state
      if (result.state) {
        session.state = result.state;
        session.markModified('state');
      }

      // Check if game is over
      if (engine.isGameOver(result.state as unknown as BaseGameState)) {
        session.status = 'completed';
        (result.state as unknown as BaseGameState).gameResult =
          engine.getResult(result.state as unknown as BaseGameState);
      }

      // Safety valve: strip stateHistory if document is approaching BSON limit
      enforceStateSizeLimit(session, sessionId, this.logger);

      session.updatedAt = new Date();

      await session.save();

      return this.toSessionSummary(session);
    } finally {
      release();
    }
  }

  /**
   * Revert session state to the previous snapshot (undo).
   * Returns the updated session or null if no history exists.
   */
  async revertToPreviousState(
    sessionId: string,
  ): Promise<GameSessionSummary | null> {
    const session = await this.ociSessionModel.findById(sessionId).exec();
    if (!session) return null;
    const state = session.state;
    const history = state.stateHistory as unknown[] | undefined;
    if (!history || history.length === 0) return null;
    const previousState = history[history.length - 1];
    state.stateHistory = history.slice(0, -1);
    session.state = previousState as Record<string, unknown>;
    session.markModified('state');
    session.updatedAt = new Date();
    await session.save();
    return this.toSessionSummary(session);
  }

  /**
   * Get sanitized state for a specific player
   */
  async getSanitizedStateForPlayer(
    sessionId: string,
    playerId: string,
  ): Promise<unknown> {
    const session = await this.ociSessionModel
      .findById(sessionId)
      .select('gameId state')
      .lean()
      .exec();

    if (!session) {
      throw new NotFoundException(`Session not found: ${sessionId}`);
    }

    const engine = this.engineRegistry.getEngine(session.gameId);

    return engine.sanitizeStateForPlayer(
      session.state as unknown as BaseGameState,
      playerId,
    );
  }

  /**
   * Sanitize an already-loaded session summary for a specific player without
   * an extra DB read. Use during broadcast paths where the freshly-saved
   * session is in hand.
   */
  sanitizeSummaryForPlayer(
    session: GameSessionSummary,
    playerId: string,
  ): unknown {
    const engine = this.engineRegistry.getEngine(session.gameId);
    return engine.sanitizeStateForPlayer(
      session.state as unknown as BaseGameState,
      playerId,
    );
  }

  /**
   * Get available actions for a player
   */
  async getAvailableActions(
    sessionId: string,
    playerId: string,
  ): Promise<string[]> {
    const session = await this.ociSessionModel
      .findById(sessionId)
      .select('gameId state')
      .lean()
      .exec();

    if (!session) {
      throw new NotFoundException(`Session not found: ${sessionId}`);
    }

    const engine = this.engineRegistry.getEngine(session.gameId);

    return engine.getAvailableActions(
      session.state as unknown as BaseGameState,
      playerId,
    );
  }

  /**
   * Check if game is over
   */
  async isGameOver(sessionId: string): Promise<boolean> {
    const session = await this.ociSessionModel
      .findById(sessionId)
      .select('gameId state')
      .lean()
      .exec();

    if (!session) {
      throw new NotFoundException(`Session not found: ${sessionId}`);
    }

    const engine = this.engineRegistry.getEngine(session.gameId);

    return engine.isGameOver(session.state as unknown as BaseGameState);
  }

  /**
   * Get winners if game is over
   */
  async getWinners(sessionId: string): Promise<string[]> {
    const session = await this.ociSessionModel
      .findById(sessionId)
      .select('gameId state')
      .lean()
      .exec();

    if (!session) {
      throw new NotFoundException(`Session not found: ${sessionId}`);
    }

    const engine = this.engineRegistry.getEngine(session.gameId);

    return engine.getWinners(session.state as unknown as BaseGameState);
  }

  /**
   * Remove a player from the session
   */
  async removePlayer(
    sessionId: string,
    playerId: string,
  ): Promise<GameSessionSummary> {
    const session = await this.ociSessionModel.findById(sessionId).exec();

    if (!session) {
      throw new NotFoundException(`Session not found: ${sessionId}`);
    }

    const engine = this.engineRegistry.getEngine(session.gameId);

    if (!engine.removePlayer) {
      throw new BadRequestException(
        'This game does not support removing players',
      );
    }

    const result = engine.removePlayer(
      session.state as unknown as BaseGameState,
      playerId,
    );

    if (!result.success) {
      throw new BadRequestException(result.error || 'Failed to remove player');
    }

    if (result.state) {
      session.state = result.state;
      session.markModified('state');
    }
    session.updatedAt = new Date();

    // Check if game is over after player removal
    if (engine.isGameOver(result.state as unknown as BaseGameState)) {
      session.status = 'completed';
    }

    await session.save();

    return this.toSessionSummary(session);
  }

  // ========== Private Helper Methods ==========

  private toSessionSummary(session: GameSession): GameSessionSummary {
    return {
      id: session._id.toString(),
      roomId: session.roomId,
      gameId: session.gameId,
      engine: session.engine,
      status: session.status,
      state: session.state,
      options: session.options,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
    };
  }
}
