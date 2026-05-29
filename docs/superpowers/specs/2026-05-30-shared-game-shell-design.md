# Shared Game Shell — Design

**Date:** 2026-05-30
**Status:** Approved (decisions delegated by user: "select recommended until PR open")

## Problem

Every game widget should share one component for its chrome — music, fullscreen,
chat, and a turn indicator with the on-clock player's avatar — so that adding a
new game gets all of this for free.

Today the chrome is split and inconsistently adopted:

- **Page chrome** ([GamePageLayout](../../../apps/web/src/app/[locale]/games/rooms/[id]/components/GamePageLayout.tsx))
  already wraps **every** game and provides music
  ([GameMusic](../../../apps/web/src/features/games/ui/GameMusic.tsx)),
  page-level fullscreen, the
  [GamesControlPanel](../../../apps/web/src/widgets/GamesControlPanel/ui/GamesControlPanel.tsx)
  (sound/music/rules/chat-toggle/share/leave), the
  [GameChat](../../../apps/web/src/widgets/GameChat/ui/GameChat.tsx) panel, and
  connection overlays. This layer is **not** the problem — it is already shared.
- **Widget chrome**
  ([GameWidgetContainer](../../../apps/web/src/features/games/ui/GameWidgetContainer.tsx))
  provides the in-widget sticky header (variant emoji, title, subtitle, turn
  pill + optional avatar), the green my-turn border, widget-level fullscreen,
  board/table/hand slots, and the chat popup overlay.

**Adoption gaps:**

| Game         | Uses `GameWidgetContainer`?                                                                                                 | Turn display                                      |
| ------------ | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| Cascade      | ✅                                                                                                                          | `turnStatusText` only (no avatar)                 |
| TicTacToe    | ✅                                                                                                                          | `turnStatusText` only (no avatar)                 |
| SeaBattle    | ✅                                                                                                                          | free-form `turnAvatar` ReactNode it builds itself |
| **Critical** | ❌ rolls its own `GameContainer` + custom header + own fullscreen/chat popup (the shared container was extracted _from_ it) | bespoke                                           |
| **Glimworm** | ❌ real-time PixiJS canvas; no turn concept                                                                                 | none                                              |

Each adopter also re-implements the turn display differently, so it is not
actually "for free."

## Goals

1. One shared widget shell every game renders. `GamePageLayout` stays as the
   page-level wrapper (music/control-panel/chat/overlays) — it is already
   shared and out of scope to merge.
2. A **standard turn contract**: the shell owns a `TurnIndicator` that renders
   the on-clock player's avatar + name + "Your turn / {name}'s turn". A new
   game passes `{ onClockUserId, isMyTurn, isGameOver }` and gets the full
   display — no per-game header markup.
3. Migrate **Critical** onto the shared shell with the standard header;
   relocate its idle-timer + autoplay controls into the header `extraActions`
   slot.
4. Give **Glimworm** a no-turn header variant on the same shell (status text,
   e.g. countdown / alive-count, instead of a turn pill).
5. Update the `/new-game` skill scaffold to use the turn contract by default.

## Non-Goals (YAGNI)

- Merging `GamePageLayout` into the widget shell (the rejected "full GameShell"
  option). Page chrome stays where it is.
- Redesigning `GamesControlPanel`, `GameChat`, `GameMusic`, or `GameResultModal`.
- Changing any backend, game engine, or socket behavior.
- Reworking Critical's gameplay grid (`MatchWidget`, arena, hand) beyond moving
  its header-level controls.

## Design

### 1. TurnIndicator (new shared component)

`apps/web/src/features/games/ui/TurnIndicator.tsx`

Renders inside the header turn pill. Props:

```ts
interface TurnIndicatorProps {
  /** id of the player currently on the clock; null when nobody is (game over / setup) */
  onClockUserId: string | null;
  /** is the local player the one on the clock */
  isMyTurn: boolean;
  /** game finished — show a neutral "completed" state instead of a turn */
  isGameOver?: boolean;
  /** override the resolved display name for the on-clock player (optional) */
  onClockName?: string;
}
```

