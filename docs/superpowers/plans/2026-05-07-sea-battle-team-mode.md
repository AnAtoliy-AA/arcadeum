# Sea Battle Team Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a host-toggled team mode to the existing Sea Battle game, raising the lobby cap to 8 players and supporting flexible team configurations (e.g. 4v4, 3v3v2, 2v6, 2v2v2v2). Free-for-all gameplay is unchanged.

**Architecture:** Single engine, branched on `state.teams != null`. Lobby team config lives on `GameRoom.gameOptions`; team membership snapshots into `SeaBattleState` at game start. All team-mode logic is layered on top of existing FFA mechanics — turn rotation, attack validation, win condition, and sanitization branch on team presence.

**Tech Stack:** TypeScript (strict, no `any`), NestJS + Mongoose (BE), Next.js + Tamagui (web), Vitest/Jest, Playwright (e2e).

**Spec:** `docs/superpowers/specs/2026-05-07-sea-battle-team-mode-design.md` — read before starting any task.

**Branch:** `ARC-427` (already checked out).

---

## File structure

### Backend — files to create

- `apps/be/src/games/engines/sea-battle/team-rotation.utils.ts` — pure helpers for team rotation (advance, alive lookups).
- `apps/be/src/games/engines/sea-battle/team-rotation.utils.spec.ts` — Jest unit tests for rotation helpers.
- `apps/be/src/games/engines/sea-battle/sea-battle.engine.team.spec.ts` — Jest tests for engine team-mode behavior.
- `apps/be/src/games/dtos/set-team-mode.dto.ts`
- `apps/be/src/games/dtos/set-team-config.dto.ts`
- `apps/be/src/games/dtos/assign-team.dto.ts`
- `apps/be/src/games/dtos/add-bot-to-team.dto.ts`
- `apps/be/src/games/dtos/remove-bot-from-team.dto.ts`
- `apps/be/src/games/dtos/toggle-hide-ships.dto.ts`
- `apps/be/src/games/rooms/sea-battle-team-config.service.ts` — host-only mutations on `gameOptions.teams`.
- `apps/be/src/games/rooms/sea-battle-team-config.service.spec.ts`
- `apps/be/src/games/rooms/sea-battle-team-config.types.ts` — shared lobby-phase types.

### Backend — files to modify

- `apps/be/src/games/engines/sea-battle/sea-battle.constants.ts` — add `MAX_PLAYERS_TEAM_MODE = 8`, `MIN_TEAM_SIZE = 2`.
- `apps/be/src/games/engines/sea-battle/sea-battle.types.ts` — add `SeaBattleTeam`, extend `SeaBattleState`.
- `apps/be/src/games/engines/sea-battle/sea-battle.engine.ts` — branch on `state.teams != null` in `initializeState`, `executeAttack` rotation, `isGameOver`, `getWinners`. Update `getMetadata.maxPlayers` to 8 (lobby validation enforces FFA cap separately).
- `apps/be/src/games/engines/sea-battle/sea-battle.utils.ts` — extend `sanitizeSeaBattleState` and `getSeaBattleAvailableActions` for team mode.
- `apps/be/src/games/engines/sea-battle/sea-battle.validators.ts` — reject teammate target in `validateAttack`; check active shooter (not active-by-`playerOrder`) in team mode.
- `apps/be/src/games/engines/base/game-engine.interface.ts` — add `'team'` to `ChatScope` union.
- `apps/be/src/games/sea-battle/sea-battle.service.ts` — raise cap to 8 in team mode; pass team config through to engine; validate start-game preconditions.
- `apps/be/src/games/sea-battle/sea-battle-bot.service.ts` — exclude teammates from target selection.
- `apps/be/src/games/sea-battle.gateway.ts` — add team-mode socket handlers; widen accepted `scope` to include `'team'` in history note.
- `apps/be/src/games/games.module.ts` — register `SeaBattleTeamConfigService`.

### Frontend (web) — files to create

- `apps/web/src/features/games/sea-battle/lobby/TeamModeToggle.tsx`
- `apps/web/src/features/games/sea-battle/lobby/TeamSetupPanel.tsx`
- `apps/web/src/features/games/sea-battle/lobby/TeamSlotsBoard.tsx`
- `apps/web/src/features/games/sea-battle/lobby/UnassignedPool.tsx`
- `apps/web/src/features/games/sea-battle/lobby/team-mode.types.ts`
- `apps/web/src/features/games/sea-battle/lobby/team-mode.api.ts` — socket emit helpers + types.
- `apps/web/src/features/games/sea-battle/lobby/__tests__/TeamSetupPanel.test.tsx`
- `apps/web/src/features/games/sea-battle/lobby/__tests__/TeamSlotsBoard.test.tsx`

### Frontend (web) — files to modify

- `apps/web/src/widgets/SeaBattleGame/...` — roster grouping by team, board styling for teammate vs enemy, channel switcher in chat.
- i18n locale files in `apps/web/src/app/i18n/locales/` for `en`, `ru`, `es`, `fr`, `by` — add new key namespace.

### E2E — files to create

- `apps/web/tests/e2e/sea-battle-team-mode.spec.ts`

---

## Phase 0 — Read context (no code changes)

### Task 0.1: Read spec end-to-end

- [ ] **Step 1:** Read `docs/superpowers/specs/2026-05-07-sea-battle-team-mode-design.md` in full.
- [ ] **Step 2:** Read `apps/be/src/games/engines/sea-battle/sea-battle.engine.ts` (current FFA engine — every team-mode change must keep this code path intact).
- [ ] **Step 3:** Read `apps/be/src/games/ARCHITECTURE.md` so you understand how engines plug into the registry and how sessions vs rooms differ.

No commit for this task.

---

## Phase 1 — Engine (backend, pure logic)

All Phase 1 work is in `apps/be/`. Run tests with `pnpm --filter be test`.

### Task 1.1: Add team types and constants

**Files:**

- Modify: `apps/be/src/games/engines/sea-battle/sea-battle.constants.ts`
- Modify: `apps/be/src/games/engines/sea-battle/sea-battle.types.ts`
- Modify: `apps/be/src/games/engines/base/game-engine.interface.ts`

- [ ] **Step 1: Add team-mode constants**

In `sea-battle.constants.ts`, below the existing `MAX_PLAYERS = 6`:

```ts
export const MAX_PLAYERS_TEAM_MODE = 8;
export const MIN_TEAM_SIZE = 2;
export const MIN_TEAMS = 2;
```

- [ ] **Step 2: Add `SeaBattleTeam` and extend `SeaBattleState`**

In `sea-battle.types.ts`:

```ts
export interface SeaBattleTeam {
  id: string;
  name: string;
  color: string;
  playerIds: string[];
  currentShooterIndex: number;
}

export interface SeaBattleState {
  // …existing fields unchanged…
  teams?: SeaBattleTeam[];
  teamOrder?: string[];
  currentTeamIndex?: number;
  hideShipsFromTeammates?: boolean;
}
```

- [ ] **Step 3: Extend `ChatScope`**

In `apps/be/src/games/engines/base/game-engine.interface.ts`:

```ts
export type ChatScope = 'all' | 'players' | 'private' | 'team';
```

- [ ] **Step 4: Build & run all existing tests to confirm no regressions**

```bash
pnpm --filter be test
```

Expected: 97 tests pass (no test removed yet).

- [ ] **Step 5: Commit**

```bash
git add apps/be/src/games/engines/sea-battle/sea-battle.constants.ts \
        apps/be/src/games/engines/sea-battle/sea-battle.types.ts \
        apps/be/src/games/engines/base/game-engine.interface.ts
git commit -m "feat(be): add sea battle team-mode types and constants (ARC-427)"
```

---

### Task 1.2: `team-rotation.utils.ts` — pure rotation helpers (TDD)

These helpers encapsulate "advance team pointer" and "advance shooter pointer" logic so the engine stays readable.

**Files:**

- Create: `apps/be/src/games/engines/sea-battle/team-rotation.utils.ts`
- Create: `apps/be/src/games/engines/sea-battle/team-rotation.utils.spec.ts`

- [ ] **Step 1: Write failing tests first**

Create `team-rotation.utils.spec.ts`. The test file builds a minimal fake `SeaBattleState` with `teams`, `teamOrder`, `currentTeamIndex`, and `players[].alive`. Tests to write:

