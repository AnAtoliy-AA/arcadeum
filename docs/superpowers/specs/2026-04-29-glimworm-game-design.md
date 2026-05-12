# Glimworm — Multiplayer Snake-Style Game Design

**Date:** 2026-04-29
**Status:** Draft (pending implementation plan)
**Game slug:** `glimworm_v1`

## Summary

Glimworm is a 2–10 player real-time multiplayer snake-style game with a glowing-worm aesthetic on a dark arena. It is designed to be picked up in seconds while waiting for food at a restaurant: trivial rules (everyone already knows snake), short rounds, low setup friction. Three host-selectable variants change *when the round ends* and *what death means* without changing the core mechanic, and an optional light power-up set adds replayability without raising the learning curve.

Implemented as a new game in the existing Arcadeum monorepo, slotting into the games registry, room/lobby/rematch/chat infrastructure, and i18n system already used by `critical_v1` and `sea_battle_v1`. Server-authoritative simulation in NestJS, pixi.js renderer in the Next.js web app. Web-only first release; mobile native is out of scope.

## Goals

- New game playable end-to-end with 2–10 players in networked rooms
- Three variants: Battle Royale, Time-Attack, Lives + Heats — host-selectable per room
- Optional Light power-up set (4 power-ups) — host-toggleable per room
- Responsive web client (desktop browser + mobile browser); cursor-follow / hold-to-steer controls
- Server-authoritative tick-based simulation at 20 Hz with client-side snapshot interpolation at 60 fps
- Reuse existing rooms / lobby / rematch / result-modal / chat / i18n infra; no new platform plumbing

## Non-Goals

- Native mobile (Expo) implementation — web only for v1
- Full power-up suite, weapons, tiered rarities — explicitly violates "easy rules" promise
- Persistent progression, leaderboards, ranked play — out of scope
- Spectator mode for non-room-members — only late joiners and dead worms spectate
- Anti-cheat beyond input validation (no behavioural detection, no replay verification)

## Locked-in Design Decisions

| Decision | Choice |
|---|---|
| Player count | 2–10 |
| Network model | Multiplayer rooms (matches `critical_v1` pattern) |
| Platform scope | Web only, responsive (desktop + mobile browser) |
| Renderer | pixi.js v8 |
| Variants | Battle Royale, Time-Attack (90 s), Lives + Heats (3 lives) — host picks |
| Power-ups | Off / On (4 power-ups: speed, shield, shrink, ghost) — host picks |
| Controls | Cursor-follow on desktop, hold-finger on mobile |
| Simulation | Server-authoritative, 20 Hz tick |
| Client rendering | Snapshot interpolation, 100 ms render delay, 60 fps |
| Name | Glimworm |

---

## 1. High-Level Architecture

```
  Browser (web/mobile)                    NestJS BE
  ┌──────────────────────┐                ┌──────────────────────────┐
  │ React widget         │                │ GlimwormGateway          │
  │  ├─ store (Zustand)  │ ◄── snapshot ──│  (socket.io 'games' ns)  │
  │  └─ Pixi renderer    │       (20Hz)   │           │              │
  │     └─ interpolate   │                │           ▼              │
  │  ▲                   │                │ GlimwormService          │
  │  │ input vector      │ ───── input ──►│  ├─ tick loop @20Hz      │
  │  │ (cursor angle,    │                │  ├─ collision/eat logic  │
  │  │  use-power-up)    │                │  ├─ variant rules        │
  └──────────────────────┘                │  └─ GlimwormState (room) │
                                          └──────────────────────────┘
```

### Server (authoritative)

- `GlimwormService` runs a 20 Hz simulation tick per active room.
- Each tick advances every worm, resolves food/power-up pickups, checks collisions, applies variant-specific end conditions, emits state snapshots.
- State lives in memory in a per-room map (mirrors `critical.state.ts`).

### Client (renderer + input)

- React widget owns lifecycle, lobby, scoreboard, modals — reuses `apps/web/src/features/games/ui/*`.
- Pixi.js owns the arena canvas: a single `Application` with one `Container` per layer (background, food, worms, power-ups, FX).
- Client never simulates — it interpolates between the last two server snapshots on a 100 ms render-delay buffer (standard "entity interpolation" technique).
- Input throttled to 20 Hz: cursor angle + boolean `usePowerup`.

