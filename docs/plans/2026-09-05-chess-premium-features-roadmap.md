# Chess Premium Features — Implementation Roadmap

## Context

The chess game has a solid foundation: full rules engine, Chess960, time controls, custom AI bot (4 difficulty levels), real-time multiplayer, drag-and-drop, board flipping, coach/hints, PGN export, 5-language i18n, landing page with SEO, accessibility, and 7+ test files. This roadmap covers the feature set required to make it a top-tier chess platform.

**Goal:** Transform the chess game from a solid multiplayer chess widget into a full-featured chess platform with Stockfish analysis, puzzles, tournaments, opening explorer, advanced matchmaking, social features, bot personalities, drawing tools, anti-cheat, and monetization.

---

## Phase 1 — Engine Integration & Analysis (Weeks 1–4)

### 1.1 Stockfish Backend Service

**New files (backend):**

- `apps/be/src/games/chess/engine/stockfish.module.ts` — NestJS module wrapping Stockfish WASM
- `apps/be/src/games/chess/engine/stockfish.service.ts` — manages Stockfish worker pool (configurable concurrency, e.g. 4 workers). Methods: `analyzePosition(fen, depth)`, `analyzeGame(fenHistory[])`, `getBestMove(fen, timeMs)`, `evaluate(fen)` returning `{ cp, mate, pv, depth }`
- `apps/be/src/games/chess/engine/stockfish.types.ts` — `StockfishAnalysis`, `StockfishMove`, `EngineLine`
- `apps/be/src/games/chess/engine/stockfish.controller.ts` — REST/WebSocket endpoints for analysis

**Implementation details:**

- Use `stockfish.js` or `stockfish16.wasm` (WebAssembly build) running in Node.js worker threads
- Worker pool pre-warmed at startup, recycled after N analyses to prevent memory leaks
- Depth-limited analysis (default depth 18, max 24) and time-limited analysis (default 5s, max 30s)
- Cache results by FEN hash (LRU, 10K entries) to avoid re-analyzing same positions
- Rate limit: 10 analyses/minute per user (configurable)

**Modified files:**

- `apps/be/src/games/chess/chess.module.ts` — import `StockfishModule`
- `apps/be/src/games/chess.gateway.ts` — add `chess.session.analyze` handler

### 1.2 Live Engine Evaluation During Games

**New files (web):**

- `apps/web/src/widgets/BoardGames/ChessGame/hooks/useStockfishAnalysis.ts` — WebSocket hook that subscribes to live eval updates. Emits `chess.session.analyze` after each move, receives `chess.session.analyzed` with eval data.
- `apps/web/src/widgets/BoardGames/ChessGame/ui/LiveEvalDisplay.tsx` — shows centipawn eval + mate score + principal variation line below the board (collapsible)

**Modified files:**

- `apps/web/src/widgets/BoardGames/ChessGame/ui/EvalBar.tsx` — wire to live engine eval instead of hardcoded values
- `apps/web/src/widgets/BoardGames/ChessGame/ui/ChessBoardPanel.tsx` — add `LiveEvalDisplay` in sidebar
- `apps/web/src/widgets/BoardGames/ChessGame/lib/constants.ts` — add `ENGINE_ANALYSIS_ENABLED` flag

### 1.3 Post-Game Analysis with Stockfish

**New files (web):**

- `apps/web/src/features/analysis/lib/stockfish-analyzer.ts` — replaces current `position-evaluator.ts` for chess. Sends full FEN history to backend Stockfish service, receives per-ply evals, classifies moves (brilliant/great/good/inaccuracy/mistake/blunder) with centipawn thresholds:
  - Brilliant: best move + significant eval gain (>100cp)
  - Great: only move that maintains eval
  - Good: <25cp loss
  - Inaccuracy: 25–100cp loss
  - Mistake: 100–300cp loss
  - Blunder: >300cp loss
- `apps/web/src/features/analysis/lib/accuracy-calculator.ts` — per-player accuracy % based on move quality vs engine recommendation

**Modified files:**

- `apps/web/src/features/analysis/ui/PostGameAnalysis.tsx` — use `stockfish-analyzer` instead of `position-evaluator`, show move classifications with color coding, accuracy percentages, "retry your mistakes" mode
- `apps/web/src/features/analysis/lib/analyzeGame.ts` — delegate to stockfish-analyzer when engine is available

### 1.4 Stockfish Bot Upgrade

**New files (packages/games-core):**

- `packages/games-core/src/games/chess/chess-stockfish-bot.ts` — extends `ChessBot` to optionally use Stockfish for expert difficulty. Falls back to custom engine when Stockfish unavailable.

**Modified files:**

- `apps/be/src/games/engines/chess/chess-bot.service.ts` — expert difficulty uses Stockfish via worker thread
- `packages/games-core/src/games/chess/chess-bot.ts` — add `useStockfish` option

### 1.5 File Change Summary (Phase 1)

| Action          | Files                                                                                                                                               |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| New (BE)        | `engine/stockfish.module.ts`, `engine/stockfish.service.ts`, `engine/stockfish.types.ts`, `engine/stockfish.controller.ts`                          |
| New (web)       | `hooks/useStockfishAnalysis.ts`, `ui/LiveEvalDisplay.tsx`, `lib/stockfish-analyzer.ts`, `lib/accuracy-calculator.ts`                                |
| New (core)      | `chess-stockfish-bot.ts`                                                                                                                            |
| Modified (BE)   | `chess.module.ts`, `chess.gateway.ts`, `chess-bot.service.ts`                                                                                       |
| Modified (web)  | `ui/EvalBar.tsx`, `ui/ChessBoardPanel.tsx`, `lib/constants.ts`, `features/analysis/ui/PostGameAnalysis.tsx`, `features/analysis/lib/analyzeGame.ts` |
| Modified (core) | `chess-bot.ts`                                                                                                                                      |

### 1.6 Verification