Behavior:

- Resolves the on-clock player's display name + cosmetics via the existing
  pieces already wired by `GamePageLayout`: name from the `GameChat` store's
  `resolveDisplayName`, avatar via the existing
  [InGameAvatar](../../../apps/web/src/features/games/ui/InGameAvatar.tsx)
  (which itself reads equipped cosmetics from the game store by `playerId`).
  This is why a new game needs to pass only an id.
- Renders: `<InGameAvatar size="icon" />` + a label.
  - `isGameOver` → status `completed`, label "Game over".
  - `isMyTurn` → status `yourTurn`, label "Your turn".
  - otherwise → status `waiting`, label "{name}'s turn" (or "Waiting…" when
    `onClockUserId` is null).
- All labels come through i18n (`games.table.*`); no hardcoded strings.

### 2. GameWidgetContainer header gains a turn contract

Extend `SharedHeaderProps` so a game can pass the turn contract instead of
hand-building `turnAvatar` + `turnStatusText` + `turnStatusVariant`:

```ts
interface SharedHeaderProps {
  variantEmoji: string;
  title: string;
  subtitle?: string;
  titleGradient?: string;
  extraActions?: React.ReactNode;

  // NEW — preferred: declarative turn contract
  turn?: {
    onClockUserId: string | null;
    isMyTurn: boolean;
    isGameOver?: boolean;
    onClockName?: string;
  };

  // EXISTING — kept for back-compat / non-turn games:
  turnStatusVariant?: TurnStatusVariant;
  turnStatusText?: string;
  turnAvatar?: React.ReactNode;
}
```

Header rendering rules:

- If `turn` is present → render `<TurnIndicator {...turn} />` inside the pill;
  the pill's `$status` is derived from the same turn fields.
- Else if `turnStatusText`/`turnAvatar` present → render the existing pill
  (Glimworm uses this for a no-turn status; raw escape hatch preserved).
- The `header` escape-hatch prop stays for any future fully-custom header, but
  no game will use it after this refactor.

`extraActions` already exists and renders before the fullscreen button — this
is where Critical's idle-timer + autoplay relocate.

### 3. Migrate the three current adopters to the turn contract

- **TicTacToe / Cascade**: replace `turnStatusVariant`+`turnStatusText` with
  `turn={{ onClockUserId, isMyTurn, isGameOver }}`. They gain the avatar for
  free. The standalone `TurnBadge` inside their `board` is reviewed: keep if it
  shows board-specific detail (active color / direction), otherwise drop in
  favor of the header indicator. (Cascade's `TurnBadge` shows active color +
  direction → **keep**; it is board state, not turn identity.)
- **SeaBattle**: replace its hand-built `turnAvatar` block with the `turn`
  contract; delete the local `InGameAvatar` wiring it duplicated.

### 4. Migrate Critical onto the shell

- Replace Critical's own `GameContainer` (styles/layout.tsx) usage in
  [Game.tsx](../../../apps/web/src/widgets/CriticalGame/ui/Game.tsx) /
  [ActiveGameView.tsx](../../../apps/web/src/widgets/CriticalGame/ui/ActiveGameView.tsx)
  with `GameWidgetContainer`.
- Header → standard `headerProps` with the `turn` contract derived from
  Critical's `currentPlayer` / `isMyTurn` / `isGameOver`.
- `IdleTimerDisplay` + `AutoplayControls` → `extraActions`.
- Critical's `SceneBackdrop` / scene palette stays inside the `board` slot.
- Critical's own widget-level fullscreen + chat-popup are removed (the shell
  provides both). Keep `criticalWidgetFullscreenStyles` deletion in scope.
- The complex grid (`MatchWidget`, opponents row, arena, hand) renders inside
  the `board` slot unchanged.

### 5. Glimworm no-turn header

