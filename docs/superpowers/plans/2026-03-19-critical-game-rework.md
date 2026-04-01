# CriticalGame Widget Rework Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace emoji card art with sprite-sheet images, add full variant theming for all 6 variants (crime/horror/adventure now enabled), CSS card-flip animation on draw, and per-variant ambient particle overlay.

**Architecture:** New `CardImage` component renders sprite-sheet frames as CSS background-position. `useCardFlip` hook detects new hand card types and triggers a 600ms CSS 3D flip. `ParticleOverlay` renders React `<span>` elements animated by a CSS module; the `@keyframes cardFlip` used by `PlayerHand` is declared globally via `:global { }` in the CSS module (prevents Next.js name-hashing). New variant files (crime, horror, adventure) are `Partial<VariantStyleConfig>` and are merged with an explicit `cards` spread in `index.ts` to avoid clobbering the base `cards` object.

**Tech Stack:** React, Tamagui (styled components), CSS Modules with `:global` (Next.js), TypeScript.

**Spec:** `docs/superpowers/specs/2026-03-19-critical-game-rework-design.md`

---

## File Map

### New Files
| File | Responsibility |
|------|---------------|
| `apps/web/src/widgets/CriticalGame/ui/styles/card-image.tsx` | `CardImage` component — renders sprite frame as CSS background |
| `apps/web/src/widgets/CriticalGame/ui/styles/variants/crime.ts` | Crime variant cards config (red/charcoal theme) |
| `apps/web/src/widgets/CriticalGame/ui/styles/variants/horror.ts` | Horror variant cards config (green/near-black theme) |
| `apps/web/src/widgets/CriticalGame/ui/styles/variants/adventure.ts` | Adventure variant cards config (amber/dark-brown theme) |
| `apps/web/src/widgets/CriticalGame/hooks/useCardFlip.ts` | Hook — detects new hand card type, triggers 600ms flip |
| `apps/web/src/widgets/CriticalGame/ui/ParticleOverlay.tsx` | Per-variant ambient particle component |
| `apps/web/src/widgets/CriticalGame/ui/ParticleOverlay.module.css` | Keyframe definitions + particle classes; `@keyframes cardFlip` declared globally |

### Modified Files
| File | Changes |
|------|---------|
| `apps/web/src/widgets/CriticalGame/ui/styles/variants/types.ts` | Add `getHoverGlow?`, `getCardNameColor?`, `deckBorderColor?`; remove `getDeckBackground?`, `getDeckBorder?` |
| `apps/web/src/widgets/CriticalGame/ui/styles/variants/base.ts` | Remove `getDeckBackground`/`getDeckBorder`; add `getHoverGlow`, `getCardNameColor`, `deckBorderColor` defaults |
| `apps/web/src/widgets/CriticalGame/ui/styles/variants/cyberpunk/cards.ts` | Remove `getDeckBackground`/`getDeckBorder`; add `getHoverGlow`, `getCardNameColor`, `deckBorderColor` |
| `apps/web/src/widgets/CriticalGame/ui/styles/variants/underwater.ts` | Same as cyberpunk/cards.ts |
| `apps/web/src/widgets/CriticalGame/ui/styles/variants/high-altitude-hike.ts` | Same as cyberpunk/cards.ts |
| `apps/web/src/widgets/CriticalGame/ui/styles/variants/index.ts` | Register crime, horror, adventure with explicit `cards` merge |
| `apps/web/src/widgets/CriticalGame/ui/styles/cards-base.tsx` | Add `GradientScrim` functional component |
| `apps/web/src/widgets/CriticalGame/ui/styles/cards.tsx` | `DeckCard.$variant` — remove getDeckBackground/getDeckBorder calls; `StashedCard` — add `$variant` handler |
| `apps/web/src/widgets/CriticalGame/ui/styles/players-hand.tsx` | `HandCard.$variant` — add `hoverStyle: { boxShadow: config.getHoverGlow?.() }` |
| `apps/web/src/widgets/CriticalGame/ui/DeckDisplay.tsx` | Use `<CardImage faceDown />` for face-down; use `<CardImage>` for face-up |
| `apps/web/src/widgets/CriticalGame/ui/PlayerHand.tsx` | Remove `CardEmoji`; add `CardImage` + `GradientScrim` + name overlay; `<div>` wrapper per card; wire `useCardFlip` |
| `apps/web/src/widgets/CriticalGame/ui/ActiveGameContent.tsx` | Wrap `ParticleOverlay` in isolated absolute div |
| `apps/web/src/widgets/CriticalGame/lib/constants.ts` | Remove `disabled: true` from crime, horror, adventure entries |

---

## Task 1: Update `VariantStyleConfig` types and `base.ts`

**Files:**
- Modify: `apps/web/src/widgets/CriticalGame/ui/styles/variants/types.ts`
- Modify: `apps/web/src/widgets/CriticalGame/ui/styles/variants/base.ts`

### types.ts

- [ ] **Step 1: Edit `types.ts` — update `cards` interface**

  Replace the `cards` block (lines 93–111) with:

  ```ts
  cards: {
    glowEffect: string;
    borderEffect: string;
    deckBorderColor?: string;           // replaces getDeckBorder
    getDecorationBackground?: () => string;
    getDecorationBorder?: () => string;
    getDecorationEffects?: () => Record<string, unknown>;
    getDisabledOverlay?: () => string;
    getActionButtonsStyles?: () => Record<string, unknown>;
    getCardNameStyles?: () => Record<string, unknown>;
    getCardDescriptionStyles?: () => Record<string, unknown>;
    getCardInnerStyles?: () => Record<string, unknown>;

    // sprite support
    getCardSpriteUrl?: (variant?: string) => string | undefined;
    getDeckStyles?: () => Record<string, unknown>;
    getCardStyles?: () => Record<string, unknown>;
    getHoverGlow?: () => string;         // box-shadow string for card hover
    getCardNameColor?: () => string;     // color for name label overlay
  };
  ```

  Note: `getDeckBackground` and `getDeckBorder` are intentionally removed. `deckBorderColor` is a plain string that replaces `getDeckBorder`.

