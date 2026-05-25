# Chat Popup Inside Game Widget — Implementation Plan (ARC-735)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render the in-game chat message popup inside the `GameWidgetContainer` (anchored top-right of the widget) instead of fixed to the viewport, and suppress it when the chat panel is already open.

**Architecture:** Extend `useGameChatStore` (Zustand) with `currentUserId`, `resolveEquipped`, and `chatPanelOpen` fields. Move popup rendering from `GamePageLayout` into a new `GameChatPopupOverlay` rendered inside `GameWidgetContainer`. Change `ChatMessagePopup` CSS from `position: fixed` to `position: absolute` so it anchors to the widget container (which is already `position: relative`).

**Tech Stack:** Next.js 14 (App Router), React, TypeScript, Zustand, Tamagui, Vitest, Playwright.

**Spec:** [docs/superpowers/specs/2026-05-21-chat-popup-inside-widget-design.md](../specs/2026-05-21-chat-popup-inside-widget-design.md)

---

## File Map

| File                                                                       | Action | Purpose                                                                                    |
| -------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------ |
| `apps/web/src/widgets/GameChat/store/gameChatStore.ts`                     | Modify | Add `currentUserId`, `resolveEquipped`, `chatPanelOpen` fields + setters; update `clear()` |
| `apps/web/src/widgets/GameChat/store/__tests__/gameChatStore.test.ts`      | Modify | Add tests for new fields                                                                   |
| `apps/web/src/widgets/GameChat/ui/ChatMessagePopup.tsx`                    | Modify | `position: fixed` → `position: absolute`                                                   |
| `apps/web/src/widgets/GameChat/ui/GameChatPopupOverlay.tsx`                | Create | New overlay component that reads store and renders popup                                   |
| `apps/web/src/widgets/GameChat/ui/__tests__/GameChatPopupOverlay.test.tsx` | Create | Unit test for overlay (hide when chat open, render when closed)                            |
| `apps/web/src/widgets/GameChat/index.ts`                                   | Modify | Export `GameChatPopupOverlay`                                                              |
| `apps/web/src/features/games/ui/GameWidgetContainer.tsx`                   | Modify | Render `<GameChatPopupOverlay />` inside `<Container>`                                     |
| `apps/web/src/app/[locale]/games/rooms/[id]/components/GamePageLayout.tsx` | Modify | Remove popup JSX/`useLatestChatMessage`; add effects to sync store                         |
| `apps/web/e2e/sea-battle-chat-popup.spec.ts`                               | Modify | Add test: popup hidden when chat panel open                                                |

---

## Task 1: Extend `useGameChatStore` with new fields

**Files:**

- Modify: `apps/web/src/widgets/GameChat/store/gameChatStore.ts`
- Modify: `apps/web/src/widgets/GameChat/store/__tests__/gameChatStore.test.ts`

- [ ] **Step 1: Write failing tests for new store fields**

Append to `gameChatStore.test.ts` inside the existing `describe('gameChatStore', …)` block:

```ts
it('setCurrentUserId updates currentUserId', () => {
  useGameChatStore.getState().setCurrentUserId('user-1');
  expect(useGameChatStore.getState().currentUserId).toBe('user-1');
});

it('registerResolveEquipped sets resolver', () => {
  const fn = (id: string | null) =>
    id === 'u1'
      ? {
          equippedAvatarId: 'a1',
          equippedBadgeId: null,
          equippedNameColorId: null,
          equippedFrameId: null,
          equippedAuraId: null,
          equippedBannerId: null,
        }
      : null;
  useGameChatStore.getState().registerResolveEquipped(fn);
  expect(useGameChatStore.getState().resolveEquipped).toBe(fn);
});

it('setChatPanelOpen updates chatPanelOpen', () => {
  expect(useGameChatStore.getState().chatPanelOpen).toBe(false);
  useGameChatStore.getState().setChatPanelOpen(true);
  expect(useGameChatStore.getState().chatPanelOpen).toBe(true);
});

it('clear resets new fields', () => {
  useGameChatStore.getState().setCurrentUserId('user-1');
  useGameChatStore.getState().registerResolveEquipped(() => null);
  useGameChatStore.getState().setChatPanelOpen(true);
  useGameChatStore.getState().clear();
  const s = useGameChatStore.getState();
  expect(s.currentUserId).toBeNull();
  expect(s.resolveEquipped).toBeNull();
  expect(s.chatPanelOpen).toBe(false);
});
```

