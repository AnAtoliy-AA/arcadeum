import { Module, forwardRef } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { ReferralModule } from '../referrals/referral.module';
import {
  RefreshToken,
  RefreshTokenSchema,
} from './schemas/refresh-token.schema';
import {
  PasswordResetToken,
  PasswordResetTokenSchema,
} from './schemas/password-reset-token.schema';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';
import { JwtStrategy } from './jwt/jwt.strategy';
import {
  OAuthClientService,
  RefreshTokenService,
  GoogleOAuthService,
  PasswordResetService,
} from './services';
import { UserRoleResolver } from './lib/user-role-resolver.service';
import { AuthThrottlerGuard } from './lib/auth-throttler.guard';
import { resolveJwtSecret } from '../common/utils/jwt-secret.util';
import { MailerModule } from '../support/mailer.module';

@Module({
  imports: [
    forwardRef(() => ReferralModule),
    ConfigModule,
    MailerModule,
    // Self-register ThrottlerModule so AuthThrottlerGuard's deps resolve
    // even when AuthModule is loaded outside the full app.module graph
    // (e.g. integration tests that wire AuthModule directly into a
    // Test.createTestingModule). The per-route @Throttle() decorators
    // override the limit/ttl on a per-endpoint basis.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: RefreshToken.name, schema: RefreshTokenSchema },
      { name: PasswordResetToken.name, schema: PasswordResetTokenSchema },
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
    PasswordResetService,
    UserRoleResolver,
    AuthThrottlerGuard,
  ],
  exports: [AuthService, UserRoleResolver],
})
export class AuthModule {}
