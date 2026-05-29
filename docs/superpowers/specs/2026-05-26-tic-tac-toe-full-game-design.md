# Tic-Tac-Toe — Full Game (Widget + Lobby + Landing + Chat)

**Ticket:** ARC-750 (extension)
**Date:** 2026-05-26
**Status:** Approved for planning
**Author:** Anatoliy + Claude

## Problem

The current Tic-Tac-Toe at `/games/tic-tac-toe` is a standalone local hot-seat
page. It does not match the architecture of every other game on the platform
(sea-battle, glimworm, critical), which provide a landing page, a lobby with
variants selection, a multiplayer widget driven by sockets, integrated chat,
and bot support.

Outcome: a player browsing `/games` sees Tic-Tac-Toe with the same shape as
every other game — landing, themes, rules, "Create room" / "Browse rooms",
multiplayer lobby with bots, full in-room chat.

## Goals

1. Replace the local hot-seat at `/games/tic-tac-toe` with a SEO-grade landing
   page modeled on `/games/sea-battle`.
2. Add a multiplayer Tic-Tac-Toe game engine on the backend, registered in
   `GameEnginesModule` and wired through `GameRoomsService` / sessions.
3. Add a widget at `@/widgets/TicTacToeGame` registered in the web game
   registry (`tic_tac_toe_v1`).
4. Support 2–4 players, optional teams (sea-battle-parity team mode).
5. Six visual theme variants (Classic, Neon, Paper, Pixel, Chalkboard, Retro).
6. Board size as a separate lobby option: 3×3 / 5×5 / 7×7 / 9×9, with
   win-length 3/4/5/5 respectively.
7. Bots from day one — perfect minimax on 3×3, heuristic on 5×5, random on
   7×7 and 9×9.
8. Full i18n across en, es, fr, ru, by.
9. Tests: BE engine unit specs, web widget vitest, Playwright e2e for create
   room → bot game → win, and 4-player teams lobby.
10. Ship as a single PR.

## Non-Goals (YAGNI)

- Custom Tic-Tac-Toe-only leaderboards/stats beyond what falls out of the
  standard session lifecycle.
- Spectator mode.
- Move undo / takeback.
- Tournaments-specific integration beyond what registry inclusion provides
  for free.
- Real-time gameplay primitives (no per-frame ticks — turn-based only, no
  state store like Glimworm).
- Keeping the local hot-seat as a fallback. It is fully replaced.

## Architecture Overview

```
+----------------------------------------------------+
|  /games/tic-tac-toe  (landing — server component)  |
|   - Hero with animated demo board                  |
|   - Themes grid, rules, CTAs                       |
|   - JsonLd (VideoGame + HowTo)                     |
+----------------------------------------------------+
                       |
                       v  create room / browse rooms
+----------------------------------------------------+
|  /games/:roomId  (existing GameDetailRoute)        |
|   - Loads TicTacToeGame widget via gameLoaders     |
|     for `tic_tac_toe_v1`                           |
|   - Renders <Game/> → lobby or board               |
+----------------------------------------------------+
                       |
              socket   v
+----------------------------------------------------+
|  TicTacToeGateway → TicTacToeService                |
|   - place_mark, forfeit, rematch                   |
|   - delegates to TicTacToeEngine                   |
|   - persists state via GameSessionsService         |
|   - emits realtime updates via GamesRealtimeService|
+----------------------------------------------------+
                       |
                       v
+----------------------------------------------------+
|  TicTacToeEngine implements IGameEngine            |
|   - initialize(playerIds, { variant, boardSize,    |
|     teamMode })                                    |
|   - processAction(state, action, ctx)              |
|   - checkWinningLine, isBoardFull, nextTurn        |
+----------------------------------------------------+
```

## Backend

### Files

```
apps/be/src/games/engines/tic-tac-toe/
  tic-tac-toe.constants.ts
  tic-tac-toe.types.ts
  tic-tac-toe.engine.ts
  tic-tac-toe.engine.spec.ts
  tic-tac-toe.utils.ts
  tic-tac-toe.utils.spec.ts
  tic-tac-toe.validators.ts

apps/be/src/games/tic-tac-toe/
  tic-tac-toe.service.ts
  tic-tac-toe-bot.service.ts
  tic-tac-toe-bot.service.spec.ts

apps/be/src/games/tic-tac-toe.gateway.ts
```

### Engine contract

`TicTacToeEngine implements IGameEngine<TicTacToeState>`.