### Transport

Reuses the `'games'` socket.io namespace. New events:

- `glimworm.input` (client → server): `{ angle: number, usePowerup: boolean }`
- `glimworm.snapshot` (server → client): personalised per-client state snapshot
- `glimworm.event` (server → client): discrete events (`worm_died`, `powerup_collected`, `round_ended`)
- Standard room events (`join`, `start`, `leave`) reuse shared room infra

### Bandwidth budget

~3–5 KB/s downstream per client (10 worms × ~50 segments × 4 bytes + food/power-up arrays at 20 Hz with reasonable encoding). Comfortably within budget.

---

## 2. Game State Model

Types live in `apps/be/src/games/glimworm/glimworm.types.ts` (mirrored on web in `apps/web/src/widgets/GlimwormGame/types/`).

```ts
type WormId = string;        // = userId or botId
type Vec2  = { x: number; y: number };

interface Worm {
  id: WormId;
  color: string;             // hex (worm hue from fixed 10-slot palette)
  segments: Vec2[];          // head = [0]; max ~200
  heading: number;           // radians; updated from client input each tick
  speed: number;             // px/sec; modified by speed-burst power-up
  alive: boolean;
  livesLeft: number;         // variants A,B = 1; variant C = 3
  score: number;             // dots eaten + kills (Time-Attack uses this)
  activePowerup?: { kind: PowerupKind; expiresAt: number } | null;
  inventoryPowerup?: PowerupKind | null;  // 1 slot, use-on-demand
}

type PowerupKind = 'speed' | 'shield' | 'shrink' | 'ghost';

interface Food   { id: string; pos: Vec2; value: 1 | 3 }       // 3 = rare "big glow"
interface Powerup { id: string; pos: Vec2; kind: PowerupKind } // only spawns if host enabled

interface Arena {
  width: number;             // 2000 (units)
  height: number;            // 2000
  safeZone?: { center: Vec2; radius: number; shrinkRate: number }; // BR variant only
}

type GlimwormVariant = 'battle_royale' | 'time_attack' | 'lives_heats';

interface GlimwormSession {
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
}
```

### Server snapshot

Personalised per-client. For each worm: `id`, `color`, `segments`, `alive`, `livesLeft`, `score`, `activePowerup`. The recipient's own worm includes `heading`, `speed`, `inventoryPowerup`; others omit them.

### Per-tick mutation order (deterministic)

