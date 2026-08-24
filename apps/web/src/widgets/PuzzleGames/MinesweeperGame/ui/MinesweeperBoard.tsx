'use client';

import { useCallback, useRef } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import { useTranslation } from '@/shared/lib/useTranslation';
import type { TranslationKey } from '@/shared/lib/useTranslation';
import { useMinesweeperTheme } from '../lib/MinesweeperThemeContext';
import type { Cell, MinesweeperState } from '../types';

type Translate = (key: TranslationKey) => string;

interface MinesweeperBoardProps {
  game: MinesweeperState;
  /** When true, taps place flags instead of revealing (touch-friendly). */
  flagMode: boolean;
  onReveal: (index: number) => void;
  onFlag: (index: number) => void;
}

/** Long-press duration that plants a flag before the tap reveals. */
const LONG_PRESS_MS = 350;

export function MinesweeperBoard({
  game,
  flagMode,
  onReveal,
  onFlag,
}: MinesweeperBoardProps) {
  const theme = useMinesweeperTheme();
  const { t } = useTranslation();
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Suppresses the reveal after a long-press already planted a flag.
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
    longPressTimer.current = setTimeout(() => {
      longPressTimer.current = null;
      const cell = game.cells[index];
      if (!cell || cell.state === 'revealed') return;
      suppressClick.current = true;
      onFlag(index);
    }, LONG_PRESS_MS);
  };

  const handleCellClick = (index: number) => {
    clearPressTimer();
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    if (flagMode) onFlag(index);
    else onReveal(index);
  };

  // Right-click plants a flag — but skip it when a long-press already did
  // (mobile browsers fire contextmenu right after the long-press timer).
  const handleContextMenu = (index: number) => {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    onFlag(index);
  };

  return (
    <div
      className="overflow-x-auto rounded-2xl border p-2 sm:p-4"
      style={
        {
          background: theme.boardBackground,
          borderColor: theme.boardBorder,
          '--ms-cell': `clamp(18px, calc((100vw - 72px) / ${game.width}), 32px)`,
        } as React.CSSProperties
      }
      role="grid"
      aria-label={t('games.minesweeper_v1.board.label')}
    >
      <div
        className="mx-auto grid w-max gap-[3px] sm:gap-1"
        style={{
          gridTemplateColumns: `repeat(${game.width}, var(--ms-cell))`,
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
            onPressEnd={clearPressTimer}
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
  const theme = useMinesweeperTheme();
  const { t } = useTranslation();

  const revealed = cell.state === 'revealed';
  const showMine = revealed && cell.mine;

  const numberColor =
    revealed && !cell.mine && cell.adjacent > 0
      ? theme.numberColors[Math.min(cell.adjacent, 8) - 1]
      : theme.textColor;

  const base =
    'flex aspect-square w-full items-center justify-center border text-sm font-bold leading-none transition-colors select-none sm:text-base';
  const stateStyle = revealed
    ? 'cursor-default'
    : 'cursor-pointer hover:brightness-110 active:brightness-95';

  return (
    <button
      type="button"
      role="gridcell"
      className={cx(base, stateStyle)}
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
      style={{
        borderRadius: theme.borderRadius,
        borderColor: revealed ? theme.cellRevealedBorder : theme.cellHiddenBorder,
        background: revealed
          ? theme.cellRevealed
          : theme.cellHidden,
        color: showMine ? undefined : numberColor,
      }}
    >
      {cell.state === 'flagged' ? (
        <span aria-hidden="true" className="text-base sm:text-lg">
          🚩
        </span>
      ) : showMine ? (
        <span aria-hidden="true" style={{ color: lost ? theme.mineColor : undefined }}>
          💣
        </span>
      ) : revealed && cell.adjacent > 0 ? (
        <span aria-hidden="true">{cell.adjacent}</span>
      ) : null}
    </button>
  );
}

function cellAriaLabel(cell: Cell, t: Translate): string {
  if (cell.state === 'flagged')
    return t('games.minesweeper_v1.board.cellFlagged');
  if (cell.state === 'hidden') return t('games.minesweeper_v1.board.cellHidden');
  if (cell.mine) return t('games.minesweeper_v1.board.cellMine');
  return cell.adjacent > 0
    ? String(cell.adjacent)
    : t('games.minesweeper_v1.board.cellEmpty');
}
