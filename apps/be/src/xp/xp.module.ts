import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { XpSettings, XpSettingsSchema } from './schemas/xp-settings.schema';
import { XpSettingsService } from './xp-settings.service';
import { AdminXpSettingsController } from './admin-xp-settings.controller';
import { PrestigeService } from './prestige.service';
import { PrestigeController } from './prestige.controller';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User, UserSchema } from '../auth/schemas/user.schema';

/**
 * XpModule does NOT import AuthModule to avoid circular dependencies.
 * RolesGuard is provided locally (same pattern as EconomyModule).
 * User model and XpSettings are both on the default connection.
 */
import {
  UserInventoryItem,
  UserInventoryItemSchema,
} from '../shop/schemas/user-inventory-item.schema';
import { WalletModule } from '../wallet/wallet.module';
import { LevelRewardsService } from './level-rewards.service';
import { LevelRewardsController } from './level-rewards.controller';
import { BackfillXpService } from './backfill-xp.service';
import { AdminXpBackfillController } from './admin-xp-backfill.controller';
import {
  PlayerStats,
  PlayerStatsSchema,
} from '../games/schemas/player-stats.schema';

@Module({
  imports: [
    ConfigModule,
    WalletModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: XpSettings.name, schema: XpSettingsSchema },
      { name: UserInventoryItem.name, schema: UserInventoryItemSchema },
      { name: PlayerStats.name, schema: PlayerStatsSchema },
    ]),
  ],
  providers: [
    XpSettingsService,
    PrestigeService,
    LevelRewardsService,
    BackfillXpService,
    RolesGuard,
  ],
  controllers: [
    AdminXpSettingsController,
    PrestigeController,
    LevelRewardsController,
    AdminXpBackfillController,
  ],
  exports: [XpSettingsService, PrestigeService, LevelRewardsService],
})
export class XpModule {}
