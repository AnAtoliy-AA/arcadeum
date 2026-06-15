import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DailyChallengesController } from './daily-challenges.controller';
import { DailyChallengesService } from './daily-challenges.service';
import {
  DailyChallengeDefinition,
  DailyChallengeDefinitionSchema,
} from './schemas/daily-challenge-definition.schema';
import {
  UserDailyChallenge,
  UserDailyChallengeSchema,
} from './schemas/user-daily-challenge.schema';
import { AuthModule } from '../auth/auth.module';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: DailyChallengeDefinition.name,
        schema: DailyChallengeDefinitionSchema,
      },
      { name: UserDailyChallenge.name, schema: UserDailyChallengeSchema },
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => WalletModule),
  ],
  controllers: [DailyChallengesController],
  providers: [DailyChallengesService],
  exports: [DailyChallengesService],
})
export class DailyChallengesModule {}
