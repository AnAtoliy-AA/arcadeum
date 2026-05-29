import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
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
  frame: null,
  background: null,
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
    assetUrl: `/${id}.png`,
    defaultPriceAmount: 0,
    defaultPriceCurrency: 'coins',
    available: true,
    priceAmount: 0,
    priceCurrency: 'coins',
    overridden: false,
  };
}

describe('ShopMannequinStage', () => {
  it('renders the equipped avatar image when set', () => {
    const avatar = item('avatar-fox');
    render(
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
    expect(screen.getByRole('img')).toHaveAttribute('src', '/avatar-fox.png');
  });

  it('renders the display name on the stage', () => {
    render(
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
    expect(screen.getByTestId('shop-stage-name')).toHaveTextContent('Player');
  });

  it('shows only "Online" when level is null', () => {
    render(
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
    expect(screen.getByText('Online')).toBeInTheDocument();
  });

  it('shows "LVL N · Online" when level is provided', () => {
    render(
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
    expect(screen.getByText('LVL 42 · Online')).toBeInTheDocument();
  });

  it('renders the equipped avatar even when an unrelated slot is hovered', () => {
    const equippedAvatar = item('avatar-default');
    const hover = item('badge-legend', 'badge');
    render(
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
    expect(screen.getByRole('img', { name: /Player/i })).toHaveAttribute(
      'src',
      '/avatar-default.png',
    );
  });

  it('renders the badge sentinel only when a badge is equipped', () => {
    const { rerender } = render(
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
    expect(screen.queryByTestId('shop-stage-badge')).toBeNull();

    const badge = item('badge-star', 'badge');
    rerender(
      <Wrapper>
        <ShopMannequinStage
          preview={{ ...EMPTY, badge }}
          hoverItem={null}
          displayName="Player"
          level={null}
          labels={labels}
        />
      </Wrapper>,
    );
    expect(screen.getByTestId('shop-stage-badge')).toBeInTheDocument();
  });

  it('renders the SKIN chip only when a skin is equipped', () => {
    const { rerender } = render(
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
    expect(screen.queryByTestId('shop-stage-skin')).toBeNull();

    const skin = item('skin-neon', 'game_skin');
    rerender(
      <Wrapper>
        <ShopMannequinStage
          preview={{ ...EMPTY, game_skin: skin }}
          hoverItem={null}
          displayName="Player"
          level={null}
          labels={labels}
        />
      </Wrapper>,
    );
    expect(screen.getByTestId('shop-stage-skin')).toBeInTheDocument();
  });

  it('renders TRY-ON overlay only when hoverItem is set', () => {
    const { rerender } = render(
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
    expect(screen.queryByText(/Try-on/i)).toBeNull();

    const hover = item('avatar-fox');
    rerender(
      <Wrapper>
        <ShopMannequinStage
          preview={EMPTY}
          hoverItem={hover}
          displayName="Player"
          level={null}
          labels={labels}
        />
      </Wrapper>,
    );
    expect(screen.getByText(/Try-on/i)).toBeInTheDocument();
  });
});
