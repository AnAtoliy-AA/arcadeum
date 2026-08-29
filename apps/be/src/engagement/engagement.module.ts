import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EngagementController } from './engagement.controller';
import { EngagementService } from './engagement.service';
import {
  EngagementEvent,
  EngagementEventSchema,
} from './schemas/engagement-event.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EngagementEvent.name, schema: EngagementEventSchema },
    ]),
  ],
  controllers: [EngagementController],
  providers: [EngagementService],
  exports: [EngagementService],
})
export class EngagementModule {}
