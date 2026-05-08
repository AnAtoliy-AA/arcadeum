# Shared Game Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework game widgets to use a single, reusable layout container (`GamePageLayout` + `GameWidgetContainer`) so that each game page differs only by its game widget, minimizing boilerplate when adding new games.

**Architecture:** Two-layer design following FSD rules. `GamePageLayout` (page level) is the outer shell owning Page, Container, GamesControlPanel, GameChat, ConnectionOverlay, fullscreen, and ChatMessagePopup. `GameWidgetContainer` (features level) is the inner game layout providing standardized slots (header, board, tableArea, handSection, modals). Game widgets receive `BaseGameWidgetProps` and use `useGameChatIntegration` for chat wiring.

**Tech Stack:** React, Next.js App Router, Tamagui styled components, Zustand, `@arcadeum/ui`

**Spec:** `docs/superpowers/specs/2026-04-10-shared-game-layout-design.md`

---

## File Structure

### New Files
| File | Responsibility |
|------|---------------|
| `apps/web/src/features/games/hooks/useGameChatIntegration.ts` | Shared hook: syncs game logs to `useGameChatStore`, registers sendMessage, clears on unmount |
| `apps/web/src/features/games/hooks/useFullscreen.ts` | Moved from `widgets/CriticalGame/hooks/useFullscreen.ts` — manages fullscreen API + 'F' keyboard shortcut |
| `apps/web/src/features/games/ui/GameWidgetContainer.tsx` | Inner game layout with standardized slots (header, board, tableArea, handSection, modals) + variant styling |
| `apps/web/src/app/games/rooms/[id]/components/GamePageLayout.tsx` | Outer page shell: Page, Container, GamesControlPanel, GameChat, ConnectionOverlay, ChatMessagePopup, fullscreen ownership |

### Modified Files
| File | Changes |
|------|---------|
| `apps/web/src/features/games/types/base.ts` | Replace `BaseGameProps` with `BaseGameWidgetProps` (add `isFullscreen`, `toggleFullscreen`, `showRulesOpen`, `onShowRulesClose`; drop `onPostHistoryNote`, `config`, index signature) |
| `apps/web/src/features/games/hooks/index.ts` | Export `useGameChatIntegration` and `useFullscreen` |
| `apps/web/src/features/games/ui/index.ts` | Export `GameWidgetContainer`, remove `GameLayout` |
| `apps/web/src/widgets/GamesControlPanel/ui/GamesControlPanel.tsx` | Receive `isFullscreen`/`toggleFullscreen` as props; remove internal fullscreen state + handler |
| `apps/web/src/app/games/rooms/[id]/components/DynamicGameRenderer.tsx` | Update props type from `BaseGameProps` to `BaseGameWidgetProps` |
| `apps/web/src/app/games/rooms/[id]/components/GameRoomPage.tsx` | Extract shell into `GamePageLayout`; simplify to delegate layout; update `gameProps` memo for new contract |
| `apps/web/src/widgets/CriticalGame/types/index.ts` | Extend `BaseGameWidgetProps` instead of defining standalone props |
| `apps/web/src/widgets/CriticalGame/ui/Game.tsx` | Use `GameWidgetContainer`, receive `isFullscreen`/`toggleFullscreen` as props, drop local `useFullscreen` and `GameContainer` import |
| `apps/web/src/widgets/CriticalGame/ui/ActiveGameView.tsx` | Use `useGameChatIntegration`, drop manual chat `useEffect` blocks and `ChatMessagePopup` rendering |
| `apps/web/src/widgets/CriticalGame/hooks/index.ts` | Remove `useFullscreen` re-export (now in features) |
| `apps/web/src/widgets/SeaBattleGame/types/index.ts` | Extend `BaseGameWidgetProps` instead of defining standalone props |
| `apps/web/src/widgets/SeaBattleGame/ui/Game.tsx` | Use `GameWidgetContainer` with early-return lobby, `useGameChatIntegration`, receive `isFullscreen`/`toggleFullscreen` as props, drop `GameLayout`/`ChatMessagePopup` imports |

### Deleted Files
| File | Reason |
|------|--------|
| `apps/web/src/features/games/ui/GameLayout.tsx` | Replaced by `GamePageLayout` + `GameWidgetContainer` |
| `apps/web/src/widgets/CriticalGame/ui/styles/layout.tsx` | `GameContainer` styles move to shared `GameWidgetContainer`; game-specific `GameBoard`/`TableArea`/`HandSection` become thin local wrappers or use shared sections directly |
| `apps/web/src/widgets/CriticalGame/hooks/useFullscreen.ts` | Moved to `features/games/hooks/useFullscreen.ts` |

---

## Task 1: Create `useGameChatIntegration` Hook

**Files:**
- Create: `apps/web/src/features/games/hooks/useGameChatIntegration.ts`
- Modify: `apps/web/src/features/games/hooks/index.ts`

This hook replaces the duplicated chat-wiring `useEffect` blocks in CriticalGame's `ActiveGameView.tsx:151-160` and SeaBattleGame's `Game.tsx:102-111`.

- [ ] **Step 1: Create the hook file**

