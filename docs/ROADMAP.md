# Arcadeum Platform Expansion Plan

## Current State Summary (Updated 2026-08-27)

**First-time visitor audit result: 8/10** — strong core proposition, clear path to 9+/10.

**Existing infrastructure** (already built):

- 8 games: Critical, Sea Battle, Texas Hold'em, Glimworm, Tic-Tac-Toe, Cascade, Chess, Checkers
- Game engine architecture designed for 200+ games (`IGameEngine` interface, registry, base class)
- Basic matchmaking: `GameRoomsQuickplayService` with bot matches and human lobby finding
- Bot/AI opponents for most games
- Full chat system (1-on-1, group) + in-game history notes
- `GameChat` widget for in-game text communication
- Friends system, user auth (email, OAuth, JWT), 62 UI components
- Game variant/theme system, `localStorage` usage throughout

**What's strong (from audit):**

- Core proposition very clear: "Free online board games + friends + AI + no download"
- No-signup/no-download experience is major advantage (9.5/10)
- Enough variety to feel like a platform (8 games)
- Multiplayer features: rooms, invite links, AI filling, spectator, stats

**Growth gaps identified (Tier 7 priorities):**

- #1 problem: Players don't immediately see that others are playing (cold-start perception)
- Homepage tries to sell too many things at once
- Sea Battle should be the acquisition weapon, not the platform itself
- Social sharing/viral loop is weak (6.5/10)
- Retention loop needs daily challenges with progression
- "First 30 seconds" onboarding test needs optimization
- SEO has strong opportunity but needs targeted search pages

**30-day growth strategy (2026-08-27):**

- **Goal:** 1,000 unique players in 30 days
- **North-star metric:** Number of people who actually play a game
- **Core loop:** "Want to play Battleship with your friend? Click this link" → Rematch → "Try another game" → "Come back tomorrow"
- **Game tiering:** Sea Battle (Tier 1 acquisition), Tic-Tac-Toe/Chess (Tier 2), Checkers/Cascade/Critical/Cat Dash (Tier 3 retention)
- **Key insight:** Don't make Arcadeum famous first. Make one game famous first.

**Audit scores (2026-08-27):**

| Area                | Score     | Target    |
| ------------------- | --------- | --------- |
| Core concept        | 9/10      | Maintain  |
| Game experience     | 8.5/10    | 9+        |
| Multiplayer concept | 9/10      | Maintain  |
| No-signup friction  | 9.5/10    | Maintain  |
| Homepage messaging  | 8/10      | 9+        |
| Social/viral loop   | 6.5/10    | 8+        |
| Player discovery    | 6/10      | 8+        |
| Retention           | 6.5/10    | 8+        |
| SEO opportunity     | 8.5/10    | 9+        |
| **Overall**         | **~8/10** | **9+/10** |

---

## ARC Ticket Reference

| Feature                 | ARC     | Branch                       | Status                             |
| ----------------------- | ------- | ---------------------------- | ---------------------------------- |
| 1A. Stat Tracking       | ARC-871 | `ARC-871-stat-tracking`      | **Implemented**                    |
| 1B. Emotes              | ARC-872 | `ARC-872-emotes`             | **Implemented**                    |
| 1C. House Rules         | ARC-873 | `ARC-873-house-rules`        | **Implemented**                    |
| 1D. Dark Mode           | —       | —                            | **Implemented**                    |
| 1E. Undo/Take-Back      | ARC-874 | `ARC-874-undo-takeback`      | **Implemented**                    |
| 1F. Password Rooms      | ARC-875 | `ARC-875-password-rooms`     | **Implemented**                    |
| 2A. Matchmaking Queue   | ARC-876 | `ARC-876-matchmaking`        | **Implemented**                    |
| 2B. Chess Engine        | ARC-877 | `ARC-877-chess-engine`       | **Implemented**                    |
| 2C. Checkers Engine     | ARC-878 | `ARC-878-checkers-engine`    | **Implemented**                    |
| 2D. Audio Cues          | ARC-879 | `ARC-879-audio-cues`         | **Implemented**                    |
| 2E. AI Difficulty       | ARC-880 | `ARC-880-ai-difficulty`      | **Implemented**                    |
| 2F. Ranked/ELO          | ARC-881 | `ARC-881-ranked-elo`         | **Implemented**                    |
| 2G. Achievements        | —       | —                            | **Implemented**                    |
| 2H. Post-Game Analysis  | ARC-882 | `ARC-882-post-game-analysis` | **Implemented**                    |
| 2I. Coach Mode          | ARC-883 | `ARC-883-coach-mode`         | **Implemented**                    |
| 3A. Hearts/Spades       | ARC-884 | `ARC-884-hearts-spades`      | **Implemented**                    |
| 3B. Backgammon          | ARC-885 | `ARC-885-backgammon`         | **Implemented**                    |
| 3C. Pachisi             | ARC-886 | `ARC-886-pachisi`            | **Implemented**                    |
| 3D. Go                  | ARC-887 | `ARC-887-go`                 | **Implemented**                    |
| 3F. Game Replays        | ARC-888 | `ARC-888-game-replays`       | **Implemented**                    |
| 3G. Spectator Mode      | ARC-889 | `ARC-889-spectator-mode`     | **Implemented**                    |
| 3H. AI-vs-AI            | ARC-890 | `ARC-890-ai-vs-ai`           | **Implemented**                    |
| 3I. Clans               | ARC-891 | `ARC-891-clans`              | **Implemented**                    |
| 3J. Game Nights         | ARC-892 | `ARC-892-game-nights`        | **Implemented**                    |
| 4A. Chess Clock         | ARC-893 | `ARC-893-chess-clock`        | **Implemented**                    |
| 4B. Stats Dashboard     | ARC-894 | `ARC-894-stats-dashboard`    | **Implemented**                    |
| 4C. Tutorials           | ARC-895 | `ARC-895-tutorials`          | **Implemented**                    |
| 4D. Colorblind          | ARC-896 | `ARC-896-colorblind`         | **Implemented**                    |
| 4E. Screen Reader       | ARC-897 | `ARC-897-screen-reader`      | **Implemented**                    |
| 4F. Keyboard Nav        | ARC-898 | `ARC-898-keyboard-nav`       | **Implemented**                    |
| 4G. Daily Challenges    | —       | —                            | **Implemented**                    |
| 4H. Season System       | ARC-899 | `ARC-899-season-system`      | **Implemented**                    |
| 4I. PWA Support         | ARC-903 | `ARC-903-pwa-support`        | **Implemented**                    |
| 4J. Offline Mode        | ARC-900 | `ARC-900-offline-mode`       | **Implemented**                    |
| 4K. Web Share           | —       | —                            | **Implemented**                    |
| 4L. Push Notifications  | —       | —                            | **Implemented**                    |
| 4M. Tournaments         | —       | —                            | **Implemented** (brackets pending) |
| 4N. Leaderboards        | —       | —                            | **Implemented**                    |
| 4O. Board Game Creator  | ARC-901 | `ARC-901-board-game-creator` | **Deferred**                       |
| 4P. Mobile Games        | ARC-902 | `ARC-902-mobile-games`       | Partial                            |
| 4Q. Single-Player       | ARC-924 | `ARC-924-single-player`      | **Implemented**                    |
| 5B. Monetization        | —       | —                            | **Implemented**                    |
| 8A. Daily Habit System  | ARC-930 | `ARC-930-daily-habit`        | **Implemented**                    |
| 8B. Async Turn-Based    | ARC-931 | `ARC-931-async-turn-based`   | **Implemented**                    |
| 8C. Quest & Battle Pass | ARC-932 | `ARC-932-quests-battlepass`  | **Implemented**                    |
| 8D. Social Leagues      | ARC-933 | `ARC-933-social-leagues`     | **Implemented**                    |
| 8E. Winback Triggers    | ARC-934 | `ARC-934-winback-triggers`   | **Implemented**                    |
| 9A. Web Worker AI       | ARC-935 | `ARC-935-web-worker-ai`      | **Implemented**                    |
| 9B. Instant Room Boot   | ARC-936 | `ARC-936-instant-room-boot`  | **Implemented**                    |
| 9C. State Delta Sync    | ARC-937 | `ARC-937-state-delta-sync`   | **Implemented**                    |
| 9D. Core Web Vitals     | ARC-938 | `ARC-938-core-web-vitals`    | **Implemented**                    |

---

## Feature Roadmap

### TIER 1 — Low Effort, High Impact (Implement First)

#### 1A. Persistent Account-less Stat Tracking `ARC-871`

**Effort: Easy (1-2 days)**

Pure frontend feature. No backend changes needed.

- Create a Zustand store backed by `localStorage` (pattern already exists in `handToggleStorage.ts`, `settings-storage.ts`)
- Track per-game stats: wins, losses, streaks, favorite game, total games played
- Generate a stable anonymous ID on first visit (`crypto.randomUUID()`) stored in `localStorage`
- Display stats on a `/stats` page and on the game selection screen
- If user logs in later, optionally merge anonymous stats into their account

**Files to create/modify:**

- `apps/web/src/features/stats/store/statsStore.ts` — Zustand + localStorage
- `apps/web/src/features/stats/lib/stats.ts` — stat recording helpers
- `apps/web/src/app/[locale]/stats/` — stats page
- Hook into each game's result flow to call `recordGameResult()`

