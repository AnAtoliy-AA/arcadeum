# Critical Active Game View Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current Active Game View of the Critical widget with an immersive neon/glow/depth scene that (a) makes turn state impossible to miss, (b) drives variant theming into cards, HUD, and background, and (c) reads as polished at both desktop and mobile web widths — without changing any game logic, socket flow, or engine behavior.

**Architecture:** A new scene-palette system extends the existing `VariantStyleConfig` with a `scene` sub-config. Each variant exports a `VariantScenePalette`. The palette is resolved once in `ActiveGameView` and provided to descendants through a new `ScenePaletteProvider` React context. Backdrop layers (grid floor, horizon, backlight, scanlines, vignette, particles) are pure-CSS Tamagui styled components composed inside a new `SceneBackdrop`. A new `TurnBanner` replaces the turn label. A new `MobileActionSheet` renders at `$sm` in place of the targeted-attack / favor modals. The full-spec source of truth is [docs/specs/2026-04-19-critical-active-game-redesign-design.md](../specs/2026-04-19-critical-active-game-redesign-design.md).

**Tech Stack:** Next.js 14 (`apps/web`), React 18, Tamagui, Zustand (unchanged), Vitest + `@testing-library/react` (unit), Playwright (e2e), TypeScript strict. No new runtime dependencies.

---

## File Structure

### New files

- `apps/web/src/widgets/CriticalGame/ui/styles/variants/types.ts` — extend with `VariantScenePalette` interface and add `scene` to `VariantStyleConfig`.
- `apps/web/src/widgets/CriticalGame/ui/styles/scene.tsx` — `SceneShell`, `SceneGridFloor`, `SceneHorizon`, `SceneBacklight`, `SceneScanlines`, `SceneVignette`, `SceneParticles` Tamagui styled components.
- `apps/web/src/widgets/CriticalGame/ui/SceneBackdrop.tsx` — lightweight React component that composes the six backdrop layers given a palette.
- `apps/web/src/widgets/CriticalGame/ui/ScenePaletteContext.tsx` — `ScenePaletteProvider` + `useScenePalette()` hook.
- `apps/web/src/widgets/CriticalGame/ui/TurnBanner.tsx` — gradient-border pulsing turn pill (replaces the in-game turn label).
- `apps/web/src/widgets/CriticalGame/ui/MobileActionSheet.tsx` — bottom-sheet target picker for mobile.
- `apps/web/src/widgets/CriticalGame/lib/cardRoles.ts` — `getCardRole(card)` role helper (attack | defuse | skip | nope | favor | see | combo | special).
- Unit tests (new):
  - `apps/web/src/widgets/CriticalGame/ui/SceneBackdrop.test.tsx`
  - `apps/web/src/widgets/CriticalGame/ui/TurnBanner.test.tsx`
  - `apps/web/src/widgets/CriticalGame/ui/MobileActionSheet.test.tsx`
  - `apps/web/src/widgets/CriticalGame/ui/styles/variants/scene-resolution.test.ts`
  - `apps/web/src/widgets/CriticalGame/lib/cardRoles.test.ts`
  - `apps/web/src/widgets/CriticalGame/ui/ScenePaletteContext.test.tsx`

### Modified files (styles & variants)

- `apps/web/src/widgets/CriticalGame/ui/styles/variants/base.ts` — add default `scene` palette.
- `apps/web/src/widgets/CriticalGame/ui/styles/variants/cyberpunk/*` — add `scene` export.
- `apps/web/src/widgets/CriticalGame/ui/styles/variants/underwater/*` — add `scene` export.
- `apps/web/src/widgets/CriticalGame/ui/styles/variants/crime/*` — add `scene` export.
- `apps/web/src/widgets/CriticalGame/ui/styles/variants/horror/*` — add `scene` export.
- `apps/web/src/widgets/CriticalGame/ui/styles/variants/adventure/*` — add `scene` export.
- `apps/web/src/widgets/CriticalGame/ui/styles/variants/high-altitude-hike.ts` — add `scene` export.
- `apps/web/src/widgets/CriticalGame/ui/styles/variants/index.ts` — ensure `getVariantStyles` spreads `scene` from each variant onto `base`.
- `apps/web/src/widgets/CriticalGame/ui/styles/layout.tsx` — become the scene shell host; retire the old `getBackgroundEffects` `::before/::after` ambient layer (moves into `SceneBackdrop`).
- `apps/web/src/widgets/CriticalGame/ui/styles/header.tsx` — new HUD look (logo chip, turn pill slot).
- `apps/web/src/widgets/CriticalGame/ui/styles/table.tsx` + `table-widgets.tsx` + `table-decorations.tsx` + `table-info.tsx` — restyle for center-stack layout (deck 74×102, last-played 92×126, discard 74×102).
- `apps/web/src/widgets/CriticalGame/ui/styles/cards.tsx` + `cards-base.tsx` + `card-decorations.tsx` + `card-image.tsx` — update gradient/glow to use scene palette.
- `apps/web/src/widgets/CriticalGame/ui/styles/players-hand.tsx` — fanned layout desktop / flat strip mobile.
- `apps/web/src/widgets/CriticalGame/ui/styles/players.tsx` + `player-widgets.tsx` — 58/68px avatar, magenta ring + halo.

### Modified files (components)

- `apps/web/src/widgets/CriticalGame/ui/ActiveGameView.tsx` — resolve `scenePalette` via `useMemo(getVariantStyles(cardVariant).scene, [cardVariant])`, wrap children in `<ScenePaletteProvider>`, mount `<SceneBackdrop>` and `<TurnBanner>`, render `<MobileActionSheet>` at `$sm`.
- `apps/web/src/widgets/CriticalGame/ui/CriticalGameHeader.tsx` — remove inline turn label (moved to TurnBanner); keep other HUD slots.
- `apps/web/src/widgets/CriticalGame/ui/ActiveGameContent.tsx` — unchanged structurally; rely on restyled styled components.
- `apps/web/src/widgets/CriticalGame/ui/DeckDisplay.tsx` + `CenterTableSection.tsx` + `LastPlayedCardDisplay.tsx` + `GameTableSection.tsx` — read palette via `useScenePalette()`; drop prop-drilled variant-only styling where redundant.
- `apps/web/src/widgets/CriticalGame/ui/TablePlayer.tsx` + `TableStats.tsx` — read palette via `useScenePalette()`.
- `apps/web/src/widgets/CriticalGame/ui/PlayerHand.tsx` — apply fanned vs flat via Tamagui `$sm`; card gradient from `palette.handColorByRole[role]`.
- `apps/web/src/widgets/CriticalGame/ui/ActionsSection.tsx` — split you + actions (desktop) vs you-strip (mobile).
- `apps/web/src/widgets/CriticalGame/ui/GameStatusMessage.tsx` + `ChatBubble.tsx` — log-pill style.

### Deleted files

- `apps/web/src/widgets/CriticalGame/ui/ParticleOverlay.tsx`
- `apps/web/src/widgets/CriticalGame/ui/ParticleOverlay.module.css`

### e2e (extend)

- `apps/web/e2e/critical-card-visibility.spec.ts`, `critical-mobile-table.spec.ts`, `critical-single-player.spec.ts`, `critical-variants.spec.ts` — add existence selectors for `data-testid="scene-backdrop"`, `"turn-banner"`, `"mobile-action-sheet"`; no behavioral changes.

---

## Conventions

- **Never use `any`** (per `CLAUDE.md`) — palette consumers type through `VariantScenePalette`.
- **500-line per file limit** — if any modified file approaches the limit, split off sub-components (e.g., `players-hand.tsx` → `players-hand-desktop.tsx` + `players-hand-mobile.tsx`).
- **i18n** — the only new strings are for `MobileActionSheet` ("Select target", "Cancel", "Play", "Attack", "Ask for favor") and possibly `TurnBanner` ("{name}'s turn"). All keys added in `en`, `ru`, `es`, `fr`, `by`. Messages live in [apps/web/src/shared/i18n/messages/games/critical/](../../apps/web/src/shared/i18n/messages/games/critical/) (files `en.ts`, `ru.ts`, `es.ts`, `fr.ts`, `by.ts`). **Reuse the existing key `games.table.players.yourTurn`** (present at `critical/en.ts:226`) for TurnBanner's "YOUR MOVE" label — uppercase is a presentation concern done with `textTransform: 'uppercase'`, not a separate key. Only add a new key when no existing one fits.
- **data-testid stability** — every existing `data-testid` on a styled component must be preserved. Before the first markup-touching edit (Task 10), run:

  ```bash
  grep -rn "data-testid" apps/web/src/widgets/CriticalGame/ui/ > /tmp/critical-testids-before.txt
  grep -rn "data-testid" apps/web/e2e/critical-*.spec.ts > /tmp/critical-e2e-testids.txt
  ```

  Keep the first file as a baseline; after the restyle, the set of testids in UI must be a **superset** of the set consumed by e2e (it is fine to add new ones, not fine to remove ones that e2e reads).

