import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createInitialPet } from '@arcadeum/games-core';
import { mockUseTranslation } from '../test/mock-translation';
import { ArcadePetStatusPanel } from './ArcadePetStatusPanel';

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => mockUseTranslation(),
}));

const pet = {
  ...createInitialPet({ id: 'p1', name: 'Bit', species: 'dragon' }),
  stage: 'baby' as const,
};

describe('ArcadePetStatusPanel', () => {
  it('shows the running banner and growth speed on screen', () => {
    render(<ArcadePetStatusPanel pet={pet} isAtHome={false} />);
    expect(screen.getByTestId('pet-running-banner')).toBeInTheDocument();
    expect(screen.getByTestId('pet-growth-rate-badge')).toHaveTextContent(
      'Growth Speed',
    );
  });

  it('shows the resting banner and paused growth at home', () => {
    render(<ArcadePetStatusPanel pet={pet} isAtHome />);
    expect(screen.getByTestId('pet-home-resting-banner')).toBeInTheDocument();
    expect(screen.getByTestId('pet-growth-rate-badge')).toHaveTextContent(
      'Paused at Home',
    );
  });
});
