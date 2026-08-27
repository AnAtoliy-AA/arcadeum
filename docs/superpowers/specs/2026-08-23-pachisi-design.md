# Pachisi (ARC-886) — Game Design Spec

**gameId:** `pachisi_v1` · **Widget:** `apps/web/src/widgets/BoardGames/PachisiGame/` · **Landing:** `/games/pachisi`

## Overview

Classic cross-and-circle race game (internationally known as Ludo). Players race
their tokens from their yard, clockwise around a 52-cell track, up their home
lane, and into the center home. First player to get all tokens home wins.

## Players & Seats

- **2–4 players** (MIN 2, MAX 4).
- Each player owns a **seat** with a fixed color and start offset:
  - Seat 0 red — start cell `0`
  - Seat 1 green — start cell `13`
  - Seat 2 yellow — start cell `26`
  - Seat 3 blue — start cell `39`
- Seat assignment by player count: 2p → seats `[0, 2]` (opposite corners);
  3p → `[0, 1, 2]`; 4p → `[0, 1, 2, 3]`.
- First turn: randomized (fairness, mirrors backgammon).

## Board Model

- **Main track**: 52 cells, indices `0..51`. Absolute cell for player seat `s`
  at path progress `p` is `(s * 13 + p) % 52`.
- **Token progress** (`-1..56`):
  - `-1` — in yard
  - `0..50` — on main track (51 cells; progress `50` = the arm tip adjacent to
    the player's home lane)
  - `51..55` — own home lane (5 slots)
  - `56` — finished (center home)
- **Safe cells** (no captures): start cells `{0, 13, 26, 39}` + star cells
  `{8, 21, 34, 47}` (start + 8).

### Geometry (15×15 grid, 0-indexed `[row, col]`)

Track index → coordinate (clockwise):

```
0:(6,1) … 4:(6,5)   5:(5,6) … 10:(0,6)  11:(0,7)  12:(0,8)
13:(1,8) … 17:(5,8) 18:(6,9) … 23:(6,14) 24:(7,14) 25:(8,14)
26:(8,13) … 30:(8,9) 31:(9,8) … 36:(14,8) 37:(14,7) 38:(14,6)
39:(13,6) … 43:(9,6) 44:(8,5) … 48:(8,1)  49:(8,0)  50:(7,0)  51:(6,0)
```

Home lanes (progress `51..55`):

| Seat     | Lane cells      |
| -------- | --------------- |
| 0 red    | `(7,1)..(7,5)`  |
| 1 green  | `(1,7)..(5,7)`  |
| 2 yellow | `(7,13)..(7,9)` |
| 3 blue   | `(13,7)..(9,7)` |

Yards: red rows 0–5 / cols 0–5 · green rows 0–5 / cols 9–14 · yellow rows 9–14
/ cols 9–14 · blue rows 9–14 / cols 0–5. Center home: rows/cols 6–8 core.

## Rules

1. **One die per turn.** Roll d6; move exactly one token by that amount.
2. **Exit yard requires a 6.** Exiting places the token on the player's start
   cell (safe).
3. **Extra roll on 6.** Rolling a 6 grants another roll for the same player.
4. **Three consecutive 6s void the turn** — the third 6 forfeits all movement
   for that turn (classic rule, anti-luck).
5. **Capture.** Landing on a main-track cell occupied by opponent token(s)
   sends them back to the yard — unless the cell is safe. Own tokens stack
   freely anywhere.
6. **Exact finish.** A token may only enter home (56) with an exact roll;
   overshooting is illegal.
7. **Win.** First player with all their tokens finished wins; game ends
   immediately.

## Modes

- `standard` — 4 tokens each (~15 min)
- `quick` — 2 tokens each (~6 min)

`TOKENS_BY_RULE_VARIANT = { standard: 4, quick: 2 }`. Enforced via engine
state; room layer stays at MAX_PLAYERS ceiling (per-option caps enforced at
`startSession`, see gotcha #22).

Visual themes come from `SHARED_THEMES` / `SHARED_VISUAL_THEMES` only — no
gameplay conflated into variants.

## Actions

| Action       | Payload               | Phase                             |
| ------------ | --------------------- | --------------------------------- |
| `roll_dice`  | —                     | `roll`                            |
| `move_token` | `{ tokenId: number }` | `move`                            |
| `pass_turn`  | —                     | `move` (only when no legal moves) |
| `forfeit`    | —                     | any pre-game-over                 |

Phases mirror backgammon: `roll → move → roll … → game_over`.

Dice source: injected `DiceRoller` (`@Optional()` ctor param), never trusted
from client payloads (anti-cheat).

## Bot Strategy (basic positional)

- `easy`: uniform random legal move.
- `medium`: greedy one-ply heuristic (exit yard, capture, finish, safety).
- `hard`: full heuristic + danger avoidance (landing within reach of an
  opponent behind) + progress weighting.
- `expert`: hard + prioritizes capturing the most advanced opponent token,
  prefers stacking safe-cell stacks, tiebreaks on lead-token advancement.

Heuristic scoring sketch: finish `+120` · capture `+60 + victimProgress` ·
exit yard `+55` · enter lane `+40` · land on safe `+12` · advance `+p/4` ·
danger penalty `-18` when target reachable by an opponent within 6.

## State Shape

```ts
interface PachisiState extends BaseGameState {
  phase: 'roll' | 'move' | 'game_over';
  options: PachisiOptions; // { variant(theme), ruleVariant, aiDifficulty }
  seats: Record<string, number>; // playerId -> seat index
  tokens: Record<string, TokenState[]>; // per player, N tokens {id, progress}
  die: number | null; // current rolled value (single die)
  consecutiveSixes: number;
  currentTurnIndex: number;
  playerOrder: string[];
  players: PachisiPlayer[]; // { playerId, seat, color, alive }
  winnerId: string | null;
  isDraw: boolean;
  logs: GameLogEntry[];
}
```

No hidden information → `sanitizeStateForPlayer` returns state unchanged.

## Out of Scope (follow-ups)

- Mobile port (ARC-902 tracks mobile generally).
- Playwright e2e (deferred; noted in PR like other games).
- Team 2v2 partnership variant (classic Pachisi partnerships) — future ticket.
