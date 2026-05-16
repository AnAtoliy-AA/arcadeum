import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GemPackageCard } from './GemPackageCard';
import type { GemPackagePublic } from '../server/gems.types';

// BuyGemsButton is a client component with server action import; mock it.
vi.mock('./BuyGemsButton', () => ({
  BuyGemsButton: ({ packageId }: { packageId: string }) => (
    <button data-testid={`buy-gems-btn-${packageId}`}>Buy with PayPal</button>
  ),
}));

const basePackage: GemPackagePublic = {
  id: 'pkg-1',
  name: 'Starter Pack',
  gems: 100,
  bonusGems: 0,
  priceUsdCents: 999,
  displayOrder: 0,
};

describe('GemPackageCard', () => {
  it('renders package name', () => {
    render(<GemPackageCard pkg={basePackage} />);
    expect(screen.getByTestId('package-name').textContent).toBe('Starter Pack');
  });

  it('renders gem count', () => {
    render(<GemPackageCard pkg={basePackage} />);
    expect(screen.getByText('100')).toBeTruthy();
  });

  it('renders formatted price', () => {
    render(<GemPackageCard pkg={basePackage} />);
    expect(screen.getByTestId('package-price').textContent).toBe('$9.99');
  });

  it('does not show bonus badge when bonusGems is 0', () => {
    render(<GemPackageCard pkg={basePackage} />);
    expect(screen.queryByTestId('bonus-badge')).toBeNull();
  });

  it('shows bonus badge when bonusGems > 0', () => {
    const pkg = { ...basePackage, bonusGems: 25 };
    render(<GemPackageCard pkg={pkg} />);
    const badge = screen.getByTestId('bonus-badge');
    expect(badge.textContent).toContain('+25');
    expect(badge.textContent).toContain('bonus');
  });

  it('renders BuyGemsButton with correct packageId', () => {
    render(<GemPackageCard pkg={basePackage} />);
    expect(screen.getByTestId('buy-gems-btn-pkg-1')).toBeTruthy();
  });

  it('renders price in dollars: 2999 cents → $29.99', () => {
    const pkg = { ...basePackage, priceUsdCents: 2999 };
    render(<GemPackageCard pkg={pkg} />);
    expect(screen.getByTestId('package-price').textContent).toBe('$29.99');
  });

  it('renders card with testid', () => {
    render(<GemPackageCard pkg={basePackage} />);
    expect(screen.getByTestId('gem-package-card-pkg-1')).toBeTruthy();
  });
});
