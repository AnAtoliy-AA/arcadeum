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

export interface GameSessionSummary {
  id: string;
  roomId: string;
  gameId: string;
  engine: string;
  status: GameSessionStatus;
  state: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSessionOptions {
  roomId: string;
  gameId: string;
  playerIds: string[];
  config?: Record<string, unknown>;
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
/** Max session document size in bytes. Typical: 2-13KB. Alert at 100KB, strip at 500KB. */
const WARN_DOC_SIZE_BYTES = 100 * 1024;
const STRIP_DOC_SIZE_BYTES = 500 * 1024;

@Injectable()
export class GameSessionsService {
  private readonly logger = new Logger(GameSessionsService.name);
  private readonly sessionLocks = new Map<string, Promise<void>>();

  constructor(
    @InjectModel(GameSession.name)
    private readonly gameSessionModel: Model<GameSession>,
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
    const { roomId, gameId, playerIds, config } = options;

    // Get the game engine
    const engine = this.engineRegistry.getEngine(gameId);

    // Initialize game state using the engine
    const initialState = engine.initializeState(playerIds, config);

    // Create session document
    const session = await this.gameSessionModel.create({
      roomId,
      gameId,
      engine: gameId, // Engine identifier
      state: initialState as unknown as Record<string, unknown>,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.toSessionSummary(session);
  }

  /**
   * Find session by room ID
   */
  async findSessionByRoom(roomId: string): Promise<GameSessionSummary | null> {
    if (typeof roomId !== 'string') {
      return null;
    }
    const safeRoomId = String(roomId);
    const session = await this.gameSessionModel
      .findOne({ roomId: safeRoomId })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return session
      ? this.toSessionSummary(session as unknown as GameSession)
      : null;
  }

  /**
   * Find active sessions for a specific game that haven't been updated for a while
   */
  async findStaleActiveSessions(
    gameId: string,
    staleThresholdMs: number,
    limit: number = 100,
  ): Promise<GameSessionSummary[]> {
    const thresholdDate = new Date(Date.now() - staleThresholdMs);
    const sessions = await this.gameSessionModel
      .find({
        gameId,
        status: 'active',
        updatedAt: { $lt: thresholdDate },
      })
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
    const session = await this.gameSessionModel
      .findById(sessionId)
      .lean()
      .exec();

    if (!session) {
      throw new NotFoundException(`Session not found: ${sessionId}`);
    }

    return this.toSessionSummary(session as unknown as GameSession);
  }

  /**
   * Update session state
   */
  async updateSessionState(
    options: UpdateSessionStateOptions,
  ): Promise<GameSessionSummary> {
    const { sessionId, state, status } = options;

    const session = await this.gameSessionModel.findById(sessionId).exec();

    if (!session) {
      throw new NotFoundException(`Session not found: ${sessionId}`);
    }

    session.state = state;
    session.markModified('state');
    if (status) {
      session.status = status;
    }

    // Safety valve: strip stateHistory if document is approaching BSON limit
    const approxSize = Buffer.byteLength(
      JSON.stringify(session.state),
      'utf-8',
    );
    if (approxSize > STRIP_DOC_SIZE_BYTES) {
      this.logger.warn(
        `Session ${sessionId} state is ${Math.round(approxSize / 1024)}KB — stripping stateHistory and logs.`,
      );
      const s = session.state;
      if (Array.isArray(s.stateHistory)) s.stateHistory = [];
      if (Array.isArray(s.logs)) s.logs = s.logs.slice(-20);
      session.markModified('state');
    } else if (approxSize > WARN_DOC_SIZE_BYTES) {
      this.logger.warn(
        `Session ${sessionId} state is ${Math.round(approxSize / 1024)}KB — approaching size limit.`,
      );
    }

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
      const session = await this.gameSessionModel.findById(sessionId).exec();

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
        ) as unknown as Record<string, unknown>;
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
        session.state = result.state as unknown as Record<string, unknown>;
        session.markModified('state');
      }

      // Check if game is over
      if (engine.isGameOver(result.state as unknown as BaseGameState)) {
        session.status = 'completed';
        (result.state as unknown as BaseGameState).gameResult =
          engine.getResult(result.state as unknown as BaseGameState);
      }

      // Safety valve: strip stateHistory if document is approaching BSON limit
      const approxSize = Buffer.byteLength(
        JSON.stringify(session.state),
        'utf-8',
      );
      if (approxSize > STRIP_DOC_SIZE_BYTES) {
        this.logger.warn(
          `Session ${sessionId} state is ${Math.round(approxSize / 1024)}KB — stripping stateHistory and logs.`,
        );
        const s = session.state;
        if (Array.isArray(s.stateHistory)) s.stateHistory = [];
        if (Array.isArray(s.logs)) s.logs = s.logs.slice(-20);
        session.markModified('state');
      } else if (approxSize > WARN_DOC_SIZE_BYTES) {
        this.logger.warn(
          `Session ${sessionId} state is ${Math.round(approxSize / 1024)}KB — approaching size limit.`,
        );
      }

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
    const session = await this.gameSessionModel.findById(sessionId).exec();
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
    const session = await this.gameSessionModel
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
    const session = await this.gameSessionModel
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
    const session = await this.gameSessionModel
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
    const session = await this.gameSessionModel
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
    const session = await this.gameSessionModel.findById(sessionId).exec();

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
      session.state = result.state as unknown as Record<string, unknown>;
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
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
    };
  }
}
