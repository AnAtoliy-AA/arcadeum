import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Tournament,
  TournamentSchema,
} from '../../../tournaments/schemas/tournament.schema';
import { ChessTournamentService } from './chess-tournament.service';
import { ChessTournamentController } from './chess-tournament.controller';
import { OCI_CONNECTION } from '../../../common/providers/mongo-connections.provider';

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: Tournament.name, schema: TournamentSchema }],
      OCI_CONNECTION,
    ),
  ],
  controllers: [ChessTournamentController],
  providers: [ChessTournamentService],
  exports: [ChessTournamentService],
})
export class ChessTournamentModule {}
