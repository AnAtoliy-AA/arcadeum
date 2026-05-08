# Home Page Tamagui Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all `styled-components` in `apps/web/src/app/home/` with tamagui, maximising reuse of components from `packages/ui`.

**Architecture:** Each `styles/*.ts` file is rewritten in-place using tamagui's `styled()` API and token system. Component files keep their import structure; only what's imported changes. CSS keyframe animations are consolidated into `globals.css` and applied via `style` prop.

**Tech Stack:** tamagui (`styled`, `YStack`, `XStack`, `Text`, `H1`, `H2`), packages/ui (`PageLayout`, `Container`, `GlassCard`, `Card`, `Typography`, `Badge`), Next.js, TypeScript.

**Spec:** `docs/superpowers/specs/2026-03-20-home-page-tamagui-migration-design.md`

---

## File Map

| Action  | File                                                                |
| ------- | ------------------------------------------------------------------- |
| Modify  | `apps/web/src/app/globals.css`                                      |
| Modify  | `apps/web/src/app/home/HomePage.tsx`                                |
| Rewrite | `apps/web/src/app/home/components/styles/Common.styles.ts`          |
| Rewrite | `apps/web/src/app/home/components/styles/Hero.styles.ts`            |
| Modify  | `apps/web/src/app/home/components/HomeHero.tsx`                     |
| Rewrite | `apps/web/src/app/home/components/styles/Features.styles.ts`        |
| Modify  | `apps/web/src/app/home/components/HomeFeatures.tsx`                 |
| Rewrite | `apps/web/src/app/home/components/styles/HowItWorks.styles.ts`      |
| Modify  | `apps/web/src/app/home/components/HomeHowItWorks.tsx`               |
| Rewrite | `apps/web/src/app/home/components/styles/Games.styles.ts`           |
| Modify  | `apps/web/src/app/home/components/HomeGames.tsx`                    |
| Rewrite | `apps/web/src/app/home/components/styles/DownloadCta.styles.ts`     |
| Modify  | `apps/web/src/app/home/components/HomeDownloadCta.tsx`              |
| Rewrite | `apps/web/src/app/home/components/styles/Presentation.styles.ts`    |
| Modify  | `apps/web/src/app/home/components/HomePresentation.tsx`             |
| Rewrite | `apps/web/src/app/home/components/styles/PitchDeck.styles.ts`       |
| Modify  | `apps/web/src/app/home/components/HomePitchDeck.tsx`                |
| Rewrite | `apps/web/src/app/home/components/styles/WebPresentation.styles.ts` |
| Modify  | `apps/web/src/app/home/components/WebPresentation.tsx`              |
| Delete  | `apps/web/src/app/home/components/styles/Animations.styles.ts`      |

---

## Verification Commands

Run these after every task to confirm no regressions:

```bash
# Type-check the web app
cd apps/web && pnpm type-check

# Run existing unit tests
cd apps/web && pnpm test -- --reporter=verbose src/app/home

# Run home page E2E tests (requires a running dev server)
cd apps/web && pnpm test:e2e -- homepage home-games-slider home-order
```

---

## Task 1: Globals + Common Foundation

**Why first:** Every section component imports from `Common.styles.ts` and uses keyframe names from `globals.css`. This must be done before any section tasks.

**Files:**

- Modify: `apps/web/src/app/globals.css`
- Rewrite: `apps/web/src/app/home/components/styles/Common.styles.ts`

- [ ] **Step 1: Add keyframes to globals.css**

Open `apps/web/src/app/globals.css` and append before the last line:

```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes shimmer {
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes playButtonPulse {
  0% {
    transform: scale(1);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.5;
  }
  100% {
    transform: scale(1.4);
    opacity: 0;
  }
}

@keyframes scaleIn {
  from {
    transform: scale(1.02);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.slider-track::-webkit-scrollbar {
  display: none;
}
```

- [ ] **Step 2: Rewrite Common.styles.ts**

Replace the entire file content:

```typescript
'use client';

import { styled, H2, Text } from 'tamagui';
import { Container, Typography } from '@arcadeum/ui';

export const SectionContainer = styled(Container, {
  name: 'SectionContainer',
  paddingVertical: '$10',
  size: 'xl',
} as any);

export const SectionHeader = styled(Container, {
  name: 'SectionHeader',
  size: 'xl',
  paddingVertical: 0,
  alignItems: 'center',
  gap: '$3',
});

export const SectionTitle = styled(H2, {
  name: 'SectionTitle',
  margin: 0,
  fontSize: '$8',
  fontWeight: '700',
  color: '$color',
  textAlign: 'center',
});

export const SectionSubtitle = styled(Text, {
  name: 'SectionSubtitle',
  fontSize: '$4',
  color: '$color',
  opacity: 0.6,
  textAlign: 'center',
  maxWidth: 600,
  marginHorizontal: 'auto',
});
```

> **Note on imports:** The `@arcadeum/ui` package is what `packages/ui` resolves to in this monorepo. Check `apps/web/tsconfig.json` or existing imports like `import { LinkButton } from '@/shared/ui'` — the correct alias is likely `@/shared/ui` or a direct package name. Look at an existing import of `Container` or `GlassCard` in the codebase first: `grep -r "from.*Container" apps/web/src/app --include="*.tsx" | head -5`

- [ ] **Step 3: Verify types compile**

```bash
cd apps/web && pnpm type-check 2>&1 | head -40
```

