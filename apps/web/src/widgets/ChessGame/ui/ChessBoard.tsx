'use client';

import { memo, useMemo, useCallback, useState } from 'react';
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

interface ChessBoardProps {
  board: Board;
  myColor: PieceColor | null;
  isFlipped: boolean;
  disabled?: boolean;
  selectedSquare: BoardPosition | null;
  legalMoves: BoardPosition[];
  lastMove: { from: BoardPosition; to: BoardPosition } | null;
  isCheck: boolean;
  kingPosition: BoardPosition | null;
  ariaLabel?: string;
  onSquareClick: (file: File, rank: Rank) => void;
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
  isCheck,
  kingPosition,
  ariaLabel,
  onSquareClick,
}: ChessBoardProps) {
  const [hoveredSquare, setHoveredSquare] = useState<string | null>(null);

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

  return (
    <div
      role="grid"
      aria-label={ariaLabel ?? 'Chess board'}
      data-testid="chess-board"
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: 'min(80vmin, 480px)',
        aspectRatio: '1 / 1',
        margin: '0 auto',
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
            const kingCheck = isKingInCheck(file, rank);
            const hovered = hoveredSquare === `${file}-${rank}`;
            const hasPiece = piece !== null;
            const isMyPiece = piece?.color === myColor;
            const canInteract = !disabled && (isMyPiece || legalTarget);

            let bg = isLight ? '#f0d9b5' : '#b58863';
            if (selected) bg = '#82976d';
            else if (kingCheck) bg = '#e74c3c';
            else if (lastMoved) bg = isLight ? '#ced26b' : '#aaa23a';

            const symbol = piece
              ? PIECE_SYMBOLS[piece.type][piece.color]
              : null;

            return (
              <button
                key={`${file}-${rank}`}
                type="button"
                role="gridcell"
                data-testid={`chess-${file}${rank}`}
                aria-label={`${file}${rank}${piece ? ` ${piece.color} ${piece.type}` : ''}${selected ? ' selected' : ''}${legalTarget ? ' legal move' : ''}`}
                disabled={!canInteract}
                onClick={() => onSquareClick(file, rank)}
                onMouseEnter={() => setHoveredSquare(`${file}-${rank}`)}
                onMouseLeave={() => setHoveredSquare(null)}
                style={{
                  flex: 1,
                  aspectRatio: '1 / 1',
                  backgroundColor: hovered && legalTarget ? '#d4e157' : bg,
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: canInteract ? 'pointer' : 'default',
                  position: 'relative',
                  transition: 'background-color 100ms ease',
                }}
              >
                {legalTarget && !hasPiece && (
                  <div
                    style={{
                      width: '28%',
                      height: '28%',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(0,0,0,0.15)',
                    }}
                  />
                )}
                {legalTarget && hasPiece && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      border: '3px solid rgba(0,0,0,0.25)',
                      borderRadius: '50%',
                      pointerEvents: 'none',
                    }}
                  />
                )}
                {symbol && (
                  <span
                    style={{
                      fontSize: `clamp(1.2rem, ${(80 / 8).toFixed(0)}cqw, 3.2rem)`,
                      lineHeight: 1,
                      filter:
                        isMyPiece && !disabled
                          ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))'
                          : 'none',
                      userSelect: 'none',
                    }}
                  >
                    {symbol}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ))}
      <div
        style={{
          display: 'flex',
          paddingLeft: 0,
        }}
      >
        {rows.files.map((file) => (
          <div
            key={file}
            style={{
              flex: 1,
              textAlign: 'center',
              fontSize: 11,
              opacity: 0.6,
              paddingTop: 4,
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