- **Tamagui `useMedia` is available in this repo** — confirmed used in [apps/web/src/widgets/CriticalGame/ui/TablePlayer.tsx](../../apps/web/src/widgets/CriticalGame/ui/TablePlayer.tsx). The `useSyncExternalStore` fallback mentioned in the spec is not needed; use `useMedia().sm` throughout.
- **Tamagui media** — use `useMedia().sm` (Tamagui's reactive media hook) for `MobileActionSheet` gating. If `useMedia` is unavailable in the Tamagui version in the repo, fall back to `useSyncExternalStore` + `window.matchMedia('(max-width: 660px)')`. A one-shot `.matches` read at render is **not acceptable** (see spec Responsive behavior).
- **Commits** — conventional commits with scope `ARC-480` (current branch). Example: `feat(ARC-480): add scene palette types`.
- **TDD** — every task writes the failing test first, confirms the failure message, then the minimal implementation, then watches it pass, then commits.

---

### Task 1: Scene palette types

**Goal:** Extend `VariantStyleConfig` with a `scene: VariantScenePalette` sub-object and export the interface.

**Files:**

- Modify: [apps/web/src/widgets/CriticalGame/ui/styles/variants/types.ts](../../apps/web/src/widgets/CriticalGame/ui/styles/variants/types.ts)

- [ ] **Step 1: Add the `VariantScenePalette` interface and extend `VariantStyleConfig`**

At the bottom of `types.ts`, add:

```ts
export interface VariantScenePalette {
  // Background scene
  sceneBgGradient: string;
  gridLineColorA: string;
  gridLineColorB: string;
  horizonGradient: string;
  backlightColor: string;
  vignetteColor: string;
  particleColors: string[];

  // Turn banner
  turnBannerBorderGradient: string;
  turnBannerDotColor: string;
  turnBannerShadow: string;

  // Player (opponents + you)
  opponentTurnRingColor: string;
  opponentTurnHaloColor: string;
  youAvatarGradient: string;

  // Table cards
  deckGradient: string;
  deckGlow: string;
  discardGradient: string;
  discardGlow: string;
  lastPlayedGradient: string;
  lastPlayedHaloColor: string;

  // Hand card gradients by role
  handColorByRole: {
    attack: string;
    defuse: string;
    skip: string;
    nope: string;
    favor: string;
    see: string;
    combo: string;
    special: string;
    [k: string]: string;
  };
}
```

Then add a new field to `VariantStyleConfig` (keep existing fields in place):

```ts
export interface VariantStyleConfig {
  layout: { /* existing */ };
  // ... (existing fields unchanged)
  scene: VariantScenePalette;
}
```

- [ ] **Step 2: Verify the type compiles**

Run: `pnpm --filter @arcadeum/web typecheck` (from repo root).
Expected: fails in `base.ts` and the six variant files because `scene` is now required — this is expected and drives Task 2.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/widgets/CriticalGame/ui/styles/variants/types.ts
git commit -m "feat(ARC-480): add VariantScenePalette type (scene palette skeleton)"
```

---

### Task 2: Base scene palette + scene-resolution unit test

**Goal:** Give `baseVariantStyles` a default `scene` palette so `getVariantStyles(undefined).scene` returns sensible cyberpunk-ish values; lock behavior via a unit test.

**Files:**

- Create: `apps/web/src/widgets/CriticalGame/ui/styles/variants/scene-resolution.test.ts`
- Modify: `apps/web/src/widgets/CriticalGame/ui/styles/variants/base.ts`

- [ ] **Step 1: Write the failing test**

Create `apps/web/src/widgets/CriticalGame/ui/styles/variants/scene-resolution.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { getVariantStyles } from './index';

describe('getVariantStyles — scene palette', () => {
  it('returns the base scene palette when variant is undefined', () => {
    const { scene } = getVariantStyles(undefined);
    expect(scene).toBeDefined();
    expect(scene.sceneBgGradient).toContain('radial-gradient');
    expect(scene.gridLineColorA).toMatch(/^rgba?\(/);
    expect(scene.handColorByRole.special).toBeTruthy();
  });

  it('falls back to base palette for unknown variants', () => {
    const { scene } = getVariantStyles('not-a-real-variant');
    expect(scene.sceneBgGradient).toEqual(
      getVariantStyles(undefined).scene.sceneBgGradient,
    );
  });
});
```

- [ ] **Step 2: Run the test — expect fail**

Run: `pnpm --filter @arcadeum/web test -- scene-resolution`
Expected: **FAIL** — `scene is undefined` (or TypeScript compile error if `tsc` runs in the test).

- [ ] **Step 3: Add the base scene palette**

In `apps/web/src/widgets/CriticalGame/ui/styles/variants/base.ts`, append a `scene` property to `baseVariantStyles`:

```ts
scene: {
  sceneBgGradient:
    'radial-gradient(circle at 50% 20%, rgba(120, 0, 220, 0.18) 0%, rgba(15, 5, 24, 1) 45%, rgba(0, 0, 0, 1) 100%)',
  gridLineColorA: 'rgba(168, 85, 247, 0.28)',
  gridLineColorB: 'rgba(236, 72, 153, 0.18)',
  horizonGradient:
    'linear-gradient(90deg, transparent 0%, rgba(168, 85, 247, 0.9) 25%, rgba(236, 72, 153, 0.9) 75%, transparent 100%)',
  backlightColor: 'rgba(168, 85, 247, 0.32)',
  vignetteColor: 'rgba(0, 0, 0, 0.75)',
  particleColors: [
    'rgba(236, 72, 153, 0.85)',
    'rgba(168, 85, 247, 0.75)',
    'rgba(99, 102, 241, 0.6)',
  ],
  turnBannerBorderGradient:
    'linear-gradient(90deg, rgba(168, 85, 247, 1), rgba(236, 72, 153, 1))',
  turnBannerDotColor: 'rgba(236, 72, 153, 1)',
  turnBannerShadow:
    '0 0 24px rgba(168, 85, 247, 0.6), 0 0 48px rgba(236, 72, 153, 0.35)',
  opponentTurnRingColor: 'rgba(236, 72, 153, 1)',
  opponentTurnHaloColor: 'rgba(236, 72, 153, 0.35)',
  youAvatarGradient:
    'linear-gradient(135deg, #f5c56a 0%, #c4902f 100%)',
  deckGradient:
    'linear-gradient(160deg, rgba(30, 15, 55, 1) 0%, rgba(12, 5, 22, 1) 100%)',
  deckGlow:
    '0 6px 20px rgba(168, 85, 247, 0.35), inset 0 0 12px rgba(236, 72, 153, 0.25)',
  discardGradient:
    'linear-gradient(160deg, rgba(13, 52, 64, 1) 0%, rgba(5, 22, 30, 1) 100%)',
  discardGlow:
    '0 6px 20px rgba(20, 184, 166, 0.35), inset 0 0 12px rgba(56, 189, 248, 0.2)',
  lastPlayedGradient:
    'linear-gradient(160deg, rgba(236, 72, 153, 1) 0%, rgba(168, 85, 247, 1) 55%, rgba(99, 102, 241, 1) 100%)',
  lastPlayedHaloColor: 'rgba(245, 197, 106, 0.5)',
  handColorByRole: {
    attack:
      'linear-gradient(160deg, rgba(236, 72, 153, 1) 0%, rgba(139, 28, 98, 1) 100%)',
    defuse:
      'linear-gradient(160deg, rgba(34, 197, 94, 1) 0%, rgba(6, 95, 70, 1) 100%)',
    skip:
      'linear-gradient(160deg, rgba(239, 68, 68, 1) 0%, rgba(127, 29, 29, 1) 100%)',
    nope:
      'linear-gradient(160deg, rgba(100, 116, 139, 1) 0%, rgba(30, 41, 59, 1) 100%)',
    favor:
      'linear-gradient(160deg, rgba(249, 115, 22, 1) 0%, rgba(154, 52, 18, 1) 100%)',
    see:
      'linear-gradient(160deg, rgba(56, 189, 248, 1) 0%, rgba(12, 74, 110, 1) 100%)',
    combo:
      'linear-gradient(160deg, rgba(168, 85, 247, 1) 0%, rgba(76, 29, 149, 1) 100%)',
    special:
      'linear-gradient(160deg, rgba(245, 197, 106, 1) 0%, rgba(146, 96, 20, 1) 100%)',
  },
},
```

- [ ] **Step 4: Run the test — expect pass**

Run: `pnpm --filter @arcadeum/web test -- scene-resolution`
Expected: **PASS**.

- [ ] **Step 5: Run `tsc`**

Run: `pnpm --filter @arcadeum/web typecheck`
Expected: compile errors remain in the six variant files (they still lack `scene`). This is expected — Task 3 handles it.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/widgets/CriticalGame/ui/styles/variants/base.ts \
        apps/web/src/widgets/CriticalGame/ui/styles/variants/scene-resolution.test.ts
git commit -m "feat(ARC-480): add base scene palette + resolution test"
```

---

### Task 3: Per-variant scene palettes

**Goal:** Each of the six variants (`cyberpunk`, `underwater`, `crime`, `horror`, `adventure`, `high-altitude-hike`) exports a `scene` that overrides base colors with its signature hues. Restore `tsc` to green.

**Files:**

- Modify: `apps/web/src/widgets/CriticalGame/ui/styles/variants/cyberpunk/index.ts` (or the variant's main export)
- Modify: `apps/web/src/widgets/CriticalGame/ui/styles/variants/underwater/index.ts`
- Modify: `apps/web/src/widgets/CriticalGame/ui/styles/variants/crime/index.ts`
- Modify: `apps/web/src/widgets/CriticalGame/ui/styles/variants/horror/index.ts`
- Modify: `apps/web/src/widgets/CriticalGame/ui/styles/variants/adventure/index.ts`
- Modify: `apps/web/src/widgets/CriticalGame/ui/styles/variants/high-altitude-hike.ts`
- Modify: `apps/web/src/widgets/CriticalGame/ui/styles/variants/index.ts`

- [ ] **Step 1: Extend `scene-resolution.test.ts` with per-variant assertions**

Add to the existing file:

```ts
import { GAME_VARIANT } from '../../../lib/constants';

describe('getVariantStyles — per-variant scene palette', () => {
  const variants = [
    GAME_VARIANT.CYBERPUNK,
    GAME_VARIANT.UNDERWATER,
    GAME_VARIANT.CRIME,
    GAME_VARIANT.HORROR,
    GAME_VARIANT.ADVENTURE,
    GAME_VARIANT.HIGH_ALTITUDE_HIKE,
  ];

  it.each(variants)('%s has a scene palette distinct from base', (variant) => {
    const { scene: baseScene } = getVariantStyles(undefined);
    const { scene } = getVariantStyles(variant);
    expect(scene).toBeDefined();
    expect(scene.sceneBgGradient).not.toEqual(baseScene.sceneBgGradient);
    // Each required handColorByRole slot is present
    (
      ['attack', 'defuse', 'skip', 'nope', 'favor', 'see', 'combo', 'special'] as const
    ).forEach((role) => {
      expect(scene.handColorByRole[role]).toBeTruthy();
    });
  });
});
```

Run: `pnpm --filter @arcadeum/web test -- scene-resolution` — **expect FAIL** (6 variants lacking).

- [ ] **Step 2: Add `scene` to each variant file**

For each variant, add a `scene: VariantScenePalette` object to its exported `*VariantStyles` using the variant's primary & accent from `VARIANT_COLORS` in [apps/web/src/widgets/CriticalGame/ui/styles/variant-palette.ts](../../apps/web/src/widgets/CriticalGame/ui/styles/variant-palette.ts). Do not copy-paste the full base palette — use spread + overrides:

```ts
import { baseVariantStyles } from '../base';

export const cyberpunkVariantStyles = {
  // ...existing fields
  scene: {
    ...baseVariantStyles.scene,
    sceneBgGradient:
      'radial-gradient(circle at 50% 20%, rgba(121, 40, 202, 0.24) 0%, rgba(10, 5, 30, 1) 45%, rgba(0, 0, 0, 1) 100%)',
    gridLineColorA: 'rgba(255, 0, 128, 0.28)',
    gridLineColorB: 'rgba(0, 223, 216, 0.18)',
    horizonGradient:
      'linear-gradient(90deg, transparent 0%, rgba(255, 0, 128, 0.9) 25%, rgba(121, 40, 202, 0.9) 75%, transparent 100%)',
    backlightColor: 'rgba(255, 0, 128, 0.32)',
    particleColors: [
      'rgba(255, 0, 128, 0.85)',
      'rgba(121, 40, 202, 0.75)',
      'rgba(0, 223, 216, 0.6)',
    ],
    turnBannerBorderGradient:
      'linear-gradient(90deg, rgba(255, 0, 128, 1), rgba(121, 40, 202, 1))',
    turnBannerDotColor: 'rgba(255, 0, 128, 1)',
    // leave the rest to base
  },
};
```

Repeat for the other five variants, each swapping hues to its `VARIANT_COLORS` signature:

- `underwater` — cyan/teal `#007CF0` / `#00DFD8`
- `crime` — amber/yellow `#F5A623` / `#F8E71C`
- `horror` — violet/magenta `#7928CA` / `#FF0080`
- `adventure` — grey/red `#4F566B` / `#FF4D4D`
- `high-altitude-hike` — sky/navy `#7dd3fc` / `#1e3a8a`

- [ ] **Step 3: Update `variants/index.ts`**

Verify spreading still works — `{ ...baseVariantStyles, ...cyberpunkVariantStyles }` already merges `scene` wholesale, so no code change is usually required. But add a regression line at the end of the file for explicit clarity:

```ts
// Invariant: every returned config has a fully-populated `scene` palette,
// because variants use `...baseVariantStyles.scene` as their starting point.
```

- [ ] **Step 4: Run tests — expect pass**

Run: `pnpm --filter @arcadeum/web test -- scene-resolution`
Expected: **PASS**.

Run: `pnpm --filter @arcadeum/web typecheck`
Expected: clean.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/widgets/CriticalGame/ui/styles/variants/
git commit -m "feat(ARC-480): add per-variant scene palettes"
```

---

### Task 4: Card role helper

**Goal:** Given a `CriticalCard`, return one of `'attack' | 'defuse' | 'skip' | 'nope' | 'favor' | 'see' | 'combo' | 'special'`. This key is used by `PlayerHand` to pick the gradient from `palette.handColorByRole`.

**Files:**

- Create: `apps/web/src/widgets/CriticalGame/lib/cardRoles.ts`
- Create: `apps/web/src/widgets/CriticalGame/lib/cardRoles.test.ts`

- [ ] **Step 1: Enumerate every card from `ALL_GAME_CARDS`**

Open [apps/web/src/widgets/CriticalGame/types/index.ts](../../apps/web/src/widgets/CriticalGame/types/index.ts) and find the `ALL_GAME_CARDS` export (≈ line 90). Expand it via the pack constants in [apps/web/src/widgets/CriticalGame/lib/constants/cards.ts](../../apps/web/src/widgets/CriticalGame/lib/constants/cards.ts). The authoritative list (at time of writing) includes:

- `SPECIAL_CARDS`: `critical_event`, `neutralizer`
- `BASE_ACTION_CARDS`: `strike`, `evade`, `trade`, `reorder`, `insight`, `cancel`
- `COMBO_CARDS`: `collection_alpha/beta/gamma/delta/epsilon`
- `ATTACK_PACK_CARDS`: `targeted_strike`, `private_strike`, `recursive_strike`, `mega_evade`, `invert`
- `FUTURE_PACK_CARDS`: `see_future_5x`, `alter_future_3x`, `alter_future_5x`, `reveal_future_3x`, `share_future_3x`, `draw_bottom`, `swap_top_bottom`, `bury`
- `THEFT_PACK_CARDS`: `wildcard`, `mark`, `steal_draw`, `stash`
- `CHAOS_PACK_CARDS`: `critical_implosion`, `containment_field`, `fission`, `tribute`, `blackout`
- `DEITY_PACK_CARDS`: `omniscience`, `miracle`, `smite`, `rapture`

Every card in this list must have an explicit mapping. Cards lacking a visual-family intent fall to `'special'` **by design**, not by accident.

- [ ] **Step 2: Write the failing test**

Create `apps/web/src/widgets/CriticalGame/lib/cardRoles.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { ALL_GAME_CARDS } from '../types';
import { getCardRole } from './cardRoles';

describe('getCardRole', () => {
  it.each([
    // attack family
    ['strike', 'attack'],
    ['targeted_strike', 'attack'],
    ['private_strike', 'attack'],
    ['recursive_strike', 'attack'],
    ['smite', 'attack'],
    ['mark', 'attack'],
    ['fission', 'attack'],
    // defuse
    ['neutralizer', 'defuse'],
    ['containment_field', 'defuse'],
    // skip
    ['evade', 'skip'],
    ['mega_evade', 'skip'],
    // nope / cancel
    ['cancel', 'nope'],
    // favor / trade
    ['trade', 'favor'],
    ['tribute', 'favor'],
    ['steal_draw', 'favor'],
    // see / future pack
    ['insight', 'see'],
    ['see_future_5x', 'see'],
    ['reveal_future_3x', 'see'],
    ['share_future_3x', 'see'],
    ['alter_future_3x', 'see'],
    ['alter_future_5x', 'see'],
    ['reorder', 'see'],
    ['draw_bottom', 'see'],
    ['swap_top_bottom', 'see'],
    ['bury', 'see'],
    ['invert', 'see'],
    // combo (collection + wildcard + stash are composite-play)
    ['collection_alpha', 'combo'],
    ['collection_beta', 'combo'],
    ['collection_gamma', 'combo'],
    ['collection_delta', 'combo'],
    ['collection_epsilon', 'combo'],
    ['wildcard', 'combo'],
    ['stash', 'combo'],
    // special (signature / deity / chaos-resolution)
    ['critical_event', 'special'],
    ['omniscience', 'special'],
    ['miracle', 'special'],
    ['rapture', 'special'],
    ['critical_implosion', 'special'],
    ['blackout', 'special'],
  ] as const)('%s → %s', (card, expected) => {
    expect(getCardRole(card)).toBe(expected);
  });

  it('maps every card in ALL_GAME_CARDS explicitly (no silent fallback)', () => {
    for (const card of ALL_GAME_CARDS) {
      expect(getCardRole(card)).toMatch(
        /^(attack|defuse|skip|nope|favor|see|combo|special)$/,
      );
    }
    // Extra guard: every card must have an explicit entry in ROLE_BY_CARD
    // (fallback to 'special' is only for engine-future cards not yet added to types)
    const unexpectedFallbacks = ALL_GAME_CARDS.filter(
      (c) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        !((getCardRole as any).__rolesByCard ?? {})[c],
    );
    // If this triggers, an engine-known card is relying on the fallback —
    // the test author should decide its intended role and add it to ROLE_BY_CARD.
    expect(unexpectedFallbacks).toEqual([]);
  });

  it('falls back to special for cards unknown to the engine', () => {
    expect(getCardRole('totally_unknown_card' as never)).toBe('special');
  });
});
```

Run: `pnpm --filter @arcadeum/web test -- cardRoles` — **expect FAIL** (file not found).

- [ ] **Step 3: Implement `getCardRole`**

Create `apps/web/src/widgets/CriticalGame/lib/cardRoles.ts`:

```ts
import type { CriticalCard } from '../types';

export type CardRole =
  | 'attack'
  | 'defuse'
  | 'skip'
  | 'nope'
  | 'favor'
  | 'see'
  | 'combo'
  | 'special';

const ROLE_BY_CARD: Partial<Record<string, CardRole>> = {
  // attack family (directly damages / targets another player)
  strike: 'attack',
  targeted_strike: 'attack',
  private_strike: 'attack',
  recursive_strike: 'attack',
  smite: 'attack',
  mark: 'attack',
  fission: 'attack',
  // defuse / protection
  neutralizer: 'defuse',
  containment_field: 'defuse',
  // skip / dodge
  evade: 'skip',
  mega_evade: 'skip',
  // nope
  cancel: 'nope',
  // favor / transactional / theft
  trade: 'favor',
  tribute: 'favor',
  steal_draw: 'favor',
  // see / deck-manipulation (insight-family)
  insight: 'see',
  see_future_5x: 'see',
  reveal_future_3x: 'see',
  share_future_3x: 'see',
  alter_future_3x: 'see',
  alter_future_5x: 'see',
  reorder: 'see',
  draw_bottom: 'see',
  swap_top_bottom: 'see',
  bury: 'see',
  invert: 'see',
  // combo (collection + wildcard + stash)
  collection_alpha: 'combo',
  collection_beta: 'combo',
  collection_gamma: 'combo',
  collection_delta: 'combo',
  collection_epsilon: 'combo',
  wildcard: 'combo',
  stash: 'combo',
  // special (signature / deity / chaos-resolution)
  critical_event: 'special',
  omniscience: 'special',
  miracle: 'special',
  rapture: 'special',
  critical_implosion: 'special',
  blackout: 'special',
};

export function getCardRole(card: CriticalCard): CardRole {
  return ROLE_BY_CARD[card] ?? 'special';
}

// Expose the internal map to the test suite so it can detect silent fallbacks
// (see cardRoles.test.ts "maps every card" check).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(getCardRole as any).__rolesByCard = ROLE_BY_CARD;
```

Run: `pnpm --filter @arcadeum/web test -- cardRoles` — **expect PASS**.

> If the "maps every card" test fails because a new engine card has been added since this plan was written, **do not silence it with a blanket fallback**. Add the new card to `ROLE_BY_CARD` with an explicit role or explicitly comment a decision to leave it as `special`.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/widgets/CriticalGame/lib/cardRoles.ts \
        apps/web/src/widgets/CriticalGame/lib/cardRoles.test.ts
git commit -m "feat(ARC-480): add getCardRole helper covering ALL_GAME_CARDS"
```

---

### Task 5: ScenePalette context

**Goal:** Provide `VariantScenePalette` to descendants without prop-drilling, via React context.

**Files:**

- Create: `apps/web/src/widgets/CriticalGame/ui/ScenePaletteContext.tsx`
- Create: `apps/web/src/widgets/CriticalGame/ui/ScenePaletteContext.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `ScenePaletteContext.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
  ScenePaletteProvider,
  useScenePalette,
} from './ScenePaletteContext';
import { getVariantStyles } from './styles/variants';

const palette = getVariantStyles('cyberpunk').scene;

function Consumer() {
  const p = useScenePalette();
  return <span data-testid="bg">{p.sceneBgGradient}</span>;
}

describe('ScenePaletteContext', () => {
  it('exposes the provided palette to descendants', () => {
    render(
      <ScenePaletteProvider palette={palette}>
        <Consumer />
      </ScenePaletteProvider>,
    );
    expect(screen.getByTestId('bg').textContent).toEqual(palette.sceneBgGradient);
  });

  it('throws when used outside a provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Consumer />)).toThrow(
      /ScenePaletteProvider/,
    );
    spy.mockRestore();
  });
});
```

Run: **FAIL** (file not found).

- [ ] **Step 2: Implement the context**

Create `ScenePaletteContext.tsx`:

```tsx
import { createContext, useContext, type ReactNode } from 'react';
import type { VariantScenePalette } from './styles/variants/types';