Expected: no errors related to `Common.styles.ts`. Fix any import path issues found.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/globals.css apps/web/src/app/home/components/styles/Common.styles.ts
git commit -m "feat(ARC-425): migrate home Common styles and add CSS keyframes to tamagui"
```

---

## Task 2: Hero Section

**Files:**

- Rewrite: `apps/web/src/app/home/components/styles/Hero.styles.ts`
- Modify: `apps/web/src/app/home/components/HomeHero.tsx`

- [ ] **Step 1: Rewrite Hero.styles.ts**

```typescript
'use client';

import { styled, YStack, XStack, Text, H1 } from 'tamagui';

export const HeroSection = styled(YStack, {
  name: 'HeroSection',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '90vh',
  padding: '$6',
  position: 'relative',
  overflow: 'hidden',
  gap: '$10',

  $gtMd: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: '$8',
  },
});

export const HeroBackground = styled(YStack, {
  name: 'HeroBackground',
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  pointerEvents: 'none',
  zIndex: 0,
  overflow: 'hidden',
});

export const HeroContent = styled(YStack, {
  name: 'HeroContent',
  position: 'relative',
  zIndex: 2,
  gap: '$6',
  alignItems: 'center',
  maxWidth: 650,

  $gtMd: {
    alignItems: 'flex-start',
  },
});

export const HeroVisual = styled(YStack, {
  name: 'HeroVisual',
  position: 'relative',
  width: '100%',
  maxWidth: 500,
  height: 400,
  display: 'none',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1,

  $gtMd: {
    display: 'flex',
  },
});

export const CardStack = styled(YStack, {
  name: 'CardStack',
  position: 'relative',
  width: 240,
  height: 340,
});

// HeroCard is a plain styled YStack — per-card transforms applied via style prop at render time
export const HeroCard = styled(YStack, {
  name: 'HeroCard',
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  borderRadius: 18,
  backgroundColor: '$glassBg',
  borderWidth: 4,
  borderColor: 'white',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  padding: '$5',
  overflow: 'hidden',
  transition: 'all 0.5s ease',
});

export const Kicker = styled(Text, {
  name: 'Kicker',
  fontSize: '$3',
  fontWeight: '700',
  letterSpacing: 3,
  textTransform: 'uppercase',
  color: 'white',
  borderRadius: 999,
  paddingHorizontal: '$5',
  paddingVertical: '$2',
  marginBottom: '$2',
  display: 'inline-block' as any,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.2)',
});

export const HeroTitle = styled(H1, {
  name: 'HeroTitle',
  margin: 0,
  fontWeight: '800',
  lineHeight: 1.1 as any,
});

export const Tagline = styled(Text, {
  name: 'Tagline',
  margin: 0,
  fontSize: '$6',
  fontWeight: '600',
  color: '$color',
});

export const HeroDescription = styled(Text, {
  name: 'HeroDescription',
  margin: 0,
  maxWidth: 500,
  fontSize: '$4',
  lineHeight: '$5' as any,
  color: '$color',
  opacity: 0.7,
});

export const HeroActions = styled(XStack, {
  name: 'HeroActions',
  marginTop: '$4',
  flexWrap: 'wrap',
  gap: '$4',
  justifyContent: 'center',

  $gtMd: {
    justifyContent: 'flex-start',
  },
});
```

- [ ] **Step 2: Update HomeHero.tsx**

The component imports stay the same shape. Three things change:

1. Remove `import { fadeInUp, shimmer, float } from './styles/Animations.styles'` (if it was imported directly — check the file first, it probably wasn't)
2. `HeroCard` no longer accepts `$index`/`$color` — pass transforms via `style` prop
3. Add an inline colour overlay child inside `HeroCard` to replace `::before`
4. Apply animations via `style` prop on `Kicker`, `HeroTitle`, `Tagline`, `HeroDescription`, `HeroActions`, `CardStack`
5. `HeroBackground` gets its gradient via `style` prop

Replace the JSX portion in `HomeHero.tsx`:

```tsx
return (
  <HeroSection aria-labelledby="hero-heading" data-testid="hero-section">
    <HeroBackground
      style={{
        background:
          'linear-gradient(to bottom, transparent 0%, var(--background) 100%), radial-gradient(circle at 50% 50%, rgba(90,196,255,0.06) 0%, transparent 50%)',
      }}
    />

    <HeroContent>
      <Kicker
        style={{
          // Use hardcoded dark theme values — tamagui tokens don't resolve in CSS string style props
          background: 'linear-gradient(90deg, #7ad7ff, #57c3ff, #7ad7ff)',
          backgroundSize: '200% auto',
          animation:
            'fadeInUp 0.6s ease-out 0.15s both, shimmer 3s linear infinite',
        }}
      >
        {kicker}
      </Kicker>
      <HeroTitle
        id="hero-heading"
        style={{
          fontSize: 'clamp(3.5rem, 8vw, 6rem)',
          background:
            'linear-gradient(135deg, var(--color) 0%, var(--primary) 50%, var(--secondary) 100%)',
          backgroundSize: '200% auto',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          animation:
            'fadeInUp 0.6s ease-out 0.1s both, shimmer 8s linear infinite',
        }}
      >
        {appName}
      </HeroTitle>
      <Tagline style={{ animation: 'fadeInUp 0.6s ease-out 0.2s both' }}>
        {tagline}
      </Tagline>
      <HeroDescription
        style={{ animation: 'fadeInUp 0.6s ease-out 0.3s both' }}
      >
        {description}
      </HeroDescription>
      <HeroActions style={{ animation: 'fadeInUp 0.6s ease-out 0.4s both' }}>
        <LinkButton href={primaryHref} variant="primary" size="lg">
          {primaryLabel}
        </LinkButton>
        <LinkButton
          href={`${routes.gameCreate}?mode=bot`}
          variant="secondary"
          size="lg"
        >
          {playWithBotsLabel}
        </LinkButton>
        <LinkButton href={supportCta.href} variant="secondary" size="lg">
          {supportLabel}
        </LinkButton>
      </HeroActions>
    </HeroContent>

    <HeroVisual>
      <CardStack style={{ animation: 'float 6s ease-in-out infinite' }}>
        {cards.map((card, index) => (
          <HeroCard
            key={index}
            style={{
              transform: `rotate(${index * 10 - 10}deg) translate(${index * 20 - 20}px, ${index * -10}px)`,
              zIndex: index,
              boxShadow: `0 20px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)`,
            }}
          >
            {/* Colour overlay replaces ::before */}
            <YStack
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              zIndex={0}
              pointerEvents="none"
              style={{
                background: `linear-gradient(135deg, ${card.color}15, transparent)`,
              }}
            />
            <div
              className="card-top"
              style={{ position: 'relative', zIndex: 1 }}
            >
              <span>{t(card.name as TranslationKey) || card.name}</span>
              <span>{card.icon}</span>
            </div>
            <div
              className="card-center"
              style={{ position: 'relative', zIndex: 1 }}
            >
              {card.icon}
            </div>
            <div
              className="card-bottom"
              style={{ position: 'relative', zIndex: 1 }}
            >
              <span>{heroCardBrand}</span>
            </div>
          </HeroCard>
        ))}
      </CardStack>
    </HeroVisual>
  </HeroSection>
);
```

> **Note on CSS variables:** Tamagui resolves tokens to CSS custom properties at runtime. Use the actual CSS variable names from the tamagui theme, e.g. `var(--color)` or reference the hardcoded dark theme values. Check the generated CSS or use `style={{ background: 'linear-gradient(...)' }}` with hardcoded rgba values instead if CSS vars don't resolve. The safer approach is to hardcode the dark theme primary values from `tamagui.config.ts`: `primaryGradientStart: '#7ad7ff'`, `primaryGradientEnd: '#57c3ff'`.

- [ ] **Step 3: Type-check**

```bash
cd apps/web && pnpm type-check 2>&1 | grep -A2 "HomeHero\|Hero.styles"
```

Expected: no errors. Common issues: H1 not exported from tamagui — use `import { H1 } from 'tamagui'`. If `$gtMd` variant errors occur, ensure the tamagui config is loaded (it should be via the existing ThemeProvider).

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/home/components/styles/Hero.styles.ts \
        apps/web/src/app/home/components/HomeHero.tsx
git commit -m "feat(ARC-425): migrate HomeHero styles to tamagui"
```

