# Glimworm Game Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new 2–10 player real-time multiplayer snake-style game called **Glimworm** (slug `glimworm_v1`), with three host-selectable variants and an optional power-up set, rendered with pixi.js, integrated into the existing Arcadeum games registry/rooms/lobby/rematch infrastructure.

**Architecture:** Server-authoritative simulation in NestJS at 20 Hz (matches the `critical_v1` / `sea_battle_v1` pattern: gateway → service → in-memory state). The Next.js web client subscribes to per-tick snapshots, renders worms with pixi.js using snapshot interpolation at 60 fps, and emits throttled `{ angle, usePowerup }` input. Variants and power-ups are strategy-pattern modules so adding/removing them never touches the core simulation.

**Tech Stack:**
- BE: NestJS, socket.io, existing `apps/be/src/games` infra
- Web: Next.js (`apps/web`), Zustand, TanStack Query (existing), `pixi.js@^8`, `pixi-filters@^6`
- Tests: Jest (BE), Vitest (web unit), Playwright (e2e)

**Spec:** `docs/superpowers/specs/2026-04-29-glimworm-game-design.md` (read it first)

---

## File Structure

### Backend (`apps/be/src/games/`)

```
games.module.ts                              MODIFY  (register new providers/gateway)
glimworm.gateway.ts                          CREATE  (thin transport layer)
glimworm/
├─ glimworm.service.ts                       CREATE  (tick loop + orchestration)
├─ glimworm.state.ts                         CREATE  (in-memory session map + accessors)
├─ glimworm.types.ts                         CREATE  (shared type definitions)
├─ glimworm.constants.ts                     CREATE  (tick rate, arena, speeds, caps)
├─ glimworm-bot.service.ts                   CREATE  (greedy-food bot AI)
├─ variants/
│  ├─ variant.strategy.ts                    CREATE  (interface + factory)
│  ├─ battle-royale.strategy.ts              CREATE
│  ├─ time-attack.strategy.ts                CREATE
│  └─ lives-heats.strategy.ts                CREATE
└─ powerups/
   ├─ powerup.def.ts                         CREATE  (interface + registry)
   ├─ speed.powerup.ts                       CREATE
   ├─ shield.powerup.ts                      CREATE
   ├─ shrink.powerup.ts                      CREATE
   └─ ghost.powerup.ts                       CREATE
```

### Web shared (`apps/web/src/`)

```
features/games/registry.ts                   MODIFY  (add glimworm_v1 metadata + loader)
features/games/registry.types.ts             MODIFY  (add glimworm_v1 to GameSlug union)
features/games/lib/glimwormVariants.ts       CREATE  (variant catalog for selector)
shared/i18n/messages/games/glimworm/
├─ index.ts                                  CREATE
├─ en.ts                                     CREATE
├─ ru.ts                                     CREATE
├─ es.ts                                     CREATE
├─ fr.ts                                     CREATE
└─ by.ts                                     CREATE
shared/i18n/messages/games/index.ts          MODIFY  (re-export glimworm bundle)
package.json (apps/web)                      MODIFY  (add pixi.js, pixi-filters)
```

### Web widget (`apps/web/src/widgets/GlimwormGame/`)

```
index.ts                                     CREATE  (default export + types)
GlimwormGame.tsx                             CREATE  (widget entry, BaseGameWidgetProps)
types/index.ts                               CREATE  (mirror of BE shared types)
store/glimwormStore.ts                       CREATE  (Zustand: snapshot, color, ui state)
hooks/
├─ useGlimwormSocket.ts                      CREATE  (socket lifecycle, input throttle, ingest)
├─ useGlimwormPixi.ts                        CREATE  (pixi App lifecycle + render loop)
└─ useGlimwormControls.ts                    CREATE  (mouse + touch → angle)
lib/pixi/
├─ createGlimwormApp.ts                      CREATE  (PIXI.Application init/teardown)
├─ renderArena.ts                            CREATE  (bg layer + safe-zone ring)
├─ renderWorms.ts                            CREATE  (per-worm Graphics + glow)
├─ renderFoodAndPowerups.ts                  CREATE
├─ interpolation.ts                          CREATE  (snapshot lerp + extrapolation)
└─ fx.ts                                     CREATE  (death particles, score popups)
ui/
├─ GlimwormHud.tsx                           CREATE  (DOM overlay)
├─ GlimwormDeathOverlay.tsx                  CREATE
└─ GlimwormLobbyExtras.tsx                   CREATE  (color picker + variant info)
```

### Tests

```
apps/be/src/games/glimworm/glimworm.service.spec.ts                  CREATE
apps/be/src/games/glimworm/variants/*.strategy.spec.ts (×3)          CREATE
apps/be/src/games/glimworm/powerups/*.spec.ts (×4)                   CREATE
apps/be/src/games/glimworm/glimworm-bot.service.spec.ts              CREATE
apps/be/src/games/glimworm.gateway.spec.ts                           CREATE
apps/web/src/widgets/GlimwormGame/lib/pixi/interpolation.test.ts     CREATE
apps/web/src/widgets/GlimwormGame/store/glimwormStore.test.ts        CREATE
apps/web/src/widgets/GlimwormGame/hooks/useGlimwormSocket.test.ts    CREATE
apps/web/e2e/glimworm.spec.ts                                        CREATE
```

---

## Conventions

- Branch: `ARC-XXX-glimworm-game` (replace XXX with your Jira ticket id)
- Commit format: Conventional Commits with `(ARC-XXX)` footer (per CLAUDE.md). Use the `/commit` skill when committing.
- TypeScript: never `any`. Use `unknown` or specific types. (CLAUDE.md)
- Each file ≤ 500 lines (`pnpm check-file-length` enforces).
- All user-facing strings via i18n (`useTranslation()` / `getTranslations()`). No hardcoded strings.
- Run from repo root: `pnpm test`, `pnpm lint`, `pnpm build`. The BE jest filter is `pnpm --filter be test --testPathPattern glimworm`. The web vitest filter is `pnpm --filter web test glimworm`.

---

# Phase A — Backend foundations

## Task A1: Constants and types

**Files:**
- Create: `apps/be/src/games/glimworm/glimworm.constants.ts`
- Create: `apps/be/src/games/glimworm/glimworm.types.ts`

- [ ] **Step 1: Write the constants file**

```ts
// apps/be/src/games/glimworm/glimworm.constants.ts
export const GLIMWORM_TICK_HZ = 20;
export const GLIMWORM_TICK_MS = 1000 / GLIMWORM_TICK_HZ;
export const GLIMWORM_ARENA = { width: 2000, height: 2000 } as const;
export const GLIMWORM_BASE_SPEED = 200;            // units / sec
export const GLIMWORM_SPEED_BURST_MULT = 1.7;
export const GLIMWORM_FOOD_CAP = 80;
export const GLIMWORM_POWERUP_CAP = 4;
export const GLIMWORM_START_LENGTH = 8;
export const GLIMWORM_GROW_PER_FOOD = { 1: 3, 3: 9 } as const;
export const GLIMWORM_RESPAWN_DELAY_MS = 1500;
export const GLIMWORM_INPUT_RATE_LIMIT_HZ = 30;
export const GLIMWORM_POWERUP_SPAWN_INTERVAL_MS = 8000;
export const GLIMWORM_POWERUP_SPAWN_CHANCE = 0.30;
export const GLIMWORM_POWERUP_WEIGHTS = { speed: 35, shield: 25, shrink: 20, ghost: 20 } as const;
export const GLIMWORM_POWERUP_DURATION_MS = { speed: 3000, shield: 15000, shrink: 0, ghost: 2000 } as const;
export const GLIMWORM_PALETTE = [
  '#ff5e5e','#ffb05e','#ffe65e','#7cff5e','#5effb6',
  '#5ee0ff','#5e8cff','#b15eff','#ff5ed4','#a0ffea',
] as const;
export const GLIMWORM_BR_SHRINK_DURATION_MS = 180_000;     // 3 min
export const GLIMWORM_BR_SAFE_ZONE_DAMAGE_INTERVAL_MS = 500;
export const GLIMWORM_TIME_ATTACK_DURATION_MS = 90_000;
export const GLIMWORM_LIVES_HEATS_LIVES = 3;
export const GLIMWORM_LIVES_HEATS_TIMEOUT_MS = 300_000;
export const GLIMWORM_DISCONNECT_GRACE_MS = 30_000;
export const GLIMWORM_RECONNECT_BACKOFF_MS = [1000, 2000, 4000, 8000];
```

- [ ] **Step 2: Write the types file**

