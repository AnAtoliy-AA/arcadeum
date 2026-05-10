import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { WalletModule } from '../wallet/wallet.module';
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

@Module({
  imports: [
    AuthModule,
    WalletModule,
    ConfigModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: EconomySetting.name, schema: EconomySettingSchema },
      { name: EconomySettingsAudit.name, schema: EconomySettingsAuditSchema },
    ]),
  ],
  providers: [EconomySettingsService],
  controllers: [],
  exports: [EconomySettingsService],
})
export class EconomyModule {}
