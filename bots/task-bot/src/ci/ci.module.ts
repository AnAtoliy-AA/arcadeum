import { Module } from '@nestjs/common';
import { CIController } from './ci.controller';
import { GitHubModule } from '../github/github.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [GitHubModule, NotificationModule],
  controllers: [CIController],
})
export class CIModule {}
