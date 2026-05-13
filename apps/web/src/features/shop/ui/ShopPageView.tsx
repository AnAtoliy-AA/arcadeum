'use client';

import { useMemo } from 'react';
import { YStack, XStack } from '@arcadeum/ui';
import { Text } from 'tamagui';
import { useShopFiltersStore } from '../store/shopFiltersStore';
import { ShopSidebar, type ShopSidebarLabels } from './ShopSidebar';
import { ShopGrid, type ShopGridLabels } from './ShopGrid';
import { InventoryTab, type InventoryTabLabels } from './InventoryTab';
import type {
  EffectiveShopItem,
  InventoryView,
  WalletBalanceView,
} from '../server/shop.types';

export interface ShopPageLabels {
  title: string;
  subtitle: string;
  sidebar: ShopSidebarLabels;
  grid: ShopGridLabels;
  inventory: InventoryTabLabels;
}

export interface ShopPageViewProps {
  catalog: EffectiveShopItem[];
  inventory: InventoryView;
  balance: WalletBalanceView;
  gemToCoinRate: number;
  labels: ShopPageLabels;
}

export function ShopPageView({
  catalog,
  inventory,
  balance,
  gemToCoinRate,
  labels,
}: ShopPageViewProps) {
  const tab = useShopFiltersStore((s) => s.tab);

  const liveCatalog = useMemo(
    () => catalog.filter((item) => item.available),
    [catalog],
  );

  return (
    <YStack
      maxWidth={1280}
      marginHorizontal="auto"
      paddingHorizontal="$4"
      paddingVertical="$5"
      gap="$4"
      width="100%"
    >
      <YStack gap="$1">
        <Text fontSize="$8" fontWeight="800">
          {labels.title}
        </Text>
        <Text fontSize="$3" color="$colorPress">
          {labels.subtitle}
        </Text>
      </YStack>

      <XStack
        gap="$4"
        flexDirection="row"
        $sm={{ flexDirection: 'column' }}
        alignItems="flex-start"
      >
        <YStack
          width={240}
          $sm={{ width: '100%' }}
          backgroundColor="$backgroundFocus"
          borderRadius="$4"
        >
          <ShopSidebar labels={labels.sidebar} />
        </YStack>

        <YStack flex={1} width="100%">
          {tab === 'browse' ? (
            <ShopGrid
              catalog={liveCatalog}
              inventory={inventory.items}
              equipped={inventory.equipped}
              balance={balance}
              labels={labels.grid}
            />
          ) : (
            <InventoryTab
              catalog={liveCatalog}
              inventory={inventory.items}
              equipped={inventory.equipped}
              balance={balance}
              gemToCoinRate={gemToCoinRate}
              labels={labels.inventory}
            />
          )}
        </YStack>
      </XStack>
    </YStack>
  );
}
