import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { toDayKey } from '@arcadeum/games-core';
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

  describe('midnight rollover', () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it('re-derives availability when the tab regains focus on the next day', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-03-10T12:00:00Z'));
      render(
        <ArcadePetDailyBonus
          lastClaimDay={toDayKey(Date.now())}
          streak={1}
          onClaim={vi.fn()}
        />,
      );
      expect(screen.queryByTestId('companion-daily-bonus-btn')).toBeNull();

      vi.setSystemTime(new Date('2026-03-11T12:00:00Z'));
      act(() => {
        window.dispatchEvent(new Event('focus'));
      });
      expect(screen.getByTestId('companion-daily-bonus-btn')).toBeTruthy();
    });
  });
});
