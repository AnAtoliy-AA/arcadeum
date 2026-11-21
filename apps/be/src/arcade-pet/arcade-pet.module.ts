import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OCI_CONNECTION } from '../common/providers/mongo-connections.provider';
import { ArcadePetController } from './arcade-pet.controller';
import { ArcadePetCollectionService } from './arcade-pet-collection.service';
import { ArcadePetService } from './arcade-pet.service';
import { ArcadePet, ArcadePetSchema } from './schemas/arcade-pet.schema';
import {
  ArcadePetCollection,
  ArcadePetCollectionSchema,
} from './schemas/arcade-pet-collection.schema';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        { name: ArcadePet.name, schema: ArcadePetSchema },
        { name: ArcadePetCollection.name, schema: ArcadePetCollectionSchema },
      ],
      OCI_CONNECTION,
    ),
  ],
  controllers: [ArcadePetController],
  providers: [ArcadePetService, ArcadePetCollectionService],
  exports: [ArcadePetService, ArcadePetCollectionService],
})
export class ArcadePetModule {}
