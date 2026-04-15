# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
