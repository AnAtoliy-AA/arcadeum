# Tic-Tac-Toe Full Game Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the local hot-seat Tic-Tac-Toe at `/games/tic-tac-toe` with a full multiplayer game matching the sea-battle / glimworm / critical pattern — landing page, BE engine + service + gateway + bot, web widget with lobby and theme variants and 3×3/5×5/7×7/9×9 boards, optional teams, chat integration, i18n across 5 locales, tests.

**Architecture:** Backend `TicTacToeEngine` (implements `IGameEngine`) is registered in `GameEnginesModule`; `TicTacToeService` orchestrates sessions, `TicTacToeBotService` fills empty slots, `TicTacToeGateway` exposes Socket.IO events. Web widget at `@/widgets/TicTacToeGame` is loaded by `/games/[id]` via `gameLoaders.tic_tac_toe_v1`. The landing at `/games/tic-tac-toe` is a Server Component modeled on `SeaBattleLanding`.

**Tech Stack:** NestJS + Socket.IO (BE), Next.js App Router + Tamagui + Zustand (web), Jest (BE), Vitest (web), Playwright (e2e). Branch: `ARC-750-tic-tac-toe`. Single PR.

**Reference spec:** [docs/superpowers/specs/2026-05-26-tic-tac-toe-full-game-design.md](../specs/2026-05-26-tic-tac-toe-full-game-design.md)

**Reference implementations to mirror line-by-line:**

- BE engine: [apps/be/src/games/engines/sea-battle/](../../../apps/be/src/games/engines/sea-battle/)
- BE service: [apps/be/src/games/sea-battle/sea-battle.service.ts](../../../apps/be/src/games/sea-battle/sea-battle.service.ts)
- BE gateway: [apps/be/src/games/sea-battle.gateway.ts](../../../apps/be/src/games/sea-battle.gateway.ts)
- Web widget: [apps/web/src/widgets/SeaBattleGame/](../../../apps/web/src/widgets/SeaBattleGame/)
- Landing: [apps/web/src/app/[locale]/games/sea-battle/](../../../apps/web/src/app/[locale]/games/sea-battle/)

---

## Task 1: BE engine — constants + types

**Files:**

- Create: `apps/be/src/games/engines/tic-tac-toe/tic-tac-toe.constants.ts`
- Create: `apps/be/src/games/engines/tic-tac-toe/tic-tac-toe.types.ts`

- [ ] **Step 1.1: Write constants**

Create `apps/be/src/games/engines/tic-tac-toe/tic-tac-toe.constants.ts`:

```ts
export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 4;

export const BOARD_SIZES = [3, 5, 7, 9] as const;
export type BoardSize = (typeof BOARD_SIZES)[number];

export const WIN_LENGTH: Record<BoardSize, 3 | 4 | 5> = {
  3: 3,
  5: 4,
  7: 5,
  9: 5,
};

export const VARIANTS = [
  'classic',
  'neon',
  'paper',
  'pixel',
  'chalkboard',
  'retro',
] as const;
export type Variant = (typeof VARIANTS)[number];

export const GAME_PHASE = {
  LOBBY: 'lobby',
  PLAYING: 'playing',
  GAME_OVER: 'game_over',
} as const;
export type GamePhase = (typeof GAME_PHASE)[keyof typeof GAME_PHASE];

export const PLAYER_SYMBOLS = ['X', 'O', '△', '□'] as const;
export const TEAM_COLORS = ['#ef4444', '#3b82f6'] as const;
```

- [ ] **Step 1.2: Write engine types**

Create `apps/be/src/games/engines/tic-tac-toe/tic-tac-toe.types.ts`:

```ts
import type {
  BaseGameState,
  GamePlayerState,
} from '../base/game-engine.interface';
import type { BoardSize, GamePhase, Variant } from './tic-tac-toe.constants';

export interface TicTacToeOptions {
  variant: Variant;
  boardSize: BoardSize;
  teamMode: boolean;
}

export type CellValue = string | null;

export interface TicTacToePlayer extends GamePlayerState {
  playerId: string;
  symbol: string;
  alive: boolean;
  teamId?: string;
}

export interface TicTacToeTeam {
  id: string;
  name: string;
  color: string;
  playerIds: string[];
  currentShooterIndex: number;
}

export interface WinLineCell {
  row: number;
  col: number;
}

export interface TicTacToeState extends BaseGameState {
  phase: GamePhase;
  options: TicTacToeOptions;
  board: CellValue[][];
  winLength: 3 | 4 | 5;
  playerOrder: string[]; // player ids OR team ids when teamMode
  currentTurnIndex: number;
  players: TicTacToePlayer[];
  teams: TicTacToeTeam[];
  winLine: WinLineCell[] | null;
  winnerId: string | null;
  isDraw: boolean;
}

export interface PlaceMarkPayload {
  row: number;
  col: number;
}
```

- [ ] **Step 1.3: Commit**

```bash
git add apps/be/src/games/engines/tic-tac-toe/tic-tac-toe.constants.ts \
        apps/be/src/games/engines/tic-tac-toe/tic-tac-toe.types.ts
git commit -m "feat(games): tic-tac-toe engine constants and types (ARC-750)"
```

---

## Task 2: BE engine — utils + validators (TDD)

**Files:**

- Create: `apps/be/src/games/engines/tic-tac-toe/tic-tac-toe.utils.ts`
- Create: `apps/be/src/games/engines/tic-tac-toe/tic-tac-toe.utils.spec.ts`
- Create: `apps/be/src/games/engines/tic-tac-toe/tic-tac-toe.validators.ts`

