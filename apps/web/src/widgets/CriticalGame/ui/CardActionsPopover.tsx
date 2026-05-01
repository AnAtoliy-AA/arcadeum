import React from 'react';
import { YStack, XStack, Text } from 'tamagui';
import type { GameVariant } from '@arcadeum/ui';
import {
  COMBO_CARDS,
  SPECIAL_CARDS,
  type CriticalCard,
  type CriticalComboCard,
} from '../types';
import { PLAYABLE_ACTION_CARDS } from '../lib/constants';
import { getCardTranslationKey, getCardDescriptionKey } from '../lib/cardUtils';
import { ActionButton } from './styles/cards';

export interface CardActionsPopoverProps {
  card: CriticalCard;
  count: number;
  isMyTurn: boolean;
  canAct: boolean;
  allowActionCardCombos: boolean;
  hasOpponents: boolean;
  cardVariant?: string;
  t: (key: string, params?: Record<string, string | number>) => string;
  onPlay: () => void;
  onPlayCombo: () => void;
  onClose: () => void;
}

export function CardActionsPopover({
  card,
  count,
  isMyTurn,
  canAct,
  allowActionCardCombos,
  hasOpponents,
  cardVariant,
  t,
  onPlay,
  onPlayCombo,
  onClose,
}: CardActionsPopoverProps) {
  const variant = cardVariant as GameVariant | undefined;

  const isSpecial = card === 'insight' || card === 'trade' || card === 'cancel';
  const isComboCard = COMBO_CARDS.includes(card as CriticalComboCard);
  const isComboable = allowActionCardCombos
    ? !SPECIAL_CARDS.includes(card as (typeof SPECIAL_CARDS)[number])
    : isComboCard;
  const canCombo =
    isMyTurn && canAct && hasOpponents && isComboable && count >= 2;
  const canPlay =
    isMyTurn && canAct && (isSpecial || PLAYABLE_ACTION_CARDS.includes(card));

  return (
    <YStack
      data-testid="card-actions-popover"
      gap="$3"
      padding="$3"
      borderRadius={12}
      backgroundColor="rgba(15,17,22,0.95)"
      borderWidth={1}
      borderColor="$glassBorder"
      minWidth={260}
      zIndex={60}
    >
      <Text fontSize={16} fontWeight="700">
        {t(getCardTranslationKey(card, cardVariant)) || card}
      </Text>
      <Text fontSize={12} opacity={0.8}>
        {t(getCardDescriptionKey(card))}
      </Text>

      <XStack gap="$2" flexWrap="wrap">
        {canPlay && (
          <ActionButton
            $variant={variant}
            variant="primary"
            onClick={onPlay}
            data-testid="card-actions-play"
          >
            {t('games.table.mobile.popover.play')}
          </ActionButton>
        )}
        {canCombo && (
          <ActionButton
            $variant={variant}
            variant="secondary"
            onClick={onPlayCombo}
            data-testid="card-actions-combo"
          >
            {t('games.table.mobile.popover.combo', { count })}
          </ActionButton>
        )}
        <ActionButton
          $variant={variant}
          variant="secondary"
          onClick={onClose}
          data-testid="card-actions-close"
        >
          {t('games.table.mobile.popover.close')}
        </ActionButton>
      </XStack>
    </YStack>
  );
}