- Wrap Glimworm's in-game canvas in `GameWidgetContainer` with a `headerProps`
  that uses the existing `turnStatusText` escape hatch (no `turn` contract):
  status text reflects countdown / playing / ended (e.g. alive-count). No turn
  pill, no avatar — turns don't exist in a real-time game.
- Glimworm's HUD/overlays stay inside the `board` slot. The canvas must still
  size correctly inside `SharedGameBoard` (min-height preserved).
- Lobby still early-returns outside the container (matches every other game).

### 6. `/new-game` scaffold

Update [.claude/skills/new-game/SKILL.md](../../../.claude/skills/new-game/SKILL.md)
Game.tsx pattern to pass the `turn` contract instead of manual
`turnStatusVariant`/`turnStatusText`, and document `TurnIndicator` + the
no-turn `turnStatusText` escape hatch for real-time games.

## Data Flow

```
GamePageLayout (page chrome, already shared)
  ├─ registers resolveDisplayName / resolveEquipped / currentUserId → GameChat store
  └─ <Game /> (per registry)
        └─ GameWidgetContainer (shared shell)
              ├─ header: TurnIndicator(onClockUserId,isMyTurn) ──┐
              │     ├─ name  ← GameChat store.resolveDisplayName  │ for free,
              │     └─ avatar← InGameAvatar(playerId) ← game store│ id only
              ├─ extraActions (Critical: idle timer + autoplay)
              ├─ board / tableArea / handSection (per-game)
              ├─ modals (per-game; GameResultModal shared)
              └─ GameChatPopupOverlay (shared)
```

## Error / Edge States

- `onClockUserId` null (setup, between turns, spectator) → "Waiting…", no
  avatar crash (InGameAvatar only renders when id present).
- Player not in roster yet (late join) → name falls back to "opponent"/id via
  the existing resolver fallback chain in `GamePageLayout`.
- Game over → `completed` status regardless of whose clock it was.
- Glimworm (no `turn`) → never touches TurnIndicator.

## Testing

- **TurnIndicator unit tests** (Vitest): my-turn, other-turn (renders name +
  avatar), null id (waiting), game-over (completed). Verify i18n keys, not
  literals.
- **GameWidgetContainer** test: `turn` contract renders TurnIndicator; legacy
  `turnStatusText` path still renders raw pill (Glimworm).
- Update existing SeaBattle/TicTacToe/Cascade widget tests for the new header.
- Critical: keep existing `MatchWidget`/`TurnBanner` tests green; add a smoke
  test that `ActiveGameView` renders inside the shared shell with the turn pill.
- Manual/Playwright: existing game e2e smoke per game still passes (lobby →
  start → header shows correct turn → fullscreen toggles → chat opens).
- Verify with `pnpm lint`, `pnpm test` (web), `pnpm build`, and
  `pnpm check-file-length`.

## Rollout / Risk

- Highest risk: Critical migration (large, intricate, well-tested widget).
  Mitigation — migrate the container/header only; leave the gameplay grid
  untouched, lean on existing Critical tests, add a shell smoke test.
- Back-compat: keeping the legacy `turnStatusText`/`turnAvatar` props means the
  migration can land game-by-game without a flag day.

## Files Touched (estimate)

- NEW `apps/web/src/features/games/ui/TurnIndicator.tsx` (+ test)
- `apps/web/src/features/games/ui/GameWidgetContainer.tsx`
- `apps/web/src/features/games/ui/index.ts` (export TurnIndicator)
- `apps/web/src/widgets/CascadeGame/ui/Game.tsx`
- `apps/web/src/widgets/TicTacToeGame/ui/Game.tsx`
- `apps/web/src/widgets/SeaBattleGame/ui/Game.tsx`
- `apps/web/src/widgets/CriticalGame/ui/{Game,ActiveGameView}.tsx` (+ styles cleanup)
- `apps/web/src/widgets/GlimwormGame/GlimwormGame.tsx`
- `.claude/skills/new-game/SKILL.md`
- i18n locale files (`en/ru/es/fr/by`) for any new `games.table.*` turn keys.
