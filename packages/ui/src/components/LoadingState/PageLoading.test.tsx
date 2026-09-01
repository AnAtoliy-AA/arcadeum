import { render as rtlRender, screen } from '@testing-library/react';
import { PageLoading } from './PageLoading';
import type { PageLoadingLayout } from './PageLoading';
import { describe, it, expect } from 'vitest';

const render = (ui: React.ReactElement) => {
  return rtlRender(ui);
};

describe('PageLoading', () => {
  const layouts: PageLoadingLayout[] = [
    'standard',
    'stats',
    'grid',
    'room',
    'auth',
    'home',
    'cards',
    'table',
    'chat',
    'profile',
  ];

  it('renders default standard layout with status role', () => {
    render(<PageLoading />);
    const loadingEl = screen.getByRole('status');
    expect(loadingEl).toBeInTheDocument();
    expect(loadingEl).toHaveAttribute('aria-busy', 'true');
    expect(loadingEl).toHaveAttribute('aria-label', 'Loading');
  });

  it.each(layouts)('renders layout "%s" successfully', (layout) => {
    render(<PageLoading layout={layout} data-testid={`loading-${layout}`} />);
    expect(screen.getByTestId(`loading-${layout}`)).toBeInTheDocument();
  });

  it('supports custom className and testid', () => {
    render(<PageLoading className="custom-loading" data-testid="custom-test" />);
    const el = screen.getByTestId('custom-test');
    expect(el).toHaveClass('custom-loading');
  });
});
