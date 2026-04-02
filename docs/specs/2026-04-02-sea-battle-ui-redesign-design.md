# Sea Battle Widget UI Redesign

**Date:** 2026-04-02  
**Branch:** ARC-456  
**Scope:** All three game phases — Lobby, Ship Placement, Battle Board

---

## Summary

Incremental UI enhancement of the Sea Battle widget. All existing game logic, state hooks, and socket infrastructure stay untouched. Only rendering and styling layers change. The approach is Approach 1 (incremental layer): new styled components, new hooks for drag-and-drop and animation, slotted in without structural rewrites.

**Design direction:** Polished Glass — glassmorphism panels, glowing indicators, crisp typography.  
**Animation style:** Symbols + Glow — emoji icons on hit/miss cells, persistent glow on sunk ships.

---

## 1. Battle Board (`AttackBoard.tsx`)

### Sunk Ship Detection

`CELL_STATE` has no `SUNK` value. Sunk state is derived at render time:

```ts
const sunkCellSet = useMemo(() => {
  const set = new Set<string>();
  players.forEach(p => {
    p.ships.filter(s => s.sunk).forEach(s => {
      s.cells.forEach(c => set.add(`${p.playerId}-${c.row}-${c.col}`));
    });
  });
  return set;
}, [players]);
```

Each cell checks `sunkCellSet.has(`${playerId}-${rIndex}-${cIndex}`)` before falling through to the standard `CELL_STATE` switch.

### Cell States

| State | Visual |
|-------|--------|
| Empty | Dark fill, subtle blue border |
| Ship (own board) | Steel blue fill (`rgba(148,163,184,0.4)`) |
| Hit (not sunk) | Red fill + `🔥` icon centered via `position:absolute` child + pulsing red glow |
| Miss | Dark fill + white dot (9px circle via absolute child) |
| Sunk | Deep red fill + `💀` icon centered + stronger persistent glow |
| Hover (enemy, your turn only) | Blue tint + glowing border + `scale(1.08)` via Tamagui `hoverStyle` |

**Icon placement:** `🔥` and `💀` are rendered as an absolutely positioned `<Text>` child inside `BoardCell`, so the cell's `backgroundColor` is not occluded — existing Playwright color checks remain valid.

**All colors come from `useSeaBattleTheme()`** to preserve all 10 themes.

### `BoardCell` hover scale

```tsx
<BoardCell
  hoverStyle={canAttack ? {
    scale: 1.08,
    backgroundColor: theme.cellHover,
    borderColor: theme.primaryColor,
  } : undefined}
  ...
/>
```

Add `overflow: 'visible'` to `BoardGrid` to prevent scale clipping.

### Board Panels (`PlayerSection`)

- `backdropFilter: 'blur(8px)'` via inline `style` prop (Tamagui does not support `backdrop-filter` as a styled prop)
- Default border: `theme.cellBorder`
- **Active enemy board** (your turn): border `theme.accentColor` + `breathe` CSS animation class

### CSS Animations

All keyframe animations are injected via `useSeaBattleAnimations()` hook in a new file `ui/styles/animations.ts`. The hook appends a `<style id="sea-battle-animations">` element to `document.head` on mount, checking `document.getElementById('sea-battle-animations')` first to avoid duplicates. Removed on unmount only if no other instance is mounted. Called once in `Game.tsx`.

`animations.ts` must be `'use client'` (accesses `document`). `Game.tsx` is already a client component, so this is safe. SSR renders no animations; they hydrate on the client.

`@tamagui/animations-css` is already configured in `packages/ui/src/tamagui.config.ts` — `hoverStyle` with `scale` works as-is.

Animations defined:

- `breathe` — board border glow pulse (enemy board on your turn)
- `turn-pulse` — expanding ring on turn badge dot
- `valid-pulse` — placement preview green pulse
- `selected-glow` — ship palette item selected state
- `preview-fade` — theme preview board fade-in

**Applying animation classes to Tamagui components:** Tamagui styled components accept `className` on the web target. Use `className={isMyTurn ? 'breathe' : undefined}` on `PlayerSection` for the active board border animation.

### Turn Indicator

The existing `<Badge variant="success" size="sm" pulse>` in `AttackBoard` is **replaced** with a new `<TurnBadge>` sub-component (extracted to `ui/TurnBadge.tsx`) — a pill with blinking dot + translated text.

Turn text uses existing i18n keys:
- `games.sea_battle_v1.table.players.yourTurnAttack` (already exists)
- `games.sea_battle_v1.table.players.waitingFor` (already exists)

