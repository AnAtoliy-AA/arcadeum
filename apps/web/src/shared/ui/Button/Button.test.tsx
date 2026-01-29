import { render, screen } from '@testing-library/react';
import { Button, ButtonVariant, GameVariant } from './Button';
import { ThemeProvider } from 'styled-components';
import { themeTokens } from '@/shared/config/theme';
import { describe, it, expect } from 'vitest';

const theme = themeTokens.dark;

const renderWithTheme = (component: React.ReactNode) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('Button', () => {
  it('renders correctly with default props', () => {
    renderWithTheme(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  it('renders with variant', () => {
    renderWithTheme(<Button variant="danger">Delete</Button>);
    const button = screen.getByRole('button', { name: /delete/i });
    expect(button).toBeInTheDocument();
  });

  it('renders in disabled state', () => {
    renderWithTheme(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('renders all variants for coverage', () => {
    const variants: ButtonVariant[] = [
      'primary',
      'secondary',
      'danger',
      'ghost',
      'icon',
      'link',
      'chip',
      'listItem',
      'glass',
      'neutral',
      'success',
      'warning',
      'info',
    ] as const;

    variants.forEach((variant) => {
      const { unmount } = renderWithTheme(
        <Button variant={variant}>Btn {variant}</Button>,
      );
      expect(screen.getByText(`Btn ${variant}`)).toBeInTheDocument();
      unmount();
    });
  });

  it('renders with game variants', () => {
    const gameVariants: GameVariant[] = ['cyberpunk', 'underwater'] as const;
    gameVariants.forEach((variant) => {
      const { unmount } = renderWithTheme(
        <Button gameVariant={variant}>Game {variant}</Button>,
      );
      expect(screen.getByText(`Game ${variant}`)).toBeInTheDocument();
      unmount();
    });
  });

  it('renders with pulse animation', () => {
    renderWithTheme(<Button pulse>Pulsing</Button>);
    expect(screen.getByText('Pulsing')).toBeInTheDocument();
  });
});
