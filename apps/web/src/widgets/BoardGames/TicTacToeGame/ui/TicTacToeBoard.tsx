'use client';

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTicTacToeTheme } from '../lib/TicTacToeThemeContext';
import { useBoardKeyboardNavigation } from '@/shared/lib/a11y';
import { MarkGlyph } from './TicTacToeMarkGlyph';
import type {
  CellValue,
  TicTacToePlayer,
  TicTacToeTeam,
  TicTacToeTheme,
  WinLineCell,
} from '../types';
import './styles/animations.scss';

const CELL_PX = 40;
const GAP_PX = 3;
const BOARD_PADDING_PX = 8;
const SCROLL_THRESHOLD = 10;
const DRAG_THRESHOLD = 5;

interface TicTacToeBoardProps {
  board: CellValue[][];
  winLine: WinLineCell[] | null;
  players: TicTacToePlayer[];
  teams: TicTacToeTeam[];
  teamMode: boolean;
  origin?: { row: number; col: number };
  disabled?: boolean;
  ariaLabel?: string;
  onCellClick: (row: number, col: number) => void;
  highlightedCell?: { row: number; col: number } | null;
  maxBoardSize?: number;
  currentPlayerId?: string | null;
}

interface CellRendererProps {
  rowIdx: number;
  colIdx: number;
  cell: CellValue;
  origin: { row: number; col: number };
  disabled: boolean;
  winSet: Set<string>;
  symbolByOwner: Map<string, { mark: string; color: string }>;
  hoveredCell: { row: number; col: number } | null;
  currentPlayerId?: string | null;
  highlightedCell?: { row: number; col: number } | null;
  maxBoardSize: number;
  rows: number;
  cols: number;
  theme: TicTacToeTheme;
  cellStyle: React.CSSProperties;
  playerCursor?: string;
  cellFocusProps: Record<string, unknown>;
  onCellClick: (row: number, col: number) => void;
  onHover: (row: number, col: number) => void;
  onLeave: () => void;
}

function CellRenderer({
  rowIdx,
  colIdx,
  cell,
  origin,
  disabled,
  winSet,
  symbolByOwner,
  hoveredCell,
  currentPlayerId,
  highlightedCell,
  maxBoardSize,
  rows,
  cols,
  theme,
  cellStyle,
  playerCursor,
  cellFocusProps,
  onCellClick,
  onHover,
  onLeave,
}: CellRendererProps) {
  const isWinning = winSet.has(`${rowIdx}:${colIdx}`);
  const ownerInfo = cell ? symbolByOwner.get(cell) : null;
  const cellDisabled = disabled || cell !== null;
  const isHovered =
    !cellDisabled && hoveredCell?.row === rowIdx && hoveredCell?.col === colIdx;
  const previewInfo =
    isHovered && !disabled && currentPlayerId
      ? (symbolByOwner.get(currentPlayerId) ?? null)
      : null;
  const isHighlighted = highlightedCell
    ? rowIdx === highlightedCell.row + origin.row &&
      colIdx === highlightedCell.col + origin.col
    : false;
  const isMaxRows = rows >= maxBoardSize;
  const isMaxCols = cols >= maxBoardSize;
  const isAtLimit =
    (isMaxRows && rowIdx === rows - 1) || (isMaxCols && colIdx === cols - 1);

  return (
    <button
      className={`ttt-cell focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--primary)]${isWinning ? ' ttt-winning' : ''}${isHighlighted ? ' ttt-highlighted' : ''}${isAtLimit ? ' ttt-at-limit' : ''}`}
      style={{
        ...cellStyle,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isWinning
          ? theme.winningCellBg
          : isHighlighted
            ? 'rgba(99,102,241,0.35)'
            : isAtLimit
              ? 'rgba(239,68,68,0.12)'
              : theme.cellBg,
        color: ownerInfo?.color ?? previewInfo?.color ?? theme.textColor,
        border: isHighlighted
          ? '2px solid rgba(129,140,248,0.8)'
          : isAtLimit
            ? '1px dashed rgba(239,68,68,0.45)'
            : 'none',
        borderRadius: theme.borderRadius,
        fontFamily: theme.markFont,
        fontWeight: 700,
        fontSize: cellStyle.fontSize,
        cursor: cellDisabled ? 'default' : (playerCursor ?? 'pointer'),
        transition: 'background-color 120ms ease, border 120ms ease',
        overflow: 'hidden',
      }}
      type="button"
      role="gridcell"
      data-testid={`ttt-cell-${rowIdx}-${colIdx}`}
      disabled={cellDisabled}
      aria-label={
        ownerInfo
          ? `Row ${rowIdx - origin.row}, Column ${colIdx - origin.col}: ${ownerInfo.mark} mark`
          : `Row ${rowIdx - origin.row}, Column ${colIdx - origin.col}: empty`
      }
      {...cellFocusProps}
      onClick={() => onCellClick(rowIdx, colIdx)}
      onMouseEnter={() => {
        if (!cell && !disabled) onHover(rowIdx, colIdx);
      }}
      onMouseLeave={onLeave}
    >
      {ownerInfo ? (
        <span className="ttt-mark flex items-center justify-center w-full h-full">
          <MarkGlyph mark={ownerInfo.mark} color={ownerInfo.color} />
        </span>
      ) : previewInfo ? (
        <span className="flex items-center justify-center w-full h-full opacity-30">
          <MarkGlyph mark={previewInfo.mark} color={previewInfo.color} />
        </span>
      ) : null}
    </button>
  );
}

