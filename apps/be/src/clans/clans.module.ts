import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClansController } from './clans.controller';
import { ClansService } from './clans.service';
import { ClansGateway } from './clans.gateway';
import { Clan, ClanSchema } from './schemas/clan.schema';
import { ClanMember, ClanMemberSchema } from './schemas/clan-member.schema';
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
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [ClansController],
  providers: [ClansService, ClansGateway],
  exports: [ClansService, ClansGateway],
})
export class ClansModule {}
