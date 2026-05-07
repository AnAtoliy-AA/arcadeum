# 9 Additional Critical Action Cards — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 9 new action cards (chain_strike, shield_bash, swap_hands, snatch, echo, scramble, resurrection, judgment, prophecy) across 4 existing expansion packs.

**Architecture:** Each card follows the existing executor pattern — a standalone function in its pack's utils file, wired into the pack's dispatcher switch and the engine's action switch. Two new state fields are added (eliminatedPlayers on CriticalState, pendingJudgment on CriticalPlayerState) and all 4 existing player-elimination sites are updated to populate eliminatedPlayers. Attack pack executors handle their own card removal (called directly from engine switch); Theft/Chaos/Deity pack executors rely on the dispatcher's playCard() helper.

**Tech Stack:** NestJS, TypeScript, Jest

---

## File Map

| File | Change |
|------|--------|
| `apps/be/src/games/critical/critical.constants.ts` | Extend 4 type unions + 4 card arrays; update `ANYTIME_ACTION_CARDS` and `CARDS_REQUIRING_DRAWS` |
| `apps/be/src/games/critical/critical.state.ts` | Add 2 state fields; add 9 cards to deck quantity functions |
| `apps/be/src/games/engines/critical/critical.engine.ts` | Track eliminatedPlayers at line 314; add 9 new action cases; add `dispatchCard` to helpers |
| `apps/be/src/games/engines/critical/critical-logic.utils.ts` | Track eliminatedPlayers at lines 101+118; add chain carry-over in `executeDrawCard` |
| `apps/be/src/games/engines/critical/critical-future.utils.ts` | Track eliminatedPlayers at existing `player.alive = false` site (~line 320) |
| `apps/be/src/games/engines/critical/critical-attack.utils.ts` | Add `executeChainStrike`, `executeShieldBash` |
| `apps/be/src/games/engines/critical/critical-theft.utils.ts` | Add `executeSwapHands`, `executeSnatch`; extend dispatcher |
| `apps/be/src/games/engines/critical/critical-chaos.utils.ts` | Extend `EngineHelpers` with `dispatchCard`; add `executeEcho`, `executeScramble`; extend dispatcher |
| `apps/be/src/games/engines/critical/critical-deity.utils.ts` | Add `executeResurrection`, `executeJudgment`, `executeProphecy`; extend dispatcher |
| `apps/be/src/games/engines/critical/critical-validation.utils.ts` | Add validation for new targeted actions |
| `apps/be/src/games/engines/critical/critical-attack.utils.spec.ts` | New — tests for chain_strike, shield_bash |
| `apps/be/src/games/engines/critical/critical-theft.utils.spec.ts` | New — tests for swap_hands, snatch |
| `apps/be/src/games/engines/critical/critical-chaos.utils.spec.ts` | New — tests for echo, scramble |
| `apps/be/src/games/engines/critical/critical-deity.utils.spec.ts` | New — tests for resurrection, judgment, prophecy |

---

### Task 1: Constants and deck quantities

**Files:**
- Modify: `apps/be/src/games/critical/critical.constants.ts`
- Modify: `apps/be/src/games/critical/critical.state.ts`

No tests — pure type/constant changes; TypeScript compilation validates these.

- [ ] **Step 1: Extend type unions and arrays in critical.constants.ts**

Replace the four type unions and their arrays:

```typescript
export type AttackPackCard =
  | 'targeted_strike' | 'private_strike' | 'recursive_strike'
  | 'mega_evade' | 'invert'
  | 'chain_strike' | 'shield_bash';

export const ATTACK_PACK_CARDS: AttackPackCard[] = [
  'targeted_strike', 'private_strike', 'recursive_strike',
  'mega_evade', 'invert', 'chain_strike', 'shield_bash',
];

export type TheftPackCard =
  | 'wildcard' | 'mark' | 'steal_draw' | 'stash'
  | 'swap_hands' | 'snatch';

export const THEFT_PACK_CARDS: TheftPackCard[] = [
  'wildcard', 'mark', 'steal_draw', 'stash', 'swap_hands', 'snatch',
];

export type ChaosPackCard =
  | 'critical_implosion' | 'containment_field' | 'fission' | 'tribute' | 'blackout'
  | 'echo' | 'scramble';

export const CHAOS_PACK_CARDS: ChaosPackCard[] = [
  'critical_implosion', 'containment_field', 'fission', 'tribute', 'blackout',
  'echo', 'scramble',
];

export type DeityPackCard =
  | 'omniscience' | 'miracle' | 'smite' | 'rapture'
  | 'resurrection' | 'judgment' | 'prophecy';

export const DEITY_PACK_CARDS: DeityPackCard[] = [
  'omniscience', 'miracle', 'smite', 'rapture',
  'resurrection', 'judgment', 'prophecy',
];
```

Replace `ANYTIME_ACTION_CARDS` and `CARDS_REQUIRING_DRAWS`:

```typescript
export const ANYTIME_ACTION_CARDS: CriticalCard[] = ['cancel', 'shield_bash'];

// snatch is omitted: like other theft cards (mark, steal_draw, stash), it does NOT require
// the player to draw after playing. The theft dispatcher handles turn flow.
export const CARDS_REQUIRING_DRAWS: CriticalCard[] = [
  'strike',
  'evade',
  'reorder',
  'mark',
  'steal_draw',
  'stash',
  ...ATTACK_PACK_CARDS.filter((c) => c !== 'shield_bash'),
  ...FUTURE_PACK_CARDS,
  ...DEITY_PACK_CARDS,
];
```

- [ ] **Step 2: Add deck quantities in critical.state.ts**

In `getAttackPackCards()`, append:
```typescript
...repeatCard('chain_strike', Number(customCards?.chain_strike ?? 2)),
...repeatCard('shield_bash', Number(customCards?.shield_bash ?? 3)),
```

In `getTheftPackCards()`, append:
```typescript
...repeatCard('swap_hands', Number(customCards?.swap_hands ?? 2)),
...repeatCard('snatch', Number(customCards?.snatch ?? 3)),
```

In `getChaosPackCards()`, append:
```typescript
...repeatCard('echo', Number(customCards?.echo ?? 2)),
...repeatCard('scramble', Number(customCards?.scramble ?? 1)),
```

In `getDeityPackCards()`, append:
```typescript
...repeatCard('resurrection', Number(customCards?.resurrection ?? 1)),
...repeatCard('judgment', Number(customCards?.judgment ?? 2)),
...repeatCard('prophecy', Number(customCards?.prophecy ?? 2)),
```

- [ ] **Step 3: Verify TypeScript compilation**

Run: `cd apps/be && pnpm tsc --noEmit`
Expected: 0 errors

- [ ] **Step 4: Commit**

```bash
git add apps/be/src/games/critical/critical.constants.ts \
        apps/be/src/games/critical/critical.state.ts
git commit -m "feat(ARC-432): extend card type definitions and deck quantities for 9 new cards"
```

---

### Task 2: State model changes + eliminatedPlayers tracking

**Files:**
- Modify: `apps/be/src/games/critical/critical.state.ts`
- Modify: `apps/be/src/games/engines/critical/critical.engine.ts`
- Modify: `apps/be/src/games/engines/critical/critical-logic.utils.ts`
- Modify: `apps/be/src/games/engines/critical/critical-future.utils.ts`

- [ ] **Step 1: Add new state fields**

In `critical.state.ts`, add to `CriticalPlayerState`:
```typescript
pendingJudgment?: boolean; // Set by judgment; player must discard to ≤3 cards
```

Add to `CriticalState`:
```typescript
eliminatedPlayers: string[]; // Ordered by elimination time; last entry = most recently eliminated
```

