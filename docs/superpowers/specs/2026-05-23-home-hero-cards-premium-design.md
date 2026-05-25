# Home Hero Cards — Premium Visual Refresh (ARC-734)

**Status:** Approved (design phase)
**Date:** 2026-05-23
**Branch:** ARC-734
**Owner:** AnAtoliy-AA

## Problem

The home page hero (`apps/web/src/app/[locale]/home/components/HomeHero.tsx`) shows three fanned-out cards representing CRITICAL game variants. Each card centers a 120px emoji (🤖, 🦑, 🕵️‍♀️) on a flat semi-transparent color tile. The emoji centerpiece reads as a placeholder and undermines the otherwise polished hero layout. The product needs the hero to feel premium and modern on first paint.

## Goal

Replace the emoji-driven cards with full-bleed AI artwork that already ships in the repo, presented with refined typography and a card surface treatment (scrims, inner ring, elevation) that reads as a premium playing card. Keep the existing fan-out stack and animations.

## Non-goals

- Generating new artwork or touching the sprite sheets in `apps/web/public/images/cards/`.
- Refactoring `CARD_VARIANTS` beyond adding one optional field.
- Changing the games index page or any other surface that consumes `CARD_VARIANTS`.
- Internationalising new copy — the design reuses existing keys (`games.critical_v1.variants.*.name`, `home.heroCardBrand`).

## Background

### Current implementation

`HomeHero.tsx` (lines 23–31, 137–225) picks `CARD_VARIANTS.slice(0, 3)` — currently cyberpunk, underwater, crime — and renders each as a div with:

- A solid colored background overlay at 60% opacity (`var(--<colorToken>)`).
- A top row with the variant name (left) and a small emoji (right).
- A 120px emoji centered in the body.
- A bottom row with the `CRITICAL` brand label.

The fan-out positioning lives in inline CSS variables (`--card-x`, `--card-y`, `--card-rotate`, `--card-scale`) and is animated by `.hero-card-main` rules in `apps/web/src/app/[locale]/home/components/styles/home-bundle.css:282–330`.

### Available artwork

`apps/web/public/images/variants/` contains six 1024×1024 background paintings shipped as `.png` (egypt, fantasy, galaxy, steampunk, western, zen). File sizes range 713 KB–1.0 MB. Each has a clear central subject and dramatic color palette — production-grade quality.

### Selected hero trio

**Fantasy / Galaxy / Steampunk.** Chosen because:

- Color palettes are mutually distinct (green-teal, cosmic purple, copper-warm), so a fanned stack reads as three clearly different cards.
- Each has a strong central subject (dragon, space station, gear mechanism) that sits well behind a top title and bottom brand label.
- This trio mirrors the red/blue/purple silhouette of the current stack — visual rhythm of the existing composition is preserved.

## Design

### Card composition (front card)

```
┌───────────────────────────────────┐  rounded 20px
│ ░░░ dark gradient scrim, ~30% ░░░ │  ← legibility top
│  Fantasy                          │  ← variant name (i18n)
│                                   │
│                                   │
│        full-bleed artwork         │  ← <Image fill> 1024×1024 source
│                                   │
│                                   │
│ ░░░ dark gradient scrim, ~40% ░░░ │  ← legibility bottom
│             CRITICAL              │  ← brand label
└───────────────────────────────────┘
   ↳ outer drop shadow, inner 1px ring at white@8%
```

- **Top scrim:** linear-gradient from `rgba(0,0,0,0.55)` at the top to transparent ~35% down.
- **Bottom scrim:** linear-gradient from transparent ~60% down to `rgba(0,0,0,0.65)` at the bottom.
- **Inner ring:** `box-shadow: inset 0 0 0 1px rgba(255,255,255,0.08)` for subtle edge definition.
- **Outer elevation:** layered drop shadow (e.g. `0 20px 40px -10px rgba(0,0,0,0.55), 0 6px 14px rgba(0,0,0,0.3)`).
- **No emoji** anywhere on the card. The top-right emoji and the 120px centerpiece are both removed.

### Typography

- **Variant name:** existing token, weight 600, slight letter-spacing (`-0.005em`), `color: #fff`, `text-shadow: 0 1px 2px rgba(0,0,0,0.6)` for art-on-text contrast.
- **Brand label (`CRITICAL`):** uppercase, `letter-spacing: 0.18em`, `color: rgba(255,255,255,0.78)`, weight 700, font-size 12–13px.

### Stack and motion

