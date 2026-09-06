import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ChessProfile,
  type ChessProfileDocument,
} from './chess-profile.schema';
import { OCI_CONNECTION } from '../../../common/providers/mongo-connections.provider';

@Injectable()
export class ChessProfilesService {
  private readonly logger = new Logger(ChessProfilesService.name);

  constructor(
    @InjectModel(ChessProfile.name, OCI_CONNECTION)
    private readonly model: Model<ChessProfileDocument>,
  ) {}

  async getProfile(userId: string): Promise<ChessProfileDocument | null> {
    return this.model.findOne({ userId }).exec();
  }

  async getOrCreateProfile(userId: string): Promise<ChessProfileDocument> {
    let profile = await this.model.findOne({ userId }).exec();
    if (!profile) {
      profile = await this.model.create({ userId });
    }
    return profile;
  }

  async updateProfile(
    userId: string,
    updates: Partial<Pick<ChessProfile, 'bio' | 'country' | 'title'>>,
  ): Promise<ChessProfileDocument | null> {
    return this.model
      .findOneAndUpdate({ userId }, { $set: updates }, { new: true })
      .exec();
  }

  async recordGameResult(
    userId: string,
    gameType: string,
    result: 'won' | 'lost' | 'draw',
    eloChange: number,
  ): Promise<void> {
    const profile = await this.getOrCreateProfile(userId);
    const stats = profile.perGameStats[gameType] ?? {
      games: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      elo: 1200,
      peakElo: 1200,
      winStreak: 0,
      currentStreak: 0,
    };

    stats.games++;
    if (result === 'won') {
      stats.wins++;
      stats.winStreak++;
      stats.currentStreak =
        stats.currentStreak > 0 ? stats.currentStreak + 1 : 1;
    } else if (result === 'lost') {
      stats.losses++;
      stats.winStreak = 0;
      stats.currentStreak =
        stats.currentStreak < 0 ? stats.currentStreak - 1 : -1;
    } else {
      stats.draws++;
      stats.winStreak = 0;
      stats.currentStreak = 0;
    }

    stats.elo = Math.max(100, stats.elo + eloChange);
    stats.peakElo = Math.max(stats.peakElo, stats.elo);

    profile.perGameStats[gameType] = stats;
    await profile.save();
  }

  async addRecentGame(userId: string, gameId: string): Promise<void> {
    await this.model
      .findOneAndUpdate(
        { userId },
        {
          $push: {
            recentGames: {
              $each: [gameId],
              $slice: -10,
            },
          },
        },
      )
      .exec();
  }

  async getStats(userId: string): Promise<Record<string, unknown> | null> {
    return this.model
      .findOne({ userId })
      .select('perGameStats puzzleRating totalPuzzlesSolved')
      .lean()
      .exec();
  }
}
