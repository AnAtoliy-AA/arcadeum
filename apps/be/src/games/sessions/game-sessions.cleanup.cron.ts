import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model, Types } from 'mongoose';
import { GameSession } from '../schemas/game-session.schema';
import { GameRoom } from '../schemas/game-room.schema';
import { OCI_CONNECTION } from '../../common/providers/mongo-connections.provider';
import { GameSessionsArchiveService } from './game-sessions.archive.service';

/** Mark sessions stale after 30 days of inactivity. */
const STALE_THRESHOLD_MS = 30 * 24 * 60 * 60 * 1000;

/** Archive batch size — bounded so we never materialize the whole collection. */
const ARCHIVE_BATCH_SIZE = 50;

@Injectable()
export class GameSessionsCleanupCron {
  private readonly logger = new Logger(GameSessionsCleanupCron.name);

  constructor(
    @InjectModel(GameSession.name, OCI_CONNECTION)
    private readonly sessionModel: Model<GameSession>,
    @InjectModel(GameRoom.name, OCI_CONNECTION)
    private readonly roomModel: Model<GameRoom>,
    private readonly archiveService: GameSessionsArchiveService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async cleanupStaleActiveSessions(): Promise<void> {
    try {
      const threshold = new Date(Date.now() - STALE_THRESHOLD_MS);

      const archivedCount = await this.archiveInBatches({
        status: 'active',
        updatedAt: { $lt: threshold },
      });

      const result = await this.sessionModel.updateMany(
        {
          status: 'active',
          updatedAt: { $lt: threshold },
        },
        {
          $set: { status: 'completed' },
          $unset: { 'state.stateHistory': 1, 'state.logs': 1 },
        },
      );

      if (result.modifiedCount > 0 || archivedCount > 0) {
        this.logger.log(
          `Archived ${archivedCount} and marked ${result.modifiedCount} stale active session(s) as completed.`,
        );
      }
    } catch (err) {
      this.logger.warn(`Stale session cleanup cron failed: ${String(err)}`);
    }
  }

  /**
   * Archive sessions matching `filter` in bounded batches, walking by `_id`
   * keyset so each pass reads only one batch instead of the full result set.
   * Archiving within a batch runs concurrently.
   */
  private async archiveInBatches(
    filter: Record<string, unknown>,
  ): Promise<number> {
    let archived = 0;
    let lastId: Types.ObjectId | undefined;
    for (;;) {
      const batchFilter: Record<string, unknown> = { ...filter };
      if (lastId) batchFilter._id = { $gt: lastId };
      const batch = await this.sessionModel
        .find(batchFilter)
        .sort({ _id: 1 })
        .limit(ARCHIVE_BATCH_SIZE)
        .lean()
        .exec();
      if (batch.length === 0) break;
      await Promise.all(
        batch.map((session) =>
          this.archiveService.archiveSessionToAtlas({
            id: session._id.toString(),
            roomId: session.roomId,
            gameId: session.gameId,
            engine: session.engine,
            status: session.status === 'active' ? 'completed' : session.status,
            state: session.state,
            createdAt:
              session.createdAt instanceof Date
                ? session.createdAt.toISOString()
                : new Date(session.createdAt).toISOString(),
            updatedAt: new Date().toISOString(),
          }),
        ),
      );
      lastId = batch[batch.length - 1]._id;
      archived += batch.length;
    }
    return archived;
  }

  @Cron(CronExpression.EVERY_HOUR)
  async cleanupStaleLobbyRooms(): Promise<void> {
    try {
      const threshold = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const result = await this.roomModel.deleteMany({
        status: 'lobby',
        createdAt: { $lt: threshold },
      });

      if (result.deletedCount > 0) {
        this.logger.log(
          `Deleted ${result.deletedCount} stale lobby room(s) older than 7 days.`,
        );
      }
    } catch (err) {
      this.logger.warn(`Stale lobby room cleanup cron failed: ${String(err)}`);
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async stripBloatedSessions(): Promise<void> {
    try {
      const result = await this.sessionModel.updateMany(
        {
          status: 'active',
          'state.stateHistory': { $exists: true, $not: { $size: 0 } },
        },
        {
          $unset: { 'state.stateHistory': 1 },
        },
      );

      if (result.modifiedCount > 0) {
        this.logger.log(
          `Stripped stateHistory from ${result.modifiedCount} bloated session(s).`,
        );
      }
    } catch (err) {
      this.logger.warn(`Bloated session strip cron failed: ${String(err)}`);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async deleteOldCompletedSessions(): Promise<void> {
    try {
      const sessionThreshold = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

      const archivedCount = await this.archiveInBatches({
        status: 'completed',
        updatedAt: { $lt: sessionThreshold },
      });

      const sessionResult = await this.sessionModel.deleteMany({
        status: 'completed',
        updatedAt: { $lt: sessionThreshold },
      });

      const roomThreshold = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const roomResult = await this.roomModel.deleteMany({
        status: { $in: ['completed', 'in_progress'] },
        updatedAt: { $lt: roomThreshold },
      });

      if (
        sessionResult.deletedCount > 0 ||
        roomResult.deletedCount > 0 ||
        archivedCount > 0
      ) {
        this.logger.log(
          `Daily cleanup: archived ${archivedCount}, deleted ${sessionResult.deletedCount} old sessions, ${roomResult.deletedCount} old rooms.`,
        );
      }
    } catch (err) {
      this.logger.warn(`Old session/room deletion cron failed: ${String(err)}`);
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async stripLogsFromCompletedSessions(): Promise<void> {
    try {
      const result = await this.sessionModel.updateMany(
        {
          status: 'completed',
          'state.logs': { $exists: true, $not: { $size: 0 } },
        },
        {
          $unset: { 'state.logs': 1, 'state.stateHistory': 1 },
        },
      );

      if (result.modifiedCount > 0) {
        this.logger.log(
          `Stripped logs from ${result.modifiedCount} completed session(s).`,
        );
      }
    } catch (err) {
      this.logger.warn(
        `Completed session log strip cron failed: ${String(err)}`,
      );
    }
  }
}
