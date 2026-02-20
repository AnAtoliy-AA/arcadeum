import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReferralController } from './referral.controller';
import { BadgesController } from './badges.controller';
import { ReferralService } from './referral.service';
import { Referral, ReferralSchema } from './schemas/referral.schema';
import {
  ReferralReward,
  ReferralRewardSchema,
} from './schemas/referral-reward.schema';
import { User, UserSchema } from '../auth/schemas/user.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Referral.name, schema: ReferralSchema },
      { name: ReferralReward.name, schema: ReferralRewardSchema },
      { name: User.name, schema: UserSchema },
    ]),
    forwardRef(() => AuthModule),
  ],
  controllers: [ReferralController, BadgesController],
  providers: [ReferralService],
  exports: [ReferralService],
})
export class ReferralModule {}
