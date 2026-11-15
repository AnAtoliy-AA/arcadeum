import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ArcadePetAwayBanner } from './ArcadePetAwayBanner';
import { mockUseTranslation } from '../test/mock-translation';

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => mockUseTranslation(),
}));

describe('ArcadePetAwayBanner', () => {
  it('announces the summary and can be dismissed', () => {
    const onDismiss = vi.fn();
    render(
      <ArcadePetAwayBanner
        summary={{
          petName: 'Bit',
          awayMs: 5 * 60 * 60 * 1000,
          hungerDrop: 20,
          growthHoursGained: 1.5,
          stageBefore: 'egg',
          stageAfter: 'baby',
        }}
        onDismiss={onDismiss}
      />,
    );
    const banner = screen.getByRole('status');
    expect(banner).toHaveTextContent('Bit lost 20 hunger');
    expect(banner).toHaveTextContent('Now a baby!');
    fireEvent.click(screen.getByTestId('pet-away-summary-dismiss'));
    expect(onDismiss).toHaveBeenCalled();
  });
});
