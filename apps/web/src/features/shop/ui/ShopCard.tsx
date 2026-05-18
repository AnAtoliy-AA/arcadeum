'use client';

import { useCallback, useRef, useState } from 'react';
import { XStack, YStack } from '@arcadeum/ui';
import { Text, styled, YStack as Stack } from 'tamagui';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import { track } from '@/shared/lib/analytics';
import { useShopPreviewStore } from '../store/shopPreviewStore';
import { RARITY_COLOR, RARITY_GLOW } from '../lib/rarity';
import { CURRENCY_COLOR, CURRENCY_GLYPH } from '../lib/currency';
import { ItemAsset } from './ItemAsset';
import type { EffectiveShopItem } from '../server/shop.types';

export interface ShopCardLabels {
  owned: string;
  equipped: string;
  buyEquip: string;
}

export interface ShopCardProps {
  item: EffectiveShopItem;
  owned: boolean;
  equipped: boolean;
  small?: boolean;
  labels: ShopCardLabels;
  onPurchase: (item: EffectiveShopItem) => void;
}

const CardFrame = styled(Stack, {
  name: 'ShopCardFrame',
  flexDirection: 'column',
  alignItems: 'stretch',
  width: 200,
  borderRadius: '$4',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.08)',
  backgroundColor: 'rgba(255,255,255,0.02)',
  overflow: 'hidden',
  cursor: 'pointer',
  hoverStyle: {
    borderColor: 'rgba(255,255,255,0.22)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    y: -2,
  },
  // `focusStyle` maps to `:focus-visible` in Tamagui's CSS plugin — gives
  // keyboard users an obvious cue without surprising mouse users on click.
  focusStyle: {
    borderColor: 'rgba(125,211,252,0.7)',
    outlineColor: 'rgba(125,211,252,0.45)',
    outlineWidth: 2,
    outlineStyle: 'solid',
    outlineOffset: 2,
  },

  variants: {
    small: {
      true: { width: 144 },
    },
  } as const,
});

const ArtBox = styled(Stack, {
  name: 'ShopCardArt',
  position: 'relative',
  height: 140,
  alignItems: 'center',
  justifyContent: 'center',

  variants: {
    small: {
      true: { height: 96 },
    },
  } as const,
});

const Chip = styled(Stack, {
  name: 'ShopCardChip',
  paddingHorizontal: 6,
  paddingVertical: 2,
  borderRadius: '$2',
  borderWidth: 1,
});

export function ShopCard({
  item,
  owned,
  equipped,
  small,
  labels,
  onPurchase,
}: ShopCardProps) {
  const { t } = useTranslation();
  const setHover = useShopPreviewStore((s) => s.setHover);
  const [hovered, setHovered] = useState(false);
  const hoverRef = useRef(false);

  const name = String(
    t(`pages.shop.${item.nameKey}` as TranslationKey),
  ) as string;

  const accent = RARITY_COLOR[item.rarity];
  const glow = RARITY_GLOW[item.rarity];

  const handleEnter = useCallback(() => {
    if (hoverRef.current) return;
    hoverRef.current = true;
    setHover(item);
    setHovered(true);
    track('shop.preview.hover', {
      itemId: item.id,
      rarity: item.rarity,
      category: item.category,
    });
  }, [item, setHover]);

  const handleLeave = useCallback(() => {
    if (!hoverRef.current) return;
    hoverRef.current = false;
    setHover(null);
    setHovered(false);
  }, [setHover]);

  const handleClick = useCallback(() => {
    if (owned) return;
    track('shop.purchase.click', {
      itemId: item.id,
      currency: item.priceCurrency,
      amount: item.priceAmount,
      source: 'card',
    });
    onPurchase(item);
  }, [owned, item, onPurchase]);

  const handleKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <CardFrame
      small={small}
      data-testid={`shop-card-${item.id}`}
      data-rarity={item.rarity}
      data-owned={owned ? 'true' : 'false'}
      data-equipped={equipped ? 'true' : 'false'}
      onPointerEnter={handleEnter}
      onPointerLeave={handleLeave}
      onFocus={handleEnter}
      onBlur={handleLeave}
      onPress={handleClick}
      onKeyDown={handleKey}
      tabIndex={0}
      role="button"
      style={{
        borderColor: equipped ? accent : undefined,
        boxShadow: hovered ? `0 12px 30px -16px ${glow}` : undefined,
      }}
    >
      <ArtBox
        small={small}
        style={{
          backgroundImage: `radial-gradient(120% 80% at 50% 0%, ${glow}, transparent 70%)`,
        }}
      >
        <ItemAsset item={item} size={small ? 64 : 96} />

        <XStack
          position="absolute"
          top={8}
          right={8}
          gap={4}
          pointerEvents="none"
        >
          {equipped ? (
            <Chip backgroundColor={`${accent}1f`} borderColor={`${accent}66`}>
              <Text
                fontSize={9}
                letterSpacing={1}
                textTransform="uppercase"
                fontWeight="800"
                color={accent}
              >
                {labels.equipped}
              </Text>
            </Chip>
          ) : owned ? (
            <Chip
              backgroundColor="rgba(255,255,255,0.06)"
              borderColor="rgba(255,255,255,0.18)"
            >
              <Text
                fontSize={9}
                letterSpacing={1}
                textTransform="uppercase"
                fontWeight="700"
                color="$gray11"
              >
                {labels.owned}
              </Text>
            </Chip>
          ) : null}
        </XStack>

        {hovered && !owned ? (
          <YStack
            position="absolute"
            bottom={8}
            left={8}
            right={8}
            paddingHorizontal="$2"
            paddingVertical="$1"
            borderRadius="$2"
            backgroundColor="rgba(0,0,0,0.72)"
            alignItems="center"
            pointerEvents="none"
            data-testid={`shop-card-cta-${item.id}`}
          >
            <Text
              fontSize={11}
              letterSpacing={1}
              textTransform="uppercase"
              fontWeight="800"
              color="$white"
            >
              {labels.buyEquip}
            </Text>
          </YStack>
        ) : null}
      </ArtBox>

      <YStack paddingHorizontal="$3" paddingVertical="$2" gap={6}>
        <Text
          fontSize={small ? 12 : 13}
          fontWeight="700"
          color="$white"
          numberOfLines={1}
        >
          {name}
        </Text>
        <XStack alignItems="center" justifyContent="space-between" gap={6}>
          <Stack
            flexDirection="row"
            alignItems="center"
            gap={4}
            paddingHorizontal={6}
            paddingVertical={2}
            borderRadius="$2"
            backgroundColor={`${accent}14`}
            borderWidth={1}
            borderColor={`${accent}44`}
          >
            <Stack
              width={6}
              height={6}
              borderRadius={3}
              backgroundColor={accent}
            />
            <Text
              fontSize={9}
              letterSpacing={1}
              textTransform="uppercase"
              fontWeight="800"
              color={accent}
            >
              {item.rarity}
            </Text>
          </Stack>
          <XStack alignItems="center" gap={4}>
            <Text fontSize={12}>{CURRENCY_GLYPH[item.priceCurrency]}</Text>
            <Text
              fontSize={12}
              fontWeight="800"
              color={CURRENCY_COLOR[item.priceCurrency]}
            >
              {item.priceAmount.toLocaleString()}
            </Text>
          </XStack>
        </XStack>
      </YStack>
    </CardFrame>
  );
}
