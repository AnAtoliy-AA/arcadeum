# Home Perf Phase 1: Audit + High-Confidence Wins — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** `docs/superpowers/specs/2026-05-06-home-perf-audit-design.md`
**Ticket:** ARC-570
**Goal:** Measure baseline Lighthouse on `/`, polish the existing in-progress diff, and apply audit-confirmed high-confidence wins to lift scores toward 100/100/100/100 (Phase 1 target: ≥90 mobile, ≥95 desktop across all four categories).

**Architecture:** Three sequential phases. Phase A measures (data drives Phase C decisions). Phase B applies unconditional polish to the existing diff. Phase C applies Section 3 wins conditionally — each is its own task; executor decides per task based on the audit data captured in Phase A. Phase D re-measures and documents.

**Tech Stack:** Next.js 15, Tamagui, pnpm workspaces (apps/web), Playwright MCP for Lighthouse, `@next/bundle-analyzer` for JS analysis.

**Working directory:** `/Users/anatoliyaliaksandrau/js/arcadeum`. Spec docs at `docs/superpowers/specs/` are gitignored — work in this directory but commit only code/config changes (under `apps/web/` and the repo-root `pnpm-lock.yaml` when dependencies change).

---

## File Inventory

### Created

- `docs/superpowers/specs/2026-05-06-home-perf-audit-results.md` — audit report (baseline + after-fix)
- `docs/superpowers/specs/lighthouse/` — directory for raw Lighthouse JSON exports
- `docs/superpowers/specs/2026-05-06-home-perf-phase-2-design.md` — Phase 2 spec stub

### Modified

- `apps/web/package.json` — add `@next/bundle-analyzer` devDependency
- `apps/web/next.config.ts` — wire bundle analyzer; tighten `remotePatterns`
- `apps/web/src/app/home/components/styles/hero-stable.css` — revert mobile `backdrop-filter`
- `apps/web/src/app/home/components/WebPresentation.tsx` — consolidate preload effects
- (Conditional, Phase C) various home components per audit findings

---

## Phase A — Setup & Baseline Measurement

### Task A1: Install `@next/bundle-analyzer`

**Files:**

- Modify: `apps/web/package.json`

- [ ] **Step 1: Install dependency**

```bash
pnpm --filter @arcadeum/web add -D @next/bundle-analyzer
```

- [ ] **Step 2: Verify install**

```bash
grep -A1 "@next/bundle-analyzer" apps/web/package.json
```

Expected: line showing `@next/bundle-analyzer` in `devDependencies`.

- [ ] **Step 3: Commit**

```bash
git add apps/web/package.json pnpm-lock.yaml
git commit -m "chore(ARC-570): add @next/bundle-analyzer dev dep"
```

---

### Task A2: Wire bundle analyzer into `next.config.ts`

**Files:**

- Modify: `apps/web/next.config.ts`

- [ ] **Step 1: Add the analyzer wrapper at the top of the file (after existing imports)**

Locate the existing imports (top of file). Add:

```typescript
import withBundleAnalyzer from '@next/bundle-analyzer';

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});
```

- [ ] **Step 2: Wrap the final exported config**

Find the final `export default` (currently wrapping with `withPWA(tamaguiPlugin(nextConfig))` or similar). Wrap with `bundleAnalyzer(...)`:

Before:

```typescript
export default withPWA(tamaguiPlugin(nextConfig));
```

After:

```typescript
export default bundleAnalyzer(withPWA(tamaguiPlugin(nextConfig)));
```

(Adjust to match the exact existing wrapper order; the analyzer is the outermost wrapper.)

- [ ] **Step 3: Verify config still type-checks**

```bash
pnpm --filter @arcadeum/web typecheck
```

Expected: no new TS errors related to the analyzer wiring.

- [ ] **Step 4: Verify analyzer runs (dry test, off)**

```bash
pnpm --filter @arcadeum/web build
```

Expected: build completes; no analyzer report opens (env var not set).

- [ ] **Step 5: Commit**

```bash
git add apps/web/next.config.ts
git commit -m "build(ARC-570): wire bundle analyzer behind ANALYZE env"
```

---

### Task A3: Capture baseline production build

**Files:** none modified.

- [ ] **Step 1: Clean prior builds**

```bash
rm -rf apps/web/.next
```

- [ ] **Step 2: Production build**

```bash
pnpm --filter @arcadeum/web build 2>&1 | tee /tmp/arc570-build-baseline.log
```

Expected: build completes with no errors. Note the route summary table at the end (sizes per route — capture for `/`).

- [ ] **Step 3: Save build summary**

Extract the route table for `/` from `/tmp/arc570-build-baseline.log` and save the relevant lines for inclusion in the audit report (Task A8).

---

### Task A4: Capture baseline bundle analyzer

**Files:** none modified (output is `.next/analyze/`).

- [ ] **Step 1: Run with analyzer enabled**

```bash
ANALYZE=true pnpm --filter @arcadeum/web build
```

Expected: build completes; analyzer writes reports to `apps/web/.next/analyze/client.html`, `nodejs.html`, `edge.html`. They may auto-open in a browser.

- [ ] **Step 2: Capture top contributors for `/` route**

Open `apps/web/.next/analyze/client.html` (or use Playwright MCP if no browser handy) and identify:

- Total client JS for the `/` route
- Top 10 largest modules contributing to that bundle (treemap)

Save as a list for Task A8.

---

### Task A5: Run baseline Lighthouse (mobile, 3× median)

**Prerequisite:** Production server must be running locally. Open a separate terminal and run `pnpm --filter @arcadeum/web start` — leave it running.

