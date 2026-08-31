'use client';

import { useState, useTransition } from 'react';
import { claimSocialRewardAction } from '../server/social-rewards.actions';
import type { SocialPlatformId } from '../server/social-rewards.types';

export interface SocialRewardButtonLabels {
  claim?: string;
  claimed?: string;
  followAndClaim?: string;
  toastSuccess?: string;
  errorAlreadyClaimed?: string;
  errorUnauthorized?: string;
  errorGeneric?: string;
}

export interface SocialRewardButtonProps {
  platform: SocialPlatformId;
  href?: string;
  gems?: number;
  initialClaimed?: boolean;
  labels?: SocialRewardButtonLabels;
}

export function SocialRewardButton({
  platform,
  href,
  gems = 1,
  initialClaimed = false,
  labels,
}: SocialRewardButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [isClaimed, setIsClaimed] = useState(initialClaimed);
  const [feedback, setFeedback] = useState<
    | { kind: 'success'; message: string }
    | { kind: 'error'; message: string }
    | null
  >(null);

  const claimLabel = labels?.claim ?? 'Claim +{n} 💎';
  const claimedLabel = labels?.claimed ?? 'Claimed ✓';
  const followAndClaimLabel =
    labels?.followAndClaim ?? 'Subscribe & Claim +{n} 💎';
  const toastSuccessLabel =
    labels?.toastSuccess ?? 'Claimed +{n} Gem successfully!';
  const errorAlreadyClaimedLabel =
    labels?.errorAlreadyClaimed ?? 'Already claimed!';
  const errorUnauthorizedLabel =
    labels?.errorUnauthorized ?? 'Please sign in to claim rewards.';
  const errorGenericLabel =
    labels?.errorGeneric ?? 'Failed to claim reward. Try again.';

  const handleAction = () => {
    if (href) {
      window.open(href, '_blank', 'noopener,noreferrer');
    }

    if (isClaimed || isPending) return;

    setFeedback(null);
    startTransition(async () => {
      const res = await claimSocialRewardAction(platform);
      if (res.ok) {
        setIsClaimed(true);
        const msg = toastSuccessLabel.replace(
          '{n}',
          String(res.result.gemsAwarded),
        );
        setFeedback({ kind: 'success', message: msg });
      } else if (res.code === 'already_claimed') {
        setIsClaimed(true);
        setFeedback({ kind: 'error', message: errorAlreadyClaimedLabel });
      } else if (res.code === 'unauthorized') {
        setFeedback({ kind: 'error', message: errorUnauthorizedLabel });
      } else {
        setFeedback({ kind: 'error', message: errorGenericLabel });
      }
    });
  };

  const buttonText = isClaimed
    ? claimedLabel
    : href
      ? followAndClaimLabel.replace('{n}', String(gems))
      : claimLabel.replace('{n}', String(gems));

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <button
        type="button"
        data-testid={`social-reward-claim-btn-${platform}`}
        onClick={handleAction}
        disabled={isClaimed || isPending}
        aria-disabled={isClaimed || isPending}
        className={`w-full rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
          isClaimed
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default'
            : isPending
              ? 'bg-white/10 text-zinc-400 cursor-wait'
              : 'bg-amber-400 text-zinc-950 hover:bg-amber-300 shadow-md shadow-amber-500/20 active:scale-[0.98]'
        }`}
      >
        {isPending ? '…' : buttonText}
      </button>

      {feedback?.kind === 'success' && (
        <div
          role="status"
          data-testid={`social-reward-success-${platform}`}
          className="rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 text-[11px] font-medium text-emerald-400 text-center"
        >
          {feedback.message}
        </div>
      )}

      {feedback?.kind === 'error' && (
        <div
          role="alert"
          data-testid={`social-reward-error-${platform}`}
          className="rounded-lg bg-rose-500/15 border border-rose-500/30 px-2.5 py-1 text-[11px] font-medium text-rose-400 text-center"
        >
          {feedback.message}
        </div>
      )}
    </div>
  );
}
