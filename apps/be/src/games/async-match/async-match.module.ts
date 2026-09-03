import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AsyncMatch, AsyncMatchSchema } from './schemas/async-match.schema';
import { AsyncMatchService } from './async-match.service';
import { AsyncMatchController } from './async-match.controller';
import { AsyncMatchCleanupCron } from './async-match.cleanup.cron';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AsyncMatch.name, schema: AsyncMatchSchema },
    ]),
  ],
  controllers: [AsyncMatchController],
  providers: [AsyncMatchService, AsyncMatchCleanupCron],
  exports: [AsyncMatchService],
})
export class AsyncMatchModule {}
