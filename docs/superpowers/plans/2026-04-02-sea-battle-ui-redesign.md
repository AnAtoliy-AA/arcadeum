# Sea Battle UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Incrementally enhance the Sea Battle widget UI with glassmorphism panels, animated hit/miss/sunk cells, drag-and-drop ship placement, and a live theme preview in the lobby — without touching any game logic.

**Architecture:** All changes are layered on top of the existing rendering layer only. New styled component variants, a CSS keyframe injection hook, a DnD hook, and two new display components are added. All existing hooks (`useSeaBattleState`, `useSeaBattleActions`), types, socket wiring, and `ReusableGameLobby` remain untouched.

**Tech Stack:** Next.js 14 (App Router), Tamagui (`@tamagui/animations-css` already configured), HTML5 Drag and Drop API, Vitest (unit tests), Playwright (e2e)

---

## File Map

**New files:**
- `apps/web/src/widgets/SeaBattleGame/ui/styles/animations.ts` — CSS keyframes injected into `<head>`
- `apps/web/src/widgets/SeaBattleGame/ui/TurnBadge.tsx` — turn pill badge component
- `apps/web/src/widgets/SeaBattleGame/ui/SeaBattleThemePreview.tsx` — static 10×10 board preview for lobby
- `apps/web/src/widgets/SeaBattleGame/hooks/useDragPlacement.ts` — HTML5 DnD hook for ship placement

**Modified files:**
- `apps/web/src/widgets/SeaBattleGame/ui/styles/board.tsx` — BoardGrid overflow, BoardCell hover
- `apps/web/src/widgets/SeaBattleGame/ui/styles/placement.tsx` — ShipItem states, placement actions
- `apps/web/src/widgets/SeaBattleGame/ui/styles/player.tsx` — PlayerSection glassmorphism
- `apps/web/src/widgets/SeaBattleGame/ui/ShipsLeft.tsx` — theme-aware colors
- `apps/web/src/widgets/SeaBattleGame/ui/AttackBoard.tsx` — sunk cells, emoji icons, glassmorphism, TurnBadge
- `apps/web/src/widgets/SeaBattleGame/ui/ShipPlacementBoard.tsx` — invalid hover, drag-and-drop, button updates
- `apps/web/src/widgets/SeaBattleGame/ui/SeaBattleLobby.tsx` — theme tabs, live preview, larger swatches
- `apps/web/src/widgets/SeaBattleGame/ui/Game.tsx` — call `useSeaBattleAnimations()`
- `apps/web/src/shared/i18n/messages/games/sea-battle/en.ts` — 2 new keys
- `apps/web/src/shared/i18n/messages/games/sea-battle/ru.ts` — 2 new keys
- `apps/web/src/shared/i18n/messages/games/sea-battle/es.ts` — 2 new keys
- `apps/web/src/shared/i18n/messages/games/sea-battle/fr.ts` — 2 new keys
- `apps/web/src/shared/i18n/messages/games/sea-battle/by.ts` — 2 new keys

---

## Task 1: CSS Animations Hook

**Files:**
- Create: `apps/web/src/widgets/SeaBattleGame/ui/styles/animations.ts`
- Modify: `apps/web/src/widgets/SeaBattleGame/ui/Game.tsx`

- [ ] **Step 1: Create the animations hook**

Create `apps/web/src/widgets/SeaBattleGame/ui/styles/animations.ts`:

```ts
'use client';

import { useEffect } from 'react';

const CSS = `
@keyframes breathe {
  0%, 100% { box-shadow: 0 0 8px rgba(52, 211, 153, 0.3), inset 0 0 20px rgba(52, 211, 153, 0.05); }
  50%       { box-shadow: 0 0 20px rgba(52, 211, 153, 0.6), inset 0 0 30px rgba(52, 211, 153, 0.12); }
}
@keyframes turn-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5); }
  70%      { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
}
@keyframes glow-hit {
  0%, 100% { box-shadow: 0 0 6px rgba(239, 68, 68, 0.5); }
  50%      { box-shadow: 0 0 18px rgba(239, 68, 68, 0.9), 0 0 30px rgba(239, 68, 68, 0.3); }
}
@keyframes glow-sunk {
  0%, 100% { box-shadow: 0 0 10px rgba(239, 68, 68, 0.7); }
  50%      { box-shadow: 0 0 24px rgba(239, 68, 68, 1), 0 0 40px rgba(239, 68, 68, 0.4); }
}
@keyframes valid-pulse {
  0%, 100% { box-shadow: 0 0 4px rgba(52, 211, 153, 0.4); }
  50%      { box-shadow: 0 0 12px rgba(52, 211, 153, 0.8); }
}
@keyframes selected-glow {
  0%, 100% { box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.4); }
  50%      { box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.8), 0 0 12px rgba(96, 165, 250, 0.3); }
}
@keyframes preview-fade {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes dot-blink {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.3; }
}
.sb-breathe     { animation: breathe 3s ease-in-out infinite; }
.sb-glow-hit    { animation: glow-hit 2s ease-in-out infinite; }
.sb-glow-sunk   { animation: glow-sunk 1.5s ease-in-out infinite; }
.sb-valid-pulse { animation: valid-pulse 1.2s ease-in-out infinite; }
.sb-selected-glow { animation: selected-glow 1.5s ease-in-out infinite; }
.sb-preview-fade  { animation: preview-fade 0.2s ease-out forwards; }
.sb-dot-blink     { animation: dot-blink 1.2s ease-in-out infinite; }
.sb-turn-pulse    { animation: turn-pulse 2s ease-in-out infinite; }
`;

let mountCount = 0;

export function useSeaBattleAnimations(): void {
  useEffect(() => {
    mountCount++;
    if (!document.getElementById('sea-battle-animations')) {
      const el = document.createElement('style');
      el.id = 'sea-battle-animations';
      el.textContent = CSS;
      document.head.appendChild(el);
    }
    return () => {
      mountCount--;
      if (mountCount === 0) {
        document.getElementById('sea-battle-animations')?.remove();
      }
    };
  }, []);
}
```

