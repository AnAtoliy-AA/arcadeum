# Shared Game Layout Design

## Goal

Rework game widgets to use a single, reusable layout container so that each game page differs only by its game widget. Optimized for adding many new games with minimal boilerplate.

## Architecture

Two-layer design:

1. **`GamePageLayout`** (page level) — the outer page shell shared by all games
2. **`GameWidgetContainer`** (features level) — the inner game layout with standardized slots

### Layer 1: `GamePageLayout`

**Location:** `apps/web/src/app/games/rooms/[id]/components/GamePageLayout.tsx`

**FSD rationale:** Lives inside the Next.js App Router route segment, which acts as the page layer. This is the only layer that can compose widgets (`GamesControlPanel`, `GameChat`), since widgets cannot import other widgets in FSD.

**Owns:**

- `Page` + `Container` + fullscreen styles
- `ConnectionOverlay` (disconnect/idle)
- `GamesControlPanel` (top bar with fullscreen toggle, chat toggle, rules, exit)
- `GameRow` + `ChatPanel` + `GameChat` (side chat panel)
- `ChatMessagePopup` (floating toast — reads from global `useGameChatStore` via `useLatestChatMessage`)
- Container ref (created internally via `useRef`)
- `useFullscreen` hook (created internally, passes `isFullscreen`/`toggleFullscreen` down to children)

**Props:**

```tsx
interface GamePageLayoutProps {
  roomId: string;
  room: GameRoomSummary;
  inviteCode?: string;

  // Connection overlays
  isDisconnected: boolean;
  isReconnecting: boolean;
  isIdle: boolean;
  onReconnect: () => void;

  // Rules
  onShowRules: () => void;

  // The game widget — receives isFullscreen/toggleFullscreen via render prop
  children: (layoutProps: {
    isFullscreen: boolean;
    toggleFullscreen: () => void;
  }) => React.ReactNode;
}
```

**Key details:**

- The container ref is created internally by `GamePageLayout`. Both `GamesControlPanel` (via `fullscreenContainerRef` prop) and the `useFullscreen` hook use this same ref.
- `children` is a render prop so the layout can pass `isFullscreen`/`toggleFullscreen` down to the game widget without prop drilling through `DynamicGameRenderer`.
- `ChatMessagePopup` is rendered inside the layout. It calls `useLatestChatMessage` reading from the global `useGameChatStore` — the same store that game widgets write to via `useGameChatIntegration`.

**Chat handling:** The layout reads `ChatMessagePopup` data from the global `useGameChatStore` Zustand store via `useLatestChatMessage(logs)` where logs come from the store. Game widgets call `useGameChatIntegration` internally to sync their snapshot logs into the store. This avoids prop plumbing — the store is the bridge.

### Layer 2: `GameWidgetContainer`

**Location:** `apps/web/src/features/games/ui/GameWidgetContainer.tsx`

**FSD rationale:** Lives in features layer. Only imports from `@arcadeum/ui` (shared) — no widget imports.

**Based on:** CriticalGame's `GameContainer` from `widgets/CriticalGame/ui/styles/layout.tsx`, which extends `@arcadeum/ui`'s `GameContainer`.

**Provides a standardized inner grid:**

```
+-----------------------------+
| Header (turn indicator etc) |
+-----------------------------+
|                             |
| GameBoard (main play area)  |
|                             |
+-----------------------------+
| TableArea (shared space)    |
+-----------------------------+
| HandSection (player's hand) |
+-----------------------------+
| Modals layer                |
+-----------------------------+
```

**Props:**

```tsx
interface GameWidgetContainerProps {
  header?: ReactNode; // turn indicator, game title, status
  board: ReactNode; // required — every game has a main play area
  tableArea?: ReactNode; // optional — shared game elements (deck, pot, etc.)
  handSection?: ReactNode; // optional — player's private area (cards in hand)
  modals?: ReactNode; // game-specific modals
  variant?: string; // visual theme variant (string to support all game variant types)
  isMyTurn?: boolean; // turn indicator border/glow
}
```

**Section usage by game:**

- **CriticalGame:** all sections (header, board with player ring, table with deck/discard, hand with cards, modals)
- **SeaBattleGame:** header + board (grids), skips table and hand
- **Future poker-like:** all sections
- **Future chess-like:** header + board, skips table and hand

