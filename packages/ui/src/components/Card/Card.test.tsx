import { render as rtlRender, screen, fireEvent } from '@testing-library/react';
import { TamaguiProvider } from 'tamagui';
import config from '../../tamagui.config';
import { Card } from './Card';

import { describe, it, expect, vi, beforeEach } from 'vitest';

const render = (ui: React.ReactElement) => {
  return rtlRender(
    <TamaguiProvider config={config} defaultTheme="dark">
      {ui}
    </TamaguiProvider>
  );
};

describe('Card', () => {
  it('renders children correctly', () => {
    render(<Card>Card Content</Card>);
    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });

  it('renders with different variants', () => {
    const variants: ('default' | 'elevated' | 'outlined' | 'glass')[] = [
      'default',
      'elevated',
      'outlined',
      'glass',
    ];

    variants.forEach((variant) => {
      const { unmount } = render(
        <Card variant={variant}>Card {variant}</Card>,
      );
      expect(screen.getByText(`Card ${variant}`)).toBeInTheDocument();
      unmount();
    });
  });

  it('renders as interactive', () => {
    render(<Card interactive>Interactive Card</Card>);
    expect(screen.getByText('Interactive Card')).toBeInTheDocument();
    // Since it's a div, we can't easily check for interactivity without checking styles or cursor
  });
});
