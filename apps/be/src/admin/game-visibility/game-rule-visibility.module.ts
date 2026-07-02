import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  GameRuleVisibility,
  GameRuleVisibilitySchema,
} from './game-rule-visibility.schema';
import { GameRuleVisibilityService } from './game-rule-visibility.service';
import { GameRuleVisibilityController } from './game-rule-visibility.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: GameRuleVisibility.name,
        schema: GameRuleVisibilitySchema,
      },
    ]),
  ],
  controllers: [GameRuleVisibilityController],
  providers: [GameRuleVisibilityService],
  exports: [GameRuleVisibilityService],
})
export class GameRuleVisibilityModule {}
