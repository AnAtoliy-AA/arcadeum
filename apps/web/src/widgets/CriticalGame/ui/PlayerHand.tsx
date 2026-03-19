import React, { useCallback, useMemo, useState } from 'react';
import {
  CriticalPlayerState,
  CriticalCard,
  CriticalComboCard,
  CriticalLogEntry,
  COMBO_CARDS,
  SPECIAL_CARDS,
  HandLayoutMode,
  PendingAction,
  PendingFavor,
} from '../types';
import { PLAYABLE_ACTION_CARDS } from '../lib/constants';
import {
  getCardTranslationKey,
  getCardDescriptionKey,
} from '../lib/cardUtils';
import { CardImage } from './styles/card-image';
import { useCardFlip } from '../hooks/useCardFlip';
import { ActionsSection } from './ActionsSection';
import { HandLayoutDropdown } from './HandLayoutDropdown';

import {
  HandSection,
  HandContainer,
  HandCard,
  InfoCard,
  InfoTitle,
  CardsGrid,
  CardCorner,
  CardFrame,
  CardInner,
  GradientScrim,
  CardName,
  CardNameContainer,
  CardDescription,
  CardDescriptionContainer,
  CardCountBadge,
  ActionButton,
  StashedCard,
  StashIcon,
  HandHeader,
  HandTitle,
  HandControls,
  HandToggleButton,
} from './styles';

interface PlayerHandProps {
  currentPlayer: CriticalPlayerState;
  onUnstashCard?: (card: CriticalCard) => void;
  isMyTurn: boolean;
  isGameOver: boolean;
  canAct: boolean;
  canPlayNope: boolean;
  actionBusy: string | null;
  aliveOpponents: CriticalPlayerState[];
  discardPileLength: number;
  logs: CriticalLogEntry[];
  pendingAction: PendingAction | null;
  pendingFavor: PendingFavor | null;
  pendingDefuse: string | null;
  deckSize: number;
  playerOrder: string[];
  currentUserId: string | null;
  allowActionCardCombos: boolean;
  t: (key: string) => string;
  onDraw: () => void;
  onPlayActionCard: (card: CriticalCard) => void;
  onPlayNope: () => void;
  onPlaySeeTheFuture: () => void;
  onOpenFavorModal: () => void;
  onGiveFavorCard: (card: CriticalCard) => void;
  onPlayDefuse: (position: number) => void;
  onOpenEventCombo: (cards: CriticalComboCard[], hand: CriticalCard[]) => void;
  onOpenFiverCombo: () => void;
  forceEnableAutoplay?: boolean;
  onAutoplayEnabledChange?: (enabled: boolean) => void;
  cardVariant?: string;
  handLayout?: HandLayoutMode;
  setHandLayout?: (layout: HandLayoutMode) => void;
}

import { type GameVariant } from '@arcadeum/ui';

