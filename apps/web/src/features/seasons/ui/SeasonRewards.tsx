'use client';

import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import type { SeasonRewardTier } from '../model/types';

/**
 * Cosmetic reward ladder for a season: what each final-rank band earns.
 * Purely presentational — the catalog itself lives on the Season document.
 */
export function SeasonRewards({
  tiers,
  className,
}: {
  tiers: SeasonRewardTier[];
  className?: string;
}) {
  const { t } = useTranslation();
  if (tiers.length === 0) return null;

  return (
    <div
      data-testid="season-rewards"
      className={`flex flex-col items-stretch gap-2 ${className ?? ''}`}
    >
      <span className="text-[12px] tracking-[2px] uppercase opacity-[0.6]">
        {t('pages.seasons.rewardsTitle')}
      </span>
      <ul className="flex flex-col gap-1.5 m-0 p-0 list-none">
        {tiers.map((tier) => (
          <li
            key={tier.rewardId}
            data-testid="season-reward-row"
            className="flex items-center gap-3 rounded-lg border px-3 py-2"
            style={{
              borderColor: `${tier.color}44`,
              background: `${tier.color}14`,
            }}
          >
            <span
              aria-hidden="true"
              className="text-[16px] leading-none"
              style={{ color: tier.color }}
            >
              {tier.icon}
            </span>
            <span className="text-[13px] font-semibold tabular-nums">
              {rankRange(tier)}
            </span>
            <span className="text-[13px] opacity-[0.8]">{kindLabel(tier.kind, t)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function rankRange(tier: SeasonRewardTier): string {
  return tier.rankFrom === tier.rankTo
    ? `#${tier.rankFrom}`
    : `#${tier.rankFrom}–#${tier.rankTo}`;
}

function kindLabel(
  kind: SeasonRewardTier['kind'],
  t: ReturnType<typeof useTranslation>['t'],
): string {
  const key = (
    kind === 'badge'
      ? 'pages.seasons.rewardBadge'
      : kind === 'boardSkin'
        ? 'pages.seasons.rewardBoardSkin'
        : 'pages.seasons.rewardPieceDesign'
  ) as TranslationKey;
  return t(key);
}
