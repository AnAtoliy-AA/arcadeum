# Arcadeum Platform Expansion Plan

## Current State Summary

**Existing infrastructure** (already built):

- 6 games: Critical, Sea Battle, Texas Hold'em, Glimworm, Tic-Tac-Toe, Cascade
- Game engine architecture designed for 200+ games (`IGameEngine` interface, registry, base class)
- Basic matchmaking: `GameRoomsQuickplayService` with bot matches and human lobby finding
- Bot/AI opponents for 5 of 6 games
- Full chat system (1-on-1, group) + in-game history notes
- `GameChat` widget for in-game text communication
- Friends system, user auth (email, OAuth, JWT), 62 UI components
- Game variant/theme system, `localStorage` usage throughout

---

## ARC Ticket Reference

| Feature | ARC | Branch | Status |
|---------|-----|--------|--------|
| 1A. Stat Tracking | ARC-871 | `ARC-871-stat-tracking` | Partial |
| 1B. Emotes | ARC-872 | `ARC-872-emotes` | Not started |
| 1C. House Rules | ARC-873 | `ARC-873-house-rules` | Partial |
| 1D. Dark Mode | — | — | **Implemented** |
| 1E. Undo/Take-Back | ARC-874 | `ARC-874-undo-takeback` | Not started |
| 1F. Password Rooms | ARC-875 | `ARC-875-password-rooms` | Not started |
| 2A. Matchmaking Queue | ARC-876 | `ARC-876-matchmaking` | Not started |
| 2B. Chess Engine | ARC-877 | `ARC-877-chess-engine` | Not started |
| 2C. Checkers Engine | ARC-878 | `ARC-878-checkers-engine` | Not started |
| 2D. Audio Cues | ARC-879 | `ARC-879-audio-cues` | Partial |
| 2E. AI Difficulty | ARC-880 | `ARC-880-ai-difficulty` | Not started |
| 2F. Ranked/ELO | ARC-881 | `ARC-881-ranked-elo` | Not started |
| 2G. Achievements | — | — | **Implemented** |
| 2H. Post-Game Analysis | ARC-882 | `ARC-882-post-game-analysis` | Not started |
| 2I. Coach Mode | ARC-883 | `ARC-883-coach-mode` | Not started |
| 3A. Hearts/Spades | ARC-884 | `ARC-884-hearts-spades` | Not started |
| 3B. Backgammon | ARC-885 | `ARC-885-backgammon` | Not started |
| 3C. Pachisi | ARC-886 | `ARC-886-pachisi` | Not started |
| 3D. Go | ARC-887 | `ARC-887-go` | Not started |
| 3F. Game Replays | ARC-888 | `ARC-888-game-replays` | Not started |
| 3G. Spectator Mode | ARC-889 | `ARC-889-spectator-mode` | Partial |
| 3H. AI-vs-AI | ARC-890 | `ARC-890-ai-vs-ai` | Not started |
| 3I. Clans | ARC-891 | `ARC-891-clans` | Not started |
| 3J. Game Nights | ARC-892 | `ARC-892-game-nights` | Not started |
| 4A. Chess Clock | ARC-893 | `ARC-893-chess-clock` | Not started |
| 4B. Stats Dashboard | ARC-894 | `ARC-894-stats-dashboard` | Partial |
| 4C. Tutorials | ARC-895 | `ARC-895-tutorials` | Not started |
| 4D. Colorblind | ARC-896 | `ARC-896-colorblind` | Not started |
| 4E. Screen Reader | ARC-897 | `ARC-897-screen-reader` | Partial |
| 4F. Keyboard Nav | ARC-898 | `ARC-898-keyboard-nav` | Not started |
| 4G. Daily Challenges | — | — | **Implemented** |
| 4H. Season System | ARC-899 | `ARC-899-season-system` | Not started |
| 4I. PWA Support | ARC-903 | `ARC-903-pwa-support` | Partial |
| 4J. Offline Mode | ARC-900 | `ARC-900-offline-mode` | Not started |
| 4K. Web Share | — | — | **Implemented** |
| 4L. Push Notifications | — | — | **Implemented** |
| 4M. Tournaments | — | — | **Implemented** |
| 4N. Leaderboards | — | — | **Implemented** |
| 4O. Board Game Creator | ARC-901 | `ARC-901-board-game-creator` | Not started |
| 4P. Mobile Games | ARC-902 | `ARC-902-mobile-games` | Partial |
| 5B. Monetization | — | — | **Implemented** |

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

- Use Tamagui's built-in theme system (already configured in `tamagui.config.ts`)
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
- Port each game widget to React Native + Tamagui
- Touch-optimized board interactions (drag, tap, pinch-to-zoom)
- Offline support via Expo's background fetch
- Push notifications via Expo Push Service

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
- Payment integration (Stripe, crypto, or platform-specific)

---

## Recommended Implementation Order

| Phase       | Features                                                                  | Est. Days | Impact                            |
| ----------- | ------------------------------------------------------------------------- | --------- | --------------------------------- |
| **Phase 1** | Stats tracking + Emotes + House rules + Dark mode + Undo + Password rooms | 8-12      | Immediate engagement boost        |
| **Phase 2** | Chess + Checkers + AI difficulty + Audio cues + Hints/Coach               | 14-20     | Game catalog doubles, skill depth |
| **Phase 3** | Matchmaking queue + Ranked/ELO + Achievements + Leaderboards              | 15-20     | Competitive infrastructure        |
| **Phase 4** | Hearts + Spades + Backgammon + Pachisi + Post-game analysis               | 22-28     | Broadens audience                 |
| **Phase 5** | Go + Clans + Game nights + Replays + Spectator mode                       | 28-38     | Community + hardcore depth        |
| **Phase 6** | Tournaments + Seasons + Daily challenges + Colorblind + A11y              | 20-28     | Retention + accessibility         |
| **Phase 7** | PWA + Offline + Push notifications + Share + Timer system                 | 10-16     | Platform maturity                 |
| **Phase 8** | Board game creator + Mobile port + Monetization                           | 35-51     | Full platform vision              |

**Total estimated: 152-213 working days for all features.**

Phase 1 alone (under 2 weeks) delivers immediate value: players track progress, react to each other, customize games, and get quality-of-life improvements — making the platform feel alive before the big game additions land.
