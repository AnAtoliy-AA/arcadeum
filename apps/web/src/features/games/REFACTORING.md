# Game System Refactoring Guide

## Overview

This document explains the refactored game architecture designed to scale from 2 games to 200+ games while maintaining clean, maintainable code.

## Architecture Summary

### Before Refactoring
- **GameRoomPage.tsx**: 771 lines of monolithic code
- Socket logic mixed with UI logic
- Game-specific code duplicated
- Hard to test and maintain

### After Refactoring
- **GameRoomPage.tsx**: 172 lines (77.7% reduction!)
- Clean separation of concerns
- Reusable hooks for socket management
- Easily extensible for new games

---

## New Architecture Components

### 1. Custom Hooks (`/features/games/hooks/`)

#### `useGameRoom()`
**Purpose**: Manages game room connection and state

**Returns**:
- `room`: Current room data
- `loading`: Loading state
- `error`: Error messages
- `isHost`: Whether current user is the host
- `joinRoom()`: Join room function
- `leaveRoom()`: Leave room function

**Usage**:
```typescript
const { room, loading, error, isHost } = useGameRoom({
  roomId,
  userId: snapshot.userId,
  accessToken: snapshot.accessToken,
  mode: "play", // or "watch"
});
```

**What it handles**:
- Socket connection to room
- Room join/leave events
- Room state updates
- Error handling with auto-clear

---

#### `useGameSession()`
**Purpose**: Manages game session state and action states

**Returns**:
- `session`: Current session data
- `startBusy`: Whether game is starting
- `actionBusy`: Current action in progress
- `setActionBusy()`: Update action state

**Usage**:
```typescript
const { session, actionBusy, setActionBusy } = useGameSession({
  roomId,
  enabled: !!room,
});
```

**What it handles**:
- Session snapshot updates
- Session started events
- Action busy states
- Auto-clearing action states

---

#### `useGameActions()`
**Purpose**: Provides game-specific action emitters

**Returns**:
```typescript
{
  // Exploding Cats actions
  drawCard: () => void;
  playActionCard: (card: string) => void;
  playFavor: (targetPlayerId: string, desiredCard: string) => void;
  playSeeTheFuture: () => void;
  playCatCombo: (cat, mode, targetPlayerId?, desiredCard?) => void;

  // Texas Hold'em actions
  startHoldem: (startingChips?: number) => void;
  holdemAction: (action, raiseAmount?) => void;

  // Common actions
  postHistoryNote: (message: string, scope: "all" | "players") => void;
}
```

**Usage**:
```typescript
const actions = useGameActions({
  roomId,
  userId: snapshot.userId,
  gameType: "texas_holdem_v1",
  onActionComplete: () => setActionBusy(null),
});

// Use actions
actions.holdemAction("raise", 50);
actions.postHistoryNote("Good hand!", "all");
```

**What it handles**:
- All socket event emissions
- Game-specific action listeners
- Action completion callbacks
- Cleanup on unmount

---

### 2. Control Panel Component

**Location**: `/features/games/ui/ControlPanel.tsx`

**Features**:
- ✅ Fullscreen mode toggle
- ✅ Leave room button
- ✅ Optional move controls (for spatial games)
- ✅ Responsive design
- ✅ Keyboard shortcuts

**Usage**:
```typescript
<ControlPanel
  roomId={roomId}
  showMoveControls={false} // Enable for spatial games
/>
```

---

## Refactored GameRoomPage Structure

```typescript
export default function GameRoomPage() {
  // 1. Get room ID from URL
  const roomId = useParams()?.id;

  // 2. Use hooks for data management
  const { room, loading, error, isHost } = useGameRoom({ ... });
  const { session, actionBusy, setActionBusy } = useGameSession({ ... });
  const actions = useGameActions({ ... });

  // 3. Determine game type
  const gameType = useMemo(() => {
    if (room?.gameId === "exploding_cats_v1") return "exploding_cats_v1";
    if (room?.gameId === "texas_holdem_v1") return "texas_holdem_v1";
    return null;
  }, [room]);

  // 4. Render appropriate game component
  return (
    <Page>
      <ControlPanel roomId={roomId} />

      {gameType === "exploding_cats_v1" && (
        <ExplodingCatsGame {...props} />
      )}

      {gameType === "texas_holdem_v1" && (
        <TexasHoldemGame {...props} />
      )}
    </Page>
  );
}
```

**Benefits**:
- Single responsibility principle
- Easy to test each hook independently
- Game components are self-contained
- Adding new games is trivial

---

## Adding a New Game (Step-by-Step)

### 1. Create Game Component