```ts
// apps/be/src/games/glimworm/glimworm.types.ts
export type WormId = string;
export interface Vec2 { x: number; y: number; }

export type PowerupKind = 'speed' | 'shield' | 'shrink' | 'ghost';

export interface Worm {
  id: WormId;
  color: string;
  segments: Vec2[];
  heading: number;
  speed: number;
  alive: boolean;
  livesLeft: number;
  score: number;
  ready: boolean;            // lobby readiness toggle
  activePowerup: { kind: PowerupKind; expiresAt: number } | null;
  inventoryPowerup: PowerupKind | null;
  disconnected?: boolean;
  disconnectedAt?: number;
  respawnAt?: number;
  isBot?: boolean;
}

export interface Food   { id: string; pos: Vec2; value: 1 | 3; }
export interface Powerup { id: string; pos: Vec2; kind: PowerupKind; spawnedAt: number; }

export interface Arena {
  width: number;
  height: number;
  safeZone?: { center: Vec2; radius: number; shrinkRate: number };
}

export type GlimwormVariant = 'battle_royale' | 'time_attack' | 'lives_heats';

export interface GlimwormSession {
  roomId: string;
  hostUserId: string;
  variant: GlimwormVariant;
  powerupsEnabled: boolean;
  status: 'lobby' | 'countdown' | 'playing' | 'ended';
  startedAt: number | null;
  endsAt: number | null;
  arena: Arena;
  worms: Record<WormId, Worm>;
  food: Food[];
  powerups: Powerup[];
  winner: WormId | null;
  tickNum: number;
  lastInputAt: Record<WormId, number>;
  lastPowerupSpawnAt: number;
  damageTickAt: Record<WormId, number>; // for safe-zone damage cadence
}

// Server → client snapshot. Personalised: viewer's worm has `self: true` and full fields.
export interface GlimwormWormSnapshot {
  id: WormId;
  color: string;
  segments: Vec2[];
  alive: boolean;
  livesLeft: number;
  score: number;
  activePowerup: Worm['activePowerup'];
  self?: boolean;
  heading?: number;
  speed?: number;
  inventoryPowerup?: PowerupKind | null;
}

export interface GlimwormSnapshot {
  roomId: string;
  tickNum: number;
  serverTime: number;
  status: GlimwormSession['status'];
  variant: GlimwormVariant;
  powerupsEnabled: boolean;
  arena: Arena;
  worms: GlimwormWormSnapshot[];
  food: Food[];
  powerups: Powerup[];
  endsAt: number | null;
  winner: WormId | null;
}

export type GlimwormDiscreteEvent =
  | { type: 'worm_died'; wormId: WormId; killerId: WormId | null; tickNum: number }
  | { type: 'powerup_picked'; wormId: WormId; kind: PowerupKind; tickNum: number }
  | { type: 'powerup_used'; wormId: WormId; kind: PowerupKind; tickNum: number }
  | { type: 'round_started'; tickNum: number; serverTime: number }
  | { type: 'round_ended'; winner: WormId | null; scoreboard: Array<{ id: WormId; score: number }>; tickNum: number };

export interface GlimwormInputPayload {
  angle: number;
  usePowerup: boolean;
}
```

- [ ] **Step 3: Verify it compiles**

Run: `pnpm --filter be tsc --noEmit`
Expected: 0 errors

- [ ] **Step 4: Commit**

```bash
git add apps/be/src/games/glimworm/glimworm.constants.ts apps/be/src/games/glimworm/glimworm.types.ts
git commit -m "feat(glimworm): add constants and shared types (ARC-XXX)"
```

---

## Task A2: In-memory session state module

**Files:**
- Create: `apps/be/src/games/glimworm/glimworm.state.ts`

- [ ] **Step 1: Write the failing test**

Create `apps/be/src/games/glimworm/glimworm.state.spec.ts`:

```ts
import { GlimwormStateStore } from './glimworm.state';

describe('GlimwormStateStore', () => {
  it('creates, retrieves, and removes sessions', () => {
    const store = new GlimwormStateStore();
    const session = store.create({
      roomId: 'r1', hostUserId: 'u1', variant: 'battle_royale', powerupsEnabled: false,
    });
    expect(store.get('r1')).toBe(session);
    expect(store.list()).toHaveLength(1);
    store.remove('r1');
    expect(store.get('r1')).toBeUndefined();
  });

  it('returns undefined for unknown rooms', () => {
    const store = new GlimwormStateStore();
    expect(store.get('nope')).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter be test glimworm.state`
Expected: FAIL — module not found

- [ ] **Step 3: Implement `glimworm.state.ts`**

```ts
import { GLIMWORM_ARENA } from './glimworm.constants';
import type { GlimwormSession, GlimwormVariant } from './glimworm.types';

export interface CreateSessionInput {
  roomId: string;
  hostUserId: string;
  variant: GlimwormVariant;
  powerupsEnabled: boolean;
}

export class GlimwormStateStore {
  private readonly sessions = new Map<string, GlimwormSession>();

  create(input: CreateSessionInput): GlimwormSession {
    const session: GlimwormSession = {
      roomId: input.roomId,
      hostUserId: input.hostUserId,
      variant: input.variant,
      powerupsEnabled: input.powerupsEnabled,
      status: 'lobby',
      startedAt: null,
      endsAt: null,
      arena: { width: GLIMWORM_ARENA.width, height: GLIMWORM_ARENA.height },
      worms: {},
      food: [],
      powerups: [],
      winner: null,
      tickNum: 0,
      lastInputAt: {},
      lastPowerupSpawnAt: 0,
      damageTickAt: {},
    };
    this.sessions.set(input.roomId, session);
    return session;
  }

  get(roomId: string): GlimwormSession | undefined {
    return this.sessions.get(roomId);
  }

  remove(roomId: string): void {
    this.sessions.delete(roomId);
  }

  list(): GlimwormSession[] {
    return [...this.sessions.values()];
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter be test glimworm.state`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/be/src/games/glimworm/glimworm.state.ts apps/be/src/games/glimworm/glimworm.state.spec.ts
git commit -m "feat(glimworm): add in-memory session state store (ARC-XXX)"
```

---

## Task A3: Variant strategy interface + Battle Royale

**Files:**
- Create: `apps/be/src/games/glimworm/variants/variant.strategy.ts`
- Create: `apps/be/src/games/glimworm/variants/battle-royale.strategy.ts`
- Test: `apps/be/src/games/glimworm/variants/battle-royale.strategy.spec.ts`

- [ ] **Step 1: Write `variant.strategy.ts`**

```ts
import type { GlimwormSession, Worm, WormId, GlimwormVariant } from '../glimworm.types';

export interface VariantStrategy {
  initSession(s: GlimwormSession): void;
  onWormDeath(s: GlimwormSession, victim: Worm, killer: Worm | null): void;
  checkEndCondition(s: GlimwormSession): WormId | null;
  tickHook?(s: GlimwormSession, now: number): void;
}

export type VariantFactory = () => VariantStrategy;
```

- [ ] **Step 2: Write the failing BR tests**

Create `apps/be/src/games/glimworm/variants/battle-royale.strategy.spec.ts` covering:
1. `initSession` sets `livesLeft = 1` for every worm and creates `arena.safeZone` at full radius.
2. `onWormDeath` flips `victim.alive = false` (no respawn).
3. `checkEndCondition` returns the single alive worm's id when one remains, else `null`.
4. When 0 worms are alive: returns the highest-score worm id; if all scores tie, returns `null` (draw).
5. `tickHook` shrinks `arena.safeZone.radius` over time and (separately) decrements 1 segment per `damageTickAt` cadence for worms outside the zone.

```ts
import { BattleRoyaleStrategy } from './battle-royale.strategy';
import type { GlimwormSession, Worm } from '../glimworm.types';

const makeWorm = (id: string, overrides: Partial<Worm> = {}): Worm => ({
  id, color: '#fff', segments: [{ x: 100, y: 100 }, { x: 90, y: 100 }],
  heading: 0, speed: 200, alive: true, livesLeft: 1, score: 0,
  activePowerup: null, inventoryPowerup: null, ...overrides,
});

const makeSession = (worms: Worm[]): GlimwormSession => ({
  roomId: 'r1', hostUserId: 'u1', variant: 'battle_royale', powerupsEnabled: false,
  status: 'playing', startedAt: 0, endsAt: null,
  arena: { width: 2000, height: 2000 },
  worms: Object.fromEntries(worms.map((w) => [w.id, w])),
  food: [], powerups: [], winner: null, tickNum: 0,
  lastInputAt: {}, lastPowerupSpawnAt: 0, damageTickAt: {},
});

