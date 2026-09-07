import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChessCosmetic, ChessCosmeticSchema } from './chess-cosmetic.schema';
import { ChessCosmeticsService } from './chess-cosmetics.service';
import { OCI_CONNECTION } from '../../../common/providers/mongo-connections.provider';

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: ChessCosmetic.name, schema: ChessCosmeticSchema }],
      OCI_CONNECTION,
    ),
  ],
  providers: [ChessCosmeticsService],
  exports: [ChessCosmeticsService],
})
export class ChessCosmeticsModule {}
