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

### Cell States

| State | Visual |
|-------|--------|
| Empty | `rgba(15,30,60,0.8)` dark fill, subtle blue border |
| Ship (own board) | Steel blue fill (`rgba(148,163,184,0.4)`) |
| Hit | Red fill + `🔥` icon + pulsing red `box-shadow` glow animation |
| Miss | Dark fill + white dot (9px circle, `rgba(255,255,255,0.55)`) |
| Sunk (all cells of ship) | Deep red fill + `💀` icon + stronger persistent glow |
| Hover (enemy cells, your turn only) | Blue tint (`rgba(96,165,250,0.28)`) + glowing border + `scale(1.08)` + `crosshair` cursor |

### Board Panels (`PlayerSection`)

- `backdrop-filter: blur(8px)` + semi-transparent background + `border-radius: 12px`
- Border color: `rgba(96,165,250,0.2)` default
- **Active enemy board** (when it's your turn): border switches to `rgba(16,185,129,0.5)` with a `breathe` animation (subtle glow pulse)
- "🎯 TARGET" badge appears above enemy board on your turn

### Turn Indicator

- Pill badge with blinking green dot + text
- `turn-pulse` keyframe (expanding ring that fades out)
- Text: "YOUR TURN — CLICK TO ATTACK" / "WAITING FOR [name]"

### Ships Remaining (`ShipsLeft.tsx`)

- Use theme colors instead of hardcoded `#4caf50` / `#ccc`
- Own ships: `theme.primaryColor` (blue)
- Enemy ships: `theme.textSecondaryColor` (grey)
- Sunk ships: faded red (`theme.hitColor` at 35% opacity)
- Counter badge: green for own, red for enemy

---

## 2. Ship Placement (`ShipPlacementBoard.tsx`)

### Board Preview

- **Valid placement:** green pulsing cells (`rgba(52,211,153,0.25)` fill + `rgba(52,211,153,0.7)` border + `valid-pulse` animation)
- **Invalid placement:** red tint cells (`rgba(239,68,68,0.2)` fill + `rgba(239,68,68,0.6)` border) — shown when hovering over an occupied or too-close position
- Currently only valid positions show a preview; invalid hovering shows nothing

### Ship Palette (`ShipPalette`)

- Each ship item shows visual mini-cell blocks (14×14px squares) matching ship size
- States:
  - **Unplaced:** default border, grey blocks, `grab` cursor
  - **Selected:** `selected-glow` animation (blue border pulse) + blue-tinted blocks + `◀` indicator
  - **Placed:** 50% opacity + green blocks + `✓` checkmark + `default` cursor
- Drag hint text below palette title: "↕ Drag to board · Click to select"

### Drag-and-Drop

- New `useDragPlacement` hook using the HTML5 Drag and Drop API
- `draggable` attribute on unplaced ship items
- `onDragOver` / `onDrop` on board cells
- Falls back to existing click-to-place on touch devices (mobile/tablet)
- On drag start: set ghost image, highlight valid drop zones
- On drop: call existing `onPlaceShip` with computed cells

### Action Buttons

- **Rotate:** shows current orientation — `↻ Rotate (Horizontal)` / `↻ Rotate (Vertical)`. Disabled when no ship selected.
- **Reset:** `↺ Reset` — secondary style
- **Auto-place / Randomize:** `🎲 Auto-place` (no ships placed) / `🎲 Randomize` (some placed)
- **Confirm Placement:** disabled + muted until all ships placed; then switches to glowing green (`linear-gradient(135deg, #10b981, #059669)` + `valid-pulse` animation) with label `⚓ Confirm Placement`

---

## 3. Lobby (`SeaBattleLobby.tsx` — `optionsSlot` only)

> `ReusableGameLobby` is shared with `CriticalGame` and must not be modified.

### Theme Picker (replaces `VariantSelector` slot)

- Compact tab strip: emoji + short name for each variant
- Active tab: `rgba(96,165,250,0.15)` background + blue border
- Collapsed "show more" for variants beyond the first 4 visible
- Clicking a tab updates `selectedVariant` state (existing behavior)

### Live Board Preview

- New `SeaBattleThemePreview` component renders a static 10×10 board
- Board uses the selected theme's actual colors (empty, ship, hit, miss cells)
- Includes a few pre-set ship/hit/miss positions so all states are visible
- Animates in on theme change (`preview-fade` keyframe)
- Positioned to the right of the theme tabs

### Color Swatches

- Larger swatches (36×36px, `border-radius: 8px`) vs. current 16×16px
- Section label: "[ThemeName] Colors"
- Four swatches: Ship, Hit, Miss, Empty
- Hit swatch has colored `box-shadow` matching hit color
- Update instantly when theme changes (driven by `VARIANT_THEMES[selectedVariant]`)

---

## 4. New Files

| File | Purpose |
|------|---------|
| `widgets/SeaBattleGame/hooks/useDragPlacement.ts` | HTML5 DnD hook for ship placement |
| `widgets/SeaBattleGame/ui/SeaBattleThemePreview.tsx` | Static 10×10 board preview for lobby |
| `widgets/SeaBattleGame/ui/styles/cells.tsx` | New styled cell variants (hit glow, hover, valid/invalid) |

---

## 5. Files Changed

| File | Change |
|------|--------|
| `ui/AttackBoard.tsx` | New cell rendering with emoji icons + glow; board panel glassmorphism; target badge |
| `ui/ShipPlacementBoard.tsx` | Drag-and-drop via `useDragPlacement`; invalid preview; new button styles |
| `ui/ShipsLeft.tsx` | Use theme colors; improve sunk state rendering |
| `ui/SeaBattleLobby.tsx` | Replace `optionsSlot` with theme tabs + live preview + larger swatches |
| `ui/styles/board.tsx` | Add hover, hit-glow, valid/invalid cell variants |
| `ui/styles/placement.tsx` | Updated `ShipItem`, `ShipCell`, `PlacementActions` |
| `ui/styles/player.tsx` | Glassmorphism `PlayerSection`; `breathe` animation for active board |

---

## 6. Constraints

- **No changes to game logic** — hooks (`useSeaBattleState`, `useSeaBattleActions`), types, engine, socket layer all untouched
- **No changes to `ReusableGameLobby`** — shared component, changes would affect `CriticalGame`
- **Theme system preserved** — all 10 variants continue to work; new cells pull colors from `useSeaBattleTheme()`
- **i18n** — no new user-facing strings needed; all displayed text is already translated
- **Max 500 lines per file** — if any file grows past limit, extract into a focused sub-file
- **Tests** — existing Playwright e2e tests for lobby colors (`sea-battle-lobby-colors.spec.ts`) must still pass; update selectors if needed

---

## 7. Out of Scope

- Sound effects
- Multiplayer spectator view
- Mobile-specific gestures beyond existing touch support
- Changes to game rules or win conditions
