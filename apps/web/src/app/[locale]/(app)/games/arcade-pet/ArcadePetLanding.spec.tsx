import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { ArcadePetLanding } from './ArcadePetLanding';

vi.mock('@/widgets/SimulationGames/ArcadePetGame', () => ({
  ArcadePetGame: () => <div data-testid="mock-arcade-pet-game">Pet Game</div>,
}));

describe('ArcadePetLanding', () => {
  it('renders active game when comingSoon is false', () => {
    render(
      <ArcadePetLanding
        gameName="ArcadePet"
        description="Virtual companion simulation"
        comingSoon={false}
      />,
    );

    expect(screen.getByText('ArcadePet')).toBeInTheDocument();
    expect(screen.getByTestId('mock-arcade-pet-game')).toBeInTheDocument();
    expect(
      screen.queryByTestId('arcade-pet-coming-soon-banner'),
    ).not.toBeInTheDocument();
  });

  it('renders disabled notice when admin disables feature (comingSoon is true)', () => {
    render(
      <ArcadePetLanding
        gameName="ArcadePet"
        description="Virtual companion simulation"
        comingSoon={true}
      />,
    );

    expect(screen.getByText('ArcadePet')).toBeInTheDocument();
    expect(
      screen.getByTestId('arcade-pet-coming-soon-banner'),
    ).toBeInTheDocument();
    expect(screen.getByText('Feature Currently Disabled')).toBeInTheDocument();
    expect(
      screen.queryByTestId('mock-arcade-pet-game'),
    ).not.toBeInTheDocument();
  });
});
