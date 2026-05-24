import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Post,
  Put,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { Types } from 'mongoose';
import type { AuthenticatedUser } from '../auth/jwt/jwt.strategy';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { NotificationsService } from './notifications.service';
import { CreateSubscriptionDto } from './dtos/create-subscription.dto';
import { DeleteSubscriptionDto } from './dtos/delete-subscription.dto';
import { UpdatePreferencesDto } from './dtos/update-preferences.dto';
import { MarkReadDto } from './dtos/mark-read.dto';
import { ListInboxQueryDto } from './dtos/list-inbox.dto';
import type { NotificationDocument } from './schemas/notification.schema';

function requireUser(req: Request): AuthenticatedUser {
  const user = req.user as AuthenticatedUser | undefined;
  if (!user) throw new UnauthorizedException();
  return user;
}

export type InboxItemResponse = {
  id: string;
  category: string;
  titleKey: string;
  bodyKey: string;
  i18nParams: Record<string, unknown>;
  url: string;
  data: Record<string, unknown>;
  read: boolean;
  createdAt: string;
};

function toResponse(doc: NotificationDocument): InboxItemResponse {
  const raw = (doc as { _id?: unknown })._id;
  let id = '';
  if (raw instanceof Types.ObjectId) {
    id = raw.toHexString();
  } else if (typeof raw === 'string') {
    id = raw;
  }
  return {
    id,
    category: doc.category,
    titleKey: doc.titleKey,
    bodyKey: doc.bodyKey,
    i18nParams: doc.i18nParams,
    url: doc.url,
    data: doc.data,
    read: doc.read,
    createdAt: doc.createdAt.toISOString(),
  };
}

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly service: NotificationsService,
    private readonly config: ConfigService,
  ) {}

  @Get('vapid-public-key')
  getVapidPublicKey(): { publicKey: string } {
    return { publicKey: this.config.get<string>('VAPID_PUBLIC_KEY') ?? '' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('subscriptions')
  @HttpCode(204)
  async addSubscription(
    @Req() req: Request,
    @Body() body: CreateSubscriptionDto,
  ): Promise<void> {
    const user = requireUser(req);
    await this.service.addSubscription(user.userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('subscriptions')
  @HttpCode(204)
  async removeSubscription(
    @Req() req: Request,
    @Body() body: DeleteSubscriptionDto,
  ): Promise<void> {
    const user = requireUser(req);
    await this.service.removeSubscription(user.userId, body.endpoint);
  }

  @UseGuards(JwtAuthGuard)
  @Get('preferences')
  async getPreferences(@Req() req: Request) {
    const user = requireUser(req);
    return this.service.getPreferences(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('preferences')
  async updatePreferences(
    @Req() req: Request,
    @Body() body: UpdatePreferencesDto,
  ) {
    const user = requireUser(req);
    return this.service.updatePreferences(user.userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async listInbox(
    @Req() req: Request,
    @Query() query: ListInboxQueryDto,
  ): Promise<InboxItemResponse[]> {
    const user = requireUser(req);
    const items = await this.service.listInbox(user.userId, {
      limit: query.limit,
      before: query.before,
    });
    return items.map(toResponse);
  }

  @UseGuards(JwtAuthGuard)
  @Get('unread-count')
  async unreadCount(@Req() req: Request): Promise<{ count: number }> {
    const user = requireUser(req);
    const count = await this.service.unreadCount(user.userId);
    return { count };
  }

  @UseGuards(JwtAuthGuard)
  @Post('read')
  @HttpCode(204)
  async markRead(
    @Req() req: Request,
    @Body() body: MarkReadDto,
  ): Promise<void> {
    const user = requireUser(req);
    await this.service.markRead(user.userId, {
      ids: body.ids,
      all: body.all,
    });
  }
}
