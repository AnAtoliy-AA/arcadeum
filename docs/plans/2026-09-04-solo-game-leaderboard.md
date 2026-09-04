# Solo Game Leaderboard

## Context

Single-player games (Solitaire, Minesweeper, Sudoku, 2048) currently record only win/loss results to the stats system. Scores, difficulty, moves, and time are tracked in per-game Zustand stores but never synced to the backend or shown in any leaderboard. The existing leaderboard infrastructure (`/leaderboards`) is designed for multiplayer ELO rankings and cannot display solo game best scores.

**Goal:** Add a leaderboard system for solo games that shows personal bests and global rankings per game per difficulty, with offline-to-online score synchronization.

---

## Architecture

### Data Model

**New backend schema:** `SoloScore` (apps/be/src/games/schemas/solo-score.schema.ts)

```ts
{
  userId: string;        // indexed
  gameId: string;        // indexed
  difficulty: string;    // e.g. 'beginner', 'easy', 'default'
  score: number;
  moves: number;
  durationMs: number;
  result: 'won' | 'lost';
  sessionId: string;     // unique per game, prevents duplicate syncs
  timestamp: number;
}
```

Compound unique index: `{ userId, gameId, difficulty, sessionId }` — deduplicates on sync.
Compound query indexes: `{ gameId, difficulty, score: -1 }`, `{ gameId, difficulty, durationMs: 1 }` (for time-based leaderboards where lower is better).

**Score metric per game:**

| Game | Primary Score | Difficulty Values | Notes |
|------|--------------|-------------------|-------|
| Minesweeper | `durationMs` (lower = better) | `beginner`, `intermediate`, `expert` | Wins only ranked |
| Sudoku | `durationMs` (lower = better) | `easy`, `medium`, `hard` | Wins only ranked |
| 2048 | `score` (higher = better) | `default` (no difficulty) | Wins and losses ranked |
| Solitaire | `score` (higher = better) | `default` (no difficulty) | Wins only ranked |

### Backend Changes

**1. New module:** `apps/be/src/games/solo-scores.module.ts`
- `SoloScoresService` — CRUD + aggregation for solo scores
- `SoloScoresController` — REST endpoints

