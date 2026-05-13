'use client';

import { Button, YStack, XStack } from '@arcadeum/ui';
import { Text } from 'tamagui';
import { useShopFiltersStore } from '../store/shopFiltersStore';
import type { ShopCategory, ShopRarity } from '../server/shop.types';

export interface ShopSidebarLabels {
  title: string;
  category: string;
  rarity: string;
  all: string;
  categories: Record<ShopCategory, string>;
  rarities: Record<ShopRarity, string>;
  tabs: { browse: string; inventory: string };
}

const CATEGORIES: Array<ShopCategory | 'all'> = [
  'all',
  'avatar',
  'badge',
  'name_color',
  'game_skin',
];
const RARITIES: ShopRarity[] = ['common', 'rare', 'epic', 'legendary'];

export function ShopSidebar({ labels }: { labels: ShopSidebarLabels }) {
  const tab = useShopFiltersStore((s) => s.tab);
  const category = useShopFiltersStore((s) => s.category);
  const rarities = useShopFiltersStore((s) => s.rarities);
  const setTab = useShopFiltersStore((s) => s.setTab);
  const setCategory = useShopFiltersStore((s) => s.setCategory);
  const toggleRarity = useShopFiltersStore((s) => s.toggleRarity);

  return (
    <YStack gap="$4" padding="$3" data-testid="shop-sidebar">
      <XStack gap="$2">
        <Button
          variant={tab === 'browse' ? 'primary' : 'ghost'}
          onPress={() => setTab('browse')}
        >
          {labels.tabs.browse}
        </Button>
        <Button
          variant={tab === 'inventory' ? 'primary' : 'ghost'}
          onPress={() => setTab('inventory')}
        >
          {labels.tabs.inventory}
        </Button>
      </XStack>

      <YStack gap="$2">
        <Text fontSize="$2" fontWeight="700" textTransform="uppercase">
          {labels.category}
        </Text>
        {CATEGORIES.map((cat) => (
          <Button
            key={cat}
            variant={category === cat ? 'primary' : 'ghost'}
            onPress={() => setCategory(cat)}
            data-testid={`shop-filter-category-${cat}`}
          >
            {cat === 'all' ? labels.all : labels.categories[cat]}
          </Button>
        ))}
      </YStack>

      <YStack gap="$2">
        <Text fontSize="$2" fontWeight="700" textTransform="uppercase">
          {labels.rarity}
        </Text>
        {RARITIES.map((r) => (
          <XStack key={r} alignItems="center" gap="$2">
            <input
              type="checkbox"
              checked={rarities.has(r)}
              onChange={() => toggleRarity(r)}
              aria-label={labels.rarities[r]}
              data-testid={`shop-filter-rarity-${r}`}
            />
            <Text fontSize="$3">{labels.rarities[r]}</Text>
          </XStack>
        ))}
      </YStack>
    </YStack>
  );
}