### base.ts

- [ ] **Step 2: Remove `getDeckBackground` and `getDeckBorder` from `baseVariantStyles.cards`**

  Delete these two functions (lines ~243–258). The base `getCardSpriteUrl(variant)` remains — it handles crime/horror/adventure via the `variant` argument as a fallback path for any code that calls the base directly. The new crime/horror/adventure variant files will override with direct URL returns (no argument), which takes precedence via `index.ts` merging.

- [ ] **Step 3: Add new fields to `baseVariantStyles.cards`**

  After `borderEffect`, add:
  ```ts
  deckBorderColor: VARIANT_COLORS.default.primary,
  getHoverGlow: () => `0 0 24px ${VARIANT_COLORS.default.primary}cc`,
  getCardNameColor: () => 'rgba(255, 255, 255, 0.9)',
  ```

- [ ] **Step 4: Commit**

  ```bash
  git add apps/web/src/widgets/CriticalGame/ui/styles/variants/types.ts \
          apps/web/src/widgets/CriticalGame/ui/styles/variants/base.ts
  git commit -m "feat(ARC-425): update VariantStyleConfig — add getHoverGlow, getCardNameColor, deckBorderColor; remove getDeckBackground/getDeckBorder"
  ```

---

## Task 2: Update existing variant files

**Files:**
- Modify: `apps/web/src/widgets/CriticalGame/ui/styles/variants/cyberpunk/cards.ts`
- Modify: `apps/web/src/widgets/CriticalGame/ui/styles/variants/underwater.ts`
- Modify: `apps/web/src/widgets/CriticalGame/ui/styles/variants/high-altitude-hike.ts`

These three variants are full `VariantStyleConfig` objects (cyberpunk) or provide a complete `cards` section (underwater, high-altitude-hike). Removing `getDeckBackground`/`getDeckBorder` from them is safe — their `cards` objects completely replace the base, so there is no risk of missing a base-provided fallback.

### cyberpunk/cards.ts

- [ ] **Step 1: Remove `getDeckBackground` and `getDeckBorder`; add new fields**

  Remove:
  ```ts
  getDeckBackground: (): string =>
    "url('/images/cards/cyberpunk_sprites.png') 0% 0% / 700% 700% no-repeat",
  getDeckBorder: (): string => VARIANT_COLORS.cyberpunk.secondary,
  ```

  Add after `borderEffect`:
  ```ts
  deckBorderColor: VARIANT_COLORS.cyberpunk.secondary,
  getHoverGlow: (): string => `0 0 24px ${VARIANT_COLORS.cyberpunk.primary}cc`,
  getCardNameColor: (): string => VARIANT_COLORS.cyberpunk.accent,
  ```

### underwater.ts

- [ ] **Step 2: Remove `getDeckBackground`/`getDeckBorder` from `cards` section; add new fields**

  Remove (lines ~340–342):
  ```ts
  getDeckBackground: () =>
    "url('/images/cards/underwater_sprites.png') 0% 0% / 700% 700% no-repeat border-box border-box",
  getDeckBorder: () => VARIANT_COLORS.underwater.primary,
  ```

  Add after `borderEffect`:
  ```ts
  deckBorderColor: VARIANT_COLORS.underwater.primary,
  getHoverGlow: () => `0 0 24px ${VARIANT_COLORS.underwater.primary}cc`,
  getCardNameColor: () => '#a5f3fc',
  ```

### high-altitude-hike.ts

- [ ] **Step 3: Remove `getDeckBackground`/`getDeckBorder` from `cards` section; add new fields**

  Remove (lines ~160–162):
  ```ts
  getDeckBackground: () =>
    `url('/images/cards/high-altitude-hike_sprites.png') 0% 0% / 700% 700% no-repeat`,
  getDeckBorder: () => COLORS.primary,
  ```

  Add after `borderEffect`:
  ```ts
  deckBorderColor: COLORS.primary,
  getHoverGlow: () => `0 0 24px ${COLORS.primary}cc`,
  getCardNameColor: () => COLORS.accent,
  ```

- [ ] **Step 4: Commit**

  ```bash
  git add apps/web/src/widgets/CriticalGame/ui/styles/variants/cyberpunk/cards.ts \
          apps/web/src/widgets/CriticalGame/ui/styles/variants/underwater.ts \
          apps/web/src/widgets/CriticalGame/ui/styles/variants/high-altitude-hike.ts
  git commit -m "feat(ARC-425): remove getDeckBackground/getDeckBorder from existing variant files; add getHoverGlow, getCardNameColor"
  ```

---

## Task 3: Create new variant files and register them

**Files:**
- Create: `apps/web/src/widgets/CriticalGame/ui/styles/variants/crime.ts`
- Create: `apps/web/src/widgets/CriticalGame/ui/styles/variants/horror.ts`
- Create: `apps/web/src/widgets/CriticalGame/ui/styles/variants/adventure.ts`
- Modify: `apps/web/src/widgets/CriticalGame/ui/styles/variants/index.ts`

