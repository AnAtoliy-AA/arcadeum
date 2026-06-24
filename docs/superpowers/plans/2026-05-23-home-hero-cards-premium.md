# Home Hero Cards — Premium Visual Refresh Implementation Plan (ARC-734)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the emoji-driven hero card centerpieces with full-bleed AI artwork (fantasy / galaxy / steampunk), refined scrims, inner ring, elevation shadow, and a subtle hover shimmer — preserving the existing fan-out layout and all e2e selectors.

**Architecture:** Add an optional `bgImage` field to `CARD_VARIANTS`, curate three hero variants by id (not `slice`), and rewrite the card body in `HomeHero.tsx` to render a `next/image` background with two text rows (variant name top, `CRITICAL` brand bottom) over CSS scrims. All visual treatment lives in `home-bundle.css` on `.hero-card-main`.

**Tech Stack:** Next.js (App Router) · `next/image` · Tamagui design tokens · Vitest (web unit tests) · Playwright (e2e). Spec: [docs/superpowers/specs/2026-05-23-home-hero-cards-premium-design.md](../specs/2026-05-23-home-hero-cards-premium-design.md).

---

## File Structure

| File                                                               | Responsibility                             | Action                                                                                                            |
| ------------------------------------------------------------------ | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| `apps/web/src/features/games/lib/criticalVariants.ts`              | Source of truth for CRITICAL game variants | Modify — add optional `bgImage?: string` to type, populate for 6 variants with art                                |
| `apps/web/src/app/[locale]/home/components/HomeHero.tsx`           | Renders the hero section + card stack      | Modify — curate 3 hero ids, replace card body with `next/image` + 2 text rows                                     |
| `apps/web/src/app/[locale]/home/components/styles/home-bundle.css` | Hero / presentation styles                 | Modify — `.hero-card-main` gets scrims, inner ring, layered shadow, hover shimmer; `prefers-reduced-motion` guard |
| `apps/web/src/features/games/lib/criticalVariants.test.ts`         | Unit test for variant data                 | Create — assert hero variants exist + have `bgImage` paths under `/images/variants/`                              |
| `apps/web/e2e/homepage.spec.ts:85-100`                             | Existing e2e                               | Unchanged — must still pass (`hero-card-stack` count 3)                                                           |

---

## Pre-flight check

- [ ] **Verify working tree and branch**

Run:

```bash
git -C /Users/anatoliyaliaksandrau/js/arcadeum_claude status
git -C /Users/anatoliyaliaksandrau/js/arcadeum_claude branch --show-current
```

Expected: on `ARC-734`, clean working tree (the spec commit `603bb8e9` is already on this branch).

- [ ] **Verify the variant artwork is present**

Run:

```bash
ls apps/web/public/images/variants/
```

Expected: `egypt_bg.png  fantasy_bg.png  galaxy_bg.png  steampunk_bg.png  western_bg.png  zen_bg.png`.

If any of `fantasy_bg.png`, `galaxy_bg.png`, `steampunk_bg.png` is missing, stop and surface — the hero trio depends on them.

---

## Task 1: Add `bgImage` to CARD_VARIANTS (data + types)

**Files:**

- Modify: `apps/web/src/features/games/lib/criticalVariants.ts`
- Create: `apps/web/src/features/games/lib/criticalVariants.test.ts`

### Steps

- [ ] **Step 1.1: Write the failing test**

Create `apps/web/src/features/games/lib/criticalVariants.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { CARD_VARIANTS } from './criticalVariants';

describe('CARD_VARIANTS bgImage field', () => {
  const expectImage = (id: string, file: string) => {
    const v = CARD_VARIANTS.find((c) => c.id === id);
    expect(v, `variant ${id} should exist`).toBeDefined();
    expect(v?.bgImage).toBe(`/images/variants/${file}`);
  };

  it('populates bgImage for the 6 variants with shipped artwork', () => {
    expectImage('egypt', 'egypt_bg.png');
    expectImage('fantasy', 'fantasy_bg.png');
    expectImage('galaxy', 'galaxy_bg.png');
    expectImage('steampunk', 'steampunk_bg.png');
    expectImage('western', 'western_bg.png');
    expectImage('zen', 'zen_bg.png');
  });

  it('leaves bgImage undefined for variants without shipped artwork', () => {
    const noArtIds = [
      'cyberpunk',
      'underwater',
      'crime',
      'horror',
      'adventure',
      'high-altitude-hike',
      'random',
    ];
    for (const id of noArtIds) {
      const v = CARD_VARIANTS.find((c) => c.id === id);
      expect(
        v?.bgImage,
        `variant ${id} should not have bgImage`,
      ).toBeUndefined();
    }
  });
});
```