```tsx
// apps/web/src/features/games/hooks/useGameChatIntegration.ts
import { useEffect } from 'react';
import { useGameChatStore } from '@/widgets/GameChat';
import type { ChatScope } from '@/widgets/GameChat';

type GameLog = { id: string; [key: string]: unknown };

/**
 * Syncs game snapshot logs into the global GameChat store
 * and registers the sendMessage function for chat integration.
 * Clears the store on unmount.
 */
export function useGameChatIntegration(
  logs: GameLog[] | undefined,
  sendMessage: ((message: string, scope: ChatScope) => void) | undefined,
): void {
  // Sync logs to store
  useEffect(() => {
    useGameChatStore.getState().setLogs(logs ?? []);
  }, [logs]);

  // Register sendMessage; clear store on unmount
  useEffect(() => {
    if (sendMessage) {
      useGameChatStore.getState().registerSendMessage(sendMessage);
    }
    return () => useGameChatStore.getState().clear();
  }, [sendMessage]);
}
```

- [ ] **Step 2: Add export to barrel file**

In `apps/web/src/features/games/hooks/index.ts`, add:
```ts
export { useGameChatIntegration } from './useGameChatIntegration';
```

- [ ] **Step 3: Verify build**

Run: `cd apps/web && npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No errors related to `useGameChatIntegration`

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/features/games/hooks/useGameChatIntegration.ts apps/web/src/features/games/hooks/index.ts
git commit -m "feat: add useGameChatIntegration shared hook"
```

---

## Task 2: Move `useFullscreen` Hook to Features Layer

**Files:**
- Create: `apps/web/src/features/games/hooks/useFullscreen.ts` (copy from widgets)
- Modify: `apps/web/src/features/games/hooks/index.ts`
- Modify: `apps/web/src/widgets/CriticalGame/hooks/index.ts` (remove re-export)
- Delete: `apps/web/src/widgets/CriticalGame/hooks/useFullscreen.ts`

The hook is relocated so `GamePageLayout` (page layer) can import it without depending on a widget's internal module.

- [ ] **Step 1: Copy the hook to features**

Copy `apps/web/src/widgets/CriticalGame/hooks/useFullscreen.ts` to `apps/web/src/features/games/hooks/useFullscreen.ts`. The content stays identical — no logic changes.

- [ ] **Step 2: Update features barrel export**

In `apps/web/src/features/games/hooks/index.ts`, add:
```ts
export { useFullscreen } from './useFullscreen';
```

- [ ] **Step 3: Update CriticalGame barrel export**

In `apps/web/src/widgets/CriticalGame/hooks/index.ts`, change:
```ts
// BEFORE
export { useFullscreen } from './useFullscreen';

// AFTER
export { useFullscreen } from '@/features/games/hooks';
```

This keeps existing CriticalGame imports working during the transition. We'll clean this up when refactoring CriticalGame in Task 7.

- [ ] **Step 4: Delete old file**

Delete `apps/web/src/widgets/CriticalGame/hooks/useFullscreen.ts`.

- [ ] **Step 5: Verify build**

Run: `cd apps/web && npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No errors — all existing `useFullscreen` imports resolve through barrel re-export.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/features/games/hooks/useFullscreen.ts apps/web/src/features/games/hooks/index.ts apps/web/src/widgets/CriticalGame/hooks/index.ts
git rm apps/web/src/widgets/CriticalGame/hooks/useFullscreen.ts
git commit -m "refactor: move useFullscreen hook to features/games/hooks"
```

---

## Task 3: Update `BaseGameProps` to `BaseGameWidgetProps`

**Files:**
- Modify: `apps/web/src/features/games/types/base.ts`

Update the shared game props contract. The old `BaseGameProps` will be replaced by `BaseGameWidgetProps`. The key changes: add `isFullscreen`, `toggleFullscreen`, `showRulesOpen`, `onShowRulesClose`, `accessToken`; drop `onPostHistoryNote` (replaced by `useGameChatIntegration`), `config`, and the index signature.

- [ ] **Step 1: Update the interface**

In `apps/web/src/features/games/types/base.ts`, replace the `BaseGameProps` interface (lines 54-72):

```ts
// BEFORE
export interface BaseGameProps {
  roomId: string;
  room: GameRoomSummary;
  session: GameSessionSummary | null;
  currentUserId: string | null;
  isHost: boolean;
  onPostHistoryNote: (message: string, scope: ChatScope) => void;
  onAction?: (action: string, payload?: Record<string, unknown>) => void;
  config?: GameConfig;
  [key: string]: unknown;
}

// AFTER
/**
 * Standardized props interface for all game widgets.
 * Each game widget receives these props from GamePageLayout via DynamicGameRenderer.
 * Chat integration is handled via useGameChatIntegration hook (not props).
 */
export interface BaseGameWidgetProps {
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

Note: Keep the `ChatScope` import — it's used by the `GameAction` or other types in the same file. If it was only used by `BaseGameProps.onPostHistoryNote`, remove it.

- [ ] **Step 2: Update barrel export**

Check `apps/web/src/features/games/index.ts` — if it re-exports `BaseGameProps`, update the name to `BaseGameWidgetProps`.

- [ ] **Step 3: Update DynamicGameRenderer**

In `apps/web/src/app/games/rooms/[id]/components/DynamicGameRenderer.tsx`, update:

```ts
// BEFORE
import { gameFactory, BaseGameProps } from '@/features/games';

