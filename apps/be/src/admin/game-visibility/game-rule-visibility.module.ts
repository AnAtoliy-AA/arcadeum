import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../../auth/auth.module';
import { User, UserSchema } from '../../auth/schemas/user.schema';
import { RolesGuard } from '../../auth/guards/roles.guard';
import {
  GameRuleVisibility,
  GameRuleVisibilitySchema,
} from './game-rule-visibility.schema';
import { GameRuleVisibilityService } from './game-rule-visibility.service';
import { GameRuleVisibilityController } from './game-rule-visibility.controller';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: GameRuleVisibility.name, schema: GameRuleVisibilitySchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [GameRuleVisibilityController],
  providers: [GameRuleVisibilityService, RolesGuard],
  exports: [GameRuleVisibilityService],
})
export class GameRuleVisibilityModule {}
