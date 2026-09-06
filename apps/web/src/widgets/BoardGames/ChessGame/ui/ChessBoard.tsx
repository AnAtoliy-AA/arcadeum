'use client';

import { memo, useMemo, useCallback, useState, useRef, useEffect } from 'react';
import {
  FILES,
  PIECE_SYMBOLS,
  type Board,
  type ChessPiece,
  type File,
  type Rank,
  type BoardPosition,
  type PieceColor,
} from '../types';
import { useChessTheme } from '../lib/ChessThemeContext';
import { useBoardKeyboardNavigation } from '@/shared/lib/a11y';
import { BoardOverlay } from './BoardOverlay';
import { useBoardDrawings } from '../hooks/useBoardDrawings';
import './styles/animations.scss';

interface ChessBoardProps {
  board: Board;
  myColor: PieceColor | null;
  isFlipped: boolean;
  disabled?: boolean;
  selectedSquare: BoardPosition | null;
  legalMoves: BoardPosition[];
  lastMove: { from: BoardPosition; to: BoardPosition } | null;
  hintMove?: { from: BoardPosition; to: BoardPosition } | null;
  isCheck: boolean;
  kingPosition: BoardPosition | null;
  ariaLabel?: string;
  onSquareClick: (file: File, rank: Rank) => void;
  /** Clears the current selection (Escape key). */
  onDeselectSquare?: () => void;
  onPieceDrop?: (
    fromFile: File,
    fromRank: Rank,
    toFile: File,
    toRank: Rank,
  ) => void;
}

function rankToFile(rank: number): number {
  return 8 - rank;
}

interface ChessCellProps {
  file: File;
  rank: Rank;
  piece: ChessPiece | null;
  isLight: boolean;
  selected: boolean;
  legalTarget: boolean;
  lastMoved: boolean;
  hintMoved: boolean;
  kingCheck: boolean;
  hovered: boolean;
  isDragOver: boolean;
  isMyPiece: boolean;
  canInteract: boolean;
  isLastFile: boolean;
  isBottomRank: boolean;
  disabled: boolean;
  cellFocusProps: Record<string, unknown>;
  onSquareClick: (file: File, rank: Rank) => void;
  onPieceDrop?: (
    fromFile: File,
    fromRank: Rank,
    toFile: File,
    toRank: Rank,
  ) => void;
  onHover: (square: string | null) => void;
  onDragOver: (square: string | null) => void;
}

function ChessCell({
  file,
  rank,
  piece,
  isLight,
  selected,
  legalTarget,
  lastMoved,
  hintMoved,
  kingCheck,
  hovered,
  isDragOver,
  isMyPiece,
  canInteract,
  isLastFile,
  isBottomRank,
  disabled,
  cellFocusProps,
  onSquareClick,
  onPieceDrop,
  onHover,
  onDragOver,
}: ChessCellProps) {
  const theme = useChessTheme();
  const square = `${file}-${rank}`;
  const symbol = piece ? PIECE_SYMBOLS[piece.type][piece.color] : null;

  let bgColor = isLight ? theme.lightSquare : theme.darkSquare;
  if (selected) bgColor = theme.selectedSquare;
  else if (kingCheck) bgColor = theme.checkSquare;
  else if (hintMoved) bgColor = 'rgba(16, 185, 129, 0.38)';
  else if (lastMoved) bgColor = theme.lastMoveSquare;

  return (
    <div
      role="gridcell"
      data-testid={`chess-${file}${rank}`}
      className="focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--primary)]"
      aria-label={`${file}${rank}${piece ? ` ${piece.color} ${piece.type}` : ''}${selected ? ' selected' : ''}${legalTarget ? ' legal move' : ''}${hintMoved ? ' suggested' : ''}`}
      {...cellFocusProps}
      draggable={isMyPiece && !disabled}
      onClick={() => {
        if (!disabled) onSquareClick(file, rank);
      }}
      onMouseEnter={() => onHover(square)}
      onMouseLeave={() => onHover(null)}
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', square);
        e.dataTransfer.effectAllowed = 'move';
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        onDragOver(square);
      }}
      onDragLeave={() => onDragOver(null)}
      onDrop={(e) => {
        e.preventDefault();
        onDragOver(null);
        const data = e.dataTransfer.getData('text/plain');
        if (data && onPieceDrop) {
          const [fromFile, fromRank] = data.split('-');
          onPieceDrop(fromFile as File, Number(fromRank) as Rank, file, rank);
        }
      }}
      style={{
        flex: 1,
        aspectRatio: '1 / 1',
        backgroundColor:
          legalTarget && (hovered || isDragOver)
            ? 'rgba(167, 139, 250, 0.4)'
            : bgColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: canInteract ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {legalTarget && !piece && (
        <div
          style={{
            position: 'absolute',
            width: '28%',
            height: '28%',
            borderRadius: '50%',
            backgroundColor: 'rgba(167, 139, 250, 0.5)',
          }}
        />
      )}
      {legalTarget && piece && (
        <div
          style={{
            position: 'absolute',
            inset: 2,
            borderRadius: '50%',
            border: '3px solid rgba(239, 68, 68, 0.6)',
            pointerEvents: 'none',
          }}
        />
      )}
      {hintMoved && (
        <div
          style={{
            position: 'absolute',
            inset: 2,
            borderRadius: '50%',
            border: '2px solid rgba(16, 185, 129, 0.8)',
            boxShadow: '0 0 8px rgba(16, 185, 129, 0.4)',
            pointerEvents: 'none',
          }}
        />
      )}
      {isLastFile && (
        <span
          style={{
            position: 'absolute',
            right: 4,
            top: 3,
            fontSize: 11,
            fontWeight: 800,
            color: isLight ? '#779952' : '#edeed1',
            lineHeight: 1,
            pointerEvents: 'none',
          }}
        >
          {rank}
        </span>
      )}
      {isBottomRank && (
        <span
          style={{
            position: 'absolute',
            left: 4,
            bottom: 3,
            fontSize: 11,
            fontWeight: 800,
            color: isLight ? '#779952' : '#edeed1',
            lineHeight: 1,
            pointerEvents: 'none',
          }}
        >
          {file}
        </span>
      )}
      {symbol && (
        <span
          className="select-none transition-transform hover:scale-105"
          style={{
            fontSize: 'clamp(1.3rem, 11cqw, 3.4rem)',
            lineHeight: 1,
            color: piece?.color === 'white' ? '#ffffff' : '#18181b',
            filter:
              piece?.color === 'white'
                ? 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.85)) drop-shadow(0 0 1px rgba(0, 0, 0, 0.95))'
                : 'drop-shadow(0 1px 2px rgba(255, 255, 255, 0.4)) drop-shadow(0 0 1px rgba(0, 0, 0, 0.9))',
            userSelect: 'none',
            position: 'relative',
            zIndex: 2,
            transition: 'transform 0.2s ease-out',
            transform: animatingRef.current.get(square)
              ? `translate(${animatingRef.current.get(square)!.dx}%, ${animatingRef.current.get(square)!.dy}%)`
              : undefined,
          }}
        >
          {symbol}
        </span>
      )}
    </div>
  );
}

