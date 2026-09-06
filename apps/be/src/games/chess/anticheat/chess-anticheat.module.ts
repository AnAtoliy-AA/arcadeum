import { Module } from '@nestjs/common';
import { ChessAnticheatService } from './chess-anticheat.service';

@Module({
  providers: [ChessAnticheatService],
  exports: [ChessAnticheatService],
})
export class ChessAnticheatModule {}
