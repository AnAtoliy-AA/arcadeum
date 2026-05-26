import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Card } from './Card';
import { CascadeThemeProvider } from '../lib/CascadeThemeContext';
import type { CascadeCard } from '../types';

function renderCard(props: React.ComponentProps<typeof Card>) {
  return render(
    <CascadeThemeProvider variant="cosmic">
      <Card {...props} />
    </CascadeThemeProvider>,
  );
}

describe('Card', () => {
  it('renders the numeric value for a NUMBER card', () => {
    const card: CascadeCard = {
      id: 'r5',
      color: 'R',
      kind: 'NUMBER',
      value: 5,
    };
    renderCard({ card });
    expect(screen.getByRole('button', { name: /red 5/i })).toBeInTheDocument();
  });

  it('shows a placeholder glyph when faceDown', () => {
    const card: CascadeCard = { id: 'x', color: 'B', kind: 'NUMBER', value: 1 };
    renderCard({ card, faceDown: true });
    const btn = screen.getByRole('button', { name: /hidden card/i });
    expect(btn).toBeInTheDocument();
    // The numeric value should NOT be in the face-down rendering.
    expect(btn).not.toHaveTextContent('1');
  });

  it('renders symbols for action cards from the active theme', () => {
    const card: CascadeCard = { id: 's', color: 'G', kind: 'SKIP' };
    renderCard({ card });
    // Cosmic theme uses ◐ for Skip.
    const btn = screen.getByRole('button', { name: /green skip/i });
    expect(btn).toHaveTextContent('◐');
  });

  it('calls onClick when clickable and playable', () => {
    const onClick = vi.fn();
    const card: CascadeCard = {
      id: 'w',
      color: 'W',
      kind: 'WILD',
    };
    renderCard({ card, playable: true, onClick });
    fireEvent.click(screen.getByRole('button', { name: /wild/i }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', () => {
    const onClick = vi.fn();
    const card: CascadeCard = {
      id: 'r1',
      color: 'R',
      kind: 'NUMBER',
      value: 1,
    };
    renderCard({ card, disabled: true, onClick });
    fireEvent.click(screen.getByRole('button', { name: /red 1/i }));
    expect(onClick).not.toHaveBeenCalled();
  });
});
