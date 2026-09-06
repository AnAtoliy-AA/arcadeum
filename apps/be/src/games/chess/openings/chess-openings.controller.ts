import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ChessOpeningsService } from './chess-openings.service';

@Controller('chess/openings')
export class ChessOpeningsController {
  constructor(private readonly openingsService: ChessOpeningsService) {}

  @Get('explorer')
  async getExplorer(
    @Query('fen') fen: string,
    @Query('playerLevel') playerLevel?: string,
  ) {
    if (!fen) {
      return { error: 'fen is required' };
    }
    return this.openingsService.getExplorer(fen, playerLevel);
  }

  @Get('name')
  async getOpeningName(@Query('eco') eco: string) {
    if (!eco) {
      return { error: 'eco is required' };
    }
    return this.openingsService.getOpeningName(eco);
  }

  @Get('popular')
  async getPopularOpenings(@Query('limit') limit?: string) {
    return this.openingsService.getPopularOpenings(
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Post('import')
  async importOpenings(
    @Body()
    body: {
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
      }>;
    },
  ) {
    return this.openingsService.importOpenings(body.openings);
  }

  @Post('classify')
  async classifyOpening(
    @Body() body: { moves: string[] },
  ) {
    if (!body.moves || body.moves.length === 0) {
      return { error: 'moves array is required' };
    }
    return this.openingsService.classifyOpening(body.moves);
  }
}
