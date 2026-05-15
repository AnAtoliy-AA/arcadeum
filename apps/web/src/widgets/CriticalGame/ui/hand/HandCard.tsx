'use client';

import { YStack, Text } from 'tamagui';
import {
  CardsIcon,
  EyeIcon,
  FootprintsIcon,
  HandIcon,
  HandshakeIcon,
  ShieldIcon,
  SparklesIcon,
  SwordsIcon,
} from '@arcadeum/ui';
import type { FC } from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';
import {
  getCardTranslationKey,
  getCardDescriptionKey,
} from '../../lib/cardUtils';
import { getCardRole, type CardRole } from '../../lib/cardRoles';
import { CardImage, hasArtFor } from '../styles/card-image';
import type { HandCardInstance } from '../../lib/combo';

interface HandCardProps {
  card: HandCardInstance;
  isSelected: boolean;
  disabled?: boolean;
  cardVariant?: string;
  /**
   * Number of duplicates of this card type in the hand. When > 1, a
   * count badge ("×N") is rendered in the top-right corner. The widget
   * still renders one tile per copy so each can be individually
   * selected — the badge is a quick legibility cue, not a stack.
   */
  count?: number;
  /** Show / hide the uppercase card name under the art (default: true). */
  showName?: boolean;
  /** Show / hide the description block under the name (default: true). */
  showDescription?: boolean;
  onToggle: () => void;
}

const ROLE_BORDER: Record<CardRole, string> = {
  attack: '#ef4444',
  defuse: '#34d399',
  skip: '#38bdf8',
  nope: '#f59e0b',
  favor: '#a78bfa',
  see: '#22d3ee',
  combo: '#facc15',
  special: '#f472b6',
};

// Glow colours are now CSS-attribute-keyed in `hudStyles.tsx` (§4.1) —
// the ::after pseudo-element reads `data-role` and `data-selected` and
// drives box-shadow + radius via custom properties. No JS payload.

/**
 * Fallback icon used when the active card variant has no sprite sheet
 * (e.g. the unthemed "default" variant). Keyed by role so the icon at
 * least tracks the border colour. SVG components render consistently
 * across OSes — the prior emoji glyphs (⚔, 🛡, 🃏, …) were Windows /
 * macOS / Android renderings apart.
 */
const ROLE_FALLBACK_ICON: Record<CardRole, FC<{ size?: number }>> = {
  attack: SwordsIcon,
  defuse: ShieldIcon,
  skip: FootprintsIcon,
  nope: HandIcon,
  favor: HandshakeIcon,
  see: EyeIcon,
  combo: CardsIcon,
  special: SparklesIcon,
};

const SELECT_RING = '#34d399';

/**
 * Single-card cell for the widget-mode hand. Renders the variant's
 * sprite via `<CardImage>` when available, with a role-keyed fallback
 * glyph as the underlay for the unthemed "default" variant. Name +
 * description overlay a bottom scrim so the artwork stays visible.
 * Border colour comes from the card's role family (`cardRoles.ts`);
 * selection lifts the cell and swaps the border to the accent green.
 * The legacy `PlayerHand` keeps the rich table-mode card on the
 * flag-off path.
 */