- [ ] **Step 1.2: Run test to confirm it fails**

Run:

```bash
pnpm --filter @arcadeum/web test -- criticalVariants.test
```

Expected: FAIL — `bgImage` is not defined on any variant.

- [ ] **Step 1.3: Add `bgImage` to the type and the 6 entries**

Edit `apps/web/src/features/games/lib/criticalVariants.ts`. Change the type declaration to include `bgImage?: string` and add the field to the six entries.

Type change (top of file):

```ts
export const CARD_VARIANTS: {
  id: string;
  name: string;
  description: string;
  emoji: string;
  gradient: string;
  bgImage?: string;
  disabled?: boolean;
}[] = [
```

Per-entry additions (insert `bgImage` line after `gradient`):

- `fantasy`: `bgImage: '/images/variants/fantasy_bg.png',`
- `galaxy`: `bgImage: '/images/variants/galaxy_bg.png',`
- `steampunk`: `bgImage: '/images/variants/steampunk_bg.png',`
- `egypt`: `bgImage: '/images/variants/egypt_bg.png',`
- `western`: `bgImage: '/images/variants/western_bg.png',`
- `zen`: `bgImage: '/images/variants/zen_bg.png',`

- [ ] **Step 1.4: Run test to confirm it passes**

Run:

```bash
pnpm --filter @arcadeum/web test -- criticalVariants.test
```

Expected: PASS (both `it` blocks).

- [ ] **Step 1.5: Type-check + lint**

Run:

```bash
pnpm --filter @arcadeum/web typecheck
pnpm --filter @arcadeum/web lint
```

Expected: no errors. `CARD_VARIANTS` is also imported by `features/games/ui/create/constants.ts` (re-export) and `features/games/lib/variantRegistry.ts` — both ignore unknown fields, so the optional addition is non-breaking.

- [ ] **Step 1.6: Commit**

```bash
git add apps/web/src/features/games/lib/criticalVariants.ts apps/web/src/features/games/lib/criticalVariants.test.ts
git commit -m "feat(games): add optional bgImage to CARD_VARIANTS for shipped artwork (ARC-734)"
```

---

## Task 2: Curate hero trio + rewrite card body in HomeHero

**Files:**

- Modify: `apps/web/src/app/[locale]/home/components/HomeHero.tsx`

### Steps

- [ ] **Step 2.1: Replace the `heroCards` memo + remove `THEME_COLORS`**

Edit `apps/web/src/app/[locale]/home/components/HomeHero.tsx`. Two distinct edits in this file (do NOT delete the `export default function HomeHero()` declaration between them):

**Edit A — top-level constants (lines 15–16):** replace

```ts
type ThemeColor = '$red10' | '$blue10' | '$purple10';
const THEME_COLORS: ThemeColor[] = ['$red10', '$blue10', '$purple10'];
```

with

```ts
const HERO_VARIANT_IDS = ['fantasy', 'galaxy', 'steampunk'] as const;

type HeroCard = {
  nameKey: string;
  bgImage?: string;
};
```

**Edit B — inside the component body, the `heroCards` useMemo (currently lines 23–31):** replace the existing `useMemo(...)` call with

```ts
const heroCards = useMemo<HeroCard[]>(
  () =>
    HERO_VARIANT_IDS.map((id) => {
      const v = CARD_VARIANTS.find((c) => c.id === id);
      return {
        nameKey: v?.name ?? '',
        bgImage: v?.bgImage,
      };
    }),
  [],
);
```

- [ ] **Step 2.2: Add the `next/image` import**

At the top of the file, after the `next/link` import:

```ts
import Image from 'next/image';
```

- [ ] **Step 2.3: Replace the card body markup**

In the `.map((card, index) =>` block, replace the existing `<div className="hero-card-main" …>` and all its inner children (the colored overlay, the top span row with emoji, the centered 120px emoji block, and the bottom brand row) with this body:

```tsx
return (
  <div
    key={index}
    className="hero-card-main"
    style={
      {
        '--card-x': `${x}px`,
        '--card-y': `${y}px`,
        '--card-rotate': rotate,
        '--card-scale': scale,
        zIndex: zIndexVal,
        opacity: opacity,
      } as React.CSSProperties
    }
    data-testid={`hero-card-${index}`}
  >
    {card.bgImage ? (
      <Image
        src={card.bgImage}
        alt=""
        fill
        priority={isLast}
        sizes="(max-width: 1150px) 60vw, 280px"
        className="hero-card-image"
      />
    ) : null}
    <div className="hero-card-scrim hero-card-scrim-top" />
    <div className="hero-card-scrim hero-card-scrim-bottom" />
    <div className="hero-card-name">
      {t(card.nameKey as TranslationKey) || card.nameKey}
    </div>
    <div className="hero-card-brand">{heroCardBrand}</div>
  </div>
);
```