**Files:** none modified yet (JSON saved in Task A8).

- [ ] **Step 1: Start production server in background**

```bash
pnpm --filter @arcadeum/web start &
```

Wait until output indicates server is ready (`Local: http://localhost:3000`).

- [ ] **Step 2: Run Lighthouse — Run 1 (mobile)**

**Preferred:** Playwright MCP — `browser_navigate` to `http://localhost:3000` with a fresh context, then drive Lighthouse via the page.

**Fallback (recommended for predictability):** install Lighthouse CLI and run from terminal:

```bash
npx -y lighthouse http://localhost:3000 --preset=desktop --form-factor=mobile --throttling-method=simulate --output=json --output-path=docs/superpowers/specs/lighthouse/baseline-mobile-1.json --chrome-flags="--headless=new"
```

(Adjust the `--preset` and `--form-factor` flags to mobile defaults; CLI mobile preset already simulates Moto G4 + Slow 4G + 4× CPU.)

Capture from JSON: scores for Performance / Accessibility / Best Practices / SEO; metrics LCP, CLS, TBT, FCP, INP, TTI; top 10 opportunities; top 10 diagnostics.

Save raw JSON to `docs/superpowers/specs/lighthouse/baseline-mobile-1.json`.

- [ ] **Step 3: Run Lighthouse — Run 2 (mobile)**

Repeat with a fresh browser context. Save to `docs/superpowers/specs/lighthouse/baseline-mobile-2.json`.

- [ ] **Step 4: Run Lighthouse — Run 3 (mobile)**

Repeat with a fresh browser context. Save to `docs/superpowers/specs/lighthouse/baseline-mobile-3.json`.

- [ ] **Step 5: Compute medians**

For each metric and category score, take the median of the 3 runs. Record for Task A8.

---

### Task A6: Run baseline Lighthouse (desktop, 3× median)

**Files:** none modified yet.

- [ ] **Step 1: Run Lighthouse — Run 1 (desktop)**

Same procedure as A5 but with desktop preset (no CPU throttle, fast network). Save to `docs/superpowers/specs/lighthouse/baseline-desktop-1.json`.

- [ ] **Step 2: Run Lighthouse — Run 2 (desktop)**

Save to `docs/superpowers/specs/lighthouse/baseline-desktop-2.json`.

- [ ] **Step 3: Run Lighthouse — Run 3 (desktop)**

Save to `docs/superpowers/specs/lighthouse/baseline-desktop-3.json`.

- [ ] **Step 4: Compute medians**

Record for Task A8.

- [ ] **Step 5: Stop the production server**

```bash
pkill -f "next start" || true
```

---

### Task A7: Static review of home components

**Files:** none modified — produces a findings list.

- [ ] **Step 1: Read each home component end-to-end**

```bash
ls apps/web/src/app/home/components/*.tsx
```

For each file, verify:

- Is `'use client'` necessary? (Does it use hooks, browser APIs, or event handlers? If not, flag for Phase 2.)
- Are all `<Image>` components given `width` + `height` (or `fill` with a sized parent)?
- Are there inline styles that force layout recalc on every render?
- Are decorative animations gated by `prefers-reduced-motion`?
- Are below-fold heavy components dynamically imported?
- Is alt text present and meaningful on all images?

- [ ] **Step 2: Read `apps/web/src/app/layout.tsx`**

Inventory third-party scripts loaded globally (analytics, error reporting, anything via `<Script>` or imported provider that loads SDKs). Note which are above-the-fold-blocking.

- [ ] **Step 3: Read styles**

```bash
ls apps/web/src/app/home/components/styles/
ls apps/web/src/app/styles/
```

For each CSS file, identify:

