import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User, UserSchema } from '../auth/schemas/user.schema';
import { Tournament, TournamentSchema } from './schemas/tournament.schema';
import { TournamentsService } from './tournaments.service';
import { AdminTournamentsController } from './admin-tournaments.controller';
import { PublicTournamentsController } from './public-tournaments.controller';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Tournament.name, schema: TournamentSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [AdminTournamentsController, PublicTournamentsController],
  providers: [TournamentsService, RolesGuard],
  exports: [TournamentsService],
})
export class TournamentsModule {}
