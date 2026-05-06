# Home Themes + Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 4 new color themes (violetDark, violetLight, tealDark, tealLight) to the Arcadeum theme system and polish all home page sections with deeper glass effects, better shadows, refined typography and spacing.

**Architecture:** New themes are token objects added to `theme.ts` (semantic tokens used by the app) and `tamagui.config.ts` (CSS-level Tamagui tokens). Home page polish is applied directly to Tamagui styled components in the `styles/` files and inline `style` props in the two component files that need CSS features (gradients, boxShadow) not natively supported by Tamagui tokens. Settings page gets 4 new entries appended to the `DEFAULT_THEME_OPTIONS` array.

**Tech Stack:** Next.js 14, Tamagui (styled components, theme system), TypeScript, Zustand (theme persistence)

---

## File Map

| File                                                           | Action | What changes                                                                                                         |
| -------------------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------- |
| `apps/web/src/shared/config/theme.ts`                          | Modify | Add `ThemeName` variants, 4 token objects, update `themeTokens`, `THEME_OPTIONS`, `isThemeName`, `isThemePreference` |
| `packages/ui/src/tamagui.config.ts`                            | Modify | Add 4 theme objects with glass token overrides; register in `themes` map                                             |
| `apps/web/src/app/settings/SettingsContent.tsx`                | Modify | Append 4 entries to `DEFAULT_THEME_OPTIONS`                                                                          |
| `apps/web/src/app/home/components/styles/Common.styles.ts`     | Modify | `SectionTitle` letterSpacing, `SectionSubtitle` opacity, `SectionContainer` paddingVertical                          |
| `apps/web/src/app/home/components/styles/Hero.styles.ts`       | Modify | `HeroDescription` opacity                                                                                            |
| `apps/web/src/app/home/components/HomeHero.tsx`                | Modify | `HeroCard` boxShadow, `HeroBackground` radial gradient opacity                                                       |
| `apps/web/src/app/home/components/HomeGames.tsx`               | Modify | `MainGameCard` boxShadow inline style, hover overlay opacity                                                         |
| `apps/web/src/app/home/components/styles/HowItWorks.styles.ts` | Modify | `StepNumber` boxShadow, `StepTitle` letterSpacing; remove `StepConnector` backgroundColor                            |
| `apps/web/src/app/home/components/HomeHowItWorks.tsx`          | Modify | `StepConnector` inline gradient style                                                                                |
| `apps/web/src/app/home/components/styles/Features.styles.ts`   | Modify | `FeatureIcon` boxShadow + backgroundColor, `FeaturesGrid` gap, `FeaturesSection` gap                                 |

---

## Task 1: Expand ThemeName type and type guards

**Files:**

- Modify: `apps/web/src/shared/config/theme.ts:1`

- [ ] **Step 1: Update `ThemeName` type** — change line 1 from:

  ```ts
  export type ThemeName = 'light' | 'dark' | 'neonLight' | 'neonDark';
  ```

  to:

  ```ts
  export type ThemeName =
    | 'light'
    | 'dark'
    | 'neonLight'
    | 'neonDark'
    | 'violetDark'
    | 'violetLight'
    | 'tealDark'
    | 'tealLight';
  ```

- [ ] **Step 2: Update `isThemeName` guard** — find the function and add the 4 new values:

  ```ts
  export function isThemeName(value: unknown): value is ThemeName {
    return (
      value === 'light' ||
      value === 'dark' ||
      value === 'neonLight' ||
      value === 'neonDark' ||
      value === 'violetDark' ||
      value === 'violetLight' ||
      value === 'tealDark' ||
      value === 'tealLight'
    );
  }
  ```

- [ ] **Step 3: Update `THEME_OPTIONS` array** — find the array and append the 4 new names:

  ```ts
  export const THEME_OPTIONS: ThemePreference[] = [
    'system',
    'light',
    'dark',
    'neonLight',
    'neonDark',
    'violetDark',
    'violetLight',
    'tealDark',
    'tealLight',
  ];
  ```

- [ ] **Step 4: Verify TypeScript compiles** — run from repo root:
  ```bash
  cd apps/web && npx tsc --noEmit 2>&1 | head -40
  ```
  Expected: errors only about missing token objects (the `themeTokens` record is not yet updated). If you see unrelated errors, fix them before continuing.

---

## Task 2: Add violetDark and violetLight token objects

**Files:**

- Modify: `apps/web/src/shared/config/theme.ts`

Add these two const objects before the `themeTokens` record. Insert them after `darkTokens` (around line 422).