- Unused keyframes (referenced classes don't exist anywhere)
- Infinite animations on properties that trigger compositor work (filter, backdrop-filter, transform with z change)
- Selectors with high specificity that may indicate dead code

- [ ] **Step 4: Save findings**

Compile findings into a list for Task A8 under "Static review findings".

---

### Task A8: Write baseline section of audit report

**Files:**

- Create: `docs/superpowers/specs/2026-05-06-home-perf-audit-results.md`

- [ ] **Step 1: Create the audit report file with baseline data**

Use this template:

```markdown
# Home Page Performance Audit Results — ARC-570

**Spec:** `docs/superpowers/specs/2026-05-06-home-perf-audit-design.md`
**Date:** 2026-05-06
**Environment:** [machine model, CPU, RAM, OS]

## Baseline Scores (current branch with in-progress diff)

### Mobile (Moto G4 / Slow 4G / 4× CPU)

| Category       | Score (median of 3 runs) |
| -------------- | ------------------------ |
| Performance    | XX                       |
| Accessibility  | XX                       |
| Best Practices | XX                       |
| SEO            | XX                       |

| Metric | Median |
| ------ | ------ |
| LCP    | X.Xs   |
| CLS    | 0.XX   |
| TBT    | XXXms  |
| FCP    | X.Xs   |
| INP    | XXms   |
| TTI    | X.Xs   |

### Desktop

| Category       | Score (median of 3 runs) |
| -------------- | ------------------------ |
| Performance    | XX                       |
| Accessibility  | XX                       |
| Best Practices | XX                       |
| SEO            | XX                       |

| Metric | Median |
| ------ | ------ |
| LCP    | X.Xs   |
| CLS    | 0.XX   |
| TBT    | XXXms  |
| FCP    | X.Xs   |
| INP    | XXms   |
| TTI    | X.Xs   |

## Top Lighthouse Opportunities (mobile)

1. [opportunity name] — [estimated savings]
   ... (top 10)

## Top Lighthouse Diagnostics (mobile)

1. [diagnostic] — [detail]
   ... (top 10)

## Bundle Analyzer Summary

- Total client JS for `/`: XXX KB
- Top 10 contributors:
  1. [module] — XX KB
     ...

## Static Review Findings

- [Component]: [issue]
- ...

## Section 3 Decision Matrix (filled during Phase C)

| #   | Item                                          | Decision | Audit Evidence |
| --- | --------------------------------------------- | -------- | -------------- |
| 1   | Add explicit width/height on home Images      | TBD      | TBD            |
| 2   | Defer below-fold via next/dynamic             | TBD      | TBD            |
| 3   | Cull entrance animations on slow CPU/saveData | TBD      | TBD            |
| 4   | Defer 3rd-party scripts                       | TBD      | TBD            |
| 5   | Verify AVIF/WebP served                       | TBD      | TBD            |
| 6   | Drop unused keyframes from animations.css     | TBD      | TBD            |
| 7   | Alt text audit                                | TBD      | TBD            |
| 8   | Color contrast audit                          | TBD      | TBD            |
| 9   | Semantic landmarks + heading order            | TBD      | TBD            |
| 10  | Focus indicators on links/slider              | TBD      | TBD            |
| 11  | Slider keyboard navigation                    | TBD      | TBD            |
| 12  | Console errors sweep                          | TBD      | TBD            |
| 13  | Source maps in prod                           | TBD      | TBD            |
| 14  | Deprecated APIs                               | TBD      | TBD            |
| 15  | Image aspect ratios                           | TBD      | TBD            |
| 16  | Metadata completeness                         | TBD      | TBD            |
| 17  | JSON-LD WebSite + Organization                | TBD      | TBD            |
| 18  | Canonical URL                                 | TBD      | TBD            |
| 19  | Robots / sitemap                              | TBD      | TBD            |
| 20  | `<html lang>` matches locale                  | TBD      | TBD            |

## After-Fix Scores (filled during Phase D)

[same tables as baseline, filled after Task D1/D2]

## Score Deltas

[filled during Phase D]
```

- [ ] **Step 2: Fill in baseline numbers from Tasks A3–A7**

Replace all `XX` and `TBD` (in the score tables, opportunities, diagnostics, bundle, static findings sections) with the captured medians and lists. Leave the Section 3 decision column as `TBD` — those are filled in Phase C.

- [ ] **Step 3: Note**

Spec docs are gitignored — do not stage. The file lives on disk for reference.

---

## Phase B — In-progress diff polish (unconditional)

These three changes are decided independent of audit data.

### Task B1: Tighten `remotePatterns` in `next.config.ts`

**Files:**

- Modify: `apps/web/next.config.ts`

- [ ] **Step 1: Audit which remote image hosts are actually used**

```bash
grep -rEn "src=[\"']https://" apps/web/src apps/web/public 2>/dev/null | head -20
grep -rEn "image:.*https://" apps/web/src 2>/dev/null | head -20
```

Note: also check `next/image` `<Image src>` calls. Compile a list of unique HTTPS hosts used as image sources.

- [ ] **Step 2: Replace `'**'` wildcard with explicit hostnames\*\*

Before:

```typescript
remotePatterns: [
  {
    protocol: 'https',
    hostname: '**',
  },
],
```

After (substitute real hostnames found in Step 1; if none, drop `remotePatterns` entirely):

```typescript
remotePatterns: [
  // Add specific hostnames found in Step 1; example:
  // { protocol: 'https', hostname: 'images.unsplash.com' },
  // { protocol: 'https', hostname: 'arcadeum.games' },
],
```

If the list is empty (no remote images currently used), remove the `remotePatterns` key entirely. We can add hosts later when needed.

- [ ] **Step 3: Verify build still works**

```bash
pnpm --filter @arcadeum/web build
```

Expected: build completes. If any image fails to optimize, the build will warn — capture and add the relevant host back.

- [ ] **Step 4: Commit**

```bash
git add apps/web/next.config.ts
git commit -m "fix(ARC-570): replace remote image wildcard with explicit hosts"
```

---

### Task B2: Revert `backdrop-filter` on mobile hero cards

**Files:**

- Modify: `apps/web/src/app/home/components/styles/hero-stable.css`

- [ ] **Step 1: Locate the mobile media block**

In `apps/web/src/app/home/components/styles/hero-stable.css`, find the in-progress addition (around the bottom of the file):

```css
@media (max-width: ...) {
  .hero-card-main {
    backdrop-filter: blur(8px);
    background: rgba(30, 32, 35, 0.92);
  }
}
```

- [ ] **Step 2: Remove the `backdrop-filter` line**

Keep the `background: rgba(30, 32, 35, 0.92);` rule (it's an opaque-ish background that achieves visual contrast cheaply). Remove only the `backdrop-filter: blur(8px);` line.

After:

```css
@media (max-width: ...) {
  .hero-card-main {
    background: rgba(30, 32, 35, 0.92);
  }
}
```

- [ ] **Step 3: Visually confirm no regression**

Start dev server (`pnpm --filter @arcadeum/web dev`), open `http://localhost:3000` on mobile viewport (DevTools 360px width), confirm hero cards still look acceptable. (User confirmed there's no visual regression to preserve, so this should pass without surprises.)

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/home/components/styles/hero-stable.css
git commit -m "perf(ARC-570): drop expensive backdrop-filter from mobile hero cards"
```

---

### Task B3: Consolidate `WebPresentation` preload effects

**Files:**

- Modify: `apps/web/src/app/home/components/WebPresentation.tsx`

The in-progress diff added a `useEffect` that depends on `currentSlide` and updates `loadedIndices` based on mobile vs desktop. There's already a separate `updateLoadedSlides` callback in the file. They likely overlap — consolidate into one.

- [ ] **Step 1: Read the current state of `WebPresentation.tsx`**

```bash
cat apps/web/src/app/home/components/WebPresentation.tsx
```

Identify both code paths:

- Existing `updateLoadedSlides` (likely called from the `prevSlide`/`nextSlide` callbacks)
- New `useEffect` on `[currentSlide]` that writes to `loadedIndices`

- [ ] **Step 2: Pick one source of truth**

Use the `useEffect` keyed on `[currentSlide]` (the new code) as the single source of truth. Remove `updateLoadedSlides` if its only callers are the slide-change callbacks (since the effect will fire after `setCurrentSlide`).

If `updateLoadedSlides` has other behavior (e.g., it preloads images explicitly, not just sets indices), keep that explicit-preload behavior but call it from inside the effect, not separately from each callback.

- [ ] **Step 3: Confirm the effect handles initial mount**

The effect with dep `[currentSlide]` runs on mount with `currentSlide = 0`. Verify that on first render, slide 0 (and its neighbors per the mobile/desktop split) is in `loadedIndices`. If not, set the initial state of `loadedIndices` accordingly.

- [ ] **Step 4: Verify type-check + lint**

```bash
pnpm --filter @arcadeum/web typecheck
pnpm --filter @arcadeum/web lint
```

Expected: clean.

- [ ] **Step 5: Manual test in browser**

```bash
pnpm --filter @arcadeum/web dev
```

Open `http://localhost:3000`, scroll to the slider, click next/prev, confirm slides cycle and images load. On a mobile viewport, watch Network tab — only current+next slide images should be requested initially.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/app/home/components/WebPresentation.tsx
git commit -m "refactor(ARC-570): consolidate WebPresentation preload into single effect"
```

---

## Phase C — Apply Section 3 wins (conditional on audit data)

For each item below: **read the audit report from Task A8**, decide Apply / Skip / Phase 2, fill the decision matrix entry, and execute the apply task only if the decision is "Apply".

If you decide "Skip (already passing)" or "Phase 2 (too risky/large for Phase 1)", record the reason in the decision matrix and move to the next item — don't execute the implementation steps.

### Task C0: Make Phase C decisions

**Files:**

- Modify: `docs/superpowers/specs/2026-05-06-home-perf-audit-results.md`

- [ ] **Step 1: Read the audit report**

```bash
cat docs/superpowers/specs/2026-05-06-home-perf-audit-results.md
```

- [ ] **Step 2: For each of the 20 Section 3 items, fill in the decision matrix**

For each row in the matrix:

- **Apply** if the audit shows a leak this change addresses AND the change is low-risk
- **Skip** if Lighthouse shows the category is already passing OR the issue doesn't exist on this page
- **Phase 2** if the fix is non-trivial (e.g., requires architectural change like converting to Server Component) — leave for the Phase 2 spec stub

Each row should have a one-sentence "Audit Evidence" referencing the score, opportunity, or diagnostic that drove the decision.

- [ ] **Step 3: Record decisions**

Save the updated audit results doc.

---

### Task C1: Add explicit dimensions to all Home `<Image>` components (if Apply)

**Files:**

- Modify: home components that use `<Image>` (likely `WebPresentation.tsx`, `HomeGames.tsx`, `HomeFeatures.tsx`, `HomeFooter.tsx`, `HomePresentation.tsx`)

**Skip if:** baseline CLS = 0 already.

- [ ] **Step 1: Find all `<Image>` usages in home**

```bash
grep -rn "from 'next/image'" apps/web/src/app/home/
grep -rn "<Image" apps/web/src/app/home/
```

- [ ] **Step 2: For each `<Image>` without `fill`**

Verify both `width` and `height` props are present. Add them if missing (use natural dimensions of the source).

- [ ] **Step 3: For each `<Image fill>`**

Verify the parent has `position: relative` and explicit dimensions (height + width or aspect-ratio). Add if missing.

- [ ] **Step 4: Verify**

```bash
pnpm --filter @arcadeum/web build
```

Run a quick local Lighthouse and confirm CLS is 0.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/app/home/
git commit -m "fix(ARC-570): add explicit dimensions to home Images for CLS=0"
```

---

### Task C2: Defer below-fold sections via `next/dynamic` (if Apply)

**Files:**

- Modify: `apps/web/src/app/home/HomePage.tsx` (where below-fold sections are imported)

**Skip if:** mobile Performance is already ≥95 AND no opportunity flagged "Reduce unused JavaScript" or "Avoid enormous network payloads".

- [ ] **Step 1: Confirm client/server status of each candidate**

```bash
head -1 apps/web/src/app/home/components/HomeFeatures.tsx
head -1 apps/web/src/app/home/components/HomeGames.tsx
head -1 apps/web/src/app/home/components/HomeFooter.tsx
head -1 apps/web/src/app/home/components/HomePresentation.tsx
```

For each: if line 1 is `'use client'`, use `next/dynamic` with `ssr: false`. If it's a Server Component, dynamic import is different — defer that one to Phase 2 instead (don't try to dynamic-import server components in this task).

- [ ] **Step 2: Convert imports in `HomePage.tsx`**

For each client component eligible:

Before:

```typescript
import { HomeFeatures } from './components/HomeFeatures';
```

After (use a dedicated CSS class, not inline style — matches project conventions):

```typescript
import dynamic from 'next/dynamic';
const HomeFeatures = dynamic(() => import('./components/HomeFeatures').then(m => m.HomeFeatures), {
  ssr: false,
  loading: () => <div className="home-section-placeholder home-section-placeholder--features" aria-hidden />,
});
```

Add the placeholder class with the right min-height per section to an existing home stylesheet (e.g., `apps/web/src/app/home/components/styles/`):

```css
.home-section-placeholder {
  width: 100%;
}
.home-section-placeholder--features {
  min-height: 600px;
}
.home-section-placeholder--games {
  min-height: 800px;
}
.home-section-placeholder--footer {
  min-height: 320px;
}
.home-section-placeholder--presentation {
  min-height: 700px;
}
```

(Adjust min-heights per section to match the rendered height — get from DevTools.)

- [ ] **Step 3: Verify type-check**

```bash
pnpm --filter @arcadeum/web typecheck
```

- [ ] **Step 4: Build + manual CLS check**

```bash
pnpm --filter @arcadeum/web build && pnpm --filter @arcadeum/web start &
```

Open `http://localhost:3000`, scroll, watch DevTools Performance → Layout Shift events. CLS should remain ≤ baseline.

- [ ] **Step 5: Stop server, commit**

```bash
pkill -f "next start" || true
git add apps/web/src/app/home/HomePage.tsx
git commit -m "perf(ARC-570): defer below-fold home sections via next/dynamic"
```

---

### Task C3: Cull entrance animations on slow-CPU/saveData (if Apply)

**Files:**

- Modify: `apps/web/src/app/home/components/HomeHero.tsx`

**Skip if:** mobile TBT is already ≤200ms.

- [ ] **Step 1: Detect slow-CPU/saveData on mount**

In `HomeHero.tsx`, expand the existing `useEffect` that adds `is-hydrated`:

```typescript
useEffect(() => {
  const conn = (
    navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }
  ).connection;
  const reduceMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches;
  const slowConn =
    conn?.saveData === true ||
    conn?.effectiveType === 'slow-2g' ||
    conn?.effectiveType === '2g';

  if (reduceMotion || slowConn) {
    sectionRef.current?.classList.add('is-hydrated', 'no-anim');
  } else {
    sectionRef.current?.classList.add('is-hydrated');
  }
}, []);
```

- [ ] **Step 2: Add the `.no-anim` CSS rule to `hero-stable.css`**

```css
.hero-section-container.no-anim .animate-fade-in-up,
.hero-section-container.no-anim .hero-title-shimmer,
.hero-section-container.no-anim .hero-card-main {
  animation: none !important;
  transition: none !important;
  opacity: 1 !important;
}
```

- [ ] **Step 3: Type-check**

```bash
pnpm --filter @arcadeum/web typecheck
```

- [ ] **Step 4: Manual test**

In DevTools, enable CPU throttle 6× and reload. Confirm hero is visible immediately with no entrance animation. Disable throttle, reload — animations should play normally.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/app/home/components/HomeHero.tsx apps/web/src/app/home/components/styles/hero-stable.css
git commit -m "perf(ARC-570): skip hero entrance animations on slow CPU / saveData"
```

---

### Task C4: Defer third-party scripts to `lazyOnload` (if Apply)

**Files:**

- Modify: depends on what scripts exist (likely none — `apps/web/src/app/layout.tsx` already does not contain `<Script>` tags). Most third-party loading happens via the Tamagui provider, PWA, or via dynamic SDKs in `BrowserRegistry`.

**Skip if:** Task A7 found no `<Script>` tags and no eager third-party SDK loads.

- [ ] **Step 1: Re-confirm what runs on `/`**

```bash
grep -rn "from 'next/script'" apps/web/src/
grep -rn "<Script" apps/web/src/
```

- [ ] **Step 2: For each `<Script>` not strictly required at first paint**

Add `strategy="lazyOnload"` (or `afterInteractive` if it must run before user interaction).

- [ ] **Step 3: For non-Script SDKs loaded eagerly**

If audit shows e.g. an analytics SDK costs measurable TBT, wrap its initialization in a `requestIdleCallback` or move it inside an effect. Discuss with user before changing global providers — this is risky.

- [ ] **Step 4: Build + verify scores**

Spot-check with one quick Lighthouse run.

- [ ] **Step 5: Commit (only if changes made)**

```bash
git add apps/web/src/
git commit -m "perf(ARC-570): defer non-critical third-party scripts to lazyOnload"
```

---

### Task C5: Verify AVIF/WebP served on `/` (if Apply)

**Files:** none modified — verification only.

**Always do this; it's a verification of Task A1's config change.**

- [ ] **Step 1: Build + start prod**

```bash
pnpm --filter @arcadeum/web build && pnpm --filter @arcadeum/web start &
```

- [ ] **Step 2: Navigate via Playwright MCP, capture image responses**

Use `browser_network_requests` after `browser_navigate` to `http://localhost:3000`. Filter for image requests. Confirm `Content-Type: image/avif` or `image/webp` in responses for `<Image>`-sourced images.

- [ ] **Step 3: Record evidence**

Add a line to the audit report under "Section 3 Decision Matrix" row 5: "Confirmed AVIF served for [list 2–3 image URLs]".

- [ ] **Step 4: Stop server**

```bash
pkill -f "next start" || true
```

No commit — verification only.

---

### Task C6: Drop unused keyframes from `animations.css` (if Apply)

**Files:**

- Modify: `apps/web/src/app/styles/animations.css`

**Skip if:** Lighthouse "Reduce unused CSS" opportunity savings < 5 KB on mobile.

- [ ] **Step 1: List all `@keyframes` in the file**

```bash
grep -n "^@keyframes" apps/web/src/app/styles/animations.css
```

- [ ] **Step 2: For each keyframe name, search for usage**

```bash
for kf in $(grep -oE "^@keyframes [a-zA-Z0-9_-]+" apps/web/src/app/styles/animations.css | awk '{print $2}'); do
  count=$(grep -rEn "animation[^:]*:[^;]*\b$kf\b" apps/web/src --include="*.tsx" --include="*.ts" --include="*.css" | wc -l | tr -d ' ')
  echo "$kf: $count references"
done
```

- [ ] **Step 3: Remove keyframes with 0 references**

Edit `animations.css`, delete the entire `@keyframes <name> { ... }` block for each unused name.

- [ ] **Step 4: Build + visual smoke test**

```bash
pnpm --filter @arcadeum/web build
```

Open the home page and confirm nothing visually broke.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/app/styles/animations.css
git commit -m "chore(ARC-570): drop unused @keyframes from animations.css"
```

---

### Task C7: Alt text audit on home `<Image>` (if Apply)

**Files:** depends on findings.

**Skip if:** Lighthouse Accessibility shows no "Image elements do not have [alt] attributes" issues.

- [ ] **Step 1: List all `<Image>` in home and their alt props**

```bash
grep -rEn "<Image[^>]*alt=" apps/web/src/app/home/
grep -rEn "<Image" apps/web/src/app/home/ | grep -v "alt="
```

The second command shows `<Image>` without `alt=` on the same line — manual review needed for those.

- [ ] **Step 2: For each missing or empty alt**

Add a meaningful description. If the image is purely decorative, use `alt=""` (empty string is correct for decorative images).

- [ ] **Step 3: Type-check + commit**

```bash
pnpm --filter @arcadeum/web typecheck
git add apps/web/src/app/home/
git commit -m "a11y(ARC-570): add meaningful alt text to home page images"
```

---

### Task C8: Color contrast audit (if Apply)

**Files:** depends on findings (likely `apps/web/src/app/home/components/styles/hero-stable.css` and CSS modules).

**Skip if:** Lighthouse Accessibility shows no contrast failures.

- [ ] **Step 1: Note the failing pairs from Lighthouse**

Each failing pair will list foreground + background colors and computed ratio.

- [ ] **Step 2: Adjust colors to reach WCAG AA (4.5:1 for body, 3:1 for large text)**

Use design tokens from `packages/ui/src/tamagui.config.ts` (per CLAUDE.md). Don't hand-pick colors — pick the next darker/lighter token in the palette.

- [ ] **Step 3: Re-run only the Accessibility audit**

```bash
# After build + start
# Use Playwright MCP to run a quick a11y-only Lighthouse pass
```

Confirm contrast issues cleared.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/
git commit -m "a11y(ARC-570): fix color contrast on home per Lighthouse"
```

---

### Task C9: Heading hierarchy + landmarks (if Apply)

**Files:** depends on findings.

**Skip if:** Lighthouse shows no "Heading elements are not in a sequentially-descending order" or "Document does not have a `<main>` landmark" issues.

- [ ] **Step 1: Identify the heading order in `HomePage.tsx`** and each section component

Verify there's exactly one `<h1>` (the hero title), and `<h2>`/`<h3>` follow the visual hierarchy.

- [ ] **Step 2: Verify `<main>` landmark exists**

The app's root layout should provide `<main>` (or the page should). If missing, add `<main>` around the page content in `HomePage.tsx`.

- [ ] **Step 3: Commit if changes made**

```bash
git add apps/web/src/app/home/
git commit -m "a11y(ARC-570): fix heading hierarchy and landmarks on home"
```

---

### Task C10: Focus indicators on links/slider (if Apply)

**Files:** likely `apps/web/src/app/home/components/styles/hero-stable.css` and slider styles.

**Skip if:** Lighthouse Accessibility shows no focus-visibility issues.

- [ ] **Step 1: Verify focus-visible styling on `home-link-button` classes**

Check the CSS for `:focus-visible` rules. If absent, add:

```css
.home-link-button:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
```

- [ ] **Step 2: Verify slider controls have focus indicators**

Check `WebPresentation.tsx` for the prev/next buttons and dot indicators. Apply similar `:focus-visible` styling if missing.

- [ ] **Step 3: Manual test**

Tab through the home page; confirm focus is visible on every interactive element.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/home/
git commit -m "a11y(ARC-570): add focus-visible indicators on home interactive elements"
```

---

### Task C11: Slider keyboard navigation (if Apply)

**Files:** `apps/web/src/app/home/components/WebPresentation.tsx`

**Skip if:** Lighthouse doesn't flag and slider already responds to keyboard.

- [ ] **Step 1: Test current keyboard behavior**

Tab to slider region, press Left/Right arrows. Does it cycle? If not, add a `keydown` handler on the slider container:

```typescript
const onKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'ArrowLeft') prevSlide();
  if (e.key === 'ArrowRight') nextSlide();
};
```

Apply to the slider container with `tabIndex={0}` and an appropriate `role="region" aria-label="Feature presentation"`.

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/app/home/components/WebPresentation.tsx
git commit -m "a11y(ARC-570): keyboard navigation for WebPresentation slider"
```