1. Apply each worm's last-received input (heading, optional `usePowerup`)
2. Advance heads (`pos += dir × speed × dt`)
3. Resolve food/power-up pickups (head-AABB vs item)
4. Resolve **lethal** collisions: head vs (other worm segments) and head vs **arena walls**. Shielded worms absorb one collision and lose the shield. (Safe-zone exposure is *not* lethal here — it's handled in step 7 as a per-variant damage tick.)
5. Trim/extend each worm's segment list to its target length
6. Spawn food/power-ups if below thresholds
7. Apply variant `tickHook` (e.g., BR safe-zone shrink + per-worm damage if outside) and end-condition checks (`status: 'ended'`, set `winner`)
8. Emit per-client snapshots + any discrete events

### Constants (`glimworm.constants.ts`)

| Constant | Value |
|---|---|
| Tick rate | 20 Hz (50 ms) |
| Arena | 2000 × 2000 units |
| Base worm speed | 200 u/s |
| Speed-burst multiplier | ×1.7 |
| Food spawn cap | 80 |
| Power-up spawn cap | 4 (global) |
| Starting worm length | 8 segments |
| Grow per food (value 1) | 3 segments |
| Grow per food (value 3) | 9 segments |
| Respawn delay (Lives + Heats) | 1.5 s |

---

## 3. Variant Rules

Implemented as a strategy pattern in `apps/be/src/games/glimworm/variants/`:

```ts
interface VariantStrategy {
  initSession(s: GlimwormSession): void;
  onWormDeath(s: GlimwormSession, victim: Worm, killer: Worm | null): void;
  checkEndCondition(s: GlimwormSession): WormId | null;
  tickHook?(s: GlimwormSession): void;
}
```

### A) Battle Royale — `battle-royale.strategy.ts`

- `initSession`: every worm gets `livesLeft = 1`. `arena.safeZone` initialised at full radius.
- `onWormDeath`: mark `alive = false`. Worm becomes a spectator (ghost camera follows any alive worm).
- `tickHook`: shrink `safeZone.radius` linearly from full → 30 % over 3 minutes. Worms outside take damage every 0.5 s (lose 1 segment; die at 0).
- `checkEndCondition`: 1 worm alive → wins. 0 alive (simultaneous death) → if scores differ, highest score wins; if scores tie, `winner: null` and the result modal shows "Tie".

### B) Time-Attack — `time-attack.strategy.ts`

- `initSession`: respawn enabled, `endsAt = now + 90_000`. No safe zone.
- `onWormDeath`: respawn 1.5 s later at random safe spot, length reset to 8. Killer (if any) gains `+5 score` and absorbs 30 % of victim's score as bonus dots dropped at the death site.
- `checkEndCondition`: when `now >= endsAt` → highest `score` wins (tiebreaker: `tickNum` of last food eaten).
- No worm is ever "out" — keeps everyone engaged for the full 90 s.

### C) Lives + Heats — `lives-heats.strategy.ts`

- `initSession`: `livesLeft = 3`. No safe zone.
- `onWormDeath`: decrement `livesLeft`. If `> 0` → respawn after 1.5 s. If `= 0` → permanent spectator.
- `checkEndCondition`: 1 worm with lives left → wins. Soft 5-minute timeout: highest `score + livesLeft × 50` wins.

### Variant wiring

- BE: room creation accepts `variant: GlimwormVariant` and `powerupsEnabled: boolean`. `GlimwormService` instantiates the matching strategy on `start`.
- Web: lobby UI uses the existing `GameVariantSelector` with a new entry in `variantRegistry.ts`. Power-up toggle is a checkbox in the lobby sidebar.
- Registry: `glimworm_v1` registered in `apps/web/src/features/games/registry.ts` with `minPlayers: 2, maxPlayers: 10`.

### "Easy rules" preservation

The BR safe-zone shrink is the only "extra mechanic." Time-Attack and Lives + Heats are vanilla snake with different end conditions. Players truly only learn one game; variants change *when it ends* and *what death means*.

---

## 4. Power-Ups

Only spawned when host enables `powerupsEnabled = true`. Worms hold at most 1 in inventory; activation tap/click sends `usePowerup: true` in the next input frame; server validates inventory and applies effect.

Implemented as a registry in `apps/be/src/games/glimworm/powerups/`:

```ts
interface PowerupDef {
  kind: PowerupKind;
  durationMs: number;       // 0 = instant effect
  apply(worm: Worm, session: GlimwormSession): void;
  expire?(worm: Worm): void;
}
```

### The four

| Kind | Effect | Duration | Visual cue (pixi) |
|---|---|---|---|
| **speed** | `worm.speed = base × 1.7`; head leaves a particle trail | 3 s | bright streak behind head, hue shift on body |
| **shield** | absorbs the next 1 lethal collision; consumed on hit | until used or 15 s | rotating ring around the head |
| **shrink** | instantly drops 30 % of segments (rounded down, min length 5) — dropped segments turn into food | instant | brief implosion + light flash |
| **ghost** | head and body pass through other worms' trails (still die to walls) | 2 s | semi-transparent body with phasing distortion |

### Spawning logic

- Maintain `powerups.length ≤ 4` globally.
- Every 8 seconds, if under cap, roll: 70 % no-op, 30 % spawn one — kind weighted: speed 35 %, shield 25 %, shrink 20 %, ghost 20 %.
- Spawn position: random tile inside arena, ≥ 150 units from any worm head.

### Pickup rules

Head-vs-AABB. If a worm already holds a power-up, on-floor power-ups are not picked up — incentivises using before grabbing.

### Lobby preview

If power-ups are enabled, the lobby preview shows the 4 icons with one-line descriptions (i18n: `glimworm.powerup.<kind>.name|tip`). If disabled, nothing renders — keeps "easy rules" mode genuinely zero-icon.

### Why this set

Each power-up rewards a different play style — speed (aggressive), shield (defensive), shrink (escape), ghost (positional). Orthogonal and self-explanatory from icon alone.

---

## 5. Rendering & Controls (pixi.js)

### Pixi setup

One `PIXI.Application` mounted in a React `useRef`-attached div, lifecycle managed by `useGlimwormPixi` in `apps/web/src/widgets/GlimwormGame/hooks/`. Resolution `window.devicePixelRatio`, `antialias: true`, `backgroundAlpha: 1` (deep navy). Resizes responsively via `ResizeObserver`. Arena world coordinates 2000 × 2000 units; camera scales-to-fit so the whole arena is always visible (no scroll, no panning).

### Scenegraph layers (parent `Container` ordered back-to-front)

```
arenaContainer
├─ bgLayer          // dark grid, faint pulse, vignette
├─ foodLayer        // glowing dots (Sprite from a single radial-gradient texture, tinted by value)
├─ powerupLayer     // 4 distinct icons + halo
├─ wormLayer        // one Container per worm
│   └─ each: trail (Graphics or rope), head (Sprite), shield-ring, ghost-overlay
└─ fxLayer          // explosions, score popups, death particles (PIXI.ParticleContainer)
```

### Worm rendering

Each worm is a polyline of its `segments` drawn as a thick stroked path with a glow shader (`@pixi/filter-glow`). Head is a separate sprite with a directional indicator. We do NOT draw 200 individual sprites per segment (perf trap). Instead one `Graphics` per worm, redrawn each render frame from interpolated segment positions.

### Interpolation

Client keeps the last 2 server snapshots and renders at `serverTime - 100 ms` (one tick of buffer). For each worm, segment positions linearly interpolated between snapshot N-1 and N. If a snapshot is missed, extrapolate up to 200 ms then freeze. Standard approach — feels smooth, hides packet jitter completely up to ~150 ms RTT.

### Controls

| Device | Steering | Power-up |
|---|---|---|
| Desktop | mouse position → angle from worm head | Spacebar or click |
| Mobile (touch) | hold finger anywhere → angle from worm head to finger | Tap a floating power-up button (bottom-right) |

Input sampled in a `requestAnimationFrame` loop, throttled & sent at 20 Hz over the socket. Local pixi rendering uses the latest input for **head orientation only** (cosmetic — actual position comes from the server) so the head feels responsive even at 100 ms latency.

### HUD (DOM, not pixi)

React-rendered overlay on top of the canvas:

- Top-left: variant badge + timer (Time-Attack) / safe-zone timer (BR) / lives indicator (Lives + Heats)
- Top-right: live leaderboard (worm color + score, top 5)
- Bottom-right: power-up inventory slot (mobile: tap-to-activate; desktop: shows `[SPACE]`)
- Center on death (variants A/C only): "You died" + "Spectating [winner color]"

### Loading & error states

- Loading: shimmering "Connecting…" with a tiny worm animation while socket connects + initial snapshot arrives
- Empty: lobby renders with 1 player, shows "Waiting for at least 2 worms…"
- Error: socket disconnect → toast "Reconnecting…" with auto-reconnect; if reconnect fails after 10 s, redirect to room list with error toast

### File-size discipline (CLAUDE.md 500-line rule)

Pixi rendering split into:

- `lib/pixi/createGlimwormApp.ts` — app init/teardown
- `lib/pixi/renderWorms.ts`
- `lib/pixi/renderFoodAndPowerups.ts`
- `lib/pixi/renderArena.ts`
- `lib/pixi/interpolation.ts`
- `lib/pixi/fx.ts`

Each kept under 200 lines.

---

## 6. Lobby & Room Flow

Reuses existing rooms infra: `apps/be/src/games/rooms`, `apps/web/src/app/games/rooms`, `apps/web/src/features/games/ui/ReusableGameLobby.tsx`. Glimworm is one more game in the registry — no new lobby system.

### Discovery

`/games` shows the games grid. New `GameCard` for Glimworm appears with thumbnail + tagline + "2–10 players". Clicking opens existing room creation flow.

### Room creation

Host fills standard form (name, password optional, max-players slider 2–10). Two new game-specific fields rendered by `GameVariantSelector`:

1. **Variant** — radio: Battle Royale / Time-Attack / Lives + Heats (with 1-line description for each)
2. **Power-ups** — toggle: Off / On

Both serialise into `room.gameConfig: { variant, powerupsEnabled }`. The existing room schema already supports `gameConfig` as a generic JSON field.

### Lobby (waiting room)

Standard `ReusableGameLobby` — player list, ready toggle, host's start button. Glimworm-specific additions in a small `GlimwormLobbyExtras` component:

- Variant badge + power-up icons row (read-only summary of host's settings)
- "Pick your worm color" — 10 distinct hues, first-come-first-served from a fixed palette (`palette[0..9]`)
- Optional avatar/name preview

Color assignment is **BE-authoritative**: the client suggests a color via Zustand state, BE validates against the per-room palette, and BE is the source of truth at session init. BE rejects taken colors with a toast, auto-assigns the next free color when a player skips, and on reconnect reassigns the next free color if the player's previous color was taken in the meantime (notifying the client).

### Start conditions

Host taps **Start** when:

- ≥ 2 players have joined and marked Ready
- All players have picked a color (auto-assign next-free if a player skips)

Server transitions session `status: 'lobby' → 'countdown'`, broadcasts a 3-2-1 countdown (DOM overlay), then `'countdown' → 'playing'` and begins the tick loop.

### Late joiners

During `playing`, joins are accepted as **spectators** only. They see the full arena snapshot, can chat (reusing `GameChat` widget), but their worm doesn't spawn until next round.

### Round end

When `checkEndCondition` returns a winner:

- Server emits `glimworm.event { type: 'round_ended', winner, scoreboard }`
- Client shows existing `GameResultModal` — winner banner, final scoreboard, **Rematch** button (reuses `RematchModal`)
- Rematch resets state via `games.rematch.service` (existing) — same room, same config, fresh session

### Disconnect handling

- Mid-round: worm becomes immobile (heading frozen), still vulnerable to collisions, marked `disconnected: true`. 30-second grace window to reconnect; otherwise removed and round continues.
- Host disconnect: ownership transfers to next-joined player (existing room behavior, not new logic).

### Bots (optional)

Following `critical-bot.service.ts` and `sea-battle-bot.service.ts`, ship `glimworm-bot.service.ts` so the host can optionally check **"Fill empty slots with bots"** at room start. Bot AI is intentionally simple (greedy-toward-nearest-food + dodge-walls) — warm-up filler, not opponents.

---

## 7. Error Handling, Edge Cases, Anti-Cheat

### Network jitter / packet loss

Client buffers the 2 most recent snapshots and renders at `serverTime - 100 ms`. If a snapshot is missed, extrapolate up to 200 ms then **freeze worms in place** (better a 1-frame stutter than a teleport on reconciliation). When snapshots resume, lerp positions back over 150 ms instead of snapping.

### High latency (mobile cell, restaurant Wi-Fi)

Server measures RTT via socket.io ping; if `rtt > 250 ms` for ≥ 5 consecutive seconds, client overlay shows a small "Slow connection" indicator (yellow dot in HUD). No gameplay change — just transparency.

### Reconnect

Client auto-reconnect with backoff (1, 2, 4, 8 s — capped at 4 attempts, ~15 s total) using existing `@/shared/lib/socket` infra. Server holds the worm `disconnected: true` for 30 s. On reconnect: server re-emits latest full snapshot + session metadata; client re-mounts pixi cleanly. After grace, worm removed; reconnecting player joins as spectator.

### Host disconnect

Reuses room ownership-transfer logic — next-earliest joined player becomes host. Game continues uninterrupted (the simulation is server-authoritative; host is just the room admin).

### Player count drops below 2 mid-round

Round ends immediately, last-alive worm wins by walkover. Result modal still shows.

### Tab visibility / backgrounding

Server-side: simulation continues regardless. Client-side: `visibilitychange` listener pauses pixi render loop and stops sending input when hidden; on resume requests a full snapshot to skip catch-up. The worm keeps moving in its last heading on the server while hidden.

### Edge cases

- **Two heads collide on the same tick:** both die. (Simpler than first-mover-wins, avoids tick-order arguments.)
- **Worm eats own tail:** dies. (Standard snake.)
- **Worm spawns inside another worm's trail:** server picks spawn points by sampling random tiles ≥ 200 u from any segment; if no valid tile after 20 tries, picks farthest-available.
- **All players die simultaneously (BR):** round is a draw — `winner: null`, scoreboard ranks by score; result modal shows "Tie" banner.
- **Color collision on rejoin:** if a reconnecting player's previously-claimed color was reassigned, server picks next free and notifies the client.

### Anti-cheat

- Client only sends `{ angle, usePowerup }` — never positions or scores. Faking position/score is impossible from the client.
- Server validates `angle ∈ [-π, π]` (clamps if out of range), rate-limits inputs at 30 Hz max per socket (drops excess), validates `usePowerup` only acts when `inventoryPowerup` is set.
- All state mutations happen in `GlimwormService`, never in the gateway — gateway is a thin transport layer (matches `critical.gateway.ts` style).
- Power-up activation has a 50 ms server-side cooldown after spawning (prevents double-activation race conditions).

### Logging & observability

- Per-room: log session start, end, winner, variant, power-ups, duration, player count
- Per-tick errors: caught by service-level try/catch around the tick handler; if any error, log with `roomId` + `tickNum`, end the session as `errored`, emit a graceful error event to clients
- Reuse the existing NestJS `Logger` pattern (like `CriticalGateway`)

---

## 8. Testing Strategy

### BE unit (Jest) — `apps/be/src/games/glimworm/`

- `glimworm.service.spec.ts` — pure-logic simulation: tick advance, food pickup, head-vs-trail collision, head-vs-head collision (both die), worm trim/grow, spawn position validity (≥ 200 u), session lifecycle (`lobby → countdown → playing → ended`).
- `variants/*.strategy.spec.ts` — one spec per strategy, covering `checkEndCondition` for: 1 alive winner, 0 alive draw, time-up scoring, lives exhaustion, BR safe-zone shrink damage.
- `powerups/*.spec.ts` — applied effect, expiration cleanup (speed reverts, shield consumed-on-hit, ghost expires).
- `glimworm.gateway.spec.ts` — input validation: angle clamping, rate-limiting drops excess, rejects `usePowerup` with empty inventory, rejects start without ≥ 2 ready players.
- `glimworm-bot.service.spec.ts` — bot picks nearest food, avoids walls, handles arena-edge cases.

### Web unit (Vitest) — `apps/web/src/widgets/GlimwormGame/`

- `lib/pixi/interpolation.test.ts` — pure math: snapshot-buffer lerp, extrapolation cap, freeze-on-stale-buffer.
- `store/glimwormStore.test.ts` — Zustand transitions for snapshots, input, color selection, lobby readiness.
- `hooks/useGlimwormSocket.test.ts` — mock socket, verifies emit throttling at 20 Hz, reconnect backoff, snapshot ingestion.
- HUD component tests — render and i18n key resolution only; no canvas.

### E2E (Playwright) — `apps/web/tests/e2e/glimworm.spec.ts`

- Two browser contexts (host + guest) create a room, both ready up, host starts → both see `playing` status and a worm canvas.
- Variant + power-up settings persist from lobby into game session.
- Disconnect/reconnect: kill guest's socket mid-round → see worm freeze → reconnect → see fresh snapshot.
- Round-end modal appears for last-alive scenario; Rematch resets to lobby.
- Mobile viewport (Playwright iPhone 13 emulation) — touch hold steers, power-up button works.

We deliberately do not pixel-snapshot pixi output; rendering correctness is verified visually via dev-server smoke pass per CLAUDE.md UI guidance.

---

## 9. File Layout

```
apps/be/src/games/
├─ glimworm.gateway.ts                 (thin transport — input/snapshot events)
├─ glimworm/
│  ├─ glimworm.service.ts              (tick loop, mutation orchestration)
│  ├─ glimworm.state.ts                (in-memory session map, accessors)
│  ├─ glimworm.types.ts                (shared types, mirrored on web)
│  ├─ glimworm.constants.ts            (tick rate, arena, speeds, caps)
│  ├─ glimworm-bot.service.ts          (greedy-food bot AI)
│  ├─ variants/
│  │  ├─ variant.strategy.ts           (interface)
│  │  ├─ battle-royale.strategy.ts
│  │  ├─ time-attack.strategy.ts
│  │  └─ lives-heats.strategy.ts
│  └─ powerups/
│     ├─ powerup.def.ts                (interface + registry)
│     ├─ speed.powerup.ts
│     ├─ shield.powerup.ts
│     ├─ shrink.powerup.ts
│     └─ ghost.powerup.ts

apps/web/src/widgets/GlimwormGame/
├─ index.ts
├─ GlimwormGame.tsx                    (widget entry — implements BaseGameWidgetProps)
├─ types/                              (mirrors BE types)
├─ store/glimwormStore.ts              (Zustand)
├─ hooks/
│  ├─ useGlimwormSocket.ts             (socket connect, input throttle, snapshot ingest)
│  ├─ useGlimwormPixi.ts               (Pixi app lifecycle, render loop)
│  └─ useGlimwormControls.ts           (mouse + touch input → angle)
├─ lib/pixi/
│  ├─ createGlimwormApp.ts
│  ├─ renderArena.ts
│  ├─ renderWorms.ts
│  ├─ renderFoodAndPowerups.ts
│  ├─ interpolation.ts
│  └─ fx.ts
└─ ui/
   ├─ GlimwormHud.tsx                  (DOM overlay: timer, leaderboard, power-up slot)
   ├─ GlimwormDeathOverlay.tsx
   └─ GlimwormLobbyExtras.tsx          (variant info, color picker)

apps/web/src/features/games/
├─ registry.ts                          (add glimworm_v1 entry)
└─ lib/glimwormVariants.ts              (variant catalog for GameVariantSelector)

apps/web/src/shared/i18n/messages/games/
└─ glimworm/
   ├─ en.json
   ├─ ru.json
   ├─ es.json
   ├─ fr.json
   └─ by.json
```

### Dependencies

- `apps/web/package.json`: `pixi.js@^8` and `pixi-filters@^6` (the v8-compatible umbrella package — provides `GlowFilter`). Do not add `@pixi/filter-glow` separately; that package targets pixi v7.
- Bundled via Next.js dynamic import (`next/dynamic` with `ssr: false`) so pixi never runs server-side.

---

## 10. Internationalisation

All user-facing strings via `getTranslations()` in server components and `useTranslation()` in client components, per CLAUDE.md. Keys grouped under `glimworm.*`:

- `glimworm.name`, `glimworm.description`, `glimworm.tagline`
- `glimworm.variant.battleRoyale.name|description`, same for `timeAttack`, `livesHeats`
- `glimworm.powerup.speed.name|tip`, same for shield/shrink/ghost
- `glimworm.lobby.pickColor`, `glimworm.lobby.fillWithBots`, `glimworm.lobby.waitingForPlayers`
- `glimworm.hud.timer`, `glimworm.hud.lives`, `glimworm.hud.safeZone`
- `glimworm.death.youDied`, `glimworm.death.spectating`
- `glimworm.result.winner`, `glimworm.result.tie`, `glimworm.result.rematch`
- Status: `glimworm.status.connecting`, `glimworm.status.reconnecting`, `glimworm.status.slowConnection`

All five locales (`en, ru, es, fr, by`) get the keys at the same time. No hardcoded user-facing strings anywhere in widget code.

---

## 11. Open Questions / Future Considerations

These are explicitly out of scope for v1 but worth noting:

- **Mobile native (Expo) port** — would require evaluating `react-native-pixi` or a different renderer; revisit after web validation.
- **Client-side prediction (Approach B)** — only adopt if latency complaints surface; default A is sufficient at expected scale.
- **Persistent stats / cross-session leaderboards** — not in v1.
- **Skin/color customisation beyond the 10-slot palette** — keep palette fixed for v1; cosmetic expansion later.
- **Tournament mode / brackets** — out of scope.
- **Custom arena shapes / obstacles** — out of scope (rectangular arena only for v1).

---

## Approval

**Approved by user:** 2026-04-29 (during brainstorming session, all 8 sections confirmed individually).

**Next step:** spec-document-reviewer subagent review, then writing-plans skill to produce an implementation plan.
