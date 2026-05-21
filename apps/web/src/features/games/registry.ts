import type { BaseGameWidgetProps } from './types';
import type { GameSlug } from './registry.types';

export { GameSlug };
export { gameMetadata } from './gameMetadata';

export const gameLoaders: Record<
  string,
  () => Promise<{ default: React.ComponentType<BaseGameWidgetProps> }>
> = {
  critical_v1: () => import('@/widgets/CriticalGame'),
  sea_battle_v1: () => import('@/widgets/SeaBattleGame'),
  // Future game implementations will be added here
  // chess_v1: () => import("@/widgets/ChessGame"),
  // checkers_v1: () => import("@/widgets/CheckersGame"),
  // Add more games as they are implemented
} as const;