---

## Task 3: Features Section

**Files:**

- Rewrite: `apps/web/src/app/home/components/styles/Features.styles.ts`
- Modify: `apps/web/src/app/home/components/HomeFeatures.tsx`

- [ ] **Step 1: Rewrite Features.styles.ts**

```typescript
'use client';

import { styled, YStack, XStack, Text } from 'tamagui';
import { SectionContainer } from './Common.styles';

export const FeaturesSection = styled(SectionContainer, {
  name: 'FeaturesSection',
  gap: '$8',
});

export const FeaturesGrid = styled(XStack, {
  name: 'FeaturesGrid',
  flexWrap: 'wrap',
  gap: '$5',
});

// FeatureCard uses GlassCard directly in the component — see HomeFeatures.tsx
// exported here as a re-export alias so the component import doesn't change
export { GlassCard as FeatureCard } from '@arcadeum/ui';

export const FeatureIcon = styled(YStack, {
  name: 'FeatureIcon',
  width: 56,
  height: 56,
  borderRadius: 16,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '$glassBg',
  borderWidth: 1,
  borderColor: '$glassBorder',
});

export const FeatureTitle = styled(Text, {
  name: 'FeatureTitle',
  margin: 0,
  fontSize: '$5',
  fontWeight: '600',
  color: '$color',
});

export const FeatureDescription = styled(Text, {
  name: 'FeatureDescription',
  margin: 0,
  fontSize: '$3',
  lineHeight: '$4' as any,
  color: '$color',
  opacity: 0.7,
});

// ComingSoonBadge uses Badge directly in the component
export { Badge as ComingSoonBadge } from '@arcadeum/ui';
```

> **Re-export note:** Instead of re-exporting, you can also update `HomeFeatures.tsx` to import `GlassCard` and `Badge` directly. Either approach works — pick whichever the component currently expects. If `HomeFeatures.tsx` does `import { FeatureCard, ComingSoonBadge } from './styles/Features.styles'`, the re-export approach keeps the component file untouched. If you get a type mismatch, import directly in the component.

- [ ] **Step 2: Update HomeFeatures.tsx**

In `HomeFeatures.tsx`, find the `FeatureCard` usage and add `flex={1} minWidth={280}` props (these are tamagui props that replace the CSS `grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))`):

```tsx
<FeatureCard key={feature.titleKey} flex={1} minWidth={280}>
```

Also ensure `ComingSoonBadge` renders correctly — `Badge` from `@arcadeum/ui` accepts `children` and applies its own styling.

- [ ] **Step 3: Type-check**

```bash
cd apps/web && pnpm type-check 2>&1 | grep -A2 "HomeFeatures\|Features.styles"
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/home/components/styles/Features.styles.ts \
        apps/web/src/app/home/components/HomeFeatures.tsx
git commit -m "feat(ARC-425): migrate HomeFeatures styles to tamagui"
```

---

## Task 4: HowItWorks Section

**Files:**