Each new file exports only a `Partial<VariantStyleConfig>` overriding the `cards` section. The `getCardSpriteUrl` returns the URL directly without using the argument (the file already knows its variant). This is the same pattern as `underwater.ts` and `high-altitude-hike.ts`.

- [ ] **Step 1: Create `crime.ts`**

  ```ts
  import { VariantStyleConfig } from './types';
  import { VARIANT_COLORS } from '../variant-palette';

  const C = VARIANT_COLORS.crime;

  export const crimeVariantStyles: Partial<VariantStyleConfig> = {
    cards: {
      glowEffect: `0 0 20px ${C.primary}cc`,
      borderEffect: `2px solid ${C.primary}`,
      deckBorderColor: C.primary,
      getCardSpriteUrl: () => '/images/cards/crime_sprites.png',
      getHoverGlow: () => `0 0 24px ${C.primary}cc`,
      getCardNameColor: () => '#fca5a5',
    },
  };
  ```

- [ ] **Step 2: Create `horror.ts`**

  ```ts
  import { VariantStyleConfig } from './types';
  import { VARIANT_COLORS } from '../variant-palette';

  const C = VARIANT_COLORS.horror;

  export const horrorVariantStyles: Partial<VariantStyleConfig> = {
    cards: {
      glowEffect: `0 0 20px ${C.primary}cc`,
      borderEffect: `2px solid ${C.primary}`,
      deckBorderColor: C.primary,
      getCardSpriteUrl: () => '/images/cards/horror_sprites.png',
      getHoverGlow: () => `0 0 24px ${C.primary}cc`,
      getCardNameColor: () => '#6ee7b7',
    },
  };
  ```

- [ ] **Step 3: Create `adventure.ts`**

  ```ts
  import { VariantStyleConfig } from './types';
  import { VARIANT_COLORS } from '../variant-palette';

  const C = VARIANT_COLORS.adventure;

  export const adventureVariantStyles: Partial<VariantStyleConfig> = {
    cards: {
      glowEffect: `0 0 20px ${C.primary}cc`,
      borderEffect: `2px solid ${C.primary}`,
      deckBorderColor: C.primary,
      getCardSpriteUrl: () => '/images/cards/adventure_sprites.png',
      getHoverGlow: () => `0 0 24px ${C.primary}cc`,
      getCardNameColor: () => '#fcd34d',
    },
  };
  ```

- [ ] **Step 4: Register in `index.ts`**

  Add imports at top:
  ```ts
  import { crimeVariantStyles } from './crime';
  import { horrorVariantStyles } from './horror';
  import { adventureVariantStyles } from './adventure';
  ```

  Add cases before `default`. Note: the new variant files are `Partial<VariantStyleConfig>` (only `cards` section), so an explicit `cards` merge is required. The existing cyberpunk/underwater/high-altitude-hike cases use a bare two-level spread (`{ ...base, ...variant }`) — this works for them because those variants supply a complete `VariantStyleConfig`. Do NOT change the existing cases.

  ```ts
  case GAME_VARIANT.CRIME:
    return {
      ...baseVariantStyles,
      cards: { ...baseVariantStyles.cards, ...crimeVariantStyles.cards! },
    };
  case GAME_VARIANT.HORROR:
    return {
      ...baseVariantStyles,
      cards: { ...baseVariantStyles.cards, ...horrorVariantStyles.cards! },
    };
  case GAME_VARIANT.ADVENTURE:
    return {
      ...baseVariantStyles,
      cards: { ...baseVariantStyles.cards, ...adventureVariantStyles.cards! },
    };
  ```

- [ ] **Step 5: Commit**

  ```bash
  git add apps/web/src/widgets/CriticalGame/ui/styles/variants/crime.ts \
          apps/web/src/widgets/CriticalGame/ui/styles/variants/horror.ts \
          apps/web/src/widgets/CriticalGame/ui/styles/variants/adventure.ts \
          apps/web/src/widgets/CriticalGame/ui/styles/variants/index.ts
  git commit -m "feat(ARC-425): add crime, horror, adventure variant configs and register in index"
  ```

---

## Task 4: Add `GradientScrim` to `cards-base.tsx`

**Files:**
- Modify: `apps/web/src/widgets/CriticalGame/ui/styles/cards-base.tsx`

A simple reusable component (not a Tamagui styled component — plain React) placed at the bottom of the file so card renders in `PlayerHand.tsx` and `DeckDisplay.tsx` can import it alongside other card primitives.

> **Note on spec wording:** The spec's `cards-base.tsx` entry also mentions "card name overlay Text" and "update base Card to include CardImage slot." This plan intentionally routes those elements through inline JSX in `PlayerHand.tsx` and `DeckDisplay.tsx` rather than as exported primitives — the functional result is equivalent and the approach is simpler. Do NOT add additional exports to `cards-base.tsx` beyond `GradientScrim`.

- [ ] **Step 1: Add `GradientScrim` at the bottom of `cards-base.tsx`**

  ```tsx
  export function GradientScrim() {
    return (
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '40%',
          background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
    );
  }
  ```

- [ ] **Step 2: Export `GradientScrim` from the styles barrel**

  In `apps/web/src/widgets/CriticalGame/ui/styles/index.ts`, add:
  ```ts
  export { GradientScrim } from './cards-base';
  ```

  Check that the `cards-base` exports are re-exported from the barrel (they should be, since `PlayerHand.tsx` imports `CardCorner`, `CardFrame`, etc. from `'./styles'`).

