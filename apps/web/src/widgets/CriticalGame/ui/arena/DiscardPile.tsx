'use client';

import { YStack, Text } from 'tamagui';
import { useTranslation } from '@/shared/lib/useTranslation';
import type { CriticalCard } from '../../types';
import { LastPlayedCardDisplay } from '../LastPlayedCardDisplay';
import { CardSlot } from '../styles';

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
      {/* `LastPlayedCardDisplay` renders `LastPlayedCard`, which is
          `position: absolute` with width/height 100%. Without a sized,
          positioned slot it expands to fill the nearest positioned
          ancestor and dominates the arena. `CardSlot` is what the legacy
          table layout uses for the same component. */}
      <CardSlot $role="lastPlayed">
        <LastPlayedCardDisplay
          discardPile={pile}
          t={tCompat}
          cardVariant={cardVariant}
        />
      </CardSlot>
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
