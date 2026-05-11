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

  it('reports min odds (visible criticals over full deck size) when cards are hidden', () => {
    // 1 visible critical + 1 visible non-critical + 2 hidden = 1/4 = 25%.
    // Hidden cards stay in the denominator because they COULD be critical;
    // we can't count them in the numerator without server data, so the
    // reported percentage is a lower bound. The tooltip labels this.
    const deck: CriticalCard[] = [
      'critical_event',
      'strike',
      'hidden' as CriticalCard,
      'hidden' as CriticalCard,
    ];
    render(<ThreatStrip hand={['neutralizer']} deck={deck} />);
    expect(screen.getByTestId('threat-strip-odds')).toHaveTextContent('25%');
  });

  it('prefers serverOverloadOdds over the client estimate when provided', () => {
    // Client estimate from the visible deck would be 33% (1 of 3 cards
    // visible is a critical). The server says 60%, which wins.
    const deck: CriticalCard[] = ['critical_event', 'strike', 'evade'];
    render(
      <ThreatStrip
        hand={['neutralizer']}
        deck={deck}
        serverOverloadOdds={60}
      />,
    );
    expect(screen.getByTestId('threat-strip-odds')).toHaveTextContent('60%');
    expect(screen.getByTestId('threat-strip')).toHaveAttribute(
      'data-odds-source',
      'server',
    );
  });

  it('renders 0% (not em-dash) when server reports zero', () => {
    render(
      <ThreatStrip hand={['neutralizer']} deck={[]} serverOverloadOdds={0} />,
    );
    expect(screen.getByTestId('threat-strip-odds')).toHaveTextContent('0%');
  });

  it('falls back to the client estimate when serverOverloadOdds is null', () => {
    const deck: CriticalCard[] = ['critical_event', 'strike', 'evade', 'trade'];
    render(
      <ThreatStrip
        hand={['neutralizer']}
        deck={deck}
        serverOverloadOdds={null}
      />,
    );
    expect(screen.getByTestId('threat-strip-odds')).toHaveTextContent('25%');
    expect(screen.getByTestId('threat-strip')).toHaveAttribute(
      'data-odds-source',
      'client',
    );
  });

  it('exposes a data-pulse flag instead of inlining an animation rule', () => {
    // The keyframes live in HudStyles and are gated on prefers-reduced-motion.
    // ThreatStrip only signals "should pulse" via a data attribute; inlining
    // an animation rule would bypass that gate.
    const { rerender } = render(<ThreatStrip hand={['strike']} deck={[]} />);
    expect(screen.getByTestId('threat-strip')).toHaveAttribute(
      'data-pulse',
      'true',
    );
    expect(
      screen.getByTestId('threat-strip').getAttribute('style') ?? '',
    ).not.toContain('animation');

    rerender(<ThreatStrip hand={['neutralizer']} deck={[]} />);
    expect(screen.getByTestId('threat-strip')).toHaveAttribute(
      'data-pulse',
      'false',
    );
  });
});
