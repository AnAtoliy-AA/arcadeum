import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { PaymentsModule } from '../payments/payments.module';
import { WalletModule } from '../wallet/wallet.module';
import { RolesGuard } from '../auth/guards/roles.guard';
import { GemPackage, GemPackageSchema } from './schemas/gem-package.schema';
import { GemPurchase, GemPurchaseSchema } from './schemas/gem-purchase.schema';
import { GemPackagesService } from './services/gem-packages.service';
import { GemPurchasesService } from './services/gem-purchases.service';
import { PublicGemPackagesController } from './controllers/public-gem-packages.controller';
import { AdminGemPackagesController } from './controllers/admin-gem-packages.controller';
import { GemPurchasesController } from './controllers/gem-purchases.controller';

/**
 * GemsModule — Phase 4.
 * Provides gem package CRUD (admin), public listing, and purchase flows.
 * Phases 5–6 will add GemConversionService and the remaining controllers.
 */
@Module({
  imports: [
    AuthModule,
    PaymentsModule,
    WalletModule,
    MongooseModule.forFeature([
      { name: GemPackage.name, schema: GemPackageSchema },
      { name: GemPurchase.name, schema: GemPurchaseSchema },
    ]),
  ],
  controllers: [
    PublicGemPackagesController,
    AdminGemPackagesController,
    GemPurchasesController,
  ],
  providers: [GemPackagesService, GemPurchasesService, RolesGuard],
  exports: [GemPackagesService, GemPurchasesService],
})
export class GemsModule {}
