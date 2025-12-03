import { useMemo, useCallback } from 'react';
import { getRoomStatusLabel } from '../../../roomUtils';
import type { GameRoomSummary, GameSessionSummary } from '../../../api/gamesApi';
import type { ExplodingCatsCard } from '../types';
import {
  getCardTranslationKey,
  getCardDescriptionKey,
  getSessionStatusTranslationKey,
} from '../utils';

export function useGameLabels(
  t: (key: string, replacements?: Record<string, any>) => string,
  session: GameSessionSummary | null,
  room: GameRoomSummary | undefined,
  isHost: boolean,
  pendingDraws: number,
) {
  const translateCardName = useCallback(
    (card: ExplodingCatsCard) => t(getCardTranslationKey(card)),
    [t],
  );

  const translateCardDescription = useCallback(
    (card: ExplodingCatsCard) => t(getCardDescriptionKey(card)),
    [t],
  );

  const statusLabel = session?.status
    ? t(getSessionStatusTranslationKey(session.status))
    : t(
        getRoomStatusLabel(
          (room?.status ?? 'lobby') as GameRoomSummary['status'],
        ),
      );

  const placeholderText = `${t('games.table.placeholder.waiting')}${isHost ? ` ${t('games.table.placeholder.hostSuffix')}` : ''}`;

  const pendingDrawsLabel =
    pendingDraws > 0 ? pendingDraws : t('games.table.info.none');

  const pendingDrawsCaption =
    pendingDraws === 1
      ? t('games.table.info.pendingSingular')
      : t('games.table.info.pendingPlural');

  return {
    translateCardName,
    translateCardDescription,
    statusLabel,
    placeholderText,
    pendingDrawsLabel,
    pendingDrawsCaption,
  };
}
