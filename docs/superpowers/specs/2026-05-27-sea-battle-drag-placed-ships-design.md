# Sea Battle: drag and drop placed ships (ARC-754)

## Problem

In Sea Battle placement, players can drop ships from the palette onto the board (desktop) or use Auto-place to randomize all ten ships at once. Auto-place is convenient but the resulting layout is rarely the one the player wants. To change a single ship today they must hit Reset and restart placement from scratch, which throws away the rest of the random layout they wanted to keep. The same pain applies to manually placed ships: once a ship is on the board the only way to relocate it is Reset.

## Goal

Let the player drag any already-placed ship from one position on the board to another while in the placement phase, without losing the rest of the layout. Works for both auto-placed and manually placed ships. Web only — no mobile/touch support in this change.

## Non-goals

- Mobile/touch drag: out of scope; consistent with current palette drag which is also `(pointer: coarse)`-gated.
- Rotating a ship mid-drag via keyboard (e.g. `R`).
- Dragging a placed ship back into the palette.
- Shake/error animation on invalid drop.
- Changes to the bot's auto-place flow.

## User experience

1. Player clicks **Auto-place** (or manually places ships). All ten ships sit on the board.
2. Player hovers a placed ship — cursor becomes `grab`.
3. Player drags from any cell of the ship. The ship's cells dim to ~40% opacity ("lifted"). Cursor is `grabbing`.
4. As the player drags over the board, the standard hover preview shows where the ship will land. The grabbed cell stays under the cursor (anchor-at-grabbed-cell). The ship's own current cells are treated as empty for validity checks, so a one-cell nudge along the same axis is valid.
5. On valid drop, the ship moves; the player's board updates immediately via the standard server round-trip.
6. On invalid drop (or drop outside the board), nothing happens — the ship returns to its original position. Hover state clears.
7. Orientation is preserved: the ship's own horizontal/vertical state is captured at drag start and used for the drop, regardless of the global Rotate toggle.

## Architecture

### Backend — new `moveShip` engine action

A new atomic action so that the engine never observes a "ship removed but not yet placed" intermediate state.

**Payload**

```ts
export interface MoveShipPayload {
  shipId: string;
  cells: ShipCell[];
}
```

**Validator** (`validateMoveShip`)

Identical to `validatePlaceShip` with three differences:

- The ship must already be placed (`player.ships.some(s => s.id === payload.shipId)`).
- Overlap/adjacency checks evaluate against a _virtual_ board where the moving ship's old cells are treated as `EMPTY`. This lets a ship nudge one cell along its own axis without seeing itself as a blocker.
- Cell-count and connectedness checks reuse `areCellsValid` / `areCellsConnected` from `sea-battle.utils.ts`.

**Engine function** (`runMoveShip` in `sea-battle-placement-actions.utils.ts`)

1. Clear the old ship's cells on `player.board` (set to `EMPTY`).
2. Remove the old `Ship` from `player.ships`.
3. Push a new `Ship` with `cells = payload.cells`, `hits: 0`, `sunk: false`, same `id/name/size`.
4. Stamp the new cells as `SHIP` on `player.board`.
5. Append a single `'action'` log: `Moved <ship.name>` (scope `private`, `senderId: player.playerId`).

**Engine wiring**

- `validateAction`: add `case 'moveShip': return validateMoveShip(state, player, payload as MoveShipPayload);`
- `executeAction`: add `case 'moveShip': return runMoveShip(newState, player, payload as MoveShipPayload);`
- `getSeaBattleAvailableActions` (in `sea-battle.utils.ts` at line 134): gate `moveShip` independently — append `'moveShip'` when `state.phase === PLACEMENT && !player.placementComplete && player.ships.length > 0`. Critically this must be added in addition to `confirmPlacement`, since after auto-place all ten ships are present and the player is exactly the persona this feature serves; tying `moveShip` to the same gate as `placeShip` (`ships.length < SHIPS.length`) would disable it in the primary use case.
- `MoveShipPayload` must be exported from the same barrel that `sea-battle.service.ts` already imports `PlaceShipPayload` from (`./engines/sea-battle/sea-battle.types`), otherwise `moveShipByRoom`'s signature won't compile.

**Service / gateway**

- `sea-battle.service.ts`: add `moveShipByRoom(userId, roomId, payload: MoveShipPayload)` mirroring `placeShipByRoom` (note the existing signature is `placeShipByRoom(userId, roomId, payload)` — userId first).
- Gateway file is `apps/be/src/games/sea-battle.gateway.ts` (top-level under `games/`, not inside `games/sea-battle/`).
- New handler `handleMoveShip` mirrors `handlePlaceShip` (lines 75–119): subscribe to `seaBattle.session.move_ship`, validate `shipId` + `cells` from payload, call `moveShipByRoom`, ack with `client.emit('seaBattle.session.ship_moved', maybeEncrypt({ roomId, userId, shipId }))`. Errors via the shared `handleError` helper.
- Authorization: same guard as `placeShip` — must be the user's own placement.
- FE does not subscribe to `ship_moved`; the broadcast session-state push is what redraws the board, matching how `ship_placed` is handled today. The ack is fire-and-forget telemetry, consistent with the other placement handlers.

