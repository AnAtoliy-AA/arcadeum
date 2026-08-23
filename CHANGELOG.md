# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.26.11] - 2026-08-23

### Added
- add go landing page, home card and create-page wiring (ARC-887)
- add go web widget with shared theme support (ARC-887)
- wire go service, MCTS bot and socket gateway (ARC-887)
- add go engine with captures, ko rule and area scoring (ARC-887)

### Fixed
- offer forfeit via available actions and fix Go i18n interpolation (ARC-887)
- bound Go bot compute and harden engine/landing review findings (ARC-887)
- use crypto randomInt for go randomness (ARC-887)


## [1.26.10] - 2026-08-23

### Fixed

- run anonymous verification unconditionally in optional guard
- make anonymous-identity gates reject-only for CodeQL bypass rule
- harden anonymous auth guard, SSRF barriers and URL checks

## [1.26.9] - 2026-08-23

### Fixed

- patch vulnerable transitive dependencies

## [1.26.8] - 2026-08-23

### Added

- wire pachisi into registries, home, create page, and landing (ARC-886)
- add PachisiGame web widget (ARC-886)
- add pachisi i18n messages for en, es, fr, ru, by (ARC-886)
- support pachisi in AI-vs-AI spectator rooms (ARC-886)
- add pachisi engine, service, bot, and gateway (ARC-886)

### Fixed

- route pachisi landing and board labels through i18n, validate options (ARC-886)
- make track tokens clickable and award all players on forfeit (ARC-886)

## [1.26.7] - 2026-08-23

### Added

- add spades card game (ARC-884)
- support AI vs AI for hearts (ARC-884) (ARC-884)
- add Hearts card game (ARC-884) (ARC-884)

### Fixed

- harden hearts after PR review (ARC-884) (ARC-884)
- address hearts code-review findings (ARC-884) (ARC-884)
- wire HeartsGateway into central event dispatcher (ARC-884) (ARC-884)
- size quickplay rooms from engine metadata (ARC-884) (ARC-884)
- preselect all required bots in lobby (ARC-884) (ARC-884)
- address hearts PR review findings (ARC-884) (ARC-884)

### Improved

- halve bot-stall recovery via watchdog threshold (ARC-884) (ARC-884)

## [1.26.6] - 2026-08-23

### Added

- add accessibility section with vision mode selector (ARC-896)
- add color-vision transforms and vision-mode setting (ARC-896)

### Documentation

- mark colorblind modes as PR open (ARC-896) (ARC-896)

## [1.26.5] - 2026-08-23

### Fixed

- harden bots against duplicate triggers in AI-vs-AI (ARC-890) (ARC-890)
- stop spawning bot chains from session reads (ARC-890) (ARC-890)

### Refactored

- make AiVsAiService starters the single source of truth (ARC-890) (ARC-890)

### Documentation

- require AI-vs-AI support in new-game skill, update roadmap (ARC-890) (ARC-890)

## [1.26.4] - 2026-08-23

### Refactored

- use expo-router instead of direct react-navigation

## [1.26.3] - 2026-08-23

### Added

- add incremental room counter to default name and UI (ARC-922) (ARC-922)
- rework room create page with interactive theme preview and secure room notes (ARC-922) (ARC-922)

### Fixed

- sanitize notes using single-character angle bracket removal (ARC-922) (ARC-922)
- resolve incomplete multi-character sanitization (ARC-922) (ARC-922)

## [1.26.2] - 2026-08-22

### Added

- add all popular rule variants to lobby and update skill (ARC-885) (ARC-885)
- add AI vs AI spectating support (ARC-885) (ARC-885)
- add Long Nardy, Hypergammon, and Tavla rule variants (ARC-885) (ARC-885)
- add AnimatedDice to shared UI and fix backgammon bot turn loop (ARC-885) (ARC-885)
- add doubles celebration, blot hit indicators, and race lead meter (ARC-885) (ARC-885)
- add catalog real board preview and skill documentation (ARC-885) (ARC-885)
- add backgammon (ARC-885) (ARC-885)

### Fixed

- make BackgammonEngine dice roller optional for Nest DI (ARC-885) (ARC-885)
- harden backgammon engine and bot (ARC-885) (ARC-885)
- register BackgammonGateway in GamesGateway (ARC-885) (ARC-885)

### Documentation

- update new-game skill for single-prompt autonomous execution (ARC-885) (ARC-885)

## [1.26.1] - 2026-08-22

### Added

- enhance gameplay shorts with kinetic badges, sfx audio, telegram approvals, and expanded games (ARC-892) (ARC-892)
- read WEB_PORT from env with fallback to 3000 (ARC-892) (ARC-892)
- add gameplay shorts pipeline, daily runner and branded outro (ARC-892) (ARC-892)

### Documentation

- document shorts factory integration in new-game skill (ARC-892) (ARC-892)

## [1.26.0] - 2026-08-21

### Changed

- Internal improvements and maintenance

## [1.25.65] - 2026-08-21

### Changed

- Internal improvements and maintenance

## [1.25.64] - 2026-08-21

### Changed

- Internal improvements and maintenance

## [1.25.63] - 2026-08-21

### Fixed

- fix failing post-merge CI jobs
- use correct Buffer modes for release posts to Facebook and Threads

## [1.25.62] - 2026-08-21

### Added

- rework play vs ai modal with catalog previews and lazy loading (ARC-921) (ARC-921)

## [1.25.61] - 2026-08-21

### Added

- make catalog cards full landing links, remove buttons, and fix preview clipping (ARC-920) (ARC-920)
- align in-game board cells and ship hulls with real board artwork (ARC-920) (ARC-920)
- elevate in-game board coordinates, vector marks, and card emblems (ARC-920) (ARC-920)
- elevate radar grid and hit/sunk marker glows (ARC-920) (ARC-920)
- modernize games catalog previews and in-game board visuals (ARC-920) (ARC-920)

### Fixed

- add responsive container side padding to game landing layout (ARC-920) (ARC-920)

## [1.25.60] - 2026-08-20

### Fixed

- forward HTML attributes in Container, restoring settings locale marker (ARC-919) (ARC-919)
- add mobile side padding to Container and fix mode i18n fallback (ARC-919) (ARC-919)

### Refactored

- replace Container prop spread with explicit attribute forwarding (ARC-919) (ARC-919)

## [1.25.59] - 2026-08-20

### Added

- AI vs AI spectator rooms (ARC-890) (ARC-890)

## [1.25.58] - 2026-08-20

### Added

- show game name and theme in two rows and fix full-screen celebration (ARC-918) (ARC-918)
- enhance win lose screen with game themes and match stats (ARC-918) (ARC-918)

### Fixed

- fix fen serialization, i18n deep merge and resign result modal (ARC-918) (ARC-918)
- support forfeit action and add translations for game results (ARC-918) (ARC-918)
- remove nested flex container around full-screen celebration layer (ARC-918) (ARC-918)
- move victory celebration animation classes to global animations.scss (ARC-918) (ARC-918)
- portal GameResultModal to body for unconstrained full-width celebration (ARC-918) (ARC-918)
- ensure full-width 80-slot uniform confetti spread (ARC-918) (ARC-918)

## [1.25.57] - 2026-08-20

### Fixed

- base main version bump on develop head so push is fast-forward
- push version bump to the triggering branch, not develop
- decrypt encrypted cookies forwarded as bearer tokens (ARC-914) (ARC-914)

## [1.25.56] - 2026-08-20

### Added

- unified interactive theme previews on game landings (ARC-917) (ARC-917)
- unify GameThemePicker across all 8 game lobbies (ARC-917) (ARC-917)
- make adventure/classic default theme and render ThemePicker (ARC-917) (ARC-917)
- bind landing theme showcases to SHARED_THEMES (ARC-917) (ARC-917)
- separate visual themes and gameplay logic variants (ARC-917) (ARC-917)
- unify visual themes across all games (ARC-917) (ARC-917)

### Fixed

- update GameThemePicker to responsive grid layout (ARC-917) (ARC-917)
- fix lobby container layout and prevent center overflow (ARC-917) (ARC-917)
- translate theme names and descriptions on game landings (ARC-917) (ARC-917)
- streamline theme resolution across lobbies and backend quickplay (ARC-917) (ARC-917)
- fix theme selection navigation and atmospheric backgrounds (ARC-917) (ARC-917)
- add safety check to game-visibility integration spec cleanup (ARC-917) (ARC-917)

## [1.25.55] - 2026-08-20

### Fixed

- include @swc/helpers esm in Next standalone output

## [1.25.54] - 2026-08-20

### Fixed

- place codeql suppression comment on the URL sink line
- suppress codeql SSRF false positive on validated IP lookups
- break taint flow for geo/vpn lookup URLs via validated helper
- validate IP literal before embedding in geo/vpn lookup URLs
- resilient session restore after refresh with backoff and cross-tab dedupe
- resolve real client IP for rate limiting and raise refresh throttle

## [1.25.53] - 2026-08-20

### Added

- add TikTok app review demo video generator (ARC-916) (ARC-916)
- extract shared GameIdleTimer and GameForfeitModal (ARC-916) (ARC-916)
- add shared theme system and theme picker (ARC-916) (ARC-916)

### Fixed

- fix games categories e2e test route and chip role (ARC-916) (ARC-916)
- use backgroundImage instead of shorthand background to prevent style collision (ARC-916) (ARC-916)
- drop unused error state from GameWidgetErrorBoundary (ARC-916) (ARC-916)

### Improved

- memo chat popup overlay, use shared room actions in SeaBattle (ARC-916) (ARC-916)
- fix widget re-renders and socket listener churn (ARC-916) (ARC-916)

### Refactored

- remove ...props from room card components (ARC-916) (ARC-916)
- remove ...props from lobby components and convert inline styles to tailwind (ARC-916) (ARC-916)
- optimize chess and checkers widgets, fix telegram test (ARC-916) (ARC-916)
- extract shared useGameResult + dead code removal (ARC-916) (ARC-916)
- shared lobby chips, error boundary, move history + widget reorg (ARC-916) (ARC-916)
- derive catalog category tabs from game registry (ARC-916) (ARC-916)
- extract shared getLobbyTheme helper (ARC-916) (ARC-916)
- use shared GameThemePicker in Critical and Sea Battle configs (ARC-916) (ARC-916)
- extract shared game service and gateway base classes (ARC-916) (ARC-916)

## [1.25.52] - 2026-08-18

### Fixed

- allow page scroll on mobile board touches

## [1.25.51] - 2026-08-18

### Added

- wire theme CSS variables and tokens into music player (ARC-905) (ARC-905)

### Improved

- remove backdrop-filter blur in music player in favor of opaque background (ARC-905) (ARC-905)

### Refactored

- extract game music player into standalone widget (ARC-905) (ARC-905)

## [1.25.50] - 2026-08-18

### Added

- wire dynamic markdown data into RoadmapClient and content (ARC-904) (ARC-904)
- parse docs/ROADMAP.md dynamically on the server (ARC-904) (ARC-904)
- use Arcadeum Games name across app config and pages (ARC-904) (ARC-904)
- center icon badges and add feature status tracking (ARC-904) (ARC-904)

### Fixed

- ensure h1 level heading rendered for roadmap and changelog (ARC-904) (ARC-904)

### Refactored

- extract TierCard and StatusBadge into TierCard.tsx (ARC-904) (ARC-904)

## [1.25.49] - 2026-08-18

### Documentation

- mark tier 2 fully complete in roadmap (ARC-883)

## [1.25.48] - 2026-08-18

### Added

- connect help page category cards to dynamic FAQ filtering (ARC-883)
- modernize content pages, SEO structured data, and mobile footer (ARC-883)

### Fixed

- enhance text contrast and colors on help page (ARC-883)
- reset button styling to transparent background and inherit text color (ARC-883)
- prevent nested h2 inside h1 by supporting as prop and level on Typography (ARC-883)
- avoid nested heading in AuthBrandPanel headline accent (ARC-883)
- render semantic headings in Typography and fix footer e2e (ARC-883)

### Refactored

- render DevelopersPageContent directly as Server Component (ARC-883)
- remove Endpoints & Specs section from developers page (ARC-883)
- remove SDK code snippet section from developers page (ARC-883)

## [1.25.47] - 2026-08-18

### Added

- add coach-mode move hints for chess (ARC-883)

### Refactored

- derive coach flags in hook to fit line limit (ARC-883)

### Documentation

- add changelog entry for coach mode (ARC-883)

## [1.25.46] - 2026-08-17

### Fixed

- replace bash-specific $(...) with cross-platform port resolver
- resolve pnpm v11 compatibility issues

### Improved

- remove GPU-heavy animations across app UI
- remove GPU-heavy animations across all games
- reduce GPU load in sea-battle animations
- remove GPU-killing backdrop-filter blur effects
- replace box-shadow animations with GPU-composited transform/opacity

### Documentation

- add MongoDB Docker setup to CONTRIBUTING.md

## [1.25.45] - 2026-08-17

### Added

- add i18n keys for post-game analysis (ARC-882)
- surface analysis behind a toggle in the chess result modal (ARC-882)
- add post-game analysis UI components (ARC-882)
- add chess position evaluator and analysis engine (ARC-882)

### Documentation

- add changelog entry for chess post-game analysis (ARC-882)

## [1.25.44] - 2026-08-17

### Added

- add i18n keys for ranked mode and tiers (ARC-881)
- surface ranked mode across create flow, lobbies and results (ARC-881)
- add web ranking model, api, store and RatingBadge (ARC-881)
- add backend ranked ELO module and integrate with game results (ARC-881)

### Documentation

- add changelog entry for ranked/ELO ratings (ARC-881)
- mark ranked/ELO skill ratings as implemented (ARC-881)

## [1.25.43] - 2026-08-17

### Added

- add icon to Rooms nav item in mobile menu (ARC-games-description-pages)
- disable all start-game buttons on landings for disabled games (ARC-games-description-pages)
- disable landing play buttons for admin-disabled games (ARC-games-description-pages)
- make /games catalog cards link to game landing pages (ARC-games-description-pages)
- change game and rooms routes
- rework game description pages with unified architecture and real theme variants (ARC-games-description-pages)

### Fixed

- move room route to /rooms and restore human matchmaking (ARC-games-description-pages)

## [1.25.42] - 2026-08-17

### Added

- add expert difficulty selector, room option and lobby badge on web (ARC-880)
- add difficulty tiers to tic-tac-toe, cascade and critical bots (ARC-880)
- add expert difficulty tier to chess, checkers and sea battle (ARC-880)
- add shared AiDifficulty type with expert tier and config validation (ARC-880)

### Documentation

- mark AI difficulty tiers as implemented in roadmap (ARC-880)

## [1.25.41] - 2026-08-17

### Added

- show estimated wait and queue position in matchmaking modal (ARC-876)
- improve matchmaking queue with per-game buckets and status events (ARC-876)

### Documentation

- mark matchmaking queue as implemented (ARC-876)

## [1.25.40] - 2026-08-17

### Fixed

- fix oversized turn badge typography on sea battle player board (ARC-ui-fixes)
- allow clearing selection on invalid combo click (ARC-ui-fixes)
- improve mobile card selection and normalize CriticalGame typography (ARC-ui-fixes)
- unify badges, remove AccentPill, and enhance lobby layout (ARC-ui-fixes)

## [1.25.39] - 2026-08-17

### Added

- add screen-reader announcement strings to all locales
- add grid roles and cell labels to sea battle boards
- add keyboard navigation and announcements to tic-tac-toe
- add cell labels, keyboard navigation, and announcements to checkers
- add keyboard navigation and screen-reader announcements to chess
- announce game events via live region in widget container
- add shared a11y helpers for screen-reader announcements

### Documentation

- add screen-reader support entry to changelog
- mark screen reader support as implemented in roadmap

## [1.25.38] - 2026-08-17

### Added

- rework home hero with multi-game showcase and vector art (ARC-hero-rework)

## [1.25.37] - 2026-08-17

### Fixed

- validate room id and use eq filter in Atlas mirror query
- keep react-native 0.86.2 and expo-constants 18.x for Expo SDK 54

### Refactored

- extract room participant utilities and use next router in BuyGemsButton

## [1.25.36] - 2026-08-17

### Improved

- eliminate home page layout shift from streaming skeleton

## [1.25.35] - 2026-08-16

### Changed

- Internal improvements and maintenance

## [1.25.34] - 2026-08-16

### Added

- add powerup replay, spectator visibility, and SCSS grid layout

### Improved

- delegate cell hover events and isolate sunkCellSet to eliminate redundant board rerenders
- replace O(N) player finds with aliveMap in team-rotation utils and engine
- eliminate O(N) finds with Maps/Sets, structuredClone, and memoize hot paths

### Refactored

- clean up dead UI components and optimize rendering

## [1.25.33] - 2026-08-16

### Added

- rework cookie policy page with modern UI and sticky navigation
- add reusable TableOfContents component to shared UI library and integrate into legal pages
- rework terms and privacy policy pages with modern UI and sticky navigation

### Fixed

- render SettingsPage synchronously during SSR to prevent layout shift on refresh
- center settings page layout using shared Container

### Documentation

- update lastUpdated date on cookies policy across all locales to August 2026
- update lastUpdated date on legal terms and privacy policies to August 2026

## [1.25.32] - 2026-08-16

### Fixed

- add missing communityBy import to by.ts

## [1.25.31] - 2026-08-16

### Added

- add setting to control rules popup on room entry (ARC-settings)

## [1.25.30] - 2026-08-16

### Added

- include error reasons for failed social platforms in Telegram breakdown (ARC-201) (ARC-201)
- display failed platforms in Telegram breakdown (ARC-201) (ARC-201)

## [1.25.29] - 2026-08-16

### Fixed

- encrypt token cookies at rest
- always set Secure flag on auth token cookies
- show real country/region and all games

## [1.25.28] - 2026-08-16

### Fixed

- run Release workflow only on main merges, not tag pushes

## [1.25.27] - 2026-08-16

### Fixed

- replace YAML anchors with plain job conditions
- remove [skip ci] from version bump so release PR checks run

## [1.25.26] - 2026-08-16

### Added

- unify music state and persist player settings

### Fixed

- reduce sea battle field status text size
- distinct message bubble background in game chat
- consistent control panel toggles and distinct chat message bubbles
- viewport-fit game room, visible widget borders, chat layout

### Refactored

- extract shared glass bubble classes in ChatMessage

## [1.25.25] - 2026-08-16

### Added

- add shared AccentPill badge, use it in home featured games and shop rarity labels

### Fixed

- always mint theme CSS vars so button backgrounds survive reloads
- replace option buttons with divs to avoid default white background
- use var(--color) for dropdown option text instead of var(--textSecondary)
- remove duplicate auth link and polish language select dropdown

### Improved

- eliminate announcement banner and font-swap layout shift (CLS)

## [1.25.24] - 2026-08-15

### Changed

- Internal improvements and maintenance

## [1.25.23] - 2026-08-15

### Added

- format post result social platform list with checkmarks (ARC-201) (ARC-201)

### Fixed

- add emoji definition in sendResultMessage (ARC-201) (ARC-201)
- fix TikTok Postiz settings properties for successful posting (ARC-201) (ARC-201)

## [1.25.22] - 2026-08-15

### Improved

- cut home page critical-path bytes for Lighthouse

### Refactored

- remove redundant DOM wrappers and nested main landmarks

## [1.25.21] - 2026-08-15

### Fixed

- repair layouts and clicks broken by CSS-migration quirks

### Refactored

- remove Tamagui runtime shims and migration leftovers
- remove Tamagui migration leftovers and fix CI build
- drop Tamagui migration leftovers after Tailwind switch
- fix theme resolution and drop migration leftovers
- clean up Tamagui migration leftovers
- remove Tamagui legacy layers after Tailwind migration
- migrate all remaining Tamagui components to Tailwind
- migrate widgets/ from Tamagui to Tailwind classes
- migrate features/ from Tamagui to Tailwind classes
- migrate app shell from Tamagui to Tailwind classes

### Documentation

- replace all Tamagui references with Tailwind guidance
- mark tamagui-to-tailwind plan as complete

## [1.25.20] - 2026-08-15

### Added

- optimize short video length to 15s total for maximum engagement (ARC-201) (ARC-201)
- enhance short captions for virality & engagement (ARC-201) (ARC-201)

### Fixed

- use domcontentloaded and 60s timeout to prevent navigation failures (ARC-201) (ARC-201)

## [1.25.19] - 2026-08-15

### Added

- footer dropdowns open by default on desktop (ARC-912) (ARC-912)
- port home page to tailwind utility classes (ARC-912) (ARC-912)

### Fixed

- resolve CodeQL warnings in Modal component (ARC-912) (ARC-912)
- add modal focus management and select keyboard navigation (ARC-912) (ARC-912)
- restore custom dropdown behavior in Select for e2e (ARC-912) (ARC-912)
- restore dialog role and data-state on modal (ARC-912) (ARC-912)
- restore dialog role on Modal and remove Tamagui from OfflineView (ARC-912) (ARC-912)
- theme-aware filter chips and footer line-height (ARC-912) (ARC-912)
- fix footer breakpoints and convert games filter chips to tailwind (ARC-912) (ARC-912)
- fix light theme contrast for header nav and button variants (ARC-912) (ARC-912)
- make icon and circle button padding win over size padding (ARC-912) (ARC-912)
- use important modifiers for active mobile nav link (ARC-912) (ARC-912)
- strip button animations in e2e and fix tailwind class override order (ARC-912) (ARC-912)

### Improved

- drop tamagui from home route bundle and self-host font (ARC-912) (ARC-912)

### Refactored

- dedupe hero variant data, fix hero locale, clean dead code (ARC-912) (ARC-912)
- port button to tailwind and trim redundant props and variants (ARC-912) (ARC-912)

## [1.25.18] - 2026-08-13

### Added

- add /version command to show bot versions (ARC-201) (ARC-201)
- add Other Scenario regenerate button (ARC-201) (ARC-201)
- support unlimited video regenerations via task-bot (ARC-201) (ARC-201)
- add X/Twitter posting via Postiz (ARC-201) (ARC-201)

### Fixed

- remove unused fs and exec imports in telegram service (ARC-201) (ARC-201)

## [1.25.17] - 2026-08-12

### Fixed

- replace Play & Earn CTA with Play Online Now gaming CTAs (ARC-201) (ARC-201)

## [1.25.16] - 2026-08-12

### Fixed

- set mode 0o666 on pending json files for write access (ARC-201) (ARC-201)

## [1.25.15] - 2026-08-12

### Fixed

- clean up task-bot.handlers.ts syntax and exports (ARC-201) (ARC-201)
- properly forward handleCallbackQuery to task-bot.callbacks (ARC-201) (ARC-201)
- re-export handleCallbackQuery from task-bot.handlers (ARC-201) (ARC-201)

## [1.25.14] - 2026-08-12

### Fixed

- process inline callback buttons for all users and add callback logging (ARC-201) (ARC-201)

## [1.25.13] - 2026-08-12

### Fixed

- attach all command handlers and callback_query:data listener in onApplicationBootstrap (ARC-201) (ARC-201)

## [1.25.12] - 2026-08-12

### Fixed

- handle sf_confirm approval callback and register /shorts in all_private_chats scope (ARC-201) (ARC-201)

## [1.25.11] - 2026-08-12

### Fixed

- use port 4005 to avoid collision with be-dev
- import ShortsFactoryModule in TaskBotModule

## [1.25.10] - 2026-08-12

### Added

- move Shorts Factory trigger and video previews to task-bot (ARC-201) (ARC-201)

### Fixed

- remove unused import in telegram service

## [1.25.9] - 2026-08-12

### Fixed

- fallback to telegram chat if video file not on local disk

## [1.25.8] - 2026-08-12

### Fixed

- launch shorts factory process asynchronously without blocking on pollForApproval (ARC-201) (ARC-201)

## [1.25.7] - 2026-08-12

### Added

- register bot slash commands via setMyCommands (ARC-201) (ARC-201)

## [1.25.6] - 2026-08-12

### Added

- send video preview with confirm and regenerate inline buttons (ARC-201) (ARC-201)
- add /shorts command to trigger shorts factory post from Telegram (ARC-201) (ARC-201)

### Fixed

- remove unused stdout and stderr callback params to resolve eslint error (ARC-201) (ARC-201)
- increase axios timeout for tg bot approval notification (ARC-201) (ARC-201)
- fix root playwright browser installation and add website url to end card (ARC-201) (ARC-201)

## [1.25.5] - 2026-08-12

### Fixed

- use dispatchEvent click calls and fix border-radius check for cross-browser stability in profile-menu and sea-battle E2E tests
- load all translation bundles in getInitialTranslations to fix SSR hydration warnings on subpages
- include settings, legal, notifications, referrals, battlePass, and chat in getInitialTranslations to resolve hydration warnings
- resolve E2E tests pointer interception via dispatchEvent
- resolve E2E tests click interception, typescript type errors, and test assertions
- only apply control panel z-index on desktop to prevent mobile pointer event interception
- use hasFullBundle ref to gate deferred translation load
- load full translations on SPA navigation
- restore middleware filename and update E2E tests for root rewrite
- revert package version changes and fix socket window mapping for E2E tests
- use forks pool for vitest to prevent segfault
- extract loadGames from barrel index to fix Turbopack dev resolution
- use explicit games/index path for Turbopack dynamic import
- align Spinner test role with component implementation

