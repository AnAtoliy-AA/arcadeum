'use client';

import { useState } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import { useTranslation } from '@/shared/lib/useTranslation';
import type { TranslationKey } from '@/shared/lib/useTranslation';
import { SoloGlobalLeaderboard } from '@/features/games/ui/solo-leaderboard/SoloGlobalLeaderboard';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';

const SOLO_GAMES = [
  {
    id: 'minesweeper_v1',
    label: 'Minesweeper',
    emoji: '💣',
    difficulties: ['beginner', 'intermediate', 'expert'],
    sortBy: 'durationMs' as const,
    order: 'asc' as const,
  },
  {
    id: 'sudoku_v1',
    label: 'Sudoku',
    emoji: '🔢',
    difficulties: ['easy', 'medium', 'hard'],
    sortBy: 'durationMs' as const,
    order: 'asc' as const,
  },
  {
    id: 'game_2048_v1',
    label: '2048',
    emoji: '🟨',
    difficulties: ['default'],
    sortBy: 'score' as const,
    order: 'desc' as const,
  },
  {
    id: 'solitaire_v1',
    label: 'Solitaire',
    emoji: '🃏',
    difficulties: ['default'],
    sortBy: 'score' as const,
    order: 'desc' as const,
  },
] as const;

export function SoloLeaderboardsClient() {
  const { t } = useTranslation();
  const { snapshot } = useSessionTokens();
  const [selectedGame, setSelectedGame] = useState<string>(SOLO_GAMES[0].id);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>(
    SOLO_GAMES[0].difficulties[0],
  );

  const game = SOLO_GAMES.find((g) => g.id === selectedGame) ?? SOLO_GAMES[0];

  const handleGameChange = (gameId: string) => {
    const g = SOLO_GAMES.find((x) => x.id === gameId) ?? SOLO_GAMES[0];
    setSelectedGame(g.id);
    setSelectedDifficulty(g.difficulties[0]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2.5">
        {SOLO_GAMES.map((g) => (
          <button
            key={g.id}
            type="button"
            data-testid={`solo-game-tab-${g.id}`}
            onClick={() => handleGameChange(g.id)}
            className={cx(
              'flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-200',
              selectedGame === g.id
                ? 'bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/30 scale-[1.02]'
                : 'border border-[var(--glassBorder)] bg-[var(--glassBg)] text-[var(--color)] hover:border-[var(--glassBorderStrong)] hover:bg-[var(--backgroundHover)]',
            )}
          >
            <span>{g.emoji}</span>
            <span>{g.label}</span>
          </button>
        ))}
      </div>

      {game.difficulties.length > 1 && (
        <div className="flex gap-1.5 rounded-xl border border-[var(--glassBorder)] bg-[var(--glassBg)] p-1.5 shadow-inner">
          {game.difficulties.map((diff) => (
            <button
              key={diff}
              type="button"
              data-testid={`solo-diff-tab-${diff}`}
              onClick={() => setSelectedDifficulty(diff)}
              className={cx(
                'flex-1 rounded-lg px-3.5 py-2 text-xs font-bold transition-all duration-200',
                selectedDifficulty === diff
                  ? 'bg-[var(--primary)] text-white shadow-md shadow-[var(--primary)]/30'
                  : 'text-[var(--textSecondary)] hover:text-[var(--color)] hover:bg-[var(--backgroundHover)]',
              )}
            >
              {t(
                `games.soloLeaderboard.difficulty.${diff}` as TranslationKey,
              ) || diff}
            </button>
          ))}
        </div>
      )}

      <div className="rounded-2xl border border-[var(--glassBorder)] bg-[var(--glassBg)] p-4 shadow-xl backdrop-blur-xl sm:p-6">
        <SoloGlobalLeaderboard
          gameId={selectedGame}
          difficulty={selectedDifficulty}
          sortBy={game.sortBy}
          order={game.order}
          currentUserId={snapshot.accessToken?.slice(0, 16)}
        />
      </div>
    </div>
  );
}