In `createInitialCriticalState`, add `eliminatedPlayers: []` to the returned state object (alongside `pendingDefuse: null`, etc.).

- [ ] **Step 2: Track eliminations in critical-logic.utils.ts**

Find line 101 (`player.alive = false` — critical_event, no defuse path). After it add:
```typescript
if (!Array.isArray(state.eliminatedPlayers)) state.eliminatedPlayers = [];
state.eliminatedPlayers.push(playerId);
```

Find the second `player.alive = false` site (~line 118, critical_implosion face-up path). After it add the same two lines.

- [ ] **Step 3: Track eliminations in critical.engine.ts**

Find line 314 (`player.alive = false` in handlePlayerLeave). After it add:
```typescript
if (!Array.isArray(newState.eliminatedPlayers)) newState.eliminatedPlayers = [];
newState.eliminatedPlayers.push(playerId);
```

- [ ] **Step 4: Track eliminations in critical-future.utils.ts**

Find the `player.alive = false` site (~line 320). After it add:
```typescript
if (!Array.isArray(state.eliminatedPlayers)) state.eliminatedPlayers = [];
state.eliminatedPlayers.push(player.playerId);
```

- [ ] **Step 5: Verify TypeScript compilation**

Run: `cd apps/be && pnpm tsc --noEmit`
Expected: 0 errors

- [ ] **Step 6: Commit**

```bash
git add apps/be/src/games/critical/critical.state.ts \
        apps/be/src/games/engines/critical/critical.engine.ts \
        apps/be/src/games/engines/critical/critical-logic.utils.ts \
        apps/be/src/games/engines/critical/critical-future.utils.ts
git commit -m "feat(ARC-432): add eliminatedPlayers and pendingJudgment state fields"
```

---

### Task 3: chain_strike

**Files:**
- Modify: `apps/be/src/games/engines/critical/critical-attack.utils.ts`
- Modify: `apps/be/src/games/engines/critical/critical-logic.utils.ts` (chain carry-over)
- Modify: `apps/be/src/games/engines/critical/critical.engine.ts`
- Create: `apps/be/src/games/engines/critical/critical-attack.utils.spec.ts`

**Mechanic:** Forces target player AND the next alive player after them to each draw 1 turn. Move turn to first target with `pendingDraws = 1`; store `chainTargetId` in `pendingAction.payload`. In `executeDrawCard`, when `pendingDraws` hits 0 and `pendingAction.type === 'chain_strike'` with a `chainTargetId`, move to the second target with `pendingDraws = 1`.

- [ ] **Step 1: Write the failing test**

Create `apps/be/src/games/engines/critical/critical-attack.utils.spec.ts`:

```typescript
import { createInitialCriticalState, CriticalState } from '../../critical/critical.state';
import { executeChainStrike, executeShieldBash } from './critical-attack.utils';

const makeHelpers = () => ({
  addLog: jest.fn(),
  createLogEntry: jest.fn().mockReturnValue({
    id: '1', type: 'action', message: '', createdAt: new Date().toISOString(),
  }),
  advanceTurn: jest.fn(),
});

describe('executeChainStrike', () => {
  let state: CriticalState;

  beforeEach(() => {
    state = createInitialCriticalState(['p1', 'p2', 'p3'], ['attack']);
    // Clear dealt hands for predictable tests
    state.players.forEach((p) => (p.hand = []));
    state.players.find((p) => p.playerId === 'p1')!.hand = ['chain_strike'];
  });

  it('moves turn to first target with pendingDraws=1 and stores chainTargetId', () => {
    const result = executeChainStrike(state, 'p1', 'p2', makeHelpers());

    expect(result.success).toBe(true);
    const s = result.state!;
    expect(s.currentTurnIndex).toBe(s.playerOrder.indexOf('p2'));
    expect(s.pendingDraws).toBe(1);
    expect((s.pendingAction?.payload as Record<string, unknown>)?.chainTargetId).toBe('p3');
    expect(s.discardPile).toContain('chain_strike');
    expect(s.players.find((p) => p.playerId === 'p1')!.hand).not.toContain('chain_strike');
  });

  it('stacks with existing pendingDraws on the first target', () => {
    state.pendingDraws = 2; // first target was already under attack with 2 draws
    const result = executeChainStrike(state, 'p1', 'p2', makeHelpers());

    expect(result.success).toBe(true);
    // chain_strike adds 1 to existing pending draws (same stacking logic as targeted_strike)
    expect(result.state!.pendingDraws).toBe(3);
  });

  it('fails if target player is dead', () => {
    state.players.find((p) => p.playerId === 'p2')!.alive = false;
    const result = executeChainStrike(state, 'p1', 'p2', makeHelpers());
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('fails if player does not have chain_strike in hand', () => {
    state.players.find((p) => p.playerId === 'p1')!.hand = [];
    const result = executeChainStrike(state, 'p1', 'p2', makeHelpers());
    expect(result.success).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/be && pnpm jest critical-attack.utils.spec.ts --no-coverage`
Expected: FAIL with `executeChainStrike is not a function`

- [ ] **Step 3: Implement executeChainStrike in critical-attack.utils.ts**

```typescript
/**
 * Execute Chain Strike — force two consecutive alive players to each draw 1 turn
 */
export function executeChainStrike(
  state: CriticalState,
  playerId: string,
  targetPlayerId: string,
  helpers: Helpers,
): GameActionResult<CriticalState> {
  const player = CriticalLogic.findPlayer(state, playerId);
  const target = CriticalLogic.findPlayer(state, targetPlayerId);

  if (!player) return { success: false, error: 'Player not found' };
  if (!target || !target.alive) return { success: false, error: 'Invalid target' };

  const cardIndex = player.hand.indexOf('chain_strike');
  if (cardIndex === -1) return { success: false, error: 'Card not found in hand' };

  player.hand.splice(cardIndex, 1);
  state.discardPile.push('chain_strike');

  // Find second target: next alive player after targetPlayerId (excluding current player)
  const aliveOrder = state.playerOrder.filter(
    (id) => state.players.find((p) => p.playerId === id)?.alive,
  );
  const firstPos = aliveOrder.indexOf(targetPlayerId);
  const chainTargetId =
    aliveOrder[(firstPos + 1) % aliveOrder.length] ?? targetPlayerId;

  // Set turn to first target (stack with any existing pendingDraws like targeted_strike does)
  state.currentTurnIndex = state.playerOrder.indexOf(targetPlayerId);
  const extraTurns = state.pendingDraws > 1 ? state.pendingDraws : 0;
  state.pendingDraws = extraTurns + 1;

  state.pendingAction = {
    type: 'chain_strike',
    playerId,
    payload: { targetPlayerId, chainTargetId },
    nopeCount: 0,
  };

  helpers.addLog(
    state,
    helpers.createLogEntry(
      'action',
      `Played Chain Strike! ${targetPlayerId} then ${chainTargetId} must each draw!`,
      { scope: 'all', senderId: playerId },
    ),
  );

  return { success: true, state };
}
```

- [ ] **Step 4: Add chain carry-over in executeDrawCard (critical-logic.utils.ts)**

In `executeDrawCard`, after `state.pendingDraws--` and after all critical_event/implosion branching, just before the normal `advanceTurn` call at the end of a successful non-bomb draw, insert:

```typescript
// Chain Strike carry-over: after first target draws, move turn to second target
if (
  state.pendingDraws === 0 &&
  state.pendingAction?.type === 'chain_strike'
) {
  const payload = state.pendingAction.payload as Record<string, unknown>;
  const chainTargetId = payload?.chainTargetId as string | undefined;
  if (chainTargetId) {
    const chainIndex = state.playerOrder.indexOf(chainTargetId);
    if (chainIndex !== -1) {
      state.currentTurnIndex = chainIndex;
      state.pendingDraws = 1;
      payload.chainTargetId = undefined; // clear so it doesn't repeat
      return { success: true, state };
    }
  }
}
```