- [ ] **Step 2: Wire into Game.tsx**

In `apps/web/src/widgets/SeaBattleGame/ui/Game.tsx`, add the import and call:

```tsx
// Add import at top
import { useSeaBattleAnimations } from './styles/animations';

// Add inside SeaBattleGame component body, near the top:
useSeaBattleAnimations();
```

- [ ] **Step 3: Verify dev server compiles**

```bash
cd apps/web && pnpm dev 2>&1 | head -20
```

Expected: No TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/widgets/SeaBattleGame/ui/styles/animations.ts \
        apps/web/src/widgets/SeaBattleGame/ui/Game.tsx
git commit -m "feat(ARC-456): add CSS animations hook for sea battle UI"
```

---

## Task 2: i18n Keys

**Files:**
- Modify: `apps/web/src/shared/i18n/messages/games/sea-battle/en.ts`
- Modify: `apps/web/src/shared/i18n/messages/games/sea-battle/ru.ts`
- Modify: `apps/web/src/shared/i18n/messages/games/sea-battle/es.ts`
- Modify: `apps/web/src/shared/i18n/messages/games/sea-battle/fr.ts`
- Modify: `apps/web/src/shared/i18n/messages/games/sea-battle/by.ts`

- [ ] **Step 1: Add keys to en.ts**

In `table.players`, add after `waitingFor`:
```ts
targetBadge: 'Target',
```

In `table.actions`, add after `waitingForOthers`:
```ts
dragHint: 'Drag to board · Click to select',
```

- [ ] **Step 2: Add keys to ru.ts**

In `table.players`, add:
```ts
targetBadge: 'Цель',
```
In `table.actions`, add:
```ts
dragHint: 'Перетащите на поле · Нажмите для выбора',
```

- [ ] **Step 3: Add keys to es.ts**

In `table.players`, add:
```ts
targetBadge: 'Objetivo',
```
In `table.actions`, add:
```ts
dragHint: 'Arrastra al tablero · Haz clic para seleccionar',
```

- [ ] **Step 4: Add keys to fr.ts**

In `table.players`, add:
```ts
targetBadge: 'Cible',
```
In `table.actions`, add:
```ts
dragHint: 'Glisser sur le plateau · Cliquer pour sélectionner',
```

- [ ] **Step 5: Add keys to by.ts**

In `table.players`, add:
```ts
targetBadge: 'Мэта',
```
In `table.actions`, add:
```ts
dragHint: 'Перацягніце на поле · Націсніце для выбару',
```

- [ ] **Step 6: Verify translation validation passes**

```bash
cd apps/web && pnpm check-translations 2>&1 | tail -10
```

Expected: `✅ All translation keys are present!`

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/shared/i18n/messages/games/sea-battle/
git commit -m "feat(ARC-456): add targetBadge and dragHint i18n keys for sea battle"
```

---

## Task 3: Style Layer Updates

**Files:**
- Modify: `apps/web/src/widgets/SeaBattleGame/ui/styles/board.tsx`
- Modify: `apps/web/src/widgets/SeaBattleGame/ui/styles/placement.tsx`
- Modify: `apps/web/src/widgets/SeaBattleGame/ui/styles/player.tsx`

- [ ] **Step 1: Update board.tsx — BoardGrid overflow + BoardCell hover**

In `apps/web/src/widgets/SeaBattleGame/ui/styles/board.tsx`:

Add `overflow: 'visible'` to `BoardGrid`:
```tsx
export const BoardGrid = styled(YStack, {
  name: 'BoardGrid',
  flexDirection: 'row',
  flexWrap: 'wrap',
  padding: 4,
  width: '100%',
  maxWidth: 400,
  aspectRatio: 1,
  overflow: 'visible',   // <-- add this
  // ... rest unchanged
```

- [ ] **Step 1b: Confirm BoardCell accepts hoverStyle**

`BoardCell` is a `styled(YStack)` component. Tamagui `styled()` components accept `hoverStyle` natively on the web target with `@tamagui/animations-css` — no additional variant is needed. The `hoverStyle` prop passed inline in Task 6 will work as-is.

- [ ] **Step 2: Update placement.tsx — ShipItem states + ShipPalette cursor**

In `apps/web/src/widgets/SeaBattleGame/ui/styles/placement.tsx`:

Update `ShipItem` variants — the `isPlaced: false` state should show `grab` cursor:
```tsx
variants: {
  isPlaced: {
    true:  { opacity: 0.5, cursor: 'default' },
    false: { cursor: 'grab' },           // was 'pointer'
  },
  // ...
```

- [ ] **Step 3: Update player.tsx — borderRadius on PlayerSection**

In `apps/web/src/widgets/SeaBattleGame/ui/styles/player.tsx`, update `PlayerSection`:

```tsx
export const PlayerSection = styled(YStack, {
  name: 'PlayerSection',
  alignItems: 'center',
  gap: '$2',
  padding: '$4',
  borderWidth: 2,
  borderRadius: 12,        // <-- add this
  // ... rest unchanged
```

- [ ] **Step 4: Verify TypeScript**

```bash
cd apps/web && pnpm tsc --noEmit 2>&1 | grep -E "error|warning" | head -20
```

