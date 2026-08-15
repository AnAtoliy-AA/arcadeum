---
name: baseline-ui
description: Quickly deslop UI code by fixing spacing, hierarchy, typography, and small layout issues. Use when the interface needs a fast cleanup or polish pass. Trigger on keywords like cleanup, polish, deslop, fix UI, spacing, hierarchy.
---

# Baseline UI

Enforces an opinionated UI baseline to prevent AI-generated interface slop.

## How to Use

- Apply these constraints to any UI work in this conversation
- Review files against all constraints and output violations with fixes

## Stack

- Use plain React elements with Tailwind classes for layout (Tamagui was removed)
- Use `@arcadeum/ui` components before creating new ones
- Use design tokens as CSS variables (`var(--primary)`, `var(--glassBg)`) minted from `packages/ui/src/themeDefinitions.ts` — see `/tailwind-pro` for the token → class map

## Components

- Use accessible component primitives for anything with keyboard or focus behavior
- Use the project's existing component primitives first from `@arcadeum/ui`
- Never mix primitive systems within the same interaction surface
- Add `aria-label` to icon-only buttons
- Never rebuild keyboard or focus behavior by hand unless explicitly requested

## Interaction

- Use `AlertDialog` for destructive or irreversible actions
- Use structural skeletons for loading states
- Never use `h-screen`, use `h-dvh`
- Respect `safe-area-inset` for fixed elements
- Show errors next to where the action happens
- Never block paste in `input` or `textarea` elements

## Animation

- Never add animation unless it is explicitly requested
- Animate only compositor props (`transform`, `opacity`)
- Never animate layout properties (`width`, `height`, `top`, `left`, `margin`, `padding`)
- Avoid animating paint properties (`background`, `color`) except for small, local UI
- Use `ease-out` on entrance
- Never exceed `200ms` for interaction feedback
- Pause looping animations when off-screen
- Respect `prefers-reduced-motion`
- Never introduce custom easing curves unless explicitly requested
- Avoid animating large images or full-screen surfaces

## Typography

- Use `text-balance` for headings and `text-pretty` for body/paragraphs
- Use `tabular-nums` for data
- Use `truncate` or `line-clamp` for dense UI
- Never modify `letter-spacing` unless explicitly requested

## Layout

- Use a fixed `z-index` scale (no arbitrary `z-*`)
- Use `size-*` for square elements instead of `w-*` + `h-*`
- Use 4/8dp spacing rhythm consistently
- Never use horizontal scroll on mobile

## Performance

- Never animate large `blur()` or `backdrop-filter` surfaces
- Never apply `will-change` outside an active animation
- Never use `useEffect` for anything that can be expressed as render logic
- Lazy load below-the-fold content

## Design

- Never use gradients unless explicitly requested
- Never use purple or multicolor gradients
- Never use glow effects as primary affordances
- Use Tamagui shadow scale unless explicitly requested
- Give empty states one clear next action
- Limit accent color usage to one per view
- Use existing theme tokens before introducing new ones
- No emojis as icons — use SVG icons only
