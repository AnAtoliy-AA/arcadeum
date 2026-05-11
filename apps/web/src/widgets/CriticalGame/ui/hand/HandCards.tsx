'use client';

import { XStack, YStack, Text } from 'tamagui';
import { useTranslation } from '@/shared/lib/useTranslation';
import { getCardTranslationKey } from '../../lib/cardUtils';
import type { HandCardInstance } from '../../lib/combo';

interface HandCardsProps {
  cards: HandCardInstance[];
  selectedUids: string[];
  onToggleSelect: (uid: string) => void;
  cardVariant?: string;
  disabled?: boolean;
}

/**
 * Horizontal card track for the player's hand. Click toggles selection
 * in `selectedUids` (state lives one level up in `MatchWidget` so the
 * arena's `ComboCard` can read it too).
 *
 * This is an intentionally-simple visual list for ARC-635 — sprite art,
 * fan layouts, name/description toggles, mobile popovers, and the
 * autoplay panel still live on the legacy `PlayerHand` (flag-off path).
 * The minimum-viable widget-mode hand only needs select + play + draw.
 */
export function HandCards({
  cards,
  selectedUids,
  onToggleSelect,
  cardVariant,
  disabled = false,
}: HandCardsProps) {
  const { t } = useTranslation();
  const selected = new Set(selectedUids);

  return (
    <XStack
      data-testid="hand-cards"
      flex={1}
      flexWrap="wrap"
      gap="$2"
      padding="$2"
      $sm={{ overflow: 'scroll', flexWrap: 'nowrap' }}
    >
      {cards.map((card) => {
        const isSelected = selected.has(card.uid);
        const name = t(getCardTranslationKey(card.id, cardVariant));
        return (
          <YStack
            key={card.uid}
            data-testid={`hand-card-${card.uid}`}
            data-card={card.id}
            data-selected={isSelected ? 'true' : 'false'}
            role="button"
            tabIndex={disabled ? -1 : 0}
            aria-pressed={isSelected}
            aria-disabled={disabled}
            onPress={disabled ? undefined : () => onToggleSelect(card.uid)}
            onKeyDown={
              disabled
                ? undefined
                : (e: React.KeyboardEvent) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onToggleSelect(card.uid);
                    }
                  }
            }
            width={isSelected ? 92 : 88}
            height={isSelected ? 128 : 120}
            borderRadius={10}
            borderWidth={isSelected ? 2 : 1}
            borderColor={isSelected ? '#34d399' : 'rgba(255,255,255,0.18)'}
            backgroundColor="rgba(0,0,0,0.55)"
            transform={isSelected ? [{ translateY: -8 }] : undefined}
            cursor={disabled ? 'default' : 'pointer'}
            opacity={disabled ? 0.7 : 1}
            alignItems="center"
            justifyContent="center"
            paddingHorizontal="$1"
            paddingVertical="$2"
            gap="$1"
            hoverStyle={
              disabled ? undefined : { borderColor: 'rgba(52, 211, 153, 0.6)' }
            }
          >
            <Text
              fontSize={11}
              fontWeight="800"
              letterSpacing={0.4}
              textTransform="uppercase"
              textAlign="center"
              numberOfLines={2}
            >
              {name}
            </Text>
          </YStack>
        );
      })}
    </XStack>
  );
}
