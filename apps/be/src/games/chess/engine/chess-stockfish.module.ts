/**
 * Stockfish 19 engine module.
 *
 * Provides the Stockfish analysis service for chess games.
 * Engine: Stockfish 19 (latest stable, released 2026-09-05).
 */
import { Module } from '@nestjs/common';
import { ChessStockfishService } from './chess-stockfish.service';

@Module({
  providers: [ChessStockfishService],
  exports: [ChessStockfishService],
})
export class ChessStockfishModule {}
