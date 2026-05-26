# Cascade — UNO-Family Card Game (Widget + Lobby + Landing + Chat)

**Ticket:** ARC-XXX (next available)
**Date:** 2026-05-26
**Status:** Approved for planning
**Author:** Anatoliy + Claude

## Problem

Arcadeum currently offers turn-based board games (tic-tac-toe, sea-battle),
real-time games (glimworm), and a card game (texas-holdem). The platform has
no shedding-type matching card game — the most popular casual-card genre
worldwide (UNO sells ~150M units/year, and the genre dominates app-store
casual-card charts). Adding one fills a clear catalog gap and pulls in players
who never engage with poker or strategy titles.

Outcome: a player browsing `/games` sees **Cascade** with the same shape as
every other game on the platform — landing page, theme previews, "Create room"
/ "Browse rooms", multiplayer lobby with bots, in-room chat, full i18n.

The name **Cascade** is theme-neutral and references the game's defining
mechanic: chains of stacked Draw-Two / Draw-Four cards cascading penalty cards
onto the next player. It is intentionally not "UNO": UNO is a Mattel
registered trademark (USPTO Reg. No. 1,150,484) covering the name, logo, and
distinctive card iconography. Game _mechanics_ are not copyrightable; the
_name and visual identity_ are. Cascade uses original mechanics rooted in the
public-domain Crazy Eights family, with original art and naming.

## Goals

1. New SEO-grade landing page at `/games/cascade` modeled on `/games/sea-battle`.
2. Backend game engine `cascade` registered in `GameEnginesModule` and wired
   through `GameRoomsService` / sessions.
3. Web widget `@/widgets/CascadeGame` registered in the game registry as
   `cascade_v1`.
4. Mobile screen at `apps/mobile/app/games/cascade/`.
5. 2–10 players (lobby setting; cap scales with deck size — a single 108-card
   deck can serve 10 players comfortably).
6. Four selectable visual themes (Cosmic, Arcane, Cyberpunk, Elemental), each
   with its own color palette and action-card iconography. The rule engine is
   theme-agnostic; themes are a presentation-layer mapping only.
7. Bot from day one (single difficulty for v1 — heuristic player that prefers
   color-match, saves Wilds, and calls "Last Card" reliably).
8. Full i18n across en, ru, es, fr, by.
9. Tests: BE engine unit specs (jest), web widget vitest, Playwright e2e for
   create-room → bot game → win.
10. Ship as a single PR to `develop`.

## Non-Goals (YAGNI)

- Vegas-style "first to N points" scoring across rounds. v1 is single-round.
- Tournament-specific integration beyond what registry inclusion provides for free.
- Spectator mode.
- Bot difficulty selection. One competent bot for v1.
- Animations beyond what the existing card-component primitives provide.
  (No bespoke physics simulation — clean transitions only.)
- Custom Cascade-only leaderboards beyond standard session stats.
- Stack-on-Wild-Draw-Four. Real UNO disallows this; we follow the standard.
  Stacking is allowed only Draw-Two onto Draw-Two and Draw-Four onto Draw-Four
  (configurable per lobby — default ON for both, never cross-stacked).
- A "challenge" mechanic on Wild Draw-Four (the obscure official UNO rule
  where you can challenge whether the previous player had a legal alternative).
  Too niche; adds UI complexity without payoff.

## Core Mechanics

### Deck (108 cards)

- 4 colors × 19 number cards each = 76:
  - 1× `0`, 2× `1`–`9` per color
- 4 colors × 6 action cards = 24:
  - 2× Skip, 2× Reverse, 2× Draw-Two per color
- 8 wilds:
  - 4× Wild, 4× Wild Draw-Four

### Turn flow

1. Top of discard pile is visible to all. Each player holds a private hand.
2. On their turn, the current player must play a card matching the top by
   **color**, **number**, or **symbol**, OR play a Wild.
3. If they cannot play, they draw 1 card. If the drawn card is playable, they
   may choose to play it immediately or hold it.
4. Action cards take effect on resolution:
   - **Skip** — next player loses their turn.
   - **Reverse** — flip play direction. In 2-player games, acts as a Skip.
   - **Draw-Two** — next player draws 2, loses turn. Stackable.
   - **Wild** — current player names the active color.
   - **Wild Draw-Four** — current player names the active color; next player
     draws 4 and loses turn. Stackable onto another Wild Draw-Four only.
