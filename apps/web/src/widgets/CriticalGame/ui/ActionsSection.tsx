'use client';

import { useMemo, useState } from 'react';
import type {
  CriticalPlayerState,
  CriticalCard,
  CriticalComboCard,
} from '../types';
import { getCardName } from '../lib/cardUtils';
import { COMBO_CARDS, FIVER_COMBO_SIZE, SPECIAL_CARDS } from '../types';
import {
  InfoCard,
  InfoTitle,
  ActionButtons,
  ActionButton,
  ActionsHeader,
  ActionsToggleButton,
} from './styles';
import { ExpansionActions } from './ExpansionActions';
import type { GameVariant } from '@arcadeum/ui';

export type ActionBusyState =
  | 'draw'
  | 'evade'
  | 'strike'
  | 'reorder'
  | 'trade'
  | 'insight'
  | 'cancel'
  | 'neutralizer'
  | 'event_combo'
  | 'event_combo_fiver'
  | 'mark'
  | 'steal_draw'
  | 'stash'
  | 'omniscience'
  | 'miracle'
  | 'smite'
  | 'rapture'
  | null;

interface ActionsSectionProps {
  currentPlayer: CriticalPlayerState;
  canAct: boolean | undefined;
  actionBusy: ActionBusyState | string | null;
  hasOpponents: boolean;
  discardPileLength: number;
  allowActionCardCombos: boolean;
  onDraw: () => void;
  onPlayActionCard: (card: CriticalCard) => void;
  onPlayNope: () => void;
  onOpenFavorModal: () => void;
  onPlaySeeTheFuture: () => void;
  onOpenEventCombo: (cards: CriticalComboCard[]) => void;
  onOpenFiverCombo: () => void;
  t: (key: string) => string;
  cardVariant?: string;
}

