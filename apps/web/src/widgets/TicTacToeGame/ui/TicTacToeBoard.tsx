'use client';

import { memo, useMemo } from 'react';
import { useTicTacToeTheme } from '../lib/TicTacToeThemeContext';
import type {
  CellValue,
  TicTacToePlayer,
  TicTacToeTeam,
  WinLineCell,
} from '../types';
import './styles/animations.css';

interface TicTacToeBoardProps {
  board: CellValue[][];
  winLine: WinLineCell[] | null;
  players: TicTacToePlayer[];
  teams: TicTacToeTeam[];
  teamMode: boolean;
  disabled?: boolean;
  ariaLabel?: string;
  onCellClick: (row: number, col: number) => void;
}

function TicTacToeBoardImpl({
  board,
  winLine,
  players,
  teams,
  teamMode,
  disabled = false,
  ariaLabel,
  onCellClick,
}: TicTacToeBoardProps) {
  const theme = useTicTacToeTheme();
  const size = board.length;

  const winSet = useMemo(() => {
    if (!winLine) return new Set<string>();
    return new Set(winLine.map((c) => `${c.row}:${c.col}`));
  }, [winLine]);

  const symbolByOwner = useMemo(() => {
    const map = new Map<string, { mark: string; color: string }>();
    if (teamMode) {
      teams.forEach((t, idx) => {
        const mark = idx === 0 ? 'X' : 'O';
        map.set(t.id, { mark, color: t.color });
      });
    } else {
      players.forEach((p, idx) => {
        const colors = [
          theme.xColor,
          theme.oColor,
          theme.triangleColor,
          theme.squareColor,
        ];
        map.set(p.playerId, {
          mark: p.symbol,
          color: colors[idx % colors.length],
        });
      });
    }
    return map;
  }, [players, teams, teamMode, theme]);

  return (
    <div
      role="grid"
      aria-label={ariaLabel}
      data-testid="ttt-board"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${size}, 1fr)`,
        gap: '4px',
        padding: '12px',
        backgroundColor: theme.gridLine,
        borderRadius: theme.borderRadius,
        width: '100%',
        maxWidth: 'min(80vmin, 480px)',
        aspectRatio: '1 / 1',
        margin: '0 auto',
        boxSizing: 'border-box',
      }}
    >
      {board.map((row, rowIdx) =>
        row.map((cell, colIdx) => {
          const isWinning = winSet.has(`${rowIdx}:${colIdx}`);
          const ownerInfo = cell ? symbolByOwner.get(cell) : null;
          const cellDisabled = disabled || cell !== null;
          return (
            <button
              key={`${rowIdx}-${colIdx}`}
              type="button"
              role="gridcell"
              data-testid={`ttt-cell-${rowIdx}-${colIdx}`}
              disabled={cellDisabled}
              aria-label={
                ownerInfo
                  ? `Row ${rowIdx + 1}, column ${colIdx + 1}: ${ownerInfo.mark}`
                  : `Row ${rowIdx + 1}, column ${colIdx + 1}: empty`
              }
              onClick={() => onCellClick(rowIdx, colIdx)}
              className={isWinning ? 'ttt-winning' : undefined}
              style={{
                backgroundColor: isWinning ? theme.winningCellBg : theme.cellBg,
                color: ownerInfo?.color ?? theme.textColor,
                border: 'none',
                borderRadius: theme.borderRadius,
                fontFamily: theme.markFont,
                fontWeight: 700,
                fontSize: `clamp(1rem, ${Math.max(2, 6 - size * 0.3)}vmin, 3rem)`,
                cursor: cellDisabled ? 'default' : 'pointer',
                transition: 'background-color 120ms ease',
              }}
              onMouseEnter={(e) => {
                if (!cellDisabled) {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    theme.cellHoverBg;
                }
              }}
              onMouseLeave={(e) => {
                if (!cellDisabled) {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    theme.cellBg;
                }
              }}
            >
              {ownerInfo ? (
                <span className="ttt-mark">{ownerInfo.mark}</span>
              ) : null}
            </button>
          );
        }),
      )}
    </div>
  );
}

export const TicTacToeBoard = memo(TicTacToeBoardImpl);
