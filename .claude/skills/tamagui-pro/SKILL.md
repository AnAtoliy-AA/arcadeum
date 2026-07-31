---
name: tamagui-pro
description: Write correct Tamagui code in this project. Use before any UI work — covers gotchas, correct patterns, tokens, themes, and layout limitations discovered across sessions. Trigger on keywords like Tamagui, styled, XStack, YStack, tamagui, @arcadeum/ui.
---

# Tamagui Pro — Project-specific reference

This project uses **Tamagui** (`@arcadeum/ui` in `packages/ui`) for cross-platform UI across web, mobile, and backend apps. Tamagui looks like CSS but behaves differently — this skill prevents the most common agent mistakes.

## Styling priority (must follow)

1. **`@arcadeum/ui` components** — Check `packages/ui/src/index.ts` first. Reuse what exists (Button, Card, Input, FilterChip, etc.)
2. **Tamagui `styled()`** — The primary approach for new components. Use Tamagui tokens, variants, and responsive props.
3. **SCSS modules** — For CSS features Tamagui can't handle: `display: grid`, `@keyframes`, complex `@media` queries, `::before`/`::after` pseudo-elements. Place in `*.module.scss` files.
4. **Inline `style={{}}`** — Absolute last resort. Only for truly dynamic values (JS-computed sizes, portal positioning) that can't be expressed in `styled()`.

**Never reach for inline styles when `styled()` or SCSS would work.**

**NEVER use `!important`** — not in SCSS, not in inline styles, not anywhere. `!important` overrides Tamagui's variant system silently, creates cascading bugs that are hard to trace, and makes future style changes unpredictable. If a style isn't applying, the root cause is usually variant precedence, CSS specificity, or a different approach — not `!important`.

## Quick reference — "What's wrong?"

| Symptom | Cause | Fix |
|---|---|---|
| Text overlaps / garbled | `lineHeight: 1` → 1px | Use pixel values: `lineHeight: 22` |
| Class not on DOM | `className` in `styled()` options | Pass as JSX prop: `<Comp className="x">` |
| React warnings for unknown attrs | Animation props leaked to DOM | Use SCSS `@keyframes` + `style={{ animation: '...' }}` |
| "Updating style during rerender" | `border` shorthand + `borderColor` mixed | Use `borderTop`/`borderBottom` only |
| White text on light bg | `$dangerText` always #fff | Use `$error` token instead |
| Overlays clipped | `overflow: hidden` on parent | Move overlay outside scroll container |
| "Unexpected text node" | Text child in `YStack` | Use `styled(Text)` for text content |
| Fixed element scrolls | Nested scroll containers | Move fixed element outside all scrollable parents |
| Grid not rendering | Tamagui styled = flex only | Use SCSS module with `display: grid` |
| Font stack TS error | `fontFamily` typed prop | Use SCSS or `style={{ fontFamily: '...' }}` |
| Button size can't change | Variant classes beat `!important` | Use plain `<button>` with className |
| Active chip not visible | `chip` variant wins over `isActive` | Pass `backgroundColor`/`borderColor` explicitly |
| Responsive prop as HTML attr | `$sm` on raw `XStack`/`YStack` | Use `$sm: {}` inside `styled()` only |
| `numberOfLines` TS error in `$sm` | Not supported in responsive variants | Use top-level `numberOfLines` prop |
| `Stack` import error | Doesn't exist in Tamagui | Use `XStack`, `YStack`, or `ZStack` |

## Gotchas by category

### Typography

**`lineHeight` bare numbers become pixels** — `lineHeight: 1` → `line-height: 1px`. Always use pixel values matching your font size.

```tsx
// ❌ BAD
<Text fontSize={16} lineHeight={1.2}>  // → line-height: 1.2px

// ✅ GOOD
<Text fontSize={16} lineHeight={22}>   // → line-height: 22px
```

**`fontFamily` prop rejects raw CSS font stacks** — Tamagui's type only accepts theme tokens or `'unset'`.

```tsx
// ❌ BAD — TS error
<Text fontFamily="'SF Mono', monospace">

// ✅ GOOD — use SCSS module
// styles.module.scss
.title { font-family: 'SF Mono', monospace; }

// Component.tsx
import styles from './styles.module.scss'
<Text className={styles.title}>
```

**`lineHeight` and `whiteSpace` are not valid DOM button props** — Tamagui's `Button` forwards unknown props to `<button>`.

```tsx
// ❌ BAD — React warnings
<Button lineHeight={20} whiteSpace="nowrap">

// ✅ GOOD — use SCSS
// styles.module.scss
.chipLabel { line-height: 20px; white-space: nowrap; }
```