export function ActionsSection({
  currentPlayer,
  canAct,
  actionBusy,
  hasOpponents,
  discardPileLength,
  allowActionCardCombos,
  onDraw,
  onPlayActionCard,
  onPlayNope,
  onOpenFavorModal,
  onPlaySeeTheFuture,
  onOpenEventCombo,
  onOpenFiverCombo,
  t,
  cardVariant,
}: ActionsSectionProps) {
  // Find all cards with 2+ copies (combos available)
  const availableCombos = useMemo(() => {
    const cardCounts = new Map<CriticalCard, number>();
    currentPlayer.hand.forEach((card) =>
      cardCounts.set(card, (cardCounts.get(card) || 0) + 1),
    );

    // When allowActionCardCombos is enabled, include any cards with 2+ copies (except special cards)
    if (allowActionCardCombos) {
      return Array.from(cardCounts.entries())
        .filter(
          ([card, count]) =>
            count >= 2 &&
            !SPECIAL_CARDS.includes(card as (typeof SPECIAL_CARDS)[number]),
        )
        .map(([card]) => card as CriticalComboCard);
    }

    return COMBO_CARDS.filter((card) => (cardCounts.get(card) || 0) >= 2);
  }, [currentPlayer.hand, allowActionCardCombos]);

  // Check if fiver combo is available (FIVER_COMBO_SIZE+ unique cards and non-empty discard pile)
  const fiverAvailable = useMemo(() => {
    const uniqueCards = new Set(currentPlayer.hand);
    return uniqueCards.size >= FIVER_COMBO_SIZE && discardPileLength > 0;
  }, [currentPlayer.hand, discardPileLength]);

  const canPlayCombo = availableCombos.length > 0 && hasOpponents && canAct;

  const [showActions, setShowActions] = useState(true);

  return (
    <InfoCard>
      <ActionsHeader>
        <InfoTitle>{t('games.table.actions.start') || 'Actions'}</InfoTitle>
        <ActionsToggleButton
          $variant={cardVariant as GameVariant}
          onClick={() => setShowActions(!showActions)}
          title={showActions ? 'Hide Actions' : 'Show Actions'}
        >
          {showActions ? '−' : '+'}
        </ActionsToggleButton>
      </ActionsHeader>

      {showActions && (
        <ActionButtons>
          <ActionButton
            $variant={cardVariant as GameVariant}
            onClick={onDraw}
            data-testid="draw-card-button"
            disabled={
              !canAct ||
              [
                'draw',
                'cancel',
                'insight',
                'trade',
                'nope',
                'see_the_future',
                'favor',
              ].includes(actionBusy as string)
            }
          >
            {actionBusy === 'draw'
              ? t('games.table.actions.drawing') || 'Drawing...'
              : t('games.table.actions.draw') || 'Draw Card'}
          </ActionButton>
          {currentPlayer.hand.includes('evade') && (
            <ActionButton
              $variant={cardVariant as GameVariant}
              variant="secondary"
              onClick={() => onPlayActionCard('evade')}
              data-testid="play-evade-button"
              disabled={!canAct || actionBusy === 'evade'}
            >
              {actionBusy === 'evade'
                ? 'Playing...'
                : `Play ${getCardName('evade', cardVariant || 'adventure')}`}
            </ActionButton>
          )}
          {currentPlayer.hand.includes('strike') && (
            <ActionButton
              $variant={cardVariant as GameVariant}
              variant="danger"
              onClick={() => onPlayActionCard('strike')}
              data-testid="play-strike-button"
              disabled={!canAct || actionBusy === 'strike'}
            >
              {actionBusy === 'strike'
                ? 'Playing...'
                : `Play ${getCardName('strike', cardVariant || 'adventure')}`}
            </ActionButton>
          )}
          {currentPlayer.hand.includes('reorder') && (
            <ActionButton
              $variant={cardVariant as GameVariant}
              variant="secondary"
              onClick={() => onPlayActionCard('reorder')}
              disabled={!canAct || actionBusy === 'reorder'}
            >
              {actionBusy === 'reorder'
                ? 'Playing...'
                : `🔀 ${getCardName('reorder', cardVariant || 'adventure')}`}
            </ActionButton>
          )}
          {currentPlayer.hand.includes('cancel') && (
            <ActionButton
              $variant={cardVariant as GameVariant}
              variant="secondary"
              onClick={onPlayNope}
              disabled={!canAct || actionBusy === 'nope'}
            >
              {actionBusy === 'nope'
                ? 'Playing...'
                : `🚫 ${getCardName('cancel', cardVariant || 'adventure')}`}
            </ActionButton>
          )}
          {currentPlayer.hand.includes('trade') && (
            <ActionButton
              $variant={cardVariant as GameVariant}
              variant="primary"
              onClick={onOpenFavorModal}
              disabled={!canAct || actionBusy === 'favor'}
            >
              {actionBusy === 'favor'
                ? 'Playing...'
                : `🤝 ${getCardName('trade', cardVariant || 'adventure')}`}
            </ActionButton>
          )}
          {currentPlayer.hand.includes('insight') && (
            <ActionButton
              $variant={cardVariant as GameVariant}
              variant="primary"
              onClick={onPlaySeeTheFuture}
              disabled={!canAct || actionBusy === 'see_the_future'}
            >
              {actionBusy === 'see_the_future'
                ? 'Playing...'
                : `🔮 ${getCardName('insight', cardVariant || 'adventure')}`}
            </ActionButton>
          )}
          {canPlayCombo && (
            <ActionButton
              $variant={cardVariant as GameVariant}
              variant="primary"
              onClick={() => onOpenEventCombo(availableCombos)}
              disabled={actionBusy === 'event_combo'}
            >
              {actionBusy === 'event_combo'
                ? 'Playing...'
                : `🌪️ ${t('games.table.modals.eventCombo.title')}`}
            </ActionButton>
          )}
          {fiverAvailable && canAct && (
            <ActionButton
              $variant={cardVariant as GameVariant}
              variant="primary"
              onClick={onOpenFiverCombo}
              disabled={actionBusy === 'event_combo'}
            >
              {actionBusy === 'event_combo'
                ? 'Playing...'
                : '🃏 Fiver (5 Cards)'}
            </ActionButton>
          )}
          <ExpansionActions
            currentPlayer={currentPlayer}
            canAct={canAct}
            actionBusy={actionBusy as string | null}
            cardVariant={cardVariant}
            t={t}
            onPlayActionCard={onPlayActionCard}
          />
        </ActionButtons>
      )}
    </InfoCard>
  );
}
