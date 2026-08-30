import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BattlePassTierBar } from './BattlePassTierBar';

describe('BattlePassTierBar', () => {
  it('renders tier level and progress correctly', () => {
    render(<BattlePassTierBar totalXp={450} xpPerTier={300} />);

    expect(screen.getByText('Tier 2')).toBeDefined();
    expect(screen.getByText('150 / 300 XP to Tier 3')).toBeDefined();
    expect(screen.getByText('50%')).toBeDefined();
  });

  it('renders premium badge when isPremium is true', () => {
    render(<BattlePassTierBar totalXp={100} isPremium={true} />);

    expect(screen.getByText('PREMIUM PASS')).toBeDefined();
  });
});
