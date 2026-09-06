import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/jwt/jwt.guard';
import { ChessPuzzlesService } from './chess-puzzles.service';

@Controller('chess/puzzles')
export class ChessPuzzlesController {
  constructor(private readonly puzzlesService: ChessPuzzlesService) {}

  @Get('daily')
  async getDailyPuzzle() {
    return this.puzzlesService.getDailyPuzzle();
  }

  @Get('random')
  async getRandomPuzzle(
    @Query('rating') rating?: string,
    @Query('theme') theme?: string,
    @Request() req?: { user?: { id?: string } },
  ) {
    const userId = req?.user?.id;
    return this.puzzlesService.getPuzzle(
      userId,
      rating ? parseInt(rating, 10) : undefined,
      theme,
    );
  }

  @Post('solve')
  @UseGuards(JwtAuthGuard)
  async solvePuzzle(
    @Body()
    body: {
      puzzleId: string;
      moves: string[];
      timeMs: number;
    },
    @Request() req: { user: { id: string } },
  ) {
    return this.puzzlesService.checkSolution(
      req.user.id,
      body.puzzleId,
      body.moves,
      body.timeMs,
    );
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getStats(@Request() req: { user: { id: string } }) {
    return this.puzzlesService.getUserStats(req.user.id);
  }

  @Get('themes')
  async getThemes() {
    return this.puzzlesService.getThemes();
  }

  @Get('set')
  async getPuzzleSet(
    @Query('theme') theme: string,
    @Query('count') count?: string,
  ) {
    return this.puzzlesService.getPuzzleSet(
      theme,
      count ? parseInt(count, 10) : 10,
    );
  }

  @Post('import')
  async importPuzzles(
    @Body()
    body: {
      puzzles: Array<{
        puzzleId: string;
        fen: string;
        moves: string[];
        rating: number;
        ratingDeviation?: number;
        themes?: string[];
        openingTags?: string[];
      }>;
    },
  ) {
    return this.puzzlesService.importPuzzles(body.puzzles);
  }

  @Post('hint')
  @UseGuards(JwtAuthGuard)
  async getHint(
    @Body() body: { fen: string },
    @Request() req: { user: { id: string } },
  ) {
    if (!body.fen) {
      return { error: 'fen is required' };
    }
    return this.puzzlesService.getHint(body.fen, req.user.id);
  }
}
