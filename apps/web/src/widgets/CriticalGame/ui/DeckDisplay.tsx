import React from 'react';
import type { CriticalCard } from '../types';
import { getCardTranslationKey } from '../lib/cardUtils';
import {
  LastPlayedCard, // Reuse positioning/style if possible, or use DeckCard
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
    return <DeckCard style={{ opacity: 0.5, cursor: 'default' }} />;
  }

  const topCard = deck[0]; // Logic: line 58 of logic utils uses shift(), so 0 is top.

  if ((topCard as string) !== 'hidden') {
    // Show Face Up Card
    return (
      <LastPlayedCard
        $isAnimating={false}
        $variant={cardVariant as GameVariant}
        style={{ position: 'relative', transform: 'none', left: 'auto', top: 'auto', animation: 'none' }}
      >
        <CardImage variant={cardVariant ?? ''} cardType={topCard as string} />
        <GradientScrim />
        <CardCorner $position="tl" />
        <CardCorner $position="tr" />
        <CardCorner $position="bl" />
        <CardCorner $position="br" />
        <CardFrame />
        <CardInner style={{ zIndex: 2 }}>
          <CardNameContainer $variant={cardVariant as GameVariant}>
            <CardName>{t(getCardTranslationKey(topCard, cardVariant))}</CardName>
          </CardNameContainer>
        </CardInner>
      </LastPlayedCard>
    );
  }

  // Show Face Down Deck
  return (
    <DeckCard $variant={cardVariant as GameVariant}>
      <CardImage variant={cardVariant ?? ''} faceDown />
    </DeckCard>
  );
};