```ts
import {
  getActiveTeam,
  getActiveShooterId,
  advanceTeamRotationOnMiss,
  isTeamAlive,
  countAliveTeams,
} from './team-rotation.utils';
import { SeaBattleState, SeaBattleTeam } from './sea-battle.types';

function makeState(opts: {
  teams: { id: string; players: { id: string; alive: boolean }[] }[];
  currentTeamIndex?: number;
  shooterIndices?: Record<string, number>;
}): SeaBattleState {
  const teams: SeaBattleTeam[] = opts.teams.map((t) => ({
    id: t.id,
    name: t.id,
    color: '#000',
    playerIds: t.players.map((p) => p.id),
    currentShooterIndex: opts.shooterIndices?.[t.id] ?? 0,
  }));
  const allPlayers = opts.teams.flatMap((t) => t.players);
  return {
    phase: 'battle',
    players: allPlayers.map((p) => ({
      playerId: p.id,
      alive: p.alive,
      board: [],
      ships: [],
      shipsRemaining: p.alive ? 1 : 0,
      placementComplete: true,
    })),
    playerOrder: allPlayers.map((p) => p.id),
    currentTurnIndex: 0,
    teams,
    teamOrder: teams.map((t) => t.id),
    currentTeamIndex: opts.currentTeamIndex ?? 0,
    logs: [],
  } as SeaBattleState;
}

describe('team-rotation.utils', () => {
  describe('getActiveShooterId', () => {
    it("returns the active team's currentShooter playerId", () => {
      const state = makeState({
        teams: [
          {
            id: 't1',
            players: [
              { id: 'a', alive: true },
              { id: 'b', alive: true },
            ],
          },
          { id: 't2', players: [{ id: 'c', alive: true }] },
        ],
        currentTeamIndex: 0,
        shooterIndices: { t1: 1 },
      });
      expect(getActiveShooterId(state)).toBe('b');
    });
  });

  describe('isTeamAlive', () => {
    it('returns true when at least one player on the team is alive', () => {
      const state = makeState({
        teams: [
          {
            id: 't1',
            players: [
              { id: 'a', alive: false },
              { id: 'b', alive: true },
            ],
          },
        ],
      });
      expect(isTeamAlive(state, 't1')).toBe(true);
    });
    it('returns false when all team players are dead', () => {
      const state = makeState({
        teams: [{ id: 't1', players: [{ id: 'a', alive: false }] }],
      });
      expect(isTeamAlive(state, 't1')).toBe(false);
    });
  });

  describe('advanceTeamRotationOnMiss', () => {
    it("rotates the active team's shooter to the next alive teammate", () => {
      const state = makeState({
        teams: [
          {
            id: 't1',
            players: [
              { id: 'a', alive: true },
              { id: 'b', alive: true },
            ],
          },
          {
            id: 't2',
            players: [
              { id: 'c', alive: true },
              { id: 'd', alive: true },
            ],
          },
        ],
        currentTeamIndex: 0,
      });
      advanceTeamRotationOnMiss(state);
      // After miss: team 0's shooter advances to index 1, then turn passes to team 1
      const t1 = state.teams!.find((t) => t.id === 't1')!;
      expect(t1.currentShooterIndex).toBe(1);
      expect(state.currentTeamIndex).toBe(1);
    });

    it('skips dead teammates when advancing shooter', () => {
      const state = makeState({
        teams: [
          {
            id: 't1',
            players: [
              { id: 'a', alive: true },
              { id: 'b', alive: false },
              { id: 'c', alive: true },
            ],
          },
          { id: 't2', players: [{ id: 'd', alive: true }] },
        ],
        currentTeamIndex: 0,
      });
      advanceTeamRotationOnMiss(state);
      const t1 = state.teams!.find((t) => t.id === 't1')!;
      expect(t1.currentShooterIndex).toBe(2); // skipped 1 (dead)
      expect(state.currentTeamIndex).toBe(1);
    });

    it('skips fully-eliminated teams when advancing team pointer', () => {
      const state = makeState({
        teams: [
          { id: 't1', players: [{ id: 'a', alive: true }] },
          { id: 't2', players: [{ id: 'b', alive: false }] },
          { id: 't3', players: [{ id: 'c', alive: true }] },
        ],
        currentTeamIndex: 0,
      });
      advanceTeamRotationOnMiss(state);
      expect(state.currentTeamIndex).toBe(2); // skipped t2 (dead)
    });

    it('wraps shooter index correctly for single-survivor teams', () => {
      const state = makeState({
        teams: [
          {
            id: 't1',
            players: [
              { id: 'a', alive: false },
              { id: 'b', alive: true },
            ],
          },
          { id: 't2', players: [{ id: 'c', alive: true }] },
        ],
        currentTeamIndex: 0,
        shooterIndices: { t1: 1 },
      });
      advanceTeamRotationOnMiss(state);
      const t1 = state.teams!.find((t) => t.id === 't1')!;
      expect(t1.currentShooterIndex).toBe(1); // only alive teammate
    });
  });

  describe('countAliveTeams', () => {
    it('counts only teams with at least one alive player', () => {
      const state = makeState({
        teams: [
          { id: 't1', players: [{ id: 'a', alive: true }] },
          { id: 't2', players: [{ id: 'b', alive: false }] },
          { id: 't3', players: [{ id: 'c', alive: true }] },
        ],
      });
      expect(countAliveTeams(state)).toBe(2);
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail with "module not found"**

```bash
pnpm --filter be test -- team-rotation
```

Expected: FAIL — `Cannot find module './team-rotation.utils'`.

- [ ] **Step 3: Implement helpers**

Create `team-rotation.utils.ts`:

```ts
import type { SeaBattleState } from './sea-battle.types';

export function getActiveTeam(state: SeaBattleState) {
  if (
    !state.teams ||
    !state.teamOrder ||
    state.currentTeamIndex === undefined
  ) {
    return undefined;
  }
  const teamId = state.teamOrder[state.currentTeamIndex];
  return state.teams.find((t) => t.id === teamId);
}

export function getActiveShooterId(state: SeaBattleState): string | undefined {
  const team = getActiveTeam(state);
  if (!team) return undefined;
  return team.playerIds[team.currentShooterIndex];
}

export function getTeamForPlayer(state: SeaBattleState, playerId: string) {
  return state.teams?.find((t) => t.playerIds.includes(playerId));
}

export function arePlayersOnSameTeam(
  state: SeaBattleState,
  a: string,
  b: string,
): boolean {
  if (!state.teams) return false;
  const teamA = getTeamForPlayer(state, a);
  return !!teamA && teamA.playerIds.includes(b);
}

export function isTeamAlive(state: SeaBattleState, teamId: string): boolean {
  const team = state.teams?.find((t) => t.id === teamId);
  if (!team) return false;
  return team.playerIds.some((pid) => {
    const p = state.players.find((pp) => pp.playerId === pid);
    return !!p?.alive;
  });
}

export function countAliveTeams(state: SeaBattleState): number {
  if (!state.teamOrder) return 0;
  return state.teamOrder.filter((tid) => isTeamAlive(state, tid)).length;
}

