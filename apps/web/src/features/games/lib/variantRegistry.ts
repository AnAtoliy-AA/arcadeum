import { SHARED_THEMES } from '@/features/games/lib/shared-themes';
import { GLIMWORM_MODES } from '@/features/games/lib/glimwormVariants';
import { gameMetadata } from '@/features/games/registry';

export interface GameDisplayInfo {
  displayName: string;
  variantName?: string;
  themeName?: string;
  gradient?: string;
}

const GAME_MODE_TRANSLATION_KEYS: Record<string, Record<string, string>> = {
  cascade_v1: {
    classic: 'games.cascade_v1.modes.classic.name',
    pure: 'games.cascade_v1.modes.pure.name',
    speed: 'games.cascade_v1.modes.speed.name',
  },
  glimworm_v1: {
    classic: 'games.glimworm_v1.modes.classic.name',
    battle_royale: 'games.glimworm_v1.modes.battle_royale.name',
    speed: 'games.glimworm_v1.modes.speed.name',
  },
  chess_v1: {
    standard: 'games.chess_v1.lobby.standard',
    chess960: 'games.chess_v1.lobby.chess960',
  },
  checkers_v1: {
    standard: 'games.checkers_v1.lobby.standard',
    giveaway: 'games.checkers_v1.lobby.giveaway',
  },
};

export function resolveGameDisplayInfo(
  gameId: string,
  options?: Record<string, unknown>,
): GameDisplayInfo {
  const normalizedId =
    gameId === 'exploding_kittens_v1' ? 'critical_v1' : gameId;

  const baseName =
    gameMetadata[normalizedId as keyof typeof gameMetadata]?.name ??
    normalizedId;

  const themeId =
    (options?.theme as string | undefined) ??
    (options?.cardVariant as string | undefined);

  const variantId =
    (options?.variant as string | undefined) ??
    (options?.mode as string | undefined);

  let themeName: string | undefined;
  let gradient: string | undefined;
  if (themeId && themeId !== 'random') {
    const sharedTheme = SHARED_THEMES.find((t) => t.id === themeId);
    if (sharedTheme) {
      themeName = sharedTheme.nameKey;
      gradient = sharedTheme.gradient;
    }
  }

  let variantName: string | undefined;
  if (variantId && variantId !== 'random') {
    const modeKey = GAME_MODE_TRANSLATION_KEYS[normalizedId]?.[variantId];
    if (modeKey) {
      variantName = modeKey;
    } else {
      const glimwormMode = GLIMWORM_MODES?.find((m) => m.id === variantId);
      if (glimwormMode) {
        variantName = glimwormMode.name;
        gradient = gradient ?? glimwormMode.gradient;
      } else {
        const sharedTheme = SHARED_THEMES.find((t) => t.id === variantId);
        if (sharedTheme) {
          themeName = themeName ?? sharedTheme.nameKey;
          gradient = gradient ?? sharedTheme.gradient;
        } else {
          variantName = variantId;
        }
      }
    }
  }

  const suffix = variantName ?? themeName;
  const displayName = suffix ? `${baseName}: ${suffix}` : baseName;

  return {
    displayName,
    variantName,
    themeName,
    gradient,
  };
}
