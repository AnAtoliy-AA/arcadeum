import React from 'react';
import type { CriticalCard } from '../types';
import { getCardEmoji, getCardTranslationKey } from '../lib/cardUtils';
import {
  LastPlayedCard,
  CardCorner,
  CardFrame,
  CardInner,
  CardEmoji,
  CardName,
} from './styles';

interface LastPlayedCardDisplayProps {
  discardPile: CriticalCard[];
  t: (key: string) => string;
}

export const LastPlayedCardDisplay: React.FC<LastPlayedCardDisplayProps> = ({
  discardPile,
  t,
}) => {
  if (discardPile.length === 0) {
    return null;
  }

  const lastCard = discardPile[discardPile.length - 1];

  return (
    <LastPlayedCard $cardType={lastCard} $isAnimating={false}>
      <CardCorner $position="tl" />
      <CardCorner $position="tr" />
      <CardCorner $position="bl" />
      <CardCorner $position="br" />
      <CardFrame />
      <CardInner>
        <CardEmoji>{getCardEmoji(lastCard)}</CardEmoji>
        <CardName>{t(getCardTranslationKey(lastCard))}</CardName>
      </CardInner>
    </LastPlayedCard>
  );
};
