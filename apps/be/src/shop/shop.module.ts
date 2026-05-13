import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { User, UserSchema } from '../auth/schemas/user.schema';
import { RolesGuard } from '../auth/guards/roles.guard';
import { WalletModule } from '../wallet/wallet.module';
import { EconomyModule } from '../economy/economy.module';
import {
  ShopItemOverride,
  ShopItemOverrideSchema,
} from './schemas/shop-item-override.schema';
import {
  UserInventoryItem,
  UserInventoryItemSchema,
} from './schemas/user-inventory-item.schema';
import {
  ShopAdminAudit,
  ShopAdminAuditSchema,
} from './schemas/shop-admin-audit.schema';
import { CatalogService } from './services/catalog.service';
import { InventoryService } from './services/inventory.service';
import { ShopService } from './services/shop.service';
import { ShopInventoryBootstrap } from './lib/shop-inventory-bootstrap';
import { ShopController } from './shop.controller';
import { AdminShopController } from './admin-shop.controller';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => AuthModule),
    forwardRef(() => WalletModule),
    EconomyModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: ShopItemOverride.name, schema: ShopItemOverrideSchema },
      { name: UserInventoryItem.name, schema: UserInventoryItemSchema },
      { name: ShopAdminAudit.name, schema: ShopAdminAuditSchema },
    ]),
  ],
  controllers: [ShopController, AdminShopController],
  providers: [
    CatalogService,
    InventoryService,
    ShopService,
    ShopInventoryBootstrap,
    RolesGuard,
  ],
  exports: [CatalogService, InventoryService],
})
export class ShopModule {}
