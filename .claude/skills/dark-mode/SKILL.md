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

## Tamagui Theme Implementation

### Theme Setup

```tsx
import { Theme, useTheme } from 'tamagui';

// Define themes in tamagui.config.ts
export const themes = {
  light: {
    background: '#FFFFFF',
    surface: '#F8FAFC',
    text: '#0F172A',
    textSecondary: '#64748B',
    border: '#E2E8F0',
    primary: '#2563EB',
    primaryHover: '#1D4ED8',
  },
  dark: {
    background: '#0F172A',
    surface: '#1E293B',
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    border: '#334155',
    primary: '#60A5FA',
    primaryHover: '#93C5FD',
  },
};

// App wrapper
<ThemeProvider>
  <Theme name={isDark ? 'dark' : 'light'}>
    <App />
  </Theme>
</ThemeProvider>
```

### Using Tokens in Components

```tsx
import { YStack, Text, styled } from 'tamagui';

const Card = styled(YStack, {
  backgroundColor: '$surface',
  borderColor: '$border',
  borderWidth: 1,
  borderRadius: '$lg',
  padding: '$4',
});

const Heading = styled(Text, {
  color: '$text',
  fontSize: '$2xl',
  fontWeight: '700',
});

const Body = styled(Text, {
  color: '$textSecondary',
  fontSize: '$base',
  lineHeight: '$base',
});
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
import { useTheme } from 'tamagui';
import { useCallback } from 'react';

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);

  return (
    <Button onPress={toggleTheme}>
      {theme === 'light' ? '🌙' : '☀️'}
    </Button>
  );
};
```

### Theme-Aware Card

```tsx
const ThemedCard = ({ children }) => {
  const theme = useTheme();

  return (
    <YStack
      backgroundColor={theme.surface}
      borderColor={theme.border}
      borderWidth={1}
      borderRadius="$lg"
      padding="$4"
    >
      {children}
    </YStack>
  );
};
```

### Theme-Aware Input

```tsx
const ThemedInput = ({ error, ...props }) => {
  const theme = useTheme();

  return (
    <Input
      backgroundColor={theme.surface}
      borderColor={error ? theme.error : theme.border}
      color={theme.text}
      placeholderTextColor={theme.textSecondary}
      {...props}
    />
  );
};
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
<Stack borderColor="#E2E8F0" /> // Invisible in dark

// Good
<Stack borderColor="$border" /> // Adapts to theme
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

// Good
<View style={{ backgroundColor: theme.background }} />
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
