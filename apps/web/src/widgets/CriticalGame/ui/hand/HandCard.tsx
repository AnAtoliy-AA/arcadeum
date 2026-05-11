'use client';

import { YStack, Text } from 'tamagui';
import { useTranslation } from '@/shared/lib/useTranslation';
import {
  getCardTranslationKey,
  getCardDescriptionKey,
} from '../../lib/cardUtils';
import { getCardRole, type CardRole } from '../../lib/cardRoles';
import { CardImage } from '../styles/card-image';
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

const ROLE_GLOW: Record<CardRole, string> = {
  attack: 'rgba(239, 68, 68, 0.35)',
  defuse: 'rgba(52, 211, 153, 0.35)',
  skip: 'rgba(56, 189, 248, 0.35)',
  nope: 'rgba(245, 158, 11, 0.35)',
  favor: 'rgba(167, 139, 250, 0.35)',
  see: 'rgba(34, 211, 238, 0.35)',
  combo: 'rgba(250, 204, 21, 0.35)',
  special: 'rgba(244, 114, 182, 0.40)',
};

/**
 * Fallback glyph used when the active card variant has no sprite sheet
 * (e.g. the unthemed "default" variant). Keyed by role so the icon at
 * least tracks the border colour.
 */
const ROLE_FALLBACK_GLYPH: Record<CardRole, string> = {
  attack: '⚔',
  defuse: '🛡',
  skip: '👟',
  nope: '✋',
  favor: '🤝',
  see: '👁',
  combo: '🃏',
  special: '✨',
};

const SELECT_RING = '#34d399';
const SELECT_GLOW = 'rgba(52, 211, 153, 0.55)';

/**
 * Single-card cell for the widget-mode hand. Border colour + corner icon
 * come from the card's role family (`cardRoles.ts`). Selection lifts the
 * card and swaps the border to the accent green + glow.
 *
 * Card art is intentionally not pulled from the legacy `CardImage`
 * sprite — the widget aims for compact info density, not a faithful
 * reproduction of the table-mode card. The legacy `PlayerHand` keeps
 * the rich art on the flag-off path.
 */
export function HandCard({
  card,
  isSelected,
  disabled = false,
  cardVariant,
  count,
  onToggle,
}: HandCardProps) {
  const { t } = useTranslation();
  const role = getCardRole(card.id);
  const name = t(getCardTranslationKey(card.id, cardVariant));
  const description = t(getCardDescriptionKey(card.id));
  const borderColor = isSelected ? SELECT_RING : ROLE_BORDER[role];
  const glow = isSelected ? SELECT_GLOW : ROLE_GLOW[role];

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
      width={isSelected ? 132 : 124}
      height={isSelected ? 208 : 196}
      borderRadius={10}
      borderWidth={2}
      borderColor={borderColor}
      backgroundColor="rgba(8,12,20,0.85)"
      transform={isSelected ? [{ translateY: -8 }] : undefined}
      cursor={disabled ? 'default' : 'pointer'}
      opacity={disabled ? 0.7 : 1}
      alignItems="stretch"
      justifyContent="flex-start"
      paddingHorizontal={6}
      paddingVertical={8}
      gap={4}
      shadowColor={glow}
      shadowRadius={isSelected ? 14 : 8}
      shadowOpacity={1}
      shadowOffset={{ width: 0, height: 0 }}
      hoverStyle={
        disabled
          ? undefined
          : {
              transform: [{ translateY: isSelected ? -10 : -4 }],
              shadowRadius: isSelected ? 18 : 12,
            }
      }
      flexShrink={0}
    >
      <YStack
        data-testid={`hand-card-art-${card.uid}`}
        position="relative"
        width="100%"
        height={96}
        borderRadius={6}
        overflow="hidden"
        backgroundColor="rgba(0,0,0,0.45)"
        alignItems="center"
        justifyContent="center"
      >
        {/* Role glyph sits underneath so it shows through when the
            active variant has no sprite sheet (CardImage renders null).
            When a sheet exists, the absolutely-positioned sprite layer
            paints over the glyph. */}
        <Text fontSize={36} lineHeight={40} opacity={0.6}>
          {ROLE_FALLBACK_GLYPH[role]}
        </Text>
        <CardImage variant={cardVariant ?? ''} cardType={card.id} />
      </YStack>
      <Text
        data-testid={`hand-card-name-${card.uid}`}
        fontSize={11}
        fontWeight="800"
        letterSpacing={0.4}
        textTransform="uppercase"
        textAlign="center"
        numberOfLines={2}
        color={borderColor}
      >
        {name}
      </Text>
      <Text
        data-testid={`hand-card-description-${card.uid}`}
        fontSize={9}
        lineHeight={12}
        textAlign="center"
        numberOfLines={4}
        color="rgba(226, 232, 240, 0.78)"
      >
        {description}
      </Text>
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
