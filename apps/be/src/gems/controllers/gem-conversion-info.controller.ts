import { Controller, Get } from '@nestjs/common';
import { GemConversionService } from '../services/gem-conversion.service';

/**
 * Exposes the current gem-to-coin conversion rate.
 * Open route — no authentication required because the rate is global/public info.
 */
@Controller('wallet/conversion-rate')
export class GemConversionInfoController {
  constructor(private readonly service: GemConversionService) {}

  @Get()
  rate(): { rate: number } {
    return { rate: this.service.getRate() };
  }
}