```ts
interface TicTacToeOptions {
  variant: string; // 'classic' | 'neon' | 'paper' | 'pixel' | 'chalkboard' | 'retro'
  boardSize: 3 | 5 | 7 | 9;
  teamMode: boolean;
}

type CellValue = string | null; // player id when teamMode=false, team id when true

interface TicTacToePlayer extends GamePlayerState {
  playerId: string;
  symbol: string; // assigned client-side: X, O, △, □
  alive: boolean; // false on forfeit
  teamId?: string; // present iff teamMode
}

interface TicTacToeTeam {
  id: string;
  name: string;
  color: string;
  playerIds: string[];
  currentShooterIndex: number; // round-robin within team
}

interface TicTacToeState extends BaseGameState {
  phase: 'lobby' | 'playing' | 'game_over';
  options: TicTacToeOptions;
  board: CellValue[][]; // boardSize × boardSize
  winLength: 3 | 4 | 5;
  playerOrder: string[]; // player ids when teamMode=false, team ids when true
  currentTurnIndex: number;
  players: TicTacToePlayer[];
  teams: TicTacToeTeam[]; // [] when teamMode=false
  winLine: { row: number; col: number }[] | null;
  winnerId: string | null; // player id or team id
  isDraw: boolean;
  logs: GameLogEntry[];
}
```

Actions:

- `{ type: 'place_mark', row, col }` — validates cell empty + correct turn,
  writes player/team id into board, recomputes win, advances turn.
- `{ type: 'forfeit' }` — marks player dead, transfers their cells nowhere
  (they remain), advances turn, ends game if only one side left.

Win check is N×N adapted from current
`apps/web/src/app/[locale]/games/tic-tac-toe/game-logic.ts`. The same
algorithm moves into `tic-tac-toe.utils.ts` (BE), then the FE simply renders
the state.

### Service

`TicTacToeService` follows `SeaBattleService` shape. Public methods:

- `startSession(roomId, hostId, options)` — validates min 2 players, builds
  initial state via engine, persists via `GameSessionsService`, emits
  `session.started` realtime event. If `options.withBots`, fills empty slots
  with bots via `TicTacToeBotService.spawnBot`.
- `placeMark(sessionId, userId, payload)` — loads state, calls
  `engine.processAction`, persists new state, emits `session.updated`. If bot
  turn next, schedules bot move via `setImmediate`.
- `forfeit(sessionId, userId)` — engine forfeit action.
- `endSession(sessionId)` — finalizes, records history via
  `GameHistoryService`, triggers leaderboard sync via
  `GamesLeaderboardSyncService`.

### Bot service

`TicTacToeBotService`:

- `spawnBot(roomId)` — creates bot user, joins room.
- `pickMove(state)` — strategy per `boardSize`:
  - `3` → perfect minimax (depth 9 max — trivially fast)
  - `5` → heuristic: win-if-possible → block-if-needed → center-bias random
  - `7`, `9` → random empty cell

### Wiring

- Add `TicTacToeEngine` to `[engines.module.ts](apps/be/src/games/engines/engines.module.ts)`
  providers + `onModuleInit` registration.
- Add `TicTacToeService`, `TicTacToeBotService`, `TicTacToeGateway` to
  `[games.module.ts](apps/be/src/games/games.module.ts)` providers; add
  gateway to controllers list as appropriate.
- Reuse `SeaBattleTeamConfigService` for team-mode lobby configuration. The
  team-rotation problem is identical; if any sea-battle-specific behavior is
  reached we extract a slimmer base service. **Decision deferred until
  implementation** — engineer choice with bias toward reuse.

## Web Widget

### Files

```
apps/web/src/widgets/TicTacToeGame/
  index.ts
  types/index.ts
  lib/
    constants.ts                 # TIC_TAC_TOE_VARIANTS
    TicTacToeThemeContext.tsx
    theme.ts
  hooks/
    index.ts
    useTicTacToeState.ts
    useTicTacToeActions.ts
  ui/
    Game.tsx                     # entry
    TicTacToeLobby.tsx
    TicTacToeBoard.tsx
    BoardSizeSelector.tsx
    VariantSelector.tsx
    TicTacToeTeamPanel.tsx
    TicTacToeModals.tsx
    TurnBadge.tsx
    ScoreBoard.tsx
    RulesModal.tsx
    styles/animations.css
```

### Registry

In `[apps/web/src/features/games/registry.ts](apps/web/src/features/games/registry.ts)`:

```ts
export const gameLoaders = {
  critical_v1: () => import('@/widgets/CriticalGame'),
  sea_battle_v1: () => import('@/widgets/SeaBattleGame'),
  glimworm_v1: () => import('@/widgets/GlimwormGame'),
  tic_tac_toe_v1: () => import('@/widgets/TicTacToeGame'),
} as const;
```

Update `gameMetadata.tic_tac_toe_v1`:

```ts
tic_tac_toe_v1: {
  slug: 'tic_tac_toe_v1',
  name: 'Tic-Tac-Toe',
  description: 'Classic 3-in-a-row with themed variants and 3×3 – 9×9 boards',
  category: 'Board Game',
  minPlayers: 2,
  maxPlayers: 4,
  estimatedDuration: 5,
  complexity: 1,
  ageRating: 'G',
  thumbnail: '/games/tic-tac-toe.jpg',
  version: '1.0.0',
  supportsAI: true,
  tags: ['board', 'classic', 'casual', 'quick', 'strategy'],
  implementationPath: '@/widgets/TicTacToeGame',
  lastUpdated: '2026-05-26',
  status: 'beta',
},
```

### Variants

Six themes, declared in `lib/constants.ts`:

| id         | emoji | gradient direction    |
| ---------- | ----- | --------------------- |
| classic    | ❌⭕  | white → soft slate    |
| neon       | 💡    | violet → cyan         |
| paper      | 📝    | warm off-white → tan  |
| pixel      | 👾    | green → emerald       |
| chalkboard | 🎓    | dark slate → graphite |
| retro      | 📺    | amber → rose          |

Each variant exports light + dark gradients to feed `GameLobbyTheme` and the
hero. Theme context exposes X-color, O-color, grid-line color, mark font.

### Lobby flow

1. Host creates room from landing CTA → `POST /games/rooms` with
   `slug='tic_tac_toe_v1'`, options=`{variant:'classic', boardSize:3, teamMode:false}`.
2. Players join via room list (`/games/rooms`).
3. Host can change `variant`, `boardSize`, `teamMode` while in lobby.
4. Host clicks "Start" or "Start with bots". Engine initializes, transitions
   to `playing`.

### Game flow

1. `TicTacToeBoard` renders the N×N grid, each cell is a button.
2. Player clicks → `useTicTacToeActions.placeMark(row, col)` → socket emit.
3. BE engine validates + advances → emits `session.updated` → `useGameStore`
   updates → widget re-renders, animates the new mark, draws win line if
   present.
4. On `game_over`, `TicTacToeModals` shows the result modal. Rematch button
   reuses `useRematch`.

### Chat

`useGameChatIntegration` is already used by sea-battle:

```ts
useGameChatIntegration({
  sessionId,
  roomId,
  logs: state.logs,
  currentUserId,
});
```

The engine produces `GameLogEntry`s in `state.logs` (mark placements, wins,
forfeits, joins). The hook pipes them into the shared `GameChat` widget that
docks inside `GameWidgetContainer`. **No new chat wiring needed.**

## Landing Page

Replace `apps/web/src/app/[locale]/games/tic-tac-toe/` contents with:

```
page.tsx                                 # server component
TicTacToeLanding.tsx
TicTacToeLanding.module.css
TicTacToeHero.tsx
TicTacToeThemesGrid.tsx
TicTacToeThemesGrid.module.css
TicTacToeFinalCtaButtons.tsx
heroVariantContext.tsx
landingIcons.tsx
opengraph-image.tsx
twitter-image.tsx
lib/heroDemo.ts                          # tiny standalone hero-loop helper
_og/                                     # if shared OG assets needed
```

Delete: `TicTacToeClient.tsx`, `TicTacToeView.tsx`, `TicTacToe.module.css`,
`useTicTacToe.ts`. Move `game-logic.ts` / `game-logic.test.ts` content into
the BE engine and delete from FE.

`page.tsx` mirrors `[sea-battle/page.tsx](apps/web/src/app/[locale]/games/sea-battle/page.tsx)`:
`generateMetadata` via `buildPageMetadata({ page: 'ticTacToeLanding' })`,
JsonLd via `buildVideoGameJsonLd` + `buildHowToJsonLd` for the rules.

Hero animates a 3×3 demo placing marks in a fixed sequence, cycling the
visible variant every 6 s.

## Room Options Persistence

Options stored in `GameRoom.options`:

```ts
{ variant: string, boardSize: 3|5|7|9, teamMode: boolean }
```

Updated from FE via the existing `gamesApi.updateRoomOption(roomId, key, value)`
endpoint. Variant selector locks when `room.status !== 'lobby'`.

`GameRoomsQuickplayService` gets a `TIC_TAC_TOE_DEFAULT_OPTIONS` constant for
the quickplay flow. `GameRoomsRematchService` passes options through unchanged.

## i18n

Extend `apps/web/src/shared/i18n/messages/games/tic-tac-toe/{en,es,fr,ru,by}.ts`:

Top-level namespace becomes `tic_tac_toe_v1` (matches sea-battle's
`sea_battle_v1`). Existing `tic_tac_toe` namespace (hot-seat-only keys)
is removed.

Keys added:

- `name`, `description`, `summary`
- `landing.meta.{title,description,keywords}`
- `landing.hero.{title,subtitle,cta,createRoom,browseRooms}`
- `landing.highlights.{players,sizes,themes}.{title,body}`
- `landing.steps.{create,join,play}.{title,body}`
- `landing.themes.{title,subtitle}`
- `landing.faq.{question,answer}` (3 entries)
- `variants.{classic,neon,paper,pixel,chalkboard,retro}.{name,description}`
- `lobby.{boardSize,teamMode,startWithBots,addBot,waitingForPlayers,minPlayers}`
- `lobby.boardSize.{3x3,5x5,7x7,9x9}`
- `rules.{title,objective,steps,winLengths}`
- `gameOver.{won,lost,draw,you,team}`
- `actions.{place,rematch,leave,forfeit}`
- `chat.{markPlaced,won,draw,joined,left,forfeit}`
- `errors.{notYourTurn,cellTaken,gameOver,gameNotStarted}`

## Tests

### Backend

- `tic-tac-toe.engine.spec.ts` — 3×3 horizontal/vertical/diagonal win, 5×5
  4-in-row, 9×9 5-in-row, draw on full board, team rotation (2v2), forfeit
  → next player skipped, place_mark on occupied cell rejected.
- `tic-tac-toe.utils.spec.ts` — `checkWinningLine` edge cases (corners,
  diagonals across non-standard sizes), `isBoardFull`, `nextTurnIndex` skip
  dead players.
- `tic-tac-toe-bot.service.spec.ts` — 3×3 minimax: bot blocks opponent's
  winning move, bot takes winning move, bot never loses in a deterministic
  losing-position scenario. 5×5 heuristic: blocks 4-in-row, takes winning
  move when present.

### Web widget

- `TicTacToeGame.test.tsx` — renders `<TicTacToeLobby>` when `room.status ===
'lobby'`, renders `<TicTacToeBoard>` when `'playing'`.
- `TicTacToeBoard.test.tsx` — clicking empty cell dispatches `place_mark`,
  occupied cell is non-interactive, winning cells receive the highlight
  class.
- `BoardSizeSelector.test.tsx` — selecting a size calls
  `gamesApi.updateRoomOption(roomId, 'boardSize', value)`.
- `VariantSelector.test.tsx` — covered by `GameVariantSelector` existing
  tests + a smoke test that all six variants render.

### Landing

- `TicTacToeLanding.test.tsx` — renders hero, themes grid, three CTAs.
- a11y check (jest-axe) on the landing root.

### Playwright e2e

- `tic-tac-toe-bot-game.spec.ts` — open `/games/tic-tac-toe` → "Create room"
  → "Start with bots" → make a winning sequence on 3×3 → assert game-over
  modal shows win.
- `tic-tac-toe-teams-lobby.spec.ts` — host creates room, toggles teamMode,
  invites 3 testees, all join correct teams, host starts — assert
  `playing` phase reached.

## File Count Estimate

| Area               |    New | Modified | Deleted |
| ------------------ | -----: | -------: | ------: |
| BE engine + tests  |      7 |        0 |       0 |
| BE service + tests |      3 |        0 |       0 |
| BE gateway         |      1 |        0 |       0 |
| BE module wiring   |      0 |        2 |       0 |
| Web widget         |     15 |        0 |       0 |
| Web registry       |      0 |        1 |       0 |
| Web landing        |     10 |        0 |       4 |
| i18n               |      0 |        5 |       0 |
| Playwright         |      2 |        0 |       0 |
| **Total**          | **38** |    **8** |   **4** |

All files stay under the 500-line cap per CLAUDE.md.

## Open Questions

None — all decisions made during brainstorming:

1. Local hot-seat is replaced entirely → ✅ resolved.
2. Bots from day one → ✅ resolved.
3. Variants = themes; size = separate option → ✅ resolved.
4. 2–4 players + optional teams (sea-battle parity) → ✅ resolved.
5. Single PR → ✅ resolved.
6. Reuse `SeaBattleTeamConfigService` vs. dedicated → deferred to
   implementation, bias toward reuse.

## Risks

- **Reusing `SeaBattleTeamConfigService` may leak sea-battle-specific
  constraints** (e.g., even-team-only). Mitigation: at engine-init time, if
  service throws an unexpected config error, fall back to a slimmer
  tic-tac-toe-local team builder. Decided during implementation, not
  retroactively.
- **Bot moves with `setImmediate` could race with another player's action on
  fast networks.** Mitigation: bot service checks `state.currentTurn ===
botId` before submitting; engine validation rejects out-of-turn actions
  anyway.
- **Landing JsonLd `HowTo` schema needs careful copy** so Google doesn't
  flag it as duplicative of the sea-battle HowTo. Mitigation: unique
  step text per game; ChatGPT review of final copy before merge.
- **Single-PR scope is large (~46 files).** Mitigation: reviewer-friendly
  commit structure within the PR — one commit per area (BE engine, BE
  service, web widget, landing, i18n, tests).
