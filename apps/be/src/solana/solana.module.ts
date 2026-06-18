import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { SolanaService } from './solana.service';
import { SolanaController } from './solana.controller';
import { WalletModule } from '../wallet/wallet.module';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User, UserSchema } from '../auth/schemas/user.schema';

@Module({
  imports: [
    ConfigModule,
    WalletModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [SolanaController],
  providers: [SolanaService, RolesGuard],
  exports: [SolanaService],
})
export class SolanaModule {}