- [ ] **Step 1: Add `violetDarkTokens`**:

  ```ts
  const violetDarkTokens: ThemeTokens = {
    name: 'violetDark',
    background: {
      base: '#080510',
      radialStart: 'rgba(139,92,246,0.25)',
      radialEnd: 'rgba(99,102,241,0.2)',
    },
    text: {
      primary: '#f5f3ff',
      secondary: '#ede9fe',
      muted: 'rgba(196,181,253,0.7)',
      accent: '#c4b5fd',
      accentSoft: '#a78bfa',
      onAccent: '#1e1b4b',
      notice: '#c4b5fd',
    },
    surfaces: {
      hero: {
        background: 'rgba(10,6,28,0.7)',
        border: 'rgba(167,139,250,0.18)',
        shadow: '0 32px 80px rgba(5,0,30,0.5)',
      },
      panel: {
        background: 'rgba(12,7,32,0.75)',
        border: 'rgba(167,139,250,0.15)',
        shadow: '0 22px 60px rgba(5,0,30,0.4)',
      },
      card: {
        background: 'rgba(18,10,46,0.88)',
        border: 'rgba(139,92,246,0.28)',
        shadow: '0 16px 40px rgba(5,0,30,0.35)',
      },
    },
    interactive: {
      option: {
        background: 'rgba(18,10,46,0.5)',
        border: 'rgba(139,92,246,0.3)',
        hoverBorder: 'rgba(167,139,250,0.55)',
        activeBackground: 'rgba(24,14,58,0.75)',
        activeBorder: 'rgba(167,139,250,0.6)',
        activeShadow: '0 18px 56px rgba(109,40,217,0.25)',
      },
      pill: {
        inactiveBackground: 'rgba(18,10,46,0.3)',
        activeBackground: 'rgba(139,92,246,0.22)',
        border: 'rgba(139,92,246,0.3)',
        activeBorder: 'rgba(167,139,250,0.6)',
        hoverBorder: 'rgba(167,139,250,0.5)',
        activeShadow: '0 12px 32px rgba(109,40,217,0.2)',
      },
      download: {
        background: 'rgba(18,10,46,0.6)',
        hoverBackground: 'rgba(24,14,58,0.72)',
        border: 'rgba(167,139,250,0.28)',
        hoverBorder: 'rgba(196,181,253,0.5)',
      },
    },
    buttons: {
      primary: {
        gradientStart: '#6d28d9',
        gradientEnd: '#a78bfa',
        text: '#fff',
        shadow: '0 12px 30px rgba(109,40,217,0.45)',
        hoverShadow: '0 16px 36px rgba(109,40,217,0.55)',
      },
      secondary: {
        background: 'rgba(139,92,246,0.1)',
        hoverBackground: 'rgba(139,92,246,0.18)',
        border: 'rgba(167,139,250,0.3)',
        hoverBorder: 'rgba(196,181,253,0.5)',
        text: '#c4b5fd',
      },
    },
    outlines: { focus: 'rgba(196,181,253,0.8)' },
    account: {
      cardBackground: 'rgba(12,7,32,0.65)',
      border: 'rgba(139,92,246,0.28)',
    },
    copyNotice: '#c4b5fd',
  };
  ```

