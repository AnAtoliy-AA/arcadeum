'use client';

import { memo } from 'react';
import { PIECE_SYMBOLS, type ChessPiece, type File, type Rank } from '../types';
import { useChessTheme } from '../lib/ChessThemeContext';

export interface ChessCellProps {
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
  animating: Map<string, { dx: number; dy: number }>;
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
  animating,
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
            transform: animating.get(square)
              ? `translate(${animating.get(square)!.dx}%, ${animating.get(square)!.dy}%)`
              : undefined,
          }}
        >
          {symbol}
        </span>
      )}
    </div>
  );
}

export const MemoizedChessCell = memo(ChessCell);
