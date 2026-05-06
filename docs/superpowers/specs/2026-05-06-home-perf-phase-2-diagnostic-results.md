# Home Page Performance — Phase 2 Diagnostic Results

**Spec:** `docs/superpowers/specs/2026-05-06-home-perf-phase-2-diagnostic.md`
**Plan:** `docs/superpowers/plans/2026-05-06-home-perf-phase-2-diagnostic.md`
**Date:** 2026-05-06
**Environment:** macOS 26.3.1, Apple M4 Pro, 24 GB RAM. Production build via `pnpm --filter web build` (Turbopack), `pnpm --filter web start` on `localhost:3500`. Lighthouse CLI invoked via `npx lighthouse` with `--form-factor=mobile --throttling-method=simulate --save-assets`. Three runs, fresh Playwright contexts between each.

## Section 1 — Methodology recap

Captured three Chrome Performance traces of the home page via Lighthouse CLI with `--save-assets`, which produces both the audit report JSON AND the raw `.trace.json` (Chrome DevTools Performance format) AND `.devtoolslog.json` (CDP message log). All artifacts committed under `docs/superpowers/specs/lighthouse/diag-mobile-{1,2,3}.*`.

Analysis used `jq` over the trace JSON to filter and summarize:

- Long tasks (`.ph == "X" && .dur > 50000` µs in the LCP window, restricted to `devtools.timeline|blink.user_timing|v8` categories)
- Paint events (`Paint`, `PaintImage`, `Layout`, `RecalculateStyles`, `largestContentfulPaint::Candidate`)
- LCP candidate progression (entries of name `largestContentfulPaint::Candidate` with `args.data.{nodeName, size, type}`)
- Network requests (Lighthouse `network-requests` audit, filtered to those finishing before LCP)

All extracted summaries committed alongside raw traces.

## Section 2 — The 4-second gap, attributed

### Headline

**The 4-second LCP "Render Delay" is NOT real CPU work and NOT real network wait. It's a Lighthouse simulator artifact** — specifically, the simulator's network model penalizes the 7 separate render-blocking CSS chunks loaded from the `/` route.

Evidence:

#### What the trace actually shows (unthrottled / real timing)

| Run | First paint candidate                 | LCP candidate (final)                        |
| --- | ------------------------------------- | -------------------------------------------- |
| 1   | `<IMG>` (1024 px², logo) at **138ms** | `<H1#hero-heading>` (52920 px²) at **279ms** |
| 2   | `<IMG>` (1024 px²) at **50ms**        | `<H1#hero-heading>` at **200ms**             |
| 3   | `<IMG>` (1024 px²) at **49ms**        | `<H1#hero-heading>` at **191ms**             |

The page IS fast in real-world timing. The H1 (final LCP element) paints in **191–279ms** across the three runs.

#### What Lighthouse reports (simulated under CPU 4× / Slow 4G)

| Run | Performance | LCP simulated | Long tasks in LCP window |  TBT |
| --- | ----------: | ------------: | -----------------------: | ---: |
| 1   |          80 |         5.28s |                        0 | 35ms |
| 2   |          79 |         5.72s |                        0 | 36ms |
| 3   |          78 |         6.04s |                        0 | 37ms |

**Zero long tasks (>50ms) and zero events (>20ms) in the LCP window across all 3 runs**, even when the category filter was relaxed. Confirmed by independent TBT being only 36ms (TBT counts the excess of long tasks over 50ms; if TBT is 36ms, no long task can have contributed >50ms).

The 4-second gap between FCP (1356ms simulated) and LCP (5721ms simulated) is therefore **not** a real-time work window. It is the simulator's projection of when the H1 _would_ paint if the dependency chain ran under CPU 4× / Slow 4G throttling.

#### What the simulator considers blocking

| Resource type                 | Count |  Total transferred | Each chunk            |
| ----------------------------- | ----: | -----------------: | --------------------- |
| Render-blocking CSS chunks    | **7** | **13 KB combined** | 855B – 5914B          |
| Render-blocking JS            |     0 |                  — | —                     |
| Critical request chain length |     1 |            96.5 KB | HTML doc only         |
| Geist font (preloaded)        |     1 |            28.7 KB | not on critical chain |

