import { render as rtlRender, screen, fireEvent } from '@testing-library/react';
import { EmptyState } from './EmptyState';

import { describe, it, expect, vi, beforeEach } from 'vitest';

const render = (ui: React.ReactElement) => {
  return rtlRender(ui);
};

describe('EmptyState', () => {
  it('renders message correctly', () => {
    render(<EmptyState message="No data found" />);
    expect(screen.getByText('No data found')).toBeInTheDocument();
  });

  it('renders icon and action content', () => {
    render(
      <EmptyState
        message="Message"
        icon={<span data-testid="icon">🔍</span>}
        action={<button>Retry</button>}
      />,
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });
});
