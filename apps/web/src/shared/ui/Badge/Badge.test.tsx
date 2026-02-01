import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';
import { ThemeProvider } from 'styled-components';
import { themeTokens } from '@/shared/config/theme';
import { describe, it, expect } from 'vitest';

const theme = themeTokens.dark;

const renderWithTheme = (component: React.ReactNode) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('Badge', () => {
  it('renders children correctly', () => {
    renderWithTheme(<Badge>Status</Badge>);
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
      const { unmount } = renderWithTheme(
        <Badge variant={variant}>Badge {variant}</Badge>,
      );
      expect(screen.getByText(`Badge ${variant}`)).toBeInTheDocument();
      unmount();
    });
  });
});
