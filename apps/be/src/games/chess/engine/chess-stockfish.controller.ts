import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/jwt/jwt.guard';
import { ChessStockfishService } from './chess-stockfish.service';
import { ChessSubscriptionService } from '../subscription/chess-subscription.service';
import type {
  AnalyzePositionRequest,
  AnalyzeGameRequest,
} from './chess-stockfish.types';

@Controller('chess/engine')
export class ChessStockfishController {
  constructor(
    private readonly stockfishService: ChessStockfishService,
    private readonly subscriptionService: ChessSubscriptionService,
  ) {}

  @Get('status')
  getStatus() {
    return {
      ready: this.stockfishService.isReady(),
      version: this.stockfishService.getVersion(),
    };
  }

  @Post('analyze')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async analyzePosition(
    @Body() body: AnalyzePositionRequest,
    @Request() req: { user: { id: string } },
  ) {
    if (!body.fen) {
      return { error: 'fen is required' };
    }

    const tier = this.subscriptionService.getUserTier(req.user.id);
    if (!this.subscriptionService.canPerformAction(tier, 'gameReview')) {
      return { error: 'Daily analysis limit reached. Upgrade to premium for unlimited analysis.' };
    }

    return this.stockfishService.analyzePosition(body);
  }

  @Post('analyze-game')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async analyzeGame(
    @Body() body: AnalyzeGameRequest,
    @Request() req: { user: { id: string } },
  ) {
    if (!body.positionHistory || body.positionHistory.length < 2) {
      return { error: 'positionHistory with at least 2 positions is required' };
    }

    const tier = this.subscriptionService.getUserTier(req.user.id);
    if (!this.subscriptionService.canPerformAction(tier, 'gameReview')) {
      return { error: 'Daily game review limit reached. Upgrade to premium for unlimited reviews.' };
    }

    return this.stockfishService.analyzeGame(body);
  }

  @Post('best-move')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getBestMove(
    @Body() body: { fen: string; depth?: number; timeMs?: number },
    @Request() req: { user: { id: string } },
  ) {
    if (!body.fen) {
      return { error: 'fen is required' };
    }

    const tier = this.subscriptionService.getUserTier(req.user.id);
    if (!this.subscriptionService.canPerformAction(tier, 'gameReview')) {
      return { error: 'Daily analysis limit reached.' };
    }

    return this.stockfishService.getBestMove(body.fen, body.depth, body.timeMs);
  }

  @Post('puzzle-hint')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getPuzzleHint(
    @Body() body: { fen: string },
    @Request() req: { user: { id: string } },
  ) {
    if (!body.fen) {
      return { error: 'fen is required' };
    }

    const tier = this.subscriptionService.getUserTier(req.user.id);
    if (!this.subscriptionService.canPerformAction(tier, 'puzzle')) {
      return { error: 'Daily puzzle limit reached.' };
    }

    return this.stockfishService.getPuzzleHint(body.fen);
  }
}