describe('BattleRoyaleStrategy', () => {
  it('initSession sets livesLeft=1 and creates safe zone', () => {
    const s = makeSession([makeWorm('a'), makeWorm('b')]);
    new BattleRoyaleStrategy().initSession(s);
    expect(s.worms.a.livesLeft).toBe(1);
    expect(s.arena.safeZone).toBeDefined();
  });

  it('onWormDeath marks victim dead, no respawn', () => {
    const s = makeSession([makeWorm('a')]);
    new BattleRoyaleStrategy().onWormDeath(s, s.worms.a, null);
    expect(s.worms.a.alive).toBe(false);
  });

  it('checkEndCondition returns the last alive worm', () => {
    const a = makeWorm('a', { alive: false });
    const b = makeWorm('b', { alive: true });
    const s = makeSession([a, b]);
    expect(new BattleRoyaleStrategy().checkEndCondition(s)).toBe('b');
  });

  it('returns highest-score worm if all dead, null on tie', () => {
    const a = makeWorm('a', { alive: false, score: 5 });
    const b = makeWorm('b', { alive: false, score: 9 });
    const s = makeSession([a, b]);
    expect(new BattleRoyaleStrategy().checkEndCondition(s)).toBe('b');

    const c = makeWorm('c', { alive: false, score: 5 });
    const d = makeWorm('d', { alive: false, score: 5 });
    const s2 = makeSession([c, d]);
    expect(new BattleRoyaleStrategy().checkEndCondition(s2)).toBeNull();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm --filter be test battle-royale`
Expected: FAIL — module not found

- [ ] **Step 4: Implement `battle-royale.strategy.ts`**

```ts
import {
  GLIMWORM_ARENA, GLIMWORM_BR_SHRINK_DURATION_MS,
  GLIMWORM_BR_SAFE_ZONE_DAMAGE_INTERVAL_MS,
} from '../glimworm.constants';
import type { GlimwormSession, Worm, WormId } from '../glimworm.types';
import type { VariantStrategy } from './variant.strategy';

export class BattleRoyaleStrategy implements VariantStrategy {
  initSession(s: GlimwormSession): void {
    Object.values(s.worms).forEach((w) => { w.livesLeft = 1; });
    const radius = Math.max(GLIMWORM_ARENA.width, GLIMWORM_ARENA.height) / 2;
    s.arena.safeZone = {
      center: { x: GLIMWORM_ARENA.width / 2, y: GLIMWORM_ARENA.height / 2 },
      radius,
      shrinkRate: (radius * 0.7) / (GLIMWORM_BR_SHRINK_DURATION_MS / 1000),
    };
  }

  // NOTE: `onWormDeath` must match the 3-param interface signature.
  // The codebase ESLint config disallows `_`-prefixed unused params; use the
  // `void s; void killer;` idiom instead (precedent: apps/be/src/auth/jwt/jwt-optional.guard.ts).
  onWormDeath(s: GlimwormSession, victim: Worm, killer: Worm | null): void {
    void s;
    void killer;
    victim.alive = false;
    victim.livesLeft = 0;
  }

  checkEndCondition(s: GlimwormSession): WormId | null {
    const alive = Object.values(s.worms).filter((w) => w.alive);
    if (alive.length === 1) return alive[0].id;
    if (alive.length === 0) {
      const all = Object.values(s.worms);
      const max = Math.max(...all.map((w) => w.score));
      const top = all.filter((w) => w.score === max);
      return top.length === 1 ? top[0].id : null;
    }
    return null;
  }

  tickHook(s: GlimwormSession, now: number): void {
    if (!s.arena.safeZone) return;
    const dtSec = 1 / 20;
    s.arena.safeZone.radius = Math.max(
      Math.max(s.arena.width, s.arena.height) * 0.15,
      s.arena.safeZone.radius - s.arena.safeZone.shrinkRate * dtSec,
    );
    // Damage worms outside the safe zone at fixed cadence
    for (const worm of Object.values(s.worms)) {
      if (!worm.alive) continue;
      const head = worm.segments[0];
      const cz = s.arena.safeZone.center;
      const distSq = (head.x - cz.x) ** 2 + (head.y - cz.y) ** 2;
      if (distSq > s.arena.safeZone.radius ** 2) {
        const last = s.damageTickAt[worm.id] ?? 0;
        if (now - last >= GLIMWORM_BR_SAFE_ZONE_DAMAGE_INTERVAL_MS) {
          worm.segments.pop();
          s.damageTickAt[worm.id] = now;
          if (worm.segments.length <= 0) this.onWormDeath(s, worm, null);
        }
      } else {
        delete s.damageTickAt[worm.id];
      }
    }
  }
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm --filter be test battle-royale`
Expected: all PASS

- [ ] **Step 6: Commit**

```bash
git add apps/be/src/games/glimworm/variants/
git commit -m "feat(glimworm): add variant strategy interface and Battle Royale (ARC-XXX)"
```

---

## Task A4: Time-Attack variant

**Files:**
- Create: `apps/be/src/games/glimworm/variants/time-attack.strategy.ts`
- Test: `apps/be/src/games/glimworm/variants/time-attack.strategy.spec.ts`

- [ ] **Step 1: Write tests covering:**
1. `initSession` sets `endsAt = startedAt + 90_000`, no safe zone, `livesLeft = Infinity`.
2. `onWormDeath` schedules `respawnAt = now + 1500`, awards killer `+5 score`, drops 30% of victim score as bonus food at the death site (push to `s.food`).
3. `checkEndCondition` returns `null` while `now < endsAt`.
4. `checkEndCondition` returns the highest-score worm id when `now >= endsAt`; if scores tie, returns `null` (draw — the result modal renders "Tie"). No further tiebreaker.

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter be test time-attack`
Expected: FAIL — module not found

- [ ] **Step 3: Implement `time-attack.strategy.ts`** following the BR strategy shape; key differences:
- `initSession`: every worm `livesLeft = Number.POSITIVE_INFINITY`; `s.endsAt = (s.startedAt ?? Date.now()) + GLIMWORM_TIME_ATTACK_DURATION_MS`; no `safeZone`.
- `onWormDeath`: `victim.alive = false; victim.respawnAt = Date.now() + GLIMWORM_RESPAWN_DELAY_MS;` if `killer` non-null `killer.score += 5`; spawn `Math.floor(victim.score * 0.3)` food items at the head position with `value: 1` (push to `s.food`).
- `checkEndCondition`: if `Date.now() >= (s.endsAt ?? Infinity)` return highest-score worm, tie → `null`; else `null`.
- `tickHook` (optional): respawn dead worms whose `respawnAt <= now` (resets length to `GLIMWORM_START_LENGTH`, finds spawn position via the service helper — but for now just place at center).

- [ ] **Step 4: Run tests**

Run: `pnpm --filter be test time-attack`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/be/src/games/glimworm/variants/time-attack.strategy.ts apps/be/src/games/glimworm/variants/time-attack.strategy.spec.ts
git commit -m "feat(glimworm): add Time-Attack variant (ARC-XXX)"
```

---

## Task A5: Lives + Heats variant

**Files:**
- Create: `apps/be/src/games/glimworm/variants/lives-heats.strategy.ts`
- Test: `apps/be/src/games/glimworm/variants/lives-heats.strategy.spec.ts`

- [ ] **Step 1: Tests covering:**
1. `initSession` sets `livesLeft = 3`.
2. `onWormDeath` decrements `livesLeft`; if `> 0` schedules respawn after 1.5 s; if `= 0` flips `alive = false` permanently.
3. `checkEndCondition` returns the only worm with `livesLeft > 0` when others are out, else `null` until 5 min timeout, after which highest `score + livesLeft × 50` wins.

- [ ] **Step 2: Run test, see fail**

Run: `pnpm --filter be test lives-heats`
Expected: FAIL

- [ ] **Step 3: Implement `lives-heats.strategy.ts`** mirroring the BR/TA shape with the rules above.

- [ ] **Step 4: Run tests**

Run: `pnpm --filter be test lives-heats`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/be/src/games/glimworm/variants/lives-heats.strategy.ts apps/be/src/games/glimworm/variants/lives-heats.strategy.spec.ts
git commit -m "feat(glimworm): add Lives + Heats variant (ARC-XXX)"
```

---

## Task A6: Variant factory

**Files:**
- Modify: `apps/be/src/games/glimworm/variants/variant.strategy.ts`

- [ ] **Step 1: Add a factory function**

Append to `variant.strategy.ts`:

```ts
import { BattleRoyaleStrategy } from './battle-royale.strategy';
import { TimeAttackStrategy } from './time-attack.strategy';
import { LivesHeatsStrategy } from './lives-heats.strategy';

export function createVariantStrategy(variant: GlimwormVariant): VariantStrategy {
  switch (variant) {
    case 'battle_royale': return new BattleRoyaleStrategy();
    case 'time_attack':   return new TimeAttackStrategy();
    case 'lives_heats':   return new LivesHeatsStrategy();
    default: {
      const _exhaustive: never = variant;
      throw new Error(`Unknown variant: ${String(_exhaustive)}`);
    }
  }
}
```

- [ ] **Step 2: Add a small spec** for `createVariantStrategy('battle_royale')` returning a `BattleRoyaleStrategy` instance, etc.

- [ ] **Step 3: Run tests**

Run: `pnpm --filter be test variant.strategy`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add apps/be/src/games/glimworm/variants/variant.strategy.ts apps/be/src/games/glimworm/variants/variant.strategy.spec.ts
git commit -m "feat(glimworm): add variant factory (ARC-XXX)"
```

---

## Task A7: Power-up interface + speed power-up

**Files:**
- Create: `apps/be/src/games/glimworm/powerups/powerup.def.ts`
- Create: `apps/be/src/games/glimworm/powerups/speed.powerup.ts`
- Test: `apps/be/src/games/glimworm/powerups/speed.powerup.spec.ts`

- [ ] **Step 1: Write `powerup.def.ts`**

```ts
import type { GlimwormSession, Worm, PowerupKind } from '../glimworm.types';

export interface PowerupDef {
  kind: PowerupKind;
  durationMs: number;        // 0 = instant
  apply(worm: Worm, session: GlimwormSession, now: number): void;
  expire?(worm: Worm, session: GlimwormSession): void;
}

export const POWERUP_REGISTRY = new Map<PowerupKind, PowerupDef>();

export function registerPowerup(def: PowerupDef): void {
  POWERUP_REGISTRY.set(def.kind, def);
}

export function getPowerup(kind: PowerupKind): PowerupDef {
  const def = POWERUP_REGISTRY.get(kind);
  if (!def) throw new Error(`Unknown power-up: ${kind}`);
  return def;
}
```

- [ ] **Step 2: Write the speed power-up test**

Create `speed.powerup.spec.ts`:
1. `apply` sets `worm.speed = base × 1.7` and sets `activePowerup` with correct expiry.
2. `expire` reverts `worm.speed` to base.
3. Reapply during active doesn't stack; expiry resets to fresh duration.

- [ ] **Step 3: Run test, see fail**

Run: `pnpm --filter be test speed.powerup`
Expected: FAIL

- [ ] **Step 4: Implement `speed.powerup.ts`**

```ts
import { GLIMWORM_BASE_SPEED, GLIMWORM_SPEED_BURST_MULT, GLIMWORM_POWERUP_DURATION_MS } from '../glimworm.constants';
import type { PowerupDef } from './powerup.def';
import { registerPowerup } from './powerup.def';

export const speedPowerup: PowerupDef = {
  kind: 'speed',
  durationMs: GLIMWORM_POWERUP_DURATION_MS.speed,
  apply(worm, _session, now) {
    worm.speed = GLIMWORM_BASE_SPEED * GLIMWORM_SPEED_BURST_MULT;
    worm.activePowerup = { kind: 'speed', expiresAt: now + GLIMWORM_POWERUP_DURATION_MS.speed };
  },
  expire(worm) {
    worm.speed = GLIMWORM_BASE_SPEED;
    if (worm.activePowerup?.kind === 'speed') worm.activePowerup = null;
  },
};

registerPowerup(speedPowerup);
```

- [ ] **Step 5: Run tests, commit**

Run: `pnpm --filter be test speed.powerup`
Expected: PASS

```bash
git add apps/be/src/games/glimworm/powerups/
git commit -m "feat(glimworm): add power-up registry and speed power-up (ARC-XXX)"
```

---

## Task A8: Shield power-up

**Files:**
- Create: `apps/be/src/games/glimworm/powerups/shield.powerup.ts`
- Test: `apps/be/src/games/glimworm/powerups/shield.powerup.spec.ts`

Behaviour: `apply` sets `activePowerup = { kind: 'shield', expiresAt: now + 15_000 }`. Shield consumption is handled in service collision logic (Task A11). `expire` clears `activePowerup` if still shield.

- [ ] **Step 1:** Write tests (apply sets shield, expire clears it).
- [ ] **Step 2:** Run, see fail.
- [ ] **Step 3:** Implement (mirror speed.powerup.ts shape).
- [ ] **Step 4:** Run tests, expect PASS.
- [ ] **Step 5:** Commit:

```bash
git add apps/be/src/games/glimworm/powerups/shield.powerup.ts apps/be/src/games/glimworm/powerups/shield.powerup.spec.ts
git commit -m "feat(glimworm): add shield power-up (ARC-XXX)"
```

---

## Task A9: Shrink power-up

**Files:**
- Create: `apps/be/src/games/glimworm/powerups/shrink.powerup.ts`
- Test: `apps/be/src/games/glimworm/powerups/shrink.powerup.spec.ts`

Behaviour: `apply` is instant. Drops 30% of segments (rounded down, min length 5). Dropped segments converted to `Food` items (`value: 1`) and pushed to `session.food`.

- [ ] Steps 1–5 as A7/A8 pattern. Edge case: worm with length 5 → no drop. Test must cover.

```bash
git commit -m "feat(glimworm): add shrink power-up (ARC-XXX)"
```

---

## Task A10: Ghost power-up

**Files:**
- Create: `apps/be/src/games/glimworm/powerups/ghost.powerup.ts`
- Test: `apps/be/src/games/glimworm/powerups/ghost.powerup.spec.ts`

Behaviour: `apply` sets `activePowerup = { kind: 'ghost', expiresAt: now + 2000 }`. Service collision logic (Task A11) skips trail-collisions when active. `expire` clears.

- [ ] Steps 1–5 as A7 pattern.

```bash
git commit -m "feat(glimworm): add ghost power-up (ARC-XXX)"
```

---

## Task A11: GlimwormService — tick orchestration core

**Files:**
- Create: `apps/be/src/games/glimworm/glimworm.service.ts`
- Test: `apps/be/src/games/glimworm/glimworm.service.spec.ts`

This task wires the per-tick simulation. Big task — split into sub-steps but commit at the end as one cohesive piece.

- [ ] **Step 1: Write the spec** covering deterministic tick mutation order from spec §2:
1. `applyInputs` — heading + usePowerup
2. `advanceHeads` — `pos += dir × speed × dt`
3. `resolvePickups` — head-AABB vs food (grow + score) and power-ups (inventory)
4. `resolveCollisions` — head-vs-other-trail (ghost skips), head-vs-self (always), head-vs-arena-walls. Shielded worm absorbs 1 hit. Two heads colliding on same tick → both die.
5. `trimSegments` — extend or trim each worm to its target length
6. `spawnItems` — top up food to cap; roll for power-up if interval elapsed and `powerupsEnabled`
7. `applyVariantHook` and `checkEnd` — strategy `tickHook` + `checkEndCondition`
8. `buildSnapshots` — per-client personalised snapshot
9. Bookkeeping — increment `tickNum`, expire active power-ups whose `expiresAt <= now`

Test cases (each as its own `it`):
- Worm advances correctly with given heading and dt
- Eating food grows and scores
- Picking up power-up while inventory empty stores it; while occupied — leaves on floor
- Activating an inventory power-up calls `apply` and clears inventory
- Trail collision kills (both worms case: both die)
- Wall collision kills
- Shield absorbs first lethal hit, gets cleared
- Ghost skips trail collisions but not walls
- Food spawns up to cap, never above
- Power-up only spawns when host enabled
- Variant `tickHook` gets called; `checkEndCondition` ends session

- [ ] **Step 2: Run, see fail.**

Run: `pnpm --filter be test glimworm.service`
Expected: FAIL

- [ ] **Step 3: Implement `glimworm.service.ts`**

Provide an `@Injectable()` NestJS service with:
- Dependencies (constructor): `GlimwormStateStore`, `GameRoomsService`, `GameSessionsService`, `GamesRealtimeService` (broadcast), `GlimwormBotService` (forward-ref), `Logger`.
- Public methods:
  - `joinRoom(roomId, userId, color?)` — adds a worm to session at `lobby` status; auto-assigns next free color from palette if `color` is taken/missing. Validates max-10.
  - `leaveRoom(roomId, userId)` — removes worm or marks `disconnected: true` if mid-round.
  - `markReady(roomId, userId, ready: boolean)` — toggles ready flag on worm (add `ready?: boolean` to Worm type if missing).
  - `start(roomId, hostUserId, opts: { variant, powerupsEnabled, fillWithBots })` — guards: only host, ≥2 ready. Transitions `lobby → countdown → playing`. For each worm: pick a starting position via `findSpawnPosition(session, worm.id)` (see helper below), set length 8, set `heading` pointing toward the arena centre. Calls strategy `initSession`. Records `startedAt`. Starts the tick loop for this room.
  - `findSpawnPosition(session, wormId): Vec2` — samples random tiles inside the arena (and inside `safeZone` if present); accepts only tiles ≥ 200 units from any existing worm segment. Tries up to 20 samples. If no valid tile found, returns the farthest-available sampled tile (largest min-distance to any segment). Used both at session start and on respawn.
  - `submitInput(roomId, userId, payload: GlimwormInputPayload)` — rate-limit-validates (drop if last input < `1000/30 ms` ago), clamps `angle ∈ [-π, π]`, stores on worm; if `usePowerup && inventoryPowerup` then queues activation for next tick.
  - `endSession(roomId, winner)` — sets `status='ended'`, emits `round_ended`, schedules cleanup.
- Private tick implementation (call out to pure helpers in `glimworm.service.ts` — keep file under 500 lines; split into `glimworm.service.tick.ts` if needed).
- Tick loop runs via `setInterval(tickFn, GLIMWORM_TICK_MS)` per active room. Stored in `Map<roomId, NodeJS.Timeout>`.
- All broadcasts go through `GamesRealtimeService` (existing) emitting events `glimworm.snapshot` and `glimworm.event`.

Keep mutation steps as small named functions:

```ts
private applyInputs(s: GlimwormSession): void { ... }
private advanceHeads(s: GlimwormSession, dtSec: number): void { ... }
private resolvePickups(s: GlimwormSession): void { ... }
private resolveCollisions(s: GlimwormSession): void { ... }
private trimSegments(s: GlimwormSession): void { ... }
private spawnItems(s: GlimwormSession, now: number): void { ... }
private expireActivePowerups(s: GlimwormSession, now: number): void { ... }
private buildSnapshotForViewer(s: GlimwormSession, viewerId: WormId): GlimwormSnapshot { ... }
```

- [ ] **Step 4: If `glimworm.service.ts` approaches 500 lines, split tick mutation helpers into a separate `glimworm.service.tick.ts` and re-export.**

Run: `pnpm --filter be exec ts-node -e "..."` or just check line count: `wc -l apps/be/src/games/glimworm/glimworm.service.ts`. If > 450, split.

- [ ] **Step 5: Run all glimworm tests**

Run: `pnpm --filter be test glimworm`
Expected: all PASS

- [ ] **Step 6: Commit**

```bash
git add apps/be/src/games/glimworm/glimworm.service.ts apps/be/src/games/glimworm/glimworm.service.spec.ts
git commit -m "feat(glimworm): add core tick loop and session orchestration (ARC-XXX)"
```

---

## Task A12: Bot service

**Files:**
- Create: `apps/be/src/games/glimworm/glimworm-bot.service.ts`
- Test: `apps/be/src/games/glimworm/glimworm-bot.service.spec.ts`

Logic: greedy toward nearest food, bias away from walls and other trails. Returns an angle.

- [ ] **Step 1: Write tests**
- Bot picks angle toward nearest food when no obstacles
- Bot biases away from a near wall
- Bot avoids a directly-ahead trail when one exists

- [ ] **Step 2: Run, see fail**

- [ ] **Step 3: Implement** as `@Injectable()` with a single public `pickAngle(session, bot): number` method. Use simple weighted vector sum (food-attractor – wall-repulsor – trail-repulsor). Bot worms have `id: 'bot-<uuid>'` so the service can identify them.

- [ ] **Step 4: Run tests, commit:**

```bash
git commit -m "feat(glimworm): add greedy-food bot service (ARC-XXX)"
```

---

## Task A13: Gateway

**Files:**
- Create: `apps/be/src/games/glimworm.gateway.ts`
- Test: `apps/be/src/games/glimworm.gateway.spec.ts`

Mirror `apps/be/src/games/critical.gateway.ts` shape exactly:

- `@WebSocketGateway({ namespace: 'games', cors: { origin: corsOriginMatcher } })`
- Inject `GlimwormService`, `Logger`.
- Handlers:
  - `@SubscribeMessage('glimworm.input')` → validates `{ angle, usePowerup }`, calls `glimwormService.submitInput`.
  - `@SubscribeMessage('glimworm.start')` → host triggers start; calls `glimwormService.start`.
  - `@SubscribeMessage('glimworm.color.pick')` → request a color; service validates and broadcasts.
- Errors caught with `handleError` from `games.gateway.utils.ts`. Wrap responses with `maybeEncrypt` per existing pattern.

- [ ] **Step 1: Tests**
- `glimworm.input` rejects `angle = NaN`, clamps `2π → π`, drops if rate-limited (mock service).
- `glimworm.start` rejects from non-host (mock service throws → gateway returns error response).

- [ ] **Step 2: Run, see fail.**

- [ ] **Step 3: Implement** following `critical.gateway.ts` exactly.

- [ ] **Step 4: Run tests, commit:**

```bash
git commit -m "feat(glimworm): add socket gateway (ARC-XXX)"
```

---

## Task A14: Module registration

**Files:**
- Modify: `apps/be/src/games/games.module.ts`

- [ ] **Step 1: Add imports and providers**

In `games.module.ts`:

```ts
import { GlimwormGateway } from './glimworm.gateway';
import { GlimwormService } from './glimworm/glimworm.service';
import { GlimwormBotService } from './glimworm/glimworm-bot.service';
import { GlimwormStateStore } from './glimworm/glimworm.state';
```

Add to `providers: [...]`:
```ts
GlimwormStateStore,
GlimwormService,
GlimwormBotService,
GlimwormGateway,
```

- [ ] **Step 2: Verify the BE boots**

Run: `pnpm --filter be start --no-watch` for ~5 seconds; check log for "GlimwormGateway dependencies initialized" or equivalent. Kill with Ctrl-C.

If you can't easily do this manually, run `pnpm --filter be build` and confirm 0 errors.

- [ ] **Step 3: Commit**

```bash
git add apps/be/src/games/games.module.ts
git commit -m "feat(glimworm): wire glimworm services into games module (ARC-XXX)"
```

---

# Phase B — Web shared infrastructure

## Task B1: Add `glimworm_v1` to GameSlug union

**Files:**
- Modify: `apps/web/src/features/games/registry.types.ts`

- [ ] **Step 1:** Add `| 'glimworm_v1'` to the union (alphabetically near `'snake_v1'` is fine).

- [ ] **Step 2: Verify it compiles**

Run: `pnpm --filter web tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/features/games/registry.types.ts
git commit -m "feat(glimworm): add glimworm_v1 to GameSlug union (ARC-XXX)"
```

---

## Task B2: Install pixi.js dependencies

**Files:**
- Modify: `apps/web/package.json`

- [ ] **Step 1:** Run from repo root:

```bash
pnpm --filter web add pixi.js@^8 pixi-filters@^6
```

- [ ] **Step 2:** Verify the install:

```bash
pnpm --filter web list pixi.js pixi-filters
```

Expected: pixi.js 8.x, pixi-filters 6.x.

- [ ] **Step 3: Commit**

```bash
git add apps/web/package.json pnpm-lock.yaml
git commit -m "chore(glimworm): add pixi.js and pixi-filters dependencies (ARC-XXX)"
```

---

## Task B3: i18n message bundle (5 locales)

**Files:**
- Create: `apps/web/src/shared/i18n/messages/games/glimworm/en.ts` (and `ru.ts`, `es.ts`, `fr.ts`, `by.ts`, `index.ts`)
- Modify: `apps/web/src/shared/i18n/messages/games/index.ts`

- [ ] **Step 1: Create the English bundle.** Mirror the shape used by `sea-battle/en.ts`:

```ts
// apps/web/src/shared/i18n/messages/games/glimworm/en.ts
export const enMessages = {
  glimworm_v1: {
    name: 'Glimworm',
    description: 'A glow-in-the-dark snake battle for 2–10 players.',
    tagline: 'Hold a finger, slither, survive.',
    variant: {
      battleRoyale:  { name: 'Battle Royale', description: 'Last worm alive wins. The arena shrinks.' },
      timeAttack:    { name: 'Time Attack',   description: '90 seconds. Highest score wins. No-one is ever out.' },
      livesHeats:    { name: 'Lives + Heats', description: 'Three lives each. Last with lives wins.' },
    },
    powerup: {
      speed:  { name: 'Speed Burst', tip: '3-second sprint.' },
      shield: { name: 'Shield',      tip: 'Absorbs one hit.' },
      shrink: { name: 'Shrink',      tip: 'Drop 30% length to escape.' },
      ghost:  { name: 'Ghost',       tip: '2-second phase through trails.' },
    },
    lobby: {
      pickColor: 'Pick your worm color',
      fillWithBots: 'Fill empty slots with bots',
      waitingForPlayers: 'Waiting for at least 2 worms…',
      variant: 'Variant',
      powerups: 'Power-ups',
      powerupsOn: 'On',
      powerupsOff: 'Off',
    },
    hud: { timer: 'Time', lives: 'Lives', safeZone: 'Safe Zone', score: 'Score' },
    death: { youDied: 'You died', spectating: 'Spectating' },
    result: { winner: '{{name}} wins!', tie: 'It\'s a tie', rematch: 'Rematch' },
    status: {
      connecting:     'Connecting…',
      reconnecting:   'Reconnecting…',
      slowConnection: 'Slow connection',
    },
  },
} as const;
```

- [ ] **Step 2: Translate or stub each other locale.** Stubs are acceptable (English fallback) — but include all keys, even if some values are placeholders. For `ru`, `es`, `fr`, `by`, copy the file structure and translate the user-visible strings; placeholders like `{{name}}` must remain literal.

- [ ] **Step 3: Create `glimworm/index.ts`:**

```ts
export { enMessages } from './en';
export { ruMessages } from './ru';
export { esMessages } from './es';
export { frMessages } from './fr';
export { byMessages } from './by';
```

- [ ] **Step 4: Wire into `apps/web/src/shared/i18n/messages/games/index.ts`** — follow the existing pattern (look at how `sea-battle` is re-exported and merged into the locale message tables).

- [ ] **Step 5: Run web type-check**

```bash
pnpm --filter web tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/shared/i18n/messages/games/glimworm/ apps/web/src/shared/i18n/messages/games/index.ts
git commit -m "feat(glimworm): add i18n bundles for 5 locales (ARC-XXX)"
```

---

## Task B4: Variant catalog for selector

**Files:**
- Create: `apps/web/src/features/games/lib/glimwormVariants.ts`

- [ ] **Step 1:** Mirror the **actual** shape used in `apps/web/src/features/games/lib/criticalVariants.ts` exactly — `{ id, name, description, emoji, gradient, disabled? }` where `name` and `description` are i18n key strings. Do NOT invent a new shape; the existing `GameVariantSelector` component already knows how to render this shape.

```ts
// apps/web/src/features/games/lib/glimwormVariants.ts
export const GLIMWORM_VARIANTS: {
  id: string;
  name: string;          // i18n key
  description: string;   // i18n key
  emoji: string;
  gradient: string;
  disabled?: boolean;
}[] = [
  {
    id: 'battle_royale',
    name: 'games.glimworm_v1.variant.battleRoyale.name',
    description: 'games.glimworm_v1.variant.battleRoyale.description',
    emoji: '👑',
    gradient: 'linear-gradient(135deg, #7928CA 0%, #FF0080 100%)',
  },
  {
    id: 'time_attack',
    name: 'games.glimworm_v1.variant.timeAttack.name',
    description: 'games.glimworm_v1.variant.timeAttack.description',
    emoji: '⏱️',
    gradient: 'linear-gradient(135deg, #00DFD8 0%, #007CF0 100%)',
  },
  {
    id: 'lives_heats',
    name: 'games.glimworm_v1.variant.livesHeats.name',
    description: 'games.glimworm_v1.variant.livesHeats.description',
    emoji: '❤️',
    gradient: 'linear-gradient(135deg, #FF5E5E 0%, #FFB05E 100%)',
  },
];
```

The "Power-ups Off / On" toggle is **NOT** a per-variant default — model it as a separate lobby control alongside the variant selector (rendered inside `GlimwormLobbyExtras` in Task C14).

- [ ] **Step 2: Add a small render test (Vitest)**: pass the catalog into the existing `GameVariantSelector` and assert all three variant labels appear.

- [ ] **Step 3: Run, commit:**

```bash
git add apps/web/src/features/games/lib/glimwormVariants.ts
git commit -m "feat(glimworm): add variant catalog for selector (ARC-XXX)"
```

---

## Task B5: Register `glimworm_v1` in registry

**Files:**
- Modify: `apps/web/src/features/games/registry.ts`

- [ ] **Step 1:** Add the metadata entry to `gameMetadata`:

```ts
glimworm_v1: {
  slug: 'glimworm_v1',
  name: 'Glimworm',
  description: 'A glow-in-the-dark snake battle for 2–10 players.',
  category: 'Action',
  minPlayers: 2,
  maxPlayers: 10,
  estimatedDuration: 5,
  complexity: 1,
  ageRating: 'G',
  thumbnail: '/games/glimworm.jpg',
  version: '1.0.0',
  supportsAI: true,
  tags: ['action', 'arena', 'real-time', 'snake', 'casual'],
  implementationPath: '@/widgets/GlimwormGame',
  lastUpdated: '2026-04-30',
  status: 'beta',
},
```

- [ ] **Step 2: Add the loader:**

```ts
glimworm_v1: () => import('@/widgets/GlimwormGame'),
```

- [ ] **Step 3: Add a placeholder thumbnail.** Save a 16:9 dark PNG to `apps/web/public/games/glimworm.jpg`. A simple placeholder is fine for now — replace later. (If `/public/games/` already has an SVG convention, use that.)

- [ ] **Step 4: Order matters — defer this task until after Task C15.** The widget at `@/widgets/GlimwormGame` must exist before the registry loader can resolve it. Either implement Task C15 first, or do C15 → B5 in that order. Do not introduce a placeholder stub.

Once C15 is in place, run: `pnpm --filter web build`
Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/features/games/registry.ts apps/web/public/games/glimworm.jpg
git commit -m "feat(glimworm): register glimworm_v1 in games registry (ARC-XXX)"
```

---

## Task B6: Sweep for `gameSlug` discriminator switches

**Files (audit only, possibly modify):**
- `apps/web/src/features/games/lib/gameConfig.ts`
- `apps/web/src/features/games/lib/gameFactory.ts`
- `apps/web/src/features/games/lib/gameProps.ts`
- `apps/web/src/features/games/lib/gameIdMapping.ts`
- Any other place where existing slugs are switched on (`grep` for `'critical_v1'` and `'sea_battle_v1'` to find them)

- [ ] **Step 1: Grep for slug switches**

```bash
grep -rn "critical_v1\|sea_battle_v1\|texas_holdem_v1" apps/web/src/features/games/lib/
```

- [ ] **Step 2: For every place where the existing slugs branch in a way that needs Glimworm-specific logic, add a `glimworm_v1` branch.** If a place exists but Glimworm doesn't need new logic (just default behaviour), no change.

- [ ] **Step 3: Run type-check + tests**

```bash
pnpm --filter web tsc --noEmit
pnpm --filter web test
```

- [ ] **Step 4: Commit if anything changed**

```bash
git commit -m "feat(glimworm): wire glimworm_v1 into shared game lib switches (ARC-XXX)"
```

---

# Phase C — Web widget

## Task C1: Widget types (mirror BE)

**Files:**
- Create: `apps/web/src/widgets/GlimwormGame/types/index.ts`

- [ ] **Step 1: Re-export the BE types** *or* duplicate them locally. The repo precedent (`@/shared/types/games`) prefers re-export; if the existing shared types package lives at `apps/web/src/shared/types/games.ts`, add a `glimworm.ts` next to it and re-export from there. Otherwise, copy the types file content from `apps/be/src/games/glimworm/glimworm.types.ts` here.

```ts
// Either: export * from '@/shared/types/games/glimworm';
// Or: copy the BE types verbatim, dropping any BE-only fields.
```

- [ ] **Step 2: Type-check, commit:**

```bash
git commit -m "feat(glimworm): add widget shared types (ARC-XXX)"
```

---

## Task C2: Zustand store

**Files:**
- Create: `apps/web/src/widgets/GlimwormGame/store/glimwormStore.ts`
- Test: `apps/web/src/widgets/GlimwormGame/store/glimwormStore.test.ts`

Holds:
- `latestSnapshot: GlimwormSnapshot | null`
- `previousSnapshot: GlimwormSnapshot | null` (for interpolation)
- `localInput: { angle: number; usePowerup: boolean }`
- `selectedColor: string | null`
- `connectionStatus: 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'slow'`
- `discreteEvents: GlimwormDiscreteEvent[]` (transient; consumed by FX)
- Actions: `ingestSnapshot(snap)`, `setInput({ angle, usePowerup })`, `setColor(color)`, `setStatus(status)`, `pushEvent(ev)`, `popEvents()`.

`ingestSnapshot` rotates: `previous = latest; latest = snap`.

- [ ] **Step 1: Tests** — initial state, `ingestSnapshot` rotates, `popEvents` clears.
- [ ] **Step 2: Run, fail.**
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run, pass.**
- [ ] **Step 5: Commit.**

```bash
git commit -m "feat(glimworm): add zustand store with snapshot rotation (ARC-XXX)"
```

---

## Task C3: Pixi snapshot interpolation (pure)

**Files:**
- Create: `apps/web/src/widgets/GlimwormGame/lib/pixi/interpolation.ts`
- Test: `apps/web/src/widgets/GlimwormGame/lib/pixi/interpolation.test.ts`

Pure math, no pixi calls — easiest to test thoroughly.

API:
```ts
export function interpolateSegments(
  prev: Vec2[], next: Vec2[], t: number,         // t ∈ [0, 1]
): Vec2[];

export function selectRenderTime(
  latestServerTime: number, renderDelayMs: number, now: number,
): number;

export function computeT(
  prevTime: number, nextTime: number, renderTime: number,
): number;                                                 // 0..1, clamped
```

- [ ] **Step 1: Tests:**
- t=0 returns prev exactly
- t=1 returns next exactly
- t=0.5 returns midpoints
- Mismatched lengths → return `next` as-is (don't crash)
- `computeT` clamps to `[0, 1]`
- `selectRenderTime` returns `latestServerTime - renderDelayMs`

- [ ] **Step 2: Run, fail.**
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run, pass.**
- [ ] **Step 5: Commit.**

```bash
git commit -m "feat(glimworm): add pure snapshot interpolation utilities (ARC-XXX)"
```

---

## Task C4: Pixi app lifecycle

**Files:**
- Create: `apps/web/src/widgets/GlimwormGame/lib/pixi/createGlimwormApp.ts`

Function `createGlimwormApp(canvasParent: HTMLDivElement, arena: Arena): { app: PIXI.Application; layers: { bg, food, powerup, worm, fx }; destroy: () => void }`.

- Initialises `PIXI.Application` with `resolution: window.devicePixelRatio`, `antialias: true`, `backgroundAlpha: 1`.
- Creates the 5 layer containers and sets up a scale-to-fit `ResizeObserver`.
- Returns a `destroy` that tears down listeners, removes the canvas, and calls `app.destroy(true)`.

No tests for this (pure DOM/canvas integration; covered by manual smoke + e2e).

- [ ] **Step 1:** Implement.
- [ ] **Step 2:** Smoke compile: `pnpm --filter web tsc --noEmit`.
- [ ] **Step 3: Commit.**

```bash
git commit -m "feat(glimworm): add pixi application lifecycle (ARC-XXX)"
```

---

## Task C5: Pixi arena renderer

**Files:**
- Create: `apps/web/src/widgets/GlimwormGame/lib/pixi/renderArena.ts`

Function `renderArena(layer: PIXI.Container, arena: Arena, viewport: { width, height })`. Draws a dark grid background, faint edge vignette, and the safe-zone ring (if `arena.safeZone`). Idempotent — call every frame. Use one persistent `Graphics` per element; clear+redraw rather than recreate.

- [ ] **Step 1:** Implement.
- [ ] **Step 2:** Compile.
- [ ] **Step 3: Commit.**

```bash
git commit -m "feat(glimworm): add pixi arena renderer (ARC-XXX)"
```

---

## Task C6: Pixi worm renderer

**Files:**
- Create: `apps/web/src/widgets/GlimwormGame/lib/pixi/renderWorms.ts`

Function `renderWorms(layer: PIXI.Container, worms: GlimwormWormSnapshot[], state: WormRenderState)`. Maintains one `Graphics` + `Sprite` head per worm in a `Map`. Adds new ones, removes dead ones (with a brief death animation), and redraws each as a thick polyline with `pixi-filters` `GlowFilter` applied. Hue tint = `worm.color`. Shield → rotating ring. Ghost → `alpha: 0.5`.

- [ ] **Step 1:** Implement.
- [ ] **Step 2:** Compile.
- [ ] **Step 3: Commit.**

```bash
git commit -m "feat(glimworm): add pixi worm renderer with glow (ARC-XXX)"
```

---

## Task C7: Pixi food + power-up renderer

**Files:**
- Create: `apps/web/src/widgets/GlimwormGame/lib/pixi/renderFoodAndPowerups.ts`

Render food as glowing dots (single shared radial-gradient texture, tinted by `value`). Render power-ups as 4 distinct sprites (load via texture atlas or 4 simple Graphics shapes for v1). Maintain id-keyed `Map`s for stable add/remove.

- [ ] **Step 1:** Implement.
- [ ] **Step 2: Commit.**

```bash
git commit -m "feat(glimworm): add pixi food and power-up renderer (ARC-XXX)"
```

---

## Task C8: FX layer

**Files:**
- Create: `apps/web/src/widgets/GlimwormGame/lib/pixi/fx.ts`

Functions: `spawnDeathBurst(layer, pos, color)`, `spawnScorePopup(layer, pos, text)`, `spawnPowerupPickedSparkle(layer, pos, kind)`. Use `PIXI.ParticleContainer`. Discrete events from the store drive these.

- [ ] **Step 1:** Implement.
- [ ] **Step 2: Commit.**

```bash
git commit -m "feat(glimworm): add pixi fx layer (ARC-XXX)"
```

---

## Task C9: useGlimwormSocket hook

**Files:**
- Create: `apps/web/src/widgets/GlimwormGame/hooks/useGlimwormSocket.ts`
- Test: `apps/web/src/widgets/GlimwormGame/hooks/useGlimwormSocket.test.ts`

Wraps `@/shared/lib/socket` for the `'games'` namespace. Emits `glimworm.input` at 20 Hz from `store.localInput` (use `setInterval(50)`). Subscribes to `glimworm.snapshot` → `store.ingestSnapshot`, `glimworm.event` → `store.pushEvent`. Handles disconnect → `store.setStatus('reconnecting')`, with auto-reconnect backoff `[1, 2, 4, 8] s`.

- [ ] **Step 1: Tests** (with mocked socket):
- Sends `glimworm.input` at 20 Hz when `localInput` is set
- Ingests snapshot into store
- Status transitions on `disconnect` / `reconnect` events

- [ ] **Step 2: Run, fail.**
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run, pass.**
- [ ] **Step 5: Commit.**

```bash
git commit -m "feat(glimworm): add socket hook with throttled input and reconnect (ARC-XXX)"
```

---

## Task C10: useGlimwormControls hook

**Files:**
- Create: `apps/web/src/widgets/GlimwormGame/hooks/useGlimwormControls.ts`

Reads mouse position (desktop) or touch position (mobile) relative to the worm head's screen position; computes `angle = Math.atan2(dy, dx)`. Listens to spacebar / click for `usePowerup`. Calls `store.setInput({ angle, usePowerup })` each `requestAnimationFrame`.

- The worm head's *screen* position is derived from `store.latestSnapshot.worms.find(self).segments[0]` projected through the current camera transform (which the pixi app exposes via the `lib/pixi/createGlimwormApp.ts` `layers` object).
- On mobile, also subscribe to `touchstart`/`touchmove`/`touchend` on the canvas wrapper.

No unit tests (DOM event-heavy); covered by Playwright in Phase D.

- [ ] **Step 1:** Implement.
- [ ] **Step 2: Commit.**

```bash
git commit -m "feat(glimworm): add cursor + touch controls hook (ARC-XXX)"
```

---

## Task C11: useGlimwormPixi hook

**Files:**
- Create: `apps/web/src/widgets/GlimwormGame/hooks/useGlimwormPixi.ts`

`useGlimwormPixi(canvasRef)`:
1. On mount: `createGlimwormApp(canvasRef.current, store.latestSnapshot.arena)` and store the result in a ref.
2. Each frame: read `latestSnapshot` and `previousSnapshot` from the store, compute `t` via `computeT`, interpolate worm segments, call `renderArena`, `renderWorms`, `renderFoodAndPowerups`, then drain `discreteEvents` and call FX functions.
3. On unmount: destroy.

- [ ] **Step 1:** Implement.
- [ ] **Step 2:** Verify type-check.
- [ ] **Step 3: Commit.**

```bash
git commit -m "feat(glimworm): add pixi lifecycle + render-loop hook (ARC-XXX)"
```

---

## Task C12: HUD component

**Files:**
- Create: `apps/web/src/widgets/GlimwormGame/ui/GlimwormHud.tsx`

DOM overlay (NOT pixi). Uses `useTranslation()` for all strings.
- Top-left: variant badge + relevant timer (Time-Attack countdown / BR safe-zone ring timer / Lives indicator).
- Top-right: scoreboard (top 5 by `score`).
- Bottom-right: power-up inventory slot (if `powerupsEnabled`). Tap (mobile) or `[Space]` hint (desktop).
- Slow-connection indicator (yellow dot) when `connectionStatus === 'slow'`.

- [ ] **Step 1: Render test (Vitest)** — supply a fake snapshot, assert variant label and 5 worms render in scoreboard.
- [ ] **Step 2: Run, fail.**
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run, pass. Commit.**

```bash
git commit -m "feat(glimworm): add HUD overlay component (ARC-XXX)"
```

---

## Task C13: Death overlay

**Files:**
- Create: `apps/web/src/widgets/GlimwormGame/ui/GlimwormDeathOverlay.tsx`

Centred banner: "You died" + "Spectating <name>". Visible only when `self.alive === false` && variant ∈ {BR, lives_heats}.

- [ ] **Step 1: Tests** — renders with correct names & i18n keys.
- [ ] **Step 2-4: TDD cycle.**
- [ ] **Step 5: Commit.**

```bash
git commit -m "feat(glimworm): add death overlay (ARC-XXX)"
```

---

## Task C14: Lobby extras (color picker + variant info)

**Files:**
- Create: `apps/web/src/widgets/GlimwormGame/ui/GlimwormLobbyExtras.tsx`

Renders during `status === 'lobby'`:
- 10-slot color palette (greyed-out for taken). Click → `setColor` → emits `glimworm.color.pick` via socket.
- Read-only summary of host's `variant` + `powerupsEnabled` (icons row if on).

- [ ] **Step 1: Render test** — taken colors disabled, click emits.
- [ ] **Step 2-4: TDD cycle.**
- [ ] **Step 5: Commit.**

```bash
git commit -m "feat(glimworm): add lobby color picker and variant summary (ARC-XXX)"
```

---

## Task C15: Widget entry

**Files:**
- Create: `apps/web/src/widgets/GlimwormGame/GlimwormGame.tsx`
- Create: `apps/web/src/widgets/GlimwormGame/index.ts`

`GlimwormGame.tsx` implements `BaseGameWidgetProps` (look at `apps/web/src/features/games/types/base.ts` for the exact shape). It:
1. Sets up the socket via `useGlimwormSocket`.
2. Renders `<GlimwormLobbyExtras />` while `status === 'lobby'` and the standard `ReusableGameLobby` content above it.
3. On `status === 'playing'`: renders the canvas div (with `useGlimwormPixi(ref)` and `useGlimwormControls()`) plus the `<GlimwormHud />` overlay.
4. On `status === 'ended'`: renders the existing `GameResultModal` with the winner + scoreboard.

`index.ts`:
```ts
export { default } from './GlimwormGame';
export type * from './types';
```

The default export should be a React component (since the registry's loader expects `{ default: ComponentType<BaseGameWidgetProps> }`).

- [ ] **Step 1:** Implement.
- [ ] **Step 2:** Type-check the whole web app: `pnpm --filter web tsc --noEmit`.
- [ ] **Step 3:** Commit.

```bash
git commit -m "feat(glimworm): add widget entry component (ARC-XXX)"
```

---

# Phase D — Validation

## Task D1: Playwright e2e

**Files:**
- Create: `apps/web/e2e/glimworm.spec.ts`

Following the structure of existing specs in `apps/web/e2e/`:

- [ ] **Step 1: Two-context lobby + start test**

Two parallel browser contexts (host + guest):
1. Both navigate to `/games`, click "Glimworm", host creates a room (Battle Royale, no power-ups), guest joins.
2. Both pick a color and mark Ready.
3. Host clicks Start → both see canvas + HUD. Assert canvas element exists in DOM.

- [ ] **Step 2: Variant + power-up persistence test**

Host creates a Time-Attack room with power-ups ON; guest joins; both see badges; on start, HUD timer counts down from 90.

- [ ] **Step 3: Disconnect/reconnect test**

Mid-round, kill the guest socket. Wait. Confirm the worm freezes. Reconnect. Confirm a fresh snapshot arrives and worm resumes.

```ts
await page.evaluate(() => {
  const w = window as unknown as { __socket?: { disconnect(): void } };
  w.__socket?.disconnect();
});
```

Note: do not use `any` — CLAUDE.md forbids it everywhere, including e2e tests. The widget should expose `window.__socket` only in non-production builds (gate it with `process.env.NODE_ENV !== 'production'`) so the e2e harness can drive the socket.

- [ ] **Step 4: Mobile viewport touch steering**

Use `test.use({ ...devices['iPhone 13'] })`. Host (desktop) starts; guest (mobile emulation) plays. Hold and drag → worm steers. Tap power-up button → activates.

- [ ] **Step 5: Run e2e**

```bash
pnpm --filter web test:e2e -- glimworm
```

Expected: all PASS. (If the local BE isn't running, tests will fail — start with `pnpm dev` first.)

- [ ] **Step 6: Commit**

```bash
git commit -m "test(glimworm): add playwright e2e coverage (ARC-XXX)"
```

---

## Task D2: Manual smoke test

- [ ] **Step 1: Start dev**

```bash
pnpm dev
```

- [ ] **Step 2: Manual sweep — open `localhost:3000/games` in 2+ browser windows.**

Check the **golden path** (per CLAUDE.md): host creates a Glimworm BR room, guest joins, both ready, start, play to win condition, rematch, leave.

Check **edge cases**:
- Mobile browser (Chrome devtools mobile emulator): touch steering works
- One-player walkover (kick the guest mid-round → host wins automatically)
- Tab backgrounding (switch tabs for 5 s → no errors on resume)
- Slow connection: throttle network to "Slow 3G" → "Slow connection" indicator appears
- Time-Attack expires correctly at 90 s
- Power-ups: pick up speed → speed boost; shield → absorbs hit; shrink → drops segments to food; ghost → passes through trails

If anything breaks, **do not claim done.** Fix and retest.

- [ ] **Step 3: No commit (verification only)**

---

## Task D3: File-size sweep + lint

- [ ] **Step 1:** From repo root:

```bash
pnpm check-file-length
pnpm lint
pnpm test
pnpm build
```

All must pass.

- [ ] **Step 2: If any file > 500 lines, split it before committing.** Most likely culprits: `glimworm.service.ts`, `renderWorms.ts`. Split into `*.tick.ts`, `*.movement.ts` etc.

- [ ] **Step 3: Commit any cleanup**

```bash
git commit -m "chore(glimworm): file-size cleanup and lint fixes (ARC-XXX)"
```

---

## Task D4: PR

- [ ] **Step 1: Use `/pr-description` skill** to draft the PR body.

- [ ] **Step 2:** Push branch and open PR using the project's standard format (per CLAUDE.md):

```bash
git push -u origin ARC-XXX-glimworm-game
gh pr create --base develop --title "feat(glimworm): add Glimworm multiplayer snake game" --body "..."
```

- [ ] **Step 3: Verify CI passes.**

---

# Verification Checklist

Before claiming done:

- [ ] All BE Jest tests pass: `pnpm --filter be test glimworm`
- [ ] All web Vitest tests pass: `pnpm --filter web test glimworm`
- [ ] Playwright e2e passes: `pnpm --filter web test:e2e -- glimworm`
- [ ] `pnpm check-file-length` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm build` passes
- [ ] Manual smoke (Task D2) covers golden path + all listed edge cases
- [ ] All five locale files present, none missing keys
- [ ] No hardcoded user-facing strings (grep `apps/web/src/widgets/GlimwormGame` for raw English text and confirm none)
- [ ] No `any` types (grep, confirm none)
- [ ] PR description written via `/pr-description`
