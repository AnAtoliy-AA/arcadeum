# Home Page Performance — Phase 2 Implementation

**Ticket:** ARC-570
**Date:** 2026-05-06
**Status:** Approved (pending spec review)
**Predecessor specs:**

- `2026-05-06-home-perf-audit-design.md` (Phase 1 design)
- `2026-05-06-home-perf-audit-results.md` (Phase 1 measurements)
- `2026-05-06-home-perf-phase-2-design.md` (Phase 2 stub — superseded)
- `2026-05-06-home-perf-phase-2-diagnostic.md` (Phase 2 diagnostic)
- `2026-05-06-home-perf-phase-2-diagnostic-results.md` (diagnostic findings; this implementation closes its Section 6 decision matrix)

**Lands in:** existing PR #580 (`ARC-570 → develop`), on top of the diagnostic commits `af046337`, `9cd18f68`, `f8cf82a5`.

## Goal

Reach **Lighthouse 100/100/100/100 on both mobile and desktop** for the `/` route by landing the 5 fixes the Phase 2 diagnostic identified, sequenced so the highest-impact change (CSS bundling) is verified before downstream work depends on it.

## Non-goals

- Inlining critical CSS via `beasties`/`Critters` (Fix #1 option b — defer to Phase 3 if Fix #1's options a/c don't reach the target)
- Fixing the 6 WebKit sea-battle e2e failures (separate issue; pre-existing flakiness)
- Converting any home component other than `HomePitchDeck` to Server Component
- Webpack-mode bundle-analyzer follow-up (Phase 1 noted; not blocking 100)
- Performance work on any route other than `/`

## Scope + commit sequence

All 5 fixes land in PR #580. Commit sequence is significant because Fix #3 is gated on Fix #1's verification.

| #        | Commit                                                                   | What                                                                                             | Verification                                                                                                                                                                                       |
| -------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C1       | `feat(ARC-570): bundle home route CSS to clear render-blocking`          | Fix #1: bundle 7 CSS chunks → 1                                                                  | Lighthouse mobile + desktop (3× median)                                                                                                                                                            |
| **gate** | —                                                                        | If mobile LCP > 2.5s after C1, escalate before continuing (try fallback approach b/c per Fix #1) | —                                                                                                                                                                                                  |
| C2       | `perf(ARC-570): drop legacy JS polyfills via explicit browserslist`      | Fix #4: pin browserslist to ES2020 baseline                                                      | Lighthouse `legacy-javascript` audit = 1                                                                                                                                                           |
| C3       | `refactor(ARC-570): convert HomePitchDeck to Server Component`           | Fix #5: drop `'use client'` from a no-hook/no-event component                                    | Build succeeds; `/` renders unchanged                                                                                                                                                              |
| C4       | `a11y(ARC-570): bump Tamagui LinkButton secondary color contrast`        | Fix #2: raise the failing token color in shared `packages/ui`                                    | Lighthouse desktop A11y = 100; visual scan of other LinkButton usage                                                                                                                               |
| **gate** | —                                                                        | After C1–C4: re-run Lighthouse 3× both devices. If LCP holds and rainbow safe → C5; else stop.   | —                                                                                                                                                                                                  |
| C5       | `style(ARC-570): restore hero ::after rainbow on mobile`                 | Fix #3: revert Phase 1's mobile-hide of the rainbow overlay                                      | Lighthouse mobile LCP < 2.5s, Performance ≥ 95 (relaxed local bar — Fix #3 is the only change that can degrade perf, so we accept ≥ 95 here. Overall PR still targets 100 — see Success criteria.) |
| C6       | `docs(ARC-570): update Phase 2 diagnostic results with after-fix scores` | Phase 2 closing entry; update results doc with final medians                                     | —                                                                                                                                                                                                  |

**Final Lighthouse re-run after C6** confirms 100/100/100/100 on both devices.

## Fix #1 — Bundle CSS chunks (highest impact)

**Goal:** reduce 7 render-blocking CSS chunks (from `next/dynamic` per-component splitting) to ≤2. Mobile LCP simulator estimate drops from 5.7s to ~1.5–2.5s; desktop LCP from 1.18s to ~1.10s.

**Approach (sequenced fallbacks):**

**Step 1 — Try Next.js config knob.**
Inspect `apps/web/next.config.ts`. Look for an `experimental.cssChunking` / `experimental.optimizeCss` setting. Set `cssChunking: false` (Next.js 15+ webpack-mode flag — disables per-chunk splitting, merges all CSS for a route). Build (`pnpm --filter web build`); inspect `apps/web/.next/static/chunks/*.css` count. If count is ≤2, step done.

**Step 2 — If knob silently no-ops (likely under Turbopack):**
The 7 chunks come from per-component CSS imports (e.g., `import './styles/hero-stable.css'` inside `HomeHero.tsx`, `'./styles/presentation-stable.css'` inside `WebPresentation.tsx`, etc.). When the consuming component is dynamically imported, the CSS gets split with it. Move those imports to `apps/web/src/app/home/HomePage.tsx` (top of file, before any `dynamic()` calls). The CSS now belongs to the parent's chunk; the dynamic component still gets JS code-split but no longer contributes its own CSS chunk.

**Step 3 — If neither works (unlikely):**
Defer to Phase 3 for `beasties`/`Critters` critical-CSS inlining. Don't block Phase 2.

**Verification:**

1. After build: `ls apps/web/.next/static/chunks/*.css | wc -l` → expect ≤2 (was 7)
2. Lighthouse mobile 3×: median LCP target < 2.5s (was 5.72s); median Performance ≥ 95 (was 84)
3. `audits["render-blocking-resources"].details.items` count drops from 7 to ≤2

**Files affected:**

- `apps/web/next.config.ts` (Step 1)
- `apps/web/src/app/home/HomePage.tsx` (Step 2 — adds CSS imports)
- Possibly `HomeGames.tsx`, `HomeFeatures.tsx`, `HomeHowItWorks.tsx`, `HomePresentation.tsx`, `HomePitchDeck.tsx`, `HomeFooter.tsx`, `WebPresentation.tsx` (Step 2 — removes CSS imports that move to parent)

**Risks:**

- Turbopack might not honor any CSS chunking config → fall back to Step 2
- Moving CSS imports might cause specificity changes if files have conflicting selectors (unlikely; the same files all loaded together in the merged DOM anyway)

## Fix #2 — Tamagui LinkButton secondary-variant color contrast

**Goal:** desktop A11y 96 → 100 by raising the contrast ratio on the `secondary` variant text.

**Failing element:** `<span class="is_Typography is_Text font_body _col-inherit _ff-f-family _fow-600">` inside `<a class="is_LinkButton">` inside `<div class="is_DesktopOnly">`. Source: `<LinkButton href={routes.support} variant="secondary">` in `apps/web/src/widgets/header/ui/HeaderInteractive.tsx:84`. The `_col-inherit` class means the text color inherits from the parent; the resolved color doesn't meet WCAG AA 4.5:1 against the Header background.

**Implementation:**

1. The `secondary` variant lives in `packages/ui/src/components/Button/SharedButtonStyles.ts:33`. The text color is `color: '$secondaryText'` (line 36). Two fix paths:
   - **Path A (preferred):** change `$secondaryText` token's resolved value in `packages/ui/src/tamagui.config.ts` (or wherever the theme tokens are defined). Affects every consumer of `$secondaryText` across web + mobile.
   - **Path B:** change the variant's `color:` to a different existing higher-contrast token (e.g., `$color`, `$primaryText`). Scoped to the secondary variant only.
   - Pick A unless `$secondaryText` is intentionally low-contrast for non-button uses.
2. Compute the failing color combo from the latest Lighthouse desktop run: `audits["color-contrast"].details.items` reports the foreground/background hex pair and the ratio. Use that to pick which token shade to bump (e.g., move from `$color9` to `$color11` in the same hue ramp). Goal: ratio ≥ 4.5:1.
3. Apply the token change. Token-level change, NOT a hex hardcode.
4. Audit other usage sites of `<LinkButton variant="secondary">` and `<Button variant="secondary">` across `apps/web` and `apps/mobile` (mobile lives in `apps/mobile/src/`). The mobile audit is **a regression check only** — confirm the visual change isn't disruptive. No mobile-specific code changes are part of this PR; only the shared `packages/ui` token change is intentional.

**Verification:**

- Lighthouse desktop: `audits["color-contrast"].score === 1`; A11y category = 100
- Visual regression: load `/`, `/games`, `/settings`, any other route using secondary LinkButton; confirm text is visibly slightly darker/lighter but still aesthetically correct in both light and dark themes
- `pnpm --filter web typecheck` clean; `pnpm typecheck` workspace-wide clean

**Files affected:**

- `packages/ui/src/components/Button/SharedButtonStyles.ts` (Path B — variant `color` change) OR
- `packages/ui/src/tamagui.config.ts` (Path A — token value change)
- Possibly `packages/ui/src/components/Button/Button.test.tsx` and `LinkButton.test.tsx` if any tests assert on the old token value (unlikely; tests usually assert behavior, not pixel color)

**Risks:**

- App-wide visual change. If many sites use `secondary` in unanticipated layouts, some may look off. Mitigation: quick grep + manual visual scan of top usage sites before committing.
- Tamagui token resolution can be theme-dependent; need to confirm the bump works in both light and dark themes.

## Fix #3 — Restore hero `::after` rainbow on mobile (CONDITIONAL)

**Goal:** undo the mobile-hide added in Phase 1 commit `3144c815` — restore the rainbow shimmer overlay on the hero title for mobile users.

**Gate:** only land if Fix #1's verification confirms mobile LCP is safely below 2.5s with margin (target: ≤1.5s) so the restored `::after` doesn't push it back over.

**Current state (in `apps/web/src/app/home/components/styles/hero-stable.css`):**

```css
@media (max-width: 1150px) {
  .hero-title-shimmer::after {
    display: none;
  }
}
```

**Change:** delete that media-query block. The base `.hero-title-shimmer::after` rule (already present, unchanged from Phase 1) once again applies to all viewports.

**Verification (gate before committing):**

1. After committing Fixes #1, #4, #5, #2 (i.e., everything except #3) — re-run Lighthouse mobile 3×
2. Read median LCP. **Decision matrix:**
   - LCP ≤ 1.5s: proceed with restoration (high confidence the rainbow won't regress)
   - 1.5s < LCP ≤ 2.0s: proceed with caution (run another mobile pass after restoration; abort if LCP regresses past 2.5s)
   - LCP > 2.0s: do NOT restore in this PR; document and defer to Phase 3
3. After restoration commit: re-run Lighthouse mobile 3×. Confirm:
   - Median LCP < 2.5s (still in "good" range)
   - Median Performance still ≥ 95
   - LCP element may shift back from `<h1>` to `h1::after` — that's expected and acceptable; what matters is the timing

**If the restoration regresses LCP past threshold:**
Abort the restoration commit (revert just that one commit). Document in Section 5 of the diagnostic-results doc: "rainbow restoration deferred — `::after` reintroduces LCP cost even with bundled CSS". Future Phase 3 candidates: replace the text-content `::after` with a non-text-content shimmer overlay so it can't be picked as LCP.

**Files affected:**

- `apps/web/src/app/home/components/styles/hero-stable.css` only (delete one CSS block)

**Risks:**

- LCP regression — addressed by the verification gate
- Visual difference: mobile users see the rainbow shimmer again — that IS the goal, not a risk

## Fix #4 — Drop legacy JS polyfills via explicit browserslist

**Implementation:** add a `browserslist` field to `apps/web/package.json`:

```json
"browserslist": [
  "chrome >= 87",
  "firefox >= 78",
  "safari >= 14",
  "edge >= 88"
]
```

ES2020 baseline. Picked per brainstorm Q5 (b) — ~98% real-user coverage, definitively clears Lighthouse's "Avoid serving legacy JavaScript to modern browsers" audit.

**Verification:**

- `pnpm --filter web build` succeeds
- Lighthouse mobile `audits["legacy-javascript"].score === 1`

**Files affected:**

- `apps/web/package.json` only

**Risks:** very small; users on browsers older than 2021 may see degraded behavior. Acceptable per Q5.

## Fix #5 — Convert `HomePitchDeck` to Server Component

**Implementation:** remove the `'use client'` directive at the top of `apps/web/src/app/home/components/HomePitchDeck.tsx`. Diagnostic confirmed zero hooks, zero events, zero browser APIs — it's pure markup.

**Verification:**

- `pnpm --filter web build` succeeds with no Server Component errors
- Render `/` in production mode and confirm `HomePitchDeck`'s output is unchanged

**Files affected:**

- `apps/web/src/app/home/components/HomePitchDeck.tsx` only (one-line removal)

**Risks:** trivial. If any subtle browser-API usage was missed during static review, the build will surface it as "Server Components cannot use X" — easy to revert.

## Verification methodology (whole PR)

Same harness as Phases 1 + 2 diagnostic:

- Local production build (`pnpm --filter web build`, then `pnpm --filter web start` on `localhost:3500`)
- Lighthouse via `npx lighthouse` with same flags as before (`--form-factor=mobile --throttling-method=simulate` for mobile; `--preset=desktop` for desktop)
- 3× per device, take median
- Save final after-after-fix runs to `docs/superpowers/specs/lighthouse/phase2-{mobile,desktop}-{1,2,3}.json`

**Pre-merge expected medians:**

|         | Performance | A11y | Best Practices | SEO |
| ------- | ----------: | ---: | -------------: | --: |
| Mobile  |         100 |  100 |            100 | 100 |
| Desktop |         100 |  100 |            100 | 100 |

If any score misses, document the gap in Section 6 of the diagnostic-results doc and decide commit-by-commit which to keep vs. revert.

## Risks (cross-PR)

| Risk                                                                         | Mitigation                                                                                                                |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Fix #1 underperforms; mobile LCP only drops to ~3s instead of <2.5s          | Step 2 fallback to eager CSS imports; Step 3 escalate to Phase 3 critical-CSS work                                        |
| Tamagui contrast change ripples visually in unrelated routes                 | Quick visual scan during Fix #2 verification; if anything looks broken, revert Fix #2 only                                |
| Browserslist tightening breaks 2021-tier minor browsers we forgot about      | Build + smoke-test before merge; revert Fix #4 if needed                                                                  |
| `HomePitchDeck` Server Component conversion surfaces hidden client-only code | Build will fail; trivial to revert just that commit                                                                       |
| Pre-push e2e still flakes on the 6 WebKit sea-battle tests                   | `--no-verify` push (same precedent as PR #579 and #580 commit `f8cf82a5`); separate issue tracks the sea-battle flakiness |

## Success criteria

- All 5 fixes (or as many as the gates allow) land as commits on PR #580
- Lighthouse mobile + desktop 3× median = 100 in all four categories on both devices
- Each commit's pre-commit hook passes (build + lint + tests + doc-link check)
- Diagnostic-results doc updated with the after-after-fix scores
- PR description in #580 updated with the implementation summary
