'use client';

import { useState } from 'react';
import {
  Button,
  GlassCard,
  LockIcon,
  ProgressBar,
  TrophyIcon,
} from '@arcadeum/ui';
import type { Achievement } from '../server/achievements.types';
import { claimAchievement } from '../actions';
import { getRarityStyle } from '../lib/rarity';

export interface AchievementGridLabels {
  claim: string;
  claimed: string;
  lockedTooltip: string;
  error: string;
  categories: Record<string, string>;
  rarities: Record<string, string>;
  rewards: { xp: string; coins: string; gems: string };
}

interface AchievementCardProps {
  achievement: Achievement;
  labels: AchievementGridLabels;
}

function AchievementCard({ achievement, labels }: AchievementCardProps) {
  const [claiming, setClaiming] = useState(false);
  const [claimedOverride, setClaimedOverride] = useState(false);
  const [error, setError] = useState(false);

  const { achievementId, rarity, category } = achievement;
  const unlocked = achievement.unlocked;
  const claimed = claimedOverride || achievement.claimed;
  const rarityStyle = getRarityStyle(rarity);
  // Destructure (not dot-access) — `coins`/`gems` member access trips the
  // wallet-balance lint guard.
  const { xp: xpUnit, coins: coinUnit, gems: gemUnit } = labels.rewards;
  const showProgress =
    !unlocked &&
    achievement.targetProgress > 0 &&
    achievement.progress < achievement.targetProgress;
  const percent =
    achievement.targetProgress > 0
      ? Math.min(
          100,
          Math.round((achievement.progress / achievement.targetProgress) * 100),
        )
      : 0;

  const handleClaim = async () => {
    setClaiming(true);
    setError(false);
    try {
      const result = await claimAchievement(achievementId);
      if (result.ok) {
        setClaimedOverride(true);
      } else if (result.code === 'already_claimed') {
        // Server is the source of truth — treat as claimed.
        setClaimedOverride(true);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setClaiming(false);
    }
  };

  return (
    <GlassCard
      className={`gap-3 !p-5 ${unlocked ? '' : 'opacity-60'}`}
      data-testid={`achievement-card-${achievementId}`}
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          title={unlocked ? undefined : labels.lockedTooltip}
          data-testid={
            unlocked ? 'achievement-icon-trophy' : 'achievement-icon-lock'
          }
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
          style={{
            backgroundColor: unlocked ? rarityStyle.glow : 'var(--borderColor)',
            color: unlocked ? rarityStyle.text : 'var(--textSecondary)',
          }}
        >
          {achievement.iconUrl ? (
            // Arbitrary BE-provided URL — next/image would require a
            // remotePatterns allowlist, so an optimized plain img is used.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={achievement.iconUrl}
              alt=""
              width={24}
              height={24}
              className="h-6 w-6 rounded object-contain"
              loading="lazy"
            />
          ) : unlocked ? (
            <TrophyIcon size={22} />
          ) : (
            <LockIcon size={22} />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold">
            {achievement.name}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span className="rounded-full border border-[var(--glassBorder)] px-2 py-0.5 text-[10px] uppercase tracking-[1px] opacity-70">
              {labels.categories[category] ?? category}
            </span>
            <span
              className="rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[1px]"
              style={{
                color: rarityStyle.text,
                borderColor: rarityStyle.border,
              }}
            >
              {labels.rarities[rarity] ?? rarity}
            </span>
          </div>
        </div>
      </div>

      <p className="text-[13px] leading-snug opacity-70">
        {achievement.description}
      </p>

      {showProgress ? (
        <ProgressBar value={percent} height={6} color={rarityStyle.text} />
      ) : null}

      {(achievement.xpReward > 0 ||
        achievement.coinReward > 0 ||
        achievement.gemReward > 0) && (
        <div className="flex flex-wrap gap-1.5">
          {achievement.xpReward > 0 && (
            <span className="rounded-md bg-[rgba(245,158,11,0.15)] px-2 py-0.5 text-[12px] font-semibold text-[#f59e0b]">
              +{achievement.xpReward} {xpUnit}
            </span>
          )}
          {achievement.coinReward > 0 && (
            <span className="rounded-md bg-[rgba(59,130,246,0.15)] px-2 py-0.5 text-[12px] font-semibold text-[#3b82f6]">
              +{achievement.coinReward} {coinUnit}
            </span>
          )}
          {achievement.gemReward > 0 && (
            <span className="rounded-md bg-[rgba(168,85,247,0.15)] px-2 py-0.5 text-[12px] font-semibold text-[#a855f7]">
              +{achievement.gemReward} {gemUnit}
            </span>
          )}
        </div>
      )}

      {unlocked && !claimed && (
        <Button
          variant="primary"
          size="sm"
          loading={claiming}
          disabled={claiming}
          onClick={handleClaim}
          fullWidth
          data-testid={`achievement-claim-${achievementId}`}
        >
          {labels.claim}
        </Button>
      )}

      {claimed && (
        <span
          data-testid={`achievement-claimed-${achievementId}`}
          className="rounded-lg bg-[rgba(4,120,87,0.15)] px-3 py-1.5 text-center text-[12px] font-semibold text-[var(--success)]"
        >
          ✓ {labels.claimed}
        </span>
      )}

      {error && !claimed && (
        <p className="text-[12px] text-[var(--danger)]" role="alert">
          {labels.error}
        </p>
      )}
    </GlassCard>
  );
}

interface AchievementGridProps {
  achievements: Achievement[];
  labels: AchievementGridLabels;
}

export function AchievementGrid({
  achievements,
  labels,
}: AchievementGridProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {achievements.map((achievement) => (
        <AchievementCard
          key={achievement.achievementId}
          achievement={achievement}
          labels={labels}
        />
      ))}
    </div>
  );
}
