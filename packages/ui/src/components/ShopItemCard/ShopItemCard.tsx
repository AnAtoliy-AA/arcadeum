'use client';

import { YStack, XStack, Text, styled } from 'tamagui';
import { memo } from 'react';
import type { ReactElement } from 'react';
import { RarityBorder, type ShopRarity } from '../RarityBorder/RarityBorder';

export type ShopItemCardPriceCurrency = 'coins' | 'gems';

export interface ShopItemCardProps {
  itemId: string;
  name: string;
  rarity: ShopRarity;
  assetUrl: string;
  /**
   * Optional CSS color (hex or linear-gradient) for `name_color` items —
   * rendered as a colored preview swatch in place of the image. Other
   * categories should leave this unset and pass an asset URL instead.
   */
  colorValue?: string | null;
  priceAmount: number;
  priceCurrency: ShopItemCardPriceCurrency;
  owned?: boolean;
  equipped?: boolean;
  disabled?: boolean;
  freeLabel?: string;
  ownedLabel?: string;
  equippedLabel?: string;
  onClick?: () => void;
}

const CardSurface = styled(YStack, {
  name: 'ShopItemCardSurface',
  backgroundColor: '$background',
  borderRadius: '$3',
  padding: '$3',
  gap: '$3',
  cursor: 'pointer',
  hoverStyle: { backgroundColor: '$backgroundHover' },
  pressStyle: { scale: 0.98 },

  variants: {
    disabled: {
      true: {
        opacity: 0.6,
        cursor: 'not-allowed',
        hoverStyle: { backgroundColor: '$background' },
        pressStyle: { scale: 1 },
      },
    },
  } as const,
});

const PreviewSlot = styled(YStack, {
  name: 'ShopItemPreview',
  aspectRatio: 1,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '$backgroundFocus',
  borderRadius: '$2',
  overflow: 'hidden',
  width: '100%',
  position: 'relative',
});

const RarityBadge = styled(Text, {
  name: 'ShopRarityBadge',
  position: 'absolute',
  top: '$2',
  left: '$2',
  paddingHorizontal: '$2',
  paddingVertical: 2,
  borderRadius: '$2',
  fontSize: 10,
  fontWeight: '700',
  letterSpacing: 0.6,
  textTransform: 'uppercase',
  color: '$white',

  variants: {
    rarity: {
      common: { backgroundColor: 'rgba(120,120,120,0.85)' },
      rare: { backgroundColor: 'rgba(59,130,246,0.85)' },
      epic: { backgroundColor: 'rgba(168,85,247,0.85)' },
      legendary: { backgroundColor: 'rgba(250,204,21,0.85)', color: '$gray12' },
    },
  } as const,
});

const StateChip = styled(Text, {
  name: 'ShopStateChip',
  paddingHorizontal: '$2',
  paddingVertical: '$1',
  borderRadius: '$2',
  fontSize: 10,
  fontWeight: '700',
  letterSpacing: 0.6,
  textTransform: 'uppercase',

  variants: {
    tone: {
      neutral: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        color: '$gray11',
      },
      success: {
        backgroundColor: 'rgba(16,185,129,0.18)',
        color: '$green11',
      },
    },
  } as const,

  defaultVariants: { tone: 'neutral' },
});

const PriceText = styled(Text, {
  name: 'ShopPriceText',
  fontWeight: '700',
  fontSize: '$4',

  variants: {
    currency: {
      coins: { color: '#fbbf24' },
      gems: { color: '#a78bfa' },
    },
  } as const,

  defaultVariants: { currency: 'coins' },
});

function currencyGlyph(currency: ShopItemCardPriceCurrency): string {
  return currency === 'coins' ? '🪙' : '💎';
}

export const ShopItemCard = memo(function ShopItemCard({
  itemId,
  name,
  rarity,
  assetUrl,
  colorValue,
  priceAmount,
  priceCurrency,
  owned,
  equipped,
  disabled,
  freeLabel,
  ownedLabel,
  equippedLabel,
  onClick,
}: ShopItemCardProps): ReactElement {
  const handleClick = () => {
    if (disabled) return;
    onClick?.();
  };

  return (
    <RarityBorder rarity={rarity}>
      <CardSurface
        onPress={handleClick}
        disabled={disabled}
        data-testid={`shop-item-card-${itemId}`}
      >
        <PreviewSlot>
          {colorValue ? (
            // Name-color items render the equippable color directly. The big
            // sample text doubles as a legibility check — gradients that look
            // great in the player's lobby may wash out at the chip level.
            <div
              data-testid={`shop-item-color-${itemId}`}
              style={{
                width: '70%',
                height: '70%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
                fontWeight: 800,
                letterSpacing: 1,
                backgroundImage: colorValue.startsWith('linear-gradient')
                  ? colorValue
                  : undefined,
                color: colorValue.startsWith('linear-gradient')
                  ? 'transparent'
                  : colorValue,
                WebkitBackgroundClip: colorValue.startsWith('linear-gradient')
                  ? 'text'
                  : undefined,
                backgroundClip: colorValue.startsWith('linear-gradient')
                  ? 'text'
                  : undefined,
                WebkitTextFillColor: colorValue.startsWith('linear-gradient')
                  ? 'transparent'
                  : undefined,
                filter: equipped
                  ? 'drop-shadow(0 0 8px rgba(16,185,129,0.6))'
                  : undefined,
              }}
            >
              Aa
            </div>
          ) : (
            <img
              src={assetUrl}
              alt={name}
              data-testid={`shop-item-image-${itemId}`}
              style={{
                width: '70%',
                height: '70%',
                objectFit: 'contain',
                filter: equipped
                  ? 'drop-shadow(0 0 8px rgba(16,185,129,0.6))'
                  : undefined,
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
          <RarityBadge rarity={rarity}>{rarity}</RarityBadge>
        </PreviewSlot>

        <YStack gap="$2">
          <Text
            fontSize="$4"
            fontWeight="700"
            numberOfLines={1}
            data-testid={`shop-item-name-${itemId}`}
          >
            {name}
          </Text>
          <XStack justifyContent="space-between" alignItems="center">
            <PriceText
              currency={priceCurrency}
              data-testid={`shop-item-price-${itemId}`}
            >
              {priceAmount === 0
                ? (freeLabel ?? 'Free')
                : `${currencyGlyph(priceCurrency)} ${priceAmount}`}
            </PriceText>
            {equipped ? (
              <StateChip
                tone="success"
                data-testid={`shop-item-state-${itemId}`}
              >
                {equippedLabel ?? 'Equipped'}
              </StateChip>
            ) : owned ? (
              <StateChip
                tone="neutral"
                data-testid={`shop-item-state-${itemId}`}
              >
                {ownedLabel ?? 'Owned'}
              </StateChip>
            ) : null}
          </XStack>
        </YStack>
      </CardSurface>
    </RarityBorder>
  );
});