- [ ] **Step 2: Add `violetLightTokens`**:

  ```ts
  const violetLightTokens: ThemeTokens = {
    name: 'violetLight',
    background: {
      base: '#faf5ff',
      radialStart: 'rgba(139,92,246,0.15)',
      radialEnd: 'rgba(99,102,241,0.12)',
    },
    text: {
      primary: '#1e1b4b',
      secondary: '#2e1d6b',
      muted: 'rgba(109,40,217,0.65)',
      accent: '#7c3aed',
      accentSoft: '#4f46e5',
      onAccent: '#faf5ff',
      notice: '#6d28d9',
    },
    surfaces: {
      hero: {
        background: 'rgba(255,255,255,0.92)',
        border: 'rgba(167,139,250,0.3)',
        shadow: '0 28px 70px rgba(109,40,217,0.1)',
      },
      panel: {
        background: 'rgba(255,255,255,0.88)',
        border: 'rgba(167,139,250,0.25)',
        shadow: '0 22px 60px rgba(109,40,217,0.1)',
      },
      card: {
        background: 'rgba(250,245,255,0.95)',
        border: 'rgba(196,181,253,0.5)',
        shadow: '0 16px 40px rgba(109,40,217,0.08)',
      },
    },
    interactive: {
      option: {
        background: 'rgba(255,255,255,0.85)',
        border: 'rgba(196,181,253,0.6)',
        hoverBorder: 'rgba(139,92,246,0.5)',
        activeBackground: 'rgba(245,240,255,0.95)',
        activeBorder: 'rgba(109,40,217,0.6)',
        activeShadow: '0 18px 40px rgba(109,40,217,0.18)',
      },
      pill: {
        inactiveBackground: 'rgba(245,240,255,0.8)',
        activeBackground: 'rgba(139,92,246,0.12)',
        border: 'rgba(196,181,253,0.55)',
        activeBorder: 'rgba(109,40,217,0.55)',
        hoverBorder: 'rgba(109,40,217,0.4)',
        activeShadow: '0 12px 28px rgba(109,40,217,0.15)',
      },
      download: {
        background: 'rgba(245,240,255,0.9)',
        hoverBackground: 'rgba(237,233,254,0.95)',
        border: 'rgba(196,181,253,0.5)',
        hoverBorder: 'rgba(139,92,246,0.4)',
      },
    },
    buttons: {
      primary: {
        gradientStart: '#6d28d9',
        gradientEnd: '#8b5cf6',
        text: '#fff',
        shadow: '0 12px 30px rgba(109,40,217,0.3)',
        hoverShadow: '0 16px 36px rgba(109,40,217,0.4)',
      },
      secondary: {
        background: 'rgba(109,40,217,0.08)',
        hoverBackground: 'rgba(109,40,217,0.14)',
        border: 'rgba(109,40,217,0.2)',
        hoverBorder: 'rgba(109,40,217,0.38)',
        text: '#6d28d9',
      },
    },
    outlines: { focus: 'rgba(109,40,217,0.7)' },
    account: {
      cardBackground: 'rgba(255,255,255,0.92)',
      border: 'rgba(196,181,253,0.45)',
    },
    copyNotice: '#6d28d9',
  };
  ```

- [ ] **Step 3: Verify TypeScript** (still expecting missing-token errors for teal themes, not for violet):
  ```bash
  cd apps/web && npx tsc --noEmit 2>&1 | grep -i violet
  ```
  Expected: no errors mentioning violet.

---

## Task 3: Add tealDark and tealLight token objects

**Files:**

- Modify: `apps/web/src/shared/config/theme.ts`

Add immediately after `violetLightTokens`.

- [ ] **Step 1: Add `tealDarkTokens`**:

  ```ts
  const tealDarkTokens: ThemeTokens = {
    name: 'tealDark',
    background: {
      base: '#040f0f',
      radialStart: 'rgba(13,148,136,0.22)',
      radialEnd: 'rgba(6,182,212,0.18)',
    },
    text: {
      primary: '#f0fdfa',
      secondary: '#ccfbf1',
      muted: 'rgba(94,234,212,0.7)',
      accent: '#2dd4bf',
      accentSoft: '#5eead4',
      onAccent: '#022c22',
      notice: '#2dd4bf',
    },
    surfaces: {
      hero: {
        background: 'rgba(4,18,18,0.7)',
        border: 'rgba(45,212,191,0.18)',
        shadow: '0 32px 80px rgba(0,20,20,0.5)',
      },
      panel: {
        background: 'rgba(5,20,20,0.75)',
        border: 'rgba(45,212,191,0.15)',
        shadow: '0 22px 60px rgba(0,20,20,0.4)',
      },
      card: {
        background: 'rgba(8,28,28,0.88)',
        border: 'rgba(13,148,136,0.3)',
        shadow: '0 16px 40px rgba(0,20,20,0.35)',
      },
    },
    interactive: {
      option: {
        background: 'rgba(8,28,28,0.5)',
        border: 'rgba(13,148,136,0.3)',
        hoverBorder: 'rgba(45,212,191,0.55)',
        activeBackground: 'rgba(10,34,34,0.75)',
        activeBorder: 'rgba(45,212,191,0.6)',
        activeShadow: '0 18px 56px rgba(13,148,136,0.25)',
      },
      pill: {
        inactiveBackground: 'rgba(8,28,28,0.3)',
        activeBackground: 'rgba(13,148,136,0.22)',
        border: 'rgba(13,148,136,0.3)',
        activeBorder: 'rgba(45,212,191,0.6)',
        hoverBorder: 'rgba(45,212,191,0.5)',
        activeShadow: '0 12px 32px rgba(13,148,136,0.2)',
      },
      download: {
        background: 'rgba(8,28,28,0.6)',
        hoverBackground: 'rgba(10,34,34,0.72)',
        border: 'rgba(45,212,191,0.26)',
        hoverBorder: 'rgba(94,234,212,0.45)',
      },
    },
    buttons: {
      primary: {
        gradientStart: '#0d9488',
        gradientEnd: '#2dd4bf',
        text: '#022c22',
        shadow: '0 12px 30px rgba(13,148,136,0.4)',
        hoverShadow: '0 16px 36px rgba(13,148,136,0.5)',
      },
      secondary: {
        background: 'rgba(13,148,136,0.1)',
        hoverBackground: 'rgba(13,148,136,0.18)',
        border: 'rgba(45,212,191,0.28)',
        hoverBorder: 'rgba(94,234,212,0.45)',
        text: '#5eead4',
      },
    },
    outlines: { focus: 'rgba(45,212,191,0.8)' },
    account: {
      cardBackground: 'rgba(5,20,20,0.65)',
      border: 'rgba(13,148,136,0.3)',
    },
    copyNotice: '#2dd4bf',
  };
  ```

