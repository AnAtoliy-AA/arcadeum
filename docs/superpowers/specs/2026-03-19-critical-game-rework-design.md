# CriticalGame Widget Rework — Design Spec

**Date:** 2026-03-19
**Branch:** ARC-425
**Scope:** Visual rework of the CriticalGame widget — sprite-based card art, full variant theming for all 6 variants, CSS animated ambient effects, and card flip animation on draw.

---

## Overview

Replace emoji-based card display with sprite-sheet card art. Add complete variant-specific styling (backgrounds, borders, glows, ambient animations) for all 6 game variants. Add a CSS card-flip animation when a card is drawn.

No changes to game logic, state management, modals, chat, or server communication.

---

## Card Component

### CardImage (new primitive)

Replaces `CardEmoji` in all card contexts. Renders the correct tile from the variant's sprite sheet.

**Sprite sheet spec:**
- File: `/images/cards/{variant}_sprites.png`
- Grid: 7×7 tiles, each 171×171px, total 1197×1197px
- Position 0: card back (face-down)
- Positions 1–39: card fronts mapped via `CARD_SPRITE_MAP`

**CSS rendering:**
```css
background-image: url(/images/cards/{variant}_sprites.png);
background-size: 1197px 1197px;
background-position: -{col * 171}px -{row * 171}px;
width: 100%;
height: 100%;
position: absolute;
top: 0; left: 0;
```

Where `col = spriteIndex % 7`, `row = Math.floor(spriteIndex / 7)`.

### Card layout (HandCard, DeckCard, LastPlayedCard, StashedCard)

- Full-bleed `CardImage` as absolute background layer
- Dark gradient scrim overlay at bottom 40%: `linear-gradient(transparent, rgba(0,0,0,0.85))`
- Card name in styled text at bottom, colored by variant primary color
- `CardEmoji` removed from all card renders
- `DeckCard` (face-down) uses sprite index 0 with variant border styling

**Hover effect:** scale(1.05) + variant-colored `box-shadow` glow

**New file:** `styles/card-image.tsx`

---

## Card Flip Animation

When a card is drawn, the newly added card plays a CSS flip reveal:

1. Starts showing card-back sprite (index 0), rotateY(0deg)
2. Flips to rotateY(90deg) — card disappears mid-flip
3. Sprite switches to the actual card front
4. Completes to rotateY(0deg) — card front visible

**Hook:** `useCardFlip` — tracks previous hand length, identifies new card, sets a `isFlipping` flag for ~600ms.

**Applied in:** `PlayerHand` — the most recently added card gets the `isFlipping` class.

**Implementation:** Pure CSS `@keyframes` + `transition`, no JS animation library.

---

## Variant Style System

### Variants

| Variant | Primary | Background | Status |
|---|---|---|---|
| cyberpunk | `#06b6d4` cyan | `#0f0518` deep purple | existing (enhanced) |
| underwater | `#22d3ee` teal | `#040b15` dark navy | existing (enhanced) |
| high-altitude-hike | `#7dd3fc` sky | `#020617` midnight | existing (enhanced) |
| crime | `#dc2626` red | `#18181b` charcoal | **new** |
| horror | `#10b981` green | `#020617` near-black | **new** |
| adventure | `#f59e0b` amber | `#451a03` dark brown | **new** |

### Per-variant style config covers

- Card border color + corner glow
- Card name label color
- Card back sprite border
- Game container background gradient
- Table section background/border
- Ambient overlay animation type

### New style files

- `styles/variants/crime.ts`
- `styles/variants/horror.ts`
- `styles/variants/adventure.ts`

---

## Ambient Particle Overlay

**Component:** `ui/ParticleOverlay.tsx`

A positioned overlay inside the game container. Pure CSS animations, no canvas or external libraries. Renders variant-specific ambient effects:

| Variant | Effect | Implementation |
|---|---|---|
| cyberpunk | Horizontal scanline flicker | Animated pseudo-element, opacity pulse |
| underwater | Floating bubble dots | 8–12 `::before` spans, float upward keyframes |
| crime | Vertical rain streaks | Thin diagonal lines, translateY animation |
| horror | Flickering vignette | Radial gradient opacity flicker keyframes |
| adventure | Floating golden dust motes | Small dots, random float paths |
| high-altitude-hike | Drifting snow dots | Small dots, slow drift + fade |

Overlay is `pointer-events: none`, `position: absolute`, `inset: 0`, `z-index: 1`. Game content renders above it at `z-index: 2`.

---

## Files Changed

### New files
- `apps/web/src/widgets/CriticalGame/ui/styles/card-image.tsx`
- `apps/web/src/widgets/CriticalGame/ui/ParticleOverlay.tsx`
- `apps/web/src/widgets/CriticalGame/ui/styles/variants/crime.ts`
- `apps/web/src/widgets/CriticalGame/ui/styles/variants/horror.ts`
- `apps/web/src/widgets/CriticalGame/ui/styles/variants/adventure.ts`
- `apps/web/src/widgets/CriticalGame/hooks/useCardFlip.ts`

### Modified files
- `apps/web/src/widgets/CriticalGame/ui/styles/cards-base.tsx` — add gradient scrim, CardImage integration
- `apps/web/src/widgets/CriticalGame/ui/styles/cards.tsx` — update HandCard, DeckCard, LastPlayedCard, StashedCard
- `apps/web/src/widgets/CriticalGame/ui/styles/variants/index.ts` — register crime, horror, adventure
- `apps/web/src/widgets/CriticalGame/ui/styles/layout.tsx` — variant game background styles
- `apps/web/src/widgets/CriticalGame/ui/DeckDisplay.tsx` — use card-back sprite
- `apps/web/src/widgets/CriticalGame/ui/PlayerHand.tsx` — remove CardEmoji, use CardImage, useCardFlip
- `apps/web/src/widgets/CriticalGame/ui/ActiveGameContent.tsx` — add ParticleOverlay
- `apps/web/src/widgets/CriticalGame/lib/constants.ts` — enable crime, horror, adventure variants

---

## Out of Scope

- Game logic, state hooks, server communication
- Modal system changes
- Chat system changes
- Canvas or JS particle libraries
- Mobile-specific layout changes
- New card types or game rules
