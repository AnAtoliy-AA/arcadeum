# Home Page Performance — Phase 2: Closing the gap to 100/100/100/100

**Ticket:** ARC-570 (or new ticket TBD)
**Date:** 2026-05-06
**Status:** Draft — pending brainstorming session
**Predecessor specs:**

- `2026-05-06-home-perf-audit-design.md` (Phase 1 design)
- `2026-05-06-home-perf-audit-results.md` (Phase 1 measurements)

## Phase 1 outcome (recap)

Mobile and desktop Lighthouse scores at the start AND end of Phase 1:

|         | Performance | A11y | Best Practices | SEO |
| ------- | ----------: | ---: | -------------: | --: |
| Mobile  |          84 |  100 |            100 | 100 |
| Desktop |          98 |   96 |            100 | 100 |

Phase 1 cleaned up the in-progress diff, fixed a lint blocker, removed
expensive mobile-only visual effects, and resolved one A11y audit. The
remaining gap to 100/100/100/100 is **structural**: it requires
architectural changes that exceed a single PR's scope.

## Remaining gap

### Mobile Performance (84 → 100, gap = 16 points)

The gap is entirely **LCP**. Lighthouse breakdown:

| Phase            |       Time | % of LCP |
| ---------------- | ---------: | -------: |
| TTFB             |      452ms |      10% |
| Load Delay       |        0ms |       0% |
| Load Time        |        0ms |       0% |
| **Render Delay** | **4064ms** |  **90%** |

Render Delay = time from "all resources ready" to "LCP element actually
paints". Broken down by Lighthouse opportunities:

