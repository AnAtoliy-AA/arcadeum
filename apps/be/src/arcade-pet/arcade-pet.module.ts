import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../auth/schemas/user.schema';
import { OCI_CONNECTION } from '../common/providers/mongo-connections.provider';
import { ArcadePetController } from './arcade-pet.controller';
import { ArcadePetCollectionService } from './arcade-pet-collection.service';
import { ArcadePetEconomyService } from './arcade-pet-economy.service';
import {
  ArcadePetCollection,
  ArcadePetCollectionSchema,
} from './schemas/arcade-pet-collection.schema';

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: ArcadePetCollection.name, schema: ArcadePetCollectionSchema }],
      OCI_CONNECTION,
    ),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [ArcadePetController],
  providers: [ArcadePetCollectionService, ArcadePetEconomyService],
  exports: [ArcadePetCollectionService, ArcadePetEconomyService],
})
export class ArcadePetModule {}
