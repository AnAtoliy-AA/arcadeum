// Export all public APIs for the games feature

// Types
export type {
  GameConfig,
  GameMetadata,
  BaseGameProps,
  GameState,
  GameAction,
  GameEvent,
  GameStatistics,
  GameAchievement,
  GameAnalytics,
} from './types';

// Registry
export { gameLoaders, gameMetadata, type GameSlug } from './registry';

// UI Components
export { GameContainer } from './ui/GameContainer';

export { GameLayout } from './ui/GameLayout';

export { GameCard } from './ui/GameCard';

export { GameGrid } from './ui/GameGrid';

export { GameStatus } from './ui/GameStatus';

export {
  GameControls,
  LeaveButton,
  StartButton,
  ReadyButton,
} from './ui/GameControls';

export { PlayerList } from './ui/PlayerList';

export {
  ReusableGameLobby,
  type ReusableGameLobbyProps,
  type GameLobbyTheme,
  // Styled components for extension
  GameContainer as LobbyGameContainer,
  GameHeader as LobbyGameHeader,
  IconButton,
  StartButton as LobbyStartButton,
} from './ui/ReusableGameLobby';

export { AVATAR_COLORS } from './ui/SortablePlayerItem';

// Re-export lobby styles
export * from './ui/lobbyStyles';

export { GamesSearch } from './GamesSearch/GamesSearch';

// Libraries
export { GameFactory, gameFactory, useGameFactory } from './lib/gameFactory';

export {
  GameConfigManager,
  gameConfigManager,
  useGameConfig,
} from './lib/gameConfig';

export { GamePropsFactory, GamePropsGuards } from './lib/gameProps';
