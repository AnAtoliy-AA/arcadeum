import { render, screen } from '@testing-library/react';
import { Container } from './Container';
import { ThemeProvider } from 'styled-components';
import { themeTokens } from '@/shared/config/theme';
import { describe, it, expect } from 'vitest';

const theme = themeTokens.dark;

const renderWithTheme = (component: React.ReactNode) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('Container', () => {
  it('renders children correctly', () => {
    renderWithTheme(<Container>Content</Container>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    const sizes = ['sm', 'md', 'lg', 'xl', 'full'] as const;
    sizes.forEach((size) => {
      const { unmount } = renderWithTheme(
        <Container size={size}>Size {size}</Container>,
      );
      expect(screen.getByText(`Size ${size}`)).toBeInTheDocument();
      unmount();
    });
  });
});