export function PlayerHand({
  currentPlayer,
  onUnstashCard,
  isMyTurn,
  isGameOver,
  canAct,
  canPlayNope,
  actionBusy,
  aliveOpponents,
  discardPileLength,
  logs: _logs,
  pendingAction: _pendingAction,
  pendingFavor: _pendingFavor,
  pendingDefuse: _pendingDefuse,
  deckSize: _deckSize,
  playerOrder: _playerOrder,
  currentUserId: _currentUserId,
  allowActionCardCombos,
  t,
  onDraw,
  onPlayActionCard,
  onPlayNope,
  onPlaySeeTheFuture,
  onOpenFavorModal,
  onGiveFavorCard: _onGiveFavorCard,
  onPlayDefuse: _onPlayDefuse,
  onOpenEventCombo,
  onOpenFiverCombo,
  forceEnableAutoplay: _forceEnableAutoplay,
  onAutoplayEnabledChange: _onAutoplayEnabledChange,
  cardVariant,
  handLayout = 'grid',
  setHandLayout,
}: PlayerHandProps) {
  const [showNames, setShowNames] = useState(true);
  const [showDescriptions, setShowDescriptions] = useState(true);

  // Group current hand by card type/count for rendering logic
  const groupedHand = useMemo(() => {
    const items: {
      card: CriticalCard;
      count: number;
      id: string;
    }[] = [];

    const handCounts = new Map<CriticalCard, number>();
    currentPlayer.hand.forEach((card: CriticalCard) =>
      handCounts.set(card, (handCounts.get(card) || 0) + 1),
    );

    const distinctCards = Array.from(handCounts.keys());

    distinctCards.forEach((card) => {
      items.push({
        card,
        count: handCounts.get(card) || 0,
        id: card,
      });
    });

    return items;
  }, [currentPlayer.hand]);

  const stashItems = useMemo(() => {
    const items: {
      card: CriticalCard;
      count: number;
      id: string;
    }[] = [];
    const stashCounts = new Map<CriticalCard, number>();
    (currentPlayer.stash || []).forEach((card: CriticalCard) =>
      stashCounts.set(card, (stashCounts.get(card) || 0) + 1),
    );
    Array.from(stashCounts.entries()).forEach(([card, count]) => {
      items.push({ card, count, id: `stash-${card}` });
    });
    return items;
  }, [currentPlayer.stash]);

  const distinctCardTypes = useMemo(
    () => groupedHand.map((item) => item.card),
    [groupedHand],
  );
  const { flippingCardType, showBack } = useCardFlip(distinctCardTypes);

  // Handle clicking on a card in hand
  const handleCardClick = useCallback(
    (card: CriticalCard, count: number) => {
      // Check if it's the player's turn and they can act
      if (!isMyTurn || isGameOver || !canAct) return;

      // Special handling for certain cards
      if (card === 'insight') {
        onPlaySeeTheFuture();
        return;
      }
      if (card === 'trade') {
        onOpenFavorModal();
        return;
      }
      if (card === 'cancel') {
        onPlayNope();
        return;
      }

      // Check if card can be played as a combo (2+ copies)
      const isComboCard = COMBO_CARDS.includes(card as CriticalComboCard);
      const isComboableCard = allowActionCardCombos
        ? !SPECIAL_CARDS.includes(card as (typeof SPECIAL_CARDS)[number])
        : isComboCard;

      if (isComboableCard && count >= 2 && aliveOpponents.length > 0) {
        onOpenEventCombo([card as CriticalComboCard], currentPlayer.hand);
        return;
      }

      // Check if it's a playable action card
      if (PLAYABLE_ACTION_CARDS.includes(card)) {
        onPlayActionCard(card);
        return;
      }
    },
    [
      isMyTurn,
      isGameOver,
      canAct,
      allowActionCardCombos,
      aliveOpponents.length,
      currentPlayer.hand,
      onPlaySeeTheFuture,
      onOpenFavorModal,
      onPlayNope,
      onOpenEventCombo,
      onPlayActionCard,
    ],
  );

  // Determine if a card is clickable
  const isCardClickable = useCallback(
    (card: CriticalCard, count: number): boolean => {
      if (!isMyTurn || isGameOver || !canAct) return false;

      // Special cards have specific handlers
      if (card === 'insight' || card === 'trade' || card === 'cancel')
        return true;

      // Combo cards with 2+ copies
      const isComboCard = COMBO_CARDS.includes(card as CriticalComboCard);
      const isComboableCard = allowActionCardCombos
        ? !SPECIAL_CARDS.includes(card as (typeof SPECIAL_CARDS)[number])
        : isComboCard;

      if (isComboableCard && count >= 2 && aliveOpponents.length > 0)
        return true;

      // Action cards
      if (PLAYABLE_ACTION_CARDS.includes(card)) return true;

      return false;
    },
    [
      isMyTurn,
      isGameOver,
      canAct,
      allowActionCardCombos,
      aliveOpponents.length,
    ],
  );

  return (
    <HandSection>
      {isMyTurn && !isGameOver && (
        <ActionsSection
          currentPlayer={currentPlayer}
          canAct={canAct}
          actionBusy={actionBusy}
          hasOpponents={aliveOpponents.length > 0}
          discardPileLength={discardPileLength}
          allowActionCardCombos={allowActionCardCombos}
          onDraw={onDraw}
          onPlayActionCard={onPlayActionCard}
          onPlayNope={onPlayNope}
          onOpenFavorModal={onOpenFavorModal}
          onPlaySeeTheFuture={onPlaySeeTheFuture}
          onOpenEventCombo={(cards) =>
            onOpenEventCombo(cards, currentPlayer.hand)
          }
          onOpenFiverCombo={onOpenFiverCombo}
          t={t}
          cardVariant={cardVariant}
        />
      )}

      {/* Show Nope button on other turns when there's a pending action */}
      {!isMyTurn && !isGameOver && canPlayNope && (
        <InfoCard>
          <InfoTitle>{t('games.table.actions.start') || 'Actions'}</InfoTitle>
          <ActionButton
            variant="secondary"
            onPress={onPlayNope}
            disabled={typeof actionBusy === 'string' && actionBusy === 'cancel'}
          >
            {typeof actionBusy === 'string' && actionBusy === 'cancel'
              ? 'Playing...'
              : t('games.table.actions.playNope') || '🚫 Nope'}
          </ActionButton>
        </InfoCard>
      )}

      <HandContainer>
        <InfoCard>
          <HandHeader>
            <HandTitle>
              {t('games.table.hand.title')} ({currentPlayer.hand.length}{' '}
              {currentPlayer.hand.length === 1
                ? t('games.table.state.card')
                : t('games.table.state.cards')}
              )
            </HandTitle>
            <HandControls>
              <HandToggleButton
                $variant={cardVariant as GameVariant}
                variant="secondary"
                onPress={() => setShowNames(!showNames)}
              >
                {showNames
                  ? t('games.table.hand.hideNames') || 'Hide Names'
                  : t('games.table.hand.showNames') || 'Show Names'}
              </HandToggleButton>
              <HandToggleButton
                $variant={cardVariant as GameVariant}
                variant="secondary"
                onPress={() => setShowDescriptions(!showDescriptions)}
              >
                {showDescriptions
                  ? t('games.table.hand.hideDescriptions') ||
                    'Hide Descriptions'
                  : t('games.table.hand.showDescriptions') ||
                    'Show Descriptions'}
              </HandToggleButton>
              {setHandLayout && (
                <HandLayoutDropdown
                  layout={handLayout}
                  onChange={setHandLayout}
                  variant={cardVariant as GameVariant}
                  t={t}
                />
              )}
            </HandControls>
          </HandHeader>

          <CardsGrid data-testid="hand-grid" $layout={handLayout}>
            {/* Render Stash first if any */}
            {stashItems.map(({ card, count, id }, idx) => (
              <StashedCard
                key={id}
                $cardType={card}
                $index={idx + 10}
                $variant={cardVariant as GameVariant}
                onPress={() => onUnstashCard?.(card)}
              >
                <StashIcon>🏰</StashIcon>
                <CardCorner $position="tl" />
                <CardCorner $position="tr" />
                <CardCorner $position="bl" />
                <CardCorner $position="br" />
                <CardFrame />
                <CardImage variant={cardVariant ?? ''} cardType={card} />
                <GradientScrim />
                <CardInner style={{ zIndex: 2 }}>
                  {showNames && (
                    <CardNameContainer $variant={cardVariant as GameVariant}>
                      <CardName $variant={cardVariant as GameVariant}>
                        {t(getCardTranslationKey(card, cardVariant)) || card}
                      </CardName>
                    </CardNameContainer>
                  )}
                  {showDescriptions && (
                    <CardDescriptionContainer
                      $variant={cardVariant as GameVariant}
                    >
                      <CardDescription $variant={cardVariant as GameVariant}>
                        {t(getCardDescriptionKey(card))}
                      </CardDescription>
                    </CardDescriptionContainer>
                  )}
                </CardInner>
                {count > 1 && <CardCountBadge>{count}</CardCountBadge>}
              </StashedCard>
            ))}

            {groupedHand.map(({ card, count, id }, idx) => {
              const isComboCard = COMBO_CARDS.includes(
                card as CriticalComboCard,
              );
              const clickable = isCardClickable(card, count);
              const dimmed = isComboCard && count === 1;
              const isFlipping = card === flippingCardType;

              return (
                <div
                  key={id}
                  style={isFlipping ? { perspective: '600px' } : undefined}
                >
                  <HandCard
                    $cardType={card}
                    $index={idx}
                    $variant={cardVariant as GameVariant}
                    $clickable={clickable}
                    $dimmed={dimmed}
                    onPress={() => handleCardClick(card, count)}
                    style={
                      isFlipping
                        ? {
                            transformStyle: 'preserve-3d',
                            animation: 'cardFlip 600ms ease-in-out',
                          }
                        : undefined
                    }
                  >
                    <CardCorner $position="tl" />
                    <CardCorner $position="tr" />
                    <CardCorner $position="bl" />
                    <CardCorner $position="br" />
                    <CardFrame />
                    <CardImage
                      variant={cardVariant ?? ''}
                      cardType={card}
                      faceDown={isFlipping ? showBack : false}
                    />
                      {showNames && (
                        <CardNameContainer $variant={cardVariant as GameVariant}>
                          <CardName $variant={cardVariant as GameVariant}>
                            {t(getCardTranslationKey(card, cardVariant)) ||
                              card}
                          </CardName>
                        </CardNameContainer>
                      )}
                      {showDescriptions && (
                        <CardDescriptionContainer
                          $variant={cardVariant as GameVariant}
                        >
                          <CardDescription
                            $variant={cardVariant as GameVariant}
                          >
                            {t(getCardDescriptionKey(card))}
                          </CardDescription>
                        </CardDescriptionContainer>
                      )}
                    {count > 1 && <CardCountBadge>{count}</CardCountBadge>}
                  </HandCard>
                </div>
              );
            })}
          </CardsGrid>
        </InfoCard>
      </HandContainer>
    </HandSection>
  );
}