const ScenePaletteContext = createContext<VariantScenePalette | null>(null);

export function ScenePaletteProvider({
  palette,
  children,
}: {
  palette: VariantScenePalette;
  children: ReactNode;
}) {
  return (
    <ScenePaletteContext.Provider value={palette}>
      {children}
    </ScenePaletteContext.Provider>
  );
}

export function useScenePalette(): VariantScenePalette {
  const ctx = useContext(ScenePaletteContext);
  if (!ctx) {
    throw new Error(
      'useScenePalette must be used inside a ScenePaletteProvider',
    );
  }
  return ctx;
}
```

Run: **PASS**.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/widgets/CriticalGame/ui/ScenePaletteContext.tsx \
        apps/web/src/widgets/CriticalGame/ui/ScenePaletteContext.test.tsx
git commit -m "feat(ARC-480): add ScenePaletteProvider context"
```

---

### Task 6: Scene backdrop styled components

**Goal:** Pure-CSS Tamagui styled components for the six backdrop layers — no animation loops, no canvas.

**Files:**

- Create: `apps/web/src/widgets/CriticalGame/ui/styles/scene.tsx`

- [ ] **Step 1: Write styled components**

Create `scene.tsx`. Each component accepts its palette values via `$` Tamagui dynamic props (or inline styles if Tamagui props don't support arbitrary gradient strings):

```tsx
'use client';

import { styled, YStack } from 'tamagui';

export const SceneShell = styled(YStack, {
  name: 'CriticalSceneShell',
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  overflow: 'hidden',
  pointerEvents: 'none',
  zIndex: 0,
});

export const SceneGridFloor = styled(YStack, {
  name: 'CriticalSceneGridFloor',
  position: 'absolute',
  left: '-50%',
  right: '-50%',
  bottom: '-40%',
  height: '120%',
  // See scene-grid-floor.ts helper in Task 6 Step 2
});

// ... SceneHorizon, SceneBacklight, SceneScanlines, SceneVignette, SceneParticles
```

Full component list — see spec §"Background composition (per scene)". Each corresponds to one layer.

- [ ] **Step 2: Write the backdrop-styles helper (non-Tamagui-friendly gradient strings)**

Because Tamagui's `styled()` variant API is awkward for arbitrary gradient strings, the helpers should expose `style` props consumed by `SceneBackdrop`:

```tsx
export function makeGridFloorStyle(
  a: string,
  b: string,
): React.CSSProperties {
  return {
    backgroundImage: `
      linear-gradient(${a} 1px, transparent 1px),
      linear-gradient(90deg, ${b} 1px, transparent 1px)
    `,
    backgroundSize: '48px 48px, 48px 48px',
    transform: 'perspective(600px) rotateX(62deg) translateY(180px) scale(2)',
    transformOrigin: 'center bottom',
    WebkitMaskImage:
      'linear-gradient(to top, rgba(0,0,0,1) 30%, transparent 90%)',
    maskImage:
      'linear-gradient(to top, rgba(0,0,0,1) 30%, transparent 90%)',
  };
}

export function makeHorizonStyle(gradient: string): React.CSSProperties {
  return {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '55%',
    height: 2,
    background: gradient,
    filter: 'blur(1px)',
    boxShadow: `0 0 24px ${gradient}`,
  };
}
// ... makeBacklightStyle, makeScanlinesStyle, makeVignetteStyle, makeParticlesStyle
```

- [ ] **Step 3: Export a single `SCENE_LAYER_TESTIDS` constant**

```ts
export const SCENE_LAYER_TESTIDS = {
  backdrop: 'scene-backdrop',
  gridFloor: 'scene-grid-floor',
  horizon: 'scene-horizon',
  backlight: 'scene-backlight',
  scanlines: 'scene-scanlines',
  vignette: 'scene-vignette',
  particles: 'scene-particles',
} as const;
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/widgets/CriticalGame/ui/styles/scene.tsx
git commit -m "feat(ARC-480): add scene backdrop styled components"
```

---

### Task 7: `SceneBackdrop` component

**Goal:** Compose the six layers using the active palette.

**Files:**

- Create: `apps/web/src/widgets/CriticalGame/ui/SceneBackdrop.tsx`
- Create: `apps/web/src/widgets/CriticalGame/ui/SceneBackdrop.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SceneBackdrop } from './SceneBackdrop';
import { ScenePaletteProvider } from './ScenePaletteContext';
import { getVariantStyles } from './styles/variants';

const palette = getVariantStyles('cyberpunk').scene;

function renderWithPalette() {
  return render(
    <ScenePaletteProvider palette={palette}>
      <SceneBackdrop />
    </ScenePaletteProvider>,
  );
}

describe('SceneBackdrop', () => {
  it('renders six backdrop layers', () => {
    renderWithPalette();
    expect(screen.getByTestId('scene-backdrop')).toBeInTheDocument();
    expect(screen.getByTestId('scene-grid-floor')).toBeInTheDocument();
    expect(screen.getByTestId('scene-horizon')).toBeInTheDocument();
    expect(screen.getByTestId('scene-backlight')).toBeInTheDocument();
    expect(screen.getByTestId('scene-scanlines')).toBeInTheDocument();
    expect(screen.getByTestId('scene-vignette')).toBeInTheDocument();
    expect(screen.getByTestId('scene-particles')).toBeInTheDocument();
  });

  it('applies palette values to inline styles', () => {
    renderWithPalette();
    const horizon = screen.getByTestId('scene-horizon');
    expect(horizon.getAttribute('style')).toContain(
      palette.horizonGradient.split(',')[0],
    );
  });

  it('renders N particles where N === palette.particleColors.length × 2', () => {
    renderWithPalette();
    const particles = screen.getByTestId('scene-particles');
    expect(particles.children.length).toBeGreaterThanOrEqual(5);
    expect(particles.children.length).toBeLessThanOrEqual(8);
  });
});
```

Run: **FAIL** (component missing).

- [ ] **Step 2: Implement `SceneBackdrop`**

```tsx
'use client';

import { useScenePalette } from './ScenePaletteContext';
import {
  SceneShell,
  SceneGridFloor,
  SceneHorizon,
  SceneBacklight,
  SceneScanlines,
  SceneVignette,
  SceneParticles,
  makeGridFloorStyle,
  makeHorizonStyle,
  makeBacklightStyle,
  makeScanlinesStyle,
  makeVignetteStyle,
  SCENE_LAYER_TESTIDS,
} from './styles/scene';

const PARTICLE_LAYOUT = [
  { top: '12%', left: '8%', size: 4 },
  { top: '22%', left: '76%', size: 3 },
  { top: '35%', left: '24%', size: 5 },
  { top: '52%', left: '88%', size: 2 },
  { top: '70%', left: '14%', size: 4 },
  { top: '82%', left: '62%', size: 3 },
];

export function SceneBackdrop() {
  const p = useScenePalette();
  return (
    <SceneShell data-testid={SCENE_LAYER_TESTIDS.backdrop}
      style={{ background: p.sceneBgGradient }}
    >
      <SceneGridFloor
        data-testid={SCENE_LAYER_TESTIDS.gridFloor}
        style={makeGridFloorStyle(p.gridLineColorA, p.gridLineColorB)}
      />
      <SceneHorizon
        data-testid={SCENE_LAYER_TESTIDS.horizon}
        style={makeHorizonStyle(p.horizonGradient)}
      />
      <SceneBacklight
        data-testid={SCENE_LAYER_TESTIDS.backlight}
        style={makeBacklightStyle(p.backlightColor)}
      />
      <SceneScanlines
        data-testid={SCENE_LAYER_TESTIDS.scanlines}
        style={makeScanlinesStyle()}
      />
      <SceneVignette
        data-testid={SCENE_LAYER_TESTIDS.vignette}
        style={makeVignetteStyle(p.vignetteColor)}
      />
      <SceneParticles data-testid={SCENE_LAYER_TESTIDS.particles}>
        {PARTICLE_LAYOUT.map((dot, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: dot.top,
              left: dot.left,
              width: dot.size,
              height: dot.size,
              borderRadius: '50%',
              background:
                p.particleColors[i % p.particleColors.length],
              boxShadow: `0 0 ${dot.size * 4}px ${
                p.particleColors[i % p.particleColors.length]
              }`,
            }}
          />
        ))}
      </SceneParticles>
    </SceneShell>
  );
}
```

Run: **PASS**.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/widgets/CriticalGame/ui/SceneBackdrop.tsx \
        apps/web/src/widgets/CriticalGame/ui/SceneBackdrop.test.tsx
git commit -m "feat(ARC-480): add SceneBackdrop component"
```

---

### Task 8: `TurnBanner` component

**Goal:** Gradient-border pulsing pill with "YOUR MOVE" / "{NAME}'S TURN". Respects `prefers-reduced-motion`.

**Files:**

- Create: `apps/web/src/widgets/CriticalGame/ui/TurnBanner.tsx`
- Create: `apps/web/src/widgets/CriticalGame/ui/TurnBanner.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TurnBanner } from './TurnBanner';
import { ScenePaletteProvider } from './ScenePaletteContext';
import { getVariantStyles } from './styles/variants';