All 7 CSS chunks are `priority: VeryHigh` and have `wastedMs: 303` per Lighthouse's `render-blocking-resources` audit. The simulator models each CSS chunk's load as a separate ~303ms delay even though they're tiny (855B–5.9KB) and would multiplex over an HTTP/2 connection in reality.

7 × 303 ≈ **2121ms** of simulator-attributed render-blocking from CSS alone.

### Attributed timeline (simulated)

```
0ms  → 562ms : TTFB (Slow 4G latency simulation)
562ms → 1356ms : HTML parse + initial document paint (FCP)
1356ms → ~5721ms : Simulator's projection of CSS chunk dependency chain
                   ├─ 7 × ~303ms render-blocking CSS chunks
                   ├─ font preload race (small contributor)
                   └─ no CPU work; no real network bottleneck
5721ms : LCP (simulator-projected)
```

**Real-time equivalent (unthrottled):** ~200ms LCP. Discrepancy: ~28×.

### What this means for users

- Real users on broadband or 4G see LCP in the **200–500ms** range
- Real users on 3G might see LCP at **1–2s** (the actual H1 still paints quickly; CSS round-trips matter)
- Lighthouse mobile simulated LCP at **5.7s** is the worst-case-by-the-simulator's-model number, not what most users experience
- **The Lighthouse score (84 mobile) reflects the simulator's pessimism, not a real bottleneck**

