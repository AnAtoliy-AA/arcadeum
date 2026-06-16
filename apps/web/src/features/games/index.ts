// Public APIs for the games feature
//
// NOTE: This barrel intentionally omits heavy UI components (GameContainer,
// GameCard, GameGrid, etc.) to avoid pulling them into shared chunks.
// Import them directly from '@/features/games/ui/GameCard' etc. instead.

// Types
export type {
  GameConfig,
  GameMetadata,
  BaseGameProps,
  BaseGameWidgetProps,
  GameState,
  GameAction,
  GameEvent,
  GameStatistics,
  GameAchievement,
  GameAnalytics,
} from './types';

// Registry
export { gameLoaders, gameMetadata, type GameSlug } from './registry';

// Libraries
export { GameFactory, gameFactory, useGameFactory } from './lib/gameFactory';

export {
  GameConfigManager,
  gameConfigManager,
  useGameConfig,
} from './lib/gameConfig';

export { GamePropsFactory, GamePropsGuards } from './lib/gameProps';

// UI (lightweight only — heavy components imported directly)
export { GamesSearch } from './GamesSearch/GamesSearch';
