import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OCI_CONNECTION } from '../../../common/providers/mongo-connections.provider';
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
    @InjectModel(ChessOpening.name, OCI_CONNECTION)
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
        const safeMoves = o.moves.map(sanitize);
        await this.openingModel.findOneAndUpdate(
          { moves: safeMoves },
          {
            $set: {
              moves: safeMoves,
              fen: sanitize(o.fen),
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

  /**
   * Classify the opening from a move sequence.
   * Walks the move list and finds the deepest matching ECO entry.
   * Returns the opening name, ECO code, and the move index where it diverged.
   */
  async classifyOpening(
    moves: string[],
  ): Promise<{
    opening: string;
    eco: string;
    family: string;
    moveIndex: number;
  } | null> {
    if (moves.length === 0) return null;

    let bestMatch: { opening: string; eco: string; family: string; moveIndex: number } | null = null;

    for (let i = moves.length; i >= 1; i--) {
      const prefix = moves.slice(0, i);
      const safeMoves = prefix.map(sanitize);
      const opening = await this.openingModel.findOne({ moves: safeMoves }).exec();
      if (opening && opening.eco) {
        bestMatch = {
          opening: opening.opening,
          eco: opening.eco,
          family: opening.openingFamily,
          moveIndex: i,
        };
        break;
      }
    }

    return bestMatch;
  }
}
