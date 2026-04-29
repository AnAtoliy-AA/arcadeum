import React, { useEffect } from 'react';
import {
  type CriticalCard,
  type CriticalComboCard,
  type CriticalPlayerState,
} from '../types';
import { PLAYABLE_ACTION_CARDS } from '../lib/constants';
import { CardActionsPopover } from './CardActionsPopover';

interface MobileHandPopoverProps {
  selectedCard: CriticalCard | null;
  count: number;
  isMyTurn: boolean;
  canAct: boolean;
  allowActionCardCombos: boolean;
  hasOpponents: boolean;
  cardVariant?: string;
  hand: CriticalPlayerState['hand'];
  t: (key: string, params?: Record<string, string | number>) => string;
  onPlaySeeTheFuture: () => void;
  onOpenFavorModal: () => void;
  onPlayNope: () => void;
  onPlayActionCard: (card: CriticalCard) => void;
  onOpenEventCombo: (cards: CriticalComboCard[], hand: CriticalCard[]) => void;
  onClose: () => void;
}

export function MobileHandPopover({
  selectedCard,
  count,
  isMyTurn,
  canAct,
  allowActionCardCombos,
  hasOpponents,
  cardVariant,
  hand,
  t,
  onPlaySeeTheFuture,
  onOpenFavorModal,
  onPlayNope,
  onPlayActionCard,
  onOpenEventCombo,
  onClose,
}: MobileHandPopoverProps) {
  useEffect(() => {
    if (!selectedCard) return;
    const onDocClick = (e: MouseEvent) => {
      const popover = document.querySelector(
        '[data-testid="card-actions-popover"]',
      );
      if (popover && !popover.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('click', onDocClick, { capture: true });
    return () =>
      document.removeEventListener('click', onDocClick, { capture: true });
  }, [selectedCard, onClose]);

  if (!selectedCard) return null;

  return (
    <CardActionsPopover
      card={selectedCard}
      count={count}
      isMyTurn={isMyTurn}
      canAct={canAct}
      allowActionCardCombos={allowActionCardCombos}
      hasOpponents={hasOpponents}
      cardVariant={cardVariant}
      t={t}
      onPlay={() => {
        if (selectedCard === 'insight') onPlaySeeTheFuture();
        else if (selectedCard === 'trade') onOpenFavorModal();
        else if (selectedCard === 'cancel') onPlayNope();
        else if (PLAYABLE_ACTION_CARDS.includes(selectedCard))
          onPlayActionCard(selectedCard);
        onClose();
      }}
      onPlayCombo={() => {
        onOpenEventCombo([selectedCard as CriticalComboCard], hand);
        onClose();
      }}
      onClose={onClose}
    />
  );
}