1. Start backend with Stockfish WASM installed — verify worker pool initializes without errors
2. Call `POST /chess/engine/analyze` with a FEN string — verify response contains `cp`, `pv`, `depth`
3. Play a game with live eval enabled — verify eval bar updates after each move with real engine values
4. Complete a game — verify post-game analysis shows move classifications (brilliant through blunder) and accuracy percentages
5. Play a game against expert bot — verify it uses Stockfish (stronger play than custom engine)
6. Run `pnpm typecheck` — 0 errors
7. Run `pnpm lint` — 0 errors
8. Run `pnpm test` — all tests pass

---

## Phase 2 — Puzzle System (Weeks 3–6)

### 2.1 Puzzle Database & Backend

**New files (backend):**

- `apps/be/src/games/chess/puzzles/chess-puzzle.schema.ts` — MongoDB schema:

  ```ts
  {
    puzzleId: string;        // unique (e.g. from Lichess puzzle DB)
    fen: string;             // position before puzzle
    moves: string[];         // solution moves in UCI
    rating: number;          // Glicko-2 rating
    ratingDeviation: number;
    themes: string[];        // ['fork', 'pin', 'sacrifice', 'mateIn2', ...]
    openingTags: string[];   // ['Sicilian_Defense', 'Italian_Game']
    plays: number;           // times attempted
    solutions: number;       // times solved correctly
  }
  ```

  Indexes: `{ puzzleId: 1 }` unique, `{ rating: 1 }`, `{ themes: 1 }`, `{ openingTags: 1 }`

- `apps/be/src/games/chess/puzzles/chess-puzzle-user.schema.ts` — per-user puzzle state:

  ```ts
  {
    userId: string;
    puzzleId: string;
    solved: boolean;
    attemptedAt: Date;
    timeMs: number;
  }
  ```

  Compound unique index: `{ userId, puzzleId }`

- `apps/be/src/games/chess/puzzles/chess-puzzles.service.ts` — `ChessPuzzlesService`:
  - `importPuzzles(puzzles[])` — bulk upsert (for initial Lichess puzzle import + ongoing updates)
  - `getDailyPuzzle()` — returns today's featured puzzle (deterministic by date)
  - `getPuzzle(rating?)` — adaptive: picks puzzle near user's puzzle rating ±100
  - `getPuzzleSet(theme?, count?)` — themed puzzle set
  - `checkSolution(userId, puzzleId, moves[])` — validates solution, updates user rating
  - `getUserPuzzleRating(userId)` — Glicko-2 puzzle rating
  - `getUserStats(userId)` — total solved, streak, rating history
  - `getPuzzleStorm(userId, durationMs)` — speed puzzle mode: rapid-fire puzzles, scored by solves

- `apps/be/src/games/chess/puzzles/chess-puzzles.module.ts` — NestJS module
- `apps/be/src/games/chess/puzzles/chess-puzzles.controller.ts` — REST endpoints

**Puzzle import strategy:**

- Lichess publishes 2M+ rated puzzles under CC-0 license: `https://database.lichess.org/#puzzles`
- Import in batches of 10K, deduplicate by puzzleId
- Update puzzle ratings periodically (Lichess recalculates them)

### 2.2 Puzzle Types

| Mode                  | Description                                                   |
| --------------------- | ------------------------------------------------------------- |
| **Daily Puzzle**      | One featured puzzle per day, shared across all users          |
| **Rated Puzzles**     | Adaptive difficulty, Glicko-2 rated, shows rating change      |
| **Puzzle Rush**       | Timed mode: 3 or 5 minutes, unlimited puzzles, score = solves |
| **Puzzle Survival**   | Same as rush but ends on first mistake                        |
| **Puzzle Streak**     | Consecutive solves, streak ends on mistake                    |
| **Themed Puzzles**    | Filter by theme: forks, pins, skewers, mate-in-X, endgame     |
| **Puzzle of the Day** | Same as daily, but accessible anytime once seen               |

### 2.3 Frontend Puzzle UI

**New files (web):**

- `apps/web/src/widgets/BoardGames/ChessPuzzles/` — puzzle game widget:
  - `ui/PuzzleBoard.tsx` — chess board in puzzle mode (opponent moves first, player responds)
  - `ui/PuzzleControls.tsx` — next puzzle, hint, solution reveal, rating display
  - `ui/PuzzleRush.tsx` — timed puzzle mode with countdown, score, combo
  - `ui/PuzzleStreak.tsx` — streak display with flame icon
  - `ui/PuzzleRating.tsx` — rating change animation after solve
  - `hooks/usePuzzleState.ts` — puzzle state management
  - `hooks/usePuzzleRush.ts` — timer + scoring logic
  - `lib/puzzle-api.ts` — API client

- `apps/web/src/app/[locale]/(app)/games/chess/puzzles/page.tsx` — puzzle landing page
- `apps/web/src/app/[locale]/(app)/games/chess/puzzles/PuzzleClient.tsx` — client component

### 2.4 File Change Summary (Phase 2)

| Action        | Files                                                                                                                                                                                                                                                                                                                                                                          |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| New (BE)      | `puzzles/chess-puzzle.schema.ts`, `puzzles/chess-puzzle-user.schema.ts`, `puzzles/chess-puzzles.service.ts`, `puzzles/chess-puzzles.module.ts`, `puzzles/chess-puzzles.controller.ts`                                                                                                                                                                                          |
| New (web)     | `ChessPuzzles/ui/PuzzleBoard.tsx`, `ChessPuzzles/ui/PuzzleControls.tsx`, `ChessPuzzles/ui/PuzzleRush.tsx`, `ChessPuzzles/ui/PuzzleStreak.tsx`, `ChessPuzzles/ui/PuzzleRating.tsx`, `ChessPuzzles/hooks/usePuzzleState.ts`, `ChessPuzzles/hooks/usePuzzleRush.ts`, `ChessPuzzles/lib/puzzle-api.ts`, `app/.../chess/puzzles/page.tsx`, `app/.../chess/puzzles/PuzzleClient.tsx` |
| Modified (BE) | `chess.module.ts` — register PuzzlesModule                                                                                                                                                                                                                                                                                                                                     |

### 2.5 Verification