- [ ] **Step 2.1: Write failing utils tests**

Create `tic-tac-toe.utils.spec.ts` covering: `createEmptyBoard(n)` shape; `findWinningLine(board, n, winLength, owner)` returns horizontal/vertical/both-diagonal lines or null; `isBoardFull`; `nextTurnIndex(currentIndex, playerOrder, getIsAlive)` skips dead entries.

- [ ] **Step 2.2: Run tests — expect failure**

```bash
pnpm --filter @arcadeum/be test -- tic-tac-toe.utils.spec
```

Expected: tests fail (utils not implemented).

- [ ] **Step 2.3: Implement utils**

Create `tic-tac-toe.utils.ts` exporting `createEmptyBoard`, `findWinningLine` (scan all 4 directions starting from each cell that contains `owner`), `isBoardFull`, `nextTurnIndex`.

- [ ] **Step 2.4: Run tests — expect pass**

```bash
pnpm --filter @arcadeum/be test -- tic-tac-toe.utils.spec
```

- [ ] **Step 2.5: Write validators**

Create `tic-tac-toe.validators.ts` exporting `validatePlaceMark(state, payload, userId)` — checks phase is `'playing'`, cell is in-bounds and empty, user is the current turn-holder (or member of current team when `teamMode`).

- [ ] **Step 2.6: Commit**

```bash
git add apps/be/src/games/engines/tic-tac-toe/tic-tac-toe.utils.ts \
        apps/be/src/games/engines/tic-tac-toe/tic-tac-toe.utils.spec.ts \
        apps/be/src/games/engines/tic-tac-toe/tic-tac-toe.validators.ts
git commit -m "feat(games): tic-tac-toe utils and validators (ARC-750)"
```

---

## Task 3: BE engine — main engine class (TDD)

**Files:**

- Create: `apps/be/src/games/engines/tic-tac-toe/tic-tac-toe.engine.ts`
- Create: `apps/be/src/games/engines/tic-tac-toe/tic-tac-toe.engine.spec.ts`

- [ ] **Step 3.1: Write failing engine spec**

Cases (mirror style of [sea-battle.engine.team.spec.ts](../../../apps/be/src/games/engines/sea-battle/sea-battle.engine.team.spec.ts)):

- `initializeState` produces correct board dims + winLength for each `boardSize`.
- 3×3 horizontal/vertical/diagonal wins set `winnerId`, `winLine`, phase `game_over`.
- 5×5 with 4-in-row wins.
- Full 3×3 board with no winner → `isDraw=true`.
- Team mode: 2v2 with two players per team, turn rotates team→team and shooter inside team.
- Out-of-turn place_mark rejected.
- Place_mark on occupied cell rejected.

- [ ] **Step 3.2: Run — expect failures**

```bash
pnpm --filter @arcadeum/be test -- tic-tac-toe.engine.spec
```

- [ ] **Step 3.3: Implement engine**

Create `tic-tac-toe.engine.ts` extending `BaseGameEngine<TicTacToeState>`. Pattern from [sea-battle.engine.ts](../../../apps/be/src/games/engines/sea-battle/sea-battle.engine.ts):

- `getMetadata()` returns `{ gameId: 'tic_tac_toe_v1', name: 'Tic-Tac-Toe', minPlayers: 2, maxPlayers: 4, version: '1.0.0', category: 'Board Game' }`.
- `initializeState(playerIds, config)` reads `config.options` (with safe defaults), assigns symbols (or teams), builds empty board, sets `currentTurnIndex=0`, emits `system` log entry.
- `validateAction(state, action, ctx, payload)` routes by action name.
- `executeAction` handles `'place_mark'` → uses `validatePlaceMark`, writes owner into cell, runs `findWinningLine` for owner, if hit → set `winnerId`/`winLine`/phase `game_over`. Else `isBoardFull` → `isDraw=true`/phase `game_over`. Else advance turn (team-aware).
- `executeAction` handles `'forfeit'` → marks player dead, advances turn, if only one side left → declare winner.
- `isGameOver` = `phase === 'game_over'`.
- `getWinners` = `winnerId ? [winnerId] : []` (for teams returns team id — consumers translate).
- `sanitizeStateForPlayer` — return state as-is (tic-tac-toe has no hidden info).
- `getAvailableActions(state, playerId)` returns `['place_mark', 'forfeit']` when it's their turn, `['forfeit']` otherwise.

- [ ] **Step 3.4: Run — expect pass**

```bash
pnpm --filter @arcadeum/be test -- tic-tac-toe.engine.spec
```

- [ ] **Step 3.5: Commit**

```bash
git add apps/be/src/games/engines/tic-tac-toe/tic-tac-toe.engine.ts \
        apps/be/src/games/engines/tic-tac-toe/tic-tac-toe.engine.spec.ts
git commit -m "feat(games): tic-tac-toe engine class with team support (ARC-750)"
```

---

## Task 4: Register engine in `GameEnginesModule`

**Files:**

- Modify: `apps/be/src/games/engines/engines.module.ts`
- Modify: `apps/be/src/games/engines/index.ts` (if it re-exports engines)

- [ ] **Step 4.1: Add provider + onModuleInit registration**

In [engines.module.ts](../../../apps/be/src/games/engines/engines.module.ts) add `import { TicTacToeEngine } from './tic-tac-toe/tic-tac-toe.engine';`, add to providers array, inject in constructor, register in `onModuleInit`.

- [ ] **Step 4.2: Verify**

```bash
pnpm --filter @arcadeum/be build
```

Expect compile success.

- [ ] **Step 4.3: Commit**

