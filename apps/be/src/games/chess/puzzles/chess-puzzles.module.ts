import { Module } from '@nestjs/common';
import { User, UserSchema } from '../../../auth/schemas/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ChessPuzzle, ChessPuzzleSchema } from './chess-puzzle.schema';
import {
  ChessPuzzleUser,
  ChessPuzzleUserSchema,
} from './chess-puzzle-user.schema';
import {
  ChessPuzzleRush,
  ChessPuzzleRushSchema,
} from './chess-puzzle-rush.schema';
import { ChessPuzzlesService } from './chess-puzzles.service';
import { ChessPuzzlesController } from './chess-puzzles.controller';
import { ChessPuzzleDuelGateway } from './chess-puzzle-duel.gateway';
import { OCI_CONNECTION } from '../../../common/providers/mongo-connections.provider';
import { ChessStockfishModule } from '../engine/chess-stockfish.module';

@Module({
  imports: [
    // Default connection: RolesGuard looks up the caller's role.
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature(
      [
        { name: ChessPuzzle.name, schema: ChessPuzzleSchema },
        { name: ChessPuzzleUser.name, schema: ChessPuzzleUserSchema },
        { name: ChessPuzzleRush.name, schema: ChessPuzzleRushSchema },
      ],
      OCI_CONNECTION,
    ),
    ChessStockfishModule,
  ],
  controllers: [ChessPuzzlesController],
  providers: [ChessPuzzlesService, ChessPuzzleDuelGateway],
  exports: [ChessPuzzlesService],
})
export class ChessPuzzlesModule {}
