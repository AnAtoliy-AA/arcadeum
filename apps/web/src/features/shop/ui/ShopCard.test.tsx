import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, render, fireEvent } from '@testing-library/react';
import { TamaguiProvider } from 'tamagui';
import config from '../../../shared/config/tamagui.config';
import { ShopCard, type ShopCardLabels } from './ShopCard';
import { useShopPreviewStore } from '../store/shopPreviewStore';
import type { EffectiveShopItem, ShopCategory } from '../server/shop.types';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <TamaguiProvider config={config} defaultTheme="dark">
    {children}
  </TamaguiProvider>
);

const labels: ShopCardLabels = {
  owned: 'Owned',
  equipped: 'Equipped',
  buyEquip: 'Buy & equip',
};

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

  it('hover sets the preview store and leave schedules a deferred clear', () => {
    const onPurchase = vi.fn();
    const item = makeItem();
    const { getByTestId } = render(
      <Wrapper>
        <ShopCard
          item={item}
          owned={false}
          equipped={false}
          labels={labels}
          onPurchase={onPurchase}
        />
      </Wrapper>,
    );
    const el = getByTestId(`shop-card-${item.id}`);
    fireEvent.pointerEnter(el);
    expect(useShopPreviewStore.getState().hoverItem?.id).toBe(item.id);
    fireEvent.pointerLeave(el);
    // Leave does NOT clear immediately — it schedules a delay so the user
    // can move the cursor into the action panel without the panel
    // collapsing.
    expect(useShopPreviewStore.getState().hoverItem?.id).toBe(item.id);
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(useShopPreviewStore.getState().hoverItem).toBeNull();
  });

  it('focus fires the preview and blur defers the clear (keyboard parity)', () => {
    const onPurchase = vi.fn();
    const item = makeItem({ id: 'avatar-cat' });
    const { getByTestId } = render(
      <Wrapper>
        <ShopCard
          item={item}
          owned={false}
          equipped={false}
          labels={labels}
          onPurchase={onPurchase}
        />
      </Wrapper>,
    );
    const el = getByTestId(`shop-card-${item.id}`);
    fireEvent.focus(el);
    expect(useShopPreviewStore.getState().hoverItem?.id).toBe(item.id);
    fireEvent.blur(el);
    expect(useShopPreviewStore.getState().hoverItem?.id).toBe(item.id);
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(useShopPreviewStore.getState().hoverItem).toBeNull();
  });

  it('owned items do not invoke the purchase handler on click', () => {
    const onPurchase = vi.fn();
    const item = makeItem({ id: 'avatar-veteran' });
    const { getByTestId } = render(
      <Wrapper>
        <ShopCard
          item={item}
          owned
          equipped={false}
          labels={labels}
          onPurchase={onPurchase}
        />
      </Wrapper>,
    );
    fireEvent.click(getByTestId(`shop-card-${item.id}`));
    expect(onPurchase).not.toHaveBeenCalled();
  });

  it('unowned items invoke the purchase handler on click', () => {
    const onPurchase = vi.fn();
    const item = makeItem({ id: 'avatar-phoenix' });
    const { getByTestId } = render(
      <Wrapper>
        <ShopCard
          item={item}
          owned={false}
          equipped={false}
          labels={labels}
          onPurchase={onPurchase}
        />
      </Wrapper>,
    );
    fireEvent.click(getByTestId(`shop-card-${item.id}`));
    expect(onPurchase).toHaveBeenCalledWith(item);
  });
});