**Styles (from CriticalGame's container):**

- Padding, border-radius, backdrop-filter
- Responsive `$sm` overrides
- `$isMyTurn` border treatment
- `$variant` dynamic styles (background, border, shadow via `getVariantStyles`)
- Consistent spacing between sections, responsive behavior, z-index stacking

**Lobby handling:** `GameWidgetContainer` does not have a lobby slot. Each game widget handles its own lobby rendering by returning the lobby component directly (early return before `GameWidgetContainer`), following the pattern CriticalGame already uses today. SeaBattleGame will be refactored to match this pattern instead of passing lobby as a prop to the old `GameLayout`.

## Shared Hook: `useGameChatIntegration`

**Location:** `features/games/hooks/useGameChatIntegration.ts`

**Replaces** the duplicated `useEffect` blocks in both CriticalGame and SeaBattleGame:

```tsx
function useGameChatIntegration(
  logs: GameLog[] | undefined,
  sendMessage: ((message: string) => void) | undefined,
): void;
```

Internally:

- Syncs `logs` to `useGameChatStore.setLogs()`
- Registers `sendMessage` via `useGameChatStore.registerSendMessage()`
- Clears store on unmount

Note: The existing `onPostHistoryNote` prop on game widget interfaces is intentionally dropped from `BaseGameWidgetProps`. Its role is fully replaced by `useGameChatIntegration` — each game widget calls this hook with its own `postHistoryNote` action from its game actions hook.

## Shared Hook: `useFullscreen`

**Current location:** `widgets/CriticalGame/hooks/useFullscreen.ts`

**New location:** `features/games/hooks/useFullscreen.ts` (or `shared/hooks/useFullscreen.ts` if it has no game-specific logic)

This hook is relocated so that `GamePageLayout` (page layer) can import it without depending on a widget. The move is required because pages should not import from widgets' internal modules.

## Game Widget Contract

All game widgets receive standardized props. Note: `BaseGameWidgetProps` replaces the existing `BaseGameProps` in `features/games/types/base.ts`. The old interface (which includes `onPostHistoryNote`, `config`, and an index signature) will be updated to match.

```tsx
interface BaseGameWidgetProps {
  roomId: string;
  room: GameRoomSummary;
  session: GameSessionSummary | null;
  currentUserId: string | null;
  isHost: boolean;
  accessToken: string | null;
  showRulesOpen: boolean;
  onShowRulesClose: () => void;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
}
```

**Fullscreen flow:** `GamePageLayout` owns the ref and `useFullscreen` hook. It passes `isFullscreen` and `toggleFullscreen` to game widgets via the render prop. Game widgets render their own fullscreen toggle button (e.g. in their header) that calls `toggleFullscreen`. `GamesControlPanel` in the layout also has a fullscreen button calling the same `toggleFullscreen`. Both buttons control the same state — there is a single source of truth in the layout.

Each widget:

- Uses `GameWidgetContainer` with the sections it needs
- Calls `useGameChatIntegration(snapshot.logs, sendAction)` to wire chat
- Manages its own game state hooks, board rendering, and game-specific modals
- Manages its own lobby view (early return before `GameWidgetContainer`)
- Manages its own theme provider (if needed)

## File Changes

### New files

- `apps/web/src/app/games/rooms/[id]/components/GamePageLayout.tsx`
- `apps/web/src/features/games/ui/GameWidgetContainer.tsx`
- `apps/web/src/features/games/hooks/useGameChatIntegration.ts`

### Moved files

- `widgets/CriticalGame/hooks/useFullscreen.ts` → `features/games/hooks/useFullscreen.ts` (or `shared/hooks/`)

### Modified files

- `apps/web/src/app/games/rooms/[id]/components/GameRoomPage.tsx` — simplified, delegates to `GamePageLayout`. The `gameProps` memo assembles `BaseGameWidgetProps` including `isFullscreen`/`toggleFullscreen` received from the layout's render prop.
- `apps/web/src/app/games/rooms/[id]/components/DynamicGameRenderer.tsx` — no changes needed (it's a pass-through; prop changes happen in `GameRoomPage`'s `gameProps` memo)
- `apps/web/src/widgets/CriticalGame/ui/Game.tsx` — uses `GameWidgetContainer`, receives `isFullscreen`/`toggleFullscreen` as props instead of calling `useFullscreen` internally, drops outer shell
- `apps/web/src/widgets/CriticalGame/ui/ActiveGameView.tsx` — drops `ChatMessagePopup` rendering, uses `useGameChatIntegration` instead of manual `useEffect` blocks
- `apps/web/src/widgets/SeaBattleGame/ui/Game.tsx` — uses `GameWidgetContainer` with early-return lobby pattern, drops `GameLayout` import, drops chat wiring and popup, receives `isFullscreen`/`toggleFullscreen` as props
- `apps/web/src/widgets/GamesControlPanel/ui/GamesControlPanel.tsx` — receives `isFullscreen`/`toggleFullscreen` as props from `GamePageLayout` instead of managing its own internal `useState(false)`. Its local fullscreen state is removed — single source of truth in `GamePageLayout`'s `useFullscreen` hook. Still receives `fullscreenContainerRef` for the DOM target.

### Deleted files

- `apps/web/src/features/games/ui/GameLayout.tsx` — replaced by `GamePageLayout` + `GameWidgetContainer`
- `apps/web/src/widgets/CriticalGame/ui/styles/layout.tsx` — `GameContainer` styles move to shared `GameWidgetContainer`; game-specific components (`GameBoard`, `TableArea`, `HandSection`) become thin local wrappers extending the shared sections from `GameWidgetContainer`

### Untouched

- `apps/web/src/widgets/GamesControlPanel/` — API updated: receives `isFullscreen`/`toggleFullscreen` as props, internal fullscreen state removed
- `apps/web/src/widgets/GameChat/` — stays as-is
- `@arcadeum/ui` `GameContainer` base component
- All game-specific hooks, modals, board components, theme systems

## Adding a New Game

With this design, adding a new game requires:

1. Create `widgets/NewGame/` with the game widget component implementing `BaseGameWidgetProps`
2. Use `GameWidgetContainer` with the sections needed (`board` is required, rest optional)
3. Call `useGameChatIntegration(logs, sendFn)` for chat
4. Register the component loader in `features/games/registry.ts` (`gameMetadata` + `gameLoaders`)

No page-level code changes needed. `GameRoomPage` and `GamePageLayout` remain untouched. The `DynamicGameRenderer` + `gameFactory` system automatically picks up newly registered games.