- [ ] **Step 5: Add engine case in critical.engine.ts**

Add import:
```typescript
import {
  executeTargetedAttack, executePersonalAttack, executeAttackOfTheDead,
  executeSuperSkip, executeReverse, executeChainStrike,
} from './critical-attack.utils';
```

Add to the switch:
```typescript
case 'chain_strike':
  return executeChainStrike(
    newState,
    context.userId,
    typedPayload!.targetPlayerId!,
    helpers,
  );
```

- [ ] **Step 6: Run test to verify it passes**

Run: `cd apps/be && pnpm jest critical-attack.utils.spec.ts --no-coverage`
Expected: PASS (chain_strike suite)

- [ ] **Step 7: Commit**

```bash
git add apps/be/src/games/engines/critical/critical-attack.utils.ts \
        apps/be/src/games/engines/critical/critical-attack.utils.spec.ts \
        apps/be/src/games/engines/critical/critical.engine.ts \
        apps/be/src/games/engines/critical/critical-logic.utils.ts
git commit -m "feat(ARC-432): implement chain_strike card"
```

---

### Task 4: shield_bash

**Files:**
- Modify: `apps/be/src/games/engines/critical/critical-attack.utils.ts`
- Modify: `apps/be/src/games/engines/critical/critical.engine.ts`
- Modify: `apps/be/src/games/engines/critical/critical-attack.utils.spec.ts`

**Mechanic:** Anytime card (like cancel). Validates that `pendingAction` is a strike-type targeting the current player. Reflects current `pendingDraws` onto the attacker and clears `pendingAction`.

- [ ] **Step 1: Write the failing test**

Append to `critical-attack.utils.spec.ts`:

```typescript
describe('executeShieldBash', () => {
  let state: CriticalState;

  beforeEach(() => {
    state = createInitialCriticalState(['p1', 'p2'], ['attack']);
    state.players.forEach((p) => (p.hand = []));
  });

  it('reflects incoming strike draws onto the attacker and clears pendingAction', () => {
    state.players.find((p) => p.playerId === 'p2')!.hand = ['shield_bash'];
    state.currentTurnIndex = state.playerOrder.indexOf('p2');
    state.pendingDraws = 2;
    state.pendingAction = {
      type: 'targeted_strike',
      playerId: 'p1',
      payload: { targetPlayerId: 'p2' },
      nopeCount: 0,
    };

    const result = executeShieldBash(state, 'p2', makeHelpers());

    expect(result.success).toBe(true);
    const s = result.state!;
    expect(s.currentTurnIndex).toBe(s.playerOrder.indexOf('p1'));
    expect(s.pendingDraws).toBe(2);
    expect(s.pendingAction).toBeNull();
    expect(s.discardPile).toContain('shield_bash');
  });

  it('fails if no pending strike is targeting the player', () => {
    state.players.find((p) => p.playerId === 'p2')!.hand = ['shield_bash'];
    state.pendingAction = null;

    const result = executeShieldBash(state, 'p2', makeHelpers());
    expect(result.success).toBe(false);
  });

  it('fails if pending action targets a different player', () => {
    state.players.find((p) => p.playerId === 'p2')!.hand = ['shield_bash'];
    state.pendingAction = {
      type: 'targeted_strike',
      playerId: 'p1',
      payload: { targetPlayerId: 'p1' }, // targeting p1, not p2
      nopeCount: 0,
    };

    const result = executeShieldBash(state, 'p2', makeHelpers());
    expect(result.success).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/be && pnpm jest critical-attack.utils.spec.ts --no-coverage`
Expected: shield_bash tests FAIL

- [ ] **Step 3: Implement executeShieldBash in critical-attack.utils.ts**

```typescript
const STRIKE_ACTION_TYPES = [
  'strike', 'targeted_strike', 'private_strike',
  'recursive_strike', 'smite', 'chain_strike',
];

/**
 * Execute Shield Bash — anytime card; absorb incoming strike and reflect draws onto attacker
 */
export function executeShieldBash(
  state: CriticalState,
  playerId: string,
  helpers: Helpers,
): GameActionResult<CriticalState> {
  const player = CriticalLogic.findPlayer(state, playerId);
  if (!player) return { success: false, error: 'Player not found' };

  const cardIndex = player.hand.indexOf('shield_bash');
  if (cardIndex === -1) return { success: false, error: 'Card not found in hand' };

  const pending = state.pendingAction;
  const payload = pending?.payload as Record<string, unknown> | undefined;
  const isValidStrike =
    pending &&
    STRIKE_ACTION_TYPES.includes(pending.type) &&
    payload?.targetPlayerId === playerId;

  if (!isValidStrike) {
    return { success: false, error: 'No strike targeting you to bash' };
  }

  player.hand.splice(cardIndex, 1);
  state.discardPile.push('shield_bash');

  const attackerId = pending.playerId;
  const reflectedDraws = state.pendingDraws;

  state.currentTurnIndex = state.playerOrder.indexOf(attackerId);
  state.pendingDraws = reflectedDraws;
  state.pendingAction = null;

  helpers.addLog(
    state,
    helpers.createLogEntry(
      'action',
      `Shield Bash! Reflected ${reflectedDraws} draw(s) back at ${attackerId}! 🛡️`,
      { scope: 'all', senderId: playerId },
    ),
  );

  return { success: true, state };
}
```

- [ ] **Step 4: Add engine case**

Add to imports:
```typescript
import {
  ..., executeChainStrike, executeShieldBash,
} from './critical-attack.utils';
```

Add to switch:
```typescript
case 'shield_bash':
  return executeShieldBash(newState, context.userId, helpers);
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd apps/be && pnpm jest critical-attack.utils.spec.ts --no-coverage`
Expected: All tests PASS

- [ ] **Step 6: Commit**

```bash
git add apps/be/src/games/engines/critical/critical-attack.utils.ts \
        apps/be/src/games/engines/critical/critical-attack.utils.spec.ts \
        apps/be/src/games/engines/critical/critical.engine.ts
git commit -m "feat(ARC-432): implement shield_bash card"
```

---

### Task 5: swap_hands

**Files:**
- Modify: `apps/be/src/games/engines/critical/critical-theft.utils.ts`
- Create: `apps/be/src/games/engines/critical/critical-theft.utils.spec.ts`

Note: Theft pack executors are called via `dispatchTheftPackAction` which calls `playCard()` before the executor. The executor therefore does NOT remove the card from hand itself.

- [ ] **Step 1: Write the failing test**

Create `apps/be/src/games/engines/critical/critical-theft.utils.spec.ts`:

```typescript
import { createInitialCriticalState, CriticalState } from '../../critical/critical.state';
import { executeSwapHands, executeSnatch } from './critical-theft.utils';

const makeHelpers = (state: CriticalState) => ({
  addLog: jest.fn(),
  createLogEntry: jest.fn().mockReturnValue({
    id: '1', type: 'action', message: '', createdAt: new Date().toISOString(),
  }),
  advanceTurn: jest.fn(),
  shuffleArray: jest.fn(),
  findPlayer: (s: CriticalState, id: string) => s.players.find((p) => p.playerId === id),
});

describe('executeSwapHands', () => {
  let state: CriticalState;

  beforeEach(() => {
    state = createInitialCriticalState(['p1', 'p2'], ['theft']);
    state.players.forEach((p) => (p.hand = []));
  });

  it('swaps the hands of two players', () => {
    // swap_hands already removed by dispatcher's playCard() before executor runs
    state.players.find((p) => p.playerId === 'p1')!.hand = ['strike', 'evade'];
    state.players.find((p) => p.playerId === 'p2')!.hand = ['insight', 'cancel', 'reorder'];

    const result = executeSwapHands(state, 'p1', 'p2', makeHelpers(state) as any);

    expect(result.success).toBe(true);
    expect(result.state!.players.find((p) => p.playerId === 'p1')!.hand).toEqual([
      'insight', 'cancel', 'reorder',
    ]);
    expect(result.state!.players.find((p) => p.playerId === 'p2')!.hand).toEqual([
      'strike', 'evade',
    ]);
  });

  it('sets pendingAction for nope', () => {
    const result = executeSwapHands(state, 'p1', 'p2', makeHelpers(state) as any);
    expect(result.state!.pendingAction?.type).toBe('swap_hands');
  });

  it('fails if target is dead', () => {
    state.players.find((p) => p.playerId === 'p2')!.alive = false;
    const result = executeSwapHands(state, 'p1', 'p2', makeHelpers(state) as any);
    expect(result.success).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/be && pnpm jest critical-theft.utils.spec.ts --no-coverage`
Expected: FAIL

- [ ] **Step 3: Implement executeSwapHands in critical-theft.utils.ts**

```typescript
/**
 * Execute Swap Hands — exchange entire hand with a target player
 * Note: swap_hands card is already removed by the dispatcher's playCard() before this runs.
 */
export function executeSwapHands(
  state: CriticalState,
  playerId: string,
  targetPlayerId: string,
  helpers: EngineHelpers,
): GameActionResult<CriticalState> {
  const player = helpers.findPlayer(state, playerId);
  const target = helpers.findPlayer(state, targetPlayerId);

  if (!player) return { success: false, error: 'Player not found' };
  if (!target || !target.alive) return { success: false, error: 'Invalid target' };

  const myHand = [...player.hand];
  player.hand = [...target.hand];
  target.hand = myHand;

  state.pendingAction = {
    type: 'swap_hands',
    playerId,
    payload: { targetPlayerId },
    nopeCount: 0,
  };

  helpers.addLog(
    state,
    helpers.createLogEntry('action', `Swapped hands with ${targetPlayerId}! 🔄`, {
      scope: 'all',
      senderId: playerId,
    }),
  );

  return { success: true, state };
}
```

Add to `dispatchTheftPackAction` switch:
```typescript
case 'swap_hands':
  if (!targetPlayerId) {
    return { success: false, error: 'Target required for Swap Hands' };
  }
  playCard();
  return executeSwapHands(state, playerId, targetPlayerId, helpers);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd apps/be && pnpm jest critical-theft.utils.spec.ts --no-coverage`
Expected: swap_hands tests PASS

- [ ] **Step 5: Commit**

```bash
git add apps/be/src/games/engines/critical/critical-theft.utils.ts \
        apps/be/src/games/engines/critical/critical-theft.utils.spec.ts
git commit -m "feat(ARC-432): implement swap_hands card"
```

---

### Task 6: snatch

**Files:**
- Modify: `apps/be/src/games/engines/critical/critical-theft.utils.ts`
- Modify: `apps/be/src/games/engines/critical/critical-theft.utils.spec.ts`

**Mechanic:** Request a specific card type from target. If they have it, one copy moves to your hand. Requires `targetPlayerId` and `requestedCard` in payload. Card is removed by dispatcher's `playCard()`.

- [ ] **Step 1: Write the failing test**

Append to `critical-theft.utils.spec.ts`:

```typescript
describe('executeSnatch', () => {
  let state: CriticalState;

  beforeEach(() => {
    state = createInitialCriticalState(['p1', 'p2'], ['theft']);
    state.players.forEach((p) => (p.hand = []));
  });

  it('transfers one copy of requested card from target to player', () => {
    state.players.find((p) => p.playerId === 'p1')!.hand = [];
    state.players.find((p) => p.playerId === 'p2')!.hand = ['strike', 'strike', 'evade'];

    const result = executeSnatch(state, 'p1', 'p2', 'strike', makeHelpers(state) as any);

    expect(result.success).toBe(true);
    expect(result.state!.players.find((p) => p.playerId === 'p1')!.hand).toContain('strike');
    const p2Hand = result.state!.players.find((p) => p.playerId === 'p2')!.hand;
    expect(p2Hand.filter((c) => c === 'strike').length).toBe(1); // one removed
  });

  it('fails if target does not have the requested card', () => {
    state.players.find((p) => p.playerId === 'p2')!.hand = ['evade', 'cancel'];

    const result = executeSnatch(state, 'p1', 'p2', 'strike', makeHelpers(state) as any);
    expect(result.success).toBe(false);
  });

  it('fails if requestedCard is not provided', () => {
    const result = executeSnatch(state, 'p1', 'p2', undefined as any, makeHelpers(state) as any);
    expect(result.success).toBe(false);
  });

  it('fails if target is dead', () => {
    state.players.find((p) => p.playerId === 'p2')!.alive = false;
    const result = executeSnatch(state, 'p1', 'p2', 'strike', makeHelpers(state) as any);
    expect(result.success).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/be && pnpm jest critical-theft.utils.spec.ts --no-coverage`
Expected: snatch tests FAIL

- [ ] **Step 3: Implement executeSnatch in critical-theft.utils.ts**

```typescript
/**
 * Execute Snatch — request a specific card from target; they must give one if they have it
 * Note: snatch card is already removed by the dispatcher's playCard() before this runs.
 */
export function executeSnatch(
  state: CriticalState,
  playerId: string,
  targetPlayerId: string,
  requestedCard: CriticalCard,
  helpers: EngineHelpers,
): GameActionResult<CriticalState> {
  const player = helpers.findPlayer(state, playerId);
  const target = helpers.findPlayer(state, targetPlayerId);

  if (!player) return { success: false, error: 'Player not found' };
  if (!target || !target.alive) return { success: false, error: 'Invalid target' };
  if (!requestedCard) return { success: false, error: 'Must specify a card to snatch' };

  const cardIndex = target.hand.indexOf(requestedCard);
  if (cardIndex === -1) {
    return { success: false, error: `Target does not have ${requestedCard}` };
  }

  target.hand.splice(cardIndex, 1);
  player.hand.push(requestedCard);

  state.pendingAction = {
    type: 'snatch',
    playerId,
    payload: { targetPlayerId, requestedCard },
    nopeCount: 0,
  };

  helpers.addLog(
    state,
    helpers.createLogEntry('action', `Snatched a ${requestedCard} from ${targetPlayerId}! 🤌`, {
      scope: 'all',
      senderId: playerId,
    }),
  );

  return { success: true, state };
}
```

Add to `dispatchTheftPackAction` switch:
```typescript
case 'snatch':
  if (!targetPlayerId) {
    return { success: false, error: 'Target required for Snatch' };
  }
  if (!payload?.requestedCard) {
    return { success: false, error: 'Must specify a card to snatch' };
  }
  playCard();
  return executeSnatch(state, playerId, targetPlayerId, payload.requestedCard, helpers);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd apps/be && pnpm jest critical-theft.utils.spec.ts --no-coverage`
Expected: All theft tests PASS

- [ ] **Step 5: Commit**

```bash
git add apps/be/src/games/engines/critical/critical-theft.utils.ts \
        apps/be/src/games/engines/critical/critical-theft.utils.spec.ts
git commit -m "feat(ARC-432): implement snatch card"
```

---

### Task 7: scramble

