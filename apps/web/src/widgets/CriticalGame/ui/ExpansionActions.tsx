import type { CriticalPlayerState, CriticalCard } from '../types';
import { getCardTranslationKey } from '../lib/cardUtils';
import { ActionButton } from './styles';

export interface ExpansionActionsProps {
  currentPlayer: CriticalPlayerState;
  canAct: boolean | undefined;
  actionBusy: string | null;
  cardVariant?: string;
  t: (key: string) => string;
  onPlayActionCard: (card: CriticalCard) => void;
}

export function ExpansionActions({
  currentPlayer,
  canAct,
  actionBusy,
  cardVariant,
  t,
  onPlayActionCard,
}: ExpansionActionsProps) {
  return (
    <>
      {/* Attack Pack Cards */}
      {currentPlayer.hand.includes('invert') && (
        <ActionButton
          $variant={cardVariant}
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
          $variant={cardVariant}
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
          $variant={cardVariant}
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
          $variant={cardVariant}
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
          $variant={cardVariant}
          variant="danger"
          onClick={() => onPlayActionCard('recursive_strike')}
          disabled={!canAct || actionBusy === 'recursive_strike'}
        >
          {actionBusy === 'recursive_strike'
            ? 'Playing...'
            : `🧟 ${t(getCardTranslationKey('recursive_strike', cardVariant))}`}
        </ActionButton>
      )}
      {/* Future Pack Cards */}
      {currentPlayer.hand.includes('see_future_5x') && (
        <ActionButton
          $variant={cardVariant}
          variant="primary"
          onClick={() => onPlayActionCard('see_future_5x')}
          disabled={!canAct || actionBusy === 'see_future_5x'}
        >
          {actionBusy === 'see_future_5x'
            ? 'Playing...'
            : `👀 ${t(getCardTranslationKey('see_future_5x', cardVariant))}`}
        </ActionButton>
      )}
      {currentPlayer.hand.includes('alter_future_3x') && (
        <ActionButton
          $variant={cardVariant}
          variant="primary"
          onClick={() => onPlayActionCard('alter_future_3x')}
          disabled={!canAct || actionBusy === 'alter_future_3x'}
        >
          {actionBusy === 'alter_future_3x'
            ? 'Playing...'
            : `🪄 ${t(getCardTranslationKey('alter_future_3x', cardVariant))}`}
        </ActionButton>
      )}
      {currentPlayer.hand.includes('alter_future_5x') && (
        <ActionButton
          $variant={cardVariant}
          variant="primary"
          onClick={() => onPlayActionCard('alter_future_5x')}
          disabled={!canAct || actionBusy === 'alter_future_5x'}
        >
          {actionBusy === 'alter_future_5x'
            ? 'Playing...'
            : `🌀 ${t(getCardTranslationKey('alter_future_5x', cardVariant))}`}
        </ActionButton>
      )}
      {currentPlayer.hand.includes('reveal_future_3x') && (
        <ActionButton
          $variant={cardVariant}
          variant="primary"
          onClick={() => onPlayActionCard('reveal_future_3x')}
          disabled={!canAct || actionBusy === 'reveal_future_3x'}
        >
          {actionBusy === 'reveal_future_3x'
            ? 'Playing...'
            : `📢 ${t(getCardTranslationKey('reveal_future_3x', cardVariant))}`}
        </ActionButton>
      )}
      {currentPlayer.hand.includes('share_future_3x') && (
        <ActionButton
          $variant={cardVariant}
          variant="primary"
          onClick={() => onPlayActionCard('share_future_3x')}
          disabled={!canAct || actionBusy === 'share_future_3x'}
        >
          {actionBusy === 'share_future_3x'
            ? 'Playing...'
            : `🤲 ${t(getCardTranslationKey('share_future_3x', cardVariant))}`}
        </ActionButton>
      )}
      {currentPlayer.hand.includes('draw_bottom') && (
        <ActionButton
          $variant={cardVariant}
          variant="secondary"
          onClick={() => onPlayActionCard('draw_bottom')}
          disabled={!canAct || actionBusy === 'draw_bottom'}
        >
          {actionBusy === 'draw_bottom'
            ? 'Playing...'
            : `🔽 ${t(getCardTranslationKey('draw_bottom', cardVariant))}`}
        </ActionButton>
      )}
      {currentPlayer.hand.includes('swap_top_bottom') && (
        <ActionButton
          $variant={cardVariant}
          variant="secondary"
          onClick={() => onPlayActionCard('swap_top_bottom')}
          disabled={!canAct || actionBusy === 'swap_top_bottom'}
        >
          {actionBusy === 'swap_top_bottom'
            ? 'Playing...'
            : `🔃 ${t(getCardTranslationKey('swap_top_bottom', cardVariant))}`}
        </ActionButton>
      )}
      {currentPlayer.hand.includes('bury') && (
        <ActionButton
          $variant={cardVariant}
          variant="secondary"
          onClick={() => onPlayActionCard('bury')}
          disabled={!canAct || actionBusy === 'bury'}
        >
          {actionBusy === 'bury'
            ? 'Playing...'
            : `⚰️ ${t(getCardTranslationKey('bury', cardVariant))}`}
        </ActionButton>
      )}
      {/* Theft Pack Cards */}
      {currentPlayer.hand.includes('mark') && (
        <ActionButton
          $variant={cardVariant}
          variant="primary"
          onClick={() => onPlayActionCard('mark')}
          disabled={!canAct || actionBusy === 'mark'}
        >
          {actionBusy === 'mark'
            ? 'Playing...'
            : `🏷️ ${t(getCardTranslationKey('mark', cardVariant))}`}
        </ActionButton>
      )}
      {currentPlayer.hand.includes('steal_draw') && (
        <ActionButton
          $variant={cardVariant}
          variant="primary"
          onClick={() => onPlayActionCard('steal_draw')}
          disabled={!canAct || actionBusy === 'steal_draw'}
        >
          {actionBusy === 'steal_draw'
            ? 'Playing...'
            : `🤏 ${t(getCardTranslationKey('steal_draw', cardVariant))}`}
        </ActionButton>
      )}
      {currentPlayer.hand.includes('stash') && (
        <ActionButton
          $variant={cardVariant}
          variant="primary"
          onClick={() => onPlayActionCard('stash')}
          disabled={!canAct || actionBusy === 'stash'}
        >
          {actionBusy === 'stash'
            ? 'Playing...'
            : `🏰 ${t(getCardTranslationKey('stash', cardVariant))}`}
        </ActionButton>
      )}
      {/* Deity Pack Cards */}
      {currentPlayer.hand.includes('omniscience') && (
        <ActionButton
          $variant={cardVariant}
          variant="primary"
          onClick={() => onPlayActionCard('omniscience')}
          disabled={!canAct || actionBusy === 'omniscience'}
        >
          {actionBusy === 'omniscience'
            ? 'Playing...'
            : `👁️ ${t(getCardTranslationKey('omniscience', cardVariant))}`}
        </ActionButton>
      )}
      {currentPlayer.hand.includes('miracle') && (
        <ActionButton
          $variant={cardVariant}
          variant="primary"
          onClick={() => onPlayActionCard('miracle')}
          disabled={!canAct || actionBusy === 'miracle'}
        >
          {actionBusy === 'miracle'
            ? 'Playing...'
            : `✨ ${t(getCardTranslationKey('miracle', cardVariant))}`}
        </ActionButton>
      )}
      {currentPlayer.hand.includes('smite') && (
        <ActionButton
          $variant={cardVariant}
          variant="danger"
          onClick={() => onPlayActionCard('smite')}
          disabled={!canAct || actionBusy === 'smite'}
        >
          {actionBusy === 'smite'
            ? 'Playing...'
            : `⚡ ${t(getCardTranslationKey('smite', cardVariant))}`}
        </ActionButton>
      )}
      {currentPlayer.hand.includes('rapture') && (
        <ActionButton
          $variant={cardVariant}
          variant="danger"
          onClick={() => onPlayActionCard('rapture')}
          disabled={!canAct || actionBusy === 'rapture'}
        >
          {actionBusy === 'rapture'
            ? 'Playing...'
            : `🎺 ${t(getCardTranslationKey('rapture', cardVariant))}`}
        </ActionButton>
      )}
      {/* Chaos Pack Cards */}
      {currentPlayer.hand.includes('critical_implosion') && (
        <ActionButton
          $variant={cardVariant}
          variant="danger"
          onClick={() => onPlayActionCard('critical_implosion')}
          disabled={!canAct || actionBusy === 'critical_implosion'}
        >
          {actionBusy === 'critical_implosion'
            ? 'Playing...'
            : `🤯 ${t(getCardTranslationKey('critical_implosion', cardVariant))}`}
        </ActionButton>
      )}
      {currentPlayer.hand.includes('containment_field') && (
        <ActionButton
          $variant={cardVariant}
          variant="secondary"
          onClick={() => onPlayActionCard('containment_field')}
          disabled={!canAct || actionBusy === 'containment_field'}
        >
          {actionBusy === 'containment_field'
            ? 'Playing...'
            : `📦 ${t(getCardTranslationKey('containment_field', cardVariant))}`}
        </ActionButton>
      )}
      {currentPlayer.hand.includes('fission') && (
        <ActionButton
          $variant={cardVariant}
          variant="danger"
          onClick={() => onPlayActionCard('fission')}
          disabled={!canAct || actionBusy === 'fission'}
        >
          {actionBusy === 'fission'
            ? 'Playing...'
            : `⚛️ ${t(getCardTranslationKey('fission', cardVariant))}`}
        </ActionButton>
      )}
      {currentPlayer.hand.includes('tribute') && (
        <ActionButton
          $variant={cardVariant}
          variant="primary"
          onClick={() => onPlayActionCard('tribute')}
          disabled={!canAct || actionBusy === 'tribute'}
        >
          {actionBusy === 'tribute'
            ? 'Playing...'
            : `🤲 ${t(getCardTranslationKey('tribute', cardVariant))}`}
        </ActionButton>
      )}
      {currentPlayer.hand.includes('blackout') && (
        <ActionButton
          $variant={cardVariant}
          variant="secondary"
          onClick={() => onPlayActionCard('blackout')}
          disabled={!canAct || actionBusy === 'blackout'}
        >
          {actionBusy === 'blackout'
            ? 'Playing...'
            : `🕶️ ${t(getCardTranslationKey('blackout', cardVariant))}`}
        </ActionButton>
      )}
    </>
  );
}
