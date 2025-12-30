import React, { useMemo } from 'react';
import {
  ExplodingCatsPlayerState,
  ExplodingCatsCard,
  ExplodingCatsCatCard,
  CAT_CARDS,
} from '../types';
import {
  getCardEmoji,
  getCardTranslationKey,
  getCardDescriptionKey,
} from '../lib/cardUtils';
import { ActionsSection } from './ActionsSection';
import {
  HandSection,
  HandContainer,
  InfoCard,
  InfoTitle,
  CardsGrid,
  Card,
  CardCorner,
  CardFrame,
  CardInner,
  CardEmoji,
  CardName,
  CardDescription,
  CardCountBadge,
} from './styles';

interface PlayerHandProps {
  currentPlayer: ExplodingCatsPlayerState;
  isMyTurn: boolean;
  isGameOver: boolean;
  canAct: boolean;
  actionBusy: boolean | string | null;
  aliveOpponents: ExplodingCatsPlayerState[];
  t: (key: string) => string;
  onDraw: () => void;
  onPlayActionCard: (card: ExplodingCatsCard) => void;
  onPlayNope: () => void;
  onPlaySeeTheFuture: () => void;
  onOpenFavorModal: () => void;
  onOpenCatCombo: (
    card: ExplodingCatsCatCard,
    hand: ExplodingCatsCard[],
  ) => void;
}

export const PlayerHand: React.FC<PlayerHandProps> = ({
  currentPlayer,
  isMyTurn,
  isGameOver,
  canAct,
  actionBusy,
  aliveOpponents,
  t,
  onDraw,
  onPlayActionCard,
  onPlayNope,
  onPlaySeeTheFuture,
  onOpenFavorModal,
  onOpenCatCombo,
}) => {
  const { uniqueCards, cardCounts } = useMemo(() => {
    const unique = Array.from(new Set(currentPlayer.hand));
    const counts = new Map<ExplodingCatsCard, number>();
    currentPlayer.hand.forEach((card) =>
      counts.set(card, (counts.get(card) || 0) + 1),
    );
    return { uniqueCards: unique, cardCounts: counts };
  }, [currentPlayer.hand]);

  return (
    <HandSection>
      {isMyTurn && !isGameOver && (
        <ActionsSection
          currentPlayer={currentPlayer}
          canAct={canAct}
          actionBusy={typeof actionBusy === 'boolean' ? null : actionBusy}
          onDraw={onDraw}
          onPlayActionCard={onPlayActionCard}
          onPlayNope={onPlayNope}
          onOpenFavorModal={onOpenFavorModal}
          onPlaySeeTheFuture={onPlaySeeTheFuture}
          t={t}
        />
      )}

      <HandContainer>
        <InfoCard>
          <InfoTitle>
            {t('games.table.hand.title')} ({currentPlayer.hand.length}{' '}
            {currentPlayer.hand.length === 1
              ? t('games.table.state.card')
              : t('games.table.state.cards')}
            )
          </InfoTitle>
          <CardsGrid>
            {uniqueCards.map((card) => {
              const count = cardCounts.get(card) || 1;
              const isCatCard = CAT_CARDS.includes(
                card as ExplodingCatsCatCard,
              );
              const canPlayCombo =
                isCatCard && count >= 2 && canAct && aliveOpponents.length > 0;

              return (
                <Card
                  key={card}
                  $cardType={card}
                  $index={0}
                  onClick={() =>
                    canPlayCombo &&
                    onOpenCatCombo(
                      card as ExplodingCatsCatCard,
                      currentPlayer.hand,
                    )
                  }
                  style={{
                    cursor: canPlayCombo ? 'pointer' : 'default',
                    opacity: canPlayCombo
                      ? 1
                      : isCatCard && count === 1
                        ? 0.7
                        : 1,
                  }}
                >
                  <CardCorner $position="tl" />
                  <CardCorner $position="tr" />
                  <CardCorner $position="bl" />
                  <CardCorner $position="br" />
                  <CardFrame />
                  <CardInner>
                    <CardEmoji>{getCardEmoji(card)}</CardEmoji>
                    <CardName>
                      {t(getCardTranslationKey(card)) || card}
                    </CardName>
                    <CardDescription>
                      {t(getCardDescriptionKey(card))}
                    </CardDescription>
                  </CardInner>
                  {count > 1 && <CardCountBadge>{count}</CardCountBadge>}
                </Card>
              );
            })}
          </CardsGrid>
        </InfoCard>
      </HandContainer>
    </HandSection>
  );
};
