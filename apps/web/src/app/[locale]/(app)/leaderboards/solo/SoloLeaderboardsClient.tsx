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
    difficulties: ['beginner', 'intermediate', 'expert'],
    sortBy: 'durationMs' as const,
    order: 'asc' as const,
  },
  {
    id: 'sudoku_v1',
    label: 'Sudoku',
    difficulties: ['easy', 'medium', 'hard'],
    sortBy: 'durationMs' as const,
    order: 'asc' as const,
  },
  {
    id: 'game_2048_v1',
    label: '2048',
    difficulties: ['default'],
    sortBy: 'score' as const,
    order: 'desc' as const,
  },
  {
    id: 'solitaire_v1',
    label: 'Solitaire',
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
      {/* Game tabs */}
      <div className="flex flex-wrap gap-2">
        {SOLO_GAMES.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => handleGameChange(g.id)}
            className={cx(
              'rounded-xl px-4 py-2 text-sm font-medium transition-all',
              selectedGame === g.id
                ? 'bg-[var(--primary)] text-white shadow-md'
                : 'border border-[var(--glassBorder)] bg-[var(--glassBg)] text-[var(--color)] hover:border-[var(--glassBorderStrong)]',
            )}
          >
            {g.label}
          </button>
        ))}
      </div>

      {/* Difficulty tabs */}
      {game.difficulties.length > 1 && (
        <div className="flex gap-1 rounded-xl bg-[var(--background)] p-1">
          {game.difficulties.map((diff) => (
            <button
              key={diff}
              type="button"
              onClick={() => setSelectedDifficulty(diff)}
              className={cx(
                'flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
                selectedDifficulty === diff
                  ? 'bg-[var(--primary)] text-white shadow-md'
                  : 'text-[var(--textSecondary)] hover:text-[var(--color)]',
              )}
            >
              {t(
                `games.soloLeaderboard.difficulty.${diff}` as TranslationKey,
              ) || diff}
            </button>
          ))}
        </div>
      )}

      {/* Leaderboard */}
      <SoloGlobalLeaderboard
        gameId={selectedGame}
        difficulty={selectedDifficulty}
        sortBy={game.sortBy}
        order={game.order}
        currentUserId={snapshot.accessToken?.slice(0, 16)}
      />
    </div>
  );
}