```bash
git add apps/be/src/games/engines/engines.module.ts
git commit -m "feat(games): register TicTacToeEngine in engines module (ARC-750)"
```

---

## Task 5: BE bot service (TDD)

**Files:**

- Create: `apps/be/src/games/tic-tac-toe/tic-tac-toe-bot.service.ts`
- Create: `apps/be/src/games/tic-tac-toe/tic-tac-toe-bot.service.spec.ts`

- [ ] **Step 5.1: Write failing bot spec**

Cases (mirror [sea-battle-bot.service](../../../apps/be/src/games/sea-battle/sea-battle-bot.service.ts) where applicable):

- `pickMove` on 3×3 — given a state with two-in-row for opponent, bot blocks the winning cell.
- `pickMove` on 3×3 — given a state with own two-in-row, bot completes.
- `pickMove` on 3×3 minimax — bot never loses across 100 deterministic openings (golden test asserts result ∈ {win, draw}).
- `pickMove` on 5×5 — given opponent has 3-in-row of length 3 with both ends open, bot blocks one end.
- `pickMove` on 9×9 — bot returns some empty cell (smoke).
- `spawnBot(roomId)` creates a bot user (mock dependency), adds to room.

- [ ] **Step 5.2: Run — expect failure**

```bash
pnpm --filter @arcadeum/be test -- tic-tac-toe-bot.service.spec
```

- [ ] **Step 5.3: Implement**

Create service with `pickMove(state)` dispatching by `state.options.boardSize` to `minimax3x3`, `heuristic5x5`, `random`. `spawnBot` mirrors sea-battle pattern (uses `GameRoomsService` + auth bot factory).

- [ ] **Step 5.4: Run — expect pass**

- [ ] **Step 5.5: Commit**

```bash
git add apps/be/src/games/tic-tac-toe/tic-tac-toe-bot.service.ts \
        apps/be/src/games/tic-tac-toe/tic-tac-toe-bot.service.spec.ts
git commit -m "feat(games): tic-tac-toe bot service with minimax/heuristic/random (ARC-750)"
```

---

## Task 6: BE tic-tac-toe service

**Files:**

- Create: `apps/be/src/games/tic-tac-toe/tic-tac-toe.service.ts`

- [ ] **Step 6.1: Mirror sea-battle service**

Read [apps/be/src/games/sea-battle/sea-battle.service.ts](../../../apps/be/src/games/sea-battle/sea-battle.service.ts) in full. Create `TicTacToeService` with the same construction pattern (constructor injects `GameRoomsService`, `GameSessionsService`, `GameHistoryService`, `GamesRealtimeService`, `TicTacToeBotService`, `TicTacToeEngine`).

Public methods:

- `startSession(userId, roomId, withBots?, botCount?)` — load room, validate host, build options from `room.options`, fill bots if requested, init state, persist session, emit `ticTacToe.session.started`.
- `placeMark(userId, roomId, sessionId, payload)` — load session, call `engine.executeAction('place_mark', ctx, payload)`, persist, emit `ticTacToe.session.updated`. If `engine.isGameOver(state)` → finalize via `GameHistoryService`. Else if next turn is a bot, schedule `setImmediate(() => this.takeBotTurn(sessionId))`.
- `forfeit(userId, sessionId)` — same shape.
- `takeBotTurn(sessionId)` — load state, get current player, if bot call `botService.pickMove(state)` and invoke `placeMark` internally.

- [ ] **Step 6.2: Verify compile**

```bash
pnpm --filter @arcadeum/be build
```

- [ ] **Step 6.3: Commit**

```bash
git add apps/be/src/games/tic-tac-toe/tic-tac-toe.service.ts
git commit -m "feat(games): tic-tac-toe orchestration service (ARC-750)"
```

---

## Task 7: BE gateway

**Files:**

- Create: `apps/be/src/games/tic-tac-toe.gateway.ts`

- [ ] **Step 7.1: Mirror sea-battle gateway**

Read [apps/be/src/games/sea-battle.gateway.ts](../../../apps/be/src/games/sea-battle.gateway.ts). Create `TicTacToeGateway` with subscribe handlers:

- `'ticTacToe.session.start'` → `service.startSession`
- `'ticTacToe.session.place_mark'` → `service.placeMark`
- `'ticTacToe.session.forfeit'` → `service.forfeit`

Same auth/cors decorators, namespace `'games'`, `extractRoomAndUser` + `handleError` helpers, `maybeEncrypt` for emits.

- [ ] **Step 7.2: Verify compile**

```bash
pnpm --filter @arcadeum/be build
```

- [ ] **Step 7.3: Commit**

```bash
git add apps/be/src/games/tic-tac-toe.gateway.ts
git commit -m "feat(games): tic-tac-toe socket gateway (ARC-750)"
```

---

## Task 8: Wire service + bot + gateway into `GamesModule`

**Files:**

- Modify: `apps/be/src/games/games.module.ts`

- [ ] **Step 8.1: Add imports and providers**

In [games.module.ts](../../../apps/be/src/games/games.module.ts):

- import `TicTacToeService`, `TicTacToeBotService`, `TicTacToeGateway`
- add the two services to `providers`
- add the gateway to `providers` (gateways are providers, not controllers, in this codebase — confirm by inspecting where `SeaBattleGateway` is registered)

- [ ] **Step 8.2: Build + check rooms options support**

```bash
pnpm --filter @arcadeum/be build
```

Inspect [game-rooms.service.ts](../../../apps/be/src/games/rooms/game-rooms.service.ts) for how `updateRoomOption` handles arbitrary keys — confirm `boardSize`, `teamMode` will be persisted without additional schema changes (the `options` field is typically `Mixed` Mongoose type).

