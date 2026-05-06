# Home Page Layout Rework & Animations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add scroll-triggered reveal animations and hover micro-interactions to all home page sections, and improve the hero layout proportions and visual hierarchy.

**Architecture:** A single `useScrollReveal` hook uses IntersectionObserver to observe a section container; when the container enters the viewport, the hook sets `data-reveal="visible"` on all `[data-reveal]` descendants. CSS handles the transitions and stagger delays via `data-reveal-delay` attributes. Hero improvements are pure styling changes to existing styled components and inline styles. No new dependencies.

**Tech Stack:** Next.js 14, Tamagui, TypeScript, CSS (globals.css), IntersectionObserver API

---

## Codebase Context

This is a TypeScript monorepo. The web app lives at `apps/web/`. Home page components are at `apps/web/src/app/home/components/`. Styles are split: Tamagui `styled()` components in `*.styles.ts` files, global CSS keyframes/utilities in `apps/web/src/app/globals.css`.

**Key Tamagui constraints (already established in this codebase):**

- `boxShadow` prop on Tamagui elements maps to React Native shadow — NOT CSS `box-shadow`. Always use inline `style={{ boxShadow: '...' }}` for CSS box-shadow.
- `backgroundColor` doesn't support CSS gradients. Use `style={{ background: '...' }}` for gradients.
- Tamagui styled components forward refs. The DOM node is available as `HTMLDivElement`. Cast ref prop as `ref={ref as any}` to satisfy TypeScript.
- `data-*` attributes (e.g. `data-reveal`, `data-reveal-delay`) pass through to the DOM on Tamagui elements without TypeScript errors.
- `GlassCard` (`packages/ui/src/components/GlassCard/GlassCard.tsx`) is a `memo` wrapper around a `StyledGlassCard` — it accepts `className` and all `YStack` props via spread. Used as `MainGameCard` and `FeatureCard` in home components.
- `MainGameCard` and `FeatureCard` are both re-exports of `GlassCard` from `@/shared/ui`. They cannot have hover styles added via styled() — use `className` + CSS in `globals.css` instead.

---

## Task 1: useScrollReveal hook + CSS reveal system

**Files:**

- Create: `apps/web/src/shared/lib/useScrollReveal.ts`
- Modify: `apps/web/src/app/globals.css`

- [ ] **Step 1: Create the hook**

Create `apps/web/src/shared/lib/useScrollReveal.ts` with this exact content:

```ts
'use client';

import { useEffect, useRef } from 'react';

export interface ScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
}

/**
 * Attaches an IntersectionObserver to the returned ref.
 * When the element enters the viewport, sets data-reveal="visible" on the
 * element itself and all [data-reveal] descendants — triggering CSS transitions.
 * Fires once then disconnects.
 */
export function useScrollReveal<T extends HTMLElement = HTMLElement>(
  options: ScrollRevealOptions = {},
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.querySelectorAll<HTMLElement>('[data-reveal]').forEach((child) => {
            child.dataset.reveal = 'visible';
          });
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

- [ ] **Step 2: Add CSS reveal classes to globals.css**

Open `apps/web/src/app/globals.css` and append the following block at the end of the file:

```css
/* ─── Scroll Reveal ─────────────────────────────────────── */
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
/* Stagger delays — apply alongside data-reveal */
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
/* Reduced motion: skip animations entirely */
@media (prefers-reduced-motion: reduce) {
  [data-reveal] {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
```

- [ ] **Step 3: Verify TypeScript is clean**

```bash
cd /Users/anatoliyaliaksandrau/js/arcadeum
npx tsc --noEmit 2>&1 | head -30
```

Expected: zero errors (or only pre-existing errors unrelated to the new file).

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/shared/lib/useScrollReveal.ts apps/web/src/app/globals.css
git commit -m "feat(ARC-425): add useScrollReveal hook and CSS reveal/stagger system"
```

---

## Task 2: Hero — improved proportions, kicker badge, CTA hierarchy

**Files:**

- Modify: `apps/web/src/app/home/components/styles/Hero.styles.ts`
- Modify: `apps/web/src/app/home/components/HomeHero.tsx`

**Context:** The hero uses a two-column layout on desktop (`$gtMd: flexDirection: 'row'`). The card stack is on the right (`HeroVisual`). We're making the cards larger and the kicker badge more prominent, and demoting the "Support" CTA from a full button to a quiet text link.

- [ ] **Step 1: Update Hero.styles.ts — card stack and visual proportions**

In `apps/web/src/app/home/components/styles/Hero.styles.ts`, make these changes:

Change `CardStack` dimensions:

```ts
// Before:
export const CardStack = styled(YStack, {
  name: 'CardStack',
  position: 'relative',
  width: 240,
  height: 340,
});

// After:
export const CardStack = styled(YStack, {
  name: 'CardStack',
  position: 'relative',
  width: 280,
  height: 380,
});
```

Change `HeroCard` border radius and padding:

```ts
// Before:
  borderRadius: 18,
  padding: '$5',

// After:
  borderRadius: 20,
  padding: '$6',
```

Change `HeroVisual` maxWidth and height:

```ts
// Before:
  maxWidth: 500,
  height: 400,

// After:
  maxWidth: 540,
  height: 460,
```

- [ ] **Step 2: Update HomeHero.tsx — kicker, card transforms, support link**

In `apps/web/src/app/home/components/HomeHero.tsx`:

**2a. Kicker badge** — change the `background` in the `<Kicker style={...}>` inline style from the current `linear-gradient(90deg, #7ad7ff, #57c3ff, #7ad7ff)` to a wider shimmer-glass gradient, and prefix the kicker text with `✦ `:

```tsx
// Before:
        <Kicker
          style={{
            background: 'linear-gradient(90deg, #7ad7ff, #57c3ff, #7ad7ff)',
            backgroundSize: '200% auto',
            animation: 'fadeInUp 0.6s ease-out 0.15s both, shimmer 3s linear infinite',
          }}
        >
          {kicker}
        </Kicker>

// After:
        <Kicker
          style={{
            background: 'linear-gradient(90deg, rgba(87,195,255,0.22), rgba(87,195,255,0.08), rgba(87,195,255,0.22))',
            backgroundSize: '200% auto',
            animation: 'fadeInUp 0.6s ease-out 0.15s both, shimmer 3s linear infinite',
          }}
        >
          ✦ {kicker}
        </Kicker>
```

**2b. Card stack transforms** — in the `HeroCard` `style` prop inside the `.map()`, increase the rotation and translation spread:

```tsx
// Before:
              style={{
                transform: `rotate(${index * 10 - 10}deg) translate(${index * 20 - 20}px, ${index * -10}px)`,
                zIndex: index,
                boxShadow: `0 28px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.18)`,
              }}

// After:
              style={{
                transform: `rotate(${index * 12 - 12}deg) translate(${index * 24 - 24}px, ${index * -12}px)`,
                zIndex: index,
                boxShadow: `0 28px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.18)`,
              }}
```

