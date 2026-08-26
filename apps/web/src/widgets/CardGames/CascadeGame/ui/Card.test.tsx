import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Card } from './Card';
import { CascadeThemeProvider } from '../lib/CascadeThemeContext';
import type { CascadeCard } from '../types';

// Map the themed-card translation keys to their EN bundle values so the
// Card's aria-label can be asserted against the themed name without booting
// the full i18n stack.
const THEMED_NAMES: Record<string, string> = {
  'games.cascade_v1.themedCards.cyberpunk.SKIP': 'Eclipse',
  'games.cascade_v1.themedCards.cyberpunk.REVERSE': 'Wormhole',
  'games.cascade_v1.themedCards.cyberpunk.DRAW_TWO': 'Meteor Shower',
  'games.cascade_v1.themedCards.cyberpunk.WILD': 'Singularity',
  'games.cascade_v1.themedCards.cyberpunk.WILD_DRAW_FOUR': 'Supernova',
  'games.cascade_v1.cardColors.R': 'Red',
  'games.cascade_v1.cardColors.B': 'Blue',
  'games.cascade_v1.cardColors.G': 'Green',
  'games.cascade_v1.cardColors.Y': 'Yellow',
  'games.cascade_v1.hiddenCard': 'Hidden card',
};

vi.mock('@/shared/lib/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => THEMED_NAMES[key] ?? key,
  }),
}));

function renderCard(props: React.ComponentProps<typeof Card>) {
  return render(
    <CascadeThemeProvider variant="cyberpunk">
      <Card
        card={props.card}
        faceDown={props.faceDown}
        playable={props.playable}
        selected={props.selected}
        disabled={props.disabled}
        dimmed={props.dimmed}
        onClick={props.onClick}
        size={props.size}
        ariaLabel={props.ariaLabel}
      />
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
    expect(btn).not.toHaveTextContent('1');
  });

  it('renders symbols for action cards from the active theme and uses the themed name in aria-label', () => {
    const card: CascadeCard = { id: 's', color: 'G', kind: 'SKIP' };
    renderCard({ card });
    const btn = screen.getByRole('button', { name: /green eclipse/i });
    expect(btn).toHaveTextContent('⊘');
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