**Location**: `/widgets/games/implementations/your-game/Game.tsx`

```typescript
"use client";

interface YourGameProps {
  room: GameRoomSummary;
  session: GameSessionSummary | null;
  currentUserId: string | null;
  isHost: boolean;
  actionBusy: string | null;
  startBusy: boolean;
  onStart: () => void;
  onYourAction: (params) => void;
  onPostHistoryNote: (message: string, scope: "all" | "players") => void;
}

// MUST be default export for lazy loading
export default function YourGame(props: YourGameProps) {
  // Your game UI and logic
  return <div>Your Game</div>;
}
```

### 2. Add Game Type

**Location**: `/features/games/hooks/useGameActions.ts`

```typescript
export type GameType =
  | "exploding_cats_v1"
  | "texas_holdem_v1"
  | "your_game_v1"  // Add here
  | null;
```

### 3. Add Actions to useGameActions

```typescript
// Add your game's socket listeners
if (gameType === "your_game_v1") {
  gameSocket.on("games.session.your_action", handleActionComplete);
}

// Add action functions
const yourGameAction = useCallback((params) => {
  if (!userId) return;
  gameSocket.emit("games.session.your_action", {
    roomId,
    userId,
    ...params,
  });
}, [roomId, userId]);

return {
  // ... existing actions
  yourGameAction,
};
```

### 4. Register in Game Registry

**Location**: `/features/games/registry.ts`

```typescript
export const gameLoaders: Record<string, () => Promise<{ default: React.ComponentType<any> }>> = {
  exploding_cats_v1: () => import("./implementations/exploding-cats/Game"),
  texas_holdem_v1: () => import("./implementations/texas-holdem/Game"),
  your_game_v1: () => import("./implementations/your-game/Game"), // Add this
} as const;

export const gameMetadata: Partial<Record<GameSlug, GameMetadata>> = {
  // ... existing games
  your_game_v1: {
    slug: "your_game_v1",
    name: "Your Game Name",
    description: "Your game description",
    category: "Card Game", // or "Board Game", etc.
    minPlayers: 2,
    maxPlayers: 4,
    estimatedDuration: 30,
    complexity: 3,
    ageRating: "PG",
    thumbnail: "/games/your-game.jpg",
    version: "1.0.0",
    supportsAI: true,
    tags: ["strategy", "fun"],
    implementationPath: "./implementations/your-game/Game",
    lastUpdated: "2024-01-01",
    status: "active"
  },
};
```

### 5. Update GameRoomPage Type Detection

**Location**: `/app/games/rooms/[id]/GameRoomPage.tsx`

```typescript
// At top of file - add lazy import
const YourGame = lazy(() => import("@/features/games/implementations/your-game/Game"));

// Update gameType detection
const gameType: GameType = useMemo(() => {
  const gameId = room?.gameId;
  // ... existing checks
  if (gameId === "your_game_v1") return "your_game_v1";
  return null;
}, [room]);

// In render within <Suspense>
{gameType === "your_game_v1" && (
  <YourGame
    room={room}
    session={session}
    currentUserId={snapshot.userId}
    isHost={isHost}
    actionBusy={actionBusy}
    startBusy={startBusy}
    onStart={actions.startYourGame}
    onYourAction={actions.yourGameAction}
    onPostHistoryNote={actions.postHistoryNote}
  />
)}
```

### 6. Done!

That's it! Your game is now integrated with:
- ✅ Room management
- ✅ Session state
- ✅ Socket communication
- ✅ Action tracking
- ✅ Fullscreen mode
- ✅ Leave room functionality

---

## Testing Strategy

### Unit Tests for Hooks

```typescript
import { renderHook } from "@testing-library/react-hooks";
import { useGameRoom } from "./useGameRoom";

test("useGameRoom joins room on mount", () => {
  const { result } = renderHook(() => useGameRoom({
    roomId: "test-room",
    userId: "user-1",
    accessToken: "token",
  }));

  expect(result.current.loading).toBe(true);
  // Assert socket emit was called
});
```

### Integration Tests

```typescript
test("GameRoomPage renders correct game component", () => {
  render(<GameRoomPage />);

  // Mock room with gameId
  act(() => {
    mockSocket.emit("games.room.joined", {
      room: { id: "1", gameId: "texas_holdem_v1" }
    });
  });

  expect(screen.getByText("Texas Hold'em")).toBeInTheDocument();
});
```

---

## Performance Optimizations

### 1. Hook Memoization
All callbacks use `useCallback` to prevent unnecessary re-renders

### 2. Conditional Socket Listeners
Listeners only registered when game type is known

