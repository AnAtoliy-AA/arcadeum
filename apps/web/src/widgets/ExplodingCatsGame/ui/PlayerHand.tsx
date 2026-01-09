import React, { useMemo } from 'react';
import {
  ExplodingCatsPlayerState,
  ExplodingCatsCard,
  ExplodingCatsCatCard,
  ExplodingCatsLogEntry,
  CAT_CARDS,
  SPECIAL_CARDS,
} from '../types';
import {
  getCardEmoji,
  getCardTranslationKey,
  getCardDescriptionKey,
} from '../lib/cardUtils';
import { ActionsSection } from './ActionsSection';
import { AutoplayControls } from './AutoplayControls';
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
  ActionButton,
} from './styles';

interface PendingAction {
  type: string;
  playerId: string;
  payload?: unknown;
  nopeCount: number;
}

interface PendingFavor {
  requesterId: string;
  targetId: string;
}

interface PlayerHandProps {
  currentPlayer: ExplodingCatsPlayerState;
  isMyTurn: boolean;
  isGameOver: boolean;
  canAct: boolean;
  canPlayNope: boolean;
  actionBusy: boolean | string | null;
  aliveOpponents: ExplodingCatsPlayerState[];
  discardPileLength: number;
  logs: ExplodingCatsLogEntry[];
  pendingAction: PendingAction | null;
  pendingFavor: PendingFavor | null;
  pendingDefuse: string | null;
  deckSize: number;
  playerOrder: string[];
  currentUserId: string | null;
  allowActionCardCombos: boolean;
  t: (key: string) => string;
  onDraw: () => void;
  onPlayActionCard: (card: ExplodingCatsCard) => void;
  onPlayNope: () => void;
  onPlaySeeTheFuture: () => void;
  onOpenFavorModal: () => void;
  onGiveFavorCard: (card: ExplodingCatsCard) => void;
  onPlayDefuse: (position: number) => void;
  onOpenCatCombo: (
    cats: ExplodingCatsCatCard[],
    hand: ExplodingCatsCard[],
  ) => void;
  onOpenFiverCombo: () => void;
}

export const PlayerHand: React.FC<PlayerHandProps> = ({
  currentPlayer,
  isMyTurn,
  isGameOver,
  canAct,
  canPlayNope,
  actionBusy,
  aliveOpponents,
  discardPileLength,
  logs,
  pendingAction,
  pendingFavor,
  pendingDefuse,
  deckSize,
  playerOrder,
  currentUserId,
  allowActionCardCombos,
  t,
  onDraw,
  onPlayActionCard,
  onPlayNope,
  onPlaySeeTheFuture,
  onOpenFavorModal,
  onGiveFavorCard,
  onPlayDefuse,
  onOpenCatCombo,
  onOpenFiverCombo,
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
      {/* Autoplay Controls */}
      {!isGameOver && (
        <AutoplayControls
          isMyTurn={isMyTurn}
          canAct={canAct}
          canPlayNope={canPlayNope}
          hand={currentPlayer.hand}
          logs={logs}
          pendingAction={pendingAction}
          pendingFavor={pendingFavor}
          pendingDefuse={pendingDefuse}
          deckSize={deckSize}
          playerOrder={playerOrder}
          currentUserId={currentUserId}
          t={t}
          onDraw={onDraw}
          onPlayActionCard={onPlayActionCard}
          onPlayNope={onPlayNope}
          onGiveFavorCard={onGiveFavorCard}
          onPlayDefuse={onPlayDefuse}
        />
      )}

      {isMyTurn && !isGameOver && (
        <ActionsSection
          currentPlayer={currentPlayer}
          canAct={canAct}
          actionBusy={typeof actionBusy === 'boolean' ? null : actionBusy}
          hasOpponents={aliveOpponents.length > 0}
          discardPileLength={discardPileLength}
          allowActionCardCombos={allowActionCardCombos}
          onDraw={onDraw}
          onPlayActionCard={onPlayActionCard}
          onPlayNope={onPlayNope}
          onOpenFavorModal={onOpenFavorModal}
          onPlaySeeTheFuture={onPlaySeeTheFuture}
          onOpenCatCombo={(cats) => onOpenCatCombo(cats, currentPlayer.hand)}
          onOpenFiverCombo={onOpenFiverCombo}
          t={t}
        />
      )}

      {/* Show Nope button on other turns when there's a pending action */}
      {!isMyTurn && !isGameOver && canPlayNope && (
        <InfoCard>
          <InfoTitle>{t('games.table.actions.start') || 'Actions'}</InfoTitle>
          <ActionButton
            variant="secondary"
            onClick={onPlayNope}
            disabled={typeof actionBusy === 'string' && actionBusy === 'nope'}
          >
            {typeof actionBusy === 'string' && actionBusy === 'nope'
              ? 'Playing...'
              : t('games.table.actions.playNope') || '🚫 Nope'}
          </ActionButton>
        </InfoCard>
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
              // When allowActionCardCombos is enabled, any card except special cards can be used for combos
              const isComboableCard = allowActionCardCombos
                ? !SPECIAL_CARDS.includes(
                    card as (typeof SPECIAL_CARDS)[number],
                  )
                : isCatCard;
              const canPlayCombo =
                isComboableCard &&
                count >= 2 &&
                canAct &&
                aliveOpponents.length > 0;

              return (
                <Card
                  key={card}
                  $cardType={card}
                  $index={0}
                  onClick={() =>
                    canPlayCombo &&
                    onOpenCatCombo(
                      [card as ExplodingCatsCatCard],
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
