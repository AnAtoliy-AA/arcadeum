import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import type { AuthenticatedUser } from '../auth/jwt/jwt.strategy';
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { ListAdminAnnouncementsDto } from './dto/list-admin-announcements.dto';
import type {
  AnnouncementAdminItem,
  AnnouncementsAdminListResponse,
} from './interfaces/announcement.interface';

interface RequestWithUser {
  user?: AuthenticatedUser;
}

@Controller('admin/announcements')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminAnnouncementsController {
  constructor(private readonly service: AnnouncementsService) {}

  @Get()
  list(
    @Query() query: ListAdminAnnouncementsDto,
  ): Promise<AnnouncementsAdminListResponse> {
    return this.service.listForAdmin(query);
  }

  @Post()
  create(
    @Body() body: CreateAnnouncementDto,
    @Req() req: RequestWithUser,
  ): Promise<AnnouncementAdminItem> {
    const userId = req.user?.userId ?? '';
    return this.service.create(body, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: UpdateAnnouncementDto,
  ): Promise<AnnouncementAdminItem> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
