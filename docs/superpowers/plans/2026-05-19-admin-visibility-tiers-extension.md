# `none` and `developers_plus` Visibility Tiers — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the admin game/variant visibility system with two new tiers — `developers_plus` (devs/admins only) and `none` (nobody plays; rendered as "coming soon" in variant pickers).

**Architecture:** Extend the existing tier ladder by adding two values to `VISIBILITY_TIERS` and `TIER_MIN_PRIORITY` (and the shadow-duplicate `TIER_RANK` in the service). Change `getCatalog`'s per-variant response from `string[]` to `{ id: string; comingSoon: boolean }[]` so pickers can render `none`-tier variants as disabled tiles. No new endpoints, no new collection, no schema change.

**Tech Stack:** NestJS 10 + Mongoose (BE), Next.js 14 + Tamagui (web), Jest (BE tests), Vitest (web tests).

**Reference spec:** [docs/superpowers/specs/2026-05-19-admin-visibility-tiers-extension-design.md](../specs/2026-05-19-admin-visibility-tiers-extension-design.md)

---

## Task 1: Extend the BE tier ladder (`roles.ts` + `TIER_RANK`)

**Files:**

- Modify: `apps/be/src/auth/lib/roles.ts:156-167`
- Modify: `apps/be/src/admin/game-visibility/game-visibility.service.ts:25-29`
- Test: `apps/be/src/auth/lib/roles.spec.ts` (existing file)
- Test: `apps/be/src/admin/game-visibility/game-visibility.service.spec.ts` (existing — extend it)

- [ ] **Step 1: Write the failing `canSeeAtTier` test cases**

Open the canSeeAtTier test file. Add cases:

```ts
describe('canSeeAtTier (new tiers)', () => {
  it('developers_plus admits developer and admin only', () => {
    expect(canSeeAtTier('developer', 'developers_plus')).toBe(true);
    expect(canSeeAtTier('admin', 'developers_plus')).toBe(true);
    expect(canSeeAtTier('moderator', 'developers_plus')).toBe(false);
    expect(canSeeAtTier('tester', 'developers_plus')).toBe(false);
    expect(canSeeAtTier('vip', 'developers_plus')).toBe(false);
    expect(canSeeAtTier('free', 'developers_plus')).toBe(false);
  });

  it('none admits nobody', () => {
    expect(canSeeAtTier('admin', 'none')).toBe(false);
    expect(canSeeAtTier('developer', 'none')).toBe(false);
    expect(canSeeAtTier('vip', 'none')).toBe(false);
    expect(canSeeAtTier('free', 'none')).toBe(false);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd apps/be && pnpm jest --runTestsByPath src/auth/lib/roles.spec.ts`
Expected: TypeScript or runtime errors — `'developers_plus'`/`'none'` not in `VisibilityTier` union.

- [ ] **Step 3: Extend `VISIBILITY_TIERS` and `TIER_MIN_PRIORITY` in `roles.ts`**

```ts
export const VISIBILITY_TIERS = [
  'all',
  'premium_plus',
  'vip_plus',
  'developers_plus',
  'none',
] as const;
export type VisibilityTier = (typeof VISIBILITY_TIERS)[number];

const TIER_MIN_PRIORITY: Record<VisibilityTier, number> = {
  all: 0,
  premium_plus: ROLE_INFO.premium.priority,
  vip_plus: ROLE_INFO.vip.priority,
  developers_plus: ROLE_INFO.developer.priority,
  none: Number.POSITIVE_INFINITY,
};
```

`canSeeAtTier` stays as-is — its `role.priority >= TIER_MIN_PRIORITY[tier]` formula handles `Infinity` correctly.

- [ ] **Step 4: Verify `roles` tests now pass; verify `game-visibility.service.spec.ts` fails on `TIER_RANK`**

Run: `cd apps/be && pnpm jest --runTestsByPath src/auth/lib/roles.spec.ts`
Expected: PASS.

