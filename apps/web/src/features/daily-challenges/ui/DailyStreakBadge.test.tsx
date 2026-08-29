import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { DailyStreakBadge } from './DailyStreakBadge';

describe('DailyStreakBadge', () => {
  it('renders streak count', () => {
    render(<DailyStreakBadge streak={5} multiplier={1.5} />);
    expect(screen.getByText('5 Days Streak')).toBeDefined();
    expect(screen.getByText('1.5x XP')).toBeDefined();
  });

  it('renders singular day for 1 day streak', () => {
    render(<DailyStreakBadge streak={1} />);
    expect(screen.getByText('1 Day Streak')).toBeDefined();
  });
});
