'use client';

import { useState } from 'react';
import { Button } from '@arcadeum/ui';
import { useTranslation } from '@/shared/lib/useTranslation';
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
    <div className="flex flex-col items-stretch gap-2">
      <span className="text-[16px] font-semibold text-[var(--color)]">
        {t('games.tic_tac_toe_v1.lobby.boardSize')}
      </span>
      <div className="flex flex-row items-stretch gap-2 flex-wrap">
        {BOARD_SIZES.map((size) => {
          const isActive = size === internalSize;
          return (
            <Button
              className={`rounded-[10px] font-semibold min-w-[72px] overflow-hidden ${
                isActive
                  ? 'bg-[var(--primary,#3b82f6)] border-[var(--primary,#3b82f6)] hover:bg-[var(--primary,#3b82f6)]'
                  : 'bg-[transparent] border-[var(--borderColor,#cbd5e1)] hover:bg-[rgba(255,255,255,0.05)]'
              } ${disabled ? 'opacity-60' : 'opacity-100'}`}
              style={{
                color: isActive ? '#fff' : 'inherit',
                height: 'auto',
                flex: 0,
              }}
              key={size}
              variant="chip"
              size="md"
              data-testid={`ttt-board-size-${size}`}
              disabled={disabled}
              data-active={isActive ? 'on' : undefined}
              onClick={() => handlePick(size)}
            >
              <div className="flex flex-col items-center gap-2">
                <span className="">
                  {size === 'infinity' ? '∞' : `${size}×${size}`}
                </span>
                <span
                  className="text-[11px] font-medium"
                  style={{ opacity: isActive ? 0.85 : 0.65 }}
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
        <div className="flex flex-col items-stretch gap-3 -mt-2 p-3 bg-[rgba(99,102,241,0.08)] rounded-[10px]">
          <div className="flex flex-col items-stretch gap-1">
            <span className="text-[14px] font-semibold text-[var(--color)]">
              {t('games.tic_tac_toe_v1.lobby.expansionMargin')}
            </span>
            <div className="flex flex-row items-stretch gap-2 flex-wrap">
              {INFINITY_MARGIN_OPTIONS.map((margin) => {
                const isActive = margin === internalMargin;
                return (
                  <Button
                    className={`rounded-[8px] font-semibold text-[13px] ${
                      isActive
                        ? 'bg-[var(--primary,#3b82f6)] border-[var(--primary,#3b82f6)] hover:bg-[var(--primary,#3b82f6)]'
                        : 'bg-[transparent] border-[var(--borderColor,#cbd5e1)] hover:bg-[rgba(255,255,255,0.05)]'
                    } ${disabled ? 'opacity-60' : 'opacity-100'}`}
                    style={{ color: isActive ? '#fff' : 'inherit' }}
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

          <div className="flex flex-col items-stretch gap-1">
            <span className="text-[14px] font-semibold text-[var(--color)]">
              {t('games.tic_tac_toe_v1.lobby.winCondition')}
            </span>
            <div className="flex flex-row items-stretch gap-2 flex-wrap">
              {INFINITY_WIN_LENGTH_OPTIONS.map((winLen) => {
                const isActive = winLen === internalWinLength;
                return (
                  <Button
                    className={`rounded-[8px] font-semibold text-[13px] ${
                      isActive
                        ? 'bg-[var(--primary,#3b82f6)] border-[var(--primary,#3b82f6)] hover:bg-[var(--primary,#3b82f6)]'
                        : 'bg-[transparent] border-[var(--borderColor,#cbd5e1)] hover:bg-[rgba(255,255,255,0.05)]'
                    } ${disabled ? 'opacity-60' : 'opacity-100'}`}
                    style={{ color: isActive ? '#fff' : 'inherit' }}
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