---

### Task C12: Console errors sweep (if Apply)

**Files:** depends on findings.

**Skip if:** Lighthouse Best Practices shows no console errors.

- [ ] **Step 1: Reproduce locally**

```bash
pnpm --filter @arcadeum/web build && pnpm --filter @arcadeum/web start &
```

Open `http://localhost:3000` in Chrome with DevTools. Capture every Console error/warning on first load.

- [ ] **Step 2: Fix root causes**

For each error, identify the source and fix. Common ones: missing keys in lists, hydration mismatches, deprecated React APIs.

- [ ] **Step 3: Verify console clean**

Reload, confirm no errors/warnings on first load.

- [ ] **Step 4: Stop server, commit**

```bash
pkill -f "next start" || true
git add apps/web/src/
git commit -m "fix(ARC-570): clear console errors/warnings on home page load"
```

---

### Task C13: Source maps in production (if Apply)

**Files:** `apps/web/next.config.ts`

**Skip if:** Lighthouse Best Practices does NOT flag missing source maps OR your build already emits them.

- [ ] **Step 1: Check current behavior**

```bash
ls apps/web/.next/static/chunks/*.map | head -5
```

If files exist, source maps are already emitted. Skip this task.

- [ ] **Step 2: Enable if not already**

In `next.config.ts`, ensure `productionBrowserSourceMaps: true`. Note: this increases build size — acceptable for the audit category.

