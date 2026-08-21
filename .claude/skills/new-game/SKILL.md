---
name: new-game
description: Add a complete new multiplayer game to Arcadeum (BE engine + service + gateway + bot, web widget, landing page, registries, i18n, tests). Use when the user says "implement game X" or "add a new game".
---

This skill turns a single instruction ("implement game X", "add Backgammon") into a fully wired, production-grade, 100% autonomous game implementation in a single turn. Follow every step in order to ensure zero missing links, runtime errors, or visual regressions.

## Reference implementations

- **Sea Battle**: `apps/be/src/games/engines/sea-battle/`, `apps/web/src/widgets/StrategyGames/SeaBattleGame/` (canonical full-stack game).
- **Checkers / Backgammon / Tic-Tac-Toe**: `apps/be/src/games/engines/backgammon/`, `apps/web/src/widgets/BoardGames/BackgammonGame/` (board game reference with rule variants, dice, and AI).

## Naming convention

Pick a short snake_case id with `_v1` suffix: `chess_v1`, `backgammon_v1`, `connect_four_v1`. Use it consistently:
- Engine id: `chess_v1`
- Widget folder: `apps/web/src/widgets/<Category>/<Name>Game/` (e.g. `BoardGames/BackgammonGame`, `CardGames/CascadeGame`)
- Landing route: `/games/<game>` (e.g. `/games/backgammon`)
- Socket event prefix: `<camelCase>.session.*` (e.g. `backgammon.session.start`, `backgammon.session.roll`, `backgammon.session.move`)

## Architecture (Two Halves)

**Backend half** — engine (pure logic + `BaseGameEngine`) + service (orchestration + `BaseGameService`) + gateway (socket events + registered in `GamesGateway`) + bot (`checkAndPlay` turn loop).
**Web half** — widget (UI + theme adapter) + registry entry (lazy loader + metadata) + landing page (SEO marketing) + create-page integration + catalog real preview + home featured-games entry + i18n (5 locales).

---

## 1-Prompt Autonomous Execution Workflow

When invoked to create a new game, execute all 12 steps below from start to finish without pausing:

### Step 1: Backend Engine (`apps/be/src/games/engines/<game>/`)

Create the engine module:
1. `<game>.constants.ts`:
   - `MIN_PLAYERS`, `MAX_PLAYERS` (union ceiling)
   - `RULE_VARIANTS` (gameplay modes: e.g. `'standard'`, `'long'`, `'blitz'`, etc.)
   - `ACTION` constants (`ROLL_DICE`, `MOVE`, `FORFEIT`, etc.)
   - `GAME_PHASE` constants (`ROLL`, `MOVE`, `GAME_OVER`, etc.)
   - `DEFAULT_OPTIONS`
2. `<game>.types.ts`:
   - `State extends BaseGameState` (must include `logs: GameLogEntry[]`, `playerOrder: string[]`, `players: Player[]`, `phase: GamePhase`, `winnerId: string | null`)
   - `Options` (includes `variant: Variant` for visual theme and `ruleVariant?: RuleVariant` for gameplay rules)
   - `Player extends GamePlayerState`
   - Action payload interfaces (`MovePayload`, etc.)
3. `<game>.utils.ts`:
   - Pure board initialization (`createInitialBoard / Points`), move generator (`getAllLegalMoves`), and win/end checkers.
4. `<game>.validators.ts`:
   - Returns `{ ok: true } | { ok: false, error: string }` for each action.
5. `<game>.config.ts`:
   - Validates configuration options.
6. `<game>.engine.ts`:
   - **Must extend `BaseGameEngine<State>`** from `apps/be/src/games/engines/base/base-game-engine.abstract.ts`.
   - Implement:
     - `getMetadata(): GameMetadata` (returns `gameId`, `name`, `minPlayers`, `maxPlayers`, `version`, `category`)
     - `initializeState(playerIds, config): State`
     - `validateAction(state, action, context, payload): boolean`
     - `executeAction(state, action, context, payload): GameActionResult<State>` (use `this.successResult(newState)` and `this.errorResult(error)`)
     - `isGameOver(state): boolean`
     - `getWinners(state): string[]`
     - `getAvailableActions(state, playerId): string[]`
     - `sanitizeStateForPlayer(state, playerId): State`