**2. New endpoints on `GamesController`** (or new controller):

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/games/solo-scores/leaderboard` | Optional | Global leaderboard for a game+difficulty. Query: `gameId`, `difficulty`, `sortBy` (`score` or `duration`), `order` (`asc` or `desc`), `limit`, `offset`. Returns paginated entries with rank, username, avatar, score, moves, duration. |
| `GET` | `/games/solo-scores/best` | Required | Current user's personal bests. Query: `gameId` (optional, all if omitted). Returns best score per game per difficulty. |
| `POST` | `/games/solo-scores/sync` | Required | Sync local scores. Body: `{ records: SoloScoreRecord[] }`. Deduplicates by sessionId. Returns `{ synced, duplicates }`. |
| `GET` | `/games/solo-scores/recent` | Required | Current user's recent games. Query: `gameId`, `difficulty`, `limit`. Returns recent scores with stats. |

**3. `SoloScoresService` methods:**
- `getLeaderboard(gameId, difficulty, sortBy, order, limit, offset)` — MongoDB aggregation: group by userId, take best score per user, sort, paginate. Joins with user profiles for cosmetics.
- `getPersonalBests(userId, gameId?)` — returns best score per game per difficulty for a user.
- `syncScores(userId, records)` — bulk upsert by sessionId dedup.
- `getRecentGames(userId, gameId?, difficulty?, limit?)` — recent records.

### Frontend Changes

**4. Local score persistence:** New Zustand store `soloScoreStore` (apps/web/src/features/stats/store/soloScoreStore.ts)
- Persists to localStorage key `arcadeum_solo_scores_v1`
- Stores `SoloScoreRecord[]` (gameId, difficulty, score, moves, durationMs, result, sessionId, timestamp)
- Capped at 500 records
- `addScore(record)` — append + attempt immediate sync
- `getPersonalBests(gameId?)` — compute best per game+difficulty from local data
- `getUnsyncedRecords()` — records without successful sync (for replay)

**5. Update each game store's `recordGameResult` call** to also save to `soloScoreStore`:
- `apps/web/src/widgets/PuzzleGames/MinesweeperGame/store/minesweeperStore.ts`
- `apps/web/src/widgets/PuzzleGames/SudokuGame/store/sudokuStore.ts`
- `apps/web/src/widgets/PuzzleGames/Game2048/store/game2048Store.ts`
- `apps/web/src/widgets/PuzzleGames/SolitaireGame/store/solitaireStore.ts`

Each game already tracks score/moves/time in its store — extract these into the `SoloScoreRecord` when recording.

**6. Sync hook:** `useSoloScoresReplay` (apps/web/src/features/stats/hooks/useSoloScoresReplay.ts)
- Listens for `online` event
- Replays unsynced local scores to `POST /games/solo-scores/sync`
- Rate-limited to once per 60s
- Added to `StatsReplay` root component alongside existing `useStatsReplay`

**7. API client:** `apps/web/src/shared/api/soloScores.ts`
- `getSoloScoreLeaderboard(gameId, difficulty, sortBy, order, limit, offset)`
- `getMySoloBests(gameId?)`
- `syncSoloScores(records)`
- `getRecentSoloGames(gameId?, difficulty?, limit?)`

**8. React hooks:**
- `useSoloScoreLeaderboard(gameId, difficulty, sortBy, order)` — React Query hook
- `useSoloPersonalBests(gameId?)` — React Query hook (falls back to local store when offline)
- `useSoloRecentGames(gameId?, difficulty?)` — React Query hook

### UI Components (shared across all 4 games)

**9. New shared components in `apps/web/src/features/games/ui/solo-leaderboard/`:**

- **`SoloLeaderboardPanel.tsx`** — Main container. Tabs: "My Best" | "Global". Accepts `gameId` and `difficulty`.
- **`SoloPersonalBests.tsx`** — Shows user's best scores per difficulty. Cards with score, moves, time. Highlights current difficulty.
- **`SoloGlobalLeaderboard.tsx`** — Ranked table. Columns: Rank, Player (avatar+name), Score/Moves/Time. Paginated (20 per page). "You" row highlighted.
- **`SoloScoreCard.tsx`** — Single score entry used in both personal bests and global list. Shows rank badge, player info, score metric, moves, time.
- **`SoloLeaderboardToggle.tsx`** — Button to show/hide the leaderboard panel on the play page.

**10. Integration into each game's `Game.tsx`:**

Add leaderboard panel below the board (or as a collapsible section). Each game's layout:
```
[HUD Row]
[Controls Row (difficulty + buttons)]
[Board]
[SoloLeaderboardPanel]  ← NEW (collapsible, default collapsed)
[GameResultModal]
```

The leaderboard panel shows data filtered by the current difficulty. When difficulty changes, leaderboard refreshes.

**11. Global solo leaderboard page:** `apps/web/src/app/[locale]/(app)/leaderboards/solo/page.tsx`
- Combined view of all 4 solo games
- Game tabs: All | Solitaire | Minesweeper | Sudoku | 2048
- Difficulty tabs per game (when applicable)
- Same `SoloGlobalLeaderboard` component, filtered by selected game+difficulty

### Offline Sync Flow

```
1. User plays game offline
2. Game store detects completion → calls soloScoreStore.addScore(record)
3. soloScoreStore persists to localStorage, attempts immediate sync (fire-and-forget)
4. If offline → sync fails silently, record stays in local store
5. User comes online → useSoloScoresReplay fires
6. Reads unsynced records from soloScoreStore
7. POST /games/solo-scores/sync with records
8. Backend deduplicates by sessionId, upserts scores
9. Local records marked as synced
```

### File Change Summary

**New files (backend):**
- `apps/be/src/games/solo-scores/solo-scores.module.ts`
- `apps/be/src/games/solo-scores/solo-scores.service.ts`
- `apps/be/src/games/solo-scores/solo-scores.controller.ts`
- `apps/be/src/games/schemas/solo-score.schema.ts`
- `apps/be/src/games/dto/sync-solo-scores.dto.ts`
- `apps/be/src/games/dto/solo-score-leaderboard-query.dto.ts`

**New files (frontend):**
- `apps/web/src/features/stats/store/soloScoreStore.ts`
- `apps/web/src/features/stats/hooks/useSoloScoresReplay.ts`
- `apps/web/src/features/stats/hooks/useSoloScoreLeaderboard.ts`
- `apps/web/src/features/stats/hooks/useSoloPersonalBests.ts`
- `apps/web/src/shared/api/soloScores.ts`
- `apps/web/src/features/games/ui/solo-leaderboard/SoloLeaderboardPanel.tsx`
- `apps/web/src/features/games/ui/solo-leaderboard/SoloPersonalBests.tsx`
- `apps/web/src/features/games/ui/solo-leaderboard/SoloGlobalLeaderboard.tsx`
- `apps/web/src/features/games/ui/solo-leaderboard/SoloScoreCard.tsx`
- `apps/web/src/features/games/ui/solo-leaderboard/SoloLeaderboardToggle.tsx`
- `apps/web/src/app/[locale]/(app)/leaderboards/solo/page.tsx`
- `apps/web/src/app/[locale]/(app)/leaderboards/solo/SoloLeaderboardsClient.tsx`

**Modified files (backend):**
- `apps/be/src/games/games.module.ts` — register SoloScoresModule
- `apps/be/src/games/games.controller.ts` — mount solo-scores routes (or new controller auto-registered)

**Modified files (frontend):**
- `apps/web/src/widgets/PuzzleGames/MinesweeperGame/store/minesweeperStore.ts` — add soloScoreStore.addScore() call
- `apps/web/src/widgets/PuzzleGames/SudokuGame/store/sudokuStore.ts` — same
- `apps/web/src/widgets/PuzzleGames/Game2048/store/game2048Store.ts` — same
- `apps/web/src/widgets/PuzzleGames/SolitaireGame/store/solitaireStore.ts` — same
- `apps/web/src/widgets/PuzzleGames/MinesweeperGame/ui/Game.tsx` — add SoloLeaderboardPanel
- `apps/web/src/widgets/PuzzleGames/SudokuGame/ui/Game.tsx` — same
- `apps/web/src/widgets/PuzzleGames/Game2048/ui/Game.tsx` — same
- `apps/web/src/widgets/PuzzleGames/SolitaireGame/ui/Game.tsx` — same
- `apps/web/src/shared/ui/StatsReplay.tsx` — add useSoloScoresReplay
- `apps/web/src/features/history/api.ts` — add soloScoresApi re-export if needed
- i18n locale files (en, ru, es, fr, by) — add solo leaderboard translation keys

---

## Implementation Order

1. **Backend schema + service + controller** — data model, endpoints, MongoDB indexes
2. **Frontend API client + types** — `soloScores.ts` with typed responses
3. **Local store** — `soloScoreStore.ts` with localStorage persistence
4. **Update game stores** — wire soloScoreStore.addScore() into all 4 games
5. **Sync infrastructure** — `useSoloScoresReplay` hook + integrate into StatsReplay
6. **Shared UI components** — SoloLeaderboardPanel, PersonalBests, GlobalLeaderboard, ScoreCard
7. **Integrate into game pages** — add leaderboard panel to each game's Game.tsx
8. **Global solo leaderboard page** — combined page at /leaderboards/solo
9. **i18n** — add all translation keys
10. **Tests** — backend service tests, frontend component tests, sync flow tests

---

## Verification

1. Play each solo game, complete it — verify score appears in localStorage (`arcadeum_solo_scores_v1`)
2. Verify leaderboard panel shows on play page with personal bests
3. Kill network, play games, verify scores persist locally
4. Restore network — verify `useSoloScoresReplay` fires and scores sync to backend
5. Open leaderboard panel — verify global rankings populate
6. Switch difficulty — verify leaderboard refreshes for new difficulty
7. Navigate to `/leaderboards/solo` — verify combined view works
8. Run `pnpm typecheck` — no type errors
9. Run `pnpm lint` — no lint errors
10. Run `pnpm test` — all tests pass