- [ ] **Step 3: Commit**

```bash
git add apps/web/next.config.ts
git commit -m "build(ARC-570): emit production source maps"
```

---

### Task C14: Deprecated APIs (if Apply)

**Files:** depends on findings.

**Skip if:** Lighthouse Best Practices shows no deprecated API usage.

- [ ] **Step 1: List the flagged APIs from Lighthouse**

- [ ] **Step 2: For each, replace with the modern equivalent**

Common cases: `document.execCommand` → Clipboard API; old IntersectionObserver options; deprecated React lifecycle methods.

- [ ] **Step 3: Type-check, commit**

```bash
pnpm --filter @arcadeum/web typecheck
git add apps/web/src/
git commit -m "chore(ARC-570): replace deprecated APIs flagged by Lighthouse"
```

---

### Task C15: Image aspect ratios (if Apply)

**Files:** depends on findings.

**Skip if:** Lighthouse doesn't flag "Displays images with incorrect aspect ratio".

- [ ] **Step 1: For each flagged image**

Adjust `width`/`height` props to match the natural source dimensions, OR change the CSS so the rendered ratio matches.

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/
git commit -m "fix(ARC-570): correct image aspect ratios on home"
```

---

### Task C16: Metadata completeness on `/` (if Apply)

**Files:** `apps/web/src/app/page.tsx` (the home page) or wherever `metadata` is exported for `/`.

**Skip if:** Lighthouse SEO is already 100.

- [ ] **Step 1: Check current `/` metadata**

```bash
grep -A 30 "export const metadata" apps/web/src/app/page.tsx 2>/dev/null
```

If `/` falls back to root layout metadata, that's already comprehensive (verified in Task A7). Confirm Lighthouse SEO opportunities don't flag missing fields.

- [ ] **Step 2: Add per-route metadata if needed**

If Lighthouse flags missing description, OG image, or canonical, add a `metadata` export to `apps/web/src/app/page.tsx`:

```typescript
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '...',
  description: '...',
  alternates: { canonical: appConfig.siteUrl },
};
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/page.tsx
git commit -m "seo(ARC-570): complete metadata on home route"
```

---

### Task C17: JSON-LD structured data (if Apply)

**Files:** likely already handled in `apps/web/src/app/layout.tsx` (verified in Task A7).

**Skip if:** Task A7 confirmed JSON-LD WebSite + Organization already present.

If somehow missing, add via the `JsonLd` component already used in the layout.

---

### Task C18: Canonical URL (if Apply)

**Files:** `apps/web/src/app/layout.tsx` or per-page metadata.

**Skip if:** Lighthouse SEO doesn't flag missing canonical AND `alternates.canonical` is set in metadata.

- [ ] **Step 1: Verify canonical**

```bash
grep -n "canonical" apps/web/src/app/layout.tsx apps/web/src/app/page.tsx 2>/dev/null
```

- [ ] **Step 2: Add if missing**

Either in root metadata or page-specific metadata.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/
git commit -m "seo(ARC-570): set canonical URL"
```

