import { Module } from '@nestjs/common';
import { ChessBattlePassService } from './chess-battlepass.service';

@Module({
  providers: [ChessBattlePassService],
  exports: [ChessBattlePassService],
})
export class ChessBattlePassModule {}
