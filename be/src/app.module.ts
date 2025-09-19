import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GameGateway } from './gateways/game.gateway';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, GameGateway],
})
export class AppModule {}
