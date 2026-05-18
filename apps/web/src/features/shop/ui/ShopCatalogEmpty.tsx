'use client';

import { YStack } from '@arcadeum/ui';
import { Text } from 'tamagui';

export interface ShopCatalogEmptyLabels {
  title: string;
  body: string;
}

export function ShopCatalogEmpty({
  labels,
}: {
  labels: ShopCatalogEmptyLabels;
}) {
  return (
    <YStack
      gap={6}
      padding="$4"
      borderRadius="$4"
      borderWidth={1}
      borderColor="rgba(252,165,165,0.30)"
      backgroundColor="rgba(239,68,68,0.08)"
      data-testid="shop-catalog-empty"
    >
      <Text fontSize="$5" fontWeight="700">
        {labels.title}
      </Text>
      <Text fontSize="$3" color="$gray11">
        {labels.body}
      </Text>
    </YStack>
  );
}
