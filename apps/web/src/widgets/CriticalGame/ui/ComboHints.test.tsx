import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/shared/lib/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

import { ComboHints } from './ComboHints';
import type { CriticalCard } from '../types';

describe('ComboHints', () => {
  it('activates the pair chip when two combo cards match', () => {
    const hand: CriticalCard[] = [
      'collection_alpha',
      'collection_alpha',
      'strike',
    ];
    render(<ComboHints hand={hand} allowActionCardCombos={false} />);
    expect(screen.getByTestId('combo-hint-pair')).toHaveAttribute(
      'data-active',
      'true',
    );
    expect(screen.getByTestId('combo-hint-triple')).toHaveAttribute(
      'data-active',
      'false',
    );
    expect(screen.getByTestId('combo-hint-fiver')).toHaveAttribute(
      'data-active',
      'false',
    );
  });

  it('activates the triple chip when three combo cards match', () => {
    const hand: CriticalCard[] = [
      'collection_beta',
      'collection_beta',
      'collection_beta',
    ];
    render(<ComboHints hand={hand} allowActionCardCombos={false} />);
    expect(screen.getByTestId('combo-hint-pair')).toHaveAttribute(
      'data-active',
      'true',
    );
    expect(screen.getByTestId('combo-hint-triple')).toHaveAttribute(
      'data-active',
      'true',
    );
  });

  it('activates the fiver chip when hand has 5 distinct cards', () => {
    const hand: CriticalCard[] = [
      'strike',
      'evade',
      'trade',
      'reorder',
      'insight',
    ];
    render(<ComboHints hand={hand} allowActionCardCombos={false} />);
    expect(screen.getByTestId('combo-hint-fiver')).toHaveAttribute(
      'data-active',
      'true',
    );
  });

  it('ignores non-combo cards when allowActionCardCombos is false', () => {
    const hand: CriticalCard[] = ['strike', 'strike'];
    render(<ComboHints hand={hand} allowActionCardCombos={false} />);
    expect(screen.getByTestId('combo-hint-pair')).toHaveAttribute(
      'data-active',
      'false',
    );
  });

  it('counts non-combo cards when allowActionCardCombos is true', () => {
    const hand: CriticalCard[] = ['strike', 'strike'];
    render(<ComboHints hand={hand} allowActionCardCombos={true} />);
    expect(screen.getByTestId('combo-hint-pair')).toHaveAttribute(
      'data-active',
      'true',
    );
  });
});
