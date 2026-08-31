import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SocialRewardClaim,
  SocialRewardClaimSchema,
} from './schemas/social-reward-claim.schema';
import { SocialRewardsService } from './social-rewards.service';
import { SocialRewardsController } from './social-rewards.controller';
import { WalletModule } from '../wallet/wallet.module';
import { EconomyModule } from '../economy/economy.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SocialRewardClaim.name, schema: SocialRewardClaimSchema },
    ]),
    WalletModule,
    EconomyModule,
  ],
  controllers: [SocialRewardsController],
  providers: [SocialRewardsService],
  exports: [SocialRewardsService],
})
export class SocialRewardsModule {}
