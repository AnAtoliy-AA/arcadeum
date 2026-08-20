# Games Refactoring — Full Step-by-Step Plan

## Current State Analysis

### Games Inventory

| Game        | BE Service                                       | BE Gateway                                            | Web Widget                      | Landing Page         | Status       |
| ----------- | ------------------------------------------------ | ----------------------------------------------------- | ------------------------------- | -------------------- | ------------ |
| Critical    | `critical/critical.service.ts` (425 lines)       | `critical.gateway.ts` + `critical-actions.gateway.ts` | `CriticalGame/` (40+ UI files)  | `games/critical/`    | active       |
| Cascade     | `cascade/cascade.service.ts` (258 lines)         | `cascade.gateway.ts` (183 lines)                      | `CascadeGame/` (11 UI files)    | `games/cascade/`     | beta         |
| Sea Battle  | `sea-battle/sea-battle.service.ts` (12KB)        | `sea-battle.gateway.ts` + lobby (18KB)                | `SeaBattleGame/` (15+ UI files) | `games/sea-battle/`  | beta         |
| Chess       | `chess/chess.service.ts` (361 lines)             | `chess.gateway.ts` (4.7KB)                            | `ChessGame/`                    | `games/chess/`       | experimental |
| Checkers    | `checkers/checkers.service.ts` (222 lines)       | `checkers.gateway.ts` (110 lines)                     | `CheckersGame/`                 | `games/checkers/`    | experimental |
| Tic-Tac-Toe | `tic-tac-toe/tic-tac-toe.service.ts` (247 lines) | `tic-tac-toe.gateway.ts` (106 lines)                  | `TicTacToeGame/`                | `games/tic-tac-toe/` | beta         |
| Glimworm    | `glimworm/glimworm.service.ts` (15KB)            | `glimworm.gateway.ts` (7.3KB)                         | `GlimwormGame/`                 | `games/glimworm/`    | beta         |
| Cat Dash    | `cat-dash/cat-dash.service.ts` (240 lines)       | `cat-dash.gateway.ts` (158 lines)                     | `CatDashGame/`                  | `games/cat-dash/`    | coming_soon  |

### Current Variant/Theme Assignments

| Game            | Current `variants` in catalog                                                                                                | Type                   |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| **Critical**    | cyberpunk, underwater, crime, horror, adventure, high-altitude-hike, galaxy, fantasy, western, egypt, steampunk, zen, random | Visual themes          |
| **Sea Battle**  | classic, modern, pixel, cartoon, cyber, vintage, nebula, forest, sunset, monochrome, speed, battle_royale, team_2v2          | Mixed (visual + modes) |
| **Cascade**     | cosmic, arcane, cyberpunk, elemental, classic, neon, tropical, steampunk, pure, speed                                        | Mixed (visual + modes) |
| **Tic-Tac-Toe** | classic, neon, paper, pixel, chalkboard, retro                                                                               | Visual themes          |
| **Chess**       | standard, chess960                                                                                                           | Game modes only        |
| **Checkers**    | classic, neon, wood, marble, neon_glow                                                                                       | Visual themes          |
| **Cat Dash**    | neon, village, space, nature                                                                                                 | Visual themes          |
| **Glimworm**    | battle_royale, time_attack, lives_heats                                                                                      | Game modes only        |

### Duplicated Code (BE Services)

Every game service repeats these identical methods:

| Method                             | Lines per service | × 8 games                           | Total duplicate |
| ---------------------------------- | ----------------- | ----------------------------------- | --------------- |
| Constructor + watchdog setup       | ~15               | 8                                   | ~120            |
| `onModuleInit` / `onModuleDestroy` | 6                 | 8                                   | ~48             |
| `findSessionByRoom`                | 5                 | 8                                   | ~40             |
| `afterSessionStep` (bot trigger)   | 12                | 8                                   | ~96             |
| `emitSessionUpdate`                | 14                | 8                                   | ~112            |
| `completeSession`                  | 8                 | 8                                   | ~64             |
| `startSession` boilerplate         | 40                | 8                                   | ~320            |
| `runAction` (with room locks)      | 25                | 4 (Cascade, Chess, + others inline) | ~100            |
| **Total duplicated**               |                   |                                     | **~900 lines**  |

### Duplicated Code (BE Gateways)

