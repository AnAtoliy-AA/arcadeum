# Game Layout Chat Toggle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the game room layout so chat defaults to hidden on narrow screens, defaults to visible on wide screens, auto-syncs on resize, and never overlaps the game widget.

**Architecture:** Three CSS fixes in two files (`GameWrapper` overflow and `Container` scroll on medium screens) plus one behavioral change in `GameRoomPage` (a `useEffect` that syncs `showChat` to the `media.gtMd` breakpoint). No new components or state — all infrastructure already exists.

**Tech Stack:** Next.js App Router, Tamagui (styled components + `useMedia`), React `useEffect`

---

## File Map

| File                                                            | Change                                                                    |
| --------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `apps/web/src/app/games/rooms/[id]/components/GameRoomPage.tsx` | Add `useEffect` to sync `showChat` with `media.gtMd`                      |
| `apps/web/src/app/games/rooms/[id]/components/styles.ts`        | Fix `GameWrapper` overflow (3 breakpoints) + add `Container` `$md` scroll |
| `apps/web/src/app/games/rooms/[id]/components/layoutStyles.tsx` | Read-only verification — no changes                                       |
| `apps/web/e2e/sea-battle-colors.spec.ts`                        | Reference for e2e test patterns                                           |

---

### Task 1: Fix `GameWrapper` overflow on narrow screens

**Files:**

- Modify: `apps/web/src/app/games/rooms/[id]/components/styles.ts`

Game content currently bleeds outside `GameWrapper` with `overflow: 'visible'` on narrow breakpoints, visually overlapping the chat panel below. Change all three narrow breakpoints to `overflow: 'hidden'`.

- [ ] **Step 1: Open the file and locate `GameWrapper`**

  Open `apps/web/src/app/games/rooms/[id]/components/styles.ts`. Find the `GameWrapper` styled component. It has three breakpoint blocks that each contain `overflow: 'visible'`:

  ```ts
  $md: {
    flex: 0,
    minHeight: 0,
    overflow: 'visible',
  },
  $tablet: {
    flex: 0,
    minHeight: 0,
    overflow: 'visible',
  },
  $sm: {
    flex: 0,
    minHeight: 0,
    overflow: 'visible',
  },
  ```

- [ ] **Step 2: Change `overflow: 'visible'` to `overflow: 'hidden'` in all three blocks**

  ```ts
  $md: {
    flex: 0,
    minHeight: 0,
    overflow: 'hidden',
  },
  $tablet: {
    flex: 0,
    minHeight: 0,
    overflow: 'hidden',
  },
  $sm: {
    flex: 0,
    minHeight: 0,
    overflow: 'hidden',
  },
  ```

- [ ] **Step 3: Commit**

  ```bash
  git add apps/web/src/app/games/rooms/[id]/components/styles.ts
  git commit -m "fix(ARC-425): prevent game widget overflow bleeding onto chat panel on narrow screens"
  ```

---

### Task 2: Fix `Container` scroll on medium narrow screens (901–1150px)

**Files:**

- Modify: `apps/web/src/app/games/rooms/[id]/components/styles.ts`

`Container` already has `overflowY: 'auto'` on `$tablet` and `$sm`, but is missing it on `$md` (901–1150px). Without it, stacked content is clipped when chat is open on medium-width narrow screens.

- [ ] **Step 1: Locate `Container` in the same file**

  Find the `Container` styled component in `apps/web/src/app/games/rooms/[id]/components/styles.ts`. It currently has `$tablet` and `$sm` breakpoint overrides but no `$md` block:

  ```ts
  export const Container = styled(YStack, {
    // ...base styles...
    overflowY: 'hidden',
    $tablet: {
      padding: '$3',
      gap: '$3',
      flex: 1,
      overflowY: 'auto',
    },
    $sm: {
      padding: '$3',
      gap: '$3',
      flex: 1,
      overflowY: 'auto',
    },
  } as Record<string, unknown>);
  ```

- [ ] **Step 2: Add `$md` block before `$tablet`**

  ```ts
  export const Container = styled(YStack, {
    // ...base styles unchanged...
    overflowY: 'hidden',
    $md: {
      overflowY: 'auto',
    },
    $tablet: {
      padding: '$3',
      gap: '$3',
      flex: 1,
      overflowY: 'auto',
    },
    $sm: {
      padding: '$3',
      gap: '$3',
      flex: 1,
      overflowY: 'auto',
    },
  } as Record<string, unknown>);
  ```

