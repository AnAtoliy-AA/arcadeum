import { Injectable, Logger } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { EconomySettingsService } from '../../economy/economy-settings.service';
import { WalletService } from '../../wallet/wallet.service';

@Injectable()
export class SignupRewardService {
  private readonly logger = new Logger(SignupRewardService.name);

  constructor(private readonly moduleRef: ModuleRef) {}

  async grant(userId: string): Promise<void> {
    try {
      const economy = this.moduleRef.get(EconomySettingsService, {
        strict: false,
      });
      const wallet = this.moduleRef.get(WalletService, { strict: false });

      const [coins, gems] = await Promise.all([
        economy.getNumber('signup_reward_coins'),
        economy.getNumber('signup_reward_gems'),
      ]);

      if (coins > 0) {
        await wallet.credit(
          userId,
          'coins',
          coins,
          'signup_reward',
          `signup:${userId}:coins`,
        );
      }
      if (gems > 0) {
        await wallet.credit(
          userId,
          'gems',
          gems,
          'signup_reward',
          `signup:${userId}:gems`,
        );
      }
    } catch (err) {
      this.logger.error('Failed to grant signup reward', err);
    }
  }
}
