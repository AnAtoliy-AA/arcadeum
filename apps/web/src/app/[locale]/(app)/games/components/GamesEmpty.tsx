'use client';

import { useTranslation } from '@/shared/lib/useTranslation';
import { QuickplayButton } from '@/features/games/ui/QuickplayButton';
import { YStack, XStack, Text } from 'tamagui';
import { Empty } from '../styles';

export function GamesEmpty() {
  const { t } = useTranslation();

  return (
    <Empty data-testid="games-empty">
      <YStack gap="$4" alignItems="center" justifyContent="center">
        <Text fontSize="$5" fontWeight="600" color="$color" textAlign="center">
          {t('games.lounge.emptyTitle')}
        </Text>
        <XStack gap="$3" flexWrap="wrap" justifyContent="center" marginTop="$2">
          <QuickplayButton
            gameId="chess_v1"
            mode="ai"
            label="Play Chess vs AI"
            buttonVariant="secondary"
          />
          <QuickplayButton
            gameId="checkers_v1"
            mode="ai"
            label="Play Checkers vs AI"
            buttonVariant="secondary"
          />
          <QuickplayButton
            gameId="sea_battle_v1"
            mode="ai"
            label="Play Sea Battle vs AI"
            buttonVariant="secondary"
          />
        </XStack>
      </YStack>
    </Empty>
  );
}
