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
    const allowedFields = {
      ...(updates.bio !== undefined && { bio: updates.bio }),
      ...(updates.country !== undefined && { country: updates.country }),
      ...(updates.title !== undefined && { title: updates.title }),
    };
    return this.model
      .findOneAndUpdate({ userId }, { $set: allowedFields }, { new: true })
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

  /**
   * Calculate Elo change for a game result.
   * K-factor: 32 for <20 games, 24 for <50, 16 for 50+.
   */
  calculateEloChange(
    winnerElo: number,
    loserElo: number,
    isDraw: boolean,
    winnerGames: number,
  ): { winnerChange: number; loserChange: number } {
    const k = winnerGames < 20 ? 32 : winnerGames < 50 ? 24 : 16;
    const expectedWinner = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
    const expectedLoser = 1 / (1 + Math.pow(10, (winnerElo - loserElo) / 400));

    if (isDraw) {
      return {
        winnerChange: Math.round(k * (0.5 - expectedWinner)),
        loserChange: Math.round(k * (0.5 - expectedLoser)),
      };
    }

    return {
      winnerChange: Math.round(k * (1 - expectedWinner)),
      loserChange: Math.round(k * (0 - expectedLoser)),
    };
  }

  /**
   * Get the leaderboard for a game type.
   */
  async getLeaderboard(
    gameType: string,
    limit: number = 20,
  ): Promise<
    Array<{ userId: string; elo: number; games: number; wins: number }>
  > {
    const results = await this.model
      .find({ [`perGameStats.${gameType}.games`]: { $gt: 0 } })
      .select(`userId perGameStats.${gameType}`)
      .lean()
      .exec();

    return results
      .map((doc) => {
        const stats = (doc as Record<string, unknown>).perGameStats as Record<
          string,
          { elo: number; games: number; wins: number }
        >;
        const gameStats = stats?.[gameType];
        return {
          userId: (doc as Record<string, unknown>).userId as string,
          elo: gameStats?.elo ?? 1200,
          games: gameStats?.games ?? 0,
          wins: gameStats?.wins ?? 0,
        };
      })
      .sort((a, b) => b.elo - a.elo)
      .slice(0, limit);
  }
}
