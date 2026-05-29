'use client';
import { useEffect } from 'react';
import { YStack, Text } from 'tamagui';
import { Button, GlassCard } from '@arcadeum/ui';
import { useRouter } from 'next/navigation';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';

interface SeaBattlePopupProps {
  playerId: string;
  playerName: string;
  visible: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right';
  onClose?: () => void;
}

const POPUP_VISIBILITY_MS = 4000;

const POSITION_STYLES: Record<
  NonNullable<SeaBattlePopupProps['position']>,
  React.CSSProperties
> = {
  top: {
    bottom: 'calc(100% + 60px)',
    left: '50%',
    transform: 'translateX(-50%)',
  },
  bottom: {
    top: 'calc(100% + 60px)',
    left: '50%',
    transform: 'translateX(-50%)',
  },
  left: {
    right: 'calc(100% + 60px)',
    top: '50%',
    transform: 'translateY(-50%)',
  },
  right: {
    left: 'calc(100% + 60px)',
    top: '50%',
    transform: 'translateY(-50%)',
  },
};

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
    const isPlaywright =
      typeof window !== 'undefined' &&
      (window as unknown as { isPlaywright?: boolean }).isPlaywright;
    if (isPlaywright) return;
    const timer = setTimeout(() => onClose?.(), POPUP_VISIBILITY_MS);
    return () => clearTimeout(timer);
  }, [visible, onClose]);

  // Stop bubbling so clicking Challenge inside an OpponentTile (which
  // has role="button" + onPress for target selection) doesn't also arm
  // the player as an attack target — clicking the popup is unambiguously
  // a "go challenge" intent, not "arm target".
  const handleChallenge = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    router.push(
      `/games/create?gameId=sea_battle_v1&opponentId=${playerId}&opponentName=${encodeURIComponent(playerName)}`,
    );
    onClose?.();
  };

  if (!visible) return null;

  return (
    <YStack
      position="absolute"
      zIndex={200}
      alignItems="center"
      gap="$2"
      minWidth={120}
      style={POSITION_STYLES[position]}
      data-testid="sea-battle-popup-container"
    >
      <GlassCard padding="$3" alignItems="center" gap="$2" width="100%">
        <Text fontSize={24}>🚢</Text>
        <Text
          fontSize={11}
          fontWeight="600"
          color="$color"
          textAlign="center"
          opacity={0.9}
        >
          {t('games.sea_battle_v1.challengePlayer' as TranslationKey, {
            name: playerName,
          }) || `Challenge ${playerName}?`}
        </Text>
        <Button
          size="sm"
          width="100%"
          onClick={handleChallenge}
          data-testid="challenge-button"
          aria-label={
            t(
              'games.sea_battle_v1.table.actions.challenge' as TranslationKey,
            ) || 'Challenge'
          }
        >
          {t('games.sea_battle_v1.table.actions.challenge' as TranslationKey) ||
            'Challenge'}
        </Button>
      </GlassCard>
    </YStack>
  );
}
