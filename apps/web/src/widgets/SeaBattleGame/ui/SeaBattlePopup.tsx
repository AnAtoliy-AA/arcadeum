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

    // Don't auto-hide in E2E tests
    const isPlaywright =
      typeof window !== 'undefined' &&
      (window as unknown as { isPlaywright?: boolean }).isPlaywright;
    if (isPlaywright) return;

    const timer = setTimeout(() => {
      onClose?.();
    }, POPUP_VISIBILITY_MS);
    return () => clearTimeout(timer);
  }, [visible, onClose]);

  const handleChallenge = () => {
    const url = `/games/create?gameId=sea_battle_v1&opponentId=${playerId}&opponentName=${encodeURIComponent(playerName)}`;
    router.push(url);
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
      <ChallengeButton onClick={handleChallenge} data-testid="challenge-button">
        {t('games.sea_battle_v1.table.actions.challenge' as TranslationKey) ||
          'Challenge'}
      </ChallengeButton>
    </PopupContainer>
  );
}
