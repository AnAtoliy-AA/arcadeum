---
name: new-game
description: Add a complete new multiplayer game to Arcadeum (BE engine + service + gateway + bot, web widget, landing page, registries, i18n, tests). Use when the user says "implement game X" or "add a new game".
---

This skill turns a single instruction ("implement chess", "add Connect Four") into a fully wired, shippable game. Follow every step in order — partial wiring causes the runtime errors listed in the Gotchas section.

## Reference implementations

When in doubt, **mirror sea-battle** ([apps/be/src/games/engines/sea-battle/](apps/be/src/games/engines/sea-battle/), [apps/web/src/widgets/SeaBattleGame/](apps/web/src/widgets/SeaBattleGame/)) — it is the canonical full-stack game. The most recent reference is tic-tac-toe ([apps/be/src/games/engines/tic-tac-toe/](apps/be/src/games/engines/tic-tac-toe/), [apps/web/src/widgets/TicTacToeGame/](apps/web/src/widgets/TicTacToeGame/)).

## Naming convention

Pick a short snake_case id with `_v1` suffix: `chess_v1`, `connect_four_v1`. Use it consistently:
- Engine id: `chess_v1`
- Widget folder: `ChessGame`
- Landing route: `/games/chess`
- Socket event prefix: `chess.session.*` (camelCase, matches existing pattern: `ticTacToe.session.*`, `seaBattle.session.*`)

## Architecture (two halves)

**Backend half** — engine (pure logic) + service (orchestration) + gateway (socket events) + bot.
**Web half** — widget (UI) + registry entry (lazy loader) + landing page (SEO marketing) + create-page integration + home featured-games entry.

A game is "done" only when **all** of: BE catalog + BE module + web registry + web GameType unions (two!) + landing route + home + create page + admin (auto via catalog) + i18n (5 locales) + SEO + tests + PR.

## Step-by-step checklist

### 1. Brainstorm + design (skip only if user gave full spec)

Use `/brainstorming` to capture: player count, board/state shape, win condition, variants (visual themes), team mode, bot strategy, special rules. Save spec to `docs/superpowers/specs/YYYY-MM-DD-<game>-design.md`. Then `/writing-plans` for an implementation plan at `docs/superpowers/plans/YYYY-MM-DD-<game>.md`.

### 2. Backend engine

