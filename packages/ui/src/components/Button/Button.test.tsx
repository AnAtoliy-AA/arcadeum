import { render as rtlRender, screen } from '@testing-library/react';
import { Button } from './Button';
import type { ButtonVariant, GameVariant } from './types';
import { describe, it, expect, vi } from 'vitest';

const render = (ui: React.ReactElement) => rtlRender(ui);

describe('Button', () => {
  it('renders correctly with default props', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('type', 'button');
  });

  it('renders with variant', () => {
    render(<Button variant="danger">Delete</Button>);
    const button = screen.getByRole('button', { name: /delete/i });
    expect(button).toBeInTheDocument();
  });

  it('renders in disabled state', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
  });

  it('marks loading buttons as busy and disabled', () => {
    render(<Button loading>Loading</Button>);
    const button = screen.getByRole('button', { name: /loading/i });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  it('renders all variants for coverage', () => {
    const variants: ButtonVariant[] = [
      'primary',
      'secondary',
      'danger',
      'ghost',
      'icon',
      'icon glass',
      'link',
      'chip',
      'listItem',
      'glass',
      'outline',
      'victory',
    ] as const;

    const cases: Array<{
      label: string;
      element: React.ReactElement;
    }> = [
      ...variants.map((variant) => ({
        label: variant,
        element: <Button variant={variant}>Btn {variant}</Button>,
      })),
      {
        label: 'chipActive',
        element: (
          <Button variant="chip" active>
            Btn chipActive
          </Button>
        ),
      },
    ];

    cases.forEach(({ label, element }) => {
      const { unmount } = render(element);
      expect(
        screen.getByRole('button', { name: new RegExp(`Btn.*${label}`, 'i') }),
      ).toBeInTheDocument();
      unmount();
    });
  });

  it('renders with game variants', () => {
    const gameVariants: GameVariant[] = ['cyberpunk', 'underwater'] as const;
    gameVariants.forEach((variant) => {
      const { unmount } = render(
        <Button gameVariant={variant}>Game {variant}</Button>,
      );
      expect(
        screen.getByRole('button', {
          name: new RegExp(`Game.*${variant}`, 'i'),
        }),
      ).toBeInTheDocument();
      unmount();
    });
  });

  it('fires onClick', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Clickable</Button>);
    screen.getByRole('button', { name: /clickable/i }).click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders an icon alongside text', () => {
    render(<Button icon={<span aria-hidden>★</span>}>With icon</Button>);
    expect(screen.getByText('★')).toBeInTheDocument();
  });

  it('passes data-active and aria-pressed through', () => {
    render(
      <Button data-active="on" aria-pressed="true">
        Toggle
      </Button>,
    );
    const button = screen.getByRole('button', { name: /toggle/i });
    expect(button).toHaveAttribute('data-active', 'on');
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('supports custom className overrides', () => {
    render(
      <Button variant="primary" className="bg-[#ef4444]">
        Custom
      </Button>,
    );
    const button = screen.getByRole('button', { name: /custom/i });
    expect(button.className).toContain('bg-[#ef4444]');
  });
});
