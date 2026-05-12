import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User, UserSchema } from '../auth/schemas/user.schema';
import { resolveJwtSecret } from '../common/utils/jwt-secret.util';
import {
  WalletTransaction,
  WalletTransactionSchema,
} from './schemas/wallet-transaction.schema';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { AdminWalletController } from './admin-wallet.controller';
import { WalletGateway } from './wallet.gateway';
import { WalletBootstrap } from './lib/wallet-bootstrap';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    // Register our own JwtModule so WalletGateway can verify socket-handshake
    // JWTs. AuthModule's JwtModule registration sets `global: true` inside its
    // useFactory return, which is JwtModuleOptions.global (signing), not the
    // module-level global flag — so JwtService is not actually exported. A
    // local registration with the same secret is the simplest fix.
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: resolveJwtSecret(config),
      }),
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: WalletTransaction.name, schema: WalletTransactionSchema },
    ]),
  ],
  controllers: [WalletController, AdminWalletController],
  providers: [WalletService, WalletGateway, WalletBootstrap, RolesGuard],
  exports: [WalletService],
})
export class WalletModule {}
