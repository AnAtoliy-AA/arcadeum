# Cat Dash - Cat Racing Dice Game Spec

## [S1] Problem

Players need a fun, social dice game featuring cats that combines simple mechanics with strategic depth. The game should support 2-6 players with host-customizable tracks and themes.

## [S2] Solution Overview

A multiplayer dice-based racing game where players roll dice to move cats along tracks, using special abilities to gain advantages. Hosts can select track types and visual themes before starting.

## [S3] Core Mechanics

### [S3.1] Dice Rolling

- **Base Movement**: Roll 1 standard die (1-6 spaces)
- **Special Faces**: Some dice have special symbols triggering cat abilities
- **Power Activation**: Cat abilities consume power tokens (limited per game)

### [S3.2] Track System

**Track Types:**

1. **Linear Track** - Straight path, 20 spaces, simple racing
2. **Circular Track** - Loop with 2 shortcut paths and 3 obstacle spaces
3. **Multiple Paths** - 3 fork options at spaces 5, 10, 15 with different risk/reward

**Track Features:**

- Start/finish line
- Obstacle spaces (skip next turn)
- Bonus spaces (extra roll or power recharge)
- Shortcut paths (skip spaces but risk penalty)

### [S3.3] Theme System

**Visual Themes:**

1. **Neon Cyber** - Cyberpunk aesthetic, neon colors, digital cats
2. **Classic Village** - Pastel colors, traditional cats, cozy atmosphere
3. **Space Cats** - Cosmic backgrounds, alien cats, zero-gravity effects
4. **Nature Wild** - Forest/jungle backgrounds, wild cat breeds, natural elements

Each theme has:

- Unique track art
- Cat character skins
- Sound effects
- Background music

## [S4] Cat Characters

### [S4.1] Unique Cats (4 base + 2 unlockable)

**Neon Cat** (Cyber theme specialist)

- Ability 1: "Digital Dash" - Skip next obstacle
- Ability 2: "Neon Shield" - Block one opponent's special ability
- Bonus: +1 movement in Neon Cyber theme

**Whiskers** (Village theme specialist)

- Ability 1: "Extra Life" - Re-roll once per game
- Ability 2: "Purr Power" - Steal 1 movement from adjacent opponent
- Bonus: +1 movement in Classic Village theme

**Stardust** (Space theme specialist)

- Ability 1: "Warp Jump" - Teleport to next bonus space
- Ability 2: "Star Shield" - Immune to obstacles for 2 turns
- Bonus: +1 movement in Space Cats theme

**Felix** (Nature theme specialist)

- Ability 1: "Nature's Path" - Take shortest route at fork
- Ability 2: "Wild Charge" - Move double on next roll
- Bonus: +1 movement in Nature Wild theme

**Unlockable Cats:**

- **Shadow** - Stealth abilities (unlock at level 5)
- **Luna** - Lunar powers (unlock at level 10)

### [S4.2] Cat Selection

- Players choose cat before game starts
- Host can enable/disable specific cats
- Theme specialist cats get bonuses in their theme

## [S5] Game Flow

### [S5.1] Pre-Game

1. Host creates room with track type and theme selection
2. Players join and select cats
3. Host confirms settings and starts game
4. Random turn order determined

### [S5.2] Turn Structure

1. **Roll Phase**: Player rolls die
2. **Movement Phase**: Move cat spaces equal to die result
3. **Ability Phase**: Optional - use cat ability (if available)
4. **Resolution Phase**: Apply effects (obstacles, bonuses, etc.)

### [S5.3] Win Conditions

- **Primary**: First cat to cross finish line
- **Tiebreaker**: Most unused power tokens
- **Secondary Tiebreaker**: Fastest total movement time

## [S6] Technical Implementation

### [S6.1] Backend Components

- **Engine**: `apps/be/src/games/engines/cat-dash/`
- **Service**: `apps/be/src/games/cat-dash/`
- **Gateway**: Socket events for dice rolls, movement, abilities

### [S6.2] Frontend Components

- **Widget**: `apps/web/src/widgets/CatDashGame/`
- **Landing**: `/games/cat-dash`
- **Themes**: 4 visual themes with unique assets

### [S6.3] Data Structures

**Game State:**

```typescript
interface GameState {
  trackType: 'linear' | 'circular' | 'multiple';
  theme: 'neon' | 'village' | 'space' | 'nature';
  players: Player[];
  currentPlayerIndex: number;
  turnNumber: number;
  track: TrackSpace[];
  logs: GameLogEntry[];
}

interface Player {
  id: string;
  catId: string;
  position: number;
  powerTokens: number;
  abilitiesUsed: string[];
  isReady: boolean;
}

interface TrackSpace {
  id: number;
  type: 'normal' | 'obstacle' | 'bonus' | 'fork';
  theme?: string;
  effect?: SpaceEffect;
}
```

**Actions:**

```typescript
type GameAction =
  | { type: 'ROLL_DICE'; playerId: string }
  | { type: 'MOVE'; playerId: string; spaces: number }
  | { type: 'USE_ABILITY'; playerId: string; abilityId: string }
  | { type: 'CHOOSE_PATH'; playerId: string; pathIndex: number };
```

### [S6.4] Game Rules

1. Players take turns clockwise
2. Must roll before moving
3. Abilities can only be used once per game (or as specified)
4. Obstacles skip next turn
5. Bonuses provide immediate effects
6. First to finish wins immediately

## [S7] Testing Strategy

### [S7.1] Backend Tests

- Engine logic: movement, abilities, win conditions
- Service: room management, turn handling
- Bot: AI player behavior

### [S7.2] Frontend Tests

- Widget rendering
- User interactions
- Theme switching

### [S7.3] E2E Tests

- Full game flow
- Multiple players
- Different track types/themes

## [S8] Success Metrics

- Game completion rate > 90%
- Average game duration 5-10 minutes
- Player satisfaction > 4/5 stars
- No critical bugs in production