export function advanceTeamRotationOnMiss(state: SeaBattleState): void {
  if (
    !state.teams ||
    !state.teamOrder ||
    state.currentTeamIndex === undefined
  ) {
    return;
  }
  const activeTeam = getActiveTeam(state);
  if (!activeTeam) return;

  // 1) Advance the active team's shooter to the next alive teammate (with wrap).
  const n = activeTeam.playerIds.length;
  let next = activeTeam.currentShooterIndex;
  for (let step = 0; step < n; step++) {
    next = (next + 1) % n;
    const candidate = state.players.find(
      (p) => p.playerId === activeTeam.playerIds[next],
    );
    if (candidate?.alive) break;
  }
  activeTeam.currentShooterIndex = next;

  // 2) Advance the team pointer to the next team that has at least one alive player.
  const teamCount = state.teamOrder.length;
  let nextTeam = state.currentTeamIndex;
  for (let step = 0; step < teamCount; step++) {
    nextTeam = (nextTeam + 1) % teamCount;
    if (isTeamAlive(state, state.teamOrder[nextTeam])) break;
  }
  state.currentTeamIndex = nextTeam;
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm --filter be test -- team-rotation
```

Expected: PASS — all 8 tests green.

- [ ] **Step 5: Commit**

```bash
git add apps/be/src/games/engines/sea-battle/team-rotation.utils.ts \
        apps/be/src/games/engines/sea-battle/team-rotation.utils.spec.ts
git commit -m "feat(be): add team rotation helpers for sea battle (ARC-427)"
```

---

### Task 1.3: Engine `initializeState` team branch (TDD)

**Files:**

- Create: `apps/be/src/games/engines/sea-battle/sea-battle.engine.team.spec.ts`
- Modify: `apps/be/src/games/engines/sea-battle/sea-battle.engine.ts`

- [ ] **Step 1: Write the failing test**

Create `sea-battle.engine.team.spec.ts` with one test for now (we'll grow it):

```ts
import { SeaBattleEngine } from './sea-battle.engine';

describe('SeaBattleEngine — team mode', () => {
  const engine = new SeaBattleEngine();

  describe('initializeState', () => {
    it('populates team fields when team config is provided', () => {
      const state = engine.initializeState(['a', 'b', 'c', 'd'], {
        teams: [
          { id: 't1', name: 'Red', color: '#E33', playerIds: ['a', 'b'] },
          { id: 't2', name: 'Blue', color: '#36C', playerIds: ['c', 'd'] },
        ],
        hideShipsFromTeammates: true,
      });

      expect(state.teams).toHaveLength(2);
      expect(state.teams![0].currentShooterIndex).toBe(0);
      expect(state.teamOrder).toEqual(['t1', 't2']);
      expect(state.currentTeamIndex).toBe(0);
      expect(state.hideShipsFromTeammates).toBe(true);
    });

    it('leaves team fields undefined when no team config', () => {
      const state = engine.initializeState(['a', 'b']);
      expect(state.teams).toBeUndefined();
      expect(state.teamOrder).toBeUndefined();
      expect(state.hideShipsFromTeammates).toBeUndefined();
    });
  });
});
```

- [ ] **Step 2: Run to verify failure**

```bash
pnpm --filter be test -- sea-battle.engine.team
```

Expected: FAIL — first test fails because `state.teams` is undefined.

- [ ] **Step 3: Update `initializeState`**

In `sea-battle.engine.ts`, replace the existing `initializeState` with:

```ts
initializeState(
  playerIds: string[],
  config?: {
    teams?: Array<{ id: string; name: string; color: string; playerIds: string[] }>;
    hideShipsFromTeammates?: boolean;
  } & Record<string, unknown>,
): SeaBattleState {
  const players: SeaBattlePlayer[] = playerIds.map((id) => ({
    playerId: id,
    alive: true,
    board: createEmptyBoard(),
    ships: [],
    shipsRemaining: SHIPS.length,
    placementComplete: false,
  }));

  const baseState: SeaBattleState = {
    phase: GAME_PHASE.PLACEMENT,
    players,
    playerOrder: playerIds,
    currentTurnIndex: 0,
    logs: [this.createLogEntry('system', 'Game started! Place your ships.')],
  };

  if (config?.teams && config.teams.length > 0) {
    baseState.teams = config.teams.map((t) => ({
      id: t.id,
      name: t.name,
      color: t.color,
      playerIds: [...t.playerIds],
      currentShooterIndex: 0,
    }));
    baseState.teamOrder = config.teams.map((t) => t.id);
    baseState.currentTeamIndex = 0;
    baseState.hideShipsFromTeammates = !!config.hideShipsFromTeammates;
  }

  return baseState;
}
```

- [ ] **Step 4: Run tests**

```bash
pnpm --filter be test -- sea-battle.engine
```

Expected: all green (existing FFA tests untouched, two new team tests pass).

- [ ] **Step 5: Commit**

```bash
git add apps/be/src/games/engines/sea-battle/sea-battle.engine.ts \
        apps/be/src/games/engines/sea-battle/sea-battle.engine.team.spec.ts
git commit -m "feat(be): initialize team state in sea battle engine (ARC-427)"
```

---

### Task 1.4: `validateAttack` rejects teammate (TDD)

**Files:**

- Modify: `apps/be/src/games/engines/sea-battle/sea-battle.validators.ts`
- Modify: `apps/be/src/games/engines/sea-battle/sea-battle.engine.team.spec.ts`

- [ ] **Step 1: Add failing test**

Append to `sea-battle.engine.team.spec.ts`:

```ts
import { GAME_PHASE } from './sea-battle.constants';

describe('validateAction (attack) — team mode', () => {
  const engine = new SeaBattleEngine();

  function placedTeamState() {
    const s = engine.initializeState(['a', 'b', 'c', 'd'], {
      teams: [
        { id: 't1', name: 'Red', color: '#E33', playerIds: ['a', 'b'] },
        { id: 't2', name: 'Blue', color: '#36C', playerIds: ['c', 'd'] },
      ],
    });
    s.phase = GAME_PHASE.BATTLE;
    return s;
  }

  it('rejects attack on teammate', () => {
    const s = placedTeamState();
    const ok = engine.validateAction(
      s,
      'attack',
      { userId: 'a', roomId: 'r', sessionId: 's', timestamp: new Date() },
      { targetPlayerId: 'b', row: 0, col: 0 },
    );
    expect(ok).toBe(false);
  });

  it('rejects attack from non-active shooter', () => {
    const s = placedTeamState(); // active = a
    const ok = engine.validateAction(
      s,
      'attack',
      { userId: 'b', roomId: 'r', sessionId: 's', timestamp: new Date() },
      { targetPlayerId: 'c', row: 0, col: 0 },
    );
    expect(ok).toBe(false);
  });

  it('accepts attack from active shooter on enemy', () => {
    const s = placedTeamState();
    const ok = engine.validateAction(
      s,
      'attack',
      { userId: 'a', roomId: 'r', sessionId: 's', timestamp: new Date() },
      { targetPlayerId: 'c', row: 0, col: 0 },
    );
    expect(ok).toBe(true);
  });
});
```

- [ ] **Step 2: Run to verify failure**

```bash
pnpm --filter be test -- sea-battle.engine.team
```

Expected: First two tests fail (validator still uses FFA-only `playerOrder`).

- [ ] **Step 3: Update `validateAttack`**

Replace `validateAttack` in `sea-battle.validators.ts`. Add team-mode branches at the top of the existing checks:

```ts
import {
  arePlayersOnSameTeam,
  getActiveShooterId,
} from './team-rotation.utils';

export function validateAttack(
  state: SeaBattleState,
  player: SeaBattlePlayer,
  payload: AttackPayload,
): boolean {
  if (state.phase !== GAME_PHASE.BATTLE) return false;

  // Determine who is allowed to attack right now.
  const activeId = state.teams
    ? getActiveShooterId(state)
    : state.playerOrder[state.currentTurnIndex];
  if (player.playerId !== activeId) return false;

  if (
    !payload?.targetPlayerId ||
    payload.row === undefined ||
    payload.col === undefined
  ) {
    return false;
  }

  if (payload.targetPlayerId === player.playerId) return false;

  // No friendly fire in team mode.
  if (
    state.teams &&
    arePlayersOnSameTeam(state, player.playerId, payload.targetPlayerId)
  ) {
    return false;
  }

  const target = state.players.find(
    (p) => p.playerId === payload.targetPlayerId,
  );
  if (!target || !target.alive) return false;

  if (
    payload.row < 0 ||
    payload.row >= BOARD_SIZE ||
    payload.col < 0 ||
    payload.col >= BOARD_SIZE
  ) {
    return false;
  }

  const cellState = target.board[payload.row][payload.col];
  if (cellState === CELL_STATE.HIT || cellState === CELL_STATE.MISS) {
    return false;
  }

  return true;
}
```

- [ ] **Step 4: Run all sea-battle tests**

```bash
pnpm --filter be test -- sea-battle
```

Expected: every existing test still passes; new team validator tests pass.

- [ ] **Step 5: Commit**

```bash
git add apps/be/src/games/engines/sea-battle/sea-battle.validators.ts \
        apps/be/src/games/engines/sea-battle/sea-battle.engine.team.spec.ts
git commit -m "feat(be): block teammate attacks in sea battle (ARC-427)"
```

---

### Task 1.5: `executeAttack` turn rotation in team mode (TDD)

**Files:**

- Modify: `apps/be/src/games/engines/sea-battle/sea-battle.engine.ts`
- Modify: `apps/be/src/games/engines/sea-battle/sea-battle.engine.team.spec.ts`

- [ ] **Step 1: Add failing tests**

Append to the team spec file. Use a helper that places ships for every player so we can simulate attacks. Reuse `randomlyPlaceShips` and `executeAutoPlace`:

```ts
import { CELL_STATE } from './sea-battle.constants';

describe('executeAction (attack) — team rotation', () => {
  const engine = new SeaBattleEngine();

  function readyTeamState(
    playerIds: string[],
    teams: { id: string; playerIds: string[] }[],
  ) {
    const s = engine.initializeState(playerIds, {
      teams: teams.map((t) => ({
        id: t.id,
        name: t.id,
        color: '#000',
        playerIds: t.playerIds,
      })),
    });
    // Auto-place + confirm everyone
    for (const p of s.players) {
      const r1 = engine.executeAction(s, 'autoPlace', {
        userId: p.playerId,
        roomId: '',
        sessionId: '',
        timestamp: new Date(),
      });
      Object.assign(s, r1.state);
      const r2 = engine.executeAction(s, 'confirmPlacement', {
        userId: p.playerId,
        roomId: '',
        sessionId: '',
        timestamp: new Date(),
      });
      Object.assign(s, r2.state);
    }
    return s;
  }

  it("miss advances team and rotates active team's shooter", () => {
    const s = readyTeamState(
      ['a', 'b', 'c', 'd'],
      [
        { id: 't1', playerIds: ['a', 'b'] },
        { id: 't2', playerIds: ['c', 'd'] },
      ],
    );
    // Force a known empty cell on c's board
    const c = s.players.find((p) => p.playerId === 'c')!;
    // Find a cell that's EMPTY (i.e. not a ship)
    let mr = -1,
      mc = -1;
    outer: for (let r = 0; r < c.board.length; r++) {
      for (let cc = 0; cc < c.board[r].length; cc++) {
        if (c.board[r][cc] === CELL_STATE.EMPTY) {
          mr = r;
          mc = cc;
          break outer;
        }
      }
    }
    expect(mr).toBeGreaterThanOrEqual(0);
    const result = engine.executeAction(
      s,
      'attack',
      {
        userId: 'a',
        roomId: '',
        sessionId: '',
        timestamp: new Date(),
      },
      { targetPlayerId: 'c', row: mr, col: mc },
    );
    const ns = result.state!;
    expect(ns.currentTeamIndex).toBe(1);
    expect(ns.teams!.find((t) => t.id === 't1')!.currentShooterIndex).toBe(1);
  });

  it('hit keeps the same shooter (no pointer change)', () => {
    const four = readyTeamState(
      ['a', 'b', 'c', 'd'],
      [
        { id: 't1', playerIds: ['a', 'b'] },
        { id: 't2', playerIds: ['c', 'd'] },
      ],
    );
    const c = four.players.find((p) => p.playerId === 'c')!;
    let hr = -1,
      hc = -1;
    outer: for (let r = 0; r < c.board.length; r++) {
      for (let cc = 0; cc < c.board[r].length; cc++) {
        if (c.board[r][cc] === CELL_STATE.SHIP) {
          hr = r;
          hc = cc;
          break outer;
        }
      }
    }
    expect(hr).toBeGreaterThanOrEqual(0);
    const result = engine.executeAction(
      four,
      'attack',
      {
        userId: 'a',
        roomId: '',
        sessionId: '',
        timestamp: new Date(),
      },
      { targetPlayerId: 'c', row: hr, col: hc },
    );
    const ns = result.state!;
    expect(ns.currentTeamIndex).toBe(0); // unchanged on hit
    expect(ns.teams!.find((t) => t.id === 't1')!.currentShooterIndex).toBe(0);
  });
});
```

- [ ] **Step 2: Run to verify failures**

```bash
pnpm --filter be test -- sea-battle.engine.team
```

Expected: the two rotation tests fail (engine still uses `advanceToNextPlayer`).

- [ ] **Step 3: Branch `executeAttack`**

Inside `executeAttack` in `sea-battle.engine.ts`, replace:

```ts
if (result === ATTACK_RESULT.MISS) {
  this.advanceToNextPlayer(state);
}
```

with:

```ts
if (result === ATTACK_RESULT.MISS) {
  if (state.teams) {
    advanceTeamRotationOnMiss(state);
    // keep currentTurnIndex/playerOrder in sync for legacy consumers
    const shooter = getActiveShooterId(state);
    if (shooter) {
      state.currentTurnIndex = state.playerOrder.indexOf(shooter);
    }
  } else {
    this.advanceToNextPlayer(state);
  }
}
```

Add the imports at the top of `sea-battle.engine.ts`:

```ts
import {
  advanceTeamRotationOnMiss,
  getActiveShooterId,
} from './team-rotation.utils';
```

- [ ] **Step 4: Run tests**

```bash
pnpm --filter be test -- sea-battle
```

Expected: all green.

- [ ] **Step 5: Commit**

```bash
git add apps/be/src/games/engines/sea-battle/sea-battle.engine.ts \
        apps/be/src/games/engines/sea-battle/sea-battle.engine.team.spec.ts
git commit -m "feat(be): rotate by team on miss in sea battle (ARC-427)"
```

---

### Task 1.6: `isGameOver` / `getWinners` for team mode (TDD)

**Files:**

- Modify: `apps/be/src/games/engines/sea-battle/sea-battle.engine.ts`
- Modify: `apps/be/src/games/engines/sea-battle/sea-battle.engine.team.spec.ts`

- [ ] **Step 1: Add failing tests**

Append:

```ts
describe('isGameOver / getWinners — team mode', () => {
  const engine = new SeaBattleEngine();

  function teamStateWithKills(
    survivors: string[],
    dead: string[],
    teams: { id: string; playerIds: string[] }[],
  ) {
    const s = engine.initializeState([...survivors, ...dead], {
      teams: teams.map((t) => ({
        id: t.id,
        name: t.id,
        color: '#000',
        playerIds: t.playerIds,
      })),
    });
    s.phase = 'battle' as any;
    for (const p of s.players) {
      if (dead.includes(p.playerId)) p.alive = false;
    }
    return s;
  }

  it('isGameOver returns true when only one team has alive players', () => {
    const s = teamStateWithKills(
      ['a', 'b'],
      ['c', 'd'],
      [
        { id: 't1', playerIds: ['a', 'b'] },
        { id: 't2', playerIds: ['c', 'd'] },
      ],
    );
    expect(engine.isGameOver(s)).toBe(true);
  });

  it('isGameOver returns false when ≥2 teams have alive players', () => {
    const s = teamStateWithKills(
      ['a', 'c'],
      ['b', 'd'],
      [
        { id: 't1', playerIds: ['a', 'b'] },
        { id: 't2', playerIds: ['c', 'd'] },
      ],
    );
    expect(engine.isGameOver(s)).toBe(false);
  });

  it('getWinners returns all surviving team members', () => {
    const s = teamStateWithKills(
      ['a', 'b'],
      ['c', 'd'],
      [
        { id: 't1', playerIds: ['a', 'b'] },
        { id: 't2', playerIds: ['c', 'd'] },
      ],
    );
    expect(engine.getWinners(s).sort()).toEqual(['a', 'b']);
  });
});
```

- [ ] **Step 2: Run to verify failures**

```bash
pnpm --filter be test -- sea-battle.engine.team
```

- [ ] **Step 3: Branch `isGameOver` / `getWinners`**

In `sea-battle.engine.ts`:

```ts
isGameOver(state: SeaBattleState): boolean {
  if (state.phase !== GAME_PHASE.BATTLE) return false;
  if (state.teams) {
    return countAliveTeams(state) <= 1;
  }
  const alivePlayers = state.players.filter((p) => p.alive);
  return alivePlayers.length <= 1;
}

getWinners(state: SeaBattleState): string[] {
  if (state.teams && state.teamOrder) {
    const survivingTeamIds = state.teamOrder.filter((tid) =>
      isTeamAlive(state, tid),
    );
    if (survivingTeamIds.length === 1) {
      const team = state.teams.find((t) => t.id === survivingTeamIds[0])!;
      return [...team.playerIds];
    }
    if (survivingTeamIds.length === 0) {
      this.logger.error('Sea Battle ended with no surviving teams');
    }
    return [];
  }
  const alivePlayers = state.players.filter((p) => p.alive);
  if (alivePlayers.length === 1) {
    state.winnerId = alivePlayers[0].playerId;
    return [alivePlayers[0].playerId];
  }
  return [];
}
```

Imports:

```ts
import { countAliveTeams, isTeamAlive } from './team-rotation.utils';
```

- [ ] **Step 4: Run sea-battle suite**

```bash
pnpm --filter be test -- sea-battle
```

- [ ] **Step 5: Commit**

```bash
git add apps/be/src/games/engines/sea-battle/sea-battle.engine.ts \
        apps/be/src/games/engines/sea-battle/sea-battle.engine.team.spec.ts
git commit -m "feat(be): team-aware win condition in sea battle (ARC-427)"
```

---

### Task 1.7: `sanitizeStateForPlayer` reveals teammates (TDD)

**Files:**

- Modify: `apps/be/src/games/engines/sea-battle/sea-battle.utils.ts`
- Modify: `apps/be/src/games/engines/sea-battle/sea-battle.engine.team.spec.ts`

- [ ] **Step 1: Add failing tests**

Append:

```ts
describe('sanitizeStateForPlayer — team mode', () => {
  const engine = new SeaBattleEngine();

  function placedTeamState(hide: boolean) {
    const s = engine.initializeState(['a', 'b', 'c', 'd'], {
      teams: [
        { id: 't1', name: 'Red', color: '#E33', playerIds: ['a', 'b'] },
        { id: 't2', name: 'Blue', color: '#36C', playerIds: ['c', 'd'] },
      ],
      hideShipsFromTeammates: hide,
    });
    for (const p of s.players) {
      const r = engine.executeAction(s, 'autoPlace', {
        userId: p.playerId,
        roomId: '',
        sessionId: '',
        timestamp: new Date(),
      });
      Object.assign(s, r.state);
    }
    return s;
  }

  it('reveals teammate ship cells when hideShipsFromTeammates is false', () => {
    const s = placedTeamState(false);
    const sanitized = engine.sanitizeStateForPlayer(s, 'a') as typeof s;
    const teammateB = sanitized.players.find((p) => p.playerId === 'b')!;
    // At least one cell should remain SHIP (not zeroed)
    const hasShipCell = teammateB.board.some((row) =>
      row.some((c) => c === CELL_STATE.SHIP),
    );
    expect(hasShipCell).toBe(true);
    expect(teammateB.ships.length).toBeGreaterThan(0);
    expect(teammateB.ships.every((s) => s.cells.length > 0)).toBe(true);
  });

  it('hides teammate ship cells when hideShipsFromTeammates is true', () => {
    const s = placedTeamState(true);
    const sanitized = engine.sanitizeStateForPlayer(s, 'a') as typeof s;
    const teammateB = sanitized.players.find((p) => p.playerId === 'b')!;
    const hasShipCell = teammateB.board.some((row) =>
      row.some((c) => c === CELL_STATE.SHIP),
    );
    expect(hasShipCell).toBe(false);
    // attack history (HIT/MISS markers) is NOT yet on the board because no attacks happened.
  });

  it('still hides enemy ship cells regardless of toggle', () => {
    const s = placedTeamState(false);
    const sanitized = engine.sanitizeStateForPlayer(s, 'a') as typeof s;
    const enemyC = sanitized.players.find((p) => p.playerId === 'c')!;
    const hasShipCell = enemyC.board.some((row) =>
      row.some((c) => c === CELL_STATE.SHIP),
    );
    expect(hasShipCell).toBe(false);
  });

  it('filters team-scoped logs to teammates only', () => {
    const s = placedTeamState(false);
    s.logs.push({
      id: 'log-1',
      type: 'message',
      message: 'go',
      createdAt: new Date().toISOString(),
      scope: 'team',
      senderId: 'a',
      senderName: 'A',
    });
    const seenByB = (engine.sanitizeStateForPlayer(s, 'b') as typeof s).logs;
    const seenByC = (engine.sanitizeStateForPlayer(s, 'c') as typeof s).logs;
    expect(seenByB.some((l) => l.id === 'log-1')).toBe(true);
    expect(seenByC.some((l) => l.id === 'log-1')).toBe(false);
  });
});
```

- [ ] **Step 2: Run to verify failures**

```bash
pnpm --filter be test -- sea-battle.engine.team
```

- [ ] **Step 3: Update `sanitizeSeaBattleState`**

Replace the function body in `sea-battle.utils.ts`:

```ts
export function sanitizeSeaBattleState(
  state: SeaBattleState,
  playerId: string,
): Partial<SeaBattleState> {
  const sanitized = JSON.parse(JSON.stringify(state)) as SeaBattleState;

  const viewerTeamId = sanitized.teams?.find((t) =>
    t.playerIds.includes(playerId),
  )?.id;

  for (const p of sanitized.players) {
    if (p.playerId === playerId) continue;

    const sameTeam =
      !!viewerTeamId &&
      !!sanitized.teams
        ?.find((t) => t.id === viewerTeamId)
        ?.playerIds.includes(p.playerId);
    const reveal = sameTeam && sanitized.hideShipsFromTeammates !== true;

    if (!reveal) {
      for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
          if (p.board[row][col] === CELL_STATE.SHIP) {
            p.board[row][col] = CELL_STATE.EMPTY;
          }
        }
      }
      p.ships = p.ships.map((ship: Ship) => ({
        ...ship,
        cells: ship.sunk ? ship.cells : [],
      }));
    }
  }

  sanitized.logs = sanitized.logs.filter((log) => {
    if (log.scope === 'private') {
      return log.senderId === playerId;
    }
    if (log.scope === 'team') {
      if (!viewerTeamId) return false;
      const senderTeam = sanitized.teams?.find((t) =>
        t.playerIds.includes(log.senderId ?? ''),
      );
      return senderTeam?.id === viewerTeamId;
    }
    return true;
  });

  return sanitized;
}
```

- [ ] **Step 4: Run sea-battle suite**

```bash
pnpm --filter be test -- sea-battle
```

- [ ] **Step 5: Commit**

```bash
git add apps/be/src/games/engines/sea-battle/sea-battle.utils.ts \
        apps/be/src/games/engines/sea-battle/sea-battle.engine.team.spec.ts