- Rewrite: `apps/web/src/app/home/components/styles/HowItWorks.styles.ts`
- Modify: `apps/web/src/app/home/components/HomeHowItWorks.tsx`

- [ ] **Step 1: Rewrite HowItWorks.styles.ts**

```typescript
'use client';

import { styled, YStack, XStack, Text, H3 } from 'tamagui';
import { SectionContainer } from './Common.styles';

export const HowItWorksSection = styled(SectionContainer, {
  name: 'HowItWorksSection',
  gap: '$8',
});

export const StepsContainer = styled(YStack, {
  name: 'StepsContainer',
  gap: '$8',
  maxWidth: 700,
  alignSelf: 'center',
  width: '100%',

  $gtMd: {
    flexDirection: 'row',
    maxWidth: '100%',
    gap: '$12',
  },
});

export const StepItem = styled(YStack, {
  name: 'StepItem',
  flex: 1,
  gap: '$4',
  position: 'relative',
  flexDirection: 'row',
  alignItems: 'flex-start',

  $gtMd: {
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center' as any,
  },
});

// Connector line rendered as a separate element inside StepItem — see HomeHowItWorks.tsx
export const StepConnector = styled(YStack, {
  name: 'StepConnector',
  position: 'absolute',
  backgroundColor: '$borderColor',
  zIndex: 0,
  // Mobile: vertical line
  left: 27,
  top: 56,
  bottom: -32,
  width: 2,

  $gtMd: {
    // Desktop: horizontal line
    left: '50%',
    top: 28,
    width: '100%',
    height: 2,
    bottom: 'auto',
  },
});

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
});

export const StepContent = styled(YStack, {
  name: 'StepContent',
  flex: 1,
  gap: '$2',
  paddingTop: '$2',
});

export const StepTitle = styled(Text, {
  name: 'StepTitle',
  margin: 0,
  fontSize: '$5',
  fontWeight: '600',
  color: '$color',
});

export const StepDescription = styled(Text, {
  name: 'StepDescription',
  margin: 0,
  fontSize: '$4',
  lineHeight: '$5' as any,
  color: '$color',
  opacity: 0.7,
});
```

- [ ] **Step 2: Update HomeHowItWorks.tsx**

Add `StepConnector` to the import and render it conditionally inside `StepItem` (hidden for last step):

```tsx
import {
  HowItWorksSection,
  StepsContainer,
  StepItem,
  StepConnector,
  StepNumber,
  StepContent,
  StepTitle,
  StepDescription,
} from './styles/HowItWorks.styles';

// Inside the map:
<StepItem key={step.number}>
  {/* Connector line — hide for last step */}
  {step.number < STEPS.length && <StepConnector />}
  <StepNumber>
    <StepTitle>{step.number}</StepTitle>
  </StepNumber>
  <StepContent>
    <StepTitle>{title}</StepTitle>
    <StepDescription>{description}</StepDescription>
  </StepContent>
</StepItem>;
```

> **Fix:** The original uses `StepNumber` for the number circle and `StepTitle`/`StepDescription` for text. Don't use `StepTitle` inside `StepNumber` — use a plain `Text` element for the number digit.

- [ ] **Step 3: Type-check**

```bash
cd apps/web && pnpm type-check 2>&1 | grep -A2 "HomeHowItWorks\|HowItWorks.styles"
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/home/components/styles/HowItWorks.styles.ts \
        apps/web/src/app/home/components/HomeHowItWorks.tsx
git commit -m "feat(ARC-425): migrate HomeHowItWorks styles to tamagui"
```

---

## Task 5: Games Section

**Files:**

- Rewrite: `apps/web/src/app/home/components/styles/Games.styles.ts`
- Modify: `apps/web/src/app/home/components/HomeGames.tsx`

- [ ] **Step 1: First verify which exports are actually used**

```bash
grep -n "from './styles/Games.styles'" apps/web/src/app/home/components/HomeGames.tsx
```

Only rewrite the ones that are imported. The rest (unused: `GamesSection`, `GameCard`, `GameIcon`, `VariantsGrid`, `SimpleBadge`, `GameTags`, `GameCardContent`, `SectionHeaderSmall`) can be deleted.

- [ ] **Step 2: Rewrite Games.styles.ts**