const palette = getVariantStyles(undefined).scene;

function renderBanner(props: Partial<React.ComponentProps<typeof TurnBanner>> = {}) {
  return render(
    <ScenePaletteProvider palette={palette}>
      <TurnBanner
        isMyTurn={false}
        currentPlayerName="Alice"
        secondsRemaining={45}
        {...props}
      />
    </ScenePaletteProvider>,
  );
}

describe('TurnBanner', () => {
  it('shows YOUR MOVE when isMyTurn', () => {
    renderBanner({ isMyTurn: true });
    expect(screen.getByTestId('turn-banner')).toHaveTextContent(/YOUR MOVE/i);
  });

  it('shows {NAME}\'S TURN otherwise', () => {
    renderBanner({ isMyTurn: false, currentPlayerName: 'Alice' });
    expect(screen.getByTestId('turn-banner')).toHaveTextContent(/ALICE/i);
  });

  it('formats seconds as m:ss', () => {
    renderBanner({ secondsRemaining: 75 });
    expect(screen.getByTestId('turn-banner')).toHaveTextContent('1:15');
  });

  it('renders timer as 0:00 when null', () => {
    renderBanner({ secondsRemaining: null });
    expect(screen.getByTestId('turn-banner')).toHaveTextContent('0:00');
  });
});
```

Run: **FAIL**.

- [ ] **Step 2: Implement `TurnBanner`**

Component contract:

```tsx
interface TurnBannerProps {
  isMyTurn: boolean;
  currentPlayerName: string;
  secondsRemaining: number | null;
}
```

Implementation highlights:
- Gradient border via `::before` + `mask-composite: exclude` using `palette.turnBannerBorderGradient`.
- Pulsing dot uses `palette.turnBannerDotColor`; animation `pulse 1.5s ease-in-out infinite`.
- Wrap keyframes in `@media (prefers-reduced-motion: no-preference)` via Tamagui `enterStyle`/`animation` prop or a raw `<style>` tag (preferred: Tamagui animation driver — check `packages/ui/src/tamagui.config.ts` for existing keyframes).
- Timer: `const m = Math.floor(s / 60); const ss = String(s % 60).padStart(2, '0'); return \`${m}:${ss}\`;`
- `data-testid="turn-banner"` on the root.
- `data-testid="turn-banner-dot"` on the inner pulsing dot (used in the reduced-motion test in Task 16).
- i18n: use `useTranslation()`. For "YOUR MOVE" reuse the existing key `games.table.players.yourTurn` (see [apps/web/src/shared/i18n/messages/games/critical/en.ts:226](../../apps/web/src/shared/i18n/messages/games/critical/en.ts)) — apply `textTransform: 'uppercase'` in style rather than coining a new key. For "{NAME}'S TURN" grep for an existing key first: `grep -rn "playerTurn\|currentTurn\|'s turn'" apps/web/src/shared/i18n/messages/games/critical/`. Only add a new key (e.g. `games.table.players.playerTurn` with `{name}` placeholder) if none of the existing keys fit. If added, put it in all five files: `en.ts`, `ru.ts`, `es.ts`, `fr.ts`, `by.ts` under [apps/web/src/shared/i18n/messages/games/critical/](../../apps/web/src/shared/i18n/messages/games/critical/).

