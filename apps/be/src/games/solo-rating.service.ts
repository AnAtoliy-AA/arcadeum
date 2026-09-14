import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SoloRating } from './schemas/solo-rating.schema';
import { User } from '../auth/schemas/user.schema';
import { OCI_CONNECTION } from '../common/providers/mongo-connections.provider';
import { tierForRating, STARTING_ELO } from '../ranking/ranking.constants';

const SOLO_RATING_DIFFICULTY_MAP: Record<string, number> = {
  beginner: 6,
  easy: 6,
  default: 10,
  intermediate: 10,
  medium: 10,
  hard: 16,
  expert: 16,
};

interface RecordSoloResult {
  userId: string;
  difficulty: string;
  won: boolean;
  usedUndo: boolean;
}

interface SoloRatingDelta {
  rating: number;
  delta: number;
  tier: string;
}

@Injectable()
export class SoloRatingService {
  private readonly logger = new Logger(SoloRatingService.name);

  constructor(
    @InjectModel(SoloRating.name, OCI_CONNECTION)
    private readonly soloRatingModel: Model<SoloRating>,
    @InjectModel(User.name, OCI_CONNECTION)
    private readonly userModel: Model<User>,
  ) {}

  async recordResult(result: RecordSoloResult): Promise<SoloRatingDelta> {
    const base = SOLO_RATING_DIFFICULTY_MAP[result.difficulty] ?? 10;

    let delta: number;
    if (result.won) {
      delta = result.usedUndo ? Math.round(base * 0.5) : base;
    } else {
      const loss = result.usedUndo ? Math.round(base * 0.75) : base;
      delta = -loss;
    }

    const doc = await this.soloRatingModel
      .findOneAndUpdate(
        { userId: result.userId },
        {
          $inc: {
            rating: delta,
            wins: result.won ? 1 : 0,
            losses: result.won ? 0 : 1,
            winsWithUndo: result.won && result.usedUndo ? 1 : 0,
            lossesWithUndo: !result.won && result.usedUndo ? 1 : 0,
            totalGames: 1,
          },
          $max: {
            peakRating: {
              $add: [{ $ifNull: ['$rating', STARTING_ELO] }, delta],
            },
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )
      .exec();

    const newRating = doc.rating;
    const tier = tierForRating(newRating);

    if (doc.tier !== tier) {
      await this.soloRatingModel
        .updateOne({ _id: doc._id }, { $set: { tier } })
        .exec();
    }

    return { rating: newRating, delta, tier };
  }

  async getRating(userId: string): Promise<{
    rating: number;
    tier: string;
    peakRating: number;
    wins: number;
    losses: number;
    winsWithUndo: number;
    lossesWithUndo: number;
    totalGames: number;
  } | null> {
    const doc = await this.soloRatingModel
      .findOne({ userId })
      .lean<SoloRating>()
      .exec();

    if (!doc) {
      return {
        rating: STARTING_ELO,
        tier: 'bronze',
        peakRating: STARTING_ELO,
        wins: 0,
        losses: 0,
        winsWithUndo: 0,
        lossesWithUndo: 0,
        totalGames: 0,
      };
    }

    return {
      rating: doc.rating,
      tier: doc.tier,
      peakRating: doc.peakRating,
      wins: doc.wins,
      losses: doc.losses,
      winsWithUndo: doc.winsWithUndo,
      lossesWithUndo: doc.lossesWithUndo,
      totalGames: doc.totalGames,
    };
  }

  async getLeaderboard(
    limit = 20,
    offset = 0,
  ): Promise<{
    entries: Array<{
      rank: number;
      userId: string;
      username: string;
      displayName: string | null;
      rating: number;
      tier: string;
      peakRating: number;
      wins: number;
      losses: number;
      totalGames: number;
      equippedAvatarId: string | null;
      equippedBadgeId: string | null;
      equippedNameColorId: string | null;
      equippedFrameId: string | null;
    }>;
    total: number;
  }> {
    const [total, docs] = await Promise.all([
      this.soloRatingModel.countDocuments().exec(),
      this.soloRatingModel
        .find()
        .sort({ rating: -1, totalGames: -1 })
        .skip(offset)
        .limit(limit)
        .lean<SoloRating[]>()
        .exec(),
    ]);

    const userIds = docs.map((d) => d.userId);
    const users = await this.userModel
      .find({ _id: { $in: userIds } })
      .select(
        '_id username displayName equippedAvatarId equippedBadgeId equippedNameColorId equippedFrameId',
      )
      .lean<
        Array<{
          _id: unknown;
          username?: string;
          displayName?: string;
          equippedAvatarId?: string;
          equippedBadgeId?: string;
          equippedNameColorId?: string;
          equippedFrameId?: string;
        }>
      >()
      .exec();

    const userMap = new Map(users.map((u) => [String(u._id), u]));

    return {
      entries: docs.map((d, i) => {
        const user = userMap.get(d.userId);
        return {
          rank: offset + i + 1,
          userId: d.userId,
          username: user?.username ?? d.userId,
          displayName: user?.displayName ?? null,
          rating: d.rating,
          tier: d.tier,
          peakRating: d.peakRating,
          wins: d.wins,
          losses: d.losses,
          totalGames: d.totalGames,
          equippedAvatarId: user?.equippedAvatarId ?? null,
          equippedBadgeId: user?.equippedBadgeId ?? null,
          equippedNameColorId: user?.equippedNameColorId ?? null,
          equippedFrameId: user?.equippedFrameId ?? null,
        };
      }),
      total,
    };
  }
}