- [ ] **Step 2: Run the new tests, confirm they fail**

Run: `pnpm --filter @arcadeum/web test src/widgets/GameChat/store/__tests__/gameChatStore.test.ts`
Expected: 4 new tests fail with messages like "currentUserId is not a function" / `undefined`.

- [ ] **Step 3: Extend store implementation**

Replace the body of `apps/web/src/widgets/GameChat/store/gameChatStore.ts` with:

```ts
import { create } from 'zustand';
import type {
  CriticalLogEntry as ChatLogEntry,
  ChatScope,
} from '@/shared/types/games';

export type { CriticalLogEntry as ChatLogEntry } from '@/shared/types/games';
export type { ChatScope } from '@/shared/types/games';

export type ChatDisplayNameResolver = (
  id?: string | null,
  fallback?: string | null,
) => string | undefined;

export type ChatActorColorResolver = (id?: string | null) => string | undefined;

export interface ChatEquippedItems {
  equippedAvatarId: string | null;
  equippedBadgeId: string | null;
  equippedNameColorId: string | null;
  equippedFrameId: string | null;
  equippedAuraId: string | null;
  equippedBannerId: string | null;
}

export type ChatEquippedResolver = (
  id: string | null,
) => ChatEquippedItems | null;

interface GameChatStore {
  logs: ChatLogEntry[];
  sendMessage: ((message: string, scope: ChatScope) => void) | null;
  resolveDisplayName: ChatDisplayNameResolver | null;
  resolveActorColor: ChatActorColorResolver | null;
  resolveEquipped: ChatEquippedResolver | null;
  currentUserId: string | null;
  chatPanelOpen: boolean;
  setLogs: (logs: ChatLogEntry[]) => void;
  registerSendMessage: (
    fn: (message: string, scope: ChatScope) => void,
  ) => void;
  registerResolveDisplayName: (fn: ChatDisplayNameResolver | null) => void;
  registerResolveActorColor: (fn: ChatActorColorResolver | null) => void;
  registerResolveEquipped: (fn: ChatEquippedResolver | null) => void;
  setCurrentUserId: (id: string | null) => void;
  setChatPanelOpen: (open: boolean) => void;
  clear: () => void;
}

export const useGameChatStore = create<GameChatStore>((set) => ({
  logs: [],
  sendMessage: null,
  resolveDisplayName: null,
  resolveActorColor: null,
  resolveEquipped: null,
  currentUserId: null,
  chatPanelOpen: false,
  setLogs: (logs) => set({ logs }),
  registerSendMessage: (fn) => set({ sendMessage: fn }),
  registerResolveDisplayName: (fn) => set({ resolveDisplayName: fn }),
  registerResolveActorColor: (fn) => set({ resolveActorColor: fn }),
  registerResolveEquipped: (fn) => set({ resolveEquipped: fn }),
  setCurrentUserId: (id) => set({ currentUserId: id }),
  setChatPanelOpen: (open) => set({ chatPanelOpen: open }),
  clear: () =>
    set({
      logs: [],
      sendMessage: null,
      resolveDisplayName: null,
      resolveActorColor: null,
      resolveEquipped: null,
      currentUserId: null,
      chatPanelOpen: false,
    }),
}));

if (typeof window !== 'undefined') {
  (
    window as unknown as { useGameChatStore: typeof useGameChatStore }
  ).useGameChatStore = useGameChatStore;
}
```

- [ ] **Step 4: Run the tests, confirm they pass**

Run: `pnpm --filter @arcadeum/web test src/widgets/GameChat/store/__tests__/gameChatStore.test.ts`
Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/widgets/GameChat/store/gameChatStore.ts apps/web/src/widgets/GameChat/store/__tests__/gameChatStore.test.ts
git commit -m "feat(chat): extend chat store with userId, equipped resolver, panelOpen (ARC-735)"
```

---

## Task 2: Switch `ChatMessagePopup` to `position: absolute`

**Files:**

- Modify: `apps/web/src/widgets/GameChat/ui/ChatMessagePopup.tsx`

- [ ] **Step 1: Apply CSS change**

In `ChatMessagePopup.tsx`, change the inline `style` object on the wrapper `<div>`:

Old:

```tsx
position: 'fixed',
```

New:

```tsx
position: 'absolute',
```

Leave `top: 24, right: 24, zIndex: 10000` unchanged.

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/widgets/GameChat/ui/ChatMessagePopup.tsx
git commit -m "refactor(chat): anchor popup to nearest positioned ancestor (ARC-735)"
```