git commit -m "feat(be): team-aware sanitization in sea battle (ARC-427)"
```

---

### Task 1.8: `getAvailableActions` and engine `getMetadata.maxPlayers`

**Files:**

- Modify: `apps/be/src/games/engines/sea-battle/sea-battle.utils.ts`
- Modify: `apps/be/src/games/engines/sea-battle/sea-battle.engine.ts`
- Modify: `apps/be/src/games/engines/sea-battle/sea-battle.engine.team.spec.ts`

- [ ] **Step 1: Add failing tests**

```ts
describe('getAvailableActions — team mode', () => {
  const engine = new SeaBattleEngine();
  function ready() {
    const s = engine.initializeState(['a', 'b', 'c', 'd'], {
      teams: [
        { id: 't1', name: 'Red', color: '#E33', playerIds: ['a', 'b'] },
        { id: 't2', name: 'Blue', color: '#36C', playerIds: ['c', 'd'] },
      ],
    });
    s.phase = 'battle' as any;
    return s;
  }

  it('only the active shooter can attack', () => {
    const s = ready();
    expect(engine.getAvailableActions(s, 'a')).toContain('attack');
    expect(engine.getAvailableActions(s, 'b')).not.toContain('attack');
    expect(engine.getAvailableActions(s, 'c')).not.toContain('attack');
  });
});
```

- [ ] **Step 2: Run to verify failure**

- [ ] **Step 3: Update `getSeaBattleAvailableActions`**

In `sea-battle.utils.ts`, change the BATTLE branch:

```ts
import { getActiveShooterId } from './team-rotation.utils';