### Improved

- optimize home performance and fix hero card coordinates math
- CSS-only spinners, lazy i18n, server-rendered hero, fix translation hydration
- reduce main-thread work and improve interactivity

## [1.25.4] - 2026-08-11

### Changed

- Internal improvements and maintenance

## [1.25.3] - 2026-08-11

### Fixed

- remove GPU-heavy animations from hero kicker, title, and background

### Refactored

- remove dead CSS and orphaned class from hero perf cleanup

## [1.25.2] - 2026-08-10

### Fixed

- use ecosystem.config.js for BE start to fix CORS

## [1.25.1] - 2026-08-10

### Fixed

- copy scripts dir in Dockerfiles and remove stale git locks

## [1.25.0] - 2026-08-10

### Changed

- Internal improvements and maintenance

## [1.24.46] - 2026-08-10

### Fixed

- wrap PWA feature text in Text component to fix console error

## [1.24.45] - 2026-08-10

### Fixed

- remove duplicate release poster and add Instagram channel

## [1.24.44] - 2026-08-10

### Fixed

- open chat panel on mobile before assertions
- fix in-game chat e2e tests by adding mock echo and fixing field names
- use correct navigation URL in in-game-chat e2e tests
- unify all game chat to use shared GamesHistoryFacade.postHistoryNote
- persist session chat message deletion to OCI
- catch NotFoundException from Atlas in postHistoryNote for quick-play rooms

## [1.24.43] - 2026-08-09

### Added

- implement visual, audio and cli enhancements (ARC-SHORTS)

## [1.24.42] - 2026-08-09

### Improved

- also gate audio element creation on player visibility
- reduce network payloads by optimizing assets and deferring audio loading

## [1.24.41] - 2026-08-09

### Fixed

- fix move logic, win conditions, and rules documentation
- sync gamesTab rename and manifest update from ARC-logo-updates branch

## [1.24.40] - 2026-08-09

### Added

- add more shop backgrounds and translations

### Fixed

- sync gamesTab rename and manifest update from ARC-logo-updates branch

## [1.24.39] - 2026-08-09

### Fixed

- move connection banner to bottom of screen
- prevent connection banner from blocking pointer events
- keep socket connected for anonymous users on games page
- connect game socket for anonymous users in room
- centralize socket connection in BrowserRegistry
- anonymous player connection and quick match issues
- allow anonymous players to send in-game chat messages

### Documentation

- add socket architecture reference

## [1.24.38] - 2026-08-09

### Added

- display logo in video end card
- enhance scenarios, trim white screen and add platform link

## [1.24.37] - 2026-08-09

### Fixed

- allow video presentation iframe autoplay on mobile safari (ARC-890) (ARC-890)
- remove force:true from home games slider e2e clicks to fix webkit viewport failures
- remove force:true from video presentation e2e click to fix Tablet Safari flake
- move pnpm config from .npmrc to pnpm-workspace.yaml
- scope pnpm config to [pnpm] section to silence npm warnings
- remove content-visibility from presentation section to fix e2e test
- refactor public-announcements test to unit style to fix flaky SIGSEGV

### Improved

- optimize home page performance

## [1.24.36] - 2026-08-09

### Fixed

- use anonymous ID for unauthenticated players in quick match

## [1.24.35] - 2026-08-08

### Fixed

- remove overflow hidden from chat GlassCard to fix pointer events
- fix custom eslint set-state-in-effect rule in HeroCardStack
- optimize pagespeed scores and accessibility, fix hydration mismatch and bg hover

## [1.24.34] - 2026-08-08

### Added

- add global socket connection status tracking and reconnection banner

### Fixed

- use try-catch in guardEmit to survive mock-overridden connected state
- guard chat socket emit against transport crash in E2E
- prevent ConnectionBanner from blocking E2E test selectors
- reuse shared chatSocket instead of creating ad-hoc connections

### Refactored

- use default reconnection for leaderboards socket
- consolidate walletSocket into shared socket module

## [1.24.33] - 2026-08-07

### Added

- add GeoIP redirection and sitemap/rich schema optimization (ARC-890) (ARC-890)

## [1.24.32] - 2026-08-07

### Added

- add Telegram approval flow for video review

### Fixed

- replace dynamic require() with static imports for lint compliance
- add Playwright install to CI/CD and fix Instagram post type

## [1.24.31] - 2026-08-07

### Fixed

- fix CI workflow issues across multiple workflows

## [1.24.30] - 2026-08-07

### Fixed

- bot turn detection in team mode and mobile-menu e2e timeout
- lint errors across web and backend (set-state-in-effect, unused imports, any assignments)
- disable standalone output on Vercel for Next.js 16.3 compat

## [1.24.29] - 2026-08-07

### Fixed

- scan wave shows once, weapon sizes, teammate visibility

## [1.24.28] - 2026-08-07

### Fixed

- fix checkers multi-step validation and board orientation

## [1.24.27] - 2026-08-07

### Added

- use premium spritesheets for avatars and badges (ARC-777) (ARC-777)

### Fixed

- decrypt socket payload in handleHistoryNote (ARC-777) (ARC-777)

## [1.24.26] - 2026-08-06

### Changed

- Internal improvements and maintenance

## [1.24.25] - 2026-08-06

### Added

- game picker respects admin visibility and adds translations
- use create-room game art in picker modal and lazy-load it
- game picker modal uses SVG symbols and adds category tabs
- play vs AI hero button opens game picker modal

### Fixed

- reduce desktop hero padding to keep buttons visible
- hero section buttons and card overflow on mobile

### Refactored

- split oversized game services under 500-line limit

## [1.24.24] - 2026-08-06

### Added

- add field status overlay showing hits, misses, and unexplored cells

## [1.24.23] - 2026-08-06

### Added

- add settings gear icon for unauthenticated desktop users

## [1.24.22] - 2026-08-05

### Added

- admin update abbility to grant shop items to users

### Fixed

- avoid any in query condition

## [1.24.21] - 2026-08-05

### Added

- lobby chat with message deletion
- add scan wave weapon - reveal all ships at battle start
- scale sonar/radar size with grid dimensions

### Fixed

- eslint warnings
- restore ChatLogEntry import in GameChat.tsx
- resolve lint errors in gateway and sea-battle service
- resolve watcher display names in chat log entries
- enable authenticated watcher chat and resolve watcher avatars in game chat
- unify game chat layout with bottom-aligned avatar and name
- enable message deletion for emotes in game chat
- add avatar to emote bubble and fix lobby chat
- decrypt encrypted socket events in lobby chat listener
- show player avatars in lobby player list
- always show sonar/radar buttons and disable when unavailable

### Refactored

- extract ChatLogItem and chat helpers to reduce GameChat.tsx below 500 lines
- clean up formatting in game services and gateway
- extract SenderName component from ChatMessage
- unify game chat avatar+name rendering and fix emote display
- extract shared FloatingBubbleLabel for popup avatar and name badge
- simplify useGameRoomChat decryption logic
- extract isSonarDisabled/isRadarDisabled booleans

## [1.24.20] - 2026-08-05

### Changed

- Internal improvements and maintenance

## [1.24.19] - 2026-08-04

### Fixed

- keep ship placement in local state until confirm

## [1.24.18] - 2026-08-04

### Fixed

- add @Optional() decorators to GameHistoryRematchService model injections
- make Atlas connection optional in GameHistoryRematchService
- add currentPlayerId to TicTacToeBoard for hover cursor with sign
- fix sea battle rematch button and disable Vercel analytics in e2e

## [1.24.17] - 2026-08-04

### Fixed

- skip Vercel analytics scripts in non-production environments

### Improved

- fix MongoDB idle connections and batch N+1 queries (ARC-883)

### Refactored

- consolidate game gateways into single-namespace handler registry (ARC-883)

## [1.24.16] - 2026-08-04

### Added

- add 5 new premium cyber animal avatars
- add Cyber Panda & Cyber Cheetah avatars
- add Supernova and Synthwave themed cosmetics

## [1.24.15] - 2026-08-04

### Added

- implement smooth serpentine winding curves and expand row padding (ARC-882) (ARC-882)
- scale up board cells to 22px and tokens to 38px (ARC-882) (ARC-882)
- scale up board cells, tokens, and turn badge sizes (ARC-882) (ARC-882)
- enhance cat designs and add themed board backgrounds (ARC-882) (ARC-882)
- integrate serpentine layout and configurable board size (ARC-882) (ARC-882)
- add standalone serpentine game page
- add AI play CTA, bot features, lobby empty states and fix player count
- add player ELO rating schema and calculations with E2E tests (ARC-881) (ARC-881)
- implement matchmaking queue system with frontend status modal (ARC-876) (ARC-876)
- add AI bot difficulty support for Chess and Checkers (ARC-880) (ARC-880)

### Fixed

- fix matchmaking portal unmount logic and update E2E test scripts
- replace Tamagui Dialog.Portal with direct createPortal to fix CI rendering
- use locale-aware routes in footer to fix identical links a11y issue
- fix matchmaking modal not appearing and consolidate QuickplayButton
- generate anon id in joinQueue for anonymous matchmaking
- resolve strict mode violation in matchmaking test by using first() locator
- update Sea Battle QuickplayButton to support matchmaking and match test ID
- correct matchmaking and empty state text assertions
- correct url assertion with literal comma in homepage test

## [1.24.14] - 2026-08-02

### Fixed

- use ecosystem.config.js for PM2 and fix Socket.IO CORS on OCI

## [1.24.13] - 2026-08-02

### Added

- enable PM2 cluster mode for 3x BE instances
- add OCI deployment support with standalone output

## [1.24.12] - 2026-08-02

### Added

- add @vercel/analytics for detailed performance monitoring

### Fixed

- destructure wallet balance to pass ESLint rule
- resolve all build warnings

## [1.24.11] - 2026-08-02

### Added

- switch default MongoDB connection to Atlas for shared data
- add Atlas-to-local MongoDB sync script
- add reserve BE failover with automatic client-side fallback

### Fixed

- archive abandoned games to Atlas before cleanup

## [1.24.10] - 2026-08-01

### Fixed

- add missing providers to GitHubModule

## [1.24.9] - 2026-08-01

### Changed

- Internal improvements and maintenance

## [1.24.8] - 2026-08-01

### Refactored

- remove mimo engine, use opencode only
- remove mimo engine, use opencode only

## [1.24.7] - 2026-08-01

### Documentation

- update roadmap with growth plan and current status (ARC-ROADMAP)

## [1.24.6] - 2026-08-01

### Added

- auto-cleanup old videos + Instagram + multi-theme (ARC-212) (ARC-212)
- dual output (full video + short clip), stable selectors (ARC-212) (ARC-212)
- add gameplay recording script (ARC-212) (ARC-212)
- add arcadeum.games end card to videos

### Fixed

- Instagram posting via Postiz (ARC-212) (ARC-212)
- audio in shorts + random themes + varied card play (ARC-212) (ARC-212)
- animated end card + faster navigation (ARC-212) (ARC-212)
- real mobile emulation + working gameplay (ARC-212) (ARC-212)
- two separate sessions - desktop full + mobile short (ARC-212) (ARC-212)
- desktop viewport for full video, vertical crop for shorts (ARC-212) (ARC-212)
- full video 80-90s to avoid YouTube Shorts classification (ARC-212) (ARC-212)
- fetch audio tracks dynamically from CDN tracks.json
- fix OCI deployment and add multi-platform support

## [1.24.5] - 2026-08-01

### Added

- cache achievement definitions in achievements service
- add Redis caching to public announcements fetch
- import AppCacheModule globally in Appmodule
- add AppCacheModule configuration with Redis/Memory fallback support

### Fixed

- resolve mongoose model typecast warning in achievements service cache

### Improved

- implement Redis Pub/Sub adapter support in CompressedIoAdapter
- implement active announcement cache eviction on mutations
- enable Socket.IO WebSocket compression adapter
- add compound index for refresh tokens validation and rotation
- add compound index for achievement definitions category and sort order
- add compound index for referrals status and date
- add compound index for player-stat-record query path

### Documentation

- add environment variable documentation for APP_CACHE_TTL_SECONDS

## [1.24.4] - 2026-08-01

### Added

- add Cyber Falcon & Gorilla avatars and restrict ARC pricing to gems
- add Cyber Leopard and Cyber Eagle Elite avatars
- add 24 new premium cosmetics including magma, oceanic, and sakura themes

## [1.24.3] - 2026-07-31

### Fixed

- resolve react-hooks/set-state-in-effect error in HeroBackground
- remove aria-label mismatch on install PWA button

### Improved

- optimize hero background images and split SCSS

### Refactored

- simplify ObjectId string conversion in auth and payment-notes

## [1.24.2] - 2026-07-31

### Fixed

- fix remaining CI failures from GamesPage and GameVariantSelector
- fix @arcadeum/ui test failures from Tamagui duplicate packages
- add parens for nullish coalescing in GameVariantSelector
- resolve lint and backend e2e test failures from dependabot upgrades

## [1.24.1] - 2026-07-31

### Fixed

- add standalone mongo transaction fallback to shop services
- resolve cookie domain and standalone mongo transaction fallback

## [1.24.0] - 2026-07-31

### Changed

- Internal improvements and maintenance

## [1.23.179] - 2026-07-31

### Fixed

- replace Math.random with crypto.randomInt in tic-tac-toe bot; explicit currency validation in wallet query

## [1.23.178] - 2026-07-31

### Fixed

- update appleboy/ssh-action to v1.0.3 in deploy workflows

## [1.23.177] - 2026-07-31

### Added

- db health check

### Fixed

- use ConnectionStates enum for readyState comparison

## [1.23.176] - 2026-07-31

### Fixed

- use randomInt to avoid biased modulo in code generation
- replace Math.random() with crypto APIs and sanitize query inputs

## [1.23.175] - 2026-07-31

### Changed

- Internal improvements and maintenance

## [1.23.174] - 2026-07-31

### Added

- restyle hero h1 with Arcadeum Games two-line layout

## [1.23.173] - 2026-07-31

### Added

- rename H1 to Arcadeum Games (two lines)

## [1.23.172] - 2026-07-31

### Improved

- disable3D effects and animation on mobile for faster LCP

## [1.23.171] - 2026-07-31

### Fixed

- add image quality 80 to allowed qualities config

## [1.23.170] - 2026-07-31

### Fixed

- equalize hero card sizing and vertical alignment

### Improved

- optimize images, polyfills, lazy-load, bfcache headers

## [1.23.169] - 2026-07-31

### Fixed

- increase hero card fan offset for touch target spacing

## [1.23.168] - 2026-07-31

### Changed

- Internal improvements and maintenance

## [1.23.167] - 2026-07-31

### Added

- add dev OCI deploy, branch selection, api-dev.arcadeum.games, fix music URL

## [1.23.166] - 2026-07-30

### Fixed

- make Atlas URI optional in all environments including production
- register PlayerStats models on default connection for DI resolution
- conditionally register Atlas MongooseModule.forFeature
- make Atlas models optional for CI E2E compatibility
- add missing test providers for dual MongoDB services

### Refactored

- rename MONGODB_URI to MONGODB_OCI_URI for clarity

## [1.23.165] - 2026-07-29

### Added

- add neon and solar themed name colors and frames

## [1.23.164] - 2026-07-29

### Fixed

- show sea battle boards after game over (ARC-899)

## [1.23.163] - 2026-07-28

### Fixed

- scope auth cookies to .arcadeum.games with SameSite=Lax

## [1.23.162] - 2026-07-28

### Fixed

- support feedback preflight and production API domains

## [1.23.161] - 2026-07-28

### Fixed

- fix critical rules modal in active games
- pass onOpenRules through widget tree and fix hand background bleed
- lift RulesModal to Game.tsx outside widget tree
- add background to Critical hand section so scene covers full widget
- fix Critical card images not loading and rules modal not opening in lobby

## [1.23.160] - 2026-07-28

### Added

- husky develop branch pysh protection

## [1.23.159] - 2026-07-28

### Changed

- Internal improvements and maintenance

## [1.23.158] - 2026-07-28

### Fixed

- encrypt sensitive email storage to resolve CodeQL alert
- add typeof guards, URL validation, crypto fixes, and workflow permissions for CodeQL compliance
- correct CodeQL suppression comment query ID (ARC-XXX)
- resolve all CodeQL security alerts across codebase

## [1.23.102] - 2026-07-27

### Fixed

- address CodeQL injection findings
- secure CI webhook and polling

## [1.23.101] - 2026-07-27

### Fixed

- eliminate modulo bias in referral code generation (ARC-XXX)
- add CodeQL config and cover staging branch to fix default scan failures
- add input validation to resolve CodeQL NoSQL injection alerts
- add input validation and replace Math.random with crypto PRNG

## [1.23.100] - 2026-07-27

### Fixed

- fix sunk ship surrounding cells marking with gridSize

## [1.23.99] - 2026-07-26

### Fixed

- lobby bots issues

## [1.23.98] - 2026-07-26

### Fixed

- remove broken head_commit conditions from deploy workflows

## [1.23.97] - 2026-07-26

### Added

- add checkers variants support (ARC-878)

## [1.23.96] - 2026-07-26

### Fixed

- align games list columns and fix button text wrapping

## [1.23.95] - 2026-07-26

### Added

- add tamagui-pro skill for correct Tamagui patterns

### Fixed

- add no-important rule to tamagui-pro skill

## [1.23.94] - 2026-07-24

### Added

- add ARC token payment flow with Solana Pay integration

### Fixed

- add ObjectId validation to purchaseWithArc method
- correct expected amount in solana pay create test
- use page.evaluate for fetch calls in arc-payment tests to bypass route interceptors
- correct test-utils import path in arc-payment.spec.ts
- restore missing cat-dash and tic-tac-toe theme imports/exports in themes.ts

## [1.23.93] - 2026-07-24

### Added

- oval track board with 100 spaces
- add landing sub-components, OG images, buildGameOptions, bot spec, and widget tests
- add landing page, i18n, home/create page integration, engine tests, and e2e update
- add frontend widget with types, hooks, UI components, and registry
- add backend service, bot, gateway, and catalog entry
- implement backend engine with utils, validators, and module registration
- add backend types and constants

### Fixed

- remove duplicate TIC_TAC_TOE_THEMES declaration in themes.ts
- resolve player names in chat/board, add cat emojis, polish board UI with Tamagui button
- remove direct CatDashEngine injection from service (use registry via sessions)

### Documentation

- add Cat Dash implementation plan
- add Cat Dash game design spec

## [1.23.92] - 2026-07-23

### Added

- optimistic UI and multi-jump capture chains
- add checkers web integration and landing page

## [1.23.91] - 2026-07-23

### Added

- rework game lobbys for better UX and consistency

## [1.23.90] - 2026-07-23

### Added

- add full client-side validation to contact form
- add UI validation error display to contact form

## [1.23.89] - 2026-07-23

### Fixed

- fully filter resolve-conflicts from daily updates
- treat resolve-conflicts as docs type in release posts too
- treat resolve-conflicts commits as docs type in daily updates
- filter 'resolve conflicts' commits from daily update messages

### Documentation

- clarify CONTRIBUTING.md structure and links
- restore commit types section in CONTRIBUTING.md
- update stale documentation across monorepo

## [1.23.88] - 2026-07-23

### Fixed

- fix sea battle auto-place not placing all ships and state corruption

## [1.23.87] - 2026-07-23

### Fixed

- migrate login-lockout and ip-block from in-memory Maps to shared RateStateStore

## [1.23.86] - 2026-07-23

### Added

- add sprite sheet cover art and filter/sort to music player

## [1.23.85] - 2026-07-23

### Documentation

- add PR title convention for staging/main

## [1.23.84] - 2026-07-23

### Fixed

- forward isGameOver to useGameResultModal
- remove vitest overrides that cause peer dep mismatches
- escape regex input, gate CSP unsafe-eval, add socket auth validation

## [1.23.83] - 2026-07-23

### Added

- add useGameEndState hook and GameEndModals for unified game end screen

### Fixed

- add expansionMargin/infinityWinLength to TicTacToe resolveOptions
- fix TicTacToe isSize type guard for infinity board size
- add openRematchModal to Critical GameEndModals gameEnd object
- fix type error in Critical ActiveGameView rematch handler
- add currentUserId/isGameOver back as optional to UseGameEndStateOptions
- remove duplicate SeaBattleModals function from merge

### Refactored

- optimize useGameEndState performance and simplify GameEndModals API

## [1.23.82] - 2026-07-23

### Added

- add cyber phoenix and cyber dragon premium avatars

## [1.23.81] - 2026-07-23

### Fixed

- add missing getDefaultShipCount import, gridSize test prop, and fix useEffect deps
- pass shipCount/gridSize directly in start event to bypass race condition
- track gridSize/shipCount in local state to fix stale room race
- sync lobby options to gameOptions before starting game
- ensure shipCount reaches engine via gameOptions
- use deterministic autoplacement for many ships
- restore expanded SHIPS array and correct defaults
- improve autoplacement reliability and sort ships big-to-small
- sync frontend SHIPS array with backend and pass shipCount in team mode
- pass gridSize to frontend placement helpers
- fix ship placement for larger grids and add host-configurable ship count

## [1.23.80] - 2026-07-23

### Fixed

- sanitize user-provided values in MongoDB queries to prevent NoSQL injection
- replace Math.random() with crypto.randomInt() for CodeQL compliance
- allow E2E+production in CI environments
- harden backend security after comprehensive audit

## [1.23.79] - 2026-07-23

### Fixed

- target Dependabot PRs to develop branch

## [1.23.78] - 2026-07-22

### Fixed

- filter CI error logs to show only failures
- add timeout prompt to fixPR and checkAndFixCI
- eliminate credential race condition in pushBranch
- improve pushBranch retry, sync verifyChanges, increase installDeps timeout
- rm -rf worktree fallback when git worktree remove fails
- simplify verification to lint+typecheck only, increase timeout to 5min
- increase Bull lock duration to 15min for implementation queue
- remove git checkout --detach from worktree creation
- always setup gh auth before push in worktrees
- use actual PR branch name for CI fix instead of constructing it
- default engine to mimo, fix CI poll, add timeout prompt

### Refactored

- extract stripDisabledRules from games.controller

## [1.23.77] - 2026-07-22

### Added

- audio cues (ARC-879)

### Fixed

- update sound test to use dynamic manifest count
- resolve CI failures and review feedback
- lint warning in ChatMessagePopup

## [1.23.76] - 2026-07-22

### Added

- add display names and avatars to player cards

### Fixed

- reduce Jest workers from 4 to 2 to fix SIGSEGV

### Refactored

- extract GamesCatalogService from controller

## [1.23.75] - 2026-07-21

### Fixed

- resolve periodic re-login by fixing token refresh and session recovery

## [1.23.74] - 2026-07-21

### Added

- persistent stat tracking (ARC-871)

### Fixed

- sanitize user-controlled values in MongoDB queries (CodeQL)
- add PlayerStatsService mock to GamesService spec
- add missing PlayerStats fields to local stats objects
- skip branch deletion, use checkout -B to avoid worktree conflicts

## [1.23.73] - 2026-07-20

### Fixed

- clean up worktrees on failure

## [1.23.72] - 2026-07-20

### Improved

- reduce gpu usage and split oversized backend files

## [1.23.71] - 2026-07-20

### Fixed

- fix tic-tac-toe board rendering issues

## [1.23.70] - 2026-07-20

### Fixed

- report failure when AI engine produces no changes, default to mimo engine

## [1.23.69] - 2026-07-20

### Fixed

- prevent sticky start button from intercepting bot-count clicks
- add bottom padding to LobbyContent to prevent sticky start button overlap on mobile
- make lobby start button sticky on mobile and visible only for host

## [1.23.68] - 2026-07-20

### Added

- chess game translations (ARC-877)

## [1.23.67] - 2026-07-20

### Fixed

- add missing game result modal and rematch invitation to all games

## [1.23.66] - 2026-07-20

### Changed

- Internal improvements and maintenance

## [1.23.65] - 2026-07-20

### Fixed

- use separate row/col bounds in infinity board validator

## [1.23.64] - 2026-07-20

### Added

- CI poll now triggers fix instead of just logging
- AI-powered conflict resolution before push

### Fixed

- fix async return type to Promise<void>
- remove unused failedCheckNames variable
- make checkCIStatus async for await calls

## [1.23.63] - 2026-07-20

### Added

- ai difficulty levels (ARC-880)

### Fixed

- resolve CI failures and review feedback

## [1.23.62] - 2026-07-20

### Added

- add conflict resolution before push and .mimocode to gitignore

### Fixed

- only verify on /fix, not /implement

## [1.23.61] - 2026-07-20

### Added

- add CI fix max attempts guard, CI polling, and rate limiting

## [1.23.60] - 2026-07-20

### Added

