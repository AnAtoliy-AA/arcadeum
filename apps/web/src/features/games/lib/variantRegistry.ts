import { CARD_VARIANTS } from '@/app/games/create/constants';
import { SEA_BATTLE_VARIANTS } from '@/widgets/SeaBattleGame/lib/constants';
import { gameMetadata } from '@/features/games/registry';

export interface GameDisplayInfo {
  displayName: string;
  variantName?: string;
  gradient?: string;
}

type ResolverFn = (
  options: Record<string, unknown> | undefined,
  baseName: string,
) => GameDisplayInfo;

const criticalResolver: ResolverFn = (options, baseName) => {
  if (!options?.cardVariant || options.cardVariant === 'random') {
    return { displayName: baseName };
  }
  const variant = CARD_VARIANTS.find((v) => v.id === options.cardVariant);
  return {
    displayName: variant ? `${baseName}: ${variant.name}` : baseName,
    variantName: variant?.name,
    gradient: variant?.gradient,
  };
};

const seaBattleResolver: ResolverFn = (options, baseName) => {
  const variantId =
    (options?.variant as string) || (options?.cardVariant as string);

  if (!variantId) return { displayName: baseName };

  const variant = SEA_BATTLE_VARIANTS.find((v) => v.id === variantId);
  return {
    displayName: variant ? `${baseName}: ${variant.name}` : baseName,
    variantName: variant?.name,
    gradient: variant?.gradient,
  };
};

const REGISTRY: Record<string, ResolverFn> = {
  critical_v1: criticalResolver,
  sea_battle_v1: seaBattleResolver,
  // Add future games here
};

export function resolveGameDisplayInfo(
  gameId: string,
  options?: Record<string, unknown>,
): GameDisplayInfo {
  // Map legacy IDs if needed
  const normalizedId =
    gameId === 'exploding_kittens_v1' ? 'critical_v1' : gameId;

  const baseName =
    gameMetadata[normalizedId as keyof typeof gameMetadata]?.name ??
    normalizedId;

  const resolver = REGISTRY[normalizedId];
  if (resolver) {
    return resolver(options, baseName);
  }

  return { displayName: baseName };
}