if (state.phase === GAME_PHASE.BATTLE) {
  const activeId = state.teams
    ? getActiveShooterId(state)
    : state.playerOrder[state.currentTurnIndex];
  if (playerId === activeId) {
    actions.push('attack');
  }
}
```

- [ ] **Step 4: Update `getMetadata.maxPlayers` to 8**

In `sea-battle.engine.ts`:

```ts
getMetadata(): GameMetadata {
  return {
    gameId: 'sea_battle_v1',
    name: 'Sea Battle',
    minPlayers: 2,
    maxPlayers: 8,
    version: '1.1.0',
    description: 'Classic naval combat game (FFA up to 6, team mode up to 8)',
    category: 'Strategy',
  };
}
```

> The lobby/service still enforces FFA cap of 6 — see Task 2.4. Engine metadata is informational only.

- [ ] **Step 5: Run all sea-battle tests**

```bash
pnpm --filter be test -- sea-battle
```

- [ ] **Step 6: Commit**

```bash
git add apps/be/src/games/engines/sea-battle/sea-battle.utils.ts \
        apps/be/src/games/engines/sea-battle/sea-battle.engine.ts \
        apps/be/src/games/engines/sea-battle/sea-battle.engine.team.spec.ts
git commit -m "feat(be): gate attack action on active shooter and bump max players (ARC-427)"
```

---

## Phase 2 — Lobby (backend rooms + gateway)

### Task 2.1: DTOs for team-mode socket actions

**Files:**

- Create: `apps/be/src/games/dtos/set-team-mode.dto.ts`
- Create: `apps/be/src/games/dtos/set-team-config.dto.ts`
- Create: `apps/be/src/games/dtos/assign-team.dto.ts`
- Create: `apps/be/src/games/dtos/add-bot-to-team.dto.ts`
- Create: `apps/be/src/games/dtos/remove-bot-from-team.dto.ts`
- Create: `apps/be/src/games/dtos/toggle-hide-ships.dto.ts`

Each DTO uses `class-validator` decorators per project rules. Reference any existing DTO in `apps/be/src/games/dtos/` for style.

- [ ] **Step 1: Write each DTO**

Example `set-team-config.dto.ts`:

```ts
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsHexColor,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class SeaBattleTeamConfigItemDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @Matches(/^[\p{L}\p{N} _-]{1,32}$/u)
  name!: string;

  @IsHexColor()
  color!: string;

  @IsInt()
  @Min(2)
  @Max(8)
  targetSize!: number;
}

export class SetTeamConfigDto {
  @IsString()
  roomId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SeaBattleTeamConfigItemDto)
  teams!: SeaBattleTeamConfigItemDto[];

  @IsBoolean()
  @IsOptional()
  hideShipsFromTeammates?: boolean;
}
```

The other DTOs follow the same pattern: `roomId`, plus the action-specific fields (`enabled` boolean, `userId`, `teamId`, etc.). Keep each file under 80 lines.

- [ ] **Step 2: Build to confirm DTOs compile**

```bash
pnpm --filter be build
```

- [ ] **Step 3: Commit**

```bash
git add apps/be/src/games/dtos/set-team-mode.dto.ts \
        apps/be/src/games/dtos/set-team-config.dto.ts \
        apps/be/src/games/dtos/assign-team.dto.ts \
        apps/be/src/games/dtos/add-bot-to-team.dto.ts \
        apps/be/src/games/dtos/remove-bot-from-team.dto.ts \
        apps/be/src/games/dtos/toggle-hide-ships.dto.ts
git commit -m "feat(be): add sea battle team-mode DTOs (ARC-427)"
```

---

### Task 2.2: `SeaBattleTeamConfigService` (TDD)

**Files:**

- Create: `apps/be/src/games/rooms/sea-battle-team-config.service.ts`
- Create: `apps/be/src/games/rooms/sea-battle-team-config.service.spec.ts`
- Create: `apps/be/src/games/rooms/sea-battle-team-config.types.ts`
- Modify: `apps/be/src/games/games.module.ts`

This service mutates `GameRoom.gameOptions.teams` and is host-permission-checked. It emits a room update through the existing realtime service when state changes.

- [ ] **Step 1: Define types**

`sea-battle-team-config.types.ts`:

```ts
export interface SeaBattleTeamConfigEntry {
  id: string;
  name: string;
  color: string;
  targetSize: number;
  playerIds: string[];
}

export interface SeaBattleGameOptions {
  teamMode?: boolean;
  hideShipsFromTeammates?: boolean;
  teams?: SeaBattleTeamConfigEntry[];
  [key: string]: unknown;
}

