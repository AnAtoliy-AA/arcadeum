import { Module } from '@nestjs/common';
import { User, UserSchema } from '../../../auth/schemas/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ChessOpening, ChessOpeningSchema } from './chess-opening.schema';
import { ChessOpeningsService } from './chess-openings.service';
import { ChessOpeningsController } from './chess-openings.controller';
import { OCI_CONNECTION } from '../../../common/providers/mongo-connections.provider';

@Module({
  imports: [
    // Default connection: RolesGuard looks up the caller's role.
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature(
      [{ name: ChessOpening.name, schema: ChessOpeningSchema }],
      OCI_CONNECTION,
    ),
  ],
  controllers: [ChessOpeningsController],
  providers: [ChessOpeningsService],
  exports: [ChessOpeningsService],
})
export class ChessOpeningsModule {}
