import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { PaymentsModule } from '../payments/payments.module';
import { WalletModule } from '../wallet/wallet.module';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User, UserSchema } from '../auth/schemas/user.schema';
import { GemPackage, GemPackageSchema } from './schemas/gem-package.schema';
import { GemPurchase, GemPurchaseSchema } from './schemas/gem-purchase.schema';
import { GemPackagesService } from './services/gem-packages.service';
import { GemPurchasesService } from './services/gem-purchases.service';
import { GemConversionService } from './services/gem-conversion.service';
import { PublicGemPackagesController } from './controllers/public-gem-packages.controller';
import { AdminGemPackagesController } from './controllers/admin-gem-packages.controller';
import { GemPurchasesController } from './controllers/gem-purchases.controller';
import { GemConversionController } from './controllers/gem-conversion.controller';
import { GemConversionInfoController } from './controllers/gem-conversion-info.controller';

/**
 * GemsModule — Phase 5+6.
 * Provides gem package CRUD (admin), public listing, purchase flows,
 * and the gem-to-coin conversion service + endpoints.
 */
@Module({
  imports: [
    AuthModule,
    PaymentsModule,
    WalletModule,
    ConfigModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: GemPackage.name, schema: GemPackageSchema },
      { name: GemPurchase.name, schema: GemPurchaseSchema },
    ]),
  ],
  controllers: [
    PublicGemPackagesController,
    AdminGemPackagesController,
    GemPurchasesController,
    GemConversionController,
    GemConversionInfoController,
  ],
  providers: [
    GemPackagesService,
    GemPurchasesService,
    GemConversionService,
    RolesGuard,
  ],
  exports: [GemPackagesService, GemPurchasesService, GemConversionService],
})
export class GemsModule {}
