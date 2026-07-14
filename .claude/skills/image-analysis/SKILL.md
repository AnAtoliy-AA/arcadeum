---
name: image-analysis
description: Extract implementable CSS values and design tokens from reference images. Use when analyzing design references, extracting colors/typography from screenshots, or converting visual designs to code. Trigger on keywords like extract colors, analyze design, reference image, screenshot to code.
---

# Image Analysis

Extract implementable CSS values and design tokens from reference images.

## When to Use

- Analyzing design reference images for implementation
- Extracting color palettes from screenshots
- Identifying typography from visual designs
- Converting design comps to CSS values
- Building design systems from visual references

## Extraction Process

### 1. Color Extraction

From a reference image, identify:

| Element | What to Extract |
|---------|-----------------|
| Background | Page/surface background color |
| Primary | Main brand/accent color |
| Secondary | Supporting colors |
| Text | Primary and secondary text colors |
| Borders | Divider and border colors |
| States | Hover, active, disabled color shifts |

**Tools for extraction:**
- Browser DevTools color picker
- Figma eyedropper
- Coolors.co image palette extraction
- CLI: `colorthief` or similar

### 2. Typography Extraction

From a reference image, identify:

| Element | What to Extract |
|---------|-----------------|
| Font family | Sans-serif, serif, monospace, display |
| Font size | Approximate px values |
| Font weight | Light (300), Regular (400), Medium (500), Bold (700) |
| Line height | Tight (1.2), Normal (1.5), Relaxed (1.75) |
| Letter spacing | Tight, normal, or expanded |
| Case | Uppercase, lowercase, title case |

**Identification tips:**
- Use WhatTheFont or Font Squirrel Matcherator
- Compare against known font libraries
- Check for variable fonts

### 3. Spacing Extraction

From a reference image, identify:

| Element | What to Extract |
|---------|-----------------|
| Margins | Space between elements |
| Padding | Space inside elements |
| Gaps | Space in flex/grid layouts |
| Grid | Column/gutter widths |

**Measurement approach:**
- Use browser ruler extensions
- Compare against known spacing scales (4px, 8px grid)
- Estimate relative to known elements (text size, icon size)

### 4. Shape Extraction

From a reference image, identify:

| Element | What to Extract |
|---------|-----------------|
| Border radius | Corner rounding values |
| Shadows | Drop shadow depth and spread |
| Borders | Width, style, color |
| Gradients | Direction, color stops |

### 5. Layout Extraction

From a reference image, identify:

| Element | What to Extract |
|---------|-----------------|
| Grid system | Columns, gutters, max-width |
| Breakpoints | Mobile, tablet, desktop layouts |
| Alignment | Left, center, right, justified |
| Hierarchy | Visual weight and grouping |

## Conversion to CSS

### Colors

```css
/* Extracted from reference */
:root {
  --color-primary: #2563EB;
  --color-primary-hover: #1D4ED8;
  --color-background: #FFFFFF;
  --color-surface: #F8FAFC;
  --color-text: #0F172A;
  --color-text-secondary: #64748B;
  --color-border: #E2E8F0;
}
```

### Typography

```css
/* Extracted from reference */
.heading-xl {
  font-size: 36px;
  line-height: 40px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.body-base {
  font-size: 16px;
  line-height: 24px;
  font-weight: 400;
  letter-spacing: 0;
}
```

### Spacing

```css
/* Extracted from reference */
.section { padding: 48px 0; }
.card { padding: 24px; }
.stack > * + * { margin-top: 16px; }
```

### Shadows

```css
/* Extracted from reference */
.card {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
              0 2px 4px -2px rgba(0, 0, 0, 0.1);
}
```

## Tamagui Token Mapping

Convert extracted CSS to Tamagui tokens:

```tsx
// Tamagui config
export default {
  tokens: {
    colors: {
      primary: extractedColor,
      background: extractedBg,
    },
    space: {
      sm: extractedSmSpacing,
      md: extractedMdSpacing,
      lg: extractedLgSpacing,
    },
    fontSize: {
      sm: extractedSmSize,
      base: extractedBaseSize,
      lg: extractedLgSize,
    },
  },
}
```

## Checklist

- [ ] Primary colors extracted with hex values
- [ ] Typography identified with sizes and weights
- [ ] Spacing values measured and documented
- [ ] Border radius values noted
- [ ] Shadow styles captured
- [ ] Layout grid system identified
- [ ] Tokens mapped to Tamagui config
