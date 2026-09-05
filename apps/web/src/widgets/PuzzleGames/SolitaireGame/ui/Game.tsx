'use client';

import { useMemo, useState } from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useTrackSoloGameStarted } from '@/shared/analytics/useTrackSoloGameStarted';
import type { GameResultStats } from '@/features/games/ui/GameResultStatsGrid';
import {
  SoloGameContainer,
  formatDuration,
  useSoloTimer,
  useSoloPause,
  SoloActionButton,
} from '@/features/games/ui/SoloGameContainer';
import { useSoloTheme } from '@/features/games/store/soloThemeStore';
import { SolitaireThemeProvider } from '../lib/SolitaireThemeContext';
import { useSolitaireStore } from '../store/solitaireStore';
import type { MoveSource } from '../types';
import { SolitaireBoard } from './SolitaireBoard';

export default function SolitaireGame() {
  useTrackSoloGameStarted('solitaire_v1');
  const { themeId } = useSoloTheme('solitaire_v1');
  return (
    <SolitaireThemeProvider variant={themeId}>
      <SolitaireTable />
    </SolitaireThemeProvider>
  );
}

function SolitaireTable() {
  const { t } = useTranslation();
  const { themeId } = useSoloTheme('solitaire_v1');
  const game = useSolitaireStore((state) => state.game);
  const finished = useSolitaireStore((state) => state.finished);
  const startedAt = useSolitaireStore((state) => state.startedAt);
  const finishedAt = useSolitaireStore((state) => state.finishedAt);
  const draw = useSolitaireStore((state) => state.draw);
  const move = useSolitaireStore((state) => state.move);
  const newGame = useSolitaireStore((state) => state.newGame);

  const [selection, setSelection] = useState<MoveSource | null>(null);
  const isRunning = finishedAt === null;
  const pause = useSoloPause(isRunning, finishedAt);
  const timer = useSoloTimer(isRunning, startedAt, pause.isPaused);

  const stats: GameResultStats | null = useMemo(() => {
    if (!finished) return null;
    return {
      score: finished.score,
      turns: finished.moves,
      duration: formatDuration(finished.durationMs),
    };
  }, [finished]);

  const statsItems = [
    {
      id: 'score',
      label: t('games.solitaire_v1.hud.score'),
      value: game.score,
      icon: '🎯',
    },
    {
      id: 'moves',
      label: t('games.solitaire_v1.hud.moves'),
      value: game.moves,
      icon: '🔄',
    },
    {
      id: 'time',
      label: t('games.solitaire_v1.hud.time'),
      value: finished ? formatDuration(finished.durationMs) : timer.formatted,
      icon: '⏱️',
      dataTestId: 'solitaire-timer',
    },
  ];

  const actions = (
    <div className="flex items-center gap-1 sm:gap-1.5">
      {finished !== null && (
        <SoloActionButton
          variant="results"
          dataTestId="solitaire-show-results-button"
          icon="🏆"
        >
          {t('games.table.analytics.view') || 'Results'}
        </SoloActionButton>
      )}
      <SoloActionButton
        onClick={newGame}
        dataTestId="solitaire-new-game-button"
        icon="🔄"
      >
        {t('games.solitaire_v1.hud.newGame')}
      </SoloActionButton>
    </div>
  );

  return (
    <SoloGameContainer
      gameId="solitaire_v1"
      difficulty="default"
      sortBy="score"
      order="desc"
      layout="stacked"
      maxWidthClassName="max-w-3xl lg:max-w-[760px]"
      leaderboardDefaultExpanded={false}
      pause={pause}
      isRunning={isRunning}
      startedAt={startedAt}
      finishedAt={finishedAt}
      onNewGame={newGame}
      statsItems={statsItems}
      actions={actions}
      loadingMessage="games.solitaire_v1.board.loading"
      modal={{
        result: finished ? (finished.won ? 'victory' : 'defeat') : null,
        gameName: 'Solitaire',
        rematchLabel: t('games.solitaire_v1.result.playAgain'),
        theme: themeId,
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
        onSelect={pause.isPaused ? () => undefined : setSelection}
        onDraw={pause.isPaused ? () => undefined : draw}
        onMove={pause.isPaused ? () => undefined : move}
      />
    </SoloGameContainer>
  );
}
