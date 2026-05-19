# ARC-710 follow-up — Admin-controlled visibility for color variants

**Status:** approved design, ready for implementation planning
**Ticket:** ARC-710 (follow-up scope)
**Date:** 2026-05-19
**Depends on:** ARC-710 admin game/variant visibility (PR #701, branch `ARC-710`).

## Summary

Extend the `game_visibility` overlay from ARC-710 to also cover Critical's 13 card-back themes and Sea Battle's 10 visual themes. Today only Glimworm's three gameplay variants are gateable; this delta makes the BE catalog know about color variants too, so the existing admin UI, room-creation gate, and `listRooms` filter cover them with no new endpoints, no new collection, and no UI scaffolding. The web's Critical and Sea-Battle pickers do a one-shot `/games/catalog` fetch on mount to filter their option lists (mirroring Glimworm's lobby from T21).

## Goals

1. Admins can gate any of Critical's 13 card-back themes or Sea Battle's 10 visual themes from `/[locale]/admin/games`.
2. The BE rejects `createRoom` calls whose `gameOptions.variant` or `gameOptions.cardVariant` is restricted for the caller's role.
3. `listRooms` hides rooms whose stored color variant is restricted for the caller.
4. The web variant pickers in Critical's `CreationConfig` and Sea Battle's `VariantSelector` filter their option lists by what the caller's role can see.
5. No data migration. Day-one rollout is a no-op (absence of a row = `all`, inherited from ARC-710).

## Non-goals

- Engine-side honoring of visibility when the host picks Critical's `random` variant. If the engine could randomly pick a restricted variant for a free user, that's an engine concern, not an admin one. Out of scope.
- i18n for variant IDs in the admin UI. Raw IDs (`cyberpunk`, `high-altitude-hike`, …) are acceptable for an admin tool.
- A new admin endpoint or collection. The ARC-710 `{ gameId, variantId|null }` shape already accommodates any string variant ID; no schema change.
- A new e2e. ARC-710's T22 Playwright e2e is still deferred; a single follow-up e2e can cover color variants alongside Glimworm.

## Key decisions

### D1 — Same overlay collection, extend `GAME_CATALOG`

Append Critical's 13 and Sea Battle's 10 variant IDs to the existing `GAME_CATALOG` at [apps/be/src/games/games.catalog.ts](../../../apps/be/src/games/games.catalog.ts). The catalog becomes:

```ts
export const GAME_CATALOG: ReadonlyArray<GameCatalogEntry> = [
  { gameId: 'critical_v1', variants: [
    'cyberpunk', 'underwater', 'crime', 'horror', 'adventure',
    'high-altitude-hike', 'galaxy', 'fantasy', 'western', 'egypt',
    'steampunk', 'zen', 'random',
  ] },
  { gameId: 'sea_battle_v1', variants: [
    'classic', 'modern', 'pixel', 'cartoon', 'cyber',
    'vintage', 'nebula', 'forest', 'sunset', 'monochrome',
  ] },
  { gameId: 'texas_holdem_v1', variants: [] },
  { gameId: 'glimworm_v1', variants: ['battle_royale', 'time_attack', 'lives_heats'] },
];
```

**Why:** The schema, service, admin endpoints, and admin UI already work for any `(gameId, variantId)` pair. Per the user's choice in brainstorming, gameplay and visual variants are grouped under one game row — no `kind` discriminator, no separate section. Simplest admin model: "a variant is anything the host can pick at room creation."

### D2 — Normalize `gameOptions.variant` and `gameOptions.cardVariant` at the gate

Critical stores its theme under `gameOptions.cardVariant`; Glimworm and Sea Battle use `gameOptions.variant` (Sea Battle's `variantRegistry` also accepts `cardVariant` as a legacy fallback). Introduce a small helper at [apps/be/src/games/games.controller.ts](../../../apps/be/src/games/games.controller.ts) (or a new `apps/be/src/games/game-options.ts` if preferred):

```ts
function extractVariantFromOptions(
  opts: Record<string, unknown> | undefined,
): string | undefined {
  if (!opts || typeof opts !== 'object') return undefined;
  const v = opts.variant ?? opts.cardVariant;
  return typeof v === 'string' ? v : undefined;
}
```

Use the helper at:
- `createRoom` (replaces T11's inline 3-line extraction).
- `listRooms` `filterVisible` key extractor (replaces T12's inline extraction).

**Why:** Picking up `cardVariant` is the only way Critical visibility checks fire today. The helper centralizes the dual-key knowledge in one place; future extraction sites consume the same helper.

The Glimworm WS gateway (T13) is unaffected — it reads a typed `variant` payload field, not `gameOptions`.

### D3 — Web pickers do one-shot catalog fetch (T21 pattern)

For each of Critical's [CreationConfig.tsx](../../../apps/web/src/widgets/CriticalGame/ui/CreationConfig.tsx) and Sea Battle's [VariantSelector.tsx](../../../apps/web/src/widgets/SeaBattleGame/ui/VariantSelector.tsx):

```ts
const [allowedVariants, setAllowedVariants] = useState<string[] | null>(null);
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
    ? <FULL_VARIANTS_CONST>
    : <FULL_VARIANTS_CONST>.filter((v) => allowedVariants.includes(v.id));
```

**Why:** Identical shape to Glimworm's T21. Failure is silent; the BE rejects on submit. Render full list during the in-flight fetch to avoid flicker.

Critical has **two** `CARD_VARIANTS` constants today — one in `apps/web/src/features/games/lib/criticalVariants.ts` (used by HomeHero) and one in `apps/web/src/widgets/CriticalGame/lib/constants.ts` (used by `CreationConfig` and `CriticalLobby`). Filter the second one (the picker's source); the first one only feeds the marketing hero rotation and doesn't gate room creation. Reconciling the duplication is out of scope.

## Architecture (delta)

```
BE catalog: +23 variant strings under critical_v1 / sea_battle_v1
BE controller: +1 helper, two call-site replacements (createRoom, listRooms)
Web: +2 picker effects, +2 filter spread points
Tests: +1 catalog test case, +1 controller test case (cardVariant extraction), +2 picker Vitest cases
```

No schema change. No new endpoints. No admin UI code change (table iterates the catalog).

## Data flow

```
USER WRITE (createRoom, Critical theme = 'crime'):
  Web (POST /games/rooms { gameId: 'critical_v1', gameOptions: { cardVariant: 'crime' } })
    → GamesController.createRoom
    → extractVariantFromOptions(dto.gameOptions) → 'crime'  // picked from cardVariant
    → assertVisible(role, 'critical_v1', 'crime')
    → if allowed: existing creation flow
    → else: 403 ForbiddenException { code: 'GAME_VISIBILITY_DENIED', gameId: 'critical_v1', variantId: 'crime' }
```

`listRooms` reads the persisted `gameOptions` from `GameRoomSummary` and runs the same extractor before `filterVisible`.

## Testing

### BE unit
- `games.catalog.spec.ts`: assert `getCatalogEntry('critical_v1').variants` contains all 13 IDs (including `high-altitude-hike` to lock the hyphen); `hasVariant('critical_v1', 'cyberpunk')` is true, `hasVariant('critical_v1', 'bogus')` is false. Same for `sea_battle_v1`.
- `games.controller.visibility.spec.ts`: add a createRoom test where `gameOptions.cardVariant: 'crime'` is restricted — asserts `assertVisible` is called with `('free', 'critical_v1', 'crime')` and `gamesService.createRoom` is not called.
- `games.controller.visibility.spec.ts`: confirm `gameOptions.variant` still takes precedence when both keys are present (defensive — pin contract).

### Web unit (Vitest)
- Critical `CreationConfig`: mock `gamesApi.getCatalog()` to return `critical_v1.variants` without `cyberpunk`; assert the rendered list excludes the cyberpunk tile.
- Sea Battle `VariantSelector`: same pattern.

### Manual smoke (post-deploy)
1. Admin → `/admin/games` → expand Critical → set `crime` to `vip_plus`.
2. Free user opens Critical's lobby (or quickplay create flow) → `crime` tile is not visible. Direct `POST /games/rooms { gameId: 'critical_v1', gameOptions: { cardVariant: 'crime' } }` returns 403.
3. VIP user sees and can use `crime`.

## Rollout

No migration. Empty `game_visibility` collection rows for new variant IDs mean tier = `all`, identical to current behavior. The catalog deploy is safe to ship; the picker filter ships in the same commit but is a no-op until an admin restricts something.

## Open questions

None. Defaults inherited from ARC-710.
