import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import {
  EconomySetting,
  EconomySettingSchema,
} from './schemas/economy-setting.schema';
import {
  EconomySettingsAudit,
  EconomySettingsAuditSchema,
} from './schemas/economy-settings-audit.schema';
import { User, UserSchema } from '../auth/schemas/user.schema';
import { EconomySettingsService } from './economy-settings.service';
import { AdminEconomyController } from './admin-economy.controller';
import { RolesGuard } from '../auth/guards/roles.guard';

/**
 * EconomyModule does NOT import AuthModule or WalletModule to avoid
 * circular dependencies:
 *   EconomyModule → AuthModule → ReferralModule → EconomyModule
 *   EconomyModule → WalletModule → AuthModule → ReferralModule → EconomyModule
 *
 * JwtAuthGuard works via the globally-registered JWT passport strategy
 * (set up in AuthModule which AppModule always loads first).
 * WalletService.MAX_TRANSACTION_AMOUNT is a static constant — no WalletModule
 * instance injection is required.
 * RolesGuard is provided locally.
 */
@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: EconomySetting.name, schema: EconomySettingSchema },
      { name: EconomySettingsAudit.name, schema: EconomySettingsAuditSchema },
    ]),
  ],
  providers: [EconomySettingsService, RolesGuard],
  controllers: [AdminEconomyController],
  exports: [EconomySettingsService],
})
export class EconomyModule {}
