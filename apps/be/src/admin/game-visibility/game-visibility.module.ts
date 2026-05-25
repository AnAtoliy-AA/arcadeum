import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../../auth/auth.module';
import { User, UserSchema } from '../../auth/schemas/user.schema';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { GameVisibility, GameVisibilitySchema } from './game-visibility.schema';
import { GameVisibilityService } from './game-visibility.service';
import { GameVisibilityController } from './game-visibility.controller';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: GameVisibility.name, schema: GameVisibilitySchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [GameVisibilityController],
  providers: [GameVisibilityService, RolesGuard],
  exports: [GameVisibilityService, MongooseModule],
})
export class GameVisibilityModule {}
