---
name: tailwind-pro
description: Write correct Tailwind CSS code in this project. Use before any UI work — covers design tokens, CSS-variable theming, class patterns, responsive variants, and layout gotchas discovered across sessions. Trigger on keywords like Tailwind, tailwind, className, cx, tokens, @arcadeum/ui, styled.
---

# Tailwind Pro — Project-specific reference

This project uses **Tailwind CSS v3** for all web UI (`apps/web` + `@arcadeum/ui` in `packages/ui`). Tamagui was fully removed — **never** write `styled()`, `XStack`/`YStack`, `$tokens`, or `hoverStyle` props. This skill prevents the most common agent mistakes.

## Styling priority (must follow)

1. **`@arcadeum/ui` components** — Check `packages/ui/src/index.ts` first. Reuse what exists (Button, Card, Input, FilterChip, Typography, etc.). All accept `className`.
2. **Tailwind classes** — The primary approach for all new components and pages. Use tokens via `var(--x)` and the class maps below.
3. **SCSS modules** — Only for complex CSS Tailwind can't express cleanly: `@keyframes`, complex `@media` queries, `::before`/`::after` pseudo-elements. Place in `*.scss` files.
4. **Inline `style={{}}`** — Last resort. Only for truly dynamic values (JS-computed sizes, palette colors, portal positioning).

**Never reach for inline styles when a Tailwind class works.**

**NEVER use `!important`** — it silently overrides other classes, creates cascading bugs, and makes future changes unpredictable. If a style isn't applying, the cause is class conflict, specificity, or a missing token — not `!important`.

## Theming — CSS variables, not Tailwind themes

**Tailwind's `theme` config is minimal here. Colors resolve from runtime CSS variables** minted on `<html>` by `ThemeContext` (from `packages/ui/src/themeDefinitions.ts`). Theme switching (dark/light/neon/violet/teal) works by swapping the variables — classes stay identical.

- Themed token → `var(--name)`: `bg-[var(--glassBg)]`, `text-[var(--primary)]`, `border-[var(--borderColor)]`, `bg-[var(--success)]`, `text-[var(--mythicAccent)]`
- `--background` / `--foreground` are also minted (used by `tokens.scss`): `bg-[var(--background)]`, `text-[var(--foreground)]`
- Static tokens (genre palettes, role colors, gold shades) → **hex literals**. Role colors live in `ROLE_COLORS` at `apps/web/src/features/admin-users/lib/roleColors.ts` (e.g. `ROLE_COLORS.vip.fg` → `#ffd644`)
- `body` already sets `color: var(--foreground)` — bare `<span>` inherits text color; only set `text-*` when it must differ

## Quick reference — "What's wrong?"

| Symptom | Cause | Fix |
|---|---|---|
| Class has no effect | Preflight is **disabled** (no reset) | Add `box-border` where box-sizing matters; write explicit classes |
| `gap-3` vs `p-3` mix-ups | Tamagui spacing maps 1:1 | `$N` = N×4px → `gap-N`, `p-N`, `m-N` (see map below) |
| Text overlaps | `leading-none` on body text | Use px values: `leading-[22px]` |
| `items-flex-start` broken | RN-style value | Use `items-start` / `items-end` |
| White text on light bg | `$dangerText`-style token | Use `var(--error)` token instead |
| Overlays clipped | `overflow-hidden` on parent | Move overlay outside scroll container |
| Grid not rendering | Missing `grid` class | `grid` + `grid-cols-N` or inline `gridTemplateColumns` |
| Dynamic color not applying | Class can't take a runtime value | Inline `style={{ color }}` |
| Fixed element scrolls | Nested scroll containers | Move fixed element outside all scrollable parents |
| Responsive prop as HTML attr | `$sm`/`$md` props | Use `max-[800px]:`/`max-[1150px]:` variants (map below) |
| `hoverStyle`/`pressStyle` props | Tamagui leftovers | `hover:` / `active:` variants |
| `onPress` prop | Tamagui leftovers | `onClick` |
| `testID` prop | RN leftovers | `data-testid` |

## Token → Tailwind class maps