| Method                 | Lines per gateway | × 8 gateways | Total duplicate |
| ---------------------- | ----------------- | ------------ | --------------- |
| `handleSessionStart`   | 18                | 8            | ~144            |
| `handleForfeit`        | 15                | 7            | ~105            |
| Error handling wrapper | 8                 | 8            | ~64             |
| **Total duplicated**   |                   |              | **~313 lines**  |

### Duplicated Code (Web Widgets)

| Component                      | Duplicated across                   | Avg lines | Total            |
| ------------------------------ | ----------------------------------- | --------- | ---------------- |
| Lobby (player list, start btn) | Critical, Cascade, SeaBattle        | ~250      | ~750             |
| CreationConfig (theme picker)  | Critical, Cascade, SeaBattle        | ~120      | ~360             |
| Game modals (result, forfeit)  | Critical, Cascade, SeaBattle, Chess | ~80       | ~320             |
| Session state hook             | All 8 games                         | ~40       | ~320             |
| **Total duplicated**           |                                     |           | **~1,750 lines** |

---

## Phase 1 — Shared BE Infrastructure

> **Goal**: Extract duplicated service/gateway boilerplate into reusable base classes.
> **Estimated savings**: ~1,200 lines of code removed.

---

### Step 1.1 — Create `BaseGameService` abstract class

**File**: `apps/be/src/games/common/base-game.service.ts` [NEW]

**What it contains**:

```
abstract class BaseGameService implements OnModuleInit, OnModuleDestroy {
  // Abstract properties (each game fills in):
  abstract readonly gameId: string          // e.g. 'cascade_v1'
  abstract readonly gameName: string        // e.g. 'Cascade'
  abstract readonly minPlayers: number      // e.g. 2
  abstract readonly maxPlayers: number      // e.g. 10

  // Constructor receives shared deps:
  // roomsService, sessionsService, realtimeService, botService, mongoConnection

  // Shared concrete methods:
  onModuleInit()                            // starts watchdog
  onModuleDestroy()                         // stops watchdog
  findSessionByRoom(roomId)                 // lookup + afterSessionStep
  startSession(userId, roomId, withBots?)   // host check, bot adding, session creation, emit
  forfeit(userId, roomId)                   // delegates to runAction
  completeSession(sessionId, roomId)        // mark completed
  afterSessionStep(session)                 // sync room status + trigger bot
  emitSessionUpdate(session)                // sanitize + broadcast to room
  runAction(userId, roomId, action, payload)// per-room mutex + execute + emit

  // Abstract hook for subclasses:
  abstract resolveOptions(raw): Record<string, unknown>

  // Optional hooks (override when needed):
  getMaxPlayersForOptions(options): number  // default: this.maxPlayers
  buildSessionConfig(options, rawOpts)      // default: { options }
}
```

**Why**: Every service (Cascade, TicTacToe, Checkers, CatDash, Chess) has the exact same `afterSessionStep`, `emitSessionUpdate`, `completeSession`, `findSessionByRoom`, watchdog lifecycle, and a very similar `startSession` with bot-adding logic.

---

### Step 1.2 — Create `BaseGameGateway` abstract class

**File**: `apps/be/src/games/common/base-game.gateway.ts` [NEW]

**What it contains**:

```
abstract class BaseGameGateway implements GameMessageHandler {
  abstract readonly eventPrefix: string     // e.g. 'cascade', 'ticTacToe'
  abstract readonly gameService: BaseGameService

  // Auto-registers start + forfeit handlers:
  get handlers() {
    return {
      `${prefix}.session.start`  → handleSessionStart
      `${prefix}.session.forfeit` → handleForfeit
      ...this.getGameHandlers()   → game-specific handlers
    }
  }

  // Shared concrete methods:
  handleSessionStart(client, payload)       // extract room/user, call startSession, emit
  handleForfeit(client, payload)            // extract room/user, call forfeit, emit

  // Helper:
  wrapHandler(actionName, fn)               // extracts room/user, validates, wraps errors

  // Abstract hook:
  abstract getGameHandlers(): Record<string, GameMessageHandlerFn>
}
```

**Why**: Every gateway repeats `handleSessionStart` (~18 lines) and `handleForfeit` (~15 lines) with only the event prefix and service reference changing.

---

### Step 1.3 — Create barrel export

**File**: `apps/be/src/games/common/index.ts` [NEW]

```typescript
export { BaseGameService } from './base-game.service';
export { BaseGameGateway } from './base-game.gateway';
```

