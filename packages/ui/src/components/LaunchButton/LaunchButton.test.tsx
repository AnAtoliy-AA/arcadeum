import { render, screen, fireEvent } from '@testing-library/react';
import { LaunchButton } from './LaunchButton';
import { describe, it, expect, vi } from 'vitest';

describe('LaunchButton', () => {
  it('renders the label and a default rocket icon', () => {
    const { container } = render(<LaunchButton>Launch message</LaunchButton>);
    expect(screen.getByText('Launch message')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('fires onClick when clicked', () => {
    const onClick = vi.fn();
    render(<LaunchButton onClick={onClick}>Send</LaunchButton>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });

  it('is disabled while launching and exposes aria-busy', () => {
    render(<LaunchButton isLaunching>Sending…</LaunchButton>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute('aria-busy', 'true');
  });

  it('respects the disabled prop', () => {
    const onClick = vi.fn();
    render(
      <LaunchButton disabled onClick={onClick}>
        Send
      </LaunchButton>,
    );
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    fireEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders a custom icon when provided', () => {
    render(
      <LaunchButton icon={<span data-testid="custom-icon">★</span>}>
        Send
      </LaunchButton>,
    );
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });
});
