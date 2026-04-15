# Home Page Styled-Components → Tamagui Migration

**Date:** 2026-03-20
**Branch:** ARC-425
**Scope:** `apps/web/src/app/home/`

---

## Goal

Replace all `styled-components` usage in the home page with tamagui, maximising reuse of components from `packages/ui`.

---

## Current State

The home page consists of `HomePage.tsx` and 7 section components:

| Component          | Style file                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------------ |
| `HomeHero`         | `styles/Hero.styles.ts`                                                                    |
| `HomeGames`        | `styles/Games.styles.ts`                                                                   |
| `HomeHowItWorks`   | `styles/HowItWorks.styles.ts`                                                              |
| `HomeFeatures`     | `styles/Features.styles.ts`                                                                |
| `HomePresentation` | `styles/Presentation.styles.ts`                                                            |
| `HomePitchDeck`    | `styles/PitchDeck.styles.ts` + `WebPresentation` (uses `styles/WebPresentation.styles.ts`) |
| `HomeDownloadCta`  | `styles/DownloadCta.styles.ts`                                                             |

Shared: `styles/Common.styles.ts`, `styles/Animations.styles.ts`

All style files use `styled-components`. Total: ~80 styled components across 10 style files.

---

## Approach: Full tamagui `styled()` replacement (Option A)

Each `styles/*.ts` file stays as a separate file. Its internals change from `styled-components` to tamagui. Component `.tsx` files keep the same import structure.

### What tamagui provides

- `styled(YStack/XStack/Text/H1/H2, { ... })` — replaces `styled.div`, `styled.h2`, etc.
- `packages/ui` exports: `PageLayout`, `Container`, `GlassCard`, `Card`, `Typography`, `Badge`, `XStack`, `YStack`, `ZStack`
- Tamagui tokens: `$primary`, `$glassBg`, `$glassBorder`, `$borderColor`, `$color`, `$background`, `$primaryGradientStart`, `$primaryGradientEnd`, `$backgroundRadialStart`, `$backgroundRadialEnd`
- Hover/press via `hoverStyle`, `pressStyle` props + `animation="medium"`

### Breakpoints

The tamagui config defines these media query keys:

| Key       | Condition                                 |
| --------- | ----------------------------------------- |
| `$tablet` | `maxWidth: 1024` (mobile/tablet ≤ 1024px) |
| `$gtSm`   | `minWidth: 801px`                         |
| `$gtMd`   | `minWidth: 1151px`                        |
| `$gtLg`   | `minWidth: 1281px`                        |

The current home page CSS uses `@media (min-width: 1024px)` for desktop layout. The closest tamagui equivalent is `$gtMd` (1151px). The slight shift from 1024→1151px is acceptable given there is no exact 1024px breakpoint token. Use `$gtMd` for all desktop layout switches in this migration.

---

## CSS Keyframes → `globals.css`

Add to `apps/web/src/app/globals.css` (others — `float`, `pulse` — already exist):

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
```

`playButtonPulse` replaces the local `pulse` keyframe defined inside `Presentation.styles.ts` (which uses scale+opacity, different from the global `pulse`).

### Application pattern

```tsx
// Keyframe animation: via style prop
<Kicker style={{ animation: 'fadeInUp 0.6s ease-out 0.15s both' }} />

// Shimmer also needs backgroundSize to be effective:
<HeroTitle style={{
  animation: 'shimmer 8s linear infinite',
  backgroundSize: '200% auto',
}} />

// Hover transforms: via tamagui hoverStyle
<FeatureCard hoverStyle={{ y: -6 }} animation="medium" />
```

---

## Pseudo-element Strategy

`::before`/`::after` pseudo-elements are replaced with absolutely-positioned `YStack` children.

```tsx
// Before (styled-components ::before)
const HeroBackground = styled.div`
  position: absolute;
  inset: 0;
  background: radial-gradient(... ${theme.buttons.primary.gradientStart}10...);
`;

