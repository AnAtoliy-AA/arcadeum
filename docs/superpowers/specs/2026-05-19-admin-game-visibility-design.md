# ARC-710 — Admin-controlled visibility for games and game variants

**Status:** approved design, ready for implementation planning
**Ticket:** ARC-710
**Date:** 2026-05-19
**Depends on:** existing admin shell (ARC, May 2026), user-roles ladder in [apps/be/src/auth/lib/roles.ts](apps/be/src/auth/lib/roles.ts).

## Summary

Add an admin-controlled visibility layer that lets admins restrict whole games and built-in game variants to one of three tiers: `all`, `premium_plus`, or `vip_plus`. Visibility is enforced both in the UI (filtered lists) and in the backend (refused room/session creation, hidden public rooms). A new Mongo overlay collection `game_visibility` stores the rules; the hard-coded game registry and per-game variant code remain the source of truth for definitions. Missing entries default to `all`, so the rollout is a no-op for existing users until an admin restricts something.

## Goals

1. Admins can set a visibility tier per game and per built-in variant from a new `/admin/games` page.
2. Free users never see (and cannot create rooms with) games/variants gated above their role.
3. Tier checks reuse the existing `ROLE_INFO.priority` ladder — staff roles (moderator, developer, admin) automatically see everything.
4. Hot-path reads (game list, room create, list-rooms) take at most one in-process map lookup after warm-up.
5. Default behaviour preserved on rollout — no migration needed for current games to stay visible.

## Non-goals

- Creating, editing, or deleting variants from the admin UI. Variants remain code-level constructs (today only Glimworm has any).
- Scheduling visibility changes (publish-at-date, A/B segments, per-region rules).
- Mobile admin parity. Mobile consumes the filtered catalog only.
- Visibility for ad-hoc per-room rules (room-level visibility already exists as `public`/`private`).
- Audit log for visibility changes. `updatedBy` and `updatedAt` on the row are sufficient.

## Key decisions

### D1 — Overlay collection, registry stays canonical

**Decision:** Game definitions and variant strategies stay in code (`apps/web/src/features/games/registry.ts`, `apps/be/src/games/glimworm/variants/*`). A new `game_visibility` Mongo collection only overlays _visibility_ on top.

**Why:** Minimal blast radius. Migrating the registry to DB would touch room creation, session bootstrapping, type generation, and every consumer of `GameSlug`. The ticket is about a visibility toggle, not a CMS for games.

**Why not a single `admin_settings` document:** Per-row docs let us add per-entity metadata later (featured flag, sort order, banner copy) without re-shaping a giant blob.

### D2 — Three tiers, priority-ladder semantics

**Decision:** `VisibilityTier = 'all' | 'premium_plus' | 'vip_plus'`. A role `r` can see a tier `t` iff `ROLE_INFO[r].priority >= TIER_MIN_PRIORITY[t]`, where:

```ts
const TIER_MIN_PRIORITY: Record<VisibilityTier, number> = {
  all: 0,
  premium_plus: ROLE_INFO.premium.priority, // 10
  vip_plus: ROLE_INFO.vip.priority, // 20
};
```

**Why:** Reuses existing role machinery. `supporter` (priority 15) sees `premium_plus` but not `vip_plus`, which matches its tier; `moderator`/`developer`/`admin` (50/80/100) see everything without special-casing. Anonymous callers are treated as `free` (priority 0).

### D3 — Absence of row = `all`

**Decision:** If no `game_visibility` row exists for a `(gameId, variantId?)`, treat it as tier `all`.

**Why:** Existing games keep working on day one with zero data migration. Admin only acts when they want to restrict.

**Trade-off:** A new game added to the registry is publicly visible the moment it ships. Acceptable — the ticket framing is "admin can hide", not "admin must approve".

### D4 — Single collection, discriminated by `variantId`

**Decision:** Both game-level and variant-level rules live in one collection:

```ts
@Schema({ timestamps: true })
class GameVisibility {
  @Prop({ required: true, index: true }) gameId: string;
  @Prop({ type: String, default: null }) variantId: string | null; // null = game-level
  @Prop({ required: true, enum: VISIBILITY_TIERS }) tier: VisibilityTier;
  @Prop({ required: true }) updatedBy: string; // admin userId
}
// Unique compound index on { gameId, variantId }
```

`variantId: null` for the whole-game rule, a string for a variant rule. Unique compound index `{ gameId, variantId }` keeps each (game, variant?) row singular and makes upserts trivial.

**Why not two collections:** Read paths join both anyway; one index, one query, one cache map.

### D5 — In-memory TTL cache (~30s) on the BE service