**Files:**
- Modify: `apps/be/src/games/engines/critical/critical-chaos.utils.ts`
- Create: `apps/be/src/games/engines/critical/critical-chaos.utils.spec.ts`

**Mechanic:** All alive players simultaneously pass their entire hand to the next player in turn order (respects `playDirection`). No targeting required.

- [ ] **Step 1: Write the failing test**

Create `apps/be/src/games/engines/critical/critical-chaos.utils.spec.ts`:

```typescript
import { createInitialCriticalState, CriticalState } from '../../critical/critical.state';
import { executeScramble, executeEcho } from './critical-chaos.utils';

const makeHelpers = (state: CriticalState) => ({
  addLog: jest.fn(),
  createLogEntry: jest.fn().mockReturnValue({
    id: '1', type: 'action', message: '', createdAt: new Date().toISOString(),
  }),
  advanceTurn: jest.fn(),
  shuffleArray: jest.fn(),
  findPlayer: (s: CriticalState, id: string) => s.players.find((p) => p.playerId === id),
  dispatchCard: jest.fn(),
});

describe('executeScramble', () => {
  let state: CriticalState;

  beforeEach(() => {
    state = createInitialCriticalState(['p1', 'p2', 'p3'], ['chaos']);
    state.players.forEach((p) => (p.hand = []));
    state.playDirection = 1;
  });

  it('each alive player receives the previous player hand in turn order', () => {
    state.players.find((p) => p.playerId === 'p1')!.hand = ['strike', 'evade'];
    state.players.find((p) => p.playerId === 'p2')!.hand = ['cancel'];
    state.players.find((p) => p.playerId === 'p3')!.hand = ['reorder', 'insight', 'trade'];

    // playerOrder = ['p1','p2','p3'], direction=1: p1->p2, p2->p3, p3->p1
    const result = executeScramble(state, 'p1', makeHelpers(state) as any);

    expect(result.success).toBe(true);
    const s = result.state!;
    expect(s.players.find((p) => p.playerId === 'p2')!.hand).toEqual(['strike', 'evade']);
    expect(s.players.find((p) => p.playerId === 'p3')!.hand).toEqual(['cancel']);
    expect(s.players.find((p) => p.playerId === 'p1')!.hand).toEqual(['reorder', 'insight', 'trade']);
  });

  it('skips dead players in the pass chain', () => {
    state.players.find((p) => p.playerId === 'p1')!.hand = ['strike'];
    state.players.find((p) => p.playerId === 'p2')!.alive = false;
    state.players.find((p) => p.playerId === 'p2')!.hand = [];
    state.players.find((p) => p.playerId === 'p3')!.hand = ['evade'];

    // p2 is dead, so alive order is [p1, p3]: p1->p3, p3->p1
    const result = executeScramble(state, 'p1', makeHelpers(state) as any);

    expect(result.success).toBe(true);
    const s = result.state!;
    expect(s.players.find((p) => p.playerId === 'p3')!.hand).toEqual(['strike']);
    expect(s.players.find((p) => p.playerId === 'p1')!.hand).toEqual(['evade']);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/be && pnpm jest critical-chaos.utils.spec.ts --no-coverage`
Expected: FAIL

- [ ] **Step 3: Implement executeScramble in critical-chaos.utils.ts**

Add `dispatchCard` to `EngineHelpers` interface (used later by echo):
```typescript
export interface EngineHelpers {
  addLog: (state: CriticalState, entry: GameLogEntry) => void;
  createLogEntry: (type: string, message: string, options?: LogEntryOptions) => GameLogEntry;
  advanceTurn: (state: CriticalState) => void;
  shuffleArray: <T>(array: T[]) => void;
  findPlayer: (state: CriticalState, playerId: string) => CriticalPlayerState | undefined;
  dispatchCard: (
    state: CriticalState,
    playerId: string,
    card: CriticalCard,
    targetPlayerId?: string,
  ) => GameActionResult<CriticalState> | null;
}
```

Add executor:
```typescript
/**
 * Execute Scramble — all alive players pass their hand to the next player in turn order
 * Note: scramble card already removed by dispatcher's playCard().
 */
export function executeScramble(
  state: CriticalState,
  playerId: string,
  helpers: EngineHelpers,
): GameActionResult<CriticalState> {
  // Build the ordered list of alive players
  const aliveOrder = state.playerOrder.filter(
    (id) => state.players.find((p) => p.playerId === id)?.alive,
  );

  if (aliveOrder.length < 2) {
    return { success: false, error: 'Not enough alive players to scramble' };
  }

  // Snapshot all hands before passing
  const snapshot = new Map<string, CriticalCard[]>(
    aliveOrder.map((id) => [
      id,
      [...(state.players.find((p) => p.playerId === id)?.hand ?? [])],
    ]),
  );

  // Each player receives the hand of the previous player (wrap around)
  aliveOrder.forEach((id, i) => {
    const prevId = aliveOrder[(i - 1 + aliveOrder.length) % aliveOrder.length];
    const player = state.players.find((p) => p.playerId === id);
    if (player) {
      player.hand = [...(snapshot.get(prevId) ?? [])];
    }
  });

  helpers.addLog(
    state,
    helpers.createLogEntry('action', `Scramble! Everyone passed their hand to the next player! 🌀`, {
      scope: 'all',
      senderId: playerId,
    }),
  );

  return { success: true, state };
}
```

Add to `dispatchChaosPackAction` switch:
```typescript
case 'scramble':
  playCard();
  return executeScramble(state, playerId, helpers);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd apps/be && pnpm jest critical-chaos.utils.spec.ts --no-coverage`
Expected: scramble tests PASS

- [ ] **Step 5: Commit**

```bash
git add apps/be/src/games/engines/critical/critical-chaos.utils.ts \
        apps/be/src/games/engines/critical/critical-chaos.utils.spec.ts
git commit -m "feat(ARC-432): implement scramble card"
```

---

### Task 8: echo

**Files:**
- Modify: `apps/be/src/games/engines/critical/critical-chaos.utils.ts`
- Modify: `apps/be/src/games/engines/critical/critical.engine.ts` (add dispatchCard to helpers)
- Modify: `apps/be/src/games/engines/critical/critical-chaos.utils.spec.ts`

**Mechanic:** Reads top of discard pile; re-executes it via `helpers.dispatchCard`. Cannot echo `echo`, `critical_event`, or `neutralizer`. The engine provides `dispatchCard` helper that calls back into its own pack dispatchers.

- [ ] **Step 1: Write the failing test**

Append to `critical-chaos.utils.spec.ts`:

```typescript
describe('executeEcho', () => {
  let state: CriticalState;

  beforeEach(() => {
    state = createInitialCriticalState(['p1', 'p2'], ['chaos']);
    state.players.forEach((p) => (p.hand = []));
    // Simulate post-playCard() state: echo is already on top of discard pile
    state.discardPile = ['scramble', 'strike', 'echo'];
  });

  it('calls dispatchCard with the pre-play top card (not echo)', () => {
    const helpers = makeHelpers(state);
    (helpers.dispatchCard as jest.Mock).mockReturnValue({ success: true, state });

    // Dispatcher captures 'strike' (the card before echo) and passes it explicitly
    const result = executeEcho(state, 'p1', undefined, 'strike' as any, helpers as any);

    expect(result.success).toBe(true);
    expect(helpers.dispatchCard).toHaveBeenCalledWith(state, 'p1', 'strike', undefined);
  });

  it('fails if cardToEcho is undefined (discard was empty before play)', () => {
    const result = executeEcho(state, 'p1', undefined, undefined, makeHelpers(state) as any);
    expect(result.success).toBe(false);
  });

  it('fails if the pre-play top card was echo', () => {
    const result = executeEcho(state, 'p1', undefined, 'echo' as any, makeHelpers(state) as any);
    expect(result.success).toBe(false);
  });

  it('fails if the pre-play top card was critical_event', () => {
    const result = executeEcho(state, 'p1', undefined, 'critical_event' as any, makeHelpers(state) as any);
    expect(result.success).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/be && pnpm jest critical-chaos.utils.spec.ts --no-coverage`