```typescript
'use client';

import { styled, YStack, XStack, Text } from 'tamagui';

export const SliderSection = styled(YStack, {
  name: 'SliderSection',
  width: '100%',
  maxWidth: 1400,
  marginHorizontal: 'auto',
  gap: '$12',
  paddingVertical: '$10',
  position: 'relative',
});

export const SliderContainer = styled(YStack, {
  name: 'SliderContainer',
  position: 'relative',
  width: '100%',
  paddingHorizontal: '$6',
});

// SliderTrack: layout via tamagui, scroll behaviour via style prop in HomeGames.tsx
export const SliderTrack = styled(XStack, {
  name: 'SliderTrack',
  gap: '$8',
});

export const SliderItem = styled(YStack, {
  name: 'SliderItem',
  flexShrink: 0,
  width: 360,
  height: 320,
});

export const SliderControls = styled(XStack, {
  name: 'SliderControls',
  justifyContent: 'center',
  gap: '$6',
  marginTop: '$4',
});

export const SliderButton = styled(YStack, {
  name: 'SliderButton',
  width: 54,
  height: 54,
  borderRadius: 999,
  backgroundColor: '$glassBg',
  borderWidth: 1,
  borderColor: '$glassBorder',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  animation: 'medium',

  hoverStyle: {
    backgroundColor: '$primary',
    borderColor: 'transparent',
    scale: 1.1,
  },

  pressStyle: {
    scale: 0.95,
  },
});

// MainGameCard uses GlassCard from packages/ui — imported directly in component
export { GlassCard as MainGameCard } from '@arcadeum/ui';

export const MainGameInfo = styled(YStack, {
  name: 'MainGameInfo',
  flex: 1,
  gap: '$3',
  position: 'relative',
  zIndex: 2,
});

export const GameHeaderWrapper = styled(XStack, {
  name: 'GameHeaderWrapper',
  alignItems: 'center',
  gap: '$4',
});

export const StyledGameIcon = styled(Text, {
  name: 'StyledGameIcon',
  fontSize: 40,
  lineHeight: 1 as any,
});

export const GameTitle = styled(Text, {
  name: 'GameTitle',
  margin: 0,
  fontSize: '$6',
  fontWeight: '800',
  flex: 1,
  letterSpacing: -0.02 as any,
});

export const HelpIcon = styled(YStack, {
  name: 'HelpIcon',
  width: 28,
  height: 28,
  borderRadius: 999,
  backgroundColor: '$glassBorder',
  borderWidth: 1,
  borderColor: '$glassBorder',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  flexShrink: 0,
  position: 'relative',
  zIndex: 3,
  animation: 'medium',

  hoverStyle: {
    backgroundColor: '$primary',
    borderColor: 'transparent',
    scale: 1.1,
  },
});

export const GameDescription = styled(Text, {
  name: 'GameDescription',
  margin: 0,
  fontSize: '$4',
  lineHeight: '$5' as any,
  color: '$color',
  opacity: 0.7,
  maxWidth: 650,
});

export const StyledGameTags = styled(XStack, {
  name: 'StyledGameTags',
  flexWrap: 'wrap',
  gap: '$2',
});

export const GameTag = styled(Text, {
  name: 'GameTag',
  fontSize: 12,
  fontWeight: '600',
  paddingHorizontal: '$3',
  paddingVertical: '$1',
  borderRadius: 999,
  backgroundColor: '$glassBg',
  borderWidth: 1,
  borderColor: '$glassBorder',
  color: '$color',
  opacity: 0.8,
});

export const CardFooter = styled(YStack, {
  name: 'CardFooter',
  marginTop: 'auto',
  paddingTop: '$4',
});
```

- [ ] **Step 3: Update HomeGames.tsx**

Three changes in `HomeGames.tsx`:

**a) Add `className="slider-track"` and scroll CSS via `style` prop on `SliderTrack`:**

```tsx
<SliderTrack
  ref={sliderRef}
  className="slider-track"
  onScroll={checkScroll}
  onMouseDown={handleMouseDown}
  onMouseMove={handleMouseMove}
  onMouseUp={handleMouseUp}
  onMouseLeave={handleMouseUp}
  style={{
    overflowX: 'auto',
    scrollSnapType: 'x mandatory',
    WebkitOverflowScrolling: 'touch',
    scrollbarWidth: 'none',
    paddingBottom: '3rem',
    paddingTop: '1.5rem',
    cursor: isDragging ? 'grabbing' : 'grab',
    userSelect: isDragging ? 'none' : 'auto',
  }}
>
```

**b) `SliderItem` needs `scrollSnapAlign` — add via `style` prop since tamagui may not have this prop:**

```tsx
<SliderItem key={game.id} style={{ scrollSnapAlign: 'center' }}>
```

**c) `MainGameCard` is now `GlassCard` — update the import and usage. Remove the `$gradient` prop; add the gradient hover overlay as an absolutely-positioned child:**

```tsx
import { GlassCard } from '@/shared/ui';

// In JSX:
<GlassCard padding="$5" flex={1}>
  {/* Gradient hover overlay replaces $gradient ::before */}
  <YStack
    position="absolute"
    top={0}
    left={0}
    right={0}
    bottom={0}
    zIndex={0}
    pointerEvents="none"
    opacity={0}
    animation="medium"
    hoverStyle={{ opacity: 0.05 }}
    style={{ background: game.gradient ?? 'transparent' }}
  />
  <MainGameInfo>{/* rest of content */}</MainGameInfo>
</GlassCard>;
```

**d) `GameTitle` gradient — pass via `style` prop:**

```tsx
<GameTitle
  style={{
    background: game.gradient,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  }}
>
  {t(game.nameKey)}
</GameTitle>
```

**e) `SliderButton` is now a tamagui `YStack` (not a `<button>`). Make it work as a button:**

```tsx
<SliderButton
  tag="button"
  onClick={() => scroll('left')}
  aria-label="Previous game"
  opacity={canScrollLeft ? 1 : 0.3}
  pointerEvents={canScrollLeft ? 'auto' : 'none'}
>
```

> **`disabled` on YStack:** tamagui YStack doesn't natively handle `disabled`. Use `opacity` + `pointerEvents="none"` instead: `opacity={canScrollLeft ? 1 : 0.3} {...(!canScrollLeft && { pointerEvents: 'none' })}`

- [ ] **Step 4: Type-check**

```bash
cd apps/web && pnpm type-check 2>&1 | grep -A2 "HomeGames\|Games.styles"
```

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/app/home/components/styles/Games.styles.ts \
        apps/web/src/app/home/components/HomeGames.tsx
git commit -m "feat(ARC-425): migrate HomeGames styles to tamagui"
```

---

## Task 6: DownloadCta Section

**Files:**

- Rewrite: `apps/web/src/app/home/components/styles/DownloadCta.styles.ts`
- Modify: `apps/web/src/app/home/components/HomeDownloadCta.tsx`

- [ ] **Step 1: Rewrite DownloadCta.styles.ts**

```typescript
'use client';

