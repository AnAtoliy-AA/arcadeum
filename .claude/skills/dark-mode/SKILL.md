---
name: dark-mode
description: Implement dark mode with proper color tokens, contrast ratios, and platform-specific patterns. Use when adding dark mode support, fixing dark mode issues, or designing for both themes. Trigger on keywords like dark mode, theme, light theme, dark theme, color scheme.
---

# Dark Mode Skill

Implement dark mode with proper color tokens, contrast ratios, and platform-specific patterns.

## When to Use

- Adding dark mode support to an app
- Fixing contrast issues in dark mode
- Designing theme-aware components
- Implementing theme switching
- Ensuring accessibility in both modes

## Core Principles

1. **Don't invert** — Dark mode is not inverted light mode
2. **Reduce saturation** — Colors should be desaturated in dark mode
3. **Test contrast** — Verify contrast ratios separately for each theme
4. **Use tokens** — Never hardcode colors, always use semantic tokens

## Color System

### Semantic Tokens

```tsx
// Light mode
const lightTokens = {
  background: '#FFFFFF',
  surface: '#F8FAFC',
  surfaceRaised: '#F1F5F9',
  border: '#E2E8F0',
  text: '#0F172A',
  textSecondary: '#64748B',
};

// Dark mode
const darkTokens = {
  background: '#0F172A',
  surface: '#1E293B',
  surfaceRaised: '#334155',
  border: '#334155',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
};
```

### Accent Colors

| Color | Light | Dark | Notes |
|-------|-------|------|-------|
| Primary | `#2563EB` | `#60A5FA` | Lighter in dark mode |
| Success | `#22C55E` | `#4ADE80` | Lighter in dark mode |
| Warning | `#F59E0B` | `#FBBF24` | Slightly lighter |
| Error | `#EF4444` | `#F87171` | Lighter in dark mode |
| Info | `#0EA5E9` | `#38BDF8` | Lighter in dark mode |

### Why Lighter in Dark Mode?

- Pure saturated colors vibrate against dark backgrounds
- Lighter variants reduce eye strain
- Maintain WCAG contrast ratios (4.5:1 for text)

## Theme Implementation (CSS Variables)

### Theme Setup

```tsx
// Token maps live in packages/ui/src/themeDefinitions.ts. AppThemeProvider
// (apps/web/src/app/theme/ThemeContext.tsx) mints each key as a CSS variable
// on <html> (`--<key>` and `--color-<key>`), plus the layout aliases
// --background / --foreground / --muted-foreground / --glassBg /
// --glassBorder. Theme switching works by swapping the `data-theme`
// attribute on <html>; Tailwind classes stay identical.
//
// Minted tokens include: --background, --foreground, --muted-foreground,
// --primary, --color, --textSecondary, --borderColor, --backgroundHover,
// --glassBg, --glassBorder, --error, --success, --warning, --info, --accent.
// NOT minted: --border, --surface, --text — always use the real names above.

// App wrapper (from apps/web/src/app/theme/ThemeContext.tsx)
<AppThemeProvider initialTheme="dark">
  <App />
</AppThemeProvider>
```

### Using Tokens in Components

```tsx
// Tailwind classes read the CSS variables (var(--x)) minted from the token maps
const Card = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`box-border rounded-lg border border-[var(--borderColor)] bg-[var(--glassBg)] p-4 ${className ?? ''}`}
    {...props}
  />
);

const Heading = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h2 className={`text-[24px] font-bold text-[var(--color)] ${className ?? ''}`} {...props} />
);

const Body = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={`text-[16px] leading-[24px] text-[var(--textSecondary)] ${className ?? ''}`} {...props} />
);
```

## Contrast Requirements

### WCAG AA Standards

| Element | Minimum Ratio | Example |
|---------|---------------|---------|
| Normal text (< 18px) | 4.5:1 | Body text |
| Large text (≥ 18px or ≥ 14px bold) | 3:1 | Headings |
| UI components | 3:1 | Icons, borders |
| Focus indicators | 3:1 | Focus rings |

### Testing Contrast

