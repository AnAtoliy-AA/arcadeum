import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AchievementsController } from './achievements.controller';
import { AchievementsService } from './achievements.service';
import {
  AchievementDefinition,
  AchievementDefinitionSchema,
} from './schemas/achievement-definition.schema';
import {
  UserAchievement,
  UserAchievementSchema,
} from './schemas/user-achievement.schema';
import { AuthModule } from '../auth/auth.module';
import { WalletModule } from '../wallet/wallet.module';
import { GamesModule } from '../games/games.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: AchievementDefinition.name,
        schema: AchievementDefinitionSchema,
      },
      { name: UserAchievement.name, schema: UserAchievementSchema },
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => WalletModule),
    forwardRef(() => GamesModule),
  ],
  controllers: [AchievementsController],
  providers: [AchievementsService],
  exports: [AchievementsService],
})
export class AchievementsModule {}