- [ ] **Step 2: Add `tealLightTokens`**:

  ```ts
  const tealLightTokens: ThemeTokens = {
    name: 'tealLight',
    background: {
      base: '#f0fdfa',
      radialStart: 'rgba(13,148,136,0.18)',
      radialEnd: 'rgba(6,182,212,0.14)',
    },
    text: {
      primary: '#042f2e',
      secondary: '#134e4a',
      muted: 'rgba(15,118,110,0.65)',
      accent: '#0d9488',
      accentSoft: '#0891b2',
      onAccent: '#f0fdfa',
      notice: '#0d9488',
    },
    surfaces: {
      hero: {
        background: 'rgba(255,255,255,0.92)',
        border: 'rgba(45,212,191,0.32)',
        shadow: '0 28px 70px rgba(13,148,136,0.1)',
      },
      panel: {
        background: 'rgba(255,255,255,0.88)',
        border: 'rgba(45,212,191,0.26)',
        shadow: '0 22px 60px rgba(13,148,136,0.1)',
      },
      card: {
        background: 'rgba(240,253,250,0.95)',
        border: 'rgba(94,234,212,0.45)',
        shadow: '0 16px 40px rgba(13,148,136,0.08)',
      },
    },
    interactive: {
      option: {
        background: 'rgba(255,255,255,0.85)',
        border: 'rgba(94,234,212,0.55)',
        hoverBorder: 'rgba(13,148,136,0.5)',
        activeBackground: 'rgba(240,253,250,0.95)',
        activeBorder: 'rgba(13,148,136,0.6)',
        activeShadow: '0 18px 40px rgba(13,148,136,0.18)',
      },
      pill: {
        inactiveBackground: 'rgba(240,253,250,0.8)',
        activeBackground: 'rgba(13,148,136,0.12)',
        border: 'rgba(94,234,212,0.5)',
        activeBorder: 'rgba(13,148,136,0.55)',
        hoverBorder: 'rgba(13,148,136,0.4)',
        activeShadow: '0 12px 28px rgba(13,148,136,0.15)',
      },
      download: {
        background: 'rgba(240,253,250,0.9)',
        hoverBackground: 'rgba(204,251,241,0.95)',
        border: 'rgba(94,234,212,0.45)',
        hoverBorder: 'rgba(13,148,136,0.4)',
      },
    },
    buttons: {
      primary: {
        gradientStart: '#0d9488',
        gradientEnd: '#2dd4bf',
        text: '#fff',
        shadow: '0 12px 30px rgba(13,148,136,0.3)',
        hoverShadow: '0 16px 36px rgba(13,148,136,0.4)',
      },
      secondary: {
        background: 'rgba(13,148,136,0.08)',
        hoverBackground: 'rgba(13,148,136,0.14)',
        border: 'rgba(13,148,136,0.2)',
        hoverBorder: 'rgba(13,148,136,0.38)',
        text: '#0d9488',
      },
    },
    outlines: { focus: 'rgba(13,148,136,0.7)' },
    account: {
      cardBackground: 'rgba(255,255,255,0.92)',
      border: 'rgba(94,234,212,0.4)',
    },
    copyNotice: '#0d9488',
  };
  ```

- [ ] **Step 3: Verify TypeScript — no errors expected now for token objects**:
  ```bash
  cd apps/web && npx tsc --noEmit 2>&1 | head -20
  ```
  Expected: errors only about `themeTokens` record (tokens defined but not registered yet).

---

## Task 4: Register new themes in theme.ts

**Files:**

- Modify: `apps/web/src/shared/config/theme.ts`

