'use client';

import { useMemo } from 'react';
import type {
  CriticalPlayerState,
  CriticalCard,
  CriticalCatCard,
} from '../types';
import { getCardTranslationKey } from '../lib/cardUtils';
import { CAT_CARDS, FIVER_COMBO_SIZE, SPECIAL_CARDS } from '../types';
import { InfoCard, InfoTitle, ActionButtons, ActionButton } from './styles';

export type ActionBusyState =
  | 'draw'
  | 'evade'
  | 'strike'
  | 'reorder'
  | 'trade'
  | 'insight'
  | 'cancel'
  | 'neutralizer'
  | 'cat_combo'
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
  onOpenCatCombo: (cats: CriticalCatCard[]) => void;
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
  onOpenCatCombo,
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
        .map(([card]) => card as CriticalCatCard);
    }

    return CAT_CARDS.filter((cat) => (cardCounts.get(cat) || 0) >= 2);
  }, [currentPlayer.hand, allowActionCardCombos]);

  // Check if fiver combo is available (FIVER_COMBO_SIZE+ unique cards and non-empty discard pile)
  const fiverAvailable = useMemo(() => {
    const uniqueCards = new Set(currentPlayer.hand);
    return uniqueCards.size >= FIVER_COMBO_SIZE && discardPileLength > 0;
  }, [currentPlayer.hand, discardPileLength]);

  const canPlayCombo = availableCombos.length > 0 && hasOpponents && canAct;

  return (
    <InfoCard>
      <InfoTitle>{t('games.table.actions.start') || 'Actions'}</InfoTitle>
      <ActionButtons>
        <ActionButton
          onClick={onDraw}
          disabled={!canAct || actionBusy === 'draw'}
        >
          {actionBusy === 'draw'
            ? t('games.table.actions.drawing') || 'Drawing...'
            : t('games.table.actions.draw') || 'Draw Card'}
        </ActionButton>
        {currentPlayer.hand.includes('evade') && (
          <ActionButton
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
            variant="secondary"
            onClick={onPlayNope}
            disabled={!canAct || actionBusy === 'cancel'}
          >
            {actionBusy === 'cancel'
              ? 'Playing...'
              : `🚫 ${t(getCardTranslationKey('cancel', cardVariant))}`}
          </ActionButton>
        )}
        {currentPlayer.hand.includes('trade') && (
          <ActionButton
            variant="primary"
            onClick={onOpenFavorModal}
            disabled={!canAct || actionBusy === 'trade'}
          >
            {actionBusy === 'trade'
              ? 'Playing...'
              : `🤝 ${t(getCardTranslationKey('trade', cardVariant))}`}
          </ActionButton>
        )}
        {currentPlayer.hand.includes('insight') && (
          <ActionButton
            variant="primary"
            onClick={onPlaySeeTheFuture}
            disabled={!canAct || actionBusy === 'insight'}
          >
            {actionBusy === 'insight'
              ? 'Playing...'
              : `🔮 ${t(getCardTranslationKey('insight', cardVariant))}`}
          </ActionButton>
        )}
        {canPlayCombo && (
          <ActionButton
            variant="primary"
            onClick={() => onOpenCatCombo(availableCombos)}
            disabled={actionBusy === 'cat_combo'}
          >
            {actionBusy === 'cat_combo'
              ? 'Playing...'
              : `🐱 ${t('games.table.modals.catCombo.title')}`}
          </ActionButton>
        )}
        {fiverAvailable && canAct && (
          <ActionButton
            variant="primary"
            onClick={onOpenFiverCombo}
            disabled={actionBusy === 'cat_combo'}
          >
            {actionBusy === 'cat_combo' ? 'Playing...' : '🃏 Fiver (5 Cards)'}
          </ActionButton>
        )}
        {/* Attack Pack Cards */}
        {currentPlayer.hand.includes('invert') && (
          <ActionButton
            variant="secondary"
            onClick={() => onPlayActionCard('invert')}
            disabled={!canAct || actionBusy === 'invert'}
          >
            {actionBusy === 'invert'
              ? 'Playing...'
              : `🔄 ${t(getCardTranslationKey('invert', cardVariant))}`}
          </ActionButton>
        )}
        {currentPlayer.hand.includes('mega_evade') && (
          <ActionButton
            variant="primary"
            onClick={() => onPlayActionCard('mega_evade')}
            disabled={!canAct || actionBusy === 'mega_evade'}
          >
            {actionBusy === 'mega_evade'
              ? 'Playing...'
              : `🦸 ${t(getCardTranslationKey('mega_evade', cardVariant))}`}
          </ActionButton>
        )}
        {currentPlayer.hand.includes('targeted_strike') && (
          <ActionButton
            variant="danger"
            onClick={() => onPlayActionCard('targeted_strike')}
            disabled={!canAct || actionBusy === 'targeted_strike'}
          >
            {actionBusy === 'targeted_strike'
              ? 'Playing...'
              : `🎯 ${t(getCardTranslationKey('targeted_strike', cardVariant))}`}
          </ActionButton>
        )}
        {currentPlayer.hand.includes('private_strike') && (
          <ActionButton
            variant="danger"
            onClick={() => onPlayActionCard('private_strike')}
            disabled={!canAct || actionBusy === 'private_strike'}
          >
            {actionBusy === 'private_strike'
              ? 'Playing...'
              : `💜 ${t(getCardTranslationKey('private_strike', cardVariant))}`}
          </ActionButton>
        )}
        {currentPlayer.hand.includes('recursive_strike') && (
          <ActionButton
            variant="danger"
            onClick={() => onPlayActionCard('recursive_strike')}
            disabled={!canAct || actionBusy === 'recursive_strike'}
          >
            {actionBusy === 'recursive_strike'
              ? 'Playing...'
              : `🧟 ${t(getCardTranslationKey('recursive_strike', cardVariant))}`}
          </ActionButton>
        )}
      </ActionButtons>
    </InfoCard>
  );
}