Expected: No new errors.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/widgets/SeaBattleGame/ui/styles/
git commit -m "feat(ARC-456): update sea battle styled component foundations"
```

---

## Task 4: TurnBadge Component

**Files:**
- Create: `apps/web/src/widgets/SeaBattleGame/ui/TurnBadge.tsx`

- [ ] **Step 1: Create TurnBadge**

Create `apps/web/src/widgets/SeaBattleGame/ui/TurnBadge.tsx`:

```tsx
'use client';

import { XStack, YStack, Text } from 'tamagui';

interface TurnBadgeProps {
  isYourTurn: boolean;
  text: string;
}

export function TurnBadge({ isYourTurn, text }: TurnBadgeProps) {
  return (
    <XStack
      alignItems="center"
      gap="$2"
      paddingHorizontal="$3"
      paddingVertical="$2"
      borderRadius={20}
      borderWidth={1}
      className={isYourTurn ? 'sb-turn-pulse' : undefined}
      style={{
        background: isYourTurn
          ? 'rgba(16, 185, 129, 0.12)'
          : 'rgba(255, 255, 255, 0.06)',
        borderColor: isYourTurn
          ? 'rgba(16, 185, 129, 0.4)'
          : 'rgba(255, 255, 255, 0.1)',
      }}
    >
      <YStack
        width={7}
        height={7}
        borderRadius={100}
        className={isYourTurn ? 'sb-dot-blink' : undefined}
        backgroundColor={isYourTurn ? '#10b981' : 'rgba(255,255,255,0.3)'}
      />
      <Text
        fontSize={11}
        fontWeight="600"
        letterSpacing={0.8}
        color={isYourTurn ? '#10b981' : 'rgba(255,255,255,0.5)'}
      >
        {text}
      </Text>
    </XStack>
  );
}
```

- [ ] **Step 2: TypeScript check**

```bash
cd apps/web && pnpm tsc --noEmit 2>&1 | grep TurnBadge
```

Expected: No errors mentioning TurnBadge.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/widgets/SeaBattleGame/ui/TurnBadge.tsx
git commit -m "feat(ARC-456): add TurnBadge component"
```

---

## Task 5: ShipsLeft Theme Colors

**Files:**
- Modify: `apps/web/src/widgets/SeaBattleGame/ui/ShipsLeft.tsx`

- [ ] **Step 1: Replace hardcoded colors with theme colors**

In `apps/web/src/widgets/SeaBattleGame/ui/ShipsLeft.tsx`, add theme import and replace the hardcoded cell colors:

```tsx
// Add import
import { useSeaBattleTheme } from '../lib/SeaBattleThemeContext';

export function ShipsLeft({ ships, isMe }: ShipsLeftProps) {
  const { t } = useTranslation();
  const theme = useSeaBattleTheme();          // <-- add
  // ... rest of existing code unchanged

  // Inside the mini cell, replace hardcoded colors:
  // Old: backgroundColor={isSunk ? '#ff4444' : isMe ? '#4caf50' : '#ccc'}
  // New:
  backgroundColor={
    isSunk
      ? `${theme.hitColor}59`          // hitColor at ~35% opacity (hex 59 ≈ 0.35)
      : isMe
      ? theme.primaryColor
      : theme.textSecondaryColor
  }
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd apps/web && pnpm tsc --noEmit 2>&1 | grep ShipsLeft
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/widgets/SeaBattleGame/ui/ShipsLeft.tsx
git commit -m "feat(ARC-456): use theme colors in ShipsLeft"
```

---

## Task 6: AttackBoard Redesign

**Files:**
- Modify: `apps/web/src/widgets/SeaBattleGame/ui/AttackBoard.tsx`

- [ ] **Step 1: Add sunk cell detection + emoji icon helper**

At the top of `AttackBoard.tsx`, add the sunk detection memo and a helper to render cell content. Place after existing imports:

```tsx
import { useMemo } from 'react'; // already imported
import { TurnBadge } from './TurnBadge';
import { useTranslation, type TranslationKey } from '@/shared/lib/useTranslation';
```

Inside the `AttackBoard` component, add before the return:

```tsx
const { t } = useTranslation();

// Build a set of "playerId-row-col" keys for all sunk ship cells
const sunkCellSet = useMemo(() => {
  const set = new Set<string>();
  players.forEach(p => {
    p.ships.filter(s => s.sunk).forEach(s => {
      s.cells.forEach(c => set.add(`${p.playerId}-${c.row}-${c.col}`));
    });
  });
  return set;
}, [players]);

// Returns the emoji icon for a cell (null = no icon)
function getCellIcon(
  playerId: string,
  rIndex: number,
  cIndex: number,
  cellState: number,
): string | null {
  if (sunkCellSet.has(`${playerId}-${rIndex}-${cIndex}`)) return '💀';
  if (cellState === CELL_STATE.HIT) return '🔥';
  return null;
}

// Returns the CSS animation class for a cell
function getCellClass(
  playerId: string,
  rIndex: number,
  cIndex: number,
  cellState: number,
): string | undefined {
  if (sunkCellSet.has(`${playerId}-${rIndex}-${cIndex}`)) return 'sb-glow-sunk';
  if (cellState === CELL_STATE.HIT) return 'sb-glow-hit';
  return undefined;
}
```

- [ ] **Step 2: Update PlayerSection to use glassmorphism + breathe animation**

Replace the existing `<PlayerSection ...>` for both own and opponent boards. Add `style` prop for `backdropFilter` and `className` for breathe:

For your own fleet section:
```tsx
<PlayerSection
  position="relative"
  overflow="visible"
  backgroundColor={theme.boardBackground}
  borderColor={theme.cellBorder}
  style={{ backdropFilter: 'blur(8px)' } as React.CSSProperties}
>
```

