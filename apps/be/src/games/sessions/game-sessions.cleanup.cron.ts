import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { GameSession } from '../schemas/game-session.schema';
import { GameRoom } from '../schemas/game-room.schema';

/** Mark sessions stale after 7 days of inactivity. */
const STALE_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class GameSessionsCleanupCron {
  private readonly logger = new Logger(GameSessionsCleanupCron.name);

  constructor(
    @InjectModel(GameSession.name)
    private readonly sessionModel: Model<GameSession>,
    @InjectModel(GameRoom.name)
    private readonly roomModel: Model<GameRoom>,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async cleanupStaleActiveSessions(): Promise<void> {
    try {
      const threshold = new Date(Date.now() - STALE_THRESHOLD_MS);

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

      if (result.modifiedCount > 0) {
        this.logger.log(
          `Marked ${result.modifiedCount} stale active session(s) as completed and stripped stateHistory/logs.`,
        );
      }
    } catch (err) {
      this.logger.warn(`Stale session cleanup cron failed: ${String(err)}`);
    }
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
      const sessionResult = await this.sessionModel.deleteMany({
        status: 'completed',
        updatedAt: { $lt: sessionThreshold },
      });

      const roomThreshold = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const roomResult = await this.roomModel.deleteMany({
        status: { $in: ['completed', 'in_progress'] },
        updatedAt: { $lt: roomThreshold },
      });

      if (sessionResult.deletedCount > 0 || roomResult.deletedCount > 0) {
        this.logger.log(
          `Daily cleanup: deleted ${sessionResult.deletedCount} old sessions, ${roomResult.deletedCount} old rooms.`,
        );
      }
    } catch (err) {
      this.logger.warn(`Old session/room deletion cron failed: ${String(err)}`);
    }
  }
}