- [ ] **Step 3: Run the test — expect pass**

Run: `pnpm --filter @arcadeum/web test -- TurnBanner`
Expected: **PASS**.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/widgets/CriticalGame/ui/TurnBanner.tsx \
        apps/web/src/widgets/CriticalGame/ui/TurnBanner.test.tsx \
        apps/web/src/shared/i18n/messages/games/critical/
git commit -m "feat(ARC-480): add TurnBanner component"
```

---

### Task 9: Mount `SceneBackdrop` + `TurnBanner` in `ActiveGameView`

**Goal:** Resolve palette, wrap tree in `ScenePaletteProvider`, render `SceneBackdrop` below the HUD, render `TurnBanner` just under the HUD.

**Files:**

- Modify: `apps/web/src/widgets/CriticalGame/ui/ActiveGameView.tsx`
- Modify: `apps/web/src/widgets/CriticalGame/ui/styles/layout.tsx` — ensure `GameContainer` becomes the positioning context (`position: relative`), and retire the `getBackgroundEffects` `::before`/`::after` layer now replaced by `SceneBackdrop`.

- [ ] **Step 1: Extend `ActiveGameView.tsx`**

```tsx
import { useMemo } from 'react';
import { getVariantStyles } from './styles/variants';
import { ScenePaletteProvider } from './ScenePaletteContext';
import { SceneBackdrop } from './SceneBackdrop';
import { TurnBanner } from './TurnBanner';

