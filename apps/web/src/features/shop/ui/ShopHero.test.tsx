import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, render, fireEvent } from '@testing-library/react';
import { TamaguiProvider } from 'tamagui';
import config from '../../../shared/config/tamagui.config';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));
vi.mock('../server/shop.actions', () => ({
  equipItemAction: vi.fn(),
  unequipItemAction: vi.fn(),
}));
vi.mock('../lib/syncEquippedToSession', () => ({
  syncEquippedToSession: vi.fn(),
}));

import { ShopHero, type ShopHeroLabels } from './ShopHero';
import { equipItemAction, unequipItemAction } from '../server/shop.actions';
import { useShopPreviewStore } from '../store/shopPreviewStore';
import type { EffectiveShopItem, ShopCategory } from '../server/shop.types';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <TamaguiProvider config={config} defaultTheme="dark">
    {children}
  </TamaguiProvider>
);

const labels: ShopHeroLabels = {
  tag: 'Limited drop',
  tryOn: 'Try on',
  buyNow: 'Buy now',
  bodySuffix: 'Visible in lobby, chat, and during matches.',
  equip: 'Equip',
  unequip: 'Unequip',
  equipped: 'Equipped',
};

function makeItem(
  overrides: Partial<EffectiveShopItem> = {},
): EffectiveShopItem {
  const category: ShopCategory = overrides.category ?? 'avatar';
  return {
    id: 'avatar-legend',
    category,
    rarity: 'legendary',
    nameKey: 'items.avatar.legend.name',
    descKey: 'items.avatar.legend.desc',
    assetUrl: '/test.png',
    defaultPriceAmount: 50,
    defaultPriceCurrency: 'gems',
    available: true,
    priceAmount: 50,
    priceCurrency: 'gems',
    overridden: false,
    ...overrides,
  };
}

describe('ShopHero', () => {
  beforeEach(() => {
    useShopPreviewStore.getState().reset();
    vi.clearAllMocks();
  });

  it('renders Buy now and invokes onBuyClick when not owned', () => {
    const item = makeItem();
    const onBuy = vi.fn();
    const { getByTestId, queryByTestId } = render(
      <Wrapper>
        <ShopHero
          item={item}
          owned={false}
          equipped={false}
          labels={labels}
          onBuyClick={onBuy}
        />
      </Wrapper>,
    );
    const btn = getByTestId('shop-hero-buy');
    expect(btn.textContent).toContain('Buy now');
    expect(queryByTestId('shop-hero-equip')).toBeNull();
    expect(queryByTestId('shop-hero-unequip')).toBeNull();
    expect(queryByTestId('shop-hero-equipped-chip')).toBeNull();
    fireEvent.click(btn);
    expect(onBuy).toHaveBeenCalledWith(item);
  });

  it('renders Equip when owned-but-not-equipped and calls equipItemAction on press', async () => {
    vi.mocked(equipItemAction).mockResolvedValue({
      ok: true,
      data: {
        avatar: 'avatar-legend',
        badge: null,
        name_color: null,
        game_skin: null,
        banner: null,
        aura: null,
        frame: null,
        background: null,
      },
    });
    const item = makeItem();
    const onBuy = vi.fn();
    const { getByTestId, queryByTestId } = render(
      <Wrapper>
        <ShopHero
          item={item}
          owned
          equipped={false}
          labels={labels}
          onBuyClick={onBuy}
        />
      </Wrapper>,
    );
    const btn = getByTestId('shop-hero-equip');
    expect(btn.textContent).toContain('Equip');
    expect(queryByTestId('shop-hero-buy')).toBeNull();
    await act(async () => {
      fireEvent.click(btn);
    });
    expect(equipItemAction).toHaveBeenCalledWith(item.id);
    expect(onBuy).not.toHaveBeenCalled();
  });

  it('renders Unequip + Equipped chip when equipped and calls unequipItemAction on press', async () => {
    vi.mocked(unequipItemAction).mockResolvedValue({
      ok: true,
      data: {
        avatar: null,
        badge: null,
        name_color: null,
        game_skin: null,
        banner: null,
        aura: null,
        frame: null,
        background: null,
      },
    });
    const item = makeItem();
    const onBuy = vi.fn();
    const { getByTestId, queryByTestId } = render(
      <Wrapper>
        <ShopHero
          item={item}
          owned
          equipped
          labels={labels}
          onBuyClick={onBuy}
        />
      </Wrapper>,
    );
    const btn = getByTestId('shop-hero-unequip');
    expect(btn.textContent).toContain('Unequip');
    expect(getByTestId('shop-hero-equipped-chip')).toBeTruthy();
    expect(queryByTestId('shop-hero-buy')).toBeNull();
    await act(async () => {
      fireEvent.click(btn);
    });
    expect(unequipItemAction).toHaveBeenCalledWith(item.category);
    expect(onBuy).not.toHaveBeenCalled();
  });
});