- [ ] **Step 3: Commit**

  ```bash
  git add apps/web/src/widgets/CriticalGame/ui/styles/cards-base.tsx
  git commit -m "feat(ARC-425): add GradientScrim component to cards-base"
  ```

---

## Task 5: Update `cards.tsx` and `players-hand.tsx`

**Files:**
- Modify: `apps/web/src/widgets/CriticalGame/ui/styles/cards.tsx`
- Modify: `apps/web/src/widgets/CriticalGame/ui/styles/players-hand.tsx`

### cards.tsx — DeckCard.$variant

- [ ] **Step 1: Update `DeckCard.$variant` handler**

  Replace the existing `$variant` variant block inside `DeckCard`:
  ```ts
  variants: {
    $variant: (val: string) => {
      const config = getVariantStyles(val).cards;
      return {
        borderColor: config.deckBorderColor,
        ...config.getDeckStyles?.(),
      };
    },
  } as const,
  ```

  The `backgroundColor` and `borderColor` calls that referenced `getDeckBackground`/`getDeckBorder` are gone. Border color now comes from `deckBorderColor`.

### cards.tsx — StashedCard

- [ ] **Step 2: Add `$variant` handler to `StashedCard`**

  `StashedCard` extends `Card` which already has `$cardType` and `$index` pass-through variants. Tamagui's `styled()` inheritance carries those variants to the extension — only `$variant` is missing and needs to be added.

  Replace:
  ```ts
  export const StashedCard = styled(Card, {
    name: 'StashedCard',
    borderColor: '$primary',
    borderWidth: 1,
    opacity: 0.9,
  });
  ```

  With:
  ```ts
  export const StashedCard = styled(Card, {
    name: 'StashedCard',
    borderColor: '$primary',
    borderWidth: 1,
    opacity: 0.9,

    variants: {
      $variant: (val: string) => {
        const config = getVariantStyles(val).cards;
        return {
          borderColor: config.deckBorderColor,
          ...config.getCardStyles?.(),
        };
      },
    } as const,
  });
  ```

### players-hand.tsx — HandCard.$variant hoverStyle

- [ ] **Step 3: Update `HandCard.$variant` to include hover glow**

  Replace the `$variant` variant inside `HandCard`:
  ```ts
  $variant: (val: string) => {
    const config = getVariantStyles(val).cards;
    return {
      ...config.getCardStyles?.(),
      hoverStyle: { scale: 1.05, boxShadow: config.getHoverGlow?.() },
    };
  },
  ```

  This overrides the base `Card`'s `hoverStyle: { scale: 1.05, elevation: 8 }` for variant-styled cards only.

- [ ] **Step 4: Commit**

  ```bash
  git add apps/web/src/widgets/CriticalGame/ui/styles/cards.tsx \
          apps/web/src/widgets/CriticalGame/ui/styles/players-hand.tsx
  git commit -m "feat(ARC-425): update DeckCard/StashedCard variant handlers; add hover glow to HandCard"
  ```

---

## Task 6: Create `CardImage` component

**Files:**
- Create: `apps/web/src/widgets/CriticalGame/ui/styles/card-image.tsx`

Plain React (no Tamagui). Renders a sprite frame as an absolute `<div>` with CSS background-position. Returns `null` if no sprite sheet exists for the variant (default/unthemed variant — no visual card art).

- [ ] **Step 1: Create `card-image.tsx`**

  ```tsx
  import React from 'react';
  import { CARD_SPRITE_MAP } from './card-sprites';
  import { getVariantStyles } from './variants';

  const TILE_SIZE = 171;
  const GRID_SIZE = 7;
  const SHEET_SIZE = TILE_SIZE * GRID_SIZE; // 1197

  interface CardImageProps {
    variant: string;
    cardType?: string;
    faceDown?: boolean;
  }

  export function CardImage({ variant, cardType = '', faceDown = false }: CardImageProps) {
    const spriteUrl = getVariantStyles(variant).cards.getCardSpriteUrl?.(variant);

    // No sprite sheet for this variant (e.g. default/unthemed) — render nothing
    if (!spriteUrl) return null;

    const spriteIndex = faceDown ? 0 : (CARD_SPRITE_MAP[cardType] ?? 0);
    const col = spriteIndex % GRID_SIZE;
    const row = Math.floor(spriteIndex / GRID_SIZE);

    const style: React.CSSProperties = {
      position: 'absolute',
      inset: 0,
      borderRadius: 'inherit',
      backgroundImage: `url(${spriteUrl})`,
      backgroundSize: `${SHEET_SIZE}px ${SHEET_SIZE}px`,
      backgroundPosition: `-${col * TILE_SIZE}px -${row * TILE_SIZE}px`,
      backgroundRepeat: 'no-repeat',
    };

    return <div style={style} />;
  }
  ```

  Note: `CardImage` is imported via direct path `'./styles/card-image'` from both `PlayerHand.tsx` and `DeckDisplay.tsx`. No barrel export needed.

- [ ] **Step 2: Commit**

  ```bash
  git add apps/web/src/widgets/CriticalGame/ui/styles/card-image.tsx
  git commit -m "feat(ARC-425): add CardImage sprite-sheet component"
  ```

---

## Task 7: Update `DeckDisplay.tsx`

**Files:**
- Modify: `apps/web/src/widgets/CriticalGame/ui/DeckDisplay.tsx`

- [ ] **Step 1: Add imports**

  ```ts
  import { CardImage } from './styles/card-image';
  import { GradientScrim } from './styles/cards-base';
  ```

  Remove `CardEmoji` from the existing import from `'./styles'`.

