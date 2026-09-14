'use client';

import { memo, useMemo } from 'react';
import { InGameAvatar } from '@/features/games/ui/InGameAvatar';
import type { Board, PieceColor, PieceType, PlayerClock } from '../types';
import type { ChessPieceStyle } from '../lib/piece-style';
import { ChessPieceIcon } from './ChessPieceIcon';
import { useClockCountdown } from '../hooks/useClockCountdown';

interface ChessPlayerHudProps {
  playerId: string;
  name: string;
  color: PieceColor;
  isActive: boolean;
  isGameOver: boolean;
  clocks: Record<PieceColor, PlayerClock> | null;
  currentTurnColor: PieceColor;
  gameCreatedAt: number;
  incrementSeconds?: number;
  board: Board;
  pieceStyle?: ChessPieceStyle;
  rating?: number | null;
}

const PIECE_VALUES: Record<PieceType, number> = {
  pawn: 1,
  knight: 3,
  bishop: 3,
  rook: 5,
  queen: 9,
  king: 0,
};

const STARTING_COUNTS: Record<PieceType, number> = {
  pawn: 8,
  knight: 2,
  bishop: 2,
  rook: 2,
  queen: 1,
  king: 1,
};

const PIECE_ORDER: PieceType[] = ['queen', 'rook', 'bishop', 'knight', 'pawn'];

function formatDigitalClock(seconds: number | null): string {
  if (seconds === null) return '--:--';
  const total = Math.max(0, Math.ceil(seconds));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function ChessPlayerHudImpl({
  playerId,
  name,
  color,
  isActive,
  isGameOver,
  clocks,
  currentTurnColor,
  gameCreatedAt,
  incrementSeconds = 0,
  board,
  pieceStyle = 'neo',
  rating,
}: ChessPlayerHudProps) {
  const liveClocks = useClockCountdown({
    clocks,
    currentTurnColor,
    isGameOver,
    gameCreatedAt,
    incrementSeconds,
  });
  const remainingSeconds = clocks ? liveClocks[color] : null;
  const opponentColor: PieceColor = color === 'white' ? 'black' : 'white';

  const { capturedPieces, materialDiff } = useMemo(() => {
    const remainingWhite: Record<PieceType, number> = {
      pawn: 0,
      knight: 0,
      bishop: 0,
      rook: 0,
      queen: 0,
      king: 0,
    };
    const remainingBlack: Record<PieceType, number> = {
      pawn: 0,
      knight: 0,
      bishop: 0,
      rook: 0,
      queen: 0,
      king: 0,
    };

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r]?.[c];
        if (!piece) continue;
        if (piece.color === 'white') {
          remainingWhite[piece.type] = (remainingWhite[piece.type] ?? 0) + 1;
        } else {
          remainingBlack[piece.type] = (remainingBlack[piece.type] ?? 0) + 1;
        }
      }
    }

    let whiteScore = 0;
    let blackScore = 0;
    const opponentPiecesCaptured: Array<{ type: PieceType; count: number }> =
      [];

    PIECE_ORDER.forEach((type) => {
      const whiteLost = Math.max(
        0,
        STARTING_COUNTS[type] - (remainingWhite[type] ?? 0),
      );
      const blackLost = Math.max(
        0,
        STARTING_COUNTS[type] - (remainingBlack[type] ?? 0),
      );

      whiteScore += blackLost * PIECE_VALUES[type];
      blackScore += whiteLost * PIECE_VALUES[type];

      const capturedCount = color === 'white' ? blackLost : whiteLost;
      if (capturedCount > 0) {
        opponentPiecesCaptured.push({ type, count: capturedCount });
      }
    });

    const diff =
      color === 'white' ? whiteScore - blackScore : blackScore - whiteScore;

    return {
      capturedPieces: opponentPiecesCaptured,
      materialDiff: diff,
    };
  }, [board, color]);

  const clockString = formatDigitalClock(remainingSeconds);
  const isUrgent =
    remainingSeconds !== null &&
    remainingSeconds <= 10 &&
    remainingSeconds > 0 &&
    isActive &&
    !isGameOver;
  const isWarning =
    remainingSeconds !== null &&
    remainingSeconds <= 30 &&
    remainingSeconds > 10 &&
    isActive &&
    !isGameOver;

  return (
    <div
      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl transition-all duration-200 border backdrop-blur-md ${
        isActive && !isGameOver
          ? 'bg-amber-500/10 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
          : 'bg-[var(--glassBg)] border-[var(--glassBorder)]'
      }`}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
        <InGameAvatar playerId={playerId} name={name} size="sm" />
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-[var(--color)] truncate max-w-[130px] sm:max-w-[180px]">
              {name}
            </span>
            <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold uppercase tracking-wider bg-white/5 text-[var(--textSecondary)] border border-white/10">
              {color}
            </span>
            {rating != null && (
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded font-bold font-mono border ${
                  rating >= 1800
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : rating >= 1200
                      ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                      : 'bg-white/5 text-[var(--textSecondary)] border-white/10'
                }`}
              >
                {rating}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 mt-0.5 min-h-[14px]">
            {capturedPieces.map(({ type, count }) => (
              <div
                key={type}
                className="flex items-center text-[10px] text-[var(--textSecondary)]"
              >
                <div className="w-3.5 h-3.5 opacity-80">
                  <ChessPieceIcon
                    piece={{ type, color: opponentColor }}
                    pieceStyle={pieceStyle}
                  />
                </div>
                {count > 1 && (
                  <span className="text-[9px] font-bold font-mono">
                    x{count}
                  </span>
                )}
              </div>
            ))}
            {materialDiff > 0 && (
              <span className="text-[9px] font-bold font-mono text-emerald-400 bg-emerald-500/15 px-1 rounded ml-1">
                +{materialDiff}
              </span>
            )}
          </div>
        </div>
      </div>

      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono transition-all duration-200 ${
          isUrgent
            ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse'
            : isWarning
              ? 'bg-amber-500/20 border-amber-500 text-amber-300'
              : isActive && !isGameOver
                ? 'bg-white/10 border-amber-400/60 text-white shadow-sm'
                : 'bg-black/30 border-white/5 text-zinc-300'
        }`}
      >
        <div className="flex flex-col items-end">
          <span className="text-sm sm:text-base font-extrabold tracking-wider tabular-nums leading-none">
            {clockString}
          </span>
          {incrementSeconds > 0 && (
            <span className="text-[8px] text-[var(--textSecondary)] opacity-85 font-medium leading-none mt-0.5">
              +{incrementSeconds}s
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export const ChessPlayerHud = memo(ChessPlayerHudImpl);
