import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/jwt/jwt.guard';
import { ChessClubsService } from './chess-clubs.service';

@Controller('chess/clubs')
@UseGuards(JwtAuthGuard)
export class ChessClubsController {
  constructor(private readonly clubsService: ChessClubsService) {}

  @Post()
  create(
    @Req() req: { user: { userId: string } },
    @Body() body: { name: string; description?: string; visibility?: 'public' | 'private' },
  ) {
    return this.clubsService.createClub(
      body.name,
      req.user.userId,
      body.description,
      body.visibility,
    );
  }

  @Get('search')
  search(@Query('q') query: string, @Query('limit') limit?: string) {
    return this.clubsService.searchClubs(query, limit ? Number(limit) : 20);
  }

  @Get('my')
  myClubs(@Req() req: { user: { userId: string } }) {
    return this.clubsService.getUserClubs(req.user.userId);
  }

  @Get(':id')
  getClub(@Param('id') id: string) {
    return this.clubsService.getClub(id);
  }

  @Post(':id/join')
  join(@Param('id') id: string, @Req() req: { user: { userId: string } }) {
    return this.clubsService.joinClub(id, req.user.userId);
  }

  @Post(':id/leave')
  leave(@Param('id') id: string, @Req() req: { user: { userId: string } }) {
    return this.clubsService.leaveClub(id, req.user.userId);
  }

  @Post(':id/admin/:userId')
  addAdmin(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Req() req: { user: { userId: string } },
  ) {
    return this.clubsService.addAdmin(id, req.user.userId, userId);
  }

  @Get(':id/members')
  members(@Param('id') id: string) {
    return this.clubsService.getClubMembers(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Req() req: { user: { userId: string } }) {
    return this.clubsService.deleteClub(id, req.user.userId);
  }
}
