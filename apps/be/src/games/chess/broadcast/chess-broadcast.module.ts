import { Module } from '@nestjs/common';
import { ChessBroadcastService } from './chess-broadcast.service';
import { ChessBroadcastGateway } from './chess-broadcast.gateway';

@Module({
  providers: [ChessBroadcastService, ChessBroadcastGateway],
  exports: [ChessBroadcastService],
})
export class ChessBroadcastModule {}
