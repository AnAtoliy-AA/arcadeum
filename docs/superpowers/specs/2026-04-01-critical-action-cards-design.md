# Critical Game: 9 Additional Action Cards

**Date:** 2026-04-01  
**Branch:** ARC-432  
**Scope:** Backend only (logic layer)

---

## Overview

Add 9 new action cards distributed across 4 existing expansion packs (Attack, Theft, Chaos, Deity). All cards follow the existing executor pattern: one function per card, dispatcher `switch` extended in each pack's utils file.

---

## New Cards

### Attack Pack (+2)

| Card | Display Name | Mechanic |
|------|-------------|----------|
| `chain_strike` | Chain Strike | Attack two consecutive players — both must take 1 extra draw turn each. Requires `targetPlayerId`; second target is the next alive player after the first in `playerOrder`. Stacks with existing `pendingDraws`. |
| `shield_bash` | Shield Bash | **Anytime card** (joins `ANYTIME_ACTION_CARDS` alongside `cancel`). Play in response to any strike-type `pendingAction` targeting you. Absorbs the incoming `pendingDraws` and reflects them onto the attacker. Clears `pendingAction`. |

### Theft Pack (+2)

| Card | Display Name | Mechanic |
|------|-------------|----------|
| `swap_hands` | Swap Hands | Swap your entire hand with a target player's hand in place. Requires `targetPlayerId`. Sets `pendingAction` for nope. |
| `snatch` | Snatch | Request a specific card type from a target player. If they have it, one copy moves from their hand to yours. Requires `targetPlayerId` and `requestedCard` in payload. Fails if target doesn't have the card. |

### Chaos Pack (+2)

| Card | Display Name | Mechanic |
|------|-------------|----------|
| `echo` | Echo | Copy and re-execute the top card of the discard pile with the same `playerId`/`targetPlayerId`. Cannot echo `echo` itself (infinite loop guard). Cannot echo `critical_event` or `neutralizer`. |
| `scramble` | Scramble | All alive players simultaneously pass their entire hand to the next player in turn order (respects `playDirection`). No targeting required. |

### Deity Pack (+3)

| Card | Display Name | Mechanic |
|------|-------------|----------|
| `resurrection` | Resurrection | Revive the most recently eliminated player (last entry in `state.eliminatedPlayers`). Restore `alive = true`, re-insert into `playerOrder` at original index, give 3 cards drawn from the bottom of the deck (`splice(-3)`). Fails if `eliminatedPlayers` is empty. |
| `judgment` | Judgment | Set `pendingJudgment = true` on all other alive players. Each affected player must discard down to 3 cards on their next action; the flag clears when they comply. Current player ends turn without drawing. |
| `prophecy` | Prophecy | Send the top 5 deck cards to the player via a private log (`prophecy.reveal:...`). On resolution, accepts a `reorderedTop2` payload that splices the top 2 back in the chosen order. |

---

## Deck Quantities

| Card | Pack | Qty |
|------|------|-----|
| `chain_strike` | attack | 2 |
| `shield_bash` | attack | 3 |
| `swap_hands` | theft | 2 |
| `snatch` | theft | 3 |
| `echo` | chaos | 2 |
| `scramble` | chaos | 1 |
| `resurrection` | deity | 1 |
| `judgment` | deity | 2 |
| `prophecy` | deity | 2 |

---

## State Changes

### `CriticalState` (new field)

```typescript
eliminatedPlayers: string[]; // ordered list; most recently eliminated is last
```

- Initialized as `[]` in `createInitialCriticalState`
- Populated at every existing `player.alive = false` site:
  - `critical.engine.ts:314`
  - `critical-logic.utils.ts:101`
  - `critical-logic.utils.ts:118`
  - `critical-future.utils.ts:320`

### `CriticalPlayerState` (new field)

```typescript
pendingJudgment?: boolean; // set by judgment; cleared when player discards to ≤3 cards
```

---

## Constants Changes (`critical.constants.ts`)

```typescript
// Extend type unions
type AttackPackCard = ... | 'chain_strike' | 'shield_bash';
type TheftPackCard  = ... | 'swap_hands'   | 'snatch';
type ChaosPackCard  = ... | 'echo'         | 'scramble';
type DeityPackCard  = ... | 'resurrection' | 'judgment' | 'prophecy';

// shield_bash is playable anytime (like cancel)
ANYTIME_ACTION_CARDS.push('shield_bash');

// chain_strike and snatch end your turn (require a draw)
CARDS_REQUIRING_DRAWS.push('chain_strike', 'snatch');
```

---

## Implementation Files

| File | Change |
|------|--------|
| `critical.constants.ts` | Extend 4 type unions + arrays; update `ANYTIME_ACTION_CARDS` and `CARDS_REQUIRING_DRAWS` |
| `critical.state.ts` | Add `eliminatedPlayers` to `CriticalState`; add `pendingJudgment` to `CriticalPlayerState`; initialize `eliminatedPlayers: []` in `createInitialCriticalState` |
| `critical.engine.ts` | Push to `eliminatedPlayers` at existing elimination site |
| `critical-logic.utils.ts` | Push to `eliminatedPlayers` at 2 existing elimination sites |
| `critical-future.utils.ts` | Push to `eliminatedPlayers` at existing elimination site |
| `critical-attack.utils.ts` | Add `executeChainStrike`, `executeShieldBash`; extend dispatcher |
| `critical-theft.utils.ts` | Add `executeSwapHands`, `executeSnatch`; extend dispatcher |
| `critical-chaos.utils.ts` | Add `executeEcho`, `executeScramble`; extend dispatcher |
| `critical-deity.utils.ts` | Add `executeResurrection`, `executeJudgment`, `executeProphecy`; extend dispatcher |

---

## Testing

One Jest test file per utils file, covering:

| Card | Test Cases |
|------|-----------|
| `chain_strike` | hits 2 targets; stacks with existing `pendingDraws`; fails on invalid target |
| `shield_bash` | reflects strike onto attacker; fails if no pending strike; clears `pendingAction` |
| `swap_hands` | hands fully swapped; fails if target dead |
| `snatch` | steals correct card; fails if target lacks card; fails if no `requestedCard` |
| `echo` | re-executes last discard; rejects echoing `echo`; rejects `critical_event`/`neutralizer` |
| `scramble` | each player gets previous player's hand; wraps at end of `playerOrder` |
| `resurrection` | revives last eliminated; gives 3 cards from deck bottom; fails if none eliminated |
| `judgment` | sets `pendingJudgment` on all other alive players; skips current player |
| `prophecy` | emits private log with top 5; reorders top 2 on resolution |

---

## Out of Scope

- Frontend UI for new cards (mobile/web)
- i18n strings for new card names
- Bot AI logic for new cards
