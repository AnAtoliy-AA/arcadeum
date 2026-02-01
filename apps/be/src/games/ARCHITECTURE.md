# Game Engine Architecture

## Overview

This document describes the modular, scalable game engine architecture designed to support 200+ games.

## Architecture Principles

1. **Separation of Concerns**: Game logic is separated from infrastructure code
2. **Single Responsibility**: Each game engine handles only its game's logic
3. **Open/Closed**: Easy to add new games without modifying existing code
4. **Dependency Inversion**: Services depend on abstractions, not concrete implementations

## Directory Structure

```
src/games/
├── engines/                      # Game engine implementations
│   ├── base/                     # Base abstractions
│   │   ├── game-engine.interface.ts    # Core interface
│   │   ├── base-game-engine.abstract.ts # Base class with helpers
│   │   └── index.ts
│   ├── registry/                 # Engine registry
│   │   ├── game-engine.registry.ts
│   │   └── index.ts
│   ├── critical/           # Critical engine
│   │   └── critical.engine.ts
│   ├── texas-holdem/             # Texas Hold'em engine
│   │   └── texas-holdem.engine.ts
│   ├── engines.module.ts         # Module that registers all engines
│   └── index.ts
├── schemas/                      # MongoDB schemas
├── dtos/                         # Data transfer objects
├── games.service.ts              # Infrastructure service (rooms, sessions)
├── games.gateway.ts              # WebSocket gateway
├── games.controller.ts           # HTTP controller
└── games.module.ts               # Main games module
```

## Core Concepts

### 1. Game Engine Interface (`IGameEngine`)

Every game must implement this interface:

```typescript
interface IGameEngine<TState extends BaseGameState> {
  // Get game metadata (name, min/max players, etc.)
  getMetadata(): GameMetadata;

  // Initialize game state with players
  initializeState(playerIds: string[], config?: any): TState;

  // Validate if an action is allowed
  validateAction(
    state: TState,
    action: string,
    context: GameActionContext,
    payload?: any,
  ): boolean;

  // Execute an action and return new state
  executeAction(
    state: TState,
    action: string,
    context: GameActionContext,
    payload?: any,
  ): GameActionResult<TState>;

  // Check if game is over
  isGameOver(state: TState): boolean;

  // Get winners
  getWinners(state: TState): string[];

  // Hide private information for a player
  sanitizeStateForPlayer(state: TState, playerId: string): Partial<TState>;

  // Get available actions for a player
  getAvailableActions(state: TState, playerId: string): string[];

  // Optional: Handle player leaving
  removePlayer?(state: TState, playerId: string): GameActionResult<TState>;
}
```

### 2. Base Game Engine (`BaseGameEngine`)

Abstract class providing common functionality:

- State cloning
- Array shuffling
- Log entry creation
- Player finding
- Turn advancement
- Success/error result helpers

Game engines extend this class to inherit utilities.

### 3. Game Engine Registry

Central registry managing all game engines:

```typescript
@Injectable()
class GameEngineRegistry {
  register(engine: IGameEngine): void;
  getEngine(gameId: string): IGameEngine;
  hasEngine(gameId: string): boolean;
  getAllMetadata(): GameMetadata[];
}
```

## How to Add a New Game

### Step 1: Create Game State Types

Create a file with your game's state types:

```typescript
// games/my-game/my-game.state.ts
export interface MyGamePlayerState {
  playerId: string;
  score: number;
  // ... other player-specific state
}

export interface MyGameState extends BaseGameState {
  players: MyGamePlayerState[];
  logs: GameLogEntry[];
  currentTurnIndex: number;
  // ... other game-specific state
}

export function createInitialMyGameState(playerIds: string[]): MyGameState {
  return {
    players: playerIds.map((id) => ({ playerId: id, score: 0 })),
    logs: [],
    currentTurnIndex: 0,
    // ... initialize other state
  };
}
```

### Step 2: Implement Game Engine

Create your game engine in `engines/my-game/`:

```typescript
// games/engines/my-game/my-game.engine.ts
import { Injectable } from '@nestjs/common';
import { BaseGameEngine } from '../base/base-game-engine.abstract';
import { MyGameState } from '../../my-game/my-game.state';

@Injectable()
export class MyGameEngine extends BaseGameEngine<MyGameState> {
  getMetadata(): GameMetadata {
    return {
      gameId: 'my_game_v1',
      name: 'My Awesome Game',
      minPlayers: 2,
      maxPlayers: 4,
      version: '1.0.0',
      description: 'An awesome game',
      category: 'Strategy',
    };
  }

  initializeState(playerIds: string[], config?: any): MyGameState {
    return createInitialMyGameState(playerIds);
  }

  validateAction(
    state: MyGameState,
    action: string,
    context: GameActionContext,
    payload?: any,
  ): boolean {
    // Implement validation logic
    switch (action) {
      case 'my_action':
        return this.isPlayerTurn(state, context.userId);
      default:
        return false;
    }
  }

  executeAction(
    state: MyGameState,
    action: string,
    context: GameActionContext,
    payload?: any,
  ): GameActionResult<MyGameState> {
    if (!this.validateAction(state, action, context, payload)) {
      return this.errorResult('Invalid action');
    }

    const newState = this.cloneState(state);

    switch (action) {
      case 'my_action':
        // Implement action logic
        this.advanceTurn(newState);
        return this.successResult(newState);
      default:
        return this.errorResult('Unknown action');
    }
  }

  isGameOver(state: MyGameState): boolean {
    // Implement game over logic
    return state.players.some((p) => p.score >= 100);
  }

  getWinners(state: MyGameState): string[] {
    // Implement winner determination
    const maxScore = Math.max(...state.players.map((p) => p.score));
    return state.players
      .filter((p) => p.score === maxScore)
      .map((p) => p.playerId);
  }

  sanitizeStateForPlayer(
    state: MyGameState,
    playerId: string,
  ): Partial<MyGameState> {
    // Hide private information
    return this.cloneState(state);
  }

  getAvailableActions(state: MyGameState, playerId: string): string[] {
    if (!this.isPlayerTurn(state, playerId)) return [];
    return ['my_action'];
  }
}
```