export const TEAM_DEFAULT_COLORS = ['#E11D48', '#2563EB', '#16A34A', '#D97706'];
```

- [ ] **Step 2: Write failing service tests**

Tests cover:

- `enableTeamMode` rejects non-host with `ForbiddenException`.
- `enableTeamMode` rejects when room.status !== 'lobby'.
- `enableTeamMode` rejects when participants > 8.
- `enableTeamMode` seeds 2 teams sized to fit current participants (clamped ≥ 2).
- `disableTeamMode` clears `teams` and `hideShipsFromTeammates`.
- `setTeamConfig` enforces min 2 teams, min 2 size, total ≤ 8.
- `setTeamConfig` preserves `playerIds` for teams whose `id` matches existing teams; drops players from removed teams.
- `assignPlayerToTeam(actor=host)` can move any participant to any team.
- `assignPlayerToTeam(actor=self)` can move self only.
- `assignPlayerToTeam` rejects when target team is full.
- `addBotToTeam` adds a synthetic bot id (e.g. `bot-<random>`) to room.participants and team.playerIds; rejects when team is full. Before implementing, inspect `apps/be/src/games/schemas/game-room.schema.ts` for the `participants` shape and any required fields beyond `userId`/`joinedAt`. If the schema requires additional metadata (e.g. `displayName`, `kind`), include it here.
- `enableTeamMode` works for a host-only room (1 participant) → seeds two teams of size 2 with the host on team 1; sanity-test this path.
- `removeBotFromTeam` removes bot id from both team and participants.
- `toggleHideShips` requires host and team mode on.

Use Mongoose mocks/stubs already present in `game-rooms.service.spec.ts` (if any) or build a minimal in-memory fake. (Refer to existing `apps/be/src/games/games.service.spec.ts` for patterns.)

- [ ] **Step 3: Run to verify failures (module not found)**

```bash
pnpm --filter be test -- sea-battle-team-config
```

- [ ] **Step 4: Implement the service**

Skeleton (add docstrings inline only when behavior is non-obvious):

```ts
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GameRoom } from '../schemas/game-room.schema';
import { GameRoomsMapper } from './game-rooms.mapper';
import {
  SeaBattleGameOptions,
  SeaBattleTeamConfigEntry,
  TEAM_DEFAULT_COLORS,
} from './sea-battle-team-config.types';
import { SetTeamConfigDto } from '../dtos/set-team-config.dto';
import { AssignTeamDto } from '../dtos/assign-team.dto';

const MIN_TEAMS = 2;
const MIN_TEAM_SIZE = 2;
const MAX_TOTAL_PLAYERS = 8;

@Injectable()
export class SeaBattleTeamConfigService {
  constructor(
    @InjectModel(GameRoom.name)
    private readonly gameRoomModel: Model<GameRoom>,
    private readonly mapper: GameRoomsMapper,
  ) {}

  async enableTeamMode(roomId: string, hostId: string) {
    const room = await this.requireLobbyRoom(roomId, hostId);
    const participants = room.participants.map((p) => p.userId);
    if (participants.length > MAX_TOTAL_PLAYERS) {
      throw new BadRequestException(
        'Too many players in room — kick excess players before enabling team mode',
      );
    }
    const opts = (room.gameOptions ?? {}) as SeaBattleGameOptions;
    opts.teamMode = true;

    // Seed two teams split between participants. Host on team 0; rest alternate.
    const a: string[] = [];
    const b: string[] = [];
    const ordered = [hostId, ...participants.filter((id) => id !== hostId)];
    ordered.forEach((id, i) => (i % 2 === 0 ? a.push(id) : b.push(id)));

    const aSize = Math.max(MIN_TEAM_SIZE, a.length);
    const bSize = Math.max(MIN_TEAM_SIZE, b.length);
    if (aSize + bSize > MAX_TOTAL_PLAYERS) {
      // Should not happen given the earlier check, but be defensive.
      throw new BadRequestException(
        'Cannot fit participants into default teams',
      );
    }
    opts.teams = [
      {
        id: 't1',
        name: 'Team 1',
        color: TEAM_DEFAULT_COLORS[0],
        targetSize: aSize,
        playerIds: a,
      },
      {
        id: 't2',
        name: 'Team 2',
        color: TEAM_DEFAULT_COLORS[1],
        targetSize: bSize,
        playerIds: b,
      },
    ];
    room.gameOptions = opts;
    room.updatedAt = new Date();
    await room.save();
    return this.mapper.prepareRoomSummary(room, hostId);
  }

  async disableTeamMode(roomId: string, hostId: string) {
    const room = await this.requireLobbyRoom(roomId, hostId);
    const opts = (room.gameOptions ?? {}) as SeaBattleGameOptions;
    delete opts.teams;
    delete opts.hideShipsFromTeammates;
    opts.teamMode = false;
    room.gameOptions = opts;
    room.updatedAt = new Date();
    await room.save();
    return this.mapper.prepareRoomSummary(room, hostId);
  }

  async setTeamConfig(hostId: string, dto: SetTeamConfigDto) {
    const room = await this.requireLobbyRoom(dto.roomId, hostId);
    const opts = (room.gameOptions ?? {}) as SeaBattleGameOptions;
    if (!opts.teamMode) {
      throw new BadRequestException('Team mode is not enabled');
    }

    if (dto.teams.length < MIN_TEAMS) {
      throw new BadRequestException('Need at least 2 teams');
    }
    const total = dto.teams.reduce((s, t) => s + t.targetSize, 0);
    if (total > MAX_TOTAL_PLAYERS) {
      throw new BadRequestException(
        `Total slots cannot exceed ${MAX_TOTAL_PLAYERS}`,
      );
    }
    if (dto.teams.some((t) => t.targetSize < MIN_TEAM_SIZE)) {
      throw new BadRequestException(
        `Each team must have at least ${MIN_TEAM_SIZE} slots`,
      );
    }

    const previous = opts.teams ?? [];
    const next: SeaBattleTeamConfigEntry[] = dto.teams.map((incoming, idx) => {
      const id = incoming.id ?? `t${idx + 1}`;
      const prior = previous.find((p) => p.id === id);
      const players = (prior?.playerIds ?? []).slice(0, incoming.targetSize);
      return {
        id,
        name: incoming.name,
        color: incoming.color,
        targetSize: incoming.targetSize,
        playerIds: players,
      };
    });
    opts.teams = next;
    if (dto.hideShipsFromTeammates !== undefined) {
      opts.hideShipsFromTeammates = dto.hideShipsFromTeammates;
    }
    room.gameOptions = opts;
    room.updatedAt = new Date();
    await room.save();
    return this.mapper.prepareRoomSummary(room, hostId);
  }

  async assignPlayerToTeam(actorId: string, dto: AssignTeamDto) {
    const room = await this.gameRoomModel.findById(dto.roomId).exec();
    if (!room) throw new NotFoundException('Room not found');
    if (room.status !== 'lobby')
      throw new BadRequestException('Room is not in lobby phase');
    if (actorId !== room.hostId && actorId !== dto.userId) {
      throw new ForbiddenException('Players can only assign themselves');
    }
    const opts = (room.gameOptions ?? {}) as SeaBattleGameOptions;
    if (!opts.teams)
      throw new BadRequestException('Team mode is not configured');

    // Remove user from any existing team first.
    for (const t of opts.teams) {
      t.playerIds = t.playerIds.filter((id) => id !== dto.userId);
    }
    if (dto.teamId) {
      const team = opts.teams.find((t) => t.id === dto.teamId);
      if (!team) throw new BadRequestException('Team not found');
      if (team.playerIds.length >= team.targetSize) {
        throw new BadRequestException('Team is full');
      }
      team.playerIds.push(dto.userId);
    }
    room.gameOptions = opts;
    room.updatedAt = new Date();
    await room.save();
    return this.mapper.prepareRoomSummary(room, actorId);
  }

  async addBotToTeam(hostId: string, roomId: string, teamId: string) {
    const room = await this.requireLobbyRoom(roomId, hostId);
    const opts = (room.gameOptions ?? {}) as SeaBattleGameOptions;
    if (!opts.teams)
      throw new BadRequestException('Team mode is not configured');
    const team = opts.teams.find((t) => t.id === teamId);
    if (!team) throw new BadRequestException('Team not found');
    if (team.playerIds.length >= team.targetSize)
      throw new BadRequestException('Team is full');

    const botId = `bot-${Math.random().toString(36).slice(2, 11)}`;
    team.playerIds.push(botId);
    room.participants.push({ userId: botId, joinedAt: new Date() });
    room.gameOptions = opts;
    room.updatedAt = new Date();
    await room.save();
    return this.mapper.prepareRoomSummary(room, hostId);
  }

  async removeBotFromTeam(hostId: string, roomId: string, userId: string) {
    const room = await this.requireLobbyRoom(roomId, hostId);
    if (!userId.startsWith('bot-')) {
      throw new BadRequestException('Only bots may be removed via this method');
    }
    const opts = (room.gameOptions ?? {}) as SeaBattleGameOptions;
    if (opts.teams) {
      for (const t of opts.teams) {
        t.playerIds = t.playerIds.filter((id) => id !== userId);
      }
    }
    room.participants = room.participants.filter((p) => p.userId !== userId);
    room.gameOptions = opts;
    room.updatedAt = new Date();
    await room.save();
    return this.mapper.prepareRoomSummary(room, hostId);
  }

  async toggleHideShips(hostId: string, roomId: string, enabled: boolean) {
    const room = await this.requireLobbyRoom(roomId, hostId);
    const opts = (room.gameOptions ?? {}) as SeaBattleGameOptions;
    if (!opts.teamMode)
      throw new BadRequestException('Team mode is not enabled');
    opts.hideShipsFromTeammates = enabled;
    room.gameOptions = opts;
    room.updatedAt = new Date();
    await room.save();
    return this.mapper.prepareRoomSummary(room, hostId);
  }

