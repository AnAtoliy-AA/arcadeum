# Chess Feature Expansion Roadmap

## Overview

Expand the chess experience with 12 features across 20+ commits.
All features are rated-game compatible.

---

## Phase 1: Time Controls & Matchmaking

### 1.1 Bullet Time Controls
**Files**: `packages/games-core/src/games/chess/chess.types.ts`, `apps/web/src/widgets/BoardGames/ChessGame/types/index.ts`
- Add `bullet` to `TimeControlType` union
- Add `1+0`, `2+1`, `1+1` presets to `TIME_CONTROLS`
- Update `chess.constants.ts` if needed

### 1.2 Daily/Correspondence Time Controls
**Files**: `packages/games-core/src/games/chess/chess.types.ts`, `chess.engine.ts`, `chess.service.ts`
- Add `daily` to `TimeControlType` union
- Add `TimeIncrement` variants for days (1, 2, 3, 5, 7, 14)
- Add `daysPerMove` field to `TimeControl` interface
- Update clock logic: pause countdown, use `daysPerMove` for turn timer
- Add daily time controls to `TIME_CONTROLS` array

### 1.3 Auto-Matchmaking
**Files**: `apps/be/src/games/chess/chess-matchmaking.service.ts` (new), `chess-matchmaking.gateway.ts` (new), `apps/web/src/widgets/BoardGames/ChessGame/hooks/useMatchmaking.ts` (new)
- Backend: Redis-backed matchmaking queue with ±100 rating range, expanding ±50 every 5s up to ±300
- Gateway events: `chess.matchmaking.join`, `chess.matchmaking.leave`, `chess.matchmaking.matched`
- Frontend hook: manages queue state, timer display, cancel
- Lobby integration: "Quick Play" button that joins matchmaking

---

## Phase 2: Game Interaction

### 2.1 Undo/Takeback
**Files**: `packages/games-core/src/games/chess/chess.engine.ts`, `chess.types.ts`, `chess.service.ts`, `useChessActions.ts`, `ChessPanelComponents.tsx`
- Add `takeback_offer` and `takeback_accept` actions to engine
- Add `takebackOfferedBy` and `takebackMoveIndex` to `ChessState`
- Validation: only on own turn, only if not first move, no pending offer
- Execute: revert `moveHistory` to target index, restore board/flags
- Service: wire socket events `chess.session.takeback_offer`, `chess.session.takeback_accept`
- UI: "Takeback" button in `ActionsBar`, confirmation modal

### 2.2 PGN Import
**Files**: `apps/web/src/widgets/BoardGames/ChessGame/lib/pgn-import.ts` (new), `ChessGame/ui/ChessLobby.tsx`
- Parse PGN text: extract headers (Event, White, Black, Result) and move text
- Convert algebraic notation to `MovePayload[]` via move generator
- Validate: reconstruct position move-by-move, reject invalid
- UI: "Import PGN" button in lobby that opens a textarea modal
- On import: create a room with imported moves loaded as initial position

---

## Phase 3: Analysis & Review

### 3.1 Game Review Report Card
**Files**: `apps/web/src/widgets/BoardGames/ChessGame/ui/GameReviewCard.tsx` (new), `ChessGameResultModal.tsx`
- Accuracy percentage per player (based on engine eval deviation)
- A-F grade letter (A = 95%+, B = 85-94%, etc.)
- Move classification breakdown: brilliant/great/good/inaccuracy/mistake/blunder counts
- Per-move eval graph (line chart of centipawn evaluation)
- Key moments timeline: blunders and brilliancies with board snapshots
- Integrate into `ChessGameResultModal` as the default analysis view

### 3.2 Endgame Tablebases (Syzygy)
**Files**: `apps/be/src/games/chess/engine/syzygy.service.ts` (new), `chess-openings.module.ts`
- Syzygy tablebase lookup for positions with ≤7 pieces
- API endpoint: `GET /chess/tablebase?fen=...`
- Return: WDL (win/draw/loss) and DTZ (distance to zeroing)
- Display in `EvalBar` when tablebase position detected

---

## Phase 4: Puzzle Rush

### 4.1 Puzzle Rush — Survival Mode
**Files**: `apps/web/src/widgets/BoardGames/ChessPuzzles/ui/PuzzleRush.tsx` (new), `usePuzzleRush.ts` (new)
- 3 lives system: incorrect = lose a life, 0 lives = game over
- Track score (correct count), streak, best score
- Timer runs from start, shown at end as final time
- Difficulty increases with score (rating-based puzzle selection)
- End screen: score, accuracy, time, rating change

### 4.2 Puzzle Rush — Timed Mode
**Files**: Same as 4.1
- 3-minute countdown timer
- Solve as many as possible before time expires
- No lives — one wrong ends current puzzle (move on to next)
- End screen: total solved, accuracy, rating change

---

## Phase 5: Polish & UX

### 5.1 Sound Effects
**Files**: `apps/web/src/widgets/BoardGames/ChessGame/lib/sounds.ts` (new), `ChessBoard.tsx`, `Game.tsx`
- Create audio context manager with preloaded sounds
- Sound events: move, capture, check, castle, promotion, game_start, game_end, draw_offer, notification
- Volume control in game settings
- Mute toggle
- Use Web Audio API with fallback to HTML5 Audio

### 5.2 Piece Slide Animations
**Files**: `apps/web/src/widgets/BoardGames/ChessGame/ui/ChessBoard.tsx`, `styles/animations.scss`
- Track previous board state
- On move: animate piece from source to destination using CSS transform
- Duration: 150ms for blitz, 250ms for rapid, 350ms for classical
- Handle castling: animate both king and rook
- Handle captures: fade out captured piece, slide capturing piece

### 5.3 Game History Dashboard
**Files**: `apps/web/src/features/chess/ui/GameHistoryDashboard.tsx` (new)
- Rating graph over time (line chart using simple SVG)
- Win/loss/draw pie chart
- Opening repertoire stats: most played openings, win rate per opening
- Performance by time control
- Recent games list with result and opponent

---

## Commit Plan

1. `feat(chess): add bullet time controls (1+0, 2+1, 1+1)`
2. `feat(chess): add daily/correspondence time controls`
3. `feat(chess): add daily time control to lobby UI`
4. `feat(chess): add takeback engine actions and state`
5. `feat(chess): add takeback socket events and service`
6. `feat(chess): add takeback UI button and confirmation`
7. `feat(chess): implement PGN parser for import`
8. `feat(chess): add PGN import modal to lobby`
9. `feat(chess): add matchmaking queue backend`
10. `feat(chess): add matchmaking gateway`
11. `feat(chess): add matchmaking frontend hook`
12. `feat(chess): add Quick Play button to lobby`
13. `feat(chess): implement game review report card`
14. `feat(chess): integrate report card into result modal`
15. `feat(chess): add Syzygy tablebase service`
16. `feat(chess): add Puzzle Rush survival mode`
17. `feat(chess): add Puzzle Rush timed mode`
18. `feat(chess): add sound effects system`
19. `feat(chess): add piece slide animations`
20. `feat(chess): add game history dashboard`
