import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface TablebaseResult {
  category: 'win' | 'loss' | 'draw' | 'win-guaranteed' | 'maybe-win';
  dtz: number | null;
  dtm: number | null;
}

@Injectable()
export class SyzygyTablebaseService {
  private readonly logger = new Logger(SyzygyTablebaseService.name);
  private readonly enabled: boolean;
  private readonly apiUrl: string;

  constructor(private readonly config: ConfigService) {
    this.enabled = this.config.get<boolean>('SYZYGY_ENABLED', false);
    this.apiUrl = this.config.get<string>(
      'SYZYGY_API_URL',
      'https://tablebase.lichess.ovh',
    );
  }

  async probe(fen: string): Promise<TablebaseResult | null> {
    if (!this.enabled) return null;

    const pieceCount = this.countPieces(fen);
    if (pieceCount > 7) return null;

    try {
      const url = `${this.apiUrl}/standard?fen=${encodeURIComponent(fen)}`;
      const response = await fetch(url);
      if (!response.ok) return null;

      const data = (await response.json()) as {
        category: string;
        dtz: number | null;
        dtm: number | null;
      };

      return {
        category: this.mapCategory(data.category),
        dtz: data.dtz,
        dtm: data.dtm,
      };
    } catch (error) {
      this.logger.warn(`Syzygy probe failed: ${error}`);
      return null;
    }
  }

  private countPieces(fen: string): number {
    const position = fen.split(' ')[0];
    let count = 0;
    for (const ch of position) {
      if (ch >= 'A' && ch <= 'Z') count++;
      if (ch >= 'a' && ch <= 'z') count++;
    }
    return count;
  }

  private mapCategory(
    category: string,
  ): 'win' | 'loss' | 'draw' | 'win-guaranteed' | 'maybe-win' {
    switch (category) {
      case 'win':
        return 'win';
      case 'loss':
        return 'loss';
      case 'draw':
        return 'draw';
      case 'win-guaranteed':
        return 'win-guaranteed';
      case 'maybe-win':
        return 'maybe-win';
      default:
        return 'draw';
    }
  }

  isTablebasePosition(fen: string): boolean {
    return this.countPieces(fen) <= 7;
  }
}
