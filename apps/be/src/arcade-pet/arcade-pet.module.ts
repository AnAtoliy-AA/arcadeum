import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GameVisibilityModule } from '../admin/game-visibility/game-visibility.module';
import { AuthModule } from '../auth/auth.module';
import { User, UserSchema } from '../auth/schemas/user.schema';
import { OCI_CONNECTION } from '../common/providers/mongo-connections.provider';
import { ArcadePetController } from './arcade-pet.controller';
import { ArcadePetCollectionService } from './arcade-pet-collection.service';
import { ArcadePetEconomyService } from './arcade-pet-economy.service';
import { ArcadePetTreatRewardService } from './arcade-pet-treat-reward.service';
import { ArcadePetFeatureGuard } from './arcade-pet-feature.guard';
import { ArcadePetFeatureService } from './arcade-pet-feature.service';
import {
  ArcadePetCollection,
  ArcadePetCollectionSchema,
} from './schemas/arcade-pet-collection.schema';

@Module({
  imports: [
    AuthModule,
    GameVisibilityModule,
    MongooseModule.forFeature(
      [{ name: ArcadePetCollection.name, schema: ArcadePetCollectionSchema }],
      OCI_CONNECTION,
    ),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [ArcadePetController],
  providers: [
    ArcadePetCollectionService,
    ArcadePetEconomyService,
    ArcadePetFeatureService,
    ArcadePetFeatureGuard,
    ArcadePetTreatRewardService,
  ],
  exports: [
    ArcadePetCollectionService,
    ArcadePetEconomyService,
    ArcadePetFeatureService,
    ArcadePetTreatRewardService,
  ],
})
export class ArcadePetModule {}
