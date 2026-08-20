import { SHARED_THEMES } from '@/features/games/lib/shared-themes';
import { GLIMWORM_MODES } from '@/features/games/lib/glimwormVariants';
import { gameMetadata } from '@/features/games/registry';

export interface GameDisplayInfo {
  displayName: string;
  variantName?: string;
  themeName?: string;
  gradient?: string;
}

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

  const suffix = variantName ?? themeName;
  const displayName = suffix ? `${baseName}: ${suffix}` : baseName;

  return {
    displayName,
    variantName,
    themeName,
    gradient,
  };
}