  private async requireLobbyRoom(roomId: string, hostId: string) {
    const room = await this.gameRoomModel.findById(roomId).exec();
    if (!room) throw new NotFoundException('Room not found');
    if (room.hostId !== hostId) throw new ForbiddenException('Host only');
    if (room.status !== 'lobby') {
      throw new BadRequestException('Room is not in lobby phase');
    }
    return room;
  }
}
```

- [ ] **Step 5: Register in `games.module.ts`**

Add `SeaBattleTeamConfigService` to providers and exports.

- [ ] **Step 6: Run service tests + build**

```bash
pnpm --filter be test -- sea-battle-team-config
pnpm --filter be build
```

- [ ] **Step 7: Commit**

```bash
git add apps/be/src/games/rooms/sea-battle-team-config.service.ts \
        apps/be/src/games/rooms/sea-battle-team-config.service.spec.ts \
        apps/be/src/games/rooms/sea-battle-team-config.types.ts \
        apps/be/src/games/games.module.ts
git commit -m "feat(be): add SeaBattleTeamConfigService for lobby team management (ARC-427)"
```

---

### Task 2.3: Wire socket events in `SeaBattleGateway`

**Files:**

- Modify: `apps/be/src/games/sea-battle.gateway.ts`

- [ ] **Step 1: Add the following `@SubscribeMessage` handlers** (one per DTO). Mirror the existing handler style, including `JwtAuthGuard` (if present elsewhere in the gateway) and `extractRoomAndUser`.

Events:

- `seaBattle.lobby.set_team_mode` → `enableTeamMode` / `disableTeamMode`
- `seaBattle.lobby.set_team_config` → `setTeamConfig`
- `seaBattle.lobby.assign_team` → `assignPlayerToTeam`
- `seaBattle.lobby.add_bot_to_team` → `addBotToTeam`
- `seaBattle.lobby.remove_bot_from_team` → `removeBotFromTeam`
- `seaBattle.lobby.toggle_hide_ships` → `toggleHideShips`

Each handler emits a `seaBattle.lobby.team_config_updated` event with the new `GameRoomSummary` to the room.

- [ ] **Step 2: Widen `history_note` scope to accept `'team'`**

In the existing `handleHistoryNote`, change:

```ts
const scope = ['players', 'private'].includes(scopeRaw) ? scopeRaw : 'all';
```

to:

```ts
const scope = ['players', 'private', 'team'].includes(scopeRaw)
  ? (scopeRaw as ChatScope)
  : 'all';
```

- [ ] **Step 3: Build to verify TypeScript compiles**

```bash
pnpm --filter be build
```

- [ ] **Step 4: Commit**

```bash
git add apps/be/src/games/sea-battle.gateway.ts
git commit -m "feat(be): add team-mode lobby socket events to sea battle gateway (ARC-427)"
```

---

### Task 2.4: Pass team config into engine init + raise cap

**Files:**

- Modify: `apps/be/src/games/sea-battle/sea-battle.service.ts`

- [ ] **Step 1: Update `startSession`** to:
  1. Detect `room.gameOptions.teamMode === true`.
  2. In team mode: validate all teams full (`playerIds.length === targetSize` for every team), totals ≤ 8; reject if not. Use the snapshot of `gameOptions.teams` as the engine's `config.teams`.
  3. In FFA mode: keep cap at `MAX_PLAYERS` (6) as today.

```ts
import {
  MAX_PLAYERS,
  MAX_PLAYERS_TEAM_MODE,
} from '../engines/sea-battle/sea-battle.constants';
import type { SeaBattleGameOptions } from '../rooms/sea-battle-team-config.types';

// inside startSession, after computing playerIds:
const opts = (room.gameOptions ?? {}) as SeaBattleGameOptions;
const teamMode = !!opts.teamMode;
const cap = teamMode ? MAX_PLAYERS_TEAM_MODE : MAX_PLAYERS;

if (playerIds.length > cap) {
  throw new Error(`Too many players to start Sea Battle (maximum ${cap})`);
}

if (teamMode) {
  if (!opts.teams || opts.teams.length < 2) {
    throw new Error('Team mode requires at least 2 configured teams');
  }
  for (const t of opts.teams) {
    if (t.playerIds.length !== t.targetSize) {
      throw new Error(`Team "${t.name}" is not full`);
    }
  }
}
```

When constructing the session:

```ts
const session = await this.sessionsService.createSession({
  roomId,
  gameId: room.gameId,
  playerIds,
  config: teamMode
    ? {
        teams: opts.teams!.map((t) => ({
          id: t.id,
          name: t.name,
          color: t.color,
          playerIds: t.playerIds,
        })),
        hideShipsFromTeammates: !!opts.hideShipsFromTeammates,
      }
    : { ...room.gameOptions },
});
```

- [ ] **Step 2: Run tests + build**

```bash
pnpm --filter be test
pnpm --filter be build
```

- [ ] **Step 3: Commit**

```bash
git add apps/be/src/games/sea-battle/sea-battle.service.ts
git commit -m "feat(be): wire team config into sea battle session start (ARC-427)"
```

---

### Task 2.5: Bot service team-aware targeting (TDD)

**Files:**

- Modify: `apps/be/src/games/sea-battle/sea-battle-bot.service.ts`
- New tests in the existing bot service test file (or a sibling spec).

- [ ] **Step 1: Locate the bot's target-selection function** and add a guard that filters out players sharing a team with the bot.

- [ ] **Step 2: Write a focused test** that calls the bot for a 2v2 setup with a known sanitized state and asserts the chosen target is on the opposing team.

- [ ] **Step 3: Implement the filter**

Inside the candidate selection step:

```ts
import { getTeamForPlayer } from '../engines/sea-battle/team-rotation.utils';

// …
let candidates = state.players.filter((p) => p.alive && p.playerId !== botId);
const botTeam = getTeamForPlayer(state, botId);
if (botTeam) {
  candidates = candidates.filter(
    (p) => !botTeam.playerIds.includes(p.playerId),
  );
}
```

- [ ] **Step 4: Run tests**

```bash
pnpm --filter be test -- sea-battle
```

- [ ] **Step 5: Commit**

```bash
git add apps/be/src/games/sea-battle/sea-battle-bot.service.ts
git commit -m "feat(be): make sea battle bot team-aware (ARC-427)"
```

---

## Phase 3 — Web (lobby + game UI)

All Phase 3 work is in `apps/web/`. Run unit tests with `pnpm --filter web test`.

### Task 3.1: i18n keys

**Files:**

- Modify: each locale file under `apps/web/src/app/i18n/locales/` for `en`, `ru`, `es`, `fr`, `by` (5 files).

- [ ] **Step 1:** Add a `seaBattle.teamMode` namespace with keys for: `enableLabel`, `disableLabel`, `addTeam`, `removeTeam`, `teamNameLabel`, `teamColorLabel`, `slotCountLabel`, `hideShipsLabel`, `joinTeam`, `leaveTeam`, `addBot`, `removeBot`, `unassigned`, `errorRoomFull`, `errorTeamFull`, `errorMinTeams`, `errorMinSize`, `chatChannelTeam`, `chatChannelAll`, `eliminatedSpectatorBanner`.

- [ ] **Step 2:** Run translation check using the canonical project command. Find it first:

```bash
grep -n "translation" package.json | head
cat .husky/pre-commit 2>/dev/null
```

Then run that command (the repo's pre-commit currently runs `🔍 Running translation validation` — confirm the package.json `scripts` entry that invokes it).

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/i18n/locales/
git commit -m "feat(web): add i18n keys for sea battle team mode (ARC-427)"
```

---

### Task 3.2: Run `/check-ui-components`

- [ ] **Step 1:** Invoke `/check-ui-components` to audit `@arcadeum/ui` for: Switch, Stepper, Card, Avatar, Badge, ColorPicker.

- [ ] **Step 2:** Note the results in the plan execution log. If any component is missing AND non-trivial, follow the new-ui-component skill before continuing. Otherwise proceed.

No commit for this task on its own.

---

### Task 3.3: `TeamModeToggle` component

**Files:**

- Create: `apps/web/src/features/games/sea-battle/lobby/TeamModeToggle.tsx`
- Create: `apps/web/src/features/games/sea-battle/lobby/team-mode.types.ts`
- Create: `apps/web/src/features/games/sea-battle/lobby/team-mode.api.ts`

- [ ] **Step 1:** Define `SeaBattleTeam`, `SeaBattleGameOptions` types in `team-mode.types.ts` (mirroring backend types but client-side).

- [ ] **Step 2:** Implement `team-mode.api.ts` with helpers wrapping the socket events: `emitSetTeamMode(roomId, enabled)`, `emitSetTeamConfig(...)`, `emitAssignTeam(...)`, etc., using `@/shared/lib/socket`.

- [ ] **Step 3:** Implement `TeamModeToggle` as a `'use client'` component (uses Tamagui `Switch`). Visible only when `currentUserId === room.hostId` and `room.status === 'lobby'`. Calls `emitSetTeamMode` on change.

- [ ] **Step 4:** Build the web app:

```bash
pnpm --filter web build
```

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/features/games/sea-battle/lobby/TeamModeToggle.tsx \
        apps/web/src/features/games/sea-battle/lobby/team-mode.types.ts \
        apps/web/src/features/games/sea-battle/lobby/team-mode.api.ts
