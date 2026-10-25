'use client';

import { useState } from 'react';
import { Button } from '@arcadeum/ui';
import { cx } from '@arcadeum/ui/utils/cx';
import { useTranslation } from '@/shared/i18n/useTranslation';
import {
  BOARD_SIZES,
  MAX_PLAYERS_BY_BOARD_SIZE,
  INFINITY_MARGIN_OPTIONS,
  INFINITY_WIN_LENGTH_OPTIONS,
  type BoardSize,
  type InfinityMargin,
  type InfinityWinLength,
} from '../types';
import { useRoomOptions } from '@/features/games/hooks/useRoomOptions';

interface BoardSizeSelectorProps {
  roomId: string;
  hostId?: string;
  currentSize: BoardSize;
  currentMargin?: InfinityMargin;
  currentWinLength?: InfinityWinLength;
  disabled?: boolean;
  onSizeChange?: (size: BoardSize) => void;
  onMarginChange?: (margin: InfinityMargin) => void;
  onWinLengthChange?: (winLength: InfinityWinLength) => void;
}

export function BoardSizeSelector({
  roomId,
  hostId,
  currentSize,
  currentMargin = 3,
  currentWinLength = 5,
  disabled = false,
  onSizeChange,
  onMarginChange,
  onWinLengthChange,
}: BoardSizeSelectorProps) {
  const { t } = useTranslation();
  const { setOption } = useRoomOptions({ roomId, userId: hostId ?? '' });

  const [internalSize, setInternalSize] = useState<BoardSize>(currentSize);
  const [internalMargin, setInternalMargin] =
    useState<InfinityMargin>(currentMargin);
  const [internalWinLength, setInternalWinLength] =
    useState<InfinityWinLength>(currentWinLength);

  const handlePick = (size: BoardSize) => {
    if (disabled || size === internalSize) return;
    setInternalSize(size);
    onSizeChange?.(size);
    setOption({ boardSize: size });
  };

  const handleMarginChange = (margin: InfinityMargin) => {
    if (disabled || margin === internalMargin) return;
    setInternalMargin(margin);
    onMarginChange?.(margin);
    setOption({ expansionMargin: margin });
  };

  const handleWinLengthChange = (winLength: InfinityWinLength) => {
    if (disabled || winLength === internalWinLength) return;
    setInternalWinLength(winLength);
    onWinLengthChange?.(winLength);
    setOption({ infinityWinLength: winLength });
  };

  const isInfinity = internalSize === 'infinity';

  return (
    <div
      data-testid="field-size-selector"
      className="flex flex-col items-stretch gap-2.5 p-3.5 rounded-xl border border-[var(--glassBorder)] bg-[var(--surface)]/50"
    >
      <div className="flex items-center gap-2">
        <span className="text-base">📐</span>
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--textPrimary)]">
          {t('games.tic_tac_toe_v1.lobby.boardSize')}
        </span>
      </div>
      <div className="flex flex-row items-stretch gap-2 flex-wrap">
        {BOARD_SIZES.map((size) => {
          const isActive = size === internalSize;
          return (
            <Button
              className={cx(
                'rounded-xl font-semibold min-w-[76px] h-auto min-h-[50px] transition-all',
                isActive
                  ? 'bg-blue-600 border-blue-500 text-white shadow-md ring-1 ring-blue-400/50'
                  : 'bg-[var(--surface)] border-[var(--borderColor)] text-[var(--textSecondary)] hover:bg-[var(--backgroundHover)] hover:text-[var(--textPrimary)]',
                disabled && 'opacity-60 cursor-not-allowed',
              )}
              key={size}
              variant="ghost"
              size="md"
              padding="px-3.5 py-2"
              data-testid={`ttt-board-size-${size}`}
              disabled={disabled}
              data-active={isActive ? 'on' : undefined}
              onClick={() => handlePick(size)}
            >
              <div className="flex flex-col items-center justify-center gap-0.5">
                <span className="text-sm font-bold leading-none">
                  {size === 'infinity' ? '∞' : `${size}×${size}`}
                </span>
                <span
                  className={cx(
                    'text-[10px] font-medium tracking-tight leading-normal',
                    isActive ? 'opacity-90' : 'opacity-70',
                  )}
                >
                  {size === 'infinity'
                    ? t('games.tic_tac_toe_v1.lobby.infinityLabel')
                    : t('games.tic_tac_toe_v1.lobby.maxPlayersShort', {
                        n: String(MAX_PLAYERS_BY_BOARD_SIZE[size]),
                      })}
                </span>
              </div>
            </Button>
          );
        })}
      </div>

      {isInfinity && (
        <div className="flex flex-col items-stretch gap-3 mt-1 p-3 bg-[rgba(99,102,241,0.08)] rounded-xl border border-[rgba(99,102,241,0.2)]">
          <div className="flex flex-col items-stretch gap-1.5">
            <span className="text-xs font-semibold text-[var(--textSecondary)]">
              {t('games.tic_tac_toe_v1.lobby.expansionMargin')}
            </span>
            <div className="flex flex-row items-stretch gap-2 flex-wrap">
              {INFINITY_MARGIN_OPTIONS.map((margin) => {
                const isActive = margin === internalMargin;
                return (
                  <Button
                    className={cx(
                      'rounded-lg font-semibold text-xs px-3 py-1.5',
                      isActive
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-[transparent] border-[var(--borderColor)] text-[var(--textSecondary)] hover:bg-[var(--backgroundHover)]',
                      disabled && 'opacity-60 cursor-not-allowed',
                    )}
                    key={margin}
                    variant="chip"
                    size="sm"
                    data-testid={`ttt-margin-${margin}`}
                    disabled={disabled}
                    data-active={isActive ? 'on' : undefined}
                    onClick={() => handleMarginChange(margin)}
                  >
                    {margin}
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col items-stretch gap-1.5">
            <span className="text-xs font-semibold text-[var(--textSecondary)]">
              {t('games.tic_tac_toe_v1.lobby.winCondition')}
            </span>
            <div className="flex flex-row items-stretch gap-2 flex-wrap">
              {INFINITY_WIN_LENGTH_OPTIONS.map((winLen) => {
                const isActive = winLen === internalWinLength;
                return (
                  <Button
                    className={cx(
                      'rounded-lg font-semibold text-xs px-3 py-1.5',
                      isActive
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-[transparent] border-[var(--borderColor)] text-[var(--textSecondary)] hover:bg-[var(--backgroundHover)]',
                      disabled && 'opacity-60 cursor-not-allowed',
                    )}
                    key={winLen}
                    variant="chip"
                    size="sm"
                    data-testid={`ttt-win-length-${winLen}`}
                    disabled={disabled}
                    data-active={isActive ? 'on' : undefined}
                    onClick={() => handleWinLengthChange(winLen)}
                  >
                    {t('games.tic_tac_toe_v1.lobby.inARow', {
                      n: String(winLen),
                    })}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
