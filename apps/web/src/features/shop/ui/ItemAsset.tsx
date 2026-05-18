'use client';

import Image from 'next/image';
import { YStack } from '@arcadeum/ui';
import { Text } from 'tamagui';
import { nameColorRenderProps } from '../lib/nameColor';
import type { EffectiveShopItem } from '../server/shop.types';

export interface ItemAssetProps {
  item: EffectiveShopItem;
  size: number;
}

export function ItemAsset({ item, size }: ItemAssetProps) {
  if (item.category === 'name_color') {
    const props = nameColorRenderProps(item.colorValue ?? null);
    return (
      <YStack
        width={size}
        height={size}
        alignItems="center"
        justifyContent="center"
        data-testid={`shop-asset-${item.id}`}
      >
        <Text
          fontWeight="900"
          fontSize={Math.round(size * 0.55)}
          {...props}
          color={props.color}
        >
          Aa
        </Text>
      </YStack>
    );
  }

  if (item.assetUrl) {
    return (
      <YStack
        width={size}
        height={size}
        alignItems="center"
        justifyContent="center"
        overflow="hidden"
        data-testid={`shop-asset-${item.id}`}
      >
        <Image
          src={item.assetUrl}
          alt=""
          width={size}
          height={size}
          style={{ objectFit: 'contain' }}
          unoptimized
        />
      </YStack>
    );
  }

  return (
    <YStack
      width={size}
      height={size}
      alignItems="center"
      justifyContent="center"
      data-testid={`shop-asset-${item.id}`}
    >
      <Text fontSize={Math.round(size * 0.55)}>◉</Text>
    </YStack>
  );
}