- [ ] **Step 8.3: Add tic-tac-toe defaults to quickplay**

In [game-rooms.quickplay.service.ts](../../../apps/be/src/games/rooms/game-rooms.quickplay.service.ts) add a default options block for `tic_tac_toe_v1` (`{ variant: 'classic', boardSize: 3, teamMode: false }`) following whatever pattern other games use.

- [ ] **Step 8.4: Commit**

```bash
git add apps/be/src/games/games.module.ts \
        apps/be/src/games/rooms/game-rooms.quickplay.service.ts
git commit -m "feat(games): wire tic-tac-toe service, bot, gateway into module (ARC-750)"
```

---

## Task 9: Web widget — types + constants + theme context

**Files:**

- Create: `apps/web/src/widgets/TicTacToeGame/types/index.ts`
- Create: `apps/web/src/widgets/TicTacToeGame/lib/constants.ts`
- Create: `apps/web/src/widgets/TicTacToeGame/lib/theme.ts`
- Create: `apps/web/src/widgets/TicTacToeGame/lib/TicTacToeThemeContext.tsx`

- [ ] **Step 9.1: Types**

`types/index.ts` exports `TicTacToeGameProps extends BaseGameWidgetProps` (mirror [SeaBattleGame/types](../../../apps/web/src/widgets/SeaBattleGame/types/index.ts)), `MIN_PLAYERS=2`, `MAX_PLAYERS=4`, `BoardSize`, `Variant`, `TicTacToeOptions`, `CellValue`.

- [ ] **Step 9.2: Constants**

`lib/constants.ts` — `TIC_TAC_TOE_VARIANTS: GameVariantOption[]` for the six themes (id, name i18n key, description i18n key, emoji, gradient, lightGradient). Use same shape as [sea-battle/lib/constants.ts](../../../apps/web/src/widgets/SeaBattleGame/lib/constants.ts).

- [ ] **Step 9.3: Theme tokens**

`lib/theme.ts` — `TIC_TAC_TOE_THEMES: Record<Variant, { xColor: string; oColor: string; gridLine: string; markFont: string; cellBg: string; cellHoverBg: string; }>`.

- [ ] **Step 9.4: Context**

`lib/TicTacToeThemeContext.tsx` — `TicTacToeThemeProvider` + `useTicTacToeTheme()` returning tokens for current variant. Pattern from [SeaBattleThemeContext.tsx](../../../apps/web/src/widgets/SeaBattleGame/lib/SeaBattleThemeContext.tsx).

- [ ] **Step 9.5: Commit**

```bash
git add apps/web/src/widgets/TicTacToeGame/types apps/web/src/widgets/TicTacToeGame/lib
git commit -m "feat(games): tic-tac-toe widget types, constants, theme context (ARC-750)"
```

---

## Task 10: Web widget — hooks

**Files:**

- Create: `apps/web/src/widgets/TicTacToeGame/hooks/index.ts`
- Create: `apps/web/src/widgets/TicTacToeGame/hooks/useTicTacToeState.ts`
- Create: `apps/web/src/widgets/TicTacToeGame/hooks/useTicTacToeActions.ts`

- [ ] **Step 10.1: State hook**

`useTicTacToeState.ts` — selects `session.state` from `useGameStore`, derives `phase`, `board`, `currentPlayerId`, `myTurn` (vs `currentUserId`), `winnerId`, `winLine`, `isDraw`.

- [ ] **Step 10.2: Actions hook**

`useTicTacToeActions.ts` — exposes `startSession({ withBots, botCount })`, `placeMark(row, col)`, `forfeit()`. Uses the same socket emitter pattern as [useSeaBattleActions.ts](../../../apps/web/src/widgets/SeaBattleGame/hooks/useSeaBattleActions.ts) (events `ticTacToe.session.start`, `ticTacToe.session.place_mark`, `ticTacToe.session.forfeit`).

- [ ] **Step 10.3: Barrel + commit**

```bash
git add apps/web/src/widgets/TicTacToeGame/hooks
git commit -m "feat(games): tic-tac-toe widget hooks (ARC-750)"
```

---

## Task 11: Web widget — Board component + test

**Files:**

- Create: `apps/web/src/widgets/TicTacToeGame/ui/TicTacToeBoard.tsx`
- Create: `apps/web/src/widgets/TicTacToeGame/ui/TicTacToeBoard.test.tsx`
- Create: `apps/web/src/widgets/TicTacToeGame/ui/styles/animations.css`

- [ ] **Step 11.1: Failing test**

`TicTacToeBoard.test.tsx`: render a 3×3 board with empty state + an `onCellClick` mock; assert clicking cell (0,0) calls mock with `(0,0)`. Render again with a winning state — assert cells in `winLine` have class `winning`.

- [ ] **Step 11.2: Run — fail**

```bash
pnpm --filter @arcadeum/web test -- TicTacToeBoard
```

- [ ] **Step 11.3: Implement**

`TicTacToeBoard.tsx`: takes `board`, `winLine`, `disabled`, `onCellClick`. CSS Grid with `gridTemplateColumns: repeat(N, 1fr)`. Each cell is a `button` that renders the player's symbol/color via `useTicTacToeTheme`. Winning cells animate (class `winning` from `animations.css`).

- [ ] **Step 11.4: Run — pass**

- [ ] **Step 11.5: Commit**

