import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GameVisibility, GameVisibilitySchema } from './game-visibility.schema';
import { GameVisibilityService } from './game-visibility.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GameVisibility.name, schema: GameVisibilitySchema },
    ]),
  ],
  providers: [GameVisibilityService],
  exports: [GameVisibilityService, MongooseModule],
})
export class GameVisibilityModule {}
