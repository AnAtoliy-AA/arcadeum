import { Controller, Get, Param } from '@nestjs/common';
import { ChessTournamentService } from './chess-tournament.service';

@Controller('chess/tournaments')
export class ChessTournamentController {
  constructor(private readonly tournamentService: ChessTournamentService) {}

  @Get(':id/arena-standings')
  async getArenaStandings(@Param('id') id: string) {
    const standings = await this.tournamentService.getArenaStandings(id);
    return { standings };
  }

  @Get(':id/swiss-standings')
  async getSwissStandings(@Param('id') id: string) {
    const standings = await this.tournamentService.getSwissStandings(id);
    return { standings };
  }
}