```bash
git add apps/web/src/widgets/TicTacToeGame/ui/TicTacToeBoard.tsx \
        apps/web/src/widgets/TicTacToeGame/ui/TicTacToeBoard.test.tsx \
        apps/web/src/widgets/TicTacToeGame/ui/styles/animations.css
git commit -m "feat(games): tic-tac-toe board component (ARC-750)"
```

---

## Task 12: Web widget — VariantSelector + BoardSizeSelector + TeamPanel

**Files:**

- Create: `apps/web/src/widgets/TicTacToeGame/ui/VariantSelector.tsx`
- Create: `apps/web/src/widgets/TicTacToeGame/ui/BoardSizeSelector.tsx`
- Create: `apps/web/src/widgets/TicTacToeGame/ui/BoardSizeSelector.test.tsx`
- Create: `apps/web/src/widgets/TicTacToeGame/ui/TicTacToeTeamPanel.tsx`

- [ ] **Step 12.1: VariantSelector**

Mirror [SeaBattleGame VariantSelector](../../../apps/web/src/widgets/SeaBattleGame/ui/VariantSelector.tsx) verbatim, swapping `SEA_BATTLE_VARIANTS` → `TIC_TAC_TOE_VARIANTS`.

- [ ] **Step 12.2: BoardSizeSelector failing test**

`BoardSizeSelector.test.tsx`: render with `currentSize=3`, click size `5`, assert `gamesApi.updateRoomOption(roomId, 'boardSize', 5)` invoked (mocked).

- [ ] **Step 12.3: BoardSizeSelector implementation**

Four radio cards (3×3 / 5×5 / 7×7 / 9×9). Disabled when `disabled` prop true. Uses `useMutation` from `@/shared/hooks/useMutation` + `gamesApi.updateRoomOption` (same pattern as `GameVariantSelector`).

- [ ] **Step 12.4: TeamPanel**

`TicTacToeTeamPanel.tsx` modeled on [SeaBattleTeamPanel.tsx](../../../apps/web/src/widgets/SeaBattleGame/ui/SeaBattleTeamPanel.tsx). Two-team layout, drag-or-click player into team, calls `gamesApi.updateRoomOption(roomId, 'teamConfig', ...)` (or whatever sea-battle uses — match exactly).

- [ ] **Step 12.5: Run BoardSizeSelector test, commit**

```bash
pnpm --filter @arcadeum/web test -- BoardSizeSelector
git add apps/web/src/widgets/TicTacToeGame/ui/VariantSelector.tsx \
        apps/web/src/widgets/TicTacToeGame/ui/BoardSizeSelector.tsx \
        apps/web/src/widgets/TicTacToeGame/ui/BoardSizeSelector.test.tsx \
        apps/web/src/widgets/TicTacToeGame/ui/TicTacToeTeamPanel.tsx
git commit -m "feat(games): tic-tac-toe lobby selectors and team panel (ARC-750)"
```

---

## Task 13: Web widget — Modals + RulesModal + ScoreBoard + TurnBadge

**Files:**

- Create: `apps/web/src/widgets/TicTacToeGame/ui/TicTacToeModals.tsx`
- Create: `apps/web/src/widgets/TicTacToeGame/ui/RulesModal.tsx`
- Create: `apps/web/src/widgets/TicTacToeGame/ui/ScoreBoard.tsx`
- Create: `apps/web/src/widgets/TicTacToeGame/ui/TurnBadge.tsx`

- [ ] **Step 13.1: Modals**

`TicTacToeModals.tsx`: game-over result modal (won/lost/draw), kick-confirm, leave-confirm. Match shape of [SeaBattleModals.tsx](../../../apps/web/src/widgets/SeaBattleGame/ui/SeaBattleModals.tsx).

- [ ] **Step 13.2: RulesModal**

Translation key `games.tic_tac_toe_v1.rules.{title,objective,steps,winLengths}`. Auto-opens on lobby entry per sea-battle pattern.

- [ ] **Step 13.3: ScoreBoard + TurnBadge**

`ScoreBoard.tsx` shows running tally across rematches. `TurnBadge.tsx` shows "{name}'s turn" or "{team}'s turn — {currentShooter}". Mirror look of [TurnBadge from sea-battle](../../../apps/web/src/widgets/SeaBattleGame/ui/TurnBadge.tsx).

- [ ] **Step 13.4: Commit**

```bash
git add apps/web/src/widgets/TicTacToeGame/ui/TicTacToeModals.tsx \
        apps/web/src/widgets/TicTacToeGame/ui/RulesModal.tsx \
        apps/web/src/widgets/TicTacToeGame/ui/ScoreBoard.tsx \
        apps/web/src/widgets/TicTacToeGame/ui/TurnBadge.tsx
git commit -m "feat(games): tic-tac-toe modals, rules, score, turn badge (ARC-750)"
```

---

## Task 14: Web widget — Lobby

**Files:**

- Create: `apps/web/src/widgets/TicTacToeGame/ui/TicTacToeLobby.tsx`

- [ ] **Step 14.1: Implement lobby**

Mirror [SeaBattleLobby.tsx](../../../apps/web/src/widgets/SeaBattleGame/ui/SeaBattleLobby.tsx). Uses `ReusableGameLobby` with:

- `<VariantSelector roomId currentVariant disabled={!isHost}>`
- `<BoardSizeSelector roomId currentSize disabled={!isHost}>`
- `<TicTacToeTeamPanel room isHost>` (only when `teamMode === true`)
- A "Team mode" toggle that flips `teamMode` option
- Start button + "Start with bots" button (calls `useTicTacToeActions.startSession({ withBots: true, botCount: 4 - players.length })`).

- [ ] **Step 14.2: Commit**

