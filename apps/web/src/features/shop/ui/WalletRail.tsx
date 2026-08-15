'use client';

import { cx } from '@arcadeum/ui/utils/cx';
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
  ...props
}: {
  flex?: number | string;
  backgroundColor?: string;
  borderColor?: string;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'flex flex-row items-center gap-2 px-3 py-2 rounded-xl border',
        className,
      )}
      style={{ flex, backgroundColor, borderColor }}
      {...props}
    />
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
          <span className="text-[16px]">{COIN_GLYPH}</span>
          <span
            className="text-[18px] font-extrabold"
            style={{ color: COIN_COLOR }}
          >
            {fmt(coins)}
          </span>
        </Tile>
        <Tile
          flex={1}
          backgroundColor="rgba(167,139,250,0.08)"
          borderColor="rgba(167,139,250,0.25)"
        >
          <span className="text-[16px]">{GEM_GLYPH}</span>
          <span
            className="text-[18px] font-extrabold"
            style={{ color: GEM_COLOR }}
          >
            {fmt(gems)}
          </span>
        </Tile>
      </div>

      {nextGemPack ? (
        <div className="flex flex-col items-stretch gap-6">
          <div className="flex flex-row justify-between items-center">
            <span className="text-[48px] tracking-[1.4px] uppercase font-extrabold text-[#94a3b8]">
              {labels.nextPack.replace('{label}', nextGemPack.label)}
            </span>
            <span className="text-[11px] font-bold text-[#f5f7ff]">
              {labels.ofTarget
                .replace('{current}', fmt(gems))
                .replace('{target}', fmt(nextGemPack.target))}
            </span>
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
