import { render as rtlRender, screen, fireEvent } from '@testing-library/react';
import { TamaguiProvider } from 'tamagui';
import config from '../../tamagui.config';
import { Badge } from './Badge';

import { describe, it, expect, vi, beforeEach } from 'vitest';

const render = (ui: React.ReactElement) => {
  return rtlRender(
    <TamaguiProvider config={config} defaultTheme="dark">
      {ui}
    </TamaguiProvider>
  );
};

describe('Badge', () => {
  it('renders children correctly', () => {
    render(<Badge>Status</Badge>);
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('renders with different variants', () => {
    const variants: ('success' | 'warning' | 'error' | 'info' | 'neutral')[] = [
      'success',
      'warning',
      'error',
      'info',
      'neutral',
    ];

    variants.forEach((variant) => {
      const { unmount } = render(
        <Badge variant={variant}>Badge {variant}</Badge>,
      );
      expect(screen.getByText(`Badge ${variant}`)).toBeInTheDocument();
      unmount();
    });
  });
});
