import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createInitialPet } from '@arcadeum/games-core';
import { mockUseTranslation } from '../test/mock-translation';
import { ArcadePetCompanionHeader } from './ArcadePetCompanionHeader';

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => mockUseTranslation(),
}));

const pet = {
  ...createInitialPet({
    id: 'p1',
    name: 'Bioluminescent Slime',
    species: 'blob',
  }),
  stage: 'child' as const,
};

function renderHeader() {
  return render(
    <ArcadePetCompanionHeader
      pet={pet}
      petCount={1}
      speciesEmoji="🐡"
      themePalette={{ emoji: '🌊', title: 'Underwater' } as never} // minimal palette stub for layout test
      coinBalance={120}
      gemBalance={3}
      onClose={() => undefined}
      onRename={() => ({ success: true })}
    />,
  );
}

describe('ArcadePetCompanionHeader layout', () => {
  it('puts name and edit on the first row and chips on a wrapping second row', () => {
    renderHeader();
    const header = screen.getByTestId('companion-header');
    const meta = screen.getByTestId('companion-header-meta');
    expect(header.firstElementChild).toContainElement(
      screen.getByTestId('pet-rename-btn'),
    );
    expect(meta).toHaveClass('flex-wrap');
    expect(meta).toContainElement(screen.getByTestId('companion-coin-balance'));
    expect(meta).toHaveTextContent('Underwater');
    expect(header).toHaveClass('min-w-0');
  });
});
