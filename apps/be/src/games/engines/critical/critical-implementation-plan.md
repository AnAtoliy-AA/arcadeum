# Critical Card Implementation Plan

This document tracks the implementation status and plan for all Critical cards.

---

## Card Categories

### 🎮 BASIC DECK (Always Included)

These cards are part of the core game and always included:

| Card                 | Status  | Notes                     |
| -------------------- | ------- | ------------------------- |
| Exploding Kitten     | ✅ Done | Player must defuse or die |
| Defuse               | ✅ Done | Place bomb back in deck   |
| Attack (2x)          | ✅ Done | Next player takes 2 turns |
| Skip                 | ✅ Done | End turn without drawing  |
| Shuffle              | ✅ Done | Shuffle deck              |
| See the Future (3x)  | ✅ Done | View top 3 cards          |
| Favor                | ✅ Done | Force player to give card |
| Nope                 | ✅ Done | Cancel any action         |
| Tacocat              | ✅ Done | Cat combo card            |
| Hairy Potato Cat     | ✅ Done | Cat combo card            |
| Rainbow Ralphing Cat | ✅ Done | Cat combo card            |
| Cattermelon          | ✅ Done | Cat combo card            |
| Bearded Cat          | ✅ Done | Cat combo card            |

**Total: 13 cards ✅ All implemented**

---

### 📦 EXPANSION PACKS (Optional - Selected via Checkboxes)

#### Expansion 1: Attack Pack ✅

| Card               | Status  | Complexity | Notes                     |
| ------------------ | ------- | ---------- | ------------------------- |
| Targeted Attack    | ✅ Done | Low        | Choose target for 2 turns |
| Personal Attack    | ✅ Done | Low        | Self takes 3 turns        |
| Attack of the Dead | ✅ Done | Low        | 3 turns × dead players    |
| Super Skip         | ✅ Done | Low        | End ALL turns             |
| Reverse            | ✅ Done | Medium     | Reverse play direction    |

#### Expansion 2: Future Pack

| Card                  | Status  | Complexity | Notes                        |
| --------------------- | ------- | ---------- | ---------------------------- |
| See the Future (5x)   | ❌ TODO | Low        | View top 5 cards             |
| Alter the Future (3x) | ❌ TODO | Medium     | View & rearrange top 3 cards |
| Alter the Future (5x) | ❌ TODO | Medium     | View & rearrange top 5 cards |
| Reveal the Future     | ❌ TODO | Low        | Show all players top 3       |
| Share the Future      | ❌ TODO | Medium     | Rearrange + show next player |
| Draw From Bottom      | ❌ TODO | Low        | Draw bottom card             |
| Swap Top and Bottom   | ❌ TODO | Low        | Swap deck positions          |
| Bury                  | ❌ TODO | Low        | Draw then reinsert secretly  |

#### Expansion 3: Theft Pack

| Card           | Status  | Complexity | Notes                 |
| -------------- | ------- | ---------- | --------------------- |
| Feral Cat      | ❌ TODO | Low        | Wildcard for combos   |
| Mark           | ❌ TODO | Medium     | Tag card in hand      |
| I'll Take That | ❌ TODO | Medium     | Steal next drawn card |
| Tower of Power | ❌ TODO | High       | Stash protection      |

#### Expansion 4: Chaos Pack ✅

| Card               | Status  | Complexity | Notes                     |
| ------------------ | ------- | ---------- | ------------------------- |
| Critical Implosion | ✅ Done | High       | Implemented in draw logic |
| Containment Field  | ✅ Done | Medium     | Implemented in draw logic |
| Fission            | ✅ Done | High       | Logic implemented         |
| Tribute            | ✅ Done | Medium     | Logic implemented         |
| Blackout           | ✅ Done | Medium     | Logic implemented         |

#### Expansion 5: Deity Pack

| Card          | Status  | Complexity | Notes                  |
| ------------- | ------- | ---------- | ---------------------- |
| Zombie Kitten | ❌ TODO | High       | Revive dead player     |
| Devilcat      | ❌ TODO | Medium     | Armageddon interaction |
| Armageddon    | ❌ TODO | High       | Godcat interaction     |
| Godcat        | ❌ TODO | High       | Wildcard for any card  |

---

## Summary

| Category            | Count  | Status           |
| ------------------- | ------ | ---------------- |
| Basic Deck          | 13     | ✅ Implemented   |
| Expansion 1: Attack | 5      | ✅ Implemented   |
| Expansion 2: Future | 8      | ❌ TODO          |
| Expansion 3: Theft  | 4      | ❌ TODO          |
| Expansion 4: Chaos  | 5      | ❌ TODO          |
| Expansion 5: Deity  | 4      | ❌ TODO          |
| **Total**           | **39** | 18 done, 21 TODO |

---

## Game Creation Flow

When creating a game, host can select expansion packs via checkboxes:

```
☑️ Base Game (required)
☐ Attack Pack (+5 cards)
☐ Future Pack (+8 cards)
☐ Theft Pack (+4 cards)
☐ Chaos Pack (+5 cards)
☐ Deity Pack (+4 cards)
```

---

## Implementation Details

### Phase 1: State Changes

Add to `CriticalState`:

```typescript
expansions: string[];  // ['attack', 'future', 'theft', 'chaos', 'deity']
```

Add to `createInitialCriticalState`:

```typescript
function createInitialCriticalState(
  playerIds: string[],
  expansions: string[] = [], // New parameter
): CriticalState;
```

### Phase 2: New Utility Files

1. **`critical-turn.utils.ts`** - Attack Pack cards
2. **`critical-future.utils.ts`** - Future Pack cards
3. **`critical-theft.utils.ts`** - Theft Pack cards
4. **`critical-chaos.utils.ts`** - Chaos Pack cards
5. **`critical-deity.utils.ts`** - Deity Pack cards

---

## Verification

```bash
pnpm run test -- --testPathPattern=critical
```
