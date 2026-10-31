import { cx } from '@arcadeum/ui/utils/cx';
import type { RewardTierItem } from '@/entities/leaderboard/model/types';
import type { PageTranslations } from '@/shared/i18n/page-translations';

const TIER_CLASSES: Record<string, { border: string; text: string }> = {
  mythic: { border: 'border-[#ec4899]/30', text: 'text-[#ec4899]' },
  diamond: { border: 'border-[#22d3ee]/30', text: 'text-[#22d3ee]' },
  platinum: { border: 'border-[#a78bfa]/30', text: 'text-[#a78bfa]' },
  gold: { border: 'border-[#facc15]/30', text: 'text-[#facc15]' },
  silver: { border: 'border-[#94a3b8]/30', text: 'text-[#94a3b8]' },
  bronze: { border: 'border-[#b45309]/30', text: 'text-[#b45309]' },
};

const DEFAULT_TIER = { border: 'border-[#94a3b8]/30', text: 'text-[#94a3b8]' };

export function RewardLadder({
  rewards,
  t,
}: {
  rewards: RewardTierItem[];
  t?: PageTranslations;
}) {
  if (!rewards.length) return null;
  const rTitles = ((t?.rewards as Record<string, string>) ?? {}) as Record<
    string,
    string
  >;
  return (
    <div className="flex flex-col items-stretch gap-3">
      <span className="text-[14px] tracking-[2px] opacity-[0.9] uppercase">
        {rTitles.title ?? 'Reward ladder'}
      </span>
      <div className="flex flex-row items-stretch gap-3 flex-wrap">
        {rewards.map((r) => {
          const tierStyle = TIER_CLASSES[r.tier] ?? DEFAULT_TIER;
          const range =
            r.rankFrom === r.rankTo
              ? `RANK ${r.rankFrom}`
              : `RANK ${r.rankFrom}-${r.rankTo}`;
          const prizeText =
            rTitles[r.tier] ??
            r.rewardLabel
              .replace('rewards.', '')
              .replace(/^./, (c) => c.toUpperCase());
          return (
            <div
              className={cx(
                'flex flex-col flex-1 min-w-[150px] p-3 gap-2 rounded-xl border items-center bg-[rgba(255,255,255,0.02)]',
                tierStyle.border,
              )}
              key={r.tier}
              data-testid={`reward-card-${r.tier}`}
            >
              <span className={cx('text-[28px]', tierStyle.text)}>
                {r.icon ?? '★'}
              </span>
              <span
                className={cx(
                  'text-[12px] font-bold tracking-[2px] uppercase',
                  tierStyle.text,
                )}
              >
                {r.tier}
              </span>
              <span className="text-[12px] opacity-[0.9] tracking-[1px]">
                {range}
              </span>
              <span className="text-[14px] text-center opacity-[0.9]">
                {prizeText}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
