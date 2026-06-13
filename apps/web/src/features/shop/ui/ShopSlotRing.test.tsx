import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { TamaguiProvider } from 'tamagui';
import config from '../../../shared/config/tamagui.config';
import { ShopSlotRing, type ShopSlotRingLabels } from './ShopSlotRing';
import type { EffectiveShopItem, ShopCategory } from '../server/shop.types';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <TamaguiProvider config={config} defaultTheme="dark">
    {children}
  </TamaguiProvider>
);

const labels: ShopSlotRingLabels = {
  avatar: { label: 'Avatar', desc: '', empty: 'Empty' },
  badge: { label: 'Badge', desc: '', empty: 'Empty' },
  name_color: { label: 'Color', desc: '', empty: 'Empty' },
  game_skin: { label: 'Skin', desc: '', empty: 'Empty' },
  banner: { label: 'Banner', desc: '', empty: 'Empty' },
  aura: { label: 'Aura', desc: '', empty: 'Empty' },
  frame: { label: 'Frame', desc: '', empty: 'Empty' },
  background: { label: 'Background', desc: '', empty: 'Empty' },
};

function makeItem(
  id: string,
  category: ShopCategory = 'avatar',
): EffectiveShopItem {
  return {
    id,
    category,
    rarity: 'common',
    nameKey: `items.${category}.${id}.name`,
    descKey: '',
    assetUrl: '',
    defaultPriceAmount: 0,
    defaultPriceCurrency: 'coins',
    available: true,
    priceAmount: 0,
    priceCurrency: 'coins',
    overridden: false,
  };
}

const EMPTY_PREVIEW = {
  avatar: null,
  badge: null,
  name_color: null,
  game_skin: null,
  banner: null,
  aura: null,
  frame: null,
  background: null,
};

describe('ShopSlotRing', () => {
  it('clicking a slot calls onSlotClick with the right category', () => {
    const onSlotClick = vi.fn();
    const { getByTestId } = render(
      <Wrapper>
        <ShopSlotRing
          preview={EMPTY_PREVIEW}
          activeSlot={null}
          hoverItem={null}
          labels={labels}
          onSlotClick={onSlotClick}
        />
      </Wrapper>,
    );
    fireEvent.click(getByTestId('shop-slot-badge'));
    expect(onSlotClick).toHaveBeenCalledWith('badge');
  });

  it('flags the active slot with data-active=true', () => {
    const { getByTestId } = render(
      <Wrapper>
        <ShopSlotRing
          preview={EMPTY_PREVIEW}
          activeSlot="avatar"
          hoverItem={null}
          labels={labels}
          onSlotClick={() => {}}
        />
      </Wrapper>,
    );
    expect(getByTestId('shop-slot-avatar').getAttribute('data-active')).toBe(
      'true',
    );
    expect(getByTestId('shop-slot-badge').getAttribute('data-active')).toBe(
      'false',
    );
  });

  it('marks the matching slot with data-previewing=true when an item is hovered', () => {
    const hover = makeItem('drag', 'game_skin');
    const { getByTestId } = render(
      <Wrapper>
        <ShopSlotRing
          preview={EMPTY_PREVIEW}
          activeSlot={null}
          hoverItem={hover}
          labels={labels}
          onSlotClick={() => {}}
        />
      </Wrapper>,
    );
    expect(
      getByTestId('shop-slot-game_skin').getAttribute('data-previewing'),
    ).toBe('true');
    expect(
      getByTestId('shop-slot-avatar').getAttribute('data-previewing'),
    ).toBe('false');
  });
});
