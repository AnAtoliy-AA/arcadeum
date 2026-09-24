'use client';

import { useState } from 'react';
import { ChessPuzzleTabs } from './ChessPuzzleTabs';
import { PuzzleDuel } from './PuzzleDuel';
import { PuzzleAnalyticsModal } from './PuzzleAnalyticsModal';

interface DuelClientProps {
  locale: string;
}

export function DuelClient({ locale }: DuelClientProps) {
  const [analyticsOpen, setAnalyticsOpen] = useState(false);

  return (
    <main className="flex flex-col items-center min-h-screen py-6">
      <div className="w-full max-w-[900px] px-4">
        <div className="flex flex-col items-center text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color)] mb-2">
            1v1 Puzzle Duel
          </h1>
          <p className="text-sm text-[var(--textSecondary)] max-w-md">
            Test your speed and accuracy in a fast-paced live tactical race
            against chess bots and friends.
          </p>
        </div>

        <ChessPuzzleTabs
          activeTab="duel"
          locale={locale}
          onOpenAnalytics={() => setAnalyticsOpen(true)}
        />

        <PuzzleDuel />

        <PuzzleAnalyticsModal
          isOpen={analyticsOpen}
          onClose={() => setAnalyticsOpen(false)}
        />
      </div>
    </main>
  );
}
