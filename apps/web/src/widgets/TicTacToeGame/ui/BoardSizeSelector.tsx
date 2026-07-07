'use client';

import { useState, useEffect } from 'react';
import { XStack, YStack, Text } from 'tamagui';
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

  useEffect(() => {
    setInternalSize(currentSize);
  }, [currentSize]);

  useEffect(() => {
    setInternalMargin(currentMargin);
  }, [currentMargin]);

  useEffect(() => {
    setInternalWinLength(currentWinLength);
  }, [currentWinLength]);

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
    <YStack gap="$2">
      <Text fontSize="$3" fontWeight="600" color="$color">
        {t('games.tic_tac_toe_v1.lobby.boardSize')}
      </Text>
      <XStack gap="$2" flexWrap="wrap">
        {BOARD_SIZES.map((size) => {
          const isActive = size === internalSize;
          return (
            <button
              key={size}
              type="button"
              data-testid={`ttt-board-size-${size}`}
              disabled={disabled}
              onClick={() => handlePick(size)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                padding: '10px 16px',
                borderRadius: 10,
                border: isActive
                  ? '2px solid var(--primary, #3b82f6)'
                  : '2px solid var(--borderColor, #cbd5e1)',
                backgroundColor: isActive
                  ? 'var(--primary, #3b82f6)'
                  : 'transparent',
                color: isActive ? '#fff' : 'inherit',
                fontWeight: 600,
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.6 : 1,
                minWidth: 72,
                lineHeight: 1.1,
              }}
            >
              <span>{size === 'infinity' ? '∞' : `${size}×${size}`}</span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  opacity: isActive ? 0.85 : 0.65,
                }}
              >
                {size === 'infinity'
                  ? t('games.tic_tac_toe_v1.lobby.infinityLabel')
                  : t('games.tic_tac_toe_v1.lobby.maxPlayersShort', {
                      n: String(MAX_PLAYERS_BY_BOARD_SIZE[size]),
                    })}
              </span>
            </button>
          );
        })}
      </XStack>

      {isInfinity && (
        <YStack
          gap="$3"
          marginTop="$2"
          padding="$3"
          backgroundColor="rgba(99,102,241,0.08)"
          borderRadius={10}
        >
          <YStack gap="$1">
            <Text fontSize="$2" fontWeight="600" color="$color">
              {t('games.tic_tac_toe_v1.lobby.expansionMargin')}
            </Text>
            <XStack gap="$2" flexWrap="wrap">
              {INFINITY_MARGIN_OPTIONS.map((margin) => {
                const isActive = margin === internalMargin;
                return (
                  <button
                    key={margin}
                    type="button"
                    data-testid={`ttt-margin-${margin}`}
                    disabled={disabled}
                    onClick={() => handleMarginChange(margin)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 8,
                      border: isActive
                        ? '2px solid var(--primary, #3b82f6)'
                        : '2px solid var(--borderColor, #cbd5e1)',
                      backgroundColor: isActive
                        ? 'var(--primary, #3b82f6)'
                        : 'transparent',
                      color: isActive ? '#fff' : 'inherit',
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: disabled ? 'not-allowed' : 'pointer',
                      opacity: disabled ? 0.6 : 1,
                    }}
                  >
                    {margin}
                  </button>
                );
              })}
            </XStack>
          </YStack>

          <YStack gap="$1">
            <Text fontSize="$2" fontWeight="600" color="$color">
              {t('games.tic_tac_toe_v1.lobby.winCondition')}
            </Text>
            <XStack gap="$2" flexWrap="wrap">
              {INFINITY_WIN_LENGTH_OPTIONS.map((winLen) => {
                const isActive = winLen === internalWinLength;
                return (
                  <button
                    key={winLen}
                    type="button"
                    data-testid={`ttt-win-length-${winLen}`}
                    disabled={disabled}
                    onClick={() => handleWinLengthChange(winLen)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 8,
                      border: isActive
                        ? '2px solid var(--primary, #3b82f6)'
                        : '2px solid var(--borderColor, #cbd5e1)',
                      backgroundColor: isActive
                        ? 'var(--primary, #3b82f6)'
                        : 'transparent',
                      color: isActive ? '#fff' : 'inherit',
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: disabled ? 'not-allowed' : 'pointer',
                      opacity: disabled ? 0.6 : 1,
                    }}
                  >
                    {t('games.tic_tac_toe_v1.lobby.inARow', {
                      n: String(winLen),
                    })}
                  </button>
                );
              })}
            </XStack>
          </YStack>
        </YStack>
      )}
    </YStack>
  );
}
