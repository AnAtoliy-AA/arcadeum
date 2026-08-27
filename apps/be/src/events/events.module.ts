import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GameNightEvent, GameNightEventSchema } from './schemas/event.schema';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { User, UserSchema } from '../auth/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GameNightEvent.name, schema: GameNightEventSchema },
      // RolesGuard (used by the controller's admin-only routes) re-reads the
      // user's role/block state per request and needs the User model.
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