- [ ] **Step 2: Update face-down deck render**

  Replace:
  ```tsx
  return <DeckCard $variant={cardVariant as GameVariant} />;
  ```

  With:
  ```tsx
  return (
    <DeckCard $variant={cardVariant as GameVariant}>
      <CardImage variant={cardVariant ?? ''} faceDown />
    </DeckCard>
  );
  ```

- [ ] **Step 3: Update face-up card render**

  In the `LastPlayedCard` branch, replace `<CardEmoji>` inside `CardInner` with `<CardImage>` + `<GradientScrim>`:

  ```tsx
  <LastPlayedCard
    $isAnimating={false}
    $variant={cardVariant as GameVariant}
    style={{ position: 'relative', transform: 'none', left: 'auto', top: 'auto', animation: 'none' }}
  >
    <CardImage variant={cardVariant ?? ''} cardType={topCard as string} />
    <GradientScrim />
    <CardCorner $position="tl" />
    <CardCorner $position="tr" />
    <CardCorner $position="bl" />
    <CardCorner $position="br" />
    <CardFrame />
    <CardInner style={{ zIndex: 2 }}>
      <CardName>{t(getCardTranslationKey(topCard, cardVariant))}</CardName>
    </CardInner>
  </LastPlayedCard>
  ```

- [ ] **Step 4: Commit**

  ```bash
  git add apps/web/src/widgets/CriticalGame/ui/DeckDisplay.tsx
  git commit -m "feat(ARC-425): update DeckDisplay — replace CardEmoji with CardImage sprite frames"
  ```

---

## Task 8: Create `useCardFlip` hook

**Files:**
- Create: `apps/web/src/widgets/CriticalGame/hooks/useCardFlip.ts`

The hook accepts `distinctCardTypes: CriticalCard[]` — the already-memoized list of distinct card types in the player's hand. The caller (`PlayerHand.tsx`) derives this from `groupedHand.map(i => i.card)`, which is already memoized via `useMemo`. This avoids the infinite re-render problem caused by passing a raw `currentPlayer.hand` array (new reference on every render).

The hook returns `{ flippingCardType, showBack }`. The `showBack` return value is an extension beyond the spec's interface definition but is required for the mid-flip sprite swap described in the spec prose.

- [ ] **Step 1: Create `useCardFlip.ts`**

  ```ts
  import { useState, useRef, useEffect } from 'react';
  import type { CriticalCard } from '../types';

  interface UseCardFlipResult {
    flippingCardType: CriticalCard | null;
    showBack: boolean;
  }

  /**
   * Detects when exactly one new card type enters the player's hand and triggers
   * a 600ms CSS flip animation. showBack flips from true→false at the 300ms midpoint
   * so the sprite swaps from card back to card front at the hidden frame.
   *
   * @param distinctCardTypes - memoized array of distinct card types in hand (from groupedHand.map(i => i.card))
   */
  export function useCardFlip(distinctCardTypes: CriticalCard[]): UseCardFlipResult {
    const [flippingCardType, setFlippingCardType] = useState<CriticalCard | null>(null);
    const [showBack, setShowBack] = useState(true);
    const previousTypes = useRef<Set<CriticalCard>>(new Set());
    const flipTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

    useEffect(() => {
      const currentSet = new Set(distinctCardTypes);

      const newTypes: CriticalCard[] = [];
      currentSet.forEach((card) => {
        if (!previousTypes.current.has(card)) {
          newTypes.push(card);
        }
      });

      // Only flip for exactly one new type (ignore bulk draw, combo result, or no change)
      if (newTypes.length === 1) {
        const card = newTypes[0];

        flipTimers.current.forEach(clearTimeout);

        setFlippingCardType(card);
        setShowBack(true);

        // At midpoint: reveal front face
        const midTimer = setTimeout(() => {
          setShowBack(false);
        }, 300);

        // After full animation: clear flipping state
        const endTimer = setTimeout(() => {
          setFlippingCardType(null);
          setShowBack(true);
        }, 600);

        flipTimers.current = [midTimer, endTimer];
      }

      previousTypes.current = currentSet;
    }, [distinctCardTypes]);

    useEffect(() => {
      return () => {
        flipTimers.current.forEach(clearTimeout);
      };
    }, []);

    return { flippingCardType, showBack };
  }
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add apps/web/src/widgets/CriticalGame/hooks/useCardFlip.ts
  git commit -m "feat(ARC-425): add useCardFlip hook for card draw reveal animation"
  ```

---

## Task 9: Update `PlayerHand.tsx`

**Files:**
- Modify: `apps/web/src/widgets/CriticalGame/ui/PlayerHand.tsx`

Largest change: removes `CardEmoji`, adds `CardImage` + `GradientScrim` + name overlay, wraps `HandCard` in perspective `<div>`, wires `useCardFlip`.

- [ ] **Step 1: Update imports**

  - Remove `CardEmoji` from the import from `'./styles'`
  - Add `GradientScrim` to the import from `'./styles'`
  - Add two new direct imports:
    ```ts
    import { CardImage } from './styles/card-image';
    import { useCardFlip } from '../hooks/useCardFlip';
    ```
  - Remove `getCardEmoji` from the `'../lib/cardUtils'` import (verify it is not used elsewhere in the file before removing)

- [ ] **Step 2: Derive `distinctCardTypes` from `groupedHand` and wire `useCardFlip`**

  After `const [showDescriptions, setShowDescriptions] = useState(true);`, add:
  ```ts
  const distinctCardTypes = useMemo(
    () => groupedHand.map((item) => item.card),
    [groupedHand],
  );
  const { flippingCardType, showBack } = useCardFlip(distinctCardTypes);
  ```

  `useMemo` is already imported at the top. `groupedHand` is already memoized — `distinctCardTypes` derives a stable array from it.