import { styled, Text } from 'tamagui';
import { SectionContainer } from './Common.styles';

export const DownloadCtaSection = styled(SectionContainer, {
  name: 'DownloadCtaSection',
  alignItems: 'center',
});

// DownloadCtaCard uses GlassCard directly in the component
export { GlassCard as DownloadCtaCard } from '@arcadeum/ui';

export const DownloadTitle = styled(Text, {
  name: 'DownloadTitle',
  margin: 0,
  fontSize: '$6',
  fontWeight: '600',
  color: '$color',
  textAlign: 'center',
});

export const DownloadDescription = styled(Text, {
  name: 'DownloadDescription',
  margin: 0,
  maxWidth: 500,
  fontSize: '$4',
  lineHeight: '$5' as any,
  color: '$color',
  opacity: 0.7,
  textAlign: 'center',
});
```

- [ ] **Step 2: Update HomeDownloadCta.tsx**

`DownloadCtaCard` is now `GlassCard` — add `maxWidth={700} alignItems="center"`:

```tsx
<DownloadCtaSection data-testid="download-cta-section">
  <DownloadCtaCard maxWidth={700} alignItems="center" gap="$5">
    <DownloadTitle>{title}</DownloadTitle>
    <DownloadDescription>{description}</DownloadDescription>
    <YStack marginTop="$4" width="100%">
      <DownloadButtons
        onInstall={onInstall}
        onShowInstructions={onShowInstructions}
      />
    </YStack>
  </DownloadCtaCard>
</DownloadCtaSection>
```

Import `YStack` from `tamagui` at the top if not already imported.

- [ ] **Step 3: Type-check**

```bash
cd apps/web && pnpm type-check 2>&1 | grep -A2 "HomeDownloadCta\|DownloadCta.styles"
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/home/components/styles/DownloadCta.styles.ts \
        apps/web/src/app/home/components/HomeDownloadCta.tsx
git commit -m "feat(ARC-425): migrate HomeDownloadCta styles to tamagui"
```

---

## Task 7: Presentation Section (Video Player)

**Files:**

- Rewrite: `apps/web/src/app/home/components/styles/Presentation.styles.ts`
- Modify: `apps/web/src/app/home/components/HomePresentation.tsx`

- [ ] **Step 1: Rewrite Presentation.styles.ts**

```typescript
'use client';

import { styled, YStack } from 'tamagui';
import { SectionContainer } from './Common.styles';

export const PresentationSection = styled(SectionContainer, {
  name: 'PresentationSection',
  alignItems: 'center',
  gap: '$8',
});

export const VideoContainer = styled(YStack, {
  name: 'VideoContainer',
  width: '100%',
  maxWidth: 1000,
  position: 'relative',
  borderRadius: 24,
  overflow: 'hidden',
  borderWidth: 1,
  borderColor: '$borderColor',
  backgroundColor: '#000',
});

export const VideoPlaceholder = styled(YStack, {
  name: 'VideoPlaceholder',
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  cursor: 'pointer',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#000',
});

export const PlaceholderOverlay = styled(YStack, {
  name: 'PlaceholderOverlay',
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
});

export const PlayButton = styled(YStack, {
  name: 'PlayButton',
  width: 90,
  height: 90,
  borderRadius: 999,
  backgroundColor: 'rgba(255,255,255,0.15)',
  borderWidth: 1.5,
  borderColor: 'rgba(255,255,255,0.4)',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  position: 'absolute',
  zIndex: 2,
  animation: 'medium',

  hoverStyle: {
    scale: 1.15,
    backgroundColor: '$primary',
    borderColor: 'rgba(255,255,255,0.5)',
  },

  pressStyle: {
    scale: 0.95,
  },
});
```

- [ ] **Step 2: Update HomePresentation.tsx**

The `VideoContainer` needs a 16:9 aspect ratio wrapper. The current code uses `padding-bottom: 56.25%` on the container with `position: absolute` on the iframe. Replicate with `style` prop:

```tsx
<VideoContainer style={{ paddingBottom: '56.25%' }}>
  {isPlaying ? (
    <iframe
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        border: 0,
      }}
      src={`https://www.youtube-nocookie.com/embed/${presentationVideoId}?autoplay=1&rel=0&controls=1&mute=0`}
      allowFullScreen
      title="Arcadeum Trailer"
      sandbox="allow-scripts allow-same-origin allow-popups"
    />
  ) : (
    <VideoPlaceholder
      onClick={() => setIsPlaying(true)}
      data-testid="video-placeholder"
    >
      <img
        src="/images/home/video-cover.png"
        alt="Arcadeum Trailer Illustration"
        loading="lazy"
        data-testid="video-thumbnail"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: 0.85,
        }}
      />
      <PlaceholderOverlay
        style={{
          background:
            'radial-gradient(circle at center, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 100%)',
        }}
      />
      {/* Pulse ring replaces ::after */}
      <YStack
        position="absolute"
        width={90}
        height={90}
        borderRadius={999}
        borderWidth={2.5}
        borderColor="rgba(255,255,255,0.5)"
        zIndex={1}
        pointerEvents="none"
        style={{ animation: 'playButtonPulse 3s infinite' }}
      />
      <PlayButton
        tag="button"
        onClick={() => setIsPlaying(true)}
        aria-label="Play video"
        data-testid="play-btn"
      >
        <svg
          viewBox="0 0 24 24"
          style={{ width: 38, height: 38, fill: 'white', marginLeft: 6 }}
        >
          <path d="M8 5v14l11-7z" />
        </svg>
      </PlayButton>
    </VideoPlaceholder>
  )}