---

### Task C19: Robots / sitemap (if Apply)

**Files:** `apps/web/src/app/robots.ts`, `apps/web/src/app/sitemap.ts` (already exist per `ls` output).

**Skip if:** Lighthouse SEO doesn't flag robots/sitemap issues AND `/` is in sitemap output.

- [ ] **Step 1: Verify robots allows indexing in prod**

```bash
cat apps/web/src/app/robots.ts
```

- [ ] **Step 2: Verify sitemap includes `/`**

```bash
cat apps/web/src/app/sitemap.ts | grep -A2 -B2 "url:"
```

- [ ] **Step 3: Commit if changes**

```bash
git add apps/web/src/app/
git commit -m "seo(ARC-570): ensure home page in sitemap and robots correct"
```

---

### Task C20: `<html lang>` matches locale (if Apply)

**Files:** `apps/web/src/app/layout.tsx` (already correct per Task A7 — uses `locale` from cookies).

**Skip:** verified in Task A7. No action needed.

If somehow incorrect, the existing `<html lang={locale}>` is the right pattern.

---

## Phase D — Re-audit & document

### Task D1: Re-run Lighthouse (mobile + desktop, 3× median)

**Prerequisite:** All Phase C "Apply" tasks complete and committed.

**Files:** Lighthouse JSON saved to `docs/superpowers/specs/lighthouse/`.

