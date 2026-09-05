import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChessPuzzle, ChessPuzzleSchema } from './chess-puzzle.schema';
import {
  ChessPuzzleUser,
  ChessPuzzleUserSchema,
} from './chess-puzzle-user.schema';
import { ChessPuzzlesService } from './chess-puzzles.service';
import { ChessPuzzlesController } from './chess-puzzles.controller';
import { OCI_CONNECTION } from '../../../common/providers/mongo-connections.provider';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        { name: ChessPuzzle.name, schema: ChessPuzzleSchema },
        { name: ChessPuzzleUser.name, schema: ChessPuzzleUserSchema },
      ],
      OCI_CONNECTION,
    ),
  ],
  controllers: [ChessPuzzlesController],
  providers: [ChessPuzzlesService],
  exports: [ChessPuzzlesService],
})
export class ChessPuzzlesModule {}
