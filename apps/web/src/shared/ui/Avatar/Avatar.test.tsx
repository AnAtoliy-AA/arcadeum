import { render, screen } from '@testing-library/react';
import { Avatar } from './Avatar';
import { ThemeProvider } from 'styled-components';
import { themeTokens } from '@/shared/config/theme';
import { describe, it, expect } from 'vitest';

const theme = themeTokens.dark;

const renderWithTheme = (component: React.ReactNode) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('Avatar', () => {
  it('renders initials when no src is provided', () => {
    renderWithTheme(<Avatar name="John Doe" />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('renders a question mark when no name or src is provided', () => {
    renderWithTheme(<Avatar />);
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('renders an image when src is provided', () => {
    const src = 'https://example.com/avatar.png';
    renderWithTheme(<Avatar name="John Doe" src={src} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', src);
    expect(img).toHaveAttribute('alt', 'John Doe');
  });

  it('handles name with single part', () => {
    renderWithTheme(<Avatar name="John" />);
    expect(screen.getByText('J')).toBeInTheDocument();
  });
});
