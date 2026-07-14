---
name: typescript-pro
description: Write type-safe TypeScript with advanced patterns, generics, utility types, and proper type narrowing. Use when improving type safety, refactoring to strict types, or implementing complex type patterns. Trigger on keywords like TypeScript, types, generics, type safety, strict mode, type narrowing.
---

# TypeScript Pro

## When to Use

- Improving type safety
- Refactoring to strict types
- Implementing complex type patterns
- Adding proper error handling types
- Creating reusable type utilities

## Core Principles

1. **Never use `any`** — use `unknown`, specific types, or generics
2. **Define types for all API payloads** — never rely on inferred `any`
3. **Use type narrowing** — narrow types with guards and assertions
4. **Prefer interfaces for objects** — use types for unions/primitives

## Type Patterns

### Discriminated Unions

```typescript
// API Response types
type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

function handleResponse(response: ApiResponse<User>) {
  if (response.success) {
    // TypeScript knows response.data exists
    console.log(response.data.name);
  } else {
    // TypeScript knows response.error exists
    console.error(response.error);
  }
}
```

### Type Guards

```typescript
function isGameActive(game: Game): game is ActiveGame {
  return game.status === 'active';
}

// Usage
if (isGameActive(game)) {
  // game is narrowed to ActiveGame
  game.currentTurn;
}
```

### Generics

```typescript
// Generic repository pattern
interface Repository<T> {
  findById(id: string): Promise<T | null>;
  find(filter: Partial<T>): Promise<T[]>;
  create(data: Omit<T, 'id'>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<boolean>;
}

// Usage
class GameRepository implements Repository<Game> {
  async findById(id: string): Promise<Game | null> {
    return this.model.findById(id).exec();
  }
  // ...
}
```

### Utility Types

```typescript
// Pick only required fields
type CreateGameDto = Pick<Game, 'name' | 'type' | 'maxPlayers'>;

// Make fields optional
type UpdateGameDto = Partial<Game>;

// Omit sensitive fields
type PublicGame = Omit<Game, 'password' | 'internalNotes'>;

// Record type
type PlayerScores = Record<string, number>;

// Extract union from array
const GAME_TYPES = ['chess', 'checkers', 'go'] as const;
type GameType = typeof GAME_TYPES[number]; // 'chess' | 'checkers' | 'go'
```

### Strict Function Types

```typescript
// Strict event handler
type EventHandler<T> = (event: T) => void | Promise<void>;

// Strict callback with error handling
type AsyncCallback<T, R> = (
  data: T,
  callback: (error: Error | null, result?: R) => void
) => void;

// Promise-based wrapper
function promisify<T, R>(fn: AsyncCallback<T, R>): (data: T) => Promise<R> {
  return (data: T) =>
    new Promise((resolve, reject) => {
      fn(data, (error, result) => {
        if (error) reject(error);
        else resolve(result as R);
      });
    });
}
```

### Template Literal Types

```typescript
type EventName = `${'user' | 'game' | 'system'}:${'created' | 'updated' | 'deleted'}`;

function emit(event: EventName, data: unknown) {
  // ...
}

emit('user:created', userData); // OK
emit('invalid:event', data);    // Error
```

### Mapped Types

```typescript
// Make all properties readonly
type ReadonlyGame = Readonly<Game>;

// Make all properties optional except id
type PartialExceptId<T> = Partial<Omit<T, 'id'>> & { id: string };

// Add timestamp fields
type WithTimestamps<T> = T & {
  createdAt: Date;
  updatedAt: Date;
};
```

### Conditional Types

```typescript
// Extract return type based on input
type ApiResult<T> = T extends 'user' ? User : Game;

// Conditional extraction
type NonNullableFields<T> = {
  [K in keyof T]: NonNullable<T[K]>;
};
```

## Common Patterns

### Strict Config

```typescript
interface AppConfig {
  port: number;
  mongoUri: string;
  jwtSecret: string;
  corsOrigins: string[];
}

// Validate config at startup
function validateConfig(config: Partial<AppConfig>): AppConfig {
  const required: (keyof AppConfig)[] = ['port', 'mongoUri', 'jwtSecret'];
  for (const key of required) {
    if (!config[key]) {
      throw new Error(`Missing required config: ${key}`);
    }
  }
  return config as AppConfig;
}
```

### Strict API Types

```typescript
// Request/Response types
interface CreateGameRequest {
  name: string;
  type: GameType;
  maxPlayers: number;
}

interface CreateGameResponse {
  id: string;
  name: string;
  createdAt: Date;
}

// API client with strict types
async function createGame(data: CreateGameRequest): Promise<CreateGameResponse> {
  const response = await fetch('/api/games', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create game');
  return response.json();
}
```

## Constraints

### MUST DO
- Use `unknown` instead of `any`
- Define types for all API payloads
- Use type guards for narrowing
- Use `as const` for literal types
- Export all public types
- Use strict mode in tsconfig

### MUST NOT DO
- Use `any` type
- Use `@ts-ignore` or `@ts-expect-error` without comment
- Use type assertions (`as`) without justification
- Leave implicit `any` in function parameters
- Use `Object` or `Function` types
