import React, { useCallback, useMemo, useState } from 'react';
import {
  CriticalPlayerState,
  CriticalCard,
  CriticalCatCard,
  CriticalLogEntry,
  CAT_CARDS,
  SPECIAL_CARDS,
  BASE_ACTION_CARDS,
  ATTACK_PACK_CARDS,
  FUTURE_PACK_CARDS,
  THEFT_PACK_CARDS,
  DEITY_PACK_CARDS,
} from '../types';
import {
  getCardEmoji,
  getCardTranslationKey,
  getCardDescriptionKey,
} from '../lib/cardUtils';

// All playable action cards (single click to play)
// Note: 'wildcard' is excluded as it's used in combos, not played directly
const PLAYABLE_ACTION_CARDS: CriticalCard[] = [
  ...BASE_ACTION_CARDS.filter((c) => c !== 'cancel'), // cancel handled separately via onPlayNope
  ...ATTACK_PACK_CARDS,
  ...FUTURE_PACK_CARDS,
  ...THEFT_PACK_CARDS.filter((c) => c !== 'wildcard'), // wildcard used in combos
  ...DEITY_PACK_CARDS,
];
import { ActionsSection } from './ActionsSection';

import {
  HandSection,
  HandContainer,
  HandCard,
  DropdownContainer,
  DropdownTrigger,
  DropdownList,
  DropdownItem,
  InfoCard,
  InfoTitle,
  CardsGrid,
  CardCorner,
  CardFrame,
  CardInner,
  CardEmoji,
  CardName,
  CardDescription,
  CardCountBadge,
  ActionButton,
  StashedCard,
  StashIcon,
  HandHeader,
  HandTitle,
  HandControls,
  HandToggleButton,
} from './styles';

export type HandLayoutMode = 'grid' | 'linear';

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
  currentPlayer: CriticalPlayerState;
  onUnstashCard?: (card: CriticalCard) => void;
  isMyTurn: boolean;
  isGameOver: boolean;
  canAct: boolean;
  canPlayNope: boolean;
  actionBusy: boolean | string | null;
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
  onOpenCatCombo: (cats: CriticalCatCard[], hand: CriticalCard[]) => void;
  onOpenFiverCombo: () => void;
  forceEnableAutoplay?: boolean;
  onAutoplayEnabledChange?: (enabled: boolean) => void;
  cardVariant?: string;
  handLayout?: HandLayoutMode;
  setHandLayout?: (layout: HandLayoutMode) => void;
}

const HandLayoutDropdown: React.FC<{
  layout: HandLayoutMode;
  onChange: (layout: HandLayoutMode) => void;
  variant?: string;
  t: (key: string) => string;
}> = ({ layout, onChange, variant, t }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Close on outside click is handled by a backdrop or just simple onBlur
  // Here we'll use a simple backdrop for simplicity if open

  return (
    <DropdownContainer>
      {isOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 99 }}
          onClick={() => setIsOpen(false)}
        />
      )}
      <DropdownTrigger
        $variant={variant}
        $isOpen={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        {layout === 'grid'
          ? t('games.table.hand.layout.grid') || 'Grid'
          : t('games.table.hand.layout.scroll') || 'Scroll'}
      </DropdownTrigger>
      {isOpen && (
        <DropdownList $variant={variant}>
          <DropdownItem
            $variant={variant}
            $isActive={layout === 'grid'}
            onClick={() => {
              onChange('grid');
              setIsOpen(false);
            }}
          >
            {t('games.table.hand.layout.grid') || 'Grid'}
          </DropdownItem>
          <DropdownItem
            $variant={variant}
            $isActive={layout === 'linear'}
            onClick={() => {
              onChange('linear');
              setIsOpen(false);
            }}
          >
            {t('games.table.hand.layout.scroll') || 'Scroll'}
          </DropdownItem>
        </DropdownList>
      )}
    </DropdownContainer>
  );
};

