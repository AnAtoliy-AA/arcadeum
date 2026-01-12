# Games Feature Architecture

This document describes the new modular and scalable architecture for the games feature, designed to support 200+ games with maximum code reuse and separation of concerns.

## Architecture Overview

The new architecture follows these key principles:

1. **Separation of Concerns**: Each game is completely isolated
2. **Reusability**: Common components are extracted and shared
3. **Scalability**: Easy to add new games without affecting existing ones
4. **Type Safety**: Full TypeScript support throughout
5. **Modularity**: Each game can be developed independently

## File Structure

```
apps/web/src/features/games/
├── types/                    # Type definitions
│   ├── base.ts              # Base interfaces and types
│   ├── index.ts             # Re-exports all types
│   └── ...
├── ui/                      # Reusable UI components
│   ├── GameContainer.tsx    # Base game container
│   ├── GameLayout.tsx       # Standardized layout
│   ├── GameCard.tsx         # Game card component
│   ├── GameGrid.tsx         # Grid layout for games
│   ├── GameStatus.tsx       # Game status indicator
│   ├── GameControls.tsx     # Standard game controls
│   ├── PlayerList.tsx       # Player list component
│   └── ControlPanel.tsx     # Control panel (fullscreen, etc.)
├── lib/                     # Business logic libraries
│   ├── gameFactory.ts       # Game loading and management
│   ├── gameConfig.ts        # Game configuration management
│   ├── gameProps.ts         # Props factory and validation
│   └── index.ts             # Library exports
├── implementations/         # Game implementations
│   ├── critical/     # Critical game
│   │   └── Game.tsx
│   ├── texas-holdem/       # Texas Hold'em game
│   │   └── Game.tsx
│   └── [game-name]/        # Future games
│       └── Game.tsx
├── registry.ts              # Game registry and metadata
├── registry.types.ts        # Game slug type definitions
├── index.ts                 # Main feature exports
└── README.md               # This documentation
```

## Core Components

### 1. Base Types (`types/base.ts`)

Defines the foundation interfaces:

- `BaseGameProps`: Standardized props for all games
- `GameConfig`: Game configuration and metadata
- `GameMetadata`: Extended metadata for the registry
- `GameState`: Game state management
- `GameAction`: Standardized game actions
- `GameEvent`: Game lifecycle events

### 2. Game Registry (`registry.ts`)

Central registry for all games:

- `gameLoaders`: Dynamic imports for lazy loading
- `gameMetadata`: Game metadata and configuration
- Type-safe game slug definitions

### 3. Game Factory (`lib/gameFactory.ts`)

Singleton factory for game management:

- Lazy loading of game components
- Caching for performance
- Game discovery and search
- Statistics and analytics

### 4. UI Components

#### GameLayout

Standardized layout with:

- Fullscreen support
- Control panel integration
- Responsive design

#### GameControls

Reusable control components:

- Start buttons
- Ready buttons
- Leave buttons
- Custom actions

#### GameCard

Display component for:

- Game thumbnails
- Metadata display
- Status indicators
- Interactive cards

### 5. Game Implementations

Each game follows the standardized interface:

```tsx
export default function GameName({
  room,
  session,
  currentUserId,
  isHost,
  onPostHistoryNote,
  config,
  onAction,
}: BaseGameProps) {
  // Game implementation
}
```

## Adding a New Game

### Step 1: Define Game Metadata

Update `registry.ts`:

```typescript
// Add to gameLoaders
export const gameLoaders = {
  ...existingGames,
  new_game_v1: () => import('./implementations/new-game/Game'),
};

// Add to gameMetadata
export const gameMetadata = {
  ...existingMetadata,
  new_game_v1: {
    slug: 'new_game_v1',
    name: 'New Game',
    description: 'A fun new game',
    category: 'Board Game',
    minPlayers: 2,
    maxPlayers: 4,
    estimatedDuration: 30,
    complexity: 3,
    ageRating: 'G',
    thumbnail: '/games/new-game.jpg',
    version: '1.0.0',
    supportsAI: true,
    tags: ['board', 'strategy'],
    implementationPath: './implementations/new-game/Game',
    lastUpdated: '2024-01-01',
    status: 'beta',
  },
};
```

### Step 2: Create Game Implementation

Create `implementations/new-game/Game.tsx`:

```tsx
'use client';

import { BaseGameProps } from '@/features/games/types';

export default function NewGame({
  room,
  session,
  currentUserId,
  isHost,
  onPostHistoryNote,
  config,
  onAction,
}: BaseGameProps) {
  // Use GameLayout for consistent styling
  return <GameLayout>{/* Your game implementation */}</GameLayout>;
}
```

### Step 3: Add Type Definition

Update `registry.types.ts`:

```typescript
export type GameSlug = 'critical_v1' | 'texas_holdem_v1' | 'new_game_v1'; // Add your game
// ... rest of games
```

## Best Practices

### 1. Component Structure

- Use `GameLayout` as the base container
- Leverage existing UI components when possible
- Keep game-specific logic isolated
- Use the `onAction` callback for game interactions

### 2. Styling

- Use styled-components with theme support
- Follow the design system
- Ensure responsive design
- Support both light and dark themes

### 3. State Management

- Use React hooks for local state
- Leverage the game session for shared state
- Use `onAction` for game-specific actions
- Keep components pure when possible

### 4. Performance

- Implement lazy loading
- Use React.memo for expensive components
- Optimize re-renders with useCallback
- Consider virtualization for large lists

## Migration Guide

### From Old Architecture

1. **Extract Game Logic**: Move game-specific logic to new implementation
2. **Update Props**: Use `BaseGameProps` interface
3. **Add Layout**: Wrap with `GameLayout`
4. **Update Imports**: Use new import paths
5. **Add Metadata**: Register in game registry

### Example Migration

**Before:**

```tsx
// Old implementation
const OldGame = ({ room, session, userId, isHost }) => {
  // Game logic
};
```

**After:**

```tsx
// New implementation
export default function NewGame({
  room,
  session,
  currentUserId,
  isHost,
  onPostHistoryNote,
  config,
  onAction,
}: BaseGameProps) {
  return <GameLayout>{/* Game implementation */}</GameLayout>;
}
```

## Testing

### Unit Tests

Each game should have:

- Component tests
- Logic tests
- Integration tests

### E2E Tests

Test scenarios:

- Game loading
- Player interactions
- State management
- Error handling

## Development Workflow

1. **Setup**: Clone repository and install dependencies
2. **Create**: Add game metadata and implementation
3. **Test**: Run tests and verify functionality
4. **Deploy**: Follow deployment process

## Performance Considerations

### Lazy Loading

Games are loaded on-demand using dynamic imports:

```typescript
gameLoaders: {
  game_slug: () => import("./implementations/game/Game"),
}
```

### Caching

GameFactory caches loaded components:

```typescript
const gameComponent = await gameFactory.loadGame('game_slug');
```

### Bundle Splitting

Each game is in a separate bundle for optimal loading.

## Future Enhancements

- AI opponent integration
- Tournament mode support
- Spectator mode
- Game analytics
- Achievement system
- Multiplayer enhancements

## Contributing

1. Follow the established patterns
2. Add comprehensive tests
3. Update documentation
4. Ensure type safety
5. Test with multiple games

## Support

For questions or issues:

- Check this documentation
- Review existing game implementations
- Create an issue with detailed description
- Include reproduction steps
