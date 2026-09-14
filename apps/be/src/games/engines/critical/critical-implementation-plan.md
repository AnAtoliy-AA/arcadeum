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
| Chain Strike       | ✅ Done | Medium     | Two consecutive players   |
| Shield Bash        | ✅ Done | Medium     | Reflect strike back       |

#### Expansion 2: Future Pack ✅

| Card                  | Status  | Complexity | Notes                        |
| --------------------- | ------- | ---------- | ---------------------------- |
| See the Future (5x)   | ✅ Done | Low        | View top 5 cards             |
| Alter the Future (3x) | ✅ Done | Medium     | View & rearrange top 3 cards |
| Alter the Future (5x) | ✅ Done | Medium     | View & rearrange top 5 cards |
| Reveal the Future     | ✅ Done | Low        | Show all players top 3       |
| Share the Future      | ✅ Done | Medium     | Rearrange + show next player |
| Draw From Bottom      | ✅ Done | Low        | Draw bottom card             |
| Swap Top and Bottom   | ✅ Done | Low        | Swap deck positions          |
| Bury                  | ✅ Done | Low        | Draw then reinsert secretly  |

#### Expansion 3: Theft Pack ✅

| Card           | Status  | Complexity | Notes                 |
| -------------- | ------- | ---------- | --------------------- |
| Wildcard       | ✅ Done | Low        | Wildcard for combos   |
| Mark           | ✅ Done | Medium     | Tag card in hand      |
| I'll Take That | ✅ Done | Medium     | Steal next drawn card |
| Tower of Power | ✅ Done | High       | Stash protection      |
| Swap Hands     | ✅ Done | Medium     | Swap entire hands     |
| Snatch         | ✅ Done | Medium     | Steal specific card   |

#### Expansion 4: Chaos Pack ✅

| Card               | Status  | Complexity | Notes                     |
| ------------------ | ------- | ---------- | ------------------------- |
| Critical Implosion | ✅ Done | High       | Implemented in draw logic |
| Containment Field  | ✅ Done | Medium     | Implemented in draw logic |
| Fission            | ✅ Done | High       | Logic implemented         |
| Tribute            | ✅ Done | Medium     | Logic implemented         |
| Blackout           | ✅ Done | Medium     | Logic implemented         |
| Echo               | ✅ Done | Medium     | Re-execute discard top    |
| Scramble           | ✅ Done | Medium     | Rotate all hands          |

#### Expansion 5: Deity Pack ✅

| Card         | Status  | Complexity | Notes                     |
| ------------ | ------- | ---------- | ------------------------- |
| Omniscience  | ✅ Done | Low        | See everyone's hands      |
| Miracle      | ✅ Done | Low        | Gain a Defuse             |
| Smite        | ✅ Done | Medium     | Targeted Attack x3        |
| Rapture      | ✅ Done | Medium     | All players give 1 card   |
| Resurrection | ✅ Done | High       | Revive dead player        |
| Judgment     | ✅ Done | Medium     | All discard to 3 cards    |
| Prophecy     | ✅ Done | Medium     | Peek top 5, reorder top 2 |

---

## Summary

| Category            | Count  | Status         |
| ------------------- | ------ | -------------- |
| Basic Deck          | 13     | ✅ Implemented |
| Expansion 1: Attack | 7      | ✅ Implemented |
| Expansion 2: Future | 8      | ✅ Implemented |
| Expansion 3: Theft  | 6      | ✅ Implemented |
| Expansion 4: Chaos  | 7      | ✅ Implemented |
| Expansion 5: Deity  | 7      | ✅ Implemented |
| **Total**           | **48** | ✅ All done    |

---

## Game Creation Flow

When creating a game, host can select expansion packs via checkboxes:

```
☑️ Base Game (required)
☐ Attack Pack (+7 cards)
☐ Future Pack (+8 cards)
☐ Theft Pack (+6 cards)
☐ Chaos Pack (+7 cards)
☐ Deity Pack (+7 cards)
```

---

## Implementation Details

### State Changes

Added to `CriticalState`:

```typescript
expansions: CriticalExpansion[];  // ['attack', 'future', 'theft', 'chaos', 'deity']
```

### Utility Files

1. **`critical-attack.utils.ts`** — Attack Pack cards
2. **`critical-future.utils.ts`** — Future Pack cards
3. **`critical-theft.utils.ts`** — Theft Pack cards
4. **`critical-chaos.utils.ts`** — Chaos Pack cards
5. **`critical-deity.utils.ts`** — Deity Pack cards
6. **`critical-combo.utils.ts`** — Collection combos (Pair/Trio/Fiver)
7. **`critical-cancel.utils.ts`** — Cancel/Nope reversal logic
8. **`critical-defuse.utils.ts`** — Defuse logic
9. **`critical-favor.utils.ts`** — Favor logic
10. **`critical-validation.utils.ts`** — Action validation
11. **`critical-available-actions.utils.ts`** — Available actions per player
12. **`critical-theft-mark-check.utils.ts`** — Mark trigger logic
13. **`critical-theft-snatch.utils.ts`** — Snatch logic

---

## Verification

```bash
pnpm run test -- --testPathPattern=critical
```