- run lint/typecheck/build verification before push
- chain auto-continue up to 3 retries
- auto-continue after 3 min timeout
- continue/retry/cancel buttons on failed jobs
- add retry button on failed jobs
- add descriptive failure notifications to Telegram
- worker no longer pushes — commits locally, processor handles push + PR creation
- add /fix command for CI failures + review feedback
- full autonomous CI fix loop with TG notifications
- auto-check and fix CI failures after PR creation
- add --req flag for specifying task requirements
- add Redis pub/sub notifications for task completion

### Fixed

- pass issue data directly in addJob to prevent race condition
- add push timeout and gh auth fallback
- re-fetch failed checks when worker starts processing
- accept colon syntax for --engine flag
- force HTTPS remote for worktree push
- skip failure notifications for already-processed jobs
- increase AI timeout to 900s and commit partial changes on timeout
- prevent mimo from loading skills and exploring during fix tasks
- fetch actual CI error output and add backend verification to fix prompts
- per-target locking with concurrency 5
- set worker concurrency to 1
- robust timeout + hooks disable in all methods
- keep worktree on failure for auto-continue
- disable git hooks in worktrees via core.hooksPath
- set HUSKY=0 to prevent pre-commit hooks in AI spawns
- forbid AI from running git commit
- sanitize notification messages for Telegram
- use correct type-check command in AI prompts
- install deps in worktree so pre-commit hooks work and AI can fix real issues
- set HUSKY=0 in spawn env instead of deleting .husky
- remove .husky from worktrees — AI ignores 'do not commit' prompt
- checkout remote branch in worktree — avoids stale local branch state
- detach HEAD before creating worktree — prevents branch-in-use error
- tell AI not to commit/push — processor handles git ops
- skip pre-commit hooks in worktrees — no node_modules available
- regenerate pnpm lockfile to match overrides config
- resolve CodeQL warnings — unused vars and useless assignments
- use opencode for CI fixes to avoid git permission issues
- focus fixPR prompt on local commands instead of fetching CI logs
- register commands with Telegram Bot API for autocomplete menu
- clean workdir before branch checkout to prevent dirty state errors
- remove duplicate handleFix code
- queue /fix jobs to Bull worker instead of running in API
- limit jest workers to prevent SIGSEGV crashes
- use mimo for CI auto-fix and update roadmap statuses
- use gh pr checks state field instead of conclusion
- make bot.start() non-blocking to unblock HTTP server
- fix TypeScript errors in implementLocally
- create PR from main instance when worker can't
- instruct AI to handle pre-commit failures and create PR
- use opencode/mimo-v2.5-free model for AI implementation
- enhance AI prompt with context when requirements are TBD
- always show implementation details in Telegram notification
- use execFileSync for gh CLI and truncate long Telegram messages

### Refactored

- worktree isolation, permission separation, unified job types

## [1.23.59] - 2026-07-20

### Added

- add checkers engine with bot AI, web widget, and full i18n

### Fixed

- resolve CI failures and review feedback
- resolve CI failures and review feedback
- use valid borderRadius value in CheckersBoard
- use valid ARIA role in CheckersBoard
- resolve all build and lint errors including i18n types
- resolve all build and lint errors

## [1.23.58] - 2026-07-15

### Added

- add review queue for automated PR code review after implementation

### Fixed

- remove unused execSync import in review processor

## [1.23.57] - 2026-07-15

### Fixed

- remove fragile nav-not-visible check from language-switching test
- rewrite language-switching test to use stable nav-games testid
- handle mobile nav in language-switching test selectors
- scope language-switching test to main navigation nav element
- scope language-switching test assertions to nav element
- remove Main navigation scope from language-switching e2e test
- resolve e2e test failures, console errors, and Lighthouse issues
- add type declaration for compression module
- remove invalid color prop from Tamagui styled components
- improve accessibility contrast and performance
- fix validateRoomId type to accept undefined

## [1.23.56] - 2026-07-15

### Added

- add Redis queue system for concurrent task bot implementations

### Fixed

- add missing backslash escaping in task-bot github service

## [1.23.55] - 2026-07-14

### Added

- redesign OG images with richer visuals for social unfurls

## [1.23.54] - 2026-07-14

### Added

- unified quickplay flow across all game landing pages

### Fixed

- update e2e test for landing page redirect, fix CodeQL security alerts
- remove duplicate version keys in package.json files
- remove 'use client' from critical/glimworm landing views to fix hydration mismatch
- fix tic-tac-toe lobby icon clipping and add player symbols

## [1.23.53] - 2026-07-14

### Added

- unified quickplay flow across all game landing pages
- shared QuickplayButton and QuickplayCta components
- ctaQuickplay i18n labels for Tic-Tac-Toe, Cascade, Chess
- attractive Play vs AI button with gradient and glow
- add backend and fullstack skills
- add comprehensive UI/UX design skills

### Fixed

- tic-tac-toe lobby icon clipping and float animation
- backend quickplay restriction (was sea-battle-only)
- add explicit ObjectId validation for room queries
- escape backslashes in shell commands

## [1.22.38] - 2026-07-14

### Added

- add game category grouping across UI surfaces

### Fixed

- fix TypeScript build error in getOrCreateProgress
- replace findOne with find+filter for tainted Mongoose queries
- use sanitized variables in Mongoose queries for CodeQL
- add service-level input validation for Mongoose queries
- add input validation for Mongoose query parameters

## [1.22.37] - 2026-07-14

### Fixed

- ships remaining shows correct count based on game shipCount
- ship placement moves persist until confirm, no revert on next move

## [1.22.36] - 2026-07-14

### Fixed

- daily changelog poster runs on schedule only, not on push

## [1.22.35] - 2026-07-14

### Added

- batch placement and grid-based fleet count

### Fixed

- suppress compression() lint error in main.ts

## [1.22.34] - 2026-07-04

### Fixed

- clear httpOnly cookies on logout from header and settings (N/A)
- modernize private room and password form UI (N/A)

## [1.22.33] - 2026-07-04

### Added

- show emotes and messages as floating bubbles in game room (N/A)

### Fixed

- cast emoteId to EmoteId type in GameWidgetContainer (N/A)

## [1.22.32] - 2026-07-04

### Added

- add bulk user delete with select all on page (N/A)

### Fixed

- handle unknown user roles in RoleBadge fallback (N/A)
- call backend /auth/logout to clear httpOnly cookies on signout (N/A)
- prevent session loss on page refresh by removing race condition (N/A)

## [1.22.31] - 2026-07-03

### Fixed

- enable music from header nav without in-game toggle (N/A)

## [1.22.30] - 2026-07-03

### Added

- bots use sonar/radar when enabled in game state (N/A)
- improve sonar/radar UX with board hover preview (N/A)
- add missing sea battle rules and rule descriptions to game catalog (N/A)

### Fixed

- audio player repeat one and lint issues (N/A)
- weapon preview works on any opponent board (N/A)
- cache lastSonar/lastRadar in ref so highlights persist across state updates (N/A)
- sonar 3×3, radar shows all cells, highlights persist (N/A)
- show all scanned cells, ship cells stand out from empty (N/A)
- match sonar preview to backend radius, filter radar to ship cells only (N/A)
- remove border shorthand/non-shorthand mixing in weapon buttons (N/A)
- pass row/col to sonar handler, add radar row/col toggle (N/A)
- pass weaponMode prop through AttackBoard to opponent boards (N/A)
- fix sonar/radar not firing, remove bomb animation in weapon mode (N/A)
- show all rules in lobby, disabled + Coming Soon when excluded (N/A)
- default unmentioned rules to enabled, hide excluded rules (N/A)
- use i18n key for Coming Soon badge text (N/A)
- enforce rule visibility in lobby UI and updateRoomOptions (N/A)
- enforce game rule visibility in createRoom (N/A)
- add CSRF header to server actions and fix game rules response (N/A)

## [1.22.29] - 2026-07-03

### Fixed

- play next track when previous ends (wasPlaying was false after ended) (N/A)
- show music icon in mobile menu by using navItem.icon fallback (N/A)
- remove crossOrigin and use removeAttribute(src) to clear old audio (N/A)
- add audio error logging for CDN debugging (N/A)
- restore crossOrigin on audio elements — CDN supports CORS (N/A)
- load full music catalog in dev mode instead of 10-track fallback (N/A)
- remove crossOrigin from audio elements to fix CDN CORS error (N/A)
- make refreshToken optional in refresh DTO to allow cookie-based refresh (N/A)
- use store refreshTokens in checkSession instead of refreshSessionFromCookie (N/A)
- clear session when refresh token is missing instead of sending empty string (N/A)
- use store refreshTokens with proper guards on rehydration (N/A)
- change Cross-Origin-Resource-Policy to cross-origin for CDN audio (N/A)
- persist refresh token and restore session on page reload (N/A)

## [1.22.28] - 2026-07-03

### Added

- add undo/take-back and password-protected rooms (N/A)
- add CreationConfig for TicTacToe and Cascade (N/A)
- add i18n for emote labels (N/A)
- add server-side emote rate limiting (N/A)
- add streaks and favorite game to local stats (N/A)

### Fixed

- skip finally URL cleanup on successful OAuth redirect (N/A)
- use router.replace after OAuth to avoid hard page reload (N/A)
- restore hard navigation after OAuth, session survives via cookies (N/A)
- use soft navigation after OAuth instead of hard page reload (N/A)
- recover session from cookies in SessionRoleSync (N/A)
- use lax sameSite on HTTP to prevent cookie rejection (N/A)
- fix session persistence and e2e stats test (N/A)
- move getAttribute outside toPass to avoid 15s retry timeout (N/A)
- fix stats e2e test by removing catch-all route that bypassed stats mock (N/A)
- sync pnpm-lock.yaml with be/package.json (N/A)
- clean up old audio element during paused crossfade to fix next/prev track detection (N/A)
- update GameMusic tests for no-auto-play behavior (N/A)
- prevent music auto-playing on page load/refresh (N/A)
- wire undo to actually revert game state on acceptance (N/A)

## [1.22.27] - 2026-07-02

### Added

- add game rules visibility control for lobby settings (N/A)

### Fixed

- fix GameRuleVisibilityModule DI and unit test mocks (N/A)

## [1.22.26] - 2026-07-02

### Added

- update friends page UI/UX and move to profile menu (N/A)

## [1.22.25] - 2026-07-02

### Added

- add backend health monitoring with Telegram and Discord alerts (N/A)

### Fixed

- handle missing changelog file in daily workflow (N/A)
- add LinkedIn and Facebook chunking for long messages (N/A)
- add Facebook chunking, version in Threads header, footer in Discord continued (N/A)
- add stay tuned footer to daily messages (N/A)
- remove arcadeum.games link from daily messages (N/A)
- improve social bot messages across all platforms (N/A)
- rework social media bot messages (N/A)

## [1.22.24] - 2026-07-02

### Added

- add Siamese, Persian, and Bengal cyber cat avatars (N/A)

## [1.22.23] - 2026-07-02

### Fixed

- add X-Requested-With header to server action fetch calls (N/A)
- remove unused ShipOp interface (N/A)
- fix Logger type mismatch in sea-battle gateway (N/A)
- add JwtModule imports to ChatModule and GamesModule (N/A)
- reorder AuthModule before ChatModule in AppModule imports (N/A)
- add CSRF guard, anonymous ID verification, remove tokens from localStorage (N/A)
- migrate JWTs to httpOnly cookies (N/A)
- add JWT verification to WebSocket gateways and enable Helmet CSP (N/A)
- patch critical vulnerabilities found during security audit (N/A)
- override vulnerable deps react-server-dom-webpack and shell-quote (N/A)

### Documentation

- add comprehensive security audit skills from Anthropic-Cybersecurity-Skills (N/A)
- clarify socket encryption key naming and document security posture (N/A)
- add cybersecurity audit skills from Anthropic-Cybersecurity-Skills (N/A)

## [1.22.22] - 2026-07-02

### Added

- make sonar radius-based instead of full board (ARC-1)
- add sonar/radar result visualization in sea battle (ARC-1)
- implement sonar and radar special weapons in sea battle (ARC-1)
- add optimistic updates for house rules checkboxes in lobby (ARC-1)
- add Auto reset button to max players stepper (ARC-1)
- add idle timer, spectators, and action card combos toggles to lobbies (ARC-1)
- add house rules UI panels for Sea Battle, Tic-Tac-Toe, and Cascade (ARC-1)
- add per-game config schemas and validation for Sea Battle, Tic-Tac-Toe, and Cascade (ARC-1)

### Fixed

- skip CDN music fetch in dev to avoid CORS 404 in e2e tests (N/A)
- fix lint errors and extract types to stay under 500 lines (ARC-1)
- refresh room data after updating house rules in lobby (ARC-1)
- replace Switch with native checkboxes for house rules in lobby (ARC-1)
- update e2e test to use Auto reset button (ARC-1)
- simplify e2e test — skip variant dropdown, test game flow (ARC-1)
- fix e2e test to use dropdown variant selector and avoid networkidle (ARC-1)
- update e2e test to select variant in lobby instead of create page (ARC-1)
- extract drag helpers to fix file length, add missing i18n keys (ARC-1)

### Refactored

- replace HTTP lobby config updates with socket-based sync (ARC-1)
- move theme/variant selection from create page to lobby (ARC-1)
- remove House Rules from create page, all config in lobby (ARC-1)
- move game config from create page to lobby (ARC-1)

## [1.22.21] - 2026-07-01

### Added

- fix emote encryption and expand emote system (N/A)

### Fixed

- correct isLandscape on mount to fix webkit layout (N/A)
- correct isLandscape on mount to fix webkit layout (N/A)
- compute isLandscape synchronously from window to fix SSR hydration (N/A)
- use synchronous isMobilePortrait check for cols floor (N/A)
- add containerWidth=0 floor for landscape multi-player grids (N/A)
- default to 2 cols when containerWidth is 0 in media.short branch (N/A)
- wait for ResizeObserver before asserting grid layout in sea-battle-6-players test (N/A)
- handle invalid ARCADEUM_MINT_ADDRESS gracefully (N/A)

## [1.22.20] - 2026-07-01

### Added

- in-game emotes & quick reactions (ARC-872) (ARC-872)

### Fixed

- use domcontentloaded in E2E page.reload() to prevent ChunkLoadError flake (ARC-872)

## [1.22.19] - 2026-07-01

### Added

- add persistent account-less stat tracking (ARC-871)

### Fixed

- compute local stats with useMemo to prevent re-render loop (ARC-871)

### Documentation

- add implement-roadmap-feature skill (N/A)

## [1.22.18] - 2026-07-01

### Documentation

- add ARC ticket references for all features (N/A)

## [1.22.17] - 2026-06-30

### Added

- double-click on playlist track to play (N/A)
- update music player to use 160-track R2 catalog (N/A)

### Fixed

- remove row click-to-play from playlist tracks (N/A)
- checkbox toggle should not affect current playback (N/A)
- suppress auto-play when disabling currently playing track (N/A)
- disable currently playing track when unchecked in playlist (N/A)
- widen mini mode music player to prevent button overflow (N/A)

## [1.22.16] - 2026-06-30

### Added

- improve token chart, wallet balance, and home page (N/A)

## [1.22.15] - 2026-06-30

### Fixed

- use numeric borderRadius instead of $full token in roadmap page (N/A)

### Refactored

- split roadmap page data into roadmap-data.ts to stay under 500 lines (N/A)

### Documentation

- add platform expansion roadmap (N/A)

## [1.22.14] - 2026-06-30

### Added

- add remove friend confirmation dialog (N/A)
- add invite to game button on friends page (N/A)
- add friends SEO metadata for all locales (N/A)
- add friends link to navigation (N/A)
- add friends i18n for all locales (N/A)
- add friends page with real-time updates (N/A)
- add friends i18n keys (N/A)
- add friends socket to shared infrastructure (N/A)
- add friends API client (N/A)
- wire gateway events into FriendsService (N/A)

### Fixed

- resolve FriendsGateway circular dependency and missing JwtModule (N/A)
- resolve CI failures across lint, tests, and e2e (N/A)
- fix build errors in friends page (N/A)
- use useSessionTokens instead of nonexistent useSession (N/A)

## [1.22.13] - 2026-06-30

### Added

- add contact page scenario (N/A)
- add 30 scenario journeys (one per day) (N/A)

### Fixed

- remove glimworm scenario (N/A)
- wait for page content to render before recording (N/A)

## [1.22.12] - 2026-06-29

### Added

- video generator + Postiz YouTube publisher (N/A)

### Fixed

- remove non-existent CDN music tracks (N/A)

## [1.22.11] - 2026-06-29

### Added

- add configurable signup reward for coins and gems (N/A)

## [1.22.10] - 2026-06-29

### Added

- add bulk rewards for all registered users (ARC-870)

## [1.22.9] - 2026-06-28

### Added

- add native tooltips to all player buttons (N/A)
- per-track gradient backgrounds and smooth progress bar (N/A)
- add error/loading states for track fetch and playback (N/A)
- show track duration in playlist (N/A)
- add crossfade between tracks (N/A)
- allow dragging player from any empty space with grab cursor (N/A)
- add play button and double-click to play tracks in playlist (N/A)
- stronger liquid glass with more transparency and white highlights (N/A)
- Apple liquid glass effect with transparent white gradient (N/A)
- liquid glass effect with see-through transparency (N/A)
- increase blur to 60px and reduce opacity to 0.35 for deeper glass effect (N/A)
- liquid glass effect with stronger blur and transparency (N/A)
- add volume percentage display and narrow volume slider (N/A)
- add close button to music player that stops playback (N/A)
- replace Token nav link with Music toggle button (N/A)
- make music player global across all pages (N/A)
- premium audio player UI with larger buttons (N/A)
- add drag-and-drop reordering for music playlist (N/A)
- persist music playlist track toggles in localStorage (N/A)
- add mobile-friendly music player styles (N/A)
- load music tracks from CDN json and add media-src CSP (N/A)
- integrate transport controls, playlist, draggable and polished styles into music player (N/A)
- move music to cloudflare r2 and add dynamic track loading (N/A)
- keep 2 fallback tracks in repo, load rest from R2 CDN (ARC-840)
- add transport controls, playlist, and draggable hook (ARC-840)
- add i18n keys for shuffle, repeat, playlist, minimize, maximize (ARC-840)
- add polished music player CSS with animations and transitions (ARC-840)
- add playlist, minimize, maximize icons and canvas equalizer (ARC-840)
- extract music player types and utilities into GameMusicUtils (ARC-840)
- add shuffle and repeat icons to MediaIcons (ARC-840)

### Fixed

- remove duplicate declarations in useAudioPlayer and fix mobile nav href (N/A)
- remove leftover seekOnReorderRef from crossfade (N/A)
- fix isPlaying flicker and playlist click-to-play (N/A)
- add stop to mini mode and gap before expand button (N/A)
- use double-chevron icons for skip ±10s (N/A)
- restore big play button and add transport to mini mode (N/A)
- use small button variant for primary transport row (N/A)
- restructure transport controls layout and fix skip icons (N/A)
- prevent track restart when toggling shuffle or repeat (N/A)
- resume playback from paused position instead of beginning (N/A)
- resume playback when clicking play on already-selected paused track (N/A)
- increase equalizer and playing bars contrast for glass background (N/A)
- show grabbing cursor on entire player while dragging (N/A)
- prevent track restart when toggling enabled tracks (N/A)
- improve text contrast and visibility in glass player (N/A)
- set mobile player width to 320px (N/A)
- left-align volume icon (N/A)
- match volume and progress bar widths with aligned icon (N/A)
- right-align volume percentage (N/A)
- align volume percentage with track time labels (N/A)
- adjust volume slider horizontal padding to 6px (N/A)
- move volume percentage to right side of slider (N/A)
- make progress bar narrower than volume slider (N/A)
- shrink buttons to 28px/34px and reduce gap to 4px (N/A)
- resize buttons to 32px/38px to fit inside player (N/A)
- replace IconButton with plain buttons for correct sizing (N/A)
- remove size prop from IconButton to let CSS control button dimensions (N/A)
- force button sizes with CSS !important to override Tamagui variants (N/A)
- force button sizes via inline styles and increase control gap (N/A)
- increase music player button sizes (N/A)
- add margin under transport controls (N/A)
- add more bottom padding to music player (N/A)
- increase gap between transport buttons to 8px (N/A)
- increase spacing between music player controls (N/A)
- improve mobile touch drag for playlist songs (N/A)
- add TouchSensor for mobile drag-and-drop in playlist (N/A)
- use label as key in mobile menu to avoid duplicate keys (N/A)
- auto-advance to next track when song ends (N/A)
- add CDN URL to connect-src CSP for tracks.json fetch (N/A)
- auto-advance to next track when song ends (N/A)

### Improved

- reuse Audio element across track changes (N/A)

### Refactored

- extract TransportRow reusable component (N/A)
- extract useAudioPlayer hook, add skip ±10s, mini track name, keyboard shortcuts (N/A)

## [1.22.8] - 2026-06-28

### Refactored

- extract shared integration test helpers (N/A)

## [1.22.7] - 2026-06-27

### Added

- add admin ability to block, remove, restore users (ARC-842)
- add admin ability to block, remove, restore users (ARC-842)

## [1.22.6] - 2026-06-27

### Fixed

- room join/watch button visibility based on lobby status and participation (N/A)

## [1.22.5] - 2026-06-27

### Fixed

- add custom 404 page with navigation (N/A)

## [1.22.4] - 2026-06-26

## [1.22.3] - 2026-06-26

## [1.22.2] - 2026-06-26

## [1.22.1] - 2026-06-25

### Fixed

- rename middleware to proxy and remove duplicate mongoose index (N/A)

## [1.22.0] - 2026-06-25

## [1.21.15] - 2026-06-25

### Added

- add FilterChip component, use it in games status filter (ARC-838) (ARC-838)
- games list multi-select status filter with visible borders (ARC-838) (ARC-838)

### Fixed

- update games list filter selector for FilterChip component (ARC-838) (ARC-838)
- deselect chip when clicking from all-selected state (ARC-838) (ARC-838)
- highlight all chips when All filter is selected (ARC-838) (ARC-838)
- increase FilterChip size and font (ARC-838) (ARC-838)

### Refactored

- use shared STATUS_VALUES/ALL_STATUS_VALUES constants, remove magic numbers (ARC-838) (ARC-838)
- extract status toggle into handleStatusToggle callback (ARC-838) (ARC-838)

## [1.21.14] - 2026-06-25

### Fixed

- normalize VideoObject uploadDate to include time zone (N/A)

## [1.21.13] - 2026-06-25

### Fixed

- improve tic tac toe turn badge visibility and name display (ARC-839) (ARC-839)

### Refactored

- extract shared resolveDisplayName utility (ARC-839) (ARC-839)

## [1.21.12] - 2026-06-25

### Fixed

- remove border override from isActive variant (ARC-836)
- remove custom active border, use chip variant default (ARC-836)
- add visible border to active filter chips (ARC-836)
- increase participation filter hint font size from $1 to $2 (ARC-836)
- update participation filter login hint to say filter rooms (ARC-836)

## [1.21.11] - 2026-06-24

## [1.21.10] - 2026-06-24

### Added

- reorganize in-game music into public/music with unique track names (N/A)

## [1.21.9] - 2026-06-24

### Added

- add cyber lion/shark avatars, premium name colors, banners, auras, and frames (N/A)

### Fixed

- split shop-catalog.ts to stay under 500-line lint limit (N/A)

## [1.21.8] - 2026-06-24

### Fixed

- improve sea battle game theme contrast and preview board (ARC-832)

## [1.21.7] - 2026-06-23

### Fixed

- enable touch drag and tap-to-move for ship placement on mobile (ARC-831) (ARC-831)

## [1.21.6] - 2026-06-23

### Added

- add classic, neon, tropical, steampunk themes to cascade (ARC-833)

## [1.21.5] - 2026-06-23

### Fixed

- visually differentiate completed rooms from active ones (ARC-834) (ARC-834)

## [1.21.4] - 2026-06-23

### Fixed

- prevent false connection lost overlay on room enter (ARC-830) (ARC-830)
- prevent false connection lost overlay on room enter (ARC-830) (ARC-830)

### Refactored

- merge two useEffects into one in useIdleReconnect (N/A)

## [1.21.3] - 2026-06-22

### Fixed

- update pnpm-lock.yaml after removing @nestjs/schedule (N/A)
- improve buy/sell detection with phase2 token balance fallback (N/A)
- improve buy/sell detection, add retry logic and health check (N/A)

## [1.21.2] - 2026-06-22

### Added

- add token price chart with GeckoTerminal API and i18n (N/A)
- redesign token page with premium UI/UX (N/A)
- add wallet-based shop purchase endpoint (N/A)
- add admin controls for shop currencies (N/A)
- add ARC as shop currency and new wallet reasons (N/A)

### Fixed

- move connect wallet to spend section and add i18n translations (N/A)
- replace gameplay rewards with wallet connection in token page (N/A)
- update token page to show real ways to earn ARC (N/A)
- type-assert res.body in solana controller spec (N/A)
- mock @solana/web3.js in shop controller spec (N/A)
- update tests for withdrawal removal and ARC shop support (N/A)
- add arcadeum to admin shop override type (N/A)