- [ ] **Step 3: Update StashedCard render — replace CardEmoji**

  In the `stashItems.map(...)` block, replace the `<CardInner>` contents:

  From:
  ```tsx
  <CardInner>
    <CardEmoji>{getCardEmoji(card)}</CardEmoji>
    {showNames && (
      <CardName $variant={cardVariant as GameVariant}>
        {t(getCardTranslationKey(card, cardVariant)) || card}
      </CardName>
    )}
    {showDescriptions && (
      <CardDescription $variant={cardVariant as GameVariant}>
        {t(getCardDescriptionKey(card))}
      </CardDescription>
    )}
  </CardInner>
  ```

  To (placed directly inside `StashedCard`, before `{count > 1 && <CardCountBadge>...}`):
  ```tsx
  <CardImage variant={cardVariant ?? ''} cardType={card} />
  <GradientScrim />
  <CardInner style={{ zIndex: 2 }}>
    {showNames && (
      <CardName $variant={cardVariant as GameVariant}>
        {t(getCardTranslationKey(card, cardVariant)) || card}
      </CardName>
    )}
    {showDescriptions && (
      <CardDescription $variant={cardVariant as GameVariant}>
        {t(getCardDescriptionKey(card))}
      </CardDescription>
    )}
  </CardInner>
  ```

- [ ] **Step 4: Update HandCard render — add flip wrapper, replace CardEmoji**

  Replace the entire `groupedHand.map(...)` return block. The `<div>` wrapper gets the `key` prop (removing it from `HandCard`). The `HandCard` gets a `style` prop for flip animation when it is the flipping card:

  ```tsx
  return (
    <div
      key={id}
      style={
        card === flippingCardType
          ? { perspective: '600px' }
          : undefined
      }
    >
      <HandCard
        $cardType={card}
        $index={idx}
        $variant={cardVariant as GameVariant}
        $clickable={clickable}
        $dimmed={dimmed}
        onPress={() => handleCardClick(card, count)}
        style={
          card === flippingCardType
            ? {
                transformStyle: 'preserve-3d',
                animation: 'cardFlip 600ms ease-in-out',
              }
            : undefined
        }
      >
        <CardImage
          variant={cardVariant ?? ''}
          cardType={card}
          faceDown={card === flippingCardType ? showBack : false}
        />
        <GradientScrim />
        <CardCorner $position="tl" />
        <CardCorner $position="tr" />
        <CardCorner $position="bl" />
        <CardCorner $position="br" />
        <CardFrame />
        <CardInner style={{ zIndex: 2 }}>
          {showNames && (
            <CardName $variant={cardVariant as GameVariant}>
              {t(getCardTranslationKey(card, cardVariant)) || card}
            </CardName>
          )}
          {showDescriptions && (
            <CardDescription $variant={cardVariant as GameVariant}>
              {t(getCardDescriptionKey(card))}
            </CardDescription>
          )}
        </CardInner>
        {count > 1 && <CardCountBadge>{count}</CardCountBadge>}
      </HandCard>
    </div>
  );
  ```

  The `animation: 'cardFlip 600ms ease-in-out'` references `@keyframes cardFlip` which will be declared globally in `ParticleOverlay.module.css` (Task 10). The CSS module loads on any page that renders `ParticleOverlay`; since `ActiveGameContent` always renders `ParticleOverlay`, the keyframe will always be available when `PlayerHand` is visible.

- [ ] **Step 5: Commit**

  ```bash
  git add apps/web/src/widgets/CriticalGame/ui/PlayerHand.tsx
  git commit -m "feat(ARC-425): update PlayerHand — CardImage + GradientScrim + card flip animation"
  ```

---

## Task 10: Create `ParticleOverlay` component and CSS module

**Files:**
- Create: `apps/web/src/widgets/CriticalGame/ui/ParticleOverlay.tsx`
- Create: `apps/web/src/widgets/CriticalGame/ui/ParticleOverlay.module.css`

**Critical:** `@keyframes cardFlip` is declared inside a `:global { }` block in the CSS module. This prevents Next.js from hashing the keyframe name, making the name `cardFlip` available globally and usable from `PlayerHand.tsx`'s inline `animation` style string.

