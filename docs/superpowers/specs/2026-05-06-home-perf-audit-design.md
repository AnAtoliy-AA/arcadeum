# Home Page Performance — Phase 1: Audit + High-Confidence Wins

**Ticket:** ARC-570
**Date:** 2026-05-06
**Status:** Approved (pending spec review)

## Goal

Move the home page (`/`) toward a Lighthouse score of 100 across all four categories (Performance, Accessibility, Best Practices, SEO) on both mobile and desktop.

This is **Phase 1 of two**. Phase 1 lands the in-progress polish, runs a full audit, and applies only high-confidence wins. Phase 2 (separate spec) will target the remaining gap to 100 with structural changes informed by the audit data.

**Phase 1 target:** 90–98 across all four categories on mobile, 95+ on desktop. **Phase 2 target:** 100/100/100/100.

## Background

The user has uncommitted in-progress work on home performance across these files:

- `apps/web/next.config.ts` — adds AVIF/WebP image config, `minimumCacheTTL`, broad `remotePatterns`
- `apps/web/src/app/layout.tsx` — Geist font `preload: false → true`
- `apps/web/src/app/home/components/HomeHero.tsx` — animation delay reordering (title now `0s`)
- `apps/web/src/app/home/components/WebPresentation.tsx` — mobile-aware slide preload, `priority` for first slide, tighter `sizes`
- `apps/web/src/app/home/components/styles/hero-stable.css` — drop-shadow removed from infinite hero animation, shimmer filter disabled <1150px, `backdrop-filter` added on mobile cards
- `apps/web/src/app/styles/animations.css` — gradient-text shimmer removed from kicker, shimmer-glide deferred

This work has not been audited or measured. Phase 1 will measure baseline, decide what to keep, and apply additional wins.

## Non-goals

