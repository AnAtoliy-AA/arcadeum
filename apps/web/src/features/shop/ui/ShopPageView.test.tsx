import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
  usePathname: () => '/en/shop',
}));
vi.mock('../server/shop.actions', () => ({
  equipItemAction: vi.fn(),
  unequipItemAction: vi.fn(),
  purchaseItemAction: vi.fn(),
}));
vi.mock('../lib/syncEquippedToSession', () => ({
  syncEquippedToSession: vi.fn(),
}));
vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));
vi.mock('@/shared/lib/language/useLanguage', () => ({
  useLanguage: () => ({
    locale: 'en',
    setLanguage: vi.fn(),
  }),
}));

import { ShopPageView } from './ShopPageView';
import { shopEn } from '@/shared/i18n/messages/pages/shop/en';
import { useShopPreviewStore } from '../store/shopPreviewStore';
import type {
  EffectiveShopItem,
  InventoryView,
  WalletBalanceView,
} from '../server/shop.types';

const BALANCE: WalletBalanceView = { coins: 1000, gems: 50, arcadeum: 0 };

const EMPTY_INVENTORY: InventoryView = {
  items: [],
  equipped: {
    avatar: null,
    badge: null,
    name_color: null,
    game_skin: null,
    banner: null,
    aura: null,
    frame: null,
    background: null,
  },
};

function createBadge(id: string): EffectiveShopItem {
  return {
    id,
    category: 'badge',
    rarity: 'common',
    nameKey: `items.badge.${id}.name`,
    descKey: `items.badge.${id}.desc`,
    assetUrl: `/shop/badges/${id}.png`,
    defaultPriceAmount: 0,
    defaultPriceCurrency: 'coins',
    available: true,
    purchasable: false,
    priceAmount: 0,
    priceCurrency: 'coins',
    overridden: false,
  };
}

describe('ShopPageView', () => {
  beforeEach(() => {
    useShopPreviewStore.getState().reset();
  });

  it('renders badges ordered by level in ascending order even when catalog is out of order', () => {
    const catalog: EffectiveShopItem[] = [
      createBadge('badge-nexus'),
      createBadge('badge-newcomer'),
      createBadge('badge-scout'),
      createBadge('badge-paladin'),
    ];

    const { container } = render(
      <ShopPageView
        catalog={catalog}
        featuredDrop={null}
        inventory={EMPTY_INVENTORY}
        balance={BALANCE}
        nextGemPack={null}
        gemToCoinRate={100}
        labels={shopEn}
        isAuthenticated={true}
      />,
    );

    const badgeRow = container.querySelector('#row-badges');
    expect(badgeRow).not.toBeNull();

    const renderedBadgeIds = Array.from(
      badgeRow?.querySelectorAll('[data-testid^="shop-card-badge-"]') ?? [],
    ).map((el) => el.getAttribute('data-testid')?.replace('shop-card-', ''));

    expect(renderedBadgeIds).toEqual([
      'badge-newcomer',
      'badge-scout',
      'badge-paladin',
      'badge-nexus',
    ]);
  });
});