- 7 render-blocking CSS chunks @ 300ms direct savings
- 52 KiB unused JavaScript
- 14 KiB legacy JavaScript polyfills (modern browsers shouldn't get them)
- 27 KiB image delivery savings (responsive sizing)
- 482 DOM elements (high-ish)
- Tamagui runtime cost (CSS-in-JS hydration)
- Geist font load timing under throttle

### Desktop Accessibility (96 → 100, gap = 4 points)

A single failing audit:

- `color-contrast` on `div.is_DesktopOnly > a > div.is_LinkButton > span.is_Typography`
  (the secondary-variant LinkButton in the Header desktop nav). Tamagui
  generates the className `is_Typography is_Text font_body _col-inherit
_ff-f-family _fow-600` — the inherited color does not pass WCAG AA
  4.5:1 against the Header background.

## Candidate fixes

| #    | Candidate                                                                                                                                             | Category     | Est. point gain | Complexity | Regression risk                            | Decision needed                                                                                                                                                     |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | --------------: | ---------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P2-1 | Fix Tamagui LinkButton secondary-variant color contrast                                                                                               | Desktop A11y |     +4 (96→100) | Low        | Low (single component override)            | yes — adjust shared `packages/ui` LinkButton variant tokens or override at the Header call site                                                                     |
| P2-2 | Inline critical CSS for `/` route (eliminate 7 render-blocking chunks)                                                                                | Mobile Perf  |        +4 to +8 | High       | Medium                                     | Investigate Next.js critical-CSS extraction or migrate to a CSS-in-JS that ships zero-runtime CSS                                                                   |
| P2-3 | Reduce Tamagui runtime cost above the fold (convert HomeHero to Server Component shell with minimal client islands for translation + hydration class) | Mobile Perf  |       +5 to +10 | High       | Medium                                     | The current `'use client'` is justified by `useTranslation` and the post-mount class toggle — both can be replaced (server-side i18n + CSS-only animation triggers) |
| P2-4 | Drop unused JavaScript (~52 KiB) — likely Tamagui or unused exports                                                                                   | Mobile Perf  |        +1 to +3 | Medium     | Low                                        | Run `next build --webpack` with `@next/bundle-analyzer` (Turbopack is incompatible) and trace the largest unattributed chunks                                       |
| P2-5 | Drop legacy JS polyfills (~14 KiB) for modern browsers                                                                                                | Mobile Perf  |        +1 to +2 | Low        | Low (small chance of breaking IE/very old) | Tighten `browserslist` config (apps/web `package.json`) to drop ES2017-and-earlier targets                                                                          |
| P2-6 | Convert `HomePitchDeck.tsx` to Server Component (currently `'use client'` with zero hooks/events)                                                     | Mobile Perf  |        +0 to +1 | Trivial    | Negligible                                 | Remove `'use client'` directive, verify it still renders                                                                                                            |
| P2-7 | Defer Geist font load OR use `font-display: optional`                                                                                                 | Mobile Perf  |        +0 to +2 | Low        | Medium (visible font swap)                 | A/B: optional vs swap with preload                                                                                                                                  |
| P2-8 | Reduce DOM size on initial paint (482 elements) — defer rendering of below-fold sections more aggressively (e.g., skeleton placeholders)              | Mobile Perf  |        +1 to +2 | Medium     | Medium (CLS risk if min-heights wrong)     | Already partially addressed in Phase 1 (HomeGames + HomeFooter via dynamic). Audit DOM tree for further trim opportunities                                          |
| P2-9 | Investigate why `<h1>` has 4-second render delay despite preloaded font                                                                               | Diagnostic   |               — | High       | —                                          | Use Performance API + Chrome DevTools to capture exact paint events; might reveal a single-cause fix                                                                |

**Estimated reach with P2-1 + P2-2 + P2-3 alone:**

- Mobile Perf 84 → 92-100
- Desktop A11y 96 → 100
- Other categories unchanged at 100

## Trade-off questions to brainstorm

Each affects user-visible behavior or shared code:

1. **Hero rainbow shimmer on mobile.** Phase 1 hid `::after` entirely on
   mobile. Acceptable as permanent? Or should we restore it after we
   solve the LCP problem differently?
2. **Title fade-in animation.** Phase 1 dropped the `animate-fade-in-up`
   on the `<h1>`. The title now appears instantly at FCP. Acceptable
   as permanent visual style?
3. **Can `HomeHero` become a Server Component?** Requires:
   - Server-side translation (already supported via `getTranslations`)
   - CSS-only entrance animation (no `is-hydrated` class toggle)
   - Or: keep a tiny client island for the post-mount class only,
     wrapped around an otherwise-server hero
4. **Are we OK touching `packages/ui` to fix the Tamagui LinkButton
   contrast?** It improves `/` desktop A11y but affects every route.
   Need design-system owner consent (probably also user).
5. **Drop legacy JS polyfills?** Browser support cut: probably OK
   (Geist is loaded from Google Fonts which already targets modern UAs),
   but worth confirming what % of real traffic uses IE/very old
   browsers.

## Suggested next-step process

1. Run `/brainstorming` against this stub. Resolve trade-off questions.
2. Decide which subset of P2-1..P2-9 to bundle into Phase 2.
3. Write a Phase 2 plan via `/writing-plans`.
4. Execute via subagent-driven-development or executing-plans.
5. Re-run the same Lighthouse harness from Phase 1 (3× median, mobile +
   desktop, headless Chrome via `npx lighthouse`) and update the Phase 2
   results doc.

## Notes on tooling

- The bundle analyzer setup from Phase 1 (`@next/bundle-analyzer` behind
  `ANALYZE=true`) does not work with Turbopack builds. For Phase 2, run
  `next build --webpack ANALYZE=true` to get the report — note that
  webpack and Turbopack output may differ in module attribution.
- Lighthouse CLI was used in Phase 1 with default mobile preset (Moto G4
  / Slow 4G / 4× CPU) and default desktop preset. Same for Phase 2 to
  preserve apples-to-apples comparison.
- Raw Lighthouse JSON archived under `docs/superpowers/specs/lighthouse/`
  with filename pattern `(baseline|after5)-(mobile|desktop)-N.json`.