git commit -m "feat(web): add team mode toggle for sea battle lobby (ARC-427)"
```

---

### Task 3.4: `TeamSetupPanel` component (TDD)

**Files:**

- Create: `apps/web/src/features/games/sea-battle/lobby/TeamSetupPanel.tsx`
- Create: `apps/web/src/features/games/sea-battle/lobby/__tests__/TeamSetupPanel.test.tsx`

- [ ] **Step 1: Write Vitest tests** asserting:

  - Renders nothing for non-host.
  - Host can add a team up to 4 (button disabled at 4).
  - Host can remove a team down to 2 (button disabled at 2).
  - Slot stepper enforces min 2.
  - Hide-ships switch reflects `gameOptions.hideShipsFromTeammates`.
  - Validation banner appears when total > 8.

- [ ] **Step 2: Run failing tests** to confirm they fail (component doesn't exist yet).

- [ ] **Step 3: Implement** the component using `@arcadeum/ui` primitives. State changes call `emitSetTeamConfig`.

- [ ] **Step 4: Run tests + build**

```bash
pnpm --filter web test -- TeamSetupPanel
pnpm --filter web build
```

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/features/games/sea-battle/lobby/TeamSetupPanel.tsx \
        apps/web/src/features/games/sea-battle/lobby/__tests__/TeamSetupPanel.test.tsx
git commit -m "feat(web): add TeamSetupPanel for sea battle lobby (ARC-427)"
```

---

### Task 3.5: `TeamSlotsBoard` + `UnassignedPool` components (TDD)

**Files:**

- Create: `apps/web/src/features/games/sea-battle/lobby/TeamSlotsBoard.tsx`
- Create: `apps/web/src/features/games/sea-battle/lobby/UnassignedPool.tsx`
- Create: `apps/web/src/features/games/sea-battle/lobby/__tests__/TeamSlotsBoard.test.tsx`

- [ ] **Step 1: Write Vitest tests** asserting:

  - Each team renders `targetSize` slots; filled slots show avatar/name; empty slots show "Join" button (for non-self only) or are clickable (for self).
  - Clicking an empty slot as a non-host emits `assign_team` with `userId === currentUserId`.
  - Host can click any filled slot → menu → "Move to team Y" emits `assign_team` for that user.
  - Host can click "Add bot" on an empty-slot team → emits `add_bot_to_team`.
  - Host can click "✕" on a bot row → emits `remove_bot_from_team`.

- [ ] **Step 2: Run failing tests.**

- [ ] **Step 3: Implement** components. `UnassignedPool` shows participants not on any team. Style with team color stripes from `team.color`.

- [ ] **Step 4: Run tests + build**

```bash
pnpm --filter web test -- TeamSlotsBoard
pnpm --filter web build
```

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/features/games/sea-battle/lobby/TeamSlotsBoard.tsx \
        apps/web/src/features/games/sea-battle/lobby/UnassignedPool.tsx \
        apps/web/src/features/games/sea-battle/lobby/__tests__/TeamSlotsBoard.test.tsx
git commit -m "feat(web): add team slot board and unassigned pool (ARC-427)"
```

---

### Task 3.6: Mount lobby team UI in the Sea Battle lobby view

**Files:**

- Modify: the existing Sea Battle lobby/widget files in `apps/web/src/features/games/sea-battle/` and/or `apps/web/src/widgets/SeaBattleGame/` (locate the active lobby-rendering component first by grepping for `seaBattle.session.start`).

- [ ] **Step 1:** Locate the existing lobby rendering. Insert `TeamModeToggle` near the existing host-only options. When `gameOptions.teamMode === true`, render `TeamSetupPanel` (host-only) and `TeamSlotsBoard` + `UnassignedPool` (everyone).

- [ ] **Step 2:** Disable the existing "Start game" button when `teamMode && !allTeamsFull`.

- [ ] **Step 3:** Subscribe to `seaBattle.lobby.team_config_updated` in the existing room socket subscription and update the room state via TanStack Query cache invalidation or Zustand store, whichever the lobby already uses.

- [ ] **Step 4: Build + visual smoke test**

```bash
pnpm --filter web build
pnpm --filter web dev
```

Open a Sea Battle room as host, toggle team mode on, configure 4v4, have another browser tab join, switch teams, and verify the start button enables when slots are full. Document any issues.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/features/games/sea-battle/ apps/web/src/widgets/SeaBattleGame/
git commit -m "feat(web): mount team-mode UI in sea battle lobby (ARC-427)"
```

---

### Task 3.7: Game UI — roster grouping, teammate boards, current shooter

**Files:**

- Modify: the existing in-game widget files (`apps/web/src/widgets/SeaBattleGame/`).

- [ ] **Step 1:** When `state.teams` is present, group the player roster by team using each team's color. Highlight the active team and pulse the active shooter's avatar.

- [ ] **Step 2:** For teammate boards, render the same board UI used for "self" with a "Teammate" badge. Disable cell click (greyed cursor + tooltip).

- [ ] **Step 3:** For enemy boards, render as today.

- [ ] **Step 4:** Render an "Eliminated" banner for the viewer when `players[viewer].alive === false`. The banner uses the new `eliminatedSpectatorBanner` i18n key. Verify the existing socket subscription stays open after `alive === false` — eliminated players must continue to receive `seaBattle.session.*` updates so they can spectate. If the current code disconnects on death, fix that here.

- [ ] **Step 5: Visual smoke test** with two browser tabs in a 2v2 setup.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/widgets/SeaBattleGame/
git commit -m "feat(web): show team rosters and teammate boards in sea battle (ARC-427)"
```

---

### Task 3.8: Chat channel switcher (Team / All / DM)

**Files:**

- Modify: chat widget within `apps/web/src/widgets/SeaBattleGame/` (or wherever the existing in-game chat lives — locate via grep for `seaBattle.session.history_note`).

- [ ] **Step 1:** Add a channel selector with three options: Team, All, DM. Default to Team when team mode is active. Persist the choice in component state (no need to persist across reloads).

- [ ] **Step 2:** When the user sends a message, include `scope: 'team' | 'all' | 'private'` in the emit payload.

- [ ] **Step 3:** Render incoming logs filtered by their scope (the engine's sanitization already filters team-scoped messages server-side, so the client only needs to render whatever it receives — but tag team messages visually with the team color).

- [ ] **Step 4: Visual smoke test:** verify Team messages from one team are not received by the other.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/widgets/SeaBattleGame/
git commit -m "feat(web): add team chat channel switcher in sea battle (ARC-427)"
```

---

## Phase 4 — End-to-end & verification

### Task 4.1: Playwright e2e — 4v4 happy path

**Files:**

- Create: `apps/web/tests/e2e/sea-battle-team-mode.spec.ts`

**Risk:** mocking 8 simultaneous logged-in users is non-trivial. If the existing test fixture / harness in `apps/web/tests/e2e/` doesn't support 8 concurrent contexts, fall back to a 2v2 e2e and supplement with backend integration tests for 4v4 turn rotation. Check existing e2e for max concurrent contexts before writing this test.

- [ ] **Step 1:** Write a Playwright test that:

  1. Logs in as 8 mocked users (or uses the existing test-user fixture if present).
  2. Host creates a Sea Battle room, enables team mode, configures 4v4.
  3. 7 other users join the room and pick teams (4 in each).
  4. Host starts the game.
  5. Each player auto-places ships and confirms.
  6. Players take turns attacking. Verify the active-shooter indicator follows the spec rotation.
  7. Verify a player cannot select a teammate as a target.
  8. Drive enough attacks to eliminate one team and assert the "Team X wins!" screen.

- [ ] **Step 2:** Run:

```bash
pnpm --filter web exec playwright test tests/e2e/sea-battle-team-mode.spec.ts
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/tests/e2e/sea-battle-team-mode.spec.ts
git commit -m "test(web): add 4v4 sea battle team mode e2e (ARC-427)"
```

---

### Task 4.2: Playwright e2e — 2v6 + bots + team chat

**Files:**

- Modify: `apps/web/tests/e2e/sea-battle-team-mode.spec.ts` (or a sibling file).

- [ ] **Step 1:** Add tests for:

  - Host configures 2v6, fills team A with 2 humans, adds 6 bots to team B; game starts; runs to completion via bot moves.
  - Host enables hide-ships toggle; teammate ships are not rendered for the viewer.
  - Team chat: a message from team A user is visible to teammate, not to team B.

- [ ] **Step 2:** Run all e2e tests:

```bash
pnpm --filter web exec playwright test
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/tests/e2e/
git commit -m "test(web): add 2v6+bots, hide-ships, and team-chat e2e (ARC-427)"
```

---

### Task 4.3: Final verification

- [ ] **Step 1:** Run the full repo build:

```bash
pnpm build
```

- [ ] **Step 2:** Run all tests:

```bash
pnpm test
```

- [ ] **Step 3:** Run the file-length check:

```bash
pnpm check-file-length
```

If any file exceeds 500 lines, split it before continuing.

- [ ] **Step 4:** Manually smoke-test a 4v4 game in the browser:

  - Lobby team setup (host).
  - Players self-pick.
  - Game starts, ships placed, attacks fire, win condition triggers.
  - Hide-ships toggle.
  - Team chat.

- [ ] **Step 5:** Skill: `/verification-before-completion` to confirm all checks pass.

No commit unless cleanup needed.

---

## Stopping point

**Stop here.** Do not open a PR. The working branch is `ARC-427` with all commits ready for review. Surface a summary of what was completed and any deferred items to the user.
