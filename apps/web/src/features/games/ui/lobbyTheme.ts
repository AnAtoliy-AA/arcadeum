import type { GameLobbyTheme } from './ReusableGameLobby.types';

export interface LobbyVariantLike {
  id: string;
  lightGradient?: string;
}

/**
 * Builds the `GameLobbyTheme` (title/variant/button gradients) from a game's
 * variant list. Every game lobby used to inline this logic; the per-game
 * bits that remain are the variant list itself, the fallback gradient and
 * the accent button gradient.
 */
export function getLobbyTheme(
  variants: ReadonlyArray<LobbyVariantLike>,
  variantId: string | undefined,
  fallbackLightGradient: string,
  buttonGradient: string,
): GameLobbyTheme {
  const variant = variants.find((v) => v.id === variantId);
  const lightGradient = variant?.lightGradient ?? fallbackLightGradient;
  return {
    titleGradient: lightGradient,
    variantGradient: lightGradient,
    buttonGradient,
  };
}
