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
      style={{
        maxWidth: '480px',
        margin: '12px auto',
        padding: '12px 16px',
        borderRadius: '12px',
        background:
          'linear-gradient(135deg, rgba(251,191,36,0.1) 0%, rgba(124,58,237,0.08) 100%)',
        border: '1px solid rgba(251,191,36,0.25)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      <span
        aria-hidden
        style={{
          fontSize: '24px',
          lineHeight: 1,
          display: 'inline-flex',
        }}
      >
        {'🪙'}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <ClaimButton
          canClaim={status.canClaim}
          nextRewardCoins={status.nextRewardCoins}
          labels={{
            claim: claimLabel,
            claimed: claimedLabel,
            toastClaimed: toasts.claimed ?? dailyRewardsEn.toasts.claimed,
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
