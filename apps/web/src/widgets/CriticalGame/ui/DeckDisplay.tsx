import React from 'react';
import type { CriticalCard } from '../types';
import { getCardTranslationKey } from '../lib/cardUtils';
import {
  LastPlayedCard,
  DeckCard,
  CardCorner,
  CardFrame,
  CardInner,
  CardName,
  CardNameContainer,
} from './styles';
import { CardImage } from './styles/card-image';
import { GradientScrim } from './styles/cards-base';
import { GameVariant } from '@arcadeum/ui';

interface DeckDisplayProps {
  deck: CriticalCard[];
  t: (key: string) => string;
  cardVariant?: string;
}

export const DeckDisplay: React.FC<DeckDisplayProps> = ({
  deck,
  t,
  cardVariant,
}) => {
  if (!deck || deck.length === 0) {
    return (
      <DeckCard
        $variant={cardVariant as GameVariant}
        style={{ opacity: 0.3, cursor: 'default' }}
      />
    );
  }

  const topCard = deck[0];

  if ((topCard as string) !== 'hidden') {
    // Show Face Up Card in the Deck Slot (some game variants allow this)
    return (
      <LastPlayedCard
        $isAnimating={false}
        $variant={cardVariant as GameVariant}
        style={{ position: 'relative' }} // Override absolute to stay in flow
      >
        <CardImage variant={cardVariant ?? ''} cardType={topCard as string} />
        <GradientScrim />
        <CardCorner $position="tl" $variant={cardVariant} />
        <CardCorner $position="tr" $variant={cardVariant} />
        <CardCorner $position="bl" $variant={cardVariant} />
        <CardCorner $position="br" $variant={cardVariant} />
        <CardFrame $variant={cardVariant} />
        <CardInner style={{ zIndex: 2 }}>
          <CardNameContainer $variant={cardVariant as GameVariant}>
            <CardName $variant={cardVariant}>
              {t(getCardTranslationKey(topCard, cardVariant))}
            </CardName>
          </CardNameContainer>
        </CardInner>
      </LastPlayedCard>
    );
  }

  // Show Face Down Deck with "Stacked" effect using shadow/border
  return (
    <DeckCard $variant={cardVariant as GameVariant}>
      <CardImage variant={cardVariant ?? ''} faceDown />
      <CardFrame $variant={cardVariant} />
    </DeckCard>
  );
};
