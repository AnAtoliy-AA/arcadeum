import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EventPrizeBadge } from './EventPrizeBadge';

describe('EventPrizeBadge', () => {
  it('should render null when badgeId is null or empty', () => {
    const { container } = render(<EventPrizeBadge badgeId={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render showcase variant for admiral_ribbon', () => {
    render(<EventPrizeBadge badgeId="admiral_ribbon" variant="showcase" />);

    expect(
      screen.getByTestId('badge-showcase-admiral_ribbon'),
    ).toBeInTheDocument();
    expect(screen.getByText("Admiral's Ribbon")).toBeInTheDocument();
    expect(screen.getByText('epic')).toBeInTheDocument();
  });

  it('should render chip variant for champion_crown', () => {
    render(<EventPrizeBadge badgeId="champion_crown" variant="chip" />);

    expect(screen.getByTestId('badge-chip-champion_crown')).toBeInTheDocument();
    expect(screen.getByText("Grandmaster's Crown")).toBeInTheDocument();
    expect(screen.getByText('legendary')).toBeInTheDocument();
  });

  it('should render medallion variant for golden_dice', () => {
    render(<EventPrizeBadge badgeId="golden_dice" variant="medallion" />);

    expect(
      screen.getByTestId('badge-medallion-golden_dice'),
    ).toBeInTheDocument();
  });

  it('should format fallback badge id when not in dictionary', () => {
    render(
      <EventPrizeBadge badgeId="custom_tournament_star" variant="showcase" />,
    );

    expect(screen.getByText('Custom Tournament Star')).toBeInTheDocument();
  });
});
