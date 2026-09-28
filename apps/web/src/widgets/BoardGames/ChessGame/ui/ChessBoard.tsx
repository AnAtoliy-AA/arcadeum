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
import { useChessTheme } from '../lib/ChessThemeContext';
import { boardVars } from '../lib/theme-adapter';
import {
  useBoardThemePreference,
  getBoardThemeCssVars,
} from '../lib/board-theme';
import { useChessPieceStylePreference } from '../lib/piece-style';
import type { ChessPieceStyle } from '../lib/piece-style';
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
  pieceStyle?: ChessPieceStyle;
  premoveQueue?: import('../hooks/usePremoveQueue').PremoveStep[];
  onCancelPremoves?: () => void;
  bestMoveArrow?: import('../hooks/useBoardDrawings').Arrow | null;
  threatArrows?: import('../hooks/useBoardDrawings').Arrow[];
  showBestMove?: boolean;
  showThreats?: boolean;
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
  pieceStyle: pieceStyleProp,
  legalMoves,
  lastMove,
  hintMove = null,
  pendingMove = null,
  isCheck,
  kingPosition,
  ariaLabel,
  premoveQueue = [],
  onCancelPremoves,
  bestMoveArrow,
  threatArrows = [],
  showBestMove = false,
  showThreats = false,
  onSquareClick,
  onDeselectSquare,
  onPieceDrop,
}: ChessBoardProps) {
  const theme = useChessTheme();
  const { activeBoardTheme } = useBoardThemePreference();
  const { pieceStyle: preferredPieceStyle } = useChessPieceStylePreference();
  const pieceStyle = pieceStyleProp ?? preferredPieceStyle ?? 'arcadeum';
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
            animations.set(`${r}-${c}`, { dx, dy });
          }
        }
      }
    }

    prevBoardRef.current = board;
    if (animations.size > 0) {
      let nextTimer: number;
      const startTimer = requestAnimationFrame(() => {
        setAnimating(animations);
        nextTimer = requestAnimationFrame(() => setAnimating(new Map()));
      });
      return () => {
        cancelAnimationFrame(startTimer);
        cancelAnimationFrame(nextTimer);
      };
    }
  }, [board]);

  const { arrows, circles, addArrow, toggleCircle, clearDrawings } =
    useBoardDrawings();

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      const rank = (8 - row) as Rank;
      const file = FILES[col];
      onSquareClick(file, rank);
    },
    [onSquareClick],
  );

  const { gridProps, getCellProps } = useBoardKeyboardNavigation({
    rows: 8,
    cols: 8,
    disabled,
    onActivate: ({ row, col }) => handleCellClick(row, col),
    onDeselect: onDeselectSquare,
  });

  const rows = useMemo(() => {
    const ranks: Rank[] = [8, 7, 6, 5, 4, 3, 2, 1];
    const files: File[] = [...FILES];
    if (isFlipped) {
      ranks.reverse();
      files.reverse();
    }
    return { ranks, files };
  }, [isFlipped]);

  const isSelected = useCallback(
    (file: File, rank: Rank) =>
      selectedSquare?.file === file && selectedSquare?.rank === rank,
    [selectedSquare],
  );

  const isLegalTarget = useCallback(
    (file: File, rank: Rank) =>
      legalMoves.some((m) => m.file === file && m.rank === rank),
    [legalMoves],
  );

  const isLastMove = useCallback(
    (file: File, rank: Rank) =>
      (lastMove?.from.file === file && lastMove?.from.rank === rank) ||
      (lastMove?.to.file === file && lastMove?.to.rank === rank),
    [lastMove],
  );

  const isHintMove = useCallback(
    (file: File, rank: Rank) =>
      (hintMove?.from.file === file && hintMove?.from.rank === rank) ||
      (hintMove?.to.file === file && hintMove?.to.rank === rank),
    [hintMove],
  );

  const isPendingMove = useCallback(
    (file: File, rank: Rank) =>
      (pendingMove?.from.file === file && pendingMove?.from.rank === rank) ||
      (pendingMove?.to.file === file && pendingMove?.to.rank === rank),
    [pendingMove],
  );

  const isKingInCheck = useCallback(
    (file: File, rank: Rank) =>
      isCheck && kingPosition?.file === file && kingPosition?.rank === rank,
    [isCheck, kingPosition],
  );

  const handleHover = useCallback((sq: string | null) => {
    setHoveredSquare(sq);
  }, []);

  const handleDragOver = useCallback((sq: string | null) => {
    setDragOverSquare(sq);
  }, []);

  const vars = useMemo(() => {
    const bVars = boardVars(theme);
    const themeVars = getBoardThemeCssVars(activeBoardTheme);
    return {
      ...bVars,
      ...themeVars,
    } as import('react').CSSProperties;
  }, [theme, activeBoardTheme]);

  return (
    <div
      role="grid"
      aria-label={ariaLabel}
      className="relative w-full h-full max-h-full aspect-square p-1.5 sm:p-2.5 rounded-2xl bg-[var(--chess-board-bg)] border border-[var(--glassBorder)] shadow-2xl backdrop-blur-xl transition-all duration-300 touch-manipulation select-none"
      style={vars}
      {...gridProps}
    >
      <BoardOverlay
        arrows={arrows}
        circles={circles}
        isFlipped={isFlipped}
        premoveQueue={premoveQueue}
        bestMoveArrow={bestMoveArrow}
        threatArrows={threatArrows}
        showBestMove={showBestMove}
        showThreats={showThreats}
        onAddArrow={addArrow}
        onToggleCircle={toggleCircle}
        onClear={clearDrawings}
        onCancelPremoves={onCancelPremoves}
      >
        <div className="relative z-10 w-full h-full aspect-square rounded-xl overflow-hidden shadow-inner border border-white/10 flex flex-col">
          {rows.ranks.map((rank) => (
            <div key={rank} role="row" className="flex flex-1">
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
                const isPremoveGhost = premoveQueue.some(
                  (p) => p.to.file === file && p.to.rank === rank,
                );
                const canInteract =
                  !disabled && (isMyPiece || legalTarget || isPremoveGhost);
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
                    isPremoveGhost={isPremoveGhost}
                    canInteract={canInteract}
                    isLastFile={isLastFile}
                    isBottomRank={rows.ranks[rows.ranks.length - 1] === rank}
                    disabled={disabled}
                    cellFocusProps={getCellProps(navRow, navCol)}
                    pieceStyle={pieceStyle}
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
    </div>
  );
}

export const ChessBoard = memo(ChessBoardImpl);
