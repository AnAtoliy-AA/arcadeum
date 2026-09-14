import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ActivityFeedItem,
  ActivityFeedItemDocument,
  ActivityFeedType,
} from './activity-feed.schema';
import { OCI_CONNECTION } from '../../common/providers/mongo-connections.provider';

export interface CreateActivityEvent {
  type: ActivityFeedType;
  userId: string;
  displayName?: string;
  gameId?: string;
  gameName?: string;
  detail?: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class ActivityFeedService {
  private readonly logger = new Logger(ActivityFeedService.name);

  constructor(
    @InjectModel(ActivityFeedItem.name, OCI_CONNECTION)
    private readonly feedModel: Model<ActivityFeedItemDocument>,
  ) {}

  async recordEvent(event: CreateActivityEvent): Promise<void> {
    try {
      await this.feedModel.create({
        type: event.type,
        userId: event.userId,
        displayName: event.displayName ?? '',
        gameId: event.gameId ?? '',
        gameName: event.gameName ?? '',
        detail: event.detail ?? '',
        metadata: event.metadata ?? {},
      });
    } catch (err) {
      this.logger.warn(`Failed to record activity event: ${err}`);
    }
  }

  async getFeed(options: { limit?: number; before?: string }): Promise<
    Array<{
      id: string;
      type: string;
      userId: string;
      displayName: string;
      gameId: string;
      gameName: string;
      detail: string;
      timestamp: string;
    }>
  > {
    const limit = Math.min(options.limit ?? 20, 50);
    const query: Record<string, unknown> = {};

    if (options.before) {
      query.createdAt = { $lt: new Date(options.before) };
    }

    const items = await this.feedModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
      .exec();

    return items.map((item) => ({
      id: String(item._id),
      type: item.type,
      userId: item.userId,
      displayName: item.displayName,
      gameId: item.gameId,
      gameName: item.gameName,
      detail: item.detail,
      timestamp: item.createdAt.toISOString(),
    }));
  }
}
