import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { GeoBlockService } from './guards/geo-block.guard';

export class AddCountryDto {
  countryCode!: string;
  reason?: string;
}

@Controller('admin/geo-block')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminGeoBlockController {
  constructor(private readonly geoBlock: GeoBlockService) {}

  @Get('countries')
  async listCountries() {
    return this.geoBlock.getBlockedCountries();
  }

  @Post('countries')
  async addCountry(@Body() dto: AddCountryDto) {
    return this.geoBlock.addBlockedCountry(dto.countryCode, dto.reason);
  }

  @Delete('countries/:countryCode')
  async removeCountry(@Param('countryCode') countryCode: string) {
    return this.geoBlock.removeBlockedCountry(countryCode);
  }
}