Expected: echo tests FAIL

- [ ] **Step 3: Implement executeEcho in critical-chaos.utils.ts**

```typescript
const ECHO_BLOCKED_CARDS: CriticalCard[] = ['echo', 'critical_event', 'neutralizer'];

/**
 * Execute Echo — replay the card that was on top of the discard pile BEFORE echo was played.
 * The dispatcher captures the pre-play top card and passes it here explicitly to avoid
 * reading 'echo' itself (which the dispatcher's playCard() has already pushed onto the pile).
 */
export function executeEcho(
  state: CriticalState,
  playerId: string,
  targetPlayerId: string | undefined,
  cardToEcho: CriticalCard | undefined,
  helpers: EngineHelpers,
): GameActionResult<CriticalState> {
  if (!cardToEcho) {
    return { success: false, error: 'Discard pile was empty before echo was played' };
  }

  const topCard = cardToEcho;

  if (ECHO_BLOCKED_CARDS.includes(topCard)) {
    return { success: false, error: `Cannot echo ${topCard}` };
  }

  helpers.addLog(
    state,
    helpers.createLogEntry('action', `Played Echo — replaying ${topCard}! 🔁`, {
      scope: 'all',
      senderId: playerId,
    }),
  );

  const echoResult = helpers.dispatchCard(state, playerId, topCard, targetPlayerId);
  if (!echoResult) {
    return { success: false, error: `Cannot echo ${topCard} — no dispatcher found` };
  }

  return echoResult;
}
```

Add to `dispatchChaosPackAction` switch. Note: do NOT call `playCard()` before `executeEcho` — if we push `echo` onto the discard pile first, `executeEcho` would read `echo` as the top card and immediately fail the blocked-cards check. Instead, capture the pre-play top card and pass it explicitly, then discard echo inside the executor:

```typescript
case 'echo': {
  // Capture top discard BEFORE echo is pushed onto the pile
  const cardToEcho = state.discardPile[state.discardPile.length - 1];
  playCard(); // now echo is on top — executor uses the pre-captured cardToEcho
  return executeEcho(state, playerId, targetPlayerId, cardToEcho, helpers);
}
```

Update the `executeEcho` signature to accept an explicit `cardToEcho` parameter:

```typescript
export function executeEcho(
  state: CriticalState,
  playerId: string,
  targetPlayerId: string | undefined,
  cardToEcho: CriticalCard | undefined,
  helpers: EngineHelpers,
): GameActionResult<CriticalState>
```

- [ ] **Step 4: Add dispatchCard helper to the engine (critical.engine.ts)**

Replace the existing `const helpers = { ... }` block in `executeAction` with a `let` declaration that allows self-reference in the `dispatchCard` closure. This is the type-safe pattern — no `as any` needed:

```typescript
// Use `let` so dispatchCard can reference helpers by closure at call time (not at declaration time)
let helpers: {
  addLog: (state: CriticalState, log: ReturnType<typeof this.createLogEntry>) => void;
  createLogEntry: typeof this.createLogEntry;
  advanceTurn: (state: CriticalState) => void;
  shuffleArray: <T>(arr: T[]) => void;
  findPlayer: (state: CriticalState, pid: string) => CriticalPlayerState;
  dispatchCard: (
    state: CriticalState,
    playerId: string,
    card: CriticalCard,
    targetPlayerId?: string,
  ) => GameActionResult<CriticalState> | null;
};

helpers = {
  addLog: (state, log) => this.addLog(state, log),
  createLogEntry: this.createLogEntry.bind(this) as typeof this.createLogEntry,
  advanceTurn: (state) => this.advanceTurn(state),
  shuffleArray: <T>(arr: T[]) => this.shuffleArray(arr),
  findPlayer: (state, pid) => this.findPlayer(state, pid) as CriticalPlayerState,
  dispatchCard: (s, pid, card, tid) =>
    dispatchFuturePackAction(s, pid, card, helpers) ??
    dispatchTheftPackAction(s, pid, card, tid, helpers) ??
    dispatchChaosPackAction(s, pid, card, tid, helpers) ??
    dispatchDeityPackAction(s, pid, card, tid, helpers) ??
    null,
};
```

The `let` + separate assignment means TypeScript sees `helpers` as fully typed when `dispatchCard` is called (at runtime), not when the object literal is evaluated. No casts needed.

- [ ] **Step 5: Update ALL three EngineHelpers interface declarations**

`EngineHelpers` is declared independently in THREE files. All three must be updated to include `dispatchCard`, otherwise TypeScript will report structural mismatches when the engine passes `helpers` (which includes `dispatchCard`) to pack dispatchers whose `EngineHelpers` type lacks the field.

Add the following field to `EngineHelpers` in each of these files:
- `apps/be/src/games/engines/critical/critical-future.utils.ts` (line ~19)
- `apps/be/src/games/engines/critical/critical-chaos.utils.ts` (line ~18, already updated in Task 7 Step 3)
- `apps/be/src/games/engines/critical/critical-theft.utils.ts` (line ~19)

```typescript
dispatchCard: (
  state: CriticalState,
  playerId: string,
  card: CriticalCard,
  targetPlayerId?: string,
) => GameActionResult<CriticalState> | null;
```

- [ ] **Step 6: Run test to verify it passes**

Run: `cd apps/be && pnpm jest critical-chaos.utils.spec.ts --no-coverage`
Expected: All chaos tests PASS

- [ ] **Step 7: Verify compilation**

Run: `cd apps/be && pnpm tsc --noEmit`
Expected: 0 errors

- [ ] **Step 8: Commit**

```bash
git add apps/be/src/games/engines/critical/critical-chaos.utils.ts \
        apps/be/src/games/engines/critical/critical-chaos.utils.spec.ts \
        apps/be/src/games/engines/critical/critical-future.utils.ts \
        apps/be/src/games/engines/critical/critical.engine.ts
git commit -m "feat(ARC-432): implement echo card with dispatchCard helper"
```

---

### Task 9: resurrection

**Files:**
- Modify: `apps/be/src/games/engines/critical/critical-deity.utils.ts`
- Create: `apps/be/src/games/engines/critical/critical-deity.utils.spec.ts`

**Mechanic:** Revives the most recently eliminated player (`state.eliminatedPlayers` last entry). Restores `alive = true`, re-inserts player into `playerOrder` at their original index, gives 3 cards from the bottom of the deck (`splice(-3)`). Fails if `eliminatedPlayers` is empty.

- [ ] **Step 1: Write the failing test**

Create `apps/be/src/games/engines/critical/critical-deity.utils.spec.ts`:

```typescript
import { createInitialCriticalState, CriticalState } from '../../critical/critical.state';
import {
  executeResurrection, executeJudgment, executeProphecy,
} from './critical-deity.utils';

const makeHelpers = (state: CriticalState) => ({
  addLog: jest.fn(),
  createLogEntry: jest.fn().mockReturnValue({
    id: '1', type: 'action', message: '', createdAt: new Date().toISOString(),
  }),
  advanceTurn: jest.fn(),
  shuffleArray: jest.fn(),
  findPlayer: (s: CriticalState, id: string) => s.players.find((p) => p.playerId === id),
  dispatchCard: jest.fn(),
});

describe('executeResurrection', () => {
  let state: CriticalState;

  beforeEach(() => {
    state = createInitialCriticalState(['p1', 'p2', 'p3'], ['deity']);
    state.players.forEach((p) => (p.hand = []));
    state.eliminatedPlayers = [];
  });

  it('revives the most recently eliminated player with 3 cards from the deck bottom', () => {
    state.players.find((p) => p.playerId === 'p2')!.alive = false;
    state.eliminatedPlayers = ['p2'];
    state.deck = ['a1', 'a2', 'a3', 'a4', 'a5'] as any;

    const result = executeResurrection(state, 'p1', makeHelpers(state) as any);

    expect(result.success).toBe(true);
    const s = result.state!;
    expect(s.players.find((p) => p.playerId === 'p2')!.alive).toBe(true);
    expect(s.players.find((p) => p.playerId === 'p2')!.hand).toHaveLength(3);
    expect(s.players.find((p) => p.playerId === 'p2')!.hand).toEqual(['a3', 'a4', 'a5']);
    expect(s.deck).toHaveLength(2);
    expect(s.eliminatedPlayers).not.toContain('p2');
  });

  it('fails if no players have been eliminated', () => {
    state.eliminatedPlayers = [];
    const result = executeResurrection(state, 'p1', makeHelpers(state) as any);
    expect(result.success).toBe(false);
  });

  it('gives fewer than 3 cards if deck has less than 3 remaining', () => {
    state.players.find((p) => p.playerId === 'p2')!.alive = false;
    state.eliminatedPlayers = ['p2'];
    state.deck = ['a1'] as any;

    const result = executeResurrection(state, 'p1', makeHelpers(state) as any);
    expect(result.success).toBe(true);
    expect(result.state!.players.find((p) => p.playerId === 'p2')!.hand).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/be && pnpm jest critical-deity.utils.spec.ts --no-coverage`
Expected: FAIL

- [ ] **Step 3: Implement executeResurrection in critical-deity.utils.ts**

```typescript
/**
 * Execute Resurrection — revive the most recently eliminated player
 * Note: resurrection card already removed by dispatcher's playCard().
 */
export function executeResurrection(
  state: CriticalState,
  playerId: string,
  helpers: EngineHelpers,
): GameActionResult<CriticalState> {
  if (!Array.isArray(state.eliminatedPlayers) || state.eliminatedPlayers.length === 0) {
    return { success: false, error: 'No eliminated players to resurrect' };
  }

  const targetId = state.eliminatedPlayers[state.eliminatedPlayers.length - 1];
  const target = state.players.find((p) => p.playerId === targetId);
  if (!target) return { success: false, error: 'Eliminated player not found' };

  // Revive
  target.alive = true;

  // Give 3 cards from deck bottom (or fewer if deck is small)
  const count = Math.min(3, state.deck.length);
  const reviveCards = state.deck.splice(-count, count);
  target.hand.push(...reviveCards);

  // playerOrder is never mutated when a player is eliminated (only alive flag is set),
  // so the player is already in playerOrder at their original index — no re-insertion needed.

  // Remove from eliminatedPlayers
  state.eliminatedPlayers = state.eliminatedPlayers.filter((id) => id !== targetId);

  state.pendingAction = {
    type: 'resurrection',
    playerId,
    payload: { targetId },
    nopeCount: 0,
  };

  helpers.addLog(
    state,
    helpers.createLogEntry('action', `Resurrection! ${targetId} has returned! ✨`, {
      scope: 'all',
      senderId: playerId,
    }),
  );

  return { success: true, state };
}
```

Add to `dispatchDeityPackAction` switch:
```typescript
case 'resurrection':
  playCard();
  return executeResurrection(state, playerId, helpers);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd apps/be && pnpm jest critical-deity.utils.spec.ts --no-coverage`
Expected: resurrection tests PASS

- [ ] **Step 5: Commit**

```bash
git add apps/be/src/games/engines/critical/critical-deity.utils.ts \
        apps/be/src/games/engines/critical/critical-deity.utils.spec.ts
git commit -m "feat(ARC-432): implement resurrection card"
```

---

### Task 10: judgment

**Files:**
- Modify: `apps/be/src/games/engines/critical/critical-deity.utils.ts`
- Modify: `apps/be/src/games/engines/critical/critical-deity.utils.spec.ts`

**Mechanic:** Sets `pendingJudgment = true` on all other alive players. Each affected player must discard down to 3 cards; the flag clears when they comply. Current player ends turn without drawing.

- [ ] **Step 1: Write the failing test**

Append to `critical-deity.utils.spec.ts`:

```typescript
describe('executeJudgment', () => {
  let state: CriticalState;

  beforeEach(() => {
    state = createInitialCriticalState(['p1', 'p2', 'p3'], ['deity']);
    state.players.forEach((p) => (p.hand = []));
  });

  it('sets pendingJudgment on all other alive players', () => {
    const result = executeJudgment(state, 'p1', makeHelpers(state) as any);

    expect(result.success).toBe(true);
    expect(result.state!.players.find((p) => p.playerId === 'p2')!.pendingJudgment).toBe(true);
    expect(result.state!.players.find((p) => p.playerId === 'p3')!.pendingJudgment).toBe(true);
  });

  it('does not set pendingJudgment on the casting player', () => {
    const result = executeJudgment(state, 'p1', makeHelpers(state) as any);
    expect(result.state!.players.find((p) => p.playerId === 'p1')!.pendingJudgment).toBeUndefined();
  });

  it('does not set pendingJudgment on dead players', () => {
    state.players.find((p) => p.playerId === 'p3')!.alive = false;
    const result = executeJudgment(state, 'p1', makeHelpers(state) as any);
    expect(result.state!.players.find((p) => p.playerId === 'p3')!.pendingJudgment).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/be && pnpm jest critical-deity.utils.spec.ts --no-coverage`
Expected: judgment tests FAIL

- [ ] **Step 3: Implement executeJudgment in critical-deity.utils.ts**

```typescript
/**
 * Execute Judgment — force all other alive players to discard down to 3 cards
 * Note: judgment card already removed by dispatcher's playCard().
 */
export function executeJudgment(
  state: CriticalState,
  playerId: string,
  helpers: EngineHelpers,
): GameActionResult<CriticalState> {
  const targets = state.players.filter(
    (p) => p.playerId !== playerId && p.alive,
  );

  targets.forEach((p) => {
    p.pendingJudgment = true;
  });

  state.pendingAction = {
    type: 'judgment',
    playerId,
    nopeCount: 0,
  };

  helpers.addLog(
    state,
    helpers.createLogEntry(
      'action',
      `Judgment! All other players must discard down to 3 cards! ⚖️`,
      { scope: 'all', senderId: playerId },
    ),
  );

  // End current player's turn without requiring a draw
  state.pendingDraws = 0;
  helpers.advanceTurn(state);

  return { success: true, state };
}
```

Add to `dispatchDeityPackAction` switch:
```typescript
case 'judgment':
  playCard();
  return executeJudgment(state, playerId, helpers);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd apps/be && pnpm jest critical-deity.utils.spec.ts --no-coverage`
Expected: judgment tests PASS

- [ ] **Step 5: Commit**

```bash
git add apps/be/src/games/engines/critical/critical-deity.utils.ts \
        apps/be/src/games/engines/critical/critical-deity.utils.spec.ts
git commit -m "feat(ARC-432): implement judgment card"
```

---

### Task 11: prophecy

**Files:**
- Modify: `apps/be/src/games/engines/critical/critical-deity.utils.ts`
- Modify: `apps/be/src/games/engines/critical/critical.engine.ts` (add `commit_prophecy` case)
- Modify: `apps/be/src/games/engines/critical/critical-deity.utils.spec.ts`