Notes:

- `alt=""` is intentional — the card is decorative; the page title and CTAs convey meaning. The variant name appears as visible text on the card, so screen-reader users still get context.
- `priority={isLast}` keeps the front card eligible for LCP without preloading the two background cards.
- All four `data-testid` selectors (`hero-section`, `hero-visual`, `hero-card-stack`, `hero-card-${index}`) are preserved.

- [ ] **Step 2.4: Run the existing e2e to verify selectors still match**

Run:

```bash
pnpm --filter @arcadeum/web test:e2e -- homepage.spec.ts -g "Card stack"
```

(Look for the `hero-card-stack` assertion in `apps/web/e2e/homepage.spec.ts:85-100`.) Expected: PASS — count of `hero-card-*` is still 3.

If e2e setup is heavy in your environment and the test infra isn't ready, you can defer this and run it after Task 3; record that in the commit footer.

- [ ] **Step 2.5: Type-check + lint**

Run:

```bash
pnpm --filter @arcadeum/web typecheck
pnpm --filter @arcadeum/web lint
```

Expected: no errors. Note: the `Hero.styles.tsx` re-import (line 24 of `home-bundle.css` comment) is not affected; nothing else references `THEME_COLORS`.

- [ ] **Step 2.6: Commit**

```bash
git add apps/web/src/app/[locale]/home/components/HomeHero.tsx
git commit -m "feat(home): render hero cards with full-bleed variant artwork (ARC-734)"
```

---

## Task 3: Card surface styling — scrims, ring, shadow, shimmer

**Files:**

- Modify: `apps/web/src/app/[locale]/home/components/styles/home-bundle.css` (around lines 272–327)

### Steps

- [ ] **Step 3.1: Update `.hero-card-main` base rule (lines 282–303)**

Replace the existing `.hero-card-main` rule with:

```css
.hero-card-main {
  position: absolute;
  width: 280px;
  height: 380px;
  background: rgba(20, 22, 26, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 24px;
  overflow: hidden;
  isolation: isolate;
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.08),
    0 6px 14px rgba(0, 0, 0, 0.3),
    0 20px 40px -10px rgba(0, 0, 0, 0.55);
  transform: translate(var(--card-x), var(--card-y)) rotate(var(--card-rotate))
    scale(var(--card-scale));
  opacity: 0;
  transition:
    transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 0.6s ease-out,
    box-shadow 0.3s ease;
  pointer-events: none;
}
```

Key changes vs. current rule:

- `overflow: hidden` so the `next/image` fill + scrims clip to the rounded corners.
- `isolation: isolate` to keep the `::after` shimmer in its own stacking context.
- Multi-layer shadow (outer elevation + inner ring) replaces the single `0 10px 30px`.
- `backdrop-filter: blur` removed — the artwork now is the background, no blur needed.

- [ ] **Step 3.2: Add `.hero-card-image` and scrim rules immediately after `.hero-card-main`**

Insert (between the base rule and `.is-hydrated .hero-card-main`):

```css
.hero-card-image {
  object-fit: cover;
  object-position: center;
  z-index: 0;
  user-select: none;
  -webkit-user-drag: none;
}

.hero-card-scrim {
  position: absolute;
  left: 0;
  right: 0;
  pointer-events: none;
  z-index: 1;
}

.hero-card-scrim-top {
  top: 0;
  height: 45%;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.6) 0%,
    rgba(0, 0, 0, 0.25) 60%,
    rgba(0, 0, 0, 0) 100%
  );
}

.hero-card-scrim-bottom {
  bottom: 0;
  height: 50%;
  background: linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.7) 0%,
    rgba(0, 0, 0, 0.3) 55%,
    rgba(0, 0, 0, 0) 100%
  );
}

.hero-card-name {
  position: absolute;
  top: 22px;
  left: 24px;
  right: 24px;
  z-index: 2;
  color: #ffffff;
  font-weight: 600;
  font-size: 20px;
  letter-spacing: -0.005em;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
}

.hero-card-brand {
  position: absolute;
  bottom: 22px;
  left: 0;
  right: 0;
  z-index: 2;
  text-align: center;
  color: rgba(255, 255, 255, 0.78);
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
}
```

- [ ] **Step 3.3: Update `.hero-card-main:hover` (line 309) + add shimmer**

Replace the existing `.hero-card-main:hover` rule with:

```css
.hero-card-main:hover {
  transform: translate(var(--card-x), calc(var(--card-y) - 20px))
    rotate(var(--card-rotate)) scale(1.05) !important;
  z-index: 100 !important;
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.18),
    0 12px 24px rgba(0, 0, 0, 0.4),
    0 30px 60px -12px rgba(0, 0, 0, 0.7);
}

.hero-card-main::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 3;
  pointer-events: none;
  background: linear-gradient(
    120deg,
    transparent 30%,
    rgba(255, 255, 255, 0.08) 50%,
    transparent 70%
  );
  transform: translateX(-100%);
  transition: transform 1.6s ease;
}

.hero-card-main:hover::after {
  transform: translateX(100%);
}

@media (prefers-reduced-motion: reduce) {
  .hero-card-main::after,
  .hero-card-main:hover::after {
    transition: none;
    transform: translateX(-100%);
  }
}
```

- [ ] **Step 3.4: Update the mobile media query (lines 317–326)**

Replace the `@media (max-width: 1150px)` `.hero-card-main` background tweak. The dark fallback no longer makes sense once the card is an image; instead, leave the rule out entirely or, if you prefer to keep an explicit no-art fallback, scope it to a missing-image case. Recommended:

```css
@media (max-width: 1150px) {
  .hero-card-stack {
    margin-top: 60px;
    margin-bottom: 40px;
    transform: scale(0.85);
  }
}
```

(Drop the `.hero-card-main { background: rgba(30, 32, 35, 0.92); }` block — it overrode the artwork.)

- [ ] **Step 3.5: Visual smoke check**

Run:

```bash
pnpm --filter @arcadeum/web dev
```

Open `http://localhost:3000/en` in a desktop-width browser:

- Confirm the three cards show the AI artwork (fantasy / galaxy / steampunk) full-bleed.
- Confirm the variant name reads cleanly at the top, `CRITICAL` reads cleanly at the bottom.
- Hover the front card → the shimmer sweep happens once, smooth lift on hover.
- Resize to <1150px → the card stack scales to 0.85, no broken background.

Stop the dev server (Ctrl+C).

- [ ] **Step 3.6: File-length + lint + typecheck**

Run:

```bash
pnpm check-file-length
pnpm --filter @arcadeum/web lint
pnpm --filter @arcadeum/web typecheck
```

Expected: all pass. (`home-bundle.css` should stay well under 500 lines after this change.)

- [ ] **Step 3.7: Commit**

```bash
git add apps/web/src/app/[locale]/home/components/styles/home-bundle.css
git commit -m "style(home): premium scrims, inner ring, elevation, hover shimmer on hero cards (ARC-734)"
```

---

## Task 4: Full verification + e2e

**Files:** none (verification only)

### Steps

- [ ] **Step 4.1: Run web unit tests**

Run:

```bash
pnpm --filter @arcadeum/web test
```

Expected: all tests pass, including the new `criticalVariants.test.ts`.

- [ ] **Step 4.2: Run the homepage e2e**

Run:

```bash
pnpm --filter @arcadeum/web test:e2e -- homepage.spec.ts
```

Expected: hero-card-stack assertion (lines 85–100) passes; other homepage specs unaffected. If anything else breaks, the cause is unrelated to this ticket — surface, don't paper over.

- [ ] **Step 4.3: Performance spot-check**

Run dev (`pnpm --filter @arcadeum/web dev`), open DevTools → Network, hard-reload `http://localhost:3000/en`:

- The front card image should be requested as `image/avif` or `image/webp` (not the raw PNG).
- Total bytes for the three card images at the rendered 280×380 size should be well under 500 KB combined.
- LCP candidate (Lighthouse → Performance, or DevTools Performance panel) should include the front-card image, not the H1.

This is guidance, not a hard gate — log results and proceed.

- [ ] **Step 4.4: Reduced-motion check**

In DevTools → Rendering panel, enable `prefers-reduced-motion: reduce`. Reload. Hover the front card → no shimmer animation; the lift transform still happens.

- [ ] **Step 4.5: Final clean status**

Run:

```bash
git -C /Users/anatoliyaliaksandrau/js/arcadeum_claude status
git -C /Users/anatoliyaliaksandrau/js/arcadeum_claude log --oneline origin/develop..HEAD
```

Expected: clean tree; 4 commits ahead of `origin/develop` (spec + 3 implementation commits).

- [ ] **Step 4.6: Done — handoff**

The branch is ready for PR review. The user (AnAtoliy-AA) decides whether to push and open the PR (per project memory, pull develop before pushing — we branched from `origin/develop`, so the branch is already current).

---

## Out of scope (do not do in this plan)

- Don't migrate other CARD_VARIANTS consumers (games index, variant picker) to use `bgImage` — separate ticket.
- Don't generate new artwork for the variants that lack `bgImage`.
- Don't restructure `home-bundle.css` beyond the `.hero-card*` rules touched above.
- Don't touch `apps/web/e2e/homepage.spec.ts` — the existing selectors must still match.
