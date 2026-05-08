# Home Page Polish + New Themes — Design Spec

**Date:** 2026-03-20
**Branch:** ARC-425
**Status:** Approved

## Overview

Two parallel improvements:

1. Add 4 new color themes (`violetDark`, `violetLight`, `tealDark`, `tealLight`) to the existing theme system
2. Polish 5 home page style files with deeper glass effects, better shadows, refined typography and spacing

The home page polish applies to all themes. The new themes integrate fully into the existing Zustand-persisted theme switcher.

---

## Part 1 — New Themes

### Themes to add

| Name          | Base bg   | Accent                | Character                                           |
| ------------- | --------- | --------------------- | --------------------------------------------------- |
| `violetDark`  | `#080510` | `#c4b5fd` / `#a78bfa` | Deep violet-black, lavender glass, purple glow      |
| `violetLight` | `#faf5ff` | `#7c3aed`             | Soft lavender-white, violet accents, crisp surfaces |
| `tealDark`    | `#040f0f` | `#2dd4bf` / `#5eead4` | Deep teal-black, mint glass, ocean glow             |
| `tealLight`   | `#f0fdfa` | `#0d9488`             | Fresh teal-white, emerald accents, clean surfaces   |

### Files to change

- `apps/web/src/shared/config/theme.ts`

  - Expand `ThemeName` type: add `'violetDark' | 'violetLight' | 'tealDark' | 'tealLight'`
  - Add full token objects for all 4 themes (see token values below)
  - Add to `themeTokens` record
  - Add to `THEME_OPTIONS` array
  - Update `isThemeName` guard
  - Update `isThemePreference` guard

- `packages/ui/src/tamagui.config.ts`

  - Add `glassBg`, `glassBorder`, `glassBgHover`, `glassBorderHover` values for the 4 new themes

- `apps/web/src/app/settings/SettingsContent.tsx`
  - Add 4 entries to the `DEFAULT_THEME_OPTIONS` array (not JSX — the component maps over this array)

### Complete token values

All 4 themes must supply every field required by `ThemeTokens`: `background`, `text` (7 fields), `surfaces` (hero/panel/card), `interactive` (option/pill/download), `buttons` (primary/secondary), `outlines.focus`, `account` (cardBackground/border), `copyNotice`.

---

#### `violetDark`

```ts
name: 'violetDark'
background: { base: '#080510', radialStart: 'rgba(139,92,246,0.25)', radialEnd: 'rgba(99,102,241,0.2)' }

text: {
  primary: '#f5f3ff', secondary: '#ede9fe', muted: 'rgba(196,181,253,0.7)',
  accent: '#c4b5fd', accentSoft: '#a78bfa', onAccent: '#1e1b4b', notice: '#c4b5fd'
}

surfaces: {
  hero:  { background: 'rgba(10,6,28,0.7)',  border: 'rgba(167,139,250,0.18)', shadow: '0 32px 80px rgba(5,0,30,0.5)' }
  panel: { background: 'rgba(12,7,32,0.75)', border: 'rgba(167,139,250,0.15)', shadow: '0 22px 60px rgba(5,0,30,0.4)' }
  card:  { background: 'rgba(18,10,46,0.88)',border: 'rgba(139,92,246,0.28)',  shadow: '0 16px 40px rgba(5,0,30,0.35)' }
}

interactive: {
  option: {
    background: 'rgba(18,10,46,0.5)', border: 'rgba(139,92,246,0.3)',
    hoverBorder: 'rgba(167,139,250,0.55)', activeBackground: 'rgba(24,14,58,0.75)',
    activeBorder: 'rgba(167,139,250,0.6)', activeShadow: '0 18px 56px rgba(109,40,217,0.25)'
  }
  pill: {
    inactiveBackground: 'rgba(18,10,46,0.3)', activeBackground: 'rgba(139,92,246,0.22)',
    border: 'rgba(139,92,246,0.3)', activeBorder: 'rgba(167,139,250,0.6)',
    hoverBorder: 'rgba(167,139,250,0.5)', activeShadow: '0 12px 32px rgba(109,40,217,0.2)'
  }
  download: {
    background: 'rgba(18,10,46,0.6)', hoverBackground: 'rgba(24,14,58,0.72)',
    border: 'rgba(167,139,250,0.28)', hoverBorder: 'rgba(196,181,253,0.5)'
  }
}

buttons: {
  primary:   { gradientStart: '#6d28d9', gradientEnd: '#a78bfa', text: '#fff', shadow: '0 12px 30px rgba(109,40,217,0.45)', hoverShadow: '0 16px 36px rgba(109,40,217,0.55)' }
  secondary: { background: 'rgba(139,92,246,0.1)', hoverBackground: 'rgba(139,92,246,0.18)', border: 'rgba(167,139,250,0.3)', hoverBorder: 'rgba(196,181,253,0.5)', text: '#c4b5fd' }
}

outlines: { focus: 'rgba(196,181,253,0.8)' }
account:  { cardBackground: 'rgba(12,7,32,0.65)', border: 'rgba(139,92,246,0.28)' }
copyNotice: '#c4b5fd'

glassBg: 'rgba(139,92,246,0.07)'   glassBorder: 'rgba(167,139,250,0.2)'
glassBgHover: 'rgba(139,92,246,0.14)'  glassBorderHover: 'rgba(196,181,253,0.38)'
```

