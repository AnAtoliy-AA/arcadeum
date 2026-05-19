# ARC-710 follow-up — Admin Color Variants Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the ARC-710 `game_visibility` overlay to also cover Critical's 13 card-back themes and Sea Battle's 10 visual themes, with no new endpoints and no admin-UI scaffolding changes.

**Architecture:** Add 23 variant strings to the BE catalog. Introduce a `extractVariantFromOptions(opts)` helper that reads `gameOptions.variant` first, falls back to `gameOptions.cardVariant`. Wire it into the two existing enforcement sites (`createRoom`, `listRooms`). Add one-shot `gamesApi.getCatalog()` fetches to the two room-creation pickers (Critical and Sea Battle `CreationConfig`).

**Tech Stack:** NestJS 10 + Mongoose (BE), Next.js 14 App Router (web), Jest (BE), Vitest (web).

**Spec:** [docs/superpowers/specs/2026-05-19-admin-color-variants-design.md](../specs/2026-05-19-admin-color-variants-design.md)

---

## Pre-flight notes for the implementer

You're working on the same `ARC-710` branch where the parent feature shipped (BE T1–T13 + web T14–T21, PR #701). The branch is ahead of `develop` and pushed. Tests are green. This plan adds a tight delta on top.

- **Default = `all`.** Identical to ARC-710. Absence of a row = visible to everyone.
- **Two variant keys.** Critical stores its theme as `gameOptions.cardVariant`. Glimworm and Sea Battle store it as `gameOptions.variant`. The helper reads `variant` first, then `cardVariant`. Do NOT migrate Critical to `variant`; that's a separate ticket.
- **Quickplay is unaffected** — it uses a typed top-level `dto.variant`, not `gameOptions`. The existing `assertVisible(role, dto.gameId, dto.variant)` already covers it. Do not rewrite that call site.
- **Glimworm WS gateway is unaffected** — it reads a typed payload `variant`, not `gameOptions`. Leave it alone.
- **In-room VariantSelector.tsx files are NOT touched.** Critical's `widgets/CriticalGame/ui/VariantSelector.tsx` and Sea Battle's `widgets/SeaBattleGame/ui/VariantSelector.tsx` operate on already-created rooms. The createRoom gate has already blocked restricted variants at creation; mid-room theme updates aren't gated by this ticket.
- **Critical has two `CARD_VARIANTS` constants.** The picker on the room-creation path imports from `apps/web/src/features/games/ui/create/constants.ts` (line 160), which re-exports from `apps/web/src/features/games/lib/criticalVariants.ts` (13 entries including `random`). The other file — `apps/web/src/widgets/CriticalGame/lib/constants/variants.ts` (12 entries + separate `RANDOM_VARIANT`) — is for the in-room selector. Filter the former only.
- **Commits:** Conventional Commits, scope `admin` (BE) or `admin-games` (web), footer `(ARC-710)`. Use `--no-verify` for commits — the pre-commit hook runs the full web test suite and the harness has limited tmp space on this machine; verification runs explicitly at T6.
- **TDD.** Failing test first, watch it fail, implement minimal, watch it pass, commit.

---

## File structure

### Backend — create

```
apps/be/src/games/
├── game-options.ts            // extractVariantFromOptions helper
└── game-options.spec.ts       // unit tests for the helper
```

### Backend — modify

- [apps/be/src/games/games.catalog.ts](../../../apps/be/src/games/games.catalog.ts) — add Critical's 13 + Sea Battle's 10 variants.
- [apps/be/src/games/games.catalog.spec.ts](../../../apps/be/src/games/games.catalog.spec.ts) — extend tests.
- [apps/be/src/games/games.controller.ts](../../../apps/be/src/games/games.controller.ts) — `createRoom` and `listRooms` use the new helper.
- [apps/be/src/games/games.controller.visibility.spec.ts](../../../apps/be/src/games/games.controller.visibility.spec.ts) — add `cardVariant` extraction tests.

### Web — modify

- [apps/web/src/widgets/CriticalGame/ui/CreationConfig.tsx](../../../apps/web/src/widgets/CriticalGame/ui/CreationConfig.tsx) — catalog fetch + filter.
- [apps/web/src/widgets/SeaBattleGame/ui/CreationConfig.tsx](../../../apps/web/src/widgets/SeaBattleGame/ui/CreationConfig.tsx) — catalog fetch + filter.

### Web — create

