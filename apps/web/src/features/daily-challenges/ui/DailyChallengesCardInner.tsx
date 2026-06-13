'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { claimDailyChallenge } from '../actions';

interface DailyChallengesCardInnerProps {
  labels: Record<string, string>;
}

export function DailyChallengesCardInner({
  labels: _labels,
}: DailyChallengesCardInnerProps) {
  return null;
}

export function ClaimChallengeButton({
  challengeId,
  date,
  labels,
}: {
  challengeId: string;
  date: string;
  labels: Record<string, string>;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [claimed, setClaimed] = useState(false);

  const handleClaim = () => {
    startTransition(async () => {
      const result = await claimDailyChallenge(challengeId, date);
      if (result.ok) {
        setClaimed(true);
        router.refresh();
      }
    });
  };

  if (claimed) {
    return (
      <span
        style={{
          padding: '6px 12px',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: 600,
          background: 'rgba(34, 197, 94, 0.2)',
          color: '#22c55e',
        }}
      >
        {labels.claimed ?? '✓'}
      </span>
    );
  }

  return (
    <button
      onClick={handleClaim}
      disabled={isPending}
      style={{
        padding: '6px 12px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: 600,
        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
        color: '#000',
        border: 'none',
        cursor: isPending ? 'not-allowed' : 'pointer',
        opacity: isPending ? 0.7 : 1,
      }}
    >
      {isPending ? '...' : (labels.claim ?? 'Claim')}
    </button>
  );
}