- [ ] **Step 1: Create `ParticleOverlay.module.css`**

  ```css
  .overlay {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
  }

  /* cardFlip is declared globally so it is reachable from PlayerHand inline style.
     CSS module @keyframes inside :global { } are NOT name-hashed by Next.js. */
  :global {
    @keyframes cardFlip {
      0%   { transform: rotateY(0deg); }
      45%  { transform: rotateY(90deg); }
      55%  { transform: rotateY(90deg); }
      100% { transform: rotateY(0deg); }
    }
  }

  /* --- Cyberpunk: scanline flicker --- */
  @keyframes scanlineFlicker {
    0%, 100% { opacity: 0.04; }
    50%       { opacity: 0.12; }
  }

  .scanline {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(6, 182, 212, 0.06) 2px,
      rgba(6, 182, 212, 0.06) 4px
    );
    animation: scanlineFlicker 2s ease-in-out infinite;
  }

  /* --- Underwater: bubbles --- */
  @keyframes bubbleRise {
    0%   { transform: translateY(0); opacity: 0; }
    10%  { opacity: 0.7; }
    90%  { opacity: 0.7; }
    100% { transform: translateY(-100vh); opacity: 0; }
  }

  .bubble {
    position: absolute;
    border-radius: 50%;
    background: rgba(34, 211, 238, 0.3);
    animation: bubbleRise 6s ease-in infinite;
  }

  /* --- Crime: rain streaks --- */
  @keyframes rainFall {
    0%   { transform: translateY(-100%); opacity: 0; }
    10%  { opacity: 0.6; }
    90%  { opacity: 0.6; }
    100% { transform: translateY(100vh); opacity: 0; }
  }

  .rainStreak {
    position: absolute;
    width: 1px;
    background: rgba(220, 38, 38, 0.5);
    animation: rainFall 1.2s linear infinite;
  }

  /* --- Horror: vignette flicker --- */
  @keyframes vignetteFlicker {
    0%   { opacity: 0.4; }
    15%  { opacity: 0.7; }
    30%  { opacity: 0.3; }
    55%  { opacity: 0.6; }
    70%  { opacity: 0.2; }
    85%  { opacity: 0.5; }
    100% { opacity: 0.4; }
  }

  .vignette {
    position: absolute;
    inset: 0;
    background: radial-gradient(
      ellipse at center,
      transparent 40%,
      rgba(0, 0, 0, 0.7) 100%
    );
    animation: vignetteFlicker 4s ease-in-out infinite;
  }

  /* --- Adventure: dust motes --- */
  @keyframes dustFloat {
    0%   { transform: translateY(0) translateX(0); opacity: 0; }
    20%  { opacity: 0.8; }
    80%  { opacity: 0.8; }
    100% { transform: translateY(-60px) translateX(20px); opacity: 0; }
  }

  .dustMote {
    position: absolute;
    border-radius: 50%;
    background: rgba(245, 158, 11, 0.6);
    animation: dustFloat 4s ease-in-out infinite;
  }

  /* --- High-altitude-hike: drifting snow --- */
  @keyframes snowDrift {
    0%   { transform: translateY(-10px) translateX(0); opacity: 0; }
    10%  { opacity: 0.8; }
    90%  { opacity: 0.8; }
    100% { transform: translateY(100vh) translateX(30px); opacity: 0; }
  }

  .snowFlake {
    position: absolute;
    border-radius: 50%;
    background: rgba(248, 250, 252, 0.8);
    animation: snowDrift 5s linear infinite;
  }
  ```

- [ ] **Step 2: Create `ParticleOverlay.tsx`**

  ```tsx
  import React from 'react';
  import styles from './ParticleOverlay.module.css';

  interface ParticleOverlayProps {
    variant?: string;
  }

  export function ParticleOverlay({ variant }: ParticleOverlayProps) {
    if (variant === 'cyberpunk') {
      return (
        <div className={styles.overlay}>
          <div className={styles.scanline} />
        </div>
      );
    }

    if (variant === 'underwater') {
      const bubbles = Array.from({ length: 10 }, (_, i) => ({
        id: i,
        left: `${8 + i * 9}%`,
        width: `${4 + (i % 4) * 3}px`,
        delay: `${(i * 0.7).toFixed(1)}s`,
        duration: `${5 + (i % 3)}s`,
      }));
      return (
        <div className={styles.overlay}>
          {bubbles.map((b) => (
            <span
              key={b.id}
              className={styles.bubble}
              style={{
                left: b.left,
                bottom: '-10px',
                width: b.width,
                height: b.width,
                animationDelay: b.delay,
                animationDuration: b.duration,
              }}
            />
          ))}
        </div>
      );
    }

    if (variant === 'crime') {
      const streaks = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        left: `${2 + i * 6.5}%`,
        height: `${40 + (i % 5) * 20}px`,
        delay: `${(i * 0.15).toFixed(2)}s`,
        duration: `${1.0 + (i % 4) * 0.2}s`,
      }));
      return (
        <div className={styles.overlay}>
          {streaks.map((s) => (
            <span
              key={s.id}
              className={styles.rainStreak}
              style={{
                left: s.left,
                height: s.height,
                top: '-20px',
                animationDelay: s.delay,
                animationDuration: s.duration,
              }}
            />
          ))}
        </div>
      );
    }

    if (variant === 'horror') {
      return (
        <div className={styles.overlay}>
          <div className={styles.vignette} />
        </div>
      );
    }

    if (variant === 'adventure') {
      const motes = Array.from({ length: 8 }, (_, i) => ({
        id: i,
        left: `${5 + i * 12}%`,
        top: `${20 + (i % 4) * 20}%`,
        size: `${3 + (i % 3)}px`,
        delay: `${(i * 0.6).toFixed(1)}s`,
        duration: `${3.5 + (i % 3) * 0.5}s`,
      }));
      return (
        <div className={styles.overlay}>
          {motes.map((m) => (
            <span
              key={m.id}
              className={styles.dustMote}
              style={{
                left: m.left,
                top: m.top,
                width: m.size,
                height: m.size,
                animationDelay: m.delay,
                animationDuration: m.duration,
              }}
            />
          ))}
        </div>
      );
    }

    if (variant === 'high-altitude-hike') {
      const flakes = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        left: `${3 + i * 8}%`,
        size: `${2 + (i % 3)}px`,
        delay: `${(i * 0.45).toFixed(2)}s`,
        duration: `${4 + (i % 4)}s`,
      }));
      return (
        <div className={styles.overlay}>
          {flakes.map((f) => (
            <span
              key={f.id}
              className={styles.snowFlake}
              style={{
                left: f.left,
                top: '-5px',
                width: f.size,
                height: f.size,
                animationDelay: f.delay,
                animationDuration: f.duration,
              }}
            />
          ))}
        </div>
      );
    }

    return null;
  }
  ```

