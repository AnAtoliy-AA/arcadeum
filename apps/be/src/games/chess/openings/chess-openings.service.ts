import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ChessOpening,
  type ChessOpeningDocument,
} from './chess-opening.schema';

function sanitize(str: string): string {
  return str.replace(/[$.]/g, '_');
}

@Injectable()
export class ChessOpeningsService {
  private readonly logger = new Logger(ChessOpeningsService.name);

  constructor(
    @InjectModel(ChessOpening.name)
    private readonly openingModel: Model<ChessOpeningDocument>,
  ) {}

  async importOpenings(
    openings: Array<{
      moves: string[];
      fen: string;
      white?: number;
      draws?: number;
      black?: number;
      totalGames?: number;
      avgRating?: number;
      opening?: string;
      openingFamily?: string;
      eco?: string;
    }>,
  ): Promise<{ imported: number; skipped: number }> {
    let imported = 0;
    let skipped = 0;

    for (const o of openings) {
      try {
        await this.openingModel.findOneAndUpdate(
          { moves: o.moves },
          {
            $set: {
              moves: o.moves,
              fen: o.fen,
              white: o.white ?? 0,
              draws: o.draws ?? 0,
              black: o.black ?? 0,
              totalGames: o.totalGames ?? 0,
              avgRating: o.avgRating ?? 0,
              opening: sanitize(o.opening ?? ''),
              openingFamily: sanitize(o.openingFamily ?? ''),
              eco: sanitize(o.eco ?? ''),
            },
          },
          { upsert: true },
        );
        imported++;
      } catch {
        skipped++;
      }
    }

    this.logger.log(`Opening import: ${imported} imported, ${skipped} skipped`);
    return { imported, skipped };
  }

  async getExplorer(
    fen: string,
    _playerLevel?: string,
  ): Promise<
    Array<{
      move: string;
      white: number;
      draws: number;
      black: number;
      totalGames: number;
      opening: string;
      eco: string;
    }>
  > {
    const safeFen = sanitize(fen);
    const opening = await this.openingModel.findOne({ fen: safeFen }).exec();

    if (!opening) {
      return [];
    }

    // Return the available moves from this position
    // In a full implementation, this would aggregate from child positions
    // For now, return the opening info
    return [
      {
        move: opening.moves[opening.moves.length - 1] ?? '',
        white: opening.white,
        draws: opening.draws,
        black: opening.black,
        totalGames: opening.totalGames,
        opening: opening.opening,
        eco: opening.eco,
      },
    ];
  }

  async getOpeningName(eco: string): Promise<ChessOpeningDocument | null> {
    const safeEco = sanitize(eco);
    return this.openingModel.findOne({ eco: safeEco }).exec();
  }

  async getPopularOpenings(
    limit: number = 20,
  ): Promise<ChessOpeningDocument[]> {
    return this.openingModel
      .find({ totalGames: { $gt: 0 } })
      .sort({ totalGames: -1 })
      .limit(Math.min(limit, 100))
      .exec();
  }
}
