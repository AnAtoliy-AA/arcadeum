import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OCI_CONNECTION } from '../../../common/providers/mongo-connections.provider';
import { ChessPuzzle, type ChessPuzzleDocument } from './chess-puzzle.schema';
import {
  ChessPuzzleUser,
  type ChessPuzzleUserDocument,
} from './chess-puzzle-user.schema';

/** Strip MongoDB operator prefixes from user-supplied strings (CodeQL fix). */
function sanitize(str: string): string {
  return str.replace(/[$.]/g, '_');
}

/** Clamp a number to a safe range. */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

@Injectable()
export class ChessPuzzlesService {
  private readonly logger = new Logger(ChessPuzzlesService.name);

  constructor(
    @InjectModel(ChessPuzzle.name, OCI_CONNECTION)
    private readonly puzzleModel: Model<ChessPuzzleDocument>,
    @InjectModel(ChessPuzzleUser.name, OCI_CONNECTION)
    private readonly puzzleUserModel: Model<ChessPuzzleUserDocument>,
  ) {}

  async importPuzzles(
    puzzles: Array<{
      puzzleId: string;
      fen: string;
      moves: string[];
      rating: number;
      ratingDeviation?: number;
      themes?: string[];
      openingTags?: string[];
    }>,
  ): Promise<{ imported: number; skipped: number }> {
    let imported = 0;
    let skipped = 0;

    for (const p of puzzles) {
      try {
        const safeId = sanitize(p.puzzleId);
        await this.puzzleModel.findOneAndUpdate(
          { puzzleId: safeId },
          {
            $set: {
              puzzleId: safeId,
              fen: p.fen,
              moves: p.moves,
              rating: clamp(p.rating, 0, 4000),
              ratingDeviation: clamp(p.ratingDeviation ?? 0, 0, 500),
              themes: (p.themes ?? []).map(sanitize),
              openingTags: (p.openingTags ?? []).map(sanitize),
            },
          },
          { upsert: true },
        );
        imported++;
      } catch {
        skipped++;
      }
    }

    this.logger.log(`Puzzle import: ${imported} imported, ${skipped} skipped`);
    return { imported, skipped };
  }

  async getDailyPuzzle(): Promise<ChessPuzzleDocument | null> {
    const today = new Date();
    const seed =
      today.getFullYear() * 10000 +
      (today.getMonth() + 1) * 100 +
      today.getDate();

    const count = await this.puzzleModel.countDocuments();
    if (count === 0) return null;

    const offset = seed % count;
    return this.puzzleModel.findOne().skip(offset).exec();
  }

  async getPuzzle(
    userId?: string,
    rating?: number,
    theme?: string,
  ): Promise<ChessPuzzleDocument | null> {
    const targetRating = clamp(rating ?? 1200, 100, 4000);
    const minRating = targetRating - 200;
    const maxRating = targetRating + 200;

    const query: Record<string, unknown> = {
      rating: { $gte: minRating, $lte: maxRating },
    };

    if (theme) {
      query.themes = sanitize(theme);
    }

    if (userId) {
      const safeUserId = sanitize(userId);
      const solved = await this.puzzleUserModel
        .find({ userId: safeUserId, solved: true })
        .select('puzzleId')
        .exec();
      const solvedIds = solved.map((s) => s.puzzleId);
      if (solvedIds.length > 0) {
        query.puzzleId = { $nin: solvedIds };
      }
    }

    const count = await this.puzzleModel.countDocuments(query);
    if (count === 0) return null;

    const offset = Math.floor(Math.random() * count);
    return this.puzzleModel.findOne(query).skip(offset).exec();
  }

  async checkSolution(
    userId: string,
    puzzleId: string,
    playerMoves: string[],
    timeMs: number,
  ): Promise<{
    solved: boolean;
    ratingChange: number;
    puzzle: ChessPuzzleDocument | null;
  }> {
    const safeUserId = sanitize(userId);
    const safePuzzleId = sanitize(puzzleId);

    const puzzle = await this.puzzleModel
      .findOne({ puzzleId: safePuzzleId })
      .exec();
    if (!puzzle) {
      return { solved: false, ratingChange: 0, puzzle: null };
    }

    const expectedMoves = puzzle.moves;
    const solved =
      playerMoves.length === expectedMoves.length &&
      playerMoves.every((m, i) => m === expectedMoves[i]);

    await this.puzzleUserModel.findOneAndUpdate(
      { userId: safeUserId, puzzleId: safePuzzleId },
      {
        $set: {
          solved,
          attemptedAt: new Date(),
          timeMs: clamp(timeMs, 0, 600_000),
        },
      },
      { upsert: true },
    );

    await this.puzzleModel.findOneAndUpdate(
      { puzzleId: safePuzzleId },
      {
        $inc: { plays: 1, ...(solved ? { solutions: 1 } : {}) },
      },
    );

    const ratingChange = solved
      ? Math.round(5 + (puzzle.rating - 1200) / 100)
      : -5;

    return { solved, ratingChange, puzzle };
  }

  async getUserStats(userId: string): Promise<{
    totalSolved: number;
    totalAttempted: number;
    streak: number;
    rating: number;
  }> {
    const safeUserId = sanitize(userId);

    const totalAttempted = await this.puzzleUserModel.countDocuments({
      userId: safeUserId,
    });
    const totalSolved = await this.puzzleUserModel.countDocuments({
      userId: safeUserId,
      solved: true,
    });

    const recent = await this.puzzleUserModel
      .find({ userId: safeUserId })
      .sort({ attemptedAt: -1 })
      .limit(50)
      .exec();

    let streak = 0;
    for (const r of recent) {
      if (r.solved) streak++;
      else break;
    }

    const solvedPuzzles = await this.puzzleUserModel
      .find({ userId: safeUserId, solved: true })
      .select('puzzleId')
      .exec();
    const solvedIds = solvedPuzzles.map((s) => s.puzzleId);

    let rating = 1200;
    if (solvedIds.length > 0) {
      const avgDifficulty = await this.puzzleModel.aggregate([
        { $match: { puzzleId: { $in: solvedIds } } },
        { $group: { _id: null, avg: { $avg: '$rating' } } },
      ]);
      if (avgDifficulty.length > 0) {
        const avg = avgDifficulty[0] as { avg: number };
        rating = Math.round(avg.avg);
      }
    }

    return { totalSolved, totalAttempted, streak, rating };
  }

  async getPuzzleSet(
    theme: string,
    count: number = 10,
  ): Promise<ChessPuzzleDocument[]> {
    const safeTheme = sanitize(theme);
    const safeCount = clamp(count, 1, 100);
    return this.puzzleModel.find({ themes: safeTheme }).limit(safeCount).exec();
  }

  async getThemes(): Promise<Array<{ theme: string; count: number }>> {
    return this.puzzleModel.aggregate([
      { $unwind: '$themes' },
      { $group: { _id: '$themes', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { theme: '$_id', count: 1, _id: 0 } },
    ]);
  }
}
