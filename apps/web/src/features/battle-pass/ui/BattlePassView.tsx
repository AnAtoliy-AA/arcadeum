'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@arcadeum/ui';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import { claimTierAction } from '../actions';
import type {
  BattlePassReward,
  BattlePassState,
  BattlePassTier,
} from '../server/battle-pass.types';

const REWARD_GLYPH: Record<BattlePassReward['type'], string> = {
  coins: '🪙',
  gems: '💎',
  cosmetic: '✨',
};

function rewardLabel(r: BattlePassReward): string {
  return `${REWARD_GLYPH[r.type]} ${r.label}`;
}

function nextThreshold(tiers: BattlePassTier[], xp: number) {
  const upcoming = tiers.find((t) => t.xpRequired > xp);
  return upcoming?.xpRequired ?? xp;
}

export function BattlePassView({ state }: { state: BattlePassState }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [claimed, setClaimed] = useState<number[]>(state.claimedTiers);
  const [pendingTier, setPendingTier] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { season, xp, currentTier, isPremium } = state;
  const next = useMemo(
    () => nextThreshold(season.tiers, xp),
    [season.tiers, xp],
  );
  const maxed = currentTier >= season.tiers.length;
  const progressPct = maxed
    ? 100
    : Math.min(100, Math.round((xp / Math.max(1, next)) * 100));

  const endsLabel = t('battlePass.seasonEnds' as TranslationKey, {
    date: new Date(season.endsAt).toLocaleDateString(),
  });

  const handleClaim = (tier: number) => {
    setPendingTier(tier);
    setError(null);
    startTransition(async () => {
      try {
        const res = await claimTierAction(tier);
        setClaimed(res.claimedTiers);
        router.refresh();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to claim reward. Please try again.',
        );
      } finally {
        setPendingTier(null);
      }
    });
  };

  return (
    <div className="flex flex-col items-stretch gap-5 p-4 max-w-[1100px] w-full">
      <div className="flex flex-col items-stretch gap-2">
        <div className="flex flex-row items-center gap-3 flex-wrap">
          <span className="text-[40px] font-black">
            {t('battlePass.title' as TranslationKey)}
          </span>
          {isPremium ? (
            <div className="px-3 py-1 rounded-full bg-[var(--goldAccent)]/15 border border-[var(--goldAccent)]/40">
              <span className="text-[14px] font-extrabold text-[var(--goldAccent)]">
                👑 {t('battlePass.premiumActive' as TranslationKey)}
              </span>
            </div>
          ) : null}
        </div>
        <span className="text-[18px] opacity-75">
          {t('battlePass.subtitle' as TranslationKey)}
        </span>
        <span className="text-[16px] opacity-60">
          {season.title} · {endsLabel}
        </span>
      </div>

      {error ? (
        <div className="flex flex-row items-center gap-2 p-3 rounded-xl bg-[var(--errorBg)] border border-[var(--errorBorder)]">
          <span className="text-[14px] text-[var(--error)]">{error}</span>
          <Button variant="ghost" size="sm" onClick={() => setError(null)}>
            ✕
          </Button>
        </div>
      ) : null}

      {/* XP progress to next tier */}
      <div
        className="flex flex-col items-stretch gap-2"
        role="status"
        aria-live="polite"
      >
        <span className="text-[14px] opacity-70">
          {maxed
            ? t('battlePass.maxedOut' as TranslationKey)
            : t('battlePass.progress' as TranslationKey, { xp, next })}
        </span>
        <div className="h-[10px] rounded-full bg-[var(--gridLine)] overflow-hidden">
          <div
            className="h-full rounded-full bg-[var(--accent)]"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {!isPremium ? (
        <span className="text-[14px] opacity-60">
          🔒 {t('battlePass.unlockHint' as TranslationKey)}
        </span>
      ) : null}

      {/* Tier rail */}
      <div
        className="flex flex-row items-stretch gap-3 overflow-scroll py-2"
        data-testid="battle-pass-rail"
      >
        {season.tiers.map((tierDef) => {
          const unlocked = currentTier >= tierDef.tier;
          const isClaimed = claimed.includes(tierDef.tier);
          const busy = isPending && pendingTier === tierDef.tier;

          return (
            <div
              className="flex flex-col items-stretch min-w-[160px] gap-3 p-3 rounded-3xl border bg-[var(--glassBg)]"
              style={{
                borderColor: unlocked ? 'var(--accent)' : 'var(--glassBorder)',
                opacity: unlocked ? 1 : 0.6,
              }}
              key={tierDef.tier}
              data-testid={`battle-pass-tier-${tierDef.tier}`}
            >
              <span className="text-[16px] font-extrabold tracking-[1px]">
                {t('battlePass.tier' as TranslationKey, { tier: tierDef.tier })}
              </span>

              <RewardNode
                label={t('battlePass.free' as TranslationKey)}
                reward={tierDef.freeReward}
                dimmed={false}
              />
              <RewardNode
                label={t('battlePass.premium' as TranslationKey)}
                reward={tierDef.premiumReward}
                dimmed={!isPremium}
                accent
              />

              {isClaimed ? (
                <Button variant="ghost" size="sm" disabled>
                  ✓ {t('battlePass.claimed' as TranslationKey)}
                </Button>
              ) : unlocked ? (
                <Button
                  variant="primary"
                  size="sm"
                  disabled={busy}
                  onClick={() => handleClaim(tierDef.tier)}
                  data-testid={`battle-pass-claim-${tierDef.tier}`}
                >
                  {t('battlePass.claim' as TranslationKey)}
                </Button>
              ) : (
                <Button variant="secondary" size="sm" disabled>
                  🔒 {t('battlePass.locked' as TranslationKey)}
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RewardNode({
  label,
  reward,
  dimmed,
  accent,
}: {
  label: string;
  reward: BattlePassReward;
  dimmed: boolean;
  accent?: boolean;
}) {
  return (
    <div
      className="flex flex-col items-stretch gap-2 p-2 rounded-xl border"
      style={{
        backgroundColor: accent
          ? 'var(--goldAccent, #facc15)'
          : 'var(--gridLine)',
        borderColor: accent
          ? 'var(--goldAccent, #facc15)'
          : 'var(--glassBorder)',
        opacity: dimmed ? 0.45 : 1,
      }}
    >
      <span
        className="text-[48px] uppercase tracking-[1px] opacity-60"
        style={{
          color: accent ? 'var(--goldAccent, #facc15)' : 'var(--textSecondary)',
        }}
      >
        {label}
      </span>
      <span className="text-[16px] font-bold">{rewardLabel(reward)}</span>
    </div>
  );
}
