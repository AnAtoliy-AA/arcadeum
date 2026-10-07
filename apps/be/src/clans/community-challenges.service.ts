import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  CommunityChallenge,
  CommunityChallengeDocument,
} from './schemas/community-challenge.schema';

export interface CommunityChallengeView {
  id: string;
  title: string;
  description: string;
  gameId: string;
  target: number;
  currentProgress: number;
  progressPercent: number;
  participantsCount: number;
  rewardTitle: string;
  rewardBadge: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'upcoming';
}

interface LeanChallengeDoc {
  _id: Types.ObjectId;
  title: string;
  description: string;
  gameId: string;
  target: number;
  currentProgress: number;
  participantsCount: number;
  rewardTitle: string;
  rewardBadge: string;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'completed' | 'upcoming';
}

const DEFAULT_CHALLENGES = [
  {
    title: 'Armada Vanguard',
    description:
      'Cooperate with platform players to sink 5,000 enemy warships in Sea Battle.',
    gameId: 'sea-battle',
    target: 5000,
    currentProgress: 3420,
    participantsCount: 142,
    rewardTitle: 'Fleet Admiral',
    rewardBadge: 'badge_admiral',
  },
  {
    title: 'Grandmaster Initiative',
    description:
      'Deliver 2,500 checkmates in Chess matches across all game modes.',
    gameId: 'chess',
    target: 2500,
    currentProgress: 1890,
    participantsCount: 98,
    rewardTitle: 'Tactician Elite',
    rewardBadge: 'badge_tactician',
  },
  {
    title: 'Crown of Kings',
    description:
      'Promote 4,000 Checkers pieces into Kings during live and practice matches.',
    gameId: 'checkers',
    target: 4000,
    currentProgress: 2150,
    participantsCount: 76,
    rewardTitle: 'Board Sovereign',
    rewardBadge: 'badge_sovereign',
  },
  {
    title: 'Global Play Blitz',
    description:
      'Play 15,000 matches collectively across all casual and ranked games.',
    gameId: 'all',
    target: 15000,
    currentProgress: 9840,
    participantsCount: 310,
    rewardTitle: 'Legendary Veteran',
    rewardBadge: 'badge_veteran',
  },
];

@Injectable()
export class CommunityChallengesService {
  constructor(
    @InjectModel(CommunityChallenge.name)
    private readonly challengeModel: Model<CommunityChallengeDocument>,
  ) {}

  async getActiveChallenges(): Promise<CommunityChallengeView[]> {
    const count = await this.challengeModel.countDocuments();
    if (count === 0) {
      const now = new Date();
      const inOneWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await this.challengeModel.insertMany(
        DEFAULT_CHALLENGES.map((item) => ({
          ...item,
          startDate: now,
          endDate: inOneWeek,
          status: 'active',
        })),
      );
    }

    const challenges = await this.challengeModel
      .find()
      .sort({ status: 1, endDate: 1 })
      .lean<LeanChallengeDoc[]>();

    return challenges.map((c) => this.toView(c));
  }

  async contributeToChallenge(
    challengeId: string,
    amount = 1,
  ): Promise<CommunityChallengeView> {
    if (!Types.ObjectId.isValid(challengeId)) {
      throw new NotFoundException('Challenge not found');
    }

    const challenge = await this.challengeModel.findById(
      new Types.ObjectId(challengeId),
    );
    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    if (challenge.status !== 'active') {
      throw new BadRequestException('Challenge is not active');
    }

    challenge.currentProgress = Math.min(
      challenge.target,
      challenge.currentProgress + amount,
    );
    challenge.participantsCount += 1;

    if (challenge.currentProgress >= challenge.target) {
      challenge.status = 'completed';
    }

    await challenge.save();
    return this.toView(challenge);
  }

  private toView(
    doc: LeanChallengeDoc | CommunityChallengeDocument,
  ): CommunityChallengeView {
    const target = doc.target > 0 ? doc.target : 1;
    const progressPercent = Math.min(
      100,
      Math.round((doc.currentProgress / target) * 100),
    );
    return {
      id: String(doc._id),
      title: doc.title,
      description: doc.description,
      gameId: doc.gameId,
      target: doc.target,
      currentProgress: doc.currentProgress,
      progressPercent,
      participantsCount: doc.participantsCount,
      rewardTitle: doc.rewardTitle,
      rewardBadge: doc.rewardBadge,
      startDate: new Date(doc.startDate).toISOString(),
      endDate: new Date(doc.endDate).toISOString(),
      status: doc.status,
    };
  }
}