- [ ] **Step 3: Commit**

  ```bash
  git add apps/web/src/app/games/rooms/[id]/components/styles.ts
  git commit -m "fix(ARC-425): enable container scroll on medium narrow screens (901-1150px)"
  ```

---

### Task 3: Sync `showChat` to breakpoint in `GameRoomPage`

**Files:**

- Modify: `apps/web/src/app/games/rooms/[id]/components/GameRoomPage.tsx`

Currently `showChat` is initialized to `true` for all screen sizes. On narrow screens chat should default to hidden. A `useEffect` watching `media.gtMd` sets the correct default after hydration and auto-corrects on resize.

- [ ] **Step 1: Locate the `showChat` state and `useMedia` in `GameRoomPage.tsx`**

  Open `apps/web/src/app/games/rooms/[id]/components/GameRoomPage.tsx`.

  The file already has:

  ```ts
  const media = useMedia();
  // ...
  const [showChat, setShowChat] = useState(true);
  const handleToggleChat = useCallback(() => setShowChat((v) => !v), []);
  ```

- [ ] **Step 2: Add a `useEffect` to sync `showChat` with `media.gtMd` directly after the `showChat` state declaration**

  ```ts
  const [showChat, setShowChat] = useState(true);
  const handleToggleChat = useCallback(() => setShowChat((v) => !v), []);

  // Sync chat visibility to breakpoint: wide = visible, narrow = hidden.
  // Runs after hydration (server has no viewport) and on resize.
  useEffect(() => {
    setShowChat(media.gtMd);
  }, [media.gtMd]);
  ```

  `useState(true)` is kept as the SSR-safe default (server doesn't know the viewport). The effect corrects it on the client after mount.

- [ ] **Step 3: Verify `useEffect` is already imported**

  Check the import at the top of the file:

  ```ts
  import React, {
    useMemo,
    useEffect,
    // ...
  } from 'react';
  ```

  `useEffect` is already imported — no import change needed.

- [ ] **Step 4: Commit**

  ```bash
  git add apps/web/src/app/games/rooms/[id]/components/GameRoomPage.tsx
  git commit -m "fix(ARC-425): default chat hidden on narrow screens, sync on resize"
  ```

---

### Task 4: Verify `ChatPanel` layout (read-only)

**Files:**

- Read: `apps/web/src/app/games/rooms/[id]/components/layoutStyles.tsx`

Confirm `ChatPanel` is in normal flex flow on all breakpoints and no changes are needed.

- [ ] **Step 1: Open `layoutStyles.tsx` and inspect `ChatPanel`**

  Check that:

  - No `position: absolute` or `position: fixed`
  - No negative `margin` values
  - `$md` override sets `width: '100%'` and `marginTop: '$2'` (positive margin only)
  - The `visible: false` variant uses `display: 'none'`

  If all of the above are true, no changes needed — proceed to Task 5.

  If `position: absolute` is found, add `position: 'relative'` to the `$md` override.

---

### Task 5: Manual verification

No automated tests cover this layout behavior (breakpoint-dependent CSS). Verify manually in the browser.

- [ ] **Step 1: Start the dev server**

  ```bash
  pnpm dev
  ```

  Navigate to a game room: `http://localhost:3000/games/rooms/<any-room-id>`

- [ ] **Step 2: Verify wide screen (≥ 1151px)**

  - Chat panel is visible to the right of the game widget on load
  - Click "💬 Hide chat" → game expands to full width, chat disappears
  - Click "💬 Show chat" → chat returns to the right

- [ ] **Step 3: Verify narrow screen (< 1151px)**

  Resize browser to < 1151px or use DevTools device emulation.

  - Chat panel is hidden on load, game has full width
  - Click "💬 Show chat" → chat appears **below** the game widget, not overlapping
  - Scroll the page — game content is not visually bleeding into the chat area
  - Click "💬 Hide chat" → chat disappears, game returns to full width

- [ ] **Step 4: Verify medium narrow screen (901–1150px) with chat open**

  - Resize to ~1000px
  - Toggle chat on
  - Scroll down — full chat panel is reachable (not clipped)

- [ ] **Step 5: Verify resize behaviour**

  - Open at wide screen (chat visible) → resize to narrow → chat auto-hides
  - Open at narrow screen (chat hidden) → resize to wide → chat auto-shows

- [ ] **Step 6: Commit if any last fixes were made, otherwise done**

  ```bash
  git add -p
  git commit -m "fix(ARC-425): game layout chat toggle manual verification fixes"
  ```