Create `apps/be/src/games/engines/<game>/`:
- `<game>.constants.ts` — `MIN_PLAYERS`, `MAX_PLAYERS` (overall ceiling), variants array, defaults. **If the game has per-option player caps** (e.g. tic-tac-toe's 3×3=2 / 5×5=3 / 7×7=4 / 9×9=5), export a `MAX_PLAYERS_BY_<OPTION>` map. The service enforces the per-option cap at `startSession`; `MAX_PLAYERS` is the union ceiling so the room layer never grows past what any variant supports.
- `<game>.types.ts` — `State`, `Options`, `Player`, `Team`, action payloads. State **must include** `logs: GameLogEntry[]`
- `<game>.utils.ts` — pure helpers (e.g. win detection)
- `<game>.validators.ts` — return `{ ok: true } | { ok: false, error: string }`
- `<game>.engine.ts` — `extends BaseGameEngine<State>` from `apps/be/src/games/engines/base/base-game.engine`. Implement: `getMetadata` (returns `GameMetadata`), `initializeState`, `validateAction`, `executeAction`, `isGameOver`, `getWinners`, `sanitizeStateForPlayer`, `getAvailableActions`.

`GameLogEntry` and the `createLogEntry` helper live in `apps/be/src/games/engines/base/game-log.ts`. State must include `logs: GameLogEntry[]`; push entries from `executeAction` so the shared chat can render them.

Register the engine in [apps/be/src/games/engines/engines.module.ts](apps/be/src/games/engines/engines.module.ts).

### 3. Backend service + bot + gateway

Two separate locations — **don't put the gateway in the subdir**:

```
apps/be/src/games/<game>/
  <game>.service.ts        ← orchestrates GameRoomsService, GameSessionsService,
                              GameHistoryService, GamesRealtimeService.
                              Watchdog interval if turns are time-bounded.
  <game>-bot.service.ts    ← dispatch strategy by difficulty / state size.

apps/be/src/games/
  <game>.gateway.ts        ← SIBLING of the subdir, NOT inside it.
                              Mirrors sea-battle.gateway.ts / tic-tac-toe.gateway.ts.
```

Gateway handlers use `@SubscribeMessage('<camelCase>.session.start' | '.<action>' | '.forfeit')` — see Socket events parity below.

Wire into [apps/be/src/games/games.module.ts](apps/be/src/games/games.module.ts) — add all three as providers; gateway is a provider, not an export.

**Socket events parity (BE ↔ FE):** the strings in `@SubscribeMessage(...)` on the BE gateway MUST match the strings in `gameSocket.emit(...)` from the FE's `useActions.ts` hook, character for character. Drift here results in silent no-ops with no error.

### 4. Backend catalog

Add the game to [apps/be/src/games/games.catalog.ts](apps/be/src/games/games.catalog.ts):
```ts
{ gameId: '<game>_v1', variants: ['classic', 'neon', ...] },
```
This entry **also drives `/admin/games` visibility** — without it, admins can't see the game.

### 5. Web widget

Create `apps/web/src/widgets/<Name>Game/`:
```
types/index.ts              ← props, state, options, log entry types
lib/constants.ts            ← VARIANTS array — id, name (i18n key), emoji, gradient
lib/theme.ts                ← getTheme(variant) → token map (board/cell/mark colors…)
lib/<Name>ThemeContext.tsx  ← Provider + useTheme hook
hooks/useState.ts           ← Zustand selector → derived snapshot
hooks/useActions.ts         ← gameSocket.emit wrappers — strings MUST match BE gateway
hooks/index.ts              ← barrel re-export
ui/Game.tsx                 ← root; default-export memoized
ui/Lobby.tsx                ← wraps shared ReusableGameLobby, supplies an optionsSlot
ui/Board.tsx                ← in-game UI
ui/TurnBadge.tsx
ui/RulesModal.tsx           ← in-game rules (uses @arcadeum/ui Modal primitives)
index.ts                    ← barrel — must default-export the memoized Game
                              (the registry does import('@/widgets/<Name>Game'))
```

**Critical Game.tsx pattern** (mirror sea-battle exactly):

```tsx
if (!room) return null;

// Lobby renders OUTSIDE GameWidgetContainer so it gets full page height.
// The container's `board` slot is sized for the in-game grid.
if (isLobby) {
  return (
    <ThemeProvider variant={options.variant}>
      <Lobby ...props />
    </ThemeProvider>
  );
}

const board = (
  <YStack gap="$3" alignItems="stretch" padding="$3" width="100%">
    {snapshot ? <><TurnBadge .../><Board .../></> : null}
  </YStack>
);

return (
  <ThemeProvider variant={options.variant}>
    <GameWidgetContainer
      board={board}
      modals={modals}
      variant={options.variant}
      isMyTurn={myTurn}
      isGameOver={isGameOver}
      headerProps={{
        variantEmoji: variantTokens.emoji,
        title: '<Name>',
        subtitle: room?.name,
        // The declarative turn contract: pass only the on-clock player's id +
        // whether it's your turn. The shared shell renders the turn-with-avatar
        // pill (avatar + name + "Your turn / {name}'s turn") for free — no
        // per-game header markup, no manual turnStatusText.
        turn: {
          onClockUserId: currentTurnUserId, // e.g. snapshot.currentEntryId
          isMyTurn: myTurn,
          isGameOver,
        },
      }}
    />
  </ThemeProvider>
);
```

**Turn header — always use the `turn` contract.** `onClockUserId` is the
**userId** of the player on the clock (compare it against `currentUserId` to
derive `myTurn`). The shell resolves their display name (chat-store resolver,
registered via `useGameChatIntegration`) and equipped avatar
([InGameAvatar](apps/web/src/features/games/ui/InGameAvatar.tsx)). Pass `null`
when nobody is on the clock (setup / between turns) → the pill shows "Waiting…".

**Real-time games (no turns)** — skip the `turn` contract and use the legacy
escape hatch instead: `turnStatusText` + `turnStatusVariant` for a plain status
pill (see [GlimwormGame](apps/web/src/widgets/GlimwormGame/GlimwormGame.tsx),
which shows Get ready / In play / Round over with no avatar).

**Critical Board.tsx pattern** — the grid container MUST have explicit `width: '100%'` plus `boxSizing: 'border-box'`. Without `width`, an `aspectRatio: '1/1'` grid of empty buttons collapses to ~0px and you see only a colored sliver. See [apps/web/src/widgets/TicTacToeGame/ui/TicTacToeBoard.tsx](apps/web/src/widgets/TicTacToeGame/ui/TicTacToeBoard.tsx).

**End-game UI: reuse the shared [GameResultModal](apps/web/src/features/games/ui/GameResultModal.tsx).** Don't write a per-game game-over modal. It already handles victory/defeat/draw tones (gold / red / silver), confetti, rematch button, animated entrance, and `Back to home` link. If your game's vocabulary differs from `games.table.victory/defeat/draw`, pass a `messages={{ title, message? }}` prop to override the headline/body without touching shared i18n. Map your game's local result type (`'won'|'lost'|'draw'`) to the shared `'victory'|'defeat'|'draw'` before passing it in. See [apps/web/src/widgets/TicTacToeGame/ui/Game.tsx](apps/web/src/widgets/TicTacToeGame/ui/Game.tsx).

**Required Game.tsx hooks:** every widget needs the same shared hooks wired the same way. Forgetting one means: no rematch (no `useRematch`), no chat panel (no `useGameChatIntegration`), or runtime errors when passing `t` to `GameResultModal` (no `useTranslation`).

```tsx
const { t } = useTranslation();
const { rematchLoading, handleRematch } = useRematch({ roomId });
useGameChatIntegration(snapshot?.logs as never, (_msg, _scope) => {
  // chat sends go through the shared composer — no game-specific socket event
});
```

**Lobby pattern:** `<Name>Lobby.tsx` wraps the shared `ReusableGameLobby` and only contributes an `optionsSlot` (variant picker, board-size selector, team toggle, etc.). Don't reimplement the player list, kick controls, host badge, or start button — they live in `ReusableGameLobby`.

### 6. Web registry — three files

a. [apps/web/src/features/games/registry.ts](apps/web/src/features/games/registry.ts) — add lazy loader:
```ts
'<game>_v1': () => import('@/widgets/<Name>Game'),
```
Plus a metadata entry with: `name`, `description`, `category`, `minPlayers`, `maxPlayers` (overall ceiling — match BE engine `getMetadata()`), `estimatedDuration`, `complexity`, `ageRating`, `thumbnail`, `version`, `supportsAI`, `tags`, `status` (`'stable'|'beta'`).

b. [apps/web/src/features/games/lib/gameIdMapping.ts](apps/web/src/features/games/lib/gameIdMapping.ts) — add `'<game>_v1'` to **both** the `GameType` union AND the `VALID_GAME_IDS` array.

c. [apps/web/src/features/games/hooks/useGameActions.ts](apps/web/src/features/games/hooks/useGameActions.ts) — has a **separate** `GameType` union (yes, duplicated). Add `'<game>_v1'` here too. **Forgetting this throws "Unsupported game type" at runtime.**

### 7. Landing page

Create `apps/web/src/app/[locale]/games/<game>/`:
- `page.tsx` — server component with `buildPageMetadata` + `JsonLd` VideoGame schema
- `<Name>Landing.tsx` — hero, highlights, steps, themes, rules, FAQ, CTAs, breadcrumbs
- `<Name>Hero.tsx` — static decorative board/state preview
- `<Name>ThemesGrid.tsx`
- `<Name>FinalCtaButtons.tsx`
- `opengraph-image.tsx` — 1200×630 `ImageResponse`
- `twitter-image.tsx` — `export { default } from './opengraph-image'`

Add to:
- [apps/web/src/shared/config/routes.ts](apps/web/src/shared/config/routes.ts) — `<game>Landing: '/${locale}/games/<game>'`
- [apps/web/src/shared/seo/buildPageMetadata.ts](apps/web/src/shared/seo/buildPageMetadata.ts) — `DEFAULT_PATH_BUILDERS` entry

**`createRoomHref` MUST use `?gameId=<game>_v1`** (the param name `GameCreateView` reads via `searchParams.get('gameId')`). Don't invent `?slug=` or `?game=` — those silently fall through to `VISIBLE_GAMES[0]` (Critical) and the user lands on the wrong preselected game. Don't append `&variant=...`; the view defaults to `themesFor(gameId)[0]` and appending a default would duplicate the param when the themes-grid links add their own.

### 8. Home + Create page

a. [apps/web/src/app/[locale]/home/data/games.ts](apps/web/src/app/[locale]/home/data/games.ts) — add to `featuredGames` (players range, duration, `landingHref`, variant count).

a2. **Home featured-card symbol** — create `apps/web/src/app/[locale]/home/components/featured-games/symbols/<Name>Symbol.tsx` (64×64 SVG using `stroke="currentColor"`, mirroring [SeaBattleSymbol.tsx](apps/web/src/app/[locale]/home/components/featured-games/symbols/SeaBattleSymbol.tsx)). Export it from `symbols/index.ts` and add a `case '<game>_v1':` branch to [`GameSymbol`](apps/web/src/app/[locale]/home/components/featured-games/gameMeta.tsx). Without this, the home card cover renders `null` instead of a glyph.

b. [apps/web/src/features/games/ui/create/redesign/data/themes.ts](apps/web/src/features/games/ui/create/redesign/data/themes.ts):
- Extend `GameId` union
- Add `GAMES` entry
- Add to `VISIBLE_GAMES`
- Add `<NAME>_THEMES` constant
- Add a `themesFor()` branch
- Export a `find<Name>Theme()` helper

c. [apps/web/src/features/games/ui/create/redesign/ThemePicker.tsx](apps/web/src/features/games/ui/create/redesign/ThemePicker.tsx) — add picker block for the game. **The button MUST include a `<div className={s.themeArt}>` with a real-board thumbnail** (mirroring sea-battle's `SeaBattleBoardPoster` and critical's `CriticalMiniCluster`). Text-only picker cards look broken next to other games. Create `art/<Name>BoardPoster.tsx` as a pure SVG that renders a fixed mid-game snapshot using the widget's per-variant palette (import `getTheme(variant)` from the widget's `lib/theme.ts` — don't re-declare palettes). Use `preserveAspectRatio="xMidYMid slice"` and fill the container with the variant background — the poster slot is wide (16:9 sm, 5:4 lg), not square. See [apps/web/src/features/games/ui/create/redesign/art/TicTacToeBoardPoster.tsx](apps/web/src/features/games/ui/create/redesign/art/TicTacToeBoardPoster.tsx).

d. [apps/web/src/features/games/ui/create/redesign/art/GameArt.tsx](apps/web/src/features/games/ui/create/redesign/art/GameArt.tsx) — **MUST add a branch for the new game**. This component routes the small game-card thumbnail (left grid on `/games/create`) AND the right-rail LIVE PREVIEW. The default fallback is the Glimworm snake poster, so any unrouted game silently renders as glowing snake trails. Add: `if (gameId === '<game>_v1') return <NameBoardPoster theme={find<Name>Theme(themeId)} size={size} />;`

e. [apps/web/src/features/games/ui/create/redesign/RulesAccess.tsx](apps/web/src/features/games/ui/create/redesign/RulesAccess.tsx) — wire the game's `RulesModal` here. Without this, the "Game Rules" button on the create-page rail renders but does nothing when clicked (the button is only hidden for `glimworm_v1`; every other game shows it). Add a `dynamic()` import for `@/widgets/<Name>Game/ui/RulesModal` and a `gameId === '<game>_v1' ? <NameRulesModal ... /> : null` branch.

f. **Mount the same `RulesModal` in BOTH the lobby AND the in-game branch of `Game.tsx`.** The room shell ([GameRoomPage](apps/web/src/app/[locale]/games/rooms/[id]/components/GameRoomPage.tsx)) drives `showRulesOpen` from a header button that's visible mid-game; the widget receives `showRulesOpen` / `onShowRulesClose` as props. If you only mount the modal in the lobby's render branch, clicking the in-game rules button toggles state but no modal appears. Wire it via the in-game `modals` slot alongside `GameResultModal`. The header rules trigger is built into the shared shell — you do NOT need to add a button anywhere.

g. [apps/web/src/features/games/ui/create/redesign/GameCreateView.tsx](apps/web/src/features/games/ui/create/redesign/GameCreateView.tsx):
- Add to `URL_TO_GAME_ID`
- Add a `buildGameOptions()` branch returning the game's `Options` shape

### 9. i18n — write keys BEFORE referencing them

`TranslationKey` is strictly typed against the catalog. **Components that reference missing keys fail typecheck.** Write all five locale files first:

```
apps/web/src/shared/i18n/messages/games/<game>/{en,es,fr,ru,by}.ts
apps/web/src/shared/i18n/messages/seo/{en,es,fr,ru,by}.ts  ← add <game>Landing
```

Cover: landing (hero/highlights/steps/themes/rules/faq), lobby (variants/options/players/start/leave), in-game (turn/status/result), chat scopes, errors, each variant name+description.

### 10. Tests

- **BE engine**: `apps/be/src/games/engines/<game>/<game>.engine.spec.ts` — happy path, win conditions, illegal actions, forfeit
- **BE service**: orchestration smoke
- **BE bot**: difficulty-by-difficulty pickMove (use real engine state, not mocks — see lessons in [feedback_pull_develop_before_push](.claude/projects/.../memory/))
- **Web hooks**: vitest for `useState`/`useActions`
- **Web widget**: render test with `TamaguiProvider defaultTheme="light"`
- **Playwright e2e**: lobby → start → place move → win (can be deferred and listed as follow-up in PR)

### 11. Before-PR punch list

Walk this list manually — these are the surfaces where missing wiring causes silent regressions (text-only thumbnails, "Unsupported game type" toasts, button-clicks that toggle state into the void, etc.):

- [ ] BE engine registered in `engines.module.ts`; service+bot+gateway in `games.module.ts`; entry in `games.catalog.ts`.
- [ ] Web widget folder has an `index.ts` barrel that default-exports the memoized `Game`.
- [ ] Widget registered in `features/games/registry.ts` (loader + metadata).
- [ ] `<game>_v1` added to **both** `GameType` unions: `lib/gameIdMapping.ts` AND `hooks/useGameActions.ts`.
- [ ] Landing route in `shared/config/routes.ts` + `seo/buildPageMetadata.ts`; CTA uses `?gameId=`.
- [ ] Home featured-card: data entry in `home/data/games.ts` + symbol branch in `gameMeta.tsx`.
- [ ] Create page: `themes.ts` + `ThemePicker.tsx` block + `art/<Name>BoardPoster.tsx` + `GameArt.tsx` branch + `GameCreateView.tsx` branch.
- [ ] Rules modal mounted in lobby AND in-game branches of `Game.tsx`; also wired in `RulesAccess.tsx`.
- [ ] End-game modal is the shared `GameResultModal`, not a per-game one.
- [ ] i18n keys present in all 5 locales (en, es, fr, ru, by) — including SEO entries.
- [ ] BE engine spec + bot spec passing; web hook/widget vitest passing.
- [ ] [`apps/web/e2e/home-games-slider.spec.ts`](apps/web/e2e/home-games-slider.spec.ts) — bump the expected `toHaveCount(N)` and add the new game's `<h3>` assertion; the test hardcodes the featured-games count and order.

**Mobile scope:** the new-game flow targets web + BE only. Add a mobile screen only if the user explicitly asks; otherwise note "mobile follow-up" in the PR.

### 12. Verify locally, then PR

```bash
pnpm --filter @arcadeum/be test
pnpm --filter @arcadeum/web test
pnpm --filter @arcadeum/be lint
pnpm --filter @arcadeum/web lint
pnpm --filter @arcadeum/be typecheck
pnpm --filter @arcadeum/web typecheck
pnpm check-file-length
```

If the pre-push hook flakes (known: see [feedback_web_pre_push_hook_flaky](memory)), verify tests in isolation then push with `--no-verify`. **PR base is `develop`, never `main`** — see [feedback_pr_base_develop](memory).

```bash
gh pr create --base develop --title "feat(games): add <name> (ARC-XXX)" --body "..."
```

## Gotchas (every one of these bit us during tic-tac-toe)

1. **Two `GameType` unions.** [gameIdMapping.ts](apps/web/src/features/games/lib/gameIdMapping.ts) AND [useGameActions.ts](apps/web/src/features/games/hooks/useGameActions.ts). Missing the second throws "Unsupported game type: <id>" at runtime, not compile time.

2. **Lobby inside `GameWidgetContainer.board` collapses.** That slot is sized for the in-game grid. Early-return the lobby OUTSIDE the container (sea-battle pattern).

3. **Grid `aspectRatio` without `width: '100%'` collapses to 0px** when children are empty buttons. Always set both `width: '100%'` and `boxSizing: 'border-box'` on the grid container.

4. **Write i18n keys first.** `TranslationKey` validates strictly — component code referencing missing keys won't typecheck.

5. **`GameWidgetContainer` is not children-based.** Props are `board`, `modals`, `headerProps`, `variant`, `isMyTurn`, `isGameOver`. Don't pass children.

6. **Header turn display is the shared `turn` contract**, not hand-rolled text/avatar. Pass `headerProps.turn = { onClockUserId, isMyTurn, isGameOver }` and the shell renders avatar + name + turn label for free. Only real-time/no-turn games fall back to `turnStatusText` + `turnStatusVariant`.

7. **In-game chat popups are free** — the shell renders `GameChatPopupOverlay` for incoming messages. Leave `showChatPopup` at its default (`true`). Only pass `showChatPopup={false}` if your game shows incoming chat its own way (e.g. per-player bubbles) and you need to avoid double display.

6. **`SharedHeaderProps` field names:** `variantEmoji`, `title`, `subtitle`, `turnStatusVariant`, `turnStatusText` (not `gameTitle` / `gameIcon`).

7. **`TurnStatusVariant`** union is `'completed' | 'yourTurn' | 'waiting'` — camelCase, not kebab.

8. **`useRematch`** returns `{ rematchLoading, handleRematch }` (not `loading` / `handleRematchClick`). No `currentUserId` option.

9. **`useGameChatIntegration`** signature is positional: `(logs, sendMessage, resolveDisplayName?, resolveActorColor?)`. Not an options object.

10. **`GameRoomSummary.members`** (not `participants`); each member has `id` (not `userId`).

11. **Tamagui prop strictness:** `Dialog` has no `animation` prop; `Button` has no `themeInverse` prop. Don't add either.

12. **`TamaguiProvider` test render** needs `defaultTheme="light"`.

13. **`GameLogEntry` helper** options: `targetId?: string` — pass `undefined`, not `null`.

14. **Bot test setup:** when testing "bot must block", make sure the bot can't *win* on the same move — otherwise it takes the win and your blocking assertion fails.

15. **Theme picker thumbnail required.** A text-only theme card looks broken next to sea-battle/critical cards that render real boards. Always ship `art/<Name>BoardPoster.tsx` (SVG with a fixed mid-game snapshot) and wire it via `<div className={s.themeArt}>` inside the picker button — pull palette tokens from the widget's `getTheme(variant)`, don't redeclare.

16. **`GameArt.tsx` default falls through to Glimworm snake art.** If you ship a new game and forget to add a branch in `art/GameArt.tsx`, the small game-card thumbnail on `/games/create` AND the right-rail LIVE PREVIEW will both render glowing pink/green snake trails. Always add `if (gameId === '<game>_v1') return <YourBoardPoster ...>` alongside the branches for critical/sea-battle/tic-tac-toe.

17. **`GameSymbol` default returns `null`.** [home/components/featured-games/gameMeta.tsx](apps/web/src/app/[locale]/home/components/featured-games/gameMeta.tsx) is a `switch (gameId)` that returns `null` in its default branch — so a missing case renders an empty cover glyph on the home featured-card. Always add the `case '<game>_v1':` and ship a sibling SVG in `symbols/`.

18. **Landing-page CTA must use `?gameId=`.** `GameCreateView` reads `searchParams.get('gameId')`; any other query key (`?slug=`, `?game=`) is silently ignored and the user lands on Critical (the first entry of `VISIBLE_GAMES`). Sea Battle's landing is the reference: `${routes.gameCreate}?gameId=${SLUG}`.

19. **"Game Rules" button needs its modal wired in `RulesAccess`.** [RulesAccess.tsx](apps/web/src/features/games/ui/create/redesign/RulesAccess.tsx) always renders the button (it only hides for Glimworm). For every other game, you must add a `gameId === '<game>_v1' ? <NameRulesModal .../> : null` branch — otherwise clicking the button toggles `open` but no modal mounts. **Watch the prop name**: sea-battle/critical use `isOpen`, but tic-tac-toe's modal uses `open` — copy whichever name the modal you're wiring actually accepts.

20. **`Dialog.Description` renders as `<p>` — only string/inline children allowed.** Putting a `<YStack>` (or any block element) inside `Dialog.Description` produces invalid HTML (`<div> cannot be a descendant of <p>`) and triggers React's hydration error. Keep `Dialog.Description` as a single short string (it's the `aria-describedby` summary anyway) and hoist any multi-block content out as a sibling of `Description` inside `Dialog.Content`. Or skip raw `Dialog` entirely — `@arcadeum/ui`'s `Modal` / `ModalContent` / `ModalHeader` / `ModalBody` primitives don't have this trap.

