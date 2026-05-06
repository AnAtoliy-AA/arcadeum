# Home Page Layout Rework & Animations Design

## Goal

Rework the home page item positioning for a more modern, user-friendly layout, and add scroll-triggered reveal animations plus hover micro-interactions across all sections.

## Decisions Made

- **Hero layout**: Keep the two-column split (text left, card stack right) but improve proportions, visual hierarchy, and card stack presence.
- **Animation approach**: Pure CSS + IntersectionObserver (`useScrollReveal` hook). No new dependencies. Respects `prefers-reduced-motion`.
- **How It Works**: Keep horizontal steps on desktop but enhance with stronger glow, gradient connectors, and scroll-triggered stagger.
- **Animations scope**: Scroll-triggered reveals on all sections below the hero + hover micro-interactions on game cards, feature cards, and step numbers.

## Architecture

A single reusable `useScrollReveal` hook wraps `IntersectionObserver`. Components attach it to their container ref and set a `data-reveal` attribute that CSS transitions on. Stagger is handled via `data-reveal-delay` attributes driving CSS `transition-delay` values. All animation keyframes and reveal classes live in `globals.css` to keep them centralised.

## Part 1 — Hero Improvements

**File:** `apps/web/src/app/home/components/HomeHero.tsx`
**File:** `apps/web/src/app/home/components/styles/Hero.styles.ts`

### Kicker badge

- Add a sparkle/diamond prefix character (`✦`) before the kicker text.
- Change the kicker background from a plain gradient to a shimmer-glass pill: `background: linear-gradient(90deg, rgba(87,195,255,0.2), rgba(87,195,255,0.08), rgba(87,195,255,0.2))`.
- Keep existing `shimmer` animation (already wired up).

### CTA layout

- Demote the "Support the developers" link: remove it from `<HeroActions>` and render it as a small plain text link (`font-size: $3`, `opacity: 0.5`, `text-decoration: underline`) directly below `<HeroActions>`. This reduces visual noise from 3 equal-weight buttons to 2 primary buttons + 1 quiet link.

### Card stack proportions

- In `Hero.styles.ts`: increase `CardStack` width from `240` → `280`, height from `340` → `380`.
- Increase `HeroCard` `borderRadius` from `18` → `20`, `padding` from `$5` → `$6`.
- In `HeroVisual`: increase `maxWidth` from `500` → `540`, `height` from `400` → `460`.
- Per-card transform offsets in `HomeHero.tsx`: increase spread — `rotate(${index * 12 - 12}deg) translate(${index * 24 - 24}px, ${index * -12}px)`.

## Part 2 — Scroll Reveal System

### New file: `apps/web/src/shared/lib/useScrollReveal.ts`

```ts
import { useEffect, useRef } from 'react';

export function useScrollReveal<T extends HTMLElement = HTMLElement>(
  options: { threshold?: number; rootMargin?: string } = {},
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.reveal = 'visible';
          observer.disconnect();
        }
      },
      {
        threshold: options.threshold ?? 0.12,
        rootMargin: options.rootMargin ?? '0px',
      },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [options.threshold, options.rootMargin]);

  return ref;
}
```

### CSS additions to `apps/web/src/app/globals.css`

```css
/* Scroll reveal */
[data-reveal] {
  opacity: 0;
  transform: translateY(24px);
  transition:
    opacity 0.55s ease-out,
    transform 0.55s ease-out;
}
[data-reveal='visible'] {
  opacity: 1;
  transform: translateY(0);
}
/* Stagger delays */
[data-reveal-delay='1'] {
  transition-delay: 0.08s;
}
[data-reveal-delay='2'] {
  transition-delay: 0.16s;
}
[data-reveal-delay='3'] {
  transition-delay: 0.24s;
}
[data-reveal-delay='4'] {
  transition-delay: 0.32s;
}
[data-reveal-delay='5'] {
  transition-delay: 0.4s;
}
[data-reveal-delay='6'] {
  transition-delay: 0.48s;
}
/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  [data-reveal] {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
```

### Usage pattern (applied in each section component)

```tsx
const sectionRef = useScrollReveal<HTMLDivElement>();
// ...
<SectionWrapper ref={sectionRef} data-reveal>
  <SectionHeader data-reveal data-reveal-delay="1">
    ...
  </SectionHeader>
  <Content data-reveal data-reveal-delay="2">
    ...
  </Content>
</SectionWrapper>;
```

**Note on Tamagui refs:** Tamagui styled components forward refs. The `ref` prop on a Tamagui element receives the underlying DOM node as `HTMLDivElement` at runtime, so `el.dataset.reveal` works. Typed as `ref={sectionRef as any}` where needed to satisfy TS.

## Part 3 — Section-by-Section Reveal Application

### Games Slider — `HomeGames.tsx`

- `<SliderSection>`: attach `useScrollReveal`, set `data-reveal`.
- `<SectionHeader>`: `data-reveal data-reveal-delay="1"`.
- `<SliderContainer>`: `data-reveal data-reveal-delay="2"`.

