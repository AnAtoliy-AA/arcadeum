import { Module } from '@nestjs/common';
import { PreferencesService } from './preferences.service';

@Module({
  providers: [PreferencesService],
  exports: [PreferencesService],
})
export class PreferencesModule {}
