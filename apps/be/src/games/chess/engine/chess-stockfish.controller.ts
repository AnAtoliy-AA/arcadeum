/**
 * Stockfish 19 engine REST controller.
 *
 * Provides endpoints for chess position and game analysis
 * using Stockfish 19 (latest stable, released 2026-09-05).
 */
import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ChessStockfishService } from './chess-stockfish.service';
import type {
  AnalyzePositionRequest,
  AnalyzeGameRequest,
} from './chess-stockfish.types';

@Controller('chess/engine')
export class ChessStockfishController {
  constructor(private readonly stockfishService: ChessStockfishService) {}

  /**
   * GET /chess/engine/status — Check engine status and version.
   */
  @Get('status')
  getStatus() {
    return {
      ready: this.stockfishService.isReady(),
      version: this.stockfishService.getVersion(),
    };
  }

  /**
   * POST /chess/engine/analyze — Analyze a single position.
   */
  @Post('analyze')
  @HttpCode(HttpStatus.OK)
  async analyzePosition(@Body() body: AnalyzePositionRequest) {
    if (!body.fen) {
      return { error: 'fen is required' };
    }
    return this.stockfishService.analyzePosition(body);
  }

  /**
   * POST /chess/engine/analyze-game — Analyze a full game.
   */
  @Post('analyze-game')
  @HttpCode(HttpStatus.OK)
  async analyzeGame(@Body() body: AnalyzeGameRequest) {
    if (!body.positionHistory || body.positionHistory.length < 2) {
      return { error: 'positionHistory with at least 2 positions is required' };
    }
    return this.stockfishService.analyzeGame(body);
  }

  /**
   * POST /chess/engine/best-move — Get the best move for a position.
   */
  @Post('best-move')
  @HttpCode(HttpStatus.OK)
  async getBestMove(
    @Body() body: { fen: string; depth?: number; timeMs?: number },
  ) {
    if (!body.fen) {
      return { error: 'fen is required' };
    }
    return this.stockfishService.getBestMove(body.fen, body.depth, body.timeMs);
  }
}