interface DynamicGameRendererProps {
  gameType: GameType;
  props: BaseGameProps;
}

// AFTER
import { gameFactory, BaseGameWidgetProps } from '@/features/games';

interface DynamicGameRendererProps {
  gameType: GameType;
  props: BaseGameWidgetProps;
}
```

- [ ] **Step 4: Verify build**

Run: `cd apps/web && npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: Type errors in `GameRoomPage.tsx` (gameProps memo still has old shape) and game widget types files — these are expected and will be fixed in subsequent tasks.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/features/games/types/base.ts apps/web/src/app/games/rooms/[id]/components/DynamicGameRenderer.tsx
git commit -m "refactor: replace BaseGameProps with BaseGameWidgetProps"
```

---

## Task 4: Create `GameWidgetContainer`

**Files:**
- Create: `apps/web/src/features/games/ui/GameWidgetContainer.tsx`
- Modify: `apps/web/src/features/games/ui/index.ts`

Based on CriticalGame's `GameContainer` from `widgets/CriticalGame/ui/styles/layout.tsx`. Provides a standardized inner grid with header, board, tableArea, handSection, and modals slots.

- [ ] **Step 1: Create `GameWidgetContainer`**

```tsx
// apps/web/src/features/games/ui/GameWidgetContainer.tsx
import React from 'react';
import { styled, YStack } from 'tamagui';
import {
  GameContainer as BaseGameContainer,
  GameBoard as BaseGameBoard,
  TableArea as BaseTableArea,
} from '@arcadeum/ui';

// --- Styled components (from CriticalGame's layout.tsx) ---

const Container = styled(BaseGameContainer, {
  name: 'GameWidgetContainer',
  gap: '$5',
  paddingHorizontal: '$7',
  paddingTop: '$7',
  paddingBottom: 0,
  borderRadius: 24,
  minHeight: 0,
  position: 'relative',
  overflowX: 'hidden',
  overflowY: 'auto',
  backdropFilter: 'blur(20px)',
  height: '100%',
  flexDirection: 'column',
  minWidth: 0,

  $sm: {
    paddingHorizontal: '$2',
    paddingTop: '$2',
    paddingBottom: 0,
    borderRadius: 16,
    overflowX: 'hidden',
    overflowY: 'auto',
  },

  variants: {
    $isMyTurn: {
      true: {},
    },
    isFullscreen: {
      true: {
        maxWidth: '100vw',
        maxHeight: '100vh',
        width: '100vw',
        height: '100vh',
        borderRadius: 0,
        borderWidth: 0,
      },
    },
  } as const,
});

export const SharedGameBoard = styled(BaseGameBoard, {
  name: 'SharedGameBoard',
  gap: '$4',
  zIndex: 20,
  flexDirection: 'column',
  position: 'relative',
  width: '100%',
  flexGrow: 0,
  flexShrink: 0,
  flexBasis: 'auto',
  overflow: 'visible',
});

export const SharedTableArea = styled(BaseTableArea, {
  name: 'SharedTableArea',
  gap: '$4',
  flexDirection: 'column',
  minHeight: 0,
  position: 'relative',
  zIndex: 1,
  width: '100%',
  flexGrow: 0,
  flexShrink: 0,
  flexBasis: 'auto',
  height: 'auto',
});

export const SharedHandSection = styled(YStack, {
  name: 'SharedHandSection',
  gap: '$4',
  width: '100%',
  flexShrink: 0,
  zIndex: 30,
  position: 'relative',
  borderTopWidth: 1,
  borderTopColor: '$borderColor',
  paddingTop: '$4',
});

// --- Main component ---

interface GameWidgetContainerProps {
  header?: React.ReactNode;
  board: React.ReactNode;
  tableArea?: React.ReactNode;
  handSection?: React.ReactNode;
  modals?: React.ReactNode;
  variant?: string;
  isMyTurn?: boolean;
}

export function GameWidgetContainer({
  header,
  board,
  tableArea,
  handSection,
  modals,
  variant,
  isMyTurn,
}: GameWidgetContainerProps) {
  return (
    <Container
      $isMyTurn={!!isMyTurn}
      $variant={variant}
      data-testid="game-widget-container"
    >
      {header}
      <SharedGameBoard data-testid="game-board-section">
        {board}
      </SharedGameBoard>
      {tableArea && (
        <SharedTableArea data-testid="game-table-section">
          {tableArea}
        </SharedTableArea>
      )}
      {handSection && (
        <SharedHandSection data-testid="game-hand-section">
          {handSection}
        </SharedHandSection>
      )}
      {modals}
    </Container>
  );
}
```

**Important:** The `$variant` dynamic styling from CriticalGame's `getVariantStyles` is game-specific. The shared `Container` accepts `$variant` as a pass-through to `BaseGameContainer` (which handles standard variants like `cyberpunk`, `underwater`, etc.). CriticalGame's custom variant styling (with `getVariantStyles().layout`) will be handled by the CriticalGame theme provider wrapping this container — it applies theme tokens that `BaseGameContainer` reads. If CriticalGame needs the custom `$variant` handler, it can wrap `GameWidgetContainer` in a styled override locally. This will be addressed in Task 7 when refactoring CriticalGame.

- [ ] **Step 2: Update barrel export**

In `apps/web/src/features/games/ui/index.ts`, replace `GameLayout` with `GameWidgetContainer`:

```ts
// BEFORE
export { GameLayout } from './GameLayout';