```bash
git add apps/web/src/widgets/TicTacToeGame/ui/TicTacToeLobby.tsx
git commit -m "feat(games): tic-tac-toe lobby component (ARC-750)"
```

---

## Task 15: Web widget — Game entry + smoke test

**Files:**

- Create: `apps/web/src/widgets/TicTacToeGame/ui/Game.tsx`
- Create: `apps/web/src/widgets/TicTacToeGame/ui/Game.test.tsx`

- [ ] **Step 15.1: Failing smoke test**

`Game.test.tsx`: render `<Game>` with `room.status === 'lobby'` → expect `TicTacToeLobby` rendered; render with `room.status === 'playing'` + a session → expect `TicTacToeBoard` rendered.

- [ ] **Step 15.2: Implementation**

`Game.tsx` mirrors [SeaBattleGame Game.tsx](../../../apps/web/src/widgets/SeaBattleGame/ui/Game.tsx) at the structural level:

- Wrap with `GameWidgetContainer` + `TicTacToeThemeProvider` (resolves tokens from current `variant`).
- Use `useGameStore` to read room + session.
- Use `useGameChatIntegration({ sessionId, roomId, logs: state.logs, currentUserId })` — no other chat wiring needed.
- Render `TicTacToeLobby` when `room.status === 'lobby'`, else `TicTacToeBoard` + `TurnBadge` + `ScoreBoard`.
- Render `TicTacToeModals` always.

- [ ] **Step 15.3: Run smoke test**

```bash
pnpm --filter @arcadeum/web test -- TicTacToeGame
```

- [ ] **Step 15.4: Commit**

```bash
git add apps/web/src/widgets/TicTacToeGame/ui/Game.tsx \
        apps/web/src/widgets/TicTacToeGame/ui/Game.test.tsx
git commit -m "feat(games): tic-tac-toe game widget entry (ARC-750)"
```

---

## Task 16: Web widget — barrel exports

**Files:**

- Create: `apps/web/src/widgets/TicTacToeGame/index.ts`

- [ ] **Step 16.1: Index**

```ts
export { default } from './ui/Game';
export type { TicTacToeGameProps } from './types';
```

- [ ] **Step 16.2: Commit**

```bash
git add apps/web/src/widgets/TicTacToeGame/index.ts
git commit -m "feat(games): tic-tac-toe widget barrel export (ARC-750)"
```

---

## Task 17: Web registry — add loader + update metadata

**Files:**

- Modify: `apps/web/src/features/games/registry.ts`

- [ ] **Step 17.1: Add loader**

Add `tic_tac_toe_v1: () => import('@/widgets/TicTacToeGame'),` to `gameLoaders` object.

- [ ] **Step 17.2: Update metadata block**

Edit `gameMetadata.tic_tac_toe_v1`:

```ts
maxPlayers: 4,
status: 'beta',
lastUpdated: '2026-05-26',
description: 'Classic 3-in-a-row with themed variants and 3×3 – 9×9 boards',
tags: ['board', 'classic', 'casual', 'quick', 'strategy'],
```

- [ ] **Step 17.3: Verify**

```bash
pnpm --filter @arcadeum/web typecheck
```

- [ ] **Step 17.4: Commit**

```bash
git add apps/web/src/features/games/registry.ts
git commit -m "feat(games): register tic-tac-toe widget loader and bump metadata (ARC-750)"
```

---

## Task 18: Delete the legacy hot-seat page files

**Files:**

- Delete: `apps/web/src/app/[locale]/games/tic-tac-toe/TicTacToeClient.tsx`
- Delete: `apps/web/src/app/[locale]/games/tic-tac-toe/TicTacToeView.tsx`
- Delete: `apps/web/src/app/[locale]/games/tic-tac-toe/TicTacToe.module.css`
- Delete: `apps/web/src/app/[locale]/games/tic-tac-toe/useTicTacToe.ts`
- Delete: `apps/web/src/app/[locale]/games/tic-tac-toe/game-logic.ts`
- Delete: `apps/web/src/app/[locale]/games/tic-tac-toe/game-logic.test.ts`
- Delete: `apps/web/src/app/[locale]/games/tic-tac-toe/page.tsx` (will be recreated in Task 19)

- [ ] **Step 18.1: Delete**

```bash
rm apps/web/src/app/\[locale\]/games/tic-tac-toe/TicTacToeClient.tsx \
   apps/web/src/app/\[locale\]/games/tic-tac-toe/TicTacToeView.tsx \
   apps/web/src/app/\[locale\]/games/tic-tac-toe/TicTacToe.module.css \
   apps/web/src/app/\[locale\]/games/tic-tac-toe/useTicTacToe.ts \
   apps/web/src/app/\[locale\]/games/tic-tac-toe/game-logic.ts \
   apps/web/src/app/\[locale\]/games/tic-tac-toe/game-logic.test.ts \
   apps/web/src/app/\[locale\]/games/tic-tac-toe/page.tsx
```

- [ ] **Step 18.2: Commit**

```bash
git add -A apps/web/src/app/\[locale\]/games/tic-tac-toe/
git commit -m "refactor(games): remove tic-tac-toe local hot-seat in favor of widget (ARC-750)"
```

---

## Task 19: Landing — page + main component

**Files:**

- Create: `apps/web/src/app/[locale]/games/tic-tac-toe/page.tsx`
- Create: `apps/web/src/app/[locale]/games/tic-tac-toe/TicTacToeLanding.tsx`
- Create: `apps/web/src/app/[locale]/games/tic-tac-toe/TicTacToeLanding.module.css`

- [ ] **Step 19.1: page.tsx**

