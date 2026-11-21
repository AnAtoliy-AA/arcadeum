import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { toDayKey } from '../lib/arcade-pet-daily-bonus';
import { ArcadePetDailyBonus } from './ArcadePetDailyBonus';

describe('ArcadePetDailyBonus', () => {
  it('shows a claim button when the bonus is available', () => {
    const onClaim = vi.fn();
    render(
      <ArcadePetDailyBonus lastClaimDay={null} streak={0} onClaim={onClaim} />,
    );
    fireEvent.click(screen.getByTestId('companion-daily-bonus-btn'));
    expect(onClaim).toHaveBeenCalledTimes(1);
  });

  it('hides the button after today is claimed', () => {
    render(
      <ArcadePetDailyBonus
        lastClaimDay={toDayKey(Date.now())}
        streak={1}
        onClaim={vi.fn()}
      />,
    );
    expect(screen.queryByTestId('companion-daily-bonus-btn')).toBeNull();
  });
});
