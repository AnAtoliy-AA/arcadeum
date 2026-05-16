import { render as rtlRender, screen } from '@testing-library/react';
import { TamaguiProvider } from 'tamagui';
import { describe, it, expect } from 'vitest';
import config from '../../tamagui.config';
import { RarityBorder, type ShopRarity } from './RarityBorder';

const render = (ui: React.ReactElement) =>
  rtlRender(
    <TamaguiProvider config={config} defaultTheme="dark">
      {ui}
    </TamaguiProvider>,
  );

describe('RarityBorder', () => {
  it('renders children', () => {
    render(
      <RarityBorder rarity="common" data-testid="rb">
        <span>item preview</span>
      </RarityBorder>,
    );
    expect(screen.getByText('item preview')).toBeInTheDocument();
  });

  it.each<ShopRarity>(['common', 'rare', 'epic', 'legendary'])(
    'renders for rarity %s without crashing',
    (rarity) => {
      render(
        <RarityBorder rarity={rarity} data-testid="rb">
          <span>x</span>
        </RarityBorder>,
      );
      expect(screen.getByTestId('rb')).toBeInTheDocument();
    },
  );
});