### Frontend — extend the drag system

**`useDragPlacement` hook** gains a board-source mode in addition to the existing palette source.

New ref state:

- `dragMode: 'palette' | 'board' | null` (mutable ref).
- `boardDragOrigin: { shipId: string; originalCells: ShipCell[]; orientation: 'h' | 'v'; anchorOffset: number } | null`.

New return:

```ts
getBoardCellDragProps(row: number, col: number): {
  draggable: boolean;
  onDragStart: (e: DragEvent<HTMLElement>) => void;
}
```

For each board cell:

- Resolve the ship occupying `(row, col)` from `currentPlayer.ships`.
- If no ship, or `placementComplete`, or `(pointer: coarse)` is true → return `{ draggable: false, onDragStart: noop }`.
- Otherwise → `draggable: true`. `onDragStart`:
  1. Compute `orientation` by comparing `cells[0]` and `cells[1]`. All `SHIPS` in the game are size ≥ 2 so no special case is needed.
  2. Compute `anchorOffset` = index of `(row, col)` within `cells`.
  3. Set `dragMode = 'board'`, `boardDragOrigin = { shipId, originalCells, orientation, anchorOffset }`.
  4. `e.dataTransfer.setData('text/plain', shipId)` (the existing protocol — kept identical so palette and board paths share `onDrop`).
  5. Clear `selectedShipId` so the global rotate toggle doesn't affect the in-flight ship.

**Effective board for validity**

During a board drag, `canPlace` must ignore the moving ship's old cells. Implement by cloning `board` and clearing `originalCells` before running the existing `canPlace`. Both `onDragOver` and the drop validity preview use this effective board.

**Anchor-adjusted cells**

`onDragOver(row, col)` and `onDrop(row, col)` compute the _start_ cell as:

```ts
const startRow = orientation === 'v' ? row - anchorOffset : row;
const startCol = orientation === 'h' ? col - anchorOffset : col;
const cells = getCells(startRow, startCol, ship.size, orientation === 'v');
```

If `cells === null` (off-board) → invalid hover, no drop.

**Drop dispatch**

`onDrop` branches on `dragMode`:

- `'palette'` → existing behavior: `onPlaceShip(shipId, cells)`.
- `'board'` → new prop `onMoveShip(shipId, cells)` (skip if cells deep-equal `originalCells`).

`onDrop` and `handleDragEnd` clear local drag state synchronously — `dragMode`, `boardDragOrigin`, `hoveredCells`, `isInvalidHover`. The lifted-cell visual disappears immediately on drop and does not wait for the server-pushed session update; the board then re-renders from server state when the broadcast arrives. This matches how `placeShip` already behaves and prevents a stuck dim-cell if the server is slow or rejects the move.

**`ShipPlacementBoard.tsx`**

- Accept new prop `onMoveShip(shipId, cells)`.
- Pass through to `useDragPlacement`.
- Pass `getBoardCellDragProps` and `currentPlayer.ships` down to `PlacementBoardGrid`.

**`PlacementBoardGrid.tsx`**

- Accept `getBoardCellDragProps` and `ships: Ship[]`.
- For each cell, spread the result of `getBoardCellDragProps(row, col)` onto `BoardCell`.
- Add CSS class `sb-cell--dragging` to the moving ship's cells while `dragMode === 'board'`. Implement via a small `Set<string>` of cell keys passed to the grid (cells visible from `boardDragOrigin.originalCells`), or simpler: expose `isDraggingBoardShip: boolean` and `draggingCells: ShipCell[]` from the hook.

**`useSeaBattleActions.ts`**

- New `moveShip(shipId, cells)` that emits `seaBattle.session.move_ship`.

**`Game.tsx`** (or wherever `placeShip` is wired)

- Wire `actions.moveShip` to `<ShipPlacementBoard onMoveShip={...}>`.

### CSS

Add to `apps/web/src/widgets/SeaBattleGame/ui/styles/animations.css` (or `board.tsx` styled file):

- `.sb-cell--ship-draggable { cursor: grab; }`
- `.sb-cell--ship-draggable:active { cursor: grabbing; }`
- `.sb-cell--dragging { opacity: 0.4; }`

Apply `.sb-cell--ship-draggable` only when the cell is a `SHIP` and not `placementComplete`.

## Why a new BE action

`placeShip` already rejects already-placed ship IDs by design (`sea-battle.validators.ts` line 33). Reusing it would force a "remove then place" two-step that is racy, makes intermediate state visible to teammates in team mode, and complicates the engine's log. `moveShip` keeps the invariant honest and yields one atomic log entry.

