'use client';

import { memo } from 'react';
import type { ChessPiece, File, Rank } from '../types';
import type { ChessPieceStyle } from '../lib/piece-style';
import { ChessPieceIcon } from './ChessPieceIcon';

export interface ChessCellProps {
  file: File;
  rank: Rank;
  piece: ChessPiece | null;
  pieceStyle?: ChessPieceStyle;
  isLight: boolean;
  selected: boolean;
  legalTarget: boolean;
  lastMoved: boolean;
  hintMoved: boolean;
  pendingTarget: boolean;
  kingCheck: boolean;
  hovered: boolean;
  isDragOver: boolean;
  isMyPiece: boolean;
  isPremoveGhost?: boolean;
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

const UNICODE_PIECES: Record<string, string> = {
  'white-pawn': '♙',
  'white-knight': '♘',
  'white-bishop': '♗',
  'white-rook': '♖',
  'white-queen': '♕',
  'white-king': '♔',
  'black-pawn': '♟',
  'black-knight': '♞',
  'black-bishop': '♝',
  'black-rook': '♜',
  'black-queen': '♛',
  'black-king': '♚',
};

function ChessCell({
  file,
  rank,
  piece,
  pieceStyle = 'neo',
  isLight,
  selected,
  legalTarget,
  lastMoved,
  hintMoved,
  pendingTarget,
  kingCheck,
  hovered,
  isDragOver,
  isMyPiece,
  isPremoveGhost = false,
  canInteract,
  isLastFile,
  isBottomRank,
  disabled,
  cellFocusProps,
  onSquareClick,
  onPieceDrop,
  onHover,
  onDragOver,
  animating: _animating,
}: ChessCellProps) {
  const square = `${file}-${rank}`;

  let bgClass = isLight
    ? 'bg-[var(--chess-light-square)]'
    : 'bg-[var(--chess-dark-square)]';
  if (selected) {
    bgClass =
      'bg-[var(--chess-selected-square)] ring-2 ring-amber-400/80 inset-ring';
  } else if (kingCheck) {
    bgClass =
      'bg-[var(--chess-check-square)] ring-2 ring-red-500 animate-pulse';
  } else if (isPremoveGhost) {
    bgClass = 'bg-amber-500/25 ring-2 ring-amber-400/70 inset-ring';
  } else if (pendingTarget) {
    bgClass = 'bg-amber-400/40';
  } else if (hintMoved) {
    bgClass = 'bg-emerald-500/35 ring-2 ring-emerald-400/70';
  } else if (lastMoved) {
    bgClass = 'bg-[var(--chess-last-move)]';
  }

  const pieceKey = piece ? `${piece.color}-${piece.type}` : '';
  const unicodeSymbol = pieceKey ? UNICODE_PIECES[pieceKey] : '';

  return (
    <div
      role="gridcell"
      data-testid={`chess-${file}${rank}`}
      className={`flex-1 aspect-square relative flex items-center justify-center overflow-hidden select-none touch-manipulation transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--primary)] ${bgClass} ${
        canInteract ? 'cursor-pointer' : 'cursor-default'
      } ${legalTarget && (hovered || isDragOver) ? 'brightness-125' : ''}`}
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
        onDragOver(square);
      }}
      onDragLeave={() => onDragOver(null)}
      onDrop={(e) => {
        e.preventDefault();
        onDragOver(null);
        const data = e.dataTransfer.getData('text/plain');
        if (data) {
          const [f, r] = data.split('-');
          if (f && r && onPieceDrop) {
            onPieceDrop(f as File, parseInt(r, 10) as Rank, file, rank);
          }
        }
      }}
    >
      {isLastFile && (
        <span className="pointer-events-none absolute top-0.5 right-0.5 text-[9px] sm:text-[11px] font-bold font-mono text-[var(--chess-coord)] opacity-70 leading-none">
          {rank}
        </span>
      )}

      {isBottomRank && (
        <span className="pointer-events-none absolute bottom-0.5 left-0.5 text-[9px] sm:text-[11px] font-bold font-mono text-[var(--chess-coord)] opacity-70 leading-none">
          {file}
        </span>
      )}

      {legalTarget && !piece && (
        <div className="pointer-events-none absolute w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-[var(--chess-legal-dot)] shadow-sm" />
      )}

      {legalTarget && piece && (
        <div className="pointer-events-none absolute inset-1 sm:inset-1.5 rounded-full ring-2 sm:ring-[3px] ring-[var(--chess-legal-dot)] ring-inset" />
      )}

      {piece && (
        <div
          className={`pointer-events-none relative z-10 w-[82%] h-[82%] flex items-center justify-center transition-transform hover:scale-105 active:scale-95 ${
            isPremoveGhost
              ? 'opacity-70 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]'
              : 'drop-shadow-md'
          }`}
        >
          <ChessPieceIcon piece={piece} pieceStyle={pieceStyle} />
          <span className="sr-only">{unicodeSymbol}</span>
        </div>
      )}
    </div>
  );
}

function areChessCellPropsEqual(
  prev: ChessCellProps,
  next: ChessCellProps,
): boolean {
  if (prev.file !== next.file || prev.rank !== next.rank) return false;
  if (prev.isLight !== next.isLight) return false;
  if (prev.selected !== next.selected) return false;
  if (prev.legalTarget !== next.legalTarget) return false;
  if (prev.lastMoved !== next.lastMoved) return false;
  if (prev.hintMoved !== next.hintMoved) return false;
  if (prev.pendingTarget !== next.pendingTarget) return false;
  if (prev.kingCheck !== next.kingCheck) return false;
  if (prev.hovered !== next.hovered) return false;
  if (prev.isDragOver !== next.isDragOver) return false;
  if (prev.isMyPiece !== next.isMyPiece) return false;
  if (prev.isPremoveGhost !== next.isPremoveGhost) return false;
  if (prev.canInteract !== next.canInteract) return false;
  if (prev.disabled !== next.disabled) return false;
  if (prev.pieceStyle !== next.pieceStyle) return false;
  if (prev.onSquareClick !== next.onSquareClick) return false;
  if (prev.onPieceDrop !== next.onPieceDrop) return false;
  if (prev.piece?.type !== next.piece?.type) return false;
  if (prev.piece?.color !== next.piece?.color) return false;
  return true;
}

export const MemoizedChessCell = memo(ChessCell, areChessCellPropsEqual);
