import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SolanaService } from './solana.service';
import { SolanaController } from './solana.controller';
import { WalletModule } from '../wallet/wallet.module';
import { RolesGuard } from '../auth/guards/roles.guard';

@Module({
  imports: [ConfigModule, WalletModule],
  controllers: [SolanaController],
  providers: [SolanaService, RolesGuard],
  exports: [SolanaService],
})
export class SolanaModule {}