1. Import Lichess puzzle dataset — verify puzzles stored in MongoDB with correct fields
2. Call `GET /chess/puzzles/daily` — verify returns a valid puzzle with FEN and solution
3. Call `GET /chess/puzzles/rated` — verify returns puzzle near user's rating
4. Submit correct solution — verify rating increases
5. Submit incorrect solution — verify rating decreases, streak resets
6. Start Puzzle Rush mode — verify timer counts down, score increments on correct solves
7. Complete Puzzle Rush — verify final score and leaderboard position
8. Run `pnpm typecheck` / `pnpm lint` / `pnpm test` — all green

---

## Phase 3 — Opening Explorer (Weeks 5–7)

### 3.1 Opening Database Backend

**New files (backend):**

- `apps/be/src/games/chess/openings/chess-opening.schema.ts` — MongoDB schema:

  ```ts
  {
    moves: string[];       // UCI moves from start
    fen: string;           // position after moves
    white: number;         // games won by white
    draws: number;
    black: number;         // games won by black
    totalGames: number;
    avgRating: number;
    opening: string;       // e.g. "Sicilian Defense"
    openingFamily: string; // e.g. "Sicilian"
    eco: string;           // ECO code (A00-E99)
  }
  ```

  Indexes: `{ moves: 1 }` (for prefix queries), `{ eco: 1 }`, `{ opening: 1 }`

- `apps/be/src/games/chess/openings/chess-openings.service.ts` — `ChessOpeningsService`:
  - `importOpenings(data[])` — bulk import from Lichess opening explorer dataset (6B+ games, CC-0 license)
  - `getExplorer(fen, playerLevel?)` — returns moves played from this position with win rates, filtered by player rating range
  - `getOpeningName(eco?)` — lookup opening name
  - `getPopularOpenings(limit?)` — most played openings
  - `getPersonalExplorer(userId, fen?)` — user's own opening stats

- `apps/be/src/games/chess/openings/chess-openings.module.ts`
- `apps/be/src/games/chess/openings/chess-openings.controller.ts`

### 3.2 Opening Explorer Frontend

**New files (web):**

- `apps/web/src/features/analysis/ui/OpeningExplorer.tsx` — tabular view showing moves from a position with: move notation, games played, white %, draws %, black %, bar chart visualization
- `apps/web/src/features/analysis/ui/OpeningName.tsx` — displays opening name + ECO code for current position
- `apps/web/src/features/analysis/hooks/useOpeningExplorer.ts` — React Query hook

**Modified files:**

- `apps/web/src/widgets/BoardGames/ChessGame/ui/ChessBoardPanel.tsx` — add "Explorer" tab in sidebar
- `apps/web/src/widgets/BoardGames/ChessGame/ui/ChessGame.tsx` — pass FEN to explorer

### 3.3 File Change Summary (Phase 3)

| Action         | Files                                                                                                                                                  |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| New (BE)       | `openings/chess-opening.schema.ts`, `openings/chess-openings.service.ts`, `openings/chess-openings.module.ts`, `openings/chess-openings.controller.ts` |
| New (web)      | `features/analysis/ui/OpeningExplorer.tsx`, `features/analysis/ui/OpeningName.tsx`, `features/analysis/hooks/useOpeningExplorer.ts`                    |
| Modified (web) | `ui/ChessBoardPanel.tsx`, `ui/ChessGame.tsx`                                                                                                           |

### 3.4 Verification

1. Import opening database — verify positions stored with correct win/draw/loss counts
2. Call `GET /chess/openings/explorer?fen=...` — verify returns playable moves with stats
3. Navigate moves on board — verify explorer updates to show new position stats
4. Verify opening name displays for known positions (e.g., after 1.e4 e5 2.Nf3 shows "Italian Game")
5. Run `pnpm typecheck` / `pnpm lint` / `pnpm test` — all green

---

## Phase 4 — Tournaments (Weeks 6–9)

### 4.1 Chess Tournament Types

| Format    | Description                                                                                                                                                   |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Arena** | Continuous pairings: players who finish get paired immediately. Points: 2 for win, 1 for draw, 0 for loss. Bonus for win streaks. Duration: 15min, 30min, 1hr |
| **Swiss** | FIDE-style: round-robin within rating brackets, fixed number of rounds (5–7)                                                                                  |
| **Simul** | One strong player plays multiple opponents simultaneously                                                                                                     |

### 4.2 Backend Tournament Engine

**New files (backend):**

- `apps/be/src/games/chess/tournaments/chess-tournament.types.ts` — `ChessTournament`, `TournamentPlayer`, `TournamentPairing`, `TournamentStanding`, `TournamentResult`
- `apps/be/src/games/chess/tournaments/chess-tournament.service.ts` — `ChessTournamentService`:
  - `createTournament(config)` — creates arena/swiss/simul
  - `joinTournament(tournamentId, userId)` — register player
  - `startTournament(tournamentId)` — begin pairings
  - `pairPlayers(tournamentId)` — arena: immediate pairing on game end; swiss: round-based
  - `recordResult(tournamentId, gameId, result)` — update standings
  - `getStandings(tournamentId)` — live leaderboard with points, streaks, tiebreaks
  - `endTournament(tournamentId)` — finalize, distribute prizes, update ratings