---

#### 1B. In-game Emotes & Quick Reactions `ARC-872`

**Effort: Easy (1-2 days)**

Extend the existing `history_notes` system with predefined emote actions.

- Add a set of predefined emotes: 👍 Good Move, 😂 LOL, 🤔 Thinking..., 🎉 Nice!, 😤 Unlucky, 💀 RIP
- New socket event: `games.session.emote` — lightweight payload `{ emoteId: string }`
- Display emotes as animated bubbles over the player's avatar in the game UI
- Auto-expire after 3 seconds (client-side)
- Rate limit: 1 emote per 2 seconds per player

**Files to create/modify:**

- `apps/be/src/games/dtos/send-emote.dto.ts`
- `apps/be/src/games/games.gateway.ts` — add `games.session.emote` handler
- `apps/web/src/widgets/GameChat/ui/EmotePicker.tsx` — emote button bar
- `apps/web/src/features/games/ui/EmoteBubble.tsx` — animated overlay component

---

#### 1C. Structured House Rules / Game Config `ARC-873`

**Effort: Easy-Medium (2-3 days)**

Extend the existing `gameOptions` system with per-game structured configs.

- Define a `GameConfig` schema per game (already has `validateConfig?` in the engine interface)
- **Sea Battle**: grid size (10x10, 15x15, 20x20), ship count, special weapons toggle (sonar/radar)
- **Tic-Tac-Toe**: board size (3x3, 4x4, 5x5), win condition (3/4/5 in a row)
- **Cascade**: draw pile size, hand limit, stack direction rules
- UI: add a "Game Settings" panel to the room creation flow

**Files to create/modify:**

- `apps/be/src/games/engines/*/configs/*.ts` — config schemas per game
- `apps/web/src/features/games/ui/GameConfigPanel.tsx` — settings UI in room creation
- Update each engine's `initializeState()` to read config options

---

#### 1D. Dark Mode

**Effort: Easy (1 day)**

- Use the existing CSS-variable theme system (`ThemeContext` + `packages/ui/src/themeDefinitions.ts`) — `data-theme` on `<html>` swaps the `--*` tokens Tailwind classes read
- Toggle between light/dark themes in settings
- Persist preference in `localStorage` (existing pattern)
- System default detection via `prefers-color-scheme`

**Files to create/modify:**

- `apps/web/src/shared/lib/theme-storage.ts` — theme preference
- `apps/web/src/shared/ui/ThemeProvider.tsx` — theme provider wrapper
- Settings UI toggle in existing settings page

---

#### 1E. Undo / Take-Back `ARC-874`

**Effort: Easy-Medium (1-2 days)**

Allow players to request an undo in casual games.

- New socket event: `games.session.undo_request` / `games.session.undo_response`
- Opponent must approve before undo is applied
- Limit: 1 undo per game per player (configurable)
- Disable undo in ranked/competitive mode (future)
- Revert game state to previous snapshot

**Files to create/modify:**

- `apps/be/src/games/dtos/undo.dto.ts`
- `apps/be/src/games/games.gateway.ts` — undo request/response handlers
- `apps/web/src/features/games/ui/UndoButton.tsx` — undo request UI
- Store game state history in each engine's state for rollback

---

#### 1F. Invite-Only Rooms with Passwords `ARC-875`

**Effort: Easy (1 day)**

- Add optional `password` field to `GameRoom` schema
- Room creator sets a password; joiners must enter it
- Display password-protected rooms with a 🔒 icon in the room list
- Existing private room visibility already exists; this adds a simpler shareable link + password flow

**Files to create/modify:**

- `apps/be/src/games/schemas/game-room.schema.ts` — add `password?: string` field
- `apps/be/src/games/dtos/join-game-room.dto.ts` — add `password` field
- `apps/web/src/features/games/ui/RoomPasswordModal.tsx` — password entry dialog

---

### TIER 2 — Medium Effort, Major Value

#### 2A. Improved Matchmaking with Queue System `ARC-876`

**Effort: Medium (3-5 days)**

The basic `findHumanMatch()` exists but is simple. Enhance it.

- Add an in-memory matchmaking queue per game (Map<gameId, Set<{userId, socketId, timestamp}>>)
- When a player queues, check for existing opponents; if found, pair them immediately
- If no match found, keep them in queue with a timeout (30s default, configurable)
- Timeout → either match with whoever is queued or fall back to bot
- Add a matchmaking UI component: "Searching for opponent..." with cancel button and estimated wait
- Support queue cancellation when player navigates away

**Files to create/modify:**

- `apps/be/src/games/matchmaking/matchmaking.service.ts` — queue manager
- `apps/be/src/games/matchmaking/matchmaking.gateway.ts` — socket events for queue
- `apps/web/src/features/games/ui/MatchmakingQueue.tsx` — queue UI
- Integrate with existing `GameRoomsQuickplayService`

---

#### 2B. Chess Engine `ARC-877`

**Effort: Medium-Hard (5-7 days)**

Well-defined rules, huge audience. This is the #1 game to add.

- Implement full chess rules: all piece movements, castling, en passant, promotion, stalemate, checkmate
- 50-move rule, threefold repetition
- Board representation: 8x8 array with piece objects
- Legal move generation with check detection
- Bot: minimax with alpha-beta pruning (depth 3-4 is sufficient for casual play), piece-square tables for evaluation
- Support standard and chess960 variant
- Chess clock: per-player timer with configurable time controls (5min, 10min, 15+10 increment)

**Files to create:**

- `apps/be/src/games/chess/chess.state.ts`
- `apps/be/src/games/chess/chess.engine.ts`
- `apps/be/src/games/chess/chess-bot.service.ts`
- `apps/be/src/games/chess/chess.service.ts`
- `apps/web/src/widgets/ChessGame/` — full widget (hooks, lib, types, ui)
- `apps/web/src/app/[locale]/games/chess/` — page route
- Landing page, SEO, i18n

---

#### 2C. Checkers Engine `ARC-878`

**Effort: Medium (4-5 days)**

Simpler than chess, well-understood rules.

- Standard 8x8 checkers with forced captures, multi-jump, king promotion
- Bot: minimax with alpha-beta pruning
- Variants: international draughts (10x10) as optional variant

**Files to create:**

- `apps/be/src/games/checkers/checkers.state.ts`
- `apps/be/src/games/checkers/checkers.engine.ts`
- `apps/be/src/games/checkers/checkers-bot.service.ts`
- `apps/be/src/games/checkers/checkers.service.ts`
- `apps/web/src/widgets/CheckersGame/`
- `apps/web/src/app/[locale]/games/checkers/`

---

#### 2D. Emote Sound Effects / Audio Cues `ARC-879`

**Effort: Easy (1 day)**

Lightweight audio feedback without full voice chat.

- Short sound clips for emotes (pop, ding, buzzer)
- Game events: your turn, game over, opponent joined
- Use Web Audio API or Howler.js
- Mute toggle in settings

**Files to create:**

- `apps/web/src/shared/lib/audio.ts` — audio manager
- `apps/web/src/shared/assets/sounds/` — sound files
- Settings toggle in `settings-storage.ts`

---

#### 2E. AI Difficulty Tiers `ARC-880`

**Effort: Medium (2-3 days per game)**

Currently bots appear to be single-difficulty. Add Easy/Medium/Hard/Expert levels.

- **Easy**: random valid moves with slight bias toward captures
- **Medium**: basic heuristics (material, center control, threat avoidance)
- **Hard**: minimax depth 3-4 with evaluation functions
- **Expert**: minimax depth 5+ with refined evaluation
- Expose difficulty as a `gameOptions` setting in room creation
- Display difficulty badge in lobby

**Files to create/modify:**

- Each bot service gets a `difficulty` parameter and strategy selection
- `apps/web/src/features/games/ui/DifficultySelector.tsx` — difficulty picker
- Update `GameConfigPanel` to include difficulty when "Play vs AI" is selected

---

#### 2F. Ranked Play / ELO Rating `ARC-881`

**Effort: Medium-Hard (5-7 days)**

Per-game skill rating system.

- ELO-based rating per game (starting at 1200)
- Tiers: Bronze (0-1199), Silver (1200-1399), Gold (1400-1599), Platinum (1600-1799), Diamond (1800-1999), Master (2000+)
- Rating updates after each ranked match (K-factor: 32)
- Separate queues for ranked vs casual
- Display rating badge on profile and in lobby
- Seasonal soft resets (quarterly, optional)

**Files to create/modify:**

- `apps/be/src/ranking/ranking.schema.ts` — rating storage
- `apps/be/src/ranking/ranking.service.ts` — ELO calculation, tier resolution
- `apps/be/src/ranking/ranking.controller.ts` — GET /rankings/:gameId, GET /rankings/me
- `apps/web/src/features/ranking/store/rankingStore.ts` — client state
- `apps/web/src/features/ranking/ui/RatingBadge.tsx` — tier badge component
- Integrate with game result flow to trigger rating updates

---

#### 2G. Achievements & Badges

**Effort: Medium (3-4 days)**

Collectible achievements tied to gameplay milestones.

- Define achievement catalog: "First Win", "Win Streak 5", "Play 100 Games", "Beat Hard Bot", "Win without losing a piece", etc.
- Store unlocked achievements in `localStorage` (anonymous) or user profile (logged in)
- Display on profile page and in-game loading screens
- Notification popup on unlock

