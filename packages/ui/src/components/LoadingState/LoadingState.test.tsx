import { render as rtlRender, screen, fireEvent } from '@testing-library/react';
import { LoadingState } from './LoadingState';

import { describe, it, expect, vi, beforeEach } from 'vitest';

const render = (ui: React.ReactElement) => {
  return rtlRender(ui);
};

describe('LoadingState', () => {
  it('renders with default message', () => {
    render(<LoadingState />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders custom message', () => {
    render(<LoadingState message="Fetching games..." />);
    expect(screen.getByText('Fetching games...')).toBeInTheDocument();
  });
});
