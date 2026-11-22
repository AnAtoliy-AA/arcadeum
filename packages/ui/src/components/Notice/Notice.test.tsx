import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Notice } from './Notice';

describe('Notice', () => {
  it('renders children with a polite status role by default', () => {
    render(<Notice data-testid="n">Saved</Notice>);
    expect(screen.getByTestId('n')).toHaveAttribute('role', 'status');
    expect(screen.getByText('Saved')).toBeInTheDocument();
  });

  it('supports the alert role for errors', () => {
    render(
      <Notice tone="danger" role="alert">
        Oops
      </Notice>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Oops');
  });

  it('hides the decorative icon from assistive tech', () => {
    render(<Notice icon="🏆">Won</Notice>);
    expect(screen.getByText('🏆')).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders a dismiss button only when onDismiss is given', () => {
    const onDismiss = vi.fn();
    const { rerender } = render(<Notice>Hi</Notice>);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    rerender(
      <Notice onDismiss={onDismiss} dismissLabel="Dismiss">
        Hi
      </Notice>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
