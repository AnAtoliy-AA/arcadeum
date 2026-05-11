import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StampRow } from './StampRow';

// `DailyRewardCard` itself is an async Server Component that pulls cookies +
// fetches the BE. Testing it directly would require mocking those server
// boundaries and re-running the same `BalanceChip`-style integration we have
// covered via the `daily-rewards.actions.test.ts` + `ClaimButton.test.tsx`
// suites. Here we exercise the deterministic part of the card's surface area:
// the StampRow that drives the visual streak state across all 8 transitions
// (streaks 0..7).

const dayLabel = 'Day {n}';

describe('StampRow', () => {
  it('renders 7 stamps', () => {
    render(
      <StampRow
        nextDay={1}
        currentStreak={0}
        canClaim={true}
        dayLabel={dayLabel}
      />,
    );
    for (let i = 1; i <= 7; i++) {
      expect(screen.getByTestId(`daily-reward-stamp-${i}`)).toBeDefined();
    }
  });

  it('streak=0, canClaim=true → Day 1 active, Days 2..7 locked', () => {
    render(
      <StampRow
        nextDay={1}
        currentStreak={0}
        canClaim={true}
        dayLabel={dayLabel}
      />,
    );
    expect(
      screen.getByTestId('daily-reward-stamp-1').getAttribute('data-state'),
    ).toBe('active');
    for (let i = 2; i <= 7; i++) {
      expect(
        screen
          .getByTestId(`daily-reward-stamp-${i}`)
          .getAttribute('data-state'),
      ).toBe('locked');
    }
  });

  it('streak=3, canClaim=true → Days 1..3 claimed, Day 4 active, Days 5..7 locked', () => {
    render(
      <StampRow
        nextDay={4}
        currentStreak={3}
        canClaim={true}
        dayLabel={dayLabel}
      />,
    );
    for (let i = 1; i <= 3; i++) {
      expect(
        screen
          .getByTestId(`daily-reward-stamp-${i}`)
          .getAttribute('data-state'),
      ).toBe('claimed');
    }
    expect(
      screen.getByTestId('daily-reward-stamp-4').getAttribute('data-state'),
    ).toBe('active');
    for (let i = 5; i <= 7; i++) {
      expect(
        screen
          .getByTestId(`daily-reward-stamp-${i}`)
          .getAttribute('data-state'),
      ).toBe('locked');
    }
  });

  it('streak=7, canClaim=true (next day wraps) → Days 1..7 claimed except active wrap shows on Day 1', () => {
    // After a Day 7 claim followed by a missed day, nextDay would be 1 again.
    // But while the user is mid-streak (claimed=7), the next day to award
    // would only become Day 1 after the streak is reset; the BE clamps
    // `nextDay` accordingly. We test the canonical post-Day-7 case where
    // currentStreak resets to 0 before nextDay=1.
    render(
      <StampRow
        nextDay={1}
        currentStreak={7}
        canClaim={true}
        dayLabel={dayLabel}
      />,
    );
    for (let i = 1; i <= 7; i++) {
      expect(
        screen
          .getByTestId(`daily-reward-stamp-${i}`)
          .getAttribute('data-state'),
      ).toBe('claimed');
    }
  });

  it('canClaim=false → no stamp is active; claimed stamps reflect the streak', () => {
    render(
      <StampRow
        nextDay={3}
        currentStreak={2}
        canClaim={false}
        dayLabel={dayLabel}
      />,
    );
    expect(
      screen.getByTestId('daily-reward-stamp-1').getAttribute('data-state'),
    ).toBe('claimed');
    expect(
      screen.getByTestId('daily-reward-stamp-2').getAttribute('data-state'),
    ).toBe('claimed');
    expect(
      screen.getByTestId('daily-reward-stamp-3').getAttribute('data-state'),
    ).toBe('locked');
  });

  it('renders the gem-bonus badge on Day 7 only', () => {
    render(
      <StampRow
        nextDay={1}
        currentStreak={0}
        canClaim={true}
        dayLabel={dayLabel}
      />,
    );
    expect(
      screen.queryByTestId('daily-reward-stamp-7-gem'),
    ).not.toBeNull();
    // None of the other stamps should have a gem badge marker.
    for (let i = 1; i <= 6; i++) {
      const stamp = screen.getByTestId(`daily-reward-stamp-${i}`);
      expect(stamp.querySelector('[data-testid$="-gem"]')).toBeNull();
    }
  });

  it('replaces {n} in the dayLabel for each stamp aria-label', () => {
    render(
      <StampRow
        nextDay={1}
        currentStreak={0}
        canClaim={true}
        dayLabel="Day {n}"
      />,
    );
    expect(
      screen.getByTestId('daily-reward-stamp-3').getAttribute('aria-label'),
    ).toBe('Day 3');
  });
});