### 3. Lazy Loading
Game components can be lazy-loaded:
```typescript
const TexasHoldemGame = lazy(() => import("./components/TexasHoldemGame"));
```

### 4. Socket Cleanup
All listeners properly cleaned up on unmount

---

## Migration Checklist

When refactoring an existing game:

- [ ] Extract socket event handlers to `useGameActions`
- [ ] Move room state to `useGameRoom`
- [ ] Move session state to `useGameSession`
- [ ] Update component to receive actions as props
- [ ] Add game type to GameRoomPage switch
- [ ] Test all game actions
- [ ] Verify fullscreen works
- [ ] Verify leave room works
- [ ] Update any game-specific documentation

---

## File Structure

```
apps/web/src/
├── widgets/games/
│   └── implementations/          # ✨ All game implementations
│       ├── exploding-cats/
│       │   └── Game.tsx         # Exploding Cats game (default export)
│       └── texas-holdem/
│           └── Game.tsx         # Texas Hold'em game (default export)
├── features/games/
│   ├── hooks/
│   │   ├── useGameRoom.ts       # Room management
│   │   ├── useGameSession.ts    # Session state
│   │   ├── useGameActions.ts    # Game actions
│   │   └── index.ts             # Exports
│   ├── ui/
│   │   ├── ControlPanel.tsx     # Fullscreen + Leave
│   │   ├── GameCard.tsx         # Game card component
│   │   ├── GameContainer.tsx    # Game container wrapper
│   │   ├── GameControls.tsx     # Game controls
│   │   ├── GameGrid.tsx         # Grid layout for games
│   │   ├── GameLayout.tsx       # Layout wrapper
│   │   ├── GameStatus.tsx       # Status display
│   │   └── PlayerList.tsx       # Player list component
│   ├── lib/
│   │   ├── gameFactory.ts       # Game factory for dynamic loading
│   │   ├── gameConfig.ts        # Game configuration
│   │   └── gameProps.ts         # Shared prop types
│   ├── types/
│   │   └── base.ts              # Base game interfaces
│   ├── registry.ts              # ✨ Game registry with metadata
│   ├── registry.types.ts        # Registry types
│   └── REFACTORING.md           # This file
│
└── app/games/rooms/[id]/
    ├── GameRoomPage.tsx          # Main orchestrator (194 lines)
    └── page.tsx                  # Route wrapper
```

---

## Metrics

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| GameRoomPage.tsx | 771 lines | 172 lines | **77.7% reduction** |
| Socket logic | Scattered | Centralized in hooks | **Better organization** |
| Reusability | Low | High | **Easy to extend** |
| Testability | Hard | Easy | **Unit testable** |
| New game setup | ~200 lines | ~50 lines | **75% faster** |

---

## Best Practices

1. **Keep game components pure**: They should only receive props and render UI
2. **Use hooks for side effects**: All socket logic goes in hooks
3. **Type everything**: Leverage TypeScript for safety
4. **Clean up**: Always unregister listeners in cleanup functions
5. **Document actions**: Add comments explaining what each action does
6. **Test incrementally**: Test hooks individually before integration

---

## Future Enhancements

### Planned Features
- [ ] Game state persistence (reconnect recovery)
- [ ] Spectator mode improvements
- [ ] Tournament mode support
- [ ] AI player integration
- [ ] Analytics tracking
- [ ] Performance monitoring

### Possible Optimizations
- [ ] WebSocket message compression
- [ ] State caching with React Query
- [ ] Virtual scrolling for large player lists
- [ ] Progressive Web App (PWA) support

---

## Support

For questions or issues with the refactored architecture:

1. Check this documentation first
2. Review hook implementation in `/features/games/hooks/`
3. Look at existing game implementations as examples
4. Refer to `/features/games/ARCHITECTURE.md` for low-level details

---

## Changelog

### 2025-11-28 - Game Structure Migration
- ✅ Migrated game implementations to `/widgets/games/implementations/`
- ✅ Updated GameRoomPage to use lazy loading from widgets
- ✅ All games now load from centralized registry
- ✅ Removed old `/app/games/rooms/[id]/components/` directory
- ✅ Updated registry to support flexible component types
- ✅ Added Suspense boundaries for better loading states
- ✅ Games now properly isolated in widgets directory (FSD architecture)

### 2025-01-XX - Initial Refactoring
- Created `useGameRoom`, `useGameSession`, `useGameActions` hooks
- Refactored GameRoomPage from 771 to 188 lines
- Enhanced ControlPanel with fullscreen support
- Documented refactoring process
- Prepared system for 200+ games scalability

---

**Version**: 3.0
**Last Updated**: 2025-11-28
**Author**: Game Architecture Team
