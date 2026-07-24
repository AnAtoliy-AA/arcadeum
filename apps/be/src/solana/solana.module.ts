import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { SolanaService } from './solana.service';
import { SolanaController } from './solana.controller';
import { SolanaPayController } from './solana-pay.controller';
import { SolanaPayService } from './lib/solana-pay.service';
import { WalletModule } from '../wallet/wallet.module';
import { EconomyModule } from '../economy/economy.module';
import {
  GeoBlockService,
  GeoBlockGuard,
} from '../common/guards/geo-block.guard';
import { GeoBlockBootstrap } from '../common/lib/geo-block-bootstrap';
import { AdminGeoBlockController } from '../common/admin-geo-block.controller';
import {
  GeoBlockedCountry,
  GeoBlockedCountrySchema,
} from '../common/schemas/geo-blocked-country.schema';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User, UserSchema } from '../auth/schemas/user.schema';

@Module({
  imports: [
    ConfigModule,
    WalletModule,
    EconomyModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: GeoBlockedCountry.name, schema: GeoBlockedCountrySchema },
    ]),
  ],
  controllers: [SolanaController, SolanaPayController, AdminGeoBlockController],
  providers: [
    SolanaService,
    SolanaPayService,
    GeoBlockService,
    GeoBlockGuard,
    GeoBlockBootstrap,
    RolesGuard,
  ],
  exports: [SolanaService, SolanaPayService, GeoBlockService, GeoBlockGuard],
})
export class SolanaModule {}
