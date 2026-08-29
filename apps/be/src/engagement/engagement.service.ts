import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  EngagementEvent,
  EngagementEventDocument,
} from './schemas/engagement-event.schema';
import { RecordEngagementEventDto } from './dto/record-event.dto';

export interface WinbackOffer {
  type: 'streak_freeze' | 'mystery_box' | 'rivalry_challenge';
  rewardCoins: number;
  message: string;
}

@Injectable()
export class EngagementService {
  constructor(
    @InjectModel(EngagementEvent.name)
    private readonly engagementModel: Model<EngagementEventDocument>,
  ) {}

  async recordEvent(
    userId: string,
    dto: RecordEngagementEventDto,
  ): Promise<EngagementEvent> {
    const created = new this.engagementModel({
      userId,
      eventType: dto.eventType,
      targetUserId: dto.targetUserId,
      metadata: dto.metadata ?? {},
      isClaimed: false,
    });
    return created.save();
  }

  async getPendingTriggers(userId: string): Promise<EngagementEvent[]> {
    return this.engagementModel
      .find({ userId, isClaimed: false })
      .sort({ createdAt: -1 })
      .limit(10)
      .exec();
  }

  evaluateWinbackOffer(daysInactive: number): WinbackOffer | null {
    if (daysInactive < 1) {
      return null;
    }
    if (daysInactive <= 3) {
      return {
        type: 'streak_freeze',
        rewardCoins: 50,
        message:
          'Welcome back! We preserved your streak with a free freeze token.',
      };
    }
    return {
      type: 'mystery_box',
      rewardCoins: 150,
      message: 'Long time no see! Claim your returning champion bundle.',
    };
  }

  async claimTrigger(
    userId: string,
    triggerId: string,
  ): Promise<EngagementEvent> {
    const event = await this.engagementModel
      .findOne({ _id: triggerId, userId })
      .exec();
    if (!event) {
      throw new NotFoundException('Engagement trigger not found');
    }
    event.isClaimed = true;
    return event.save();
  }
}
