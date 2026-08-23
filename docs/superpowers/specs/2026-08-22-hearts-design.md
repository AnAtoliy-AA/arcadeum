# Hearts — Full-Stack Game Design (ARC-884)

Date: 2026-08-22 · Ticket: ARC-884 (`ARC-884-hearts-spades`) · Scope: **Hearts only** (Spades is a follow-up under the same ticket)

## Overview

Hearts is a 4-player trick-taking card game. Players avoid taking penalty cards: each Heart = 1 point, Queen of Spades (Q♠) = 13 points. Lowest score when someone reaches 100 wins. Includes passing phase, "breaking hearts", and shooting the moon.

## Rules implemented

- Standard 52-card deck, shuffled server-side (never trust client RNG). 13 cards per player.
- **Passing phase** at the start of each hand (rotate per hand): pass 3 cards Left → Right → Across → Hold (no pass). Passing happens simultaneously; all four passes resolve before play begins.
- The player holding the 2♣ leads the first trick of each hand.
- Must follow suit if possible. If void, may play anything **except** a penalty card (Heart or Q♠) on the _first_ trick of a hand unless nothing else is held.
- Hearts are "broken" once one has been discarded on a trick; until broken they cannot lead. Q♠ may always lead once legal.
- Scoring per hand: Hearts = 1 pt each, Q♠ = 13 pts. **Shooting the moon**: a player taking all 26 points scores 0 and every opponent scores 26.
- Game ends when any player reaches 100 points after a completed hand; lowest score wins. Ties on lowest score → draw among those players.
- `winType`: `'shoot_the_moon'` when winner shot the moon that final hand, otherwise `'standard'`.

## Variants / options

- Visual themes: unified `SHARED_THEMES` / `SHARED_VISUAL_THEMES` via theme adapter (no game-specific themes).
- Game options (rules only): `passingEnabled: boolean` (default true), `targetScore: 50 | 100` (default 100), `aiDifficulty?: AiDifficulty`.
- Modes: `[]` (no gameplay modes).
- Exactly 4 players (`MIN_PLAYERS = MAX_PLAYERS = 4`).

## Backend contract

- Engine id: `hearts_v1`. Widget: `apps/web/src/widgets/CardGames/HeartsGame/`. Landing route `/games/hearts`.
- Socket prefix: `hearts.session.*`
  - `hearts.session.pass_cards` — payload `{ cards: string[] }` (card ids like `"QS"`, `"10H"`); ack event `hearts.session.cards_passed`
  - `hearts.session.play_card` — payload `{ card: string }`; ack event `hearts.session.card_played`
  - `.forfeit` handled by base gateway pattern.
- State shape (`HeartsState extends BaseGameState`): `phase` (`passing | playing | hand_over | game_over`), `handNumber`, `passDirection` (`left|right|across|hold`), `hands: Record<playerId, string[]>`, `taken: Record<playerId, string[]>`, `scores`, `handScores`, `currentTrick: { plays: Array<{ playerId, card }> , leadSuit }`, `currentTurnIndex`, `playerOrder: playerId[]`, `heartsBroken`, `logs: GameLogEntry[]`, `winnerIds: string[] | null`, `isDraw`.
- Actions: `pass_cards` (validated: exactly 3 own cards, phase passing), `play_card` (validated against follow-suit / first-trick / broken-hearts rules), plus defensive `skip`-style no action needed — passing phase auto-resolves when all 4 passed.
- Randomness: shuffle injected via `@Optional()` constructor param (gotchas 24/25); opening leader derived from 2♣ holder (not index 0).

## Bot strategy

Difficulty tiers:

- easy: random legal card.
- medium: follow suit low; dump Q♠/high hearts when void; avoid winning with penalty cards on table.
- hard: light card counting — tracks played cards + remaining hearts; prefers safe low leads, ducks strategically.

## Web half

Mirror tic-tac-toe/cascade widget structure: types, lib/constants (from SHARED_THEMES), lib/theme-adapter, lib/theme, HeartsThemeContext, hooks/useState + useActions, ui/Game.tsx (GameWidgetContainer + turn contract), Lobby (ReusableGameLobby), Board (card hand UI), RulesModal, art poster for theme picker + GameArt branch. Registry entry `hearts_v1` lazy import. Landing page `/games/hearts`. i18n keys in en/ru/es/fr/by.

## Out of scope

Spades rules, replays integration beyond shared infra, mobile screen.
