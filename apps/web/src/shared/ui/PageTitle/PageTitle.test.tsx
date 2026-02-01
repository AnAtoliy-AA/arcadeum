import { render, screen } from '@testing-library/react';
import { PageTitle } from './PageTitle';
import { ThemeProvider } from 'styled-components';
import { themeTokens } from '@/shared/config/theme';
import { describe, it, expect } from 'vitest';

const theme = themeTokens.dark;

const renderWithTheme = (component: React.ReactNode) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('PageTitle', () => {
  it('renders children correctly', () => {
    renderWithTheme(<PageTitle>Headline</PageTitle>);
    expect(screen.getByText('Headline')).toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    const sizes = ['sm', 'md', 'lg', 'xl'] as const;
    sizes.forEach((size) => {
      const { unmount } = renderWithTheme(
        <PageTitle size={size}>Title {size}</PageTitle>,
      );
      expect(screen.getByText(`Title ${size}`)).toBeInTheDocument();
      unmount();
    });
  });

  it('renders with gradient and animation', () => {
    renderWithTheme(
      <PageTitle gradient animated>
        Animated Title
      </PageTitle>,
    );
    expect(screen.getByText('Animated Title')).toBeInTheDocument();
  });
});
