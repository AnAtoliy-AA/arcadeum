import React from 'react';
import type { CriticalCard } from '../types';
import { getCardEmoji, getCardTranslationKey } from '../lib/cardUtils';
import {
  LastPlayedCard, // Reuse positioning/style if possible, or use DeckCard
  DeckCard,
  CardCorner,
  CardFrame,
  CardInner,
  CardEmoji,
  CardName,
} from './styles';

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
        as="div"
        $isAnimating={false}
        style={{
          position: 'relative',
          transform: 'none',
          left: 'auto',
          top: 'auto',
          animation: 'none',
        }}
      >
        <CardCorner $position="tl" />
        <CardCorner $position="tr" />
        <CardCorner $position="bl" />
        <CardCorner $position="br" />
        <CardFrame />
        <CardInner>
          <CardEmoji>{getCardEmoji(topCard)}</CardEmoji>
          <CardName>{t(getCardTranslationKey(topCard, cardVariant))}</CardName>
        </CardInner>
      </LastPlayedCard>
    );
  }

  // Show Face Down Deck
  return <DeckCard />;
};