export const PlayerHand: React.FC<PlayerHandProps> = ({
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
  onOpenCatCombo,
  onOpenFiverCombo,
  forceEnableAutoplay: _forceEnableAutoplay,
  onAutoplayEnabledChange: _onAutoplayEnabledChange,
  cardVariant,
  handLayout = 'grid',
  setHandLayout,
}) => {
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
    currentPlayer.hand.forEach((card) =>
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
    (currentPlayer.stash || []).forEach((card) =>
      stashCounts.set(card, (stashCounts.get(card) || 0) + 1),
    );
    Array.from(stashCounts.entries()).forEach(([card, count]) => {
      items.push({ card, count, id: `stash-${card}` });
    });
    return items;
  }, [currentPlayer.stash]);

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
      const isCatCard = CAT_CARDS.includes(card as CriticalCatCard);
      const isComboableCard = allowActionCardCombos
        ? !SPECIAL_CARDS.includes(card as (typeof SPECIAL_CARDS)[number])
        : isCatCard;

      if (isComboableCard && count >= 2 && aliveOpponents.length > 0) {
        onOpenCatCombo([card as CriticalCatCard], currentPlayer.hand);
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
      onOpenCatCombo,
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
      const isCatCard = CAT_CARDS.includes(card as CriticalCatCard);
      const isComboableCard = allowActionCardCombos
        ? !SPECIAL_CARDS.includes(card as (typeof SPECIAL_CARDS)[number])
        : isCatCard;

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
          cardVariant={cardVariant}
        />
      )}

      {/* Show Nope button on other turns when there's a pending action */}
      {!isMyTurn && !isGameOver && canPlayNope && (
        <InfoCard>
          <InfoTitle>{t('games.table.actions.start') || 'Actions'}</InfoTitle>
          <ActionButton
            variant="secondary"
            onClick={onPlayNope}
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
                $variant={cardVariant}
                variant="secondary"
                onClick={() => setShowNames(!showNames)}
              >
                {showNames
                  ? t('games.table.hand.hideNames') || 'Hide Names'
                  : t('games.table.hand.showNames') || 'Show Names'}
              </HandToggleButton>
              <HandToggleButton
                $variant={cardVariant}
                variant="secondary"
                onClick={() => setShowDescriptions(!showDescriptions)}
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
                  variant={cardVariant}
                  t={t}
                />
              )}
            </HandControls>
          </HandHeader>

          <CardsGrid $layout={handLayout}>
            {/* Render Stash first if any */}
            {stashItems.map(({ card, count, id }, idx) => (
              <StashedCard
                key={id}
                $cardType={card}
                $index={idx + 10}
                $variant={cardVariant}
                onClick={() => onUnstashCard?.(card)}
                title="Stashed card - Click to return to hand"
              >
                <StashIcon>🏰</StashIcon>
                <CardCorner $position="tl" />
                <CardCorner $position="tr" />
                <CardCorner $position="bl" />
                <CardCorner $position="br" />
                <CardFrame />
                <CardInner>
                  <CardEmoji>{getCardEmoji(card)}</CardEmoji>
                  {showNames && (
                    <CardName $variant={cardVariant}>
                      {t(getCardTranslationKey(card, cardVariant)) || card}
                    </CardName>
                  )}
                  {showDescriptions && (
                    <CardDescription $variant={cardVariant}>
                      {t(getCardDescriptionKey(card))}
                    </CardDescription>
                  )}
                </CardInner>
                {count > 1 && <CardCountBadge>{count}</CardCountBadge>}
              </StashedCard>
            ))}

            {groupedHand.map(({ card, count, id }, idx) => {
              const isCatCard = CAT_CARDS.includes(card as CriticalCatCard);
              const clickable = isCardClickable(card, count);
              const dimmed = isCatCard && count === 1;

              return (
                <HandCard
                  key={id}
                  $cardType={card}
                  $index={idx}
                  $variant={cardVariant}
                  $clickable={clickable}
                  $dimmed={dimmed}
                  onClick={() => handleCardClick(card, count)}
                >
                  <CardCorner $position="tl" />
                  <CardCorner $position="tr" />
                  <CardCorner $position="bl" />
                  <CardCorner $position="br" />
                  <CardFrame />
                  <CardInner>
                    <CardEmoji>{getCardEmoji(card)}</CardEmoji>
                    {showNames && (
                      <CardName $variant={cardVariant}>
                        {t(getCardTranslationKey(card, cardVariant)) || card}
                      </CardName>
                    )}
                    {showDescriptions && (
                      <CardDescription $variant={cardVariant}>
                        {t(getCardDescriptionKey(card))}
                      </CardDescription>
                    )}
                  </CardInner>
                  {count > 1 && <CardCountBadge>{count}</CardCountBadge>}
                </HandCard>
              );
            })}
          </CardsGrid>
        </InfoCard>
      </HandContainer>
    </HandSection>
  );
};