export function HandCard({
  card,
  isSelected,
  disabled = false,
  cardVariant,
  count,
  showName = true,
  showDescription = true,
  onToggle,
}: HandCardProps) {
  const { t } = useTranslation();
  const role = getCardRole(card.id);
  const name = t(getCardTranslationKey(card.id, cardVariant));
  const description = t(getCardDescriptionKey(card.id));
  const borderColor = isSelected ? SELECT_RING : ROLE_BORDER[role];
  // Stable id so the outer button can `aria-describedby` the visible
  // description block. Screen readers otherwise stop at the aria-label
  // (card name) and never hear the rules text.
  const descriptionId = `hand-card-description-${card.uid}`;
  const linkDescription = showDescription && !!description;

  // Fixed card silhouette (~3:4) regardless of which text rows show —
  // text overlays the art rather than pushing the cell taller. Cell
  // dimensions stay constant across selection so the lift doesn't
  // displace neighbouring cards in the fan; the translateY + border
  // swap + glow are enough to read selection.
  const width = 124;
  const height = 172;

  return (
    <YStack
      data-testid={`hand-card-${card.uid}`}
      data-card={card.id}
      data-role={role}
      data-selected={isSelected ? 'true' : 'false'}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-pressed={isSelected}
      aria-disabled={disabled}
      aria-label={name}
      aria-describedby={linkDescription ? descriptionId : undefined}
      onPress={disabled ? undefined : onToggle}
      onKeyDown={
        disabled
          ? undefined
          : (e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onToggle();
              }
            }
      }
      width={width}
      height={height}
      borderRadius={10}
      borderWidth={2}
      borderColor={borderColor}
      backgroundColor="rgba(8,12,20,0.85)"
      overflow="hidden"
      position="relative"
      transform={isSelected ? [{ translateY: -8 }] : undefined}
      cursor={disabled ? 'default' : 'pointer'}
      opacity={disabled ? 0.7 : 1}
      // Glow is driven by the `::after` rule in `hudStyles.tsx` keyed on
      // `data-role` + `data-selected` (§4.1). No tamagui shadow props
      // here so the glow doesn't double-paint and can animate via the
      // compositor when selection toggles.
      hoverStyle={
        disabled
          ? undefined
          : {
              transform: [{ translateY: isSelected ? -10 : -4 }],
            }
      }
      // Visible focus ring for keyboard users — the card is tabbable via
      // `tabIndex={0}` but had no `:focus-visible` style, so a keyboard
      // tab through the hand previously gave no visual feedback at all.
      focusStyle={
        disabled
          ? undefined
          : {
              outlineColor: SELECT_RING,
              outlineWidth: 2,
              outlineStyle: 'solid',
              outlineOffset: 2,
            }
      }
      flexShrink={0}
    >
      <CardArt
        cardId={card.id}
        cardVariant={cardVariant}
        role={role}
        testId={`hand-card-art-${card.uid}`}
      />
      {(showName || showDescription) && (
        <YStack
          data-testid={`hand-card-overlay-${card.uid}`}
          position="absolute"
          left={0}
          right={0}
          bottom={0}
          paddingHorizontal={8}
          paddingTop={14}
          paddingBottom={8}
          gap={2}
          pointerEvents="none"
          // Linear scrim so the text reads cleanly against the art
          // without obscuring the upper half. Transparent at the top so
          // the artwork stays visible.
          style={{
            background:
              'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0) 100%)',
          }}
        >
          {showName && (
            <Text
              data-testid={`hand-card-name-${card.uid}`}
              fontSize={11}
              fontWeight="800"
              letterSpacing={0.4}
              textTransform="uppercase"
              textAlign="center"
              numberOfLines={1}
              color={borderColor}
            >
              {name}
            </Text>
          )}
          {showDescription && (
            <Text
              id={descriptionId}
              data-testid={descriptionId}
              fontSize={9}
              lineHeight={12}
              textAlign="center"
              numberOfLines={2}
              color="rgba(226, 232, 240, 0.88)"
            >
              {description}
            </Text>
          )}
        </YStack>
      )}
      {!!count && count > 1 && (
        <YStack
          data-testid={`hand-card-count-${card.uid}`}
          position="absolute"
          top={4}
          right={4}
          minWidth={20}
          height={20}
          paddingHorizontal={4}
          borderRadius={9999}
          backgroundColor="rgba(0,0,0,0.75)"
          borderWidth={1}
          borderColor={borderColor}
          alignItems="center"
          justifyContent="center"
        >
          <Text fontSize={10} fontWeight="800" color={borderColor}>
            ×{count}
          </Text>
        </YStack>
      )}
    </YStack>
  );
}

interface CardArtProps {
  cardId: string;
  cardVariant?: string;
  role: CardRole;
  testId: string;
}

/**
 * Full-bleed art slot. Renders the variant's sprite when art is
 * available for `(variant, cardId)`; otherwise the role-keyed fallback
 * glyph. Never both — stacking them caused the glyph to bleed through
 * the sprite as a centre smudge.
 */
function CardArt({ cardId, cardVariant, role, testId }: CardArtProps) {
  const showArt = hasArtFor(cardVariant, cardId);
  return (
    <YStack
      data-testid={testId}
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      alignItems="center"
      justifyContent="center"
      backgroundColor="rgba(0,0,0,0.45)"
    >
      {showArt ? (
        <CardImage variant={cardVariant ?? ''} cardType={cardId} />
      ) : (
        (() => {
          const FallbackIcon = ROLE_FALLBACK_ICON[role];
          return (
            <YStack opacity={0.55} data-testid={`hand-card-fallback-${role}`}>
              <FallbackIcon size={56} />
            </YStack>
          );
        })()
      )}
    </YStack>
  );
}