- [ ] **Step 1: Update `themeTokens` record** — find the record and add 4 new entries:

  ```ts
  export const themeTokens: Record<ThemeName, ThemeTokens> = {
    light: lightTokens,
    dark: darkTokens,
    neonLight: neonLightTokens,
    neonDark: neonDarkTokens,
    violetDark: violetDarkTokens,
    violetLight: violetLightTokens,
    tealDark: tealDarkTokens,
    tealLight: tealLightTokens,
  };
  ```

- [ ] **Step 2: Verify TypeScript compiles clean**:

  ```bash
  cd apps/web && npx tsc --noEmit 2>&1 | head -20
  ```

  Expected: no errors related to theme.ts. There may be unrelated errors from the settings file (Step 3 not done yet) but theme.ts itself should be clean.

- [ ] **Step 3: Commit**:
  ```bash
  git add apps/web/src/shared/config/theme.ts
  git commit -m "feat: add violetDark, violetLight, tealDark, tealLight theme tokens"
  ```

---

## Task 5: Add Tamagui theme objects and glass tokens

**Files:**

- Modify: `packages/ui/src/tamagui.config.ts`

Each new theme is a spread of the appropriate base theme (dark themes spread `darkTheme`, light themes spread `lightTheme`) with overrides for the key visual tokens.

- [ ] **Step 1: Add `violetDarkTheme` object** — insert after `neonLightTheme` (around line 311):

  ```ts
  const violetDarkTheme = {
    ...darkTheme,
    background: '#080510',
    backgroundHover: '#110820',
    backgroundPress: '#1a1030',
    color: '#f5f3ff',
    borderColor: 'rgba(167,139,250,0.3)',
    borderColorPress: 'rgba(196,181,253,0.6)',
    borderColorFocus: 'rgba(196,181,253,0.85)',
    shadowColor: 'rgba(5,0,30,0.4)',
    primary: '#a78bfa',
    primaryGradientStart: '#c4b5fd',
    primaryGradientEnd: '#a78bfa',
    secondary: '#818cf8',
    overlayBg: 'rgba(0,0,0,0.75)',
    glassBg: 'rgba(139,92,246,0.07)',
    glassBorder: 'rgba(167,139,250,0.2)',
    glassBgHover: 'rgba(139,92,246,0.14)',
    glassBorderHover: 'rgba(196,181,253,0.38)',
  };
  ```

- [ ] **Step 2: Add `violetLightTheme` object**:

  ```ts
  const violetLightTheme = {
    ...lightTheme,
    background: '#faf5ff',
    backgroundHover: '#f3e8ff',
    backgroundPress: '#e9d5ff',
    color: '#1e1b4b',
    borderColor: 'rgba(196,181,253,0.5)',
    borderColorPress: 'rgba(139,92,246,0.7)',
    borderColorFocus: 'rgba(109,40,217,0.75)',
    shadowColor: 'rgba(109,40,217,0.1)',
    primary: '#7c3aed',
    primaryGradientStart: '#8b5cf6',
    primaryGradientEnd: '#6d28d9',
    secondary: '#4f46e5',
    glassBg: 'rgba(109,40,217,0.05)',
    glassBorder: 'rgba(167,139,250,0.3)',
    glassBgHover: 'rgba(109,40,217,0.1)',
    glassBorderHover: 'rgba(139,92,246,0.45)',
  };
  ```

- [ ] **Step 3: Add `tealDarkTheme` object**:

  ```ts
  const tealDarkTheme = {
    ...darkTheme,
    background: '#040f0f',
    backgroundHover: '#081a1a',
    backgroundPress: '#0d2424',
    color: '#f0fdfa',
    borderColor: 'rgba(45,212,191,0.25)',
    borderColorPress: 'rgba(94,234,212,0.55)',
    borderColorFocus: 'rgba(45,212,191,0.8)',
    shadowColor: 'rgba(0,20,20,0.45)',
    primary: '#2dd4bf',
    primaryGradientStart: '#5eead4',
    primaryGradientEnd: '#2dd4bf',
    secondary: '#38bdf8',
    overlayBg: 'rgba(0,0,0,0.75)',
    glassBg: 'rgba(13,148,136,0.07)',
    glassBorder: 'rgba(45,212,191,0.2)',
    glassBgHover: 'rgba(13,148,136,0.14)',
    glassBorderHover: 'rgba(94,234,212,0.38)',
  };
  ```