For opponent section (targetable):
```tsx
<PlayerSection
  key={opponent.playerId}
  position="relative"
  overflow="visible"
  isTargetable={isMyTurn}
  backgroundColor={theme.boardBackground}
  borderColor={isMyTurn ? theme.accentColor : theme.cellBorder}
  className={isMyTurn ? 'sb-breathe' : undefined}
  style={{ backdropFilter: 'blur(8px)' } as React.CSSProperties}
>
```

- [ ] **Step 3: Replace Badge with TurnBadge + add TARGET badge**

Replace existing `<BadgeWrapper><Badge ...>` blocks:

For your own board (currently shows "your turn" badge):
```tsx
{currentTurnPlayerId === currentUserId && (
  <BadgeWrapper>
    <TurnBadge
      isYourTurn={true}
      text={t('games.sea_battle_v1.table.players.yourTurn' as TranslationKey)}
    />
  </BadgeWrapper>
)}
```

For opponent board — replace the "alive" badge with a TARGET badge when it's your turn:
```tsx
{isMyTurn && (
  <BadgeWrapper>
    <XStack
      alignItems="center"
      gap="$1"
      paddingHorizontal="$3"
      paddingVertical="$1"
      borderRadius={12}
      borderWidth={1}
      backgroundColor="rgba(239,68,68,0.15)"
      borderColor="rgba(239,68,68,0.4)"
    >
      <Text fontSize={12}>🎯</Text>
      <Text fontSize={10} fontWeight="600" color="#fca5a5">
        {t('games.sea_battle_v1.table.players.targetBadge' as TranslationKey)}
      </Text>
    </XStack>
  </BadgeWrapper>
)}
```

- [ ] **Step 4: Add emoji icons to board cells**

Update the `BoardCell` rendering for opponent boards to include the icon child and animation class:

```tsx
{opponent.board.map((row, rIndex) =>
  row.map((cellState, cIndex) => {
    const isSunk = sunkCellSet.has(`${opponent.playerId}-${rIndex}-${cIndex}`);
    const displayState = isSunk
      ? CELL_STATE.HIT
      : cellState === CELL_STATE.SHIP
      ? CELL_STATE.EMPTY
      : cellState;
    const canAttack =
      isMyTurn &&
      !disabled &&
      cellState !== CELL_STATE.HIT &&
      cellState !== CELL_STATE.MISS &&
      !isSunk;
    const icon = getCellIcon(opponent.playerId, rIndex, cIndex, cellState);
    const cellClass = getCellClass(opponent.playerId, rIndex, cIndex, cellState);

    return (
      <BoardCell
        key={`${opponent.playerId}-${rIndex}-${cIndex}`}
        isClickable={canAttack}
        backgroundColor={getCellBg(displayState, theme)}
        hoverStyle={
          canAttack
            ? {
                scale: 1.08,
                backgroundColor: theme.cellHover,
                borderColor: theme.primaryColor,
              }
            : undefined
        }
        borderColor={theme.cellBorder}
        borderRadius={parseInt(theme.borderRadius) || 4}
        className={cellClass}
        data-row={rIndex}
        data-col={cIndex}
        onClick={() => canAttack && handleCellClick(opponent.playerId, rIndex, cIndex)}
        position="relative"
      >
        {icon && (
          <Text
            position="absolute"
            fontSize={12}
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            {icon}
          </Text>
        )}
      </BoardCell>
    );
  })
)}
```

Also add miss white dot for own board and opponent cells with MISS state — add this helper to `getCellBg` result rendering: for miss cells render a white dot child (absolute positioned circle div).

For miss cells on opponent board, add:
```tsx
{displayState === CELL_STATE.MISS && (
  <YStack
    position="absolute"
    width={9}
    height={9}
    borderRadius={100}
    backgroundColor="rgba(255,255,255,0.55)"
    style={{ pointerEvents: 'none' }}
  />
)}
```

- [ ] **Step 5: TypeScript check**

```bash
cd apps/web && pnpm tsc --noEmit 2>&1 | grep -E "AttackBoard|error TS" | head -20
```

Expected: No errors.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/widgets/SeaBattleGame/ui/AttackBoard.tsx
git commit -m "feat(ARC-456): redesign AttackBoard with sunk cells, emoji icons, glassmorphism"
```

---

## Task 7: useDragPlacement Hook

**Files:**
- Create: `apps/web/src/widgets/SeaBattleGame/hooks/useDragPlacement.ts`

- [ ] **Step 1: Create the hook**

Create `apps/web/src/widgets/SeaBattleGame/hooks/useDragPlacement.ts`:

```ts
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { DragEvent } from 'react';
import type { ShipConfig, ShipCell, CellState } from '../types';
import { BOARD_SIZE, CELL_STATE, SHIPS } from '../types';

interface UseDragPlacementArgs {
  board: CellState[][];
  isVertical: boolean;
  placedShipIds: Set<string>;
  onPlaceShip: (shipId: string, cells: ShipCell[]) => void;
  setSelectedShipId: (id: string | null) => void;
  setHoveredCells: (cells: ShipCell[]) => void;
}

interface DragProps {
  draggable: boolean;
  onDragStart: (e: DragEvent<HTMLElement>) => void;
}

interface DropProps {
  onDragOver: (e: DragEvent<HTMLElement>) => void;
  onDrop: (e: DragEvent<HTMLElement>) => void;
  onDragLeave: (e: DragEvent<HTMLElement>) => void;
}