Run: `cd apps/be && pnpm jest --runTestsByPath src/admin/game-visibility/game-visibility.service.spec.ts`
Expected: TypeScript compile error — `TIER_RANK: Record<VisibilityTier, number>` missing keys `developers_plus` and `none`.

- [ ] **Step 5: Write failing `getEffectiveTier` test cases for mixed new+old tiers**

Append to `apps/be/src/admin/game-visibility/game-visibility.service.spec.ts` (inside the existing read-paths describe or a new one):

```ts
it('returns the stricter of game/variant when mixing new and old tiers', async () => {
  const model = makeModelMock([
    { gameId: 'glimworm_v1', variantId: null, tier: 'developers_plus' },
    { gameId: 'glimworm_v1', variantId: 'time_attack', tier: 'none' },
  ]);
  const svc = await build(model);
  await expect(
    svc.getEffectiveTier('glimworm_v1', 'time_attack'),
  ).resolves.toBe('none');
});

it('whole-game none beats any variant', async () => {
  const model = makeModelMock([
    { gameId: 'glimworm_v1', variantId: null, tier: 'none' },
    { gameId: 'glimworm_v1', variantId: 'time_attack', tier: 'all' },
  ]);
  const svc = await build(model);
  await expect(
    svc.getEffectiveTier('glimworm_v1', 'time_attack'),
  ).resolves.toBe('none');
});

it('developers_plus on variant beats all on game', async () => {
  const model = makeModelMock([
    { gameId: 'glimworm_v1', variantId: null, tier: 'all' },
    {
      gameId: 'glimworm_v1',
      variantId: 'time_attack',
      tier: 'developers_plus',
    },
  ]);
  const svc = await build(model);
  await expect(
    svc.getEffectiveTier('glimworm_v1', 'time_attack'),
  ).resolves.toBe('developers_plus');
});
```

(Use whatever helper the existing tests use to build the service — the existing file already has `makeModelMock` and a moduleRef pattern; reuse it.)

- [ ] **Step 6: Extend `TIER_RANK` in `game-visibility.service.ts`**

```ts
const TIER_RANK: Record<VisibilityTier, number> = {
  all: 0,
  premium_plus: 1,
  vip_plus: 2,
  developers_plus: 3,
  none: 4,
};
```

- [ ] **Step 7: Verify both BE test files pass**

Run: `cd apps/be && pnpm jest --runTestsByPath src/auth/lib/roles.spec.ts src/admin/game-visibility/game-visibility.service.spec.ts`
Expected: ALL PASS.

- [ ] **Step 8: Run full BE suite to catch any other typecheck breaks**

Run: `cd apps/be && pnpm test 2>&1 | tail -30`
Expected: ALL PASS. (TypeScript compiles, no test regressions.)

- [ ] **Step 9: Commit**

```bash
git add apps/be/src/auth/lib/roles.ts apps/be/src/auth/lib/roles.spec.ts apps/be/src/admin/game-visibility/game-visibility.service.ts apps/be/src/admin/game-visibility/game-visibility.service.spec.ts
git commit -m "feat(admin): add developers_plus and none visibility tiers (ARC-710)"
```

---

## Task 2: `getCatalog` shape change + `comingSoon` walk

**Files:**

- Modify: `apps/be/src/games/games.controller.ts` — `getCatalog` handler and its return type
- Test: `apps/be/src/games/games.catalog-endpoint.spec.ts` (existing — extend)

- [ ] **Step 1: Locate the current `getCatalog` handler and capture the existing shape**

Run: `grep -n "getCatalog\|catalog" apps/be/src/games/games.controller.ts | head -20`

The current handler iterates `GAME_CATALOG`, computes `canSee(role, gameId)`, and on visible games iterates variants, computing `canSee(role, gameId, variantId)` to decide inclusion. It returns `{ games: [{ gameId, variants: string[] }] }`.