**Files to create/modify:**

- `apps/web/src/features/achievements/achievements.catalog.ts` — achievement definitions
- `apps/web/src/features/achievements/store/achievementsStore.ts` — unlock tracking
- `apps/web/src/features/achievements/ui/AchievementPopup.tsx` — unlock notification
- `apps/web/src/features/achievements/ui/AchievementGrid.tsx` — profile display

---

#### 2H. Post-Game Analysis `ARC-882`

**Effort: Medium (3-5 days)**

Show players where mistakes were made after a game ends.

- Record the full move history (already done via game logs)
- For Chess/Checkers: evaluate each position and flag moves where a significantly better alternative existed
- Show material advantage graph over time
- Highlight the "turning point" where the game shifted
- For card games: show what cards opponents held during key moments

**Files to create/modify:**

- `apps/web/src/features/analysis/ui/PostGameAnalysis.tsx` — analysis overlay
- `apps/web/src/features/analysis/lib/position-evaluator.ts` — engine-specific evaluation
- `apps/web/src/features/analysis/ui/MoveTimeline.tsx` — visual timeline component

---

#### 2I. Move Hints / Coach Mode `ARC-883`

**Effort: Medium (2-3 days)**

Optional AI hints during gameplay.

- Toggle in game settings: "Enable hints"
- When active, show a "💡 Hint" button that suggests the best move
- For Chess: show the top engine move with a brief explanation
- For Checkers: highlight the best piece to move
- Disable in ranked mode
- Use existing bot evaluation engine with reduced depth for speed

**Files to create/modify:**

- `apps/web/src/features/coach/ui/HintButton.tsx` — hint trigger
- `apps/web/src/features/coach/lib/hint-generator.ts` — engine integration
- `apps/be/src/games/dtos/request-hint.dto.ts`

---

### TIER 3 — Hard but High Value

#### 3A. Hearts / Spades (Trick-taking Card Games) `ARC-884`

**Effort: Medium-Hard (5-7 days each)**

4-player games, complex but well-documented rules.

- Full trick-taking mechanics: lead suit, following suit, trump, scoring
- **Hearts**: queen of spades, shooting the moon, passing phase
- **Spades**: bidding, nil bid, blind nil, partnerships
- Bot: card counting heuristic + simple trick prediction

---

#### 3B. Backgammon `ARC-885`

**Effort: Medium-Hard (5-7 days)**

Dice-based, unique mechanics.

- 24-point board, piece movement, bar, bearing off
- Doubling cube
- Bot: probability-based (race vs. contact position evaluation)

---

#### 3C. Pachisi (originally Ludo) `ARC-886`

**Effort: Medium (4-5 days)**

Simple rules, popular globally. Using original name "Pachisi" to avoid Ludo trademark.

- 4-player, dice roll, piece movement, home stretch
- Bot: basic positional strategy

---

#### 3D. Go (Baduk) `ARC-887`

**Effort: Very Hard (10-14 days)**

The hardest game to implement well.

- 9x9 (beginner), 13x13, 19x19 board sizes
- Liberty counting, capture, ko rule, suicide
- Scoring: area (Chinese) and territory (Japanese)
- Bot: requires MCTS (Monte Carlo Tree Search) — significantly harder than minimax
- Consider using a pre-trained model or simplified heuristic for casual play

---

#### 3E. In-game Voice Chat (WebRTC)

**Effort: Hard (7-10 days)**

> **EXCLUDED FOR NOW** — Discord integration already works well. Revisit when the platform has a larger user base.

Full voice infrastructure needed.

- WebRTC peer-to-peer with TURN server fallback
- Socket signaling through existing gateway
- Push-to-talk and voice activity detection
- Mute/deafen controls per player
- Room-based audio channels

---

#### 3F. Game Replays `ARC-888`

**Effort: Medium (4-5 days)**

Record and share game replays.

- Record full action log with timestamps (partially exists via game logs)
- Play back moves step-by-step on the board UI
- Shareable replay links (encode game state + moves in URL or store server-side)
- Speed controls: 1x, 2x, 4x, auto-advance
- For Chess: integrate with analysis mode for review

**Files to create:**

- `apps/web/src/features/replay/ui/ReplayPlayer.tsx` — playback controls
- `apps/web/src/features/replay/lib/replay-encoder.ts` — URL encoding
- `apps/web/src/app/[locale]/replay/[replayId]/` — replay viewer page

---

#### 3G. Spectator Mode with Live Reactions `ARC-889`

**Effort: Medium (3-4 days)**

Let viewers watch ongoing matches with real-time interaction.

- Spectators join a room in read-only mode (existing `games.room.watch` event)
- Live chat visible to spectators
- Quick reactions: 👍 😂 🔥 displayed as floating bubbles
- Spectator count displayed in game UI
- "Spectate" button on the lobby/room list

**Files to create/modify:**

- `apps/web/src/features/spectator/ui/SpectatorView.tsx` — spectator-specific UI
- `apps/web/src/features/spectator/ui/SpectatorReactions.tsx` — reaction overlay
- Update `gameStore.ts` to handle spectator state

---

#### 3H. AI-vs-AI Spectator Mode `ARC-890`

**Effort: Easy-Medium (1-2 days)**

Let two bots play each other at max difficulty.

- New room type: "AI vs AI" with no human players
- Both bots use Expert difficulty
- Spectators can watch the full game unfold
- Auto-start with configurable delay between moves (1s, 2s, 5s)
- Great for demonstrating game depth and for entertainment

**Files to create/modify:**

- `apps/be/src/games/games.service.ts` — add `createAIvsAIRoom()` method
- `apps/web/src/features/games/ui/AIvsAIViewer.tsx` — auto-play viewer
- Room list filter for AI-vs-AI games

---

#### 3I. Clans / Groups `ARC-891`

**Effort: Medium-Hard (5-7 days)**

Persistent groups for communities.

