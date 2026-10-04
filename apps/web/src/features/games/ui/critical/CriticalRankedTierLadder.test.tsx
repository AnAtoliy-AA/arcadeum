import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CriticalRankedTierLadder } from './CriticalRankedTierLadder';

describe('CriticalRankedTierLadder', () => {
  it('renders title, subtitle, and all 6 ranking tiers', () => {
    render(
      <CriticalRankedTierLadder
        currentTier="gold"
        title="Competitive Tier Ladder"
        subtitle="Progress through six competitive skill brackets"
      />,
    );

    expect(screen.getByText('Competitive Tier Ladder')).toBeInTheDocument();
    expect(
      screen.getByText('Progress through six competitive skill brackets'),
    ).toBeInTheDocument();

    expect(screen.getByTestId('tier-card-master')).toBeInTheDocument();
    expect(screen.getByTestId('tier-card-diamond')).toBeInTheDocument();
    expect(screen.getByTestId('tier-card-platinum')).toBeInTheDocument();
    expect(screen.getByTestId('tier-card-gold')).toBeInTheDocument();
    expect(screen.getByTestId('tier-card-silver')).toBeInTheDocument();
    expect(screen.getByTestId('tier-card-bronze')).toBeInTheDocument();

    expect(screen.getByText('Current Tier')).toBeInTheDocument();
  });

  it('renders custom localized tier descriptions', () => {
    const customTiers = {
      master: {
        name: 'Apex Master',
        min: '2000+ ELO',
        desc: 'Supreme bomb mastery',
      },
      gold: {
        name: 'Gold Strategist',
        min: '1400+ ELO',
        desc: 'Advanced resource denial',
      },
    };

    render(
      <CriticalRankedTierLadder
        tiersInfo={customTiers}
        title="Tiers"
        subtitle="Skill brackets"
      />,
    );

    expect(screen.getByText('Apex Master')).toBeInTheDocument();
    expect(screen.getByText('Supreme bomb mastery')).toBeInTheDocument();
    expect(screen.getByText('Gold Strategist')).toBeInTheDocument();
    expect(screen.getByText('Advanced resource denial')).toBeInTheDocument();
  });
});