```tsx
// Use a contrast checker tool
// Or calculate programmatically

function getContrastRatio(color1: string, color2: string): number {
  // Implementation for contrast calculation
  // Returns ratio like 4.5, 7.0, etc.
}
```

## Component Patterns

### Theme Toggle

```tsx
import { useCallback } from 'react';
import { useThemeController } from '@/app/theme/ThemeContext';

const ThemeToggle = () => {
  const { resolvedTheme, setThemePreference } = useThemeController();

  const toggleTheme = useCallback(() => {
    setThemePreference(resolvedTheme === 'light' ? 'dark' : 'light');
  }, [resolvedTheme, setThemePreference]);

  return (
    <button type="button" onClick={toggleTheme}>
      {resolvedTheme === 'light' ? '🌙' : '☀️'}
    </button>
  );
};
```

### Theme-Aware Card

```tsx
const ThemedCard = ({ children }) => (
  <div className="box-border rounded-2xl border border-[var(--borderColor)] bg-[var(--glassBg)] p-4">
    {children}
  </div>
);
```

### Theme-Aware Input

```tsx
// @arcadeum/ui Input is already theme-aware: bg-[var(--background)],
// text-[var(--color)] and the `error` prop swap the border to
// border-[var(--error)] (see packages/ui/src/utils/fieldClasses.ts).
// No custom theming needed.
const ThemedInput = ({ error, ...props }) => (
  <Input error={error} {...props} />
);
```

## Common Dark Mode Issues

### 1. Text Contrast Too Low

**Problem:** Light gray text on dark background
**Solution:** Use lighter text colors in dark mode

```tsx
// Bad
<Text color="#94A3B8">Low contrast text</Text>

// Good
<Text color="#CBD5E1">Better contrast text</Text>
```

### 2. Borders Disappear

**Problem:** Light borders invisible on dark backgrounds
**Solution:** Use lighter border colors in dark mode

```tsx
// Bad
<div className="border border-[#E2E8F0]" /> // Invisible in dark

// Good
<div className="border border-[var(--borderColor)]" /> // Adapts to theme
```

### 3. Shadows Too Dark

**Problem:** Dark shadows invisible on dark backgrounds
**Solution:** Use lighter, more diffuse shadows in dark mode

```tsx
// Light mode shadow
{ shadowColor: '#000', shadowOpacity: 0.1 }

// Dark mode shadow
{ shadowColor: '#000', shadowOpacity: 0.3 }
```

### 4. Images Too Bright

**Problem:** Photos appear too bright in dark mode
**Solution:** Reduce brightness or add overlay

```tsx
<Image
  source={image}
  style={{ opacity: 0.9 }}
  // Or use a dark overlay
/>
```

### 5. Hardcoded Colors

**Problem:** Components use hardcoded colors
**Solution:** Always use theme tokens

```tsx
// Bad
<View style={{ backgroundColor: '#FFFFFF' }} />

// Good (mobile: useThemedStyles palette)
const styles = useThemedStyles((palette) =>
  StyleSheet.create({ surface: { backgroundColor: palette.background } }),
);
```

## Accessibility Checklist

- [ ] Primary text contrast ≥ 4.5:1 in both modes
- [ ] Secondary text contrast ≥ 3:1 in both modes
- [ ] Interactive elements have 3:1 contrast
- [ ] Focus indicators visible in both modes
- [ ] Error states readable in both modes
- [ ] Disabled states visible in both modes
- [ ] Borders/dividers visible in both modes
- [ ] Images have appropriate contrast
- [ ] Icons have sufficient contrast
- [ ] Charts/graphs accessible in both modes

## Implementation Checklist

- [ ] Semantic color tokens defined for both themes
- [ ] Accent colors lightened for dark mode
- [ ] All components use theme tokens
- [ ] No hardcoded colors remain
- [ ] Theme toggle implemented
- [ ] System preference detection (auto mode)
- [ ] Theme persists across sessions
- [ ] Contrast ratios verified for both modes
- [ ] Focus states work in both modes
- [ ] Error states readable in both modes