// Inside the component body, near the top:
const scenePalette = useMemo(
  () => getVariantStyles(cardVariant).scene,
  [cardVariant],
);
```

Wrap the returned JSX:

```tsx
return (
  <ScenePaletteProvider palette={scenePalette}>
    <SceneBackdrop />
    <CriticalGameHeader ... />
    <TurnBanner
      isMyTurn={!!isMyTurn}
      currentPlayerName={
        currentTurnPlayer
          ? resolveDisplayName(currentTurnPlayer.playerId, 'Player')
          : ''
      }
      secondsRemaining={snapshot?.turnSecondsRemaining ?? null}
    />
    <ActiveGameContent ... />
    {/* ...rest unchanged */}
  </ScenePaletteProvider>
);
```

- [ ] **Step 2: Adjust `CriticalGameHeader` to drop the turn label**

Remove the existing turn label render (keep the room title / fullscreen / rules controls). `TurnBanner` now owns it.

- [ ] **Step 3: Retire the old ambient layer in `layout.tsx`**

In `apps/web/src/widgets/CriticalGame/ui/styles/layout.tsx`, remove the block where `getBackgroundEffects()` is applied as `::before`/`::after` on `GameContainer`. The backdrop is now a first-class sibling.

- [ ] **Step 4: Run e2e sanity**

Run: `pnpm --filter @arcadeum/web exec playwright test critical-single-player.spec.ts --reporter=line`
Expected: PASS (no behavioral changes). If a test needs `data-testid="scene-backdrop"`, add that assertion **in task 15**, not here.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/widgets/CriticalGame/ui/ActiveGameView.tsx \
        apps/web/src/widgets/CriticalGame/ui/CriticalGameHeader.tsx \
        apps/web/src/widgets/CriticalGame/ui/styles/layout.tsx
git commit -m "feat(ARC-480): mount SceneBackdrop + TurnBanner in ActiveGameView"
```

---

### Task 10: Restyle center stacks (Deck / Last played / Discard)

**Goal:** Apply `palette.deckGradient/deckGlow`, `palette.lastPlayedGradient/lastPlayedHaloColor`, `palette.discardGradient/discardGlow` to the three center stacks. Keep existing markup + testids (`deck-card`, `discard-pile`, `last-played-card` if present).

**Files:**

- Modify: `apps/web/src/widgets/CriticalGame/ui/DeckDisplay.tsx`
- Modify: `apps/web/src/widgets/CriticalGame/ui/LastPlayedCardDisplay.tsx`
- Modify: `apps/web/src/widgets/CriticalGame/ui/CenterTableSection.tsx`
- Modify: `apps/web/src/widgets/CriticalGame/ui/styles/table.tsx`, `table-widgets.tsx`

- [ ] **Step 1: Testid inventory (first markup-touching task)**

Run the baseline greps described in the `data-testid stability` convention above, and compare against the e2e selectors:

```bash
grep -rn "data-testid" apps/web/src/widgets/CriticalGame/ui/ > /tmp/critical-testids-before.txt
grep -rn "data-testid" apps/web/e2e/critical-*.spec.ts > /tmp/critical-e2e-testids.txt
```

Any testid listed in the e2e file **must remain** in the UI after this task. Add new ones freely.

- [ ] **Step 2: Visual regression baseline (optional, do not commit)**

```bash
pnpm --filter @arcadeum/web exec playwright test critical-variants.spec.ts --update-snapshots
```
Generates baseline screenshots for the current (pre-redesign) UI. Do **NOT** commit them — they are a local sanity backstop only. (The spec explicitly does not require visual regression tests.)

- [ ] **Step 3: Wire palette into components**

In each of `DeckDisplay.tsx`, `LastPlayedCardDisplay.tsx`, `CenterTableSection.tsx`:

```tsx
const p = useScenePalette();
// Use p.deckGradient, p.deckGlow, etc. in style props / Tamagui $style
```

Avoid duplicating gradient logic that is already encoded in the palette.

- [ ] **Step 4: Update dimensions**

Per spec: deck 74×102 desktop / 58×80 mobile; last-played 92×126 desktop / 72×100 mobile; discard 74×102 desktop / 58×80 mobile; gap 32px desktop / 14px mobile. Use Tamagui `$sm` to switch.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/widgets/CriticalGame/ui/DeckDisplay.tsx \
        apps/web/src/widgets/CriticalGame/ui/LastPlayedCardDisplay.tsx \
        apps/web/src/widgets/CriticalGame/ui/CenterTableSection.tsx \
        apps/web/src/widgets/CriticalGame/ui/styles/table.tsx \
        apps/web/src/widgets/CriticalGame/ui/styles/table-widgets.tsx
git commit -m "feat(ARC-480): restyle center stacks with scene palette"
```

---

### Task 11: Restyle opponents (TablePlayer + TableStats)

**Goal:** 58/68px avatar, magenta ring + halo on turn, dashed red ring + label on elimination.

**Files:**

- Modify: `apps/web/src/widgets/CriticalGame/ui/TablePlayer.tsx`
- Modify: `apps/web/src/widgets/CriticalGame/ui/TableStats.tsx`
- Modify: `apps/web/src/widgets/CriticalGame/ui/styles/players.tsx`, `player-widgets.tsx`

- [ ] **Step 1: Consume palette**

In `TablePlayer.tsx`:

```tsx
const p = useScenePalette();
// avatar ring: `2px solid ${p.opponentTurnRingColor}` + halo `box-shadow: 0 0 24px ${p.opponentTurnHaloColor}`
```

- [ ] **Step 2: Keep existing testids**

Confirm `data-testid` values on player-card/name/turn-indicator match what `critical-card-visibility.spec.ts` expects. The baseline files from Task 10 Step 1 (`/tmp/critical-testids-before.txt` and `/tmp/critical-e2e-testids.txt`) are the source of truth; cross-reference rather than re-grepping. If you must re-grep, use the broader pattern:

```bash
grep -rn "data-testid" apps/web/src/widgets/CriticalGame/ui/TablePlayer.tsx \
                      apps/web/src/widgets/CriticalGame/ui/TableStats.tsx \
                      apps/web/src/widgets/CriticalGame/ui/styles/players.tsx \
                      apps/web/src/widgets/CriticalGame/ui/styles/player-widgets.tsx
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/widgets/CriticalGame/ui/TablePlayer.tsx \
        apps/web/src/widgets/CriticalGame/ui/TableStats.tsx \
        apps/web/src/widgets/CriticalGame/ui/styles/players.tsx \
        apps/web/src/widgets/CriticalGame/ui/styles/player-widgets.tsx
git commit -m "feat(ARC-480): restyle opponent avatars with turn ring + halo"
```

---

### Task 12: Restyle player hand (fanned desktop / flat mobile)

**Goal:** Desktop: 82×114px fanned with ±7/14° rotation; selected card lifts -26px and gets 2px gold border + triple-stack shadow. Mobile: 62×88px flat strip, horizontal scroll when >6 cards, selected lifts -14px.

**Files:**

- Modify: `apps/web/src/widgets/CriticalGame/ui/PlayerHand.tsx`
- Modify: `apps/web/src/widgets/CriticalGame/ui/styles/players-hand.tsx`
- Modify: `apps/web/src/widgets/CriticalGame/ui/styles/cards.tsx`, `cards-base.tsx`, `card-decorations.tsx`, `card-image.tsx`

- [ ] **Step 1: Consume role + palette**

In `PlayerHand.tsx`:

```tsx
import { getCardRole } from '../lib/cardRoles';

const p = useScenePalette();
// ...inside the card render:
const role = getCardRole(card);
const gradient = p.handColorByRole[role];
```

- [ ] **Step 2: Responsive layout**

Use `useMedia().sm` (Tamagui) to pick fanned vs flat layout. Never call `window.matchMedia(...)` at render time — `useMedia` is reactive.

- [ ] **Step 3: Preserve card-click handlers**

No handler changes. `handlePlayActionCard` and selection logic are unchanged.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/widgets/CriticalGame/ui/PlayerHand.tsx \
        apps/web/src/widgets/CriticalGame/ui/styles/players-hand.tsx \
        apps/web/src/widgets/CriticalGame/ui/styles/cards.tsx \
        apps/web/src/widgets/CriticalGame/ui/styles/cards-base.tsx \
        apps/web/src/widgets/CriticalGame/ui/styles/card-decorations.tsx \
        apps/web/src/widgets/CriticalGame/ui/styles/card-image.tsx
git commit -m "feat(ARC-480): restyle player hand fan (desktop) + strip (mobile)"
```

---

### Task 13: Restyle HUD + actions + log strip

**Goal:** HUD gradient-chip logo, right-side rules/fullscreen chips; actions section split left (you + meta) and right (NOPE + DRAW) on desktop; single you-strip on mobile; `GameStatusMessage` / `ChatBubble` become log-pill-style.

**Files:**

- Modify: `apps/web/src/widgets/CriticalGame/ui/CriticalGameHeader.tsx`
- Modify: `apps/web/src/widgets/CriticalGame/ui/ActionsSection.tsx`
- Modify: `apps/web/src/widgets/CriticalGame/ui/GameStatusMessage.tsx`
- Modify: `apps/web/src/widgets/CriticalGame/ui/ChatBubble.tsx`
- Modify: `apps/web/src/widgets/CriticalGame/ui/styles/header.tsx`
- Modify: `apps/web/src/widgets/CriticalGame/ui/styles/chat.tsx`, `chat-widgets.tsx`

- [ ] **Step 1: HUD layout**

Two-column flex: left chip+title, right rules+fullscreen+idle-timer. Use scene palette for gradient. Height 50/42.

- [ ] **Step 2: Actions split**

Desktop: `YStack` outside, `XStack` inside with `justifyContent: 'space-between'`. Mobile ($sm): single full-width `XStack` with NOPE right-aligned.

- [ ] **Step 3: Log pill**

