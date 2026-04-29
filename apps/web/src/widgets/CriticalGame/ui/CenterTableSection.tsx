import React from 'react';
import { YStack, Text } from 'tamagui';
import { CenterTable, CenterTableRow, CardSlot, DeckCard } from './styles';
import { LastPlayedCardDisplay } from './LastPlayedCardDisplay';
import { DeckDisplay } from './DeckDisplay';
import type { GameVariant } from '@arcadeum/ui';
import type { CriticalCard } from '../types';

interface CenterTableSectionProps {
  discardPile: CriticalCard[];
  deck: CriticalCard[];
  cardVariant?: string;
  t: (key: string) => string;
}

export function CenterTableSection({
  discardPile,
  deck,
  cardVariant,
  t,
}: CenterTableSectionProps) {
  const variant = cardVariant as GameVariant;
  return (
    <>
      <CenterTable $variant={variant}>
        <CardSlot $role="lastPlayed">
          <LastPlayedCardDisplay
            discardPile={discardPile}
            t={t}
            cardVariant={cardVariant}
          />
        </CardSlot>
        <CardSlot $role="deck">
          <DeckDisplay deck={deck} t={t} cardVariant={cardVariant} />
        </CardSlot>
      </CenterTable>

      <CenterTableRow data-testid="center-table-row">
        <YStack alignItems="center" gap="$1">
          <CardSlot $role="deck">
            <DeckDisplay deck={deck} t={t} cardVariant={cardVariant} />
          </CardSlot>
          <Text fontSize={11} opacity={0.7}>
            {t('games.table.state.deck') || 'Deck'} · {deck.length}
          </Text>
        </YStack>

        <YStack alignItems="center" gap="$1">
          <CardSlot $role="lastPlayed">
            <LastPlayedCardDisplay
              discardPile={discardPile}
              t={t}
              cardVariant={cardVariant}
            />
          </CardSlot>
        </YStack>

        <YStack alignItems="center" gap="$1">
          <CardSlot $role="deck">
            <DeckCard $variant={variant} />
          </CardSlot>
          <Text fontSize={11} opacity={0.7}>
            {t('games.table.state.discard') || 'Discard'} · {discardPile.length}
          </Text>
        </YStack>
      </CenterTableRow>
    </>
  );
}
