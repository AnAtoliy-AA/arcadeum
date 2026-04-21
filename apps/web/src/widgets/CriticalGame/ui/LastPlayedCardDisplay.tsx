import React from 'react';
import type { CriticalCard } from '../types';
import { getCardTranslationKey } from '../lib/cardUtils';
import {
  LastPlayedCard,
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

interface LastPlayedCardDisplayProps {
  discardPile: CriticalCard[];
  t: (key: string) => string;
  cardVariant?: string;
}

export const LastPlayedCardDisplay: React.FC<LastPlayedCardDisplayProps> = ({
  discardPile,
  t,
  cardVariant,
}) => {
  const scene = useScenePalette();

  if (discardPile.length === 0) {
    return null;
  }

  const lastCard = discardPile[discardPile.length - 1];

  return (
    <LastPlayedCard
      data-testid="last-played-card"
      $cardType={lastCard}
      $isAnimating={false}
      $variant={cardVariant as GameVariant}
      style={{
        background: scene.lastPlayedGradient,
        boxShadow: `0 0 24px ${scene.lastPlayedHaloColor}`,
      }}
    >
      <CardImage variant={cardVariant ?? ''} cardType={lastCard as string} />
      <GradientScrim />
      <CardCorner $position="tl" $variant={cardVariant} />
      <CardCorner $position="tr" $variant={cardVariant} />
      <CardCorner $position="bl" $variant={cardVariant} />
      <CardCorner $position="br" $variant={cardVariant} />
      <CardFrame $variant={cardVariant} />
      <CardInner>
        <CardNameContainer $variant={cardVariant as GameVariant}>
          <CardName $variant={cardVariant}>
            {t(getCardTranslationKey(lastCard, cardVariant))}
          </CardName>
        </CardNameContainer>
      </CardInner>
    </LastPlayedCard>
  );
};
