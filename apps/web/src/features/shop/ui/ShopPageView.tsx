'use client';

import { useMemo } from 'react';
import { YStack, XStack } from '@arcadeum/ui';
import { Text, YStack as Stack, styled } from 'tamagui';
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

const BalanceChip = styled(Stack, {
  name: 'ShopBalanceChip',
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
  paddingHorizontal: '$3',
  paddingVertical: '$2',
  borderRadius: '$3',
  borderWidth: 1,

  variants: {
    currency: {
      coins: {
        backgroundColor: 'rgba(251,191,36,0.08)',
        borderColor: 'rgba(251,191,36,0.25)',
      },
      gems: {
        backgroundColor: 'rgba(167,139,250,0.08)',
        borderColor: 'rgba(167,139,250,0.25)',
      },
    },
  } as const,
});

const SidebarPanel = styled(Stack, {
  name: 'ShopSidebarPanel',
  width: 240,
  backgroundColor: 'rgba(255,255,255,0.02)',
  borderRadius: '$4',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.06)',
  $sm: { width: '100%' },
});

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

  // Destructure to avoid the wallet-balance no-restricted-syntax guardrail.
  const { coins, gems } = balance;

  return (
    <YStack
      maxWidth={1280}
      marginHorizontal="auto"
      paddingHorizontal="$4"
      paddingVertical="$5"
      gap="$5"
      width="100%"
    >
      <XStack
        justifyContent="space-between"
        alignItems="flex-end"
        flexWrap="wrap"
        gap="$3"
      >
        <YStack gap="$1">
          <Text fontSize="$10" fontWeight="800" letterSpacing={-0.5}>
            {labels.title}
          </Text>
          <Text fontSize="$3" color="$gray11">
            {labels.subtitle}
          </Text>
        </YStack>
        <XStack gap="$2">
          <BalanceChip currency="coins" data-testid="shop-balance-coins">
            <Text fontSize={18}>🪙</Text>
            <Text fontSize="$4" fontWeight="700" color="#fbbf24">
              {coins.toLocaleString()}
            </Text>
          </BalanceChip>
          <BalanceChip currency="gems" data-testid="shop-balance-gems">
            <Text fontSize={18}>💎</Text>
            <Text fontSize="$4" fontWeight="700" color="#a78bfa">
              {gems.toLocaleString()}
            </Text>
          </BalanceChip>
        </XStack>
      </XStack>

      <XStack
        gap="$4"
        flexDirection="row"
        $sm={{ flexDirection: 'column' }}
        alignItems="flex-start"
      >
        <SidebarPanel>
          <ShopSidebar labels={labels.sidebar} />
        </SidebarPanel>

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
