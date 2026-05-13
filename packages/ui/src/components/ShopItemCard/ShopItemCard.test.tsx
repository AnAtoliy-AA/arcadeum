import { render as rtlRender, screen, fireEvent } from '@testing-library/react';
import { TamaguiProvider } from 'tamagui';
import { describe, it, expect, vi } from 'vitest';
import config from '../../tamagui.config';
import { ShopItemCard } from './ShopItemCard';

const render = (ui: React.ReactElement) =>
  rtlRender(
    <TamaguiProvider config={config} defaultTheme="dark">
      {ui}
    </TamaguiProvider>,
  );

const baseProps = {
  itemId: 'avatar-fox-01',
  name: 'Fox',
  rarity: 'common' as const,
  assetUrl: '/shop/avatars/fox-01.png',
  priceAmount: 200,
  priceCurrency: 'coins' as const,
};

describe('ShopItemCard', () => {
  it('renders name and price', () => {
    render(<ShopItemCard {...baseProps} />);
    expect(screen.getByText('Fox')).toBeInTheDocument();
    expect(screen.getByTestId('shop-item-price-avatar-fox-01')).toHaveTextContent(
      '200',
    );
  });

  it('renders the Equipped chip when equipped is true', () => {
    render(<ShopItemCard {...baseProps} equipped />);
    expect(
      screen.getByTestId('shop-item-state-avatar-fox-01'),
    ).toHaveTextContent(/equipped/i);
  });

  it('renders the Owned chip when owned and not equipped', () => {
    render(<ShopItemCard {...baseProps} owned />);
    expect(
      screen.getByTestId('shop-item-state-avatar-fox-01'),
    ).toHaveTextContent(/owned/i);
  });

  it('does not render a state chip when neither owned nor equipped', () => {
    render(<ShopItemCard {...baseProps} />);
    expect(
      screen.queryByTestId('shop-item-state-avatar-fox-01'),
    ).not.toBeInTheDocument();
  });

  it('calls onClick when not disabled', () => {
    const onClick = vi.fn();
    render(<ShopItemCard {...baseProps} onClick={onClick} />);
    fireEvent.click(screen.getByTestId('shop-item-card-avatar-fox-01'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', () => {
    const onClick = vi.fn();
    render(<ShopItemCard {...baseProps} onClick={onClick} disabled />);
    fireEvent.click(screen.getByTestId('shop-item-card-avatar-fox-01'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders gem currency styling', () => {
    render(
      <ShopItemCard
        {...baseProps}
        itemId="avatar-cosmic-01"
        priceAmount={30}
        priceCurrency="gems"
      />,
    );
    expect(
      screen.getByTestId('shop-item-price-avatar-cosmic-01'),
    ).toHaveTextContent('30');
  });
});
