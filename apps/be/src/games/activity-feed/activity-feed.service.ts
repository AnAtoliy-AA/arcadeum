import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ActivityFeedItem,
  ActivityFeedItemDocument,
  ActivityFeedType,
} from './activity-feed.schema';
import { OCI_CONNECTION } from '../../common/providers/mongo-connections.provider';
import { User } from '../../auth/schemas/user.schema';
import {
  collectUserIds,
  FEED_USER_PROJECTION,
  type FeedUserRecord,
} from './activity-feed.actors';
import {
  filterQuery,
  referencedIds,
  toFeedItemDto,
  type StoredFeedItem,
} from './activity-feed.mapper';
import {
  buildMatchEvent,
  isStreakMilestone,
  type MatchEventInput,
} from './activity-feed.match';
import type {
  ActivityFeedFilter,
  ActivityFeedPageDto,
} from './activity-feed.types';

export interface CreateActivityEvent {
  type: ActivityFeedType;
  userId: string;
  gameId?: string;
  detail?: string;
  metadata?: Record<string, unknown>;
}

export interface GetFeedOptions {
  limit?: number;
  before?: string;
  filter?: ActivityFeedFilter;
  gameId?: string;
}

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

@Injectable()
export class ActivityFeedService {
  private readonly logger = new Logger(ActivityFeedService.name);

  constructor(
    @InjectModel(ActivityFeedItem.name, OCI_CONNECTION)
    private readonly feedModel: Model<ActivityFeedItemDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  async recordEvent(event: CreateActivityEvent): Promise<void> {
    // Bots never get their own feed rows (a guest can, shown as "Guest").
    if (!event.userId || event.userId.startsWith('bot-')) return;
    try {
      await this.feedModel.create({
        type: event.type,
        userId: event.userId,
        gameId: event.gameId ?? '',
        detail: event.detail ?? '',
        metadata: event.metadata ?? {},
      });
    } catch (err) {
      this.logger.warn(`Failed to record activity event: ${err}`);
    }
  }

  /** Record a finished match: one row per match, see `buildMatchEvent`. */
  async recordMatch(input: MatchEventInput): Promise<void> {
    const event = buildMatchEvent(input);
    if (!event) return;
    await this.recordEvent({
      type: 'game_completed',
      userId: event.userId,
      gameId: event.gameId,
      metadata: { ...event.metadata },
    });
  }

  async recordAchievements(
    userId: string,
    achievements: Array<{ id: string; name: string }>,
  ): Promise<void> {
    for (const a of achievements) {
      await this.recordEvent({
        type: 'achievement_unlocked',
        userId,
        metadata: { achievementId: a.id, achievementName: a.name },
      });
    }
  }

  async recordLevelUp(userId: string, level: number): Promise<void> {
    if (!Number.isInteger(level) || level < 2) return;
    await this.recordEvent({
      type: 'level_up',
      userId,
      metadata: { level },
    });
  }

  async recordWinStreak(
    userId: string,
    gameId: string,
    streak: number,
  ): Promise<void> {
    if (!isStreakMilestone(streak)) return;
    await this.recordEvent({
      type: 'win_streak',
      userId,
      gameId,
      metadata: { streak },
    });
  }

  async recordTournamentWin(
    userId: string,
    tournament: { id: string; name: string; gameId?: string },
  ): Promise<void> {
    await this.recordEvent({
      type: 'tournament_won',
      userId,
      gameId: tournament.gameId,
      metadata: {
        tournamentId: tournament.id,
        tournamentName: tournament.name,
      },
    });
  }

  async getFeed(options: GetFeedOptions = {}): Promise<ActivityFeedPageDto> {
    const limit = Math.min(
      Math.max(options.limit ?? DEFAULT_LIMIT, 1),
      MAX_LIMIT,
    );
    const query: Record<string, unknown> = filterQuery(options.filter);
    if (options.gameId) query.gameId = String(options.gameId);
    if (options.before) {
      const before = new Date(options.before);
      if (!Number.isNaN(before.getTime())) query.createdAt = { $lt: before };
    }

    const rows = (await this.feedModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .lean()
      .exec()) as unknown as StoredFeedItem[]; // lean() loses the class shape

    const hasMore = rows.length > limit;
    const page = hasMore ? rows.slice(0, limit) : rows;
    const users = await this.loadUsers(page.flatMap(referencedIds));
    return {
      items: page.map((row) => toFeedItemDto(row, users)),
      hasMore,
    };
  }

  private async loadUsers(ids: string[]): Promise<Map<string, FeedUserRecord>> {
    const userIds = collectUserIds(ids);
    if (userIds.length === 0) return new Map();
    try {
      const users = await this.userModel
        .find({ _id: { $in: userIds } }, FEED_USER_PROJECTION)
        .lean<FeedUserRecord[]>()
        .exec();
      return new Map(users.map((u) => [u._id.toString(), u]));
    } catch (err) {
      this.logger.warn(`Feed user lookup failed: ${(err as Error).message}`);
      return new Map();
    }
  }
}