### Refactored

- split chart into helpers, styles, and component files (N/A)
- add utility token disclaimers to wallet and token pages (N/A)
- add shop disclaimer and remove Jupiter exchange link (N/A)
- update SEO descriptions to remove withdrawal references (N/A)
- update i18n messages to remove withdrawal references (N/A)
- remove withdrawal UI from wallet page (N/A)
- remove withdrawal endpoint and transfer methods (N/A)

## [1.21.1] - 2026-06-21

### Added

- add PumpFun transaction monitor Telegram bot (N/A)

### Fixed

- remove unused accounts variable (N/A)
- detect trades without PumpFun program in accounts (N/A)
- add eslint config and fix lint errors (N/A)

## [1.21.0] - 2026-06-20

## [1.20.5] - 2026-06-20

### Added

- add token page, home section, header nav link, and pump.fun link (N/A)
- add Arcadeum filter to wallet history and fix filter scroll (N/A)
- display real token image, name and ticker from pump.fun (N/A)

### Fixed

- add missing useState import in TokenInfo (N/A)
- fix mobile language pill click by scrolling container (N/A)
- update e2e tests for wallet filter anchors and mobile language scroll (N/A)
- add wallet icon to token link in mobile menu (N/A)

## [1.20.4] - 2026-06-19

## [1.20.3] - 2026-06-19

### Added

- add ARCADEUM GAMES token info section with ARC ticker (N/A)
- complete Solana withdraw feature with security hardening (N/A)
- add admin buy-back endpoint for token purchases (N/A)
- add Withdraw to Wallet page with Phantom integration (N/A)
- add cryptocurrency disclaimer to Terms of Service (N/A)
- add Solana module with SPL token transfer and withdrawal (N/A)
- add arcadeum currency to wallet system (N/A)

### Fixed

- rewrite withdraw e2e tests for server-side auth (N/A)
- fix lint errors in withdraw e2e test (N/A)
- use individual expect assertions to avoid any lint errors (N/A)
- fix lint error with toMatchObject and asymmetric matchers (N/A)
- fix lint error in solana controller spec (N/A)
- fix lint errors in solana test files (N/A)
- make ARCADEUM_MINT_ADDRESS and SOLANA_PRIVATE_KEY optional (N/A)
- fix useTranslation API usage and DeepPartial types (N/A)
- remove locale arg from useTranslation calls (N/A)
- patch @tamagui/web config.mjs to auto-init tokensMerged from global config (N/A)
- resolve CI build and test failures (N/A)
- broaden uuid ESM transform pattern for pnpm nested paths (N/A)
- transform uuid ESM in e2e test config (N/A)
- add missing User model to SolanaModule imports (N/A)

### Refactored

- extract TokenInfo inline styles to CSS module (N/A)

### Documentation

- add ARCADEUM_MINT_ADDRESS to web .env.example (N/A)
- add Solana environment variable documentation (N/A)
- add Solana token ecosystem final report (N/A)

## [1.20.2] - 2026-06-19

### Fixed

- use addToQueue for Facebook manual publish (N/A)
- use shareNow for Facebook immediate publish (N/A)
- use addToQueue for Facebook to bypass identity check (N/A)
- pass Facebook post type via metadata instead of top-level field (N/A)
- add Facebook post type and fix error detection in Buffer API (N/A)
- use correct Buffer enum values (shareNow, assets: []) (N/A)
- use correct Buffer GraphQL types (ChannelId, schedulingType: now) (N/A)
- hardcode mode enum in query, remove random sleep (N/A)
- remove invalid ShareMode enum value from Buffer GraphQL mutation (N/A)
- use GraphQL variables for Buffer API in release poster too (N/A)
- use GraphQL variables for Buffer API to fix string escaping (N/A)

## [1.20.1] - 2026-06-19

### Fixed

- use CHANGELOG.md content for release social posts instead of merge commits (N/A)

## [1.20.0] - 2026-06-19

## [1.19.3] - 2026-06-19

### Fixed

- use domcontentloaded instead of load for Mobile Safari reliability (N/A)

## [1.19.2] - 2026-06-18

### Fixed

- add minHeight 400 on mobile for shop hero card (N/A)
- improve shop hero card mobile layout and buy button styling (N/A)
- restore min-height on page-layout-base to fix chat e2e test (N/A)
- prevent shop YStack from collapsing to 0 height on mobile (N/A)
- match body min-height to layout shell using 100dvh instead of 100vh (N/A)
- revert overflow auto on main — breaks chat page layout (N/A)
- keep footer at bottom of page with overflow auto on main (N/A)

## [1.19.1] - 2026-06-18

### Added

- add LinkedIn channel to Buffer social posting (N/A)

### Fixed

- migrate Buffer integration from deprecated REST API to GraphQL API (N/A)
- validate Buffer token before posting to avoid OIDC 401 errors (N/A)
- add MongoDB service container to release workflow (N/A)
- override CI to falsy so Playwright uses dev mode for BE (N/A)

## [1.19.0] - 2026-06-17

## [1.18.2] - 2026-06-17

### Added

- add Telegram group posting to social workflows (N/A)

### Fixed

- fix Buffer social posts and release E2E tests (N/A)

## [1.18.1] - 2026-06-17

### Fixed

- use double curly braces for appName interpolation in HomeHero (N/A)

## [1.18.0] - 2026-06-17

## [1.17.10] - 2026-06-17

### Fixed

- show play badge only on hero card hover (N/A)

## [1.17.9] - 2026-06-17

### Fixed

- make entire hero card clickable, play label is just a badge (N/A)
- remove hoveredIndex recalc on pointerup so click reaches play button (N/A)
- freeze hero card hover during click to prevent play button disappearing (N/A)
- hero card hover overlap race condition (N/A)
- prevent hero card overlap blocking play button on hover (N/A)

## [1.17.8] - 2026-06-17

### Fixed

- resolve hydration mismatch in layout caused by Turbopack streaming SSR (N/A)

### Improved

- defer non-critical hydration work to reduce main-thread contention (N/A)

## [1.17.7] - 2026-06-17

### Improved

- optimize LCP by splitting hero to server component and deferring notification init (N/A)

## [1.17.6] - 2026-06-16

### Fixed

- fix cascade lobby double-click start and hydration mismatch (N/A)

## [1.17.5] - 2026-06-16

### Fixed

- scroll mobile nav to bottom before clicking language pill (N/A)
- use force click for mobile language pill in fixed scroll container (N/A)
- fix social media workflow bugs and e2e test (N/A)

### Improved

- improve homepage Web Vitals by fixing image priority and reducing assets (N/A)

## [1.17.4] - 2026-06-16

### Fixed

- sticky footer on mobile and hide during gameplay (N/A)
- fix game result modal positioning and sizing on mobile (N/A)

## [1.17.3] - 2026-06-16

### Fixed

- cascade game fixes — styles, padding, fullscreen, tests, i18n (N/A)

## [1.17.2] - 2026-06-16

### Fixed

- wrap children in Suspense to prevent async cleanup error (N/A)

## [1.17.1] - 2026-06-16

### Fixed

- always show copied feedback after clipboard attempt (N/A)
- add clipboard fallback for referral copy button in e2e (N/A)
- remove dead CSS, fabricated aggregateRating, and redundant !important (N/A)
- security, a11y, CSS, and code quality optimizations (N/A)
- improve SEO, accessibility, and performance across 20 issues (N/A)
- add build step to release workflow before e2e tests (N/A)
- improve SEO metadata and AI search readiness (N/A)

### Refactored

- migrate @/shared/ui barrel imports to @arcadeum/ui (N/A)

## [1.17.0] - 2026-06-15

## [1.16.15] - 2026-06-15

### Fixed

- remove 180deg rotation on notifications bell hover (N/A)

### Documentation

- clarify PRs must target develop branch (N/A)
- add rule to pull develop before opening PR (N/A)

## [1.16.14] - 2026-06-15

### Fixed

- propagate actual validation error messages from game engines (N/A)
- update cascade bot race-error detection and tighten reflex delays (N/A)
- enforce first-click-wins for cascade call race condition (N/A)

## [1.16.13] - 2026-06-15

### Fixed

- comprehensive SEO audit fixes across 26 files (N/A)

## [1.16.12] - 2026-06-15

### Added

- add rate limiting, helmet, IP blocking, and security hardening (N/A)

## [1.16.11] - 2026-06-15

### Added

- replace basic SEO with Agentic SEO Skill v3.0.1 (N/A)
- add SEO, a11y, and performance Claude skills (N/A)

## [1.16.10] - 2026-06-15

### Added

- add social media auto-posting for daily changelogs and releases (N/A)

### Fixed

- randomize daily post time within 2-hour window (N/A)
- add pip install requests, expand emoji map, pin develop branch for daily fetch (N/A)

## [1.16.9] - 2026-06-15

### Added

- configurable max total players + fix team panel scroll (N/A)
- add explicit og:image and twitter:image to all game landing pages (N/A)
- add tap-to-move for placed ships on mobile (N/A)

### Fixed

- move team panel into optionsSlot so it scrolls with lobby (N/A)
- remove all CSS overrides, use plain flex layout for team lobby (N/A)
- team panel and lobby scroll together as one unit (N/A)
- remove fragile CSS override for team lobby scroll (N/A)
- only override overflow-y on LobbyContent, not flex/minHeight (N/A)
- use flex:undefined instead of flex:0 on lobby wrapper (N/A)
- cap team size stepper by remaining slots across all teams (N/A)
- add missing i18n key and backend maxTotalPlayers validation (N/A)
- always use flex:1 on lobby wrapper to prevent collapse when team panel is shown (N/A)
- raise GameResultModal and shared modal z-index above fullscreen container (N/A)

### Refactored

- remove redundant max players stepper from lobby (N/A)

## [1.16.8] - 2026-06-14

### Added

- add tiktok and linkedin social links to footer and support page (N/A)

## [1.16.7] - 2026-06-14

### Fixed

- refactor modals to render inline within widget and fix insight card routing (N/A)
- improve modals, mobile UX, fullscreen, defaults (N/A)

## [1.16.6] - 2026-06-14

### Fixed

- rewrite sea battle bot-count test to use mock response instead of event recording (N/A)
- use force click in sea battle e2e tests to bypass pointer event interception (N/A)
- reduce fullscreen padding on mobile screens (ARC-779) (ARC-779)
- make games control panel wrap on mobile instead of horizontal scroll (ARC-779) (ARC-779)
- prevent horizontal scroll in game lobbies on mobile (ARC-779) (ARC-779)
- remove overflow hidden from GameContainer to unclip header badge (ARC-779) (ARC-779)
- prevent horizontal scroll in game lobbies and fix webkit e2e test (ARC-779) (ARC-779)
- update PWA manifest for Android TV compatibility (N/A)
- add breakpoint constants to games/create CSS (N/A)
- improve games/create mobile UX (N/A)

### Refactored

- convert all CSS to SCSS with breakpoint mixins (N/A)

## [1.16.5] - 2026-06-13

### Added

- add daily challenges, achievements, and sea battle variants (N/A)

## [1.16.4] - 2026-06-13

### Added

- add additional premium shop items and fix E2E tests (N/A)

## [1.16.3] - 2026-06-13

### Added

- wire TicTacToe chat send via shared useGameChatSend hook (N/A)
- add shared TurnIndicator + turn contract to GameWidgetContainer (N/A)

### Fixed

- wire Cascade chat and add generic history_note handler (N/A)
- avoid double chat popups in Critical on the shared shell (N/A)

### Refactored

- add standardized gameResult to session state (N/A)
- extract shared hooks and utilities from game widgets (N/A)
- render Glimworm inside the shared GameWidgetContainer (N/A)
- render CriticalGame inside the shared GameWidgetContainer (N/A)
- adopt shared turn contract in TicTacToe and Cascade headers (N/A)

### Documentation

- add git rules — no force push, no amend (N/A)
- tighten shared game shell spec after review (N/A)
- add shared game shell refactor design (N/A)

## [1.16.2] - 2026-06-13

## [1.16.1] - 2026-05-29

### Added

- add optional aurora card style for Cascade (ARC-760) (ARC-760)
- bring full prototype polish to the Cascade table (ARC-760) (ARC-760)
- rework Cascade cards into on-brand dark-glass faces (ARC-760) (ARC-760)
- modernize the Cascade wild-color picker (ARC-760) (ARC-760)
- modernize the Cascade board for a more playable table (ARC-760) (ARC-760)

### Documentation

- add the Cascade board card-rework handoff (ARC-760) (ARC-760)

## [1.16.0] - 2026-05-29

## [1.15.11] - 2026-05-29

### Added

- wire media keys to the music player (Mac F7/F9, lock screen) (ARC-760) (ARC-760)
- add a transport mini-player to in-game music (ARC-760) (ARC-760)
- show a "Now playing" chip when game music starts (ARC-760) (ARC-760)
- in-game background music with real tracks (ARC-760) (ARC-760)
- in-game background music with real tracks (ARC-760) (ARC-760)

### Fixed

- stack the music player so long titles don't shift controls (ARC-760) (ARC-760)

## [1.15.10] - 2026-05-29

### Added

- pay out tier rewards on claim + add e2e/integration coverage (ARC-759) (ARC-759)

## [1.15.9] - 2026-05-29

### Added

- premium experience pack — celebration, sound/music, VIP identity, battle pass (ARC-758) (ARC-758)

## [1.15.8] - 2026-05-29

### Added

- auto-exit fullscreen after a game finishes (ARC-757) (ARC-757)

### Fixed

- auto-exit the widget-level fullscreen on finish too (ARC-757) (ARC-757)
- trigger fullscreen auto-exit off session status, not room status (ARC-757) (ARC-757)

## [1.15.7] - 2026-05-29

### Added

- show equipped avatars across games + cosmetic-less fallback disc (ARC-755) (ARC-755)
- add equippable avatar background cosmetic category (ARC-755) (ARC-755)
- thread equippedGameSkinId to profile menu, profile page, session (ARC-755) (ARC-755)
- EquippedPlayerAvatar threads skin chip + i18n label (ARC-755) (ARC-755)
- resolve equippedGameSkinId in useEquippedCosmetics (ARC-755) (ARC-755)
- propagate equippedGameSkinId through chat snapshots (ARC-755) (ARC-755)
- wire game_skin to equippedGameSkinId equip slot (ARC-755) (ARC-755)
- equippedGameSkinId on user schema + auth profile (ARC-755) (ARC-755)
- skin chip + topLeftOverlay slot on PlayerAvatar (ARC-755) (ARC-755)
- rays halo layer on PlayerAvatar md+ (ARC-755) (ARC-755)
- add profile size to PlayerAvatar (ARC-755) (ARC-755)

### Fixed

- stack PlayerAvatar badge above the avatar art (ARC-755) (ARC-755)
- localize skin-chip prefix for all PlayerAvatar consumers (ARC-755) (ARC-755)
- sync equipped cosmetics to header + fix critical opponent card height (ARC-755) (ARC-755)
- real-size avatar image, frame-tinted backdrop, spinning rays (ARC-755) (ARC-755)
- center rays halo on avatar disc + restore shop proportions (ARC-755) (ARC-755)

### Refactored

- split PlayerAvatar into modules + i18n the skin chip (ARC-755) (ARC-755)
- route preview through shared PlayerAvatar (ARC-755) (ARC-755)
- extract RaysHalo + symmetric pickSwatchColor + drop useMemo (ARC-755) (ARC-755)

### Documentation

- stories for PlayerAvatar profile size + skin chip (ARC-755) (ARC-755)
- implementation plan for equipped avatar everywhere (ARC-755) (ARC-755)
- design for equipped avatar everywhere (ARC-755) (ARC-755)

## [1.15.6] - 2026-05-27

### Added

- visible rotate icon on placed ships (ARC-754) (ARC-754)
- optimistic move + rotate placed ships (ARC-754) (ARC-754)
- drag placed ships to reposition (ARC-754) (ARC-754)

### Documentation

- address spec review feedback (ARC-754) (ARC-754)
- design for dragging placed ships (ARC-754) (ARC-754)

## [1.15.5] - 2026-05-27

### Refactored

- move Buy Gems above history and anchor Next link (ARC-756) (ARC-756)

## [1.15.4] - 2026-05-27

### Fixed

- wire opponent chat bubbles + Sea Battle popup in widget UI; retire legacy-only e2e tests (ARC-753) (ARC-753)
- anchor autoplay dropdown to its right edge so it stays on-screen (ARC-753) (ARC-753)
- keep MobileHandBar above widget fullscreen layer (ARC-753) (ARC-753)

### Refactored

- drop widget-mode flag, ship the new widget UI everywhere (ARC-753) (ARC-753)

## [1.15.3] - 2026-05-27

### Fixed

- sea battle lobby crash when gameOptions.teams is not an array (ARC-752) (ARC-752)

## [1.15.2] - 2026-05-27

### Added

- cascade Last-Card race (option-toggled, with bot reflex) (ARC-751) (ARC-751)
- per-theme action-card names (Eclipse/Banish/Firewall/Block) (ARC-751) (ARC-751)
- cascade gameplay modes (classic/pure/speed) + e2e flatten fix (ARC-751) (ARC-751)
- cascade i18n translations + play-to-win e2e + mobile parity (ARC-751) (ARC-751)
- cascade hook + board tests, e2e, rephrase to remove UNO refs (ARC-751) (ARC-751)
- cascade landing page + SEO + BE bot spec + Card vitest (ARC-751) (ARC-751)
- add Cascade web widget, registry, and create-page wiring (ARC-751) (ARC-751)
- add Cascade backend engine, service, bot, and gateway (ARC-751) (ARC-751)

### Fixed

- cascade pendingStart used stale initial session, rules modal lacked close (ARC-751) (ARC-751)
- cascade pendingStart reset uses inline reset, not effect setState (ARC-751) (ARC-751)
- cascade start button needed two clicks to register (ARC-751) (ARC-751)
- cascade +2/+4 stacking coverage + pure-mode skip consistency (ARC-751) (ARC-751)

### Documentation

- assign ARC-751 to cascade design spec (ARC-751) (ARC-751
  ARC-751)
- cascade card game design spec (ARC-751) (ARC-751)

## [1.15.1] - 2026-05-26

### Added

- scale tic-tac-toe player cap by board size (ARC-750) (ARC-750)
- polish tic-tac-toe theme previews, rules, and end-game (ARC-750) (ARC-750)
- list tic-tac-toe in admin game-visibility catalog (ARC-750) (ARC-750)
- surface tic-tac-toe in home featured + games/create (ARC-750) (ARC-750)
- tic-tac-toe landing page with hero, themes grid, FAQ, OG image (ARC-750) (ARC-750)
- tic-tac-toe widget assembly (modals, lobby, game entry, registry) (ARC-750) (ARC-750)
- tic-tac-toe widget shell (types, hooks, board, selectors) + i18n (ARC-750) (ARC-750)
- tic-tac-toe socket gateway and module wiring (ARC-750) (ARC-750)
- tic-tac-toe service and bot with minimax/heuristic/random (ARC-750) (ARC-750)
- register TicTacToeEngine in engines module (ARC-750) (ARC-750)
- tic-tac-toe engine with team mode and forfeit (ARC-750) (ARC-750)
- tic-tac-toe utils and validators with specs (ARC-750) (ARC-750)
- tic-tac-toe engine constants and types (ARC-750) (ARC-750)
- add tic-tac-toe with 3×3, 5×5, 7×7, 9×9 boards (ARC-750) (ARC-750)

### Fixed

- mount tic-tac-toe rules modal in-game, not only in lobby (ARC-750) (ARC-750)
- give tic-tac-toe board explicit width so cells render (ARC-750) (ARC-750)
- render tic-tac-toe lobby outside GameWidgetContainer (ARC-750) (ARC-750)
- register tic_tac_toe_v1 in GameType unions so the widget loads (ARC-750) (ARC-750)

### Documentation

- add tic-tac-toe full-game implementation plan (ARC-750) (ARC-750)
- add full-game design for tic-tac-toe (ARC-750) (ARC-750)

## [1.15.0] - 2026-05-25

## [1.14.36] - 2026-05-25

### Added

- implement forgot/reset password flow end-to-end (ARC-748) (ARC-748)

### Fixed

- drop \_rsc-cancel + opaque 'Error' noise from pageerror path too (ARC-748) (ARC-748)
- un-gate chunk-load suppression + drop opaque 'Error' pageerror noise (ARC-748) (ARC-748)
- suppress CI noise on /payment 401s, Safari aborts, RSC fetch cancels (ARC-748) (ARC-748)
- stop AuthModule from pulling SupportController into integration tests (ARC-748) (ARC-748)
- satisfy lint on forgot/reset wiring (ARC-748) (ARC-748)
- absorb Turbopack dev-server flakes on firefox + Mobile Chrome (ARC-748) (ARC-748)
- expand 401 suppression to every auth-gated route (ARC-748) (ARC-748)
- repair leaderboard avatar shape check + harden PWA meta test (ARC-748) (ARC-748)
- add missing critical variant names for ru/fr/by (ARC-748) (ARC-748)

### Improved

- priority on rank-2/3 avatars to fix LCP (ARC-748) (ARC-748)

## [1.14.35] - 2026-05-24

### Added

- rework featured games section with V2 cover-led card (ARC-747) (ARC-747)

### Fixed

- pin rules + create-room buttons in preview rail (ARC-747) (ARC-747)
- keep slider arrows below cards (ARC-747) (ARC-747)
- always render featured-games pager (ARC-747) (ARC-747)
- prefix play CTA href with active locale (ARC-747) (ARC-747)

## [1.14.34] - 2026-05-24

### Added

- notify subscribers of new public announcement (ARC-740) (ARC-740)
- notify on starting soon + registration opened (ARC-740) (ARC-740)
- notify users when streak window opens (ARC-740) (ARC-740)
- add header bell + settings section UI (ARC-740) (ARC-740)
- add Zustand store with permission + subscription flow (ARC-740) (ARC-740)
- add typed web API client + types (ARC-740) (ARC-740)
- add vanilla service worker for push events (ARC-740) (ARC-740)
- add i18n bundle in en/ru/es/fr/by (ARC-740) (ARC-740)
- wire NotificationsModule + enable scheduler (ARC-740) (ARC-740)
- add REST controller for prefs, inbox, subscriptions (ARC-740) (ARC-740)
- add dispatcher orchestrating inbox + socket + push (ARC-740) (ARC-740)
- add BE-side i18n bundle + render helper (ARC-740) (ARC-740)
- add socket gateway for live inbox updates (ARC-740) (ARC-740)
- add inbox + preferences service (ARC-740) (ARC-740)
- add push-sender with VAPID + gone-subscription cleanup (ARC-740) (ARC-740)
- add Mongoose schemas for subscriptions, inbox, prefs (ARC-740) (ARC-740)
- add notification category enum (ARC-740) (ARC-740)

### Fixed

- use ts-node instead of tsx for VAPID script (ARC-740) (ARC-740)

### Documentation

- add PWA notifications implementation plan (ARC-740) (ARC-740)
- clarify vapid-public-key endpoint is public (ARC-740) (ARC-740)
- add PWA notifications design spec (ARC-740) (ARC-740)

## [1.14.33] - 2026-05-24

### Added

- generate invite code for all rooms (ARC-745) (ARC-745)

### Fixed

- look up rooms by invite code without anon-host filter (ARC-745) (ARC-745)

## [1.14.32] - 2026-05-23

### Added

- View Game Rules link in preview rail (ARC-744) (ARC-744)
- sticky bottom Create Room CTA on mobile (ARC-744) (ARC-744)
- use shared CreateRoomButton in preview rail (ARC-744) (ARC-744)
- hover-lift animation on preview-rail Critical card fan (ARC-744) (ARC-744)
- real previews in game picker tiles + theme thumbnails; full Sea Battle board in rail (ARC-744) (ARC-744)
- real card / board previews + theme-aware colors on /games/create (ARC-744) (ARC-744)
- rework /games/create with editorial two-column layout (ARC-744) (ARC-744)

### Fixed

- cap sticky rail height so Create Room CTA stays reachable (ARC-744) (ARC-744)
- restore e2e contract with redesigned /games/create (ARC-744) (ARC-744)
- emit valid hreflang code for Belarusian locale (N/A)
- stop calling router.replace inside setForm updater (ARC-744) (ARC-744)
- silence remaining hydration warnings on /games/create (ARC-744) (ARC-744)
- cover Sea Battle poster with opaque rail preview (ARC-744) (ARC-744)
- SSR-safe Sea Battle preview via dynamic import to stop hydration mismatch (ARC-744) (ARC-744)
- brighten hovered fan card — opacity 1, drop blur, add brightness boost (ARC-744) (ARC-744)
- restore shine sweep + show card names on every fan card + lower hover opacity (ARC-744) (ARC-744)
- soften card-fan hover — drop shine sweep, dial back hover opacity (ARC-744) (ARC-744)
- real Sea Battle field anchored top-left in picker tiles + move LIVE PREVIEW pill (ARC-744) (ARC-744)
- show A–J / 1–10 coordinate labels in Sea Battle theme tiles (ARC-744) (ARC-744)

