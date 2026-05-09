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
import { TournamentsService } from './tournaments.service';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';
import { ListAdminTournamentsDto } from './dto/list-admin-tournaments.dto';
import { TransitionStatusDto } from './dto/transition-status.dto';
import type {
  AdminTournamentItem,
  AdminTournamentsListResponse,
  RegistrationsListResponse,
} from './interfaces/tournament.interface';

interface RequestWithUser {
  user?: AuthenticatedUser;
}

@Controller('admin/tournaments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminTournamentsController {
  constructor(private readonly service: TournamentsService) {}

  @Get()
  list(
    @Query() query: ListAdminTournamentsDto,
  ): Promise<AdminTournamentsListResponse> {
    return this.service.listForAdmin(query);
  }

  @Post()
  create(
    @Body() body: CreateTournamentDto,
    @Req() req: RequestWithUser,
  ): Promise<AdminTournamentItem> {
    return this.service.create(body, req.user?.userId ?? '');
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: UpdateTournamentDto,
  ): Promise<AdminTournamentItem> {
    return this.service.update(id, body);
  }

  @Post(':id/transition')
  transition(
    @Param('id') id: string,
    @Body() body: TransitionStatusDto,
  ): Promise<AdminTournamentItem> {
    return this.service.transition(id, body.to, body.resultText);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }

  @Get(':id/registrations')
  listRegistrations(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ): Promise<RegistrationsListResponse> {
    return this.service.listRegistrations(
      id,
      page ? Number(page) : 1,
      pageSize ? Number(pageSize) : 50,
    );
  }
}
