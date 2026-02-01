import { render, screen } from '@testing-library/react';
import { Card } from './Card';
import { ThemeProvider } from 'styled-components';
import { themeTokens } from '@/shared/config/theme';
import { describe, it, expect } from 'vitest';

const theme = themeTokens.dark;

const renderWithTheme = (component: React.ReactNode) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('Card', () => {
  it('renders children correctly', () => {
    renderWithTheme(<Card>Card Content</Card>);
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
      const { unmount } = renderWithTheme(
        <Card variant={variant}>Card {variant}</Card>,
      );
      expect(screen.getByText(`Card ${variant}`)).toBeInTheDocument();
      unmount();
    });
  });

  it('renders as interactive', () => {
    renderWithTheme(<Card interactive>Interactive Card</Card>);
    expect(screen.getByText('Interactive Card')).toBeInTheDocument();
    // Since it's a div, we can't easily check for interactivity without checking styles or cursor
  });
});
