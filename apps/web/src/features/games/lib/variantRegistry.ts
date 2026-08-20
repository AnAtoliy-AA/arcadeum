import { SHARED_THEMES } from '@/features/games/lib/shared-themes';
import { GLIMWORM_MODES } from '@/features/games/lib/glimwormVariants';
import { gameMetadata } from '@/features/games/registry';

export interface GameDisplayInfo {
  displayName: string;
  variantName?: string;
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

  const variantId =
    (options?.variant as string | undefined) ??
    (options?.cardVariant as string | undefined) ??
    (options?.theme as string | undefined);

  if (!variantId || variantId === 'random') {
    return { displayName: baseName };
  }

  const sharedTheme = SHARED_THEMES.find((t) => t.id === variantId);
  if (sharedTheme) {
    return {
      displayName: `${baseName}: ${sharedTheme.nameKey}`,
      variantName: sharedTheme.nameKey,
      gradient: sharedTheme.gradient,
    };
  }

  const glimwormMode = GLIMWORM_MODES?.find((m) => m.id === variantId);
  if (glimwormMode) {
    return {
      displayName: `${baseName}: ${glimwormMode.name}`,
      variantName: glimwormMode.name,
      gradient: glimwormMode.gradient,
    };
  }

  return { displayName: baseName };
}