- [ ] **Step 2: Write the failing catalog test cases**

In `apps/be/src/games/games.catalog-endpoint.spec.ts`, add a new describe block:

```ts
describe('getCatalog (comingSoon + new tiers)', () => {
  it('includes a none-tier variant with comingSoon=true for a free caller', async () => {
    // arrange model: critical_v1 game tier 'all', variant 'crime' tier 'none'
    // act: call getCatalog with role 'free'
    // assert: critical entry's variants contains { id: 'crime', comingSoon: true }
    //         critical entry's variants contains { id: 'cyberpunk', comingSoon: false }
  });

  it('includes a none-tier variant with comingSoon=true for an admin caller (no bypass)', async () => {
    // arrange same as above
    // act: call getCatalog with role 'admin'
    // assert: 'crime' still appears with comingSoon: true
  });

  it('omits a developers_plus variant entirely for a free caller', async () => {
    // arrange: critical_v1 game tier 'all', variant 'crime' tier 'developers_plus'
    // act: role 'free'
    // assert: critical entry's variants does NOT contain anything with id 'crime'
  });

  it('includes a developers_plus variant with comingSoon=false for a developer caller', async () => {
    // act: role 'developer'
    // assert: critical entry's variants contains { id: 'crime', comingSoon: false }
  });

  it('omits a whole game entirely when its tier is none, even for admin', async () => {
    // arrange: critical_v1 game tier 'none'
    // act: role 'admin'
    // assert: res.games.find(g => g.gameId === 'critical_v1') is undefined
  });
});
```

Flesh these out using the existing helper pattern in the file (mock `GameVisibilityService` so it returns the configured tier per call).

- [ ] **Step 3: Update existing test assertions in the same file to the new shape**

Inside the file, anywhere a test asserts `variants.toContain('something')` or `variants.toEqual([...strings])`, update to either:

- `variants.map(v => v.id).toContain('something')`, or
- `variants` equals `expect.arrayContaining([{ id: 'something', comingSoon: false }, ...])`

Look at lines around 42-65 (which has `expect(glim?.variants).toEqual(...)` and `.not.toContain('time_attack')`) and lines 60-65 for the existing test cases.

- [ ] **Step 4: Run the tests to verify the new ones fail and the existing ones now fail too (shape change pending)**

Run: `cd apps/be && pnpm jest --runTestsByPath src/games/games.catalog-endpoint.spec.ts`
Expected: New describe block fails (shape mismatch); some existing assertions also fail until updated.

- [ ] **Step 5: Change the controller's `getCatalog` walk and return type**

Inside `getCatalog`:

```ts
@UseGuards(JwtOptionalAuthGuard)
@Get('catalog')
async getCatalog(
  @Req() req: AuthenticatedRequest,
): Promise<{
  games: Array<{
    gameId: string;
    variants: Array<{ id: string; comingSoon: boolean }>;
  }>;
}> {
  const role = await this.roleResolver.resolveRole(req.user?.userId);
  const games: Array<{
    gameId: string;
    variants: Array<{ id: string; comingSoon: boolean }>;
  }> = [];

  for (const entry of GAME_CATALOG) {
    const gameVisible = await this.visibility.canSee(role, entry.gameId);
    if (!gameVisible) continue; // whole-game none/developers_plus etc. → omit entirely

    const variants: Array<{ id: string; comingSoon: boolean }> = [];
    for (const variantId of entry.variants) {
      const effective = await this.visibility.getEffectiveTier(
        entry.gameId,
        variantId,
      );
      if (effective === 'none') {
        variants.push({ id: variantId, comingSoon: true });
      } else if (await this.visibility.canSee(role, entry.gameId, variantId)) {
        variants.push({ id: variantId, comingSoon: false });
      }
    }
    games.push({ gameId: entry.gameId, variants });
  }

  return { games };
}
```

