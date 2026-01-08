'use client';

import { useMemo } from 'react';
import type {
  ExplodingCatsPlayerState,
  ExplodingCatsCard,
  ExplodingCatsCatCard,
} from '../types';
import { CAT_CARDS, FIVER_COMBO_SIZE } from '../types';
import { InfoCard, InfoTitle, ActionButtons, ActionButton } from './styles';

export type ActionBusyState =
  | 'draw'
  | 'skip'
  | 'attack'
  | 'shuffle'
  | 'favor'
  | 'see_the_future'
  | 'nope'
  | 'defuse'
  | 'cat_combo'
  | null;

interface ActionsSectionProps {
  currentPlayer: ExplodingCatsPlayerState;
  canAct: boolean | undefined;
  actionBusy: ActionBusyState | string | null;
  hasOpponents: boolean;
  discardPileLength: number;
  onDraw: () => void;
  onPlayActionCard: (card: ExplodingCatsCard) => void;
  onPlayNope: () => void;
  onOpenFavorModal: () => void;
  onPlaySeeTheFuture: () => void;
  onOpenCatCombo: (cats: ExplodingCatsCatCard[]) => void;
  onOpenFiverCombo: () => void;
  t: (key: string) => string;
}

export function ActionsSection({
  currentPlayer,
  canAct,
  actionBusy,
  hasOpponents,
  discardPileLength,
  onDraw,
  onPlayActionCard,
  onPlayNope,
  onOpenFavorModal,
  onPlaySeeTheFuture,
  onOpenCatCombo,
  onOpenFiverCombo,
  t,
}: ActionsSectionProps) {
  // Find all cat cards with 2+ copies (combos available)
  const availableCombos = useMemo(() => {
    const cardCounts = new Map<ExplodingCatsCard, number>();
    currentPlayer.hand.forEach((card) =>
      cardCounts.set(card, (cardCounts.get(card) || 0) + 1),
    );

    return CAT_CARDS.filter((cat) => (cardCounts.get(cat) || 0) >= 2);
  }, [currentPlayer.hand]);

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
        {currentPlayer.hand.includes('skip') && (
          <ActionButton
            variant="secondary"
            onClick={() => onPlayActionCard('skip')}
            disabled={!canAct || actionBusy === 'skip'}
          >
            {actionBusy === 'skip'
              ? 'Playing...'
              : t('games.table.actions.playSkip') || 'Play Skip'}
          </ActionButton>
        )}
        {currentPlayer.hand.includes('attack') && (
          <ActionButton
            variant="danger"
            onClick={() => onPlayActionCard('attack')}
            disabled={!canAct || actionBusy === 'attack'}
          >
            {actionBusy === 'attack'
              ? 'Playing...'
              : t('games.table.actions.playAttack') || 'Play Attack'}
          </ActionButton>
        )}
        {currentPlayer.hand.includes('shuffle') && (
          <ActionButton
            variant="secondary"
            onClick={() => onPlayActionCard('shuffle')}
            disabled={!canAct || actionBusy === 'shuffle'}
          >
            {actionBusy === 'shuffle' ? 'Playing...' : '🔀 Shuffle'}
          </ActionButton>
        )}
        {currentPlayer.hand.includes('nope') && (
          <ActionButton
            variant="secondary"
            onClick={onPlayNope}
            disabled={!canAct || actionBusy === 'nope'}
          >
            {actionBusy === 'nope'
              ? 'Playing...'
              : t('games.table.actions.playNope') || '🚫 Nope'}
          </ActionButton>
        )}
        {currentPlayer.hand.includes('favor') && (
          <ActionButton
            variant="primary"
            onClick={onOpenFavorModal}
            disabled={!canAct || actionBusy === 'favor'}
          >
            {actionBusy === 'favor' ? 'Playing...' : '🤝 Favor'}
          </ActionButton>
        )}
        {currentPlayer.hand.includes('see_the_future') && (
          <ActionButton
            variant="primary"
            onClick={onPlaySeeTheFuture}
            disabled={!canAct || actionBusy === 'see_the_future'}
          >
            {actionBusy === 'see_the_future' ? 'Playing...' : '🔮 See Future'}
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
        {currentPlayer.hand.includes('reverse') && (
          <ActionButton
            variant="secondary"
            onClick={() => onPlayActionCard('reverse')}
            disabled={!canAct || actionBusy === 'reverse'}
          >
            {actionBusy === 'reverse' ? 'Playing...' : '🔄 Reverse'}
          </ActionButton>
        )}
        {currentPlayer.hand.includes('super_skip') && (
          <ActionButton
            variant="primary"
            onClick={() => onPlayActionCard('super_skip')}
            disabled={!canAct || actionBusy === 'super_skip'}
          >
            {actionBusy === 'super_skip' ? 'Playing...' : '🦸 Super Skip'}
          </ActionButton>
        )}
        {currentPlayer.hand.includes('targeted_attack') && (
          <ActionButton
            variant="danger"
            onClick={() => onPlayActionCard('targeted_attack')}
            disabled={!canAct || actionBusy === 'targeted_attack'}
          >
            {actionBusy === 'targeted_attack'
              ? 'Playing...'
              : '🎯 Targeted Attack'}
          </ActionButton>
        )}
        {currentPlayer.hand.includes('personal_attack') && (
          <ActionButton
            variant="danger"
            onClick={() => onPlayActionCard('personal_attack')}
            disabled={!canAct || actionBusy === 'personal_attack'}
          >
            {actionBusy === 'personal_attack'
              ? 'Playing...'
              : '💜 Personal Attack'}
          </ActionButton>
        )}
        {currentPlayer.hand.includes('attack_of_the_dead') && (
          <ActionButton
            variant="danger"
            onClick={() => onPlayActionCard('attack_of_the_dead')}
            disabled={!canAct || actionBusy === 'attack_of_the_dead'}
          >
            {actionBusy === 'attack_of_the_dead'
              ? 'Playing...'
              : '🧟 Attack of Dead'}
          </ActionButton>
        )}
      </ActionButtons>
    </InfoCard>
  );
}