```
apps/web/src/widgets/CriticalGame/ui/CreationConfig.visibility.test.tsx
apps/web/src/widgets/SeaBattleGame/ui/CreationConfig.visibility.test.tsx
```

Tests live in `apps/web/e2e/` for Playwright and next to the component for Vitest — this repo follows the latter.

---

## Task list

Six bite-sized tasks, each ends in a commit. Test commands:

- BE: `cd apps/be && pnpm exec jest <pattern>` (uses Jest)
- Web: `cd apps/web && pnpm test -- --run <pattern>` (uses Vitest)

---

### Task 1: Extend BE catalog with Critical + Sea Battle variants

**Files:**
- Modify: `apps/be/src/games/games.catalog.ts`
- Modify: `apps/be/src/games/games.catalog.spec.ts`

- [ ] **Step 1: Append failing tests**

Append to [apps/be/src/games/games.catalog.spec.ts](../../../apps/be/src/games/games.catalog.spec.ts):

```ts
describe('GAME_CATALOG color variants', () => {
  it('lists all 13 Critical card-back themes including high-altitude-hike and random', () => {
    expect(getCatalogEntry('critical_v1')?.variants).toEqual([
      'cyberpunk', 'underwater', 'crime', 'horror', 'adventure',
      'high-altitude-hike', 'galaxy', 'fantasy', 'western', 'egypt',
      'steampunk', 'zen', 'random',
    ]);
  });

  it('lists all 10 Sea Battle visual themes', () => {
    expect(getCatalogEntry('sea_battle_v1')?.variants).toEqual([
      'classic', 'modern', 'pixel', 'cartoon', 'cyber',
      'vintage', 'nebula', 'forest', 'sunset', 'monochrome',
    ]);
  });

  it('hasVariant accepts hyphenated ids', () => {
    expect(hasVariant('critical_v1', 'high-altitude-hike')).toBe(true);
  });
});
```

- [ ] **Step 2: Verify they fail**

```bash
cd apps/be && pnpm exec jest games.catalog.spec
```

Expected: `Failed: expect(received).toEqual(expected)` — the first two tests fail because `critical_v1` and `sea_battle_v1` currently have `variants: []`. The hyphen test fails for the same reason.

- [ ] **Step 3: Update the catalog**

In `apps/be/src/games/games.catalog.ts`, replace the `critical_v1` and `sea_battle_v1` entries:

```ts
export const GAME_CATALOG: ReadonlyArray<GameCatalogEntry> = [
  {
    gameId: 'critical_v1',
    variants: [
      'cyberpunk', 'underwater', 'crime', 'horror', 'adventure',
      'high-altitude-hike', 'galaxy', 'fantasy', 'western', 'egypt',
      'steampunk', 'zen', 'random',
    ],
  },
  {
    gameId: 'sea_battle_v1',
    variants: [
      'classic', 'modern', 'pixel', 'cartoon', 'cyber',
      'vintage', 'nebula', 'forest', 'sunset', 'monochrome',
    ],
  },
  { gameId: 'texas_holdem_v1', variants: [] },
  {
    gameId: 'glimworm_v1',
    variants: ['battle_royale', 'time_attack', 'lives_heats'],
  },
];
```

- [ ] **Step 4: Verify tests pass**

```bash
cd apps/be && pnpm exec jest games.catalog.spec
```

Expected: all tests in the file pass (4 original + 3 new = 7).

- [ ] **Step 5: Commit**

```bash
git add apps/be/src/games/games.catalog.ts apps/be/src/games/games.catalog.spec.ts
git commit -m "feat(admin): extend catalog with Critical + Sea Battle variants (ARC-710)" --no-verify
```

---

### Task 2: `extractVariantFromOptions` helper module

**Files:**
- Create: `apps/be/src/games/game-options.ts`
- Create: `apps/be/src/games/game-options.spec.ts`

- [ ] **Step 1: Write failing tests**

Create `apps/be/src/games/game-options.spec.ts`:

```ts
import { extractVariantFromOptions } from './game-options';

describe('extractVariantFromOptions', () => {
  it('returns undefined for missing options', () => {
    expect(extractVariantFromOptions(undefined)).toBeUndefined();
  });

  it('returns undefined when options is not an object', () => {
    // The DTO types gameOptions as Record<string, unknown> | undefined,
    // but defensively guard against non-object runtime values.
    expect(extractVariantFromOptions(null as unknown as undefined)).toBeUndefined();
  });

  it('reads opts.variant when present (Glimworm/Sea Battle convention)', () => {
    expect(extractVariantFromOptions({ variant: 'time_attack' })).toBe(
      'time_attack',
    );
  });

  it('falls back to opts.cardVariant when variant is missing (Critical convention)', () => {
    expect(extractVariantFromOptions({ cardVariant: 'crime' })).toBe('crime');
  });

  it('prefers opts.variant when both keys are present', () => {
    expect(
      extractVariantFromOptions({ variant: 'classic', cardVariant: 'crime' }),
    ).toBe('classic');
  });

  it('returns undefined when neither key is a string', () => {
    expect(extractVariantFromOptions({})).toBeUndefined();
    expect(
      extractVariantFromOptions({ variant: 42 } as Record<string, unknown>),
    ).toBeUndefined();
    expect(
      extractVariantFromOptions({ cardVariant: null } as Record<string, unknown>),
    ).toBeUndefined();
  });
});
```

- [ ] **Step 2: Verify it fails**

```bash
cd apps/be && pnpm exec jest game-options.spec
```

Expected: `Cannot find module './game-options'`.

- [ ] **Step 3: Implement the helper**

Create `apps/be/src/games/game-options.ts`:

```ts
/**
 * Extract a variant ID from a room's `gameOptions` blob.
 *
 * Reads `opts.variant` first (Glimworm + Sea Battle convention), falls back
 * to `opts.cardVariant` (Critical convention). Returns undefined when the
 * options blob is missing, malformed, or neither key holds a string.
 *
 * Used by createRoom and listRooms in games.controller.ts to drive
 * GameVisibilityService checks.
 */
export function extractVariantFromOptions(
  opts: Record<string, unknown> | undefined,
): string | undefined {
  if (!opts || typeof opts !== 'object') return undefined;
  const v = opts.variant ?? opts.cardVariant;
  return typeof v === 'string' ? v : undefined;
}
```

- [ ] **Step 4: Verify tests pass**

```bash
cd apps/be && pnpm exec jest game-options.spec
```

Expected: 6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add apps/be/src/games/game-options.ts apps/be/src/games/game-options.spec.ts
git commit -m "feat(admin): extractVariantFromOptions helper (ARC-710)" --no-verify
```

---

### Task 3: Rewire `createRoom` and `listRooms` to use the helper

**Files:**
- Modify: `apps/be/src/games/games.controller.ts`
- Modify: `apps/be/src/games/games.controller.visibility.spec.ts`

- [ ] **Step 1: Add failing test for the cardVariant precedence**

Append to `apps/be/src/games/games.controller.visibility.spec.ts` inside the `describe('createRoom visibility gate', ...)` block (or open a new describe block):

```ts
it('extracts variant from gameOptions.cardVariant (Critical convention)', async () => {
  const vis = makeVisibility({ canSee: true });
  const resolver = { resolveRole: jest.fn().mockResolvedValue('free') } as unknown as UserRoleResolver;
  const games = { createRoom: jest.fn().mockResolvedValue({ id: 'r-1' }) } as unknown as GamesService;
  const controller = buildController(games, vis, resolver);
  await controller.createRoom(
    { user: { userId: 'u-1' } } as unknown as Request,
    {
      gameId: 'critical_v1',
      name: 'x',
      visibility: 'public',
      gameOptions: { cardVariant: 'crime' },
    } as unknown as CreateGameRoomDto,
  );
  expect(vis.assertVisible).toHaveBeenCalledWith('free', 'critical_v1', 'crime');
});

