import { Module } from '@nestjs/common';
import { GeoLookupService } from './geo-lookup.service';

@Module({
  providers: [GeoLookupService],
  exports: [GeoLookupService],
})
export class GeoModule {}
