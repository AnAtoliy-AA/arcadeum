import {
  CriticalState,
  CriticalPlayerState,
} from '../../critical/critical.state';
import {
  hasCard,
  canPlayCollectionCombo,
  isStrikeTargetingPlayer,
} from './critical-validation.utils';

/**
 * Returns the list of actions available to a player at any given moment.
 */
export function getAvailableActionsForPlayer(
  state: CriticalState,
  playerId: string,
  isTurn: boolean,
): string[] {
  const player = state.players.find((p) => p.playerId === playerId);
  if (!player || !player.alive) {
    return [];
  }

  const actions: string[] = [];

  // Anytime cards: available regardless of whose turn it is
  if (state.pendingAction && hasCard(player, 'cancel')) {
    actions.push('play_cancel');
  }
  if (hasCard(player, 'shield_bash') && isStrikeTargetingPlayer(state, player)) {
    actions.push('shield_bash');
  }

  if (!isTurn) {
    return actions;
  }

  // If player must defuse, that's the only available action
  if (state.pendingDefuse === playerId) {
    return ['neutralizer'];
  }

  if (state.pendingDraws > 0) {
    actions.push('draw_card');
  } else {
    // Standard cards
    if (hasCard(player, 'strike')) actions.push('play_card:strike');
    if (hasCard(player, 'evade')) actions.push('play_card:evade');
    if (hasCard(player, 'reorder')) actions.push('play_card:reorder');
    if (hasCard(player, 'insight')) actions.push('insight');
    if (hasCard(player, 'trade')) actions.push('trade');

    // Attack Pack
    if (hasCard(player, 'targeted_strike'))
      actions.push('play_card:targeted_strike');
    if (hasCard(player, 'private_strike'))
      actions.push('play_card:private_strike');
    if (hasCard(player, 'recursive_strike'))
      actions.push('play_card:recursive_strike');
    if (hasCard(player, 'mega_evade')) actions.push('play_card:mega_evade');
    if (hasCard(player, 'invert')) actions.push('play_card:invert');
    if (hasCard(player, 'chain_strike')) actions.push('play_card:chain_strike');

    // Future Pack
    if (hasCard(player, 'see_future_5x'))
      actions.push('play_card:see_future_5x');
    if (hasCard(player, 'alter_future_3x'))
      actions.push('play_card:alter_future_3x');
    if (hasCard(player, 'alter_future_5x'))
      actions.push('play_card:alter_future_5x');
    if (hasCard(player, 'reveal_future_3x'))
      actions.push('play_card:reveal_future_3x');
    if (hasCard(player, 'share_future_3x'))
      actions.push('play_card:share_future_3x');
    if (hasCard(player, 'draw_bottom')) actions.push('play_card:draw_bottom');
    if (hasCard(player, 'swap_top_bottom'))
      actions.push('play_card:swap_top_bottom');
    if (hasCard(player, 'bury')) actions.push('play_card:bury');

    // Theft Pack
    if (hasCard(player, 'mark')) actions.push('play_card:mark');
    if (hasCard(player, 'steal_draw')) actions.push('play_card:steal_draw');
    if (hasCard(player, 'stash')) actions.push('play_card:stash');
    if (hasCard(player, 'swap_hands')) actions.push('play_card:swap_hands');
    if (hasCard(player, 'snatch')) actions.push('play_card:snatch');
    // Note: wildcard is used in combos, not played directly

    // Chaos Pack
    if (hasCard(player, 'scramble')) actions.push('play_card:scramble');

    // Can play collection combos
    if (canPlayCollectionCombo(player, state.allowActionCardCombos))
      actions.push('play_cat_combo');
  }

  return actions;
}
