import {
  Injectable,
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
import { GameActionContext } from '../engines/base/game-engine.interface';

export interface GameSessionSummary {
  id: string;
  roomId: string;
  gameId: string;
  engine: string;
  status: GameSessionStatus;
  state: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSessionOptions {
  roomId: string;
  gameId: string;
  playerIds: string[];
  config?: Record<string, any>;
}

export interface UpdateSessionStateOptions {
  sessionId: string;
  state: Record<string, any>;
  status?: GameSessionStatus;
}

export interface ExecuteActionOptions {
  sessionId: string;
  action: string;
  userId: string;
  payload?: any;
}

/**
 * Game Sessions Service
 * Handles game session lifecycle and state management
 */
@Injectable()
export class GameSessionsService {
  constructor(
    @InjectModel(GameSession.name)
    private readonly gameSessionModel: Model<GameSession>,
    private readonly engineRegistry: GameEngineRegistry,
  ) {}

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
      state: initialState,
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
    const session = await this.gameSessionModel
      .findOne({ roomId })
      .sort({ createdAt: -1 })
      .exec();

    return session ? this.toSessionSummary(session) : null;
  }

  /**
   * Get session by ID
   */
  async getSession(sessionId: string): Promise<GameSessionSummary> {
    const session = await this.gameSessionModel.findById(sessionId).exec();

    if (!session) {
      throw new NotFoundException(`Session not found: ${sessionId}`);
    }

    return this.toSessionSummary(session);
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
    if (status) {
      session.status = status;
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

    const session = await this.gameSessionModel.findById(sessionId).exec();

    if (!session) {
      throw new NotFoundException(`Session not found: ${sessionId}`);
    }

    if (session.status !== 'active') {
      throw new BadRequestException('Session is not active');
    }

    // Get the game engine
    const engine = this.engineRegistry.getEngine(session.gameId);

    // Create action context
    const context: GameActionContext = {
      userId,
      roomId: session.roomId,
      sessionId: session._id.toString(),
      timestamp: new Date(),
    };

    // Validate the action
    const isValid = engine.validateAction(
      session.state as any,
      action,
      context,
      payload,
    );

    if (!isValid) {
      throw new BadRequestException('Invalid action');
    }

    // Execute the action
    const result = engine.executeAction(
      session.state as any,
      action,
      context,
      payload,
    );

    if (!result.success) {
      throw new BadRequestException(result.error || 'Action failed');
    }

    // Update session with new state
    if (result.state) {
      session.state = result.state as any;
    }

    // Check if game is over
    if (engine.isGameOver(result.state as any)) {
      session.status = 'completed';
    }

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
  ): Promise<any> {
    const session = await this.gameSessionModel.findById(sessionId).exec();

    if (!session) {
      throw new NotFoundException(`Session not found: ${sessionId}`);
    }

    const engine = this.engineRegistry.getEngine(session.gameId);

    return engine.sanitizeStateForPlayer(session.state as any, playerId);
  }

  /**
   * Get available actions for a player
   */
  async getAvailableActions(
    sessionId: string,
    playerId: string,
  ): Promise<string[]> {
    const session = await this.gameSessionModel.findById(sessionId).exec();

    if (!session) {
      throw new NotFoundException(`Session not found: ${sessionId}`);
    }

    const engine = this.engineRegistry.getEngine(session.gameId);

    return engine.getAvailableActions(session.state as any, playerId);
  }

  /**
   * Check if game is over
   */
  async isGameOver(sessionId: string): Promise<boolean> {
    const session = await this.gameSessionModel.findById(sessionId).exec();

    if (!session) {
      throw new NotFoundException(`Session not found: ${sessionId}`);
    }

    const engine = this.engineRegistry.getEngine(session.gameId);

    return engine.isGameOver(session.state as any);
  }

  /**
   * Get winners if game is over
   */
  async getWinners(sessionId: string): Promise<string[]> {
    const session = await this.gameSessionModel.findById(sessionId).exec();

    if (!session) {
      throw new NotFoundException(`Session not found: ${sessionId}`);
    }

    const engine = this.engineRegistry.getEngine(session.gameId);

    return engine.getWinners(session.state as any);
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
      throw new BadRequestException('This game does not support removing players');
    }

    const result = engine.removePlayer(session.state as any, playerId);

    if (!result.success) {
      throw new BadRequestException(result.error || 'Failed to remove player');
    }

    if (result.state) {
      session.state = result.state as any;
    }
    session.updatedAt = new Date();

    // Check if game is over after player removal
    if (engine.isGameOver(result.state as any)) {
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
