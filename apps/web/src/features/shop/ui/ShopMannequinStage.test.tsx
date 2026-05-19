import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { TamaguiProvider } from 'tamagui';
import config from '../../../shared/config/tamagui.config';
import {
  ShopMannequinStage,
  type ShopMannequinStageLabels,
} from './ShopMannequinStage';
import type { EffectiveShopItem, ShopCategory } from '../server/shop.types';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <TamaguiProvider config={config} defaultTheme="dark">
    {children}
  </TamaguiProvider>
);

const labels: ShopMannequinStageLabels = {
  tryOn: 'Try-on',
  stage: { level: 'LVL {level} · Online', online: 'Online' },
};

const EMPTY = {
  avatar: null,
  badge: null,
  name_color: null,
  game_skin: null,
  banner: null,
  aura: null,
} satisfies Record<ShopCategory, EffectiveShopItem | null | undefined>;

function item(
  id: string,
  category: ShopCategory = 'avatar',
): EffectiveShopItem {
  return {
    id,
    category,
    rarity: 'common',
    nameKey: `items.${category}.${id}.name`,
    descKey: `items.${category}.${id}.desc`,
    assetUrl: '/x.png',
    defaultPriceAmount: 0,
    defaultPriceCurrency: 'coins',
    available: true,
    priceAmount: 0,
    priceCurrency: 'coins',
    overridden: false,
  };
}

describe('ShopMannequinStage', () => {
  it('shows the equipped avatar when no hover', () => {
    const avatar = item('avatar-fox');
    const { getByTestId } = render(
      <Wrapper>
        <ShopMannequinStage
          preview={{ ...EMPTY, avatar }}
          hoverItem={null}
          displayName="Player"
          level={null}
          labels={labels}
        />
      </Wrapper>,
    );
    // ItemAsset renders with data-testid=shop-asset-<id>
    expect(getByTestId(`shop-asset-${avatar.id}`)).toBeInTheDocument();
  });

  it('shows only "Online" when level is null', () => {
    const { getByTestId } = render(
      <Wrapper>
        <ShopMannequinStage
          preview={EMPTY}
          hoverItem={null}
          displayName="Player"
          level={null}
          labels={labels}
        />
      </Wrapper>,
    );
    expect(getByTestId('shop-stage-presence').textContent).toBe('Online');
  });

  it('shows "LVL N · Online" when level is provided', () => {
    const { getByTestId } = render(
      <Wrapper>
        <ShopMannequinStage
          preview={EMPTY}
          hoverItem={null}
          displayName="Player"
          level={42}
          labels={labels}
        />
      </Wrapper>,
    );
    expect(getByTestId('shop-stage-presence').textContent).toBe(
      'LVL 42 · Online',
    );
  });

  it('non-matching slots stay equipped when an unrelated item is hovered', () => {
    const equippedAvatar = item('avatar-default');
    const hover = item('badge-legend', 'badge');
    const { getByTestId } = render(
      <Wrapper>
        <ShopMannequinStage
          preview={{ ...EMPTY, avatar: equippedAvatar, badge: hover }}
          hoverItem={hover}
          displayName="Player"
          level={null}
          labels={labels}
        />
      </Wrapper>,
    );
    expect(getByTestId(`shop-asset-${equippedAvatar.id}`)).toBeInTheDocument();
  });
});
