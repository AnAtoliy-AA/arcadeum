import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { WalletService } from '../../wallet/wallet.service';
import type { WalletBalance } from '../../wallet/interfaces/wallet-balance.interface';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Injectable()
export class GemConversionService {
  private readonly logger = new Logger(GemConversionService.name);
  private readonly rate: number;

  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly wallet: WalletService,
    private readonly config: ConfigService,
  ) {
    const raw = this.config.get<string>('GEM_TO_COIN_RATE');
    const parsed = raw ? Number(raw) : 100;
    this.rate = Number.isInteger(parsed) && parsed > 0 ? parsed : 100;
  }

  getRate(): number {
    return this.rate;
  }

  async convertGemsToCoins(
    userId: string,
    gems: number,
    conversionId: string,
  ): Promise<{
    gemsDebited: number;
    coinsCredited: number;
    newBalance: WalletBalance;
    rate: number;
  }> {
    if (!Number.isInteger(gems) || gems <= 0 || gems > 1_000_000) {
      throw new BadRequestException('gems.invalidAmount');
    }
    if (!UUID_RE.test(conversionId)) {
      throw new BadRequestException('gems.invalidConversionId');
    }
    const coins = gems * this.rate;
    if (coins > WalletService.MAX_TRANSACTION_AMOUNT) {
      throw new BadRequestException('gems.conversionExceedsCap');
    }

    const session = await this.connection.startSession();
    try {
      await session.withTransaction(async () => {
        await this.wallet.debit(
          userId,
          'gems',
          gems,
          'gem_to_coin_conversion_debit',
          `gem-to-coin-${conversionId}-debit`,
          { conversionId, rate: this.rate },
          session,
        );
        await this.wallet.credit(
          userId,
          'coins',
          coins,
          'gem_to_coin_conversion_credit',
          `gem-to-coin-${conversionId}-credit`,
          { conversionId, rate: this.rate },
          session,
        );
      });
    } catch (err) {
      if (this.looksLikeDuplicateKey(err)) {
        // Both rows must exist for a clean idempotent retry. If only one exists,
        // a partial commit occurred — surface the error for investigation.
        const debitPrior = await this.wallet.findByIdempotencyKey(
          `gem-to-coin-${conversionId}-debit`,
        );
        const creditPrior = await this.wallet.findByIdempotencyKey(
          `gem-to-coin-${conversionId}-credit`,
        );
        if (debitPrior && creditPrior) {
          this.logger.log(
            `Conversion ${conversionId} already completed — returning cached result`,
          );
          // Already done — fall through to balance fetch below
        } else {
          throw err;
        }
      } else {
        throw err;
      }
    } finally {
      await session.endSession();
    }

    const balance = await this.wallet.getBalance(userId);
    this.wallet.emitAfterCommit(userId, balance);

    return {
      gemsDebited: gems,
      coinsCredited: coins,
      newBalance: balance,
      rate: this.rate,
    };
  }

  private looksLikeDuplicateKey(err: unknown): boolean {
    const e = err as { code?: number; keyPattern?: Record<string, number> };
    return e?.code === 11000 && Boolean(e?.keyPattern?.idempotencyKey);
  }
}
