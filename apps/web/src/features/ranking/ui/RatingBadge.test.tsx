import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RatingBadge } from './RatingBadge';

vi.mock('@/shared/lib/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('RatingBadge', () => {
  it('renders the tier label and elo', () => {
    render(<RatingBadge tier="gold" elo={1450} />);
    expect(screen.getByText('games.ranking.tier.gold')).toBeInTheDocument();
    expect(screen.getByTestId('rating-elo').textContent).toBe('1450');
  });

  it('renders a signed delta for rating changes', () => {
    render(<RatingBadge tier="silver" elo={1216} delta={16} />);
    const delta = screen.getByTestId('rating-delta');
    expect(delta.textContent).toBe('+16');
  });

  it('renders a negative delta', () => {
    render(<RatingBadge tier="bronze" elo={1184} delta={-16} />);
    expect(screen.getByTestId('rating-delta').textContent).toBe('-16');
  });

  it('omits elo and delta when absent', () => {
    render(<RatingBadge tier="master" showElo={false} />);
    expect(screen.queryByTestId('rating-elo')).toBeNull();
    expect(screen.queryByTestId('rating-delta')).toBeNull();
    expect(screen.getByText('games.ranking.tier.master')).toBeInTheDocument();
  });
});