---

### Step 1.4 — Refactor CascadeService

**File**: `apps/be/src/games/cascade/cascade.service.ts` [MODIFY]

**Before**: 258 lines
**After**: ~97 lines

**Changes**:

- Extend `BaseGameService` instead of implementing `OnModuleInit, OnModuleDestroy`
- Remove: constructor boilerplate, watchdog setup, `findSessionByRoom`, `startSession` skeleton, `afterSessionStep`, `emitSessionUpdate`, `completeSession`, `runAction`, `forfeit`
- Keep: `playCard`, `draw`, `nameColor`, `callCascade`, `resolveOptions`

---

### Step 1.5 — Refactor CascadeGateway

**File**: `apps/be/src/games/cascade.gateway.ts` [MODIFY]

**Before**: 183 lines
**After**: ~76 lines

**Changes**:

- Extend `BaseGameGateway`
- Remove: `handleSessionStart`, `handleForfeit`, error handling boilerplate
- Keep: `play_card`, `draw`, `name_color`, `call_cascade` handlers (using `wrapHandler`)

---

### Step 1.6 — Refactor TicTacToeService

**File**: `apps/be/src/games/tic-tac-toe/tic-tac-toe.service.ts` [MODIFY]

**Before**: 247 lines
**After**: ~103 lines

**Changes**:

- Extend `BaseGameService`
- Override `getMaxPlayersForOptions` for board-size-dependent player caps
- Remove all boilerplate
- Keep: `placeMark`, `resolveOptions`

---

### Step 1.7 — Refactor TicTacToeGateway

**File**: `apps/be/src/games/tic-tac-toe.gateway.ts` [MODIFY]

**Before**: 106 lines
**After**: ~43 lines

**Changes**:

- Extend `BaseGameGateway`
- Keep only: `place_mark` handler

---

### Step 1.8 — Refactor CheckersService

**File**: `apps/be/src/games/checkers/checkers.service.ts` [MODIFY]

**Before**: 222 lines
**After**: ~82 lines

**Changes**:

- Extend `BaseGameService`
- Remove all boilerplate
- Keep: `movePiece`, `resolveOptions`

---

### Step 1.9 — Refactor CheckersGateway

**File**: `apps/be/src/games/checkers.gateway.ts` [MODIFY]

**Before**: 110 lines
**After**: ~41 lines

**Changes**:

- Extend `BaseGameGateway`
- Keep only: `move_piece` handler

---

### Step 1.10 — Refactor CatDashService

**File**: `apps/be/src/games/cat-dash/cat-dash.service.ts` [MODIFY]

**Before**: 240 lines
**After**: ~72 lines

**Changes**:

- Extend `BaseGameService`
- Remove all boilerplate
- Keep: `rollDice`, `useAbility`, `choosePath`, `resolveOptions`

---

### Step 1.11 — Refactor CatDashGateway

**File**: `apps/be/src/games/cat-dash.gateway.ts` [MODIFY]

**Before**: 158 lines
**After**: ~63 lines

**Changes**:

- Extend `BaseGameGateway`
- Keep: `rollDice`, `useAbility`, `choosePath` handlers

---

### Step 1.12 — Refactor ChessService

**File**: `apps/be/src/games/chess/chess.service.ts` [MODIFY]

**Before**: 361 lines
**After**: ~170 lines

**Changes**:

- Extend `BaseGameService`
- Pass `checkClockTimeout` as `preCheck` to the watchdog via constructor
- Override `onModuleInit` to call `super.onModuleInit()` + `botService.setMoveFn`
- Override `emitSessionUpdate` to call `backfillLegalMoves` before super
- Keep: `move`, `drawOffer`, `drawAccept`, `resolveOptions`, `backfillLegalMoves`, `checkClockTimeout`

**Note**: Chess has unique logic (clock timeouts, legal move backfill) so it keeps more overrides than simpler games.

---

### Step 1.13 — Refactor ChessGateway

**File**: `apps/be/src/games/chess.gateway.ts` [MODIFY]

**Changes**:

- Extend `BaseGameGateway`
- Override `handleSessionStart` for the extra `botDifficulty` parameter
- Keep: `move`, `draw_offer`, `draw_accept` handlers

---

### Step 1.14 — Refactor CriticalService (partial)

**File**: `apps/be/src/games/critical/critical.service.ts` [MODIFY]

