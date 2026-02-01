import type { TranslationKey } from '@/lib/i18n/messages';
import type { GameSessionSummary } from '../../api/gamesApi';
import type { CriticalCard } from './types';

export function getCardTranslationKey(card: CriticalCard): TranslationKey {
  switch (card) {
    case 'exploding_cat':
      return 'games.table.cards.explodingCat';
    case 'defuse':
      return 'games.table.cards.defuse';
    case 'attack':
      return 'games.table.cards.attack';
    case 'skip':
      return 'games.table.cards.skip';
    case 'favor':
      return 'games.table.cards.favor';
    case 'shuffle':
      return 'games.table.cards.shuffle';
    case 'see_the_future':
      return 'games.table.cards.seeTheFuture';
    case 'nope':
      return 'games.table.cards.nope';
    case 'tacocat':
      return 'games.table.cards.tacocat';
    case 'hairy_potato_cat':
      return 'games.table.cards.hairyPotatoCat';
    case 'rainbow_ralphing_cat':
      return 'games.table.cards.rainbowRalphingCat';
    case 'cattermelon':
      return 'games.table.cards.cattermelon';
    case 'bearded_cat':
      return 'games.table.cards.beardedCat';
    default:
      return 'games.table.cards.generic';
  }
}

export function getCardDescriptionKey(card: CriticalCard): TranslationKey {
  switch (card) {
    case 'exploding_cat':
      return 'games.table.cardDescriptions.explodingCat';
    case 'defuse':
      return 'games.table.cardDescriptions.defuse';
    case 'attack':
      return 'games.table.cardDescriptions.attack';
    case 'skip':
      return 'games.table.cardDescriptions.skip';
    case 'favor':
      return 'games.table.cardDescriptions.favor';
    case 'shuffle':
      return 'games.table.cardDescriptions.shuffle';
    case 'see_the_future':
      return 'games.table.cardDescriptions.seeTheFuture';
    case 'nope':
      return 'games.table.cardDescriptions.nope';
    case 'tacocat':
      return 'games.table.cardDescriptions.tacocat';
    case 'hairy_potato_cat':
      return 'games.table.cardDescriptions.hairyPotatoCat';
    case 'rainbow_ralphing_cat':
      return 'games.table.cardDescriptions.rainbowRalphingCat';
    case 'cattermelon':
      return 'games.table.cardDescriptions.cattermelon';
    case 'bearded_cat':
      return 'games.table.cardDescriptions.beardedCat';
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