Mirror [sea-battle page.tsx](../../../apps/web/src/app/[locale]/games/sea-battle/page.tsx). Constants: `TIC_TAC_TOE_SLUG = 'tic_tac_toe_v1'`, `TIC_TAC_TOE_MIN_PLAYERS = 2`, `TIC_TAC_TOE_MAX_PLAYERS = 4`, `TIC_TAC_TOE_GENRE = 'Board Game'`. `generateMetadata` via `buildPageMetadata({ page: 'ticTacToeLanding' })` (add 'ticTacToeLanding' to the SEO page enum if missing — see [shared/seo/buildPageMetadata.ts](../../../apps/web/src/shared/seo/buildPageMetadata.ts)). JsonLd via `buildVideoGameJsonLd` + `buildHowToJsonLd`.

- [ ] **Step 19.2: TicTacToeLanding.tsx**

Read [SeaBattleLanding.tsx](../../../apps/web/src/app/[locale]/games/sea-battle/SeaBattleLanding.tsx). Mirror structure: Hero, Highlights, Steps, ThemesGrid, Rules, RelatedArticles, FinalCtaButtons.

- [ ] **Step 19.3: CSS module**

Reuse layout/spacing patterns from [SeaBattleLanding.module.css](../../../apps/web/src/app/[locale]/games/sea-battle/SeaBattleLanding.module.css). Adjust color tokens to be variant-neutral.

- [ ] **Step 19.4: Commit**

```bash
git add apps/web/src/app/\[locale\]/games/tic-tac-toe/page.tsx \
        apps/web/src/app/\[locale\]/games/tic-tac-toe/TicTacToeLanding.tsx \
        apps/web/src/app/\[locale\]/games/tic-tac-toe/TicTacToeLanding.module.css
git commit -m "feat(games): tic-tac-toe landing page shell (ARC-750)"
```

---

## Task 20: Landing — Hero + ThemesGrid + CTAs + helpers

**Files:**

- Create: `apps/web/src/app/[locale]/games/tic-tac-toe/TicTacToeHero.tsx`
- Create: `apps/web/src/app/[locale]/games/tic-tac-toe/TicTacToeThemesGrid.tsx`
- Create: `apps/web/src/app/[locale]/games/tic-tac-toe/TicTacToeThemesGrid.module.css`
- Create: `apps/web/src/app/[locale]/games/tic-tac-toe/TicTacToeFinalCtaButtons.tsx`
- Create: `apps/web/src/app/[locale]/games/tic-tac-toe/heroVariantContext.tsx`
- Create: `apps/web/src/app/[locale]/games/tic-tac-toe/landingIcons.tsx`
- Create: `apps/web/src/app/[locale]/games/tic-tac-toe/lib/heroDemo.ts`

- [ ] **Step 20.1: heroDemo.ts**

A lean utility that returns the next mark in a looping fake game sequence. `getNextDemoMark(tickIndex, board)` returns `{ row, col, symbol }` or `null` (reset).

- [ ] **Step 20.2: heroVariantContext.tsx**

Provider that cycles through `TIC_TAC_TOE_VARIANTS` every 6 s on the client.

- [ ] **Step 20.3: Hero**

`TicTacToeHero.tsx` — H1 title (i18n `landing.hero.title`), subtitle, two CTAs (Create room / Browse rooms), animated mini 3×3 board on the right using `heroDemo.ts` + current variant from context.

- [ ] **Step 20.4: ThemesGrid**

Visual variant tiles (6 cards). Clicking links to `/games/create?slug=tic_tac_toe_v1&variant={id}`.

- [ ] **Step 20.5: landingIcons.tsx**

Small SVG icons for highlights (players, sizes, themes) and steps (create, join, play).

- [ ] **Step 20.6: FinalCtaButtons**

Three buttons: Create room / Browse rooms / Back to games.

- [ ] **Step 20.7: Commit**

```bash
git add apps/web/src/app/\[locale\]/games/tic-tac-toe/TicTacToeHero.tsx \
        apps/web/src/app/\[locale\]/games/tic-tac-toe/TicTacToeThemesGrid.tsx \
        apps/web/src/app/\[locale\]/games/tic-tac-toe/TicTacToeThemesGrid.module.css \
        apps/web/src/app/\[locale\]/games/tic-tac-toe/TicTacToeFinalCtaButtons.tsx \
        apps/web/src/app/\[locale\]/games/tic-tac-toe/heroVariantContext.tsx \
        apps/web/src/app/\[locale\]/games/tic-tac-toe/landingIcons.tsx \
        apps/web/src/app/\[locale\]/games/tic-tac-toe/lib/heroDemo.ts
git commit -m "feat(games): tic-tac-toe landing hero, themes grid, CTAs (ARC-750)"
```

---

## Task 21: Landing — OG/Twitter images

**Files:**

- Create: `apps/web/src/app/[locale]/games/tic-tac-toe/opengraph-image.tsx`
- Create: `apps/web/src/app/[locale]/games/tic-tac-toe/twitter-image.tsx`

- [ ] **Step 21.1: Implement**

Mirror [sea-battle opengraph-image.tsx](../../../apps/web/src/app/[locale]/games/sea-battle/opengraph-image.tsx) and twitter-image. Compose a 1200×630 canvas with title + theme grid preview using `next/og` `ImageResponse`.

- [ ] **Step 21.2: Commit**

```bash
git add apps/web/src/app/\[locale\]/games/tic-tac-toe/opengraph-image.tsx \
        apps/web/src/app/\[locale\]/games/tic-tac-toe/twitter-image.tsx
git commit -m "feat(games): tic-tac-toe OG and Twitter card images (ARC-750)"
```

