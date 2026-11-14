import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OCI_CONNECTION } from '../common/providers/mongo-connections.provider';
import { ArcadePetController } from './arcade-pet.controller';
import { ArcadePetService } from './arcade-pet.service';
import { ArcadePet, ArcadePetSchema } from './schemas/arcade-pet.schema';

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: ArcadePet.name, schema: ArcadePetSchema }],
      OCI_CONNECTION,
    ),
  ],
  controllers: [ArcadePetController],
  providers: [ArcadePetService],
  exports: [ArcadePetService],
})
export class ArcadePetModule {}