**Before**: 425 lines
**After**: ~310 lines

**Changes**:

- Extend `BaseGameService`
- Override `startSession` (Critical has unique "random variant" resolution and legacy `roomId` lookup)
- Remove: `findSessionByRoom`, `completeSession`, `checkAndSyncRoomStatus` (→ `afterSessionStep` in base)
- Keep: All action methods (`drawCard`, `playActionCard`, `playCatCombo`, etc.) — Critical has many unique game-specific methods

**Note**: Critical is the most complex game. Its `startSession` has special logic (find room by user if no roomId, resolve random variant). These overrides remain.

---

### Step 1.15 — Refactor CriticalGateway + CriticalActionsGateway

**File**: `apps/be/src/games/critical.gateway.ts` [MODIFY]
**File**: `apps/be/src/games/critical-actions.gateway.ts` [MODIFY]

**Changes**:

- `CriticalGateway` extends `BaseGameGateway`
- Override `handleSessionStart` for the legacy `engine` parameter
- `CriticalActionsGateway` stays mostly as-is (it handles Critical-specific actions like `play_defuse`, `play_nope`, `commit_alter_future`)

---

### Step 1.16 — Refactor SeaBattleService (partial)

**File**: `apps/be/src/games/sea-battle/sea-battle.service.ts` [MODIFY]

**Changes**:

- Extend `BaseGameService`
- Override `startSession` (Sea Battle has a `placement` start mode — game starts in placement phase)
- Remove: shared boilerplate
- Keep: All Sea Battle–specific methods (attack, scan, etc.)

---

### Step 1.17 — Refactor SeaBattleGateway

**File**: `apps/be/src/games/sea-battle.gateway.ts` [MODIFY]
**File**: `apps/be/src/games/sea-battle.gateway.lobby.ts` [KEEP]

**Changes**:

- Extend `BaseGameGateway`
- Keep: Sea Battle–specific handlers (attack, scan, sonar, radar, etc.)
- Lobby gateway stays separate (it handles placement-phase events)

---

### Step 1.18 — Refactor GlimwormService (partial)

**File**: `apps/be/src/games/glimworm/glimworm.service.ts` [MODIFY]

**Changes**:

- Extend `BaseGameService`
- Glimworm is unique (real-time tick-based, not turn-based) so it keeps most of its logic
- Extract only the shared boilerplate (watchdog, findSession, completeSession)

---

### Step 1.19 — Refactor GlimwormGateway

**File**: `apps/be/src/games/glimworm.gateway.ts` [MODIFY]

**Changes**:

- Extend `BaseGameGateway`
- Keep: Glimworm-specific handlers (shoot, boost, etc.)

---

### Step 1.20 — Update `games.module.ts`

**File**: `apps/be/src/games/games.module.ts` [MODIFY]

**Changes**:

- No new providers needed (BaseGameService/BaseGameGateway are abstract, not injectable)
- Verify all existing providers still resolve correctly

---

### Step 1.21 — Run BE tests

```bash
pnpm --filter @arcadeum/be test -- --run
pnpm --filter @arcadeum/be build
```

---

## Phase 2 — Unified Theme/Variant System

> **Goal**: Share Critical's visual themes across all games. Separate visual themes from game modes.

---

### Step 2.1 — Define shared theme constants (BE)

**File**: `apps/be/src/games/common/shared-themes.ts` [NEW]

```typescript
export const SHARED_VISUAL_THEMES = [
  'cyberpunk',
  'underwater',
  'crime',
  'horror',
  'adventure',
  'high-altitude-hike',
  'galaxy',
  'fantasy',
  'western',
  'egypt',
  'steampunk',
  'zen',
  'random',
] as const;

export type SharedVisualTheme = (typeof SHARED_VISUAL_THEMES)[number];
```

---

### Step 2.2 — Update `GAME_CATALOG` structure (BE)

**File**: `apps/be/src/games/games.catalog.ts` [MODIFY]

**Changes**:

- Add `themes` field (shared visual themes for this game)
- Add `modes` field (game-specific rule variants)
- Keep `variants` for backward compat (= union of themes + modes)

```typescript
interface GameCatalogEntry {
  gameId: string;
  themes: ReadonlyArray<string>; // Visual skins (from SHARED_VISUAL_THEMES)
  modes: ReadonlyArray<string>; // Game-specific rule variants
  variants: ReadonlyArray<string>; // Backward compat = [...themes, ...modes]
  rules: ReadonlyArray<GameCatalogRule>;
  startMode: GameStartMode;
}
```

