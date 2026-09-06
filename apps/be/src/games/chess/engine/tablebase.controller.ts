import { Controller, Get, Query } from '@nestjs/common';
import { SyzygyTablebaseService } from './syzygy.service';

@Controller('chess/tablebase')
export class TablebaseController {
  constructor(private readonly tablebaseService: SyzygyTablebaseService) {}

  @Get('probe')
  async probe(@Query('fen') fen: string) {
    if (!fen) {
      return { error: 'fen is required' };
    }
    const result = await this.tablebaseService.probe(fen);
    if (!result) {
      return { error: 'Position not in tablebase or tablebase disabled' };
    }
    return result;
  }

  @Get('check')
  isTablebase(@Query('fen') fen: string) {
    if (!fen) {
      return { error: 'fen is required' };
    }
    return { isTablebase: this.tablebaseService.isTablebasePosition(fen) };
  }
}