// After (tamagui child element)
// The "10" alpha suffix from styled-components is a CSS hex opacity.
// In tamagui, convert to rgba() or hardcode the resolved colour value.
const HeroBackground = styled(YStack, {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  pointerEvents: 'none',
  zIndex: 0,
});
// Apply gradient via style prop at render time:
<HeroBackground
  style={{
    background:
      'radial-gradient(circle at 50% 50%, rgba(90,196,255,0.06) 0%, transparent 50%)',
  }}
/>;
```

**Alpha suffix pattern:** styled-components used `${theme.color}10` (hex opacity suffix). In tamagui, there is no equivalent token modifier. Resolve by using hardcoded `rgba()` values matching the dark theme colour with reduced opacity, or pass via `style` prop using CSS string.

**Step connector lines:** replace `::after` with an absolutely-positioned `YStack` inside each `StepItem` wrapper. Render it conditionally (hidden for the last step).

**Play button pulse ring:** replace `::after` with a sibling `YStack` using `style={{ animation: 'playButtonPulse 3s infinite' }}`.

**Nav button hover on parent (`${PresentationContainer}:hover &`):** replace with local `isHovered` state in `WebPresentation` component that controls opacity directly.

---

## Component Mapping

### `HomePage.tsx`

- `PageWrapper` → `PageLayout` from `packages/ui`
- **Override required:** `PageLayout` bakes in `justifyContent="center"` and `alignItems="center"`. Override with `justifyContent="flex-start" alignItems="stretch"` at the usage site.

### `styles/Common.styles.ts`

| Old                | New                                                                                                                                                                                                                                 |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PageWrapper`      | (deleted — moved to `HomePage.tsx` as `PageLayout`)                                                                                                                                                                                 |
| `SectionContainer` | `styled(Container, { paddingVertical: '$10', size: 'xl' })` — Container defaults to `size="lg"` (maxWidth 1000); override to `size="xl"` (maxWidth 1200) to match original. Container has no built-in vertical padding; add inline. |
| `SectionHeader`    | `YStack textAlign="center"` (inline props, no separate export)                                                                                                                                                                      |
| `SectionTitle`     | `styled(H2, { margin: 0, fontSize: '$8', fontWeight: '700', color: '$color' })`                                                                                                                                                     |
| `SectionSubtitle`  | `Typography` with `alpha="high"` + `textCenter`                                                                                                                                                                                     |

### `styles/Hero.styles.ts`

| Old               | New                                                                                                                                      |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `HeroSection`     | `styled(YStack, { ... })` with `$gtMd={{ flexDirection: 'row', justifyContent: 'space-between', gap: '$10' }}`, `minHeight: '90vh'`      |
| `HeroBackground`  | `styled(YStack, { position: 'absolute', top:0, left:0, right:0, bottom:0, pointerEvents:'none', zIndex:0 })` — gradient via `style` prop |
| `HeroContent`     | `styled(YStack, { position:'relative', zIndex:2, gap:'$8', alignItems:'center', maxWidth:650, $gtMd:{ alignItems:'flex-start' } })`      |
| `HeroVisual`      | `styled(YStack, { display:'none', $gtMd:{ display:'flex', alignItems:'center', justifyContent:'center' } })`                             |
| `CardStack`       | `styled(YStack, { position:'relative', width:240, height:340 })` + `style={{ animation: 'float 6s ease-in-out infinite' }}`              |
| `HeroCard`        | `styled(YStack, { ... })` — **no `$index`/`$color` variants** (see below)                                                                |
| `Kicker`          | `styled(Text, { ... })` with borderRadius 9999, padding, inline gradient background                                                      |
| `HeroTitle`       | `styled(H1, { ... })` with gradient text via `style` prop                                                                                |
| `Tagline`         | `Typography variant="subheading" uiSize="2xl"`                                                                                           |
| `HeroDescription` | `Typography` with `maxWidth={500}`                                                                                                       |
| `HeroActions`     | `XStack flexWrap="wrap" gap="$4" justifyContent="center" $gtMd={{ justifyContent:'flex-start' }}`                                        |

**HeroCard transient `$index`/`$color` props:**