**Decision:** `GameVisibilityService` keeps an in-process `Map<key, tier>` where `key` is `gameId` for game-level rows and `${gameId}::${variantId}` for variant rows. TTL ~30s; write paths invalidate the local instance immediately. Stale across instances is bounded by TTL.

**Why:** Reads happen on every catalog fetch, every room create, every list-rooms call. A Mongo round-trip per call would be silly when the whole table fits in memory and rarely changes. Matches the cache pattern used by `EconomySettingsService` (ARC-619).

**Why not pub/sub invalidation:** 30s drift is fine for an admin UX feature; the cost of running a Redis channel or socket fan-out doesn't pay back.

### D6 — Effective tier = max(game tier, variant tier)

**Decision:** When checking whether a user can see Glimworm's `time_attack` variant, the effective required tier is `max(gameTier, variantTier)`. If Glimworm is `all` but `time_attack` is `vip_plus`, only VIP+ sees `time_attack`. If Glimworm is `vip_plus`, all its variants are VIP+ regardless of their individual setting.

**Why:** Intuitive admin model — hiding the parent hides the children; variant rule only kicks in when stricter than the game rule.

**Edge case:** If a variant row exists but the parent game row does not, the parent defaults to `all` (per D3), so the variant rule takes effect on its own. `max(all, vip_plus) = vip_plus`.

### D7 — Enforcement: filter on read, assert on write

**Decision:** Three enforcement points:

1. **Catalog read** — new `GET /games/catalog` endpoint returns the registry filtered to what `req.user` (or anonymous=free) can see, with each game's variants filtered the same way. Web consumes this everywhere instead of importing the registry directly.
2. **Room/session create** — `assertVisible(role, gameId, variantId?)` throws `ForbiddenException` at controller/gateway entry for any of: `POST /games/rooms`, `POST /games/sessions/start-ai`, `POST /games/sessions/start-human`, Glimworm gateway equivalents.
3. **List rooms** — `listRooms` filters out rooms whose game or stored variant the caller can't see, so a free user doesn't even see a VIP game's lobby card.

**Why "hide + block":** UI-only hiding is bypassed by direct API calls; BE-only blocking leaves stale links in the UI. Doing both is cheap and gives the user a coherent experience.

## Architecture

### Backend module layout

```
apps/be/src/admin/game-visibility/
  game-visibility.schema.ts        // Mongoose schema (D4)
  game-visibility.types.ts         // VISIBILITY_TIERS const, VisibilityTier type, TIER_MIN_PRIORITY
  game-visibility.service.ts       // cached read/write, filterVisible, assertVisible
  game-visibility.service.spec.ts
  game-visibility.controller.ts    // admin-only HTTP endpoints
  game-visibility.controller.spec.ts
  dto/
    set-tier.dto.ts                // { tier: VisibilityTier }  @IsEnum
  game-visibility.module.ts        // exports the service
```

### `GameVisibilityService` public surface

```ts
class GameVisibilityService {
  getGameTier(gameId: string): Promise<VisibilityTier>;
  getVariantTier(gameId: string, variantId: string): Promise<VisibilityTier>;
  // Effective tier per D6: max(gameTier, variantTier) if variantId given, else gameTier.
  getEffectiveTier(gameId: string, variantId?: string): Promise<VisibilityTier>;

  canSee(role: UserRole, gameId: string, variantId?: string): Promise<boolean>;
  assertVisible(
    role: UserRole,
    gameId: string,
    variantId?: string,
  ): Promise<void>; // throws ForbiddenException

  // Filters a list of {gameId, variantId?} items in one pass against a single cache snapshot.
  filterVisible<T>(
    role: UserRole,
    items: T[],
    key: (t: T) => { gameId: string; variantId?: string },
  ): Promise<T[]>;

  // Admin writes:
  setGameTier(
    gameId: string,
    tier: VisibilityTier,
    adminId: string,
  ): Promise<void>;
  setVariantTier(
    gameId: string,
    variantId: string,
    tier: VisibilityTier,
    adminId: string,
  ): Promise<void>;

  // Admin-page read: full map joined to registry shape.
  listForAdmin(): Promise<AdminGameVisibilityRow[]>;
}
```

Cache: `private map: Map<string, VisibilityTier> | null` plus `mapLoadedAt: number`. `getMap()` reloads the whole collection when `Date.now() - mapLoadedAt > 30_000` or `map === null`. Writes call `this.map = null` after the upsert.

### Tier helper in roles.ts

Add to [apps/be/src/auth/lib/roles.ts](apps/be/src/auth/lib/roles.ts):

```ts
export const VISIBILITY_TIERS = ['all', 'premium_plus', 'vip_plus'] as const;
export type VisibilityTier = (typeof VISIBILITY_TIERS)[number];

const TIER_MIN_PRIORITY: Record<VisibilityTier, number> = {
  all: 0,
  premium_plus: ROLE_INFO.premium.priority,
  vip_plus: ROLE_INFO.vip.priority,
};
export function canSeeAtTier(role: UserRole, tier: VisibilityTier): boolean {
  return ROLE_INFO[role].priority >= TIER_MIN_PRIORITY[tier];
}
```