**2c. Support CTA** — remove the support `<LinkButton>` from `<HeroActions>` and add it as a small text link below. Also add the `Text` import from `tamagui` (check if it's already imported — if not, add it):

```tsx
// Before:
        <HeroActions style={{ animation: 'fadeInUp 0.6s ease-out 0.4s both' }}>
          <LinkButton href={primaryHref} variant="primary" size="lg">
            {primaryLabel}
          </LinkButton>
          <LinkButton href={`${routes.gameCreate}?mode=bot`} variant="secondary" size="lg">
            {playWithBotsLabel}
          </LinkButton>
          <LinkButton href={supportCta.href} variant="secondary" size="lg">
            {supportLabel}
          </LinkButton>
        </HeroActions>

// After:
        <HeroActions style={{ animation: 'fadeInUp 0.6s ease-out 0.4s both' }}>
          <LinkButton href={primaryHref} variant="primary" size="lg">
            {primaryLabel}
          </LinkButton>
          <LinkButton href={`${routes.gameCreate}?mode=bot`} variant="secondary" size="lg">
            {playWithBotsLabel}
          </LinkButton>
        </HeroActions>
        <Text
          tag="a"
          href={supportCta.href}
          fontSize="$3"
          color="$color"
          opacity={0.5}
          style={{
            textDecoration: 'underline',
            cursor: 'pointer',
            animation: 'fadeInUp 0.6s ease-out 0.5s both',
          }}
        >
          {supportLabel}
        </Text>
```

Note: `Text` is not currently imported in this file. Replace the existing `import { YStack } from 'tamagui';` line with `import { YStack, Text } from 'tamagui';`.

- [ ] **Step 3: TypeScript check**

```bash
cd /Users/anatoliyaliaksandrau/js/arcadeum
npx tsc --noEmit 2>&1 | head -30
```

Expected: zero new errors.

- [ ] **Step 4: Visual check**

```bash
npm run dev
```

Open http://localhost:3000. Verify:

- Hero kicker badge shows `✦ The future of table games` with a lighter glass background
- Card stack is visibly larger and more spread out on desktop
- Only 2 buttons in the hero CTA row; "Support the developers" appears as a small underlined link below

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/app/home/components/HomeHero.tsx apps/web/src/app/home/components/styles/Hero.styles.ts
git commit -m "feat(ARC-425): improve hero proportions, kicker badge, demote support CTA"
```

---

## Task 3: Games section — scroll reveal + card hover lift

**Files:**

- Modify: `apps/web/src/app/home/components/HomeGames.tsx`
- Modify: `apps/web/src/app/globals.css`

**Context:** `MainGameCard` is a re-export of `GlassCard` (a `memo` component). Hover lift cannot be added via `styled()` — use `className="game-card-hover"` + CSS rule in `globals.css`. The `useScrollReveal` ref attaches to `<SliderSection>` (the outermost element); children with `data-reveal` are revealed when the section enters view.

- [ ] **Step 1: Add .game-card-hover CSS to globals.css**

Append to `apps/web/src/app/globals.css` (after the scroll reveal block added in Task 1):

```css
/* ─── Home: Game card hover lift ──────────────────────── */
.game-card-hover {
  transition:
    transform 0.2s ease-out,
    box-shadow 0.2s ease-out !important;
}
.game-card-hover:hover {
  transform: translateY(-6px) !important;
  box-shadow: 0 28px 60px rgba(0, 0, 0, 0.5) !important;
}
```

- [ ] **Step 2: Update HomeGames.tsx**

At the top of `HomeGames.tsx`, add the import:

```tsx
import { useScrollReveal } from '@/shared/lib/useScrollReveal';
```

Inside `HomeGames()`, before the `return`, add:

```tsx
const sectionRef = useScrollReveal<HTMLDivElement>();
```

On the `<SliderSection>` opening tag, attach the ref:

```tsx
// Before:
    <SliderSection id="games">

// After:
    <SliderSection id="games" ref={sectionRef as any}>
```

On `<SectionHeader>`, add reveal attributes:

```tsx
// Before:
      <SectionHeader>

// After:
      <SectionHeader data-reveal data-reveal-delay="1">
```

On `<SliderContainer>`, add reveal attribute:

```tsx
// Before:
      <SliderContainer>

// After:
      <SliderContainer data-reveal data-reveal-delay="2">
```

On `<MainGameCard>`, add `className` and remove the now-redundant `hoverStyle` override (keep existing `style` prop, just add `className`):

```tsx
// Before:
              <MainGameCard
                padding="$5"
                flex={1}
                style={{ boxShadow: '0 20px 50px rgba(0,0,0,0.35)' }}
              >

// After:
              <MainGameCard
                padding="$5"
                flex={1}
                className="game-card-hover"
                style={{ boxShadow: '0 20px 50px rgba(0,0,0,0.35)' }}
              >
```

- [ ] **Step 3: TypeScript check**

```bash
cd /Users/anatoliyaliaksandrau/js/arcadeum
npx tsc --noEmit 2>&1 | head -30
```

Expected: zero new errors.

- [ ] **Step 4: Visual check**

Open http://localhost:3000. Scroll down to the Games section. Verify:

- Section header and slider fade/slide up when scrolled into view
- Hovering a game card lifts it 6px upward with a deeper shadow

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/app/home/components/HomeGames.tsx apps/web/src/app/globals.css
git commit -m "feat(ARC-425): games section scroll reveal and card hover lift"
```

---

## Task 4: Features section — scroll reveal + card/icon hover

**Files:**

- Modify: `apps/web/src/app/home/components/HomeFeatures.tsx`
- Modify: `apps/web/src/app/home/components/styles/Features.styles.ts`
- Modify: `apps/web/src/app/globals.css`

**Context:** `FeatureCard` is also a re-export of `GlassCard`. Use `className="feature-card-hover"` + CSS. `FeatureIcon` is a local `styled(YStack)` — we can add `transition` and `hoverStyle` directly to it.

- [ ] **Step 1: Add .feature-card-hover CSS to globals.css**

Append to `apps/web/src/app/globals.css`:

```css
/* ─── Home: Feature card hover lift ───────────────────── */
.feature-card-hover {
  transition:
    transform 0.2s ease-out,
    box-shadow 0.2s ease-out,
    border-color 0.2s ease-out !important;
  cursor: default;
}
.feature-card-hover:hover {
  transform: translateY(-4px) !important;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4) !important;
  border-color: rgba(87, 195, 255, 0.35) !important;
}
```

- [ ] **Step 2: Update Features.styles.ts — FeatureIcon hover**

In `apps/web/src/app/home/components/styles/Features.styles.ts`, update `FeatureIcon` to add transition and hover scale:

```ts
// Before:
export const FeatureIcon = styled(YStack, {
  name: 'FeatureIcon',
  width: 56,
  height: 56,
  borderRadius: 16,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(255,255,255,0.08)',
  borderWidth: 1,
  borderColor: '$glassBorder',
});

// After:
export const FeatureIcon = styled(YStack, {
  name: 'FeatureIcon',
  width: 56,
  height: 56,
  borderRadius: 16,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(255,255,255,0.08)',
  borderWidth: 1,
  borderColor: '$glassBorder',
  transition: 'transform 0.2s ease-out' as any,

  hoverStyle: {
    scale: 1.1,
  },
});
```

- [ ] **Step 3: Update HomeFeatures.tsx — scroll reveal + className**

Add import at the top:

```tsx
import { useScrollReveal } from '@/shared/lib/useScrollReveal';
```

Inside `HomeFeatures()`, before the `return`, add:

```tsx
const sectionRef = useScrollReveal<HTMLDivElement>();
```

On `<FeaturesSection>`, attach ref:

```tsx
// Before:
    <FeaturesSection data-testid="features-section">

// After:
    <FeaturesSection data-testid="features-section" ref={sectionRef as any}>
```

On `<SectionHeader>`:

```tsx
// Before:
      <SectionHeader>

// After:
      <SectionHeader data-reveal data-reveal-delay="1">
```

Do NOT add `data-reveal` to `<FeaturesGrid>` — the cards inside it are staggered individually, which is sufficient. Leave `<FeaturesGrid>` as-is:

```tsx
      <FeaturesGrid>
```

Update the `.map()` callback to accept `index`, then add staggered `data-reveal` and `className` to each `<FeatureCard>`:

```tsx
// Before:
        {FEATURES.map((feature) => {

// After:
        {FEATURES.map((feature, index) => {
```

```tsx
// Before:
            <FeatureCard key={feature.titleKey} flex={1} minWidth={280}>

// After:
            <FeatureCard
              key={feature.titleKey}
              flex={1}
              minWidth={280}
              className="feature-card-hover"
              data-reveal
              data-reveal-delay={String(Math.min(index + 2, 6))}
            >
```

- [ ] **Step 4: TypeScript check**

```bash
cd /Users/anatoliyaliaksandrau/js/arcadeum
npx tsc --noEmit 2>&1 | head -30
```

Expected: zero new errors.

- [ ] **Step 5: Visual check**

Scroll to Features section. Verify:

- Section header fades in, then each feature card staggers in with ~80ms delay per card
- Hovering a card lifts it 4px; icon scales up slightly on card hover

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/app/home/components/HomeFeatures.tsx apps/web/src/app/home/components/styles/Features.styles.ts apps/web/src/app/globals.css
git commit -m "feat(ARC-425): features section scroll reveal and card/icon hover"
```

---

## Task 5: How It Works — scroll reveal + step number hover

**Files:**

- Modify: `apps/web/src/app/home/components/HomeHowItWorks.tsx`
- Modify: `apps/web/src/app/home/components/styles/HowItWorks.styles.ts`
- Modify: `apps/web/src/app/globals.css`

**Context:** Three steps stagger in left-to-right (delays 2, 3, 4). Step number circles get a hover scale + glow intensification via CSS class.

- [ ] **Step 1: Add .step-number-hover CSS to globals.css**

Append to `apps/web/src/app/globals.css`:

```css
/* ─── Home: Step number hover glow ────────────────────── */
.step-number-hover {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease !important;
}
.step-number-hover:hover {
  transform: scale(1.08) !important;
  box-shadow:
    0 0 28px rgba(87, 195, 255, 0.35),
    0 0 0 1px rgba(87, 195, 255, 0.2) !important;
}
```

- [ ] **Step 2: Update HowItWorks.styles.ts — StepNumber transition**

In `apps/web/src/app/home/components/styles/HowItWorks.styles.ts`, the `StepNumber` currently has `shadowColor: 'transparent'` to suppress React Native shadow. Add a transition property as well:

```ts
// Before:
export const StepNumber = styled(YStack, {
  name: 'StepNumber',
  flexShrink: 0,
  width: 56,
  height: 56,
  borderRadius: 999,
  backgroundColor: '$glassBg',
  borderWidth: 1,
  borderColor: '$primary',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  zIndex: 1,
  shadowColor: 'transparent',
} as any);

// After:
export const StepNumber = styled(YStack, {
  name: 'StepNumber',
  flexShrink: 0,
  width: 56,
  height: 56,
  borderRadius: 999,
  backgroundColor: '$glassBg',
  borderWidth: 1,
  borderColor: '$primary',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  zIndex: 1,
  shadowColor: 'transparent',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease' as any,
} as any);
```

- [ ] **Step 3: Update HomeHowItWorks.tsx — scroll reveal + step stagger**

Add import at the top:

```tsx
import { useScrollReveal } from '@/shared/lib/useScrollReveal';
```

Inside `HomeHowItWorks()`, before the `return`, add:

```tsx
const sectionRef = useScrollReveal<HTMLDivElement>();
```

On `<HowItWorksSection>`, attach ref:

```tsx
// Before:
    <HowItWorksSection data-testid="how-it-works-section">

// After:
    <HowItWorksSection data-testid="how-it-works-section" ref={sectionRef as any}>
```

On `<SectionHeader>`:

```tsx
// Before:
      <SectionHeader>

// After:
      <SectionHeader data-reveal data-reveal-delay="1">
```

On each `<StepItem>`, add staggered reveal (the existing `.map((step, index) =>` already exposes `index`):

```tsx
// Before:
            <StepItem key={step.number}>

// After:
            <StepItem key={step.number} data-reveal data-reveal-delay={String(index + 2)}>
```

On `<StepNumber>`, add the hover class:

```tsx
// Before:
              <StepNumber style={{ boxShadow: '0 0 20px rgba(87,195,255,0.15), 0 0 0 1px rgba(255,255,255,0.06)' }}>

// After:
              <StepNumber
                className="step-number-hover"
                style={{ boxShadow: '0 0 20px rgba(87,195,255,0.15), 0 0 0 1px rgba(255,255,255,0.06)' }}
              >
```

- [ ] **Step 4: TypeScript check**

```bash
cd /Users/anatoliyaliaksandrau/js/arcadeum
npx tsc --noEmit 2>&1 | head -30
```

Expected: zero new errors.

- [ ] **Step 5: Visual check**

Scroll to How It Works. Verify:

- Section header fades in, then Step 1 → Step 2 → Step 3 stagger in with ~80ms apart
- Hovering a step number circle scales it up and brightens the cyan glow

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/app/home/components/HomeHowItWorks.tsx apps/web/src/app/home/components/styles/HowItWorks.styles.ts apps/web/src/app/globals.css
git commit -m "feat(ARC-425): how it works scroll reveal and step number hover glow"
```

---

## Task 6: Presentation + PitchDeck — scroll reveal

**Files:**

- Modify: `apps/web/src/app/home/components/HomePresentation.tsx`
- Modify: `apps/web/src/app/home/components/HomePitchDeck.tsx`

**Context:** Both sections are single-block reveals — no stagger needed. The `HomePresentation` root is `<PresentationSection>`, `HomePitchDeck` root is `<PitchDeckSection>`. Note: `HomePresentation` returns `null` when `presentationVideoId` is falsy — attach the reveal after the early return guard.

- [ ] **Step 1: Update HomePresentation.tsx**

Add import:

```tsx
import { useScrollReveal } from '@/shared/lib/useScrollReveal';
```

Add the hook call inside `HomePresentation()`, after the early `if (!presentationVideoId) return null;` guard — place it just before the `return (`:

```tsx
const sectionRef = useScrollReveal<HTMLDivElement>();
```

Wait — React rules require hooks to be called unconditionally (not after early returns). Move the hook call to BEFORE the early return:

```tsx
export function HomePresentation() {
  const { presentationVideoId, appName } = appConfig;
  const { messages } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const homeCopy = messages.home ?? {};
  const sectionRef = useScrollReveal<HTMLDivElement>(); // ← add here, before early return

  if (!presentationVideoId) {
    return null;
  }
  // ... rest of component
```

On `<PresentationSection>`:

```tsx
// Before:
    <PresentationSection data-testid="presentation-section">

// After:
    <PresentationSection data-testid="presentation-section" ref={sectionRef as any}>
```

On `<SectionHeader>`:

```tsx
// Before:
      <SectionHeader>

// After:
      <SectionHeader data-reveal data-reveal-delay="1">
```

On `<VideoContainer>`:

```tsx
// Before:
      <VideoContainer>

// After:
      <VideoContainer data-reveal data-reveal-delay="2">
```

- [ ] **Step 2: Update HomePitchDeck.tsx**

Add import:

```tsx
import { useScrollReveal } from '@/shared/lib/useScrollReveal';
```

Add hook call inside `HomePitchDeck()`, before the return:

```tsx
const sectionRef = useScrollReveal<HTMLDivElement>();
```

On `<PitchDeckSection>`:

```tsx
// Before:
    <PitchDeckSection id="presentation">

// After:
    <PitchDeckSection id="presentation" ref={sectionRef as any}>
```

On `<SectionHeader>`:

```tsx
// Before:
      <SectionHeader>

// After:
      <SectionHeader data-reveal data-reveal-delay="1">
```

Add `data-reveal` to the `<WebPresentation />` wrapper. Since `WebPresentation` is a component (not a DOM element), wrap it:

```tsx
// Before:
      <WebPresentation />

// After:
      <div data-reveal data-reveal-delay="2">
        <WebPresentation />
      </div>
```

- [ ] **Step 3: TypeScript check**

```bash
cd /Users/anatoliyaliaksandrau/js/arcadeum
npx tsc --noEmit 2>&1 | head -30
```

Expected: zero new errors.

- [ ] **Step 4: Full visual check — scroll through entire page**

```bash
npm run dev
```

Open http://localhost:3000 and scroll from top to bottom. Verify each section reveals:

1. ✅ Hero — existing fadeInUp animations still work
2. ✅ Games — header then slider reveal on scroll; cards lift on hover
3. ✅ How It Works — header, then steps stagger left to right; circles scale on hover
4. ✅ Features — header, then cards stagger in; cards and icons animate on hover
5. ✅ Presentation — header then video block reveals on scroll
6. ✅ Pitch Deck — header then content reveals on scroll

**Reduced motion test:** In Chrome DevTools → Rendering tab → Emulate CSS media feature → `prefers-reduced-motion: reduce` → all sections should appear immediately with no translateY animations.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/app/home/components/HomePresentation.tsx apps/web/src/app/home/components/HomePitchDeck.tsx
git commit -m "feat(ARC-425): presentation and pitch deck scroll reveal"
```
