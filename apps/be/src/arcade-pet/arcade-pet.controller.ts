import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import type { AuthenticatedUser } from '../auth/jwt/jwt.strategy';
import { ArcadePetService } from './arcade-pet.service';
import { HatchPetDto, PetActionDto } from './dto/arcade-pet.dto';

@Controller('arcade-pet')
export class ArcadePetController {
  constructor(private readonly service: ArcadePetService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMyPet(@Req() req: Request) {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) throw new UnauthorizedException();
    return this.service.getOrCreatePet(user.userId);
  }

  @Post('hatch')
  @UseGuards(JwtAuthGuard)
  async hatch(@Req() req: Request, @Body() dto: HatchPetDto) {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) throw new UnauthorizedException();
    return this.service.hatchPet(user.userId, dto);
  }

  @Post('action')
  @UseGuards(JwtAuthGuard)
  async action(@Req() req: Request, @Body() dto: PetActionDto) {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) throw new UnauthorizedException();
    return this.service.executeAction(user.userId, dto);
  }
}