- `apps/be/src/games/chess/tournaments/chess-tournament-pairing.ts` — pairing algorithms:
  - Arena: ELO-based pairing with anti-repetition (don't pair same players twice)
  - Swiss: Buholz/Medvitsch tiebreak calculation

**Modified files:**

- `apps/be/src/games/chess/chess.module.ts` — import TournamentModule
- `apps/be/src/games/chess.gateway.ts` — add tournament events (`chess.tournament.join`, `chess.tournament.pair`, `chess.tournament.standings`)
- `apps/be/src/games/chess/chess.service.ts` — integrate tournament result recording into game completion flow

### 4.3 Frontend Tournament UI

**New files (web):**

- `apps/web/src/widgets/BoardGames/ChessGame/ui/TournamentLobby.tsx` — browse/join tournaments, see upcoming and live events
- `apps/web/src/widgets/BoardGames/ChessGame/ui/TournamentStandings.tsx` — live leaderboard with points, streaks, rank
- `apps/web/src/widgets/BoardGames/ChessGame/ui/TournamentTimer.tsx` — countdown to tournament start/end
- `apps/web/src/app/[locale]/(app)/games/chess/tournaments/page.tsx` — tournament hub page

**Modified files:**

- `apps/web/src/widgets/BoardGames/ChessGame/ui/ChessLobby.tsx` — add tournament entry point

### 4.4 File Change Summary (Phase 4)

| Action         | Files                                                                                                                         |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| New (BE)       | `tournaments/chess-tournament.types.ts`, `tournaments/chess-tournament.service.ts`, `tournaments/chess-tournament-pairing.ts` |
| New (web)      | `ui/TournamentLobby.tsx`, `ui/TournamentStandings.tsx`, `ui/TournamentTimer.tsx`, `app/.../chess/tournaments/page.tsx`        |
| Modified (BE)  | `chess.module.ts`, `chess.gateway.ts`, `chess.service.ts`                                                                     |
| Modified (web) | `ui/ChessLobby.tsx`                                                                                                           |

### 4.5 Verification

1. Create an arena tournament — verify it appears in lobby with correct config
2. Join tournament — verify player added to standings
3. Start tournament — verify pairings created based on ELO
4. Complete a game — verify standings update, next pairing generated
5. Win streak — verify bonus points applied
6. End tournament — verify final standings, prizes distributed
7. Run `pnpm typecheck` / `pnpm lint` / `pnpm test` — all green

---

## Phase 5 — Bot Personalities (Weeks 7–10)

### 5.1 Personality Configuration System

**New files (packages/games-core):**

- `packages/games-core/src/games/chess/chess-bot-personalities.ts` — personality definitions:

  ```ts
  {
    id: string;              // e.g. 'aggressive-annie'
    name: string;            // display name
    avatar: string;          // emoji or avatar URL
    rating: number;          // target ELO range
    style: 'aggressive' | 'positional' | 'tactical' | 'defensive' | 'solid';
    openingPreference: string[];  // preferred openings (ECO codes or names)
    timeManagement: 'blitz' | 'thinker' | 'steady';
    chatMessages: {          // optional chat during games
      onWin: string[];
      onLoss: string[];
      onBlunder: string[];
      onGreatMove: string[];
    };
    evaluationModifiers: {
      attackWeight: number;    // multiplier for attack squares in eval
      safetyWeight: number;    // multiplier for king safety
      materialWeight: number;  // material importance vs positional
    };
  }
  ```

  **Personality roster (20+ bots):**

  | Bot               | Style      | Rating | Openings                |
  | ----------------- | ---------- | ------ | ----------------------- |
  | Rookie Rick       | Tactical   | 400    | Scholar's Mate attempts |
  | Defensive Dana    | Defensive  | 600    | London System           |
  | Aggressive Annie  | Aggressive | 800    | King's Gambit           |
  | Positional Pete   | Positional | 1000   | Queen's Gambit          |
  | Blitz Bobby       | Blitz      | 1200   | Sicilian                |
  | Steady Steve      | Solid      | 1400   | Caro-Kann               |
  | Tactical Tina     | Tactical   | 1600   | Evans Gambit            |
  | Attack Alex       | Aggressive | 1800   | King's Indian           |
  | Scholar Susan     | Positional | 2000   | Nimzo-Indian            |
  | Master Mike       | Balanced   | 2200   | Ruy Lopez               |
  | Grandmaster Grace | Positional | 2400   | English                 |
  | Legend Larry      | Aggressive | 2600   | Sicilian Dragon         |
  | Champion Carl     | Balanced   | 2800   | Open games              |

- `packages/games-core/src/games/chess/chess-bot-openings.ts` — opening book with per-personality repertoire:
  ```ts
  {
    [personalityId: string]: {
      white: { [position: string]: string[] };  // FEN → preferred moves
      black: { [position: string]: string[] };
    }
  }
  ```

**Modified files:**

- `packages/games-core/src/games/chess/chess-bot.ts` — add personality support:
  - Constructor accepts optional `personality` parameter
  - Opening book lookup before search (if personality has opening preference)
  - Evaluation function uses personality modifiers (attack/safety/material weights)
  - Move selection adds style-based noise (aggressive bots prefer attacking moves, defensive bots prefer safe moves)

### 5.2 Backend Bot Service Update

**Modified files:**

- `apps/be/src/games/engines/chess/chess-bot.service.ts`:
  - `checkAndPlay()` uses personality-based move selection
  - Bot personality stored in session options
  - Chat messages sent to game chat based on personality
  - Time management follows personality profile (blitz bots play faster, thinkers take longer on complex positions)

### 5.3 Frontend Bot Selection

**New files (web):**

- `apps/web/src/widgets/BoardGames/ChessGame/ui/BotSelector.tsx` — personality picker with avatars, names, ratings, style badges. Shows personality description and chat preview.

**Modified files:**

- `apps/web/src/widgets/BoardGames/ChessGame/ui/ChessLobby.tsx` — replace simple difficulty dropdown with `BotSelector` component
- `apps/web/src/widgets/BoardGames/ChessGame/lib/constants.ts` — add bot personality list

### 5.4 File Change Summary (Phase 5)

| Action          | Files                                                 |
| --------------- | ----------------------------------------------------- |
| New (core)      | `chess-bot-personalities.ts`, `chess-bot-openings.ts` |
| New (web)       | `ui/BotSelector.tsx`                                  |
| Modified (core) | `chess-bot.ts`                                        |
| Modified (BE)   | `chess-bot.service.ts`                                |
| Modified (web)  | `ui/ChessLobby.tsx`, `lib/constants.ts`               |

### 5.5 Verification

1. Select "Aggressive Annie" bot — verify bot prefers King's Gambit and attacking play
2. Select "Defensive Dana" bot — verify bot plays London System and solid defense
3. Play against each personality — verify distinct playing styles (check opening book usage)
4. Verify chat messages appear during game (on win, loss, blunder, great move)
5. Verify bot strength matches declared rating (±200 ELO)
6. Run `pnpm typecheck` / `pnpm lint` / `pnpm test` — all green

---

## Phase 6 — Drawing Tools & Board Interactions (Weeks 9–11)

### 6.1 Arrow & Circle Drawing

**New files (web):**

- `apps/web/src/widgets/BoardGames/ChessGame/ui/BoardOverlay.tsx` — SVG overlay on the chess board for rendering arrows and circles. Handles:
  - Right-click drag: draw arrow (from square → to square, colored by direction)
  - Right-click on square: draw colored circle
  - Shift + right-click: cycle colors (green, red, blue, yellow, orange)
  - Click on empty area: clear all drawings
  - Drawings are ephemeral (not sent to opponent)
  - Mobile: long-press to open drawing palette

- `apps/web/src/widgets/BoardGames/ChessGame/hooks/useBoardDrawings.ts` — state management for arrows/circles:
  - `Arrow { from: BoardPosition, to: BoardPosition, color: string }`
  - `Circle { square: BoardPosition, color: string }`
  - Max 5 arrows + 5 circles visible at once

**Modified files:**

- `apps/web/src/widgets/BoardGames/ChessGame/ui/ChessBoard.tsx` — wrap board in `BoardOverlay` container, forward right-click/long-press events
- `apps/web/src/widgets/BoardGames/ChessGame/ui/ChessBoard.tsx` — add `onRightClick` handler, prevent context menu on board

### 6.2 Move Arrows (Last Move Indicator Enhancement)

**Modified files:**

- `apps/web/src/widgets/BoardGames/ChessGame/ui/ChessBoard.tsx` — enhance last-move highlighting to use arrow indicators (translucent arrow from source to destination square)

### 6.3 File Change Summary (Phase 6)

| Action         | Files                                              |
| -------------- | -------------------------------------------------- |
| New (web)      | `ui/BoardOverlay.tsx`, `hooks/useBoardDrawings.ts` |
| Modified (web) | `ui/ChessBoard.tsx`                                |

### 6.4 Verification

1. Right-click drag on board — verify arrow appears from source to destination
2. Right-click on square — verify colored circle appears
3. Shift + right-click — verify color cycles through palette
4. Click empty area — verify all drawings clear
5. Play a move — verify last-move arrow appears
6. Mobile: long-press — verify drawing palette appears
7. Verify drawings don't interfere with piece interaction (left-click/drag still works)
8. Run `pnpm typecheck` / `pnpm lint` / `pnpm test` — all green

---

## Phase 7 — Social Features & Profiles (Weeks 10–13)

### 7.1 Enhanced Player Profiles

**New files (backend):**

- `apps/be/src/games/chess/profiles/chess-profile.schema.ts` — extended profile:

  ```ts
  {
    userId: string;
    bio: string;              // max 500 chars
    country: string;          // ISO code
    title: string;            // NM, FM, IM, GM (self-reported, verified later)
    perGameStats: {
      [gameType: string]: {   // 'bullet', 'blitz', 'rapid', 'classical'
        games: number;
        wins: number;
        losses: number;
        draws: number;
        elo: number;
        peakElo: number;
        winStreak: number;
        currentStreak: number;
      };
    };
    puzzleRating: number;
    totalPuzzlesSolved: number;
    recentGames: string[];    // last 10 game IDs
    favoriteOpening: string;
    playStyle: string;        // auto-detected from game data
  }
  ```

- `apps/be/src/games/chess/profiles/chess-profiles.service.ts` — `ChessProfilesService`:
  - `getProfile(userId)` — full profile with stats
  - `updateProfile(userId, updates)` — bio, country, title
  - `getGameHistory(userId, limit, offset)` — paginated game history
  - `getStats(userId)` — detailed statistics dashboard

**Modified files:**

- `apps/be/src/games/player-stats.service.ts` — add chess-specific stat fields

### 7.2 Social Features

**New files (web):**

- `apps/web/src/features/chess/ui/PlayerProfile.tsx` — profile page with:
  - Avatar, username, title badge, country flag
  - Rating charts (line graph over time for each time control)
  - Recent games list with results
  - Opening preferences (pie chart of most played openings)
  - Style badge (aggressive/positional/tactical based on game analysis)
  - Puzzle rating and stats

- `apps/web/src/features/chess/ui/FriendsList.tsx` — friends list with online status, recent activity, quick challenge button
- `apps/web/src/features/chess/ui/ChallengeButton.tsx` — send challenge to friend with time control selection
- `apps/web/src/features/chess/ui/GameHistory.tsx` — paginated game list with filters (date, result, opponent, time control)

**Modified files:**

- `apps/web/src/app/[locale]/(app)/players/[id]/page.tsx` — render `PlayerProfile`
- `apps/be/src/friends/friends.service.ts` — add online status tracking

### 7.3 Clubs / Teams

**New files (backend):**

- `apps/be/src/games/chess/clubs/chess-club.schema.ts` — club document
- `apps/be/src/games/chess/clubs/chess-clubs.service.ts` — create/join/leave clubs, club leaderboards, club matches
- `apps/be/src/games/chess/clubs/chess-clubs.controller.ts` — REST endpoints

**New files (web):**

- `apps/web/src/features/chess/ui/ClubList.tsx` — browse/search clubs
- `apps/web/src/features/chess/ui/ClubPage.tsx` — club profile with members, leaderboard, matches

### 7.4 File Change Summary (Phase 7)

| Action         | Files                                                                                                                                                                                                                        |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| New (BE)       | `profiles/chess-profile.schema.ts`, `profiles/chess-profiles.service.ts`, `clubs/chess-club.schema.ts`, `clubs/chess-clubs.service.ts`, `clubs/chess-clubs.controller.ts`                                                    |
| New (web)      | `features/chess/ui/PlayerProfile.tsx`, `features/chess/ui/FriendsList.tsx`, `features/chess/ui/ChallengeButton.tsx`, `features/chess/ui/GameHistory.tsx`, `features/chess/ui/ClubList.tsx`, `features/chess/ui/ClubPage.tsx` |
| Modified (BE)  | `player-stats.service.ts`, `friends/friends.service.ts`                                                                                                                                                                      |
| Modified (web) | `app/.../players/[id]/page.tsx`                                                                                                                                                                                              |

### 7.5 Verification

1. Visit player profile — verify stats, rating charts, recent games display
2. Send friend challenge — verify challenge notification received
3. Create club — verify club appears in search
4. Join club — verify member list updates, club leaderboard shows
5. Run `pnpm typecheck` / `pnpm lint` / `pnpm test` — all green

---

## Phase 8 — Advanced Matchmaking & Anti-Cheat (Weeks 12–15)

### 8.1 Enhanced Matchmaking

**Modified files:**

- `apps/be/src/games/rooms/game-rooms.matchmaking.service.ts` — enhance existing matchmaking:
  - **Rating-based pairing:** Prioritize ELO ±100, expand to ±200 after 10s, ±400 after 20s
  - **Time control buckets:** Separate queues for bullet/blitz/rapid/classical
  - **Match quality score:** Pair based on combined rating distance + recent form
  - **Provisional rating handling:** New players (K=40) matched with other new players first
  - **Rematch protection:** Don't pair same opponents twice in a row
  - **Region-based:** Prioritize same-region players for latency

### 8.2 Anti-Cheat System

**New files (backend):**

- `apps/be/src/games/chess/anticheat/chess-anticheat.service.ts` — `ChessAnticheatService`:
  - `analyzeGame(sessionId, moves[], moveTimes[])` — post-game cheat detection:
    - Compare player moves to engine recommendations at their rating level
    - Flag games where player plays >90% of top-3 engine moves
    - Analyze move time patterns (consistent 0.3s = suspicious, human moves have variance)
    - Check opening preparation depth (unusual theory at low rating = suspicious)
    - Statistical deviation from expected accuracy at rating level
  - `flagUser(userId, reason, confidence)` — flag suspicious account
  - `getFlaggedUsers()` — admin review queue
  - `adjustConfidence(userId, newEvidence)` — Bayesian confidence update

- `apps/be/src/games/chess/anticheat/chess-anticheat.types.ts` — `CheatFlag`, `CheatAnalysis`, `CheatReason`

**Modified files:**

- `apps/be/src/games/chess/chess.service.ts` — run anti-cheat analysis on game completion
- `apps/be/src/games/chess.gateway.ts` — add spectating with delay (30s) for flagged games

### 8.3 Spectator Mode

**New files (web):**

- `apps/web/src/widgets/BoardGames/ChessGame/ui/SpectatorOverlay.tsx` — spectator UI:
  - Viewer count badge
  - Chat (read-only for spectators, or chat with delay)
  - Engine eval display
  - "Join as player" button for casual games
  - Stream key for broadcasting

**Modified files:**

- `apps/web/src/widgets/BoardGames/ChessGame/ui/ChessBoard.tsx` — spectator mode renders without piece interaction
- `apps/web/src/widgets/BoardGames/ChessGame/hooks/useChessState.ts` — detect spectator status

### 8.4 File Change Summary (Phase 8)

| Action         | Files                                                                        |
| -------------- | ---------------------------------------------------------------------------- |
| New (BE)       | `anticheat/chess-anticheat.service.ts`, `anticheat/chess-anticheat.types.ts` |
| New (web)      | `ui/SpectatorOverlay.tsx`                                                    |
| Modified (BE)  | `chess.service.ts`, `chess.gateway.ts`                                       |
| Modified (web) | `ui/ChessBoard.tsx`, `hooks/useChessState.ts`                                |
| Modified (BE)  | `rooms/game-rooms.matchmaking.service.ts`                                    |

### 8.5 Verification

1. Play 10 games — verify matchmaking pairs within ±100 ELO initially
2. Wait 15s in queue — verify search expands to ±200
3. Complete a game — verify anti-cheat analysis runs (check logs)
4. Play a game where you play all engine top moves — verify flag raised
5. Spectate a game — verify 30s delay, viewer count, read-only board
6. Run `pnpm typecheck` / `pnpm lint` / `pnpm test` — all green

---

## Phase 9 — Chess Variants (Weeks 14–17)

### 9.1 New Variant Implementations

**New files (packages/games-core):**

- `packages/games-core/src/games/chess/chess-variants/king-of-the-hill.ts` — modified win condition: king reaches e4/e5/d4/d5 center squares
- `packages/games-core/src/games/chess/chess-variants/three-check.ts` — win by checking opponent 3 times
- `packages/games-core/src/games/chess/chess-variants/crazyhouse.ts` — captured pieces can be dropped back on the board
- `packages/games-core/src/games/chess/chess-variants/atomic.ts` — captures explode all pieces on surrounding squares
- `packages/games-core/src/games/chess/chess-variants/bughouse.ts` — team variant: partner's captures become your pieces

**Modified files:**

- `packages/games-core/src/games/chess/chess.engine.ts` — variant factory pattern: `createChessEngine(variant)` returns variant-specific engine
- `packages/games-core/src/games/chess/chess.constants.ts` — add variant definitions
- `apps/be/src/games/chess/chess.service.ts` — variant selection in game creation
- `apps/be/src/games/games.catalog.ts` — register all variants

### 9.2 Variant-Specific UI

**Modified files:**

- `apps/web/src/widgets/BoardGames/ChessGame/ui/ChessBoard.tsx` — variant-specific rendering:
  - King of the Hill: highlight center squares
  - Crazyhouse: show captured pieces sidebar with drop capability
  - Three-check: show check counter
  - Atomic: explosion animation on capture

### 9.3 File Change Summary (Phase 9)

| Action          | Files                                                                                                                                                           |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| New (core)      | `chess-variants/king-of-the-hill.ts`, `chess-variants/three-check.ts`, `chess-variants/crazyhouse.ts`, `chess-variants/atomic.ts`, `chess-variants/bughouse.ts` |
| Modified (core) | `chess.engine.ts`, `chess.constants.ts`                                                                                                                         |
| Modified (BE)   | `chess.service.ts`, `games.catalog.ts`                                                                                                                          |
| Modified (web)  | `ui/ChessBoard.tsx`                                                                                                                                             |

### 9.4 Verification

1. Create King of the Hill game — verify center squares highlighted, win by king reaching center works
2. Create Crazyhouse game — verify captured pieces appear in sidebar, can be dropped
3. Create Three-Check game — verify check counter displays, win on 3rd check
4. Create Atomic game — verify explosion animation, surrounding pieces removed
5. Run `pnpm typecheck` / `pnpm lint` / `pnpm test` — all green

---

## Phase 10 — Mobile Optimization (Weeks 16–19)

### 10.1 Native Chess Board Component

**New files (mobile):**

- `apps/mobile/app/games/chess/` — Expo Router screens:
  - `index.tsx` — chess lobby (time control, bot selection, matchmaking)
  - `play.tsx` — game screen with native board
  - `analysis.tsx` — post-game analysis screen
  - `puzzles.tsx` — puzzle modes

- `apps/mobile/src/games/chess/ChessBoard.tsx` — React Native chess board:
  - `Animated.View` for piece movement (spring animation)
  - Gesture handler for drag-and-drop (PanGestureHandler)
  - Responsive sizing based on screen width
  - Board flipping for black player
  - Touch-optimized: larger tap targets, haptic feedback on piece selection

- `apps/mobile/src/games/chess/ChessControls.tsx` — time control, move list, actions
- `apps/mobile/src/games/chess/ChessEvalBar.tsx` — animated eval bar
- `apps/mobile/src/games/chess/ChessPromotion.tsx` — promotion picker (bottom sheet)

### 10.2 Mobile-First UX Patterns

**Swipe navigation:**

- Swipe left: next move in analysis
- Swipe right: previous move in analysis
- Swipe up: open move list
- Swipe down: close move list

**Touch gestures:**

- Tap piece: select, show legal moves
- Tap destination: move piece
- Long press: piece info / drawing mode
- Two-finger tap: undo move (analysis mode)

**Haptic feedback:**

- Light impact on piece selection
- Medium impact on move completion
- Heavy impact on check/checkmate

### 10.3 File Change Summary (Phase 10)

| Action       | Files                                                                                                                                                                                                                                                                   |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| New (mobile) | `app/games/chess/index.tsx`, `app/games/chess/play.tsx`, `app/games/chess/analysis.tsx`, `app/games/chess/puzzles.tsx`, `src/games/chess/ChessBoard.tsx`, `src/games/chess/ChessControls.tsx`, `src/games/chess/ChessEvalBar.tsx`, `src/games/chess/ChessPromotion.tsx` |

### 10.4 Verification

1. Open chess on mobile — verify lobby loads with time control selection
2. Start game — verify board renders at correct size, pieces are touchable
3. Drag piece — verify smooth animation, haptic feedback
4. Flip board — verify smooth transition
5. Complete game — verify analysis screen with swipe navigation
6. Test on iOS and Android — verify consistent experience
7. Run `pnpm typecheck` / `pnpm lint` / `pnpm test` — all green

---

## Phase 11 — Monetization & Cosmetics (Weeks 18–21)

### 11.1 Freemium Model

**New files (backend):**

- `apps/be/src/games/chess/subscription/chess-subscription.service.ts` — subscription management:
  - Free tier: ads, 1 game review/day, 5 puzzles/day, basic bots
  - Premium ($4.99/mo): ad-free, unlimited reviews, unlimited puzzles, all bots, themes
  - Pro ($9.99/mo): everything + video lessons, opening explorer full data, priority matchmaking

**Modified files:**

- `apps/be/src/payments/payments.service.ts` — add chess subscription tiers
- `apps/be/src/games/chess/chess.service.ts` — check subscription limits before analysis/puzzles

### 11.2 Cosmetic Store

**New files (backend):**

- `apps/be/src/games/chess/cosmetics/chess-cosmetic.schema.ts` — cosmetic items:

  ```ts
  {
    id: string;
    type: 'board' | 'pieces' | 'frame' | 'emote' | 'victory';
    name: string;
    description: string;
    price: number; // in gems
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    preview: string; // image URL
    data: object; // type-specific config
  }
  ```

- `apps/be/src/games/chess/cosmetics/chess-cosmetics.service.ts` — purchase, equip, inventory

**New files (web):**

- `apps/web/src/features/chess/ui/CosmeticShop.tsx` — browse/buy cosmetics with previews
- `apps/web/src/features/chess/ui/BoardCustomizer.tsx` — preview and equip board/piece themes
- `apps/web/src/features/chess/ui/VictoryAnimation.tsx` — win celebration effects

### 11.3 Battle Pass

**New files (backend):**

- `apps/be/src/games/chess/battlepass/chess-battlepass.service.ts` — seasonal battle pass:
  - Free track: basic rewards (coins, basic themes)
  - Premium track: exclusive cosmetics, emotes, frames
  - XP earned from games, puzzles, tournaments
  - 50 levels per season (30-day seasons)

### 11.4 File Change Summary (Phase 11)

| Action        | Files                                                                                                                                                                |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| New (BE)      | `subscription/chess-subscription.service.ts`, `cosmetics/chess-cosmetic.schema.ts`, `cosmetics/chess-cosmetics.service.ts`, `battlepass/chess-battlepass.service.ts` |
| New (web)     | `features/chess/ui/CosmeticShop.tsx`, `features/chess/ui/BoardCustomizer.tsx`, `features/chess/ui/VictoryAnimation.tsx`                                              |
| Modified (BE) | `payments/payments.service.ts`, `chess.service.ts`                                                                                                                   |

### 11.5 Verification

1. Purchase premium subscription — verify ad removal, unlimited puzzles
2. Buy board theme from shop — verify it appears in inventory
3. Equip custom board/pieces — verify game renders with new theme
4. Play games — verify XP earned, battle pass progresses
5. Reach battle pass level 50 — verify reward unlocked
6. Run `pnpm typecheck` / `pnpm lint` / `pnpm test` — all green

---

## Phase 12 — Live Broadcasting & Streaming (Weeks 20–23)

### 12.1 Live Game Broadcasting

**New files (backend):**

- `apps/be/src/games/chess/broadcast/chess-broadcast.service.ts` — broadcast management:
  - `createBroadcast(gameId, commentary?)` — start broadcasting a game
  - `addCommentary(broadcastId, commentary)` — add text commentary
  - `getBroadcast(broadcastId)` — current game state + commentary feed
  - `getActiveBroadcasts()` — list of live games being broadcast

- `apps/be/src/games/chess/broadcast/chess-broadcast.gateway.ts` — WebSocket for real-time commentary

**New files (web):**

- `apps/web/src/features/chess/ui/BroadcastPlayer.tsx` — watch live game with:
  - Board updates in real-time
  - Engine evaluation overlay
  - Commentary feed (text)
  - Viewer count
  - Chat

- `apps/web/src/app/[locale]/(app)/games/chess/broadcasts/page.tsx` — live games hub
- `apps/web/src/app/[locale]/(app)/games/chess/broadcasts/[id]/page.tsx` — individual broadcast

### 12.2 Streamer Integration

- OBS-compatible overlay URL for chess board + eval
- Stream key generation for Twitch/YouTube integration
- Chat bot integration for move announcements

### 12.3 File Change Summary (Phase 12)

| Action    | Files                                                                                                                  |
| --------- | ---------------------------------------------------------------------------------------------------------------------- |
| New (BE)  | `broadcast/chess-broadcast.service.ts`, `broadcast/chess-broadcast.gateway.ts`                                         |
| New (web) | `features/chess/ui/BroadcastPlayer.tsx`, `app/.../chess/broadcasts/page.tsx`, `app/.../chess/broadcasts/[id]/page.tsx` |

### 12.4 Verification

1. Start broadcasting a game — verify it appears in live games hub
2. Watch broadcast — verify real-time board updates
3. Add commentary — verify it appears in feed
4. Multiple viewers — verify viewer count updates
5. Run `pnpm typecheck` / `pnpm lint` / `pnpm test` — all green

---

## Implementation Order Summary

| Phase | Feature                           | Weeks | Dependencies                                      |
| ----- | --------------------------------- | ----- | ------------------------------------------------- |
| 1     | Engine Integration & Analysis     | 1–4   | None                                              |
| 2     | Puzzle System                     | 3–6   | Phase 1 (Stockfish for puzzle validation)         |
| 3     | Opening Explorer                  | 5–7   | None                                              |
| 4     | Tournaments                       | 6–9   | Phase 1 (engine for automated analysis)           |
| 5     | Bot Personalities                 | 7–10  | None                                              |
| 6     | Drawing Tools                     | 9–11  | None                                              |
| 7     | Social Features & Profiles        | 10–13 | None                                              |
| 8     | Advanced Matchmaking & Anti-Cheat | 12–15 | Phase 1 (engine for cheat detection)              |
| 9     | Chess Variants                    | 14–17 | None                                              |
| 10    | Mobile Optimization               | 16–19 | Phases 1–6 (all features must exist on web first) |
| 11    | Monetization & Cosmetics          | 18–21 | Phases 1–7 (features drive monetization)          |
| 12    | Live Broadcasting                 | 20–23 | Phase 8 (spectator mode foundation)               |

**Parallel tracks:** Phases 1–3 can run in parallel. Phases 4–7 can run in parallel after Phase 1. Phases 8–9 can run in parallel. Phases 10–12 can run in parallel.

**Estimated total duration:** 23 weeks (5.5 months) with parallel execution.

---

## i18n Keys (All Phases)

Add translation keys to all locale files (`en`, `ru`, `es`, `fr`, `by`) for:

- Stockfish analysis labels (eval, cp, mate, depth, PV, accuracy, brilliant, great, good, inaccuracy, mistake, blunder)
- Puzzle labels (daily, rated, rush, survival, streak, themes, solve, hint, rating, combo)
- Opening explorer labels (explorer, games, white wins, draws, black wins, popular, opening, eco)
- Tournament labels (arena, swiss, simul, standings, pairings, prize, streak bonus)
- Bot personality names, descriptions, chat messages
- Drawing tool labels (arrow, circle, color, clear)
- Profile labels (bio, country, title, stats, style, history)
- Club labels (create, join, leave, members, leaderboard)
- Matchmaking labels (searching, estimated wait, queue position)
- Anti-cheat labels (flagged, under review, cleared)
- Variant labels (king of the hill, three-check, crazyhouse, atomic, bughouse)
- Mobile-specific labels (swipe to navigate, long press to draw)
- Subscription labels (free, premium, pro, subscribe, manage)
- Cosmetic labels (shop, board, pieces, frame, emote, victory, equip, unequip, rarity)
- Battle pass labels (season, level, track, reward, xp, free, premium)
- Broadcast labels (live, viewers, commentary, start broadcast)

---

## Commit Convention

Each phase should be committed as a logical unit following Conventional Commits:

```
feat(chess): add Stockfish engine integration (Phase 1)
feat(chess): add puzzle system with daily/rush/streak modes (Phase 2)
feat(chess): add opening explorer with Lichess database (Phase 3)
feat(chess): add tournament system with arena/swiss formats (Phase 4)
feat(chess): add bot personalities with distinct play styles (Phase 5)
feat(chess): add arrow and circle drawing tools (Phase 6)
feat(chess): add player profiles, clubs, and social features (Phase 7)
feat(chess): add anti-cheat detection and enhanced matchmaking (Phase 8)
feat(chess): add chess variants (KOTH, 3-check, crazyhouse, atomic, bughouse) (Phase 9)
feat(chess): add native mobile chess board and touch gestures (Phase 10)
feat(chess): add monetization, cosmetics, and battle pass (Phase 11)
feat(chess): add live broadcasting and streaming (Phase 12)
```

Each phase PR targets `develop` branch. Run full verification before merge:

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm check-file-length
```
