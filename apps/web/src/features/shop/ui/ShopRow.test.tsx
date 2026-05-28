import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { TamaguiProvider } from 'tamagui';
import config from '../../../shared/config/tamagui.config';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));
vi.mock('../server/shop.actions', () => ({
  equipItemAction: vi.fn(),
  unequipItemAction: vi.fn(),
  purchaseItemAction: vi.fn(),
}));
vi.mock('../lib/syncEquippedToSession', () => ({
  syncEquippedToSession: vi.fn(),
}));

import { ShopRow } from './ShopRow';
import { useShopPreviewStore } from '../store/shopPreviewStore';
import type {
  EffectiveShopItem,
  EquippedView,
  WalletBalanceView,
} from '../server/shop.types';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <TamaguiProvider config={config} defaultTheme="dark">
    {children}
  </TamaguiProvider>
);

const cardLabels = {
  owned: 'Owned',
  equipped: 'Equipped',
  buyEquip: 'Buy',
  equip: 'Equip',
  unequip: 'Unequip',
  sell: 'Sell',
};
const rowLabels = {
  title: 'Avatars',
  eyebrow: '{count} items',
  viewAll: 'All',
  collapse: 'Collapse',
};

const EQUIPPED_EMPTY: EquippedView = {
  avatar: null,
  badge: null,
  name_color: null,
  game_skin: null,
  banner: null,
  aura: null,
  frame: null,
  background: null,
};

const BALANCE: WalletBalanceView = { coins: 1_000, gems: 50 };

function item(id: string): EffectiveShopItem {
  return {
    id,
    category: 'avatar',
    rarity: 'common',
    nameKey: 'items.avatar.fox01.name',
    descKey: 'items.avatar.fox01.desc',
    assetUrl: '/x.png',
    defaultPriceAmount: 100,
    defaultPriceCurrency: 'coins',
    available: true,
    priceAmount: 100,
    priceCurrency: 'coins',
    overridden: false,
  };
}

describe('ShopRow', () => {
  beforeEach(() => {
    useShopPreviewStore.getState().reset();
  });

  it('returns null when items is empty', () => {
    const { container } = render(
      <Wrapper>
        <ShopRow
          id="row-empty"
          items={[]}
          inventory={[]}
          equipped={EQUIPPED_EMPTY}
          balance={BALANCE}
          labels={rowLabels}
          cardLabels={cardLabels}
          onPurchaseFallback={() => {}}
        />
      </Wrapper>,
    );
    expect(
      container.querySelector('[data-testid="shop-row-row-empty"]'),
    ).toBeNull();
  });

  it('flags data-active=true when the matching slot is selected', () => {
    useShopPreviewStore.getState().setActiveSlot('avatar');
    const { getByTestId } = render(
      <Wrapper>
        <ShopRow
          id="row-avatars"
          sectionKey="avatar"
          items={[item('a'), item('b')]}
          inventory={[]}
          equipped={EQUIPPED_EMPTY}
          balance={BALANCE}
          labels={rowLabels}
          cardLabels={cardLabels}
          onPurchaseFallback={() => {}}
        />
      </Wrapper>,
    );
    expect(
      getByTestId('shop-row-row-avatars').getAttribute('data-active'),
    ).toBe('true');
  });

  it('stays inactive when a different slot is selected', () => {
    useShopPreviewStore.getState().setActiveSlot('badge');
    const { getByTestId } = render(
      <Wrapper>
        <ShopRow
          id="row-avatars"
          sectionKey="avatar"
          items={[item('a')]}
          inventory={[]}
          equipped={EQUIPPED_EMPTY}
          balance={BALANCE}
          labels={rowLabels}
          cardLabels={cardLabels}
          onPurchaseFallback={() => {}}
        />
      </Wrapper>,
    );
    expect(
      getByTestId('shop-row-row-avatars').getAttribute('data-active'),
    ).toBe('false');
  });
});