**`whiteSpace: 'nowrap'` on a Tamagui container doesn't prevent text wrapping in child `Typography`** — Components like `LinkButton` wrap text in their own `Typography` child. CSS properties on the parent don't cascade into Tamagui's internal text wrappers.

```tsx
// ❌ BAD — text still wraps inside LinkButton
<LinkButton style={{ whiteSpace: 'nowrap' }}>Long Text</LinkButton>

// ✅ GOOD — use SCSS on the container's children
// styles.module.scss
.actionsCol > * { white-space: nowrap; flex-shrink: 0; }
```

### Layout & positioning

**`overflow: auto/hidden` clips absolutely positioned children** — Floating overlays inside scrollable Containers get clipped.

```tsx
// ❌ BAD — overlay clipped
<Container overflowY="auto">
  <Popup />  // clips!
</Container>

// ✅ GOOD — overlay outside scroll container
<YStack flex={1} minHeight={0} overflowY="auto">
  <Content />
</YStack>
<Popup />  // sibling, not child
```

**`position: fixed` breaks in nested scroll contexts** — Tamagui creates nested scroll containers. `fixed` inside any of them scrolls with the parent.

```tsx
// ❌ BAD
<Container overflowY="auto">
  <FloatingMenu position="fixed">  // scrolls with parent!
</Container>

// ✅ GOOD — move outside all scroll containers
<FloatingMenu position={'fixed' as unknown as 'absolute'}>
```

**Grid layouts fail with Tamagui styled components** — `styled(XStack)`, `styled(View)`, `styled('div')` all fail for grid. Use SCSS modules.

```scss
// ❌ BAD — grid doesn't render in styled()
const Cell = styled(XStack, { display: 'grid' })

// ✅ GOOD — SCSS module for grid
// board.module.scss
.board {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
}
```

**Plain `position: relative` div collapses in Tamagui flex layout** — Use explicit flex properties.

```tsx
// ❌ BAD — zero height
<div style={{ position: 'relative' }}>

// ✅ GOOD
<div style={{ position: 'relative', display: 'flex', flex: 1, minHeight: 0 }}>
```

### `styled()` gotchas

**`styled()` does NOT forward `className`** — It's not added to the DOM.

```tsx
// ❌ BAD — class not on element
const MyBox = styled(YStack, { className: 'my-box' })

// ✅ GOOD — pass as JSX prop
<MyBox className="my-box">
```

**`styled()` leaks CSS animation properties to DOM** — `animationDuration`, `animationDelay` become unknown HTML attributes.

```tsx
// ❌ BAD — React warnings
const FadeIn = styled(YStack, {
  animationDuration: '300ms',
})

// ✅ GOOD — SCSS @keyframes
// animations.module.scss
@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
.fadeIn { animation: fadeIn 300ms ease; }
```

**`styled()` wrapper loses text children** — `styled(SharedButton, { variant: 'chip' })` doesn't accept text directly.

```tsx
// ❌ BAD — "Unexpected text node"
const FilterChip = styled(SharedButton, { variant: 'chip' })
<FilterChip>Label</FilterChip>

// ✅ GOOD — use FilterChip from @arcadeum/ui
import { FilterChip } from '@arcadeum/ui'
<FilterChip active={isSelected}>Label</FilterChip>
```

**`styled(Text)` with layout props causes text overlap** — Layout props on Text produce garbled rendering.

```tsx
// ❌ BAD — text garbles
const Title = styled(Text, { alignSelf: 'center', fontSize: 20 })

// ✅ GOOD — container + text
const TitleContainer = styled(YStack, { alignItems: 'center' })
const Title = styled(Text, { fontSize: 20 })
```

### Variants & theming

**`chip` variant + `isActive` variant precedence issues** — The `chip` variant wins over `isActive` at render time.

```tsx
// ❌ BAD — chip variant overrides isActive styles
<Button variant="chip" isActive={selected}>Label</Button>

// ✅ GOOD — explicit props bypass variant precedence
<Button
  variant="chip"
  backgroundColor={selected ? '$primary' : undefined}
  borderColor={selected ? '$primary' : undefined}
  color={selected ? '$primaryText' : undefined}
>
  Label
</Button>
```

**`$glassBorder` is invisible as active indicator** — `rgba(255,255,255,0.1)` matches default chip border. Use contrasting colors.

**Variant merging overrides earlier variants** — Multiple active variants on `styled()`: later ones win. Check for global CSS `!important` that may kill variants silently.

**`Button`/`IconButton` `size` prop cannot be overridden** — Variant classes beat `!important` and `style` prop.

