import { render, screen } from '@testing-library/react';
import { LinkButton } from './LinkButton';
import { ThemeProvider } from 'styled-components';
import { themeTokens } from '@/shared/config/theme';
import { describe, it, expect } from 'vitest';

const theme = themeTokens.dark;

const renderWithTheme = (component: React.ReactNode) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('LinkButton', () => {
  it('renders an internal link using Next.js Link', () => {
    renderWithTheme(<LinkButton href="/home">Home</LinkButton>);
    const link = screen.getByRole('link', { name: /home/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/home');
  });

  it('renders an external link', () => {
    renderWithTheme(
      <LinkButton href="https://google.com" external>
        Search
      </LinkButton>,
    );
    const link = screen.getByRole('link', { name: /search/i });
    expect(link).toHaveAttribute('href', 'https://google.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders with variant and size', () => {
    renderWithTheme(
      <LinkButton href="/" variant="ghost" size="lg">
        Ghost
      </LinkButton>,
    );
    expect(screen.getByText('Ghost')).toBeInTheDocument();
  });
});
