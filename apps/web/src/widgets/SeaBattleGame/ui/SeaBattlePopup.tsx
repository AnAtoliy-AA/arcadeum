'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import {
  PopupContainer,
  ChallengeButton,
  SeaBattleIcon,
  PopupTitle,
} from './styles/popup';

interface SeaBattlePopupProps {
  playerId: string;
  playerName: string;
  visible: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right';
  onClose?: () => void;
}

const POPUP_VISIBILITY_MS = 4000;

export function SeaBattlePopup({
  playerId,
  playerName,
  visible,
  position = 'top',
  onClose,
}: SeaBattlePopupProps) {
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => {
      onClose?.();
    }, POPUP_VISIBILITY_MS);
    return () => clearTimeout(timer);
  }, [visible, onClose]);

  const handleChallenge = () => {
    router.push(
      `/games/create?gameId=sea_battle_v1&opponentId=${playerId}&opponentName=${encodeURIComponent(playerName)}`,
    );
    onClose?.();
  };

  if (!visible) return null;

  return (
    <PopupContainer $visible={visible} $position={position}>
      <SeaBattleIcon>🚢</SeaBattleIcon>
      <PopupTitle>
        {t('games.sea_battle_v1.challengePlayer' as TranslationKey, {
          name: playerName,
        }) || `Challenge ${playerName}?`}
      </PopupTitle>
      <ChallengeButton onClick={handleChallenge}>
        {t('games.sea_battle_v1.table.actions.challenge' as TranslationKey) ||
          'Challenge'}
      </ChallengeButton>
    </PopupContainer>
  );
}