- Rewriting any other route (only `/` is in scope)
- Refactoring Tamagui setup globally
- Changing analytics/error reporting/observability provider choice
- Visual redesign of the home page
- Backend/API performance work
- Mobile app (`apps/mobile`) performance
- CI integration of Lighthouse / bundle analyzer (local-only)
- Migrating any client component to Server Component (defer to Phase 2 if data shows it's needed)

## Approach

### Section 1 — Audit setup & methodology

**Tools:**

- Add `@next/bundle-analyzer` to `apps/web` as a dev dependency, env-gated (`ANALYZE=true pnpm build`), off by default
- Use the Playwright MCP to drive Lighthouse against a local production build
- No CI integration in Phase 1

**Audit run procedure (against current branch, includes in-progress changes):**

1. `pnpm build` then `pnpm start` for `apps/web` (production mode — dev mode skews everything)
2. Playwright MCP loads `http://localhost:3000` and runs Lighthouse twice: **mobile** (default Moto G4 / 4× CPU / Slow 4G) and **desktop**
3. Capture for each device: scores for all four categories; LCP, CLS, TBT, FCP, INP, TTI; top opportunities and diagnostics list verbatim (Lighthouse 12+ reports INP, not FID)
4. Run **3 times back-to-back** per device; report median to dampen variance
5. Browser cache cleared between runs (fresh Playwright contexts)
6. `ANALYZE=true pnpm build` once → capture bundle size per route, top 10 JS contributors

**Static review (parallel):**

- File-by-file walkthrough of all 9 home components for known anti-patterns: unnecessary `'use client'`, missing image dimensions, expensive CSS effects in animations, oversized icons, inline styles forcing recalc
- Identify what Tamagui ships in the initial JS for `/` route specifically

**Deliverable:** the single combined audit doc described in Section 4 (`2026-05-06-home-perf-audit-results.md`) holds both the baseline numbers from this step and the after-fix numbers added later. Raw Lighthouse JSON committed under `docs/superpowers/specs/lighthouse/` for diff tracking.

### Section 2 — In-progress polish (decisions on the existing diff)

| Change                                                                | Decision          | Reason                                                                                                                                                      |
| --------------------------------------------------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `next.config.ts` AVIF/WebP + `minimumCacheTTL: 3600`                  | Keep              | Standard Next.js perf config                                                                                                                                |
| `remotePatterns: ['**']`                                              | Tighten or remove | `'**'` allows any HTTPS host as image source — security smell. Replace with actual domains used, or drop the block if no remote images                      |
| `layout.tsx` font `preload: false → true`                             | Keep, verify      | Title uses Geist; preload helps LCP. Verify Lighthouse doesn't flag a render-blocking font request                                                          |
| `HomeHero.tsx` animation delay reorder (title `0s`)                   | Keep              | Title is LCP candidate; animating immediately is correct                                                                                                    |
| `WebPresentation.tsx` mobile-aware preload `useEffect`                | Keep, refactor    | Logic is right but duplicates state setting with the existing `updateLoadedSlides`. Consolidate into one effect to avoid double `setState` per slide change |
| `WebPresentation.tsx` `priority={index === 0}`                        | Keep              | Correct LCP hint for first slide                                                                                                                            |
| `WebPresentation.tsx` tighter `sizes` attribute                       | Keep              | Saves bandwidth; matches actual layout                                                                                                                      |
| `hero-stable.css` simplified `hero-color-shift` (drop-shadow removed) | Keep              | Drop-shadow on infinite animation is a known compositor cost                                                                                                |
| `hero-stable.css` shimmer filter disabled <1150px                     | Keep              | Reduces mobile compositor load                                                                                                                              |
| `hero-stable.css` `backdrop-filter: blur(8px)` on mobile cards        | **Revert**        | Backdrop-filter is the most expensive mobile filter — opposes the perf goal. User confirmed no visual regression to preserve                                |
| `animations.css` removed gradient-text shimmer on kicker              | Keep              | Background-clip:text + animation is expensive                                                                                                               |
| `animations.css` shimmer-glide `alternate 1s` (delay added)           | Keep, verify      | Audit will tell us if even the deferred shimmer costs measurable TBT                                                                                        |

### Section 3 — High-confidence wins to apply

Applied if the audit confirms they leak points. Order is roughly by expected impact.

**Performance:**

1. Add explicit `width`/`height` (or `fill` + sized parent) to every `<Image>` in home components → locks CLS to 0
2. Defer below-fold sections via `next/dynamic` with `IntersectionObserver`-based loading: `HomeFeatures`, `HomeGames`, `HomeFooter`, `HomePresentation`. Only the hero ships with the initial bundle. **Pre-step:** confirm each target's client/server status — `next/dynamic` for a Server Component or one with `ssr: false` requires different wiring; pick the right form per file
3. Remove decorative entrance animations from initial paint on slow-CPU detect (`navigator.connection?.saveData` or `prefers-reduced-motion`) — animations still play on capable devices
4. Audit third-party scripts loaded on `/`: analytics, error reporting, anything from `apps/web/src/app/layout.tsx`. Defer non-critical ones to `next/script` with `strategy="lazyOnload"`
5. Verify `WebPresentation` images are AVIF/WebP-served post-config-change (Network tab confirmation)
6. Drop unused CSS from `animations.css` if any keyframes are no longer referenced after the in-progress diff

**Accessibility:** 7. Alt text audit on all `<Image>` components in home (slider in particular) 8. Color contrast audit of hero kicker, tagline, description against background overlay 9. Semantic landmarks: confirm `<main>`, `<section aria-labelledby>`, heading hierarchy (h1 → h2 → h3) is clean 10. Focus indicators on `home-link-button` and slider controls 11. Slider keyboard navigation (arrow keys, focus management between slides)

**Best Practices:** 12. Console errors/warnings sweep on initial load (Lighthouse fails if any) 13. Source maps present in production build 14. No deprecated APIs flagged 15. Image aspect ratios match natural dimensions

**SEO:** 16. Metadata on `/` (title, description, OG, Twitter card) — confirm completeness 17. Structured data: add `WebSite` + `Organization` JSON-LD 18. Canonical URL set 19. Robots allows indexing on prod, sitemap includes `/` 20. `<html lang>` matches the user's locale

### Section 4 — Output deliverables

1. **Audit report** committed to `docs/superpowers/specs/2026-05-06-home-perf-audit-results.md`:

   - Baseline scores (mobile + desktop, all four categories)
   - Baseline metrics (LCP, CLS, TBT, FCP, INP, TTI)
   - Top 10 Lighthouse opportunities verbatim with byte/ms savings
   - Bundle analyzer summary: top 10 contributors to `/` route JS
   - Each finding from Section 3 marked: **Applied** / **Skipped (reason)** / **Phase 2**
   - After-fix scores + delta table
   - Raw Lighthouse JSON files under `docs/superpowers/specs/lighthouse/`

2. **Code changes** — one PR containing:

   - In-progress polish from Section 2 (with `backdrop-filter` reverted, `remotePatterns` tightened, `WebPresentation` preload effect consolidated)
   - Section 3 high-confidence wins flagged "Applied" by the audit
   - `@next/bundle-analyzer` wired into `next.config.ts` (env-gated)

3. **Phase 2 spec stub** committed to `docs/superpowers/specs/2026-05-06-home-perf-phase-2-design.md`:
   - Remaining gap to 100/100/100/100 per category per device
   - Each candidate fix: estimated point gain, complexity, regression risk, decision needed
   - Trade-off questions (e.g., "remove entrance animations entirely", "defer slider behind scroll", "convert HomeHero to Server Component shell")

### Section 5 — Testing & verification

**During the audit:**

- Each Lighthouse run done 3 times back-to-back per device; report median
- Production build (`pnpm build && pnpm start`), not dev
- Browser cache cleared between runs
- Note machine/CPU in the report so future audits are comparable

**After applying fixes:**

- Re-run Lighthouse the same way (3× per device, median)
- `pnpm typecheck` and `pnpm lint` clean across the workspace
- `pnpm test` passes for `apps/web`
- Existing homepage e2e (per commit `948ec8e7`) passes
- Manual visual regression at 360px (mobile), 768px (tablet), 1440px (desktop):
  - Hero card stack still positioned correctly
  - WebPresentation slider still cycles
  - No CLS observable while scrolling
  - Animations don't visibly regress on capable devices
- Network tab spot-check: AVIF/WebP served, no `'**'` remote pattern usage in practice, no unexpected 3rd-party requests

**Pre-merge:**

- `/pr-description` for the PR body
- Conventional commit format with `ARC-570` scope

### Section 6 — Risks

| Risk                                                                                           | Mitigation                                                                             |
| ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Font `preload: true` could regress LCP if the font is large or competing for early bandwidth   | Verify with audit before/after; revert if it hurts                                     |
| Deferring sections via `next/dynamic` can introduce CLS as deferred content mounts             | Reserve space with min-heights matching final rendered height; verify CLS = 0 in audit |
| Removing entrance animations on slow devices could feel inconsistent across users              | Acceptable; only triggers on `saveData` / `prefers-reduced-motion`. Documented         |
| Audit results are environment-sensitive (CPU load, network noise)                              | 3× median runs; document machine; don't chase tiny score deltas                        |
| Bundle analyzer adds dev dependency weight                                                     | Negligible; gated behind env var, not in production bundle                             |
| Lighthouse 100 might still not be reachable in Phase 1                                         | Already framed: Phase 1 targets 90–98, Phase 2 closes the gap                          |
| In-progress diff has uncommitted changes — risk of conflict if other work happens on `develop` | Land Phase 1 quickly; coordinate via PR                                                |

## Open questions resolved

1. **`backdrop-filter` on mobile cards** — User confirmed no visual regression to preserve. Clean revert.
2. **ARC ticket** — ARC-570.

## Success criteria for Phase 1

- Audit report exists with baseline + after-fix scores and full diagnostics
- All Section 2 decisions applied to the in-progress diff
- All Section 3 items marked "Applied" by the audit are landed
- All four Lighthouse categories at ≥90 on mobile, ≥95 on desktop
- No regression in homepage e2e or visual smoke tests
- Phase 2 spec stub exists with prioritized list of remaining gaps

## Out of scope for Phase 1 → Phase 2 candidates

- Converting `HomeHero` to a Server Component with minimal client islands
- Removing or radically simplifying the WebPresentation slider above the fold
- Removing all entrance animations regardless of device capability
- Tamagui-runtime cost reduction (CSS extraction strategy review)
- Critical CSS inlining
- Service worker / offline strategy revisit
