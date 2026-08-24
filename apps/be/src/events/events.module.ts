import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GameNightEvent, GameNightEventSchema } from './schemas/event.schema';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GameNightEvent.name, schema: GameNightEventSchema },
    ]),
  ],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