</VideoContainer>
```

Import `YStack` from `tamagui` at the top.

- [ ] **Step 3: Type-check**

```bash
cd apps/web && pnpm type-check 2>&1 | grep -A2 "HomePresentation\|Presentation.styles"
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/home/components/styles/Presentation.styles.ts \
        apps/web/src/app/home/components/HomePresentation.tsx
git commit -m "feat(ARC-425): migrate HomePresentation styles to tamagui"
```

---

## Task 8: PitchDeck + WebPresentation

**Files:**

- Rewrite: `apps/web/src/app/home/components/styles/PitchDeck.styles.ts`
- Modify: `apps/web/src/app/home/components/HomePitchDeck.tsx`
- Rewrite: `apps/web/src/app/home/components/styles/WebPresentation.styles.ts`
- Modify: `apps/web/src/app/home/components/WebPresentation.tsx`

- [ ] **Step 1: Rewrite PitchDeck.styles.ts**

```typescript
'use client';

import { styled } from 'tamagui';
import { SectionContainer } from './Common.styles';

export const PitchDeckSection = styled(SectionContainer, {
  name: 'PitchDeckSection',
  alignItems: 'center',
  gap: '$10',
  paddingVertical: '$16',
});
```

- [ ] **Step 2: Verify HomePitchDeck.tsx needs no logic changes**

The component only imports `PitchDeckSection`, `SectionHeader`, `SectionTitle`, `SectionSubtitle`. All are now tamagui components with the same names — no logic changes needed.

- [ ] **Step 3: Rewrite WebPresentation.styles.ts**

```typescript
'use client';

import { styled, YStack, XStack, Text } from 'tamagui';

export const PresentationContainer = styled(YStack, {
  name: 'PresentationContainer',
  width: '100%',
  borderRadius: 16,
  overflow: 'hidden',
  position: 'relative',
  borderWidth: 1,
  borderColor: '$borderColor',
  backgroundColor: '$background',
});

// SlideContent: opacity and visibility controlled via style prop at render time
export const SlideContent = styled(YStack, {
  name: 'SlideContent',
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
});

export const ControlsOverlay = styled(YStack, {
  name: 'ControlsOverlay',
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  pointerEvents: 'none',
  zIndex: 10,
  justifyContent: 'space-between',
});

export const TopBar = styled(XStack, {
  name: 'TopBar',
  padding: '$4',
  justifyContent: 'center',
  pointerEvents: 'auto',
  width: '100%',
});

export const ProgressBar = styled(XStack, {
  name: 'ProgressBar',
  gap: '$1',
  maxWidth: 600,
  height: 4,
  alignItems: 'center',
  width: '100%',
});

export const ProgressSegment = styled(YStack, {
  name: 'ProgressSegment',
  flex: 1,
  height: '100%',
  borderRadius: 2,
  cursor: 'pointer',
  animation: 'fast',

  hoverStyle: {
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
});

export const BottomBar = styled(XStack, {
  name: 'BottomBar',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '$4',
  pointerEvents: 'auto',
});

export const SlideCounter = styled(Text, {
  name: 'SlideCounter',
  fontSize: '$3',
  fontWeight: '500',
  color: 'rgba(255,255,255,0.9)',
  borderRadius: 20,
  paddingHorizontal: '$3',
  paddingVertical: '$1',
  backgroundColor: 'rgba(0,0,0,0.3)',
});

export const NavButtonContainer = styled(YStack, {
  name: 'NavButtonContainer',
  position: 'absolute',
  top: '50%',
  zIndex: 20,
  pointerEvents: 'auto',
  animation: 'medium',
});

export const FullscreenButtonContainer = styled(YStack, {
  name: 'FullscreenButtonContainer',
  pointerEvents: 'auto',
});
```

- [ ] **Step 4: Update WebPresentation.tsx**

Four changes:

**a) Remove styled-components import, add tamagui import if not already there.**

**b) Add `isHovered` state to replace `${PresentationContainer}:hover & { opacity: 1 }`:**

```tsx
const [isHovered, setIsHovered] = useState(false);

// On PresentationContainer:
<PresentationContainer
  onMouseEnter={() => setIsHovered(true)}
  onMouseLeave={() => setIsHovered(false)}
  style={{ aspectRatio: '16/9' }}
>
```

**c) Pass `isHovered` opacity to `NavButtonContainer`:**

```tsx
<NavButtonContainer
  opacity={isHovered ? 1 : 0}
  style={{ [position === 'left' ? 'left' : 'right']: 16, transform: 'translateY(-50%)' }}
>
```

> `NavButtonContainer` accepts a `$position` prop in the original — replace with `position` string prop passed directly to the container, applying `left`/`right` via `style`.

**d) `SlideContent` opacity/visibility via `style` prop:**

```tsx
<SlideContent
  style={{
    opacity: isActive ? 1 : 0,
    visibility: isActive ? 'visible' : 'hidden',
    transition: 'opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1), visibility 0.6s',
    zIndex: isActive ? 1 : 0,
  }}
>
  <img
    src={slide.src}
    alt={slide.alt}
    style={{
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      display: 'block',
      animation: isActive
        ? 'scaleIn 0.6s cubic-bezier(0.22, 1, 0.36, 1)'
        : 'none',
    }}
  />
</SlideContent>
```

**e) `ProgressSegment` background/boxShadow via `style` prop since they depend on `$isActive`/`$isViewed`:**

```tsx
<ProgressSegment
  key={i}
  onClick={() => goToSlide(i)}
  style={{
    background: isActive
      ? 'var(--accent, #81f1ff)'
      : isViewed
        ? 'rgba(255,255,255,0.5)'
        : 'rgba(255,255,255,0.2)',
    boxShadow: isActive ? '0 0 8px rgba(255,255,255,0.4)' : 'none',
  }}
/>
```

**f) `TopBar` and `BottomBar` gradient via `style` prop:**

```tsx
<TopBar style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)' }}>
<BottomBar style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)' }}>
```

- [ ] **Step 5: Type-check**

```bash
cd apps/web && pnpm type-check 2>&1 | grep -A2 "WebPresentation\|PitchDeck"
```

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/app/home/components/styles/PitchDeck.styles.ts \
        apps/web/src/app/home/components/HomePitchDeck.tsx \
        apps/web/src/app/home/components/styles/WebPresentation.styles.ts \
        apps/web/src/app/home/components/WebPresentation.tsx
git commit -m "feat(ARC-425): migrate HomePitchDeck and WebPresentation styles to tamagui"
```

