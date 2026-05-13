# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
- extend WalletReason with game_win and tournament_* (ARC-616) (ARC-616)

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