These drive per-card computed transforms: `rotate(${$index * 10 - 10}deg)`. This logic cannot be expressed in a static tamagui `styled()` definition. Solution: define `HeroCard` as a plain tamagui `YStack` (no styled variants for transform), and pass computed values via `style` at render time in `HomeHero.tsx`:

```tsx
<HeroCard
  key={index}
  style={{
    transform: `rotate(${index * 10 - 10}deg) translate(${index * 20 - 20}px, ${index * -10}px)`,
    zIndex: index,
    '--card-color': card.color, // CSS variable for glow
  }}
>
```

The `$color` used in `::before` gradient is replaced by a sibling absolutely-positioned `YStack` with `style={{ background: `linear-gradient(135deg, ${card.color}15, transparent)` }}`.

### `styles/Features.styles.ts`

| Old                  | New                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `FeaturesSection`    | `SectionContainer` (from updated `Common.styles.ts`)                                                                                                                                                                                                                                                                                                                                                                                  |
| `FeaturesGrid`       | `XStack flexWrap="wrap" gap="$5"` — each `FeatureCard` gets `flex={1} minWidth={280}`                                                                                                                                                                                                                                                                                                                                                 |
| `FeatureCard`        | `GlassCard` from `packages/ui` — override `padding="$6"` to match original 2rem. **Note:** the original `FeatureCard::before` uses CSS custom properties `--mouse-x`/`--mouse-y` for a cursor-tracking radial spotlight. This effect is intentionally dropped in the migration — it requires a JS `mousemove` listener setting CSS variables, which is out of scope. The `GlassCard` `hoverStyle` provides sufficient hover feedback. |
| `FeatureIcon`        | `styled(YStack, { width:56, height:56, borderRadius:16, alignItems:'center', justifyContent:'center' })`                                                                                                                                                                                                                                                                                                                              |
| `FeatureTitle`       | `Typography variant="subheading" uiSize="lg"`                                                                                                                                                                                                                                                                                                                                                                                         |
| `FeatureDescription` | `Typography`                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `ComingSoonBadge`    | `Badge` from `packages/ui`                                                                                                                                                                                                                                                                                                                                                                                                            |

### `styles/HowItWorks.styles.ts`

| Old                 | New                                                                                                                                                                        |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `HowItWorksSection` | `SectionContainer`                                                                                                                                                         |
| `StepsContainer`    | `styled(YStack, { gap:'$8', maxWidth:700, alignSelf:'center', $gtMd:{ flexDirection:'row', maxWidth:'100%', gap:'$12' } })`                                                |
| `StepItem`          | `styled(YStack, { flex:1, gap:'$6', position:'relative', $gtMd:{ alignItems:'center', textAlign:'center' } })` with connector line as absolutely-positioned child `YStack` |
| `StepNumber`        | `styled(YStack, { width:56, height:56, borderRadius:999, alignItems:'center', justifyContent:'center', flexShrink:0 })`                                                    |
| `StepContent`       | `YStack flex={1}`                                                                                                                                                          |
| `StepTitle`         | `Typography variant="subheading" uiSize="lg"`                                                                                                                              |
| `StepDescription`   | `Typography`                                                                                                                                                               |

### `styles/Games.styles.ts`

