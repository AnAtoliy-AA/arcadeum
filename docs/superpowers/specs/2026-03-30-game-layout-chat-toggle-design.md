# Game Layout — Chat Toggle Design

## Overview

Rework the game room layout so:

- **Wide screens (≥ 1151px):** chat panel appears to the right of the game widget; toggle hides/shows it; defaults to visible.
- **Narrow screens (< 1151px):** chat panel appears below the game widget; toggle hides/shows it; defaults to hidden.
- Chat never overlaps the game widget on any screen size.
- Crossing a breakpoint boundary resets the chat visibility to the default for that breakpoint (intentional — prevents overlap on resize).

The existing toggle infrastructure (`showChat` state + `GamesControlPanel` button) is preserved — only its initialization and the overflow CSS change.

## Context

`GameRoomPage.tsx` already has:

- `showChat` boolean state initialized to `true`
- `handleToggleChat` callback
- `GamesControlPanel` with a 💬 Show/Hide button wired to `onToggleChat`
- `ChatPanel` with a `visible` variant that sets `display: none` when false
- `media` object from `useMedia()` (already imported)

Current bug: on narrow screens `GameWrapper` has `overflow: 'visible'`, allowing its content to bleed visually over the `ChatPanel` below it.

`Container` (child of `Page`) already has `overflowY: 'auto'` on `$tablet` and `$sm`, but is missing it on `$md` (≤ 1150px, > 900px), which clips stacked content on medium-sized narrow screens.

## Behavior Specification

### Wide screen (≥ 1151px)

| State                     | Layout                                                             |
| ------------------------- | ------------------------------------------------------------------ |
| Chat visible (default)    | Game widget (`flex: 1`) + Chat panel (320 px, right side) in a row |
| Chat hidden (toggled off) | Game widget takes full width; chat panel `display: none`           |

### Narrow screen (< 1151px)

| State                     | Layout                                                                                                                                |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Chat hidden (default)     | Game widget takes full width and height                                                                                               |
| Chat visible (toggled on) | Game widget stacked above; chat panel below in normal flex flow (full width); `Container` scrolls if combined height exceeds viewport |

### Resize behaviour

When the viewport crosses the `$gtMd` breakpoint in either direction, `showChat` is reset to the default for the new breakpoint (`true` for wide, `false` for narrow). This overrides any manual toggle the user had applied — this is intentional to prevent overlap when switching between layouts.

## Files Changed

### 1. `apps/web/src/app/games/rooms/[id]/components/GameRoomPage.tsx`

**Change:** Keep `useState(true)` as the SSR-safe default. Add a `useEffect` that syncs `showChat` to `media.gtMd` after hydration and on resize.

```ts
// Before
const [showChat, setShowChat] = useState(true);

// After
const [showChat, setShowChat] = useState(true);

useEffect(() => {
  setShowChat(media.gtMd);
}, [media.gtMd]);
```

`useState(true)` avoids SSR/hydration mismatch (server renders without viewport knowledge). The effect fires after mount and sets the correct client value. On breakpoint crossing, it resets `showChat` to the appropriate default — see Resize Behaviour above.

`media` is already available from `const media = useMedia()` earlier in the component.

### 2. `apps/web/src/app/games/rooms/[id]/components/styles.ts` — `GameWrapper`

**Change:** On all narrow breakpoints (`$md`, `$tablet`, `$sm`), change `overflow: 'visible'` to `overflow: 'hidden'`.

```ts
// Before — all three narrow breakpoints
$md: {
  flex: 0,
  minHeight: 0,
  overflow: 'visible',  // ← change
},
$tablet: {
  flex: 0,
  minHeight: 0,
  overflow: 'visible',  // ← change
},
$sm: {
  flex: 0,
  minHeight: 0,
  overflow: 'visible',  // ← change
},

// After — same blocks with overflow: 'hidden'
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

This prevents game content from bleeding outside `GameWrapper` and overlapping the `ChatPanel` below.

### 3. `apps/web/src/app/games/rooms/[id]/components/styles.ts` — `Container`

**Change:** Add `overflowY: 'auto'` to the `$md` breakpoint block. `$tablet` and `$sm` already have it; `$md` (901–1150px) was missing it.

```ts
// Before
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

// After — add $md
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
```

### 4. `apps/web/src/app/games/rooms/[id]/components/layoutStyles.tsx` — `ChatPanel`

**Verified:** `ChatPanel` has no `position: absolute` or negative margins — it is in normal flex flow on all breakpoints. No changes needed. The existing `visible` variant (`display: none`) handles the hidden state correctly.

## Non-Goals

- No changes to `GameLayout.tsx`.
- No changes to `GamesControlPanel.tsx`.
- No changes to `GameChat.tsx`.
- No changes to `Page` in `styles.ts` — `Container` handles the scroll.

## Testing

- Wide screen, page load: chat is visible to the right of the game.
- Wide screen, toggle off: game takes full width; toggle on: chat returns right.
- Narrow screen (any of $md / $tablet / $sm), page load: chat hidden, game full width.
- Narrow screen, toggle on: chat appears below game with no visual overlap; page scrolls if needed.
- Wide screen → resize to narrow: chat auto-hides.
- Narrow screen → resize to wide: chat auto-shows.
- Medium narrow screen (901–1150px) with chat open scrolls correctly.
