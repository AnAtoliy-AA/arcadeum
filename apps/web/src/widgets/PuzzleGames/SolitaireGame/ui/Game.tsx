'use client';

import { useMemo, useState } from 'react';
import { Button } from '@arcadeum/ui';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useTrackSoloGameStarted } from '@/shared/analytics/useTrackSoloGameStarted';
import type { GameResultStats } from '@/features/games/ui/GameResultStatsGrid';
import {
  SoloGameContainer,
  StatCard,
  formatDuration,
} from '@/features/games/ui/SoloGameContainer';
import { SolitaireThemeProvider } from '../lib/SolitaireThemeContext';
import { useSolitaireStore } from '../store/solitaireStore';
import type { MoveSource } from '../types';
import { SolitaireBoard } from './SolitaireBoard';

export default function SolitaireGame() {
  useTrackSoloGameStarted('solitaire_v1');
  return (
    <SolitaireThemeProvider>
      <SolitaireTable />
    </SolitaireThemeProvider>
  );
}

function SolitaireTable() {
  const { t } = useTranslation();
  const game = useSolitaireStore((state) => state.game);
  const finished = useSolitaireStore((state) => state.finished);
  const startedAt = useSolitaireStore((state) => state.startedAt);
  const finishedAt = useSolitaireStore((state) => state.finishedAt);
  const draw = useSolitaireStore((state) => state.draw);
  const move = useSolitaireStore((state) => state.move);
  const newGame = useSolitaireStore((state) => state.newGame);

  const [selection, setSelection] = useState<MoveSource | null>(null);
  const isRunning = finishedAt === null;

  const stats: GameResultStats | null = useMemo(() => {
    if (!finished) return null;
    return {
      score: finished.score,
      turns: finished.moves,
      duration: formatDuration(finished.durationMs),
    };
  }, [finished]);

  const hud = (
    <>
      <div className="flex items-center gap-2 sm:gap-4">
        <StatCard
          label={t('games.solitaire_v1.hud.score')}
          value={game.score}
        />
        <StatCard
          label={t('games.solitaire_v1.hud.moves')}
          value={game.moves}
        />
        <StatCard
          label={t('games.solitaire_v1.hud.time')}
          value={formatDuration(finished?.durationMs ?? 0)}
        />
      </div>

      <div className="flex items-center gap-2">
        {finished !== null && (
          <Button
            variant="secondary"
            size="sm"
            data-testid="solitaire-show-results-button"
            className="border-amber-500/40 bg-amber-500/15 text-amber-600 dark:text-amber-300 hover:bg-amber-500/25"
          >
            🏆 {t('games.table.analytics.view') || 'Results'}
          </Button>
        )}
        <Button
          variant="secondary"
          size="sm"
          onClick={newGame}
          data-testid="solitaire-new-game-button"
        >
          {t('games.solitaire_v1.hud.newGame')}
        </Button>
      </div>
    </>
  );

  return (
    <SoloGameContainer
      gameId="solitaire_v1"
      difficulty="default"
      sortBy="score"
      order="desc"
      maxWidthClassName="max-w-4xl"
      isRunning={isRunning}
      startedAt={startedAt}
      finishedAt={finishedAt}
      onNewGame={newGame}
      hud={hud}
      loadingMessage="games.solitaire_v1.board.loading"
      modal={{
        result: finished ? (finished.won ? 'victory' : 'defeat') : null,
        gameName: 'Solitaire',
        rematchLabel: t('games.solitaire_v1.result.playAgain'),
        theme: 'casino',
        stats,
        messages: {
          title: t(
            finished?.won
              ? 'games.solitaire_v1.result.wonTitle'
              : 'games.solitaire_v1.result.lostTitle',
          ),
          message: t(
            finished?.won
              ? 'games.solitaire_v1.result.wonBody'
              : 'games.solitaire_v1.result.lostBody',
          ),
        },
      }}
    >
      <SolitaireBoard
        game={game}
        selection={selection}
        onSelect={setSelection}
        onDraw={draw}
        onMove={move}
      />
    </SoloGameContainer>
  );
}
