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

A plain React component (not a Tamagui styled component) that renders a `<div>` with inline styles. Replaces `CardEmoji` in all card contexts.

**Props:**
```ts
interface CardImageProps {
  variant: string;        // e.g. 'cyberpunk', 'crime'
  cardType: string;       // e.g. 'strike', 'cancel'
  faceDown?: boolean;     // true → use sprite index 0 (card back)
}
```

**Sprite index resolution:**
```ts
import { CARD_SPRITE_MAP } from '../styles/card-sprites';
const spriteIndex = faceDown ? 0 : (CARD_SPRITE_MAP[cardType] ?? 0);
```
`CARD_SPRITE_MAP` is already defined in `styles/card-sprites.ts` and maps all 39 card type strings to positions 1–39. Any unmapped card type falls back to index 0 (card back).

**Sprite URL resolution:**
```ts
const spriteUrl = getVariantStyles(variant).cards.getCardSpriteUrl?.(variant);
```
`getCardSpriteUrl` signature in `VariantStyleConfig.cards`: `(variant?: string) => string | undefined`. The base implementation in `base.ts` already handles crime/horror/adventure via the variant argument. Cyberpunk, underwater, and high-altitude-hike override this in their own config files and return their URL directly. New variant files (crime.ts, horror.ts, adventure.ts) follow the same override pattern — return the URL directly without using the argument. If `spriteUrl` is undefined (default variant), `CardImage` renders nothing — the card shows only the gradient scrim and name label.

**CSS rendering:**
```ts
const col = spriteIndex % 7;
const row = Math.floor(spriteIndex / 7);
const style = {
  position: 'absolute' as const,
  inset: 0,
  borderRadius: 'inherit',
  backgroundImage: `url(${spriteUrl})`,
  backgroundSize: '1197px 1197px',
  backgroundPosition: `-${col * 171}px -${row * 171}px`,
  backgroundRepeat: 'no-repeat',
};
```

**New file:** `styles/card-image.tsx`

---

### Card layout (HandCard, DeckCard, LastPlayedCard, StashedCard)

All four card components get the same layered structure inside their `CardInner` (or direct children):

1. `<CardImage variant={cardVariant} cardType={card} />` — absolute background, renders sprite art
2. Gradient scrim `<div>`: `position: absolute; bottom: 0; left: 0; right: 0; height: 40%; background: linear-gradient(transparent, rgba(0,0,0,0.85)); pointer-events: none; z-index: 1`
3. Card name `<Text>` absolutely at bottom, `z-index: 2`, colored by variant primary
4. `CardEmoji` removed from all card renders

**`StashedCard`** currently has no `$variant` variant handler in `cards.tsx`. Add one (same pattern as `HandCard`). Also update `StashedCard` render in `PlayerHand.tsx` to use `CardImage` + gradient scrim + name, removing `CardEmoji` there too.

**`DeckCard`** (face-down): use `<CardImage variant={cardVariant} faceDown />` to show the card-back sprite (index 0). The existing `getDeckBackground` / `getDeckBorder` functions in `VariantStyleConfig.cards` are **deprecated** — remove them from all variant configs and from the `DeckCard.$variant` handler. Border color for `DeckCard` is supplied directly by `getDeckBorder` being replaced with a `borderColor` field in the variant cards config.

**Hover glow:** Add `getHoverGlow(): string` to `VariantStyleConfig.cards` type. Each variant returns a `box-shadow` string (e.g. `'0 0 24px #06b6d4cc'`). Apply in `HandCard.$variant` handler:
```ts
$variant: (val: string) => {
  const config = getVariantStyles(val).cards;
  return {
    ...config.getCardStyles?.(),
    hoverStyle: { scale: 1.05, boxShadow: config.getHoverGlow?.() },
  };
},
```
This replaces the base `Card` hoverStyle `elevation: 8` for styled variants. The base `Card` keeps its default hoverStyle; only variant-styled cards override it.

---

## Card Flip Animation

When the local player draws a card (hand gains a new card type they did not previously hold), that card plays a CSS 3D flip reveal.

### `useCardFlip` hook

