import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClansController } from './clans.controller';
import { ClansService } from './clans.service';
import { ClanLeaderboardsService } from './clan-leaderboards.service';
import { CommunityChallengesService } from './community-challenges.service';
import { ClanWarsService } from './clan-wars.service';
import { ClansGateway } from './clans.gateway';
import { Clan, ClanSchema } from './schemas/clan.schema';
import { ClanMember, ClanMemberSchema } from './schemas/clan-member.schema';
import {
  CommunityChallenge,
  CommunityChallengeSchema,
} from './schemas/community-challenge.schema';
import { ClanWar, ClanWarSchema } from './schemas/clan-war.schema';
import { User, UserSchema } from '../auth/schemas/user.schema';
import { resolveJwtSecret } from '../common/utils/jwt-secret.util';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: resolveJwtSecret(config),
      }),
    }),
    MongooseModule.forFeature([
      { name: Clan.name, schema: ClanSchema },
      { name: ClanMember.name, schema: ClanMemberSchema },
      { name: CommunityChallenge.name, schema: CommunityChallengeSchema },
      { name: ClanWar.name, schema: ClanWarSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [ClansController],
  providers: [
    ClansService,
    ClanLeaderboardsService,
    CommunityChallengesService,
    ClanWarsService,
    ClansGateway,
  ],
  exports: [
    ClansService,
    ClanLeaderboardsService,
    CommunityChallengesService,
    ClanWarsService,
    ClansGateway,
  ],
})
export class ClansModule {}
