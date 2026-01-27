import {
  Body,
  BadRequestException,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
  Param,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { ChatService, ChatSummary, MessageView } from './chat.service';
import { CreateChatDto } from './dtos';

export type AuthenticatedRequest = Request & {
  user?: {
    userId?: string;
  };
};

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async listChats(@Req() req: AuthenticatedRequest): Promise<ChatSummary[]> {
    const userId = req.user?.userId;
    if (!userId) {
      throw new UnauthorizedException('User context missing');
    }
    return this.chatService.listChatsForUser(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':chatId/messages')
  async getMessages(@Param('chatId') chatId: string): Promise<MessageView[]> {
    if (!chatId) {
      throw new BadRequestException('Chat ID is required');
    }
    return this.chatService.getMessagesByChatId(chatId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createChat(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateChatDto,
  ): Promise<ChatSummary> {
    const userId = req.user?.userId;
    if (!userId) {
      throw new UnauthorizedException('User context missing');
    }

    const participants = new Set<string>();
    participants.add(userId);

    if (Array.isArray(dto.users)) {
      dto.users.forEach((id) => {
        if (typeof id === 'string') {
          const trimmed = id.trim();
          if (trimmed) {
            participants.add(trimmed);
          }
        }
      });
    }

    if (participants.size < 2) {
      throw new BadRequestException(
        'Provide at least one additional participant',
      );
    }

    return this.chatService.createChatForUsers(
      Array.from(participants),
      dto.chatId,
    );
  }
}
