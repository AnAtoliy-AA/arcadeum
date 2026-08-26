'use client';

import { useCallback, useRef } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import { useTranslation } from '@/shared/lib/useTranslation';
import type { TranslationKey } from '@/shared/lib/useTranslation';
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
  1: 'text-blue-400',
  2: 'text-emerald-400',
  3: 'text-red-400',
  4: 'text-purple-400',
  5: 'text-pink-400',
  6: 'text-cyan-400',
  7: 'text-amber-400',
  8: 'text-slate-400',
};

export function MinesweeperBoard({
  game,
  flagMode,
  onReveal,
  onFlag,
  onPressingChange,
}: MinesweeperBoardProps) {
  const { t } = useTranslation();
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

  return (
    <div
      className="w-full max-w-full overflow-x-auto rounded-2xl border-2 border-slate-800 bg-slate-950/90 p-3 sm:p-5 shadow-2xl shadow-black/80 select-none"
      role="grid"
      aria-label={t('games.minesweeper_v1.board.label')}
    >
      <div
        className="mx-auto grid w-max gap-1 p-1"
        style={{
          gridTemplateColumns: `repeat(${game.width}, minmax(0, 1fr))`,
        }}
      >
        {game.cells.map((cell, index) => (
          <MineCell
            key={index}
            cell={cell}
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
  lost,
  onReveal,
  onFlag,
  onPressStart,
  onPressEnd,
}: {
  cell: Cell;
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
        'flex aspect-square h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg font-mono text-sm sm:text-base font-extrabold transition-all',
        revealed
          ? 'cursor-default border border-slate-800/80 bg-slate-900 shadow-inner'
          : 'cursor-pointer border border-slate-700 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 shadow-sm hover:border-slate-500 hover:brightness-110 active:scale-95',
        showMine && lost && 'border-red-600 bg-red-950/90 shadow-red-900/50',
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
        <span aria-hidden="true" className="text-base sm:text-lg select-none">
          🚩
        </span>
      ) : showMine ? (
        <span aria-hidden="true" className="text-base sm:text-lg select-none">
          💣
        </span>
      ) : revealed && cell.adjacent > 0 ? (
        <span
          aria-hidden="true"
          className={cx(
            NUMBER_COLOR_CLASSES[cell.adjacent] ?? 'text-slate-200',
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