- [ ] **Step 1: Production build + start**

```bash
rm -rf apps/web/.next
pnpm --filter @arcadeum/web build
pnpm --filter @arcadeum/web start &
```

Wait until ready.

- [ ] **Step 2: Run mobile Lighthouse 3 times**

Save JSON to `docs/superpowers/specs/lighthouse/after-mobile-{1,2,3}.json`. Compute median scores and metrics.

- [ ] **Step 3: Run desktop Lighthouse 3 times**

Save JSON to `docs/superpowers/specs/lighthouse/after-desktop-{1,2,3}.json`. Compute median.

- [ ] **Step 4: Stop server**

```bash
pkill -f "next start" || true
```

---

### Task D2: Update audit report with after-fix scores + deltas

**Files:**

- Modify: `docs/superpowers/specs/2026-05-06-home-perf-audit-results.md`

- [ ] **Step 1: Fill in after-fix scores tables**

Use Task D1 medians.

- [ ] **Step 2: Compute deltas per category and per metric**

Add a "Score Deltas" section showing baseline → after for each.

- [ ] **Step 3: Note Phase 1 success criteria check**

Check whether: mobile all ≥90, desktop all ≥95. If yes, Phase 1 succeeded. If no, list which categories missed and by how much — these become Phase 2 priorities.

