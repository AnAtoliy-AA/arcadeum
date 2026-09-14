import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivityFeedController } from './activity-feed.controller';
import { ActivityFeedService } from './activity-feed.service';
import {
  ActivityFeedItem,
  ActivityFeedItemSchema,
} from './activity-feed.schema';
import { OCI_CONNECTION } from '../../common/providers/mongo-connections.provider';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        {
          name: ActivityFeedItem.name,
          schema: ActivityFeedItemSchema,
        },
      ],
      OCI_CONNECTION,
    ),
  ],
  controllers: [ActivityFeedController],
  providers: [ActivityFeedService],
  exports: [ActivityFeedService],
})
export class ActivityFeedModule {}