function getCells(row: number, col: number, size: number, vertical: boolean): ShipCell[] | null {
  const cells: ShipCell[] = [];
  for (let i = 0; i < size; i++) {
    const r = vertical ? row + i : row;
    const c = vertical ? col : col + i;
    if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) return null;
    cells.push({ row: r, col: c });
  }
  return cells;
}

function canPlace(cells: ShipCell[], board: CellState[][]): boolean {
  for (const cell of cells) {
    if (board[cell.row]?.[cell.col] !== CELL_STATE.EMPTY) return false;
    const dirs = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
    for (const [dr, dc] of dirs) {
      const r = cell.row + dr;
      const c = cell.col + dc;
      if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
        if (board[r][c] === CELL_STATE.SHIP) return false;
      }
    }
  }
  return true;
}

export function useDragPlacement({
  board,
  isVertical,
  placedShipIds,
  onPlaceShip,
  setSelectedShipId,
  setHoveredCells,
}: UseDragPlacementArgs) {
  const isTouchDevice = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const draggingShipId = useRef<string | null>(null);

  useEffect(() => {
    isTouchDevice.current = window.matchMedia('(pointer: coarse)').matches;
  }, []);

  const getDragProps = useCallback((shipId: string): DragProps => {
    const isPlaced = placedShipIds.has(shipId);
    if (isTouchDevice.current || isPlaced) {
      return { draggable: false, onDragStart: () => {} };
    }
    return {
      draggable: true,
      onDragStart: (e: DragEvent<HTMLElement>) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', shipId);
        draggingShipId.current = shipId;
        setIsDragging(true);
        setSelectedShipId(null); // clear click-to-place selection
      },
    };
  }, [placedShipIds, setSelectedShipId]);

  const getDropProps = useCallback((row: number, col: number): DropProps => ({
    onDragOver: (e: DragEvent<HTMLElement>) => {
      e.preventDefault();
      const shipId = draggingShipId.current;
      if (!shipId) return;
      const ship = SHIPS.find(s => s.id === shipId);
      if (!ship) return;
      const cells = getCells(row, col, ship.size, isVertical);
      if (cells && canPlace(cells, board)) {
        setHoveredCells(cells);
      } else {
        setHoveredCells([]);
      }
    },
    onDrop: (e: DragEvent<HTMLElement>) => {
      e.preventDefault();
      const shipId = e.dataTransfer.getData('text/plain');
      if (!shipId) return;
      const ship = SHIPS.find(s => s.id === shipId);
      if (!ship) return;
      const cells = getCells(row, col, ship.size, isVertical);
      if (cells && canPlace(cells, board)) {
        onPlaceShip(shipId, cells);
      }
      setHoveredCells([]);
      setIsDragging(false);
      draggingShipId.current = null;
    },
    onDragLeave: () => {
      setHoveredCells([]);
    },
  }), [board, isVertical, onPlaceShip, setHoveredCells]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    draggingShipId.current = null;
    setHoveredCells([]);
  }, [setHoveredCells]);

  return { getDragProps, getDropProps, handleDragEnd, isDragging };
}
```

- [ ] **Step 2: Export from hooks/index.ts**

In `apps/web/src/widgets/SeaBattleGame/hooks/index.ts`, add:
```ts
export { useDragPlacement } from './useDragPlacement';
```

- [ ] **Step 3: TypeScript check**

```bash
cd apps/web && pnpm tsc --noEmit 2>&1 | grep useDragPlacement
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/widgets/SeaBattleGame/hooks/useDragPlacement.ts \
        apps/web/src/widgets/SeaBattleGame/hooks/index.ts
git commit -m "feat(ARC-456): add useDragPlacement hook"
```

---

## Task 8: ShipPlacementBoard Redesign

**Files:**
- Modify: `apps/web/src/widgets/SeaBattleGame/ui/ShipPlacementBoard.tsx`

- [ ] **Step 1: Add invalid hover state + update handleCellHover**

Add `isInvalidHover` state:
```tsx
const [isInvalidHover, setIsInvalidHover] = useState(false);
```

Update `handleCellHover` to set invalid state:
```tsx
const handleCellHover = useCallback(
  (row: number, col: number) => {
    if (!selectedShip) {
      setHoveredCells([]);
      setIsInvalidHover(false);
      return;
    }
    const cells = getCellsForPlacement(row, col, selectedShip.size, isVertical);
    if (cells && canPlaceAt(row, col, selectedShip)) {
      setHoveredCells(cells);
      setIsInvalidHover(false);
    } else if (cells) {
      setHoveredCells(cells);  // still set for red highlight
      setIsInvalidHover(true);
    } else {
      setHoveredCells([]);
      setIsInvalidHover(false);
    }
  },
  [selectedShip, isVertical, canPlaceAt],
);
```

- [ ] **Step 2: Update getCellBg for placement to handle invalid state**

Replace the existing `getCellBg` function in `ShipPlacementBoard.tsx`:

```tsx
function getCellBg(
  state: number,
  theme: SeaBattleTheme,
  highlighted = false,
  invalidHighlighted = false,
): string {
  if (invalidHighlighted) return 'rgba(239, 68, 68, 0.2)';
  if (highlighted) return theme.cellHover;
  switch (state) {
    case CELL_STATE.HIT:  return theme.hitColor;
    case CELL_STATE.MISS: return theme.missColor;
    case CELL_STATE.SHIP: return theme.shipColor;
    default:              return theme.cellEmpty;
  }
}
```

Update `BoardCell` rendering in the placement board to use `isInvalidHover`:

```tsx
const isHovered = hoveredCells.some(c => c.row === rIndex && c.col === cIndex);
const isInvalidCell = isHovered && isInvalidHover;