---

### Task D3: Write Phase 2 spec stub

**Files:**

- Create: `docs/superpowers/specs/2026-05-06-home-perf-phase-2-design.md`

- [ ] **Step 1: Create the stub**

```markdown
# Home Page Performance — Phase 2: Closing the gap to 100/100/100/100

**Ticket:** ARC-570 (or new ticket TBD)
**Date:** 2026-05-06
**Status:** Draft — pending brainstorming session
**Predecessor:** `2026-05-06-home-perf-audit-design.md` and audit results doc

## Remaining Gap (from Phase 1 audit)

### Mobile

| Category       | After-fix score | Gap to 100 |
| -------------- | --------------- | ---------- |
| Performance    | XX              | XX         |
| Accessibility  | XX              | XX         |
| Best Practices | XX              | XX         |
| SEO            | XX              | XX         |

### Desktop

(same table)

## Candidate Fixes (from Phase 1 deferrals)

For each item from the Phase 1 Section 3 matrix marked "Phase 2", and any new items surfaced by the after-fix audit:

| Candidate                                   | Category | Est. point gain | Complexity | Regression risk  | Decision needed |
| ------------------------------------------- | -------- | --------------- | ---------- | ---------------- | --------------- |
| Convert HomeHero shell to Server Component  | Perf     | TBD             | High       | Med              | yes             |
| Defer/lazy-init WebPresentation entirely    | Perf     | TBD             | High       | Med              | yes             |
| Remove all entrance animations on cold load | Perf     | TBD             | Low        | Low (visual cut) | yes             |
| Audit Tamagui CSS extraction strategy       | Perf     | TBD             | High       | High             | yes             |
| Critical CSS inline                         | Perf     | TBD             | Med        | Low              | yes             |
| ...                                         |          |                 |            |                  |                 |

## Trade-off questions for the user (to brainstorm in Phase 2)

1. Is removing entrance animations on cold load acceptable for the perf score?
2. Is the WebPresentation slider critical above the fold, or can it be deferred?
3. How much risk is acceptable for Tamagui-runtime cost reduction?

## Next step

Run a fresh `/brainstorming` session against this stub to design Phase 2.
```

- [ ] **Step 2: Fill in actual numbers from audit results doc**

---

### Task D4: Open PR

**Prerequisite:** All commits from Phases A–D in place; branch pushed.

- [ ] **Step 1: Verify branch state**

```bash
git status
git log --oneline origin/develop..HEAD
```

- [ ] **Step 2: Run pre-merge checks**

```bash
pnpm --filter @arcadeum/web typecheck
pnpm --filter @arcadeum/web lint
pnpm --filter @arcadeum/web test
```

All must pass.

- [ ] **Step 3: Run homepage e2e**

Find the e2e script first:

```bash
grep -E "\"(e2e|test:e2e|playwright)" apps/web/package.json
```

Then run only the homepage spec (per commit `948ec8e7` an e2e for the homepage exists). The exact invocation depends on the script — likely something like:

```bash
pnpm --filter @arcadeum/web test:e2e -- homepage
```

or the Playwright form `pnpm --filter @arcadeum/web playwright test homepage`.

- [ ] **Step 4: Push branch**

```bash
git push -u origin <current-branch>
```

- [ ] **Step 5: Create PR via `/pr-description`**

Invoke the project skill `/pr-description` to generate the PR body, then `gh pr create`.

---

## Verification Summary

Before claiming Phase 1 done:

- [ ] All Phase A tasks completed; baseline data captured
- [ ] All Phase B tasks committed
- [ ] Phase C decision matrix filled with audit evidence
- [ ] Each "Apply" Phase C task executed and committed
- [ ] Re-audit completed; after-fix scores documented
- [ ] Phase 2 spec stub written
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test`, homepage e2e all pass
- [ ] PR open with `/pr-description` body
- [ ] Phase 1 success criteria from spec met (mobile ≥90 / desktop ≥95 across all four), OR Phase 2 stub explicitly captures the remaining gap

## Notes

- Spec docs at `docs/superpowers/specs/` are gitignored in this repo. Only `apps/web/` changes are committed.
- `@/`-aliased Lighthouse runs are sensitive to machine state. Don't chase ±2 score differences between runs; the median dampens this.
- If the build fails or Lighthouse errors out at any point, stop and surface — don't push through.
