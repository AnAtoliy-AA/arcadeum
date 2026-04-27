import React from 'react';
import { useMedia } from 'tamagui';
import type { GameVariant } from '@arcadeum/ui';
import { ActionBar, ActionButton } from './styles';

interface MobileActionBarProps {
  isMyTurn: boolean;
  isGameOver: boolean;
  canAct: boolean;
  canPlayNope: boolean;
  actionBusy: string | null;
  cardVariant?: string;
  t: (key: string) => string;
  onDraw: () => void;
  onPlayNope: () => void;
}

export function MobileActionBar({
  isMyTurn,
  isGameOver,
  canAct,
  canPlayNope,
  actionBusy,
  cardVariant,
  t,
  onDraw,
  onPlayNope,
}: MobileActionBarProps) {
  const media = useMedia();
  if (!media.sm) return null;
  if (isGameOver) return null;
  if (!isMyTurn && !canPlayNope) return null;

  const variant = cardVariant as GameVariant | undefined;
  const drawDisabled =
    !canAct ||
    [
      'draw',
      'cancel',
      'insight',
      'trade',
      'nope',
      'see_the_future',
      'favor',
    ].includes(actionBusy ?? '');

  return (
    <ActionBar data-testid="action-bar">
      {isMyTurn && (
        <ActionButton
          $variant={variant}
          onClick={onDraw}
          disabled={drawDisabled}
          data-testid="action-bar-draw"
        >
          {actionBusy === 'draw'
            ? t('games.table.actions.drawing') || 'Drawing...'
            : t('games.table.mobile.actionBar.draw') || 'Draw'}
        </ActionButton>
      )}
      {canPlayNope && (
        <ActionButton
          $variant={variant}
          variant="secondary"
          onClick={onPlayNope}
          disabled={actionBusy === 'cancel'}
          data-testid="action-bar-nope"
        >
          {actionBusy === 'cancel'
            ? 'Playing...'
            : t('games.table.mobile.actionBar.nope') || 'Nope'}
        </ActionButton>
      )}
    </ActionBar>
  );
}