Single-line, `backdropFilter: blur(8px)`, variant-tinted border at 0.35 alpha. Truncate with ellipsis.

- [ ] **Step 4: Commit**

```bash
git commit -m "feat(ARC-480): restyle HUD, actions, and log strip"
```

---

### Task 14: `MobileActionSheet` component

**Goal:** Bottom sheet target picker for `$sm`. When a card needing a target (`attack`, `favor`) is selected on mobile, `MobileActionSheet` opens in place of `TargetedAttackModal` / `FavorModal`.

**Files:**

- Create: `apps/web/src/widgets/CriticalGame/ui/MobileActionSheet.tsx`
- Create: `apps/web/src/widgets/CriticalGame/ui/MobileActionSheet.test.tsx`
- Modify: `apps/web/src/widgets/CriticalGame/ui/ActiveGameView.tsx` — render `MobileActionSheet` on mobile and pass `isMobile` into `GameModals`.
- Modify: `apps/web/src/widgets/CriticalGame/ui/GameModals.tsx` — accept `isMobile` prop; short-circuit `TargetedAttackModal` and `FavorModal` when `isMobile` is true.

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MobileActionSheet } from './MobileActionSheet';
import { ScenePaletteProvider } from './ScenePaletteContext';
import { getVariantStyles } from './styles/variants';

const palette = getVariantStyles(undefined).scene;

const opponents = [
  { playerId: 'a', alive: true },
  { playerId: 'b', alive: true },
  { playerId: 'c', alive: false },
];

function setup(overrides = {}) {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  render(
    <ScenePaletteProvider palette={palette}>
      <MobileActionSheet
        isOpen
        title="Attack"
        description="Play Attack on which player?"
        opponents={opponents}
        resolveDisplayName={(id) => id.toUpperCase()}
        onConfirm={onConfirm}
        onCancel={onCancel}
        {...overrides}
      />
    </ScenePaletteProvider>,
  );
  return { onConfirm, onCancel };
}

describe('MobileActionSheet', () => {
  it('lists live opponents only', () => {
    setup();
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.queryByText('C')).not.toBeInTheDocument();
  });

  it('fires onConfirm with the chosen target', () => {
    const { onConfirm } = setup();
    fireEvent.click(screen.getByText('A'));
    fireEvent.click(screen.getByText(/play/i));
    expect(onConfirm).toHaveBeenCalledWith('a');
  });

  it('fires onCancel on Cancel', () => {
    const { onCancel } = setup();
    fireEvent.click(screen.getByText(/cancel/i));
    expect(onCancel).toHaveBeenCalled();
  });

  it('does not render when isOpen is false', () => {
    setup({ isOpen: false });
    expect(screen.queryByTestId('mobile-action-sheet')).not.toBeInTheDocument();
  });
});
```

Run: **FAIL**.

- [ ] **Step 2: Implement `MobileActionSheet`**

Props:
```ts
interface MobileActionSheetProps {
  isOpen: boolean;
  title: string;
  description: string;
  opponents: Array<{ playerId: string; alive: boolean }>;
  resolveDisplayName: (id: string, fallback?: string) => string;
  onConfirm: (targetId: string) => void;
  onCancel: () => void;
}
```

Rules:
- Render nothing when `!isOpen`.
- Root has `data-testid="mobile-action-sheet"` and `role="dialog"` + `aria-modal="true"`.
- Only list `alive === true` opponents.
- One internal `selectedTarget` state; `Play` disabled until a target is chosen.
- `Cancel` always fires `onCancel()`; `Play` fires `onConfirm(selectedTarget)`.

- [ ] **Step 3: Add `isMobile` gating to `GameModals`**

Desktop modals live inside [apps/web/src/widgets/CriticalGame/ui/GameModals.tsx](../../apps/web/src/widgets/CriticalGame/ui/GameModals.tsx) (`TargetedAttackModal` dynamic at line 13, `FavorModal` dynamic at line 12). Do **not** try to inline them in `ActiveGameView` — they keep their current location. Instead, add a boolean prop to `GameModals` that short-circuits just those two on mobile:

```ts
// In GameModalsProps
isMobile?: boolean; // defaults to false — any existing callers keep working unchanged
```

Destructure with a default in the component signature: `export function GameModals({ isMobile = false, ... }: GameModalsProps) { ... }`.

In the render body, guard the two modal instantiations. Example (current block for `TargetedAttackModal`):

```tsx
{/* Before */}
<TargetedAttackModal ... />

{/* After */}
{!isMobile && <TargetedAttackModal ... />}
```

Same for `FavorModal`. Leave all other modals (`DefuseModal`, `StashModal`, `ComboModal`, etc.) unchanged — they are not part of the mobile action sheet surface.

- [ ] **Step 4: Mount the sheet and pass `isMobile` in `ActiveGameView`**

```tsx
import { useMedia } from 'tamagui';
import { MobileActionSheet } from './MobileActionSheet';
// ...inside ActiveGameView body
const media = useMedia();
const isMobile = media.sm; // Tamagui reactive — re-renders on resize/rotate

// ...in the returned JSX, below <GameModals />
<GameModals
  ...existingProps
  isMobile={isMobile}
/>

{/* Targeted Attack (mobile) */}
{isMobile && targetedAttackModal.isOpen && (
  <MobileActionSheet
    isOpen
    title={t('games.critical_v1.mobile.attack.title')}
    description={t('games.critical_v1.mobile.attack.description')}
    opponents={aliveOpponents}
    resolveDisplayName={resolveDisplayName}
    onConfirm={(targetId) =>
      handleConfirmTargetedAttack({
        ...targetedAttackModal,
        targetId,
      })
    }
    onCancel={handleCloseTargetedAttackModal}
  />
)}

{/* Favor (mobile) */}
{isMobile && favorModal.isOpen && (
  <MobileActionSheet
    isOpen
    title={t('games.critical_v1.mobile.favor.title')}
    description={t('games.critical_v1.mobile.favor.description')}
    opponents={aliveOpponents}
    resolveDisplayName={resolveDisplayName}
    onConfirm={(targetId) => handleConfirmFavor(targetId)}
    onCancel={handleCloseFavorModal}
  />
)}
```

Before committing, **verify no double-render** by running a single-player mobile e2e in the next step.

- [ ] **Step 5: Add i18n keys**

Add to [apps/web/src/shared/i18n/messages/games/critical/](../../apps/web/src/shared/i18n/messages/games/critical/) files `en.ts`, `ru.ts`, `es.ts`, `fr.ts`, `by.ts`. First grep for existing `cancel` / `play` / `select` keys — reuse them if present:

```bash
grep -n "cancel\|play\|selectTarget" apps/web/src/shared/i18n/messages/games/critical/en.ts
```

Add under the `critical_v1` namespace (the namespace root already exists in each locale file — look for the `critical_v1: { ... }` block):

```ts
mobile: {
  attack: {
    title: 'Select target',
    description: 'Play Attack on which player?',
  },
  favor: {
    title: 'Select target',
    description: 'Ask which player for a favor?',
  },
  cancel: 'Cancel',
  play: 'Play',
},
```

If `cancel` / `play` already exist at a parent scope, point to them instead of adding dupes.

Translate each of the four non-English files. For BY (Belarusian), EN (English), RU (Russian), ES (Spanish), FR (French), keep tone consistent with existing Critical strings.

- [ ] **Step 6: Run tests**

Run: `pnpm --filter @arcadeum/web test -- MobileActionSheet`
Expected: **PASS**.

Run: `pnpm --filter @arcadeum/web exec playwright test critical-mobile-table --reporter=line`
Expected: PASS (manually verify that on mobile you see **only** `MobileActionSheet` and **not** the old modal when selecting `targeted_strike`).

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/widgets/CriticalGame/ui/MobileActionSheet.tsx \
        apps/web/src/widgets/CriticalGame/ui/MobileActionSheet.test.tsx \
        apps/web/src/widgets/CriticalGame/ui/GameModals.tsx \
        apps/web/src/widgets/CriticalGame/ui/ActiveGameView.tsx \
        apps/web/src/shared/i18n/messages/games/critical/
git commit -m "feat(ARC-480): add MobileActionSheet with \$sm-gated rendering"
```

---

### Task 15: Delete ParticleOverlay

**Goal:** Remove the old per-variant particle overlay; its responsibility is now inside `SceneBackdrop.SceneParticles`.

**Files:**

- Delete: `apps/web/src/widgets/CriticalGame/ui/ParticleOverlay.tsx`
- Delete: `apps/web/src/widgets/CriticalGame/ui/ParticleOverlay.module.css`
- Modify: any file importing `ParticleOverlay` (grep before delete).

- [ ] **Step 1: Find all importers**

Run: `grep -rn "ParticleOverlay" apps/web/src`
Expected: only the two files being deleted + any usage site.

- [ ] **Step 2: Remove usage**

In each importer, delete the `<ParticleOverlay />` JSX and the import line.

- [ ] **Step 3: Delete the files**

```bash
git rm apps/web/src/widgets/CriticalGame/ui/ParticleOverlay.tsx \
       apps/web/src/widgets/CriticalGame/ui/ParticleOverlay.module.css
```

- [ ] **Step 4: Run full web build**

Run: `pnpm --filter @arcadeum/web build`
Expected: SUCCESS.

- [ ] **Step 5: Commit**

```bash
git commit -m "refactor(ARC-480): remove ParticleOverlay (replaced by SceneBackdrop)"
```

