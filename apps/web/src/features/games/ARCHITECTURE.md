# Games Architecture Technical Deep Dive

## System Design

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Game Client Layer                        │
├─────────────────────────────────────────────────────────────┤
│  GameLayout  │  GameControls  │  PlayerList  │  GameCard   │
├─────────────────────────────────────────────────────────────┤
│                    Business Logic Layer                     │
├─────────────────────────────────────────────────────────────┤
│ GameFactory │ GameConfig │ GameProps │ Registry │ Factory   │
├─────────────────────────────────────────────────────────────┤
│                   Game Implementation Layer                 │
├─────────────────────────────────────────────────────────────┤
│ Critical │ TexasHoldem │ Chess │ Checkers │ ...200+... │
├─────────────────────────────────────────────────────────────┤
│                    Data Layer                               │
├─────────────────────────────────────────────────────────────┤
│     GameRoomSummary     │    GameSessionSummary    │ Types  │
└─────────────────────────────────────────────────────────────┘
```

### Core Design Patterns

#### 1. Factory Pattern

- **Purpose**: Centralized game creation and management
- **Implementation**: `GameFactory` class
- **Benefits**: Lazy loading, caching, dependency injection

#### 2. Registry Pattern

- **Purpose**: Central game metadata and configuration
- **Implementation**: `registry.ts` with type-safe slugs
- **Benefits**: Discoverability, validation, type safety

#### 3. Component Composition

- **Purpose**: Reusable UI components
- **Implementation**: Modular React components
- **Benefits**: Consistency, maintainability, scalability

#### 4. Strategy Pattern

- **Purpose**: Different game implementations
- **Implementation**: Each game implements `BaseGameProps`
- **Benefits**: Swappable implementations, polymorphism

## Type System

### Core Interfaces

```typescript
interface BaseGameProps {
  room: GameRoomSummary;
  session: GameSessionSummary | null;
  currentUserId: string | null;
  isHost: boolean;
  config: GameConfig;
  onPostHistoryNote: (message: string, scope: 'all' | 'players') => void;
  onAction?: (action: string, payload?: Record<string, unknown>) => void;
}

interface GameConfig {
  slug: string;
  name: string;
  description: string;
  category: string;
  minPlayers: number;
  maxPlayers: number;
  estimatedDuration?: number;
  complexity?: number;
  ageRating?: string;
  thumbnail?: string;
  version: string;
  supportsAI?: boolean;
  tags?: string[];
}
```

### Type Safety Features

1. **Union Types**: `GameSlug` ensures only valid game identifiers
2. **Generic Constraints**: Components accept specific game types
3. **Discriminated Unions**: Type guards for different game states
4. **Mapped Types**: Configuration validation

## Performance Architecture

### Lazy Loading Strategy

```typescript
// Dynamic imports with code splitting
const gameLoaders: Record<
  string,
  () => Promise<{ default: React.ComponentType<BaseGameProps> }>
> = {
  critical_v1: () => import('./implementations/critical/Game'),
  texas_holdem_v1: () => import('./implementations/texas-holdem/Game'),
  // Each game loads only when needed
};
```

### Caching Strategy

```typescript
class GameFactory {
  private loadedGames: Map<string, React.ComponentType<BaseGameProps>> =
    new Map();

  public async loadGame(
    slug: string,
  ): Promise<React.ComponentType<BaseGameProps>> {
    if (this.loadedGames.has(slug)) {
      return this.loadedGames.get(slug)!; // Return cached component
    }

    const gameModule = await gameLoaders[slug]();
    this.loadedGames.set(slug, gameModule.default);
    return gameModule.default;
  }
}
```

### Bundle Optimization

- **Code Splitting**: Each game in separate bundle
- **Tree Shaking**: Unused components removed
- **Dynamic Imports**: On-demand loading
- **Caching**: Component reuse across sessions

## State Management

### Game State Flow

```
User Action → onAction Callback → Game Logic → State Update → Re-render
```

### State Patterns

1. **Local State**: Component-specific state with React hooks
2. **Session State**: Game-wide state from backend
3. **Global State**: User preferences and settings
4. **Derived State**: Computed from existing state

### State Synchronization

```typescript
// Example state update pattern
const handleGameAction = useCallback(
  (action: string, payload?: any) => {
    // Validate action
    if (!currentUserId) return;

    // Dispatch to game logic
    onAction?.(action, {
      ...payload,
      playerId: currentUserId,
      timestamp: Date.now(),
    });
  },
  [currentUserId, onAction],
);
```

## Component Architecture

### Layout Hierarchy

```
GameLayout
├── ControlPanel (fullscreen, settings, etc.)
└── GameContainer
    ├── GameStatus
    ├── GameArea (game-specific)
    └── Sidebar
        ├── PlayerList
        ├── GameControls
        └── GameInfo