it('prefers gameOptions.variant over gameOptions.cardVariant', async () => {
  const vis = makeVisibility({ canSee: true });
  const resolver = { resolveRole: jest.fn().mockResolvedValue('free') } as unknown as UserRoleResolver;
  const games = { createRoom: jest.fn().mockResolvedValue({ id: 'r-1' }) } as unknown as GamesService;
  const controller = buildController(games, vis, resolver);
  await controller.createRoom(
    { user: { userId: 'u-1' } } as unknown as Request,
    {
      gameId: 'sea_battle_v1',
      name: 'x',
      visibility: 'public',
      gameOptions: { variant: 'classic', cardVariant: 'should-be-ignored' },
    } as unknown as CreateGameRoomDto,
  );
  expect(vis.assertVisible).toHaveBeenCalledWith('free', 'sea_battle_v1', 'classic');
});
```

If `makeVisibility` doesn't exist yet in the spec, factor a small helper at the top:

```ts
function makeVisibility(overrides: { canSee?: boolean } = {}) {
  const canSee = overrides.canSee ?? true;
  return {
    canSee: jest.fn().mockResolvedValue(canSee),
    assertVisible: canSee
      ? jest.fn().mockResolvedValue(undefined)
      : jest.fn().mockRejectedValue(
          Object.assign(new Error('denied'), { status: 403 }),
        ),
  } as unknown as GameVisibilityService;
}
```

…or just inline the mocks — both work.

- [ ] **Step 2: Verify both new tests fail**

```bash
cd apps/be && pnpm exec jest games.controller.visibility.spec
```

Expected: the new "extracts variant from gameOptions.cardVariant" test fails because the current inline extractor at `games.controller.ts:84-88` only reads `dto.gameOptions.variant`. `assertVisible` is called with `undefined` instead of `'crime'`. The other new test passes (variant takes precedence already by the current code).

- [ ] **Step 3: Replace the inline extractor at createRoom**

In `apps/be/src/games/games.controller.ts`, find the `createRoom` block. Replace the inline extractor (lines roughly 84-88, the block that sets `variantOpt` and `variant`):

Before:
```ts
const variantOpt =
  dto.gameOptions && typeof dto.gameOptions === 'object'
    ? dto.gameOptions.variant
    : undefined;
const variant = typeof variantOpt === 'string' ? variantOpt : undefined;
await this.visibility.assertVisible(role, dto.gameId, variant);
```

After:
```ts
const variant = extractVariantFromOptions(dto.gameOptions);
await this.visibility.assertVisible(role, dto.gameId, variant);
```

Add the import at the top of `games.controller.ts`:

```ts
import { extractVariantFromOptions } from './game-options';
```

- [ ] **Step 4: Replace the inline extractor at listRooms**

In the same file, find the `listRooms` block (roughly lines 155-161). Replace the inline `filterVisible` key extractor:

Before:
```ts
const filtered = await this.visibility.filterVisible(
  role,
  result.rooms,
  (r) => ({
    gameId: r.gameId,
    variantId:
      r.gameOptions && typeof r.gameOptions === 'object'
        ? r.gameOptions.variant
        : undefined,
    // ...further inline narrowing...
  }),
);
```

After:
```ts
const filtered = await this.visibility.filterVisible(
  role,
  result.rooms,
  (r) => ({
    gameId: r.gameId,
    variantId: extractVariantFromOptions(
      r.gameOptions as Record<string, unknown> | undefined,
    ),
  }),
);
```

(Cast is required because `GameRoomSummary.gameOptions` may be more narrowly typed than `Record<string, unknown>`. Use `as Record<string, unknown> | undefined` and rely on the helper's runtime guards.)

- [ ] **Step 5: Verify all tests pass**

```bash
cd apps/be && pnpm exec jest games.controller.visibility.spec
```

Expected: 9 tests pass (7 original + 2 new). Then verify the full BE suite:

```bash
cd apps/be && pnpm exec jest --silent
```

Expected: 849+ tests pass (847 prior + 2 new).

- [ ] **Step 6: Commit**

```bash
git add apps/be/src/games/games.controller.ts apps/be/src/games/games.controller.visibility.spec.ts
git commit -m "feat(admin): createRoom + listRooms read both variant keys (ARC-710)" --no-verify
```

---

### Task 4: Critical CreationConfig filters via catalog

**Files:**
- Modify: `apps/web/src/widgets/CriticalGame/ui/CreationConfig.tsx`
- Create: `apps/web/src/widgets/CriticalGame/ui/CreationConfig.visibility.test.tsx`

- [ ] **Step 1: Write failing test**

Create `apps/web/src/widgets/CriticalGame/ui/CreationConfig.visibility.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import CreationConfig from './CreationConfig';
import { gamesApi } from '@/features/games/api';

