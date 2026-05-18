import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, render, fireEvent } from '@testing-library/react';
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

import { ShopCard, type ShopCardLabels } from './ShopCard';
import { useShopPreviewStore } from '../store/shopPreviewStore';
import type {
  EffectiveShopItem,
  ShopCategory,
  WalletBalanceView,
} from '../server/shop.types';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <TamaguiProvider config={config} defaultTheme="dark">
    {children}
  </TamaguiProvider>
);

const labels: ShopCardLabels = {
  owned: 'Owned',
  equipped: 'Equipped',
  buyEquip: 'Buy & equip',
  equip: 'Equip',
  unequip: 'Unequip',
};

const BALANCE: WalletBalanceView = { coins: 5_000, gems: 200 };

function makeItem(
  overrides: Partial<EffectiveShopItem> = {},
): EffectiveShopItem {
  const category: ShopCategory = overrides.category ?? 'avatar';
  return {
    id: 'avatar-fox',
    category,
    rarity: 'rare',
    nameKey: 'items.avatar.fox01.name',
    descKey: 'items.avatar.fox01.desc',
    assetUrl: '/test.png',
    defaultPriceAmount: 100,
    defaultPriceCurrency: 'coins',
    available: true,
    priceAmount: 100,
    priceCurrency: 'coins',
    overridden: false,
    ...overrides,
  };
}

describe('ShopCard', () => {
  beforeEach(() => {
    useShopPreviewStore.getState().reset();
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('hover sets the preview store; leave schedules a deferred clear', () => {
    const item = makeItem();
    const { getByTestId } = render(
      <Wrapper>
        <ShopCard
          item={item}
          owned={false}
          equipped={false}
          balance={BALANCE}
          labels={labels}
          onPurchaseFallback={() => {}}
        />
      </Wrapper>,
    );
    const el = getByTestId(`shop-card-${item.id}`);
    fireEvent.pointerEnter(el);
    expect(useShopPreviewStore.getState().hoverItem?.id).toBe(item.id);
    fireEvent.pointerLeave(el);
    expect(useShopPreviewStore.getState().hoverItem?.id).toBe(item.id);
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(useShopPreviewStore.getState().hoverItem).toBeNull();
  });

  it('renders the action button label by state: buy / equip / unequip', () => {
    const item = makeItem({ id: 'avatar-fox' });
    const { getByTestId, rerender } = render(
      <Wrapper>
        <ShopCard
          item={item}
          owned={false}
          equipped={false}
          balance={BALANCE}
          labels={labels}
          onPurchaseFallback={() => {}}
        />
      </Wrapper>,
    );
    expect(getByTestId(`shop-card-action-${item.id}`).textContent).toContain(
      'Buy & equip',
    );

    rerender(
      <Wrapper>
        <ShopCard
          item={item}
          owned
          equipped={false}
          balance={BALANCE}
          labels={labels}
          onPurchaseFallback={() => {}}
        />
      </Wrapper>,
    );
    expect(getByTestId(`shop-card-action-${item.id}`).textContent).toContain(
      'Equip',
    );

    rerender(
      <Wrapper>
        <ShopCard
          item={item}
          owned
          equipped
          balance={BALANCE}
          labels={labels}
          onPurchaseFallback={() => {}}
        />
      </Wrapper>,
    );
    expect(getByTestId(`shop-card-action-${item.id}`).textContent).toContain(
      'Unequip',
    );
  });

  it('flags affordable=false when the balance is short', () => {
    const item = makeItem({ priceCurrency: 'gems', priceAmount: 10_000 });
    const { getByTestId } = render(
      <Wrapper>
        <ShopCard
          item={item}
          owned={false}
          equipped={false}
          balance={{ coins: 0, gems: 5 }}
          labels={labels}
          onPurchaseFallback={() => {}}
        />
      </Wrapper>,
    );
    expect(
      getByTestId(`shop-card-action-${item.id}`).getAttribute(
        'data-affordable',
      ),
    ).toBe('false');
  });

  it('unaffordable Buy click routes to the fallback', () => {
    const item = makeItem({ priceCurrency: 'gems', priceAmount: 10_000 });
    const fallback = vi.fn();
    const { getByTestId } = render(
      <Wrapper>
        <ShopCard
          item={item}
          owned={false}
          equipped={false}
          balance={{ coins: 0, gems: 5 }}
          labels={labels}
          onPurchaseFallback={fallback}
        />
      </Wrapper>,
    );
    fireEvent.click(getByTestId(`shop-card-action-${item.id}`));
    expect(fallback).toHaveBeenCalledWith(item);
  });
});
