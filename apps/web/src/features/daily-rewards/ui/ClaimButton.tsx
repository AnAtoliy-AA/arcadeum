'use client';

import { useState, useTransition } from 'react';
import { claimDailyRewardAction } from '../server/daily-rewards.actions';

export interface ClaimButtonLabels {
  /** Default CTA copy when claim is available, e.g. "Claim {n} coins". */
  claim: string;
  /** Suffix appended when next claim also awards gems, e.g. " + {n} 💎". */
  gemBonusSuffix: string;
  /** Disabled-state copy when the user has already claimed today. */
  claimed: string;
  /** Toast/success message after a successful claim ("You claimed {n} coins!"). */
  toastClaimed: string;
  /** Toast suffix appended when the claim also awarded gems. */
  toastGemBonusSuffix: string;
  /** Error copy for 409 already-claimed. */
  errorAlreadyClaimed: string;
  /** Error copy for 401 unauthorized. */
  errorUnauthorized: string;
  /** Fallback error copy. */
  errorGeneric: string;
}

export interface ClaimButtonProps {
  /** Whether the user can claim today. Disables the button when false. */
  canClaim: boolean;
  /** Coin amount the next claim will award. */
  nextRewardCoins: number;
  /** Gem amount the next claim will award. 0 means no gem bonus. */
  nextRewardGems?: number;
  labels: ClaimButtonLabels;
}

/**
 * Submit button that fires the `claimDailyRewardAction` Server Action and
 * surfaces success/error inline. Disabled when the user cannot claim today,
 * which keeps the button visually present (good for layout stability) but
 * non-interactive.
 */
export function ClaimButton({
  canClaim,
  nextRewardCoins,
  nextRewardGems = 0,
  labels,
}: ClaimButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<
    | { kind: 'success'; message: string }
    | { kind: 'error'; message: string }
    | null
  >(null);

  const handleClick = () => {
    if (!canClaim || isPending) return;
    setFeedback(null);

    startTransition(async () => {
      const res = await claimDailyRewardAction();
      if (res.ok) {
        let msg = labels.toastClaimed.replace(
          '{n}',
          String(res.result.awardedCoins),
        );
        if (res.result.awardedGems > 0) {
          msg += labels.toastGemBonusSuffix.replace(
            '{n}',
            String(res.result.awardedGems),
          );
        }
        setFeedback({ kind: 'success', message: msg });
      } else if (res.code === 'already_claimed') {
        setFeedback({ kind: 'error', message: labels.errorAlreadyClaimed });
      } else if (res.code === 'unauthorized') {
        setFeedback({ kind: 'error', message: labels.errorUnauthorized });
      } else {
        setFeedback({ kind: 'error', message: labels.errorGeneric });
      }
    });
  };

  const disabled = !canClaim || isPending;
  let label: string;
  if (canClaim) {
    label = labels.claim.replace('{n}', String(nextRewardCoins));
    if (nextRewardGems > 0) {
      label += labels.gemBonusSuffix.replace('{n}', String(nextRewardGems));
    }
  } else {
    label = labels.claimed;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <button
        type="button"
        data-testid="daily-reward-claim-btn"
        onClick={handleClick}
        disabled={disabled}
        aria-disabled={disabled}
        style={{
          padding: '12px 20px',
          borderRadius: '10px',
          border: 'none',
          background: disabled
            ? 'rgba(255,255,255,0.06)'
            : 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
          color: disabled ? '#71717a' : '#0a0a0a',
          fontWeight: 700,
          fontSize: '14px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          width: '100%',
          textAlign: 'center',
        }}
      >
        {isPending ? '…' : label}
      </button>

      {feedback?.kind === 'success' && (
        <div
          role="status"
          data-testid="daily-reward-success"
          style={{
            fontSize: '13px',
            color: '#22c55e',
            background: 'rgba(34,197,94,0.08)',
            padding: '8px 12px',
            borderRadius: '6px',
          }}
        >
          {feedback.message}
        </div>
      )}
      {feedback?.kind === 'error' && (
        <div
          role="alert"
          data-testid="daily-reward-error"
          style={{
            fontSize: '13px',
            color: '#ef4444',
            background: 'rgba(239,68,68,0.08)',
            padding: '8px 12px',
            borderRadius: '6px',
          }}
        >
          {feedback.message}
        </div>
      )}
    </div>
  );
}