**Spacing / padding / margin / gap** — Tailwind scale is also 4px: `$1`→`1`, `$2`→`2`, …, `$12`→`12`, `$true`→`4`. Negative `$-2` → `-m-2`/`-mt-2`.

**Radius** — `$1`→`rounded`, `$2`/`$true`→`rounded-lg`, `$3`→`rounded-xl`, `$4`→`rounded-2xl`, `$5`→`rounded-3xl`, `$6`→`rounded-[24px]`.

**Font sizes** — `$1`..`$10` → 12/14/16/18/20/24/28/32/40/48px → `text-[16px]` (or `text-sm` where it matches).

**zIndex** — `$1`=100 → `z-[100]` … `$5`=500 → `z-[500]`.

**Responsive variants** — `apps/web/tailwind.config.ts` defines NO custom screens, so Tailwind defaults apply: `md:` = 768px, `lg:` = 1024px, `xl:` = 1280px, `2xl:` = 1536px. The app also uses arbitrary `max-[...]:` variants matching the `useMediaQuery` breakpoints (`@/shared/hooks/useMediaQuery`: `sm` = max-width 800px, `md` = max-width 1150px):

| Variant | Breakpoint | Use for |
|---|---|---|
| `max-[800px]:` | ≤800px | matches `useMediaQuery().sm` |
| `max-[1150px]:` | ≤1150px | matches `useMediaQuery().md` |
| `md:` | ≥768px (default) | tablet-up |
| `lg:` | ≥1024px (default) | desktop |
| `xl:` | ≥1280px (default) | wide desktop |
| `2xl:` | ≥1536px (default) | ultrawide |

For JS-driven breakpoints use `useMediaQuery()` from `@/shared/hooks/useMediaQuery` (`media.sm` = ≤800px, `media.md` = ≤1150px).

## Class composition patterns

**Merge class names with `cx`** — `import { cx } from '@arcadeum/ui/utils/cx'`:

```tsx
<div className={cx('box-border flex flex-col gap-3 p-4', isActive && 'border-[var(--primary)]', className)}>
```

**Variant class maps** (styled()-variant replacement):

```ts
const VAR_CLASS = {
  primary: 'bg-[var(--primary)] text-[var(--primaryText)]',
  ghost: 'bg-transparent text-[var(--color)]',
} as const;
// <div className={cx('base', VAR_CLASS[variant], className)} />
```

**Pseudo-states** — `hoverStyle` → `hover:`, `pressStyle` → `active:`, `focusStyle` → `focus:`: `hover:bg-[var(--backgroundHover)] active:scale-[0.98]`.

**Animations** — `animation: 'fast'` → `transition-all duration-150 ease-out`; `'medium'` → `duration-300`; `'slow'` → `duration-500`. Keyframes live in `apps/web/tailwind.config.ts` (`animate-*`) or SCSS.

## Project gotchas

- **Preflight is disabled** in both `apps/web/tailwind.config.ts` and `packages/ui/tailwind.config.ts` — no default reset. Layout primitives carry `box-border` explicitly; keep the habit.
- **Arbitrary values** — spaces become underscores: `bg-[linear-gradient(160deg,var(--primaryGradientStart)_0%,var(--primaryGradientEnd)_100%)]`, `shadow-[0_4px_2px_var(--primary)]`.
- **Tailwind scans** `packages/ui/src/**` via the web config `content` glob — classes used in `@arcadeum/ui` components are compiled into the web build automatically.
- **Base layout classes** — stacks were migrated as: `XStack` → `box-border flex flex-row items-stretch`, `YStack` → `box-border flex flex-col items-stretch`, `Text` → `box-border` (span). Drop `items-stretch` when `items-center`/etc. is set.
- **Components accept `className`** — every `@arcadeum/ui` component merges it via `cx`; never pass Tamagui style props to them.
- **500-line file limit** — keep class maps in sibling `*.classes.ts` / `*.styles.tsx` modules when a component grows.
- **Migration history** — the tamagui→tailwind migration plan lives in `docs/plans/2026-08-15-tamagui-to-tailwind.md` (historical; the one-off codemod was deleted after use).
