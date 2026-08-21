'use client';

import { useBackgammonTheme } from '../lib/BackgammonThemeContext';
import type { BackgammonPoint as PointType } from '../types';

interface BackgammonPointProps {
  pointIndex: number;
  point: PointType;
  isTop: boolean;
  isSelected: boolean;
  isValidTarget: boolean;
  currentUserId: string | null;
  playerOrder: string[];
  onClick: () => void;
}

export function BackgammonPoint({
  pointIndex,
  point,
  isTop,
  isSelected,
  isValidTarget,
  currentUserId: _currentUserId,
  playerOrder,
  onClick,
}: BackgammonPointProps) {
  const theme = useBackgammonTheme();
  const isEven = pointIndex % 2 === 0;
  const pointColor = isEven ? theme.pointDark : theme.pointLight;

  const isP0Checker = point.playerId === playerOrder[0];
  const checkerColor = isP0Checker ? theme.whitePiece : theme.blackPiece;
  const checkerBorder = isP0Checker
    ? theme.whitePieceBorder
    : theme.blackPieceBorder;

  const maxVisible = 5;
  const displayCount = Math.min(point.count, maxVisible);
  const checkers = Array.from({ length: displayCount });

  return (
    <div
      className={`relative flex flex-col items-center flex-1 h-full cursor-pointer select-none transition-all duration-150 rounded-sm ${
        isValidTarget
          ? 'bg-emerald-500/20 ring-1 ring-emerald-400/80 shadow-[0_0_12px_rgba(52,211,153,0.3)]'
          : 'hover:brightness-110'
      }`}
      data-testid={`point-${pointIndex}`}
      onClick={onClick}
    >
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-80"
        preserveAspectRatio="none"
        viewBox="0 0 100 200"
      >
        <polygon
          fill={isSelected ? theme.selectedPiece : pointColor}
          points={isTop ? '0,0 100,0 50,195' : '0,200 100,200 50,5'}
        />
      </svg>

      <div
        className={`relative z-10 flex flex-col items-center w-full px-0.5 ${
          isTop ? 'justify-start pt-1' : 'justify-end pb-1 mt-auto'
        }`}
      >
        {checkers.map((_, i) => {
          const isTopMost = isTop ? i === displayCount - 1 : i === 0;
          const isHighlighted = isSelected && isTopMost;

          return (
            <div
              className={`relative w-5 h-5 sm:w-7 sm:h-7 rounded-full border shadow-md flex items-center justify-center transition-all duration-150 -my-0.5 sm:-my-1 ${
                isHighlighted
                  ? 'scale-110 ring-2 ring-purple-400 z-20 shadow-purple-500/50'
                  : 'z-10'
              }`}
              key={i}
              style={{
                backgroundColor: checkerColor,
                borderColor: checkerBorder,
                boxShadow: isP0Checker
                  ? 'inset 0 1px 2px rgba(255,255,255,0.4), inset 0 -1px 2px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.5)'
                  : 'inset 0 1px 2px rgba(255,255,255,0.2), inset 0 -1px 2px rgba(0,0,0,0.6), 0 2px 4px rgba(0,0,0,0.5)',
              }}
            >
              <div className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full border border-white/20 opacity-60 pointer-events-none" />

              {isTopMost && point.count > maxVisible && (
                <span className="absolute inset-0 flex items-center justify-center text-[9px] sm:text-[10px] font-black text-white bg-black/70 rounded-full">
                  +{point.count - maxVisible + 1}
                </span>
              )}
            </div>
          );
        })}

        {isValidTarget && point.count === 0 && (
          <div className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full bg-emerald-400 ring-2 ring-emerald-300 animate-pulse my-2 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
        )}
      </div>

      <span
        className={`absolute text-[8px] sm:text-[9px] font-bold text-white/40 pointer-events-none ${
          isTop ? 'top-0.5' : 'bottom-0.5'
        }`}
      >
        {pointIndex + 1}
      </span>
    </div>
  );
}
