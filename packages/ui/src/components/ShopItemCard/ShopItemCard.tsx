'use client';

import { YStack, XStack, Text, Image, styled } from 'tamagui';
import { memo } from 'react';
import type { ReactElement } from 'react';
import { RarityBorder, type ShopRarity } from '../RarityBorder/RarityBorder';

export type ShopItemCardPriceCurrency = 'coins' | 'gems';

export interface ShopItemCardProps {
  itemId: string;
  name: string;
  rarity: ShopRarity;
  assetUrl: string;
  priceAmount: number;
  priceCurrency: ShopItemCardPriceCurrency;
  owned?: boolean;
  equipped?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

const CardSurface = styled(YStack, {
  name: 'ShopItemCardSurface',
  backgroundColor: '$background',
  borderRadius: '$3',
  padding: '$3',
  gap: '$2',
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
});

const StateChip = styled(Text, {
  name: 'ShopStateChip',
  paddingHorizontal: '$2',
  paddingVertical: '$1',
  borderRadius: '$2',
  fontSize: '$1',
  fontWeight: '600',
  letterSpacing: 0.4,
  textTransform: 'uppercase',

  variants: {
    tone: {
      neutral: { backgroundColor: '$gray5', color: '$gray12' },
      success: { backgroundColor: '$green5', color: '$green12' },
    },
  } as const,

  defaultVariants: { tone: 'neutral' },
});

const PriceText = styled(Text, {
  name: 'ShopPriceText',
  fontWeight: '700',

  variants: {
    currency: {
      coins: { color: '$yellow11' },
      gems: { color: '$blue11' },
    },
  } as const,

  defaultVariants: { currency: 'coins' },
});

function currencyGlyph(currency: ShopItemCardPriceCurrency): string {
  if (currency === 'coins') return '⨀';
  return '◇';
}

export const ShopItemCard = memo(function ShopItemCard({
  itemId,
  name,
  rarity,
  assetUrl,
  priceAmount,
  priceCurrency,
  owned,
  equipped,
  disabled,
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
          <Image
            source={{ uri: assetUrl, width: 96, height: 96 }}
            width={96}
            height={96}
            alt={name}
            data-testid={`shop-item-image-${itemId}`}
          />
        </PreviewSlot>

        <YStack gap="$1">
          <Text
            fontSize="$3"
            fontWeight="600"
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
              {currencyGlyph(priceCurrency)} {priceAmount}
            </PriceText>
            {equipped ? (
              <StateChip tone="success" data-testid={`shop-item-state-${itemId}`}>
                Equipped
              </StateChip>
            ) : owned ? (
              <StateChip tone="neutral" data-testid={`shop-item-state-${itemId}`}>
                Owned
              </StateChip>
            ) : null}
          </XStack>
        </YStack>
      </CardSurface>
    </RarityBorder>
  );
});
