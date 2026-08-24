import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { EventsService } from './events.service';
import { CreateEventDto, UpdateEventDto, RecordMatchDto } from './dto';
import type { EventStatus } from './schemas/event.schema';
import type { AuthenticatedUser } from '../auth/jwt/jwt.strategy';

interface RequestWithUser {
  user: AuthenticatedUser;
}

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  getEvents(
    @Query('status') status?: EventStatus,
    @Query('limit') limit?: string,
  ) {
    return this.eventsService.getEvents({
      status,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('featured')
  getFeaturedEvent() {
    return this.eventsService.getFeaturedEvent();
  }

  @Get(':id')
  getEventById(@Param('id') id: string) {
    return this.eventsService.getEventById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  createEvent(@Body() dto: CreateEventDto) {
    return this.eventsService.createEvent(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  updateEvent(@Param('id') id: string, @Body() dto: UpdateEventDto) {
    return this.eventsService.updateEvent(id, dto);
  }

  @Post(':id/join')
  @UseGuards(JwtAuthGuard)
  joinEvent(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.eventsService.joinEvent(
      id,
      req.user.userId,
      req.user.username || 'Player',
    );
  }

  @Post(':id/record-match')
  @UseGuards(JwtAuthGuard)
  recordMatch(@Param('id') id: string, @Body() dto: RecordMatchDto) {
    return this.eventsService.recordMatchResult(id, dto);
  }
}
