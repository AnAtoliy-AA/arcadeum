import type { ReactElement } from 'react';
import {
  GlassCard,
  Typography,
  WalletIcon,
  GiftIcon,
  Badge,
} from '@arcadeum/ui';
import type { AdminStatsEconomy } from '../types';

export interface StatsEconomyOverviewTranslations {
  title?: string;
  subtitle?: string;
  coinsInCirculation?: string;
  gemsInCirculation?: string;
  arcadeumInCirculation?: string;
  revenueTitle?: string;
  reasonsTitle?: string;
  reasonColumn?: string;
  transactionsCount?: string;
  volume?: string;
  noTransactions?: string;
}

interface StatsEconomyOverviewProps {
  economy: AdminStatsEconomy;
  t?: StatsEconomyOverviewTranslations;
}

export function StatsEconomyOverview({
  economy,
  t,
}: StatsEconomyOverviewProps): ReactElement {
  const {
    totalCoinsInCirculation,
    totalGemsInCirculation,
    totalArcadeumInCirculation,
    totalPurchasesCount,
    totalPurchasesRevenueUsd,
    reasonsBreakdown,
  } = economy;

  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full"
      data-testid="stats-economy-overview"
    >
      <GlassCard className="p-6 border border-[var(--borderColor)] flex flex-col gap-4">
        <div className="flex flex-row items-center gap-2">
          <WalletIcon size={18} />
          <Typography variant="subheading" uiSize="sm" weight="700">
            {t?.title ?? 'Treasury & Circulation'}
          </Typography>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-row items-center justify-between p-3 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[var(--borderColor)]">
            <div className="flex flex-col">
              <span className="text-xs text-[var(--colorTextSecondary,#a1a1aa)]">
                {t?.coinsInCirculation ?? 'Coins in Wallets'}
              </span>
              <span className="text-lg font-bold text-amber-400">
                🪙 {totalCoinsInCirculation.toLocaleString()}
              </span>
            </div>
            <Badge variant="warning" size="sm">
              Coins
            </Badge>
          </div>

          <div className="flex flex-row items-center justify-between p-3 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[var(--borderColor)]">
            <div className="flex flex-col">
              <span className="text-xs text-[var(--colorTextSecondary,#a1a1aa)]">
                {t?.gemsInCirculation ?? 'Gems in Wallets'}
              </span>
              <span className="text-lg font-bold text-cyan-400">
                💎 {totalGemsInCirculation.toLocaleString()}
              </span>
            </div>
            <Badge variant="info" size="sm">
              Gems
            </Badge>
          </div>

          <div className="flex flex-row items-center justify-between p-3 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[var(--borderColor)]">
            <div className="flex flex-col">
              <span className="text-xs text-[var(--colorTextSecondary,#a1a1aa)]">
                {t?.arcadeumInCirculation ?? 'ARC Tokens in Wallets'}
              </span>
              <span className="text-lg font-bold text-purple-400">
                ⚡ {totalArcadeumInCirculation.toLocaleString()}
              </span>
            </div>
            <Badge variant="neutral" size="sm">
              ARC
            </Badge>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-6 border border-[var(--borderColor)] flex flex-col justify-between gap-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-row items-center gap-2">
            <GiftIcon size={18} />
            <Typography variant="subheading" uiSize="sm" weight="700">
              {t?.revenueTitle ?? 'Monetization & Sales'}
            </Typography>
          </div>

          <div className="p-4 rounded-xl bg-[rgba(87,195,255,0.06)] border border-[var(--borderColor)] flex flex-col gap-2">
            <Typography variant="caption" uiSize="xs" alpha="medium">
              Gross Gem Sales (USD)
            </Typography>
            <div className="text-3xl font-extrabold text-emerald-400">
              $
              {totalPurchasesRevenueUsd.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <Typography variant="body" uiSize="xs" alpha="medium">
              Across {totalPurchasesCount.toLocaleString()} completed purchases
            </Typography>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[var(--borderColor)] text-xs text-[var(--colorTextSecondary,#a1a1aa)] flex flex-row items-center justify-between">
          <span>Purchases Today / 7d:</span>
          <span className="text-[var(--colorText)] font-semibold">
            {economy.transactionsToday} / {economy.transactions7d} tx
          </span>
        </div>
      </GlassCard>

      <GlassCard className="p-6 border border-[var(--borderColor)] flex flex-col gap-4">
        <div className="flex flex-row items-center justify-between">
          <Typography variant="subheading" uiSize="sm" weight="700">
            {t?.reasonsTitle ?? 'Top Flow Types'}
          </Typography>
          <Badge variant="neutral" size="sm">
            Top Categories
          </Badge>
        </div>

        {reasonsBreakdown.length === 0 ? (
          <div className="py-6 text-center text-xs text-[var(--colorTextSecondary,#a1a1aa)]">
            {t?.noTransactions ?? 'No transactions recorded'}
          </div>
        ) : (
          <div className="flex flex-col gap-2 overflow-y-auto max-h-[190px]">
            {reasonsBreakdown.map((item) => (
              <div
                key={item.reason}
                className="flex flex-row items-center justify-between p-2 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[var(--borderColor)] text-xs"
              >
                <span className="font-mono capitalize text-[var(--colorText)] truncate max-w-[130px]">
                  {item.reason.replace(/_/g, ' ')}
                </span>
                <div className="flex flex-row items-center gap-2">
                  <span className="text-[var(--colorTextSecondary,#a1a1aa)]">
                    {item.count} ops
                  </span>
                  <span className="font-semibold text-amber-400">
                    {item.volume.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
