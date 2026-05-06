# Home Page Performance — Phase 2 Diagnostic

**Ticket:** ARC-570
**Date:** 2026-05-06
**Status:** Approved (pending spec review)
**Predecessors:**

- `2026-05-06-home-perf-audit-design.md` (Phase 1 design)
- `2026-05-06-home-perf-audit-results.md` (Phase 1 measurements)
- `2026-05-06-home-perf-phase-2-design.md` (Phase 2 stub — superseded by this diagnostic + the implementation work it informs)

## Goal

Identify the **specific cause(s)** of the 4-second mobile LCP "Render Delay" with measurement-grounded evidence, then translate that evidence into a ranked list of recommended Phase 2 implementation fixes. The Phase 1 results show this delay is 90% of LCP but does not attribute it; the Phase 2 stub speculates about candidates without measurement. This diagnostic phase replaces speculation with data.

A separate, smaller-scoped implementation PR follows — informed by the diagnostic decision matrix and chosen by the user from the report's recommendations.

**Secondary goal (added to Phase 2 scope):** determine whether the hero `.hero-title-shimmer::after` rainbow color animation can be restored on mobile (currently hidden via `display: none` under `max-width: 1150px` per Phase 1 commit `3144c815`) without re-introducing the LCP cost. The diagnostic's findings drive this: if the real LCP cause is unrelated to the `::after` overlay, restoring the rainbow may be cheap.

## Non-goals

- Writing or applying any code fixes — diagnostic only
- Bundle composition analysis via webpack-mode (`next build --webpack ANALYZE=true`) — escalate ONLY if the trace doesn't surface the cause
- React DevTools profiler analysis — same: escalate only if needed
- Fixing the desktop A11y color contrast — that ships in the **separate implementation PR** alongside whatever fixes the diagnostic recommends, not as part of this diagnostic itself

## Section 1 — Capture methodology

**Tooling:**

- Production build (`pnpm --filter web build` then `pnpm --filter web start`) on `localhost:3500` — same baseline as Phase 1
- Playwright MCP drives Chrome with the same throttling profile Lighthouse uses (CPU 4×, network "Slow 4G" preset)
- Capture **three Chrome Performance traces** (3× for consistency); compare with Lighthouse runs already on disk

**Capture per run:**

1. Start Playwright tracing with categories `['devtools.timeline']` and `screenshots: true`, navigate to `/`, wait until `networkidle`, stop tracing → save `.json` trace under `docs/superpowers/specs/lighthouse/trace-N.json`
2. Capture `console.messages` during load (any errors / warnings)
3. Capture `network.requests` during load (waterfall — start, end, duration, transferSize per request)
4. After load, run `page.evaluate()` to dump Performance API entries via `PerformanceObserver`. Use these exact `entryTypes` strings: `'largest-contentful-paint'`, `'paint'`, `'longtask'`, `'layout-shift'`, `'resource'`. Each observer must `observe({ type, buffered: true })` to also pick up entries dispatched before the observer was registered.

**Verification:** between captures, recreate fresh Playwright contexts to clear cache. Same URL + same throttling on each run.

## Section 2 — Analysis dimensions

For each captured trace, answer in order:

1. **Long tasks between FCP (1.35s) and LCP (4.5s)** — what scripts ran, callstack, total time. Specifically watch: Tamagui hydration, React render, useEffect/useLayoutEffect callbacks, third-party SDKs.
2. **Network requests in that window** — were any blocking? Any synchronous fetches? Any font request that landed late despite preload?
3. **Paint events** — how many separate paints between FCP and LCP, what triggered each, painted-area sizes? Identify single late paint vs. many cumulative.
4. **Layout shifts** — even though CLS = 0, were there layout _recalcs_ (style/layout invalidations) that delayed paint? Tamagui CSS-in-JS commonly causes these.
5. **Specifically for the `<h1>`:** when did its first paint occur? When did its last meaningful paint occur? What caused the difference (font swap? animation completion? style recalc?).
6. **Compare runs:** are long tasks consistent across the 3 runs, or specific to single runs (noise vs. real bottleneck)?

For Lighthouse cross-reference: overlay the Chrome trace timings against the existing Phase 1 after-fix runs at `docs/superpowers/specs/lighthouse/after5-mobile-1.json`, `after5-mobile-2.json`, `after5-mobile-3.json` (and the matching `after5-desktop-*.json`).

## Section 3 — Output deliverables

A single diagnostic report committed to `docs/superpowers/specs/2026-05-06-home-perf-phase-2-diagnostic-results.md`:

**Mandatory sections:**

1. **Methodology recap** (1 paragraph)
2. **The 4-second gap, attributed** — concrete breakdown with timestamps and source identifications. Example shape:
   - `1350ms → 2100ms`: render-blocking CSS chunk parse (CSS file URL)
   - `2100ms → 2800ms`: long task in `_next/static/chunks/2caea913.js` — likely Tamagui CSS-in-JS hydration
   - `2800ms → 4500ms`: ?? (something specific or "unattributed")
3. **Root cause(s)** — ranked by contribution to LCP. One- or two-sentence diagnosis per cause.
4. **Recommended Phase 2 fixes** — for each cause, the specific fix with estimated point gain, complexity, regression risk. Replaces the speculative P2-1..P2-9 list in the existing Phase 2 stub.
5. **Hero `::after` restoration plan** — explicit section answering: can the rainbow shimmer come back on mobile, and if so, how? Three sub-options with trade-offs (e.g., "yes, after we fix font-load X"; "yes, if we use a non-text-content shimmer overlay"; "no, requires removing entirely on mobile permanently").
6. **Decision matrix for next implementation PR** — columns: estimated points / complexity / regression risk / restores rainbow Y/N.

**Raw artifacts** committed under `docs/superpowers/specs/lighthouse/`: `trace-1.json`, `trace-2.json`, `trace-3.json`, network-requests JSON per run.

After this report, Phase 2 implementation work happens in a separate, much smaller-scoped PR informed by the data.

## Section 4 — Risks, non-goals, success criteria

### Risks

| Risk                                                                                                       | Mitigation                                                                                                                                                                                                 |
| ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Playwright's CPU throttling differs from Lighthouse's simulated throttling — numbers may not match exactly | Capture both: also note `performance.now()` timestamps in the trace. If they diverge significantly, document and use the trace as qualitative evidence (which scripts/paints) rather than absolute timings |
| Trace files are large (~10–50 MB each) and may bloat the repo                                              | Commit them — `docs/superpowers/specs/lighthouse/` is now tracked. If size becomes a concern, a follow-up commit can compress or move them. The user has chosen to track these artifacts.                  |
| Diagnostic surfaces 5+ small causes instead of 1 dominant one                                              | Acceptable — the report still ranks them, and the implementation PR can target the top 1–2                                                                                                                 |
| The cause might be Tamagui itself (irreducible)                                                            | Documented honestly. If true, the recommendations include a "scope of Tamagui-runtime workarounds" sub-section                                                                                             |
| User wants the rainbow back but the diagnostic shows it can't be restored without LCP cost on mobile       | The report includes the trade-off matrix in Section 3.5. User decides; the diagnostic doesn't force a side.                                                                                                |

### Success criteria

- The 4-second render delay has a concrete, evidence-backed attribution (not "probably JS bootup")
- The decision matrix in the report enables the user to pick the next implementation PR's scope without further investigation
- Each recommended fix has an estimated impact and complexity that can be defended from the trace data
- The hero rainbow restoration question gets a yes/no/conditional answer with rationale