Anonymous callers are treated as `free` at the call site (controller resolves `req.user?.role ?? 'free'`).

### Where `VisibilityTier` lives for the web

The web admin page also needs the `VisibilityTier` literal union (for the dropdown, for typed API payloads). Since the BE is not a publishable shared package, the web duplicates the literal union and the array (`['all', 'premium_plus', 'vip_plus']`) in `apps/web/src/features/admin-games/types.ts`. The values are wire-format strings — no behavior change risk on drift, and we keep web build independent of BE source. Same convention used by other admin-\* features today.

### Registry shim on BE

The BE today doesn't import the web's registry. We add a thin `apps/be/src/games/games.catalog.ts` that exports the same `(gameId, variantId[])` pairs the web uses, hard-coded. This is the canonical list the catalog endpoint iterates and the admin page renders. Game-name display strings stay on the web via i18n.

Shape:

```ts
export const GAME_CATALOG: ReadonlyArray<{
  gameId: GameSlug;
  variants: ReadonlyArray<string>; // empty for games without variants
}> = [
  {
    gameId: 'glimworm_v1',
    variants: ['battle_royale', 'time_attack', 'lives_heats'],
  },
  { gameId: 'critical_v1', variants: [] },
  { gameId: 'sea_battle_v1', variants: [] },
  // …
];
```

Today only Glimworm has variants; the rest are empty arrays. New variants for other games (future tickets) extend this list.

### HTTP endpoints

Mounted under `apps/be/src/admin/admin.module.ts`, guarded by `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles('admin')`.

| Method | Path                                                  | Purpose                                                                                             |
| ------ | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| GET    | `/admin/games/visibility`                             | Catalog joined with current tiers for the admin page.                                               |
| PUT    | `/admin/games/:gameId/visibility`                     | Body `{ tier }`. Upsert game-level row.                                                             |
| PUT    | `/admin/games/:gameId/variants/:variantId/visibility` | Body `{ tier }`. Upsert variant row. Validates that `(gameId, variantId)` exists in `GAME_CATALOG`. |

Public endpoint (consumed by web for the lobby/picker):

| Method | Path             | Purpose                                                                                   |
| ------ | ---------------- | ----------------------------------------------------------------------------------------- |
| GET    | `/games/catalog` | Returns `[{ gameId, variants: [{ variantId }] }]` filtered by `req.user?.role ?? 'free'`. |

### Enforcement integration

- `apps/be/src/games/games.controller.ts` — inject `GameVisibilityService`. Before `createRoom`, `startAiSession`, `startHumanSession`: call `assertVisible(role, body.gameId, body.variant)`. Same in `apps/be/src/games/glimworm/glimworm.gateway.ts` and any other gateway that starts a session.
- `apps/be/src/games/rooms/*` — `listRooms` runs results through `filterVisible` before returning. Rooms whose stored variant is restricted are dropped for callers who can't see them.

### Web — admin page

Files (per `/new-web-page` convention):

```
apps/web/src/app/[locale]/admin/games/
  page.tsx              // Server Component, getTranslations, fetch initial data
  GamesAdminClient.tsx  // 'use client', Zustand-or-local state for row edits
  GamesAdminView.tsx    // Pure presentational
apps/web/src/features/admin-games/
  api.ts                // typed wrappers around the 3 admin endpoints
  types.ts              // VisibilityTier, AdminGameVisibilityRow
  hooks/                // useGameVisibility, useUpdateGameTier, useUpdateVariantTier
```

Layout: a single table inside the existing `AdminLayoutShell`. Each game row:

```
[ ▸ ] Game name             [ Tier dropdown: all | premium+ | vip+ ]   [ Save ]
```

Expanding a game with variants reveals a nested sub-table with one row per variant, each with its own dropdown + save. Save is per-row, optimistic with toast on failure. No bulk save.

Sidebar entry added to `AdminLayoutShell.tsx` next to existing admin links.

### Web — i18n keys

New folder `apps/web/src/shared/i18n/messages/pages/admin-games/` with `en.json`, `ru.json`, `es.json`, `fr.json`, `by.json`. Keys: page title, table headers, tier labels, save button, success/error toasts.

Tier labels in i18n: `all` → "All players", `premium_plus` → "Premium+", `vip_plus` → "VIP+". Game and variant display names are read from existing i18n keys (already localized for game cards and the Glimworm variant picker).

### Web — user-facing filtering

