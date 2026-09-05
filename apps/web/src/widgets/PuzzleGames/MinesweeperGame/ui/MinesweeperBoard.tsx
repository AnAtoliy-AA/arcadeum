'use client';

import { useCallback, useRef, type CSSProperties } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import { useTranslation } from '@/shared/lib/useTranslation';
import type { TranslationKey } from '@/shared/lib/useTranslation';
import { useSoloFullscreen } from '@/features/games/ui/SoloGameContainer';
import { useMinesweeperTheme } from '../lib/MinesweeperThemeContext';
import type { MinesweeperTheme } from '../lib/theme';
import type { Cell, MinesweeperState } from '../types';

type Translate = (key: TranslationKey) => string;

interface MinesweeperBoardProps {
  game: MinesweeperState;
  flagMode: boolean;
  onReveal: (index: number) => void;
  onFlag: (index: number) => void;
  onPressingChange?: (pressing: boolean) => void;
}

const LONG_PRESS_MS = 350;

const NUMBER_COLOR_CLASSES: Record<number, string> = {
  1: 'text-blue-600 dark:text-blue-400',
  2: 'text-emerald-600 dark:text-emerald-400',
  3: 'text-red-600 dark:text-red-400',
  4: 'text-purple-600 dark:text-purple-400',
  5: 'text-pink-600 dark:text-pink-400',
  6: 'text-cyan-600 dark:text-cyan-400',
  7: 'text-amber-600 dark:text-amber-400',
  8: 'text-slate-600 dark:text-slate-400',
};

const GRID_COLS_BY_WIDTH: Record<number, string> = {
  9: 'grid-cols-9',
  16: 'grid-cols-[repeat(16,minmax(0,1fr))]',
  22: 'grid-cols-[repeat(22,minmax(0,1fr))]',
  30: 'grid-cols-[repeat(30,minmax(0,1fr))]',
};

function boardVars(theme: MinesweeperTheme): CSSProperties {
  return {
    '--ms-board-bg': theme.boardBackground,
    '--ms-board-border': theme.boardBorder,
    '--ms-cell-hidden-border': theme.cellHiddenBorder,
    '--ms-cell-revealed-border': theme.cellRevealedBorder,
    '--ms-flag-color': theme.flagColor,
  } as CSSProperties;
}

