import React, { useCallback, useMemo, useState } from 'react';
import { useMedia } from 'tamagui';
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
import { getCardTranslationKey, getCardDescriptionKey } from '../lib/cardUtils';
import { getCardRole } from '../lib/cardRoles';
import { getFanTransform } from '../lib/handLayout';
import { CardImage } from './styles/card-image';
import { useCardFlip } from '../hooks/useCardFlip';
import { useScenePalette } from './ScenePaletteContext';
import { ActionsSection } from './ActionsSection';
import { MobileHandPopover } from './MobileHandPopover';
import { HandControlsPanel } from './HandControlsPanel';
import { MobileActionBar } from './MobileActionBar';

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
} from './styles';

import { type GameVariant } from '@arcadeum/ui';

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
  const [selectedCardId, setSelectedCardId] = useState<CriticalCard | null>(
    null,
  );
  const scene = useScenePalette();
  const media = useMedia();
  const isMobile = media.sm;
  const isXs = media.xs;
  const handSize = isMobile ? 'mobileFlat' : 'desktopFan';
  const isFanned = !isMobile && handLayout === 'grid';
  const effectiveLayout: HandLayoutMode = isXs ? 'linear' : handLayout;

  const activeSelectedCardId =
    selectedCardId && currentPlayer.hand.includes(selectedCardId)
      ? selectedCardId
      : null;

  const groupedHand = useMemo(() => {
    const counts = new Map<CriticalCard, number>();
    currentPlayer.hand.forEach((card: CriticalCard) =>
      counts.set(card, (counts.get(card) || 0) + 1),
    );
    return Array.from(counts.entries()).map(([card, count]) => ({
      card,
      count,
      id: card,
    }));
  }, [currentPlayer.hand]);

  const stashItems = useMemo(() => {
    const counts = new Map<CriticalCard, number>();
    (currentPlayer.stash || []).forEach((card: CriticalCard) =>
      counts.set(card, (counts.get(card) || 0) + 1),
    );
    return Array.from(counts.entries()).map(([card, count]) => ({
      card,
      count,
      id: `stash-${card}`,
    }));
  }, [currentPlayer.stash]);

  const distinctCardTypes = useMemo(
    () => groupedHand.map((item) => item.card),
    [groupedHand],
  );
  const { flippingCardType, showBack } = useCardFlip(distinctCardTypes);

  const handleCardClick = useCallback(
    (card: CriticalCard, count: number) => {
      if (!isMyTurn || isGameOver || !canAct) return;

      if (isMobile) {
        setSelectedCardId((prev) => (prev === card ? null : card));
        return;
      }

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

      const isComboCard = COMBO_CARDS.includes(card as CriticalComboCard);
      const isComboableCard = allowActionCardCombos
        ? !SPECIAL_CARDS.includes(card as (typeof SPECIAL_CARDS)[number])
        : isComboCard;

      if (isComboableCard && count >= 2 && aliveOpponents.length > 0) {
        onOpenEventCombo([card as CriticalComboCard], currentPlayer.hand);
        return;
      }

      if (PLAYABLE_ACTION_CARDS.includes(card)) {
        onPlayActionCard(card);
        return;
      }
    },
    [
      isMobile,
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

  const isCardClickable = useCallback(
    (card: CriticalCard, count: number): boolean => {
      if (!isMyTurn || isGameOver || !canAct) return false;

      if (card === 'insight' || card === 'trade' || card === 'cancel')
        return true;

      const isComboCard = COMBO_CARDS.includes(card as CriticalComboCard);
      const isComboableCard = allowActionCardCombos
        ? !SPECIAL_CARDS.includes(card as (typeof SPECIAL_CARDS)[number])
        : isComboCard;

      if (isComboableCard && count >= 2 && aliveOpponents.length > 0)
        return true;

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
      {isMyTurn && !isGameOver && !isMobile && (
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

      {!isMyTurn && !isGameOver && canPlayNope && !isMobile && (
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
            <HandControlsPanel
              showNames={showNames}
              showDescriptions={showDescriptions}
              handLayout={handLayout}
              setShowNames={setShowNames}
              setShowDescriptions={setShowDescriptions}
              setHandLayout={isXs ? undefined : setHandLayout}
              cardVariant={cardVariant}
              t={t}
            />
          </HandHeader>

          <CardsGrid data-testid="hand-grid" $layout={effectiveLayout}>
            {stashItems.map(({ card, count, id }, idx) => (
              <StashedCard
                key={id}
                $cardType={card}
                $index={idx + 10}
                $variant={cardVariant as GameVariant}
                onClick={() => onUnstashCard?.(card)}
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
              const role = getCardRole(card);
              const roleGradient = scene.handColorByRole[role];
              const fan = isFanned
                ? getFanTransform(idx, groupedHand.length)
                : null;
              const wrapperStyle: React.CSSProperties = {
                ...(isFlipping ? { perspective: '600px' } : {}),
                ...(fan
                  ? {
                      marginLeft: idx === 0 ? 0 : -20,
                      zIndex: idx,
                    }
                  : {}),
              };
              const cardStyle: React.CSSProperties = {
                background: roleGradient,
                ...(fan
                  ? {
                      transform: `rotate(${fan.angle}deg) translateY(${fan.offsetY}px)`,
                      transformOrigin: 'bottom center',
                    }
                  : {}),
                ...(isFlipping
                  ? {
                      transformStyle: 'preserve-3d',
                      animation: 'cardFlip 600ms ease-in-out',
                    }
                  : {}),
              };

              return (
                <div key={id} style={wrapperStyle}>
                  <HandCard
                    data-cardtype={card}
                    $cardType={card}
                    $index={idx}
                    $size={handSize}
                    $variant={cardVariant as GameVariant}
                    $clickable={clickable}
                    $dimmed={dimmed}
                    onClick={() => handleCardClick(card, count)}
                    style={cardStyle}
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
                    {count > 1 && <CardCountBadge>{count}</CardCountBadge>}
                  </HandCard>
                </div>
              );
            })}
          </CardsGrid>
        </InfoCard>

        {isMobile && (
          <MobileHandPopover
            selectedCard={activeSelectedCardId}
            count={
              activeSelectedCardId
                ? (groupedHand.find(({ card }) => card === activeSelectedCardId)
                    ?.count ?? 0)
                : 0
            }
            isMyTurn={isMyTurn}
            canAct={canAct}
            allowActionCardCombos={allowActionCardCombos}
            hasOpponents={aliveOpponents.length > 0}
            cardVariant={cardVariant}
            hand={currentPlayer.hand}
            t={t}
            onPlaySeeTheFuture={onPlaySeeTheFuture}
            onOpenFavorModal={onOpenFavorModal}
            onPlayNope={onPlayNope}
            onPlayActionCard={onPlayActionCard}
            onOpenEventCombo={onOpenEventCombo}
            onClose={() => setSelectedCardId(null)}
          />
        )}
      </HandContainer>

      <MobileActionBar
        isMyTurn={isMyTurn}
        isGameOver={isGameOver}
        canAct={canAct}
        canPlayNope={canPlayNope}
        actionBusy={actionBusy}
        cardVariant={cardVariant}
        t={t}
        onDraw={onDraw}
        onPlayNope={onPlayNope}
      />
    </HandSection>
  );
}
