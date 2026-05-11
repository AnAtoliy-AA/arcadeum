import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/shared/lib/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

import { ThreatStrip } from './ThreatStrip';
import type { CriticalCard } from '../types';

describe('ThreatStrip', () => {
  it('renders defuse count from hand', () => {
    const hand: CriticalCard[] = ['neutralizer', 'strike', 'containment_field'];
    render(<ThreatStrip hand={hand} deck={[]} />);
    expect(screen.getByTestId('threat-strip-defuses')).toHaveTextContent('2');
  });

  it('marks no-defuses when hand has zero defuse cards', () => {
    render(<ThreatStrip hand={['strike', 'evade']} deck={[]} />);
    expect(screen.getByTestId('threat-strip')).toHaveAttribute(
      'data-no-defuses',
      'true',
    );
  });

  it('computes overload odds from visible deck contents', () => {
    const deck: CriticalCard[] = ['critical_event', 'strike', 'evade', 'trade'];
    render(<ThreatStrip hand={['neutralizer']} deck={deck} />);
    expect(screen.getByTestId('threat-strip-odds')).toHaveTextContent('25%');
  });

  it('renders em-dash when deck is fully hidden', () => {
    const deck: CriticalCard[] = [
      'hidden' as CriticalCard,
      'hidden' as CriticalCard,
    ];
    render(<ThreatStrip hand={['neutralizer']} deck={deck} />);
    expect(screen.getByTestId('threat-strip-odds')).toHaveTextContent('—');
  });

  it('escalates level to danger when odds are high', () => {
    const deck: CriticalCard[] = ['critical_event', 'critical_event', 'strike'];
    render(<ThreatStrip hand={['neutralizer']} deck={deck} />);
    expect(screen.getByTestId('threat-strip')).toHaveAttribute(
      'data-level',
      'danger',
    );
  });
});