const MemoizedChessCell = memo(ChessCell);

function ChessBoardImpl({
  board,
  myColor,
  isFlipped,
  disabled = false,
  selectedSquare,
  legalMoves,
  lastMove,
  hintMove = null,
  isCheck,
  kingPosition,
  ariaLabel,
  onSquareClick,
  onDeselectSquare,
  onPieceDrop,
}: ChessBoardProps) {
  const [hoveredSquare, setHoveredSquare] = useState<string | null>(null);
  const [dragOverSquare, setDragOverSquare] = useState<string | null>(null);
  const prevBoardRef = useRef<Board>(board);
  const animatingRef = useRef<Map<string, { dx: number; dy: number }>>(new Map());

  useEffect(() => {
    const prev = prevBoardRef.current;
    const curr = board;
    const animations = new Map<string, { dx: number; dy: number }>();

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = curr[r]?.[c];
        if (!piece) continue;
        const prevPiece = prev[r]?.[c];
        if (prevPiece && prevPiece.type === piece.type && prevPiece.color === piece.color) continue;

        for (let pr = 0; pr < 8; pr++) {
          for (let pc = 0; pc < 8; pc++) {
            const pp = prev[pr]?.[pc];
            if (!pp) continue;
            if (pp.type !== piece.type || pp.color !== piece.color) continue;
            if (pr === r && pc === c) continue;
            const dx = (pc - c) * (100 / 8);
            const dy = (pr - r) * (100 / 8);
            animations.set(`${FILES[c]}${8 - r}`, { dx, dy });
            break;
          }
        }
      }
    }

    animatingRef.current = animations;
    prevBoardRef.current = curr;
  }, [board]);

  const legalMoveSet = useMemo(() => {
    const s = new Set<string>();
    for (const m of legalMoves) {
      s.add(`${m.file}-${m.rank}`);
    }
    return s;
  }, [legalMoves]);

  const lastMoveSet = useMemo(() => {
    if (!lastMove) return new Set<string>();
    return new Set([
      `${lastMove.from.file}-${lastMove.from.rank}`,
      `${lastMove.to.file}-${lastMove.to.rank}`,
    ]);
  }, [lastMove]);

  const hintMoveSet = useMemo(() => {
    if (!hintMove) return new Set<string>();
    return new Set([
      `${hintMove.from.file}-${hintMove.from.rank}`,
      `${hintMove.to.file}-${hintMove.to.rank}`,
    ]);
  }, [hintMove]);

  const isSelected = useCallback(
    (file: File, rank: Rank) =>
      selectedSquare?.file === file && selectedSquare?.rank === rank,
    [selectedSquare],
  );

  const isLegalTarget = useCallback(
    (file: File, rank: Rank) => legalMoveSet.has(`${file}-${rank}`),
    [legalMoveSet],
  );

  const isLastMove = useCallback(
    (file: File, rank: Rank) => lastMoveSet.has(`${file}-${rank}`),
    [lastMoveSet],
  );

  const isHintMove = useCallback(
    (file: File, rank: Rank) => hintMoveSet.has(`${file}-${rank}`),
    [hintMoveSet],
  );

  const isKingInCheck = useCallback(
    (file: File, rank: Rank) =>
      isCheck && kingPosition?.file === file && kingPosition?.rank === rank,
    [isCheck, kingPosition],
  );

  const rows = useMemo(() => {
    const ranks: Rank[] = isFlipped
      ? ([1, 2, 3, 4, 5, 6, 7, 8] as Rank[])
      : ([8, 7, 6, 5, 4, 3, 2, 1] as Rank[]);
    const files: File[] = isFlipped
      ? (['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'] as File[])
      : (['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as File[]);
    return { ranks, files };
  }, [isFlipped]);

  const { gridProps, getCellProps } = useBoardKeyboardNavigation({
    rows: 8,
    cols: 8,
    disabled: !canInteractAny(),
    onActivate: ({ row, col }) => {
      const rank = rows.ranks[row];
      const file = rows.files[col];
      if (rank !== undefined && file !== undefined) {
        onSquareClick(file, rank);
      }
    },
    onDeselect: onDeselectSquare,
  });

  function canInteractAny(): boolean {
    if (disabled) return false;
    for (const rank of rows.ranks) {
      for (const file of rows.files) {
        const piece = board[rankToFile(rank)]?.[FILES.indexOf(file)] ?? null;
        if (piece?.color === myColor) return true;
      }
    }
    return false;
  }

  const handleHover = useCallback((square: string | null) => {
    setHoveredSquare(square);
  }, []);

  const handleDragOver = useCallback((square: string | null) => {
    setDragOverSquare(square);
  }, []);

  const {
    arrows,
    circles,
    addArrow,
    addCircle,
    clearDrawings,
  } = useBoardDrawings();

  return (
    <div
      role="grid"
      aria-label={ariaLabel ?? 'Chess'}
      data-testid="chess-board"
      {...gridProps}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: 'min(75vmin, 480px)',
        margin: '0 auto',
      }}
    >
      <div
        className="chess-board-glow"
        style={{
          position: 'absolute',
          inset: -6,
          borderRadius: 16,
          background:
            'radial-gradient(ellipse at center, rgba(167, 139, 250, 0.12), transparent 70%)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
      <BoardOverlay
        arrows={arrows}
        circles={circles}
        onAddArrow={addArrow}
        onAddCircle={addCircle}
        onClear={clearDrawings}
      >
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            aspectRatio: '1 / 1',
            borderRadius: 14,
            overflow: 'hidden',
            backgroundColor: '#1c1917',
            border: '3px solid #44403c',
            boxShadow:
              '0 12px 36px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
        {rows.ranks.map((rank) => (
          <div key={rank} role="row" style={{ display: 'flex', flex: 1 }}>
            {rows.files.map((file) => {
              const rowIdx = rankToFile(rank);
              const colIdx = FILES.indexOf(file);
              const piece: ChessPiece | null = board[rowIdx]?.[colIdx] ?? null;
              const isLight = (rowIdx + colIdx) % 2 === 0;
              const selected = isSelected(file, rank);
              const legalTarget = isLegalTarget(file, rank);
              const lastMoved = isLastMove(file, rank);
              const hintMoved = isHintMove(file, rank);
              const kingCheck = isKingInCheck(file, rank);
              const hovered = hoveredSquare === `${file}-${rank}`;
              const isMyPiece = piece?.color === myColor;
              const canInteract = !disabled && (isMyPiece || legalTarget);
              const isDragOver = dragOverSquare === `${file}-${rank}`;
              const isLastFile = rows.files[rows.files.length - 1] === file;
              const navRow = rows.ranks.indexOf(rank);
              const navCol = rows.files.indexOf(file);

              return (
                <MemoizedChessCell
                  key={`${file}-${rank}`}
                  file={file}
                  rank={rank}
                  piece={piece}
                  isLight={isLight}
                  selected={selected}
                  legalTarget={legalTarget}
                  lastMoved={lastMoved}
                  hintMoved={hintMoved}
                  kingCheck={kingCheck}
                  hovered={hovered}
                  isDragOver={isDragOver}
                  isMyPiece={isMyPiece}
                  canInteract={canInteract}
                  isLastFile={isLastFile}
                  isBottomRank={rows.ranks[rows.ranks.length - 1] === rank}
                  disabled={disabled}
                  cellFocusProps={getCellProps(navRow, navCol)}
                  onSquareClick={onSquareClick}
                  onPieceDrop={onPieceDrop}
                  onHover={handleHover}
                  onDragOver={handleDragOver}
                />
              );
            })}
          </div>
        ))}
        </div>
      </BoardOverlay>
      <div style={{ display: 'flex', paddingLeft: 2, paddingRight: 2 }}>
        {rows.files.map((file) => (
          <div
            key={file}
            style={{
              flex: 1,
              textAlign: 'center',
              fontSize: 11,
              opacity: 0.4,
              paddingTop: 4,
              color: '#fff',
            }}
          >
            {file}
          </div>
        ))}
      </div>
    </div>
  );
}

export const ChessBoard = memo(ChessBoardImpl);
