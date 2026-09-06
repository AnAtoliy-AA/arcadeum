import { Module } from '@nestjs/common';
import { SyzygyTablebaseService } from './syzygy.service';
import { TablebaseController } from './tablebase.controller';

@Module({
  controllers: [TablebaseController],
  providers: [SyzygyTablebaseService],
  exports: [SyzygyTablebaseService],
})
export class TablebaseModule {}