## Edge cases

- **Drop on same cells**: client-side dedupe — if `cells` deep-equal `originalCells`, skip the emit. BE validator would also accept it as a no-op, but skipping the round-trip is cheaper.
- **Drop off-board**: `getCells` returns `null` → no emit, ship snaps back.
- **Drop overlapping another ship**: validity check returns false; hover shows red; on drop nothing emits.
- **Drop on a cell adjacent to another ship**: same as above.
- **`placementComplete` true**: board cells not draggable; BE validator also rejects. Intentional — once you've confirmed your layout, you're locked in even while teammates are still placing.
- **Team mode**: only the player's own board is shown for placement; the per-player `placementComplete` lock applies independently to each teammate, so one teammate confirming doesn't disable another's `moveShip`.
- **State updated mid-drag** (e.g. teammate reset): the BE validator re-runs on the server's current state, so a stale move is rejected and the player's board reflects truth on next state push.
- **Pointer coarse (mobile/tablet)**: both palette drag and board drag short-circuit to `draggable: false`. Click-to-select still works for palette → board.

## Testing

### Backend

New file `apps/be/src/games/engines/sea-battle/sea-battle.engine.moveShip.spec.ts` (or extend an existing engine spec) covering:

- Happy path: place a 4-cell ship at A1–D1, move to F5–F8 (rotated case: ship orientation preserved).
- Move along own axis by one cell: A1–D1 → B1–E1 (overlap with own cells is allowed).
- Reject overlap with another ship.
- Reject adjacency with another ship (corners count).
- Reject out-of-bounds.
- Reject if ship is not currently placed.
- Reject after `placementComplete`.
- Reject in non-PLACEMENT phase.

Validator unit tests in the same file or in `sea-battle.validators.spec.ts`.

### Web

`apps/web/src/widgets/SeaBattleGame/hooks/useDragPlacement.test.ts` (new):

- Board-source drag: `onDragStart` from an occupied cell sets `dragMode = 'board'` and captures `anchorOffset` and `orientation`.
- Anchor offset applied: grabbing the 2nd cell of a 4-cell horizontal ship and dropping on F5 produces `cells` starting at F4.
- Drop on same cells deep-equal → no `onMoveShip` call.
- Drop on invalid cells → no `onMoveShip` call; `handleDragEnd` clears state.

Playwright e2e (new test or extension of an existing placement test):

- Open Sea Battle, start a session, click Auto-place.
- Drag the first ship to a known-empty area on the board.
- Verify the ship's cells are visually at the new position and not at the old position.
- Confirm placement and verify the game proceeds to battle.

## Files touched

Backend:

- `apps/be/src/games/engines/sea-battle/sea-battle.types.ts` — add `MoveShipPayload`.
- `apps/be/src/games/engines/sea-battle/sea-battle.validators.ts` — add `validateMoveShip`.
- `apps/be/src/games/engines/sea-battle/sea-battle-placement-actions.utils.ts` — add `runMoveShip`.
- `apps/be/src/games/engines/sea-battle/sea-battle.engine.ts` — wire `moveShip` into `validateAction` and `executeAction`.
- `apps/be/src/games/engines/sea-battle/sea-battle.utils.ts` — `getSeaBattleAvailableActions` (line 134) includes `moveShip` independently of `placeShip`'s gate.
- `apps/be/src/games/sea-battle/sea-battle.service.ts` — add `moveShipByRoom(userId, roomId, payload)`.
- `apps/be/src/games/sea-battle.gateway.ts` — add `handleMoveShip` subscribed to `seaBattle.session.move_ship`, emit ack `seaBattle.session.ship_moved`.
- New engine spec file.

Web:

- `apps/web/src/widgets/SeaBattleGame/hooks/useSeaBattleActions.ts` — `moveShip` action.
- `apps/web/src/widgets/SeaBattleGame/hooks/useDragPlacement.ts` — board-source drag, anchor math, effective-board validity.
- `apps/web/src/widgets/SeaBattleGame/ui/ShipPlacement/PlacementBoardGrid.tsx` — wire `getBoardCellDragProps`; render `dragging` class on lifted cells.
- `apps/web/src/widgets/SeaBattleGame/ui/ShipPlacementBoard.tsx` — accept and wire `onMoveShip`.
- `apps/web/src/widgets/SeaBattleGame/ui/Game.tsx` — pass `actions.moveShip`.
- `apps/web/src/widgets/SeaBattleGame/ui/styles/animations.css` (or styled equivalent) — cursor + dragging opacity.
- New hook unit test, optional Playwright e2e.

## Rollout

Single PR. No flag — the new action is additive on BE (existing clients keep working), and the FE upgrade adds a capability without changing the existing placement flow. The bot service does not emit `moveShip` and there is no plan to add it, so server-side risk is contained to the new action's code path.