---

## Task 3: Create `GameChatPopupOverlay`

**Files:**

- Create: `apps/web/src/widgets/GameChat/ui/GameChatPopupOverlay.tsx`
- Create: `apps/web/src/widgets/GameChat/ui/__tests__/GameChatPopupOverlay.test.tsx`
- Modify: `apps/web/src/widgets/GameChat/index.ts`

- [ ] **Step 1: Write failing unit tests**

Create `apps/web/src/widgets/GameChat/ui/__tests__/GameChatPopupOverlay.test.tsx`:

```tsx
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TamaguiProvider, createTamagui } from 'tamagui';
import { config } from '@arcadeum/ui/tamagui.config';
import { GameChatPopupOverlay } from '../GameChatPopupOverlay';
import { useGameChatStore } from '../../store/gameChatStore';

const tamaguiConfig = createTamagui(config);

function renderOverlay() {
  return render(
    <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
      <GameChatPopupOverlay />
    </TamaguiProvider>,
  );
}

const baseLog = {
  id: 'msg-1',
  type: 'message' as const,
  senderId: 'opponent-1',
  senderName: 'Admiral',
  message: 'Prepare for battle!',
  createdAt: '2026-05-21T00:00:00Z',
  scope: 'all' as const,
};

describe('GameChatPopupOverlay', () => {
  beforeEach(() => {
    useGameChatStore.getState().clear();
  });

  it('renders nothing when there are no messages', () => {
    renderOverlay();
    expect(screen.queryByTestId('chat-message-popup')).toBeNull();
  });

  it('renders the popup for the latest message when chat panel is closed', () => {
    useGameChatStore.getState().setLogs([baseLog]);
    renderOverlay();
    expect(screen.getByTestId('chat-message-popup')).toBeTruthy();
    expect(screen.getByText(/Prepare for battle/)).toBeTruthy();
  });

  it('renders nothing when chat panel is open', () => {
    useGameChatStore.getState().setLogs([baseLog]);
    useGameChatStore.getState().setChatPanelOpen(true);
    renderOverlay();
    expect(screen.queryByTestId('chat-message-popup')).toBeNull();
  });

  it('uses resolveDisplayName when available', () => {
    useGameChatStore.getState().setLogs([baseLog]);
    useGameChatStore
      .getState()
      .registerResolveDisplayName((id) =>
        id === 'opponent-1' ? 'Captain Resolved' : undefined,
      );
    renderOverlay();
    expect(screen.getByText(/Captain Resolved/)).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run tests, confirm they fail**

Run: `pnpm --filter @arcadeum/web test src/widgets/GameChat/ui/__tests__/GameChatPopupOverlay.test.tsx`
Expected: fails because `GameChatPopupOverlay` doesn't exist yet.

- [ ] **Step 3: Implement `GameChatPopupOverlay`**

Create `apps/web/src/widgets/GameChat/ui/GameChatPopupOverlay.tsx`:

```tsx
'use client';

import { useGameChatStore } from '../store/gameChatStore';
import { useLatestChatMessage } from '../hooks/useLatestChatMessage';
import { ChatMessagePopup } from './ChatMessagePopup';