### Step 3: Register Engine

Add to `engines/engines.module.ts`:

```typescript
import { MyGameEngine } from './my-game/my-game.engine';

@Module({
  providers: [
    GameEngineRegistry,
    CriticalEngine,
    TexasHoldemEngine,
    MyGameEngine, // Add here
  ],
  exports: [GameEngineRegistry],
})
export class GameEnginesModule implements OnModuleInit {
  constructor(
    private readonly registry: GameEngineRegistry,
    private readonly criticalEngine: CriticalEngine,
    private readonly texasHoldemEngine: TexasHoldemEngine,
    private readonly myGameEngine: MyGameEngine, // Inject here
  ) {}

  onModuleInit() {
    this.registry.register(this.criticalEngine);
    this.registry.register(this.texasHoldemEngine);
    this.registry.register(this.myGameEngine); // Register here
  }
}
```

### Step 4: Use in Service

The `GamesService` automatically uses registered engines:

```typescript
const engine = this.engineRegistry.getEngine(gameId);
const state = engine.initializeState(playerIds, config);
const result = engine.executeAction(state, action, context, payload);
```

## Benefits of This Architecture

### ✅ Scalability

- Each game is completely independent
- No modification of core service needed for new games
- Easy to maintain 200+ games

### ✅ Testability

- Each game engine can be unit tested in isolation
- Mock engines for integration tests
- No coupling between games

### ✅ Reusability

- Base engine provides common utilities
- Consistent patterns across all games
- Shared infrastructure (rooms, sessions, WebSockets)

### ✅ Type Safety

- Full TypeScript type safety
- Game-specific state types
- Compile-time checks for actions

### ✅ Maintainability

- Clear separation of concerns
- Easy to find and fix game-specific bugs
- Simple to add/remove/update games

## Migration Path

1. ✅ Create base abstractions (interfaces, base class)
2. ✅ Create game engine registry
3. ✅ Extract Critical logic into engine
4. ✅ Extract Texas Hold'em logic into engine
5. ⏳ Refactor `GamesService` to use engines
6. ⏳ Update `GamesGateway` to delegate to engines
7. ⏳ Deprecate game-specific methods in service
8. ⏳ Add integration tests

## Example: Adding a Simple Tic-Tac-Toe Game

```typescript
// 1. Define state
export interface TicTacToeState extends BaseGameState {
  board: ('X' | 'O' | null)[][];
  currentSymbol: 'X' | 'O';
}

// 2. Implement engine
@Injectable()
export class TicTacToeEngine extends BaseGameEngine<TicTacToeState> {
  getMetadata() {
    return { gameId: 'tic_tac_toe_v1', name: 'Tic Tac Toe' /* ... */ };
  }

  initializeState(playerIds: string[]) {
    return {
      board: [
        [null, null, null],
        [null, null, null],
        [null, null, null],
      ],
      players: playerIds.map((id) => ({ playerId: id })),
      currentSymbol: 'X',
      logs: [],
      currentTurnIndex: 0,
    };
  }

  executeAction(state, action, context, payload) {
    const { row, col } = payload;
    const newState = this.cloneState(state);
    newState.board[row][col] = newState.currentSymbol;
    newState.currentSymbol = newState.currentSymbol === 'X' ? 'O' : 'X';
    this.advanceTurn(newState);
    return this.successResult(newState);
  }

  // ... implement other methods
}

// 3. Register in module
// Done! Game is now playable through the same API as other games
```

## Future Enhancements

- **Game Engine Versioning**: Support multiple versions of the same game
- **Plugin System**: Load games dynamically from external packages
- **Game Templates**: Templates for common game types (turn-based, real-time, etc.)
- **AI Integration**: Standard interface for AI opponents
- **Replay System**: Record and replay games using action log
- **Tournament Support**: Multi-game tournament brackets
- **Matchmaking**: Skill-based matchmaking per game
- **Analytics**: Per-game analytics and statistics

## Questions?

See the example engines in `engines/critical/` and `engines/texas-holdem/` for complete implementations.
