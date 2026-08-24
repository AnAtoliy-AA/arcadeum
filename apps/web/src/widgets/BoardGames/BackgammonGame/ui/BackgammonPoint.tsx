'use client';

import { BOARD_CELL_FOCUS_CLASS } from '@/shared/lib/keyboard-navigation';
import { useBackgammonTheme } from '../lib/BackgammonThemeContext';
import type { BackgammonPoint as PointType } from '../types';

interface TargetInfo {
  die: number;
  isHit: boolean;
}

interface BackgammonPointProps {
  pointIndex: number;
  point: PointType;
  isTop: boolean;
  isSelected: boolean;
  targetInfo?: TargetInfo | null;
  currentUserId: string | null;
  playerOrder: string[];
  onClick: () => void;
  /** Roving-tabindex/focus attributes from the board's keyboard navigation. */
  cellFocusProps?: Record<string, unknown>;
}

export function BackgammonPoint({
  pointIndex,
  point,
  isTop,
  isSelected,
  targetInfo,
  currentUserId: _currentUserId,
  playerOrder,
  onClick,
  cellFocusProps,
}: BackgammonPointProps) {
  const theme = useBackgammonTheme();
  const isEven = pointIndex % 2 === 0;
  const pointColor = isEven ? theme.pointDark : theme.pointLight;

  const isP0Checker = point.playerId === playerOrder[0];
  const checkerColor = isP0Checker ? theme.whitePiece : theme.blackPiece;
  const checkerBorder = isP0Checker
    ? theme.whitePieceBorder
    : theme.blackPieceBorder;

  const isValidTarget = !!targetInfo;
  const isHitTarget = targetInfo?.isHit ?? false;

  const maxVisible = 5;
  const displayCount = Math.min(point.count, maxVisible);
  const checkers = Array.from({ length: displayCount });

  return (
    <div
      className={`relative flex flex-col items-center flex-1 h-full cursor-pointer select-none transition-all duration-200 rounded-sm ${BOARD_CELL_FOCUS_CLASS} ${
        isHitTarget
          ? 'bg-rose-500/25 ring-2 ring-rose-400 shadow-[0_0_16px_rgba(244,63,94,0.5)]'
          : isValidTarget
            ? 'bg-emerald-500/20 ring-1 ring-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.35)]'
            : 'hover:brightness-110'
      }`}
      data-testid={`point-${pointIndex}`}
      onClick={onClick}
      {...cellFocusProps}
    >
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-85"
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
                  ? 'inset 0 1px 2px rgba(255,255,255,0.45), inset 0 -1px 2px rgba(0,0,0,0.4), 0 3px 5px rgba(0,0,0,0.6)'
                  : 'inset 0 1px 2px rgba(255,255,255,0.2), inset 0 -1px 2px rgba(0,0,0,0.7), 0 3px 5px rgba(0,0,0,0.6)',
              }}
            >
              <div className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full border border-white/25 opacity-60 pointer-events-none" />

              {isTopMost && point.count > maxVisible && (
                <span className="absolute inset-0 flex items-center justify-center text-[9px] sm:text-[10px] font-black text-white bg-black/75 rounded-full">
                  +{point.count - maxVisible + 1}
                </span>
              )}
            </div>
          );
        })}

        {isValidTarget && (
          <div className="my-1.5 flex flex-col items-center gap-0.5 animate-bounce z-20">
            {isHitTarget ? (
              <span className="px-1.5 py-0.5 rounded-full bg-rose-600 text-white font-black text-[8px] sm:text-[9px] shadow-lg ring-1 ring-rose-300 uppercase tracking-tight">
                ⚔️ HIT
              </span>
            ) : (
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-emerald-500 text-white font-black text-[9px] sm:text-[10px] flex items-center justify-center shadow-lg ring-2 ring-emerald-300">
                +{targetInfo.die}
              </div>
            )}
          </div>
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