| Old                                                                                                        | New                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SliderSection`                                                                                            | `styled(YStack, { width:'100%', maxWidth:1400, marginHorizontal:'auto', gap:'$12', paddingVertical:'$10' })`                                                                                                                                                                                                                                                                                                                      |
| `SliderContainer`                                                                                          | `YStack position="relative" width="100%" paddingHorizontal="$6"`                                                                                                                                                                                                                                                                                                                                                                  |
| `SliderTrack`                                                                                              | `styled(XStack, { gap:'$8' })` + `style={{ overflowX:'auto', scrollSnapType:'x mandatory', WebkitOverflowScrolling:'touch', scrollbarWidth:'none', paddingBottom:'3rem', cursor: isDragging ? 'grabbing' : 'grab', userSelect: isDragging ? 'none' : 'auto' }}` — all scroll-specific CSS goes in the `style` prop; hide scrollbar via additional CSS class or `[data-slider]::-webkit-scrollbar { display:none }` in globals.css |
| `SliderItem`                                                                                               | `styled(YStack, { flexShrink:0, width:360, scrollSnapAlign:'center', height:320 })`                                                                                                                                                                                                                                                                                                                                               |
| `SliderControls`                                                                                           | `XStack justifyContent="center" gap="$6" marginTop="$4"`                                                                                                                                                                                                                                                                                                                                                                          |
| `SliderButton`                                                                                             | `styled(YStack, { width:54, height:54, borderRadius:999, alignItems:'center', justifyContent:'center', cursor:'pointer' })` with `hoverStyle` and `pressStyle`                                                                                                                                                                                                                                                                    |
| `MainGameCard`                                                                                             | `GlassCard` — override `padding="$5"`. `$gradient` prop removed; gradient hover overlay rendered as absolutely-positioned `YStack` child with `opacity=0` + `hoverStyle={{ opacity:0.05 }}`                                                                                                                                                                                                                                       |
| `MainGameInfo`                                                                                             | `YStack flex={1} gap="$3" position="relative" zIndex={2}`                                                                                                                                                                                                                                                                                                                                                                         |
| `GameHeaderWrapper`                                                                                        | `XStack alignItems="center" gap="$4"`                                                                                                                                                                                                                                                                                                                                                                                             |
| `StyledGameIcon`                                                                                           | `Text fontSize={40}` (emoji)                                                                                                                                                                                                                                                                                                                                                                                                      |
| `GameTitle`                                                                                                | `Typography variant="heading" uiSize="xl"` with `style={{ background: game.gradient, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}`                                                                                                                                                                                                                                                                           |
| `HelpIcon`                                                                                                 | `styled(YStack, { width:28, height:28, borderRadius:999, alignItems:'center', justifyContent:'center', cursor:'pointer' })` with `hoverStyle`                                                                                                                                                                                                                                                                                     |
| `GameDescription`                                                                                          | `Typography`                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `StyledGameTags`                                                                                           | `XStack flexWrap="wrap" gap="$2"`                                                                                                                                                                                                                                                                                                                                                                                                 |
| `GameTag`                                                                                                  | `styled(Text, { borderRadius:999, paddingHorizontal:'$3', paddingVertical:'$1', borderWidth:1, borderColor:'$borderColor' })`                                                                                                                                                                                                                                                                                                     |
| `CardFooter`                                                                                               | `YStack marginTop="auto" paddingTop="$4"`                                                                                                                                                                                                                                                                                                                                                                                         |
| `GamesSection`                                                                                             | Delete — unused in `HomeGames.tsx`; verify no other imports before deletion                                                                                                                                                                                                                                                                                                                                                       |
| `GameCard`, `GameIcon`, `VariantsGrid`, `SimpleBadge`, `GameTags`, `GameCardContent`, `SectionHeaderSmall` | Delete — unused in `HomeGames.tsx`; verify no other imports before deletion                                                                                                                                                                                                                                                                                                                                                       |

### `styles/DownloadCta.styles.ts`

| Old                               | New                                                                                                                                                                    |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DownloadCtaSection`              | `SectionContainer` with `alignItems="center"`                                                                                                                          |
| `DownloadCtaCard`                 | `GlassCard maxWidth={700} alignItems="center" textAlign="center"` — `GlassCard` default `padding="$7"` is close to original 3rem; accept or override to `padding="$8"` |
| `DownloadTitle`                   | `Typography variant="subheading" uiSize="xl"`                                                                                                                          |
| `DownloadDescription`             | `Typography maxWidth={500}`                                                                                                                                            |
| `DownloadButtons`, `DownloadIcon` | Delete — `DownloadButtons` is imported from `@/shared/ui` in the component; `DownloadIcon` is unused                                                                   |

### `styles/Presentation.styles.ts`

| Old                    | New                                                                                                                                                                                                                                                                                            |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PresentationSection`  | `SectionContainer alignItems="center"`                                                                                                                                                                                                                                                         |
| `VideoContainer`       | `styled(YStack, { width:'100%', maxWidth:1000, position:'relative', borderRadius:24, overflow:'hidden', borderWidth:1, borderColor:'$borderColor', backgroundColor:'#000' })` — 16:9 aspect ratio via `style={{ paddingBottom:'56.25%' }}` on a wrapper, with iframe as absolute child         |
| `VideoPlaceholder`     | `styled(YStack, { position:'absolute', top:0, left:0, right:0, bottom:0, cursor:'pointer', alignItems:'center', justifyContent:'center', backgroundColor:'#000' })`                                                                                                                            |
| `ThumbnailImage`       | Remains plain `<img>` element — no tamagui Image equivalent                                                                                                                                                                                                                                    |
| `PlaceholderOverlay`   | `styled(YStack, { position:'absolute', inset:0, zIndex:1 })` with gradient via `style` prop                                                                                                                                                                                                    |
| `PlayButton`           | `styled(YStack, { width:90, height:90, borderRadius:999, alignItems:'center', justifyContent:'center', cursor:'pointer', zIndex:2 })` with `hoverStyle` + `pressStyle`. Pulse ring rendered as sibling `YStack` with `position="absolute" style={{ animation:'playButtonPulse 3s infinite' }}` |
| Local `pulse` keyframe | Replaced by `playButtonPulse` in `globals.css`                                                                                                                                                                                                                                                 |

### `styles/PitchDeck.styles.ts`

| Old                | New                                      |
| ------------------ | ---------------------------------------- |
| `PitchDeckSection` | `SectionContainer paddingVertical="$16"` |

### `styles/WebPresentation.styles.ts`

| Old                         | New                                                                                                                                                                                                                                                                                                                                                                                                                  |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PresentationContainer`     | `styled(YStack, { width:'100%', aspectRatio:16/9, borderRadius:16, overflow:'hidden', position:'relative', borderWidth:1, borderColor:'$borderColor', backgroundColor:'$background' })`                                                                                                                                                                                                                              |
| `SlideContent`              | `styled(YStack, { position:'absolute', top:0, left:0, right:0, bottom:0 })` — `opacity`/`display` driven by `$isActive` variant prop. The locally-scoped `scaleIn` keyframe (defined inside the styled-component template) is moved to `globals.css`; apply at render time on the inner `<img>`: `style={{ animation: isActive ? 'scaleIn 0.6s cubic-bezier(0.22, 1, 0.36, 1)' : 'none' }}` in `WebPresentation.tsx` |
| `SlideImage`                | Remains plain `<img>` element                                                                                                                                                                                                                                                                                                                                                                                        |
| `ControlsOverlay`           | `styled(YStack, { position:'absolute', inset:0, pointerEvents:'none', zIndex:10, justifyContent:'space-between' })`                                                                                                                                                                                                                                                                                                  |
| `TopBar`                    | `styled(XStack, { padding:'$4', justifyContent:'center', pointerEvents:'auto' })` with gradient background via `style` prop                                                                                                                                                                                                                                                                                          |
| `ProgressBar`               | `XStack gap="$1" maxWidth={600} height={4} alignItems="center"`                                                                                                                                                                                                                                                                                                                                                      |
| `ProgressSegment`           | `styled(YStack, { flex:1, height:'100%', borderRadius:2, cursor:'pointer' })` — background/boxShadow via `$isActive`/`$isViewed` variants                                                                                                                                                                                                                                                                            |
| `BottomBar`                 | `styled(XStack, { justifyContent:'space-between', alignItems:'center', padding:'$4', pointerEvents:'auto' })` with gradient via `style` prop                                                                                                                                                                                                                                                                         |
| `SlideCounter`              | `styled(Text, { fontSize:'$3', fontWeight:'500', borderRadius:20, paddingHorizontal:'$3', paddingVertical:'$1' })`                                                                                                                                                                                                                                                                                                   |
| `NavButtonContainer`        | `styled(YStack, { position:'absolute', top:'50%', zIndex:20, pointerEvents:'auto' })` — `$position` prop drives `left`/`right` inline; hover show/hide replaced by `isHovered` state in `WebPresentation` component (replaces `${PresentationContainer}:hover &` parent selector)                                                                                                                                    |
| `FullscreenButtonContainer` | `YStack pointerEvents="auto"`                                                                                                                                                                                                                                                                                                                                                                                        |

**Parent selector note:** styled-components `${PresentationContainer}:hover &` has no tamagui equivalent. Replace by adding `isHovered` state to `WebPresentation` component with `onMouseEnter`/`onMouseLeave` on the container, and pass `opacity={isHovered ? 1 : 0}` to `NavButtonContainer`.

---

## Deleted Files

- `styles/Animations.styles.ts` — removed entirely; all keyframes moved to `globals.css`

---

## Files Modified

| File                                                                | Change                                                                                                                    |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `apps/web/src/app/globals.css`                                      | Add `fadeInUp`, `shimmer`, `fadeIn`, `playButtonPulse` keyframes; add `.slider-track::-webkit-scrollbar { display:none }` |
| `apps/web/src/app/home/HomePage.tsx`                                | `PageWrapper` → `PageLayout` with `justifyContent="flex-start" alignItems="stretch"`                                      |
| `apps/web/src/app/home/components/styles/Common.styles.ts`          | Full rewrite with tamagui                                                                                                 |
| `apps/web/src/app/home/components/styles/Hero.styles.ts`            | Full rewrite with tamagui                                                                                                 |
| `apps/web/src/app/home/components/styles/Features.styles.ts`        | Full rewrite with tamagui                                                                                                 |
| `apps/web/src/app/home/components/styles/HowItWorks.styles.ts`      | Full rewrite with tamagui                                                                                                 |
| `apps/web/src/app/home/components/styles/Games.styles.ts`           | Full rewrite with tamagui                                                                                                 |
| `apps/web/src/app/home/components/styles/DownloadCta.styles.ts`     | Full rewrite with tamagui                                                                                                 |
| `apps/web/src/app/home/components/styles/Presentation.styles.ts`    | Full rewrite with tamagui                                                                                                 |
| `apps/web/src/app/home/components/styles/PitchDeck.styles.ts`       | Full rewrite with tamagui                                                                                                 |
| `apps/web/src/app/home/components/styles/WebPresentation.styles.ts` | Full rewrite with tamagui                                                                                                 |
| `apps/web/src/app/home/components/styles/Animations.styles.ts`      | **Deleted**                                                                                                               |
| `apps/web/src/app/home/components/HomeHero.tsx`                     | Update imports; move `HeroCard` transform to `style` prop                                                                 |
| `apps/web/src/app/home/components/HomeFeatures.tsx`                 | Update imports                                                                                                            |
| `apps/web/src/app/home/components/HomeGames.tsx`                    | Update imports; add slider-track className; remove `$gradient` from `MainGameCard`                                        |
| `apps/web/src/app/home/components/HomeHowItWorks.tsx`               | Update imports                                                                                                            |
| `apps/web/src/app/home/components/HomePresentation.tsx`             | Update imports                                                                                                            |
| `apps/web/src/app/home/components/HomePitchDeck.tsx`                | Update imports                                                                                                            |
| `apps/web/src/app/home/components/HomeDownloadCta.tsx`              | Update imports                                                                                                            |
| `apps/web/src/app/home/components/WebPresentation.tsx`              | Update imports; add `isHovered` state for nav button visibility                                                           |

---

## Constraints

- No visual regressions: all existing UI elements, hover effects, and animations are preserved
- No changes to component logic, data, i18n, or drag behaviour in `HomeGames`
- `ThumbnailImage` and `SlideImage` remain plain `<img>` elements — no tamagui equivalent
- Alpha hex suffix pattern (`color}10`) resolved via hardcoded `rgba()` values
- Slider scrollbar hidden via CSS class `slider-track` + global CSS rule, since `::-webkit-scrollbar` cannot be expressed in tamagui props
