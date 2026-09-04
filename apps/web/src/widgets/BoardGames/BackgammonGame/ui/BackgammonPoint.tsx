'use client';

import { cx } from '@arcadeum/ui/utils/cx';
import { BOARD_CELL_FOCUS_CLASS } from '@/shared/lib/keyboard-navigation';
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
  const isEven = pointIndex % 2 === 0;
  const isP0Checker = point.playerId === playerOrder[0];

  const isValidTarget = Boolean(targetInfo);
  const isHitTarget = Boolean(targetInfo?.isHit);

  const maxVisible = 5;
  const displayCount = Math.min(point.count, maxVisible);
  const checkers = Array.from({ length: displayCount });

  const polygonClass = isSelected
    ? 'backgammon-point-svg-selected'
    : isEven
      ? 'backgammon-point-svg-dark'
      : 'backgammon-point-svg-light';

  return (
    <div
      className={cx(
        'relative flex flex-col items-center flex-1 h-full cursor-pointer select-none transition-all duration-200 rounded-sm',
        BOARD_CELL_FOCUS_CLASS,
        isHitTarget && 'bg-rose-500/25 ring-2 ring-rose-400 shadow-md',
        !isHitTarget &&
          isValidTarget &&
          'bg-emerald-500/20 ring-1 ring-emerald-400 shadow-sm',
        !isHitTarget && !isValidTarget && 'hover:brightness-110',
      )}
      data-testid={`point-${pointIndex}`}
      onClick={onClick}
      {...cellFocusProps}
    >
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-90"
        preserveAspectRatio="none"
        viewBox="0 0 100 200"
      >
        <polygon
          className={polygonClass}
          points={isTop ? '0,0 100,0 50,195' : '0,200 100,200 50,5'}
        />
        <circle
          cx="50"
          cy={isTop ? 193 : 7}
          r="2.5"
          className={isSelected ? 'fill-purple-300' : 'fill-white/20'}
        />
      </svg>

      <div
        className={cx(
          'relative z-10 flex flex-col items-center w-full px-0.5',
          isTop ? 'justify-start pt-1' : 'justify-end pb-1 mt-auto',
        )}
      >
        {checkers.map((_, i) => {
          const isTopMost = isTop ? i === displayCount - 1 : i === 0;
          const isHighlighted = isSelected && isTopMost;

          return (
            <div
              className={cx(
                'relative w-5 h-5 sm:w-7 sm:h-7 rounded-full border flex items-center justify-center transition-transform duration-150 -my-0.5 sm:-my-1',
                isP0Checker ? 'backgammon-checker-p0' : 'backgammon-checker-p1',
                isHighlighted && 'scale-110 ring-2 ring-purple-400 z-20',
                !isHighlighted && 'z-10',
              )}
              key={i}
            >
              <div
                className={cx(
                  'w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full border pointer-events-none',
                  isP0Checker
                    ? 'backgammon-checker-ring-p0'
                    : 'backgammon-checker-ring-p1',
                )}
              />

              {isTopMost && point.count > maxVisible && (
                <span className="absolute inset-0 flex items-center justify-center text-[9px] sm:text-[10px] font-black text-white bg-black/80 rounded-full">
                  +{point.count - maxVisible + 1}
                </span>
              )}
            </div>
          );
        })}

        {isValidTarget && targetInfo && (
          <div className="my-1.5 flex flex-col items-center gap-0.5 z-20">
            {isHitTarget ? (
              <span className="px-1.5 py-0.5 rounded-full bg-rose-600 text-white font-black text-[8px] sm:text-[9px] shadow-sm ring-1 ring-rose-300 uppercase tracking-tight">
                ⚔️ HIT
              </span>
            ) : (
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-emerald-500 text-white font-black text-[9px] sm:text-[10px] flex items-center justify-center shadow-sm ring-2 ring-emerald-300">
                +{targetInfo.die}
              </div>
            )}
          </div>
        )}
      </div>

      <span
        className={cx(
          'absolute text-[8px] sm:text-[9px] font-bold text-white/40 pointer-events-none',
          isTop ? 'top-0.5' : 'bottom-0.5',
        )}
      >
        {pointIndex + 1}
      </span>
    </div>
  );
}
