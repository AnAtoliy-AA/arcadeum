'use client';

import { useState, useEffect } from 'react';
import { XStack, YStack, Text } from 'tamagui';
import { useTranslation } from '@/shared/lib/useTranslation';
import {
  BOARD_SIZES,
  MAX_PLAYERS_BY_BOARD_SIZE,
  type BoardSize,
} from '../types';
import { useRoomOptions } from '@/features/games/hooks/useRoomOptions';

interface BoardSizeSelectorProps {
  roomId: string;
  hostId?: string;
  currentSize: BoardSize;
  disabled?: boolean;
  onSizeChange?: (size: BoardSize) => void;
}

export function BoardSizeSelector({
  roomId,
  hostId,
  currentSize,
  disabled = false,
  onSizeChange,
}: BoardSizeSelectorProps) {
  const { t } = useTranslation();
  const { setOption } = useRoomOptions({ roomId, userId: hostId ?? '' });

  const [internalSize, setInternalSize] = useState<BoardSize>(currentSize);

  useEffect(() => {
    setInternalSize(currentSize);
  }, [currentSize]);

  const handlePick = (size: BoardSize) => {
    if (disabled || size === internalSize) return;
    setInternalSize(size);
    onSizeChange?.(size);
    setOption({ boardSize: size });
  };

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
              <span>
                {size}×{size}
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  opacity: isActive ? 0.85 : 0.65,
                }}
              >
                {t('games.tic_tac_toe_v1.lobby.maxPlayersShort', {
                  n: String(MAX_PLAYERS_BY_BOARD_SIZE[size]),
                })}
              </span>
            </button>
          );
        })}
      </XStack>
    </YStack>
  );
}
