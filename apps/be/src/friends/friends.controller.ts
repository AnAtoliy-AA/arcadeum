import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { FriendsService } from './friends.service';
import { SendFriendRequestDto } from './dto/send-friend-request.dto';
import type { AuthenticatedUser } from '../auth/jwt/jwt.strategy';

interface RequestWithUser {
  user: AuthenticatedUser;
}

@Controller('friends')
@UseGuards(JwtAuthGuard)
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Post('request')
  sendRequest(@Req() req: RequestWithUser, @Body() dto: SendFriendRequestDto) {
    return this.friendsService.sendRequest(req.user.userId, dto.username);
  }

  @Post('accept/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  acceptRequest(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.friendsService.acceptRequest(req.user.userId, id);
  }

  @Post('decline/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  declineRequest(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.friendsService.declineRequest(req.user.userId, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeFriend(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.friendsService.removeFriend(req.user.userId, id);
  }

  @Get()
  getFriends(@Req() req: RequestWithUser) {
    return this.friendsService.getFriends(req.user.userId);
  }

  @Get('pending')
  getPendingRequests(@Req() req: RequestWithUser) {
    return this.friendsService.getPendingRequests(req.user.userId);
  }

  @Get('online')
  getOnlineFriends(@Req() req: RequestWithUser) {
    return this.friendsService.getOnlineFriendIds(req.user.userId);
  }
}
