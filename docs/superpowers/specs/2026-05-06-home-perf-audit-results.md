# Home Page Performance Audit Results — ARC-570

**Spec:** `docs/superpowers/specs/2026-05-06-home-perf-audit-design.md`
**Plan:** `docs/superpowers/plans/2026-05-06-home-perf-audit-plan.md`
**Date:** 2026-05-06
**Environment:** macOS 26.3.1, Apple M4 Pro, 24 GB RAM
**Tooling:** Lighthouse CLI via `npx lighthouse` against `next start` Turbopack production build, port 3500
**Bundle analyzer:** Wired in `next.config.ts` but @next/bundle-analyzer is incompatible with Turbopack builds. Webpack-mode analysis deferred to Phase 2; production deploys use Turbopack so a webpack analyzer report would diverge from prod bundle composition.

---

## Baseline Scores (current branch with in-progress diff)

### Mobile (Lighthouse default mobile preset — Moto G4 / Slow 4G / 4× CPU)

| Category       | Run 1 | Run 2 | Run 3 | **Median** |
| -------------- | ----: | ----: | ----: | ---------: |
| Performance    |    80 |    84 |    85 |     **84** |
| Accessibility  |   100 |   100 |   100 |    **100** |
| Best Practices |   100 |   100 |   100 |    **100** |
| SEO            |   100 |   100 |   100 |    **100** |

| Metric      | Run 1 | Run 2 | Run 3 |  **Median** |   Target |
| ----------- | ----: | ----: | ----: | ----------: | -------: |
| LCP         | 5.27s | 4.51s | 4.28s |   **4.51s** |   < 2.5s |
| CLS         |     0 |     0 |     0 |     **0** ✓ |    < 0.1 |
| TBT         |  28ms |  19ms |  23ms |  **23ms** ✓ |  < 200ms |
| FCP         | 1.36s | 1.35s | 1.35s |   **1.35s** | < 1.8s ✓ |
| TTI         | 5.29s | 5.46s | 5.24s |   **5.29s** |        — |
| Speed Index | 2.71s | 1.75s | 1.67s | **1.75s** ✓ |   < 3.4s |

### Desktop (Lighthouse default desktop preset)

| Category       | Run 1 | Run 2 | Run 3 | **Median** |
| -------------- | ----: | ----: | ----: | ---------: |
| Performance    |    98 |    99 |    97 |     **98** |
| Accessibility  |    96 |    96 |    96 |     **96** |
| Best Practices |   100 |   100 |   100 |    **100** |
| SEO            |   100 |   100 |   100 |    **100** |

| Metric      | Run 1 | Run 2 | Run 3 |  **Median** |  Target |
| ----------- | ----: | ----: | ----: | ----------: | ------: |
| LCP         | 1.09s | 0.95s | 1.20s | **1.09s** ✓ |  < 2.5s |
| CLS         |     0 |     0 |     0 |     **0** ✓ |   < 0.1 |
| TBT         |   0ms |   0ms |   0ms |   **0ms** ✓ | < 200ms |
| FCP         | 0.36s | 0.36s | 0.36s | **0.36s** ✓ |  < 1.8s |
| TTI         | 1.10s | 0.95s | 1.20s |   **1.08s** |       — |
| Speed Index | 0.75s | 0.54s | 0.65s | **0.65s** ✓ |  < 3.4s |

---

## Headline Findings

1. **A11y, Best Practices, SEO are already 100 on mobile.** Phase 1 work on those categories shouldn't be needed for mobile.
2. **Desktop A11y is 96, not 100.** Two specific failures (see below) — both in shared/global components, not in home.
3. **Mobile Performance gap (84 → target ≥90 / stretch 100) is purely an LCP problem.** TBT is 23ms (excellent), CLS is 0, FCP is 1.35s (fine). LCP at 4.5s is dragging the score by ~16 points.
4. **The LCP element is `h1#hero-heading::after`** — the decorative shimmer pseudo-element overlay on the hero title. The visible title text paints in the FCP window (~1.35s), but Lighthouse picks the `::after` overlay (which paints later, after the Geist font loads and the hero CSS is parsed) as LCP because it's a larger painted area.
5. **Render-blocking CSS = 300ms direct savings.** 7 separate small CSS chunks (855B–5.9 KiB each) all blocking initial render.
6. **Desktop Performance is already 98** — desktop work is purely about closing the 2-point gap on Perf and the 4-point gap on A11y.

## Top Mobile Opportunities (Lighthouse)

