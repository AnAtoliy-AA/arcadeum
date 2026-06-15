import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  DailyChallengeDefinition,
  DailyChallengeDefinitionDocument,
} from './schemas/daily-challenge-definition.schema';
import {
  UserDailyChallenge,
  UserDailyChallengeDocument,
} from './schemas/user-daily-challenge.schema';
import { WalletService } from '../wallet/wallet.service';

export interface DailyChallengeView {
  challengeId: string;
  type: string;
  gameId?: string;
  description: string;
  targetCount: number;
  progress: number;
  completed: boolean;
  claimed: boolean;
  rewardType: string;
  rewardAmount: number;
}

export interface DailyChallengesStatus {
  date: string;
  challenges: DailyChallengeView[];
  allCompleted: boolean;
  nextResetAt: string;
}

export interface ClaimResult {
  challengeId: string;
  rewardType: string;
  rewardAmount: number;
  balanceAfter: number;
}

@Injectable()
export class DailyChallengesService {
  private readonly logger = new Logger(DailyChallengesService.name);

  constructor(
    @InjectModel(DailyChallengeDefinition.name)
    private readonly definitionModel: Model<DailyChallengeDefinitionDocument>,
    @InjectModel(UserDailyChallenge.name)
    private readonly progressModel: Model<UserDailyChallengeDocument>,
    private readonly wallet: WalletService,
  ) {}

  async getStatus(userId: string): Promise<DailyChallengesStatus> {
    const today = this.todayUtc();
    const dayOfWeek = this.getDayOfWeek(today);
    const definitions = await this.getDefinitionsForDay(dayOfWeek);
    const progress = await this.getOrCreateProgress(userId, today, definitions);

    const challenges = definitions.map((def) => {
      const userChallenge = progress.challenges.find(
        (c) => c.challengeId === def.challengeId,
      );
      return {
        challengeId: def.challengeId,
        type: def.type,
        gameId: def.gameId,
        description: this.getDescription(def),
        targetCount: def.targetCount,
        progress: userChallenge?.progress ?? 0,
        completed: userChallenge?.completed ?? false,
        claimed: userChallenge?.claimed ?? false,
        rewardType: def.rewardType,
        rewardAmount: def.rewardAmount,
      };
    });

    return {
      date: today,
      challenges,
      allCompleted: challenges.every((c) => c.completed),
      nextResetAt: this.nextUtcMidnight(today),
    };
  }

  async trackProgress(
    userId: string,
    challengeId: string,
    date: string,
    increment: number = 1,
  ): Promise<void> {
    const definition = await this.definitionModel.findOne({ challengeId });
    if (!definition) return;

    const progress = await this.getOrCreateProgress(userId, date, [definition]);
    const userChallenge = progress.challenges.find(
      (c) => c.challengeId === challengeId,
    );
    if (!userChallenge || userChallenge.completed) return;

    userChallenge.progress = Math.min(
      userChallenge.progress + increment,
      definition.targetCount,
    );
    if (userChallenge.progress >= definition.targetCount) {
      userChallenge.completed = true;
    }

    await progress.save();
  }

  async claimReward(
    userId: string,
    challengeId: string,
    date: string,
  ): Promise<ClaimResult> {
    const definition = await this.definitionModel.findOne({ challengeId });
    if (!definition) throw new Error('Challenge not found');

    const progress = await this.getOrCreateProgress(userId, date, [definition]);
    const userChallenge = progress.challenges.find(
      (c) => c.challengeId === challengeId,
    );
    if (!userChallenge) throw new Error('Challenge progress not found');
    if (!userChallenge.completed) throw new Error('Challenge not completed');
    if (userChallenge.claimed) throw new Error('Already claimed');

    const idempotencyKey = `dc:${date}:${challengeId}:${userId}`;

    let balanceAfter: number;
    if (definition.rewardType === 'coins') {
      const tx = await this.wallet.credit(
        userId,
        'coins',
        definition.rewardAmount,
        'daily_challenge',
        idempotencyKey,
      );
      balanceAfter = tx.balanceAfter;
    } else {
      const tx = await this.wallet.credit(
        userId,
        'gems',
        definition.rewardAmount,
        'daily_challenge',
        `${idempotencyKey}:gems`,
      );
      balanceAfter = tx.balanceAfter;
    }

    userChallenge.claimed = true;
    await progress.save();

    return {
      challengeId,
      rewardType: definition.rewardType,
      rewardAmount: definition.rewardAmount,
      balanceAfter,
    };
  }

