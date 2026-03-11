import { TamaguiProvider } from "tamagui";
import config from "../../tamagui.config";

import { render as rtlRender, screen } from '@testing-library/react';
import { Button, ButtonVariant, GameVariant } from './Button';
import { describe, it, expect } from 'vitest';

const render = (ui: React.ReactElement) => {
  return rtlRender(
    <TamaguiProvider config={config} defaultTheme="dark">
      {ui}
    </TamaguiProvider>
  );
};


describe('Button', () => {
  it('renders correctly with default props', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  it('renders with variant', () => {
    render(<Button variant="danger">Delete</Button>);
    const button = screen.getByRole('button', { name: /delete/i });
    expect(button).toBeInTheDocument();
  });

  it('renders in disabled state', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
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
      const { unmount } = render(
        <Button variant={variant}>Btn {variant}</Button>,
      );
      expect(screen.getByRole('button', { name: new RegExp(`Btn.*${variant}`, 'i') })).toBeInTheDocument();
      unmount();
    });
  });

  it('renders with game variants', () => {
    const gameVariants: GameVariant[] = ['cyberpunk', 'underwater'] as const;
    gameVariants.forEach((variant) => {
      const { unmount } = render(
        <Button gameVariant={variant}>Game {variant}</Button>,
      );
      expect(screen.getByRole('button', { name: new RegExp(`Game.*${variant}`, 'i') })).toBeInTheDocument();
      unmount();
    });
  });

  it('renders with pulse animation', () => {
    render(<Button pulse>Pulsing</Button>);
    expect(screen.getByText('Pulsing')).toBeInTheDocument();
  });
});