---

### Task 16: Accessibility & `prefers-reduced-motion`

**Goal:** Disable pulsing dot / horizon shimmer / ambient glow keyframes under `prefers-reduced-motion: reduce`. Keep scene static but fully styled. Verify existing `data-testid` contract is intact.

**Files:**

- Modify: `apps/web/src/widgets/CriticalGame/ui/TurnBanner.tsx` (guard animation)
- Modify: `apps/web/src/widgets/CriticalGame/ui/styles/scene.tsx` (guard keyframes)

- [ ] **Step 1: Add reduced-motion test**

In `TurnBanner.test.tsx`, add:
```tsx
it('omits animation when prefers-reduced-motion is set', () => {
  window.matchMedia = vi.fn().mockImplementation((q) => ({
    matches: q === '(prefers-reduced-motion: reduce)',
    addEventListener: () => {},
    removeEventListener: () => {},
    media: q,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }));
  renderBanner({ isMyTurn: true });
  const dot = screen.getByTestId('turn-banner-dot');
  expect(dot.getAttribute('style') ?? '').not.toContain('animation');
});
```

Run: **FAIL** — two valid implementations:

**Preferred (CSS-only, SSR-safe):** wrap the animation assignment in a `@media (prefers-reduced-motion: no-preference)` block so the `animation` property is simply absent when the user has requested reduced motion:

```tsx
// In TurnBanner.tsx — static CSS via <style jsx> or Tamagui className
const dotStyle: React.CSSProperties = {
  width: 8,
  height: 8,
  borderRadius: '50%',
  background: palette.turnBannerDotColor,
};
// No JS matchMedia. The pulse animation lives in a stylesheet/keyframes block
// guarded by @media (prefers-reduced-motion: no-preference).
```

If using Tamagui's `animation` prop, gate it by consulting a CSS class applied via a global rule:

```css
@media (prefers-reduced-motion: reduce) {
  [data-testid='turn-banner-dot'] {
    animation: none !important;
  }
}
```

**Alternative (JS-based):** only use this if the CSS approach is incompatible with Tamagui's styled API in this repo:

```tsx
const reducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// pass `reducedMotion` into styles; skip the pulse animation string when true
```

Trade-off: the JS approach fails SSR (renders animated on the server, then reconciles), causing a one-frame flash. Use CSS-only unless blocked.

**Test-harness note:** if you pick the CSS-only path, the Vitest `expect(style).not.toContain('animation')` assertion is trivially satisfied (the inline style never had `animation` to begin with) and does not actually verify reduced-motion behavior. In that case, either delete the Vitest assertion and add a Playwright check using `await page.emulateMedia({ reducedMotion: 'reduce' })` in `critical-single-player.spec.ts`, or assert against the presence of a dedicated CSS class / computed style rather than inline. Do **not** keep a test that only appears to pass.

Run: **PASS**.

- [ ] **Step 2: Run the full Critical Playwright suite**

Run: `pnpm --filter @arcadeum/web exec playwright test critical- --reporter=line`
Expected: all pre-existing suites pass.

- [ ] **Step 3: Commit**

```bash
git commit -m "feat(ARC-480): respect prefers-reduced-motion in TurnBanner + scene"
```

---

### Task 17: Verify file-length budget + lint + build

**Goal:** Enforce the 500-line-per-file cap; verify typecheck, lint, and build green.

- [ ] **Step 1: Run `pnpm check-file-length`**

Run: `pnpm check-file-length`
If any new or modified file exceeds 500 lines, split it (most likely candidate: `players-hand.tsx` → `players-hand-desktop.tsx` + `players-hand-mobile.tsx`, or `scene.tsx` → `scene-layers.tsx` + `scene-styles.ts`).

- [ ] **Step 2: Run lint**

Run: `pnpm --filter @arcadeum/web lint`
Fix all errors. Warnings may be surfaced to human if any exceed current-branch counts.

- [ ] **Step 3: Run typecheck**

Run: `pnpm --filter @arcadeum/web typecheck`
Expected: clean.

- [ ] **Step 4: Run full unit test suite**

Run: `pnpm --filter @arcadeum/web test`
Expected: all PASS.

- [ ] **Step 5: Run production build**

Run: `pnpm --filter @arcadeum/web build`
Expected: SUCCESS.

- [ ] **Step 6: Commit any splits**

```bash
git commit -m "chore(ARC-480): keep files under 500-line cap"
```

---

### Task 18: e2e — add scene/turn-banner/action-sheet selectors

**Goal:** Add existence assertions in the existing Critical Playwright suites so future regressions on markup are caught. No new `*.spec.ts` files; append to existing ones.

**Files:**

- Modify: `apps/web/e2e/critical-card-visibility.spec.ts`
- Modify: `apps/web/e2e/critical-mobile-table.spec.ts`
- Modify: `apps/web/e2e/critical-variants.spec.ts`

- [ ] **Step 1: Add the assertions**

Inside the appropriate `test()` blocks:

```ts
// critical-variants.spec.ts (desktop)
await expect(page.locator('[data-testid="scene-backdrop"]')).toBeVisible();
await expect(page.locator('[data-testid="turn-banner"]')).toBeVisible();

// critical-mobile-table.spec.ts (mobile viewport)
// After selecting an attack card:
await expect(
  page.locator('[data-testid="mobile-action-sheet"]'),
).toBeVisible();
```

- [ ] **Step 2: Run the Critical e2e suite**

Run: `pnpm --filter @arcadeum/web exec playwright test critical- --reporter=line`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/web/e2e/critical-*.spec.ts
git commit -m "test(ARC-480): assert scene/turn-banner/action-sheet in e2e"
```

---

### Task 19: Manual verification & sign-off

**Goal:** Walk the visual spec at all breakpoints and verify game-over, fullscreen, idle-timer still work.

- [ ] **Step 1: Manual check at widths 375, 600, 900, 1280, 1920**

Start dev server: `pnpm --filter @arcadeum/web dev`
In Chrome DevTools, toggle device toolbar, run through a single-player game at each width. Confirm:
- Turn banner legible within 200ms.
- Backdrop layers visible and distinct.
- Deck/last-played/discard positioned correctly.
- Hand fans on desktop, flat on mobile.
- Action sheet opens instead of attack modal on mobile.

- [ ] **Step 2: Check each of 6 variants**

For each variant, create a room and verify palette renders correctly. Confirm hues distinct from `cyberpunk` baseline.

- [ ] **Step 3: `prefers-reduced-motion`**

Toggle DevTools → Rendering → `prefers-reduced-motion: reduce`. Confirm TurnBanner dot stops pulsing; scene still styled.

- [ ] **Step 4: Fullscreen + game-over modal**

Press fullscreen; confirm scene fills viewport. Trigger game-over; confirm `GameResultModal` overlays on top and scene remains behind.

- [ ] **Step 5: Visual sign-off against mockups**

Compare screenshots side-by-side with:
- `.superpowers/brainstorm/77708-1776607395/neon-hero-v2.html`
- `.superpowers/brainstorm/77708-1776607395/mobile-hero.html`

Flag material deviations to human.

- [ ] **Step 6: Open PR**

Run the `/pr-description` slash command. Title: `feat(ARC-480): redesign critical active game view (immersive neon scene)`.

---

## Testing matrix

| Concern               | Mechanism                                                  |
| --------------------- | ---------------------------------------------------------- |
| palette resolution    | Vitest — `scene-resolution.test.ts`                        |
| role helper           | Vitest — `cardRoles.test.ts`                               |
| context               | Vitest — `ScenePaletteContext.test.tsx`                    |
| `SceneBackdrop`       | Vitest — `SceneBackdrop.test.tsx`                          |
| `TurnBanner`          | Vitest — `TurnBanner.test.tsx`                             |
| `MobileActionSheet`   | Vitest — `MobileActionSheet.test.tsx`                      |
| markup contract       | Playwright existing suites + new existence selectors       |
| reduced motion        | Vitest + manual (DevTools rendering toggle)                |
| file-length budget    | `pnpm check-file-length` in Task 17                        |
| build + lint + types  | Task 17                                                    |
| visual fidelity       | Manual sign-off against mockups in Task 19                 |

---

## Risks & mitigations

- **File-length creep.** Several existing styles files are close to the 500-line limit. Task 17 enforces the cap; any task writing into a near-limit file should split it before committing.
- **e2e brittleness.** Spec explicitly preserves testids; Task 11 includes a grep step to enumerate them before touching markup. If an existing test fails because of a removed testid, restore the testid — do not edit the test.
- **Role mapping drift.** `getCardRole` enumerates ~20 card types statically. If the engine introduces a new card and it isn't mapped, it falls back to `'special'` → gold gradient. This is correct-by-design, not a bug.
- **Tamagui `useMedia` availability.** If the repo's Tamagui version lacks `useMedia`, Task 14 falls back to `useSyncExternalStore` with `window.matchMedia('(max-width: 660px)')`. The spec explicitly forbids a one-shot `.matches` read.
- **Animation jank on low-end devices.** Particles are static; only pulse + shimmer animate. Reduced-motion (Task 16) disables both.

## Out of scope (do not touch in this plan)

- Any backend / engine / DTO change.
- Lobby redesign (separate effort).
- Mobile app (`apps/mobile`).
- Redesign of modals other than the new `MobileActionSheet`.
- Visual-regression screenshot tests (framework not currently in repo).
