import { Module } from '@nestjs/common';
import { ChessSubscriptionService } from './chess-subscription.service';

@Module({
  providers: [ChessSubscriptionService],
  exports: [ChessSubscriptionService],
})
export class ChessSubscriptionModule {}