- Wherever the lobby/picker currently consumes `gameMetadata` from `registry.ts` directly, switch to `GET /games/catalog`. Server components fetch on the server and pass results down; client components use the existing api client.
- Glimworm's variant picker filters its `['battle_royale', 'time_attack', 'lives_heats']` list against the catalog response's variants for `glimworm_v1`.
- Game name/description/thumbnail still come from the in-code registry — the catalog only narrows the list of `(gameId, variantId)` pairs. The web does a hash lookup against `gameMetadata` for display.

**Call-site audit:** before switching to the catalog, the plan must enumerate every current consumer of `gameMetadata`, `gameLoaders`, and direct `GameSlug`-driven lists across `apps/web/src/features/games/`, `apps/web/src/widgets/`, the lobby pages, and any homepage card grid. Each becomes either (a) a catalog consumer that filters before display, or (b) untouched if it only renders by `gameId` after the catalog already filtered. The plan should list these explicitly so nothing is missed.

**Note on `assertVisible` vs `filterVisible`:** room/session create paths use `assertVisible` (single-item, throws). The `listRooms` filter uses `filterVisible` (multi-item, prunes silently). They are not interchangeable — confusing one for the other in `listRooms` would surface 403s to free users who only browsed the lobby.

## Data flow

```
ADMIN WRITE:
  Admin UI (PUT /admin/games/.../visibility)
    → GameVisibilityController (admin guard)
    → GameVisibilityService.setGameTier / setVariantTier (upsert + cache invalidate)
    → 200 OK

USER READ (catalog):
  Web (GET /games/catalog)
    → GamesController (or new CatalogController)
    → for each item in GAME_CATALOG:
        if canSeeAtTier(role, getEffectiveTier(gameId)) → include
        filter variants by canSeeAtTier(role, getEffectiveTier(gameId, variantId))
    → JSON response

USER WRITE (create room):
  Web (POST /games/rooms { gameId, variant })
    → GamesController
    → assertVisible(role, gameId, variant)  // throws 403 if not allowed
    → existing room-creation flow
```

## Error handling

- Admin endpoints: `400` on invalid tier (DTO `@IsEnum`), `400` on unknown `(gameId, variantId)` (validated against `GAME_CATALOG`), `403` for non-admin (guard), `500` on Mongo failure (default Nest filter).
- Catalog endpoint: never errors on permission — anonymous callers get the `all`-tier view.
- Room/session create: `403 ForbiddenException { code: 'GAME_VISIBILITY_DENIED', gameId, variantId? }` so the web can show a useful toast ("Upgrade to VIP to play this") rather than a generic forbidden.
- Cache load failure: log + serve last-known map if present; if no map yet, throw on read (admin will see an error toast and we surface it). This prevents silent over-permissive defaults if Mongo is briefly down on cold start.

## Testing

### BE unit (Jest)

- `canSeeAtTier` matrix: every role × every tier.
- `GameVisibilityService.getEffectiveTier`: game-level only / variant-only / both (max wins per D6) / neither (defaults to `all`).
- Cache TTL: second call within 30s hits cache; write invalidates immediately.
- Controller authorization: non-admin gets 403; admin upsert returns 200; invalid tier returns 400; unknown gameId returns 400.
- `assertVisible`: throws `ForbiddenException` with correct payload for restricted; resolves for allowed.

### BE integration (Jest + supertest, mongo-memory-server)

- `GET /games/catalog` as `free`, `premium`, `vip`, `admin` after seeding restrictions; assert filtered shape.
- `POST /games/rooms` with restricted `gameId` as `free` → 403; as `vip` → 201.
- `GET /games/rooms` does not return rooms whose game or variant is restricted for the caller.

### Web unit (Vitest)

- `GamesAdminView` renders games + nested variants; dropdown change triggers handler.
- `useUpdateGameTier` hook: optimistic update, rollback on error.
- Catalog consumer in the lobby renders only what the API returned (mocked).

### Playwright e2e

1. Admin logs in, sets Glimworm `time_attack` to `vip_plus`, refreshes.
2. Free user logs in, opens Glimworm variant picker, asserts `time_attack` is absent.
3. Direct `POST /games/sessions/start-ai` with `variant: 'time_attack'` as the free user → 403.
4. VIP user opens Glimworm variant picker, asserts `time_attack` is present and selectable.

## Rollout

1. Ship migrations are unnecessary — empty collection means `all` everywhere.
2. Feature is admin-only on read/write side; user-facing change is the catalog endpoint, which initially returns the full set.
3. Add the new admin sidebar link.
4. After deploy, smoke-test the admin page setting a tier on a non-critical variant (e.g. Glimworm `lives_heats` → `vip_plus`) and verifying the free-user lobby no longer shows it.

## Open questions

None. Defaults and recommended choices selected throughout.
