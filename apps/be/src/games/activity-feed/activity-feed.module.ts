import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivityFeedController } from './activity-feed.controller';
import { ActivityFeedService } from './activity-feed.service';
import {
  ActivityFeedItem,
  ActivityFeedItemSchema,
} from './activity-feed.schema';
import { User, UserSchema } from '../../auth/schemas/user.schema';
import { OCI_CONNECTION } from '../../common/providers/mongo-connections.provider';

/**
 * Global so feature modules (tournaments, achievements) can inject the
 * feed with `@Optional()` without importing the OCI connection; test
 * modules that do not load it simply get no feed.
 */
@Global()
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
    // Read-only: public display names/cosmetics for feed participants.
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [ActivityFeedController],
  providers: [ActivityFeedService],
  exports: [ActivityFeedService],
})
export class ActivityFeedModule {}