- [ ] **Step 4: Add `tealLightTheme` object**:

  ```ts
  const tealLightTheme = {
    ...lightTheme,
    background: '#f0fdfa',
    backgroundHover: '#ccfbf1',
    backgroundPress: '#99f6e4',
    color: '#042f2e',
    borderColor: 'rgba(94,234,212,0.45)',
    borderColorPress: 'rgba(45,212,191,0.65)',
    borderColorFocus: 'rgba(13,148,136,0.75)',
    shadowColor: 'rgba(13,148,136,0.1)',
    primary: '#0d9488',
    primaryGradientStart: '#2dd4bf',
    primaryGradientEnd: '#0d9488',
    secondary: '#0891b2',
    glassBg: 'rgba(13,148,136,0.05)',
    glassBorder: 'rgba(45,212,191,0.3)',
    glassBgHover: 'rgba(13,148,136,0.1)',
    glassBorderHover: 'rgba(45,212,191,0.48)',
  };
  ```

- [ ] **Step 5: Register all 4 in the `themes` object** — find the `themes:` key in `createTamagui({...})` and add 4 entries:

  ```ts
  themes: {
    light: lightTheme,
    dark: darkTheme,
    neonLight: neonLightTheme,
    neonDark: neonDarkTheme,
    violetDark: violetDarkTheme,
    violetLight: violetLightTheme,
    tealDark: tealDarkTheme,
    tealLight: tealLightTheme,
  },
  ```

- [ ] **Step 6: Verify TypeScript in packages/ui**:

  ```bash
  cd packages/ui && npx tsc --noEmit 2>&1 | head -20
  ```

  Expected: no errors.

- [ ] **Step 7: Commit**:
  ```bash
  git add packages/ui/src/tamagui.config.ts
  git commit -m "feat: register violetDark, violetLight, tealDark, tealLight Tamagui themes"
  ```

---

## Task 6: Update settings page theme picker

> **Prerequisite:** Task 1 must be complete (ThemeName expanded) before this task — TypeScript will reject the new `code` values until `ThemeName` includes the new names.

**Files:**

- Modify: `apps/web/src/app/settings/SettingsContent.tsx:64-94`

- [ ] **Step 1: Append 4 entries to `DEFAULT_THEME_OPTIONS`** — find the array (currently ends at `neonDark`) and add after it:

  ```ts
  {
    code: 'violetDark',
    label: 'Violet Dark',
    description: 'Deep violet-black with lavender glass and purple glow.',
  },
  {
    code: 'violetLight',
    label: 'Violet Light',
    description: 'Soft lavender-white with crisp violet accents.',
  },
  {
    code: 'tealDark',
    label: 'Teal Dark',
    description: 'Deep teal-black with mint glass and ocean glow.',
  },
  {
    code: 'tealLight',
    label: 'Teal Light',
    description: 'Fresh teal-white with clean emerald accents.',
  },
  ```

- [ ] **Step 2: Verify TypeScript**:

  ```bash
  cd apps/web && npx tsc --noEmit 2>&1 | head -20
  ```

  Expected: no errors. If you see errors about `code` values, confirm Task 1 is complete.

- [ ] **Step 3: Commit**:
  ```bash
  git add apps/web/src/app/settings/SettingsContent.tsx
  git commit -m "feat: add violet and teal theme options to settings picker"
  ```

---

## Task 7: Polish Common.styles.ts

**Files:**

- Modify: `apps/web/src/app/home/components/styles/Common.styles.ts`

- [ ] **Step 1: Update `SectionTitle`** — add `letterSpacing: -0.5`:

  ```ts
  export const SectionTitle = styled(H2, {
    name: 'SectionTitle',
    margin: 0,
    fontSize: '$8',
    fontWeight: '700',
    color: '$color',
    textAlign: 'center',
    letterSpacing: -0.5,
  });
  ```

- [ ] **Step 2: Update `SectionSubtitle`** — lift `opacity` from `0.6` to `0.7`:

  ```ts
  export const SectionSubtitle = styled(Text, {
    name: 'SectionSubtitle',
    fontSize: '$4',
    color: '$color',
    opacity: 0.7,
    textAlign: 'center',
    maxWidth: 600,
    marginHorizontal: 'auto',
  });
  ```

- [ ] **Step 3: Update `SectionContainer`** — increase `paddingVertical` from `'$10'` to `'$12'`:

  ```ts
  export const SectionContainer = styled(Container, {
    name: 'SectionContainer',
    size: 'xl',
    paddingVertical: '$12',
  } as any);
  ```

- [ ] **Step 4: Commit**:
  ```bash
  git add apps/web/src/app/home/components/styles/Common.styles.ts
  git commit -m "style: tighten section title letterSpacing, lift subtitle opacity, increase section padding"
  ```

