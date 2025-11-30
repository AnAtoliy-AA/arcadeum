# Games Module - Scalable Game Engine Architecture

## 🎮 Overview

This module implements a **scalable, modular game engine architecture** designed to support **200+ games** without becoming a maintenance nightmare.

## ✨ Key Features

- **Pluggable Game Engines**: Each game is a self-contained engine
- **Consistent API**: All games use the same interface
- **Type-Safe**: Full TypeScript support with game-specific types
- **Testable**: Each engine can be tested in isolation
- **Reusable**: Common utilities in base engine class
- **Centralized Registry**: Auto-discovery of all available games

## 📁 Structure

```
games/
├── engines/                   # 🎯 Game engine implementations
│   ├── base/                  # Core abstractions
│   ├── registry/              # Engine registry
│   ├── exploding-cats/        # Exploding Cats engine
│   ├── texas-holdem/          # Texas Hold'em engine
│   └── engines.module.ts      # Auto-registration module
├── schemas/                   # MongoDB schemas (rooms, sessions)
├── dtos/                      # Data transfer objects
├── games.service.ts           # Infrastructure service
├── games.gateway.ts           # WebSocket gateway
├── games.controller.ts        # HTTP controller
└── games.module.ts            # Main module
```

## 🚀 Quick Start: Adding a New Game

### 1. Create State Types

```typescript
// engines/my-game/my-game.state.ts
export interface MyGameState extends BaseGameState {
  players: Array<{
    playerId: string;
    score: number;
  }>;
  currentRound: number;
  // ... your game-specific state
}
```

### 2. Implement Engine

```typescript
// engines/my-game/my-game.engine.ts
@Injectable()
export class MyGameEngine extends BaseGameEngine<MyGameState> {
  getMetadata() {
    return {
      gameId: 'my_game_v1',
      name: 'My Game',
      minPlayers: 2,
      maxPlayers: 4,
      version: '1.0.0',
    };
  }

  initializeState(playerIds: string[]) {
    return {
      players: playerIds.map(id => ({ playerId: id, score: 0 })),
      currentRound: 1,
      logs: [],
    };
  }

  executeAction(state, action, context, payload) {
    // Your game logic here
  }

  // ... implement other required methods
}
```

### 3. Register Engine

```typescript
// engines/engines.module.ts
import { MyGameEngine } from './my-game/my-game.engine';

@Module({
  providers: [
    GameEngineRegistry,
    MyGameEngine, // Add your engine
    // ... other engines
  ],
})
export class GameEnginesModule {
  onModuleInit() {
    this.registry.register(this.myGameEngine); // Register it
  }
}
```

**That's it!** Your game is now available through the same API as all other games. 🎉

## 🏗️ Architecture

### Game Engine Interface

Every game implements `IGameEngine<TState>`:

```typescript
interface IGameEngine {
  // Core Methods
  getMetadata(): GameMetadata;
  initializeState(playerIds: string[]): TState;
  executeAction(state, action, context, payload): GameActionResult;
  validateAction(state, action, context, payload): boolean;

  // Game State
  isGameOver(state): boolean;
  getWinners(state): string[];
  sanitizeStateForPlayer(state, playerId): Partial<TState>;
  getAvailableActions(state, playerId): string[];

  // Optional
  removePlayer?(state, playerId): GameActionResult;
}
```

### Base Engine Utilities

`BaseGameEngine<TState>` provides helpers:

- `cloneState()` - Deep clone game state
- `shuffleArray()` - Shuffle arrays in-place
- `findPlayer()` - Find player by ID
- `isPlayerTurn()` - Check if it's a player's turn
- `advanceTurn()` - Move to next player
- `createLogEntry()` - Create game log entries
- `successResult()` / `errorResult()` - Result helpers

### Game Engine Registry

Manages all game engines:

```typescript
@Injectable()
class GameEngineRegistry {
  register(engine: IGameEngine): void;
  getEngine(gameId: string): IGameEngine;
  getAllMetadata(): GameMetadata[];
  getStats(): { totalGames: number };
}
```

## 📊 Current Games

| Game | Game ID | Status | Players |
|------|---------|--------|---------|
| Exploding Cats | `exploding_cats_v1` | ✅ Active | 2-5 |
| Texas Hold'em | `texas_holdem_v1` | ✅ Active | 2-9 |

## 🔄 Migration Status

### ✅ Completed
- Base game engine interface and abstract class
- Game engine registry system
- Exploding Cats engine extraction
- Texas Hold'em engine extraction
- Engine auto-registration module
- Comprehensive documentation

### ⏳ In Progress
- Update `GamesService` to delegate to engines
- Update `GamesGateway` to use engine actions
- Remove game-specific methods from service

### 📋 Future
- Add more games (Chess, Checkers, Tic-Tac-Toe)
- Game versioning support
- AI opponent framework
- Tournament system
- Replay functionality

## 🧪 Testing

Each engine should have comprehensive unit tests:

```typescript
describe('MyGameEngine', () => {
  let engine: MyGameEngine;

  beforeEach(() => {
    engine = new MyGameEngine();
  });

  it('should initialize game state', () => {
    const state = engine.initializeState(['player1', 'player2']);
    expect(state.players).toHaveLength(2);
  });

  it('should validate player actions', () => {
    const state = engine.initializeState(['player1']);
    const valid = engine.validateAction(state, 'my_action', context);
    expect(valid).toBe(true);
  });

  // ... more tests
});
```

## 📚 Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Detailed architecture documentation
- **[Example: Exploding Cats Engine](./engines/exploding-cats/exploding-cats.engine.ts)** - Complete example
- **[Example: Texas Hold'em Engine](./engines/texas-holdem/texas-holdem.engine.ts)** - Another example

## 🤝 Contributing

When adding a new game:

1. Read the [Architecture Guide](./ARCHITECTURE.md)
2. Study existing engines (`exploding-cats`, `texas-holdem`)
3. Create your game state types
4. Implement the `IGameEngine` interface
5. Extend `BaseGameEngine` for utilities
6. Register in `engines.module.ts`
7. Write comprehensive tests
8. Update this README with your game

## 🎯 Benefits

### For Developers
- **Consistency**: Same patterns across all games
- **Productivity**: Base class provides common utilities
- **Safety**: Type-safe game-specific actions
- **Testing**: Easy to test in isolation

### For the Project
- **Scalability**: Easy to add 200+ games
- **Maintainability**: Game logic is isolated
- **Performance**: Only load engines you need
- **Flexibility**: Swap/update engines independently

## 📞 Support

Questions about the architecture? Check:
1. [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed docs
2. Existing engine implementations for examples
3. Ask the team for help!

---

**Last Updated**: 2025-01-28
**Architecture Version**: 1.0.0
**Total Games**: 2
