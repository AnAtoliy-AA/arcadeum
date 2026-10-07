'use client';

import { useMemo } from 'react';
import type { CommunityChallenge } from '../model/types';
import { CommunityChallengeCard } from './CommunityChallengeCard';

interface CommunityChallengesListProps {
  challenges: CommunityChallenge[];
  onContribute: (challengeId: string) => Promise<void>;
  labels?: {
    headerTitle?: string;
    headerSubtitle?: string;
    noChallenges?: string;
    goal?: string;
    participants?: string;
    reward?: string;
    contribute?: string;
    contributed?: string;
    completed?: string;
  };
}

export function CommunityChallengesList({
  challenges,
  onContribute,
  labels,
}: CommunityChallengesListProps) {
  const ll = useMemo(
    () => ({
      headerTitle: labels?.headerTitle ?? 'Weekly Community Challenges',
      headerSubtitle:
        labels?.headerSubtitle ??
        'Join forces with players and clan members across Arcadeum to reach collective milestones and earn exclusive titles.',
      noChallenges:
        labels?.noChallenges ?? 'No active community challenges right now.',
    }),
    [labels],
  );

  return (
    <div
      className="flex flex-col gap-6"
      data-testid="community-challenges-container"
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-[var(--foreground)]">
          {ll.headerTitle}
        </h2>
        <p className="text-sm text-[var(--foreground)]/70 max-w-2xl">
          {ll.headerSubtitle}
        </p>
      </div>

      {challenges.length === 0 ? (
        <div className="flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)]/40 py-12 text-center text-sm text-[var(--foreground)]/60">
          {ll.noChallenges}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {challenges.map((challenge) => (
            <CommunityChallengeCard
              key={challenge.id}
              challenge={challenge}
              onContribute={onContribute}
              labels={labels}
            />
          ))}
        </div>
      )}
    </div>
  );
}
