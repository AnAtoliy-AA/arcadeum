/**
 * Stockfish 19 engine module.
 *
 * Provides the Stockfish analysis service for chess games.
 * Engine: Stockfish 19 (latest stable, released 2026-09-05).
 */
import { Module } from '@nestjs/common';
import { ChessStockfishService } from './chess-stockfish.service';
import { EconomyModule } from '../../../economy/economy.module';
import { TablebaseModule } from './tablebase.module';
import { ChessSubscriptionModule } from '../subscription/chess-subscription.module';

@Module({
  imports: [EconomyModule, TablebaseModule, ChessSubscriptionModule],
  providers: [ChessStockfishService],
  exports: [ChessStockfishService],
})
export class ChessStockfishModule {}
