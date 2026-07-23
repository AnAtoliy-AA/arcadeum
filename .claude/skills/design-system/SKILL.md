---
name: design-system
description: Generate and maintain design systems with colors, typography, spacing, and effects. Use when creating or updating a design system, choosing color palettes, or defining typography scales. Trigger on keywords like design system, color palette, typography, tokens, theme.
---

# Design System Skill

Generate complete design systems with reasoning-based recommendations for colors, typography, spacing, and effects.

## When to Use

- Creating a new design system from scratch
- Updating or extending an existing design system
- Choosing color palettes for a product type
- Defining typography scales and font pairings
- Setting up spacing and elevation systems
- Implementing dark mode tokens

## Design System Structure

### Color System

```
colors:
  primary:        #HEX    — Main brand color (CTAs, links, active states)
  primary-light:  #HEX    — Lighter variant (hover, backgrounds)
  primary-dark:   #HEX    — Darker variant (pressed states)
  secondary:      #HEX    — Supporting brand color
  accent:         #HEX    — Highlight color (badges, notifications)

  background:     #HEX    — Page background
  surface:        #HEX    — Card/modal background
  surface-raised: #HEX    — Elevated surface (dropdowns, popovers)
  border:         #HEX    — Default border color
  border-subtle:  #HEX    — Subtle dividers

  text:           #HEX    — Primary text color
  text-secondary: #HEX    — Secondary/muted text
  text-inverse:   #HEX    — Text on colored backgrounds

  success:        #HEX    — Positive actions, confirmations
  warning:        #HEX    — Caution states
  error:          #HEX    — Destructive actions, errors
  info:           #HEX    — Informational states
```

### Typography System

```
fonts:
  heading:  'Inter, sans-serif'    — Or project's heading font
  body:     'Inter, sans-serif'    — Or project's body font
  mono:     'JetBrains Mono, monospace' — Code, data

type-scale:
  xs:     { size: 12px, line-height: 16px }
  sm:     { size: 14px, line-height: 20px }
  base:   { size: 16px, line-height: 24px }
  lg:     { size: 18px, line-height: 28px }
  xl:     { size: 20px, line-height: 28px }
  2xl:    { size: 24px, line-height: 32px }
  3xl:    { size: 30px, line-height: 36px }
  4xl:    { size: 36px, line-height: 40px }
  5xl:    { size: 48px, line-height: 48px }
```

### Spacing System

```
spacing:
  0:   0px
  1:   4px
  2:   8px
  3:   12px
  4:   16px
  5:   20px
  6:   24px
  8:   32px
  10:  40px
  12:  48px
  16:  64px
  20:  80px
```

### Border Radius

```
radius:
  none:  0px
  sm:    4px
  md:    6px
  lg:    8px
  xl:    12px
  2xl:   16px
  full:  9999px
```

### Elevation (Shadows)

```
shadow:
  sm:   0 1px 2px rgba(0,0,0,0.05)
  md:   0 4px 6px -1px rgba(0,0,0,0.1)
  lg:   0 10px 15px -3px rgba(0,0,0,0.1)
  xl:   0 20px 25px -5px rgba(0,0,0,0.1)
```

### Z-Index Scale

```
z-index:
  base:     0
  raised:   10
  dropdown: 20
  sticky:   40
  modal:    100
  toast:    200
  tooltip:  300
```

## Color Palette Recommendations by Product Type

| Product Type | Primary | Secondary | Style |
|--------------|---------|-----------|-------|
| SaaS/B2B | Blue (#2563EB) | Slate (#64748B) | Professional, clean |
| E-commerce | Orange (#F97316) | Gray (#6B7280) | Warm, inviting |
| Healthcare | Teal (#14B8A6) | Blue (#0EA5E9) | Trustworthy, calm |
| Finance | Indigo (#6366F1) | Slate (#475569) | Secure, professional |
| Social | Violet (#8B5CF6) | Pink (#EC4899) | Vibrant, engaging |
| Gaming | Purple (#A855F7) | Cyan (#06B6D4) | Fun, energetic |
| Creative | Rose (#F43F5E) | Amber (#F59E0B) | Bold, expressive |
| Education | Green (#22C55E) | Blue (#3B82F6) | Growth, trust |

## Font Pairing Recommendations

| Style | Heading | Body | Use Case |
|-------|---------|------|----------|
| Professional | Inter | Inter | SaaS, B2B, Enterprise |
| Modern | Plus Jakarta Sans | Inter | Startup, Tech |
| Elegant | Playfair Display | Source Serif Pro | Luxury, Editorial |
| Playful | Poppins | Nunito | Consumer, Social |
| Technical | JetBrains Mono | Inter | Developer tools |
| Friendly | Nunito | Nunito | Education, Health |

## Anti-Patterns

- Never use raw hex values in components — always use tokens
- Never mix font families across the same hierarchy level
- Never use more than 3 font weights per font family
- Never create ad-hoc spacing values — use the spacing scale
- Never use different shadow styles for the same component type
- Never hardcode z-index values — use the z-index scale

## Tamagui Integration

Check `packages/ui/src/tamagui.config.ts` for existing tokens before creating new ones:

```tsx
// Use tokens
<Box padding="$4" backgroundColor="$primary" borderRadius="$lg" />

// Don't hardcode
<Box padding={16} backgroundColor="#2563EB" borderRadius={8} />
```

## Checklist

- [ ] Color tokens defined for all states (default, hover, active, disabled)
- [ ] Typography scale covers all text needs (xs to 5xl)
- [ ] Spacing scale follows 4px grid
- [ ] Border radius is consistent
- [ ] Shadows follow elevation scale
- [ ] Z-index values are documented
- [ ] Dark mode tokens are defined
- [ ] All tokens are accessible (contrast ratios pass WCAG AA)