Match the surrounding code style (whether the existing handler uses `for-of` with `await` or `Promise.all`; preserve the pattern). If the existing handler uses `Promise.all`, keep the parallelism: just `await this.visibility.getEffectiveTier` once per variant and build `{ id, comingSoon }` from the result.

- [ ] **Step 6: Verify all catalog-endpoint tests pass**

Run: `cd apps/be && pnpm jest --runTestsByPath src/games/games.catalog-endpoint.spec.ts`
Expected: ALL PASS (including the new and the migrated assertions).

- [ ] **Step 7: Run full BE suite**

Run: `cd apps/be && pnpm test 2>&1 | tail -30`
Expected: ALL PASS.

- [ ] **Step 8: Commit**

```bash
git add apps/be/src/games/games.controller.ts apps/be/src/games/games.catalog-endpoint.spec.ts
git commit -m "feat(admin): catalog endpoint returns comingSoon flag per variant (ARC-710)"
```

---

## Task 3: Web `gamesApi` typed return + admin types mirror + `TierLabels` refactor

**Files:**

- Modify: `apps/web/src/features/games/api.ts:225-231` — `getCatalog` return type
- Modify: `apps/web/src/features/admin-games/types.ts` — extend `VISIBILITY_TIERS`
- Modify: `apps/web/src/features/admin-games/ui/GameVisibilityRow.tsx:14-18` — refactor `TierLabels` interface to `Record<VisibilityTier, string>`

- [ ] **Step 1: Update `gamesApi.getCatalog` return type**

In `apps/web/src/features/games/api.ts` around line 225-231:

```ts
getCatalog: async (
  options?: ApiClientOptions,
): Promise<{
  games: Array<{
    gameId: string;
    variants: Array<{ id: string; comingSoon: boolean }>;
  }>;
}> => {
  return apiClient.get<{
    games: Array<{
      gameId: string;
      variants: Array<{ id: string; comingSoon: boolean }>;
    }>;
  }>('/games/catalog', options);
},
```

- [ ] **Step 2: Extend `VISIBILITY_TIERS` in web admin types**

In `apps/web/src/features/admin-games/types.ts`:

```ts
export const VISIBILITY_TIERS = [
  'all',
  'premium_plus',
  'vip_plus',
  'developers_plus',
  'none',
] as const;
export type VisibilityTier = (typeof VISIBILITY_TIERS)[number];
```

- [ ] **Step 3: Refactor `TierLabels` in `GameVisibilityRow.tsx`**

Replace the explicit `interface TierLabels` block at lines 14-18 with a type alias:

```ts
type TierLabels = Record<VisibilityTier, string>;
```

This now derives from `VisibilityTier`. Future tier additions stop needing this edit site.

- [ ] **Step 4: Run typecheck**

Run: `cd apps/web && pnpm type-check 2>&1 | tail -30`
Expected: errors flagging missing `developers_plus` and `none` entries in the locale files' `tiers` objects (covered in Task 4). No other typecheck failures.

**Note:** Do NOT commit yet — Task 3 + Task 4 must commit together because the mirror + `TierLabels` refactor breaks typecheck until the locale files have the new keys. The "commit" step at the end of Task 4 covers both.

- [ ] **Step 5: Do NOT commit yet**

Hold the staged changes through Task 4 and commit at the end of Task 4.

---

## Task 4: i18n — three new keys in five locale files (commits Task 3 + Task 4 together)

**Files:**

- Modify: `apps/web/src/shared/i18n/messages/pages/admin-games/en.ts`
- Modify: `apps/web/src/shared/i18n/messages/pages/admin-games/ru.ts`
- Modify: `apps/web/src/shared/i18n/messages/pages/admin-games/es.ts`
- Modify: `apps/web/src/shared/i18n/messages/pages/admin-games/fr.ts`
- Modify: `apps/web/src/shared/i18n/messages/pages/admin-games/by.ts`

- [ ] **Step 1: Decide where the user-facing "Coming soon" badge string lives**