---

## Task 22: i18n — rewrite tic-tac-toe namespace for all 5 locales

**Files:**

- Modify: `apps/web/src/shared/i18n/messages/games/tic-tac-toe/en.ts`
- Modify: `apps/web/src/shared/i18n/messages/games/tic-tac-toe/es.ts`
- Modify: `apps/web/src/shared/i18n/messages/games/tic-tac-toe/fr.ts`
- Modify: `apps/web/src/shared/i18n/messages/games/tic-tac-toe/ru.ts`
- Modify: `apps/web/src/shared/i18n/messages/games/tic-tac-toe/by.ts`
- Modify: `apps/web/src/shared/i18n/messages/games/tic-tac-toe/index.ts` (re-export shape if needed)

- [ ] **Step 22.1: Rewrite en.ts**

Replace top-level key `tic_tac_toe` → `tic_tac_toe_v1`. Add keys per spec §i18n. Keep file under 500 lines.

- [ ] **Step 22.2: Mirror for es/fr/ru/by**

Translate every new key into each locale. Run after every locale:

```bash
pnpm --filter @arcadeum/web translations:check
```

- [ ] **Step 22.3: Add 'ticTacToeLanding' to SEO page enum**

If [buildPageMetadata](../../../apps/web/src/shared/seo/buildPageMetadata.ts) uses an enum of `page` keys, add `ticTacToeLanding`. Add corresponding `seo.ticTacToeLanding` block to each locale's SEO messages file.

- [ ] **Step 22.4: Commit**

```bash
git add apps/web/src/shared/i18n/messages
git commit -m "feat(i18n): tic-tac-toe v1 keys across en/es/fr/ru/by (ARC-750)"
```

---

## Task 23: Run all unit/component tests

- [ ] **Step 23.1: Backend**

```bash
pnpm --filter @arcadeum/be test
```

All pass.

- [ ] **Step 23.2: Web**

```bash
pnpm --filter @arcadeum/web test
```

All pass. If a flake hits an unrelated test, re-run that single file once before treating as a real failure (see auto-memory note about web pre-push flakes).

- [ ] **Step 23.3: Typecheck monorepo**

```bash
pnpm typecheck
```

- [ ] **Step 23.4: Lint**

```bash
pnpm lint
```

- [ ] **Step 23.5: File length check**

```bash
pnpm check-file-length
```

- [ ] **Step 23.6: Commit any fix-ups**

If any small fix-ups are needed, commit with `chore(games): post-test fixups for tic-tac-toe (ARC-750)`.

---

## Task 24: Playwright e2e

**Files:**

- Create: `apps/web/e2e/tic-tac-toe-bot-game.spec.ts`
- Create: `apps/web/e2e/tic-tac-toe-teams-lobby.spec.ts`

(Confirm the e2e directory location — could be `apps/web/tests/e2e` or `apps/web/playwright`. Inspect existing sea-battle e2e to match.)

- [ ] **Step 24.1: Bot-game e2e**

Steps: open `/games/tic-tac-toe` → click "Create room" → "Start with bots" → click cells to win 3×3 → assert game-over modal shows "You won".

- [ ] **Step 24.2: Teams lobby e2e**

Steps: open landing → create room → toggle team mode → use 3 testees → assert all enter playing phase.

- [ ] **Step 24.3: Run locally**

```bash
pnpm --filter @arcadeum/web e2e -- tic-tac-toe
```

- [ ] **Step 24.4: Commit**

```bash
git add apps/web/e2e/tic-tac-toe-bot-game.spec.ts apps/web/e2e/tic-tac-toe-teams-lobby.spec.ts
git commit -m "test(e2e): tic-tac-toe bot game and teams lobby flows (ARC-750)"
```

---

## Task 25: Manual smoke + PR

- [ ] **Step 25.1: Start dev servers**

```bash
pnpm dev
```

Hit `http://localhost:3000/en/games/tic-tac-toe`. Walk through: landing → create room → start with bots → play full game on 3×3, 5×5, 9×9 → verify chat appears for moves → verify theme variant switches change colors.

- [ ] **Step 25.2: Pull develop, rebase**

```bash
git fetch origin
git rebase origin/develop
```

Resolve any conflicts (likely in registry/i18n indexes).

- [ ] **Step 25.3: Push**

```bash
git push -u origin ARC-750-tic-tac-toe
```

If pre-push hook flakes per auto-memory, run failed test solo, confirm pass, push with `--no-verify`.

- [ ] **Step 25.4: Open PR via /pr-description skill**

Invoke `/pr-description` skill to generate the PR body. Target branch is `develop` (per auto-memory). Use `gh pr create --base develop --title "feat(games): full multiplayer tic-tac-toe with landing, widget, bots (ARC-750)" --body "<generated>"`.

- [ ] **Step 25.5: Report PR URL**

Print the PR URL to the user.

---

## Risks and mitigations (carry-over from spec)

1. **`SeaBattleTeamConfigService` reuse may leak constraints.** If the service throws during tic-tac-toe lobby init, build a slim `TicTacToeTeamConfigService` locally and swap. Note in PR description if this happens.
2. **Bot races human turn on fast networks.** Bot must verify `state.currentTurn === botId` before submitting; engine rejects out-of-turn anyway — but assert this in the bot spec.
3. **`HowTo` JsonLd uniqueness vs sea-battle.** Hand-write unique step copy; do not boilerplate-copy from sea-battle.
4. **Large single PR.** Each commit above is reviewer-bite-sized; review by commit (not by file).