---

## Task 8: Polish Hero section

**Files:**

- Modify: `apps/web/src/app/home/components/styles/Hero.styles.ts`
- Modify: `apps/web/src/app/home/components/HomeHero.tsx`

- [ ] **Step 1: Update `HeroDescription` opacity** in `Hero.styles.ts` — change `opacity: 0.7` to `opacity: 0.75`:

  ```ts
  export const HeroDescription = styled(Text, {
    name: 'HeroDescription',
    margin: 0,
    maxWidth: 500,
    fontSize: '$4',
    lineHeight: '$5' as any,
    color: '$color',
    opacity: 0.75,
  });
  ```

- [ ] **Step 2: Deepen `HeroCard` shadow** in `HomeHero.tsx` — find the `style` prop on `<HeroCard>` (inside the `cards.map`) and update the `boxShadow` value:

  ```tsx
  style={{
    transform: `rotate(${index * 10 - 10}deg) translate(${index * 20 - 20}px, ${index * -10}px)`,
    zIndex: index,
    boxShadow: `0 28px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.18)`,
  }}
  ```

- [ ] **Step 3: Strengthen `HeroBackground` radial gradient** in `HomeHero.tsx` — find the `style` prop on `<HeroBackground>` and increase the radial opacity from `0.06` to `0.12`:

  ```tsx
  style={{
    background:
      'linear-gradient(to bottom, transparent 0%, var(--background) 100%), radial-gradient(circle at 50% 50%, rgba(90,196,255,0.12) 0%, transparent 50%)',
  }}
  ```

- [ ] **Step 4: Commit**:
  ```bash
  git add apps/web/src/app/home/components/styles/Hero.styles.ts apps/web/src/app/home/components/HomeHero.tsx
  git commit -m "style: deepen hero card shadow, strengthen background radial, lift description opacity"
  ```

---

## Task 9: Polish Games section

**Files:**

- Modify: `apps/web/src/app/home/components/HomeGames.tsx`

Note: `MainGameCard` is a re-export of `GlassCard` from `@arcadeum/ui` — its glass tokens come from the theme and will automatically improve with the new themes. The changes here are additional inline style overrides applied to the `<MainGameCard>` JSX element.

- [ ] **Step 1: Add `boxShadow` inline style to `<MainGameCard>`** — find `<MainGameCard padding="$5" flex={1}>` and add a `style` prop:

  ```tsx
  <MainGameCard
    padding="$5"
    flex={1}
    style={{ boxShadow: '0 20px 50px rgba(0,0,0,0.35)' }}
  >
  ```

- [ ] **Step 2: Increase hover overlay opacity** — find the `<YStack>` hover overlay inside `MainGameCard` (the one with `opacity={0}` and `hoverStyle={{ opacity: 0.05 }}`) and change the hover opacity to `0.08`:

  ```tsx
  <YStack
    position="absolute"
    top={0}
    left={0}
    right={0}
    bottom={0}
    zIndex={0}
    pointerEvents="none"
    opacity={0}
    hoverStyle={{ opacity: 0.08 }}
    style={{ background: game.gradient ?? 'transparent' }}
  />
  ```

- [ ] **Step 3: Commit**:
  ```bash
  git add apps/web/src/app/home/components/HomeGames.tsx
  git commit -m "style: deepen game card shadow, increase hover overlay opacity"
  ```

---

## Task 10: Polish How It Works section

**Files:**

- Modify: `apps/web/src/app/home/components/styles/HowItWorks.styles.ts`
- Modify: `apps/web/src/app/home/components/HomeHowItWorks.tsx`

- [ ] **Step 1: Add glow `boxShadow` to `StepNumber`** in `HowItWorks.styles.ts`:

  ```ts
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
  ```

  Then add `boxShadow` via the `style` prop directly on `<StepNumber>` in `HomeHowItWorks.tsx` (next step) since Tamagui's `boxShadow` prop maps to React Native shadow which doesn't produce CSS `box-shadow`. Use inline style instead.

- [ ] **Step 2: Add `boxShadow` inline style to `<StepNumber>` in `HomeHowItWorks.tsx`** — find `<StepNumber>` in the render and add:

  ```tsx
  <StepNumber style={{ boxShadow: '0 0 20px rgba(87,195,255,0.15), 0 0 0 1px rgba(255,255,255,0.06)' }}>
  ```

  The cyan glow is intentionally hardcoded — Tamagui tokens don't resolve in CSS boxShadow strings. It is subtle enough (0.15 opacity) to be unobtrusive on all 8 themes including light variants.

