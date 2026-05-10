import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { RolesGuard } from '../auth/guards/roles.guard';
import { GemPackage, GemPackageSchema } from './schemas/gem-package.schema';
import { GemPurchase, GemPurchaseSchema } from './schemas/gem-purchase.schema';
import { GemPackagesService } from './services/gem-packages.service';
import { PublicGemPackagesController } from './controllers/public-gem-packages.controller';
import { AdminGemPackagesController } from './controllers/admin-gem-packages.controller';

/**
 * GemsModule — Phase 3 stub.
 * Provides gem package CRUD (admin) and public listing.
 * Phases 4–6 will add GemPurchasesService, GemConversionService,
 * and the remaining controllers.
 */
@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: GemPackage.name, schema: GemPackageSchema },
      { name: GemPurchase.name, schema: GemPurchaseSchema },
    ]),
  ],
  controllers: [PublicGemPackagesController, AdminGemPackagesController],
  providers: [GemPackagesService, RolesGuard],
  exports: [GemPackagesService],
})
export class GemsModule {}
