import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/shared/lib/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

import { ComboHints } from './ComboHints';
import type { CriticalCard } from '../types';

describe('ComboHints', () => {
  it('marks the pair chip as possible when two combo cards match', () => {
    const hand: CriticalCard[] = [
      'collection_alpha',
      'collection_alpha',
      'strike',
    ];
    render(<ComboHints hand={hand} allowActionCardCombos={false} />);
    expect(screen.getByTestId('combo-hint-pair')).toHaveAttribute(
      'data-state',
      'possible',
    );
    expect(screen.getByTestId('combo-hint-triple')).toHaveAttribute(
      'data-state',
      'inactive',
    );
    expect(screen.getByTestId('combo-hint-fiver')).toHaveAttribute(
      'data-state',
      'inactive',
    );
  });

  it('marks the triple chip as possible when three combo cards match', () => {
    const hand: CriticalCard[] = [
      'collection_beta',
      'collection_beta',
      'collection_beta',
    ];
    render(<ComboHints hand={hand} allowActionCardCombos={false} />);
    expect(screen.getByTestId('combo-hint-pair')).toHaveAttribute(
      'data-state',
      'possible',
    );
    expect(screen.getByTestId('combo-hint-triple')).toHaveAttribute(
      'data-state',
      'possible',
    );
  });

  it('marks the fiver chip as possible when hand has 5 distinct cards', () => {
    const hand: CriticalCard[] = [
      'strike',
      'evade',
      'trade',
      'reorder',
      'insight',
    ];
    render(<ComboHints hand={hand} allowActionCardCombos={false} />);
    expect(screen.getByTestId('combo-hint-fiver')).toHaveAttribute(
      'data-state',
      'possible',
    );
  });

  it('ignores non-combo cards when allowActionCardCombos is false', () => {
    const hand: CriticalCard[] = ['strike', 'strike'];
    render(<ComboHints hand={hand} allowActionCardCombos={false} />);
    expect(screen.getByTestId('combo-hint-pair')).toHaveAttribute(
      'data-state',
      'inactive',
    );
  });

  it('counts non-combo cards when allowActionCardCombos is true', () => {
    const hand: CriticalCard[] = ['strike', 'strike'];
    render(<ComboHints hand={hand} allowActionCardCombos={true} />);
    expect(screen.getByTestId('combo-hint-pair')).toHaveAttribute(
      'data-state',
      'possible',
    );
  });

  it('flips the matching chip to active when activeKind is supplied', () => {
    const hand: CriticalCard[] = [
      'collection_alpha',
      'collection_alpha',
      'strike',
    ];
    render(
      <ComboHints
        hand={hand}
        allowActionCardCombos={false}
        activeKind="pair"
      />,
    );
    expect(screen.getByTestId('combo-hint-pair')).toHaveAttribute(
      'data-state',
      'active',
    );
    expect(screen.getByTestId('combo-hint-pair')).toHaveAttribute(
      'data-active',
      'true',
    );
    expect(screen.getByTestId('combo-hint-triple')).toHaveAttribute(
      'data-state',
      'inactive',
    );
  });

  it('labels each chip with its translation key', () => {
    // The mocked t() returns the key unchanged, so the chip text content is
    // exactly the i18n key path. Locking this down prevents accidental renames
    // of the hud namespace.
    render(<ComboHints hand={[]} allowActionCardCombos={false} />);
    expect(screen.getByTestId('combo-hint-pair')).toHaveTextContent(
      'games.table.hud.combo.pair',
    );
    expect(screen.getByTestId('combo-hint-triple')).toHaveTextContent(
      'games.table.hud.combo.triple',
    );
    expect(screen.getByTestId('combo-hint-fiver')).toHaveTextContent(
      'games.table.hud.combo.fiver',
    );
  });
});