// AFTER
export { GameWidgetContainer, SharedGameBoard, SharedTableArea, SharedHandSection } from './GameWidgetContainer';
```

- [ ] **Step 3: Verify build**

Run: `cd apps/web && npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: Errors from files still importing `GameLayout` — expected, will be fixed in later tasks.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/features/games/ui/GameWidgetContainer.tsx apps/web/src/features/games/ui/index.ts
git commit -m "feat: add GameWidgetContainer with standardized game layout slots"
```

---

## Task 5: Update `GamesControlPanel` to Accept Fullscreen Props

**Files:**
- Modify: `apps/web/src/widgets/GamesControlPanel/ui/GamesControlPanel.tsx`

Remove the internal fullscreen state and handler. Receive `isFullscreen` and `toggleFullscreen` as props from the parent (`GamePageLayout`). This creates a single source of truth for fullscreen state.

- [ ] **Step 1: Update props interface**

```ts
// BEFORE (lines 22-33)
interface GamesControlPanelProps {
  roomId?: string;
  inviteCode?: string;
  className?: string;
  onMovePlayer?: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onCenterView?: () => void;
  showMoveControls?: boolean;
  fullscreenContainerRef?: RefObject<HTMLDivElement | null>;
  showChat?: boolean;
  onToggleChat?: () => void;
  onShowRules?: () => void;
}

// AFTER
interface GamesControlPanelProps {
  roomId?: string;
  inviteCode?: string;
  className?: string;
  onMovePlayer?: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onCenterView?: () => void;
  showMoveControls?: boolean;
  fullscreenContainerRef?: RefObject<HTMLDivElement | null>;
  showChat?: boolean;
  onToggleChat?: () => void;
  onShowRules?: () => void;
  isFullscreen?: boolean;
  toggleFullscreen?: () => void;
}
```

- [ ] **Step 2: Remove internal fullscreen state and handler**

Remove lines 51, 55-65, and 90-98 (the `useState`, `handleFullscreenToggle` callback, and the `fullscreenchange` event listener `useEffect`).

Update the destructured props to include `isFullscreen` and `toggleFullscreen`.

- [ ] **Step 3: Update the fullscreen button**

Replace `onClick={handleFullscreenToggle}` with `onClick={toggleFullscreen}` on the fullscreen button (around line 145).

- [ ] **Step 4: Verify build**

Run: `cd apps/web && npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: Clean — `GameRoomPage` already passes `fullscreenContainerRef`, and the new props are optional so existing call sites still work.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/widgets/GamesControlPanel/ui/GamesControlPanel.tsx
git commit -m "refactor: GamesControlPanel receives fullscreen state as props"
```

---

## Task 6: Create `GamePageLayout`

**Files:**
- Create: `apps/web/src/app/games/rooms/[id]/components/GamePageLayout.tsx`

This is the outer page shell shared by all games. It owns:
- `Page` + `Container` + fullscreen styles
- Container ref + `useFullscreen` hook
- `ConnectionOverlay` (disconnect/idle)
- `GamesControlPanel` (with fullscreen props)
- `GameRow` + `ChatPanel` + `GameChat`
- `ChatMessagePopup` (reads from global `useGameChatStore`)
- Chat visibility state

Children are rendered via a render prop that passes `isFullscreen` and `toggleFullscreen`.

- [ ] **Step 1: Create the component**

```tsx
// apps/web/src/app/games/rooms/[id]/components/GamePageLayout.tsx
'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Text, useMedia } from 'tamagui';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useFullscreen } from '@/features/games/hooks';
import { ConnectionOverlay, Page } from '@/shared/ui';
import { GamesControlPanel } from '@/widgets/GamesControlPanel';
import { GameChat } from '@/widgets/GameChat';
import {
  useGameChatStore,
  ChatMessagePopup,
  useLatestChatMessage,
} from '@/widgets/GameChat';
import type { GameRoomSummary } from '@/shared/types/games';

import { Container, fullscreenStyles } from './styles';
import { GameRow, ChatPanel } from './layoutStyles';

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

