'use client';

import { cx } from '@arcadeum/ui/utils/cx';
import { Typography } from '@arcadeum/ui';
import { useLanguage } from '@/shared/i18n/context';
import { formatNumber } from '@/shared/i18n/formatters';
import { CURRENCY_COLOR, CURRENCY_GLYPH } from '../lib/currency';
import type { NextGemPackView, WalletBalanceView } from '../server/shop.types';

const { coins: COIN_GLYPH, gems: GEM_GLYPH } = CURRENCY_GLYPH;
const { coins: COIN_COLOR, gems: GEM_COLOR } = CURRENCY_COLOR;

export interface WalletRailLabels {
  nextPack: string;
  ofTarget: string;
}

export interface WalletRailProps {
  balance: WalletBalanceView;
  nextGemPack: NextGemPackView | null;
  labels: WalletRailLabels;
}

function Tile({
  flex,
  backgroundColor,
  borderColor,
  className,
  children,
}: {
  flex?: number | string;
  backgroundColor?: string;
  borderColor?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      style={{ flex, backgroundColor, borderColor }}
      className={cx(
        'flex flex-row items-center gap-2 px-3 py-2 rounded-xl border',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function WalletRail({ balance, nextGemPack, labels }: WalletRailProps) {
  const { locale } = useLanguage();
  const { coins, gems } = balance;
  const fmt = (n: number) => formatNumber(n, locale);
  const pct = nextGemPack
    ? Math.min(100, Math.round((gems / nextGemPack.target) * 100))
    : 0;

  return (
    <div
      className="flex flex-col items-stretch gap-3 p-3 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]"
      data-testid="shop-wallet-rail"
    >
      <div className="flex flex-row items-stretch gap-2">
        <Tile
          flex={1}
          backgroundColor="rgba(251,191,36,0.08)"
          borderColor="rgba(251,191,36,0.25)"
        >
          <Typography uiSize="md">{COIN_GLYPH}</Typography>
          <Typography uiSize="lg" weight="800" color={COIN_COLOR}>
            {fmt(coins)}
          </Typography>
        </Tile>
        <Tile
          flex={1}
          backgroundColor="rgba(167,139,250,0.08)"
          borderColor="rgba(167,139,250,0.25)"
        >
          <Typography uiSize="md">{GEM_GLYPH}</Typography>
          <Typography uiSize="lg" weight="800" color={GEM_COLOR}>
            {fmt(gems)}
          </Typography>
        </Tile>
      </div>

      {nextGemPack ? (
        <div className="flex flex-col items-stretch gap-6">
          <div className="flex flex-row justify-between items-center">
            <Typography
              uiSize="sm"
              weight="800"
              color="#94a3b8"
              tracking="lg"
              className="uppercase"
            >
              {labels.nextPack.replace('{label}', nextGemPack.label)}
            </Typography>
            <Typography uiSize="xs" weight="700" color="#f5f7ff">
              {labels.ofTarget
                .replace('{current}', fmt(gems))
                .replace('{target}', fmt(nextGemPack.target))}
            </Typography>
          </div>
          <div
            className="flex flex-col items-stretch h-[6px] rounded-xl bg-[rgba(255,255,255,0.06)] overflow-hidden"
            data-testid="shop-wallet-progress"
            data-progress={pct}
          >
            <div
              className="flex flex-col items-stretch h-[6px]"
              style={{
                width: `${pct}%`,
                backgroundColor: GEM_COLOR,
              }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
