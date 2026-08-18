import { render as rtlRender, screen, fireEvent } from '@testing-library/react';
import { Spinner } from './Spinner';

import { describe, it, expect, vi, beforeEach } from 'vitest';

const render = (ui: React.ReactElement) => {
  return rtlRender(ui);
};

describe('Spinner', () => {
  it('renders correctly with default props', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    const { unmount } = render(<Spinner size="sm" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    unmount();

    render(<Spinner size="lg" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
