import { Suspense } from 'react';
import { getTranslations } from '@/shared/i18n/server';
import { dailyRewardsEn } from '@/shared/i18n/messages/pages/daily-rewards/en';
import { getDailyRewardStatus } from '../server/daily-rewards.server';
import { StampRow } from './StampRow';
import { ClaimButton } from './ClaimButton';

interface DailyRewardsMessages {
  pages?: { dailyRewards?: Partial<typeof dailyRewardsEn> };
}

/**
 * Server Component card shown at the top of the wallet page. Renders nothing
 * when the BE call fails (unauthenticated, transient error, etc.) — same
 * defensive pattern as `BalanceChip`.
 */
async function DailyRewardCardInner() {
  const messages = (await getTranslations()) as DailyRewardsMessages;
  const t = messages.pages?.dailyRewards ?? {};

  const title = t.title ?? dailyRewardsEn.title;
  const subtitle = t.subtitle ?? dailyRewardsEn.subtitle;
  const streakLabel = t.streakLabel ?? dailyRewardsEn.streakLabel;
  const dayLabel = t.dayLabel ?? dailyRewardsEn.dayLabel;
  const errors = { ...dailyRewardsEn.errors, ...(t.errors ?? {}) };
  const toasts = { ...dailyRewardsEn.toasts, ...(t.toasts ?? {}) };
  const claimLabel = t.claim ?? dailyRewardsEn.claim;
  const claimedLabel = t.claimed ?? dailyRewardsEn.claimed;

  const status = await getDailyRewardStatus();
  if (!status) return null;

  return (
    <section
      data-testid="daily-reward-card"
      aria-label={title}
      style={{
        maxWidth: '900px',
        margin: '16px auto',
        padding: '20px',
        borderRadius: '16px',
        background:
          'linear-gradient(135deg, rgba(251,191,36,0.06) 0%, rgba(124,58,237,0.06) 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h2
            style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: 700,
              color: '#e4e4e7',
            }}
          >
            {title}
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: '13px',
              color: '#a1a1aa',
              maxWidth: '520px',
            }}
          >
            {subtitle}
          </p>
        </div>
        <div
          data-testid="daily-reward-streak-label"
          style={{
            fontSize: '12px',
            color: '#a1a1aa',
            background: 'rgba(255,255,255,0.04)',
            padding: '4px 10px',
            borderRadius: '999px',
            whiteSpace: 'nowrap',
          }}
        >
          {streakLabel.replace('{n}', String(status.currentStreak))}
        </div>
      </header>

      <StampRow
        nextDay={status.nextDay}
        currentStreak={status.currentStreak}
        canClaim={status.canClaim}
        dayLabel={dayLabel}
      />

      <ClaimButton
        canClaim={status.canClaim}
        nextRewardCoins={status.nextRewardCoins}
        nextRewardGems={status.nextRewardGems}
        labels={{
          claim: claimLabel,
          gemBonusSuffix:
            t.gemBonusSuffix ?? dailyRewardsEn.gemBonusSuffix,
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
    </section>
  );
}

export function DailyRewardCard() {
  return (
    <Suspense
      fallback={
        <div
          data-testid="daily-reward-card-skeleton"
          aria-hidden
          style={{
            maxWidth: '900px',
            margin: '16px auto',
            height: '180px',
            borderRadius: '16px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        />
      }
    >
      <DailyRewardCardInner />
    </Suspense>
  );
}