  async onGameCompleted(
    playerIds: string[],
    gameId: string,
    winners: string[],
    stats: { shots?: number; shipsSunk?: number },
  ): Promise<void> {
    const today = this.todayUtc();
    const dayOfWeek = this.getDayOfWeek(today);
    const definitions = await this.getDefinitionsForDay(dayOfWeek);

    for (const userId of playerIds) {
      if (userId.startsWith('bot-')) continue;

      const progress = await this.getOrCreateProgress(
        userId,
        today,
        definitions,
      );
      const isWinner = winners.includes(userId);

      for (const def of definitions) {
        const userChallenge = progress.challenges.find(
          (c) => c.challengeId === def.challengeId,
        );
        if (!userChallenge || userChallenge.completed) continue;

        let increment = 0;
        switch (def.type) {
          case 'play_games':
            increment = 1;
            break;
          case 'win_games':
            increment = isWinner ? 1 : 0;
            break;
          case 'play_specific_game':
            increment = def.gameId === gameId ? 1 : 0;
            break;
          case 'sink_ships':
            increment = stats.shipsSunk ?? 0;
            break;
          case 'total_shots':
            increment = stats.shots ?? 0;
            break;
          case 'win_streak':
            increment = isWinner ? 1 : 0;
            break;
          case 'play_without_firing':
            increment = (stats.shots ?? 0) === 0 ? 1 : 0;
            break;
        }

        if (increment > 0) {
          userChallenge.progress = Math.min(
            userChallenge.progress + increment,
            def.targetCount,
          );
          if (userChallenge.progress >= def.targetCount) {
            userChallenge.completed = true;
          }
        }
      }

      await progress.save();
    }
  }

  private todayUtc(): string {
    const now = new Date();
    return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`;
  }

  private getDayOfWeek(dateStr: string): number {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 1;
  }

  private nextUtcMidnight(today: string): string {
    const [y, m, d] = today.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d + 1, 0, 0, 0)).toISOString();
  }

  private async getDefinitionsForDay(
    dayOfWeek: number,
  ): Promise<DailyChallengeDefinitionDocument[]> {
    return this.definitionModel.find({ dayInWeek: dayOfWeek }).exec();
  }

  private async getOrCreateProgress(
    userId: string,
    date: string,
    definitions: DailyChallengeDefinitionDocument[],
  ): Promise<UserDailyChallengeDocument> {
    let progress = await this.progressModel.findOne({
      userId: new Types.ObjectId(userId),
      date,
    });
    if (!progress) {
      const challenges = definitions.map((def) => ({
        challengeId: def.challengeId,
        progress: 0,
        completed: false,
        claimed: false,
      }));
      progress = await this.progressModel.create({
        userId: new Types.ObjectId(userId),
        date,
        challenges,
      });
    }
    return progress;
  }

  private getDescription(def: DailyChallengeDefinition): string {
    const gameLabel = def.gameId
      ? def.gameId.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      : '';

    switch (def.type) {
      case 'play_games':
        return `Play ${def.targetCount} game${def.targetCount > 1 ? 's' : ''}`;
      case 'win_games':
        return `Win ${def.targetCount} game${def.targetCount > 1 ? 's' : ''}`;
      case 'play_specific_game':
        return `Play ${def.targetCount} game${def.targetCount > 1 ? 's' : ''} of ${gameLabel}`;
      case 'sink_ships':
        return `Sink ${def.targetCount} ship${def.targetCount > 1 ? 's' : ''}`;
      case 'total_shots':
        return `Fire ${def.targetCount} shot${def.targetCount > 1 ? 's' : ''}`;
      case 'win_streak':
        return `Win ${def.targetCount} game${def.targetCount > 1 ? 's' : ''} in a row`;
      case 'play_without_firing':
        return `Win a game without firing a shot`;
      default:
        return 'Complete the challenge';
    }
  }
}