5. Stacking rule (lobby-configurable, default ON): a player targeted by a
   Draw-Two may play another Draw-Two of any color to pass the penalty plus
   2 more; if they cannot, they draw the accumulated total and lose their
   turn. Same rule for Wild Draw-Four onto Wild Draw-Four.
6. **Last Card call:** when a player plays their second-to-last card,
   reducing their hand to 1, they must call "Last Card" within a 3-second
   grace window. If they fail and another player flags them before the next
   turn begins, they draw 2 penalty cards. The client auto-calls after the
   grace window to protect against lag.

### Win condition

First player to reduce their hand to 0 cards wins the round. v1 is
single-round: the round ends the match. No point tally.

### Deck exhaustion

If the draw pile empties, shuffle the discard pile (except the top card)
back into the draw pile.

## Theme system

Four themes, lobby-selectable. The rule engine references cards by neutral
identity: `{ color: 'R'|'Y'|'G'|'B'|'W', kind: 'NUMBER'|'SKIP'|'REVERSE'|'DRAW_TWO'|'WILD'|'WILD_DRAW_FOUR', value?: 0..9 }`.

The theme is a pure presentation mapping from `(color, kind)` →
`{ displayName, icon, palette }`. Stored in
`apps/web/src/features/games/cascade/themes/`:

| Slot     | Cosmic        | Arcane     | Cyberpunk | Elemental |
| -------- | ------------- | ---------- | --------- | --------- |
| Red      | Red Giant     | Pyromancy  | Crimson   | Fire      |
| Yellow   | Solar Flare   | Lumen      | Voltage   | Stone     |
| Green    | Nebula        | Druidic    | Matrix    | Leaf      |
| Blue     | Pulsar        | Hydromancy | Cobalt    | Tide      |
| Skip     | Eclipse       | Banish     | Firewall  | Block     |
| Reverse  | Wormhole      | Mirror     | Loopback  | Current   |
| Draw-Two | Meteor Shower | Hex        | DDoS      | Quake     |
| Wild     | Singularity   | Polymorph  | Glitch    | Storm     |
| Wild +4  | Supernova     | Cataclysm  | Rootkit   | Tempest   |

Palettes are tuned per theme (e.g. Cyberpunk uses neon saturation, Elemental
uses earthy tones). All four palettes preserve enough contrast between the
four colors to keep the game playable for colorblind users — symbols are
shown on every card regardless of theme.

## Architecture

```
+--------------------------------------------------------+
|  /games/cascade  (landing — server component)          |
|   - Hero with rotating theme demo                      |
|   - Themes grid, rules, CTAs                           |
|   - JsonLd (VideoGame + HowTo)                         |
+--------------------------------------------------------+
                       |
                       v  create room / browse rooms
+--------------------------------------------------------+
|  /games/:roomId  (existing GameDetailRoute)            |
|   - Loads CascadeGame widget via gameLoaders          |
|     for `cascade_v1`                                   |
|   - Renders <Game/> → lobby or table                   |
+--------------------------------------------------------+
                       |
              socket   v
+--------------------------------------------------------+
|  CascadeGateway → CascadeService                       |
|   - play_card, draw, call_last_card, name_color,       |
|     stack_penalty, forfeit, rematch                    |
|   - delegates to CascadeEngine                         |
|   - persists state via GameSessionsService             |
|   - emits realtime updates via GamesRealtimeService    |
+--------------------------------------------------------+
                       |
                       v
+--------------------------------------------------------+
|  CascadeEngine implements IGameEngine                  |
|   - pure rule engine over CascadeState                 |
|   - actions: PlayCard, Draw, NameColor, CallLastCard,  |
|     StackPenalty                                       |
|   - emits state diffs (hand redacted per player)       |
+--------------------------------------------------------+
```

## Privacy / state redaction

Players see:

- Their full hand (cards face-up).
- Other players' hand **counts only** (face-down stack).
- The top of the discard pile and the active color.
- The direction of play and the current player.
- The accumulated stack penalty if any.

