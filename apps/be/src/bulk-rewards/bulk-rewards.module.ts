import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../auth/schemas/user.schema';
import { WalletModule } from '../wallet/wallet.module';
import { ShopModule } from '../shop/shop.module';
import { BulkRewardsService } from './bulk-rewards.service';
import { BulkRewardsController } from './bulk-rewards.controller';
import { RolesGuard } from '../auth/guards/roles.guard';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    WalletModule,
    ShopModule,
  ],
  controllers: [BulkRewardsController],
  providers: [BulkRewardsService, RolesGuard],
})
export class BulkRewardsModule {}