**Mechanic (two-phase, like alter_future):**
1. Play `prophecy` → private log reveals top 5 deck cards; sets `pendingAlter`-like state (`pendingProphecy`).
2. Client submits `commit_prophecy` with `newTop2: [card, card]` → splice those 2 cards back at positions 0–1 in the deck.

Add `pendingProphecy` to `CriticalState` in `critical.state.ts`.

- [ ] **Step 1: Add pendingProphecy to CriticalState**

In `critical.state.ts`, add to `CriticalState`:
```typescript
pendingProphecy?: {
  playerId: string;
  topCards: CriticalCard[]; // the 5 cards shown to the player
} | null;
```

Initialize as `pendingProphecy: null` in `createInitialCriticalState`.

- [ ] **Step 2: Write the failing test**

Append to `critical-deity.utils.spec.ts`:

```typescript
import { executeCommitProphecy } from './critical-deity.utils';

describe('executeProphecy', () => {
  let state: CriticalState;

  beforeEach(() => {
    state = createInitialCriticalState(['p1', 'p2'], ['deity']);
    state.players.forEach((p) => (p.hand = []));
    state.deck = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7'] as any;
  });

  it('sets pendingProphecy and emits private log with top 5 cards', () => {
    const helpers = makeHelpers(state);
    const result = executeProphecy(state, 'p1', helpers as any);

    expect(result.success).toBe(true);
    expect(result.state!.pendingProphecy?.playerId).toBe('p1');
    expect(result.state!.pendingProphecy?.topCards).toEqual(['c1', 'c2', 'c3', 'c4', 'c5']);
    // Private log emitted
    expect(helpers.addLog).toHaveBeenCalledTimes(2); // public + private
  });
});

describe('executeCommitProphecy', () => {
  let state: CriticalState;

  beforeEach(() => {
    state = createInitialCriticalState(['p1', 'p2'], ['deity']);
    state.players.forEach((p) => (p.hand = []));
    state.deck = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6'] as any;
    state.pendingProphecy = {
      playerId: 'p1',
      topCards: ['c1', 'c2', 'c3', 'c4', 'c5'],
    };
  });

  it('reorders the top 2 deck cards as specified', () => {
    const helpers = makeHelpers(state);
    const result = executeCommitProphecy(state, 'p1', ['c2', 'c1'] as any, helpers as any);

    expect(result.success).toBe(true);
    expect(result.state!.deck[0]).toBe('c2');
    expect(result.state!.deck[1]).toBe('c1');
    expect(result.state!.pendingProphecy).toBeNull();
  });

  it('fails if newTop2 contains cards not in the original top 5', () => {
    const result = executeCommitProphecy(state, 'p1', ['c1', 'c99'] as any, makeHelpers(state) as any);
    expect(result.success).toBe(false);
  });

  it('fails if newTop2 does not have exactly 2 cards', () => {
    const result = executeCommitProphecy(state, 'p1', ['c1'] as any, makeHelpers(state) as any);
    expect(result.success).toBe(false);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd apps/be && pnpm jest critical-deity.utils.spec.ts --no-coverage`
Expected: prophecy tests FAIL

- [ ] **Step 4: Implement executeProphecy and executeCommitProphecy in critical-deity.utils.ts**

```typescript
/**
 * Execute Prophecy — reveal top 5 cards to the player privately; they then reorder top 2.
 * Note: prophecy card already removed by dispatcher's playCard().
 */
export function executeProphecy(
  state: CriticalState,
  playerId: string,
  helpers: EngineHelpers,
): GameActionResult<CriticalState> {
  const topCards = state.deck.slice(0, 5);

  state.pendingProphecy = { playerId, topCards: [...topCards] };

  helpers.addLog(
    state,
    helpers.createLogEntry('action', `Used Prophecy to glimpse the future! 🔮`, {
      scope: 'all',
      senderId: playerId,
    }),
  );

  // Use same per-card encoding as existing future pack cards (e.g. seeTheFuture.reveal)
  const cardStr = topCards.map((c) => `cards:${c}`).join(',');
  helpers.addLog(
    state,
    helpers.createLogEntry(
      'action',
      `prophecy.reveal:${cardStr}`,
      { scope: 'private', senderId: playerId },
    ),
  );

  return { success: true, state };
}

/**
 * Execute Commit Prophecy — apply the player's chosen reordering of the top 2 cards
 */
export function executeCommitProphecy(
  state: CriticalState,
  playerId: string,
  newTop2: CriticalCard[],
  helpers: EngineHelpers,
): GameActionResult<CriticalState> {
  if (!state.pendingProphecy || state.pendingProphecy.playerId !== playerId) {
    return { success: false, error: 'No pending prophecy for this player' };
  }

  if (!Array.isArray(newTop2) || newTop2.length !== 2) {
    return { success: false, error: 'Must provide exactly 2 cards for the top of the deck' };
  }

  const topCards = state.pendingProphecy.topCards;
  for (const card of newTop2) {
    if (!topCards.includes(card)) {
      return { success: false, error: `Card ${card} was not in the top 5` };
    }
  }

  // Replace top 2 deck cards with chosen order
  state.deck.splice(0, 2, ...newTop2);
  state.pendingProphecy = null;

  helpers.addLog(
    state,
    helpers.createLogEntry('action', `Prophecy committed — the future has been shaped.`, {
      scope: 'all',
      senderId: playerId,
    }),
  );

  helpers.advanceTurn(state);

  return { success: true, state };
}
```

Add to `dispatchDeityPackAction` switch:
```typescript
case 'prophecy':
  playCard();
  return executeProphecy(state, playerId, helpers);
```

- [ ] **Step 5: Add commit_prophecy case to engine**

Add import: `import { ..., executeResurrection, executeJudgment, executeProphecy, executeCommitProphecy } from './critical-deity.utils';`

Add to switch:
```typescript
case 'commit_prophecy':
  return executeCommitProphecy(
    newState,
    context.userId,
    (typedPayload as { newTop2?: CriticalCard[] })?.newTop2,
    helpers,
  );
```

- [ ] **Step 6: Run test to verify it passes**

Run: `cd apps/be && pnpm jest critical-deity.utils.spec.ts --no-coverage`
Expected: All deity tests PASS

- [ ] **Step 7: Commit**

```bash
git add apps/be/src/games/critical/critical.state.ts \
        apps/be/src/games/engines/critical/critical-deity.utils.ts \
        apps/be/src/games/engines/critical/critical-deity.utils.spec.ts \
        apps/be/src/games/engines/critical/critical.engine.ts
git commit -m "feat(ARC-432): implement prophecy card"
```

---

### Task 12: Full test run and final verification

- [ ] **Step 1: Run all BE tests**

Run: `cd apps/be && pnpm test --no-coverage`
Expected: All tests PASS. If any fail, fix before proceeding.

- [ ] **Step 2: Run TypeScript compilation check**

Run: `cd apps/be && pnpm tsc --noEmit`
Expected: 0 errors

- [ ] **Step 3: Run lint**

Run: `cd apps/be && pnpm lint`
Expected: 0 errors

- [ ] **Step 4: Final commit if any lint fixes were needed**

```bash
git add -p
git commit -m "chore(ARC-432): lint fixes for new critical cards"
```

---

## Out of Scope

- Frontend UI for new cards (mobile/web)
- i18n strings for new card names
- Bot AI logic for new cards
- Judgment enforcement: the `pendingJudgment` flag is set by this plan. The validation step that blocks other actions while `pendingJudgment = true`, the `discard_judgment` action type, and the logic that clears the flag are follow-up work.