| Audit                       | Score | Impact                                                        |
| --------------------------- | ----: | ------------------------------------------------------------- |
| `render-blocking-resources` |     0 | Est savings ~300ms — 7 CSS chunks blocking                    |
| `unused-javascript`         |     0 | Est savings ~52 KiB                                           |
| `legacy-javascript`         |     0 | Est savings ~14 KiB (modern browsers shouldn't get polyfills) |
| `image-delivery-insight`    |   0.5 | Est savings ~27 KiB on images                                 |
| `uses-responsive-images`    |   0.5 | Some images sized larger than displayed                       |
| `mainthread-work-breakdown` |     — | 1.1s total main-thread work                                   |
| `network-payloads`          |     — | 790 KiB total page weight                                     |
| `dom-size`                  |     — | 482 elements (high-ish but not catastrophic)                  |

## Specific Accessibility Failures (desktop only — mobile passes both)

### `color-contrast` (score 0)

- **Element:** `div.is_DesktopOnly > a > div.is_LinkButton > span.is_Typography`
- **Snippet:** `<span class="is_Typography is_Text font_body _col-inherit _ff-f-family _fow-600">`
- **Source:** Tamagui `LinkButton` inside the global Header desktop nav. Foreground/background combination doesn't meet WCAG AA 4.5:1.

### `label-content-name-mismatch` (score 0)

Two elements:

- **Logo link:** `<a class="link-no-decoration" aria-label="Arcadeum" href="/">` in the Header. Visible content is the logo image — `aria-label` is redundant if the `<img>` has an alt of "Arcadeum"; mismatch is flagged when the visible text differs from the aria-label.
- **PWA install button:** `<button class="download-btn-static" data-testid="install-pwa-button" aria-label="Install as Web App">` — empty button content, only an icon, with `aria-label`. Lighthouse wants the visible label (icon presumably has no text, so this might actually be a false positive — needs verification).

**Both are in shared/global components (`widgets/header/ui/Header` and `download-card`), not in home page components.** Fixing them improves all routes.

## Static Review Findings

### Home component client/server inventory

All 8 home components currently have `'use client'`. Two are 100% static (no hooks, no events):

| Component              | `'use client'`? | Hooks | Events | Justified?                         |
| ---------------------- | --------------- | ----: | -----: | ---------------------------------- |
| `HomeHero.tsx`         | yes             |     7 |      2 | yes (translation, hydration class) |
| `HomeGames.tsx`        | yes             |    12 |     11 | yes                                |
| `HomeFooter.tsx`       | yes             |     5 |      1 | yes (likely)                       |
| `WebPresentation.tsx`  | yes             |    12 |      4 | yes (slider state)                 |
| `HomeFeatures.tsx`     | yes             |     0 |      9 | partial (events only)              |
| `HomePresentation.tsx` | yes             |     2 |      3 | yes                                |
| `HomeHowItWorks.tsx`   | yes             |     0 |      5 | partial (events only)              |
| `HomePitchDeck.tsx`    | yes             |     0 |      0 | **NO — could be Server Component** |

`HomePitchDeck` is a Phase 2 conversion candidate (no client behavior at all).

### `HomePage.tsx` already defers most below-fold sections via `next/dynamic`

```typescript
const HomeHowItWorks = dynamic(() => import('./components/HomeHowItWorks'));
const HomeFeatures = dynamic(() => import('./components/HomeFeatures'));
const HomePresentation = dynamic(() => import('./components/HomePresentation'));
const HomePitchDeck = dynamic(() => import('./components/HomePitchDeck'));
const InstallAppCta = dynamic(() =>
  import('@/widgets/install-app').then((m) => m.InstallAppCta),
);
```

Eagerly imported (and rendered above-fold or near-top): `HomeHero`, `HomeGames`, `HomeFooter`. Of those, **`HomeGames` and `HomeFooter` are good Phase C candidates** for adding to dynamic — particularly `HomeGames` which is 326 lines and the largest home component.

### CSS / animation review

- The hero `::after` shimmer overlay is the LCP element. Either remove it or apply it after first paint (post-hydration class, similar to existing `is-hydrated` mechanism).
- Render-blocking CSS comes from 7 separate chunks. Investigate whether code-splitting CSS at module level is necessary for the hero or if a single critical-CSS bundle would unblock LCP.
- The in-progress diff already removed several expensive effects (gradient-text shimmer, drop-shadow on infinite animation) — those changes are reflected in the current 23ms TBT.

### Layout / metadata

- `<html lang>` already binds to user locale in `apps/web/src/app/layout.tsx` (cookie-driven).
- JSON-LD with Organization, WebSite, SoftwareApplication is already in the root layout.
- Metadata is comprehensive in root layout (title template, OG, Twitter, robots, manifest).
- These are why SEO is 100 on both devices.

---

## Section 3 Decision Matrix (post-audit)

| #   | Item                                                | Decision                | Audit Evidence                                                                                                                                                         |
| --- | --------------------------------------------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Add explicit width/height on home Images            | **Skip**                | CLS = 0 on both devices; existing setup works                                                                                                                          |
| 2   | Defer `HomeGames` + `HomeFooter` via `next/dynamic` | **Apply**               | `HomeGames` is 326 lines with hooks/events; `HomeFooter` 209 lines; Lighthouse "Reduce unused JavaScript ~52 KiB" supports deferral. Other components already deferred |
| 3   | Cull entrance animations on slow CPU/saveData       | **Skip**                | Mobile TBT = 23ms (well below 200ms target); not the blocker                                                                                                           |
| 4   | Defer 3rd-party scripts to lazyOnload               | **Skip**                | A7 found no `<Script>` tags in layout; nothing to defer                                                                                                                |
| 5   | Verify AVIF/WebP served                             | **Apply** (verify only) | Standard sanity check post-config-change; will verify during Phase D re-run                                                                                            |
| 6   | Drop unused keyframes from `animations.css`         | **Apply**               | "Reduce unused JavaScript ~52 KiB" + "Reduce unused CSS" likely related; cheap to do                                                                                   |
| 7   | Alt text audit on home Images                       | **Skip**                | A11y = 100 mobile / 96 desktop; the desktop misses are not alt-related                                                                                                 |
| 8   | Color contrast audit                                | **Apply (Header only)** | Desktop a11y failure on `is_LinkButton > span.is_Typography` in `is_DesktopOnly` (Header nav). Out of original "home" scope but fixing brings desktop A11y from 96→100 |
| 9   | Heading hierarchy / `<main>` landmark               | **Skip**                | A11y already 100 on mobile, no related warnings                                                                                                                        |
| 10  | Focus indicators on links/slider                    | **Skip**                | No focus-visibility issues flagged                                                                                                                                     |
| 11  | Slider keyboard navigation                          | **Skip**                | No related a11y issues flagged; defer to a focused a11y pass                                                                                                           |
| 12  | Console errors sweep                                | **Skip**                | Best Practices = 100; no console errors flagged                                                                                                                        |
| 13  | Source maps in production                           | **Skip**                | Best Practices = 100; not flagged                                                                                                                                      |
| 14  | Deprecated APIs                                     | **Skip**                | Best Practices = 100; not flagged                                                                                                                                      |
| 15  | Image aspect ratios                                 | **Phase 2**             | `uses-responsive-images` score 0.5 (~27 KiB) — small win, low priority                                                                                                 |
| 16  | Metadata completeness on `/`                        | **Skip**                | SEO = 100; root layout metadata is comprehensive                                                                                                                       |
| 17  | JSON-LD structured data                             | **Skip**                | Already present (Organization + WebSite + SoftwareApplication)                                                                                                         |
| 18  | Canonical URL                                       | **Skip**                | SEO = 100                                                                                                                                                              |
| 19  | Robots / sitemap                                    | **Skip**                | SEO = 100                                                                                                                                                              |
| 20  | `<html lang>` matches locale                        | **Skip**                | Already correct                                                                                                                                                        |

### NEW high-impact items surfaced by the audit (not in original Section 3)

| #   | Item                                                                                 | Decision                | Audit Evidence                                                                                                                           |
| --- | ------------------------------------------------------------------------------------ | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| N1  | **Defer or remove `h1#hero-heading::after` shimmer overlay on mobile (LCP element)** | **Apply**               | LCP element identified directly. Killing or post-paint-applying this should drop mobile LCP by ~2s and bring Performance from 84 to ~95+ |
| N2  | **Eliminate render-blocking CSS chunks**                                             | **Apply (investigate)** | 300ms direct savings flagged. 7 small CSS chunks blocking initial render. Worth investigating whether they can be inlined or reduced     |
| N3  | **Fix `label-content-name-mismatch` on Header logo link + PWA install button**       | **Apply (Header only)** | Brings desktop A11y from 96→100. Lives in Header / `widgets/install-app`, technically out of "home" scope, but trivial fix               |
| N4  | **Investigate `legacy-javascript` polyfills (~14 KiB savings)**                      | **Phase 2**             | Browserslist tuning needed; risk of breaking older user agents                                                                           |
| N5  | **Investigate `unused-javascript` (~52 KiB savings)**                                | **Phase 2**             | Likely Tamagui or other UI library code split issue; needs deeper analysis with webpack-mode build                                       |
| N6  | **Convert `HomePitchDeck` to Server Component**                                      | **Phase 2**             | No client behavior; pure markup                                                                                                          |

---

## Recommended Phase B + C execution (revised based on audit)

Given the audit data, the actual work for Phase 1 is much smaller than the original 20-item Section 3 list. Recommended sequence:

**Unconditional Phase B (in-progress diff polish):**

- B1 — tighten `remotePatterns` in `next.config.ts`
- B2 — revert mobile `backdrop-filter`
- B3 — consolidate `WebPresentation` preload effects (also fixes the lint blocker)

**Phase C — only these tasks:**

- C(N1) — Defer or remove hero `::after` shimmer overlay (highest LCP impact)
- C(N2) — Investigate render-blocking CSS chunks (300ms savings)
- C2 — Defer `HomeGames` + `HomeFooter` via `next/dynamic`
- C5 — Verify AVIF/WebP served (Phase D re-run)
- C6 — Drop unused `@keyframes`
- C8 — Fix Tamagui Header desktop link contrast (out of strict home scope, but easy A11y win)
- C(N3) — Fix Header logo + PWA install button aria-label/content mismatch (out of strict home scope, but easy A11y win)

**Skipped (16 of original 20):** items 1, 3, 4, 7, 9, 10, 11, 12, 13, 14, 16, 17, 18, 19, 20 + redundant verifications.

**Deferred to Phase 2:** items 15, N4, N5, N6.

---

## After-Fix Scores (Phase 1 commits 5f4bccdc, 9bed7c31, 3144c815)

### Mobile (median of 3 runs)

| Category       | Run 1 | Run 2 | Run 3 | **Median** |
| -------------- | ----: | ----: | ----: | ---------: |
| Performance    |    79 |    84 |    84 |     **84** |
| Accessibility  |   100 |   100 |   100 |    **100** |
| Best Practices |   100 |   100 |   100 |    **100** |
| SEO            |   100 |   100 |   100 |    **100** |

| Metric | Median |
| ------ | -----: |
| LCP    |  4.51s |
| CLS    |      0 |
| TBT    |   19ms |
| FCP    |  1.35s |

### Desktop (median of 3 runs)

| Category       | Run 1 | Run 2 | Run 3 | **Median** |
| -------------- | ----: | ----: | ----: | ---------: |
| Performance    |    98 |    98 |    97 |     **98** |
| Accessibility  |    96 |    96 |    96 |     **96** |
| Best Practices |   100 |   100 |   100 |    **100** |
| SEO            |   100 |   100 |   100 |    **100** |

| Metric | Median |
| ------ | -----: |
| LCP    |  1.18s |
| CLS    |      0 |
| TBT    |    0ms |
| FCP    |  0.36s |

## Score Deltas (baseline → after-fix, median)

| Device / Category      | Baseline | After |                            Δ |
| ---------------------- | -------: | ----: | ---------------------------: |
| Mobile Performance     |       84 |    84 |                            0 |
| Mobile Accessibility   |      100 |   100 |                            0 |
| Mobile Best Practices  |      100 |   100 |                            0 |
| Mobile SEO             |      100 |   100 |                            0 |
| Desktop Performance    |       98 |    98 |                            0 |
| Desktop Accessibility  |       96 |    96 |                            0 |
| Desktop Best Practices |      100 |   100 |                            0 |
| Desktop SEO            |      100 |   100 |                            0 |
| Mobile LCP             |    4.51s | 4.51s |                           0s |
| Desktop LCP            |    1.09s | 1.18s | +0.09s (within run variance) |

**No score regressions. No score gains visible at the median.**

The aria-label fix on Logo + install button DID resolve the
`label-content-name-mismatch` Lighthouse audit (verified in raw JSON),
but the desktop A11y category score is still capped at 96 by the
remaining `color-contrast` failure on the Tamagui LinkButton (deferred
to Phase 2 — touches shared `packages/ui` LinkButton component, out of
single-PR scope).

The hero `::after` LCP fix is correctly identified by Lighthouse (the
LCP element shifted from `h1::after` to `h1`) but the LCP TIMING did not
improve because the `<h1>` itself paints at the same ~4.5s late moment.
Diagnostic breakdown shows **Render Delay = 4064ms (90% of LCP)**, with
TTFB at only 452ms and zero load delay. The 4-second render delay is
structural — caused by the 7 render-blocking CSS chunks (300ms savings
flagged) plus JS bootup (single chunk = 334ms) plus font-swap timing.
None of these are addressable by single-property CSS edits; they
require the architectural changes captured in the Phase 2 spec stub.

---

## Phase 1 Success Criteria Check

Targets from spec:

- Mobile: ≥90 across all four → **3 of 4 met (Performance 84 = miss)**
- Desktop: ≥95 across all four → **3 of 4 met (Accessibility 96 = met; Performance 98 = met; the 100 stretch on A11y is missed by the Tamagui contrast issue)**
- Stretch (Phase 2 territory): 100/100/100/100 on both → not met

**Phase 1 outcome:** Cleaned up the in-progress diff (lint blocker resolved
so commits work), cleared one A11y audit, set up bundle analyzer
infrastructure, and identified the EXACT path to 100. Mobile Perf score
unchanged. The path forward is fully scoped in the Phase 2 spec stub
(`2026-05-06-home-perf-phase-2-design.md`).
