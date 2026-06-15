---
name: a11y
description: Use when implementing or reviewing accessibility (a11y) — ARIA attributes, keyboard navigation, focus management, color contrast, screen reader support, semantic HTML, form labels, error handling, or any WCAG compliance task. Trigger on keywords like a11y, accessibility, ARIA, keyboard, focus, screen reader, WCAG, contrast, VoiceOver, NVDA.
---

# Accessibility Skill

## Core Principles

- **Perceivable**: All content must be presentable in ways users can perceive (alt text, captions, contrast).
- **Operable**: All UI must be operable via keyboard, pointer, and assistive tech.
- **Understandable**: Content and UI behavior must be predictable.
- **Robust**: Content must be interpreted reliably by a wide variety of user agents and assistive technologies.

## Semantic HTML First

Use native HTML elements before reaching for ARIA. Native elements carry built-in semantics:

```html
<!-- Good -->
<button onClick={handler}>Submit</button>
<nav aria-label="Main">...</nav>
<a href="/about">About</a>

<!-- Bad -->
<div onClick={handler}>Submit</div>
<div class="nav">...</div>
<span onClick={navigate('/about')}>About</span>
```

Use this mapping:
| Need | Element |
|---|---|
| Clickable action | `<button>` |
| Navigation link | `<a>` |
| Navigation group | `<nav>` |
| Page sections | `<header>`, `<main>`, `<footer>`, `<aside>` |
| Content grouping | `<article>`, `<section>`, `<fieldset>` |
| List items | `<ul>`, `<ol>`, `<li>` |
| Table data | `<table>`, `<thead>`, `<tbody>`, `<th scope>` |

## ARIA Usage

Rule: **No ARIA is better than bad ARIA.**

```html
<!-- Accessible name: visible label preferred -->
<button>Add to cart</button>

<!-- When no visible label, use aria-label -->
<button aria-label="Close dialog">×</button>

<!-- Live regions for dynamic updates -->
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>

<!-- Hidden decorative content -->
<svg aria-hidden="true" focusable="false">...</svg>

<!-- Group related controls -->
<fieldset>
  <legend>Shipping address</legend>
  ...
</fieldset>
```

Common patterns:
- `aria-expanded` on trigger buttons for disclosures/dropdowns.
- `aria-current="page"` on the active nav link.
- `aria-describedby` to link helper text or error messages to inputs.
- `aria-invalid="true"` + `aria-errormessage` on invalid form fields.
- `role="alert"` or `aria-live="assertive"` only for urgent errors (not informational).
- `aria-hidden="true"` on elements that are purely visual (icons, decorative images).

## Keyboard Navigation

- All interactive elements must be reachable and operable via `Tab`, `Shift+Tab`, `Enter`, `Space`, `Arrow` keys.
- **Tab order** must match visual order. Avoid positive `tabindex` (use `tabindex="0"` or `tabindex="-1"` only).
- Implement **focus trapping** in modals/dialogs:
  - `Tab` cycles through focusable elements inside the dialog.
  - `Escape` closes the dialog and returns focus to the trigger.
- **Skip link** as the first focusable element on the page:
  ```html
  <a href="#main-content" class="skip-link">Skip to content</a>
  ```

## Focus Management

```css
/* Visible focus indicators — never use outline: none without replacement */
:focus-visible {
  outline: 2px solid #005fcc;
  outline-offset: 2px;
}
```

Rules:
- Never remove focus outlines without providing an alternative visible indicator.
- On route changes in SPAs, move focus to the new page heading or announce the change via `aria-live`.
- After closing a modal, return focus to the element that triggered it.
- When content appears dynamically, move focus to it or announce it.

## Forms

```html
<label for="email">Email address</label>
<input
  id="email"
  type="email"
  required
  aria-describedby="email-hint email-error"
  aria-invalid={hasError}
/>
<span id="email-hint">We'll never share your email.</span>
<span id="email-error" role="alert">Please enter a valid email.</span>
```

Rules:
- Every input must have an associated `<label>` (visible or `aria-label`).
- Group related inputs with `<fieldset>` + `<legend>`.
- Error messages must be programmatically associated via `aria-describedby`.
- Use `role="alert"` on error containers so screen readers announce them.
- Required fields: use `required` attribute + visually convey (not color alone).

## Color & Contrast

- **Normal text**: minimum 4.5:1 contrast ratio (WCAG AA).
- **Large text** (≥18px or ≥14px bold): minimum 3:1.
- **UI components/icons**: minimum 3:1 against adjacent colors.
- Never convey information through color alone. Use icons, text, or patterns as secondary indicators.
- Test with simulated color blindness (protanopia, deuteranopia, tritanopia).

## Images & Media

```html
<!-- Informative image -->
<img src="chart.png" alt="Revenue grew 40% from Q1 to Q2 2026." />

<!-- Decorative image -->
<img src="divider.png" alt="" role="presentation" />

<!-- Complex image (chart, diagram) -->
<figure>
  <img src="chart.png" alt="Revenue chart showing growth trend." />
  <figcaption>Detailed data in the table below.</figcaption>
</figure>

<!-- Video -->
<video controls>
  <source src="demo.mp4" type="video/mp4" />
  <track kind="captions" src="captions.vtt" srclang="en" label="English" />
</video>
```

Rules:
- `alt` text should convey the image's purpose, not describe pixels.
- Complex images: provide `alt` summary + long description nearby.
- Videos: include captions (`<track>`) and transcript.
- Avoid text in images (breaks translation, screen readers, and scaling).

## Motion & Animation

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- Respect `prefers-reduced-motion`. Provide non-animated alternatives.
- No content should flash more than 3 times per second.
- Auto-playing media must be pauseable/stopable.

## Testing Checklist

- [ ] All pages navigable via keyboard only
- [ ] Visible focus indicator on every interactive element
- [ ] Tab order is logical and matches visual layout
- [ ] Screen reader announces all meaningful content and state changes
- [ ] All form inputs have labels; errors are associated and announced
- [ ] Color contrast passes WCAG AA (4.5:1 text, 3:1 large text/UI)
- [ ] All images have appropriate `alt` text
- [ ] `prefers-reduced-motion` is respected
- [ ] Modals trap focus and restore it on close
- [ ] Skip link present and functional
- [ ] No auto-playing audio/video
- [ ] Passes axe-core / Lighthouse Accessibility audit (score ≥ 95)
