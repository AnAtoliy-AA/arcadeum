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
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/guards/roles.decorator';
import { GemPackagesService } from '../services/gem-packages.service';
import { CreateGemPackageDto } from '../dto/create-gem-package.dto';
import { UpdateGemPackageDto } from '../dto/update-gem-package.dto';
import type { GemPackageAdmin } from '../interfaces/gem-package.interface';

@Controller('admin/gem-packages')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminGemPackagesController {
  constructor(private readonly service: GemPackagesService) {}

  @Get()
  list(): Promise<GemPackageAdmin[]> {
    return this.service.listAllForAdmin();
  }

  @Post()
  create(@Body() dto: CreateGemPackageDto): Promise<GemPackageAdmin> {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateGemPackageDto,
  ): Promise<GemPackageAdmin> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    await this.service.delete(id);
  }
}
