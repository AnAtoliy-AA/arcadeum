import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Card } from './Card';
import { CascadeThemeProvider } from '../lib/CascadeThemeContext';
import type { CascadeCard } from '../types';

// Map the themed-card translation keys to their EN bundle values so the
// Card's aria-label can be asserted against the themed name without booting
// the full i18n stack.
const THEMED_NAMES: Record<string, string> = {
  'games.cascade_v1.themedCards.cosmic.SKIP': 'Eclipse',
  'games.cascade_v1.themedCards.cosmic.REVERSE': 'Wormhole',
  'games.cascade_v1.themedCards.cosmic.DRAW_TWO': 'Meteor Shower',
  'games.cascade_v1.themedCards.cosmic.WILD': 'Singularity',
  'games.cascade_v1.themedCards.cosmic.WILD_DRAW_FOUR': 'Supernova',
};

vi.mock('@/shared/lib/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => THEMED_NAMES[key] ?? key,
  }),
}));

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

  it('renders symbols for action cards from the active theme and uses the themed name in aria-label', () => {
    const card: CascadeCard = { id: 's', color: 'G', kind: 'SKIP' };
    renderCard({ card });
    // Cosmic theme renames SKIP → Eclipse and uses ◐ as the glyph.
    const btn = screen.getByRole('button', { name: /green eclipse/i });
    expect(btn).toHaveTextContent('◐');
  });

  it('uses the themed name for wild cards (no color prefix)', () => {
    const card: CascadeCard = { id: 'w', color: 'W', kind: 'WILD' };
    renderCard({ card });
    // Cosmic theme renames WILD → Singularity.
    expect(
      screen.getByRole('button', { name: /singularity/i }),
    ).toBeInTheDocument();
  });

  it('calls onClick when clickable and playable', () => {
    const onClick = vi.fn();
    const card: CascadeCard = {
      id: 'w',
      color: 'W',
      kind: 'WILD',
    };
    renderCard({ card, playable: true, onClick });
    fireEvent.click(screen.getByRole('button', { name: /singularity/i }));
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
