'use client';

import type { ExplodingCatsPlayerState, ExplodingCatsCard } from '../types';
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
  | null;

interface ActionsSectionProps {
  currentPlayer: ExplodingCatsPlayerState;
  canAct: boolean | undefined;
  actionBusy: ActionBusyState | string | null;
  onDraw: () => void;
  onPlayActionCard: (card: ExplodingCatsCard) => void;
  onPlayNope: () => void;
  onOpenFavorModal: () => void;
  onPlaySeeTheFuture: () => void;
  t: (key: string) => string;
}

export function ActionsSection({
  currentPlayer,
  canAct,
  actionBusy,
  onDraw,
  onPlayActionCard,
  onPlayNope,
  onOpenFavorModal,
  onPlaySeeTheFuture,
  t,
}: ActionsSectionProps) {
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
      </ActionButtons>
    </InfoCard>
  );
}
