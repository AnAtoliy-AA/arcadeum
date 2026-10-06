'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from '@/shared/i18n/useTranslation';
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
import { useGameSound } from '@/shared/lib/game-sounds';
import { SolitaireThemeProvider } from '../lib/SolitaireThemeContext';
import { isAllCardsOpen } from '../lib/engine';
import { useSolitaireStore } from '../store/solitaireStore';
import type { MoveSource, MoveTarget } from '../types';
import { SolitaireBoard } from './SolitaireBoard';
import { SolitaireHintCallout } from './SolitaireHintCallout';

const AUTO_PLACE_STEP_MS = 80;
const AUTO_PLACE_MAX_STEPS = 5000;

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
  const activeHint = useSolitaireStore((state) => state.activeHint);
  const draw = useSolitaireStore((state) => state.draw);
  const move = useSolitaireStore((state) => state.move);
  const autoPlaceStep = useSolitaireStore((state) => state.autoPlaceStep);
  const newGame = useSolitaireStore((state) => state.newGame);
  const undo = useSolitaireStore((state) => state.undo);
  const setDrawMode = useSolitaireStore((state) => state.setDrawMode);
  const requestHint = useSolitaireStore((state) => state.requestHint);
  const clearHint = useSolitaireStore((state) => state.clearHint);
  const applyHint = useSolitaireStore((state) => state.applyHint);
  const canUndo = useSolitaireStore(
    (state) => state.history.length > 0 && state.finishedAt === null,
  );

  const { play } = useGameSound('solitaire_v1');
  const [selection, setSelection] = useState<MoveSource | null>(null);
  const [autoPlacing, setAutoPlacing] = useState(false);
  const isRunning = finishedAt === null;
  const pause = useSoloPause(isRunning, finishedAt);
  const timer = useSoloTimer(isRunning, startedAt, pause.isPaused);

  const canAutoPlace = isAllCardsOpen(game) && finishedAt === null;

  useEffect(() => {
    if (!autoPlacing || pause.isPaused) return;
    let steps = 0;
    const intervalId = window.setInterval(() => {
      steps += 1;
      if (steps > AUTO_PLACE_MAX_STEPS) {
        setAutoPlacing(false);
        return;
      }
      const step = autoPlaceStep();
      if (step === null) {
        setAutoPlacing(false);
        return;
      }
      play(step === 'move' ? 'card_place' : 'card_flip');
    }, AUTO_PLACE_STEP_MS);
    return () => window.clearInterval(intervalId);
  }, [autoPlacing, pause.isPaused, autoPlaceStep, play]);

  const handleNewGame = useCallback(() => {
    setAutoPlacing(false);
    setSelection(null);
    newGame();
  }, [newGame]);

  const handleToggleAutoPlace = useCallback(() => {
    setAutoPlacing((running) => {
      if (running) return false;
      return !pause.isPaused;
    });
  }, [pause.isPaused]);

  const handleUndo = useCallback(() => {
    setAutoPlacing(false);
    undo();
  }, [undo]);

  const handleDraw = useCallback(() => {
    if (pause.isPaused) return;
    play('card_flip');
    draw();
  }, [draw, pause.isPaused, play]);

  const handleMove = useCallback(
    (source: MoveSource, target: MoveTarget) => {
      if (pause.isPaused) return;
      play('card_place');
      move(source, target);
    },
    [move, pause.isPaused, play],
  );

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
      <button
        type="button"
        onClick={() =>
          setDrawMode(game.drawMode === 'draw1' ? 'draw3' : 'draw1')
        }
        data-testid="solitaire-draw-mode-button"
        title={t(
          game.drawMode === 'draw1'
            ? 'games.solitaire_v1.hud.switchToDraw3'
            : 'games.solitaire_v1.hud.switchToDraw1',
        )}
        className="flex items-center gap-1 rounded-xl border border-white/15 bg-white/10 px-2 sm:px-2.5 py-1 text-xs font-bold text-[var(--color)] hover:bg-white/20 active:scale-95 transition-all shadow-sm"
      >
        <span>🎴</span>
        <span className="hidden sm:inline">
          {game.drawMode === 'draw1'
            ? t('games.solitaire_v1.hud.draw1')
            : t('games.solitaire_v1.hud.draw3')}
        </span>
        <span className="sm:hidden font-mono font-bold">
          {game.drawMode === 'draw1' ? '1' : '3'}
        </span>
      </button>

      <button
        type="button"
        onClick={requestHint}
        data-testid="solitaire-hint-button"
        title={t('games.solitaire_v1.hud.hintHint')}
        className="flex items-center gap-1 rounded-xl border border-amber-400/40 bg-amber-400/15 px-2 sm:px-2.5 py-1 text-xs font-bold text-amber-200 hover:bg-amber-400/25 active:scale-95 transition-all shadow-sm"
      >
        <span>💡</span>
        <span className="hidden sm:inline">
          {t('games.solitaire_v1.hud.hint')}
        </span>
      </button>

      {finished !== null && (
        <SoloActionButton
          variant="results"
          dataTestId="solitaire-show-results-button"
          icon="🏆"
        >
          {t('games.table.analytics.view') || 'Results'}
        </SoloActionButton>
      )}
      {(canAutoPlace || autoPlacing) && (
        <SoloActionButton
          onClick={handleToggleAutoPlace}
          dataTestId="solitaire-auto-place-button"
          icon="⚡"
        >
          {t('games.solitaire_v1.hud.autoPlace')}
        </SoloActionButton>
      )}
      <SoloActionButton
        onClick={handleNewGame}
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
      maxWidthClassName="max-w-5xl xl:max-w-6xl 2xl:max-w-7xl"
      leaderboardDefaultExpanded={true}
      pause={pause}
      isRunning={isRunning}
      startedAt={startedAt}
      finishedAt={finishedAt}
      onNewGame={handleNewGame}
      statsItems={statsItems}
      actions={actions}
      undo={{ onUndo: handleUndo, canUndo }}
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
      <div className="flex w-full flex-col gap-3">
        <SolitaireHintCallout
          hint={activeHint}
          onApply={applyHint}
          onDismiss={clearHint}
        />
        <SolitaireBoard
          game={game}
          selection={selection}
          activeHint={activeHint}
          onSelect={pause.isPaused ? () => undefined : setSelection}
          onDraw={handleDraw}
          onMove={handleMove}
        />
      </div>
    </SoloGameContainer>
  );
}
