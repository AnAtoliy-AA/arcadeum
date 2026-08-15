import { Suspense } from 'react';
import { getTranslations } from '@/shared/i18n/server';
import { dailyRewardsEn } from '@/shared/i18n/messages/pages/daily-rewards/en';
import { getDailyRewardStatus } from '../server/daily-rewards.server';
import { ClaimButton } from './ClaimButton';

interface DailyRewardsMessages {
  pages?: { dailyRewards?: Partial<typeof dailyRewardsEn> };
}

/**
 * Compact home-page CTA. Renders nothing when the user has already claimed
 * today or when the BE status fetch fails — the home page is intentionally
 * marketing-heavy, so this stays out of the way until there is an actionable
 * reward.
 */
async function DailyRewardChipInner() {
  const status = await getDailyRewardStatus();
  if (!status || !status.canClaim) return null;

  const messages = (await getTranslations()) as DailyRewardsMessages;
  const t = messages.pages?.dailyRewards ?? {};
  const claimLabel = t.claim ?? dailyRewardsEn.claim;
  const claimedLabel = t.claimed ?? dailyRewardsEn.claimed;
  const errors = { ...dailyRewardsEn.errors, ...(t.errors ?? {}) };
  const toasts = { ...dailyRewardsEn.toasts, ...(t.toasts ?? {}) };
  const title = t.title ?? dailyRewardsEn.title;

  return (
    <section
      data-testid="daily-reward-chip"
      aria-label={title}
      className="mx-auto mb-3 flex w-full max-w-[480px] items-center gap-3 rounded-xl border border-[rgba(251,191,36,0.25)] px-4 py-3"
      style={{
        background:
          'linear-gradient(135deg, rgba(251,191,36,0.1) 0%, rgba(124,58,237,0.08) 100%)',
      }}
    >
      <span aria-hidden className="inline-flex text-[24px] leading-none">
        {'🪙'}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <ClaimButton
          canClaim={status.canClaim}
          nextRewardCoins={status.nextRewardCoins}
          nextRewardGems={status.nextRewardGems}
          labels={{
            claim: claimLabel,
            gemBonusSuffix: t.gemBonusSuffix ?? dailyRewardsEn.gemBonusSuffix,
            claimed: claimedLabel,
            toastClaimed: toasts.claimed ?? dailyRewardsEn.toasts.claimed,
            toastGemBonusSuffix:
              toasts.gemBonusSuffix ?? dailyRewardsEn.toasts.gemBonusSuffix,
            errorAlreadyClaimed:
              errors.alreadyClaimed ?? dailyRewardsEn.errors.alreadyClaimed,
            errorUnauthorized:
              errors.unauthorized ?? dailyRewardsEn.errors.unauthorized,
            errorGeneric: errors.generic ?? dailyRewardsEn.errors.generic,
          }}
        />
      </div>
    </section>
  );
}

export function DailyRewardChip() {
  // Wrap in Suspense so the rest of the home page can render while the chip
  // checks status. Fallback is `null` because we want zero visual footprint
  // until we know there's something to claim.
  return (
    <Suspense fallback={null}>
      <DailyRewardChipInner />
    </Suspense>
  );
}
