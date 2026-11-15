'use client';

import { useMemo, useState } from 'react';
import { Button, CosmeticSprite, ProgressBar } from '@arcadeum/ui';
import type { CommunityChallenge } from '../model/types';

interface CommunityChallengeCardProps {
  challenge: CommunityChallenge;
  onContribute: (challengeId: string) => Promise<void>;
  labels?: {
    goal?: string;
    participants?: string;
    reward?: string;
    contribute?: string;
    contributed?: string;
    completed?: string;
  };
}

export function CommunityChallengeCard({
  challenge,
  onContribute,
  labels,
}: CommunityChallengeCardProps) {
  const [isContributing, setIsContributing] = useState(false);
  const [hasContributed, setHasContributed] = useState(false);

  const ll = useMemo(
    () => ({
      goal: labels?.goal ?? 'Goal',
      participants: labels?.participants ?? 'contributors',
      reward: labels?.reward ?? 'Reward',
      contribute: labels?.contribute ?? 'Contribute',
      contributed: labels?.contributed ?? 'Contributed!',
      completed: labels?.completed ?? 'Completed',
    }),
    [labels],
  );

  const handleContribute = async () => {
    if (isContributing || hasContributed || challenge.status === 'completed')
      return;
    setIsContributing(true);
    try {
      await onContribute(challenge.id);
      setHasContributed(true);
    } finally {
      setIsContributing(false);
    }
  };

  const isComplete =
    challenge.status === 'completed' || challenge.progressPercent >= 100;

  return (
    <div
      data-testid={`challenge-card-${challenge.id}`}
      className="flex flex-col justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm transition-all hover:border-[var(--primary)]/40 hover:shadow-md"
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-[var(--primary)]/10 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-[var(--primary)] font-mono">
                {challenge.gameId.replace('-', ' ')}
              </span>
              {isComplete && (
                <span className="rounded-md bg-[var(--success)]/15 px-2 py-0.5 text-xs font-semibold text-[var(--success)]">
                  {ll.completed}
                </span>
              )}
            </div>
            <h3 className="mt-1 text-lg font-bold text-[var(--foreground)]">
              {challenge.title}
            </h3>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs font-medium text-[var(--foreground)]/60">
              {challenge.participantsCount} {ll.participants}
            </span>
          </div>
        </div>

        <p className="text-sm text-[var(--foreground)]/70 mb-4">
          {challenge.description}
        </p>

        <div className="mb-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-[var(--foreground)]/70">
              {challenge.currentProgress.toLocaleString()} /{' '}
              {challenge.target.toLocaleString()}
            </span>
            <span className="text-[var(--primary)]">
              {challenge.progressPercent}%
            </span>
          </div>
          <ProgressBar
            value={challenge.progressPercent}
            height={8}
            className="w-full"
          />
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-[var(--border)] pt-4 mt-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--gold)]/15 text-[var(--gold)] font-bold text-xs">
            <CosmeticSprite
              src={challenge.rewardBadge}
              alt={challenge.rewardTitle}
              size={24}
              className="object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-[var(--foreground)]/50 tracking-wider">
              {ll.reward}
            </span>
            <span className="text-xs font-bold text-[var(--foreground)]">
              {challenge.rewardTitle}
            </span>
          </div>
        </div>

        <Button
          variant={isComplete ? 'secondary' : 'primary'}
          size="sm"
          disabled={isComplete || isContributing || hasContributed}
          onClick={handleContribute}
          data-testid={`contribute-button-${challenge.id}`}
        >
          {hasContributed
            ? ll.contributed
            : isComplete
              ? ll.completed
              : ll.contribute}
        </Button>
      </div>
    </div>
  );
}