---

## Task 9: HomePage + Cleanup

**Files:**

- Modify: `apps/web/src/app/home/HomePage.tsx`
- Delete: `apps/web/src/app/home/components/styles/Animations.styles.ts`

- [ ] **Step 1: Update HomePage.tsx**

```tsx
'use client';

import { PageLayout } from '@/shared/ui';
import { HomeHero } from './components/HomeHero';
import dynamic from 'next/dynamic';

const HomeGames = dynamic(() =>
  import('./components/HomeGames').then((mod) => mod.HomeGames),
);
const HomeHowItWorks = dynamic(() =>
  import('./components/HomeHowItWorks').then((mod) => mod.HomeHowItWorks),
);
const HomeFeatures = dynamic(() =>
  import('./components/HomeFeatures').then((mod) => mod.HomeFeatures),
);
const HomePresentation = dynamic(() =>
  import('./components/HomePresentation').then((mod) => mod.HomePresentation),
);
const HomePitchDeck = dynamic(() =>
  import('./components/HomePitchDeck').then((mod) => mod.HomePitchDeck),
);
const HomeDownloadCta = dynamic(() =>
  import('./components/HomeDownloadCta').then((mod) => mod.HomeDownloadCta),
);
const AppFooter = dynamic(() =>
  import('@/widgets/footer').then((mod) => mod.AppFooter),
);

export function HomePage() {
  return (
    <>
      <PageLayout justifyContent="flex-start" alignItems="stretch" padding={0}>
        <HomeHero />
        <HomeGames />
        <HomeHowItWorks />
        <HomeFeatures />
        <HomePresentation />
        <HomePitchDeck />
        <HomeDownloadCta />
      </PageLayout>
      <AppFooter />
    </>
  );
}

export default HomePage;
```

> **Note:** Check the existing import for `PageLayout` — it may be `from '@arcadeum/ui'` or `from '@/shared/ui'`. Check `apps/web/src/shared/ui/index.ts` to see what it re-exports.

- [ ] **Step 2: Delete Animations.styles.ts**

```bash
rm apps/web/src/app/home/components/styles/Animations.styles.ts
```

Then verify nothing still imports from it:

```bash
grep -r "Animations.styles" apps/web/src/ --include="*.ts" --include="*.tsx"
```

Expected: no matches. If any files still import from it, update those imports first.

- [ ] **Step 3: Final type-check**

```bash
cd apps/web && pnpm type-check 2>&1 | head -50
```

Expected: zero errors. Fix any remaining type issues — common ones at this stage:

- `$gtMd` not recognised: ensure tamagui media config is registered. Check another file that uses `$gtMd` or `$tablet` successfully.
- `size` not a valid prop on `styled(Container, ...)`: pass `size="xl"` at usage site instead of in the `styled()` definition.
- `display: 'none'` on tamagui components: may need `$platform-web={{ display: 'none' }}` if SSR mismatches. Check existing usage.

- [ ] **Step 4: Run home page E2E tests**

First ensure a local dev server is running (`pnpm dev` in `apps/web`), then:

```bash
cd apps/web && pnpm test:e2e -- --grep "Home Page" --reporter=list
```

Expected: all tests pass. The key ones to watch: "should render hero section", "should feature Critical game", "should feature Sea Battle game".

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/app/home/HomePage.tsx
git rm apps/web/src/app/home/components/styles/Animations.styles.ts
git commit -m "feat(ARC-425): complete home page tamagui migration — remove Animations.styles"
```

---

## Troubleshooting

**`$gtMd` prop not working:** Ensure tamagui's media config is active. In Next.js with tamagui, media queries work client-side. Test on actual browser at 1151px+ viewport width.

**Tamagui token not resolving in `style` prop:** CSS variables from tamagui are named like `--color`, `--primary`, `--glassBg`. Check DevTools to find the actual variable names. Alternatively, use hardcoded values from `packages/ui/src/tamagui.config.ts` dark theme: `primary: '#57c3ff'`, `primaryGradientStart: '#7ad7ff'`, `glassBg: 'rgba(255,255,255,0.03)'`.

**`styled(Container, { size: 'xl' })` type error:** Tamagui's `styled()` may not accept variant values in the definition object. Pass `size="xl"` at each usage site instead: `<SectionContainer size="xl">`.

**`display: 'none'` on desktop visibility:** Tamagui on web handles `display` fine. If SSR causes flash, add `suppressHydrationWarning` or use CSS media class approach.

**Import path for `packages/ui`:** Look at `apps/web/src/shared/ui/index.ts` — it likely re-exports everything from `@arcadeum/ui`. Use `@/shared/ui` for imports within the web app, not `@arcadeum/ui` directly.