**Example — Critical**:

```typescript
{
  gameId: 'critical_v1',
  themes: [...SHARED_VISUAL_THEMES],
  modes: [],
  variants: [...SHARED_VISUAL_THEMES], // backward compat
  ...
}
```

**Example — Sea Battle**:

```typescript
{
  gameId: 'sea_battle_v1',
  themes: [...SHARED_VISUAL_THEMES],
  modes: ['speed', 'battle_royale', 'team_2v2'],
  variants: [...SHARED_VISUAL_THEMES, 'speed', 'battle_royale', 'team_2v2'],
  ...
}
```

**Example — Cascade**:

```typescript
{
  gameId: 'cascade_v1',
  themes: [...SHARED_VISUAL_THEMES],
  modes: ['pure', 'speed'],
  variants: [...SHARED_VISUAL_THEMES, 'pure', 'speed'],
  ...
}
```

---

### Step 2.3 — Create shared theme registry (Web)

**File**: `apps/web/src/features/games/lib/shared-themes.ts` [NEW]

```typescript
export interface GameTheme {
  id: string;
  nameKey: string; // i18n key: 'games.themes.cyberpunk.name'
  descriptionKey: string; // i18n key: 'games.themes.cyberpunk.description'
  emoji: string;
  gradient: string;
  bgImage?: string;
  colors: {
    primary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
  };
}

export const SHARED_THEMES: GameTheme[] = [
  {
    id: 'cyberpunk',
    nameKey: 'games.themes.cyberpunk.name',
    descriptionKey: 'games.themes.cyberpunk.description',
    emoji: '🤖',
    gradient: 'linear-gradient(135deg, #FF0080 0%, #7928CA 100%)',
    colors: {
      primary: '#FF0080',
      accent: '#7928CA',
      background: '#0f0a1e',
      surface: '#1a1030',
      text: '#f8fafc',
      textSecondary: '#94a3b8',
    },
  },
  // ... all 12 themes from Critical's CARD_VARIANTS
];
```

---

### Step 2.4 — Deprecate `criticalVariants.ts`

**File**: `apps/web/src/features/games/lib/criticalVariants.ts` [MODIFY]

```typescript
// Backward compat — re-export from shared
import { SHARED_THEMES } from './shared-themes';
export const CARD_VARIANTS = SHARED_THEMES.map((t) => ({
  id: t.id,
  name: t.nameKey,
  description: t.descriptionKey,
  emoji: t.emoji,
  gradient: t.gradient,
  bgImage: t.bgImage,
}));
```

---

### Step 2.5 — Create `useGameTheme` hook

**File**: `apps/web/src/features/games/hooks/useGameTheme.ts` [NEW]

```typescript
export function useGameTheme(themeId: string): GameTheme {
  return SHARED_THEMES.find((t) => t.id === themeId) ?? SHARED_THEMES[0];
}
```

---

### Step 2.6 — Add per-game theme adapters

Each game widget that has visual theme support gets a thin adapter:

**File**: `apps/web/src/widgets/SeaBattleGame/lib/theme-adapter.ts` [NEW]

Maps `GameTheme` → `SeaBattleTheme` (adds game-specific fields like `shipColor`, `hitColor`, `cellEmpty`).

**File**: `apps/web/src/widgets/CascadeGame/lib/theme-adapter.ts` [NEW]

Maps `GameTheme` → Cascade CSS variables.

---

### Step 2.7 — Add i18n keys for shared themes

**Files**: All locale files (`en.json`, `ru.json`, `es.json`, `fr.json`, `by.json`) [MODIFY]

Add under `games.themes`:

```json
{
  "games": {
    "themes": {
      "cyberpunk": {
        "name": "Cyberpunk",
        "description": "Neon-lit dystopian future"
      },
      "horror": {
        "name": "Horror",
        "description": "Dark and terrifying atmosphere"
      },
      "adventure": {
        "name": "Adventure",
        "description": "Epic quests and exploration"
      },
      "fantasy": {
        "name": "Fantasy",
        "description": "Magical realms and mythical creatures"
      },
      "western": { "name": "Western", "description": "Wild West frontier" },
      "galaxy": { "name": "Galaxy", "description": "Deep space exploration" },
      "egypt": { "name": "Egypt", "description": "Ancient Egyptian mysteries" },
      "steampunk": {
        "name": "Steampunk",
        "description": "Victorian-era mechanical wonders"
      },
      "zen": { "name": "Zen", "description": "Peaceful Japanese aesthetics" },
      "underwater": {
        "name": "Underwater",
        "description": "Deep ocean depths"
      },
      "crime": { "name": "Crime", "description": "Noir detective underworld" },
      "high-altitude-hike": {
        "name": "High Altitude",
        "description": "Mountain summit expedition"
      },
      "random": { "name": "Random", "description": "Surprise theme each game" }
    }
  }
}
```

---

### Step 2.8 — Run tests

```bash
pnpm --filter @arcadeum/web test -- --run
pnpm --filter @arcadeum/be test -- --run
pnpm typecheck
```

---

## Phase 3 — Shared Game UI Components (Web)

> **Goal**: Extract duplicated lobby, theme picker, modals, and hooks into shared components.

---

### Step 3.1 — Create `GameShared` widget directory

```
apps/web/src/widgets/GameShared/
├── index.ts
├── ui/
│   ├── GameLobby.tsx              # Shared lobby component
│   ├── GameThemePicker.tsx        # Shared theme/variant selector
│   ├── GameResultModal.tsx        # Win/loss/draw modal
│   ├── GameForfeitModal.tsx       # Confirm forfeit modal
│   ├── GameLayout.tsx             # Standard fullscreen game wrapper
│   ├── GameIdleTimer.tsx          # Idle timer countdown
│   └── GameTurnBanner.tsx         # "Your turn" / "Waiting" banner
└── hooks/
    ├── useGameSession.ts          # Socket subscription for game state
    ├── useGameActions.ts          # Generic action dispatcher
    ├── useGameModals.ts           # Modal state management
    └── useGameIdleTimer.ts        # Idle timer logic
```

---

### Step 3.2 — Extract `GameLobby` component

**File**: `apps/web/src/widgets/GameShared/ui/GameLobby.tsx` [NEW]

Extracted from the common pattern in:

- `CriticalLobby.tsx` (7.4KB)
- `CascadeLobby.tsx` (6.2KB)
- `SeaBattleLobby.tsx` (13.6KB)

**Props**:

```typescript
interface GameLobbyProps {
  room: GameRoomSummary;
  session: unknown | null;
  currentUserId: string | null;
  onStart: () => void;
  onLeave: () => void;
  renderCreationConfig?: () => ReactNode; // game-specific settings
  renderPreview?: () => ReactNode; // game-specific preview
}
```

**Shared features**:

- Player list with avatars, host badge, kick button
- Start game button (host only, min players check)
- Room invite link / QR code
- Bot count selector
- Room settings display

---

### Step 3.3 — Extract `GameThemePicker` component

**File**: `apps/web/src/widgets/GameShared/ui/GameThemePicker.tsx` [NEW]

Extracted from:

- `CriticalCreationConfig.tsx` variant picker
- `ThemePicker.tsx` (redesign)

Uses `SHARED_THEMES` from Step 2.3.

**Props**:

```typescript
interface GameThemePickerProps {
  selectedTheme: string;
  onSelect: (themeId: string) => void;
  allowedThemes?: string[]; // filter by catalog visibility
  showComingSoon?: boolean;
}
```

---

### Step 3.4 — Extract `GameResultModal` and `GameForfeitModal`

**File**: `apps/web/src/widgets/GameShared/ui/GameResultModal.tsx` [NEW]
**File**: `apps/web/src/widgets/GameShared/ui/GameForfeitModal.tsx` [NEW]

Extracted from:

- `CriticalGame/ui/GameModals.tsx`
- `CriticalGame/ui/ActiveGameModals.tsx`
- `SeaBattleGame/ui/SeaBattleModals.tsx`

---

### Step 3.5 — Extract shared hooks

**File**: `apps/web/src/widgets/GameShared/hooks/useGameSession.ts` [NEW]

Generic hook for subscribing to game session updates via socket:

```typescript
function useGameSession(roomId: string, gameId: string) {
  // Socket subscription for `games.session.update`
  // Returns: { session, loading, error }
}
```

**File**: `apps/web/src/widgets/GameShared/hooks/useGameActions.ts` [NEW]

Generic action dispatcher:

```typescript
function useGameActions(eventPrefix: string) {
  // Returns: { startSession, forfeit, emitAction }
}
```

---

### Step 3.6 — Refactor each game widget to use shared components

For each game widget:

1. Replace custom lobby → `GameLobby` + game-specific `renderCreationConfig`
2. Replace custom modals → `GameResultModal` / `GameForfeitModal`
3. Replace custom session hook → `useGameSession`
4. Keep game-specific board/arena/card rendering

**Priority order** (simplest first):

1. Checkers (minimal custom UI)
2. Tic-Tac-Toe
3. Cat Dash
4. Cascade
5. Chess
6. Critical (most complex)
7. Sea Battle (most complex)
8. Glimworm (real-time, unique)

---

### Step 3.7 — Organize widgets by category (optional)

```
widgets/
├── GameShared/          # Shared infrastructure
├── CardGames/
│   ├── CriticalGame/
│   └── CascadeGame/
├── BoardGames/
│   ├── ChessGame/
│   ├── CheckersGame/
│   └── TicTacToeGame/
├── ActionGames/
│   ├── GlimwormGame/
│   └── CatDashGame/
└── StrategyGames/
    └── SeaBattleGame/
```

Update `registry.ts` import paths accordingly.

---

### Step 3.8 — Run tests

```bash
pnpm --filter @arcadeum/web test -- --run
pnpm e2e
pnpm typecheck
```

---

## Phase 4 — Game Landing Pages & Catalog

> **Goal**: Standardize game landing pages and add category filtering to the catalog.

---

### Step 4.1 — Create `GameLandingTemplate`

**File**: `apps/web/src/app/[locale]/(app)/games/components/GameLandingTemplate.tsx` [NEW]

All 3 existing landing pages follow the same structure:

```
┌─────────────────────┐
│     Hero Section    │  ← Game-specific visual (cards, board, arena)
├─────────────────────┤
│   Features Grid     │  ← 3-6 feature highlight cards
├─────────────────────┤
│   Themes Showcase   │  ← Shared theme grid (from shared-themes.ts)
├─────────────────────┤
│    CTA Buttons      │  ← Play Now / Create Room
└─────────────────────┘
```

**Props**:

```typescript
interface GameLandingTemplateProps {
  gameId: GameSlug;
  heroContent: ReactNode;
  features: Array<{ icon: string; titleKey: string; descKey: string }>;
  themesGrid?: ReactNode;
  ctaButtons: ReactNode;
  className?: string;
}
```

---

### Step 4.2 — Refactor Critical landing

**File**: `apps/web/src/app/[locale]/(app)/games/critical/CriticalLandingView.tsx` [MODIFY]

Use `GameLandingTemplate`, passing only:

- Critical-specific hero (animated card cluster)
- Critical-specific features list

---

### Step 4.3 — Refactor Cascade landing

**File**: `apps/web/src/app/[locale]/(app)/games/cascade/CascadeLanding.tsx` [MODIFY]

Use `GameLandingTemplate`.

---

### Step 4.4 — Refactor Sea Battle landing

**File**: `apps/web/src/app/[locale]/(app)/games/sea-battle/SeaBattleLanding.tsx` [MODIFY]

Use `GameLandingTemplate`.

---

### Step 4.5 — Add category metadata to registry

**File**: `apps/web/src/features/games/registry.ts` [MODIFY]

```typescript
export type GameCategory = 'card' | 'board' | 'action' | 'strategy';

export const GAME_CATEGORIES: Record<
  GameCategory,
  {
    labelKey: string;
    games: GameSlug[];
  }
> = {
  card: {
    labelKey: 'games.categories.card',
    games: ['critical_v1', 'cascade_v1', 'texas_holdem_v1'],
  },
  board: {
    labelKey: 'games.categories.board',
    games: ['chess_v1', 'checkers_v1', 'tic_tac_toe_v1'],
  },
  action: {
    labelKey: 'games.categories.action',
    games: ['glimworm_v1', 'cat_dash_v1'],
  },
  strategy: {
    labelKey: 'games.categories.strategy',
    games: ['sea_battle_v1'],
  },
};
```

---

### Step 4.6 — Add category tabs to Games catalog page

**File**: `apps/web/src/app/[locale]/(app)/games/GamesPage.tsx` [MODIFY]

Add tab bar at top:

```
[All Games] [Card Games] [Board Games] [Action] [Strategy]
```

