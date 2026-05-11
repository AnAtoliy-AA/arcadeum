'use client';

import { YStack, Text } from 'tamagui';
import { useTranslation } from '@/shared/lib/useTranslation';
import type { CriticalCard } from '../../types';
import { LastPlayedCardDisplay } from '../LastPlayedCardDisplay';

interface DiscardPileProps {
  pile: CriticalCard[];
  cardVariant?: string;
}

export function DiscardPile({ pile, cardVariant }: DiscardPileProps) {
  const { t } = useTranslation();
  const count = pile.length;
  const tCompat = t as unknown as (key: string) => string;

  return (
    <YStack data-testid="arena-discard-pile" alignItems="center" gap="$1">
      <LastPlayedCardDisplay
        discardPile={pile}
        t={tCompat}
        cardVariant={cardVariant}
      />
      <Text
        data-testid="arena-discard-pile-count"
        fontSize={12}
        fontWeight="800"
        letterSpacing={0.4}
        opacity={0.85}
      >
        {t('games.table.state.discard')} · {count}
      </Text>
    </YStack>
  );
}
