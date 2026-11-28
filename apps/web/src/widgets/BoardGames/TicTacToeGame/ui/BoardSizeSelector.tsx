'use client';

import { useState } from 'react';
import {
  LobbyChoice,
  LobbyOptionGroup,
} from '@/features/games/ui/LobbyOptionKit';
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
  const sizeItems = BOARD_SIZES.map((size) => ({
    id: String(size),
    label: size === 'infinity' ? '∞' : `${size}×${size}`,
    testId: `ttt-board-size-${size}`,
    description:
      size === 'infinity'
        ? t('games.tic_tac_toe_v1.lobby.infinityLabel')
        : t('games.tic_tac_toe_v1.lobby.maxPlayersShort', {
            n: String(MAX_PLAYERS_BY_BOARD_SIZE[size]),
          }),
  }));
  const marginItems = INFINITY_MARGIN_OPTIONS.map((m) => ({
    id: String(m),
    label: String(m),
    testId: `ttt-margin-${m}`,
  }));
  const winItems = INFINITY_WIN_LENGTH_OPTIONS.map((w) => ({
    id: String(w),
    label: t('games.tic_tac_toe_v1.lobby.inARow', { n: String(w) }),
    testId: `ttt-win-length-${w}`,
  }));

  return (
    <div data-testid="field-size-selector" className="flex flex-col gap-4">
      <LobbyOptionGroup title={t('games.tic_tac_toe_v1.lobby.boardSize')}>
        <LobbyChoice
          aria-label={t('games.tic_tac_toe_v1.lobby.boardSize')}
          items={sizeItems}
          value={String(internalSize)}
          disabled={disabled}
          onChange={(id) =>
            handlePick(
              id === 'infinity' ? 'infinity' : (Number(id) as BoardSize),
            )
          }
        />
      </LobbyOptionGroup>

      {isInfinity && (
        <div className="flex flex-col gap-4 rounded-xl border border-[var(--glassBorder)] bg-[var(--backgroundHover)] p-4">
          <LobbyOptionGroup
            title={t('games.tic_tac_toe_v1.lobby.expansionMargin')}
            hint={t('games.tic_tac_toe_v1.lobby.expansionMarginHint')}
          >
            <LobbyChoice
              aria-label={t('games.tic_tac_toe_v1.lobby.expansionMargin')}
              items={marginItems}
              value={String(internalMargin)}
              disabled={disabled}
              onChange={(id) =>
                handleMarginChange(Number(id) as InfinityMargin)
              }
            />
          </LobbyOptionGroup>
          <LobbyOptionGroup
            title={t('games.tic_tac_toe_v1.lobby.winLengthLabel')}
          >
            <LobbyChoice
              aria-label={t('games.tic_tac_toe_v1.lobby.winLengthLabel')}
              items={winItems}
              value={String(internalWinLength)}
              disabled={disabled}
              onChange={(id) =>
                handleWinLengthChange(Number(id) as InfinityWinLength)
              }
            />
          </LobbyOptionGroup>
        </div>
      )}
    </div>
  );
}
