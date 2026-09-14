import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { XpSettingsService } from './xp-settings.service';
import { UpdateXpSettingsDto } from './dto/update-xp-settings.dto';
import type { AuthenticatedUser } from '../auth/jwt/jwt.strategy';

interface RequestWithUser {
  user: AuthenticatedUser;
}

/** Only allow alphanumeric, hyphens, underscores, and dots in scope names. */
function isValidScope(scope: string): boolean {
  return /^[a-zA-Z0-9_.-]+$/.test(scope);
}

@Controller('admin/xp-settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminXpSettingsController {
  constructor(private readonly service: XpSettingsService) {}

  @Get()
  list() {
    return this.service.listAll();
  }

  @Put(':scope')
  async update(
    @Req() req: RequestWithUser,
    @Param('scope') scope: string,
    @Body() dto: UpdateXpSettingsDto,
  ) {
    if (!isValidScope(scope)) {
      return { error: 'Invalid scope name' };
    }
    await this.service.updateSettings(scope, dto, req.user.userId);
    const all = await this.service.listAll();
    return all.find((s) => s.scope === scope);
  }

  @Delete(':scope')
  @HttpCode(HttpStatus.NO_CONTENT)
  async reset(@Param('scope') scope: string) {
    if (!isValidScope(scope)) {
      return;
    }
    await this.service.resetToDefaults(scope);
  }
}