7. Register engine in `apps/be/src/games/engines/engines.module.ts`.

### Step 2: Backend Service, Bot & Gateway

1. `apps/be/src/games/<game>/<game>.service.ts`:
   - `extends BaseGameService<Options>`
   - Resolves `variant`, `ruleVariant`, and `aiDifficulty` in `resolveOptions()`.
   - Exposes typed action methods that call `this.runAction(userId, roomId, actionName, payload)`.
2. `apps/be/src/games/<game>/<game>-bot.service.ts`:
   - Implements `checkAndPlay(session: GameSessionSummary)`:
     - **Turn Loop Requirement**: For games with multi-step turns (e.g. dice rolls + checker moves), run a `while` loop over the bot's turn with step delays (`getAiMoveDelayMs(currentSession)`) so the bot plays all its actions in sequence until the turn passes to the opponent or game ends.
     - Implements `pickMove(state, botId)` with difficulty strategies (easy: random, medium/hard: heuristic evaluation).
3. `apps/be/src/games/<game>.gateway.ts`:
   - Sibling file in `apps/be/src/games/`.
   - Handles socket messages: `@SubscribeMessage('<camelCase>.session.start')`, `@SubscribeMessage('<camelCase>.session.move')`, `@SubscribeMessage('<camelCase>.session.forfeit')`.
4. Register in `apps/be/src/games/games.module.ts` (providers).
5. **Critical: Register in `apps/be/src/games/games.gateway.ts`**:
   - Inject `private readonly <camelCase>Handler: <Name>Gateway` in the constructor.
   - Add `this.<camelCase>Handler` to the `this.gameHandlers` array in `afterInit()`.

### Step 3: Backend Catalog (`apps/be/src/games/games.catalog.ts`)

Add entry to `GAMES_CATALOG`:
```ts
{
  gameId: '<game>_v1',
  startMode: 'immediate',
  themes: [...SHARED_VISUAL_THEMES],
  modes: ['standard', 'long', 'blitz'],
  variants: [...SHARED_VISUAL_THEMES, 'standard', 'long'],
  rules: [...],
}
```

### Step 4: Web Widget (`apps/web/src/widgets/<Category>/<Name>Game/`)

1. `types/index.ts`: Props, state, options (`variant` for visual theme, `ruleVariant` for gameplay mode), action payloads.
2. `lib/constants.ts`: `<NAME>_VARIANTS` mapped from `SHARED_THEMES`.
3. `lib/theme-adapter.ts`: `sharedThemeTo<Name>(theme: GameTheme): <Name>Theme`.
4. `lib/theme.ts`: `get<Name>Theme(variant?: string)`.
5. `lib/<Name>ThemeContext.tsx`: `createGameThemeContext<NameTheme>(get<Name>Theme, 'cyberpunk')`.
6. `hooks/use<Name>State.ts`: Zustand / socket state adapter.
7. `hooks/use<Name>Actions.ts`: Action dispatchers emitting socket events matching BE gateway strings.
8. `ui/Game.tsx`:
   - Root component with `<Name>ThemeProvider variant={options.variant}>`.
   - Lobby renders OUTSIDE `GameWidgetContainer` for full page layout.
   - **Turn Pill Contract**: Pass `headerProps.turn = { onClockUserId: currentTurnUserId, isMyTurn: myTurn, isGameOver }` to `GameWidgetContainer`. **Do NOT render a duplicate floating turn badge in the board slot**.
   - Wire `useGameEndState` and pass `gameEnd={gameEnd}` to `<GameEndModals />`.
   - Mount `<RulesModal open={showRulesOpen} onClose={onShowRulesClose} />` in `modals` slot.