Server holds the canonical state. The gateway redacts hidden hands per
recipient before emit. Standard pattern from `texas-holdem`.

## Bot

One bot for v1. Heuristic policy:

1. If targeted by a stack, prefer playing another Draw-Two / Draw-Four if
   holding one of the correct kind. Else draw.
2. If holding a playable color-matching card, prefer it over Wilds.
3. If multiple color-matches, prefer the card belonging to the color the bot
   holds the most of (concentrate on dominant color to deplete hand faster).
4. Save Wild Draw-Four for genuinely-stuck turns.
5. When naming a color (after Wild / Wild +4), pick the color the bot holds
   the most of.
6. Call Last Card 100% of the time at the correct moment.
7. Mock a small "think" delay (300–700ms) so the experience feels natural.

No minimax / search. The state space is too large and the casual feel is
better preserved with a fast heuristic.

## File layout

Mirrors existing games (`tic-tac-toe`, `sea-battle`, `texas-holdem`).

**Backend:** `apps/be/src/games/cascade/`

- `cascade.engine.ts` — pure rule engine
- `cascade.engine.spec.ts` — engine unit tests
- `cascade.service.ts` — orchestration over engine + sessions
- `cascade.service.spec.ts` — service unit tests
- `cascade.gateway.ts` — socket gateway
- `cascade.bot.ts` — heuristic policy
- `cascade.bot.spec.ts` — bot policy tests
- `cascade.types.ts` — shared types
- `dtos/` — DTOs with class-validator

**Web feature:** `apps/web/src/features/games/cascade/`

- `widget/CascadeGame.tsx` — widget entrypoint
- `widget/CascadeLobby.tsx` — pre-game lobby UI
- `widget/CascadeTable.tsx` — in-game table UI
- `widget/cards/Card.tsx` — card primitive (consumes theme)
- `themes/{cosmic,arcane,cyberpunk,elemental}.ts` — theme maps
- `hooks/useCascadeSocket.ts` — socket bindings
- `store/cascade.store.ts` — Zustand slice
- `lib/redact.ts` — client-side hand-count derivation

**Web landing:** `apps/web/src/app/[locale]/games/cascade/`

- `page.tsx` — server component
- `CascadeLandingClient.tsx` — client interactivity (theme picker preview)
- `CascadeLandingView.tsx` — markup

**Mobile:** `apps/mobile/app/games/cascade/`

- Mobile screen matching the platform pattern

**Registries:**

- `apps/be/src/games/games.catalog.ts` — add `cascade` entry
- `apps/web/src/features/games/registry.ts` — add `cascade_v1` loader

**i18n:** `cascade.json` in messages directories for `en`, `ru`, `es`, `fr`, `by`.

## Tests

- **BE engine** (jest): every action card, stacking, win condition, deck
  reshuffle, last-card penalty timing.
- **BE service** (jest): join, bot integration, turn rotation, disconnect.
- **Web widget** (vitest): theme switching, card rendering, hand redaction
  for non-owner players.
- **Playwright e2e**: create room → add bot → play to win against bot →
  see rematch prompt.

## Risks / trade-offs

- **Trademark adjacency.** "Cascade" is used by a Procter & Gamble detergent
  brand and a few small board games. Cross-class with digital card games and
  game-software trademark is low-risk, but a USPTO + Google search before
  marketing push is recommended. No legal review required to ship internally.
- **Color identity vs. theme.** Pure visual themes risk reducing card
  legibility. Mitigation: symbols are always shown regardless of theme;
  colorblind palette tested in dev review.
- **Stacking rule confusion.** New players may not know stacking is on. The
  lobby surface explains rules, and the in-game UI shows the accumulated
  penalty count clearly when a stack is active.
- **Bot too predictable.** v1 ships one bot; if real-room engagement is low
  we add an "aggressive" variant that throws Wild +4 earlier.

## Future work (v2+)

- Vegas scoring (first to N points across rounds).
- "Challenge" rule on Wild Draw-Four.
- Bot difficulty levels.
- Spectator mode.
- Custom rules (e.g., "play multiple of same number", "7 swaps hands").
- Tournament hooks (likely free from the existing tournament system once
  Cascade is registered).