```tsx
// ❌ BAD — size stays 36px
<IconButton size="lg" style={{ width: 48, height: 48 }}>

// ✅ GOOD — use plain button for custom sizing
<button className="my-icon-btn" style={{ width: 48, height: 48 }}>
  <Icon />
</button>
```

### Responsive

**Responsive props only work in `styled()` definitions** — On raw `YStack`/`XStack`, they render as literal HTML attributes.

```tsx
// ❌ BAD — renders as paddingsm="$2" in DOM
<YStack paddingsm="$2">

// ✅ GOOD — inside styled()
const Box = styled(YStack, {
  $sm: { padding: '$2' },
})
```

**`$sm` variants don't support `numberOfLines`** — TS error. Use top-level prop.

```tsx
// ❌ BAD — TS error
<Text $sm={{ fontSize: 13, numberOfLines: 1 }}>

// ✅ GOOD
<Text numberOfLines={1} $sm={{ fontSize: 13 }}>
```

### Animations

**CSS animations: use SCSS modules, not Tamagui animation props** — `styled()` leaks animation properties to DOM. Define `@keyframes` in SCSS, apply via className.

```tsx
// ❌ BAD — animation props leak to DOM
const FadeIn = styled(YStack, {
  animationDuration: '300ms',
  animationTimingFunction: 'ease',
})

// ✅ GOOD — SCSS module
// fade.module.scss
@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
.fadeIn { animation: fadeIn 300ms ease; }

// Component.tsx
import styles from './fade.module.scss'
<YStack className={styles.fadeIn}>
```

**SCSS `@keyframes` must be imported where used** — Don't rely on global styles. Each component that needs animations should import its own SCSS module.

### Misc

**`Stack` doesn't exist in Tamagui** — Use `XStack`, `YStack`, or `ZStack`.

**Negative token values work** — `marginHorizontal: '-$7'` → -28px.

**`createPortal` for card-grid overflow** — When a card needs more content than it allows, portal to full-screen overlay.

## Wrapper div pattern

When a Tamagui component needs HTML-only attributes (`role`, `draggable`, native event handlers):

```tsx
<div role="grid" draggable>
  <StyledTamaguiComponent>...</StyledTamaguiComponent>
</div>
```

The `<div>` carries HTML attributes; the Tamagui component handles visual styling.

## Component reference

### Button variants (from `SharedButtonStyles.ts`)

| Variant | Use for | Key styles |
|---|---|---|
| `primary` | Primary CTAs | Gradient bg, white text, hover lift |
| `secondary` | Secondary actions | Purple gradient |
| `danger` | Destructive actions | Red gradient |
| `glass` | Frosted glass surfaces | Semi-transparent bg, backdrop blur |
| `ghost` | Minimal/no bg | Transparent, hover shows bg |
| `outline` | Border-only | Transparent bg, visible border |
| `icon` | Icon-only buttons | Circular, aspect-ratio 1 |
| `link` | Inline text links | No padding/height |
| `chip` | Filter/toggle chips | Small (28px height), rounded |
| `listItem` | Menu/list items | Full width, left-aligned |
| `neutral` | Subtle actions | Uses `$background` token |
| `success`/`warning`/`info` | Status actions | Semantic colors |
| `victory` | Win celebration | Gold gradient, large hover |

### Button sizes

| Size | Height | Padding X | Padding Y | Border radius |
|---|---|---|---|---|
| `sm` | 36px | `$4` (16px) | `$2` (8px) | `$3` (12px) |
| `md` | 48px | `$6` (24px) | `$3` (12px) | `$4` (16px) |
| `lg` | 60px | `$8` (32px) | `$4` (16px) | `$5` (20px) |

### FilterChip (from `packages/ui`)

Standalone `styled(XStack)` component — bypasses Button variant precedence issues. Use for all filter/toggle chips.

```tsx
import { FilterChip } from '@arcadeum/ui'

<FilterChip active={isSelected} onClick={toggle}>
  Option Label
</FilterChip>
```

## Available tokens

Read `packages/ui/src/tamagui.config.ts` for the full config.

### Spacing (use `$` prefix)
`$0`=0, `$1`=4px, `$2`=8px, `$3`=12px, `$4`=16px, `$5`=20px, `$6`=24px, `$7`=28px, `$8`=32px, `$9`=36px, `$10`=40px

### Font sizes (use `size` prop on Text)
`size={1}`=12, `size={2}`=14, `size={3}`=16, `size={4}`=18, `size={5}`=20, `size={6}`=24, `size={7}`=28, `size={8}`=32, `size={9}`=40, `size={10}`=48
Shorthands: `size="sm"`=14, `size="md"`=16, `size="lg"`=18, `size="xl"`=20

