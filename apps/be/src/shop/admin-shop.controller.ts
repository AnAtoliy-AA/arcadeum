import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { CatalogService } from './services/catalog.service';
import { InventoryService } from './services/inventory.service';
import { ShopService } from './services/shop.service';
import { SetItemOverrideDto } from './dto/set-item-override.dto';
import { GrantItemDto } from './dto/grant-item.dto';
import { RevokeItemDto } from './dto/revoke-item.dto';
import type { AuthenticatedUser } from '../auth/jwt/jwt.strategy';

@Controller('admin/shop')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminShopController {
  constructor(
    private readonly catalog: CatalogService,
    private readonly inventory: InventoryService,
    private readonly shop: ShopService,
  ) {}

  // Full catalog including unavailable entries (admin view).
  @Get('catalog')
  listCatalog() {
    return this.catalog.listEffective({ includeUnavailable: true });
  }

  @Patch('overrides/:itemId')
  setOverride(
    @Req() req: { user: AuthenticatedUser },
    @Param('itemId') itemId: string,
    @Body() dto: SetItemOverrideDto,
  ) {
    return this.shop.setOverride(itemId, dto, req.user.userId);
  }

  @Post('grant')
  grant(@Req() req: { user: AuthenticatedUser }, @Body() dto: GrantItemDto) {
    return this.shop.grant(
      dto.userId,
      dto.itemId,
      req.user.userId,
      dto.reason,
      dto.nonce,
    );
  }

  @Get('users/:userId/inventory')
  userInventory(@Param('userId') userId: string) {
    return this.inventory.listForUser(userId);
  }

  @Post('inventory/:rowId/revoke')
  revoke(
    @Req() req: { user: AuthenticatedUser },
    @Param('rowId') rowId: string,
    @Body() dto: RevokeItemDto,
  ) {
    return this.shop.revoke(rowId, req.user.userId, dto.reason);
  }
}
