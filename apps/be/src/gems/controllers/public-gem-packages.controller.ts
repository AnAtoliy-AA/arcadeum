import { Controller, Get } from '@nestjs/common';
import { GemPackagesService } from '../services/gem-packages.service';
import type { GemPackagePublic } from '../interfaces/gem-package.interface';

@Controller('payments/gems/packages')
export class PublicGemPackagesController {
  constructor(private readonly service: GemPackagesService) {}

  @Get()
  list(): Promise<GemPackagePublic[]> {
    return this.service.listActive();
  }
}
