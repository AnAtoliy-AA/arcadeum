# Spades Design (ARC-884, second half of Hearts/Spades ticket)

Companion game to Hearts on the same branch. Mirrors the Hearts implementation
structure end-to-end: BE engine + service + bot + gateway + catalog +
AI-vs-AI, web widget + registries + landing + i18n (5 locales) + tests.

## Game rules implemented

- Exactly 4 players, fixed partnerships by seat: `playerOrder[0]` + `[2]`
  are a team ("even"), `[1]` + `[3]` the other ("odd"). Partners sit across
  from each other on the table UI.
- Standard 52-card deck, 13 cards per player. Card ids identical to Hearts
  (`2C`, `10H`, `QS`, …).
- **Bidding phase**: players bid in turn (rotating first bidder each hand:
  `handNumber % 4`). A bid is `1..13` or `0` = Nil. Bids are public once
  placed.
- **Playing phase**: leader is the first bidder. Spades are always trump and
  cannot lead until broken (a spade played — led when void, or discarded)
  unless the hand holds only spades. Must follow suit when possible; if
  void, any card may be played. Highest spade wins; otherwise highest card
  of the led suit.
- **Scoring** (per team at hand end):
  - Team bid = sum of both bids (Nil contributes 0 tricks).
  - Made bid → `10 × teamBid + overtricks(bags)`; failed → `−10 × teamBid`.
  - Bags accumulate across hands; reaching 10 bags → `−100` and reset to 0.
  - Nil (when `nilEnabled`): +100 if the bidder took zero tricks, −100
    otherwise (applied in addition to the partnership's normal result).
- **Game end**: first team to reach `targetScore` (300 | 500, default 500).
  If both cross on the same hand, higher score wins; equal → draw.

## Options

| Option         | Values      | Default |
| -------------- | ----------- | ------- |
| `targetScore`  | 300 \| 500  | 500     |
| `nilEnabled`   | boolean     | true    |
| `aiDifficulty` | easy…expert | medium  |

## State highlights (`SpadesState`)

`phase` (`bidding | playing | game_over`), `hands`, `taken` (per-player
tricks), `bids: Record<string, number | null>` (0 = Nil), `currentTrick`,
`spadesBroken`, `scores` / `bags` mirrored onto both partners of a team,
`lastHandSummary` for the post-hand HUD, `logs`.

Sanitization: other players' hands masked with `??`; bids are public.

## Actions & socket events

Engine actions: `bid { amount }`, `play_card { card }`, `forfeit`.
Gateway: `spades.session.start` / `.bid` / `.play_card` / `.forfeit`,
confirmations `.bid_placed` / `.card_played`. FE hooks emit matching strings.

## Bot strategy

- Bid: easy random-ish; medium/hard count sure winners (high spades, aces,
  guarded kings); nil considered when holding ≤1 sure winner and few high
  cards.
- Play: partner-aware follow logic — duck under the current winner when the
  trick has points risk, win cheaply when opponents are winning, dump low
  when partner is winning; void → lowest spade that still beats the trick or
  discard lowest non-spade.

## Web widget

`apps/web/src/widgets/CardGames/SpadesGame/` mirroring HeartsGame with:
bidding panel (bid chips 1–13 + Nil), partner/opponent seats (partner top),
team score/bags plaques, spades-broken chip, last-hand summary strip.

## Out of scope (follow-ups)

Mobile screen, Playwright e2e beyond the home-slider assertion.
