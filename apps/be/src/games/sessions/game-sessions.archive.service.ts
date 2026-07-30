import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GameSession } from '../schemas/game-session.schema';
import {
  OCI_CONNECTION,
  ATLAS_CONNECTION,
} from '../../common/providers/mongo-connections.provider';
import type { GameSessionSummary } from './game-sessions.service';

/**
 * Game Sessions Archive Service
 * Handles archiving sessions between OCI and Atlas
 */
@Injectable()
export class GameSessionsArchiveService {
  private readonly logger = new Logger(GameSessionsArchiveService.name);

  constructor(
    @InjectModel(GameSession.name, OCI_CONNECTION)
    private readonly ociSessionModel: Model<GameSession>,
    @InjectModel(GameSession.name, ATLAS_CONNECTION)
    private readonly atlasSessionModel: Model<GameSession>,
  ) {}

  /**
   * Archive a session to Atlas (called on exit or completion).
   * Uses upsert to handle re-archives gracefully.
   */
  async archiveSessionToAtlas(session: GameSessionSummary): Promise<void> {
    try {
      await this.atlasSessionModel.findOneAndUpdate(
        { roomId: session.roomId },
        {
          $set: {
            roomId: session.roomId,
            gameId: session.gameId,
            engine: session.engine,
            status: session.status,
            state: session.state,
            createdAt: new Date(session.createdAt),
            updatedAt: new Date(),
          },
        },
        { upsert: true },
      );
      this.logger.log(`Archived session ${session.id} to Atlas`);
    } catch (err) {
      this.logger.error(
        `Failed to archive session ${session.id} to Atlas: ${(err as Error).message}`,
      );
    }
  }

  /**
   * Delete a session from OCI (called after archiving to Atlas).
   */
  async deleteSessionFromOci(sessionId: string): Promise<void> {
    try {
      await this.ociSessionModel.deleteOne({ _id: sessionId });
      this.logger.log(`Deleted session ${sessionId} from OCI`);
    } catch (err) {
      this.logger.error(
        `Failed to delete session ${sessionId} from OCI: ${(err as Error).message}`,
      );
    }
  }

  /**
   * Load a session from Atlas to OCI (called on player rejoin).
   * Returns the loaded session summary or null if not found.
   */
  async loadSessionFromAtlas(
    roomId: string,
  ): Promise<GameSessionSummary | null> {
    try {
      const atlasSession = await this.atlasSessionModel
        .findOne({ roomId })
        .sort({ createdAt: -1 })
        .lean()
        .exec();

      if (!atlasSession) {
        return null;
      }

      // Create in OCI
      const ociSession = await this.ociSessionModel.create({
        roomId: atlasSession.roomId,
        gameId: atlasSession.gameId,
        engine: atlasSession.engine,
        state: atlasSession.state,
        status: atlasSession.status,
        createdAt: atlasSession.createdAt,
        updatedAt: new Date(),
      });

      this.logger.log(
        `Loaded session ${ociSession._id.toString()} from Atlas for room ${roomId}`,
      );

      return {
        id: ociSession._id.toString(),
        roomId: ociSession.roomId,
        gameId: ociSession.gameId,
        engine: ociSession.engine,
        status: ociSession.status,
        state: ociSession.state,
        createdAt: ociSession.createdAt.toISOString(),
        updatedAt: ociSession.updatedAt.toISOString(),
      };
    } catch (err) {
      this.logger.error(
        `Failed to load session from Atlas for room ${roomId}: ${(err as Error).message}`,
      );
      return null;
    }
  }

  /**
   * Check if a session exists in OCI.
   */
  async sessionExistsInOci(roomId: string): Promise<boolean> {
    const count = await this.ociSessionModel.countDocuments({ roomId }).exec();
    return count > 0;
  }
}