**Input:** `currentHand: CriticalCard[]`
**Output:** `{ flippingCardType: CriticalCard | null }`

**Rules:**
- Tracks `previousGroupedTypes: Set<CriticalCard>` via `useRef` — the set of distinct card types in the previous render
- On each render, computes `currentGroupedTypes` from `currentHand`
- If exactly one new card type appears in `currentGroupedTypes` that was not in `previousGroupedTypes`: set `flippingCardType` to that card type for 600ms then clear it
- If zero or more-than-one new card types appear: no flip (bulk draw, combo result, or no change)
- If player already holds 2 `strike` and draws a 3rd: `strike` is already in `previousGroupedTypes`, count increases but no new type → no flip (the rendered `HandCard` for `strike` already exists)
- Only active for local player's hand — not passed to spectator views

**Hook file:** `hooks/useCardFlip.ts`

### CSS prerequisites and animation

In `PlayerHand.tsx`, wrap each `HandCard` in a plain `<div>` element:
```tsx
<div
  key={id}
  style={
    card === flippingCardType
      ? { perspective: '600px' }
      : undefined
  }
>
  <HandCard
    style={
      card === flippingCardType
        ? { transformStyle: 'preserve-3d', animation: 'cardFlip 600ms ease-in-out' }
        : undefined
    }
    ...
  />
</div>
```

The `<div>` wrapper provides `perspective`; the `HandCard` element itself gets `transform-style: preserve-3d` and the keyframe animation. This avoids Tamagui transform normalization issues.

**Sprite swap at midpoint:** Use a `setTimeout(300)` inside `useCardFlip` to flip an internal `showBack` boolean from `true` → `false` at the animation midpoint. While `showBack` is true, `CardImage` receives `faceDown={true}` (shows card back); after the timeout it receives `faceDown={false}` (shows card front). The 600ms timer clears `flippingCardType`.

**`@keyframes cardFlip` definition** (in `ParticleOverlay.module.css` or a shared CSS module):
```css
@keyframes cardFlip {
  0%   { transform: rotateY(0deg); }
  45%  { transform: rotateY(90deg); }
  55%  { transform: rotateY(90deg); }
  100% { transform: rotateY(0deg); }
}
```

### Coexistence with `LastPlayedCard.$isAnimating`

`LastPlayedCard.$isAnimating` (existing Tamagui variant, sets `rotateY: '180deg'`) is on a separate component in `CenterTableSection` (discard pile). `useCardFlip` only applies to `HandCard` inside `PlayerHand`. No conflict.

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

### `VariantStyleConfig.cards` additions

Add to the `cards` section of the type in `variants/types.ts`:
- `getHoverGlow?: () => string` — box-shadow string for card hover
- `getCardNameColor?: () => string` — color for the name label overlay
- Remove `getDeckBackground` and `getDeckBorder` (deprecated in favour of `CardImage` + `borderColor` field)

### New style files

`crime.ts`, `horror.ts`, `adventure.ts` each export a full `VariantStyleConfig`. They follow the cyberpunk pattern: `getCardSpriteUrl` returns the URL directly (`'/images/cards/crime_sprites.png'` etc.) without using the argument. All three are registered in `variants/index.ts`.

### `constants.ts` change

Remove `disabled: true` from the crime, horror, and adventure entries in `CARD_VARIANTS`. All three entries already exist — no new constants are added.

---

## Ambient Particle Overlay

**Component:** `ui/ParticleOverlay.tsx`
**CSS:** `ui/ParticleOverlay.module.css`

Particle elements are rendered as React children (`<span>` divs), **not** via CSS `::before`/`::after` on spans (pseudo-elements are not viable on dynamically rendered React elements). Keyframe animations and per-particle styles are defined in the CSS module.

**Stacking context isolation:** In `ActiveGameContent.tsx`, wrap `ParticleOverlay` in:
```tsx
<div style={{ position: 'absolute', inset: 0, isolation: 'isolate', pointerEvents: 'none', zIndex: 0 }}>
  <ParticleOverlay variant={cardVariant} />
</div>
```
`isolation: isolate` creates a new stacking context. All z-indices inside this wrapper are scoped to it and cannot affect `LastPlayedCard` (z-index: 10), `ActionButtons` (z-index: 50), or other siblings.