return (
  <BoardCell
    key={`${rIndex}-${cIndex}`}
    isClickable={!!selectedShip}
    backgroundColor={getCellBg(cellState, theme, isHovered && !isInvalidHover, isInvalidCell)}
    borderColor={isInvalidCell ? 'rgba(239,68,68,0.6)' : theme.cellBorder}
    borderRadius={parseInt(theme.borderRadius) || 4}
    className={isHovered && !isInvalidHover ? 'sb-valid-pulse' : undefined}
    data-row={rIndex}
    data-col={cIndex}
    data-highlighted={isHovered ? 'true' : 'false'}
    onMouseEnter={() => handleCellHover(rIndex, cIndex)}
    onMouseLeave={() => handleCellHover(-1, -1)}
    onPointerEnter={() => handleCellHover(rIndex, cIndex)}
    onPointerMove={() => handleCellHover(rIndex, cIndex)}
    onPointerLeave={() => handleCellHover(-1, -1)}
    onPress={() => handleCellClick(rIndex, cIndex)}
  />
);
```

- [ ] **Step 3: Wire useDragPlacement**

Add import and wire the hook in `ShipPlacementBoard`:

```tsx
import { useDragPlacement } from '../hooks/useDragPlacement';

// Inside component, after existing state declarations:
const { getDragProps, getDropProps, handleDragEnd } = useDragPlacement({
  board,
  isVertical,
  placedShipIds,
  onPlaceShip,
  setSelectedShipId,
  setHoveredCells,
});
```

Add `{...getDropProps(rIndex, cIndex)}` to each `BoardCell` in the placement board, and add `onDragEnd={handleDragEnd}` to the board container.

Add `{...getDragProps(ship.id)}` to each `ShipItem`.

Also reset `isInvalidHover` on leave — update the leave handlers on `BoardCell`:
```tsx
onMouseLeave={() => { handleCellHover(-1, -1); setIsInvalidHover(false); }}
onPointerLeave={() => { handleCellHover(-1, -1); setIsInvalidHover(false); }}
```

In `useDragPlacement`, add an optional `setIsInvalidHover?: (v: boolean) => void` to the args, and call `args.setIsInvalidHover?.(false)` inside `onDragLeave` and `onDrop` so the red tint is cleared when dragging off the board.

- [ ] **Step 4: Update ShipItem rendering with visual states**

Update the `ShipItem` block inside `SHIPS.map(...)`:

```tsx
<ShipItem
  key={ship.id}
  isPlaced={isPlaced}
  backgroundColor={
    isSelected ? theme.accentColor + '1a' : theme.boardBackground
  }
  borderColor={isSelected ? theme.accentColor : theme.cellBorder}
  className={isSelected ? 'sb-selected-glow' : undefined}
  onPress={() => !isPlaced && setSelectedShipId(isSelected ? null : ship.id)}
  data-testid="ship-palette-item"
  {...getDragProps(ship.id)}
>
  <ShipPreview>
    {Array(ship.size)
      .fill(null)
      .map((_, i) => (
        <ShipCellStyled
          key={i}
          backgroundColor={
            isPlaced
              ? theme.accentColor        // green tint for placed
              : isSelected
              ? theme.primaryColor       // blue for selected
              : theme.shipColor          // grey default
          }
        />
      ))}
  </ShipPreview>
  <ShipName color={isPlaced ? theme.accentColor : theme.textColor}>
    {ship.name} ({ship.size})
  </ShipName>
  {isPlaced && (
    <Text fontSize={12} color={theme.accentColor}>✓</Text>
  )}
  {isSelected && (
    <Text fontSize={11} color={theme.primaryColor}>◀</Text>
  )}
</ShipItem>
```

- [ ] **Step 5: Add drag hint text + update action button labels**

Add drag hint below the palette title:
```tsx
<Text
  fontSize={11}
  color={theme.textSecondaryColor}
  textAlign="center"
  marginBottom="$2"
>
  {t('games.sea_battle_v1.table.actions.dragHint' as TranslationKey)}