9. `ui/<Name>Board.tsx`:
   - Responsive aspect ratio (`aspect-[4/3] sm:aspect-[16/10]` or `w-full h-full`), `box-sizing: border-box`.
   - Premium 3D-styled game pieces (bevel, radial inset, drop shadows).
   - Ergonomic action controls positioned so they never overlap board pieces.
   - Mobile touch-friendly tap targets (`min-h-[36px]`).
10. `ui/<Name>Lobby.tsx`:
    - Wraps `ReusableGameLobby`.
    - In `optionsSlot`, renders `GameThemePicker` (visual themes) AND `LobbyChipGroup` (all popular gameplay rule variants, e.g. standard/blitz/960/long/hyper/etc., with emojis and localized descriptions wired via `setOption({ ruleVariant })`).
11. `ui/RulesModal.tsx`:
    - Explains objectives, movement, hitting/scoring, bearing off, and all rule variants.
12. `index.ts`: Barrel exporting `memo(<Name>Game)` as default export.

### Step 5: Web Registries & Actions (3 Files)

1. `apps/web/src/features/games/registry.ts`:
   - Add lazy loader: `'<game>_v1': () => import('@/widgets/<Category>/<Name>Game')`.
   - Add metadata entry: `name`, `description`, `category`, `minPlayers`, `maxPlayers`, `version`, `supportsAI: true`.
2. `apps/web/src/features/games/lib/gameIdMapping.ts`:
   - Add `'<game>_v1'` to `GameType` union AND `VALID_GAME_IDS` array.
3. `apps/web/src/features/games/hooks/useGameActions.ts`:
   - Add `'<game>_v1'` to `GameType` union.

### Step 6: Create Page & Art Integrations

1. `apps/web/src/features/games/ui/create/redesign/data/themes.ts`:
   - Extend `GameId` union, add `GAMES` entry, add to `VISIBLE_GAMES`, export `<NAME>_THEMES` and `find<Name>Theme()`.
2. `apps/web/src/features/games/ui/create/redesign/art/<Name>BoardPoster.tsx`:
   - Pure SVG rendering a live snapshot using `getTheme(variant)` tokens.
3. `apps/web/src/features/games/ui/create/redesign/ThemePicker.tsx`:
   - Add picker block with `<div className={s.themeArt}>` rendering `<Name>BoardPoster`.
4. `apps/web/src/features/games/ui/create/redesign/art/GameArt.tsx`:
   - Add `if (gameId === '<game>_v1') return <<Name>BoardPoster theme={find<Name>Theme(themeId)} size={size} />;`.
5. `apps/web/src/features/games/ui/create/redesign/RulesAccess.tsx`:
   - Add dynamic import for `RulesModal` and wire `gameId === '<game>_v1' ? <<Name>RulesModal ... /> : null`.
6. `apps/web/src/features/games/ui/create/redesign/GameCreateView.tsx`:
   - Add to `URL_TO_GAME_ID` and add `buildGameOptions()` branch.

### Step 7: Home, Catalog & Landing Artwork

1. `apps/web/src/app/[locale]/(app)/games/components/art/<Name>RealBoard.tsx`:
   - Pure SVG board preview.
2. `apps/web/src/app/[locale]/(app)/games/components/art/GamesCatalogRealPreview.tsx`:
   - Add `case '<game>_v1': return <<Name>RealBoard />;`.
3. `apps/web/src/app/[locale]/home/components/featured-games/symbols/<Name>Symbol.tsx`:
   - 64×64 SVG symbol. Export from `symbols/index.ts` and add `case '<game>_v1':` to `gameMeta.tsx`.
4. `apps/web/src/app/[locale]/home/data/games.ts`:
   - Add to `featuredGames`.
5. `apps/web/src/features/games/ui/landing/getRelatedGames.ts`:
   - Add to `ALL_GAMES`.

### Step 8: Landing Page (`apps/web/src/app/[locale]/games/<game>/`)