**ParticleOverlay base styles (from CSS module):**
```css
.overlay {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}
```

### Per-variant effects

| Variant | Effect | Elements |
|---|---|---|
| cyberpunk | Horizontal scanline flicker | 1 `<div>` full-width, `repeating-linear-gradient` + opacity keyframe at 2s loop |
| underwater | Floating bubble dots | 10 `<span>`, `border-radius: 50%`, staggered `animation-delay`, `translateY(-100vh)` + opacity keyframe |
| crime | Vertical rain streaks | 15 `<span>`, 1px wide, varied heights/positions, `translateY(100%)` keyframe, staggered delays |
| horror | Flickering radial vignette | 1 `<div>` with `radial-gradient` from edges, opacity flicker keyframe (irregular timing) |
| adventure | Floating golden dust motes | 8 `<span>`, 3–6px circles, random absolute positions, slow float + opacity fade |
| high-altitude-hike | Drifting snow | 12 `<span>`, 2–4px circles, slow drift with slight horizontal sway via `translateX` + `translateY` keyframe |

`ParticleOverlay` accepts a `variant` prop and renders the appropriate element set. Non-matching variants render `null`.

---

## Files Changed

### New files
- `apps/web/src/widgets/CriticalGame/ui/styles/card-image.tsx` — `CardImage` component
- `apps/web/src/widgets/CriticalGame/ui/ParticleOverlay.tsx` — ambient overlay component
- `apps/web/src/widgets/CriticalGame/ui/ParticleOverlay.module.css` — keyframes + particle classes
- `apps/web/src/widgets/CriticalGame/ui/styles/variants/crime.ts`
- `apps/web/src/widgets/CriticalGame/ui/styles/variants/horror.ts`
- `apps/web/src/widgets/CriticalGame/ui/styles/variants/adventure.ts`
- `apps/web/src/widgets/CriticalGame/hooks/useCardFlip.ts`

### Modified files
- `apps/web/src/widgets/CriticalGame/ui/styles/variants/types.ts` — add `getHoverGlow`, `getCardNameColor` to cards type; remove `getDeckBackground`, `getDeckBorder`
- `apps/web/src/widgets/CriticalGame/ui/styles/variants/base.ts` — remove `getDeckBackground`, `getDeckBorder`; add `getHoverGlow`, `getCardNameColor` defaults
- `apps/web/src/widgets/CriticalGame/ui/styles/variants/index.ts` — register crime, horror, adventure
- `apps/web/src/widgets/CriticalGame/ui/styles/cards-base.tsx` — add gradient scrim absolute div, card name overlay Text; update base Card to include CardImage slot
- `apps/web/src/widgets/CriticalGame/ui/styles/cards.tsx` — update `HandCard.$variant` with hover glow; update `DeckCard.$variant` (remove `getDeckBackground`/`getDeckBorder` calls); add `$variant` handler to `StashedCard`
- `apps/web/src/widgets/CriticalGame/ui/styles/players-hand.tsx` — update `HandCard.$variant` hoverStyle
- `apps/web/src/widgets/CriticalGame/ui/DeckDisplay.tsx` — use `<CardImage faceDown />` for face-down deck
- `apps/web/src/widgets/CriticalGame/ui/PlayerHand.tsx` — remove `CardEmoji`; add `<div>` wrapper per card with perspective/flip animation; add `CardImage` to both `HandCard` and `StashedCard` renders; wire `useCardFlip`
- `apps/web/src/widgets/CriticalGame/ui/ActiveGameContent.tsx` — add isolated `ParticleOverlay` wrapper
- `apps/web/src/widgets/CriticalGame/lib/constants.ts` — remove `disabled: true` from crime, horror, adventure

---

## Out of Scope

- Game logic, state hooks, server communication
- Modal system changes
- Chat system changes
- Canvas or JS particle libraries
- Mobile-specific layout changes
- New card types or game rules