export function MinesweeperBoard({
  game,
  flagMode,
  onReveal,
  onFlag,
  onPressingChange,
}: MinesweeperBoardProps) {
  const { t } = useTranslation();
  const theme = useMinesweeperTheme();
  const isFullscreen = useSoloFullscreen();
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressClick = useRef(false);

  const clearPressTimer = useCallback(() => {
    if (longPressTimer.current !== null) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const startPress = (index: number) => {
    clearPressTimer();
    suppressClick.current = false;
    onPressingChange?.(true);
    longPressTimer.current = setTimeout(() => {
      longPressTimer.current = null;
      const cell = game.cells[index];
      if (!cell || cell.state === 'revealed') return;
      suppressClick.current = true;
      onFlag(index);
    }, LONG_PRESS_MS);
  };

  const endPress = () => {
    clearPressTimer();
    onPressingChange?.(false);
  };

  const handleCellClick = (index: number) => {
    clearPressTimer();
    onPressingChange?.(false);
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    if (flagMode) onFlag(index);
    else onReveal(index);
  };

  const handleContextMenu = (index: number) => {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    onFlag(index);
  };

  const gridColsClass = GRID_COLS_BY_WIDTH[game.width] ?? 'grid-cols-9';

  return (
    <div
      style={boardVars(theme)}
      className={cx(
        'w-full max-w-full overflow-x-auto rounded-2xl border border-[var(--glassBorder)] bg-[var(--ms-board-bg)] shadow-xl select-none transition-colors duration-200',
        isFullscreen ? 'p-2 sm:p-3' : 'p-1.5 sm:p-4',
      )}
      role="grid"
      aria-label={t('games.minesweeper_v1.board.label')}
    >
      <div className={cx('mx-auto grid w-max gap-1 p-1', gridColsClass)}>
        {game.cells.map((cell, index) => (
          <MineCell
            key={`${game.difficulty}-${index}`}
            cell={cell}
            isBeginner={game.width <= 9}
            isCompact={game.width > 16}
            isFullscreen={isFullscreen}
            lost={game.status === 'lost'}
            onReveal={() => handleCellClick(index)}
            onFlag={() => handleContextMenu(index)}
            onPressStart={() => startPress(index)}
            onPressEnd={endPress}
          />
        ))}
      </div>
    </div>
  );
}

function MineCell({
  cell,
  isBeginner,
  isCompact,
  isFullscreen,
  lost,
  onReveal,
  onFlag,
  onPressStart,
  onPressEnd,
}: {
  cell: Cell;
  isBeginner?: boolean;
  isCompact?: boolean;
  isFullscreen?: boolean;
  lost: boolean;
  onReveal: () => void;
  onFlag: () => void;
  onPressStart: () => void;
  onPressEnd: () => void;
}) {
  const { t } = useTranslation();
  const revealed = cell.state === 'revealed';
  const showMine = revealed && cell.mine;

  return (
    <button
      type="button"
      role="gridcell"
      className={cx(
        'flex aspect-square items-center justify-center font-mono font-extrabold transition-colors',
        isBeginner
          ? isFullscreen
            ? 'h-9 w-9 min-w-[36px] sm:h-10.5 sm:w-10.5 sm:min-w-[42px] lg:h-12 lg:w-12 lg:min-w-[48px] rounded-xl text-base sm:text-lg lg:text-xl'
            : 'h-8 w-8 min-w-[32px] sm:h-9.5 sm:w-9.5 sm:min-w-[38px] md:h-11 md:w-11 md:min-w-[44px] rounded-xl text-sm sm:text-base md:text-lg'
          : isCompact
            ? isFullscreen
              ? 'h-6.5 w-6.5 min-w-[24px] sm:h-7.5 sm:w-7.5 sm:min-w-[28px] lg:h-8 lg:w-8 lg:min-w-[32px] rounded-md text-xs sm:text-sm'
              : 'h-5.5 w-5.5 min-w-[22px] sm:h-6.5 sm:w-6.5 sm:min-w-[26px] md:h-7 md:w-7 md:min-w-[28px] rounded-md text-xs sm:text-sm'
            : isFullscreen
              ? 'h-7.5 w-7.5 min-w-[28px] sm:h-8.5 sm:w-8.5 sm:min-w-[32px] lg:h-9.5 lg:w-9.5 rounded-lg text-xs sm:text-base'
              : 'h-6.5 w-6.5 min-w-[24px] sm:h-7.5 sm:w-7.5 sm:min-w-[28px] md:h-8 md:w-8 md:min-w-[32px] rounded-lg text-xs sm:text-sm',
        revealed
          ? 'cursor-default border border-[var(--ms-cell-revealed-border)] bg-black/25 text-[var(--color)] shadow-inner'
          : 'cursor-pointer border border-[var(--ms-cell-hidden-border)] bg-[var(--glassBg)] text-[var(--color)] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] hover:border-[var(--primary)] hover:bg-[var(--glassBgHover)] active:scale-95',
        showMine &&
          lost &&
          'border-red-500 bg-red-500/20 text-red-500 shadow-red-500/30',
      )}
      onClick={onReveal}
      onContextMenu={(event) => {
        event.preventDefault();
        onFlag();
      }}
      onPointerDown={onPressStart}
      onPointerUp={onPressEnd}
      onPointerLeave={onPressEnd}
      onPointerCancel={onPressEnd}
      aria-label={cellAriaLabel(cell, t)}
    >
      {cell.state === 'flagged' ? (
        <span
          aria-hidden="true"
          className={
            isCompact
              ? isFullscreen
                ? 'text-xs sm:text-lg select-none'
                : 'text-xs sm:text-base select-none'
              : isFullscreen
                ? 'text-lg sm:text-2xl select-none'
                : 'text-base sm:text-lg select-none'
          }
        >
          🚩
        </span>
      ) : showMine ? (
        <span
          aria-hidden="true"
          className={
            isCompact
              ? isFullscreen
                ? 'text-xs sm:text-lg select-none'
                : 'text-xs sm:text-base select-none'
              : isFullscreen
                ? 'text-lg sm:text-2xl select-none'
                : 'text-base sm:text-lg select-none'
          }
        >
          💣
        </span>
      ) : revealed && cell.adjacent > 0 ? (
        <span
          aria-hidden="true"
          className={cx(
            NUMBER_COLOR_CLASSES[cell.adjacent] ?? 'text-[var(--color)]',
          )}
        >
          {cell.adjacent}
        </span>
      ) : null}
    </button>
  );
}

function cellAriaLabel(cell: Cell, t: Translate): string {
  if (cell.state === 'flagged')
    return t('games.minesweeper_v1.board.cellFlagged');
  if (cell.state === 'hidden')
    return t('games.minesweeper_v1.board.cellHidden');
  if (cell.mine) return t('games.minesweeper_v1.board.cellMine');
  return cell.adjacent > 0
    ? String(cell.adjacent)
    : t('games.minesweeper_v1.board.cellEmpty');
}
