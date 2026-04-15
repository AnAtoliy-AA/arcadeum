import { render as rtlRender, screen, fireEvent } from '@testing-library/react';
import { TamaguiProvider } from 'tamagui';
import config from '../../tamagui.config';
import { ErrorState } from './ErrorState';

import { describe, it, expect, vi, beforeEach } from 'vitest';

const render = (ui: React.ReactElement) => {
  return rtlRender(
    <TamaguiProvider config={config} defaultTheme="dark">
      {ui}
    </TamaguiProvider>
  );
};

describe('ErrorState', () => {
  it('renders message and title', () => {
    render(<ErrorState message="Request failed" title="Error" />);
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Request failed')).toBeInTheDocument();
  });

  it('calls onRetry when button is clicked', () => {
    const handleRetry = vi.fn();
    render(
      <ErrorState message="Error" onRetry={handleRetry} retryLabel="Refresh" />,
    );

    const button = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(button);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });
});
