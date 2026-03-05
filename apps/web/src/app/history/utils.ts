import { mapToGameType } from '@/features/games/lib/gameIdMapping';
import { CARD_VARIANTS } from '@/app/games/create/constants';
import { TranslationKey } from '@/shared/lib/useTranslation';

/**
 * Get the display name for a game ID, handling aliases and translations.
 * @param gameId The game ID from the history entry
 * @param t The translation function
 * @returns The formatted game name
 */
export function getGameDisplayName(
  gameId: string,
  t: (key: TranslationKey, params?: Record<string, string | number>) => string,
  gameOptions?: { cardVariant?: string },
): string {
  // Use the central mapping to get the canonical game type (e.g., 'exploding_kittens_v1' -> 'critical_v1')
  const canonicalId = mapToGameType(gameId) || gameId;

  // Try to translate the game name using the canonical ID
  let name = t(`games.${canonicalId}.name` as TranslationKey) || gameId;

  // Append variant name if available (specifically for specific variants)
  if (gameOptions?.cardVariant && gameOptions.cardVariant !== 'random') {
    const variant = CARD_VARIANTS.find((v) => v.id === gameOptions.cardVariant);
    if (variant) {
      name = `${name}: ${variant.name}`;
    }
  }

  return name;
}
