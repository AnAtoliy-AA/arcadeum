import type { TranslationKey } from '@/lib/i18n/messages';
import type { GameSessionSummary } from '../../api/gamesApi';
import type { CriticalCard } from './types';

export function getCardTranslationKey(card: CriticalCard): TranslationKey {
  switch (card) {
    case 'critical_event':
      return 'games.table.cards.explodingCat';
    case 'neutralizer':
      return 'games.table.cards.defuse';
    case 'strike':
      return 'games.table.cards.attack';
    case 'evade':
      return 'games.table.cards.skip';
    case 'trade':
      return 'games.table.cards.favor';
    case 'reorder':
      return 'games.table.cards.shuffle';
    case 'insight':
      return 'games.table.cards.seeTheFuture';
    case 'cancel':
      return 'games.table.cards.nope';
    case 'collection_alpha':
      return 'games.table.cards.collectionAlpha';
    case 'collection_beta':
      return 'games.table.cards.collectionBeta';
    case 'collection_gamma':
      return 'games.table.cards.collectionGamma';
    case 'collection_delta':
      return 'games.table.cards.collectionDelta';
    case 'collection_epsilon':
      return 'games.table.cards.collectionEpsilon';
    // Future Pack
    case 'see_future_5x':
      return 'games.table.cards.seeFuture_5x';
    case 'alter_future_3x':
      return 'games.table.cards.alterFuture_3x';
    case 'alter_future_5x':
      return 'games.table.cards.alterFuture_5x';
    case 'reveal_future_3x':
      return 'games.table.cards.revealFuture_3x';
    case 'share_future_3x':
      return 'games.table.cards.shareFuture_3x';
    case 'draw_bottom':
      return 'games.table.cards.drawBottom';
    case 'swap_top_bottom':
      return 'games.table.cards.swapTopBottom';
    case 'bury':
      return 'games.table.cards.bury';
    // Theft Pack
    case 'wildcard':
      return 'games.table.cards.wildcard';
    case 'mark':
      return 'games.table.cards.mark';
    case 'steal_draw':
      return 'games.table.cards.stealDraw';
    case 'stash':
      return 'games.table.cards.stash';
    // Deity Pack
    case 'omniscience':
      return 'games.table.cards.omniscience';
    case 'miracle':
      return 'games.table.cards.miracle';
    case 'smite':
      return 'games.table.cards.smite';
    case 'rapture':
      return 'games.table.cards.rapture';
    // Chaos Pack (Planned)
    case 'critical_implosion':
      return 'games.table.cards.criticalImplosion';
    case 'containment_field':
      return 'games.table.cards.containmentField';
    case 'fission':
      return 'games.table.cards.fission';
    case 'tribute':
      return 'games.table.cards.tribute';
    case 'blackout':
      return 'games.table.cards.blackout';
    // Attack Pack
    case 'targeted_strike':
      return 'games.table.cards.targetedAttack';
    case 'private_strike':
      return 'games.table.cards.personalAttack';
    case 'recursive_strike':
      return 'games.table.cards.attackOfTheDead';
    case 'mega_evade':
      return 'games.table.cards.superSkip';
    case 'invert':
      return 'games.table.cards.reverse';
    default:
      return 'games.table.cards.generic';
  }
}

export function getCardDescriptionKey(card: CriticalCard): TranslationKey {
  switch (card) {
    case 'critical_event':
      return 'games.table.cardDescriptions.explodingCat';
    case 'neutralizer':
      return 'games.table.cardDescriptions.defuse';
    case 'strike':
      return 'games.table.cardDescriptions.attack';
    case 'evade':
      return 'games.table.cardDescriptions.skip';
    case 'trade':
      return 'games.table.cardDescriptions.favor';
    case 'reorder':
      return 'games.table.cardDescriptions.shuffle';
    case 'insight':
      return 'games.table.cardDescriptions.seeTheFuture';
    case 'cancel':
      return 'games.table.cardDescriptions.nope';
    case 'collection_alpha':
      return 'games.table.cardDescriptions.collectionAlpha';
    case 'collection_beta':
      return 'games.table.cardDescriptions.collectionBeta';
    case 'collection_gamma':
      return 'games.table.cardDescriptions.collectionGamma';
    case 'collection_delta':
      return 'games.table.cardDescriptions.collectionDelta';
    case 'collection_epsilon':
      return 'games.table.cardDescriptions.collectionEpsilon';
    // Future Pack
    case 'see_future_5x':
      return 'games.table.cardDescriptions.seeFuture_5x';
    case 'alter_future_3x':
      return 'games.table.cardDescriptions.alterFuture_3x';
    case 'alter_future_5x':
      return 'games.table.cardDescriptions.alterFuture_5x';
    case 'reveal_future_3x':
      return 'games.table.cardDescriptions.revealFuture_3x';
    case 'share_future_3x':
      return 'games.table.cardDescriptions.shareFuture_3x';
    case 'draw_bottom':
      return 'games.table.cardDescriptions.drawBottom';
    case 'swap_top_bottom':
      return 'games.table.cardDescriptions.swapTopBottom';
    case 'bury':
      return 'games.table.cardDescriptions.bury';
    // Theft Pack
    case 'wildcard':
      return 'games.table.cardDescriptions.wildcard';
    case 'mark':
      return 'games.table.cardDescriptions.mark';
    case 'steal_draw':
      return 'games.table.cardDescriptions.stealDraw';
    case 'stash':
      return 'games.table.cardDescriptions.stash';
    // Deity Pack
    case 'omniscience':
      return 'games.table.cardDescriptions.omniscience';
    case 'miracle':
      return 'games.table.cardDescriptions.miracle';
    case 'smite':
      return 'games.table.cardDescriptions.smite';
    case 'rapture':
      return 'games.table.cardDescriptions.rapture';
    // Chaos Pack
    case 'critical_implosion':
      return 'games.table.cardDescriptions.criticalImplosion';
    case 'containment_field':
      return 'games.table.cardDescriptions.containmentField';
    case 'fission':
      return 'games.table.cardDescriptions.fission';
    case 'tribute':
      return 'games.table.cardDescriptions.tribute';
    case 'blackout':
      return 'games.table.cardDescriptions.blackout';
    // Attack Pack
    case 'targeted_strike':
      return 'games.table.cardDescriptions.targetedAttack';
    case 'private_strike':
      return 'games.table.cardDescriptions.personalAttack';
    case 'recursive_strike':
      return 'games.table.cardDescriptions.attackOfTheDead';
    case 'mega_evade':
      return 'games.table.cardDescriptions.superSkip';
    case 'invert':
      return 'games.table.cardDescriptions.reverse';
    default:
      return 'games.table.cardDescriptions.generic';
  }
}

export function getSessionStatusTranslationKey(
  status: GameSessionSummary['status'] | undefined | null,
): TranslationKey {
  switch (status) {
    case 'active':
      return 'games.table.sessionStatus.active';
    case 'completed':
      return 'games.table.sessionStatus.completed';
    case 'waiting':
      return 'games.table.sessionStatus.pending';
    default:
      return 'games.table.sessionStatus.unknown';
  }
}
