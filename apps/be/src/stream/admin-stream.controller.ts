import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import type { AuthenticatedUser } from '../auth/jwt/jwt.strategy';
import { StreamService } from './stream.service';
import { UpdateStreamSettingsDto } from './dto/update-stream-settings.dto';
import { StreamCommandDto } from './dto/stream-command.dto';

interface RequestWithUser {
  user: AuthenticatedUser;
}

/** Admin-only control of the 24/7 live stream. Same guards as /admin/economy. */
@Controller('admin/stream')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminStreamController {
  constructor(private readonly service: StreamService) {}

  @Get('settings')
  getSettings() {
    return this.service.getSettings();
  }

  @Put('settings')
  updateSettings(
    @Req() req: RequestWithUser,
    @Body() dto: UpdateStreamSettingsDto,
  ) {
    return this.service.updateSettings(dto, req.user.userId);
  }

  @Get('status')
  getStatus() {
    return this.service.getStatus();
  }

  @Get('audit')
  getAudit(@Query('limit') limit?: string) {
    return this.service.getAudit(limit ? parseInt(limit, 10) : undefined);
  }

  @Post('command')
  @HttpCode(HttpStatus.ACCEPTED)
  command(@Req() req: RequestWithUser, @Body() dto: StreamCommandDto) {
    return this.service.enqueueCommand(dto, req.user.userId);
  }
}