### How It Works — `HomeHowItWorks.tsx`

- `<HowItWorksSection>`: attach `useScrollReveal`, set `data-reveal`.
- `<SectionHeader>`: `data-reveal data-reveal-delay="1"`.
- Each `<StepItem>`: `data-reveal data-reveal-delay={String(index + 2)}` (delays 2, 3, 4).

### Features — `HomeFeatures.tsx`

- `<FeaturesSection>`: attach `useScrollReveal`, set `data-reveal`.
- `<SectionHeader>`: `data-reveal data-reveal-delay="1"`.
- Each `<FeatureCard>`: `data-reveal data-reveal-delay={String(Math.min(index + 2, 6))}` (delays 2–6, capped at 6 for the last two cards).

### Presentation + PitchDeck — `HomePresentation.tsx`, `HomePitchDeck.tsx`

- Wrap the root element with `useScrollReveal`, set `data-reveal`.
- No stagger needed — single block reveal.

## Part 4 — Hover Micro-interactions

### Game cards — `HomeGames.tsx` + `Games.styles.ts`

- In `Games.styles.ts`: `MainGameCard` does not exist as a styled def (it's a re-export of `GlassCard`). Apply hover lift via `style` prop on the `<MainGameCard>` element in `HomeGames.tsx`:
  ```tsx
  <MainGameCard
    style={{
      boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
      transition: 'transform 0.2s ease-out, box-shadow 0.2s ease-out',
    }}
    hoverStyle={{ scale: 1.0 }} // reset tamagui scale to neutral — CSS handles it
    className="game-card-hover"
  />
  ```
- Add to `globals.css`:
  ```css
  .game-card-hover:hover {
    transform: translateY(-6px) !important;
    box-shadow: 0 28px 60px rgba(0, 0, 0, 0.5) !important;
  }
  ```

### Feature cards — `Features.styles.ts`

- Add `transition: 'transform 0.2s ease-out, box-shadow 0.2s ease-out, border-color 0.2s ease-out' as any` to `FeatureCard` (the `GlassCard` re-export won't accept this directly — apply via className + CSS instead).
- Add to `globals.css`:
  ```css
  .feature-card-hover:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4);
    border-color: rgba(87, 195, 255, 0.35) !important;
  }
  ```
- In `HomeFeatures.tsx`, add `className="feature-card-hover"` to each `<FeatureCard>`.
- Add `transition: 'transform 0.2s ease-out, box-shadow 0.2s ease-out' as any` to `FeatureIcon` in `Features.styles.ts`. Add `hoverStyle={{ scale: 1.1 }}` to `<FeatureIcon>` in `HomeFeatures.tsx`.

### Step numbers — `HowItWorks.styles.ts` + `HomeHowItWorks.tsx`

- Add `transition: 'transform 0.2s ease, box-shadow 0.2s ease' as any` to `StepNumber` in `HowItWorks.styles.ts`.
- In `HomeHowItWorks.tsx`, update the `StepNumber` inline style:
  ```tsx
  <StepNumber
    className="step-number-hover"
    style={{
      boxShadow:
        '0 0 20px rgba(87,195,255,0.15), 0 0 0 1px rgba(255,255,255,0.06)',
    }}
  />
  ```
- Add to `globals.css`:
  ```css
  .step-number-hover:hover {
    transform: scale(1.08);
    box-shadow:
      0 0 28px rgba(87, 195, 255, 0.35),
      0 0 0 1px rgba(87, 195, 255, 0.2) !important;
  }
  ```

## Part 5 — File Summary

| Status | File                                                     |
| ------ | -------------------------------------------------------- |
| NEW    | `apps/web/src/shared/lib/useScrollReveal.ts`             |
| MOD    | `apps/web/src/app/globals.css`                           |
| MOD    | `apps/web/src/app/home/components/HomeHero.tsx`          |
| MOD    | `apps/web/src/app/home/components/styles/Hero.styles.ts` |
| MOD    | `apps/web/src/app/home/components/HomeGames.tsx`         |
| MOD    | `apps/web/src/app/home/components/HomeHowItWorks.tsx`    |
| MOD    | `apps/web/src/app/home/components/HomeFeatures.tsx`      |
| MOD    | `apps/web/src/app/home/components/HomePresentation.tsx`  |
| MOD    | `apps/web/src/app/home/components/HomePitchDeck.tsx`     |

## What's Out of Scope

- No changes to section ordering.
- No changes to the Games slider interaction (drag-to-scroll stays as-is).
- No new dependencies added.
- No changes to theme tokens or the settings page.
- `DownloadCta` section excluded — it's already a strong standalone CTA block.

## Testing

- Visual: run `npm run dev`, open home page, scroll through all sections — each section should reveal sequentially.
- Reduced motion: in Chrome DevTools → Rendering → "Emulate CSS media feature prefers-reduced-motion" → all elements should appear immediately with no animation.
- TypeScript: `npx tsc --noEmit` should pass clean.
- No new unit tests needed — pure presentational changes with no logic.
