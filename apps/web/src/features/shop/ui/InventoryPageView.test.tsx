import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
  usePathname: () => '/en/shop/inventory',
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

import { InventoryPageView } from './InventoryPageView';
import { shopEn } from '@/shared/i18n/messages/pages/shop/en';
import { useShopPreviewStore } from '../store/shopPreviewStore';
import type {
  EffectiveShopItem,
  InventoryView,
  WalletBalanceView,
} from '../server/shop.types';

const BALANCE: WalletBalanceView = { coins: 1000, gems: 50, arcadeum: 0 };

const MOCK_BADGE: EffectiveShopItem = {
  id: 'badge-scout',
  category: 'badge',
  rarity: 'common',
  nameKey: 'items.badge.scout.name',
  descKey: 'items.badge.scout.desc',
  assetUrl: '/shop/badges/scout.png',
  defaultPriceAmount: 0,
  defaultPriceCurrency: 'coins',
  available: true,
  purchasable: false,
  priceAmount: 0,
  priceCurrency: 'coins',
  overridden: false,
};

const MOCK_AVATAR: EffectiveShopItem = {
  id: 'avatar-fox',
  category: 'avatar',
  rarity: 'common',
  nameKey: 'items.avatar.fox01.name',
  descKey: 'items.avatar.fox01.desc',
  assetUrl: '/shop/avatars/fox.png',
  defaultPriceAmount: 100,
  defaultPriceCurrency: 'coins',
  available: true,
  priceAmount: 100,
  priceCurrency: 'coins',
  overridden: false,
};

describe('InventoryPageView', () => {
  beforeEach(() => {
    useShopPreviewStore.getState().reset();
  });

  it('renders empty inventory state when no items are owned', () => {
    const emptyInventory: InventoryView = {
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

    const { getByTestId } = render(
      <InventoryPageView
        catalog={[MOCK_BADGE, MOCK_AVATAR]}
        inventory={emptyInventory}
        balance={BALANCE}
        nextGemPack={null}
        gemToCoinRate={100}
        labels={shopEn}
      />,
    );

    expect(getByTestId('inventory-empty')).toBeDefined();
  });

  it('renders badge row with row-badges id when user owns a badge', () => {
    const inventoryWithBadge: InventoryView = {
      items: [
        {
          rowId: 'row-badge-1',
          itemId: 'badge-scout',
          purchaseId: 'grant-1',
          acquiredVia: 'grant',
          paidAmount: null,
          paidCurrency: null,
          soldAt: null,
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ],
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

    const { container, getByTestId } = render(
      <InventoryPageView
        catalog={[MOCK_BADGE, MOCK_AVATAR]}
        inventory={inventoryWithBadge}
        balance={BALANCE}
        nextGemPack={null}
        gemToCoinRate={100}
        labels={shopEn}
      />,
    );

    const badgeRow = container.querySelector('#row-badges');
    expect(badgeRow).not.toBeNull();
    expect(getByTestId('shop-card-badge-scout')).toBeDefined();
    expect(getByTestId('shop-card-action-badge-scout').textContent).toMatch(
      /equip/i,
    );
  });
});