const MemoizedCellRenderer = memo(CellRenderer);

function TicTacToeBoardImpl({
  board,
  winLine,
  players,
  teams,
  teamMode,
  origin = { row: 0, col: 0 },
  disabled = false,
  ariaLabel,
  onCellClick,
  highlightedCell,
  maxBoardSize = 100,
  currentPlayerId,
}: TicTacToeBoardProps) {
  const theme = useTicTacToeTheme();
  const rows = board.length;
  const cols = board[0]?.length ?? rows;
  const isScrollable = rows > SCROLL_THRESHOLD || cols > SCROLL_THRESHOLD;

  const wrapperRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({
    startX: 0,
    startY: 0,
    scrollLeft: 0,
    scrollTop: 0,
    moved: false,
  });
  const [hoveredCell, setHoveredCell] = useState<{
    row: number;
    col: number;
  } | null>(null);

  useEffect(() => {
    if (!highlightedCell || !isScrollable) return;
    const el = wrapperRef.current;
    if (!el) return;
    const cellSize = CELL_PX + GAP_PX;
    const arrayRow = highlightedCell.row + origin.row;
    const arrayCol = highlightedCell.col + origin.col;
    const cellX = arrayCol * cellSize + BOARD_PADDING_PX;
    const cellY = arrayRow * cellSize + BOARD_PADDING_PX;
    const viewW = el.clientWidth;
    const viewH = el.clientHeight;
    el.scrollTo({
      left: Math.max(0, cellX - viewW / 2 + CELL_PX / 2),
      top: Math.max(0, cellY - viewH / 2 + CELL_PX / 2),
      behavior: 'smooth',
    });
  }, [highlightedCell, isScrollable, origin.row, origin.col]);

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

  const playerCursor = useMemo(() => {
    if (disabled || !currentPlayerId) return undefined;
    const info = symbolByOwner.get(currentPlayerId);
    if (!info) return undefined;
    const safeColor =
      /^(#[0-9a-fA-F]{3,8}|(?:rgb|hsl)a?\([^)]+\)|[a-zA-Z]+)$/.test(info.color)
        ? info.color
        : '#000000';
    const safeMark = /^[A-Za-z0-9△□▲■○●◆◇★☆♡]+$/.test(info.mark)
      ? info.mark
      : '?';
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'><text x='16' y='23' font-size='22' font-weight='bold' fill='${safeColor}' text-anchor='middle' font-family='system-ui,sans-serif'>${safeMark}</text></svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}") 16 16, pointer` as const;
  }, [disabled, currentPlayerId, symbolByOwner]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!isScrollable) return;
      const el = wrapperRef.current;
      if (!el) return;
      dragState.current = {
        startX: e.clientX,
        startY: e.clientY,
        scrollLeft: el.scrollLeft,
        scrollTop: el.scrollTop,
        moved: false,
      };
    },
    [isScrollable],
  );

  useEffect(() => {
    if (!isScrollable) return;

    const onMove = (e: PointerEvent) => {
      const ds = dragState.current;
      const el = wrapperRef.current;
      if (!el || ds.startX === 0) return;
      const dx = e.clientX - ds.startX;
      const dy = e.clientY - ds.startY;
      if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
        ds.moved = true;
      }
      el.scrollLeft = ds.scrollLeft - dx;
      el.scrollTop = ds.scrollTop - dy;
    };

    const onUp = (e: PointerEvent) => {
      const ds = dragState.current;
      if (ds.startX !== 0) {
        const dx = Math.abs(e.clientX - ds.startX);
        const dy = Math.abs(e.clientY - ds.startY);
        if (dx <= DRAG_THRESHOLD && dy <= DRAG_THRESHOLD) {
          ds.moved = false;
        }
      }
      ds.startX = 0;
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [isScrollable]);

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (isScrollable && dragState.current.moved) return;
      onCellClick(row, col);
    },
    [onCellClick, isScrollable],
  );

  const handleHover = useCallback(
    (row: number, col: number) => setHoveredCell({ row, col }),
    [],
  );

  const handleLeave = useCallback(() => setHoveredCell(null), []);

  const gridStyle: React.CSSProperties = isScrollable
    ? {
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, ${CELL_PX}px)`,
        gridTemplateRows: `repeat(${rows}, ${CELL_PX}px)`,
        gap: `${GAP_PX}px`,
        padding: `${BOARD_PADDING_PX}px`,
        backgroundColor: theme.gridLine,
        borderRadius: theme.borderRadius,
        width: 'max-content',
        height: 'max-content',
      }
    : {
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        gap: '4px',
        padding: '12px',
        backgroundColor: theme.gridLine,
        borderRadius: theme.borderRadius,
        width: '100%',
        maxWidth: 'min(80vmin, 480px)',
        aspectRatio: `${cols} / ${rows}`,
        margin: '0 auto',
      };

  const { gridProps, getCellProps } = useBoardKeyboardNavigation({
    rows,
    cols,
    disabled: disabled || isScrollable,
    onActivate: ({ row, col }) => onCellClick(row, col),
  });

  const cellStyle: React.CSSProperties = useMemo(
    () =>
      isScrollable
        ? {
            width: `${CELL_PX}px`,
            height: `${CELL_PX}px`,
            fontSize: '1.1rem',
          }
        : {
            fontSize: `clamp(0.85rem, ${(55 / Math.max(rows, cols)).toFixed(1)}cqw, 3rem)`,
          },
    [isScrollable, rows, cols],
  );

  return (
    <div
      ref={wrapperRef}
      data-testid="ttt-board-wrapper"
      onPointerDown={onPointerDown}
      style={
        isScrollable
          ? {
              width: '100%',
              maxWidth: 'min(90vmin, 720px)',
              height: 'min(90vmin, 720px)',
              margin: '0 auto',
              overflow: 'auto',
              borderRadius: theme.borderRadius,
              border: `1px solid ${theme.gridLine}`,
              position: 'relative',
              touchAction: 'none',
              cursor: 'grab',
              userSelect: 'none',
            }
          : undefined
      }
    >
      <div
        role="grid"
        aria-label={ariaLabel}
        data-testid="ttt-board"
        style={gridStyle}
        {...gridProps}
      >
        {board.map((row, rowIdx) =>
          row.map((cell, colIdx) => (
            <MemoizedCellRenderer
              key={`${rowIdx}-${colIdx}`}
              rowIdx={rowIdx}
              colIdx={colIdx}
              cell={cell}
              origin={origin}
              disabled={disabled}
              winSet={winSet}
              symbolByOwner={symbolByOwner}
              hoveredCell={hoveredCell}
              currentPlayerId={currentPlayerId}
              highlightedCell={highlightedCell}
              maxBoardSize={maxBoardSize}
              rows={rows}
              cols={cols}
              theme={theme}
              cellStyle={cellStyle}
              playerCursor={playerCursor}
              cellFocusProps={getCellProps(rowIdx, colIdx)}
              onCellClick={handleCellClick}
              onHover={handleHover}
              onLeave={handleLeave}
            />
          )),
        )}
      </div>
    </div>
  );
}

export const TicTacToeBoard = memo(TicTacToeBoardImpl);