## [1.14.31] - 2026-05-23

### Fixed

- redirect unauthenticated users to /auth when buying gems (ARC-742) (ARC-742)

## [1.14.30] - 2026-05-23

### Fixed

- add missing $error theme tokens to silence Tamagui warning and stabilize SSR (ARC-737, ARC-738) (ARC-737
  ARC-738)
- clear dist before nest start --watch to avoid stale module race (ARC-739) (ARC-739)

## [1.14.29] - 2026-05-23

### Added

- show Play CTA on hover of every hero card (N/A)
- show 'Play' CTA on hover of front hero card linking to variant create (ARC-734) (ARC-734)
- render hero cards with full-bleed variant artwork (ARC-734) (ARC-734)
- add optional bgImage to CARD_VARIANTS for shipped artwork (ARC-734) (ARC-734)

### Fixed

- rename Play CTA testid to avoid hero-card- prefix collision (N/A)

### Refactored

- alias isLast as isFront for hero card LCP priority (ARC-734) (ARC-734)

### Documentation

- add ARC-734 hero cards implementation plan (ARC-734)
- add ARC-734 hero cards premium design spec (ARC-734)

## [1.14.28] - 2026-05-23

### Fixed

- tighten system row layout and drop generic 'A player' prefix (ARC-736) (ARC-736)
- render sender (and target) on system/action rows (ARC-736) (ARC-736)

## [1.14.27] - 2026-05-23

### Added

- additional shop avatar and badge items (ARC-712)

### Fixed

- pin .first() for duplicated legendary card testids in e2e (ARC-712) (ARC-712)

## [1.14.26] - 2026-05-23

### Added

- in-game share menu via telegram/whatsapp/x/facebook (ARC-732) (ARC-732)

## [1.14.25] - 2026-05-23

### Added

- horizontal ship rows + vertical label in side strip (ARC-729) (ARC-729)
- side ships-remaining in mobile landscape (ARC-729) (ARC-729)
- cap mobile/tablet landscape grid at 2 cols (ARC-729) (ARC-729)
- cap grid at 2 cols in fullscreen mode (ARC-729) (ARC-729)
- adaptive board sizing + 2-col min in landscape (ARC-729) (ARC-729)

### Fixed

- only desktop widget-fs shrinks grid cells (ARC-729) (ARC-729)
- prefer bigger cells with scroll outside fullscreen (ARC-729) (ARC-729)
- CSS-only row fit so boards never overflow viewport (ARC-729) (ARC-729)
- fit all boards in viewport without scroll (ARC-729) (ARC-729)
- restore team pill in mobile-landscape name row (ARC-729) (ARC-729)
- tighten section around board so border traces content (ARC-729) (ARC-729)
- clamp row height to square-cell + chrome (ARC-729) (ARC-729)
- stop board clip + top-row chrome hide on multi-row layouts (ARC-729) (ARC-729)
- floor 2-col cap row at board+chrome so cells don't clip (ARC-729) (ARC-729)
- mobile vertical cap + 200px floor, per requirements (ARC-729) (ARC-729)
- pack 2-col cap rows to ~viewport so one pair fills the screen (ARC-729) (ARC-729)
- move size container onto wrapper for reliable cqi/cqh (ARC-729) (ARC-729)
- natural-height sections on mobile vertical (ARC-729) (ARC-729)
- switch board sizing to container-query units (ARC-729) (ARC-729)
- align row/col labels with board cells (ARC-729) (ARC-729)
- measure remaining viewport height instead of guessing (ARC-729) (ARC-729)

### Refactored

- pure-CSS fit-grid sizing for boards (ARC-729) (ARC-729)

## [1.14.24] - 2026-05-22

### Fixed

- unblock app e2e cold bootstrap (ARC-732) (ARC-732)

## [1.14.23] - 2026-05-21

### Added

- in-game player avatars for critical + sea-battle (ARC-728) (ARC-728)

## [1.14.22] - 2026-05-21

### Added

- premium in-game chat redesign per handoff (ARC-735) (ARC-735)
- wire GamePageLayout to chat store; remove local popup (ARC-735) (ARC-735)
- mount chat popup overlay inside game widget (ARC-735) (ARC-735)
- add GameChatPopupOverlay reading from chat store (ARC-735) (ARC-735)
- extend chat store with userId, equipped, panelOpen, fallback resolver (ARC-735) (ARC-735)

### Fixed

- popup-on-refresh + theme-aware chat surfaces (ARC-735) (ARC-735)

### Refactored

- anchor popup to nearest positioned ancestor (ARC-735) (ARC-735)

### Documentation

- implementation plan for chat popup inside game widget (ARC-735) (ARC-735)
- design for chat popup inside game widget (ARC-735) (ARC-735)

## [1.14.21] - 2026-05-21

### Added

- HowTo on landings + Speakable + RUM ingestion (ARC-727) (ARC-727)

## [1.14.20] - 2026-05-21

### Added

- HowTo schema + related articles + dynamic OG images (ARC-727) (ARC-727)

## [1.14.19] - 2026-05-21

### Added

- blog content cluster — infra + first article (ARC-727) (ARC-727)
- /games/glimworm landing page (ARC-727) (ARC-727)
- /games/critical landing page (ARC-727) (ARC-727)

## [1.14.18] - 2026-05-21

### Added

- SEO copy — inject "free" keyword into home + games (ARC-727) (ARC-727)
- more SEO — resource hints, FAQ JSON-LD, sitemap+robots audit (ARC-727) (ARC-727)
- additive SEO — VideoObject, Person, Org enrichment, Web Vitals, cache + x-robots-tag (ARC-727) (ARC-727)

## [1.14.17] - 2026-05-20

### Added

- taller profile chip — more breathable avatar section (ARC-726) (ARC-726)
- friendlier profile chip — first-name only + outlined role badge (ARC-726) (ARC-726)
- scrollable profile dropdown + Support icon + Shop emphasis (ARC-726) (ARC-726)

### Fixed

- profile chip honors size override (56px, no clipping) (ARC-726) (ARC-726)
- Support icon button — render via Button+Link, no spin on hover (ARC-726) (ARC-726)

### Refactored

- slim desktop nav to Games + Leaderboards + Shop (ARC-726) (ARC-726)
- slim desktop nav, compact profile chip + language switcher (ARC-726) (ARC-726)

### Documentation

- app header rework design spec (ARC-726) (ARC-726)

## [1.14.16] - 2026-05-20

### Added

- PlayerAvatar 'lg' size — full composition without card chrome (ARC-730) (ARC-730)
- MythicSpotlight + RunnerUpCard show equipped cosmetics (ARC-730) (ARC-730)
- ChatMessage adds optional senderAvatar slot (ARC-730) (ARC-730)
- EquippedPlayerAvatar resolves equipped ids and renders PlayerAvatar (ARC-730) (ARC-730)
- PlayerAvatar composes frame/aura/badge/banner/name across 4 sizes (ARC-730) (ARC-730)
- useEquippedCosmetics resolves frame/aura/banner colors (ARC-730) (ARC-730)
- session + leaderboard + game types carry equipped frame/aura/banner (ARC-730) (ARC-730)
- leaderboard payload exposes equipped frame/aura/banner (ARC-730) (ARC-730)
- game history player payload exposes equipped frame/aura/banner (ARC-730) (ARC-730)
- room member payload exposes equipped frame/aura/banner (ARC-730) (ARC-730)
- chat sender payload exposes equipped frame/aura/banner (ARC-730) (ARC-730)
- expose equipped frame/aura/banner ids on AuthUserProfile (ARC-730) (ARC-730)

### Refactored

- history modal + stats leaderboard use EquippedPlayerAvatar (ARC-730) (ARC-730)
- chat list search result uses EquippedPlayerAvatar (ARC-730) (ARC-730)
- profile + mobile menu use EquippedPlayerAvatar (ARC-730) (ARC-730)
- profile hero uses EquippedPlayerAvatar (ARC-730) (ARC-730)
- use EquippedPlayerAvatar in RankTable (ARC-730) (ARC-730)
- in-game chat uses EquippedPlayerAvatar (ARC-730) (ARC-730)
- use EquippedPlayerAvatar in locale chat (ARC-730) (ARC-730)

### Documentation

- PlayerAvatar implementation plan (ARC-730) (ARC-730)
- PlayerAvatar component design (ARC-730) (ARC-730)

## [1.14.15] - 2026-05-20

### Added

- harden contact form against spam/abuse (ARC-725) (ARC-725)
- support module — Discord webhook + Gmail SMTP delivery (ARC-725) (ARC-725)

### Fixed

- E2E bypass for Mailer/Discord/Throttler + dev OriginGuard fallback (ARC-725) (ARC-725)
- OriginGuard accepts server-action via shared token + e2e fixes (ARC-725) (ARC-725)
- contact form delivers to NEXT_PUBLIC_SUPPORT_EMAIL (ARC-725) (ARC-725)

## [1.14.14] - 2026-05-19

### Added

- clear file length allow list (N/A)

## [1.14.13] - 2026-05-19

### Added

- render coming-soon games as disabled and gate Create button (ARC-704)
- catalog surfaces all variants with comingSoon flag (ARC-710) (ARC-710)
- wire catalog comingSoon flag to home featured-games carousel (ARC-704) (ARC-704)
- catalog returns game-level comingSoon for restricted games (ARC-710) (ARC-710)
- Glimworm lobby renders coming-soon variants (ARC-710) (ARC-710)
- Sea Battle CreationConfig renders coming-soon variants (ARC-710) (ARC-710)
- Critical CreationConfig renders coming-soon variants (ARC-710) (ARC-710)
- mirror new tiers + localize developers_plus and none (ARC-710) (ARC-710)
- catalog endpoint returns comingSoon flag per variant (ARC-710) (ARC-710)
- add developers_plus and none visibility tiers (ARC-710) (ARC-710)
- Sea Battle CreationConfig filters via catalog (ARC-710) (ARC-710)
- Critical CreationConfig filters via catalog (ARC-710) (ARC-710)
- createRoom + listRooms read both variant keys (ARC-710) (ARC-710)
- extractVariantFromOptions helper (ARC-710) (ARC-710)
- extend catalog with Critical + Sea Battle variants (ARC-710) (ARC-710)
- glimworm lobby honors visibility (ARC-710) (ARC-710)
- web client for /games/catalog (ARC-710) (ARC-710)
- admin page (ARC-710) (ARC-710)
- table UI (ARC-710) (ARC-710)
- sidebar entry (ARC-710) (ARC-710)
- i18n for visibility page (ARC-710) (ARC-710)
- server actions for tier updates (ARC-710) (ARC-710)
- server-side fetcher (ARC-710) (ARC-710)
- glimworm gateway honors visibility (ARC-710) (ARC-710)
- hide restricted rooms in listRooms (ARC-710) (ARC-710)
- block room/quickplay for restricted games (ARC-710) (ARC-710)
- GET /games/catalog returns role-filtered list (ARC-710) (ARC-710)
- UserRoleResolver helper for tier checks (ARC-710) (ARC-710)
- admin endpoints for game visibility (ARC-710) (ARC-710)
- listForAdmin joins catalog with tiers (ARC-710) (ARC-710)
- visibility service write paths with catalog validation (ARC-710) (ARC-710)
- GameVisibilityService with TTL cache (ARC-710) (ARC-710)
- game_visibility schema (ARC-710) (ARC-710)
- BE-side game catalog shim (ARC-710) (ARC-710)
- tier helper for visibility (ARC-710) (ARC-710)

### Fixed

- drop dynamic+ssr:false wrapper for CreateGameRoomPage (N/A)
- guard buildComingSoonMaps against malformed catalog (ARC-710) (ARC-710)
- brighten Game Rules link button to readable accent color (ARC-710) (ARC-710)
- update listForAdmin test after catalog populated (ARC-710) (ARC-710)
- resolver short-circuits anon*/bot*/non-ObjectId callers (ARC-710) (ARC-710)

### Improved

- add priority prop for eager-load + high fetchpriority (N/A)

### Refactored

- extract GameSelectorSection to satisfy file-length cap (ARC-710) (ARC-710)
- extract web CatalogVariant/CatalogGame/CatalogResponse types (ARC-710) (ARC-710)
- extract CatalogVariant/CatalogGame/CatalogResponse types (ARC-710) (ARC-710)
- drop unnecessary cast in listRooms key extractor (ARC-710) (ARC-710)
- split gem-success page presentational components (N/A)

### Documentation

- address plan review on visibility tiers (ARC-710) (ARC-710)
- implementation plan for none + developers_plus tiers (ARC-710) (ARC-710)
- address spec review on visibility tiers (ARC-710) (ARC-710)
- spec for none + developers_plus visibility tiers (ARC-710) (ARC-710)
- plan review polish for color variants (ARC-710) (ARC-710)
- implementation plan for color-variant visibility (ARC-710) (ARC-710)
- align test bullet file name (ARC-710) (ARC-710)
- fold spec-review fixes into color-variants design (ARC-710) (ARC-710)
- design for admin-controlled color-variant visibility (ARC-710) (ARC-710)
- note evolving GamesController constructor signature in plan (N/A)
- implementation plan for ARC-710 game/variant visibility (ARC-710)
- fold spec-review clarifications into ARC-710 design (ARC-710)
- design for admin-controlled game/variant visibility (ARC-710) (ARC-710)

## [1.14.12] - 2026-05-19

### Added

- limited-drop hero rotates unowned legendaries (N/A)
- split Inventory into its own page (/shop/inventory) (N/A)
- real Inventory section + working top-bar nav (N/A)
- make 'View all' actually expand the row (N/A)
- free starter item in every category + generic auto-equip (N/A)
- reframe banner as the stage backdrop + add Frame category (N/A)
- banner fills the avatar disc, aura drives the orbiting rays (N/A)
- add Banner + Aura categories end-to-end (N/A)
- hoist Legendary row to the top of the catalog rail (N/A)
- idempotent purchase + hero owned-state awareness (N/A)

### Fixed

- define missing $gray10/11/12, $green11, $red11, $blue11 tokens (N/A)
- render game_skin items as a swatch instead of next/image (N/A)
- soften the frame on the avatar disc (N/A)
- drop overflow:hidden on the avatar disc so the badge isn't clipped (N/A)
- complete EquippedView literal in purchase() happy path (N/A)

## [1.14.11] - 2026-05-19

### Added

- shop images and badges redesign (N/A)

### Refactored

- replace standard img with optimized next/image components (N/A)

## [1.14.10] - 2026-05-19

### Added

- locale-aware formatters + completeness audit + LCP polish (N/A)

## [1.14.9] - 2026-05-18

### Added

- Showcase Locker redesign with live try-on rail (N/A)

### Fixed

- switch locale-routing cookie fixture to domain+path to satisfy addCookies (N/A)
- hide the rotating rectangle + recenter rays around the avatar (N/A)
- stop mannequin rays wobbling — align transform-origin with gradient anchor (N/A)
- action-panel — keep preview alive on card→panel hop, fix Unequip showing for owned-but-not-equipped items (N/A)
- wire the top-bar nav links to real destinations (N/A)

### Improved

- priority-load first cards across every catalog row to silence repeat LCP warnings (N/A)
- eager-load the first avatar-row cards so catalog asset can't become a lazy LCP (N/A)
- mark above-the-fold ItemAssets as priority so LCP isn't lazy (N/A)

### Refactored

- move the action button onto the card, panel becomes display-only (N/A)
- address PR #689 review — blockers, a11y, direct-buy, instrumentation (N/A)
- extract listRooms query parsers to keep controller under 500 lines (N/A)

## [1.14.8] - 2026-05-18

## [1.14.7] - 2026-05-18

### Added

- BreadcrumbList everywhere, CollectionPage on catalogs, ProfilePage for /players/[id] (ARC-707) (ARC-707)

## [1.14.6] - 2026-05-18

### Added

- translated route slugs, per-locale OG image, JSON-LD, sitemap polish (ARC-706) (ARC-706)

## [1.14.5] - 2026-05-18

### Added

- per-locale JSON-LD, og:locale:alternate, 404, dynamic pages (ARC-705) (ARC-705)

## [1.14.4] - 2026-05-18

### Added

- per-page localized metadata (ARC-703) (ARC-703)

## [1.14.3] - 2026-05-18

### Added

- global [locale] URL prefix (N/A)

### Fixed

- update tests for [locale] URL prefix (ARC-702) (ARC-702)

## [1.14.2] - 2026-05-18

### Added

- /games/<id> uses the full lounge UI scoped to one game (N/A)
- polish sea-battle landing for indexability (N/A)
- quickplay — persist the chosen variant into room.gameOptions (N/A)
- sea-battle landing — patches 1-7 (CTA hierarchy, a11y board, error UX) (N/A)
- show real theme colors in the landing's themes strip (N/A)
- make theme preview cell-size configurable, enlarge on landing (N/A)
- use the real game board on /games/sea-battle landing hero (N/A)
- matchmaking — skip rooms whose host has already left (N/A)
- add Find-a-human-opponent matchmaking on Sea Battle landing (N/A)
- add quickplay vs AI button on Sea Battle landing (N/A)
- redesign Sea Battle landing — sonar hero, themes strip, FAQ accordion (N/A)
- add Sea Battle SEO landing page at /games/sea-battle (N/A)

### Fixed

