import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { CatalogService } from './services/catalog.service';
import { InventoryService } from './services/inventory.service';
import { ShopService } from './services/shop.service';
import { PurchaseItemDto } from './dto/purchase-item.dto';
import { SellItemDto } from './dto/sell-item.dto';
import { EquipItemDto } from './dto/equip-item.dto';
import { UnequipItemDto } from './dto/unequip-item.dto';
import type { AuthenticatedUser } from '../auth/jwt/jwt.strategy';
import {
  isShopCategory,
  isShopRarity,
  type ShopCategory,
  type ShopRarity,
} from './lib/shop-types';

interface ListCatalogQuery {
  category?: string;
  rarity?: string;
}

@Controller('shop')
export class ShopController {
  constructor(
    private readonly catalog: CatalogService,
    private readonly inventory: InventoryService,
    private readonly shop: ShopService,
  ) {}

  // Public — bot-crawlable for SEO of featured cosmetics.
  @Get('catalog')
  async listCatalog(@Query() query: ListCatalogQuery) {
    const category: ShopCategory | undefined =
      query.category && isShopCategory(query.category)
        ? query.category
        : undefined;
    const rarity: ShopRarity | undefined =
      query.rarity && isShopRarity(query.rarity) ? query.rarity : undefined;
    return this.catalog.listEffective({ category, rarity });
  }

  @Get('inventory')
  @UseGuards(JwtAuthGuard)
  listInventory(@Req() req: { user: AuthenticatedUser }) {
    return this.inventory.listForUser(req.user.userId);
  }

  @Post('purchase')
  @UseGuards(JwtAuthGuard)
  purchase(
    @Req() req: { user: AuthenticatedUser },
    @Body() dto: PurchaseItemDto,
  ) {
    return this.shop.purchase(req.user.userId, dto.itemId, dto.purchaseId);
  }

  @Post('sell')
  @UseGuards(JwtAuthGuard)
  sell(@Req() req: { user: AuthenticatedUser }, @Body() dto: SellItemDto) {
    return this.shop.sellBack(req.user.userId, dto.purchaseId);
  }

  @Post('equip')
  @UseGuards(JwtAuthGuard)
  equip(@Req() req: { user: AuthenticatedUser }, @Body() dto: EquipItemDto) {
    return this.inventory.equip(req.user.userId, dto.itemId);
  }

  @Post('unequip')
  @UseGuards(JwtAuthGuard)
  unequip(
    @Req() req: { user: AuthenticatedUser },
    @Body() dto: UnequipItemDto,
  ) {
    return this.inventory.unequip(req.user.userId, dto.category);
  }
}
