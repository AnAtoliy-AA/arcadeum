import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ChessOpeningsService } from './chess-openings.service';
import { JwtAuthGuard } from '../../../auth/jwt/jwt.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/guards/roles.decorator';
import {
  ClassifyOpeningDto,
  ImportOpeningsDto,
} from './dto/import-openings.dto';

@Controller('chess/openings')
export class ChessOpeningsController {
  constructor(private readonly openingsService: ChessOpeningsService) {}

  @Get('explorer')
  async getExplorer(
    @Query('fen') fen: string,
    @Query('playerLevel') playerLevel?: string,
  ) {
    if (!fen) {
      return { error: 'fen is required' };
    }
    return this.openingsService.getExplorer(fen, playerLevel);
  }

  @Get('name')
  async getOpeningName(@Query('eco') eco: string) {
    if (!eco) {
      return { error: 'eco is required' };
    }
    return this.openingsService.getOpeningName(eco);
  }

  @Get('popular')
  async getPopularOpenings(@Query('limit') limit?: string) {
    return this.openingsService.getPopularOpenings(
      limit ? parseInt(limit, 10) : 20,
    );
  }

  /** Bulk opening import: admin only (was unauthenticated). */
  @Post('import')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async importOpenings(@Body() body: ImportOpeningsDto) {
    return this.openingsService.importOpenings(body.openings);
  }

  /** Public, read-only classification of a move list. */
  @Post('classify')
  async classifyOpening(@Body() body: ClassifyOpeningDto) {
    return this.openingsService.classifyOpening(body.moves);
  }
}
