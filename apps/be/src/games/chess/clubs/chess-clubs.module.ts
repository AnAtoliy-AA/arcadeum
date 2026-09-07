import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChessClub, ChessClubSchema } from './chess-club.schema';
import { ChessClubsService } from './chess-clubs.service';
import { ChessClubsController } from './chess-clubs.controller';
import { OCI_CONNECTION } from '../../../common/providers/mongo-connections.provider';

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: ChessClub.name, schema: ChessClubSchema }],
      OCI_CONNECTION,
    ),
  ],
  controllers: [ChessClubsController],
  providers: [ChessClubsService],
  exports: [ChessClubsService],
})
export class ChessClubsModule {}