Create marketing landing page:
- `page.tsx`: Server component with `buildPageMetadata` and `JsonLd` VideoGame schema.
- `<Name>Landing.tsx`, `<Name>Hero.tsx`, `<Name>ThemesGrid.tsx`, `<Name>FinalCtaButtons.tsx`.
- `opengraph-image.tsx` (1200×630 `ImageResponse`) & `twitter-image.tsx`.
- Register in `apps/web/src/shared/config/routes.ts` (`<game>Landing: '/${locale}/games/<game>'`) and `apps/web/src/shared/seo/buildPageMetadata.ts`.
- Ensure CTA button uses `?gameId=<game>_v1`.

### Step 9: Internationalization (All 5 Locales)

Add translation keys across all 5 locale files:
1. `apps/web/src/shared/i18n/messages/games/<game>/{en,es,fr,ru,by}.ts`:
   - Game name, description, summary, variants, rules (objective, movement, special mechanics, bearing off), landing (hero, highlights, steps, faq), game UI messages.
2. `apps/web/src/shared/i18n/messages/seo/{en,es,fr,ru,by}.ts`:
   - `<game>Landing` metadata title and description.
3. `apps/web/src/shared/i18n/messages/pages/{en,es,fr,ru,by}.ts`:
   - `games.items.<game>_v1` { name, subtitle, icon }.

### Step 10: Tests & Verification

1. Unit tests:
   - BE engine spec (`<game>.engine.spec.ts`)
   - BE bot spec (`<game>-bot.service.spec.ts`)
   - Web widget render test (`<Name>Board.test.tsx`)
2. Verification commands:
   ```bash
   pnpm --filter be test
   pnpm --filter web test
   pnpm --filter be build
   pnpm --filter web type-check
   pnpm check-file-length
   pnpm check-translations
   ```
3. Update `apps/web/e2e/home-games-slider.spec.ts` (increment featured-games count assertion).

### Step 11: Git Commit & PR

1. Commit with Conventional Commits: `feat(games): add <name> (ARC-XXX)`.
2. Push branch and open PR targeting `develop`.

---

## Critical Gotchas & Prevention Rules

1. **GamesGateway Handler Registration**: Must inject `<Name>Gateway` in `GamesGateway` constructor and register in `gameHandlers` in `afterInit()`. Omitting this silently ignores socket messages.
2. **Bot Turn Execution Loop**: Turn-based games with multi-action turns (dice roll + multiple moves) must run an internal loop over the bot's turn in `checkAndPlay` so remaining actions aren't dropped by lock contention.
3. **Engine Base Class**: Engine must extend `BaseGameEngine<State>`, return `this.successResult(state)`, and implement `getMetadata()`, `getWinners()`, `getAvailableActions()`, and `sanitizeStateForPlayer()`.
4. **Duplicate Turn Badge**: Do NOT render `<TurnBadge>` inside the widget's board slot. `GameWidgetContainer` renders the turn avatar pill automatically in the header.
5. **Two `GameType` Unions**: Add `<game>_v1` to `lib/gameIdMapping.ts` AND `hooks/useGameActions.ts`.
6. **Card Art Fallback**: Add real SVG board to `GamesCatalogRealPreview.tsx`, `GameArt.tsx`, and `ThemePicker.tsx` to prevent falling back to Glimworm glowing snake preview.
7. **`pages/{locale}.ts` Catalog Keys**: Add `pages.games.items.<game>_v1` in all 5 locales to avoid missing translation warnings on `/games`.
8. **File Limit (500 Lines)**: Keep all engine, widget, and service files strictly under 500 lines.
9. **AI vs AI Mode**: Add `<game>_v1` to `AI_VS_AI_GAME_IDS` in `apps/be/src/games/common/ai-vs-ai.ts`, wire into `AiVsAiService` in `apps/be/src/games/ai-vs-ai/ai-vs-ai.service.ts`, and add to `AI_VS_AI_SUPPORTED_GAME_IDS` in `apps/web/src/features/games/lib/aiVsAi.ts`.