The `TurnIndicator` from `@arcadeum/ui` in the header (`Game.tsx`) is **unchanged**.

**"🎯 TARGET" badge** above enemy board uses new i18n key `games.sea_battle_v1.table.players.targetBadge` → `"Target"` (emoji prepended in component). Add to all 5 locale files. The `t()` function returns the key path as fallback when a key is missing — no hardcoded fallback string needed.

### Ships Remaining (`ShipsLeft.tsx`)

Add `useSeaBattleTheme()` call inside `ShipsLeft`. Replace hardcoded colors:
- Own alive: `theme.primaryColor`
- Enemy alive: `theme.textSecondaryColor`
- Sunk: `theme.hitColor` at 35% opacity

---

## 2. Ship Placement (`ShipPlacementBoard.tsx`)

### Board Preview

- **Valid placement:** green pulsing cells (`rgba(52,211,153,0.25)` fill + `rgba(52,211,153,0.7)` border + `valid-pulse` class)
- **Invalid placement:** red tint cells (`rgba(239,68,68,0.2)` fill + `rgba(239,68,68,0.6)` border)

Add `isInvalidHover: boolean` alongside `hoveredCells` in component state. `handleCellHover` sets this when `canPlaceAt` returns false (currently shows nothing in that case). Reset to `false` in the existing `onMouseLeave` / `onPointerLeave` handlers (already call `handleCellHover(-1, -1)` — update that handler to also set `isInvalidHover = false`).

### Drag-and-Drop (`useDragPlacement` hook)

Hook signature:

```ts
function useDragPlacement(args: {
  ships: ShipConfig[];
  board: CellState[][];
  isVertical: boolean;
  onPlaceShip: (shipId: string, cells: ShipCell[]) => void;
  selectedShipId: string | null;
  setSelectedShipId: (id: string | null) => void;
}): {
  getDragProps: (shipId: string) => { draggable: boolean; onDragStart: DragEventHandler };
  getDropProps: (row: number, col: number) => { onDragOver: DragEventHandler; onDrop: DragEventHandler };
  isDragging: boolean;
}
```

- `draggable` is only `true` for unplaced ships
- `onDragStart`: sets `dataTransfer.effectAllowed = 'move'`, stores `shipId`, **clears `selectedShipId`** to prevent dual-mode conflict
- `onDragOver`: calls `e.preventDefault()`, computes valid cells, updates `hoveredCells`
- `onDrop`: calls `onPlaceShip` with computed cells
- Touch detection: `getDragProps` returns `draggable: false` on `(pointer: coarse)` devices (checked once on mount via `window.matchMedia`)
- Click-to-place via `selectedShipId` flow is unchanged and remains active on all devices

### Ship Palette (`ShipPalette`)

- Ship items show mini-cell blocks (14×14px, use existing `ShipCell` styled component)
- States:
  - **Unplaced:** grey blocks, `grab` cursor
  - **Selected:** `selected-glow` CSS class + blue-tinted blocks + `◀` chevron
  - **Placed:** 50% opacity + green blocks + `✓` checkmark + `default` cursor
- Drag hint below title uses new i18n key `games.sea_battle_v1.table.actions.dragHint`

### Action Buttons

Emoji prefixes added in component code — i18n strings unchanged. All label keys already exist:

| Button | i18n keys used |
|--------|----------------|
| `↻ Rotate (H/V)` | `actions.rotate` + `state.horizontal` / `state.vertical` |
| `↺ Reset` | `actions.resetPlacement` |
| `🎲 Auto-place / Randomize` | `actions.autoPlace` / `actions.randomize` |
| `⚓ Confirm Placement` | `actions.confirmPlacement` |

Confirm button: glowing green gradient + `valid-pulse` class when all ships placed; muted/disabled otherwise.

---

## 3. Lobby (`SeaBattleLobby.tsx` — `optionsSlot` only)

> `ReusableGameLobby` is shared with `CriticalGame` and must not be modified.

### Theme Picker

Replaces `<VariantSelector>` in `optionsSlot`. Tab strip showing emoji + name for first 4 variants. A `"+ N more ▾"` button (`aria-label="Show all themes"`) toggles `showAllVariants` local boolean to reveal remaining tabs. Clicking a tab calls `setSelectedVariant` + fires the existing `GameVariantSelector` API update via a `useEffect`.

### `SeaBattleThemePreview` component

New file: `ui/SeaBattleThemePreview.tsx`