export function GamePageLayout({
  roomId,
  room,
  inviteCode,
  isDisconnected,
  isReconnecting,
  isIdle,
  onReconnect,
  onShowRules,
  children,
}: GamePageLayoutProps) {
  const { t } = useTranslation();
  const media = useMedia();
  const roomFlexDirection = media.gtMd ? 'row' : 'column';
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const { isFullscreen, toggleFullscreen } = useFullscreen(gameContainerRef);

  // Chat visibility — wide screens default visible, narrow hidden
  const [showChat, setShowChat] = useState(false);
  const handleToggleChat = useCallback(() => setShowChat((v) => !v), []);

  useEffect(() => {
    queueMicrotask(() => {
      setShowChat(media.gtMd);
    });
  }, [media.gtMd]);

  // Chat message popup — reads from global store written by game widgets
  const logs = useGameChatStore((s) => s.logs);
  const { latestMessage, dismiss: dismissPopup } = useLatestChatMessage(logs);

  return (
    <>
      <style>{fullscreenStyles}</style>
      <Container
        ref={gameContainerRef as React.RefObject<never>}
        className="games-room-container"
      >
        <ConnectionOverlay
          visible={isDisconnected}
          reconnecting={isReconnecting}
          onReconnect={onReconnect}
          title={t('games.connectionOverlay.title')}
          message={t('games.connectionOverlay.message')}
          reconnectingText={t('games.connectionOverlay.reconnecting')}
          testId="connection-overlay-disconnected"
        />

        {!isDisconnected && (
          <ConnectionOverlay
            visible={isIdle}
            title={t('games.idle.title')}
            message={t('games.idle.message')}
            testId="connection-overlay-idle"
          />
        )}

        <GamesControlPanel
          roomId={roomId}
          inviteCode={inviteCode}
          fullscreenContainerRef={gameContainerRef}
          isFullscreen={isFullscreen}
          toggleFullscreen={toggleFullscreen}
          showChat={showChat}
          onToggleChat={handleToggleChat}
          onShowRules={onShowRules}
        />

        <GameRow flexDirection={roomFlexDirection}>
          {children({ isFullscreen, toggleFullscreen })}

          <ChatPanel visible={showChat} data-testid="game-chat-area">
            <GameChat onClose={() => setShowChat(false)} />
          </ChatPanel>
        </GameRow>

        {latestMessage && (
          <ChatMessagePopup
            key={latestMessage.id}
            senderName={latestMessage.senderName}
            message={latestMessage.message}
            visible={!!latestMessage}
            onDismiss={dismissPopup}
          />
        )}
      </Container>
    </>
  );
}
```

**Key design decisions:**
- Container ref is created internally — both `GamesControlPanel` (via `fullscreenContainerRef`) and `useFullscreen` use the same ref.
- `children` is a render prop so layout can pass `isFullscreen`/`toggleFullscreen` down without prop drilling through `DynamicGameRenderer`.
- `ChatMessagePopup` reads from global `useGameChatStore` — game widgets write to it via `useGameChatIntegration`.
- The `Page` wrapper is NOT inside `GamePageLayout` — it stays in `GameRoomPage` for the early-return error/loading paths.

- [ ] **Step 2: Verify build**

Run: `cd apps/web && npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No errors from this new file (it's not imported anywhere yet).

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/games/rooms/[id]/components/GamePageLayout.tsx
git commit -m "feat: add GamePageLayout outer page shell component"
```

---

## Task 7: Refactor CriticalGame Widget

**Files:**
- Modify: `apps/web/src/widgets/CriticalGame/types/index.ts`
- Modify: `apps/web/src/widgets/CriticalGame/ui/Game.tsx`
- Modify: `apps/web/src/widgets/CriticalGame/ui/ActiveGameView.tsx`
- Modify: `apps/web/src/widgets/CriticalGame/hooks/index.ts`
- Delete: `apps/web/src/widgets/CriticalGame/ui/styles/layout.tsx`

### Sub-task 7a: Update CriticalGame types

- [ ] **Step 1: Update `CriticalGameProps`**

In `apps/web/src/widgets/CriticalGame/types/index.ts`, update:

```ts
// BEFORE
export interface CriticalGameProps {
  roomId: string;
  room: GameRoomSummary;
  session: GameSessionSummary | null;
  currentUserId: string | null;
  isHost: boolean;
  onPostHistoryNote?: (message: string, scope: 'all' | 'players') => void;
  config?: unknown;
  accessToken?: string | null;
}

// AFTER
import type { BaseGameWidgetProps } from '@/features/games/types/base';

export interface CriticalGameProps extends BaseGameWidgetProps {}
```

Remove any now-duplicated type imports (`GameRoomSummary`, `GameSessionSummary`) if they were only used by the old interface definition.

### Sub-task 7b: Update CriticalGame root component

- [ ] **Step 2: Refactor `Game.tsx`**

In `apps/web/src/widgets/CriticalGame/ui/Game.tsx`:

1. Remove `useFullscreen` import from `../hooks` (or from `@/features/games/hooks`)
2. Remove `GameContainer` import from `./styles`
3. Add `GameWidgetContainer` import from `@/features/games/ui`
4. Receive `isFullscreen` and `toggleFullscreen` from props (they come from `BaseGameWidgetProps`)
5. Remove `const containerRef = useRef<HTMLDivElement & TamaguiElement>(null);`
6. Remove `const { isFullscreen, toggleFullscreen } = useFullscreen(containerRef);`
7. Pass `isFullscreen`/`toggleFullscreen` down to `CriticalLobby` and `ActiveGameView` as before
8. Replace `<GameContainer ref={containerRef} $isMyTurn={...} $variant={...}>` with `<GameWidgetContainer isMyTurn={...} variant={...}>` — but note that `ActiveGameView` renders game sections internally, so we need to decide: does `Game.tsx` use `GameWidgetContainer` directly, or does `ActiveGameView` use it?

**Decision:** Since `ActiveGameView` owns the actual game sections (header, board, table, hand), `ActiveGameView` should render `GameWidgetContainer` with the appropriate slots. `Game.tsx` becomes a thin orchestrator:

```tsx
// Updated Game.tsx
import React from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';
import type { CriticalGameProps } from '../types';
import { useCriticalState, useRematch } from '../hooks';
import { useGameStore, type GameState } from '@/features/games/store/gameStore';
import { CriticalLobby } from './CriticalLobby';
import { ActiveGameView } from './ActiveGameView';

export default function CriticalGame({
  roomId,
  room: initialRoom,
  session: initialSession,
  currentUserId,
  isHost,
  accessToken,
  isFullscreen,
  toggleFullscreen,
  showRulesOpen,
  onShowRulesClose,
}: CriticalGameProps) {
  const { t } = useTranslation();

  const storeRoom = useGameStore((s: GameState) => s.room);
  const storeDeleteRoom = useGameStore((s: GameState) => s.deleteRoom);
  const storeRefreshRoom = useGameStore((s: GameState) => s.refreshRoom);

  const room =
    (storeRoom?.id === roomId ? storeRoom : null) || initialRoom || null;

  const cardVariant = room?.gameOptions?.cardVariant;

  const {
    snapshot, actionBusy, startBusy, actions, reorderParticipants,
    currentPlayer, currentTurnPlayer, isMyTurn, canAct, canPlayNope,
    aliveOpponents, isGameOver,
  } = useCriticalState({
    roomId, currentUserId, initialSession, accessToken,
  });

  const rematch = useRematch({ roomId, gameOptions: room?.gameOptions });

  if (!room) return null;

  // Lobby — early return before GameWidgetContainer
  if (!snapshot) {
    return (
      <CriticalLobby
        room={room}
        isHost={isHost}
        startBusy={startBusy}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        onStartGame={actions.startCritical}
        onReorderPlayers={reorderParticipants}
        onReinvite={rematch.handleReinvite}
        onDeleteRoom={() => storeDeleteRoom(roomId)}
        onRefresh={() => storeRefreshRoom(roomId)}
        t={t}
      />
    );
  }

  // Active game
  return (
    <ActiveGameView
      currentUserId={currentUserId}
      room={room}
      snapshot={snapshot}
      isHost={isHost}
      isFullscreen={isFullscreen}
      toggleFullscreen={toggleFullscreen}
      actionBusy={actionBusy}
      actions={actions}
      currentPlayer={currentPlayer}
      currentTurnPlayer={currentTurnPlayer ?? undefined}
      isMyTurn={!!isMyTurn}
      canAct={!!canAct}
      canPlayNope={!!canPlayNope}
      aliveOpponents={aliveOpponents}
      isGameOver={!!isGameOver}
      rematch={rematch}
      showRulesOpen={showRulesOpen}
      onShowRulesClose={onShowRulesClose}
    />
  );
}
```

Note: `CriticalLobby` currently receives `containerRef` — since it's no longer needed for fullscreen (layout owns it), check if `CriticalLobby` uses `containerRef` for anything else. If only for fullscreen, remove it. The `isFullscreen` prop remains.

### Sub-task 7c: Update ActiveGameView

- [ ] **Step 3: Replace chat wiring with `useGameChatIntegration`**

In `apps/web/src/widgets/CriticalGame/ui/ActiveGameView.tsx`:

1. Add import: `import { useGameChatIntegration } from '@/features/games/hooks';`
2. Remove imports: `useGameChatStore`, `ChatMessagePopup`, `useLatestChatMessage` from `@/widgets/GameChat`
3. Replace the two `useEffect` blocks (lines 151-160) with a single call:
   ```ts
   useGameChatIntegration(snapshot?.logs, actions.postHistoryNote);
   ```
4. Remove `const { latestMessage, dismiss: dismissPopup } = useLatestChatMessage(...)` (line 162-164)
5. Remove the `ChatMessagePopup` JSX block (lines 338-346)
6. Add `showRulesOpen` and `onShowRulesClose` to the `ActiveGameViewProps` interface and receive them as props (for rules modal integration if applicable — check if ActiveGameView renders a rules modal)

### Sub-task 7d: Handle CriticalGame's variant styling

- [ ] **Step 4: Address variant styling**

CriticalGame's `GameContainer` (in `styles/layout.tsx`) has a custom `$variant` handler calling `getVariantStyles()`. The shared `GameWidgetContainer` doesn't have this game-specific handler.

**Approach:** The `CriticalGame` wraps its content in `<CriticalGameThemeProvider>` (or `CriticalCardThemeProvider`) which applies theme tokens. The `BaseGameContainer` from `@arcadeum/ui` already handles standard `$variant` prop. If CriticalGame needs the custom variant border/shadow logic, create a thin local wrapper:

In `apps/web/src/widgets/CriticalGame/ui/styles/` (keep the styles directory, just remove `layout.tsx`), create or keep relevant styled components that the `ActiveGameView` uses internally. The `GameBoard`, `TableArea`, `HandSection` from the old `layout.tsx` can be replaced with imports from `GameWidgetContainer`'s shared exports (`SharedGameBoard`, `SharedTableArea`, `SharedHandSection`), or kept as thin local wrappers if they need game-specific variant styling.

Check where `GameBoard`, `TableArea`, `HandSection`, `HandContainer`, `FrostyVignette` are used in CriticalGame:
- Search for imports from `./styles/layout` or `./styles` across CriticalGame widget files
- Update imports to use shared components where possible
- Keep game-specific wrappers only where variant styling is needed

### Sub-task 7e: Clean up barrel exports

- [ ] **Step 5: Update CriticalGame hooks barrel**

In `apps/web/src/widgets/CriticalGame/hooks/index.ts`, remove the `useFullscreen` re-export added in Task 2 (no longer needed — CriticalGame doesn't call `useFullscreen` anymore).

- [ ] **Step 6: Delete old layout file**

Delete `apps/web/src/widgets/CriticalGame/ui/styles/layout.tsx` after confirming all imports have been updated.

- [ ] **Step 7: Verify build**

Run: `cd apps/web && npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: Clean (or errors only from SeaBattleGame/GameRoomPage not yet updated).

- [ ] **Step 8: Commit**

```bash
git add -A apps/web/src/widgets/CriticalGame/
git commit -m "refactor: CriticalGame uses GameWidgetContainer and shared hooks"
```

---

## Task 8: Refactor SeaBattleGame Widget

**Files:**
- Modify: `apps/web/src/widgets/SeaBattleGame/types/index.ts`
- Modify: `apps/web/src/widgets/SeaBattleGame/ui/Game.tsx`

### Sub-task 8a: Update SeaBattleGame types

- [ ] **Step 1: Update `SeaBattleGameProps`**

In `apps/web/src/widgets/SeaBattleGame/types/index.ts`, update:

```ts
// BEFORE
export interface SeaBattleGameProps {
  roomId: string;
  room: GameRoomSummary;
  session: GameSessionSummary | null;
  currentUserId: string | null;
  isHost: boolean;
  onPostHistoryNote?: (message: string, scope: ChatScope) => void;
  config?: unknown;
  accessToken?: string | null;
  showRulesOpen?: boolean;
  onShowRulesClose?: () => void;
}

// AFTER
import type { BaseGameWidgetProps } from '@/features/games/types/base';

export interface SeaBattleGameProps extends BaseGameWidgetProps {}
```

### Sub-task 8b: Refactor SeaBattleGame component

- [ ] **Step 2: Refactor `Game.tsx`**

In `apps/web/src/widgets/SeaBattleGame/ui/Game.tsx`:

1. Remove imports: `GameLayout` from `@/features/games/ui/GameLayout`, `useGameChatStore`, `ChatMessagePopup`, `useLatestChatMessage` from `@/widgets/GameChat`
2. Add imports: `GameWidgetContainer` from `@/features/games/ui`, `useGameChatIntegration` from `@/features/games/hooks`
3. Add `isFullscreen` and `toggleFullscreen` to destructured props
4. Replace the two chat `useEffect` blocks (lines 102-111) with:
   ```ts
   useGameChatIntegration(snapshot?.logs, postHistoryNoteAction);
   ```
5. Remove `const { latestMessage, dismiss: dismissPopup } = useLatestChatMessage(...)` (lines 163-165)
6. Remove the `containerRef = useRef(...)` (line 60 — no longer needed since layout owns fullscreen ref)
7. Convert from `<GameLayout>` with `lobby` prop to early-return pattern:
   - If `!snapshot`, return `<SeaBattleLobby ... />` directly (early return)
   - Otherwise, return `<GameWidgetContainer board={...} header={...} modals={...} variant={cardVariant} isMyTurn={isMyTurn}>`
8. Move the board content (`ShipPlacementBoard` / `AttackBoard`) into the `board` slot
9. Move the header content into the `header` slot
10. Move modals into the `modals` slot
11. Remove `popupOverlay` prop (ChatMessagePopup now rendered by `GamePageLayout`)

The refactored structure:

```tsx
export default function SeaBattleGame({
  roomId, room: initialRoom, currentUserId, session: initialSession,
  isHost, accessToken, showRulesOpen, onShowRulesClose,
  isFullscreen, toggleFullscreen,
}: SeaBattleGameProps) {
  // ... hooks ...

  useGameChatIntegration(snapshot?.logs, postHistoryNoteAction);

  // ... handlers ...

  if (!room) return null;

  // Lobby — early return
  if (!snapshot) {
    return (
      <SeaBattleThemeProvider variant={cardVariant}>
        <SeaBattleLobby ... />
      </SeaBattleThemeProvider>
    );
  }

  // Active game
  return (
    <SeaBattleThemeProvider variant={cardVariant}>
      <GameWidgetContainer
        header={/* header JSX */}
        board={
          <>
            {isPlacementPhase && <ShipPlacementBoard ... />}
            {isBattlePhase && <AttackBoard ... />}
          </>
        }
        modals={/* modals JSX */}
        variant={cardVariant}
        isMyTurn={!!isMyTurn}
      />
    </SeaBattleThemeProvider>
  );
}
```

- [ ] **Step 3: Verify build**

Run: `cd apps/web && npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: Clean (or errors only from GameRoomPage not yet updated).

- [ ] **Step 4: Commit**

```bash
git add -A apps/web/src/widgets/SeaBattleGame/
git commit -m "refactor: SeaBattleGame uses GameWidgetContainer and shared hooks"
```

---

## Task 9: Refactor `GameRoomPage` to Use `GamePageLayout`

**Files:**
- Modify: `apps/web/src/app/games/rooms/[id]/components/GameRoomPage.tsx`

Extract the game shell (Container, ConnectionOverlay, GamesControlPanel, GameRow, ChatPanel, ChatMessagePopup) into `GamePageLayout`. The page keeps: authentication, room fetching, socket connection, error/loading states, and the game preloader.

- [ ] **Step 1: Update imports**

Remove: `GamesControlPanel`, `GameChat`, `GameRow`, `ChatPanel` imports (now in `GamePageLayout`).
Add: `GamePageLayout` import.

```ts
import { GamePageLayout } from './GamePageLayout';
```

- [ ] **Step 2: Remove chat state from GameRoomPage**

Remove:
- `const [showChat, setShowChat] = useState(false);` and `handleToggleChat`
- The `useEffect` syncing `showChat` to `media.gtMd`
- `const roomFlexDirection = media.gtMd ? 'row' : 'column';`
- `useMedia()` import (if only used for chat/layout)

These are now owned by `GamePageLayout`.

- [ ] **Step 3: Update `gameProps` memo**

Update to match `BaseGameWidgetProps`. Remove `onPostHistoryNote`, `config`, add `isFullscreen`/`toggleFullscreen` (will come from render prop), and `showRulesOpen`/`onShowRulesClose`:

```ts
// This memo is now simpler — isFullscreen/toggleFullscreen come from the render prop
const gamePropsBase = useMemo(() => {
  if (!roomId || !room) return null;
  return {
    roomId: room.id,
    room,
    session: initialSession as GameSessionSummary | null,
    currentUserId: snapshot.userId,
    isHost,
    accessToken: snapshot.accessToken,
    showRulesOpen: showRules,
    onShowRulesClose: handleCloseRules,
  };
}, [roomId, room, isHost, initialSession, snapshot.userId, snapshot.accessToken, showRules, handleCloseRules]);
```

- [ ] **Step 4: Replace the main render block**

Replace the final return (lines 418-491) with:

```tsx
return (
  <Page fixedHeight>
    <GamePageLayout
      roomId={roomId}
      room={room}
      inviteCode={room?.inviteCode}
      isDisconnected={isDisconnected}
      isReconnecting={isReconnecting}
      isIdle={isIdle}
      onReconnect={reconnect}
      onShowRules={handleShowRules}
    >
      {({ isFullscreen, toggleFullscreen }) => {
        const gameProps = gamePropsBase
          ? { ...gamePropsBase, isFullscreen, toggleFullscreen }
          : null;

        return (
          <GameWrapper>
            <Suspense
              fallback={
                <LoadingContainer>
                  <Text>{t('games.roomPage.loadingGame')}</Text>
                </LoadingContainer>
              }
            >
              {gameLoading && (
                <LoadingContainer>
                  <Text>{t('games.roomPage.loadingGame')}</Text>
                </LoadingContainer>
              )}

              {!gameLoading && !gameType && room && (
                <LoadingContainer>
                  <Text>
                    {t('games.roomPage.errors.unsupportedGame', {
                      gameId: room.gameId,
                    })}
                  </Text>
                </LoadingContainer>
              )}

              {!gameLoading && isGameReady && gameType && gameProps && (
                <DynamicGameRenderer gameType={gameType} props={gameProps} />
              )}
            </Suspense>
          </GameWrapper>
        );
      }}
    </GamePageLayout>
  </Page>
);
```

- [ ] **Step 5: Verify build**

Run: `cd apps/web && npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: Clean build.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/app/games/rooms/[id]/components/GameRoomPage.tsx
git commit -m "refactor: GameRoomPage delegates shell to GamePageLayout"
```

---

## Task 10: Delete Old `GameLayout` and Clean Up

**Files:**
- Delete: `apps/web/src/features/games/ui/GameLayout.tsx`
- Verify: no remaining imports of `GameLayout`

- [ ] **Step 1: Check for remaining imports**

Run: `grep -r "GameLayout" apps/web/src/ --include="*.ts" --include="*.tsx" -l`
Expected: No files (all have been migrated). If any remain, update them.

- [ ] **Step 2: Delete the file**

Delete `apps/web/src/features/games/ui/GameLayout.tsx`.

- [ ] **Step 3: Verify build**

Run: `cd apps/web && npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: Clean build — no references to deleted file.

- [ ] **Step 4: Commit**

```bash
git rm apps/web/src/features/games/ui/GameLayout.tsx
git commit -m "chore: delete old GameLayout replaced by GamePageLayout + GameWidgetContainer"
```

---

## Task 11: Full Verification

- [ ] **Step 1: Type check**

Run: `cd apps/web && npx tsc --noEmit --pretty`
Expected: Clean — zero errors.

- [ ] **Step 2: Lint check**

Run: `cd apps/web && pnpm lint 2>&1 | tail -20`
Expected: No new lint errors.

- [ ] **Step 3: File length check**

Run: `pnpm check-file-length 2>&1 | tail -10`
Expected: All files under 500 lines.

- [ ] **Step 4: Build**

Run: `pnpm build --filter=web 2>&1 | tail -20`
Expected: Successful build.

- [ ] **Step 5: Run web tests**

Run: `pnpm test --filter=web 2>&1 | tail -30`
Expected: All tests pass.

- [ ] **Step 6: Final commit (if any fixes needed)**

```bash
git add -A
git commit -m "fix: address lint/build issues from shared game layout refactor"
```