---

#### `violetLight`

```ts
name: 'violetLight'
background: { base: '#faf5ff', radialStart: 'rgba(139,92,246,0.15)', radialEnd: 'rgba(99,102,241,0.12)' }

text: {
  primary: '#1e1b4b', secondary: '#2e1d6b', muted: 'rgba(109,40,217,0.65)',
  accent: '#7c3aed', accentSoft: '#4f46e5', onAccent: '#faf5ff', notice: '#6d28d9'
}

surfaces: {
  hero:  { background: 'rgba(255,255,255,0.92)', border: 'rgba(167,139,250,0.3)',  shadow: '0 28px 70px rgba(109,40,217,0.1)' }
  panel: { background: 'rgba(255,255,255,0.88)', border: 'rgba(167,139,250,0.25)', shadow: '0 22px 60px rgba(109,40,217,0.1)' }
  card:  { background: 'rgba(250,245,255,0.95)', border: 'rgba(196,181,253,0.5)',  shadow: '0 16px 40px rgba(109,40,217,0.08)' }
}

interactive: {
  option: {
    background: 'rgba(255,255,255,0.85)', border: 'rgba(196,181,253,0.6)',
    hoverBorder: 'rgba(139,92,246,0.5)', activeBackground: 'rgba(245,240,255,0.95)',
    activeBorder: 'rgba(109,40,217,0.6)', activeShadow: '0 18px 40px rgba(109,40,217,0.18)'
  }
  pill: {
    inactiveBackground: 'rgba(245,240,255,0.8)', activeBackground: 'rgba(139,92,246,0.12)',
    border: 'rgba(196,181,253,0.55)', activeBorder: 'rgba(109,40,217,0.55)',
    hoverBorder: 'rgba(109,40,217,0.4)', activeShadow: '0 12px 28px rgba(109,40,217,0.15)'
  }
  download: {
    background: 'rgba(245,240,255,0.9)', hoverBackground: 'rgba(237,233,254,0.95)',
    border: 'rgba(196,181,253,0.5)', hoverBorder: 'rgba(139,92,246,0.4)'
  }
}

buttons: {
  primary:   { gradientStart: '#6d28d9', gradientEnd: '#8b5cf6', text: '#fff', shadow: '0 12px 30px rgba(109,40,217,0.3)', hoverShadow: '0 16px 36px rgba(109,40,217,0.4)' }
  secondary: { background: 'rgba(109,40,217,0.08)', hoverBackground: 'rgba(109,40,217,0.14)', border: 'rgba(109,40,217,0.2)', hoverBorder: 'rgba(109,40,217,0.38)', text: '#6d28d9' }
}

outlines: { focus: 'rgba(109,40,217,0.7)' }
account:  { cardBackground: 'rgba(255,255,255,0.92)', border: 'rgba(196,181,253,0.45)' }
copyNotice: '#6d28d9'

glassBg: 'rgba(109,40,217,0.05)'   glassBorder: 'rgba(167,139,250,0.3)'
glassBgHover: 'rgba(109,40,217,0.1)'  glassBorderHover: 'rgba(139,92,246,0.45)'
```

---

#### `tealDark`