- StartButton — wrap in plain <div> so the glow class actually applies (N/A)
- StartButton animation — bolder + raised specificity + !important (N/A)
- StartButton — actual pulse/shimmer animations via CSS keyframes (N/A)
- quickplay DTO — accept optional \`variant\` from the landing (N/A)
- QuickplayButton — console.warn on caught failure, not error (N/A)
- cycle-hint pill no longer covers the caption (N/A)
- sea-battle landing board — let it sit inside the hero card (N/A)
- sea-battle landing board — drop scale + aspect-ratio so it fits (N/A)
- RematchInvitationModal — return null when no inviter message (N/A)
- add missing rematch.invitation keys across all 5 locales (N/A)
- tighten matchmaking pool, switch to \$elemMatch, log candidates (N/A)
- matchmaking — exclude rooms that already contain an AI bot (N/A)
- matchmaking — drop \$expr, log candidate scans (N/A)
- make quickplay anonymous-friendly, drop /auth redirect (N/A)
- point Sea Battle "Play Now" button to the SEO landing (N/A)
- wire featured-game card title to FeaturedGame.route (N/A)

### Refactored

- apply v2 review polish to Sea Battle landing (N/A)
- split HomeGames into card + slider hook, replace route ternary (N/A)

## [1.14.1] - 2026-05-17

### Added

- complete steampunk and zen sprites and update spritesheets (N/A)
- add missing steampunk sprites and update spritesheet (N/A)
- finalize western sprites and update spritesheet (N/A)
- add western aegis and blight sprites and update spritesheet (N/A)
- finalize fantasy sprites and update spritesheet (N/A)
- finalize egypt sprites and update spritesheet (N/A)
- complete galaxy sprites and update thematic sprite sheets (N/A)
- finish galaxy sprites with realistic 4k images (N/A)
- upgrade Critical Game sprites to realistic 4k (Egypt, Fantasy, Western, Steampunk) (N/A)
- integrate 17 new card illustrations and refactor views to stay under line limit (N/A)
- completed fantasy chaos pack and western chaos pack (N/A)
- completed deity pack for all variants and started chaos pack (N/A)
- deity and chaos pack expansion for several variants (N/A)
- partial deity pack for fantasy variant (N/A)
- complete galaxy collection and deity packs for egypt, steampunk, zen (N/A)
- complete future utilities and fantasy/western collection packs (N/A)
- fill missing future and theft sprites for egypt and steampunk (N/A)
- complete galaxy thematic sprites (N/A)
- complete fantasy and western thematic sprites (N/A)
- expand zen and fantasy pack sprites (N/A)
- expand steampunk future pack sprites (N/A)
- expand thematic card sprites for fantasy, western, steampunk, and zen variants (N/A)
- expand egypt variant with 23 additional thematic card sprites (N/A)
- implement high-quality thematic sprites for egypt, steampunk, and zen variants (N/A)
- implement thematic sprite sheets for Galaxy and Fantasy variants (N/A)
- integrate 6 new thematic variants and resolve literal string type mismatches (N/A)

### Fixed

- restore chat bubble and sea battle popup on mobile opponent tiles (N/A)
- ARC-590: stabilize critical mobile interactions and game layouts (ARC-590)

## [1.14.0] - 2026-05-16

## [1.13.56] - 2026-05-16

### Fixed

- treat stale wallet token as anonymous on SSR (ARC-692) (ARC-692)
- allow 127.0.0.1 as a Next.js dev origin (ARC-692) (ARC-692)
- stop shop mobile footer rendering over content (ARC-692) (ARC-692)
- drop dynamic({ssr:false}) for AppFooter to avoid ChunkLoadError (ARC-692) (ARC-692)
- don't let leaderboards mock route intercept page navigation (ARC-692) (ARC-692)
- make leaderboard live-chip + ticker reliably observable in e2e (ARC-692) (ARC-692)
- filter bot ids out of GameUtilities user queries (ARC-692) (ARC-692)
- set mobile drawer height to 100dvh (ARC-692) (ARC-692)
- lock body scroll + contain drawer overscroll on mobile (ARC-692) (ARC-692)
- close mobile menu's transparent gap above the drawer (ARC-692) (ARC-692)
- make mobile menu drawer fully opaque (ARC-692) (ARC-692)
- make install-PWA button stand out in dark mode mobile menu (ARC-692) (ARC-692)
- label the install-PWA action inside the mobile menu (ARC-692) (ARC-692)
- use inline language pills in mobile menu instead of Select (ARC-692) (ARC-692)
- keep mobile menu open while a portaled popover is active (ARC-692) (ARC-692)
- redesign mobile menu for clearer hierarchy and consistency (ARC-692) (ARC-692)
- trim mobile header to logo + wallet + menu (ARC-692) (ARC-692)
- keep games filter + Create Room button inside their cards on mobile (ARC-692) (ARC-692)
- split Filters padding so vertical breathing room actually applies (ARC-692) (ARC-692)
- add small horizontal padding to PageLayout + footer on mobile (ARC-692) (ARC-692)
- add horizontal margins to footer on mobile breakpoints (ARC-692) (ARC-692)
- drop stray support icon from footer when socials configured (ARC-692) (ARC-692)
- client-only render the layout footer to avoid hydration mismatch (ARC-692) (ARC-692)
- restore theme-aware @arcadeum/ui Footer for shared widget (ARC-692) (ARC-692)

### Refactored

- unify footer across all non-paginated pages (ARC-692) (ARC-692)

## [1.13.55] - 2026-05-16

### Documentation

- correct mobile dev port (Metro 8081, not legacy expo-cli 19000) (N/A)
- fix outdated paths, ports, and broken links in root README (N/A)

## [1.13.54] - 2026-05-15

### Fixed

- rework sign-in page for mobile (ARC-690) (ARC-690)

### Refactored

- reuse the shared InstallAppCta widget on /auth (ARC-690) (ARC-690)

## [1.13.53] - 2026-05-15

### Added

- switch /auth route to two-column redesign (ARC-690) (ARC-690)
- add brand, form, and pwa panels for redesigned sign-in (ARC-690) (ARC-690)
- extend hooks with remember-me, magic link, multi-provider OAuth (ARC-690) (ARC-690)
- add i18n keys for sign-in redesign (ARC-690) (ARC-690)

### Fixed

- restore availability status text below email + username fields (ARC-690) (ARC-690)
- center brand column on shared 680px track + drop logo wordmark (ARC-690) (ARC-690)
- scale brand headline + inline feature bullets to match mockup (ARC-690) (ARC-690)
- drop bogus lineHeight multipliers that collapsed wrapped text (ARC-690) (ARC-690)
- close visual gap to the v2 mockup (ARC-690) (ARC-690)
- round-3 form polish — rect submit + glow, heading, divider (ARC-690) (ARC-690)
- paint ambient background via document order (ARC-690) (ARC-690)
- magic-link disabled visual + staggered brand entry (ARC-690) (ARC-690)
- localize OAuth provider short labels (ARC-690) (ARC-690)
- paint ambient background by dropping the opaque page surface (ARC-690) (ARC-690)
- align e2e specs with redesigned sign-in + unblock register submit (ARC-690) (ARC-690)
- polish form panel + pwa strip per design review (ARC-690) (ARC-690)
- polish brand panel + page chrome per design review (ARC-690) (ARC-690)

### Refactored

- strip dead confirm-password surface from useAuthForm (ARC-690) (ARC-690)

## [1.13.52] - 2026-05-15

### Added

- develop-branch review follow-ups §2.2 §3.2 §3.4 §3.5 (ARC-686) (ARC-686)

### Fixed

- back out §3.5 view-transition-name + shorten rail fullscreen label (ARC-686) (ARC-686)

## [1.13.51] - 2026-05-15

### Added

- scale mongoose pool and pool axios outbound for PayPal (ARC-685) (ARC-685)

## [1.13.50] - 2026-05-15

### Fixed

- raise per-socket listener cap on games namespace (ARC-683) (ARC-683)

## [1.13.49] - 2026-05-15

### Fixed

- fullscreen mode from control panel and widget (ARC-682) (ARC-682)

## [1.13.48] - 2026-05-15

### Added

- replace emoji glyphs with SVG icons §3.2 (ARC-681) (ARC-681)

## [1.13.47] - 2026-05-15

## [1.13.46] - 2026-05-15

### Added

- fluid widget width + container queries §3.3 (ARC-679) (ARC-679)

## [1.13.45] - 2026-05-15

### Fixed

- develop-branch review follow-ups §1.1–1.10 + §2.1, §2.3 (ARC-678) (ARC-678)

### Refactored

- extract MatchWidget test fixtures to satisfy 500-line limit (ARC-678) (ARC-678)

## [1.13.44] - 2026-05-14

### Added

- View Transitions + 5-tick history strip §4.2 + §4.7 (ARC-675) (ARC-675)

### Fixed

- make discard description scrim visible above card (ARC-676) (ARC-676)
- show card description on the discard pile (ARC-676) (ARC-676)
- show actor name in FlashHistory rows (ARC-675) (ARC-675)

### Refactored

- CSS grid arena + @property threat pulse §4.3 + §4.5 (ARC-676) (ARC-676)

## [1.13.43] - 2026-05-14

### Improved

- CSS-driven hand glow + fan §4.1 + §4.4 (ARC-674) (ARC-674)

## [1.13.42] - 2026-05-14

### Added

- persist hand-card toggles to localStorage §4.6 (ARC-673) (ARC-673)

## [1.13.41] - 2026-05-14

### Fixed

- widget a11y items §3.1–3.4 from PR #658 review (ARC-672) (ARC-672)

## [1.13.40] - 2026-05-14

### Fixed

- widget parity follow-ups §1.3–1.8 + §2.1 + §2.3–2.6 (ARC-671) (ARC-671)
- land §1.1 + §1.2 from PR #658 design review (ARC-570) (ARC-570)

## [1.13.39] - 2026-05-14

### Added

- widget parity pass against Critical.html preview (ARC-570) (ARC-570)

### Fixed

- PR #658 review follow-ups for widget parity (ARC-570) (ARC-570)

## [1.13.38] - 2026-05-14

### Added

- name color category — third equippable surface (ARC-650) (ARC-650)

## [1.13.37] - 2026-05-14

### Added

- equipped cosmetics in game chat + dropped-commit CI guard (ARC-650) (ARC-650)

## [1.13.36] - 2026-05-14

### Added

- equipped cosmetics in lobby + leaderboard, /shop signed-out CTA (ARC-650) (ARC-650)

## [1.13.35] - 2026-05-14

### Added

- show sender's equipped avatar + badge (ARC-650) (ARC-650)

### Fixed

- re-apply inventory cast + equip sync + dialog UX (ARC-650) (ARC-650)

## [1.13.34] - 2026-05-14

### Added

- show equipped shop badge in ProfileMenu (ARC-650) (ARC-650)
- show equipped cosmetics on /players/[id] (ARC-650) (ARC-650)

### Fixed

- filter bot ids before User.find $in (ARC-650) (ARC-650)

## [1.13.33] - 2026-05-13

### Added

- prevent duplicate buys + clearer equip feedback (ARC-650) (ARC-650)
- equipped avatar visible in header ProfileMenu (ARC-650) (ARC-650)

## [1.13.32] - 2026-05-13

### Added

- /admin/shop surface + AuthModule DI fix (ARC-650) (ARC-650)

### Fixed

- theme-aware colors so admin reads under light theme too (ARC-650) (ARC-650)
- give dialogs a solid card background on dark theme (ARC-650) (ARC-650)

## [1.13.31] - 2026-05-13

### Added

- web /shop page + UI primitives (ARC-650) (ARC-650)

### Fixed

- hard-navigate home after OAuth so cookie is picked up everywhere (ARC-650) (ARC-650)
- refresh server components after login so header updates without reload (ARC-650) (ARC-650)
- refresh layout once on socket connect (ARC-650) (ARC-650)
- use server actions + useTransition instead of TanStack Query (ARC-650) (ARC-650)

## [1.13.30] - 2026-05-13

### Added

- REST API + module wiring + auth starter grant (ARC-650) (ARC-650)
- catalog, inventory, shop services + bootstrap (ARC-650) (ARC-650)
- foundation types, schemas, wallet reasons (ARC-650) (ARC-650)

### Fixed

- defer starter backfill so Nest binds HTTP immediately (ARC-650) (ARC-650)

## [1.13.29] - 2026-05-13

### Documentation

- incorporate review feedback (ARC-650) (ARC-650)
- ARC-650 in-game shop design spec (ARC-650)

## [1.13.28] - 2026-05-13

### Added

- feature Glimworm on the home page with a Demo badge (ARC-555) (ARC-555)
- one-click rematch with same settings (ARC-555) (ARC-555)
- broadcast lobby snapshots so colors sync live (ARC-555) (ARC-555)
- UX polish — countdown, result modal, "You" indicator (ARC-555) (ARC-555)
- add Restart button (host-only) (ARC-555) (ARC-555)
- add solo mode (host vs bots) (ARC-555) (ARC-555)
- wire join/ready/start lobby flow (ARC-555) (ARC-555)
- register glimworm_v1 in games registry (ARC-555) (ARC-555)
- add widget entry component (ARC-555) (ARC-555)
- add death overlay and lobby color picker (ARC-555) (ARC-555)
- add HUD overlay component (ARC-555) (ARC-555)
- add pixi lifecycle and render-loop hook (ARC-555) (ARC-555)
- add cursor + touch controls hook (ARC-555) (ARC-555)
- add socket hook with throttled input and reconnect (ARC-555) (ARC-555)
- add pixi fx layer (ARC-555) (ARC-555)
- add pixi food and power-up renderer (ARC-555) (ARC-555)
- add pixi worm renderer with glow (ARC-555) (ARC-555)
- add pixi arena renderer (ARC-555) (ARC-555)
- add pixi application lifecycle (ARC-555) (ARC-555)
- add pure snapshot interpolation utilities (ARC-555) (ARC-555)
- add zustand store with snapshot rotation (ARC-555) (ARC-555)
- add widget shared types (ARC-555) (ARC-555)
- wire glimworm_v1 into shared game lib switches (ARC-555) (ARC-555)
- add variant catalog for GameVariantSelector (ARC-555) (ARC-555)
- add i18n bundles for 5 locales (ARC-555) (ARC-555)
- add glimworm_v1 to GameSlug union (ARC-555) (ARC-555)
- register glimworm services and gateway in games module (ARC-555) (ARC-555)
- add socket gateway with input/start/color handlers (ARC-555) (ARC-555)
- add greedy-food bot service (ARC-555) (ARC-555)
- add service tick loop and session orchestration (ARC-555) (ARC-555)
- add ghost power-up (ARC-555) (ARC-555)
- add shrink power-up (ARC-555) (ARC-555)
- add shield power-up (ARC-555) (ARC-555)
- add power-up registry and speed power-up (ARC-555) (ARC-555)
- add variant factory (ARC-555) (ARC-555)
- add Lives + Heats variant (ARC-555) (ARC-555)
- add Time-Attack variant (ARC-555) (ARC-555)
- add variant strategy interface and Battle Royale (ARC-555) (ARC-555)
- add in-memory session state store (ARC-555) (ARC-555)
- add constants and shared types (ARC-555) (ARC-555)

### Fixed

- memoize teams to stabilize useMemo deps (ARC-555) (ARC-555)
- hoist useMemo above the early return in GlimwormHud (ARC-555) (ARC-555)
- demo badge no longer overlaps the help button (ARC-555) (ARC-555)
- make bots steer away from walls predictively (ARC-555) (ARC-555)
- make the in-game Restart button visible again (ARC-555) (ARC-555)
- auto-ready everyone when host starts, so humans can play (ARC-555) (ARC-555)
- honour the lobby bot-count selector (ARC-555) (ARC-555)
- widget UI polish — scoreboard names, restart, food glow (ARC-555) (ARC-555)
- initialize pixi when the canvas mounts after lobby (ARC-555) (ARC-555)
- make bots survive longer (ARC-555) (ARC-555)
- decrypt incoming snapshot/event payloads (ARC-555) (ARC-555)
- emit plain socket events (not encrypted) (ARC-555) (ARC-555)
- make Start more forgiving and surface BE errors (ARC-555) (ARC-555)
- add glimworm_v1 to create-flow gamesCatalog (ARC-555) (ARC-555)
- mark random ctor param as @Optional for NestJS DI (ARC-555) (ARC-555)

### Refactored

- use ReusableGameLobby for the lobby UI (ARC-555) (ARC-555)
- make Lives + Heats initSession unconditional (ARC-555) (ARC-555)

## [1.13.27] - 2026-05-12

### Added

- let host remove unassigned bots from the pool (ARC-646) (ARC-646)
- one-click rematch with the same bot count (ARC-646) (ARC-646)
- aim → fire → wait sequence on pending cell (ARC-646) (ARC-646)
- rocket-drop animation on pending attack cell (ARC-646) (ARC-646)
- optimistic cell feedback on attack click (ARC-646) (ARC-646)

### Fixed

- distribute extra width as gaps so capped board grid fills the row (ARC-646) (ARC-646)
- cap board column width so 8-player fullscreen fits without scroll (ARC-646) (ARC-646)
- serialize per-room placement to stop concurrent-write race (ARC-646) (ARC-646)
- switch theme list to horizontal-above-preview on web mobile (ARC-646) (ARC-646)
- bound theme list to preview height + keep side-by-side on web mobile (ARC-646) (ARC-646)
- scroll theme chips horizontally so they don't overlap the sidebar (ARC-646) (ARC-646)
- make unassigned-bot remove button visible in dark mode (ARC-646) (ARC-646)
- show team-mode lobby cap from team config, not room.maxPlayers (ARC-646) (ARC-646)
- size rematch room to fit the carried team config (ARC-646) (ARC-646)
- label bot participants as "Bot N" in lobby member list (ARC-646) (ARC-646)
- actually display the host's rematch message to invitees (ARC-646) (ARC-646)
- switch fullscreen to CSS overlay so modals stay visible (ARC-646) (ARC-646)
- carry team bots into rematch room participants (ARC-646) (ARC-646)
- route non-host clicks to a chat request, keep create host-only (ARC-646) (ARC-646)
- show rematch button on result modal to non-host players (ARC-646) (ARC-646)
- accept rematch body without roomId, hide bots from invite list (ARC-646) (ARC-646)
- scope result-modal dismissal per session (ARC-646) (ARC-646)
- apply 4-col layout to 4-player view too (ARC-646) (ARC-646)
- apply 4-col layout to 5-player view too (ARC-646) (ARC-646)
- use 4-col layout for 6 boards to fit desktop viewport (ARC-646) (ARC-646)
- run self-heal before validation, not just execution (ARC-646) (ARC-646)
- self-heal stuck team rotation on every action (ARC-646) (ARC-646)
- advance team shooter when active shooter is eliminated (ARC-646) (ARC-646)
- follow hit-lines and probe neighbours instead of cheating (ARC-646) (ARC-646)
- probe random neighbour after a hit instead of cheating (ARC-646) (ARC-646)

### Improved

- drop redundant Mongo reads on attack broadcast (ARC-646) (ARC-646)
- halve bot move delays for snappier gameplay (ARC-646) (ARC-646)

### Refactored

- put theme list as a vertical column to the right of the preview (ARC-646) (ARC-646)
- extract bot delay magic numbers into named constants (ARC-646) (ARC-646)

## [1.13.26] - 2026-05-12

### Added

- stamp targetId on targeted-action logs (ARC-645) (ARC-645)
- emoji marks + colored keyword for HIT/MISS/SUNK (ARC-645) (ARC-645)
- show attack target in action log (ARC-645) (ARC-645)
- team-aware color in team mode (ARC-645) (ARC-645)
- per-player color on player names (ARC-645) (ARC-645)
- consistent per-player color (ARC-645) (ARC-645)

### Fixed

- make Hack / Favor (trade) playable in widget mode (ARC-645) (ARC-645)
- plumb game-aware display-name resolver into chat (ARC-645) (ARC-645)
- color OpponentTile per-player (ARC-645) (ARC-645)
- force per-player color on name + add avatar ring (ARC-645) (ARC-645)
- show who performed each action in the log (ARC-645) (ARC-645)
- show whose message in in-game chat (ARC-645) (ARC-645)

## [1.13.25] - 2026-05-12

### Added

- redesign HandRail for legibility (ARC-639) (ARC-639)
- stack count + defuse pills vertically (ARC-639) (ARC-639)
- collapse MobileHandBar into a single row (ARC-639) (ARC-639)
- enlarge arena pile cards (ARC-639) (ARC-639)
- bigger sprite + toggle card name/description (ARC-639) (ARC-639)
- enlarge hand card; add description (ARC-639) (ARC-639)
- wire hiddenCount + cover hand card roles (ARC-639/641) (ARC-639)
- complete widget UX — target flow, hand visual, mobile bar (ARC-639) (ARC-639)

### Fixed

- stack Arena vertically on mobile (ARC-639) (ARC-639)
- portal MobileHandBar to document.body (ARC-639) (ARC-639)
- show hand cards on mobile (ARC-639) (ARC-639)
- contain Arena pile cards inside CardSlot (ARC-639) (ARC-639)
- render real sprite art on hand cards (ARC-639) (ARC-639)

## [1.13.24] - 2026-05-11

### Added

- server-authoritative overloadOdds on snapshot (ARC-638) (ARC-638)

## [1.13.23] - 2026-05-11

### Added

- emit log.kind for HUD classification (ARC-637) (ARC-637)

## [1.13.22] - 2026-05-11

### Added

- drop header in widget mode; Rules + Fullscreen on HandRail (ARC-636) (ARC-636)

## [1.13.21] - 2026-05-11

### Added

- HandZone + selection-aware combo (ARC-635) (ARC-635)

## [1.13.20] - 2026-05-11

### Added

- OpponentsRow + OpponentTile (ARC-634) (ARC-634)

## [1.13.19] - 2026-05-11

### Added

- ArenaCenter + ComboCard inside Arena (ARC-633) (ARC-633)

## [1.13.18] - 2026-05-11

### Added

- Arena row inside MatchWidget (ARC-632) (ARC-632)

## [1.13.17] - 2026-05-11

### Added

- scaffold MatchWidget behind widget_mode flag (ARC-631) (ARC-631)

## [1.13.16] - 2026-05-11

### Added

- add match HUD with threat strip, combo hints, flash banner (ARC-630) (ARC-630)

### Fixed

- apply PR-631 review-2 §5 fixes (ARC-630) (ARC-630)
- address PR-631 review feedback (ARC-630) (ARC-630)

## [1.13.15] - 2026-05-11

## [1.13.14] - 2026-05-11

### Added

- Day 7 gem bonus on top of coin reward (ARC-621) (ARC-621)
- compact chip on home page (ARC-621) (ARC-621)
- mount DailyRewardCard on /wallet (ARC-621) (ARC-621)
- translations across 5 locales (ARC-621) (ARC-621)
- DailyRewardCard + ClaimButton (ARC-621) (ARC-621)
- claim Server Action (ARC-621) (ARC-621)
- server fetch for /daily-rewards/me (ARC-621) (ARC-621)
- GET /me + POST /claim endpoints (ARC-621) (ARC-621)
- service with streak + idempotent wallet credit (ARC-621) (ARC-621)
- pure streak math util (ARC-621) (ARC-621)
- add UserDailyReward schema (ARC-621) (ARC-621)
- register daily_reward_day_1..7 keys (ARC-621) (ARC-621)

### Documentation

- implementation plan for ARC-621 (ARC-621)
- design spec for ARC-621 (ARC-621)

## [1.13.13] - 2026-05-11

### Added

- stack coin/gem balance pills vertically on mobile (ARC-619) (ARC-619)
- tighter layout on iPhone SE-class screens (ARC-619) (ARC-619)
- show human-readable names and descriptions for keys (ARC-619) (ARC-619)
- add Economy entry to admin sidebar (ARC-619) (ARC-619)
- i18n namespace in 5 locales (ARC-619) (ARC-619)
- add audit history drawer (ARC-619) (ARC-619)
- add edit dialog with reset action (ARC-619) (ARC-619)
- add admin page with settings table (ARC-619) (ARC-619)
- add server actions for set/reset/refresh/history (ARC-619) (ARC-619)
- add web server module for economy settings (ARC-619) (ARC-619)
- add AdminEconomyController with CRUD + audit routes (ARC-619) (ARC-619)
- add EconomySettingsService with getNumber, setNumber, resetToDefault, listAll, getAuditFor, TTL cache (ARC-619) (ARC-619)
- scaffold EconomyModule and register in AppModule (ARC-619) (ARC-619)
- add EconomySetting + audit schemas, interfaces, DTO (ARC-619) (ARC-619)
- add typed economy key registry (ARC-619) (ARC-619)

### Fixed

- drop GlassCard hoverStyle to eliminate Tamagui SSR hydration mismatch (ARC-619) (ARC-619)
- swap Tamagui shell for plain CSS module to ensure mobile fill (ARC-619) (ARC-619)
- widen admin Container to xl so it fills wider viewports (ARC-619) (ARC-619)
- force XStack to 100% width to fill admin shell (ARC-619) (ARC-619)
- make admin shell + economy page responsive on mobile (ARC-619) (ARC-619)
- horizontal-scroll table on narrow screens (ARC-619) (ARC-619)
- server getTranslations now loads the actual locale (ARC-619) (ARC-619)
- read i18n from messages.pages.adminEconomy (ARC-619) (ARC-619)

### Refactored

- read coin rewards from EconomySettings (ARC-619) (ARC-619)
- read gem_to_coin_rate from EconomySettings; getRate now async (ARC-619) (ARC-619)
- read game_win_coin_reward from EconomySettings (ARC-619) (ARC-619)

### Documentation

- annotate env vars as overridable; document cache TTL (ARC-619) (ARC-619)
- fold plan reviewer recommendations into ARC-619 plan (ARC-619)
- add ARC-619 admin economy settings implementation plan (ARC-619)
- fold spec reviewer recommendations into ARC-619 design (ARC-619)
- add ARC-619 admin-tunable economy settings design (ARC-619)

## [1.13.12] - 2026-05-11

### Added

- ARC-620 modern profile menu UI and UX polish (ARC-620)
- [ARC-620] modernize profile menu styles and migrate to shared components (ARC-620)

### Fixed

- restore missing logout test ID in ProfileMenu (N/A)
- ARC-620 stabilize E2E tests and fix mobile layout overlaps (ARC-620)

## [1.13.11] - 2026-05-10

### Added

- labels for referral_bonus and referral_tier_bonus (ARC-618) (ARC-618)
- show coin rewards on referrals page (ARC-618) (ARC-618)
- i18n keys for coin-reward copy in 5 locales (ARC-618) (ARC-618)
- labels for referral_bonus and referral_tier_bonus in 5 locales (ARC-618) (ARC-618)
- credit tier bonus coins when crossing thresholds (ARC-618) (ARC-618)
- credit referrer coins on every successful referral (ARC-618) (ARC-618)
- inject WalletService + ConfigService, read coin env vars (ARC-618) (ARC-618)
- import WalletModule (ARC-618) (ARC-618)
- extend WalletReason with referral_bonus and referral_tier_bonus (ARC-618) (ARC-618)

### Documentation

- document referral coin reward env vars (ARC-618) (ARC-618)
- fold plan reviewer recommendations into ARC-618 plan (ARC-618)
- add ARC-618 referral coin rewards implementation plan (ARC-618)
- clarify aggregation key for future coinsEarned rollup (ARC-618) (ARC-618)
- add ARC-618 referral coin rewards design spec (ARC-618)

## [1.13.10] - 2026-05-10

### Added

- dedicated /payment/gem-cancel page + auto-cancel on return (ARC-617) (ARC-617)
- add Wallet link to profile menu and mobile menu (ARC-617) (ARC-617)
- route gem purchases to dedicated /payment/gem-success page (ARC-617) (ARC-617)
- add Cancel button on pending purchases (ARC-617) (ARC-617)
- seed default gem packages on first deploy (ARC-617) (ARC-617)
- add new reason labels and gem store copy in 3 locales (ARC-617) (ARC-617)
- add gems i18n namespace in 5 locales (ARC-617) (ARC-617)
- labels for gem_purchase + conversion reasons in 5 locales (ARC-617) (ARC-617)
- compose gem widgets into wallet screen (ARC-617) (ARC-617)
- add gem store, pending banner, and convert form components (ARC-617) (ARC-617)
- add TanStack Query hooks for packages, purchases, conversion (ARC-617) (ARC-617)
- compose gem store + pending + convert into /wallet page (ARC-617) (ARC-617)
- add convert-gems form with insufficient-funds path (ARC-617) (ARC-617)
- add pending purchases banner with verify action (ARC-617) (ARC-617)
- add GemStore Server Component + buy button (ARC-617) (ARC-617)
- add web server actions for buy/finalize/convert (ARC-617) (ARC-617)
- add web server module for gems data fetching (ARC-617) (ARC-617)
- add admin page with table and form (ARC-617) (ARC-617)
- add server actions for CRUD (ARC-617) (ARC-617)
- finalize GemsModule wiring with GemConversionService and controllers (ARC-617) (ARC-617)
- add gems-to-coins conversion endpoint and rate-info endpoint (ARC-617) (ARC-617)
- add GemConversionService with atomic gems-to-coins (ARC-617) (ARC-617)
- add gem purchases controller and CreateGemOrderDto (ARC-617) (ARC-617)
- add GemPurchasesService createOrder and listPending (ARC-617) (ARC-617)
- add public and admin gem-package controllers + module wiring (ARC-617) (ARC-617)
- add GemPackagesService with admin CRUD (ARC-617) (ARC-617)
- add gem-package DTOs (ARC-617) (ARC-617)
- add GemPackage and GemPurchase schemas (ARC-617) (ARC-617)
- extract PaypalGateway for shared PayPal API access (ARC-617) (ARC-617)
- extend WalletReason with gem_purchase and conversion (ARC-617) (ARC-617)

### Fixed

- split finalize into helper + action so the success page can render (ARC-617) (ARC-617)
- capture APPROVED PayPal orders before crediting (ARC-617) (ARC-617)
- align Buy buttons across gem package cards (ARC-617) (ARC-617)
- set PayPal redirect env defaults in integration test (ARC-617) (ARC-617)

### Refactored

- use PaypalGateway in createSession (ARC-617) (ARC-617)
- expose MAX_TRANSACTION_AMOUNT for cross-module reuse (ARC-617) (ARC-617)

### Documentation

- document GEM_TO_COIN_RATE env var (ARC-617) (ARC-617)
- fix /wallet/conversion-rate routing in ARC-617 plan (ARC-617)
- add ARC-617 implementation plan (ARC-617)
- fold spec reviewer recommendations into ARC-617 design (ARC-617)
- add ARC-617 gem top-up + conversion design spec (ARC-617)

## [1.13.9] - 2026-05-10

### Added

- add new reason labels and tournament copy (ARC-616) (ARC-616)
- add register confirm dialog (ARC-616) (ARC-616)
- show entry fee and prize pool (ARC-616) (ARC-616)
- add i18n keys for fees and confirm dialogs (ARC-616) (ARC-616)
- add labels for new reasons in 5 locales (ARC-616) (ARC-616)
- add unregister confirm dialog with refund summary (ARC-616) (ARC-616)
- add register confirm dialog with insufficient-funds path (ARC-616) (ARC-616)
- show entry fee and prize pool on public surfaces (ARC-616) (ARC-616)
- add mark-complete dialog with winner picker (ARC-616) (ARC-616)
- add entry fee and prize pool inputs (ARC-616) (ARC-616)
- credit winners coins when session completes (ARC-616) (ARC-616)
- wire WalletService and reward config (ARC-616) (ARC-616)
- add admin endpoint to mark tournament complete (ARC-616) (ARC-616)
- admin markComplete pays prize pool to winner (ARC-616) (ARC-616)
- refund all paid registrations on admin cancel (ARC-616) (ARC-616)
- refund entry fee on unregister before start (ARC-616) (ARC-616)
- charge entry fee on register, atomic with insert (ARC-616) (ARC-616)
- wire WalletService and Connection (ARC-616) (ARC-616)
- add bootstrap to backfill new coin fields (ARC-616) (ARC-616)
- add coin fields to DTOs and mark-complete DTO (ARC-616) (ARC-616)
- add entryFeeCoins, prizePoolCoins, winnerUserId (ARC-616) (ARC-616)
- support parentSession for cross-module transactions (ARC-616) (ARC-616)
- extend WalletReason with game*win and tournament*\* (ARC-616) (ARC-616)

### Fixed

- replace brittle snapshot with explicit assertions (ARC-616) (ARC-616)

### Documentation

- document GAME_WIN_COIN_REWARD env var (ARC-616) (ARC-616)
- fold plan reviewer recommendations into ARC-616 plan (ARC-616)
- add ARC-616 implementation plan (ARC-616)
- fold spec reviewer recommendations into ARC-616 design (ARC-616)
- add ARC-616 earn/spend loop design spec (ARC-616)

## [1.13.8] - 2026-05-09

### Added

- add mobile wallet i18n (en/es/fr) (ARC-615)
- add wallet screen at /wallet route (ARC-615)
- mount balance chip in mobile header (ARC-615)
- mount wallet socket subscription in tabs layout (ARC-615)
- add mobile wallet socket client (ARC-615)
- add mobile wallet balance + transactions hooks (ARC-615)
- hook admin wallet drawer into admin-users row action (ARC-615)
- add admin wallet drawer with grant/deduct form (ARC-615)
- add admin-wallet server actions for grant/deduct/load (ARC-615)
- add /wallet page with cursor-paginated history (ARC-615) (ARC-615)
- mount BalanceChip in header (ARC-615) (ARC-615)
- add WalletLiveBridge with root-layout mount (ARC-615) (ARC-615)
- add BalanceChip Server Component (ARC-615) (ARC-615)
- add web wallet socket client (ARC-615) (ARC-615)
- add wallet and admin-wallet i18n namespaces (en/ru/es/fr/by) (ARC-615)
- add web server module for wallet data fetching (ARC-615)
- backfill coins/gems on application bootstrap (ARC-615) (ARC-615)
- emit wallet:updated socket event on every mutation (ARC-615) (ARC-615)
- add admin wallet controller (ARC-615) (ARC-615)
- add player wallet controller (ARC-615) (ARC-615)
- add grant/deduct/list DTOs with class-validator (ARC-615) (ARC-615)
- implement getBalance and getHistory (ARC-615) (ARC-615)
- implement debit with insufficient-funds guard (ARC-615) (ARC-615)
- implement credit with idempotency + validation (ARC-615) (ARC-615)
- scaffold WalletModule and service (ARC-615) (ARC-615)
- add coins and gems balance fields to User (ARC-615) (ARC-615)
- add balance and transaction view interfaces (ARC-615) (ARC-615)
- add WalletTransaction ledger schema (ARC-615) (ARC-615)
- add insufficient-funds and invalid-currency exceptions (ARC-615) (ARC-615)
- add currency and reason type unions (ARC-615) (ARC-615)

### Fixed

- BalanceChip swallows BE errors so SSR never cascades (ARC-615) (ARC-615)
- unauthenticated /wallet renders empty state + sitemap entry (ARC-615) (ARC-615)
- register JwtModule in WalletModule for gateway DI (ARC-615) (ARC-615)

### Documentation

- split interfaces import in plan task 6 (ARC-615) (ARC-615)
- fold plan reviewer recommendations into ARC-615 plan (ARC-615)
- add ARC-615 implementation plan (ARC-615)
- fold reviewer recommendations into spec (ARC-615) (ARC-615)
- add foundation design spec (ARC-615) (ARC-615)

## [1.13.7] - 2026-05-09

### Added

- FE admin + public surface, i18n, SEO regression (ARC-610) (ARC-610)
- admin + public controllers + module wiring (ARC-610) (ARC-610)
- add service with admin/public queries, transitions, and registration (ARC-610) (ARC-610)
- add Tournament schema, interfaces, DTOs, helpers (ARC-610) (ARC-610)

### Documentation

- add tournaments implementation plan (ARC-610) (ARC-610)
- add tournaments design spec (ARC-610) (ARC-610)

## [1.13.6] - 2026-05-09

### Added

- add i18n + SEO regression test (ARC-608) (ARC-608)
- add /admin/announcements page + sidebar (ARC-608) (ARC-608)
- api/hooks/UI components (ARC-608) (ARC-608)
- add widget + mount in root layout (ARC-608) (ARC-608)
- add dismissedStorage + ctaHrefSafety helpers (ARC-608) (ARC-608)
- wire AnnouncementsModule into AppModule (ARC-608) (ARC-608)
- public active endpoint with locale fallback + cache headers (ARC-608) (ARC-608)
- admin CRUD controller with role guard (ARC-608) (ARC-608)
- add service with admin CRUD and active-for-caller (ARC-608) (ARC-608)
- add Create/Update/List/Active DTOs and validators (ARC-608) (ARC-608)
- add status derivation and active-filter helpers (ARC-608) (ARC-608)
- add Announcement schema and interfaces (ARC-608) (ARC-608)

### Fixed

- register User schema in module so RolesGuard resolves (ARC-608) (ARC-608)

### Refactored

- split layout into server shell + client sidebar (ARC-608) (ARC-608)

### Documentation

- apply plan review fixes (ARC-608) (ARC-608)
- add announcements implementation plan (ARC-608) (ARC-608)
- apply spec review clarifications (ARC-608) (ARC-608)
- add announcements design spec (ARC-608) (ARC-608)

## [1.13.5] - 2026-05-09

### Added

- add /admin/payments viewer page (ARC-607) (ARC-607)
- add admin payment-notes endpoint (ARC-607) (ARC-607)

### Documentation

- apply plan-review fixes (ARC-607) (ARC-607)
- add payment notes implementation plan (ARC-607) (ARC-607)
- apply spec review fixes (ARC-607) (ARC-607)
- add payment notes viewer design spec (ARC-607) (ARC-607)

## [1.13.4] - 2026-05-08

### Added

- add SessionRoleSync component (ARC-606) (ARC-606)

### Documentation

- apply plan-review fixes (ARC-606) (ARC-606)
- add session role sync implementation plan (ARC-606) (ARC-606)
- apply spec review fixes (ARC-606) (ARC-606)
- add role-sync design spec (ARC-606) (ARC-606)

## [1.13.3] - 2026-05-08

### Added

- add admin link visible only to role=admin (ARC-604) (ARC-604)
- wire /admin/users page + sidebar + i18n + e2e (ARC-604) (ARC-604)
- add roleColors + UI components (ARC-604) (ARC-604)
- add api + hooks (useAdminUsers, useUpdateUserRole) (ARC-604) (ARC-604)
- add apiClient.patch<T> method (ARC-604) (ARC-604)
- add AdminUsersService + AdminUsersController (ARC-604) (ARC-604)
- add escapeRegExp helper, DTOs, AdminUserItem interface (ARC-604) (ARC-604)
- register global ValidationPipe (ARC-604) (ARC-604)

### Fixed

- include role in OAuth setTokens call (ARC-604) (ARC-604)
- refresh role from /auth/me into snapshot on app load (ARC-604) (ARC-604)

### Documentation

- apply plan-review fixes (ARC-604) (ARC-604)
- add user-list & role-editor implementation plan (ARC-604) (ARC-604)
- apply final spec review fixes (ARC-604) (ARC-604)
- apply spec review fixes (ARC-604) (ARC-604)
- add user-list & role-editor design spec (ARC-604) (ARC-604)

## [1.13.2] - 2026-05-08

### Added

- add /admin shell with server-side admin gate (ARC-602) (ARC-602)
- add admin namespace to all 5 locales (ARC-602) (ARC-602)
- add requireAdmin server helper for /admin gate (ARC-602) (ARC-602)
- add AdminModule with /admin/ping demo endpoint (ARC-602) (ARC-602)
- add RolesGuard with DB-backed role lookup (ARC-602) (ARC-602)
- add ROLES_KEY constant and @Roles() decorator (ARC-602) (ARC-602)

### Documentation

- apply plan review fixes (ARC-602) (ARC-602)
- add implementation plan for admin shell (ARC-602) (ARC-602)
- apply final spec review fixes (ARC-602) (ARC-602)
- address spec review feedback (ARC-602) (ARC-602)
- add admin shell design spec (ARC-602) (ARC-602)

## [1.13.1] - 2026-05-08

### Fixed

- advance turn when active player leaves (ARC-600) (ARC-600)

## [1.13.0] - 2026-05-08

## [1.12.10] - 2026-05-08

### Fixed

- keep seeded ticker events from expiring (ARC-594) (ARC-594)
- use generous default timeout for browser fetches (ARC-594) (ARC-594)

## [1.12.9] - 2026-05-08

## [1.12.8] - 2026-05-08

### Added

- tournament section "coming soon" placeholder (ARC-588) (ARC-588)
- leaderboards reads real data from game history (ARC-588) (ARC-588)
- auto-seed leaderboards in dev when empty (ARC-588) (ARC-588)
- leaderboards player profile + storybook + e2e (ARC-588) (ARC-588)
- leaderboards search, cache, freshness, profile stub (ARC-588) (ARC-588)
- leaderboards push updates via realtime gateway (ARC-588) (ARC-588)
- leaderboards seeder, capture, gateway, live-match (ARC-588) (ARC-588)
- leaderboards module + FE wiring (ARC-588) (ARC-588)
- leaderboards Neon Arcade visual rebuild (ARC-588) (ARC-588)
- leaderboard page with mythic spotlight and rank table (ARC-588) (ARC-588)

### Fixed

- address PR #591 review (ARC-588) (ARC-588)
- default Stats page to the Leaderboard tab (ARC-588) (ARC-588)
- use aria-label instead of accessibilityLabel on web (ARC-588) (ARC-588)
- drop Texas Hold'em and Tic Tac Toe modes (ARC-588) (ARC-588)
- use real Arcadeum games (Critical, Sea Battle, Texas Hold'em, Tic Tac Toe) (ARC-588) (ARC-588)
- dev fallback for MONGODB_URI (ARC-588) (ARC-588)
- dev fallback for AUTH_JWT_SECRET (N/A)
- skip leaderboards socket connect under mock (ARC-588) (ARC-588)
- pin leaderboard self row via position:fixed (ARC-588) (ARC-588)
- address review #2 for leaderboards (ARC-588) (ARC-588)
- address PR #591 review for leaderboards (ARC-588) (ARC-588)

### Improved

- cut socket spam on leaderboards (ARC-588) (ARC-588)
- cache + dedupe leaderboards upstream scan (ARC-588) (ARC-588)

## [1.12.7] - 2026-05-07

### Fixed

- persist sea battle lobby variant changes to backend (ARC-578) (ARC-578)

## [1.12.6] - 2026-05-07

### Added

- add team chat channel switcher (ARC-427) (ARC-427)
- show team rosters and teammate boards in sea battle (ARC-427) (ARC-427)
- mount team-mode UI in sea battle lobby (ARC-427) (ARC-427)
- add team-mode lobby components for sea battle (ARC-427) (ARC-427)
- add i18n keys for sea battle team mode (ARC-427) (ARC-427)
- make sea battle bot team-aware (ARC-427) (ARC-427)
- wire team config into sea battle session start (ARC-427) (ARC-427)
- add team-mode lobby socket events to sea battle gateway (ARC-427) (ARC-427)
- add SeaBattleTeamConfigService for lobby team management (ARC-427) (ARC-427)
- add sea battle team-mode DTOs (ARC-427) (ARC-427)
- gate attack action on active shooter and bump max players (ARC-427) (ARC-427)
- team-aware sanitization in sea battle (ARC-427) (ARC-427)
- team-aware win condition in sea battle (ARC-427) (ARC-427)
- rotate by team on miss in sea battle (ARC-427) (ARC-427)
- block teammate attacks in sea battle (ARC-427) (ARC-427)
- initialize team state in sea battle engine (ARC-427) (ARC-427)
- add team rotation helpers for sea battle (ARC-427) (ARC-427)
- add sea battle team-mode types and constants (ARC-427) (ARC-427)

### Fixed

- clear lint errors on ARC-427 branch (ARC-427) (ARC-427
  ARC-427)
- cap board grid columns by container width (ARC-427) (ARC-427)
- show sequential bot labels instead of "Unknown" (ARC-427) (ARC-427)
- pick board grid columns from board count (ARC-427) (ARC-427)
- remove duplicate sea battle team roster (ARC-427) (ARC-427)
- render teammate ships on attack board (ARC-427) (ARC-427)
- collapse to a single lobby scroll in team mode (ARC-427) (ARC-427)
- make team-mode lobby scroll as one container (ARC-427) (ARC-427)
- merge team setup into team cards to remove duplication (ARC-427) (ARC-427)
- make team-mode toggles clearly visible (ARC-427) (ARC-427)
- restore lobby flex height after team panel hoist (ARC-427) (ARC-427)
- unify sea battle team-mode lobby into single card (ARC-427) (ARC-427)
- polish sea battle team-mode UX (ARC-427) (ARC-427)
- team-aware win detection and shooter cleanup on eliminate (ARC-427) (ARC-427)

### Refactored

- split AttackBoard.tsx and add team color frames (ARC-427) (ARC-427)
- move Toggle and StatusBadge into @arcadeum/ui (ARC-427) (ARC-427)
- reuse ChatScope type in sea battle ChatPayload (ARC-427) (ARC-427)

### Documentation

- add sea battle team mode implementation plan (ARC-427) (ARC-427)
- add sea battle team mode design spec (ARC-427) (ARC-427)

## [1.12.5] - 2026-05-07

### Added

- show opponent names and sequential bot labels on boards [ARC-585] (ARC-585)
- fix board layout and improve turn visibility [ARC-585] (ARC-585)
- improve turn visibility and refactor animations [ARC-585] (ARC-585)

### Fixed

- update ships-left test locator to support new player headers [ARC-585] (ARC-585)
- add missing translation keys to all languages to fix build [ARC-585] (ARC-585)
- add missing translations and fix bot naming [ARC-585] (ARC-585)
- update sea-battle tests for grid layout and specific animation classes [ARC-585] (ARC-585)
- optimize board scaling and fix label alignment in 3-column layout [ARC-585] (ARC-585)
- improve grid layout for 6 players and fix turn visibility [ARC-585] (ARC-585)
- improve modal close reliability on WebKit by using onClick [ARC-585] (ARC-585)
- resolve Tamagui display grid type restriction [ARC-585] (ARC-585)
- refactor board grid styles without ts-ignore using functional wrappers [ARC-585] (ARC-585)
- resolve grid layout type error in board styles [ARC-585] (ARC-585)

### Refactored

- remove Tamagui from board components to improve stability [ARC-585] (ARC-585)

## [1.12.4] - 2026-05-07

### Added

- expand contact tips card to balance the columns (ARC-575) (ARC-575)
- add system-status card to contact side panel (ARC-575) (ARC-575)
- add tips card under contact form (ARC-575) (ARC-575)
- convert contact form to a Server Action (ARC-575) (ARC-575)
- rework /contact page with new components (ARC-575) (ARC-575)
- add contact rework keys for en/ru/es/fr/by (ARC-575) (ARC-575)
- add LaunchButton variant (ARC-575) (ARC-575)
- add ChannelTile and StatTile components (ARC-575) (ARC-575)
- add FloatingLabelInput / FloatingLabelTextArea (ARC-575) (ARC-575)
- add ActivityTicker component (ARC-575) (ARC-575)

### Fixed

- keep contact action file pure async exports (ARC-575) (ARC-575)
- ChannelTile fills its grid cell so tiles match heights (ARC-575) (ARC-575)
- drop e2e click-retry that races with the Server Action (ARC-575) (ARC-575)
- hide status-page CTA until status.arcadeum.games is live (ARC-575) (ARC-575)
- balance contact columns via CSS module (ARC-575) (ARC-575)
- resolve ActivityTicker hydration mismatch (ARC-575) (ARC-575)
- server-render the /contact page (ARC-575) (ARC-575)
- trim x fallback chain, fill Instagram icon, default hero pills (ARC-575) (ARC-575)
- drive contact channel tiles from appConfig.social (ARC-575) (ARC-575)
- swap hard-coded contact strings for i18n (ARC-575) (ARC-575)
- resolve theme tokens via useTheme on /contact (ARC-575) (ARC-575)
- natural form height and resolved floating-label colors (ARC-575) (ARC-575)
- widen contact container to 1120px (ARC-575) (ARC-575)
- tighten contact form responsive + remove blank space (ARC-575) (ARC-575)
- collapse blank space under contact form (ARC-575) (ARC-575)
- trim press card and link FAQ emails (ARC-575) (ARC-575)
- match contact-page design — avatars + stat sparkline (ARC-575) (ARC-575)

### Refactored

- drop redundant controlled state in ContactForm (ARC-575) (ARC-575)
- extract ContactForm component (ARC-575) (ARC-575)

### Documentation

- document contact API constraints (ARC-575) (ARC-575)
- add contact-rework design handoff (ARC-575) (ARC-575)

## [1.12.3] - 2026-05-07

### Added

- fix tablet layout and finalize rendering optimization (N/A)
- optimize rendering performance and refactor placement board (N/A)

## [1.12.2] - 2026-05-06

### Fixed

- bump primary color from sky-600 to sky-700 for WCAG AA (ARC-570)
- restore aria-label on install-pwa-button (e2e regression) (ARC-570)

### Improved

- drop legacy JS polyfills via explicit browserslist (ARC-570)

### Refactored

- bundle home route CSS via parent-eager imports (ARC-570)

### Documentation

- Phase 2 implementation results + spec/plan (ARC-570)
- track docs/superpowers + Phase 2 diagnostic results (ARC-570)

## [1.12.1] - 2026-05-06

### Improved

- drop hero LCP-blocking visual effects on mobile (ARC-570)
- defer hero ::after LCP overlay; dynamic-import below-fold; a11y (ARC-570)
- polish in-progress home perf diff + add bundle analyzer (ARC-570)

## [1.12.0] - 2026-05-03

## [1.11.2] - 2026-05-03

### Fixed

- token colors (N/A)
- sitemap ts (ARC-564)
- homepage e2e test (ARC-564)
- chat message e2e test for ci (ARC-564)
- chat interactions e2e test (N/A)
- tamagui config colors (N/A)

### Refactored

- integrate Tamagui Dialog.Close for modal dismissals and optimize confirmation modal event handlers (ARC-564)
- integrate Tamagui Dialog.Close for modal dismissals and optimize confirmation modal event handlers (ARC-564)
- update routing configuration, implement SEO metadata across pages, and add TestCrash utility (ARC-564)

## [1.11.1] - 2026-05-03

### Fixed

- release yml (ARC-560)

## [1.11.0] - 2026-05-02

## [1.10.2] - 2026-05-02

### Fixed

- mobile menu sign out button color (ARC-561)
- hero support button styles (ARC-561)
- ships left gaps (ARC-561)
- game over e2e test (ARC-561)
- sea battle field styles (ARC-561)

## [1.10.1] - 2026-05-02

### Fixed

- test crash e2e message (ARC-560)
- release yml (ARC-560)

## [1.10.0] - 2026-05-01

## [1.9.30] - 2026-05-01

### Fixed

- stabilize idle detection tests by adding store synchronization and updating e2e configurations (ARC-446)
- prevent stale initialData from overwriting active room state and update E2E room mocks to support dynamic state synchronization (ARC-446)

## [1.9.29] - 2026-05-01

### Fixed

- sea battle chat e2e test (ARC-446)
- resolve CORS errors in e2e tests (ARC-446)
- e2e tests timeouts (ARC-446)
- e2e tests warnings (ARC-446)

### Refactored

- use polling with state verification to improve E2E test reliability for chat popups (ARC-446)

## [1.9.28] - 2026-04-30

## [1.9.27] - 2026-04-30

### Fixed

- home hero animation (ARC-554)

### Documentation

- update upstream remote URL and project live demo link (N/A)

## [1.9.26] - 2026-04-29

### Added

- optimize mobile layout and enhance background animations (N/A)

## [1.9.25] - 2026-04-29

### Refactored

- extract InstallAppCta widget and reuse on settings (ARC-487)

## [1.9.24] - 2026-04-29

### Added

- tighten layout paddings on $sm (ARC-485)
- horizontal opponent strip and chip avatars on $sm (ARC-485)
- horizontal Deck/LastPlayed/Discard row on $sm (ARC-485)
- add sticky MobileActionBar; hide ActionsSection on $sm (ARC-485)
- wire CardActionsPopover into PlayerHand on $sm (ARC-485)
- add CardActionsPopover for mobile hand interactions (ARC-485)
- switch hand to horizontal nowrap strip on $sm (ARC-485)
- enlarge mobile hand cards to 88x120 (ARC-485)

### Fixed

- e2e tests for critical web mobile (ARC-485)
- expose data-cardtype and skip layout test on $sm (ARC-485)
- use actions.title for in-game ActionsSection panel (ARC-485)
- pin Create Room button to viewport bottom on mobile (ARC-485)
- change overflowY property to 'auto' in GameContainer (ARC-485)

### Documentation

- add critical game mobile redesign implementation plan (ARC-485)
- add critical game mobile redesign spec (ARC-485)

## [1.9.23] - 2026-04-28

### Refactored

- update presentation and hero section layout with responsive design improvements and animations (ARC-486)

## [1.9.22] - 2026-04-24

### Added

- respect prefers-reduced-motion in TurnBanner + scene (ARC-480)
- add MobileActionSheet with $sm-gated rendering (ARC-480)
- restyle HUD, actions, and log strip (ARC-480)
- restyle player hand fan (desktop) + strip (mobile) (ARC-480)
- restyle opponent avatars with turn ring + halo (ARC-480)
- restyle center stacks with scene palette (ARC-480)
- mount SceneBackdrop + TurnBanner in ActiveGameView (ARC-480)
- add TurnBanner component (ARC-480)
- add SceneBackdrop component (ARC-480)
- add scene backdrop styled components (ARC-480)
- add ScenePaletteProvider context (ARC-480)
- add getCardRole helper covering ALL_GAME_CARDS (ARC-480)
- add per-variant scene palettes (ARC-480)
- add base scene palette + resolution test (ARC-480)
- add VariantScenePalette type (scene palette skeleton) (ARC-480)

### Fixed

- update translation keys for mobile action sheet in ActiveGameView (ARC-480)
- update translation key for eliminated players in TablePlayer component (ARC-480)

### Refactored

- remove ParticleOverlay (replaced by SceneBackdrop) (ARC-480)
- hoist deck style literal to avoid drift (ARC-480)

### Documentation

- add critical active game redesign implementation plan (ARC-480)
- add critical active game redesign spec (ARC-480)

## [1.9.21] - 2026-04-24

### Refactored

- modernize e2e tests with mockGameSocket and wrap dynamic renderer error messages in Text component (ARC-482)
- migrate UI components from Tamagui to native CSS for improved layout stability and performance (ARC-482)

## [1.9.20] - 2026-04-20

### Added

- footer github icon (ARC-481)

## [1.9.19] - 2026-04-20

### Refactored

- global css styles (ARC-479)

## [1.9.18] - 2026-04-19

### Added

- add kick/leave UI, store actions, game wiring, and fix flaky e2e tests (N/A)
- pass kicked flag through realtime emitPlayerLeft (N/A)
- extend leaveRoom authorization for host kick flow (N/A)
- add kickedBy to LeaveGameRoomDto and kicked flag to result type (N/A)

### Documentation

- add lobby kick/leave implementation plan (N/A)
- add lobby kick & leave design spec (N/A)

## [1.9.17] - 2026-04-16

### Fixed

- build import error (ARC-471)
- be cors policy (ARC-471)

## [1.9.16] - 2026-04-16

### Fixed

- sea battle ships placement styles (ARC-472)

## [1.9.15] - 2026-04-16

### Fixed

- staging cors errors (ARC-471)

## [1.9.14] - 2026-04-15

### Added

- images for additional critical game variants (ARC-457)

## [1.9.13] - 2026-04-15

### Fixed

- unuseed tamgui in page loading (ARC-471)

## [1.9.12] - 2026-04-15

### Fixed

- get started button logic (ARC-470)

## [1.9.11] - 2026-04-14

### Fixed

- e2e ci cd less shards with jobs (ARC-469)

## [1.9.10] - 2026-04-14

### Fixed

- critical games styles (ARC-468)

## [1.9.9] - 2026-04-14

### Fixed

- home page seo and a11y (ARC-467)

## [1.9.8] - 2026-04-13

### Refactored

- same games widget container for all games (ARC-465)

## [1.9.7] - 2026-04-13

### Fixed

- tamagui configs (ARC-466)

## [1.9.6] - 2026-04-13

### Fixed

- request errors and warnings (ARC-461)

## [1.9.5] - 2026-04-10

### Fixed

- remove react query (ARC-460)

## [1.9.4] - 2026-04-07

### Added

- wire crime/horror/adventure full variant styles in getVariantStyles (ARC-456)
- full variant immersion styles for adventure theme (ARC-456)
- full variant immersion styles for horror theme (ARC-456)
- compact single-row CriticalGameHeader with glassy pill (ARC-456)
- add SeaBattleThemePreview component (ARC-456)
- redesign SeaBattleLobby with theme tabs and live board preview (ARC-456)
- redesign AttackBoard with sunk cells, emoji icons, glassmorphism (ARC-456)
- add useDragPlacement hook (ARC-456)
- add TurnBadge component (ARC-456)
- add CSS animations hook for sea battle UI (ARC-456)

### Fixed

- critical game widget styles (ARC-456)
- fill viewport on mobile and eliminate empty space below game content (ARC-456)
- apply GameTitle gradient via inline span to avoid Tamagui DOM prop warning (ARC-456)
- export TurnStatusPill/VariantIconBadge from barrel, clean up header (ARC-456)
- sea battle game styles (ARC-456)
- e2e tests failings (ARC-456)
- game chat layout (ARC-456)
- game control pannel styles (ARC-456)

### Refactored

- compact glassy pill header styled components (ARC-456)
- no-op getTitleTextStyles in all existing variant configs (ARC-456)
- compute ownIcon once per cell in AttackBoard own-board render (ARC-456)

### Documentation

- add Critical game header and variant styles design spec (ARC-456)
- add Sea Battle UI redesign spec (ARC-456) (ARC-456)

## [1.9.3] - 2026-04-02

### Added

- PORT env var for web and be (ARC-458)

## [1.9.2] - 2026-04-01

### Added

- add prophecy deity pack card with commit_prophecy (ARC-432) (ARC-432
  ARC-432)
- add judgment deity pack card (ARC-432) (ARC-432
  ARC-432)
- add resurrection deity pack card (ARC-432)
- add echo chaos pack card with dispatchCard helper (ARC-432) (ARC-432
  ARC-432)
- add scramble chaos pack card (ARC-432) (ARC-432
  ARC-432)
- add snatch theft pack card (ARC-432) (ARC-432
  ARC-432)
- add swap_hands theft pack card (ARC-432) (ARC-432
  ARC-432)
- implement shield_bash card (ARC-432)
- implement chain_strike card (ARC-432)
- add eliminatedPlayers and pendingJudgment state fields (ARC-432)
- extend card type definitions and deck quantities for 9 new cards (ARC-432)

### Fixed

- lint warnings (ARC-432)
- update deck size assertions for new attack and theft pack cards (ARC-432) (ARC-432
  ARC-432)
- fix prophecy duplicate card validation and split deity spec file (ARC-432) (ARC-432
  ARC-432)
- add critical_implosion to echo forbidden list and integration test (ARC-432) (ARC-432
  ARC-432)
- remove dead code in scramble un-cancel branch (ARC-432) (ARC-432
  ARC-432)
- add snatch to CARDS_REQUIRING_DRAWS and fix validation (ARC-432) (ARC-432
  ARC-432)
- fix swap_hands cancel handler, self-target guard, and add tests (ARC-432) (ARC-432
  ARC-432)
- add shield_bash validation and available actions (ARC-432) (ARC-432
  ARC-432)
- add chain_strike validation and available actions entry (ARC-432)

### Refactored

- remove duplicate chain_strike carry-over block (ARC-432)

## [1.9.1] - 2026-04-01

### Added

- pages from footer list (ARC-425)
- presentation and pitch deck scroll reveal (ARC-425)
- how it works scroll reveal and step number hover glow (ARC-425)
- features section scroll reveal and card/icon hover (ARC-425)
- games section scroll reveal and card hover lift (ARC-425)
- improve hero proportions, kicker badge, demote support CTA (ARC-425)
- add useScrollReveal hook and CSS reveal/stagger system (ARC-425)
- add violet and teal theme options to settings picker (N/A)
- register violetDark, violetLight, tealDark, tealLight Tamagui themes (N/A)
- add violetDark, violetLight, tealDark, tealLight theme tokens (N/A)
- expand ThemeName type with violetDark, violetLight, tealDark, tealLight (ARC-425)
- complete home page tamagui migration — remove Animations.styles (ARC-425)
- migrate HomePitchDeck and WebPresentation styles to tamagui (ARC-425)
- migrate HomePresentation styles to tamagui (ARC-425)
- migrate HomeDownloadCta styles to tamagui (ARC-425)
- migrate HomeGames styles to tamagui (ARC-425)
- migrate HomeHowItWorks styles to tamagui (ARC-425)
- migrate HomeFeatures styles to tamagui (ARC-425)
- migrate HomeHero styles to tamagui (ARC-425)
- migrate home Common styles and add CSS keyframes to tamagui (ARC-425)
- auth page styles to tamagui (ARC-425)
- mobile menu styles (ARC-425)
- wrap SeaBattleGame in ThemeProvider, remove styled-components (ARC-425)
- migrate ShipPlacementBoard to Tamagui context (ARC-425)
- migrate AttackBoard to Tamagui context (ARC-425)
- migrate remaining UI components to Tamagui (ShipsLeft, Popup, RulesModal, Grids, Lobby, Table) (ARC-425)
- migrate SeaBattleGame styles/ from styled-components to Tamagui (ARC-425)
- add TurnIndicator component to packages/ui (ARC-425)
- create SeaBattleThemeContext with provider and hook (ARC-425)
- add chat message popup via shared GameChat hook (N/A)
- replace ChatSection with shared GameChat widget (N/A)
- add ChatMessagePopup component and update exports (N/A)
- add useLatestChatMessage hook (N/A)
- add frosted glass card containers with responsive sprites (ARC-425)
- enable crime, horror, adventure card variants (ARC-425)
- add isolated ParticleOverlay to ActiveGameContent (ARC-425)
- add ParticleOverlay with per-variant ambient effects and global cardFlip keyframe (ARC-425)
- update PlayerHand to use CardImage, GradientScrim, and card flip animation (ARC-425)
- add useCardFlip hook for card draw reveal animation (ARC-425)
- update DeckDisplay — replace CardEmoji with CardImage sprite frames (ARC-425)
- add CardImage sprite-sheet component (ARC-425)
- update DeckCard/StashedCard variant handlers; add hover glow to HandCard (ARC-425)
- add GradientScrim component to cards-base (ARC-425)
- add crime, horror, adventure variant configs and register in index (ARC-425)
- remove getDeckBackground/getDeckBorder from existing variant files; add getHoverGlow, getCardNameColor (ARC-425)
- update VariantStyleConfig — add getHoverGlow, getCardNameColor, deckBorderColor; remove getDeckBackground/getDeckBorder (ARC-425)
- add Tamagui GameRow and ChatPanel layout components (ARC-425)
- update SeaBattle ChatMessagePopup to use ChatMessageBubble (ARC-425)
- add GameChat to GameRoomPage with showChat state (ARC-425)
- convert GamesControlPanel to Tamagui, add chat toggle (ARC-425)
- remove chat from CriticalGame, add gameChatStore bridge (ARC-425)
- add GameChat panel component (ARC-425)
- add gameChatStore Zustand bridge (ARC-425)
- change styled components to tamagui in widgets critical (ARC-425)
- change styled components to tamagui in features games folder (ARC-425)
- tamagui ui kit (ARC-425)

### Fixed

- header hover e2e ci tests (ARC-425)
- e2e header test (ARC-425)
- e2e test (ARC-425)
- e2e test (ARC-425)
- cors warnings in e2e (ARC-425)
- unit tests failed on ci (ARC-425)
- accessibility colors (ARC-425)
- any types (ARC-425)
- sync chat visibility to breakpoint, fix container scroll on md screens (ARC-425)
- prevent game widget overflow bleeding onto chat panel on narrow screens (ARC-425)
- haptic toggler styles (ARC-425)
- home screen support developrs button (ARC-425)
- use render-phase pathname check in useMobileMenu to satisfy lint (ARC-425)
- header and footer styles (ARC-425)
- download pwa button (ARC-425)
- handle 500 (ARC-425)
- e2e tests (ARC-425)
- remove warnings (ARC-425)
- hero title styles (ARC-425)
- hero cards styles (ARC-425)
- fix CardTitle/ProgressLabel/ShareLinkRow text styling (N/A)
- hoist style tag to outermost wrapper in ReferralDashboard (N/A)
- address code review issues — style tag placement, aria-label on haptics toggle (N/A)
- export notesStyles, restore stagger animation, fix AmountBadge (N/A)
- address code review issues — style dedup, dead exports, GameIcon, color tokens (N/A)
- address code review issues — class names, mobile grid, hover, XStack, scroll context (N/A)
- address code review issues — orphaned Footer.styles, text-secondary color token (N/A)
- home page unit tests (ARC-425)
- accessibility and code quality fixes from final review (ARC-425)
- add delay cap to HIW steps, disable hover motion for prefers-reduced-motion (ARC-425)
- icon scales on card hover via CSS descendant selector (ARC-425)
- use Tamagui Text for support link to preserve color/font tokens (ARC-425)
- restore YouTube embed privacy params in HomePresentation (ARC-425)
- resolve Hero section CSS vars, perspective, and hover effect (ARC-425)
- restore size=xl and overflowX on Common styles (ARC-425)
- restore CSS grid layout for BoardWithLabels (ARC-425)
- fix missing animations, PlayerStats and ActionButton in Tamagui style files (ARC-425)
- unnecessry chat in sea battle games (ARC-425)
- correct scope value in useLatestChatMessage test fixture (N/A)
- clean up GameChat imports and test fixture types (ARC-425)
- use properly-typed fn in gameChatStore tests (ARC-425)

### Refactored

- simplify MobileMenu using extracted hooks (ARC-425)
- simplify HeaderInteractive using extracted hooks (ARC-425)
- extract useMobileMenu hook for header widget (ARC-425)
- extract useClickOutside hook for header widget (ARC-425)
- extract useHeaderAuth hook for header widget (ARC-425)
- extract useIsMounted hook for header widget (ARC-425)
- remove styled-components ThemeProvider from preview (N/A)
- remove StyledThemeProvider and styled-components infrastructure (N/A)
- replace InstallPWAModalContent styled-components with Tamagui (N/A)
- replace referrals/ui/styles.ts styled-components with Tamagui (N/A)
- convert scrollbarStyles from styled-components css to plain string (N/A)
- replace error, offline, payment/cancel styled-components with Tamagui (N/A)
- replace styled-components with Tamagui (N/A)
- replace styled-components with Tamagui (N/A)
- replace NotesPage styled-components with Tamagui (N/A)
- replace ChatListPage styled-components with Tamagui (N/A)
- fix Leaderboard.tsx ref type — use native div for IntersectionObserver target (N/A)
- replace StatsOverview.tsx styled-components with Tamagui (N/A)
- replace GameBreakdown.tsx styled-components with Tamagui (N/A)
- replace StatsHeader.tsx styled-components with Tamagui (N/A)
- replace Leaderboard.tsx styled-components with Tamagui (N/A)
- replace StatsPage.tsx styled-components with Tamagui (N/A)
- replace styles.ts styled-components with Tamagui (N/A)
- replace InviteCodeModal styled-components with Tamagui (N/A)
- replace GameDetailPage styled-components with Tamagui (N/A)
- replace rooms/[id]/components/styles.ts styled-components with Tamagui (N/A)
- replace create/styles.ts styled-components with Tamagui (N/A)
- replace room-card.styles styled-components with Tamagui (N/A)
- replace games/styles.ts styled-components with Tamagui (N/A)
- replace HomeGameDetailsModal styled-components with Tamagui (N/A)
- replace Footer.styles styled-components with Tamagui (N/A)
- replace PaymentSuccessView styled-components with Tamagui — payment migration complete (N/A)
- replace PaymentPage styled-components with Tamagui (N/A)
- replace AmountDisplay styled-components with Tamagui (N/A)
- replace PaymentPresets styled-components with Tamagui (N/A)
- replace PaymentHeader styled-components with Tamagui (N/A)
- rewrite logs styles with Tamagui — history page migration complete (N/A)
- rewrite participants styles with Tamagui (N/A)
- replace ConfirmRow styled-component with Tamagui XStack (N/A)
- rewrite details styles with Tamagui (N/A)
- rewrite entries styles with Tamagui (N/A)
- replace HistoryFilters styled-components with Tamagui (N/A)
- replace HistoryHeader styled-components with Tamagui (N/A)
- replace Page/Container styled-components with Tamagui (N/A)
- ui kit components (ARC-425)

### Documentation

- add styled-components to Tamagui implementation plan (N/A)
- add 640px breakpoint row, fix success criteria ordering (N/A)
- fix token gaps, breakpoints, fullscreen special case, scrollbar consumer note (N/A)
- update migration spec with corrected token mapping, breakpoints, and special cases (N/A)
- add styled-components to Tamagui migration design spec (N/A)
- clarify why data-reveal must be on descendants not ref target (ARC-425)
- clarify useScrollReveal ref vs data-reveal constraint (ARC-425)
- add home page tamagui migration spec (ARC-425)
- add CriticalGame rework implementation plan (N/A)
- finalize CriticalGame rework spec after review (N/A)
- add CriticalGame widget rework design spec (N/A)

## [1.9.0] - 2026-03-19

## [1.8.2] - 2026-03-19

### Added

- SEO optimizations for new domen (ARC-480)

## [1.8.1] - 2026-03-11

### Fixed

- changelog md changes (ARC-450)

## [1.8.0] - 2026-03-11

## [1.7.21] - 2026-03-11

### Fixed

- versioning after merge to develop (ARC-449)

## [1.7.19] - 2026-03-10

### Documentation

- update 1.7 release docs (ARC-448)

## [1.7.18] - 2026-03-10

### Added

- Made game layouts automatically rotate on mobile devices for better orientation (ARC-445)

## [1.7.17] - 2026-03-10

### Fixed

- Optimized CI/CD pipeline configuration for faster and more reliable builds (ARC-447)

## [1.7.16] - 2026-03-10

### Fixed

- Improved clarity and visibility of the download button for better user guidance (ARC-442)

## [1.7.15] - 2026-03-10

### Fixed

- Refined header layout to improve usability on mid-sized tablets and foldable devices (ARC-444)

## [1.7.14] - 2026-03-10

### Fixed

- Fixed a critical bug in the Maelstrom card action that could cause game state errors (ARC-409)

## [1.7.13] - 2026-03-10

### Fixed

- Improved tablet layout for Sea Battle to ensure proper spacing and touch targets (ARC-440)

## [1.7.12] - 2026-03-10

### Fixed

- Corrected color inconsistencies in theme buttons within Settings menu (ARC-438)

## [1.7.11] - 2026-03-09

### Documentation

- Updated SECURITY.md with current practices and contact information (ARC-443)

## [1.7.10] - 2026-03-09

### Fixed

- Fixed layout issues on mobile devices that caused game tables to overflow or misalign (ARC-441)

## [1.7.9] - 2026-03-09

### Added

- Added color-coded field indicators in the Sea Battle lobby to help players identify their territory (ARC-426)

## [1.7.8] - 2026-03-09

### Fixed

- Fixed an issue where the Play Again modal would not appear correctly after a match ended (ARC-442)

## [1.7.7] - 2026-03-09

### Added

- Added a pop-up notification when sending messages in Sea Battle to confirm successful delivery (ARC-413)

## [1.7.6] - 2026-03-06

### Fixed

- Resolved video attribute warnings in E2E tests that were cluttering logs (N/A)
- Fixed an issue where users were stuck on an idle screen after navigating away from a game (ARC-439)

## [1.7.5] - 2026-03-06

### Added

- Added a refresh button to the "Waiting for Game Start" modal to let players manually retry connection (ARC-414)

## [1.7.4] - 2026-03-05

### Added

- Reordered sections on the home screen to prioritize the most popular games and features (ARC-433)

### Fixed

- Fixed a 404 error in E2E tests related to payment endpoints (N/A)
- Updated Playwright configuration for more stable test runs (N/A)
- Streamlined CI/CD configuration for improved reliability (N/A)

## [1.7.3] - 2026-03-03

### Added

- Added automated tests for CI/CD pipelines to catch configuration issues before deployment (#463) (ARC-436)

## [1.7.2] - 2026-03-02

### Fixed

- Fixed a bug in the documentation link checker script that caused false positives (N/A)

### Documentation

- Added detailed backend and frontend architecture diagrams to improve developer onboarding (ARC-435)

## [1.7.1] - 2026-03-02

### Fixed

- Improved room creation logic to properly clear stale game data when a room is deleted (ARC-408)

## [1.7.0] - 2026-02-27

### Added

- This release focused on polish and stability, with improvements to layout, usability, and testing infrastructure across all platforms.

### Fixed

- Numerous minor UI and performance fixes to enhance the overall user experience.

## [1.6.4] - 2026-02-27

### Added

- Added alternative deployment configuration (ARC-422)
- Added new "High Altitude Hike" critical game variant (ARC-420)
- Added links to Threads, Discord, and X (ARC-405)

### Fixed

- Fixed translations for the "High Altitude Hike" game (ARC-431)
- Improved scroll UI styles in the game rules modal (ARC-416)
- Clarified turn indication in Sea Battle (ARC-412)
- Fixed invite link generation and display (ARC-407)
- Corrected typo: replaced "be" with "by" in UI text (ARC-415)
- Updated Sea Battle color scheme to modern palette (ARC-406)
- Enhanced E2E test utilities for reliability (ARC-405)

### Documentation

- Updated Code of Conduct (ARC-424)
- Updated contributing guidelines (ARC-411)

## [1.6.3] - 2026-02-27

### Added

- delete room functionality (ARC-430)

## [1.6.2] - 2026-02-27

### Added

- show idle players on ui (ARC-428)

## [1.6.1] - 2026-02-27

### Fixed

- minor version number (N/A)
- release version after merging to main (ARC-429)

## [1.5.12] - 2026-02-27

### Fixed

- scroll ui styles in game rules modal (ARC-416)

## [1.5.11] - 2026-02-27

### Fixed

- Improved clarity of turn indication in Sea Battle game (ARC-412)
- Improved clarity of turn indication in Sea Battle game (ARC-412)
- Fixed invite link generation and display issues (ARC-407)
- Updated Code of Conduct document (ARC-424)
- Added alternative deployment configuration options (ARC-422)

## [1.5.7] - 2026-02-26

### Added

- Introduced new high-altitude hike critical game variant (ARC-420)

## [1.5.6] - 2026-02-26

### Fixed

- Corrected version bump YAML configuration (ARC-421)

## [1.5.5] - 2026-02-26

### Added

- Added new game variant support for upcoming features
- New game variants in development
- Enhanced user interface improvements
- Performance optimizations for mobile devices

### Fixed

- Various UI inconsistencies across platforms
- Minor bugs in game state management

### Improved

- Documentation for developers and contributors

## [1.5.4] - 2026-02-25

### Fixed

- Corrected typo: replaced "be" with "by" in user interface text (ARC-415)

## [1.5.3] - 2026-02-25

### Fixed

- Updated Sea Battle game with modern color scheme for better visual appeal (ARC-406)

## [1.5.2] - 2026-02-25

### Documentation

- Added comprehensive contributing guidelines to help new contributors get started (ARC-411)

## [1.5.1] - 2026-02-25

### Fixed

- Improved E2E test utilities for more reliable automated testing (ARC-405)

### Added

- Added links to official Threads, Discord, and X (Twitter) community channels (ARC-405)

## [1.5.0] - 2026-02-22

### Added

- Major release with numerous improvements to gameplay, UI, and performance

## [1.4.1] - 2026-02-22

### Fixed

- Fixed issues with ship placement buttons in Sea Battle game (ARC-404)

## [1.4.0] - 2026-02-22

### Added

- Added support for new game variants and improved game flow

## [1.3.2] - 2026-02-22

### Fixed

- Resolved mobile display issues in Sea Battle game

## [1.3.1] - 2026-02-22

### Fixed

- Improved mobile experience for Sea Battle game with better touch targets and layout (ARC-403)

## [1.3.0] - 2026-02-22

### Added

- Added language selection feature to header for multilingual support

### Feature

- Ability to change language at header (ARC-402)

### Fixed

- Improved E2E test utilities (ARC-405)

## [1.2.4] - 2026-02-22

### Added

- Sea Battle now featured on the main games page for better visibility (ARC-391)

## [1.2.3] - 2026-02-22

### Fixed

- Fixed mobile navigation menu display issues on smaller screens (ARC-389)

## [1.2.2] - 2026-02-22

### Fixed

- Anonymous users can no longer see private games in the game list (ARC-388)

## [1.2.1] - 2026-02-22

### Improved

- Optimized game performance for smoother gameplay and faster load times (ARC-390)

## [1.2.0] - 2026-02-22

### Added

- Major update with new features and improved user experience

## [1.1.4] - 2026-02-20

### Added

- Added sharing incentives to encourage players to invite friends (ARC-387)

## [1.1.3] - 2026-02-20

### Fixed

- Anonymous users are now excluded from game statistics to protect privacy (ARC-386)

## [1.1.2] - 2026-02-20

### Added

- Implemented frictionless invite system to easily invite friends to games (ARC-385)

## [1.1.1] - 2026-02-19

### Added

- Now you can play against AI bots without needing to create an account (ARC-370)

## [1.1.0] - 2026-02-12

### Added

- New features for improved social gameplay and user experience

## [1.0.21] - 2026-02-11

### Added

- Added "Support Developers" button to header for easy access to funding options (ARC-369)

## [1.0.20] - 2026-02-11

### Fixed

- Fixed middleware configuration for better API proxy handling (ARC-368)

## [1.0.19] - 2026-02-10

### Fixed

- Improved YouTube video cover image display on the homepage (ARC-364)

## [1.0.18] - 2026-02-10

### Added

- Added comprehensive rules guide for Sea Battle game to help new players (ARC-365)

## [1.0.17] - 2026-02-10

### Added

- Now shows remaining ships count near the battlefield for better game awareness (ARC-363)

## [1.0.16] - 2026-02-10

### Added

- Added option to select number of AI bots in single-player mode (ARC-366)

## [1.0.15] - 2026-02-09

### Added

- Introduced single-player mode to play against AI opponents (ARC-361)

## [1.0.14] - 2026-02-09

### Fixed

- Fixed issue where players could select unavailable game variants in the lobby (ARC-362)

## [1.0.13] - 2026-02-09

### Improved

- Optimized web application performance for faster loading and smoother interaction (ARC-360)

## [1.0.12] - 2026-02-09

### Added

- Enhanced logo text styling for better brand recognition and visual appeal (ARC-359)

## [1.0.11] - 2026-02-09

### Fixed

- Statistics list now properly displays game IDs for easier tracking and reference (ARC-358)

## [1.0.10] - 2026-02-09

### Added

- Improved chat interface with modern styling and better readability (ARC-342)

## [1.0.9] - 2026-02-09

### Refactored

- Unified game result modals across all games for consistent user experience (ARC-346)

## [1.0.8] - 2026-02-08

### Fixed

- Fixed issue where both players were seeing the "lose" screen simultaneously in Sea Battle (ARC-344)

## [1.0.7] - 2026-02-08

### Added

- Added real-time username validation to prevent invalid characters during registration (ARC-345)

## [1.0.6] - 2026-02-08

### Added

- Improved history page design with better organization and visual clarity (ARC-341)

## [1.0.5] - 2026-02-08

### Added

- Enhanced statistics page with improved charts and data visualization (ARC-340)

## [1.0.4] - 2026-02-08

### Fixed

- Resolved Google authentication configuration issues for smoother login process (ARC-343)

## [1.0.3] - 2026-02-08

### Fixed

- Minor bug fixes and stability improvements

## [1.0.2] - 2026-02-08

### Fixed

- Minor bug fixes and performance improvements

## [1.0.1] - 2026-02-08

### Added

- Implemented production versioning system to track releases more effectively (ARC-337)

## [1.0.0] - 2026-02-08

### Added

- Launched Sea Battle game with core gameplay mechanics (ARC-320)
- Added multiple game variants for Sea Battle (ARC-327)
- Implemented automatic ship placement feature for quicker game setup (ARC-328)
- Added Next.js PWA support for offline play and app-like experience (ARC-114)
- Created dedicated web settings page with improved UI (ARC-336)
- Enhanced PWA security with proper configuration (ARC-338)
- Introduced official Arcadeum logo for brand consistency (ARC-277)
- Implemented production versioning system (ARC-337)

### Fixed

- Limited maximum players count when creating games (ARC-325)
- Fixed email verification issues in sign-in and sign-up forms (ARC-324)

## [0.1.0] - 2026-02-08

### Added

- Rebranded "Critical" with enhanced gameplay
- Added multiple card packs: Theft, Chaos, and Deity packs
- Integrated TanStack Query for efficient data fetching
- Implemented Zustand for state management
- Added ability to click on cards in hand for better interaction
- Implemented Cyberpunk and Underwater UI variants
- Added player statistics tracking
- Added PayPal payment support with improved payment page design
- Created comprehensive game rules documentation
- Added Android TV app support
- Completely redesigned web homepage with video presentation
- Implemented E2E testing suite for reliable testing
- Added game rules display when opening games
- Implemented encrypted chat messages for privacy
- Added multilingual support with translation languages
- Upgraded Storybook to latest version
- Added error boundary for web application
- Implemented unit tests with code coverage
- Added recurring sponsorship options
- Added ability to save payment notes with user names
- Added resolveJsonModule for better package.json imports
- Optimized game performance for smoother gameplay
- Implemented frictionless invite system
- Added sharing incentives to encourage player referrals
- Added ability to play with bots without registration
- Added "Support Developers" button to header
- Added Sea Battle rules documentation
- Added ships remaining indicator in Sea Battle
- Added bot count selection in single-player mode
- Added single-player mode
- Optimized web performance
- Enhanced logo text styling
- Improved chat interface design
- Enhanced statistics page visualization
- Improved history page layout
- Added real-time username validation
- Enhanced PWA security
- Introduced official Arcadeum logo
- Implemented production versioning system

### Fixed

- Various bugs and stability improvements

## [0.0.1] - 2025-08-11

### Added

- Initial release of Arcadeum with core gameplay and basic features