Filter displayed games based on selected category.

---

### Step 4.7 — Add i18n keys for categories

**Files**: All locale files [MODIFY]

```json
{
  "games": {
    "categories": {
      "all": "All Games",
      "card": "Card Games",
      "board": "Board Games",
      "action": "Action",
      "strategy": "Strategy"
    }
  }
}
```

---

### Step 4.8 — Run all tests

```bash
pnpm --filter @arcadeum/be test -- --run
pnpm --filter @arcadeum/web test -- --run
pnpm e2e
pnpm typecheck
pnpm build
pnpm lint
pnpm check-file-length
```

---

## Summary — New Files Created

| Phase | File                                         | Purpose                             |
| ----- | -------------------------------------------- | ----------------------------------- |
| 1     | `games/common/base-game.service.ts`          | Abstract base for all game services |
| 1     | `games/common/base-game.gateway.ts`          | Abstract base for all game gateways |
| 1     | `games/common/index.ts`                      | Barrel export                       |
| 2     | `games/common/shared-themes.ts`              | Shared visual theme constants (BE)  |
| 2     | `features/games/lib/shared-themes.ts`        | Shared theme registry (Web)         |
| 2     | `features/games/hooks/useGameTheme.ts`       | Theme resolver hook                 |
| 2     | `widgets/SeaBattleGame/lib/theme-adapter.ts` | Theme → SeaBattle adapter           |
| 2     | `widgets/CascadeGame/lib/theme-adapter.ts`   | Theme → Cascade adapter             |
| 3     | `widgets/GameShared/ui/GameLobby.tsx`        | Shared lobby component              |
| 3     | `widgets/GameShared/ui/GameThemePicker.tsx`  | Shared theme picker                 |
| 3     | `widgets/GameShared/ui/GameResultModal.tsx`  | Shared result modal                 |
| 3     | `widgets/GameShared/ui/GameForfeitModal.tsx` | Shared forfeit modal                |
| 3     | `widgets/GameShared/ui/GameLayout.tsx`       | Shared game layout                  |
| 3     | `widgets/GameShared/ui/GameIdleTimer.tsx`    | Shared idle timer                   |
| 3     | `widgets/GameShared/ui/GameTurnBanner.tsx`   | Shared turn banner                  |
| 3     | `widgets/GameShared/hooks/useGameSession.ts` | Shared session hook                 |
| 3     | `widgets/GameShared/hooks/useGameActions.ts` | Shared action hook                  |
| 3     | `widgets/GameShared/hooks/useGameModals.ts`  | Shared modal hook                   |
| 4     | `games/components/GameLandingTemplate.tsx`   | Landing page template               |

## Summary — Lines of Code Impact

| Phase                      | Lines removed | Lines added | Net reduction            |
| -------------------------- | ------------- | ----------- | ------------------------ |
| Phase 1 (BE base classes)  | ~1,200        | ~350        | **~850**                 |
| Phase 2 (theme system)     | ~100          | ~250        | +150 (new feature)       |
| Phase 3 (shared UI)        | ~1,750        | ~600        | **~1,150**               |
| Phase 4 (landing template) | ~400          | ~200        | **~200**                 |
| **Total**                  | **~3,450**    | **~1,400**  | **~2,050 net reduction** |

## Adding a New Game After Refactoring

With this infrastructure, adding a new game requires:

### Backend (3 files)

1. `engines/<game>/<game>.engine.ts` — Game logic (extends `BaseGameEngine`)
2. `<category>/<game>/<game>.service.ts` — ~50 lines (extends `BaseGameService`, just `resolveOptions` + action methods)
3. `<game>.gateway.ts` — ~30 lines (extends `BaseGameGateway`, just `getGameHandlers`)

### Web (2-3 files)

1. `widgets/<Category>/<Game>/ui/Game.tsx` — Game board/arena rendering
2. `widgets/<Category>/<Game>/index.ts` — Barrel export
3. Optional: `CreationConfig.tsx` if game has unique settings beyond theme picker

### Config (3 edits)

1. Add to `GAME_CATALOG` in `games.catalog.ts`
2. Add to `gameMetadata` + `gameLoaders` in `registry.ts`
3. Add i18n keys

**Before refactoring**: ~500-700 lines of boilerplate per new game.
**After refactoring**: ~80-150 lines of game-specific code per new game.