```ts
name: 'tealDark'
background: { base: '#040f0f', radialStart: 'rgba(13,148,136,0.22)', radialEnd: 'rgba(6,182,212,0.18)' }

text: {
  primary: '#f0fdfa', secondary: '#ccfbf1', muted: 'rgba(94,234,212,0.7)',
  accent: '#2dd4bf', accentSoft: '#5eead4', onAccent: '#022c22', notice: '#2dd4bf'
}

surfaces: {
  hero:  { background: 'rgba(4,18,18,0.7)',  border: 'rgba(45,212,191,0.18)', shadow: '0 32px 80px rgba(0,20,20,0.5)' }
  panel: { background: 'rgba(5,20,20,0.75)', border: 'rgba(45,212,191,0.15)', shadow: '0 22px 60px rgba(0,20,20,0.4)' }
  card:  { background: 'rgba(8,28,28,0.88)', border: 'rgba(13,148,136,0.3)',  shadow: '0 16px 40px rgba(0,20,20,0.35)' }
}

interactive: {
  option: {
    background: 'rgba(8,28,28,0.5)', border: 'rgba(13,148,136,0.3)',
    hoverBorder: 'rgba(45,212,191,0.55)', activeBackground: 'rgba(10,34,34,0.75)',
    activeBorder: 'rgba(45,212,191,0.6)', activeShadow: '0 18px 56px rgba(13,148,136,0.25)'
  }
  pill: {
    inactiveBackground: 'rgba(8,28,28,0.3)', activeBackground: 'rgba(13,148,136,0.22)',
    border: 'rgba(13,148,136,0.3)', activeBorder: 'rgba(45,212,191,0.6)',
    hoverBorder: 'rgba(45,212,191,0.5)', activeShadow: '0 12px 32px rgba(13,148,136,0.2)'
  }
  download: {
    background: 'rgba(8,28,28,0.6)', hoverBackground: 'rgba(10,34,34,0.72)',
    border: 'rgba(45,212,191,0.26)', hoverBorder: 'rgba(94,234,212,0.45)'
  }
}

buttons: {
  primary:   { gradientStart: '#0d9488', gradientEnd: '#2dd4bf', text: '#022c22', shadow: '0 12px 30px rgba(13,148,136,0.4)', hoverShadow: '0 16px 36px rgba(13,148,136,0.5)' }
  secondary: { background: 'rgba(13,148,136,0.1)', hoverBackground: 'rgba(13,148,136,0.18)', border: 'rgba(45,212,191,0.28)', hoverBorder: 'rgba(94,234,212,0.45)', text: '#5eead4' }
}

outlines: { focus: 'rgba(45,212,191,0.8)' }
account:  { cardBackground: 'rgba(5,20,20,0.65)', border: 'rgba(13,148,136,0.3)' }
copyNotice: '#2dd4bf'

glassBg: 'rgba(13,148,136,0.07)'   glassBorder: 'rgba(45,212,191,0.2)'
glassBgHover: 'rgba(13,148,136,0.14)'  glassBorderHover: 'rgba(94,234,212,0.38)'
```

---

#### `tealLight`

```ts
name: 'tealLight'
background: { base: '#f0fdfa', radialStart: 'rgba(13,148,136,0.18)', radialEnd: 'rgba(6,182,212,0.14)' }

text: {
  primary: '#042f2e', secondary: '#134e4a', muted: 'rgba(15,118,110,0.65)',
  accent: '#0d9488', accentSoft: '#0891b2', onAccent: '#f0fdfa', notice: '#0d9488'
}

surfaces: {
  hero:  { background: 'rgba(255,255,255,0.92)', border: 'rgba(45,212,191,0.32)',  shadow: '0 28px 70px rgba(13,148,136,0.1)' }
  panel: { background: 'rgba(255,255,255,0.88)', border: 'rgba(45,212,191,0.26)',  shadow: '0 22px 60px rgba(13,148,136,0.1)' }
  card:  { background: 'rgba(240,253,250,0.95)', border: 'rgba(94,234,212,0.45)',  shadow: '0 16px 40px rgba(13,148,136,0.08)' }
}

interactive: {
  option: {
    background: 'rgba(255,255,255,0.85)', border: 'rgba(94,234,212,0.55)',
    hoverBorder: 'rgba(13,148,136,0.5)', activeBackground: 'rgba(240,253,250,0.95)',
    activeBorder: 'rgba(13,148,136,0.6)', activeShadow: '0 18px 40px rgba(13,148,136,0.18)'
  }
  pill: {
    inactiveBackground: 'rgba(240,253,250,0.8)', activeBackground: 'rgba(13,148,136,0.12)',
    border: 'rgba(94,234,212,0.5)', activeBorder: 'rgba(13,148,136,0.55)',
    hoverBorder: 'rgba(13,148,136,0.4)', activeShadow: '0 12px 28px rgba(13,148,136,0.15)'
  }
  download: {
    background: 'rgba(240,253,250,0.9)', hoverBackground: 'rgba(204,251,241,0.95)',
    border: 'rgba(94,234,212,0.45)', hoverBorder: 'rgba(13,148,136,0.4)'
  }
}

buttons: {
  primary:   { gradientStart: '#0d9488', gradientEnd: '#2dd4bf', text: '#fff', shadow: '0 12px 30px rgba(13,148,136,0.3)', hoverShadow: '0 16px 36px rgba(13,148,136,0.4)' }
  secondary: { background: 'rgba(13,148,136,0.08)', hoverBackground: 'rgba(13,148,136,0.14)', border: 'rgba(13,148,136,0.2)', hoverBorder: 'rgba(13,148,136,0.38)', text: '#0d9488' }
}

outlines: { focus: 'rgba(13,148,136,0.7)' }
account:  { cardBackground: 'rgba(255,255,255,0.92)', border: 'rgba(94,234,212,0.4)' }
copyNotice: '#0d9488'

glassBg: 'rgba(13,148,136,0.05)'   glassBorder: 'rgba(45,212,191,0.3)'
glassBgHover: 'rgba(13,148,136,0.1)'  glassBorderHover: 'rgba(45,212,191,0.48)'
```