- [ ] **Step 3: Commit**

  ```bash
  git add apps/web/src/widgets/CriticalGame/ui/ParticleOverlay.tsx \
          apps/web/src/widgets/CriticalGame/ui/ParticleOverlay.module.css
  git commit -m "feat(ARC-425): add ParticleOverlay with per-variant ambient effects and global cardFlip keyframe"
  ```

---

## Task 11: Update `ActiveGameContent.tsx`

**Files:**
- Modify: `apps/web/src/widgets/CriticalGame/ui/ActiveGameContent.tsx`

- [ ] **Step 1: Import `ParticleOverlay`**

  ```ts
  import { ParticleOverlay } from './ParticleOverlay';
  ```

- [ ] **Step 2: Check `GameBoard` has `position: relative`**

  In `apps/web/src/widgets/CriticalGame/ui/styles/layout.tsx`, confirm that `GameBoard` has `position: 'relative'` (or `position: 'absolute'`). If it does not, add `position: 'relative'` so the absolute particle wrapper is scoped correctly.

- [ ] **Step 3: Add isolated particle overlay as first child of `<GameBoard>`**

  ```tsx
  return (
    <GameBoard>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          isolation: 'isolate',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        <ParticleOverlay variant={cardVariant} />
      </div>

      <TableArea>
        {/* ... existing content unchanged ... */}
      </TableArea>
    </GameBoard>
  );
  ```

  The `isolation: 'isolate'` creates a new stacking context, preventing particle z-indices from competing with `LastPlayedCard` (z-index: 10) or `ActionButtons` (z-index: 50).

- [ ] **Step 4: Commit**

  ```bash
  git add apps/web/src/widgets/CriticalGame/ui/ActiveGameContent.tsx
  git commit -m "feat(ARC-425): add isolated ParticleOverlay to ActiveGameContent"
  ```

---

## Task 12: Enable crime, horror, adventure variants

**Files:**
- Modify: `apps/web/src/widgets/CriticalGame/lib/constants.ts`

- [ ] **Step 1: Remove `disabled: true` from crime, horror, adventure**

  In `CARD_VARIANTS`, remove the `disabled: true` line from the objects for `GAME_VARIANT.CRIME`, `GAME_VARIANT.HORROR`, and `GAME_VARIANT.ADVENTURE`. The `gradient` field in each entry is an existing value (not in scope to change here — it affects the variant picker UI, not the game board theming).

  Example result for crime after change:
  ```ts
  {
    id: GAME_VARIANT.CRIME,
    name: 'games.critical_v1.variants.crime.name',
    description: 'games.critical_v1.variants.crime.description',
    emoji: '🕵️‍♀️',
    gradient: 'linear-gradient(135deg, #F5A623 0%, #F8E71C 100%)',
  },
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add apps/web/src/widgets/CriticalGame/lib/constants.ts
  git commit -m "feat(ARC-425): enable crime, horror, adventure card variants"
  ```

---

## Task 13: TypeScript compile check + visual verification

- [ ] **Step 1: Run TypeScript check**

  ```bash
  cd apps/web && npx tsc --noEmit 2>&1 | head -60
  ```

  Expected: zero errors. Common issues to fix:
  - `deckBorderColor` is `string | undefined` but some handlers may expect `string` — use nullish fallback: `config.deckBorderColor ?? 'transparent'`
  - `cards` object shape mismatch if `Partial<VariantStyleConfig>` cards section is missing required fields — check `glowEffect` and `borderEffect` are present in all new variant files

- [ ] **Step 2: Start dev server**

  ```bash
  pnpm dev
  ```

  Visual checklist:
  - **Cyberpunk room**: sprite card art on HandCards; DeckCard shows card-back sprite; hover shows cyan glow; scanline overlay visible behind table
  - **Adventure room**: amber-tinted card art; golden dust mote particles floating upward
  - **Crime room**: rain streaks falling; red card borders
  - **Drawing a card (cyberpunk)**: selected HandCard flips — card back visible at 0–300ms, card front at 300–600ms
  - **Drawing multiple cards at once** (e.g. `strike` chain): no flip animation fires
  - **Chat panel**: open by default on entering any game room (pre-existing change)

- [ ] **Step 3: Fix and commit any issues**

  ```bash
  git add -p
  git commit -m "fix(ARC-425): address TypeScript errors from CriticalGame widget rework"
  ```

---

## Summary Table

| # | Task | Key files | Commit |
|---|------|-----------|--------|
| 1 | Update types + base | types.ts, base.ts | 1 |
| 2 | Update existing variants | cyberpunk/cards.ts, underwater.ts, high-altitude-hike.ts | 1 |
| 3 | New variant files + index | crime.ts, horror.ts, adventure.ts, index.ts | 1 |
| 4 | GradientScrim component | cards-base.tsx | 1 |
| 5 | Update card styled components | cards.tsx, players-hand.tsx | 1 |
| 6 | CardImage component | card-image.tsx | 1 |
| 7 | Update DeckDisplay | DeckDisplay.tsx | 1 |
| 8 | useCardFlip hook | useCardFlip.ts | 1 |
| 9 | Update PlayerHand | PlayerHand.tsx | 1 |
| 10 | ParticleOverlay | ParticleOverlay.tsx, ParticleOverlay.module.css | 1 |
| 11 | Wire ParticleOverlay | ActiveGameContent.tsx | 1 |
| 12 | Enable variants | constants.ts | 1 |
| 13 | TS check + visual verify | — | if needed |
