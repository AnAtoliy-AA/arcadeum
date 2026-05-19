# ARC-710 follow-up — `none` and `developers_plus` visibility tiers

**Status:** approved design, ready for implementation planning
**Ticket:** ARC-710 (follow-up scope)
**Date:** 2026-05-19
**Depends on:** ARC-710 admin game/variant visibility (PR #701, branch `ARC-704`/`ARC-710`).

## Summary

Extend the `VISIBILITY_TIERS` set from 3 → 5 values by adding `developers_plus` (gated to developer/admin roles) and `none` (no one can play; surfaced as a "coming soon" tile in variant pickers). No new endpoints, no schema change, no new admin section. The admin dropdown gains two options; the variant pickers gain one rendering branch for `comingSoon` variants.

## Goals

1. Admins can set any game/variant to `developers_plus` so that only developers and admins see and can create rooms for it.
2. Admins can set any game/variant to `none` so that nobody (including admins/devs) can create rooms for it; restricted variants of an otherwise-visible game are surfaced in variant pickers as disabled "coming soon" tiles.
3. No data migration. Existing rows with `all`/`premium_plus`/`vip_plus` are untouched.
4. The catalog endpoint becomes the single source of truth for both "visible variants" and "coming-soon variants"; web pickers branch on a `comingSoon` flag without a second round-trip.

## Non-goals

- Coming-soon UX on the main games landing page or quickplay. Whole-game `none` stays hidden (catalog omits the game); quickplay still returns 403. (User explicitly scoped Q2 to variant pickers only.)
- Engine-side honoring of `none` when the host picked Critical's `random` variant. Same engine carve-out as ARC-710 and the color-variants follow-up.
- In-room `VariantSelector` rendering for `none` variants. The room is already created — the createRoom gate is upstream of this UI. Mid-room theme-change is out of scope (known gap from ARC-710).
- Reconciling Critical's two `CARD_VARIANTS` constants. Still out.
- i18n for variant IDs in the admin UI. Raw IDs remain acceptable for an admin tool.

## Key decisions

### D1 — Tier ladder extended in `roles.ts`

Append `'developers_plus'` and `'none'` to `VISIBILITY_TIERS`. Extend `TIER_MIN_PRIORITY`:

```ts
const TIER_MIN_PRIORITY: Record<VisibilityTier, number> = {
  all: 0,
  premium_plus: ROLE_INFO.premium.priority,         // 10
  vip_plus: ROLE_INFO.vip.priority,                 // 20
  developers_plus: ROLE_INFO.developer.priority,    // 80
  none: Number.POSITIVE_INFINITY,
};
```

`canSeeAtTier(role, tier)` keeps its existing `role.priority >= TIER_MIN_PRIORITY[tier]` formula. The `Number.POSITIVE_INFINITY` value naturally evaluates to `false` for every role including admin (100 < Infinity).

**Why:** Reusing the priority ladder means `assertVisible`, `filterVisible`, `canSee`, the Glimworm WS gateway gate, and quickplay all pick up the new tiers with no logic change. Only the `getCatalog` walk needs new code, because it's the one site that *intentionally* surfaces a non-visible variant (as coming-soon).

### D2 — Catalog response shape: `variants: { id: string; comingSoon: boolean }[]`

The current `getCatalog` returns `{ games: { gameId: string; variants: string[] }[] }` containing only what the caller can see. The new shape:

```ts
type CatalogVariant = { id: string; comingSoon: boolean };
type CatalogGame = { gameId: string; variants: CatalogVariant[] };
type CatalogResponse = { games: CatalogGame[] };
```

Per-variant inclusion rule inside an *otherwise-visible* game (`canSee(role, gameId)` is true):

- effective tier is `none` → include `{ id, comingSoon: true }`
- `canSee(role, gameId, variantId)` → include `{ id, comingSoon: false }`
- otherwise → omit entirely

Whole-game `none`: `canSee(role, gameId)` is false → game omitted from the response. Matches the Q2 decision (no coming-soon on the games landing page).

**Why:** Pickers need to know which variants to render as disabled tiles. A second endpoint or a hard-coded `none` list on the client would drift. Adding one boolean is the smallest change.

This is a breaking shape change to the catalog response, but it's typed end-to-end and there's only one consumer per game (the three pickers + the admin types mirror). Caught at the typecheck.

### D3 — Variant pickers: render coming-soon as disabled tile

For each of:

- [apps/web/src/widgets/CriticalGame/ui/CreationConfig.tsx](../../../apps/web/src/widgets/CriticalGame/ui/CreationConfig.tsx)
- [apps/web/src/widgets/SeaBattleGame/ui/CreationConfig.tsx](../../../apps/web/src/widgets/SeaBattleGame/ui/CreationConfig.tsx)
- [apps/web/src/widgets/GlimwormGame/ui/GlimwormLobby.tsx](../../../apps/web/src/widgets/GlimwormGame/ui/GlimwormLobby.tsx)

Update the existing catalog-fetch effect to track `comingSoon` per variant:

```ts
const [allowedVariants, setAllowedVariants] = useState<CatalogVariant[] | null>(null);

useEffect(() => {
  let cancelled = false;
  gamesApi.getCatalog().then((res) => {
    if (cancelled) return;
    const entry = res.games.find((g) => g.gameId === '<gameId>');
    setAllowedVariants(entry?.variants ?? null);
  }).catch(() => { if (!cancelled) setAllowedVariants(null); });
  return () => { cancelled = true; };
}, []);

const visibleVariants =
  allowedVariants === null
    ? FULL_LIST.map((v) => ({ ...v, comingSoon: false }))
    : FULL_LIST
        .filter((v) => allowedVariants.some((a) => a.id === v.id))
        .map((v) => ({
          ...v,
          comingSoon: allowedVariants.find((a) => a.id === v.id)?.comingSoon ?? false,
        }));
```

When rendering each tile, branch on `comingSoon`:

- normal tile if `false`
- disabled tile with a small "Coming soon" badge if `true`; `aria-disabled`, `pointer-events: none` (or `disabled` on the underlying button), click is a no-op

Tile styling reuses whatever the existing "disabled" state looks like in each picker (every picker has a notion of unavailable/locked tile already; see e.g. Glimworm's coming-soon-style disabled rendering in its existing variant list).

**Why:** Single rendering branch keeps the change minimal. The picker is already iterating a list — flipping a flag on a per-tile basis is one extra prop.

### D4 — Admin UI dropdown gains two options

[apps/web/src/features/admin-games/ui/GameVisibilityRow.tsx](../../../apps/web/src/features/admin-games/ui/GameVisibilityRow.tsx) iterates `VISIBILITY_TIERS` (mirrored on the web side at [apps/web/src/features/admin-games/types.ts](../../../apps/web/src/features/admin-games/types.ts)) and renders one `<option>` per tier. Mirror the two new values; the dropdown picks them up automatically.

The save path goes through the existing `setGameTierAction` / `setVariantTierAction`. BE service validates against `VISIBILITY_TIERS` already, so the new strings round-trip without further work.

### D5 — i18n

Three new keys, in all five locales (en, ru, es, fr, by):

- `adminGames.tier.developers_plus` — proposed: "Developers & admins" (en) / equivalents
- `adminGames.tier.none` — proposed: "Hidden (coming soon)" (en) / equivalents
- A coming-soon string usable by the three pickers — proposed: place at the lowest common namespace, e.g. an existing `common.*` or pick per-picker if existing convention dictates. Plan should decide based on grep of existing usage.

## Architecture (delta from ARC-710 + color variants)

```
BE roles.ts: +2 tier strings, +2 priority entries
BE catalog endpoint: response shape changes; walk logic adds the comingSoon branch
Web admin types: +2 tier strings (mirror)
Web admin dropdown: +2 <option>s
Web pickers: tile renders comingSoon branch
Web i18n: +2 tier labels, +1 coming-soon label across 5 locales
Tests: +1 roles test case, +1 controller catalog test case, +3 picker Vitest cases (one per game)
```

No schema change. No new endpoints. No new collection. No new admin section.

## Data flow

```
ADMIN WRITE (set Critical 'crime' to 'none'):
  Web admin UI → setVariantTierAction → PUT /admin/games/critical_v1/variants/crime { tier: 'none' }
    → GameVisibilityService.setVariantTier
    → Mongo upsert { gameId: 'critical_v1', variantId: 'crime' } { tier: 'none' }
    → cache invalidated

FREE USER READ (open Critical CreationConfig):
  Web → GET /games/catalog (with anon JWT)
    → GamesController.getCatalog
    → walks GAME_CATALOG, computes effective tier per (game, variant)
    → for critical_v1 (effective tier 'all'): include
      - 'cyberpunk', ..., 'crime' (effective 'none') → { id: 'crime', comingSoon: true }
      - other variants: { id, comingSoon: false }
    → response: { games: [..., { gameId: 'critical_v1', variants: [...] }] }
  CreationConfig: renders 'crime' tile as disabled with 'Coming soon' badge

FREE USER WRITE (try createRoom with cardVariant: 'crime'):
  Web (defensive — UI hides the tile, but BE is authoritative)
    → POST /games/rooms { gameId: 'critical_v1', gameOptions: { cardVariant: 'crime' } }
    → assertVisible('free', 'critical_v1', 'crime')
    → canSee returns false (Infinity)
    → 403 ForbiddenException { code: 'GAME_VISIBILITY_DENIED' }

ADMIN WRITE (try createRoom with cardVariant: 'crime' set to 'none'):
  Same flow → 403. To test, admin flips tier to 'developers_plus' or 'all' first.
```

## Testing

### BE unit
- `roles.test.ts` (or wherever `canSeeAtTier` lives): add cases proving
  - `canSeeAtTier('developer', 'developers_plus')` → true
  - `canSeeAtTier('admin', 'developers_plus')` → true
  - `canSeeAtTier('moderator', 'developers_plus')` → false
  - `canSeeAtTier('tester', 'developers_plus')` → false
  - `canSeeAtTier('admin', 'none')` → false
  - `canSeeAtTier('free', 'none')` → false
- `games.controller.visibility.spec.ts`: catalog walk
  - Variant set to `none` appears as `{ id, comingSoon: true }` for a free caller
  - Variant set to `none` appears as `{ id, comingSoon: true }` for an admin caller (no bypass)
  - Variant set to `developers_plus` is omitted for free; included with `comingSoon: false` for developer
  - Whole-game set to `none` → game omitted entirely from response

### Web unit (Vitest)
- Critical `CreationConfig`: mock `gamesApi.getCatalog()` to return `crime` with `comingSoon: true` and `cyberpunk` with `comingSoon: false`; assert `cyberpunk` renders interactive and `crime` renders disabled with the "Coming soon" badge; clicking `crime` is a no-op.
- Sea Battle `CreationConfig`: same pattern, different variant IDs.
- Glimworm `GlimwormLobby` (or wherever the variant tiles live): same pattern.

### Manual smoke (post-deploy)
1. Admin → `/admin/games` → set `crime` to `none`. Free user opens Critical's create flow → `crime` tile is shown but disabled with "Coming soon". Direct POST with `cardVariant: 'crime'` returns 403. Admin user: same.
2. Admin sets a whole game to `none`. The game disappears from the games landing page entirely (no coming-soon card, per the Q2 scope).
3. Admin sets a variant to `developers_plus`. Free user does not see the tile. Developer user sees it as a normal interactive tile.

## Rollout

No migration. Empty rows still mean `all`. Existing `vip_plus`/`premium_plus`/`all` rows unaffected. The catalog response shape changes in lockstep with the picker consumers — ship the BE and web edits in the same release branch.

## Open questions

None. The two semantic ambiguities (who bypasses `none`, which surfaces show coming-soon) were locked in:

- `none` is a hard wall for everyone including admin. Admin tests by flipping to a lower tier first.
- Coming-soon UX is scoped to variant pickers only. Whole-game `none` hides; quickplay keeps 403.