</Text>
```

Update Confirm button to glow green when ready:
```tsx
<ActionButton
  variant="primary"
  disabled={!isAllShipsPlaced || isPlacementComplete}
  onClick={onConfirmPlacement}
  className={isAllShipsPlaced && !isPlacementComplete ? 'sb-valid-pulse' : undefined}
  style={
    isAllShipsPlaced && !isPlacementComplete
      ? { background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 2px 12px rgba(16,185,129,0.5)' }
      : undefined
  }
>
  {isPlacementComplete
    ? t('games.sea_battle_v1.table.actions.waitingForOthers')
    : `⚓ ${t('games.sea_battle_v1.table.actions.confirmPlacement')}`}
</ActionButton>
```

Update Rotate button to show current orientation:
```tsx
<RotateButton
  variant="secondary"
  onClick={handleRotate}
  disabled={!selectedShip}
>
  ↻ {t('games.sea_battle_v1.table.actions.rotate')} (
  {isVertical
    ? t('games.sea_battle_v1.table.state.vertical')
    : t('games.sea_battle_v1.table.state.horizontal')}
  )
</RotateButton>
```

Add emoji prefixes to Reset and Auto-place buttons:
```tsx
// Reset:
↺ {t('games.sea_battle_v1.table.actions.resetPlacement')}

// Auto-place / Randomize:
🎲 {placedShipIds.size > 0
    ? t('games.sea_battle_v1.table.actions.randomize')
    : t('games.sea_battle_v1.table.actions.autoPlace')}
```

- [ ] **Step 6: TypeScript check**

```bash
cd apps/web && pnpm tsc --noEmit 2>&1 | grep ShipPlacementBoard | head -20
```

Expected: No errors.

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/widgets/SeaBattleGame/ui/ShipPlacementBoard.tsx
git commit -m "feat(ARC-456): redesign ShipPlacementBoard with drag-and-drop and invalid hover"
```

---

## Task 9: SeaBattleThemePreview Component

**Files:**
- Create: `apps/web/src/widgets/SeaBattleGame/ui/SeaBattleThemePreview.tsx`

- [ ] **Step 1: Create the component**

Create `apps/web/src/widgets/SeaBattleGame/ui/SeaBattleThemePreview.tsx`:

```tsx
'use client';

import { YStack, XStack, Text } from 'tamagui';
import { useSeaBattleTheme } from '../lib/SeaBattleThemeContext';
import { CELL_STATE } from '../types';

// Pre-set 10×10 pattern: 0=empty 1=ship 2=hit 3=miss
const BOARD_PATTERN: number[] = [
  1, 1, 1, 1, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 1, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 1, 0, 0, 0,
  0, 1, 1, 1, 0, 0, 1, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 2, 0, 0, 0, 0, 1, 1,
  0, 0, 0, 2, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 3, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 1, 0, 0, 0, 0, 3, 0, 0,
];

const COL_LABELS = ['A','B','C','D','E','F','G','H','I','J'];
const ROW_LABELS = ['1','2','3','4','5','6','7','8','9','10'];

interface SeaBattleThemePreviewProps {
  selectedVariant: string;
}

export function SeaBattleThemePreview({ selectedVariant }: SeaBattleThemePreviewProps) {
  const theme = useSeaBattleTheme();

  function getCellColor(state: number): string {
    switch (state) {
      case CELL_STATE.SHIP: return theme.shipColor;
      case CELL_STATE.HIT:  return theme.hitColor;
      case CELL_STATE.MISS: return theme.missColor;
      default:              return theme.cellEmpty;
    }
  }

  return (
    <YStack
      key={selectedVariant}
      className="sb-preview-fade"
      borderRadius={10}
      borderWidth={1}
      borderColor={theme.cellBorder}
      padding="$3"
      gap="$2"
      data-testid="color-preview-container"
      style={{ background: theme.boardBackground } as React.CSSProperties}
    >
      {/* Column labels */}
      <XStack marginLeft={16} gap={2}>
        {COL_LABELS.map(l => (
          <Text key={l} fontSize={8} color={theme.textSecondaryColor} width={20} textAlign="center">
            {l}
          </Text>
        ))}
      </XStack>

      {/* Rows */}
      {Array.from({ length: 10 }, (_, rIndex) => (
        <XStack key={rIndex} gap={2} alignItems="center">
          <Text fontSize={8} color={theme.textSecondaryColor} width={14} textAlign="right">
            {ROW_LABELS[rIndex]}
          </Text>
          {Array.from({ length: 10 }, (_, cIndex) => {
            const state = BOARD_PATTERN[rIndex * 10 + cIndex];
            // Preserve data-testid compatibility with sea-battle-lobby-colors.spec.ts
            const testId =
              rIndex === 0 && cIndex === 0 ? 'color-swatch-ship'
              : rIndex === 5 && cIndex === 3 ? 'color-swatch-hit'
              : rIndex === 9 && cIndex === 7 ? 'color-swatch-miss'
              : rIndex === 0 && cIndex === 4 ? 'color-swatch-empty'
              : undefined;
            return (
              <YStack
                key={cIndex}
                width={20}
                height={20}
                borderRadius={parseInt(theme.borderRadius) || 3}
                borderWidth={1}
                borderColor={theme.cellBorder}
                backgroundColor={getCellColor(state)}
                alignItems="center"
                justifyContent="center"
                data-testid={testId}
              >
                {state === CELL_STATE.HIT && (
                  <Text fontSize={10} style={{ pointerEvents: 'none' }}>🔥</Text>
                )}
                {state === CELL_STATE.MISS && (
                  <YStack
                    width={8}
                    height={8}
                    borderRadius={100}
                    backgroundColor="rgba(255,255,255,0.55)"
                  />
                )}
              </YStack>
            );
          })}
        </XStack>
      ))}
    </YStack>
  );
}
```

- [ ] **Step 2: TypeScript check**

```bash
cd apps/web && pnpm tsc --noEmit 2>&1 | grep SeaBattleThemePreview
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/widgets/SeaBattleGame/ui/SeaBattleThemePreview.tsx
git commit -m "feat(ARC-456): add SeaBattleThemePreview component"
```

---

## Task 10: SeaBattleLobby Redesign

**Files:**
- Modify: `apps/web/src/widgets/SeaBattleGame/ui/SeaBattleLobby.tsx`

- [ ] **Step 1: Add showAllVariants state and theme tab strip**

In `SeaBattleLobby.tsx`, add imports and state:

```tsx
import { SeaBattleThemePreview } from './SeaBattleThemePreview';
import { SeaBattleThemeProvider } from '../lib/SeaBattleThemeContext';

// Inside the component, add:
const [showAllVariants, setShowAllVariants] = React.useState(false);
const VISIBLE_COUNT = 4;
const visibleVariants = showAllVariants
  ? SEA_BATTLE_VARIANTS
  : SEA_BATTLE_VARIANTS.slice(0, VISIBLE_COUNT);
const hiddenCount = SEA_BATTLE_VARIANTS.length - VISIBLE_COUNT;
```

- [ ] **Step 2: Replace optionsSlot with new theme tabs + preview**

Replace the entire `optionsSlot` variable with:

```tsx
const optionsSlot =
  isHost && room.status === 'lobby' ? (
    <XStack
      gap="$4"
      flexWrap="wrap"
      alignItems="flex-start"
      $md={{ flexDirection: 'column', gap: '$3', width: '100%' }}
    >
      {/* Theme picker */}
      <YStack gap="$2">
        <Text fontSize={10} color="rgba(148,163,184,0.6)" letterSpacing={2} textTransform="uppercase">
          {t('games.sea_battle_v1.table.lobby.hostControls' as TranslationKey)}
        </Text>
        <XStack gap="$2" flexWrap="wrap">
          {visibleVariants.map(variant => (
            <XStack
              key={variant.id}
              alignItems="center"
              gap="$1"
              paddingHorizontal="$3"
              paddingVertical="$2"
              borderRadius={20}
              borderWidth={1.5}
              cursor="pointer"
              onPress={() => setSelectedVariant(variant.id)}
              borderColor={
                selectedVariant === variant.id
                  ? 'rgba(96,165,250,0.6)'
                  : 'rgba(255,255,255,0.1)'
              }
              backgroundColor={
                selectedVariant === variant.id
                  ? 'rgba(96,165,250,0.12)'
                  : 'rgba(255,255,255,0.03)'
              }
            >
              <Text fontSize={14}>{variant.emoji}</Text>
              <Text
                fontSize={11}
                fontWeight="500"
                color={selectedVariant === variant.id ? '#93c5fd' : '#cbd5e1'}
              >
                {t(variant.name as TranslationKey)}
              </Text>
            </XStack>
          ))}
          {!showAllVariants && hiddenCount > 0 && (
            <XStack
              alignItems="center"
              paddingHorizontal="$3"
              paddingVertical="$2"
              borderRadius={20}
              borderWidth={1}
              borderColor="rgba(255,255,255,0.1)"
              cursor="pointer"
              onPress={() => setShowAllVariants(true)}
              aria-label="Show all themes"
            >
              <Text fontSize={11} color="rgba(148,163,184,0.5)">
                + {hiddenCount} more ▾
              </Text>
            </XStack>
          )}
        </XStack>
      </YStack>

      {/* Live board preview */}
      <SeaBattleThemeProvider variant={selectedVariant}>
        <SeaBattleThemePreview selectedVariant={selectedVariant} />
      </SeaBattleThemeProvider>
    </XStack>
  ) : null;
```

- [ ] **Step 3: Update color swatches to larger size**

The existing `YStack` color swatch squares in the optionsSlot have been replaced above. The color swatches are now part of the `SeaBattleThemePreview` visual. No separate swatch section needed — the board preview shows all colors in context.

If there are any remaining hardcoded `width={16} height={16}` swatch elements in the file, update them to `width={36} height={36}` with `borderRadius={8}`.

- [ ] **Step 4: TypeScript check**

```bash
cd apps/web && pnpm tsc --noEmit 2>&1 | grep SeaBattleLobby | head -20
```

Expected: No errors.

- [ ] **Step 5: Run existing Playwright lobby colors test**

```bash
cd apps/web && pnpm exec playwright test e2e/sea-battle-lobby-colors.spec.ts --reporter=list 2>&1 | tail -20
```

Expected: All tests pass.

The test (`e2e/sea-battle-lobby-colors.spec.ts`) checks `data-testid="color-preview-container"`, `data-testid="color-swatch-ship"`, and `data-testid="color-swatch-hit"`. These `data-testid`s are now on the `SeaBattleThemePreview` wrapper and specific cells (row=0,col=0 = ship cell; row=5,col=3 = hit cell). The cell background colors come from `theme.shipColor` and `theme.hitColor` respectively — same values as before. The test should pass without changes.

If it fails (e.g., because the hit cell `🔥` text node affects computed color), open `apps/web/e2e/sea-battle-lobby-colors.spec.ts` and change the hit swatch assertion to check `backgroundColor` of the cell at `data-testid="color-swatch-hit"` which has `backgroundColor={getCellColor(CELL_STATE.HIT)}` = `theme.hitColor`. The assertion value stays the same (`rgb(239, 68, 68)` for classic).

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/widgets/SeaBattleGame/ui/SeaBattleLobby.tsx
git commit -m "feat(ARC-456): redesign SeaBattleLobby with theme tabs and live board preview"
```

---

## Task 11: Final Verification

- [ ] **Step 1: TypeScript full check**

```bash
cd apps/web && pnpm tsc --noEmit 2>&1 | grep "error TS" | head -30
```

Expected: 0 errors.

- [ ] **Step 2: Lint**

```bash
cd apps/web && pnpm lint 2>&1 | tail -10
```

Expected: No errors.

- [ ] **Step 3: Run sea battle Playwright tests**

```bash
cd apps/web && pnpm exec playwright test e2e/sea-battle-colors.spec.ts e2e/sea-battle-lobby-colors.spec.ts --reporter=list 2>&1 | tail -30
```

Expected: All tests pass. If `sea-battle-lobby-colors.spec.ts` fails because the old color swatch `data-testid` elements were removed, open that file and update the assertions to check the new board preview cells instead.

- [ ] **Step 4: Check file sizes**

```bash
wc -l apps/web/src/widgets/SeaBattleGame/ui/AttackBoard.tsx \
       apps/web/src/widgets/SeaBattleGame/ui/ShipPlacementBoard.tsx \
       apps/web/src/widgets/SeaBattleGame/ui/SeaBattleLobby.tsx
```

Expected: All under 500 lines.

- [ ] **Step 5: Final commit**

```bash
git add -p  # review any remaining staged changes
git commit -m "feat(ARC-456): complete Sea Battle UI redesign"
```