- [ ] **Step 3: Add `letterSpacing` to `StepTitle`** in `HowItWorks.styles.ts`:

  ```ts
  export const StepTitle = styled(Text, {
    name: 'StepTitle',
    margin: 0,
    fontSize: '$5',
    fontWeight: '600',
    color: '$color',
    letterSpacing: -0.3,
  });
  ```

- [ ] **Step 4: Convert `StepConnector` to inline gradient** — In `HowItWorks.styles.ts`, remove `backgroundColor: '$borderColor'` from `StepConnector` (keep all positioning/sizing props), then in `HomeHowItWorks.tsx` add an inline `style` prop to `<StepConnector>`.

  In `HowItWorks.styles.ts`, update `StepConnector`:

  ```ts
  export const StepConnector = styled(YStack, {
    name: 'StepConnector',
    position: 'absolute',
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
  ```

  In `HomeHowItWorks.tsx`, add inline style to `<StepConnector>`:

  ```tsx
  <StepConnector
    style={{
      background:
        'linear-gradient(to bottom, transparent, rgba(255,255,255,0.15), transparent)',
    }}
  />
  ```

  Note: The gradient direction (`to bottom` on mobile, `to right` on desktop) can't be switched via a single static inline style. Use `to bottom` which works best for the mobile (vertical) connector. On desktop the connector becomes horizontal and the gradient still produces the fade-in/fade-out effect, just rotated 90°.

- [ ] **Step 5: Commit**:
  ```bash
  git add apps/web/src/app/home/components/styles/HowItWorks.styles.ts apps/web/src/app/home/components/HomeHowItWorks.tsx
  git commit -m "style: add step number glow, gradient connector, tighten step title letterSpacing"
  ```

---

## Task 11: Polish Features section

**Files:**

- Modify: `apps/web/src/app/home/components/styles/Features.styles.ts`
- Modify: `apps/web/src/app/home/components/HomeFeatures.tsx`

- [ ] **Step 1: Update `FeatureIcon` in `Features.styles.ts`** — change `backgroundColor` from `'$glassBg'` to a hardcoded `'rgba(255,255,255,0.08)'` (increased opacity from the token's ~0.03):

  ```ts
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
  } as any);
  ```

- [ ] **Step 2: Add `boxShadow` inline style to `<FeatureIcon>` in `HomeFeatures.tsx`** — find every `<FeatureIcon>` usage (inside the `FEATURES.map()`) and add a `style` prop:

  ```tsx
  <FeatureIcon style={{ boxShadow: '0 4px 20px rgba(87,195,255,0.12)' }}>
    <Text>{feature.icon}</Text>
  </FeatureIcon>
  ```

  The cyan glow is intentionally hardcoded (Tamagui tokens don't resolve in CSS `boxShadow` strings). At 0.12 opacity it is unobtrusive on all 8 themes.

- [ ] **Step 2: Increase `FeaturesGrid` gap** — change `gap: '$5'` to `gap: '$6'`:

  ```ts
  export const FeaturesGrid = styled(XStack, {
    name: 'FeaturesGrid',
    flexWrap: 'wrap',
    gap: '$6',
  });
  ```

- [ ] **Step 3: Increase `FeaturesSection` gap** — change `gap: '$8'` to `gap: '$10'`:

  ```ts
  export const FeaturesSection = styled(SectionContainer, {
    name: 'FeaturesSection',
    gap: '$10',
  });
  ```

- [ ] **Step 4: Commit**:
  ```bash
  git add apps/web/src/app/home/components/styles/Features.styles.ts apps/web/src/app/home/components/HomeFeatures.tsx
  git commit -m "style: add feature icon glow, increase features grid and section spacing"
  ```

---

## Task 12: Final verification

- [ ] **Step 1: Full TypeScript check**:

  ```bash
  cd apps/web && npx tsc --noEmit 2>&1
  ```

  Expected: no errors.

- [ ] **Step 2: Start dev server and visually verify**:

  ```bash
  cd apps/web && npm run dev
  ```

  Open http://localhost:3000 and check:

  - Home page loads without errors
  - Navigate to Settings → Appearance — confirm 4 new themes appear: Violet Dark, Violet Light, Teal Dark, Teal Light
  - Select each new theme and confirm the page recolors correctly
  - Confirm home page sections (Hero, Games, How It Works, Features) look visually improved under the existing dark theme
  - Confirm no visual regressions on light / neonDark / neonLight

- [ ] **Step 3: Final commit if any cleanup needed**, otherwise done.
