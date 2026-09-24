'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChessPuzzleTabs } from './ChessPuzzleTabs';
import { PuzzleDuel } from './PuzzleDuel';
import { OnlinePuzzleDuel } from './OnlinePuzzleDuel';
import { PuzzleAnalyticsModal } from './PuzzleAnalyticsModal';

interface DuelClientProps {
  locale: string;
}

export function DuelClient({ locale }: DuelClientProps) {
  const searchParams = useSearchParams();
  const roomParam = searchParams?.get('room') || undefined;
  const [duelMode, setDuelMode] = useState<'bot' | 'online'>(
    roomParam ? 'online' : 'bot',
  );
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

        <div className="flex items-center justify-center gap-2 mb-6">
          <button
            type="button"
            onClick={() => setDuelMode('bot')}
            data-testid="tab-duel-bot"
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
              duelMode === 'bot'
                ? 'bg-[var(--primary)] text-white shadow-md'
                : 'bg-[var(--glassBg)] border border-[var(--glassBorder)] text-[var(--textSecondary)] hover:bg-[var(--backgroundHover)]'
            }`}
          >
            🤖 Solo vs Bot
          </button>
          <button
            type="button"
            onClick={() => setDuelMode('online')}
            data-testid="tab-duel-online"
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
              duelMode === 'online'
                ? 'bg-[var(--primary)] text-white shadow-md'
                : 'bg-[var(--glassBg)] border border-[var(--glassBorder)] text-[var(--textSecondary)] hover:bg-[var(--backgroundHover)]'
            }`}
          >
            👥 1v1 Online (Invite Friend)
          </button>
        </div>

        {duelMode === 'bot' ? (
          <PuzzleDuel />
        ) : (
          <OnlinePuzzleDuel
            initialRoomCode={roomParam}
            onBackToBot={() => setDuelMode('bot')}
          />
        )}

        <PuzzleAnalyticsModal
          isOpen={analyticsOpen}
          onClose={() => setAnalyticsOpen(false)}
        />
      </div>
    </main>
  );
}
