import type { RewardTierItem } from '@/entities/leaderboard/model/types';
import type { PageTranslations } from '@/shared/i18n/page-translations';

const TIER_COLORS: Record<string, string> = {
  mythic: '#ec4899',
  diamond: '#22d3ee',
  platinum: '#a78bfa',
  gold: '#facc15',
  silver: '#94a3b8',
  bronze: '#b45309',
};

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
      <span className="text-[14px] tracking-[2px] opacity-[0.7] uppercase">
        {rTitles.title ?? 'Reward ladder'}
      </span>
      <div className="flex flex-row items-stretch gap-3 flex-wrap">
        {rewards.map((r) => {
          const color = r.color ?? TIER_COLORS[r.tier] ?? '#94a3b8';
          const range =
            r.rankFrom === r.rankTo
              ? `RANK ${r.rankFrom}`
              : `RANK ${r.rankFrom}–${r.rankTo}`;
          const prizeText =
            rTitles[r.tier] ??
            r.rewardLabel
              .replace('rewards.', '')
              .replace(/^./, (c) => c.toUpperCase());
          return (
            <div
              className="flex flex-col flex-1 min-w-[150px] p-3 gap-2 rounded-xl border items-center"
              style={{
                borderColor: `${color}55`,
                backgroundColor: 'rgba(255,255,255,0.02)',
              }}
              key={r.tier}
              data-testid={`reward-card-${r.tier}`}
            >
              <span className="text-[28px]" style={{ color: color as never }}>
                {r.icon ?? '★'}
              </span>
              <span
                className="text-[12px] font-bold tracking-[2px] uppercase"
                style={{ color: color as never }}
              >
                {r.tier}
              </span>
              <span className="text-[12px] opacity-[0.6] tracking-[1px]">
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
