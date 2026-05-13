import { Module, forwardRef } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { ReferralModule } from '../referrals/referral.module';
import { ShopModule } from '../shop/shop.module';
import {
  RefreshToken,
  RefreshTokenSchema,
} from './schemas/refresh-token.schema';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt/jwt.strategy';
import {
  OAuthClientService,
  RefreshTokenService,
  GoogleOAuthService,
} from './services';
import { resolveJwtSecret } from '../common/utils/jwt-secret.util';

@Module({
  imports: [
    forwardRef(() => ReferralModule),
    forwardRef(() => ShopModule),
    ConfigModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: RefreshToken.name, schema: RefreshTokenSchema },
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        global: true,
        secret: resolveJwtSecret(config),
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    OAuthClientService,
    RefreshTokenService,
    GoogleOAuthService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
