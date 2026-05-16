'use client';

import { YStack, XStack } from '@arcadeum/ui';
import { Text, styled, YStack as Stack } from 'tamagui';
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

const RARITY_DOT_COLOR: Record<ShopRarity, string> = {
  common: '#9ca3af',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#facc15',
};

const TabButton = styled(Stack, {
  name: 'ShopTabButton',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  flex: 1,
  height: 36,
  borderRadius: '$3',
  cursor: 'pointer',
  hoverStyle: { backgroundColor: 'rgba(255,255,255,0.05)' },

  variants: {
    active: {
      true: {
        backgroundColor: 'rgba(255,255,255,0.08)',
      },
    },
  } as const,
});

const SidebarRow = styled(Stack, {
  name: 'ShopSidebarRow',
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: '$3',
  paddingVertical: '$2',
  borderRadius: '$2',
  cursor: 'pointer',
  hoverStyle: { backgroundColor: 'rgba(255,255,255,0.05)' },

  variants: {
    active: {
      true: {
        backgroundColor: 'rgba(96,165,250,0.12)',
      },
    },
  } as const,
});

const SectionLabel = styled(Text, {
  name: 'ShopSidebarSection',
  fontSize: 11,
  fontWeight: '700',
  letterSpacing: 1,
  textTransform: 'uppercase',
  color: '$gray11',
  paddingHorizontal: '$3',
});

const RarityDot = styled(Stack, {
  name: 'ShopRarityDot',
  width: 8,
  height: 8,
  borderRadius: 4,
});

export function ShopSidebar({ labels }: { labels: ShopSidebarLabels }) {
  const tab = useShopFiltersStore((s) => s.tab);
  const category = useShopFiltersStore((s) => s.category);
  const rarities = useShopFiltersStore((s) => s.rarities);
  const setTab = useShopFiltersStore((s) => s.setTab);
  const setCategory = useShopFiltersStore((s) => s.setCategory);
  const toggleRarity = useShopFiltersStore((s) => s.toggleRarity);

  return (
    <YStack
      gap="$4"
      padding="$3"
      data-testid="shop-sidebar"
      $sm={{ paddingHorizontal: '$2' }}
    >
      <XStack
        gap={0}
        padding={4}
        backgroundColor="rgba(0,0,0,0.25)"
        borderRadius="$3"
      >
        <TabButton
          active={tab === 'browse'}
          onPress={() => setTab('browse')}
          data-testid="shop-tab-browse"
        >
          <Text
            fontSize="$3"
            fontWeight={tab === 'browse' ? '700' : '500'}
            color={tab === 'browse' ? '$white' : '$gray11'}
          >
            {labels.tabs.browse}
          </Text>
        </TabButton>
        <TabButton
          active={tab === 'inventory'}
          onPress={() => setTab('inventory')}
          data-testid="shop-tab-inventory"
        >
          <Text
            fontSize="$3"
            fontWeight={tab === 'inventory' ? '700' : '500'}
            color={tab === 'inventory' ? '$white' : '$gray11'}
          >
            {labels.tabs.inventory}
          </Text>
        </TabButton>
      </XStack>

      <YStack gap="$2">
        <SectionLabel>{labels.category}</SectionLabel>
        <YStack gap={2}>
          {CATEGORIES.map((cat) => {
            const isActive = category === cat;
            return (
              <SidebarRow
                key={cat}
                active={isActive}
                onPress={() => setCategory(cat)}
                data-testid={`shop-filter-category-${cat}`}
              >
                <Text
                  fontSize="$3"
                  fontWeight={isActive ? '700' : '500'}
                  color={isActive ? '$white' : '$gray11'}
                >
                  {cat === 'all' ? labels.all : labels.categories[cat]}
                </Text>
              </SidebarRow>
            );
          })}
        </YStack>
      </YStack>

      <YStack gap="$2">
        <SectionLabel>{labels.rarity}</SectionLabel>
        <YStack gap={2}>
          {RARITIES.map((r) => {
            const checked = rarities.has(r);
            return (
              <SidebarRow
                key={r}
                onPress={() => toggleRarity(r)}
                data-testid={`shop-filter-rarity-${r}`}
                gap="$3"
              >
                <Stack
                  width={16}
                  height={16}
                  borderRadius={4}
                  borderWidth={1}
                  borderColor={
                    checked ? RARITY_DOT_COLOR[r] : 'rgba(255,255,255,0.25)'
                  }
                  backgroundColor={
                    checked ? RARITY_DOT_COLOR[r] : 'transparent'
                  }
                  alignItems="center"
                  justifyContent="center"
                >
                  {checked ? (
                    <Text fontSize={10} color="$white" fontWeight="900">
                      ✓
                    </Text>
                  ) : null}
                </Stack>
                <RarityDot backgroundColor={RARITY_DOT_COLOR[r]} />
                <Text fontSize="$3" color="$gray11">
                  {labels.rarities[r]}
                </Text>
              </SidebarRow>
            );
          })}
        </YStack>
      </YStack>
    </YStack>
  );
}
