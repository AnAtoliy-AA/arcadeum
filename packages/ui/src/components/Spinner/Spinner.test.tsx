import { render as rtlRender, screen, fireEvent } from '@testing-library/react';
import { TamaguiProvider } from 'tamagui';
import config from '../../tamagui.config';
import { Spinner } from './Spinner';

import { describe, it, expect, vi, beforeEach } from 'vitest';

const render = (ui: React.ReactElement) => {
  return rtlRender(
    <TamaguiProvider config={config} defaultTheme="dark">
      {ui}
    </TamaguiProvider>
  );
};

describe('Spinner', () => {
  it('renders correctly with default props', () => {
    render(<Spinner />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    const { unmount } = render(<Spinner size="sm" />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    unmount();

    render(<Spinner size="lg" />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});
