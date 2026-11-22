'use client';

import React from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import type { RankingTier } from '@/features/ranking/model/types';
import { RANKING_TIERS } from '@/features/ranking/lib/tiers';

const TIER_ICONS: Record<RankingTier, string> = {
  master: '👑',
  diamond: '💎',
  platinum: '🔮',
  gold: '🥇',
  silver: '🥈',
  bronze: '🥉',
};

export interface TierDesc {
  name: string;
  min: string;
  desc: string;
}

export interface CriticalRankedTierLadderProps {
  currentTier?: RankingTier | null;
  tiersInfo?: Partial<Record<RankingTier, TierDesc>>;
  title: string;
  subtitle: string;
}

export function CriticalRankedTierLadder({
  currentTier,
  tiersInfo,
  title,
  subtitle,
}: CriticalRankedTierLadderProps) {
  return (
    <div className="box-border flex flex-col gap-4">
      <div className="box-border flex flex-col gap-1">
        <h3 className="box-border m-0 text-lg sm:text-xl font-bold tracking-tight text-[var(--foreground)]">
          {title}
        </h3>
        <p className="box-border m-0 text-xs sm:text-sm text-[var(--foreground)] opacity-80">
          {subtitle}
        </p>
      </div>

      <div className="box-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {RANKING_TIERS.map((meta) => {
          const isUserTier = currentTier === meta.tier;
          const info = tiersInfo?.[meta.tier];
          const displayName = info?.name ?? meta.label;
          const minText = info?.min ?? `${meta.min}+ ELO`;
          const description = info?.desc ?? '';

          return (
            <div
              key={meta.tier}
              data-testid={`tier-card-${meta.tier}`}
              className={cx(
                'box-border relative flex flex-col gap-2 p-4 rounded-xl border backdrop-blur-md transition-all duration-200',
                isUserTier
                  ? 'border-[var(--primary)] bg-[var(--primary)]/10 shadow-[0_0_16px_rgba(var(--primary-rgb),0.2)] ring-1 ring-[var(--primary)]'
                  : 'border-[var(--borderColor)] bg-[var(--glassBg)] hover:border-[var(--borderHover)] hover:bg-[var(--backgroundHover)]',
              )}
            >
              <div className="box-border flex items-center justify-between gap-2">
                <div className="box-border flex items-center gap-2">
                  <span className="box-border text-xl" aria-hidden="true">
                    {TIER_ICONS[meta.tier]}
                  </span>
                  <span className="box-border text-sm font-bold text-[var(--foreground)]">
                    {displayName}
                  </span>
                </div>
                <span
                  className={cx(
                    'box-border px-2 py-0.5 rounded-full text-[11px] font-semibold border',
                    meta.badge,
                  )}
                >
                  {minText}
                </span>
              </div>

              {description ? (
                <p className="box-border m-0 text-xs text-[var(--foreground)] opacity-80 leading-relaxed">
                  {description}
                </p>
              ) : null}

              {isUserTier ? (
                <span className="box-border mt-auto pt-1 text-[10px] font-bold uppercase tracking-wider text-[var(--color)]">
                  Current Tier
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
