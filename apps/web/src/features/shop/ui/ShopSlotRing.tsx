'use client';

import { XStack, YStack } from '@arcadeum/ui';
import { Text, styled, YStack as Stack } from 'tamagui';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import { ItemAsset } from './ItemAsset';
import type { EffectiveShopItem, ShopCategory } from '../server/shop.types';

export interface ShopSlotLabels {
  label: string;
  desc: string;
  empty: string;
}

export interface ShopSlotRingLabels {
  avatar: ShopSlotLabels;
  badge: ShopSlotLabels;
  name_color: ShopSlotLabels;
  game_skin: ShopSlotLabels;
  banner: ShopSlotLabels;
  aura: ShopSlotLabels;
  frame: ShopSlotLabels;
  background: ShopSlotLabels;
}

export interface ShopSlotRingProps {
  preview: Record<ShopCategory, EffectiveShopItem | null | undefined>;
  activeSlot: ShopCategory | null;
  hoverItem: EffectiveShopItem | null;
  labels: ShopSlotRingLabels;
  onSlotClick: (slot: ShopCategory) => void;
}

const SLOT_ORDER: ShopCategory[] = [
  'avatar',
  'frame',
  'background',
  'badge',
  'banner',
  'aura',
  'name_color',
  'game_skin',
];

const SlotTile = styled(Stack, {
  name: 'ShopSlotTile',
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10,
  padding: 10,
  borderRadius: '$3',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.08)',
  backgroundColor: 'rgba(255,255,255,0.02)',
  cursor: 'pointer',
  minHeight: 62,
  hoverStyle: {
    borderColor: 'rgba(255,255,255,0.22)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },

  variants: {
    active: {
      true: {
        borderColor: 'rgba(96,165,250,0.6)',
        backgroundColor: 'rgba(96,165,250,0.08)',
      },
    },
    previewing: {
      true: {
        borderColor: 'rgba(34,197,94,0.6)',
        backgroundColor: 'rgba(16,185,129,0.10)',
      },
    },
  } as const,
});

export function ShopSlotRing({
  preview,
  activeSlot,
  hoverItem,
  labels,
  onSlotClick,
}: ShopSlotRingProps) {
  const { t } = useTranslation();

  return (
    <YStack gap="$2" data-testid="shop-slot-ring">
      <XStack flexWrap="wrap" gap="$2">
        {SLOT_ORDER.map((slot) => {
          const slotLabels = labels[slot];
          const item = preview[slot] ?? null;
          const isActive = activeSlot === slot;
          const isPreviewing = hoverItem?.category === slot;
          const itemName = item
            ? String(t(`pages.shop.${item.nameKey}` as TranslationKey))
            : slotLabels.empty;

          return (
            <SlotTile
              key={slot}
              active={isActive}
              previewing={isPreviewing}
              onPress={() => onSlotClick(slot)}
              role="button"
              tabIndex={0}
              data-testid={`shop-slot-${slot}`}
              data-active={isActive ? 'true' : 'false'}
              data-previewing={isPreviewing ? 'true' : 'false'}
              width="48%"
              $sm={{ width: '100%' }}
            >
              <Stack
                width={40}
                height={40}
                borderRadius="$2"
                alignItems="center"
                justifyContent="center"
                backgroundColor="rgba(0,0,0,0.30)"
                borderWidth={1}
                borderColor="rgba(255,255,255,0.10)"
                overflow="hidden"
              >
                {item ? (
                  <ItemAsset item={item} size={32} />
                ) : (
                  <Text fontSize={20} color="$gray10">
                    ·
                  </Text>
                )}
              </Stack>
              <YStack flex={1} minWidth={0} gap={2}>
                <Text
                  fontSize={9}
                  letterSpacing={1.2}
                  textTransform="uppercase"
                  fontWeight="800"
                  color="$gray11"
                >
                  {slotLabels.label}
                </Text>
                <Text
                  fontSize={12}
                  fontWeight="700"
                  color="$white"
                  numberOfLines={1}
                >
                  {itemName}
                </Text>
              </YStack>
            </SlotTile>
          );
        })}
      </XStack>
    </YStack>
  );
}
