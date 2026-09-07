'use client';

import {
  memo,
  useMemo,
  useCallback,
  useState,
  useRef,
  useLayoutEffect,
} from 'react';
import {
  FILES,
  type Board,
  type ChessPiece,
  type File,
  type Rank,
  type BoardPosition,
  type PieceColor,
} from '../types';
import { useBoardKeyboardNavigation } from '@/shared/lib/a11y';
import { BoardOverlay } from './BoardOverlay';
import { useBoardDrawings } from '../hooks/useBoardDrawings';
import { MemoizedChessCell } from './ChessCell';
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
  pendingMove?: { from: BoardPosition; to: BoardPosition } | null;
  isCheck: boolean;
  kingPosition: BoardPosition | null;
  ariaLabel?: string;
  onSquareClick: (file: File, rank: Rank) => void;
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

function ChessBoardImpl({
  board,
  myColor,
  isFlipped,
  disabled = false,
  selectedSquare,
  legalMoves,
  lastMove,
  hintMove = null,
  pendingMove = null,
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
  const [animating, setAnimating] = useState<
    Map<string, { dx: number; dy: number }>
  >(new Map());

  useLayoutEffect(() => {
    const prev = prevBoardRef.current;
    if (prev === board) return;
    const animations = new Map<string, { dx: number; dy: number }>();

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r]?.[c];
        if (!piece) continue;
        const prevPiece = prev[r]?.[c];
        if (
          prevPiece &&
          prevPiece.type === piece.type &&
          prevPiece.color === piece.color
        )
          continue;

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

    setAnimating(animations);
    prevBoardRef.current = board;
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

  const pendingMoveSet = useMemo(() => {
    if (!pendingMove) return new Set<string>();
    return new Set([
      `${pendingMove.from.file}-${pendingMove.from.rank}`,
      `${pendingMove.to.file}-${pendingMove.to.rank}`,
    ]);
  }, [pendingMove]);

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

  const isPendingMove = useCallback(
    (file: File, rank: Rank) => pendingMoveSet.has(`${file}-${rank}`),
    [pendingMoveSet],
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

  const { arrows, circles, addArrow, addCircle, clearDrawings } =
    useBoardDrawings();

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
                const piece: ChessPiece | null =
                  board[rowIdx]?.[colIdx] ?? null;
                const isLight = (rowIdx + colIdx) % 2 === 0;
                const selected = isSelected(file, rank);
                const legalTarget = isLegalTarget(file, rank);
                const lastMoved = isLastMove(file, rank);
                const hintMoved = isHintMove(file, rank);
                const pendingTarget = isPendingMove(file, rank);
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
                    pendingTarget={pendingTarget}
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
                    animating={animating}
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