```

### Component Reusability

#### High Reusability

- `GameCard`: Display game in lists
- `GameGrid`: Layout multiple games
- `GameStatus`: Show game state
- `PlayerList`: Display players

#### Medium Reusability

- `GameControls`: Standard game actions
- `ControlPanel`: Common controls

#### Low Reusability

- Game-specific components
- Game logic components

## Error Handling

### Error Boundaries

```typescript
class GameErrorBoundary extends React.Component {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to error reporting service
  }
}
```

### Graceful Degradation

1. **Component Errors**: Fallback UI states
2. **Loading Errors**: Retry mechanisms
3. **Network Errors**: Offline indicators
4. **Game Errors**: Reset to safe state

## Testing Strategy

### Unit Tests

```typescript
// Example game component test
describe('CriticalGame', () => {
  it('should render game lobby', () => {
    const props = createMockProps({ session: null });
    const { getByText } = render(<CriticalGame {...props} />);
    expect(getByText('Critical')).toBeInTheDocument();
  });

  it('should handle game actions', () => {
    const onAction = jest.fn();
    const props = createMockProps({ onAction });
    const { getByText } = render(<CriticalGame {...props} />);

    fireEvent.click(getByText('Play Card'));
    expect(onAction).toHaveBeenCalledWith('playCard');
  });
});
```

### Integration Tests

1. **Game Factory**: Loading and caching
2. **Registry**: Metadata validation
3. **Props Factory**: Props creation and validation
4. **Component Integration**: UI component interactions

### E2E Tests

```typescript
// Example E2E test
describe('Game Flow', () => {
  it('should complete full game cycle', () => {
    cy.visit('/games/critical');
    cy.get('[data-testid="start-button"]').click();
    cy.get('[data-testid="game-board"]').should('be.visible');
    cy.get('[data-testid="player-hand"]').should('have.length.at.least', 2);
  });
});
```

## Security Considerations

### Input Validation

```typescript
// Props validation
const validateProps = (props: BaseGameProps) => {
  const errors: string[] = [];

  if (!props.room?.id) errors.push('Room ID required');
  if (props.room.playerCount < props.config.minPlayers) {
    errors.push(`Minimum players: ${props.config.minPlayers}`);
  }

  return { isValid: errors.length === 0, errors };
};
```

### XSS Prevention

1. **Sanitize User Input**: Player names, chat messages
2. **Escape HTML**: Display user content safely
3. **CSP Headers**: Content Security Policy
4. **Input Length Limits**: Prevent buffer overflows

## Accessibility

### ARIA Support

```typescript
// Example accessible component
const AccessibleGameButton = styled.button`
  &[aria-pressed='true'] {
    background: var(--color-primary);
    color: white;
  }

  &:focus {
    outline: 2px solid var(--color-focus);
    outline-offset: 2px;
  }
`;
```

### Keyboard Navigation

1. **Tab Navigation**: Logical tab order
2. **Shortcuts**: Game-specific keyboard shortcuts
3. **Focus Management**: Proper focus handling
4. **Screen Reader**: ARIA labels and descriptions

## Internationalization

### Translation Structure

```typescript
// Translation keys structure
const translations = {
  games: {
    critical: {
      title: 'Critical',
      cards: {
        explodingCat: 'Exploding Cat',
        defuse: 'Defuse',
        attack: 'Attack',
      },
    },
    texasHoldem: {
      title: "Texas Hold'em",
      actions: {
        fold: 'Fold',
        call: 'Call',
        raise: 'Raise',
      },
    },
  },
};
```

### Dynamic Loading

```typescript
// Load translations for specific game
const loadGameTranslations = async (gameSlug: string) => {
  try {
    const translations = await import(`./locales/${gameSlug}`);
    return translations.default;
  } catch {
    return {}; // Fallback to default translations
  }
};
```

## Monitoring and Analytics

### Performance Metrics

```typescript
// Performance monitoring
const measureGamePerformance = () => {
  const startTime = performance.now();

  return {
    end: () => {
      const endTime = performance.now();
      const loadTime = endTime - startTime;

      // Send to analytics
      analytics.track('game_load_time', {
        game: currentGame,
        loadTime,
        userAgent: navigator.userAgent,
      });
    },
  };
};
```

### Error Tracking

1. **Game Errors**: Capture and categorize
2. **Performance Issues**: Slow loading, rendering
3. **User Actions**: Track interactions
4. **System Health**: Monitor overall health

## Deployment Considerations

### Build Optimization

```json
// package.json build scripts
{
  "scripts": {
    "build:games": "next build --profile",
    "analyze:games": "next build --analyze",
    "test:games": "jest --testPathPattern=games"
  }
}
```

### CDN Strategy

1. **Game Assets**: Images, sounds, etc.
2. **Code Bundles**: Separate bundles per game
3. **Caching Strategy**: Long-term caching with versioning
4. **Fallbacks**: Graceful degradation for slow networks

This architecture provides a solid foundation for scaling to 200+ games while maintaining performance, maintainability, and developer experience.