- Create/join/leave groups with name, description, avatar
- Group chat channel
- Internal leaderboard (group members' stats)
- Group admin roles (leader, officer, member)
- Invite links
- Group vs group challenges

**Files to create:**

- `apps/be/src/clans/clans.module.ts`
- `apps/be/src/clans/clans.schema.ts`
- `apps/be/src/clans/clans.service.ts`
- `apps/be/src/clans/clans.controller.ts`
- `apps/be/src/clans/clans.gateway.ts`
- `apps/web/src/features/clans/` — full UI

---

#### 3J. Community Game Nights `ARC-892`

**Effort: Medium (3-4 days)**

Scheduled events where players queue simultaneously for a featured game.

- Admin creates events: "Chess Night — Friday 8PM EST"
- Featured game, time window, optional prize (cosmetic badge)
- Players see upcoming events on homepage
- At event time, matchmaking queue opens for that game
- Live event status: player count, games in progress
- Post-event stats: who played, winners, MVP

**Files to create:**

- `apps/be/src/events/events.module.ts`
- `apps/be/src/events/events.schema.ts`
- `apps/be/src/events/events.service.ts`
- `apps/be/src/events/events.controller.ts`
- `apps/web/src/features/events/ui/EventBanner.tsx`
- `apps/web/src/app/[locale]/events/` — events page

---

### TIER 4 — Advanced Platform Features

#### 4A. Chess Clock (Universal Timer System) `ARC-893`

**Effort: Medium (3-4 days)**

Chess-style timers for any turn-based game.

- Configurable time controls: 3|0, 5|0, 10|0, 15|10, 30|0 (minutes|increment)
- Display countdown per player in game UI
- Flag: player loses on time
- Optional: use as a general "turn timer" for non-Chess games
- Time scramble warning at <30 seconds

**Files to create:**

- `apps/be/src/games/common/clock.service.ts` — server-side timer management
- `apps/web/src/shared/ui/ClockTimer.tsx` — countdown display component
- Integrate into Chess engine first, then generalize

---

#### 4B. Cross-Game Stats Dashboard `ARC-894`

**Effort: Easy-Medium (2-3 days)**

Single view of all your stats across every game.

- Total games played, win rate, favorite game
- Per-game breakdown with charts
- Streak tracker (current win streak, longest win streak)
- Time played estimates
- "Your gamer profile" page

**Files to create:**

- `apps/web/src/features/stats/ui/StatsDashboard.tsx` — main dashboard
- `apps/web/src/features/stats/ui/GameStatsCard.tsx` — per-game card
- `apps/web/src/features/stats/ui/StreakTracker.tsx` — streak display
- `apps/web/src/app/[locale]/profile/stats/` — stats page route

---

#### 4C. Interactive Tutorials `ARC-895`

**Effort: Medium (3-5 days)**

Teach each game with a guided walkthrough before first play.

- Step-by-step interactive tutorial for each game
- Highlight valid moves, explain rules contextually
- "Skip tutorial" option for experienced players
- Track tutorial completion in `localStorage`
- Award a "Learned [Game]" achievement on completion

**Files to create:**

- `apps/web/src/features/tutorial/ui/TutorialOverlay.tsx` — tutorial step UI
- `apps/web/src/features/tutorial/lib/tutorial-steps.ts` — per-game step definitions
- `apps/web/src/features/tutorial/store/tutorialStore.ts` — completion tracking

---

#### 4D. Colorblind Modes `ARC-896`

**Effort: Easy (1-2 days)**

Accessibility for board games with colored pieces.

- Deuteranopia, Protanopia, Tritanopia presets
- Replace colors with patterns/shapes in addition to color
- High-contrast mode
- Apply across all game boards
- Persist preference in `localStorage`

**Files to create/modify:**

- `apps/web/src/shared/lib/colorblind.ts` — color palette transforms
- `apps/web/src/shared/ui/ColorblindToggle.tsx` — settings toggle
- Update game board components to respect colorblind mode

---

#### 4E. Screen Reader Support `ARC-897`

**Effort: Medium (2-3 days)**

ARIA labels on all game boards.

- `aria-label` on every board cell/piece describing its state
- `role="grid"` for board components
- Live regions for turn announcements and game events
- Keyboard-navigable board with `tabIndex` and arrow keys
- Announce captures, check, game over

**Files to create/modify:**

- Update each game widget's board component with ARIA attributes
- `apps/web/src/shared/lib/a11y.ts` — shared accessibility helpers

---

#### 4F. Keyboard-Only Navigation `ARC-898`

**Effort: Medium (2-3 days)**

Full keyboard control for every game.

- Arrow keys to navigate board cells
- Enter/Space to select/place pieces
- Tab to cycle between controls
- Escape to deselect
- Visual focus indicators on all interactive elements

**Files to create/modify:**

- Update each game widget's board component with keyboard handlers
- `apps/web/src/shared/lib/keyboard-navigation.ts` — shared keyboard utilities

---

#### 4G. Daily Challenges

**Effort: Medium (2-3 days)**

Daily rotating challenges to drive return visits.

- Generate 3 random challenges daily (seeded by date so all players see the same)
- Examples: "Win a Chess game in under 20 moves", "Play 3 different games", "Win 5 games in a row"
- Track progress in `localStorage`
- Reward: cosmetic badge or profile flair for completing all daily challenges
- Streak bonus: complete challenges multiple days in a row for bonus rewards

**Files to create:**

- `apps/web/src/features/challenges/challenges.catalog.ts` — challenge definitions
- `apps/web/src/features/challenges/lib/challenge-generator.ts` — daily seed logic
- `apps/web/src/features/challenges/store/challengesStore.ts` — progress tracking
- `apps/web/src/features/challenges/ui/ChallengeCard.tsx` — daily challenge display

---

#### 4H. Season System `ARC-899`

**Effort: Medium-Hard (5-7 days)**

Monthly/quarterly seasons with soft resets.

- 3-month seasons with unique names and themes
- Seasonal leaderboard (separate from all-time)
- Soft rating reset at season end (pull toward 1500)
- Seasonal cosmetic rewards: exclusive badges, board skins, piece designs
- Season progress bar on profile
- "Season 1 Champion" type achievements

**Files to create:**

- `apps/be/src/seasons/seasons.module.ts`
- `apps/be/src/seasons/seasons.schema.ts`
- `apps/be/src/seasons/seasons.service.ts`
- `apps/be/src/seasons/seasons.controller.ts`
- `apps/web/src/features/seasons/ui/SeasonBanner.tsx`
- `apps/web/src/features/seasons/ui/SeasonRewards.tsx`

---

#### 4I. PWA Support `ARC-903`

**Effort: Easy-Medium (2-3 days)**

Installable as an app on mobile/desktop without app store.

- Service worker for offline caching of shell/assets
- Web app manifest with icons and theme colors
- "Add to Home Screen" prompt
- Offline fallback page
- Background sync for game state (when reconnected)

**Files to create/modify:**

- `apps/web/public/manifest.json` — web app manifest
- `apps/web/src/service-worker.ts` — service worker registration
- `apps/web/public/sw.js` — service worker logic
- Next.js config for PWA headers

---

#### 4J. Offline Mode (Bot Play without Internet) `ARC-900`

**Effort: Medium (3-5 days)**

Play vs bot without internet connection.

- Cache game engine code and assets via service worker
- Run bot logic client-side using WebAssembly or pure JS
- Sync results to server when back online
- Focus on simpler games first: Tic-Tac-Toe, Checkers, Chess
- Downloadable bot packs per game

**Files to create:**

- `apps/web/src/shared/lib/offline-engine.ts` — client-side game engine runner
- `apps/web/src/shared/lib/bot-wasm/` — WASM bot binaries (or JS fallbacks)
- Service worker offline caching rules
- `apps/web/src/features/offline/ui/OfflineIndicator.tsx` — connection status

---

#### 4K. Web Share API

**Effort: Easy (1 day)**

One-tap sharing of game results to social media.

- Share game result card (image or text) with score, opponent, game type
- Use `navigator.share()` on mobile, fallback to copy-to-clipboard on desktop
- Generate shareable result image using `html2canvas` or pre-rendered SVG
- Share replay links alongside results

**Files to create:**

- `apps/web/src/shared/lib/share.ts` — share utility
- `apps/web/src/features/games/ui/ShareResultButton.tsx` — share button component

---

#### 4L. Push Notifications

**Effort: Medium (3-4 days)**

"It's your turn!" when opponent makes a move.

- Browser Push API via service worker
- Notification types: turn notification, friend online, game invite, achievement unlocked
- Opt-in prompt on first visit
- Respect user's OS notification settings
- Deep link: tap notification → open game directly

**Files to create:**

- `apps/be/src/notifications/notifications.module.ts`
- `apps/be/src/notifications/notifications.service.ts` — push notification sender
- `apps/web/src/shared/lib/push-notifications.ts` — client subscription management
- `apps/web/src/shared/ui/NotificationPrompt.tsx` — opt-in UI

---

#### 4M. Tournament System

**Effort: Hard (7-10 days)**

Bracket generation and multi-round tournaments.

- Single-elimination and round-robin formats
- Auto-generated brackets based on participant count
- Timed rounds with deadlines
- Tournament lobby with bracket visualization
- Winner badges and tournament history
- Admin can create tournaments for groups/clans

**Files to create:**

- `apps/be/src/tournaments/tournaments.module.ts`
- `apps/be/src/tournaments/tournaments.schema.ts`
- `apps/be/src/tournaments/tournaments.service.ts`
- `apps/be/src/tournaments/bracket-generator.ts`
- `apps/web/src/features/tournaments/ui/BracketView.tsx`
- `apps/web/src/app/[locale]/tournaments/` — tournaments page

---

#### 4N. Leaderboards

**Effort: Medium (3-4 days)**

Global and per-game leaderboards.

- All-time and seasonal leaderboards per game
- Global leaderboard (aggregate score across all games)
- Friends-only leaderboard
- Paginated with infinite scroll
- Real-time updates via existing `leaderboardSocket`

**Files to create:**

- `apps/be/src/leaderboards/leaderboards.module.ts`
- `apps/be/src/leaderboards/leaderboards.schema.ts`
- `apps/be/src/leaderboards/leaderboards.service.ts`
- `apps/be/src/leaderboards/leaderboards.controller.ts`
- `apps/web/src/features/leaderboards/ui/LeaderboardTable.tsx`
- `apps/web/src/app/[locale]/leaderboards/` — leaderboard page

---

#### 4O. Board Game Creator (Community Games) `ARC-901`

**Effort: Very Hard (14-21 days)**

> **DEFERRED** — highest-effort item in the roadmap and it serves creators, not players. Revisit when the platform has a large active community that demands user-generated content; until then, engineering capacity goes to player-facing reach (mobile port) and retention.

Let community members define simple custom games.

- Visual game editor: define board grid, pieces, basic movement rules
- Preset templates: "grid + pieces + turns + win condition"
- Share custom games via link
- Community ratings and featured games
- Limit complexity to prevent abuse (max board size, piece count)
- Custom games run in sandboxed engine

**Files to create:**

- `apps/be/src/custom-games/` — custom game CRUD
- `apps/web/src/features/custom-games/ui/GameEditor.tsx` — visual editor
- `apps/web/src/features/custom-games/ui/GamePreview.tsx` — preview/play
- `apps/web/src/app/[locale]/create/` — game creator page

---

#### 4P. Mobile App Games (Expo Port) `ARC-902`

**Effort: Very Hard (21-30 days)**

Port web game widgets to the Expo mobile app.

- Reuse `IGameEngine` backend (no changes needed)
- Port each game widget to React Native (StyleSheet + useThemedStyles)
- Touch-optimized board interactions (drag, tap, pinch-to-zoom)
- Offline support via Expo's background fetch
- Push notifications via Expo Push Service

---

#### 4Q. Single-Player Games (Client-Side) `ARC-924`

**Effort: Medium per game (2-4 days each)**

Solo games that run entirely in the browser — no backend session, no sockets, no bots. Serves the Phase 2 solo funnel (cold traffic capture) and is the natural carrier for future offline play.

**Architecture rules (deviation from `/new-game` flow):**

- **No BE involvement** — no `IGameEngine`, no gateway, no service. Game logic is pure TypeScript in the widget (`apps/web/src/widgets/PuzzleGames/<Game>Game/lib/engine.ts`), unit-tested with Vitest.
- **No socket state** — game state lives in a Zustand store with `persist` middleware (`arcadeum_<game>_v1` localStorage keys).
- **Stats without a session** — call `useLocalStatsStore.recordGameResult()` directly (`features/stats/store/statsStore.ts`); skip the `useRecordGameResult` hook (it early-returns without a `sessionId`).
- **Reuse platform patterns** — web registry entry in `features/games/registry.ts` (lazy import), theme adapter + unified `SHARED_THEMES`, landing page under `app/[locale]/(app)/games/<slug>/`, i18n in all 5 locales.
- Games: Solitaire (Klondike) first — highest search volume; then Minesweeper, Sudoku, 2048.

**Files to create per game:**

- `apps/web/src/widgets/PuzzleGames/<Game>Game/` — engine (`lib/engine.ts`), store, UI, tests
- `apps/web/src/app/[locale]/(app)/games/<slug>/` — landing page
- `apps/web/src/shared/i18n/messages/games/<game>/{en,ru,es,fr,by}.ts`
- Registry + catalog entries (`registry.ts`, home data)

---

### TIER 5 — Platform Polish

#### 5A. Post-Game Analysis

**Effort: Medium (3-5 days)**

Show players where mistakes were made after a game ends.

- Record the full move history (already done via game logs)
- For Chess/Checkers: evaluate each position and flag moves where a significantly better alternative existed
- Show material advantage graph over time
- Highlight the "turning point" where the game shifted
- For card games: show what cards opponents held during key moments

**Files to create/modify:**

- `apps/web/src/features/analysis/ui/PostGameAnalysis.tsx` — analysis overlay
- `apps/web/src/features/analysis/lib/position-evaluator.ts` — engine-specific evaluation
- `apps/web/src/features/analysis/ui/MoveTimeline.tsx` — visual timeline component

---

#### 5B. Monetization (Non-intrusive)

**Effort: Medium (5-7 days)**

Revenue without compromising the free, frictionless core.

- **Custom Cosmetic Packs**: Board themes, piece skins, emote packs (purely visual)
- **Premium Bot Personalities**: Themed bots with unique banter (fun, not pay-to-win)
- **Tournament Entry Tickets**: Cosmetic badges for tournament participation
- **Tip Jar / Supporter Badge**: Voluntary one-time support with a visible badge
- **Battle Pass**: Seasonal cosmetic track with free and premium tiers

**Files to create:**

- `apps/be/src/shop/` — shop module (already partially exists with coins/gems)
- `apps/web/src/features/shop/` — shop UI, item cards, purchase flow
- Payment integration — PayPal subscriptions + Solana (`apps/be/src/payments/`, `apps/be/src/solana/`). **Stripe is excluded by decision — do not add it.**

---

## Tier 6 — Growth, SEO, and Analytics (8-Week Action Plan)

This tier prioritizes marketing, positioning, acquisition channels, and viral loops to surface the extensive features already built on the platform.

### 6A. Viral & Invite Loop Optimization

- **One-Tap Share Sheet**: Native share sheet support on mobile/browser for instant WhatsApp/Telegram/Discord invite copying.
- **Room QR Codes**: Dynamic QR code generation per game room for in-person local multiplayer setup.
- **OG Preview Images**: Auto-generation of dynamic social sharing preview images showing game type, title, and current lobby status.
- **Group Rematch Flow**: Instant one-click "Play Again" button that recreates the room and auto-notifies or re-invites previous players.

### 6B. SEO & Crawler Optimizations

- **Game-Specific Landing Pages**: Dedicated, crawlable index routes for Chess, Sea Battle, Cascade, Checkers, Critical, Glimworm, and Tic-Tac-Toe.
- **Structured Schema Markup**: Integrate `schema.org` `VideoGame` and `FAQPage` JSON-LD microdata on all game templates.
- **Hreflang Configuration**: Ensure fully optimized search crawler indexing across all 5 supported locales.
- **SEO Strategy Articles**: In-depth strategy and rule guides to target long-tail terms like "play chess with friends free online no signup".

### 6C. Analytics & Funnel Instrumentation

- **Privacy-First Funnel tracking**: Integrate Plausible or PostHog to map visitor conversion rates.
- **Separated Funnel Cohorts**: Build separate dashboard tracking for the Solo vs. Social (invite friends) play path.
- **Campaign Attribution**: Instrument UTM and `?ref=` query tracking on invite links to measure virality K-factor.

### 6D. Homepage & UX Refactoring (Surfacing features)

- **Primary CTAs**: Elevate "Play vs AI" to co-primary status next to "Create Private Room" to capture cold traffic.
- **Featured Games Carousel**: Ensure high-search-volume games like Chess are prominently highlighted.
- **Interactive Lobby Fallbacks**: Seed always-joinable AI practice rooms on the `/games` active rooms explorer to prevent an empty/abandoned appearance.

---

## Tier 7 — Growth Acceleration (30-Day Execution Plan)

**Goal: 1,000 unique players in 30 days**

Not 1,000 registered accounts. Since the no-signup model is an advantage, measure:

- unique visitors
- games started
- games completed
- invitations sent
- invited players
- returning players
- games per player

**North-star metric:**

> **Number of people who actually play a game.**

**North-star sentence:**

> **"Want to play Battleship with your friend? Click this link."**

### Game Tiering (Marketing Priority)

| Tier                             | Games                                 | Role                               |
| -------------------------------- | ------------------------------------- | ---------------------------------- |
| **Tier 1 — Acquisition**         | Sea Battle                            | Lead with "play Battleship online" |
| **Tier 2 — Acquisition**         | Tic-Tac-Toe, Chess                    | Secondary search terms             |
| **Tier 3 — Retention/Discovery** | Checkers, Cascade, Critical, Cat Dash | Introduce after first game         |

**Core insight:** Don't make Arcadeum famous first. Make one game famous first. If Sea Battle gets thousands of players, Arcadeum automatically gets thousands of opportunities to introduce those players to Chess, Checkers, Cascade, etc.

**The loop:**

```
Search/Social → Sea Battle → Arcadeum → another game → returning user
```

---

### 7A. Funnel Measurement (Days 1-3)

**Effort: Easy (2-3 days)**

Before promotion, make the funnel measurable. Answer: "Where did this player come from?"

**Campaign URLs:**

```
/en/games/sea-battle?utm_source=reddit&utm_campaign=seabattle
/en/games/sea-battle?utm_source=tiktok&utm_campaign=seabattle
/en/games/sea-battle?utm_source=google&utm_campaign=seabattle
/en/games/sea-battle?utm_source=discord&utm_campaign=seabattle
/en/games/sea-battle?utm_source=linkedin&utm_campaign=seabattle
/en/games/sea-battle?utm_source=youtube&utm_campaign=seabattle
```

**Tracked funnel:**

```
Google / Reddit / TikTok / Discord
          ↓
   Sea Battle page
          ↓
       PLAY NOW
          ↓
      Game starts
          ↓
     "Invite friend"
          ↓
    Friend joins
          ↓
     Rematch
          ↓
  "Try another game"
          ↓
      Arcadeum
```

**Files to modify:**

- `apps/web/src/shared/lib/analytics.ts` — UTM tracking, funnel events
- `apps/web/src/app/[locale]/(app)/games/sea-battle/page.tsx` — campaign URL handling
- `apps/web/src/features/games/ui/GameResult.tsx` — track completion, invite, rematch events

---

### 7B. Sea Battle as Acquisition Spearhead (Days 3-7)

**Effort: Medium (3-5 days)**

**Primary CTA — extremely simple:**

```
⚓ PLAY SEA BATTLE
```

**Secondary:**

```
Play vs AI
```

**Third:**

```
Create private room
```

Don't give the visitor six decisions before they've played.

**Marketing message:**

- **Promote:** "Play Battleship online with your friends — free, no download."
- **NOT:** "Arcadeum is a new gaming platform!" (that's weak)

**Files to modify:**

- `apps/web/src/app/[locale]/(app)/games/sea-battle/page.tsx` — hero with single CTA
- `apps/web/src/widgets/SeaBattleGame/ui/SeaBattleHero.tsx` — simplified hero component
- `apps/web/src/app/[locale]/(app)/page.tsx` — link Sea Battle prominently

---

### 7C. Viral Loop — Challenge Flow (Days 4-30)

**Effort: Medium (3-4 days)**

Turn every game result into an acquisition channel.

**Current result screen:** "You won/lost."

**New result screen:**

```
🏆 YOU WON!

[Rematch] [Challenge a Friend] [Share Result] [Play Another Game]
```

**Challenge a Friend flow:**

1. Click "Challenge a Friend"
2. Generate: `⚓ I challenge you to Sea Battle! Think you can sink my fleet?`
3. Share via WhatsApp/Telegram/Discord/copy link
4. Link opens directly into the room — no homepage, no registration, no explanation
5. **Click → game.** That's how you turn one player into two.

**Files to create/modify:**

- `apps/be/src/games/dtos/challenge.dto.ts` — challenge creation
- `apps/be/src/games/games.service.ts` — `createChallenge()` method
- `apps/web/src/features/games/ui/ChallengeShareModal.tsx` — share challenge link
- `apps/web/src/features/games/ui/ResultScreen.tsx` — enhanced result with challenge CTA
- `apps/web/src/app/[locale]/challenge/[challengeId]/` — challenge acceptance page

---

### 7D. Live Activity Social Proof (Days 4-30)

**Effort: Easy (2-3 days)**

The platform needs to feel alive. Show real data only — don't fake activity.

```
🔴 12 games happening now
⚔️ Alex just won a Sea Battle
🟢 8 players online
🎮 3 rooms available
```

**Files to modify:**

- `apps/be/src/games/games.service.ts` — expose `getActiveStats()` (online players, active rooms)
- `apps/web/src/features/activity/ui/ActivityBanner.tsx` — real-time counter component
- `apps/web/src/app/[locale]/(app)/page.tsx` — integrate into homepage hero

---

### 7E. Reddit Strategy (Days 5-30)

**Effort: Ongoing (2-3 posts/week)**

**Don't spam links.** Reddit communities actively dislike low-effort self-promotion.

**Don't do this:**

> "Hey guys, check out my new game! https://arcadeum.games"

**Do this instead:**

Post something genuinely interesting:

> **I built a multiplayer Battleship game where you can challenge friends without creating an account**
>
> I wanted the experience to be:
>
> 1. Open link
> 2. Create room
> 3. Send link
> 4. Start playing
>
> It also supports AI and 2–4 players.
>
> I'm curious what Battleship players think about the multiplayer experience.
>
> [link]

**Only post where rules permit it.** Read each subreddit's current rules before posting.

**Target subreddits:**

| Subreddit     | Focus          | Notes                             |
| ------------- | -------------- | --------------------------------- |
| r/indiegaming | Indie games    | Check self-promo rules            |
| r/playmygame  | Game demos     | Developer-friendly                |
| r/boardgames  | Board games    | Participate first, promote second |
| r/webgames    | Browser games  | Relevant audience                 |
| r/gaming      | General gaming | High volume, strict rules         |

**Don't repeatedly post the same content.** Vary the angle each time.

**Reddit posts schedule:**

| Day | Post                                                              |
| --- | ----------------------------------------------------------------- |
| 5   | Post #1: "I built a multiplayer Battleship game"                  |
| 9   | Engagement: comment on related threads                            |
| 13  | Post #2: "How I handles 4-player Battleship without accounts"     |
| 18  | Post #3: "Show HN: Free online Battleship with friends"           |
| 23  | Post #4: "We got 500 players in 2 weeks — here's what we learned" |
| 28  | Post #5: "What game should we add next?" (community engagement)   |

---

### 7F. TikTok / Reels / Shorts (Days 4-30)

**Effort: Ongoing (2-3 videos/week)**

Don't try to make polished advertising. Make 10-20 second clips.

**Video scripts:**

| #   | Hook                                          | Content                                               | End                         |
| --- | --------------------------------------------- | ----------------------------------------------------- | --------------------------- |
| 1   | "I challenged my friend to Battleship…"       | Gameplay + "He thought I couldn't see this coming 💀" | "Play free in your browser" |
| 2   | "You don't need an app to play Battleship"    | Create room → copy link → friend joins → battle       | Link in bio                 |
| 3   | "I made Battleship playable with 4 people"    | Show 4 players                                        | "Link in bio"               |
| 4   | "Can AI beat me at Battleship?"               | Play AI                                               | "Play free"                 |
| 5   | "POV: you hit their battleship on first shot" | Fast gameplay + reaction                              | "Link in bio"               |
| 6   | [No text]                                     | Show most satisfying sinking animation                | "That feeling >>>"          |
| 7   | "My friend thought he'd win easily"           | Show comeback victory                                 | "Play free in browser"      |
| 8   | "The strategy nobody talks about"             | Quick strategy tip + gameplay                         | "Link in bio"               |
| 9   | "3 players, 1 winner"                         | Show 3-player mode                                    | "Play free"                 |

**Goal:** Don't try to make every video viral. Make **30 pieces of content**. If one works, make **10 variations of that one**.

---

### 7G. SEO Expansion — Targeted Search Pages (Days 7-30)

**Effort: Ongoing (1 page every 2-3 days)**

Create pages targeting actual search queries, not generic blog posts.

**Priority pages:**

| Target Query                           | Landing Page                        | Priority |
| -------------------------------------- | ----------------------------------- | -------- |
| "play battleship online"               | `/en/games/sea-battle` (enhanced)   | P0       |
| "battleship online with friends"       | `/en/games/sea-battle/multiplayer`  | P0       |
| "battleship online multiplayer free"   | `/en/games/sea-battle/multiplayer`  | P0       |
| "sea battle online no download"        | `/en/games/sea-battle` (enhanced)   | P0       |
| "battleship vs AI"                     | `/en/games/sea-battle/play-vs-ai`   | P1       |
| "battleship strategy"                  | `/en/games/sea-battle/strategy`     | P1       |
| "how to play battleship"               | `/en/games/sea-battle/rules`        | P1       |
| "play chess online free"               | `/en/games/chess` (enhanced)        | P1       |
| "chess with friends no signup"         | `/en/games/chess/play-with-friends` | P1       |
| "free board games online"              | `/en/games` (hub page)              | P1       |
| "multiplayer board games with friends" | `/en/games/multiplayer`             | P1       |
| "games to play with friends online"    | `/en/play-with-friends`             | P1       |
| "tic tac toe online"                   | `/en/games/tic-tac-toe` (enhanced)  | P2       |

**Each page needs:**

- H1 targeting the exact query
- 500+ words of relevant content (rules, strategy, how to play)
- **"PLAY NOW"** CTA above the fold — not just another article
- Schema markup (`VideoGame`, `FAQPage`)
- Internal links to related games

**Files to create/modify:**

- `apps/web/src/app/[locale]/(app)/games/[game]/page.tsx` — dynamic game pages
- `apps/web/src/app/[locale]/(app)/games/[game]/multiplayer/` — multiplayer-specific pages
- `apps/web/src/app/[locale]/(app)/games/[game]/strategy/` — strategy content
- `apps/web/src/app/[locale]/(app)/games/[game]/rules/` — rules content
- `apps/web/src/app/[locale]/(app)/play-with-friends/` — hub page

---

### 7H. Discord Community (Day 25)

**Effort: Easy (1 day setup, ongoing moderation)**

Don't make it another announcement channel. Create engagement:

| Channel            | Purpose                     |
| ------------------ | --------------------------- |
| #find-a-player     | "Anyone up for Sea Battle?" |
| #sea-battle        | Strategy and games          |
| #chess             | Chess discussions           |
| #general           | Off-topic                   |
| #bugs-and-feedback | Bug reports                 |
| #new-games         | Suggestions                 |

**Most importantly:** Include **"Play now" links** in each channel.

Discord becomes the **retention layer**:

- Reddit/TikTok/Google **acquire** users
- Discord **retains** them

---

### 7I. LinkedIn Strategy (Days 12-30)

**Effort: Low (2 posts/week)**

Don't expect LinkedIn to produce many players. Use it for:

- Credibility
- Networking
- Developers
- Partnerships
- Potential investors
- Game creators
- Press

**Post 2× per week.**

**Don't post:**

> "Play our game!"

**Post instead:**

> **We just launched multiplayer Sea Battle directly in the browser.**

Then show the product.

And:

> **Building a multiplayer game without forcing users to create an account taught us something interesting...**

Talk about the building process. That's much more interesting on LinkedIn.

---

### 7J. Simplified Homepage — "30-Second Test" (Days 1-3)

**Effort: Medium (2-3 days)**

New user should arrive → understand → choose → play within 30 seconds.

**Target flow:**

| Time   | Action                                         |
| ------ | ---------------------------------------------- |
| 0 sec  | Arrive at homepage                             |
| 5 sec  | Understand: "free board games, play instantly" |
| 10 sec | Choose a game (visual cards, clear names)      |
| 20 sec | Create/join room (one click)                   |
| 30 sec | Start playing                                  |

**New hierarchy:**

1. **Hero**: "Play free board games instantly" + live activity counters
2. **Primary CTA**: "Play Now" → instant random game or game selection
3. **Secondary CTAs**: "Play with Friends" | "Play vs AI"
4. **Game grid**: Visual cards for each game with "Play" button
5. **Everything else**: Below fold or in navigation (tournaments, stats, shop, etc.)

**Files to modify:**

- `apps/web/src/app/[locale]/(app)/page.tsx` — homepage refactor
- `apps/web/src/widgets/HomePage/` — new simplified hero + game grid widget
- Remove or collapse: trailer section, vision section, developer API promo, token/shop promo from above-fold

---

### 7K. Technical Quality (Days 1-3)

**Effort: Easy (1-2 days)**

Fix quality issues that destroy trust before driving traffic.

**Immediate fixes:**

- Fix Next.js chunk-loading error on Support page
- Add error boundaries for graceful fallbacks
- Test critical flow: `homepage → game → room → multiplayer → result → rematch`

**Files to modify:**

- `apps/web/src/app/[locale]/(app)/support/page.tsx` — fix chunk loading
- `apps/web/src/app/[locale]/(app)/games/[game]/page.tsx` — error boundary
- `apps/web/e2e/critical-flow.spec.ts` — Playwright e2e test

---

## 30-Day Execution Schedule

| Day | Action                              |
| --- | ----------------------------------- |
| 1   | Analytics + campaign tracking setup |
| 2   | Check complete game funnel          |
| 3   | Improve result/share/invite flow    |
| 4   | Create first Sea Battle video       |
| 5   | Reddit post #1                      |
| 6   | TikTok/Reel/Short #2                |
| 7   | SEO page #1                         |
| 8   | TikTok #3                           |
| 9   | Reddit engagement                   |
| 10  | SEO page #2                         |
| 11  | TikTok #4                           |
| 12  | LinkedIn post                       |
| 13  | Reddit post #2                      |
| 14  | **Analyze acquisition**             |
| 15  | TikTok #5                           |
| 16  | SEO page #3                         |
| 17  | TikTok #6                           |
| 18  | Reddit post #3                      |
| 19  | Improve invite/rematch              |
| 20  | LinkedIn post                       |
| 21  | TikTok #7                           |
| 22  | SEO page #4                         |
| 23  | Reddit post #4                      |
| 24  | TikTok #8                           |
| 25  | Discord community push              |
| 26  | SEO page #5                         |
| 27  | TikTok #9                           |
| 28  | Reddit post #5                      |
| 29  | **Analyze best channel**            |
| 30  | **Double down on winner**           |

---

## Target Numbers (Month 1)

| Channel             | Target Players |
| ------------------- | -------------- |
| Google              | 250            |
| Reddit              | 200            |
| TikTok/Reels/Shorts | 300            |
| Direct/social       | 100            |
| Friend invitations  | 150            |
| **Total**           | **1,000**      |

**Quality over quantity:** 500 visitors → 300 actual players is better than 10,000 visitors → 100 players.

---

## Viral Coefficient Goal

**Definition:** How many new players does each existing player bring?

**Example:**

- 100 people play
- They invite 70 friends
- 40 friends actually play
- **Viral coefficient = 0.4**

**Goal:** Eventually reach **>1.0** (one player brings another player on average).

**Why Arcadeum is suited for this:** Multiplayer naturally creates invitations. The product is the marketing.

---

## What NOT to Do

| Don't                               | Why                                                                 |
| ----------------------------------- | ------------------------------------------------------------------- |
| ❌ Buy ads yet                      | Don't know conversion/retention numbers well enough                 |
| ❌ Build 30 more games              | Already have enough games to test the platform                      |
| ❌ Spend weeks on branding          | Brand is good enough to start acquiring users                       |
| ❌ Spam Reddit                      | Will get ignored/removed; communities dislike low-effort self-promo |
| ❌ Chase followers                  | 10,000 followers who don't play are worthless                       |
| ❌ Make "Arcadeum" the main message | Make the **game** the marketing message                             |

---

## Files to Create/Modify (Summary)

**Analytics & Tracking:**

- `apps/web/src/shared/lib/analytics.ts` — UTM tracking, funnel events
- `apps/web/src/shared/lib/campaigns.ts` — campaign URL generator

**Challenge/Viral Flow:**

- `apps/be/src/games/dtos/challenge.dto.ts` — challenge creation
- `apps/be/src/games/games.service.ts` — `createChallenge()` method
- `apps/web/src/features/games/ui/ChallengeShareModal.tsx` — share challenge link
- `apps/web/src/features/games/ui/ResultScreen.tsx` — enhanced result with challenge CTA
- `apps/web/src/app/[locale]/challenge/[challengeId]/` — challenge acceptance page

**Live Activity:**

- `apps/be/src/games/games.service.ts` — expose `getActiveStats()`
- `apps/web/src/features/activity/ui/ActivityBanner.tsx` — real-time counter component

**Sea Battle Landing:**

- `apps/web/src/app/[locale]/(app)/games/sea-battle/page.tsx` — enhanced landing page
- `apps/web/src/widgets/SeaBattleGame/ui/SeaBattleHero.tsx` — simplified hero

**Homepage:**

- `apps/web/src/app/[locale]/(app)/page.tsx` — simplified homepage
- `apps/web/src/widgets/HomePage/` — new hero + game grid

**SEO Pages:**

- `apps/web/src/app/[locale]/(app)/games/[game]/multiplayer/`
- `apps/web/src/app/[locale]/(app)/games/[game]/strategy/`
- `apps/web/src/app/[locale]/(app)/games/[game]/rules/`
- `apps/web/src/app/[locale]/(app)/play-with-friends/`

**Post-Game:**

- `apps/web/src/features/games/ui/PostGameSuggestions.tsx` — "Try another game"

**Technical Quality:**

- `apps/web/e2e/critical-flow.spec.ts` — Playwright e2e test
- `apps/web/src/app/[locale]/(app)/support/page.tsx` — fix chunk loading

---

### TIER 8 — Player Retention & Habit Loops (Turn One-Time Visitors into Daily Players)

Analytics shows healthy visitor traffic and initial plays, but low D1/D7/D30 retention (players visit once and do not return). Tier 8 builds sticky mechanics, persistent daily habit loops, and asynchronous play so friends can play even when schedules do not align.

#### 8A. Daily Challenges & Streak System `ARC-930`

**Effort: Medium (3-5 days)**

Daily curated puzzle per game with streak counters, freeze mechanics, and viral score sharing.

- Daily puzzle generator for Chess (tactics), Sea Battle (fleet hunt puzzle), Sudoku, and Minesweeper
- Local & cloud synchronized streak tracker with freeze tokens for casual player retention
- Wordle-style shareable emoji score cards (`🟩🟩🟨⬛ - Solved Sea Battle Daily #42 in 4 moves!`)
- Daily reward multipliers: bonus XP, coins, and cosmetic unlocks for consecutive login/play streaks

**Files to create/modify:**

- `apps/be/src/daily-challenge/` — daily challenge generation and leaderboard service
- `apps/web/src/features/daily-challenge/` — daily challenge UI modal, puzzle boards, streak badge
- `apps/web/src/shared/lib/daily-streak.ts` — streak calculation and freeze logic

---

#### 8B. Asynchronous Turn-Based Play & Notification Engine `ARC-931`

**Effort: High (5-7 days)**

Eliminate the requirement for both players to be online simultaneously by enabling casual, multi-day turn-based games.

- Support correspondence/async time controls (24 hours, 48 hours, or unlimited per move) for Chess, Checkers, Sea Battle, and Tic-Tac-Toe
- Web Push & PWA notification triggers when an opponent makes a move ("_Alex just sank your cruiser in Sea Battle! It's your turn._")
- Telegram bot & Discord webhook notification integration with direct 1-tap deep links back into the active board state
- Multi-game dashboard view displaying all active async matches in one place

**Files to create/modify:**

- `apps/be/src/games/async-match/` — async match state persistence and turn timer service
- `apps/be/src/notifications/` — web push notification dispatcher and webhook sender
- `apps/web/src/features/games/async/` — active matches dashboard widget and turn status indicators

---

#### 8C. Dynamic Quest System & Seasonal Battle Pass `ARC-932`

**Effort: Medium (4-6 days)**

Give players clear short-term and long-term progression goals across every game session.

- Daily quests ("_Sink 8 battleships_", "_Play 2 games of Chess_", "_Score 1,000 in Cascade_") refreshed every 24 hours
- Weekly milestone achievements with substantial XP and cosmetic coin payouts
- Free seasonal progression track ("Season Pass") featuring unlockable board themes, sound packs, animated avatars, and card backs
- Post-game quest progress tracker overlay showing XP gained and milestone completion animation

**Files to create/modify:**

- `apps/be/src/quests/` — quest generation, progress evaluation, and reward distribution
- `apps/web/src/features/quests/` — quests panel, daily tracker widget, claim reward modals
- `apps/web/src/features/games/ui/QuestProgressOverlay.tsx` — post-match XP popup

---

#### 8D. Social Leagues, Weekly Cups & Guild Ladders `ARC-933`

**Effort: Medium (4-6 days)**

Foster community accountability and friendly rivalry through weekly division ladders.

- Weekly division ladders (Bronze, Silver, Gold, Platinum, Diamond) with automatic promotion/relegation every Sunday midnight
- Scheduled Weekend Blitz Cups with live countdown timers, bracket seeds, and spectator lobbies
- Guild/Club leaderboards aggregating points from club members playing public or ranked games
- Live division standing banners on the player profile and main dashboard

**Files to create/modify:**

- `apps/be/src/leagues/` — division computation, promotion cron, and league tables
- `apps/web/src/features/leagues/` — division tier UI, weekend cup countdown banner, ladder table

---

#### 8E. Smart Re-engagement & Winback Engine `ARC-934`

**Effort: Easy-Medium (2-4 days)**

Intelligent, non-intrusive re-engagement hooks to bring lapsed visitors back to Arcadeum.

- Friendly rivalry triggers: "_Your friend Sam just beat your high score in Cascade! Can you beat it?_"
- Streak expiration alerts: "_Your 7-day streak will expire in 3 hours! Complete today's daily puzzle._"
- Instant rematch links sent via native share sheet / Web Share API with 1-click room reentry
- Inactivity winback flow offering a free streak freeze or bonus mystery cosmetic upon returning

**Files to create/modify:**

- `apps/be/src/engagement/` — winback rules engine and trigger scheduler
- `apps/web/src/shared/lib/reengagement.ts` — client-side reminder checks and push permissions prompt

---

### TIER 9 — High-Performance Engine & Latency Optimization (Sub-50ms & 120 FPS)

Eliminate bounce rate caused by loading delays, dropped frames, or heavy AI calculations on mobile devices.

#### 9A. Web Worker AI Engine Offloading `ARC-935`

**Effort: Medium (3-4 days)**

Move heavy computational bots (Chess Minimax, Checkers deep search, Sea Battle probability matrix) off the main thread.

- Dedicated Web Workers for browser-side AI game engines
- Zero UI thread blocking: maintain silky smooth 60/120 FPS animations while AI calculates next move
- Fallback Web Worker pools on multi-core devices for instant AI responses
- Real-time calculation cancellation when game state changes or user restarts

**Files to create/modify:**

- `apps/web/src/features/games/workers/` — game engine worker wrappers
- `apps/web/src/widgets/ChessGame/lib/chess-worker.ts` — Web Worker minimax runner
- `apps/web/src/widgets/CheckersGame/lib/checkers-worker.ts` — Web Worker search runner

---

#### 9B. Instant Room Boot & Asset Pre-caching `ARC-936`

**Effort: Medium (2-4 days)**

Achieve sub-100ms cold-start room loading times across all devices.

- Service Worker proactive pre-caching of board textures, piece SVG sprites, audio soundscapes, and fonts
- Lightweight WebP/AVIF asset pipelines with CSS hardware-accelerated transforms
- Instant placeholder board rendering before WebSocket connection handshakes complete
- Optimistic UI state rendering on initial move actions

**Files to create/modify:**

- `apps/web/public/sw.js` — asset pre-caching manifest
- `apps/web/src/shared/lib/asset-preloader.ts` — smart pre-fetching for next game
- `apps/web/src/features/games/ui/InstantBoardSkeleton.tsx` — zero-CLS board skeleton

---

#### 9C. WebSocket State Delta & Binary Compression `ARC-937`

**Effort: Medium (3-5 days)**

Slash multiplayer network latency and bandwidth on mobile/cellular connections.

- Implement state delta compression: send only modified entity diffs instead of full board snapshots
- Binary payload packing (ArrayBuffer / MessagePack) for high-frequency game moves and cursor coordinates
- Automatic reconnection with client-side state replay buffer for choppy mobile connections
- 70% reduction in socket bandwidth consumption during intense multi-player sessions

**Files to create/modify:**

- `apps/be/src/games/common/delta-compressor.ts` — delta state generator
- `apps/web/src/shared/lib/socket-delta.ts` — client-side delta unpacker and buffer reconciler

---

#### 9D. Core Web Vitals & Dynamic Code Splitting `ARC-938`

**Effort: Easy-Medium (2-3 days)**

Optimize Core Web Vitals metrics across all landing and game pages to maximize SEO rank and minimize bounce rate.

- Target metrics: Largest Contentful Paint (LCP) < 1.2s, Interaction to Next Paint (INP) < 50ms, Cumulative Layout Shift (CLS) = 0
- Dynamic lazy-loading for non-critical game modals, sound packs, and chat widgets
- React Server Component streaming for game rules, leaderboard hubs, and strategy guides
- Zero-runtime CSS optimization with optimized Tailwind design token hydration

**Files to create/modify:**

- `apps/web/src/app/[locale]/(app)/games/[game]/page.tsx` — optimized streaming layout
- `apps/web/src/features/games/ui/LazyGameWidgets.tsx` — split-bundle loader

---

## Recommended Implementation & Status Order

The platform's core infrastructure is highly mature. Phase 1-10 are fully complete, and several advanced features from later phases are already shipped.

| Phase / Focus                         | Features & Ticket Scope                                                                                                                                     | Est. Days | Status / Progress                                            |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ------------------------------------------------------------ |
| **Phase 1: Core UX**                  | Stats tracking + Emotes + House rules + Dark mode + Undo + Password rooms                                                                                   | 10        | **100% Completed**                                           |
| **Phase 2: Growth & SEO**             | Viral invite loops, QR codes, game SEO landing pages, schema markup, funnel analytics, and homepage repositioning                                           | 12        | **100% Completed**                                           |
| **Phase 3: Classic Games**            | Chess Engine + Checkers Engine + Audio Cues + Chess Clock                                                                                                   | 15        | **100% Completed**                                           |
| **Phase 4: Competitive**              | Achievements + Daily Challenges + Tournaments + Leaderboards + Monetization                                                                                 | 20        | **100% Completed**                                           |
| **Phase 5: Retention**                | Matchmaking Queue + AI Difficulty Tiers + Ranked/ELO Skill Ratings                                                                                          | 15        | **100% Completed**                                           |
| **Phase 6: Card & Board**             | Hearts + Spades + Backgammon + Pachisi + Post-Game Analysis + Hints/Coach                                                                                   | 25        | **100% Completed**                                           |
| **Phase 7: Advanced Social**          | Go Engine + Clans/Groups + Game Nights + Replays + Spectator Mode                                                                                           | 25        | **100% Completed**                                           |
| **Phase 8: Platform Growth**          | PWA Support + Push Notifications + Offline Mode + Share + Mobile App Port                                                                                   | 30        | **PWA, Push, Share + Offline Completed** (Mobile Partial)    |
| **Phase 9: Creator Tools**            | Visual Board Game Creator                                                                                                                                   | 20        | **Deferred** (revisit with larger community)                 |
| **Phase 10: Single-Player**           | Solitaire + Minesweeper + Sudoku + 2048 (client-side, ARC-924)                                                                                              | 12        | **100% Completed**                                           |
| **Phase 11: Growth Acceleration**     | 30-day execution plan: funnel measurement, Sea Battle spearhead, viral challenge flow, live activity, Reddit/TikTok/SEO/Discord/LinkedIn, technical quality | 30        | **Code Complete** (marketing execution ongoing)              |
| **Phase 12: Player Retention Loops**  | Daily Challenges + Streaks + Async Turn-Based + Quests & Battle Pass + Social Leagues + Winback (ARC-930–ARC-934)                                           | 20        | **100% Completed** (Streaks, Winback & Challenges shipped)   |
| **Phase 13: High-Performance Engine** | Web Worker AI Offloading + Instant Room Boot + WebSocket Delta Sync + Core Web Vitals (INP < 50ms) (ARC-935–ARC-938)                                        | 15        | **100% Completed** (Workers, Skeletons & Delta Sync shipped) |

### Summary of Completed vs. Outstanding Tasks

- **Completed**: Stat Tracking (1A), Emotes (1B), House Rules (1C), Dark Mode (1D), Undo/Take-Back (1E), Password Rooms (1F), Chess Engine (2B), Checkers Engine (2C), Audio Cues (2D), Achievements (2G), Hearts & Spades (3A), Backgammon (3B), Pachisi (3C), Go (3D), Game Replays (3F), Spectator Mode (3G), AI-vs-AI Spectator Rooms (3H), Clans/Groups (3I), Game Nights (3J), Chess Clock (4A), Stats Dashboard (4B), Daily Challenges (4G), Screen Reader (4E), PWA Support (4I), Offline Mode (4J), Web Share (4K), Push Notifications (4L), Tournaments — registration/lobby only (4M), Leaderboards (4N), Single-Player Games (4Q), Monetization (5B), Matchmaking Queue (2A), AI Difficulty Tiers (2E), Ranked/ELO Skill Ratings (2F), Post-Game Analysis (2H), Coach Mode (2I), Season System (4H), Colorblind Modes (4F), Daily Habit & Streak System (8A), Winback Engine (8E), Web Worker AI (9A), Instant Room Boot (9B), State Delta Sync (9C), Core Web Vitals (9D).
- **Phase 6 Tier (Growth & Marketing) — Completed**: Week 0 audit, PostHog/Plausible funnel tracking split by Solo vs. Social, homepage CTAs featuring AI/Solo play, SEO landing pages for all games, QR code/share sheet invite upgrades, blog SEO content, post-game analytics (ARC-925).
- **Phase 11 (Growth Acceleration) — Code Complete, Marketing Execution Ongoing** (Goal: 1,000 players in 30 days).
- **Phase 12 (Player Retention Loops) — Completed**: Daily challenge rotation, streaks, habit multipliers, winback triggers, and seasonal quest progression shipped.
- **Phase 13 (High-Performance Engine) — Completed**: Web Worker AI offloading for 120 FPS stutter-free play, sub-100ms instant room initialization, and binary WebSocket delta compression shipped.

  **Remaining Technical Gaps** (verified against code, 2026-08-25 audit):

  1. **Tournament brackets** (4M gap) — BE `bracket-generator` (single-elim + round-robin) and web `BracketView.tsx`. Registration/lobby/pages exist; visualization and auto-pairing do not.
  2. **Coach Mode server hints** (2I gap) — `request-hint.dto.ts` + hint endpoint on the games gateway; hints are currently computed client-side only.
  3. **Achievements UX polish** (2G gap) — unlock popup + profile achievement grid; server-side catalog and claim flow already exist (`apps/be/src/achievements/`, `features/achievements/`).
  4. **Offline engine caching** (4J completion) — service worker caches puzzle-game engines/assets for true offline play; offline session infra + `/offline/[game]` route already shipped (ARC-900).
  5. **Spectator UI** (3G polish) — dedicated spectator panel with live reactions over the existing `games.room.watch` socket flow.
  6. **Mobile games port continuation** (4P — ARC-902) — 2 of 17 games playable (Critical, Texas Hold'em); port Chess + Checkers next (highest search volume).
  7. **Cleanup** — remove dead `ChessClock.tsx`, sync in-app roadmap page (`roadmap-parser.ts`) with this doc.

  Board Game Creator (4O) stays **deferred** until community scale.