export function GameChatPopupOverlay() {
  const logs = useGameChatStore((s) => s.logs);
  const resolveDisplayName = useGameChatStore((s) => s.resolveDisplayName);
  const resolveEquipped = useGameChatStore((s) => s.resolveEquipped);
  const currentUserId = useGameChatStore((s) => s.currentUserId);
  const chatPanelOpen = useGameChatStore((s) => s.chatPanelOpen);

  const { latestMessage, dismiss } = useLatestChatMessage(logs);

  if (chatPanelOpen) return null;
  if (!latestMessage) return null;

  const senderName =
    resolveDisplayName?.(latestMessage.senderId, latestMessage.senderName) ??
    latestMessage.senderName;

  const equipped = resolveEquipped?.(latestMessage.senderId ?? null) ?? null;

  return (
    <ChatMessagePopup
      key={latestMessage.id}
      senderId={latestMessage.senderId ?? null}
      senderName={senderName}
      senderEquippedAvatarId={equipped?.equippedAvatarId ?? null}
      senderEquippedBadgeId={equipped?.equippedBadgeId ?? null}
      senderEquippedNameColorId={equipped?.equippedNameColorId ?? null}
      senderEquippedFrameId={equipped?.equippedFrameId ?? null}
      senderEquippedAuraId={equipped?.equippedAuraId ?? null}
      senderEquippedBannerId={equipped?.equippedBannerId ?? null}
      message={latestMessage.message}
      visible
      onDismiss={dismiss}
      isOwn={
        !!currentUserId &&
        !!latestMessage.senderId &&
        latestMessage.senderId === currentUserId
      }
    />
  );
}
```

- [ ] **Step 4: Export from widget index**

In `apps/web/src/widgets/GameChat/index.ts`, add:

```ts
export { GameChatPopupOverlay } from './ui/GameChatPopupOverlay';
```

- [ ] **Step 5: Run unit tests, confirm they pass**

Run: `pnpm --filter @arcadeum/web test src/widgets/GameChat/ui/__tests__/GameChatPopupOverlay.test.tsx`
Expected: all 4 tests pass.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/widgets/GameChat/ui/GameChatPopupOverlay.tsx apps/web/src/widgets/GameChat/ui/__tests__/GameChatPopupOverlay.test.tsx apps/web/src/widgets/GameChat/index.ts
git commit -m "feat(chat): add GameChatPopupOverlay (ARC-735)"
```

---

## Task 4: Mount overlay inside `GameWidgetContainer`

**Files:**

- Modify: `apps/web/src/features/games/ui/GameWidgetContainer.tsx`

- [ ] **Step 1: Add overlay to container**

In `GameWidgetContainer.tsx`:

1. Add import near the other widget imports at top:
   ```ts
   import { GameChatPopupOverlay } from '@/widgets/GameChat';
   ```
2. Inside the `<Container>` JSX (the return body), after `{modals}`, add:
   ```tsx
   <GameChatPopupOverlay />
   ```

- [ ] **Step 2: Confirm web build still type-checks**

Run: `pnpm --filter @arcadeum/web type-check`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/features/games/ui/GameWidgetContainer.tsx
git commit -m "feat(games): mount chat popup overlay inside game widget (ARC-735)"
```

---

## Task 5: Update `GamePageLayout` to write store + drop local popup

**Files:**

- Modify: `apps/web/src/app/[locale]/games/rooms/[id]/components/GamePageLayout.tsx`

- [ ] **Step 1: Remove local popup wiring**

Edit `GamePageLayout.tsx`:

1. In the import from `@/widgets/GameChat`, remove `ChatMessagePopup` and `useLatestChatMessage`:
   ```tsx
   import { GameChat, useGameChatStore } from '@/widgets/GameChat';
   ```
2. Delete these blocks:
   - The `useLatestChatMessage(logs)` call (around line 84) — including the `logs` selector on the previous lines if it's only used by the popup. (It is.)
   - The `registeredResolver` usage that exists only for the popup — keep `resolveDisplayName` and `resolveEquipped` definitions because we'll register them to the store.
   - The `popupSender`, `popupSenderName` derivations.
   - The entire `{latestMessage && (<ChatMessagePopup ... />)}` block at the bottom.

After cleanup the imports/state related to the popup are gone. Keep `resolveDisplayName` and `resolveEquipped` functions because they are now registered into the store.

- [ ] **Step 2: Register resolvers + userId + chatOpen into the store via effects**

Inside `GamePageLayout`, after `const handleToggleChat = ...`, add:

```tsx
const registeredResolver = useGameChatStore((s) => s.resolveDisplayName);

useEffect(() => {
  useGameChatStore.getState().setCurrentUserId(userId);
}, [userId]);

useEffect(() => {
  useGameChatStore.getState().registerResolveEquipped(resolveEquipped);
}, [resolveEquipped]);

useEffect(() => {
  useGameChatStore.getState().setChatPanelOpen(showChat);
}, [showChat]);