---

## Part 2 — Home Page Polish

Style-only changes to 5 files. No layout changes, no section reordering, no logic changes. Lower sections (`DownloadCta.styles.ts`, `PitchDeck.styles.ts`, `Presentation.styles.ts`, `WebPresentation.styles.ts`, `Footer.styles.ts`) are **out of scope** for this task.

### `Common.styles.ts`

- `SectionTitle`: add `letterSpacing: -0.5`
- `SectionSubtitle`: lift `opacity` 0.6 → 0.7
- `SectionContainer`: increase `paddingVertical` `'$10'` → `'$12'`

### `Hero.styles.ts` + `HomeHero.tsx`

- `HeroCard` (in `HomeHero.tsx` inline `style` prop): change `boxShadow` from `'0 20px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)'` to `'0 28px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.18)'`
- `HeroDescription`: lift `opacity` 0.7 → 0.75
- `HeroBackground` inline style in `HomeHero.tsx`: increase radial-gradient opacity from `0.06` → `0.12`

### `HomeGames.tsx` (inline styles only — `MainGameCard` is `GlassCard` re-export, not directly editable here)

- On `<MainGameCard>` JSX: add `style={{ boxShadow: '0 20px 50px rgba(0,0,0,0.35)' }}`
- Hover overlay `<YStack>`: change `opacity` hoverStyle from `0.05` → `0.08`

### `HowItWorks.styles.ts`

- `StepNumber`: add `boxShadow: '0 0 20px rgba(87,195,255,0.15), 0 0 0 1px rgba(255,255,255,0.06)'`
  - Color is intentionally hardcoded — Tamagui tokens don't resolve in boxShadow strings. The cyan glow is subtle enough to read on all 8 themes (invisible on very light surfaces, pleasant on dark surfaces).
- `StepConnector`: remove `backgroundColor: '$borderColor'` and add it as an inline style in `HomeHowItWorks.tsx` using `style={{ background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.15), transparent)' }}` on desktop and `'linear-gradient(to right, transparent, rgba(255,255,255,0.15), transparent)'` on mobile — controlled via a wrapper since the connector orientation flips at `$gtMd`
- `StepTitle`: add `letterSpacing: -0.3`

### `Features.styles.ts`

- `FeatureIcon`: add `boxShadow: '0 4px 20px rgba(87,195,255,0.12)'` and change `backgroundColor` from `'$glassBg'` to use opacity 0.08 instead of 0.03 (hardcode `'rgba(255,255,255,0.08)'` since token is not directly configurable per-component)
  - Same intentional hardcoded approach as StepNumber — subtle on light themes, visible glow on dark
- `FeaturesGrid`: increase `gap` `'$5'` → `'$6'`
- `FeaturesSection`: increase `gap` `'$8'` → `'$10'`

---

## Part 3 — Settings Page

Add 4 entries to `DEFAULT_THEME_OPTIONS` in `apps/web/src/app/settings/SettingsContent.tsx`. The array contains `{ code: ThemePreference, label: string, description: string }` objects.

**Ordering dependency:** The `code` values below are typed as `ThemePreference` (which narrows to `ThemeName | 'system'`). TypeScript will reject these entries until `ThemeName` is expanded in `theme.ts` (Part 1 prerequisite). Complete Part 1 before touching Part 3.

New entries (append after `neonDark`):

```ts
{ code: 'violetDark',  label: 'Violet Dark',  description: 'Deep violet-black with lavender glass and purple glow' }
{ code: 'violetLight', label: 'Violet Light', description: 'Soft lavender-white with crisp violet accents' }
{ code: 'tealDark',    label: 'Teal Dark',    description: 'Deep teal-black with mint glass and ocean glow' }
{ code: 'tealLight',   label: 'Teal Light',   description: 'Fresh teal-white with clean emerald accents' }
```

---

## What is NOT changing

- No layout restructuring of any section
- No new sections added or removed
- No changes to animations or scroll behavior
- No changes to component logic — only styles/tokens
- Existing 4 themes (`dark`, `light`, `neonDark`, `neonLight`) unchanged
- Lower home page style files out of scope: `DownloadCta.styles.ts`, `PitchDeck.styles.ts`, `Presentation.styles.ts`, `WebPresentation.styles.ts`, `Footer.styles.ts`