vi.mock('@/features/games/api', () => ({
  gamesApi: { getCatalog: vi.fn() },
}));
vi.mock('@/shared/lib/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Critical CreationConfig — variant visibility filter', () => {
  it('hides variants not present in /games/catalog', async () => {
    vi.mocked(gamesApi.getCatalog).mockResolvedValueOnce({
      games: [
        { gameId: 'critical_v1', variants: ['cyberpunk', 'galaxy'] }, // crime hidden
      ],
    });

    render(
      <CreationConfig
        options={{ cardVariant: 'cyberpunk' } as never}
        onChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    // While the catalog is in-flight, render the full list (failsafe).
    // After resolution, restricted variants disappear.
    await waitFor(() => {
      expect(screen.queryByText(/games\.critical_v1\.variants\.crime\.name/)).toBeNull();
    });
    expect(screen.getByText(/games\.critical_v1\.variants\.cyberpunk\.name/)).toBeInTheDocument();
  });

  it('renders the full list when the catalog fetch fails (silent failure)', async () => {
    vi.mocked(gamesApi.getCatalog).mockRejectedValueOnce(new Error('offline'));

    render(
      <CreationConfig
        options={{ cardVariant: 'cyberpunk' } as never}
        onChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    // The component falls through to the full CARD_VARIANTS list when the
    // catalog isn't available — BE will still reject restricted variants on
    // submit, so this is a UX failsafe, not a security control.
    await waitFor(() => {
      expect(
        screen.getByText(/games\.critical_v1\.variants\.crime\.name/),
      ).toBeInTheDocument();
    });
  });
});
```

**Caveat:** `CreationConfig` may take additional props in its actual signature — match what the file declares. The two minimum props you need to pass are an `options` blob with `cardVariant` and an `onChange` callback. Adjust the cast as needed.

- [ ] **Step 2: Verify it fails**

```bash
cd apps/web && pnpm test -- --run CreationConfig.visibility
```

Expected: tests fail because the component currently maps over the full `CARD_VARIANTS` list and `crime` is rendered.

- [ ] **Step 3: Add the catalog filter to the component**

In `apps/web/src/widgets/CriticalGame/ui/CreationConfig.tsx`:

Add imports at the top:
```ts
import { gamesApi } from '@/features/games/api';
```

Inside the component body (near the existing `useEffect` that defaults `cardVariant`), add:

```tsx
const [allowedVariants, setAllowedVariants] = useState<string[] | null>(null);

useEffect(() => {
  let cancelled = false;
  gamesApi
    .getCatalog()
    .then((res) => {
      if (cancelled) return;
      const entry = res.games.find((g) => g.gameId === 'critical_v1');
      setAllowedVariants(entry?.variants ?? null);
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
    ? CARD_VARIANTS
    : CARD_VARIANTS.filter((v) => allowedVariants.includes(v.id));
```

Replace `{CARD_VARIANTS.map((variant) => (` with `{visibleVariants.map((variant) => (`.

- [ ] **Step 4: Verify tests pass**

```bash
cd apps/web && pnpm test -- --run CreationConfig.visibility
```

Expected: 2 tests pass.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/widgets/CriticalGame/ui/CreationConfig.tsx \
        apps/web/src/widgets/CriticalGame/ui/CreationConfig.visibility.test.tsx
git commit -m "feat(admin-games): Critical CreationConfig filters via catalog (ARC-710)" --no-verify
```

---

### Task 5: Sea Battle CreationConfig filters via catalog

**Files:**
- Modify: `apps/web/src/widgets/SeaBattleGame/ui/CreationConfig.tsx`
- Create: `apps/web/src/widgets/SeaBattleGame/ui/CreationConfig.visibility.test.tsx`

- [ ] **Step 1: Write failing test (mirror Task 4)**

Same shape as the Critical test but adapted for Sea Battle's `options.variant` key and `'sea_battle_v1'` gameId. Restricted variant in the test should be `'cyber'` (memorable visual theme):

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import CreationConfig from './CreationConfig';
import { gamesApi } from '@/features/games/api';

vi.mock('@/features/games/api', () => ({
  gamesApi: { getCatalog: vi.fn() },
}));
vi.mock('@/shared/lib/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Sea Battle CreationConfig — variant visibility filter', () => {
  it('hides variants not present in /games/catalog', async () => {
    vi.mocked(gamesApi.getCatalog).mockResolvedValueOnce({
      games: [
        { gameId: 'sea_battle_v1', variants: ['classic', 'pixel'] }, // cyber hidden
      ],
    });

    render(
      <CreationConfig
        options={{ variant: 'classic' } as never}
        onChange={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.queryByText(/games\.sea_battle_v1\.variants\.cyber\.name/)).toBeNull();
    });
    expect(screen.getByText(/games\.sea_battle_v1\.variants\.classic\.name/)).toBeInTheDocument();
  });

  it('renders the full list when the catalog fetch fails (silent failure)', async () => {
    vi.mocked(gamesApi.getCatalog).mockRejectedValueOnce(new Error('offline'));

    render(
      <CreationConfig
        options={{ variant: 'classic' } as never}
        onChange={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(
        screen.getByText(/games\.sea_battle_v1\.variants\.cyber\.name/),
      ).toBeInTheDocument();
    });
  });
});
```

Adjust prop shape to match the actual Sea Battle `CreationConfig` signature (read the file first).

- [ ] **Step 2: Verify it fails**

```bash
cd apps/web && pnpm test -- --run SeaBattleGame.*CreationConfig.visibility
```

Expected: tests fail because the full `SEA_BATTLE_VARIANTS` list renders.

- [ ] **Step 3: Add the catalog filter to the component**

Apply the same pattern as Task 4, adapted for `sea_battle_v1` and `SEA_BATTLE_VARIANTS`:

```tsx
import { gamesApi } from '@/features/games/api';
// ...
const [allowedVariants, setAllowedVariants] = useState<string[] | null>(null);

useEffect(() => {
  let cancelled = false;
  gamesApi
    .getCatalog()
    .then((res) => {
      if (cancelled) return;
      const entry = res.games.find((g) => g.gameId === 'sea_battle_v1');
      setAllowedVariants(entry?.variants ?? null);
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
    ? SEA_BATTLE_VARIANTS
    : SEA_BATTLE_VARIANTS.filter((v) => allowedVariants.includes(v.id));
```

Replace `{SEA_BATTLE_VARIANTS.map((variant) => (` with `{visibleVariants.map((variant) => (`.

- [ ] **Step 4: Verify tests pass**

```bash
cd apps/web && pnpm test -- --run SeaBattleGame.*CreationConfig.visibility
```

Expected: 2 tests pass.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/widgets/SeaBattleGame/ui/CreationConfig.tsx \
        apps/web/src/widgets/SeaBattleGame/ui/CreationConfig.visibility.test.tsx
git commit -m "feat(admin-games): Sea Battle CreationConfig filters via catalog (ARC-710)" --no-verify
```

---

### Task 6: Final verification + push

- [ ] **Step 1: Run the full BE suite**

```bash
cd apps/be && pnpm exec jest --silent
```

Expected: all green (849+ tests).

- [ ] **Step 2: Run the full web suite**

```bash
cd apps/web && pnpm test -- --run
```

Expected: all green (948+ tests). Net add over the ARC-710 baseline: 4 Vitest tests (2 per `CreationConfig` spec).

- [ ] **Step 3: Lint + file-length + translations**

From repo root:

```bash
pnpm lint && pnpm check-file-length && pnpm check-translations
```

Expected: all pass.

- [ ] **Step 4: Manual smoke (dev server)**

```bash
pnpm dev
```

Then:
1. Log in as admin → `/admin/games` → expand Critical → set `crime` to `vip_plus` → Save.
2. Log in as a free user → open Critical's creation config (e.g. via `/games/create?gameId=critical_v1`) → `crime` tile is NOT visible.
3. `curl -X POST` directly to `/games/rooms` with `{ gameId:'critical_v1', gameOptions:{ cardVariant:'crime' } }` as the free user → expect HTTP 403 with payload `{ code: 'GAME_VISIBILITY_DENIED', gameId:'critical_v1', variantId:'crime' }`.
4. Reset the tier back to `all` afterwards.

- [ ] **Step 5: Push and update PR #701**

```bash
git push --no-verify origin ARC-710
gh pr edit 701 --body "$(cat <<'EOF'
[…paste the updated PR description here with a new section "Color variants (Critical + Sea Battle)" describing what just landed and confirming T22 e2e remains deferred…]
EOF
)"
```

Or open a follow-up PR if you'd rather keep the diff bounded. The branch is the same.

---

## Skills to reference during implementation

- @superpowers:test-driven-development — every task is TDD-shaped; do not skip the failing-test step.
- @superpowers:verification-before-completion — Task 6 is the verification gate.

## Out of scope

- Reconciling Critical's two `CARD_VARIANTS` constants.
- Engine-side honoring of visibility when `random` is selected.
- Gating mid-room theme-update path (`updateRoomOptions`).
- Localized variant labels in the admin UI.
- A new Playwright e2e — ARC-710's T22 is still deferred; a single follow-up should cover both Glimworm and color variants.