useEffect(() => {
  useGameChatStore.getState().registerResolveDisplayName(resolveDisplayName);
}, [resolveDisplayName]);
```

Note: keep the `resolveDisplayName` callback that combines `registeredResolver` (from the game widget via `useGameChatIntegration`) and `fallbackResolver`. Read `registeredResolver` via a separate ref-like pattern to avoid registering and reading the same field simultaneously. Concretely: pull `registeredResolver` from the store _before_ we overwrite it with our combined resolver — store it in `useRef` and update on change.

Replace the `registeredResolver` selector with this ref pattern:

```tsx
const registeredResolverRef = useRef<ChatDisplayNameResolver | null>(null);
useEffect(() => {
  return useGameChatStore.subscribe((state, prev) => {
    // Track the resolver from the game widget; ignore our own combined writes.
    if (
      state.resolveDisplayName !== prev.resolveDisplayName &&
      state.resolveDisplayName !== combinedResolverRef.current
    ) {
      registeredResolverRef.current = state.resolveDisplayName;
    }
  });
}, []);
```

If that's too involved, simpler alternative: store the game-side resolver in a separate store field (`gameResolveDisplayName`) and have the overlay's resolution call both. Use whichever is cleaner during implementation; the public behavior is what matters.

**Simpler alternative — recommended**: Add a separate store field `gameResolveDisplayName` and have `useGameChatIntegration` write to it. Then `GamePageLayout`'s combined resolver reads from `gameResolveDisplayName` and `resolveDisplayName` registers the combined function. If you take this path, also update `useGameChatIntegration` to call `registerGameResolveDisplayName` instead of `registerResolveDisplayName`. Make sure tests still pass.

**Decision left to executor:** pick whichever approach yields the cleanest diff. Document the choice in the commit message.

- [ ] **Step 3: Manually verify in the dev server**

Run: `pnpm --filter @arcadeum/web dev`
Open a room with a second tab as another user. Send a chat message from the other tab and confirm:

- Popup appears in the top-right corner _of the game widget_ (not the page).
- Opening the chat panel suppresses subsequent popups.
- Entering widget-only fullscreen keeps the popup anchored to the widget.

- [ ] **Step 4: Run web unit tests**

Run: `pnpm --filter @arcadeum/web test`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/app/[locale]/games/rooms/[id]/components/GamePageLayout.tsx apps/web/src/widgets/GameChat/store/gameChatStore.ts apps/web/src/features/games/hooks/useGameChatIntegration.ts apps/web/src/widgets/GameChat/index.ts
git commit -m "feat(chat): wire GamePageLayout to chat store and remove local popup (ARC-735)"
```

---

## Task 6: Add e2e test — popup hidden when chat panel open

**Files:**

- Modify: `apps/web/e2e/sea-battle-chat-popup.spec.ts`

- [ ] **Step 1: Add new test case**

Append a new `test(...)` inside the `test.describe('Sea Battle Chat Message Popup', …)` block. Pattern after the existing tests (use the same `mockRoomInfo`, `mockGameSocket`, `waitForRoomReady` setup). The new test:

1. Navigates to a room as in the existing tests.
2. Before triggering the snapshot, clicks the chat-toggle button (or otherwise sets `showChat=true`). Use the same selector as `GamesControlPanel` exposes — inspect the codebase for `data-testid="toggle-chat"` or similar. If no testid exists, add one in `GamesControlPanel` minimally for testability.
3. Triggers a snapshot with a new message from the opponent.
4. Asserts the popup is NOT visible: `await expect(page.getByTestId('chat-message-popup')).not.toBeVisible();`
5. Asserts the chat panel itself shows the message instead.

- [ ] **Step 2: Run only this test**

Run: `pnpm --filter @arcadeum/web playwright test e2e/sea-battle-chat-popup.spec.ts -g "hidden when chat panel"`
Expected: pass.

- [ ] **Step 3: Run all e2e chat tests**

Run: `pnpm --filter @arcadeum/web playwright test e2e/sea-battle-chat-popup.spec.ts e2e/chat-interactions.spec.ts e2e/chat.spec.ts`
Expected: all pass.

- [ ] **Step 4: Commit**

```bash
git add apps/web/e2e/sea-battle-chat-popup.spec.ts apps/web/src/widgets/GamesControlPanel
git commit -m "test(chat): popup hidden when chat panel is open (ARC-735)"
```

---

## Task 7: Final verification

- [ ] **Step 1: Type-check + lint + full test pass**

Run in parallel:

- `pnpm type-check`
- `pnpm lint`
- `pnpm --filter @arcadeum/web test`

All must pass.

- [ ] **Step 2: Visual smoke test**

Open a real room with two users. Confirm:

- Popup appears top-right _inside_ the widget.
- Popup follows the widget into widget-fullscreen.
- Popup is suppressed when chat panel is open; reopens when chat panel is closed and another message arrives.

- [ ] **Step 3: Final commit / push prep**

No-op if previous tasks were committed cleanly. Otherwise squash WIP commits with `git rebase -i` if explicitly requested by the user (do not rewrite history unilaterally).