### Border radius
`$0`=0, `$1`=4px, `$2`=8px, `$3`=12px, `$4`=16px, `$5`=20px, `$6`=24px

### Z-index
`$0`=0, `$1`=100, `$2`=200, `$3`=300, `$4`=400, `$5`=500

### Common theme tokens (dark theme)
| Token | Value | Use for |
|---|---|---|
| `$background` | `#151718` | Page/section bg |
| `$color` | `#ecefee` | Default text |
| `$primary` | `#0369a1` | Primary buttons, links |
| `$danger` / `$error` | `#b91c1c` | Error states, destructive actions |
| `$textSecondary` / `$neutral` | `#8e9196` | Muted/secondary text |
| `$borderColor` | `#32353d` | Borders, dividers |
| `$accent` | `#38bdf8` | Accent highlights |
| `$success` | `#047857` | Success states |
| `$warning` | `#92400e` | Warning states |
| `$info` | `#2563eb` | Info states |
| `$glassBorder` | `rgba(255,255,255,0.1)` | Glass borders (invisible on dark!) |

### Status colors (safe on both light/dark)
- **Error text**: Use `$error` (`#b91c1c`) — NOT `$dangerText` (always white)
- **Success**: `$success` (`#047857`), `$successText` (`#ffffff`)
- **Warning**: `$warning` (`#92400e`), `$warningText` (`#ffffff`)
- **Info**: `$info` (`#2563eb`), `$infoText` (theme-dependent)

## Available themes

`dark` (default), `light`, `neonDark`, `neonLight`, `violetDark`, `violetLight`, `tealDark`, `tealLight`

Use `<Theme name="light">` wrapper or `useThemeName()` hook to switch.

## Responsive breakpoints

| Token | Max width |
|---|---|
| `$xxl` | ≤1600px |
| `$xl` | ≤1420px |
| `$lg` | ≤1280px |
| `$md` | ≤1150px |
| `$tablet` | ≤1023px |
| `$sm` | ≤800px |
| `$xs` | ≤660px |

Min-width: `$gtXs` (>660), `$gtSm` (>800), `$gtTablet` (>1023), `$gtMd` (>1150), `$gtLg` (>1280)

## Animation presets

Use the `animate` prop: `fast`, `medium`, `slow`, `quick` (all spring-based).

For CSS keyframe animations: use SCSS modules, not Tamagui animation props.

## Common patterns in this codebase

### Hydration safety
- Landing views (Critical, Glimworm, SeaBattle) → server components
- Interactive sub-components (`QuickplayCta`, hero CTAs) → `'use client'` boundaries
- For components that MUST be `'use client'`, prefer native HTML `<button>` over Tamagui `Button`

### Grid layouts (chess boards, data grids)
Use SCSS modules with `display: grid` — Tamagui styled components don't support grid.

### List/table views with variable content
Use fixed column widths (`px`, `fr`) instead of `auto` to prevent columns from shifting when content changes (e.g., 1 vs 2 buttons). If buttons have multi-line text, ensure `white-space: nowrap` via SCSS on the container's children.

### Animations
Use SCSS `@keyframes` modules, not Tamagui animation props. Each component imports its own module.

### Chip/filter buttons
Use `FilterChip` from `@arcadeum/ui` (standalone `styled(XStack)`) — avoids Button variant precedence issues.

### Dark glass backgrounds
`rgba(12,14,22,0.35)` dark semi-transparent backgrounds prevent seeing content behind. Apple liquid glass requires `rgba(255,255,255,0.12-0.25)` white-transparent backgrounds.

## Checklist before shipping UI code

- [ ] Reused `@arcadeum/ui` components where possible
- [ ] Used `styled()` for new components (not inline styles)
- [ ] Used SCSS modules for grid, keyframes, complex media queries
- [ ] No `!important` anywhere in styles
- [ ] `lineHeight` uses pixel values, not bare numbers
- [ ] No `className` in `styled()` options (pass as JSX prop)
- [ ] No animation props in `styled()` (use SCSS `@keyframes`)
- [ ] No mixing of `border` shorthand + non-shorthand properties
- [ ] Error text uses `$error`, not `$dangerText`
- [ ] Floating overlays placed outside scrollable containers
- [ ] Grid layouts use SCSS modules, not Tamagui styled components
- [ ] Text content uses `styled(Text)`, not `styled(YStack)` with text children
- [ ] Chip active states use explicit props, not `isActive` variant
- [ ] Responsive props only in `styled()` definitions (not raw components)
- [ ] `numberOfLines` at top-level, not inside `$sm` variant