21. **Don't write a per-game end-game modal.** [GameResultModal](apps/web/src/features/games/ui/GameResultModal.tsx) is the shared end-game UI (confetti, gold/red/silver tones, rematch button, home link). It accepts `result: 'victory'|'defeat'|'draw'|null` and an optional `messages={{title, message?}}` override for games whose copy doesn't match the shared `games.table.*` keys — tic-tac-toe uses this to surface its own `gameOver.won/lost/draw` strings without touching shared i18n.

22. **Per-option player caps go through the service, not the room.** If players-per-game depends on a game-option (board size, mode, etc.), don't try to mutate the room's `maxPlayers` when the option changes — leave room.maxPlayers at the overall ceiling. Enforce the per-option cap at `startSession` (BE) and surface it in the lobby selector ("3×3 · up to 2"). The BE error message tells the host to reduce players or pick a different option.

23. **`home-games-slider.spec.ts` hardcodes the featured-games count and order.** Adding a new game to `home/data/games.ts` breaks `await expect(gameCards).toHaveCount(N)` and the per-index `toHaveText` assertions. Update both the count and add the new `<h3>` assertion in the same commit as the data change.

## When the user says "implement game X"

Default to fully autonomous mode unless they pause you:
1. Brainstorm (or accept user-supplied spec), write spec doc.
2. Write plan doc.
3. Execute end-to-end through this checklist on a branch `ARC-XXX-<game>` (create if needed).
4. Commit in logical chunks. Don't squash mid-flight.
5. Open the PR against `develop`. Done.

Stop only for: ambiguous game rules, design choices that materially affect scope (e.g., "does this need spectator mode?"), or hard failures the skill doesn't cover.