- Renders a static 10×10 board using `useSeaBattleTheme()` colors
- Pre-set hardcoded pattern shows all four cell states: empty, ship, hit, miss
- `key={selectedVariant}` re-triggers `preview-fade` animation on theme change
- Positioned to the right of theme tabs in an `XStack`
- On `$md` breakpoint: moves below tabs (`flexDirection: 'column'` on the parent `XStack`)
- Display only — no interactive cells

### Color Swatches

- Swatch size: `width/height: 36` (up from 16)
- Hit swatch: add `boxShadow: \`0 2px 8px ${theme.hitColor}80\``
- Label "Colors" uses existing `games.sea_battle_v1.colors.*` keys

---

## 4. New i18n Keys

Add to all 5 locale files (`en`, `ru`, `es`, `fr`, `by`):

| Key | English value |
|-----|---------------|
| `games.sea_battle_v1.table.players.targetBadge` | `"Target"` |
| `games.sea_battle_v1.table.actions.dragHint` | `"Drag to board · Click to select"` |

---

## 5. New Files

| File | Purpose |
|------|---------|
| `widgets/SeaBattleGame/hooks/useDragPlacement.ts` | HTML5 DnD hook |
| `widgets/SeaBattleGame/ui/TurnBadge.tsx` | Turn pill badge with blinking dot |
| `widgets/SeaBattleGame/ui/SeaBattleThemePreview.tsx` | Static 10×10 board preview for lobby |
| `widgets/SeaBattleGame/ui/styles/animations.ts` | `useSeaBattleAnimations()` — injects CSS keyframes into `<head>` |

---

## 6. Files Changed

| File | Change |
|------|--------|
| `ui/AttackBoard.tsx` | Sunk detection; emoji icon children; glassmorphism panels; target badge; `TurnBadge` |
| `ui/ShipPlacementBoard.tsx` | Drag-and-drop via `useDragPlacement`; invalid hover state; button emoji prefixes |
| `ui/ShipsLeft.tsx` | Add `useSeaBattleTheme()`; replace hardcoded colors |
| `ui/SeaBattleLobby.tsx` | Theme tab strip + `SeaBattleThemePreview` + larger swatches |
| `ui/styles/board.tsx` | `BoardGrid` overflow visible; `BoardCell` hover scale |
| `ui/styles/placement.tsx` | `ShipItem` states; `ShipCell` color; `PlacementActions` layout |
| `ui/styles/player.tsx` | `PlayerSection` inline `backdropFilter`; `breathe` class support |
| `shared/i18n/messages/games/sea-battle/*.ts` | 2 new keys × 5 locale files |
| `ui/Game.tsx` | Call `useSeaBattleAnimations()` |

---

## 7. File Size Projections

| File | Current | Projected | Status |
|------|---------|-----------|--------|
| `AttackBoard.tsx` | 243 | ~320 | Safe |
| `ShipPlacementBoard.tsx` | 377 | ~460 | Safe |
| `ShipsLeft.tsx` | 83 | ~100 | Safe |
| `SeaBattleLobby.tsx` | 248 | ~290 | Safe |
| `styles/board.tsx` | 97 | ~110 | Safe |
| `styles/placement.tsx` | 84 | ~110 | Safe |
| `styles/player.tsx` | 62 | ~80 | Safe |

---

## 8. Playwright Test Impact

| Test file | Impact | Action needed |
|-----------|--------|---------------|
| `sea-battle-colors.spec.ts` | Checks `data-highlighted="true"` + cell `backgroundColor`. Emoji icons are `position:absolute` children — cell own `backgroundColor` unaffected. | None |
| `sea-battle-lobby-colors.spec.ts` | Checks `data-testid="color-swatch-*"` background colors. Colors unchanged; only size increases. | None |
| Other sea-battle specs | No structural DOM changes to game flow selectors. | None |

---

## 9. Constraints

- **No changes to game logic** — hooks, types, engine, socket layer all untouched
- **No changes to `ReusableGameLobby`** — shared with `CriticalGame`
- **Theme system preserved** — all 10 variants work via `useSeaBattleTheme()`
- **i18n** — 2 new keys added to all 5 locale files; no hardcoded user-visible strings
- **Max 500 lines per file** — all files projected well under limit (see §7)
- **Playwright tests** — no selector changes needed (see §8)

---

## 10. Out of Scope

- Sound effects
- Multiplayer spectator view
- Mobile-specific gestures beyond existing touch support
- Changes to game rules or win conditions