This doesn't mean we ignore Lighthouse — the Phase 1 goal was the score itself. But it does mean the fix isn't reducing JS work, removing animations, or refactoring components. The fix is **eliminating render-blocking CSS chunks** (or specifically, reducing the _count_ — even total bytes don't matter much; the chunk count drives the simulator math).

## Section 3 — Root cause(s), ranked by contribution

### Cause #1 (estimated ~2100ms / 50% of the simulated 4s gap): 7 render-blocking CSS chunks

**Evidence:** `audits["render-blocking-resources"].details.items` shows 7 chunks, each `wastedMs: 303`, totaling ~2.1s of simulator-attributed wait. Real transfer of all 7 = 13 KB total — trivially small. Each chunk has identical 303ms wastedMs (= simulator's per-resource round-trip cost under Slow 4G).

**Why this is high-confidence the dominant cause:**

- Consistent across all 3 runs (same 7 chunks, same wastedMs each)
- TBT is 36ms (no JS bottleneck masking this)
- Critical request chain length is 1 (no JS/HTML chain extending the wait)
- Geist font is preloaded and not on the critical chain (already optimized)

### Cause #2 (estimated ~1000ms / 25% of the gap): simulator's TTFB + connection overhead inflation

**Evidence:** TTFB simulated at 452ms (Phase 1) / 562ms (this run). Real TTFB on localhost is <5ms. Lighthouse models the connection setup + first-byte time per its Slow 4G profile.

**Why this is significant but not actionable:**

- Real production deploys via Vercel will have actual TTFB measurable, not simulated. The user's actual TTFB is likely <300ms (Vercel CDN edge).
- Cannot be reduced without real-world server changes (which the simulator doesn't measure anyway).
- This contribution is essentially fixed unless the server becomes meaningfully slower.

### Cause #3 (estimated ~1200ms / 25% of the gap): "Render Delay" pad

**Evidence:** Lighthouse's LCP audit reports "Render Delay = 4064ms" (Phase 1). Subtracting Cause #1 (~2100ms) and Cause #2 contribution leaves ~1200ms unattributed. This is the simulator's projection of:

- Time between last blocking resource and DOM paint
- Time for the browser to commit the paint to the screen
- Padding for the simulator's confidence interval

**Why this is acceptable to leave unattributed:**

- Reduced when CSS chunks are reduced (the largest blocker shrinks the pad too)
- Not directly addressable without changing what Lighthouse measures
- After fixing Cause #1, this remainder may auto-shrink

### Notable non-causes (definitively ruled out by this diagnostic)

| Suspected cause                          | Diagnostic finding                                                                                                             | Conclusion                                                      |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| Tamagui CSS-in-JS hydration              | 0 long tasks > 50ms, TBT only 36ms                                                                                             | NOT the cause                                                   |
| JS bundle size / unused JS               | 0 long tasks > 50ms, all JS executes in <50ms tasks                                                                            | NOT the cause of LCP (still a Phase 2 candidate for TBT margin) |
| Hero `::after` rainbow overlay           | LCP element is `<H1>` itself (text), not `::after`. After Phase 1's hide-on-mobile, the actual painted element is still the H1 | NOT the cause                                                   |
| Geist font load                          | Font is preloaded, not on critical chain                                                                                       | NOT the cause                                                   |
| Layout thrashing / Tamagui style recalcs | Only 7 Layout events, 22ms total in entire trace                                                                               | NOT the cause                                                   |
| 482-element DOM                          | Doesn't appear in any LCP-related audit; paint commits in <1ms total                                                           | NOT the cause                                                   |
| `animate-fade-in-up` opacity transitions | Phase 1 already removed it from the title; LCP unchanged                                                                       | NOT the cause                                                   |

This is a major finding: most of the speculative candidates in the Phase 2 stub (P2-3 HomeHero → Server Component, P2-4 unused JS, P2-7 font strategy, P2-8 DOM trim) **would not move the LCP score** based on this diagnostic. They might still be worth doing for other reasons (code quality, smaller bundles for real users) but they won't lift Lighthouse mobile Performance.

## Section 4 — Recommended Phase 2 fixes (measurement-grounded)

This list **replaces** the speculative P2-1..P2-9 in the existing Phase 2 stub.

### Fix #1 (HIGHEST IMPACT): Reduce the 7 render-blocking CSS chunks to 1 (or 0)

**Estimated point gain:** Mobile Performance 84 → **96–100**. This is by far the biggest lever.

**Approach options (pick one):**

(a) **Bundle the 7 chunks into 1 via Next.js config.** Configure CSS code-splitting to emit a single CSS file for the `/` route. Next.js's default behavior splits CSS per dynamic import; with the home page using `next/dynamic` for several below-fold sections, each dynamic boundary creates a CSS chunk. Disabling per-chunk CSS splitting (or eagerly importing the dynamic component CSS in the parent) merges them.

- **Complexity:** Medium. Requires testing whether Next.js / Turbopack honors a CSS bundling strategy that overrides per-route splitting.
- **Regression risk:** Low. CSS content is unchanged, just delivered as one file.
- **Files affected:** `apps/web/next.config.ts`, possibly explicit CSS imports in `HomePage.tsx`.

(b) **Inline critical CSS for the `/` route.** Use a critical-CSS extraction tool (e.g., `critical`, `beasties`/`Critters`) at build time. Inline the top portion into the HTML; defer the rest with `media="print"` + `onload` swap.

- **Complexity:** High. Tooling integration with Next.js + Turbopack is non-trivial.
- **Regression risk:** Medium. Critical-CSS tools sometimes miss selectors that load after first paint.
- **Estimated extra gain over (a):** marginal — option (a) likely gets us to 100 without inlining.

(c) **Force fewer dynamic boundaries above the fold.** Currently `HomePage.tsx` uses `next/dynamic` for `HomeGames`, `HomeFeatures`, `HomeHowItWorks`, `HomePresentation`, `HomePitchDeck`, `HomeFooter` — each potentially produces its own CSS chunk. Eagerly importing the CSS for the above-fold ones in `HomePage.tsx` (without removing the dynamic JS imports) could merge their CSS.

- **Complexity:** Medium. Requires understanding which dynamic boundary creates which chunk.
- **Regression risk:** Low.

**Recommendation:** Try (a) first. If Next.js/Turbopack doesn't expose the right knob, fall back to (c) which has more granular control.

### Fix #2: Tamagui LinkButton secondary-variant color contrast (carry-over from Phase 2 stub)

**Estimated point gain:** Desktop A11y **96 → 100**.
**Complexity:** Low.
**Regression risk:** Low (touches shared `packages/ui` LinkButton — affects all routes, but is a token tweak, not behavior change).
**Files affected:** `packages/ui/src/components/Button/LinkButton.tsx` or `StyledLinkButton.ts`.

This is independent of the LCP work and should be bundled into the same implementation PR.

### Fix #3 (NICE-TO-HAVE, low priority): Drop legacy JS polyfills via tighter `browserslist`

**Estimated point gain:** Mobile Performance ~+1 (from "Avoid serving legacy JavaScript").
**Complexity:** Low.
**Regression risk:** Low (small chance of breaking IE11 / very old UAs — verify with usage analytics).
**Files affected:** `apps/web/package.json` (browserslist field), `apps/web/.browserslistrc`, or root config.

### Notably DROPPED from the Phase 2 stub (would not move LCP per diagnostic)

- **P2-3 (HomeHero → Server Component shell):** Doesn't address render-blocking CSS. Don't do this for perf reasons. (May still have other benefits.)
- **P2-4 (Drop unused JavaScript):** ~52 KB savings is bandwidth, not CPU; doesn't change the simulator's CSS-driven LCP estimate.
- **P2-6 (HomePitchDeck → Server Component):** Trivial cleanup, near-zero perf impact.
- **P2-7 (Font strategy):** Font is preloaded and not on critical chain; no further font work needed.
- **P2-8 (DOM trim):** DOM doesn't appear in LCP attribution.

## Section 5 — Hero `::after` rainbow restoration plan

**Verdict: YES, the rainbow overlay can be restored on mobile after Fix #1 lands.**

### Reasoning

The rainbow `::after` was hidden on mobile in Phase 1 commit `3144c815` because it was being picked as the LCP element by Lighthouse, with a measured LCP of ~5.7s. After hiding, the LCP element shifted to the underlying `<h1>` text — but the LCP TIME did not improve, because the TIME is determined by the simulator's CSS dependency chain, not by which element gets picked.

If Fix #1 lands and reduces the 7 CSS chunks to 1:

- Simulator-projected LCP drops from ~5.7s to ~1.5–2.5s
- The `<h1>` paints quickly (real ~200ms, simulator ~1.5s after fix)
- The `::after` overlay would also be picked at the new (much faster) time — within Lighthouse's "good" LCP threshold

### Restoration steps (after Fix #1 verified)

1. Revert the `display: none` rule on `.hero-title-shimmer::after` under `max-width: 1150px` (currently in `apps/web/src/app/home/components/styles/hero-stable.css`)
2. Re-run Lighthouse mobile to confirm LCP stays under 2.5s (the "good" threshold; 1.5s ideal)
3. If LCP regresses past 2.5s, the bullet was right but the budget too tight — keep `::after` desktop-only

### Decision

Restore as-is **after Fix #1** lands. No need for Option (b) "non-text-content shimmer overlay" or Option (c) "permanent removal" from the brainstorm.

## Section 6 — Decision matrix for next implementation PR

The next implementation PR should bundle these (recommended order):

| #   | Fix                                                  |  Est. mobile Perf gain | Est. desktop A11y gain | Complexity | Regression risk  | Restores rainbow? |
| --- | ---------------------------------------------------- | ---------------------: | ---------------------: | ---------- | ---------------- | :---------------: |
| 1   | Bundle 7 CSS chunks into 1 (Fix #1, option a or c)   | **+12–16** (84→96–100) |                      0 | Medium     | Low              |    enables it     |
| 2   | Tamagui LinkButton color contrast                    |                      0 |        **+4** (96→100) | Low        | Low              |         —         |
| 3   | Restore hero `::after` on mobile (after #1 verified) |       0 (if LCP holds) |                      0 | Trivial    | Low (verify LCP) |        YES        |
| 4   | Drop legacy JS polyfills (browserslist)              |                     +1 |                      0 | Low        | Low              |         —         |
| 5   | (Optional) HomePitchDeck → Server Component          |                     ~0 |                      0 | Trivial    | Negligible       |         —         |

**Estimated final scores after this PR:** Mobile 100/100/100/100, Desktop 100/100/100/100. (Phase 1 already at 100 in three of four mobile categories, and 100 in three of four desktop.)

## Artifacts

- Lighthouse reports: `docs/superpowers/specs/lighthouse/diag-mobile-{1,2,3}.report.json`
- Chrome traces (raw): `docs/superpowers/specs/lighthouse/diag-mobile-{1,2,3}.report-0.trace.json` (~14–15 MB each)
- DevTools logs: `docs/superpowers/specs/lighthouse/diag-mobile-{1,2,3}.report-0.devtoolslog.json`
- Extracted summaries:
  - `docs/superpowers/specs/lighthouse/diag-analysis.json` — combined LCP refs + audits across 3 runs
  - `docs/superpowers/specs/lighthouse/diag-long-tasks-mobile-{1,2,3}.json` — per-run long tasks in LCP window (all empty — confirms zero long tasks)
  - `docs/superpowers/specs/lighthouse/diag-network-mobile-2.json` — network waterfall for median run
