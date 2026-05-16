import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { EconomySettingsService } from './economy-settings.service';
import { SetEconomyValueDto } from './dto/set-economy-value.dto';
import { isEconomyKey } from './economy-keys';
import type { AuthenticatedUser } from '../auth/jwt/jwt.strategy';

interface RequestWithUser {
  user: AuthenticatedUser;
}

@Controller('admin/economy')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminEconomyController {
  constructor(private readonly service: EconomySettingsService) {}

  @Get()
  list() {
    return this.service.listAll();
  }

  @Post('refresh-cache')
  @HttpCode(HttpStatus.NO_CONTENT)
  refresh() {
    this.service.refreshCache();
  }

  @Get(':key/audit')
  audit(@Param('key') key: string, @Query('limit') limit?: string) {
    if (!isEconomyKey(key)) {
      throw new NotFoundException('economy.keyNotFound');
    }
    const parsedLimit =
      limit !== undefined ? Math.max(parseInt(limit, 10), 1) : undefined;
    return this.service.getAuditFor(key, { limit: parsedLimit });
  }

  @Put(':key')
  async set(
    @Req() req: RequestWithUser,
    @Param('key') key: string,
    @Body() dto: SetEconomyValueDto,
  ) {
    if (!isEconomyKey(key)) {
      throw new NotFoundException('economy.keyNotFound');
    }
    await this.service.setNumber(key, dto.value, req.user.userId);
    const all = await this.service.listAll();
    return all.find((v) => v.key === key);
  }

  @Delete(':key')
  @HttpCode(HttpStatus.NO_CONTENT)
  async reset(@Req() req: RequestWithUser, @Param('key') key: string) {
    if (!isEconomyKey(key)) {
      throw new NotFoundException('economy.keyNotFound');
    }
    await this.service.resetToDefault(key, req.user.userId);
  }
}
