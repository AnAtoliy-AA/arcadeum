# Sea Battle — Team Mode (ARC-427)

**Status:** Design — pending review
**Date:** 2026-05-07
**Ticket:** ARC-427 — feat: add ability to play in teams for some games
**Pilot game:** Sea Battle (`sea_battle_v1`)

## 1. Goal & scope

Add a team-play mode to Sea Battle. Teams allow up to 8 players in one room (vs. today's max 6 free-for-all), with flexible team configurations such as 4v4, 3v3v2, 2v6, and 2v2v2v2. Free-for-all (FFA) Sea Battle is unchanged.

This ticket is the framework + first integration. Other engines (Critical, Texas Hold'em, future games) can opt in later in their own tickets by adopting the same `teamMode` pattern.

### Out of scope

- Cross-game team primitives shared across engines (deferred; the structure here is engine-local on Sea Battle).
- Persistent teams/clans across rooms.
- Tournament brackets, ranked play, or matchmaking.
- Voice chat.

## 2. Decisions

| #   | Topic              | Decision                                                                                                                                                                                                 |
| --- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Game               | Sea Battle (`sea_battle_v1`), max 8 in team mode (FFA stays max 6)                                                                                                                                       |
| 2   | Team composition   | ≥2 teams, ≥2 players per team, total ≤8, uneven sizes allowed (e.g. 2v6, 3v3v2)                                                                                                                          |
| 3   | Team formation     | Host configures team count + per-team target sizes; players self-pick an open slot; host can move/assign                                                                                                 |
| 4   | Visibility         | Full teammate visibility by default. Host toggle `Hide ships from teammates` (default `false`). When `true`, teammates see attack history only, not each other's ship layouts. Enemies always sanitized. |
| 5   | Turn order         | Team round-robin (T1 → T2 → … → T1). Each team has a per-team shooter pointer that advances on miss.                                                                                                     |
| 6   | Hit bonus          | Same player keeps shooting on hit. On miss, the active team's shooter pointer advances and turn passes to the next team.                                                                                 |
| 7   | Player elimination | When a player loses all ships they are eliminated; their team plays on if any teammate is alive. Eliminated player can still spectate and use team chat.                                                 |
| 8   | Win condition      | Last team with at least one alive player wins. All players on that team are winners.                                                                                                                     |
| 9   | Mode opt-in        | Lobby toggle on `sea_battle_v1`. Off (default) → existing FFA, max 6. On → team mode, max 8. Same engine, branched on `state.teams != null`.                                                             |
| 10  | Chat               | Add `'team'` to the existing `ChatScope` union. UI channel switcher: Team / All / DM.                                                                                                                    |
| 11  | Bots               | First-class team members. Host adds/removes bots per team. Bots respect team rules (no teammate targeting, share intel per visibility setting).                                                          |

## 3. Architecture overview

```
┌──────────────────────────────────────────────────────┐
│  Lobby (web)                                         │
│  ┌─ Host: team count, team sizes, names, colors, ─┐ │
│  │   hide-ships toggle, add/remove bots             │ │
│  ├─ All players: pick an open team slot,            │ │
│  │   leave team; host can move others               │ │
│  └─ Start disabled until all slots filled           │ │
└────────────┬─────────────────────────────────────────┘
             │ socket events: setTeamConfig,
             │ assignPlayerToTeam, toggleHideShips, …
             ▼
┌──────────────────────────────────────────────────────┐
│  Backend (NestJS)                                    │
│  GameRoom.gameOptions = { teamMode, teams[], … }     │
│  Validates host-only mutations & start preconditions │
└────────────┬─────────────────────────────────────────┘
             │ start_game →
             ▼
┌──────────────────────────────────────────────────────┐
│  SeaBattleEngine.initializeState(playerIds, config)  │
│  When teamMode: copies team config into session      │
│  state (teams, teamOrder, hideShipsFromTeammates)    │
│                                                      │
│  Engine branches on state.teams != null for:         │
│   • validateAttack (no teammate)                     │
│   • turn rotation                                    │
│   • sanitizeStateForPlayer (teammate visibility)     │
│   • isGameOver / getWinners (team-based)             │
│   • chat 'team' scope                                │
└──────────────────────────────────────────────────────┘
```

**Key principle:** team mode is a thin layer of rules over the existing engine, branched on `state.teams != null`. Same `gameId` (`sea_battle_v1`), same engine class, same registry entry. FFA gameplay code paths are unchanged.

## 4. Data model

### 4.1 Room (lobby phase) — `gameOptions`

The existing `GameRoom.gameOptions` object (already typed `Record<string, unknown>`) carries the team config while the room is in the lobby phase. No `GameRoom` schema changes.

```ts
interface SeaBattleTeamConfig {
  id: string; // 't1', 't2', …; stable for the lifetime of the room
  name: string; // host-editable, default "Team 1", "Team 2", …
  color: string; // hex; default from a fixed palette
  targetSize: number; // ≥ 2; sum of all targetSizes ≤ 8
  playerIds: string[]; // ≤ targetSize; user IDs (humans or bots)
}

interface SeaBattleGameOptions {
  teamMode: boolean; // toggled by host; default false
  hideShipsFromTeammates?: boolean; // default false; only meaningful when teamMode
  teams?: SeaBattleTeamConfig[]; // present iff teamMode
}
```

Invariants:

- `teamMode === true ⇒ teams.length ≥ 2 && every team.targetSize ≥ 2 && sum(targetSize) ≤ 8`.
- Implication: `teams.length` is bounded by `⌊8 / 2⌋ = 4`. The lobby UI's "add team" button is disabled at 4 teams.
- A user appears in at most one `teams[].playerIds`.
- Every entry in `teams[].playerIds` is also in `GameRoom.playerIds` (room membership is the source of truth).
- Game cannot start unless every team is full (`playerIds.length === targetSize`) for every team.

### 4.2 Session (in-game phase) — `SeaBattleState`

`SeaBattleState` gains optional team fields, populated only when team mode is on at game start. The session is immutable to lobby changes from this point on.

```ts
interface SeaBattleTeam {
  id: string;
  name: string;
  color: string;
  playerIds: string[]; // snapshot at game start
  currentShooterIndex: number; // pointer into playerIds; advances on miss
}

interface SeaBattleState {
  // …existing fields unchanged…
  teams?: SeaBattleTeam[];
  teamOrder?: string[]; // ['t1','t2','t3'] — team rotation
  currentTeamIndex?: number; // index into teamOrder
  hideShipsFromTeammates?: boolean; // copied at init; immutable
}
```

`playerOrder` and `currentTurnIndex` are still maintained for backward compatibility (UI, history) and are derived from team rotation: the current player is `state.teams[currentTeamIndex].playerIds[currentShooterIndex]`. Authoritative pointer is the team pointer.

### 4.3 DTOs (NestJS)

New DTOs under `apps/be/src/games/dtos/` with `class-validator` decorators:

- `set-team-config.dto.ts` — host: `roomId`, `teams: [{ id?, name, color, targetSize }]`, `hideShipsFromTeammates?`.
- `assign-team.dto.ts` — host or self: `roomId`, `userId`, `teamId | null` (null = unassign).
- `add-bot-to-team.dto.ts` — host: `roomId`, `teamId`.
- `remove-bot-from-team.dto.ts` — host: `roomId`, `userId`.
- `toggle-team-mode.dto.ts` — host: `roomId`, `enabled: boolean`.

## 5. Engine changes (`SeaBattleEngine`)

All changes are additive and gated on `state.teams != null`. FFA paths are untouched.

### 5.1 `initializeState(playerIds, config)`

Accepts optional team config in `config`:

```ts
initializeState(
  playerIds: string[],
  config?: {
    teams?: SeaBattleTeamConfig[];
    hideShipsFromTeammates?: boolean;
  },
): SeaBattleState
```

When `config.teams` is provided:

- Build `state.teams` from config (each team starts with `currentShooterIndex: 0`).
- Build `state.teamOrder` as the order in which teams appear in `config.teams`.
- Set `state.currentTeamIndex = 0`, `state.hideShipsFromTeammates = !!config.hideShipsFromTeammates`.
- `state.playerOrder` is still set to `playerIds` (existing behavior).

When `config.teams` is absent: behavior unchanged.

### 5.2 `validateAction` / `validateAttack`

In team mode, reject `attack` if:

- The attacker is not the active shooter of the active team, OR
- The target player is on the same team as the attacker.

### 5.3 `executeAttack` — turn advancement

Replace the existing `if (result === MISS) advanceToNextPlayer(state)` branch with:

- FFA: unchanged.
- Team mode:
  - On hit: do not change pointers. Same player shoots again.
  - On miss: advance the active team's `currentShooterIndex` to the next alive player on that team (with wrap), then advance `currentTeamIndex` to the next team that has at least one alive player (with wrap). If only one team has alive players, no advance is needed (game-over check follows).
  - Edge case: if the active team has exactly one alive player and they miss, the wrap returns to that same player; the team rotation still advances to the next team. The single-player-team scenario only happens after teammate eliminations (lobby invariant requires ≥ 2 per team at start).

### 5.4 `removePlayer`

Existing behavior: mark `alive = false`, run winner check.

Add: in team mode, if the eliminated player was the active shooter, the team's `currentShooterIndex` will skip them on the next advance (no immediate change required since rotation only advances on miss).

### 5.5 `isGameOver` / `getWinners`

- FFA: unchanged.
- Team mode:
  - `isGameOver`: at most one team has any alive players.
  - `getWinners`: returns the `playerIds` of the surviving team (multiple winners). Simultaneous wipe across all teams cannot occur in normal play (one shot eliminates at most one player and elimination is checked after each attack); the implementation logs an error and returns no winners as a defensive fallback.

### 5.6 `sanitizeStateForPlayer`

Today: hides every other player's ships (their `ships` array stripped, `board` cells with `SHIP` masked).

In team mode:

- Enemies (other teams): same masking as today.
- Teammates:
  - If `hideShipsFromTeammates === false`: reveal `ships` and `board` (full visibility, including ship layouts).
  - If `hideShipsFromTeammates === true`: hide ship layouts but reveal attack-history view — the cells on the teammate's board that were already attacked (HIT/MISS/SUNK markers visible to the enemy who shot them are also visible to teammates).
- Self: unchanged (full self-board).

Logs/chat sanitization: a `'team'`-scoped log entry is included in the sanitized output only if the viewer is on the sender's team (alive or eliminated).

### 5.7 `getAvailableActions`

In team mode, return `attack` only when the viewer is the active shooter of the active team.

### 5.8 `executeChat`

Accept `scope: 'team'`. Persist log entry with `scope: 'team'`. Visibility is enforced by `sanitizeStateForPlayer`.

## 6. Backend service changes

### 6.1 `game-rooms.service.ts`

New methods (host-permission-checked except `assignPlayerToTeam` for self):

- `setTeamMode(roomId, hostId, enabled)` — toggles `gameOptions.teamMode`. When enabling, seed a default 2-team config sized to fit existing humans: split current `playerIds` between `Team 1` and `Team 2` (host on Team 1; remaining alternating to keep sizes balanced), with `targetSize` set to each team's resulting member count, clamped to ≥ 2 (auto-bumping if one team would otherwise have 1). If the room has more than 8 players, the operation is rejected with a validation error directing the host to kick excess players first. When disabling, clears `teams` and `hideShipsFromTeammates` from `gameOptions`.
- `setTeamConfig(roomId, hostId, teams[], hideShipsFromTeammates?)` — replaces team config; preserves existing `playerIds` assignments where possible (drops players whose team was removed back to "unassigned").
- `assignPlayerToTeam(roomId, actorId, userId, teamId | null)` — host can move anyone; non-host can move only themselves. Validates capacity.
- `addBotToTeam(roomId, hostId, teamId)` — creates a bot user (existing bot infra) and assigns it to that team.
- `removeBotFromTeam(roomId, hostId, userId)` — removes the bot from the team and the room.

All methods emit a room-update socket event so all clients re-render.

### 6.2 `games.gateway.ts`

New socket handlers wrapping the service methods with `JwtAuthGuard` and DTO validation. Existing `start_game` handler validates team-mode preconditions before init: every team full, ≥ 2 teams, ≥ 2 per team. On success, calls `gameSessions.create(...)` passing the team config into `engine.initializeState`.

### 6.3 `game-sessions.service.ts`

When `gameId === 'sea_battle_v1'` and `gameOptions.teamMode === true`, pass `{ teams, hideShipsFromTeammates }` from the room into the engine's `initializeState`.

### 6.4 `sea-battle-bot.service.ts`

- Target selection excludes any player on the bot's team (looked up via `state.teams`).
- Intel propagation: bots already operate on the sanitized state from their perspective, so `hideShipsFromTeammates` is automatically respected — no extra change needed beyond ensuring the sanitization function returns the right view for bots.

## 7. Frontend changes (`apps/web`)

### 7.1 Lobby UI

Run `/check-ui-components` first; reuse `@arcadeum/ui` primitives (Switch, Stepper, ColorPicker, Avatar, Card). New components only if the catalog has nothing suitable.

Components to add or modify (under `apps/web/src/features/games/sea-battle/lobby/` — exact path TBD by existing conventions during planning):

- `TeamModeToggle` — host-only Switch wired to `setTeamMode`.
- `TeamSetupPanel` — host-only; lists teams with editable name/color/`targetSize`, add/remove team buttons, `Hide ships from teammates` switch. Validation banner.
- `TeamSlotsBoard` — visible to all; shows each team as a card with colored slots. Empty slots are clickable join buttons (for the viewer) or selectable for host-move. Bot rows have a remove button for host.
- `UnassignedPool` — players in the room not on any team.
- `StartGameButton` — disabled with a tooltip listing what's incomplete.

State management:

- Read room state via existing TanStack Query hook for room data.
- Mutations via socket handlers; optimistic updates allowed for UX snappiness.
- Zustand for transient UI (drag/move state).

### 7.2 Game UI (during play)

- Player roster sidebar groups players by team with team color. Active team is highlighted; the active shooter has a pulsing indicator.
- Teammate boards are visible (or attack-history-only when hide-ships is on) — same target-selection UI used for enemies, but tagged "Teammate" and marked unattackable (greyed click).
- Eliminated players see the same sanitized state as before they were eliminated (their team's view; teammate boards still visible per the visibility rules; enemy boards still sanitized). They cannot act and the action UI is hidden, but they continue to receive state updates and team chat.
- Chat: channel switcher (Team / All / DM). Default channel is Team in team mode. Messages render with team color stripe.

### 7.3 i18n

Add keys under `lobby.sea_battle.team_mode.*`, `game.sea_battle.team.*`, `chat.scope.team` to `en`, `ru`, `es`, `fr`, `by`. No hardcoded strings.

## 8. Bots

`sea-battle-bot.service.ts`:

- Adjust target selection to exclude `state.teams[teamOf(botId)].playerIds` from candidates.
- Otherwise rely on the sanitized state (already filters per-perspective), so no separate code path for `hideShipsFromTeammates` is needed in the bot.

Lobby bot management uses the existing bot-spawn infrastructure; the only addition is the team assignment on creation.

## 9. Testing

### 9.1 Backend (Jest)

- `sea-battle.engine.spec.ts` (extend):
  - Initialize team mode with 4v4, 3v3v2, 2v6, 2v2v2v2 configs.
  - Turn rotation: hit keeps shooter; miss advances team and shooter pointers; uneven team sizes still rotate fairly across teams.
  - Cannot attack a teammate (validation rejects).
  - Player elimination: dead players skipped; team continues; team eliminated when all members dead.
  - Win condition: last team standing returns all team `playerIds` as winners.
  - Sanitization: teammate ships visible by default; hidden when toggle on; enemy boards always sanitized.
  - Team chat: visible to all teammates (alive + eliminated), invisible to other teams; `all` scope still global.
  - Backwards-compat regression: every existing FFA test passes with `teams` undefined.
- `game-rooms.service.spec.ts` (new tests):
  - Permission rules (host-only mutations).
  - Capacity validation, total ≤ 8, ≥ 2 per team, ≥ 2 teams.
  - `setTeamConfig` preserves existing assignments where possible.

### 9.2 Frontend (Vitest)

- `TeamSetupPanel`: host can add/remove teams within bounds; validation messages render.
- `TeamSlotsBoard`: clicking an empty slot fires the right mutation; host move-other works; non-host can only move self.
- Chat channel switcher: switches scope; messages render with correct color.

### 9.3 E2E (Playwright)

- 4v4 happy path: 8 humans (mocked sessions) join, host configures teams, players self-pick, game starts, attacks resolve, team wins.
- 2v6 with bots: host adds bots to fill team A; game starts and runs to completion.
- Hide-ships toggle on: teammate ships are not rendered on the viewer's screen; attack-history cells are.
- Team chat: messages from one team are not delivered to another team (asserted via DOM).

## 10. Migration & rollout

- No database migration required; `gameOptions` is a flexible object and `SeaBattleState` additions are optional.
- Existing rooms remain FFA. Nothing changes for them.
- Feature flag: not required given the toggle is opt-in per room and FFA paths are untouched. (If desired, can be gated behind an env-driven feature flag during early QA.)

## 11. Risks & mitigations

| Risk                                                                                     | Mitigation                                                                                                         |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Engine branching grows complex over time                                                 | Keep team-mode logic in dedicated helper functions (`team-rotation.utils.ts`, etc.) and keep the engine class lean |
| Lobby state desync (host changes config while a player is mid-pick)                      | Last-write-wins on the server; clients re-render from the authoritative room update                                |
| Bot decisions leak hidden info                                                           | Bots operate on the same sanitized state as humans; verified by tests                                              |
| Eliminated players can still see live game (intentional) but could share info externally | Out of scope; same risk exists in any team game; team chat is in-game only                                         |
| 8-player FFA expectation creep                                                           | Doc that FFA stays max 6; team mode is the path to 8                                                               |

## 12. Open questions / follow-ups

- Lobby drag-and-drop on mobile may need a tap-to-move alternative (covered in UX design).
- Future: cross-engine team primitive on `GameRoom` itself if Critical/Texas Hold'em adopt teams (not now).
- Future: ranked / persistent teams.

## 13. File-touch summary

**Backend (`apps/be/src/games/`):**

- `engines/sea-battle/sea-battle.engine.ts` — team-mode branches.
- `engines/sea-battle/sea-battle.types.ts` — team types.
- `engines/sea-battle/sea-battle.utils.ts` — sanitize team-aware.
- `engines/sea-battle/sea-battle.validators.ts` — teammate-attack rejection.
- `engines/sea-battle/team-rotation.utils.ts` (new) — team/shooter pointer logic.
- `engines/base/game-engine.interface.ts` — add `'team'` to `ChatScope`.
- `dtos/` — new team-action DTOs.
- `rooms/game-rooms.service.ts` — team mutations.
- `sea-battle/sea-battle-bot.service.ts` — team-aware targeting.
- `sea-battle.gateway.ts` — new team-mode socket events (`set_team_mode`, `set_team_config`, `assign_team`, `add_bot_to_team`, `remove_bot_from_team`, `toggle_hide_ships`). Generic room-level events stay in `games.gateway.ts`.
- `sessions/game-sessions.service.ts` — pass team config into engine init.

**Frontend (`apps/web/src/`):**

- `features/games/sea-battle/lobby/` — new TeamModeToggle, TeamSetupPanel, TeamSlotsBoard, UnassignedPool components (exact location follows existing conventions).
- `features/games/sea-battle/play/` — roster grouping, board rendering teammate vs enemy, chat channel switcher.
- `shared/lib/socket` — new event handlers wired up.
- i18n locale files in all 5 languages.

**Shared (`packages/ui`):**

- Likely no additions; reuse existing primitives. `/check-ui-components` will confirm.
