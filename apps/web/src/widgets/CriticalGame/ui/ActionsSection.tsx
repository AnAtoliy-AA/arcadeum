'use client';

import { useMemo, useState } from 'react';
import type {
  CriticalPlayerState,
  CriticalCard,
  CriticalComboCard,
} from '../types';
import { getCardTranslationKey } from '../lib/cardUtils';
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
    <InfoCard $variant={cardVariant}>
      <ActionsHeader $variant={cardVariant}>
        <InfoTitle>{t('games.table.actions.start') || 'Actions'}</InfoTitle>
        <ActionsToggleButton
          $variant={cardVariant}
          onClick={() => setShowActions(!showActions)}
          title={showActions ? 'Hide Actions' : 'Show Actions'}
        >
          {showActions ? '−' : '+'}
        </ActionsToggleButton>
      </ActionsHeader>

      {showActions && (
        <ActionButtons $variant={cardVariant}>
          <ActionButton
            $variant={cardVariant}
            onClick={onDraw}
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
              $variant={cardVariant}
              variant="secondary"
              onClick={() => onPlayActionCard('evade')}
              disabled={!canAct || actionBusy === 'evade'}
            >
              {actionBusy === 'evade'
                ? 'Playing...'
                : `Play ${t(getCardTranslationKey('evade', cardVariant))}`}
            </ActionButton>
          )}
          {currentPlayer.hand.includes('strike') && (
            <ActionButton
              $variant={cardVariant}
              variant="danger"
              onClick={() => onPlayActionCard('strike')}
              disabled={!canAct || actionBusy === 'strike'}
            >
              {actionBusy === 'strike'
                ? 'Playing...'
                : `Play ${t(getCardTranslationKey('strike', cardVariant))}`}
            </ActionButton>
          )}
          {currentPlayer.hand.includes('reorder') && (
            <ActionButton
              $variant={cardVariant}
              variant="secondary"
              onClick={() => onPlayActionCard('reorder')}
              disabled={!canAct || actionBusy === 'reorder'}
            >
              {actionBusy === 'reorder'
                ? 'Playing...'
                : `🔀 ${t(getCardTranslationKey('reorder', cardVariant))}`}
            </ActionButton>
          )}
          {currentPlayer.hand.includes('cancel') && (
            <ActionButton
              $variant={cardVariant}
              variant="secondary"
              onClick={onPlayNope}
              disabled={!canAct || actionBusy === 'nope'}
            >
              {actionBusy === 'nope'
                ? 'Playing...'
                : `🚫 ${t(getCardTranslationKey('cancel', cardVariant))}`}
            </ActionButton>
          )}
          {currentPlayer.hand.includes('trade') && (
            <ActionButton
              $variant={cardVariant}
              variant="primary"
              onClick={onOpenFavorModal}
              disabled={!canAct || actionBusy === 'favor'}
            >
              {actionBusy === 'favor'
                ? 'Playing...'
                : `🤝 ${t(getCardTranslationKey('trade', cardVariant))}`}
            </ActionButton>
          )}
          {currentPlayer.hand.includes('insight') && (
            <ActionButton
              $variant={cardVariant}
              variant="primary"
              onClick={onPlaySeeTheFuture}
              disabled={!canAct || actionBusy === 'see_the_future'}
            >
              {actionBusy === 'see_the_future'
                ? 'Playing...'
                : `🔮 ${t(getCardTranslationKey('insight', cardVariant))}`}
            </ActionButton>
          )}
          {canPlayCombo && (
            <ActionButton
              $variant={cardVariant}
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
              $variant={cardVariant}
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
