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

  const displayCount = Math.min(point.count, 5);
  const checkers = Array.from({ length: displayCount });

  return (
    <div
      className={`relative flex flex-col items-center flex-1 h-full cursor-pointer select-none transition-colors ${
        isValidTarget ? 'ring-2 ring-emerald-400 rounded-sm' : ''
      }`}
      data-testid={`point-${pointIndex}`}
      onClick={onClick}
    >
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        preserveAspectRatio="none"
        viewBox="0 0 100 200"
      >
        <polygon
          fill={isSelected ? theme.selectedPiece : pointColor}
          points={isTop ? '0,0 100,0 50,190' : '0,200 100,200 50,10'}
        />
      </svg>

      <div
        className={`relative z-10 flex flex-col items-center gap-0.5 w-full py-1 ${
          isTop ? 'justify-start' : 'justify-end mt-auto'
        }`}
      >
        {checkers.map((_, i) => (
          <div
            className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 shadow-md flex items-center justify-center transition-transform ${
              isSelected && i === (isTop ? point.count - 1 : 0)
                ? 'scale-110 ring-2 ring-purple-400'
                : ''
            }`}
            key={i}
            style={{
              backgroundColor: checkerColor,
              borderColor: checkerBorder,
            }}
          >
            {i === displayCount - 1 && point.count > 5 && (
              <span className="text-[10px] font-extrabold text-white bg-black/60 px-1 rounded-full">
                {point.count}
              </span>
            )}
          </div>
        ))}

        {isValidTarget && point.count === 0 && (
          <div className="w-3 h-3 rounded-full bg-emerald-400/80 animate-pulse my-2" />
        )}
      </div>

      <span className="absolute text-[9px] font-bold text-white/40 bottom-0.5 pointer-events-none">
        {pointIndex + 1}
      </span>
    </div>
  );
}