Run: `grep -rn "comingSoon" apps/web/src/shared/i18n/messages/ | head -10`

There's already an `auth.<locale>.comingSoon` key in the repo. Convention: per-feature `comingSoon` keys exist. For variant pickers, add `comingSoon` under each game's existing namespace (the file naming/structure depends on where Critical/SeaBattle/Glimworm strings currently live — discover with: `grep -rn "games.critical_v1\|games.sea_battle_v1\|games.glimworm_v1" apps/web/src/shared/i18n/messages/ | head -5`).

If a `games.common.comingSoon` (or equivalent shared namespace) already exists, reuse it. Otherwise add one new key per picker namespace (3 × 5 = 15 string additions) or pick a single shared location and use it from all three pickers (3 string additions × 5 locales = 15 additions). Choose the second option (shared) if the codebase has a shared games namespace; otherwise add per-picker.

**Decide and document in the commit message which location was chosen.**

- [ ] **Step 2: Add `tier.developers_plus` and `tier.none` to all five admin-games locale files**

`en.ts`:

```ts
  tiers: {
    all: 'All players',
    premium_plus: 'Premium+',
    vip_plus: 'VIP+',
    developers_plus: 'Developers & admins',
    none: 'Hidden (coming soon)',
  },
```

`ru.ts`:

```ts
    developers_plus: 'Разработчики и админы',
    none: 'Скрыто (скоро)',
```

`es.ts`:

```ts
    developers_plus: 'Desarrolladores y administradores',
    none: 'Oculto (próximamente)',
```

`fr.ts`:

```ts
    developers_plus: 'Développeurs et admins',
    none: 'Masqué (bientôt disponible)',
```

`by.ts`:

```ts
    developers_plus: 'Распрацоўшчыкі і адміны',
    none: 'Схавана (хутка)',
```

