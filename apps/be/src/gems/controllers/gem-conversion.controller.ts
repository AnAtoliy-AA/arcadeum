import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt/jwt.guard';
import { GemConversionService } from '../services/gem-conversion.service';
import { ConvertGemsDto } from '../dto/convert-gems.dto';
import type { AuthenticatedUser } from '../../auth/jwt/jwt.strategy';

@Controller('wallet/convert-gems-to-coins')
@UseGuards(JwtAuthGuard)
export class GemConversionController {
  constructor(private readonly service: GemConversionService) {}

  @Post()
  convert(
    @Req() req: { user: AuthenticatedUser },
    @Body() dto: ConvertGemsDto,
  ) {
    return this.service.convertGemsToCoins(
      req.user.userId,
      dto.gems,
      dto.conversionId,
    );
  }
}
