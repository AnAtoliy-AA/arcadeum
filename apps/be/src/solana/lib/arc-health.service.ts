import { Injectable } from '@nestjs/common';
import { SolanaService } from '../solana.service';
import { EconomySettingsService } from '../../economy/economy-settings.service';
import { ARCADEUM_DECIMALS } from './arcadeum-token';
import { redactRpcUrl } from './solana-config';

/** Read-only, secret-free snapshot so ops can check an environment fast. */
@Injectable()
export class ArcHealthService {
  constructor(
    private readonly solana: SolanaService,
    private readonly economy: EconomySettingsService,
  ) {}

  async getHealth() {
    const cfg = this.solana.getRuntimeConfig();
    const [rpc, quote, gemsFlag, shopFlag, discount] = await Promise.all([
      this.solana.checkRpc(),
      this.solana.getArcadeumQuote(),
      this.economy.getNumber('gems_allow_arcadeum'),
      this.economy.getNumber('shop_allow_arcadeum'),
      this.economy.getNumber('arcadeum_discount_percent'),
    ]);

    let onChainDecimals: number | null = null;
    let decimalsError: string | undefined;
    if (rpc.ok && cfg.mint) {
      try {
        onChainDecimals = await this.solana.getMintDecimalsOnChain();
      } catch (err) {
        decimalsError = err instanceof Error ? err.message : String(err);
      }
    }

    const problems = [...cfg.issues];
    if (!rpc.ok) problems.push(`RPC unhealthy: ${rpc.error ?? 'unknown'}`);
    if (quote.status !== 'ok') problems.push(`price ${quote.status}`);
    if (onChainDecimals !== null && onChainDecimals !== ARCADEUM_DECIMALS) {
      problems.push(
        `mint decimals on chain (${onChainDecimals}) differ from code (${ARCADEUM_DECIMALS})`,
      );
    }

    return {
      ok: problems.length === 0,
      problems,
      config: {
        mint: cfg.mint,
        pool: cfg.poolAddress,
        treasury: cfg.treasury || null,
        rpcHosts: cfg.rpcUrls.map(redactRpcUrl),
        rpcConfigured: cfg.rpcConfigured,
        txMaxAgeSeconds: cfg.txMaxAgeSeconds,
        tolerancePercent: cfg.tolerancePercent,
      },
      decimals: {
        code: ARCADEUM_DECIMALS,
        onChain: onChainDecimals,
        error: decimalsError,
      },
      rpc,
      price: {
        status: quote.status,
        usd: quote.priceUsd,
        source: quote.source,
        ageSeconds:
          quote.ageMs === null ? null : Math.round(quote.ageMs / 1000),
        reason: quote.reason ?? null,
      },
      flags: {
        gemsAllowArcadeum: gemsFlag === 1,
        shopAllowArcadeum: shopFlag === 1,
        arcadeumDiscountPercent: discount,
      },
    };
  }
}
