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
import './styles/animations.scss';

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
  isCheck,
  kingPosition,
  ariaLabel,
  onSquareClick,
  onPieceDrop,
}: ChessBoardProps) {
  const [hoveredSquare, setHoveredSquare] = useState<string | null>(null);
  const [dragOverSquare, setDragOverSquare] = useState<string | null>(null);

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
      aria-label={ariaLabel ?? 'Chess'}
      data-testid="chess-board"
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
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          aspectRatio: '1 / 1',
          borderRadius: 10,
          overflow: 'hidden',
          backgroundColor: 'rgba(15, 20, 30, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow:
            '0 4px 24px rgba(0, 0, 0, 0.5), 0 1px 0 rgba(255, 255, 255, 0.05) inset',
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
              const kingCheck = isKingInCheck(file, rank);
              const hovered = hoveredSquare === `${file}-${rank}`;
              const isMyPiece = piece?.color === myColor;
              const canInteract = !disabled && (isMyPiece || legalTarget);
              const isDragOver = dragOverSquare === `${file}-${rank}`;

              const symbol = piece
                ? PIECE_SYMBOLS[piece.type][piece.color]
                : null;

              let bgColor = isLight
                ? 'rgba(160, 180, 200, 0.35)'
                : 'rgba(60, 75, 95, 0.8)';
              if (selected) bgColor = 'rgba(255, 215, 0, 0.35)';
              else if (kingCheck) bgColor = 'rgba(239, 68, 68, 0.4)';
              else if (lastMoved) bgColor = 'rgba(56, 189, 248, 0.25)';

              const isLastFile = rows.files[rows.files.length - 1] === file;

              return (
                <div
                  key={`${file}-${rank}`}
                  role="gridcell"
                  data-testid={`chess-${file}${rank}`}
                  aria-label={`${file}${rank}${piece ? ` ${piece.color} ${piece.type}` : ''}${selected ? ' selected' : ''}${legalTarget ? ' legal move' : ''}`}
                  draggable={isMyPiece && !disabled}
                  onClick={() => {
                    if (!disabled) onSquareClick(file, rank);
                  }}
                  onMouseEnter={() => setHoveredSquare(`${file}-${rank}`)}
                  onMouseLeave={() => setHoveredSquare(null)}
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', `${file}-${rank}`);
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    setDragOverSquare(`${file}-${rank}`);
                  }}
                  onDragLeave={() => setDragOverSquare(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOverSquare(null);
                    const data = e.dataTransfer.getData('text/plain');
                    if (data && onPieceDrop) {
                      const [fromFile, fromRank] = data.split('-');
                      onPieceDrop(
                        fromFile as File,
                        Number(fromRank) as Rank,
                        file,
                        rank,
                      );
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
                  {isLastFile && (
                    <span
                      style={{
                        position: 'absolute',
                        right: 3,
                        top: 2,
                        fontSize: 10,
                        fontWeight: 600,
                        opacity: 0.4,
                        color: '#fff',
                        lineHeight: 1,
                        pointerEvents: 'none',
                      }}
                    >
                      {rank}
                    </span>
                  )}
                  {symbol && (
                    <span
                      style={{
                        fontSize: 'clamp(1.2rem, 10cqw, 3.2rem)',
                        lineHeight: 1,
                        filter: 'drop-shadow(0 2px 3px rgba(0, 0, 0, 0.4))',
                        userSelect: 'none',
                        position: 'relative',
                        zIndex: 2,
                      }}
                    >
                      {symbol}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
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
