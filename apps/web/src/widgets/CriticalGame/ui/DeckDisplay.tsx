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
import { useScenePalette } from './ScenePaletteContext';
import type { GameVariant } from '@arcadeum/ui';

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
  const scene = useScenePalette();
  const deckStyle = {
    background: scene.deckGradient,
    boxShadow: scene.deckGlow,
  };

  if (!deck || deck.length === 0) {
    return (
      <DeckCard
        data-testid="deck-card"
        $variant={cardVariant as GameVariant}
        style={{ ...deckStyle, opacity: 0.3, cursor: 'default' }}
      />
    );
  }

  const topCard = deck[0];

  if ((topCard as string) !== 'hidden') {
    // Show Face Up Card in the Deck Slot (some game variants allow this)
    return (
      <LastPlayedCard
        data-testid="deck-card"
        $isAnimating={false}
        $variant={cardVariant as GameVariant}
        style={{ ...deckStyle, position: 'relative' }}
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
    <DeckCard
      data-testid="deck-card"
      $variant={cardVariant as GameVariant}
      style={deckStyle}
    >
      <CardImage variant={cardVariant ?? ''} faceDown />
      <CardFrame $variant={cardVariant} />
    </DeckCard>
  );
};