(Do not add `as const` — matches the existing pattern; the file's exported type drives the locale union via `typeof adminGamesEn`.)

- [ ] **Step 3: Add the coming-soon badge string in the location chosen in Step 1**

Add one string per locale. Suggested values:

- en: `'Coming soon'`
- ru: `'Скоро'`
- es: `'Próximamente'`
- fr: `'Bientôt disponible'`
- by: `'Хутка'`

- [ ] **Step 4: Run translation check**

Run: `cd apps/web && pnpm check-translations 2>&1 | tail -20` (or whatever script the project provides; check `package.json`).
Expected: clean.

- [ ] **Step 5: Run typecheck**

Run: `cd apps/web && pnpm type-check 2>&1 | tail -20`
Expected: clean (all five `tiers` objects now satisfy `Record<VisibilityTier, string>`).

- [ ] **Step 6: Commit (Task 3 + Task 4 together)**

```bash
git add apps/web/src/features/games/api.ts \
  apps/web/src/features/admin-games/types.ts \
  apps/web/src/features/admin-games/ui/GameVisibilityRow.tsx \
  apps/web/src/shared/i18n/messages/
git commit -m "feat(admin-games): mirror new tiers + localize developers_plus and none (ARC-710)"
```

---

## Task 5: Critical CreationConfig — render coming-soon variant as disabled tile

**Files:**

- Modify: `apps/web/src/widgets/CriticalGame/ui/CreationConfig.tsx`
- Test: `apps/web/src/widgets/CriticalGame/ui/CreationConfig.visibility.test.tsx`

- [ ] **Step 1: Extend the failing visibility test**

Read the existing test file. Add a new test case:

```tsx
it('renders a coming-soon variant as a disabled tile with a badge', async () => {
  vi.mocked(gamesApi.getCatalog).mockResolvedValue({
    games: [
      {
        gameId: 'critical_v1',
        variants: [
          { id: 'cyberpunk', comingSoon: false },
          { id: 'crime', comingSoon: true },
        ],
      },
    ],
  });

  render(/* existing render helper */);

  await waitFor(() => {
    // cyberpunk: present and clickable
    expect(screen.getByTestId('variant-tile-cyberpunk')).toBeInTheDocument();
    expect(screen.getByTestId('variant-tile-cyberpunk')).not.toHaveAttribute(
      'aria-disabled',
      'true',
    );

    // crime: present but disabled with badge
    const crimeTile = screen.getByTestId('variant-tile-crime');
    expect(crimeTile).toHaveAttribute('aria-disabled', 'true');
    expect(within(crimeTile).getByText(/coming soon/i)).toBeInTheDocument();
  });

  // Clicking the disabled tile is a no-op (handleUpdate not called)
  fireEvent.click(screen.getByTestId('variant-tile-crime'));
  expect(onChangeMock).not.toHaveBeenCalledWith(
    expect.objectContaining({ cardVariant: 'crime' }),
  );
});
```

If `data-testid` for tiles doesn't exist yet, add it in the next step. If existing tests use different selectors (e.g., role-based queries by variant name), match that pattern.

- [ ] **Step 2: Migrate the existing mock payloads in the same file to the new shape**

Anywhere the file does `variants: ['cyberpunk', 'galaxy']` (string array), change to `variants: [{ id: 'cyberpunk', comingSoon: false }, { id: 'galaxy', comingSoon: false }]`.

- [ ] **Step 3: Run the test to verify it fails**

Run: `cd apps/web && pnpm vitest run src/widgets/CriticalGame/ui/CreationConfig.visibility.test.tsx`
Expected: FAIL — the new test fails because the rendering doesn't yet handle `comingSoon`, and the existing tests fail because of the shape change.

- [ ] **Step 4: Update `CreationConfig.tsx` rendering**

In `apps/web/src/widgets/CriticalGame/ui/CreationConfig.tsx`:

1. Change the `allowedVariants` state to `Array<{ id: string; comingSoon: boolean }> | null`.
2. Update the effect: `setAllowedVariants(entry?.variants ?? null)` (entry.variants already matches the new shape).
3. Update `visibleVariants` to carry the `comingSoon` flag onto each tile:

```tsx
const visibleVariants =
  allowedVariants === null
    ? CARD_VARIANTS.map((v) => ({ ...v, comingSoon: false }))
    : CARD_VARIANTS.filter((v) =>
        allowedVariants.some((a) => a.id === v.id),
      ).map((v) => ({
        ...v,
        comingSoon:
          allowedVariants.find((a) => a.id === v.id)?.comingSoon ?? false,
      }));
```

4. In the JSX iteration (around line 115), add a `comingSoon` branch alongside `disabled`:

```tsx
{
  visibleVariants.map((variant) => {
    const isComingSoon = variant.comingSoon;
    const isDisabled = variant.disabled || isComingSoon;
    return (
      <ItemWrapper
        key={variant.id}
        data-testid={`variant-tile-${variant.id}`}
        aria-disabled={isDisabled || undefined}
        disabled={isDisabled}
        onClick={() => !isDisabled && handleUpdate({ cardVariant: variant.id })}
      >
        <GameTileItem
          active={options.cardVariant === variant.id}
          disabled={isDisabled}
        >
          {/* existing children */}
          {isComingSoon && (
            <span
            // small badge — match the existing visual language for disabled state
            // use the localized coming-soon string from t('<chosen key>')
            >
              {t('<comingSoon i18n key chosen in Task 4>')}
            </span>
          )}
        </GameTileItem>
      </ItemWrapper>
    );
  });
}
```

(Reuse the existing `disabled` styling — don't introduce a parallel visual treatment. The badge can be a small Tamagui `<Paragraph size="$1">` or whatever matches the existing tile design.)

- [ ] **Step 5: Run the test to verify it passes**

Run: `cd apps/web && pnpm vitest run src/widgets/CriticalGame/ui/CreationConfig.visibility.test.tsx`
Expected: ALL PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/widgets/CriticalGame/
git commit -m "feat(admin-games): Critical CreationConfig renders coming-soon variants (ARC-710)"
```

---

## Task 6: Sea Battle CreationConfig — same coming-soon treatment

**Files:**

- Modify: `apps/web/src/widgets/SeaBattleGame/ui/CreationConfig.tsx`
- Test: `apps/web/src/widgets/SeaBattleGame/ui/CreationConfig.visibility.test.tsx`

- [ ] **Step 1: Extend the failing visibility test**

Same pattern as Task 5 step 1, but for Sea Battle variant IDs (e.g., `classic`, `cyber`). One test case for `comingSoon: true` rendering + click no-op.

- [ ] **Step 2: Migrate existing mock payloads to the new shape**

Same as Task 5 step 2.

- [ ] **Step 3: Run the test to verify it fails**

Run: `cd apps/web && pnpm vitest run src/widgets/SeaBattleGame/ui/CreationConfig.visibility.test.tsx`
Expected: FAIL.

- [ ] **Step 4: Update `CreationConfig.tsx` rendering**

Sea Battle today renders tiles plainly with no `disabled` mechanism (see grep results in the spec). Add one:

```tsx
const visibleVariants = ... // same shape as Critical (with comingSoon flag)

{visibleVariants.map((variant) => {
  const isComingSoon = variant.comingSoon;
  return (
    <button
      key={variant.id}
      data-testid={`variant-tile-${variant.id}`}
      aria-disabled={isComingSoon || undefined}
      disabled={isComingSoon}
      onClick={() =>
        !isComingSoon && onChange({ ...options, variant: variant.id })
      }
      style={{
        // existing tile styles
        opacity: isComingSoon ? 0.5 : 1,
        cursor: isComingSoon ? 'not-allowed' : 'pointer',
      }}
    >
      <GameTileItem active={options.variant === variant.id}>
        {/* existing children */}
        {isComingSoon && (
          <span /* badge */>{t('<comingSoon key>')}</span>
        )}
      </GameTileItem>
    </button>
  );
})}
```

Adjust the wrapper element type (`<button>` vs. `<div>`) to match what's there today — read the file first.

- [ ] **Step 5: Run the test to verify it passes**

Run: `cd apps/web && pnpm vitest run src/widgets/SeaBattleGame/ui/CreationConfig.visibility.test.tsx`
Expected: ALL PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/widgets/SeaBattleGame/
git commit -m "feat(admin-games): Sea Battle CreationConfig renders coming-soon variants (ARC-710)"
```

---

## Task 7: Glimworm Lobby — same coming-soon treatment

**Files:**

- Modify: `apps/web/src/widgets/GlimwormGame/ui/GlimwormLobby.tsx` (variant tile rendering around lines 175-205)
- Create: `apps/web/src/widgets/GlimwormGame/ui/GlimwormLobby.visibility.test.tsx` (verified: no `*.test.tsx` files exist in this directory today)

- [ ] **Step 1: Create the new test file with failing cases**

Model on `apps/web/src/widgets/CriticalGame/ui/CreationConfig.visibility.test.tsx` (same TamaguiProvider wrapper, same `gamesApi.getCatalog` mock strategy). Two cases:

1. Catalog returns `battle_royale` with `comingSoon: false` → tile is interactive; clicking sets `variant` state.
2. Catalog returns `time_attack` with `comingSoon: true` → tile is rendered, has `aria-disabled="true"`, contains a "Coming soon" badge, and clicking does NOT set `variant` state.

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd apps/web && pnpm vitest run src/widgets/GlimwormGame/ui/GlimwormLobby.visibility.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Update `GlimwormLobby.tsx` rendering**

Reading lines 63-90 (current effect + state) and 175-205 (current tile rendering):

```tsx
const [allowedVariants, setAllowedVariants] = useState<Array<{
  id: string;
  comingSoon: boolean;
}> | null>(null);

useEffect(() => {
  let cancelled = false;
  gamesApi
    .getCatalog()
    .then((res) => {
      if (cancelled) return;
      const glim = res.games.find((g) => g.gameId === 'glimworm_v1');
      setAllowedVariants(glim?.variants ?? null);
    })
    .catch(() => {
      if (!cancelled) setAllowedVariants(null);
    });
  return () => {
    cancelled = true;
  };
}, []);

const visibleVariants =
  allowedVariants === null
    ? GLIMWORM_VARIANTS.map((v) => ({ ...v, comingSoon: false }))
    : GLIMWORM_VARIANTS.filter((v) =>
        allowedVariants.some((a) => a.id === v.id),
      ).map((v) => ({
        ...v,
        comingSoon:
          allowedVariants.find((a) => a.id === v.id)?.comingSoon ?? false,
      }));
```

In the tile rendering loop:

```tsx
{
  visibleVariants.map((v) => {
    const active = variant === v.id;
    const isComingSoon = v.comingSoon;
    const interactionAllowed = isHost && !isComingSoon;
    return (
      <button
        key={v.id}
        type="button"
        data-testid={`variant-tile-${v.id}`}
        aria-disabled={isComingSoon || undefined}
        disabled={!interactionAllowed}
        onClick={() =>
          interactionAllowed && setVariant(v.id as GlimwormVariant)
        }
        style={{
          // existing styles
          opacity: isComingSoon ? 0.4 : isHost || active ? 1 : 0.5,
          cursor: interactionAllowed ? 'pointer' : 'default',
        }}
      >
        {v.emoji} {t(v.name as TranslationKey)}
        {isComingSoon && (
          <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.8 }}>
            {t('<comingSoon key>')}
          </span>
        )}
      </button>
    );
  });
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd apps/web && pnpm vitest run src/widgets/GlimwormGame/ui/GlimwormLobby.visibility.test.tsx`
Expected: ALL PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/widgets/GlimwormGame/
git commit -m "feat(admin-games): Glimworm lobby renders coming-soon variants (ARC-710)"
```

---

## Task 8: Final verification + push

- [ ] **Step 1: Run full BE suite**

Run: `cd apps/be && pnpm test 2>&1 | tail -30`
Expected: ALL PASS.

- [ ] **Step 2: Run full web suite**

Run: `cd apps/web && pnpm test 2>&1 | tail -30`
Expected: ALL PASS.

- [ ] **Step 3: Run lint, file-length, translations**

Run in parallel:

- `pnpm lint`
- `pnpm check-file-length`
- `pnpm check-translations`

All three: clean.

- [ ] **Step 4: Push the branch**

```bash
git push origin ARC-704
```

If pre-push hooks fail and the user previously authorized `--no-verify` for disk-constrained pushes, confirm before using it again; otherwise investigate and fix.

- [ ] **Step 5: Update PR #701 description if needed**

Run: `gh pr view 701 --json body --jq .body | head -50`

If the PR body doesn't already cover the new tiers, edit it:

```bash
gh pr edit 701 --body "$(cat <<'EOF'
[existing body content]

### Follow-up: `none` + `developers_plus` tiers (ARC-710)
Adds two new visibility tiers. `developers_plus` gates a game/variant
to developers and admins. `none` shows variant tiles as "coming soon"
in the three pickers (Critical / Sea Battle / Glimworm); whole-game
`none` is hidden entirely from the catalog. No new endpoints, no
schema change.
EOF
)"
```

---

## Notes on file size

The Critical and Glimworm pickers are already large. Track line counts during Tasks 5 and 7:

- If a file would exceed 500 lines (the project's `check-file-length` threshold), extract the new rendering branch into a small helper component (e.g., `ComingSoonBadge.tsx`) co-located with the picker.
- Don't pre-extract if you stay under the threshold — adds churn without benefit.
