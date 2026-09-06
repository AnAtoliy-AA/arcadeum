import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChessProfile, ChessProfileSchema } from './chess-profile.schema';
import { ChessProfilesService } from './chess-profiles.service';
import { OCI_CONNECTION } from '../../../common/providers/mongo-connections.provider';

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: ChessProfile.name, schema: ChessProfileSchema }],
      OCI_CONNECTION,
    ),
  ],
  providers: [ChessProfilesService],
  exports: [ChessProfilesService],
})
export class ChessProfilesModule {}
