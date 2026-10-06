'use client';

import { useCallback, useMemo, useState } from 'react';
import { Select } from '@arcadeum/ui';
import { useTranslation } from '@/shared/i18n/useTranslation';
import type { TranslationKey } from '@/shared/i18n/useTranslation';
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
import { SudokuThemeProvider } from '../lib/SudokuThemeContext';
import { useSudokuStore } from '../store/sudokuStore';
import { isGiven, type Difficulty } from '../types';
import { SudokuBoard } from './SudokuBoard';
import { SudokuHintCallout } from './SudokuHintCallout';
import { SudokuKeypad } from './SudokuKeypad';

const DIFFICULTY_OPTIONS: Array<{ value: Difficulty }> = [
  { value: 'easy' },
  { value: 'medium' },
  { value: 'hard' },
];

export default function SudokuGame() {
  useTrackSoloGameStarted('sudoku_v1');
  const { themeId } = useSoloTheme('sudoku_v1');
  return (
    <SudokuThemeProvider variant={themeId}>
      <SudokuTable />
    </SudokuThemeProvider>
  );
}

function SudokuTable() {
  const { t } = useTranslation();
  const { themeId } = useSoloTheme('sudoku_v1');
  const game = useSudokuStore((state) => state.game);
  const finished = useSudokuStore((state) => state.finished);
  const startedAt = useSudokuStore((state) => state.startedAt);
  const finishedAt = useSudokuStore((state) => state.finishedAt);
  const setCell = useSudokuStore((state) => state.setCell);
  const note = useSudokuStore((state) => state.note);
  const changeDifficulty = useSudokuStore((state) => state.changeDifficulty);
  const newGame = useSudokuStore((state) => state.newGame);
  const undo = useSudokuStore((state) => state.undo);
  const canUndo = useSudokuStore(
    (state) => state.history.length > 0 && state.finishedAt === null,
  );
  const activeHint = useSudokuStore((state) => state.activeHint);
  const highlightErrors = useSudokuStore((state) => state.highlightErrors);
  const requestHint = useSudokuStore((state) => state.requestHint);
  const clearHint = useSudokuStore((state) => state.clearHint);
  const applyHint = useSudokuStore((state) => state.applyHint);
  const autoFillNotes = useSudokuStore((state) => state.autoFillNotes);
  const toggleHighlightErrors = useSudokuStore(
    (state) => state.toggleHighlightErrors,
  );
  const inputMode = useSudokuStore((state) => state.inputMode);
  const activeDigit = useSudokuStore((state) => state.activeDigit);
  const toggleInputMode = useSudokuStore((state) => state.toggleInputMode);
  const setActiveDigit = useSudokuStore((state) => state.setActiveDigit);

  const [selected, setSelected] = useState<number | null>(null);
  const [notesMode, setNotesMode] = useState(false);
  const isRunning = finishedAt === null;
  const pause = useSoloPause(isRunning, finishedAt);
  const timer = useSoloTimer(isRunning, startedAt, pause.isPaused);
  const { play } = useGameSound('sudoku_v1');

  const digitCounts = useMemo(() => {
    const counts: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
      7: 0,
      8: 0,
      9: 0,
    };
    for (const cell of game.cells) {
      if (cell >= 1 && cell <= 9) {
        counts[cell] = (counts[cell] ?? 0) + 1;
      }
    }
    return counts;
  }, [game.cells]);

  const applyDigit = useCallback(
    (digit: number) => {
      if (selected === null || pause.isPaused) return;
      play('place_digit');
      if (notesMode) note(selected, digit);
      else setCell(selected, digit);
    },
    [selected, pause.isPaused, notesMode, note, setCell, play],
  );

  const handleKeypadDigit = useCallback(
    (digit: number) => {
      if (pause.isPaused) return;
      if (inputMode === 'digit_first') {
        setActiveDigit(activeDigit === digit ? null : digit);
        play('click');
        return;
      }
      applyDigit(digit);
    },
    [pause.isPaused, inputMode, activeDigit, setActiveDigit, play, applyDigit],
  );

  const handleCellSelect = useCallback(
    (index: number | null) => {
      if (pause.isPaused) return;
      if (index === null) {
        setSelected(null);
        return;
      }
      setSelected(index);
      if (inputMode === 'digit_first' && activeDigit !== null) {
        if (!isGiven(game, index)) {
          play('place_digit');
          if (notesMode) note(index, activeDigit);
          else {
            const currentVal = game.cells[index];
            setCell(index, currentVal === activeDigit ? 0 : activeDigit);
          }
        }
      }
    },
    [
      pause.isPaused,
      inputMode,
      activeDigit,
      game,
      notesMode,
      note,
      setCell,
      play,
    ],
  );

  const erase = useCallback(() => {
    if (selected === null || pause.isPaused) return;
    play('click');
    setCell(selected, 0);
  }, [selected, pause.isPaused, setCell, play]);

  const moveSelection = useCallback((deltaRow: number, deltaCol: number) => {
    setSelected((current) => {
      const base = current ?? 0;
      const row = Math.min(Math.max(Math.floor(base / 9) + deltaRow, 0), 8);
      const col = Math.min(Math.max((base % 9) + deltaCol, 0), 8);
      return row * 9 + col;
    });
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (pause.isPaused) return;
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          moveSelection(-1, 0);
          break;
        case 'ArrowDown':
          event.preventDefault();
          moveSelection(1, 0);
          break;
        case 'ArrowLeft':
          event.preventDefault();
          moveSelection(0, -1);
          break;
        case 'ArrowRight':
          event.preventDefault();
          moveSelection(0, 1);
          break;
        case 'Backspace':
          event.preventDefault();
          erase();
          break;
        case 'Delete':
          event.preventDefault();
          erase();
          break;
        case 'n':
        case 'N':
          setNotesMode((mode) => !mode);
          break;
        case 'z':
        case 'Z':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            undo();
          }
          break;
        default: {
          const digit = Number(event.key);
          if (Number.isInteger(digit) && digit >= 1 && digit <= 9) {
            applyDigit(digit);
          }
        }
      }
    },
    [pause.isPaused, applyDigit, erase, moveSelection, undo],
  );

  const stats: GameResultStats | null = useMemo(() => {
    if (!finished) return null;
    return {
      duration: formatDuration(finished.durationMs),
      customStats: [
        {
          id: 'mistakes',
          label: t('games.sudoku_v1.hud.mistakes'),
          value: finished.mistakes,
        },
        {
          id: 'difficulty',
          label: t('games.sudoku_v1.hud.difficulty'),
          value: t(
            `games.sudoku_v1.difficulty.${game.difficulty}` as TranslationKey,
          ),
        },
      ],
    };
  }, [finished, game.difficulty, t]);

  const statsItems = [
    {
      id: 'mistakes',
      label: t('games.sudoku_v1.hud.mistakes'),
      value: game.mistakes,
      icon: '⚠️',
    },
    {
      id: 'time',
      label: t('games.sudoku_v1.hud.time'),
      value: finished ? formatDuration(finished.durationMs) : timer.formatted,
      icon: '⏱️',
      dataTestId: 'sudoku-timer',
    },
  ];

  const controls = (
    <Select
      id="sudoku-difficulty"
      size="sm"
      value={game.difficulty}
      onValueChange={(value) => changeDifficulty(value as Difficulty)}
      options={DIFFICULTY_OPTIONS.map(({ value }) => ({
        value,
        label: t(`games.sudoku_v1.difficulty.${value}` as TranslationKey),
      }))}
    />
  );

  const actions = (
    <div className="flex items-center gap-1 sm:gap-1.5">
      {finished && (
        <SoloActionButton
          variant="results"
          dataTestId="sudoku-show-results-button"
          icon="🏆"
        >
          {t('games.table.analytics.view') || 'Results'}
        </SoloActionButton>
      )}
      <SoloActionButton
        onClick={newGame}
        dataTestId="sudoku-new-game-button"
        icon="🔄"
      >
        {t('games.sudoku_v1.hud.newGame')}
      </SoloActionButton>
    </div>
  );

  return (
    <SoloGameContainer
      gameId="sudoku_v1"
      difficulty={game.difficulty}
      sortBy="durationMs"
      order="asc"
      pause={pause}
      isRunning={isRunning}
      startedAt={startedAt}
      finishedAt={finishedAt}
      onNewGame={newGame}
      statsItems={statsItems}
      controls={controls}
      actions={actions}
      undo={{ onUndo: undo, canUndo }}
      loadingMessage="games.sudoku_v1.board.loading"
      modal={{
        result: 'victory',
        gameName: 'Sudoku',
        rematchLabel: t('games.sudoku_v1.result.playAgain'),
        theme: themeId,
        stats,
        messages: {
          title: t('games.sudoku_v1.result.wonTitle'),
          message:
            finished?.mistakes === 0
              ? t('games.sudoku_v1.result.flawlessBody')
              : t('games.sudoku_v1.result.wonBody', {
                  mistakes: finished?.mistakes ?? 0,
                }),
        },
      }}
    >
      <div className="flex w-full flex-col items-center gap-2">
        <SudokuHintCallout
          hint={activeHint}
          onApply={applyHint}
          onDismiss={clearHint}
        />

        <div
          onKeyDown={handleKeyDown}
          tabIndex={0}
          className="w-full outline-none"
        >
          <SudokuBoard
            game={game}
            selected={selected}
            notesMode={notesMode}
            activeDigit={
              inputMode === 'digit_first'
                ? activeDigit
                : selected !== null &&
                    game.cells[selected] >= 1 &&
                    game.cells[selected] <= 9
                  ? game.cells[selected]
                  : null
            }
            activeHint={activeHint}
            highlightErrors={highlightErrors}
            onSelect={handleCellSelect}
          />
        </div>

        <SudokuKeypad
          selected={selected}
          notesMode={notesMode}
          digitCounts={digitCounts}
          highlightErrors={highlightErrors}
          inputMode={inputMode}
          activeDigit={activeDigit}
          onApplyDigit={handleKeypadDigit}
          onToggleNotes={() => setNotesMode((mode) => !mode)}
          onErase={erase}
          onAutoNotes={autoFillNotes}
          onRequestHint={requestHint}
          onToggleHighlightErrors={toggleHighlightErrors}
          onToggleInputMode={toggleInputMode}
        />
      </div>
    </SoloGameContainer>
  );
}