- **Fan layout:** unchanged — same x/y/rotate/scale CSS variable contract.
- **Hover:** keep existing transform-on-hover from `.hero-card-main:hover`.
- **Premium foil shimmer (subtle):** a `::after` pseudo-element on `.hero-card-main` with a diagonal `linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.06) 50%, transparent 70%)` translated across the card on hover with a 1.6s ease. Always-on shimmer would be too noisy — only animates on hover of the front card.
- **`prefers-reduced-motion`:** disables the shimmer and falls back to the current static hover lift.

### Data model

Add an optional field to `CARD_VARIANTS` for variants that have shipped background art:

```ts
// apps/web/src/features/games/lib/criticalVariants.ts
{
  id: 'fantasy',
  name: 'games.critical_v1.variants.fantasy.name',
  description: '…',
  emoji: '🐉',
  gradient: '…',
  bgImage: '/images/variants/fantasy_bg.png',  // ← new, optional
},
```

Populate `bgImage` for: `egypt`, `fantasy`, `galaxy`, `steampunk`, `western`, `zen`. Leave undefined elsewhere. This is non-breaking — consumers that ignore `bgImage` are unaffected.

### Hero variant selection

Replace the slice with an explicit curated list:

```ts
// HomeHero.tsx
const HERO_VARIANT_IDS = ['fantasy', 'galaxy', 'steampunk'] as const;

const heroCards = useMemo(
  () =>
    HERO_VARIANT_IDS.map((id, i) => {
      const v = CARD_VARIANTS.find((c) => c.id === id);
      return {
        name: v?.name ?? '',
        bgImage: v?.bgImage,
      };
    }),
  [],
);
```

If a referenced variant ever loses its `bgImage` (e.g. asset deleted), the card renders a solid fallback (`var(--<id>-fallback)` or the existing gradient) rather than crashing.

### Image delivery

- Use `next/image` with `fill`, `priority={isFront}`, `sizes="(max-width: 768px) 60vw, 320px"`.
- `next/image` will serve AVIF/WebP automatically — the existing PNGs stay as the source.
- Object-fit cover, object-position center.

## File changes (summary)

| File                                                               | Change                                                                                                                                 |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/web/src/features/games/lib/criticalVariants.ts`              | Add optional `bgImage?: string` to the entry type. Populate for 6 variants with art.                                                   |
| `apps/web/src/app/[locale]/home/components/HomeHero.tsx`           | Replace `slice(0, 3)` with curated `HERO_VARIANT_IDS`. Strip inline emoji/style block. Render `next/image` background + two text rows. |
| `apps/web/src/app/[locale]/home/components/styles/home-bundle.css` | Add scrim gradients, inner ring, outer shadow, `prefers-reduced-motion` guard, and `::after` shimmer rules.                            |
| `apps/web/src/app/[locale]/home/components/styles/Hero.styles.tsx` | No change expected; only the bundle CSS rules for `.hero-card-main` evolve.                                                            |

## Edge cases & states

- **Variant without `bgImage`:** card falls back to its `CARD_VARIANTS.gradient` (so the curated-but-missing case still renders something premium-looking).
- **Image load failure:** `next/image` `onError` handler swaps to gradient fallback. The card never shows a broken-image icon.
- **SSR / before hydration:** `Image priority` on the front card means it's part of the LCP candidate set. The other two cards lazy-load.
- **Reduced motion:** shimmer suppressed; hover transform stays.
- **Tests:** existing `data-testid="hero-card-${index}"` and `data-testid="hero-card-stack"` selectors are preserved so any e2e referencing them is unaffected.

## Risks & mitigations

- **LCP regression** — adding a remote image to the LCP slot could slow it down. Mitigation: `priority` only on the front card, correct `sizes` attribute, source is already in `public/`.
- **File weight** — 3 × ~900 KB PNGs is 2.7 MB raw. Mitigation: `next/image` AVIF/WebP transforms bring each to ~80–150 KB at the rendered size.
- **Visual review across themes** — light theme will need scrim contrast verified. Current hero background is dark, so scrims are already tuned for that case; we'll spot-check.

## Out of scope

- Adopting `bgImage` on the games index / variant picker — separate ticket if desired.
- Replacing emoji in the variant picker overlay.
- Generating artwork for the 6 variants that don't have backgrounds.

## Verification plan

- Visual: load `/`, confirm all three cards render the AI artwork, fan-out unchanged, hover shimmer plays on the front card, scrims keep text legible.
- Performance: confirm LCP element is the front-card image; verify network panel shows AVIF/WebP, not PNG, and total card weight under ~500 KB combined.
- A11y: confirm reduced-motion suppresses shimmer; confirm card text contrast passes WCAG AA against the scrims.
- Regression: existing `data-testid` selectors still match; `pnpm test` (web) passes; `pnpm lint` and `pnpm check-file-length` pass.
