import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LevelProgression } from './LevelProgression';

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'stats.levelProgression': 'Level Progression',
        'stats.levelProgressionShowLess': 'Show less',
        'stats.levelProgressionShowAll': 'Show all 99 levels',
        'stats.level': 'Level',
        'stats.totalXP': 'Total XP',
        'stats.xpNeeded': 'XP Needed',
        'stats.reward': 'Reward',
        'stats.youBadge': 'you',
        'stats.unlocked': 'Unlocked',
        'stats.locked': 'Locked',
        'pages.shop.items.badge.newcomer.name': 'Newcomer',
        'pages.shop.items.badge.scout.name': 'Scout',
        'pages.shop.items.badge.veteran.name': 'Veteran',
        'pages.shop.items.badge.champion.name': 'Champion',
        'pages.shop.items.badge.mythic.name': 'Mythic Star',
      };
      return map[key] ?? key;
    },
  }),
}));

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <span data-testid="reward-image" data-src={src} aria-label={alt} />
  ),
}));

describe('LevelProgression', () => {
  it('renders level progression table with milestone badge rewards', () => {
    render(<LevelProgression currentLevel={5} />);

    expect(screen.getByText('Level Progression')).toBeInTheDocument();
    expect(screen.getByTestId('level-reward-1')).toBeInTheDocument();
    expect(screen.getByTestId('level-reward-5')).toBeInTheDocument();
    expect(screen.getByTestId('level-reward-10')).toBeInTheDocument();

    expect(screen.getByText('Newcomer')).toBeInTheDocument();
    expect(screen.getByText('Scout')).toBeInTheDocument();
    expect(screen.getByText('Veteran')).toBeInTheDocument();
  });

  it('marks current and past rewards as unlocked and future as locked', () => {
    render(<LevelProgression currentLevel={5} />);

    const reward1 = screen.getByTestId('level-reward-1');
    expect(reward1).toHaveTextContent('Unlocked');

    const reward5 = screen.getByTestId('level-reward-5');
    expect(reward5).toHaveTextContent('Unlocked');

    const reward10 = screen.getByTestId('level-reward-10');
    expect(reward10).toHaveTextContent('Locked');
  });

  it('renders coins rewards for each level', () => {
    render(<LevelProgression currentLevel={5} />);

    expect(screen.getByTestId('level-coins-1')).toHaveTextContent('+50 🪙');
    expect(screen.getByTestId('level-coins-5')).toHaveTextContent('+250 🪙');
  });

  it('toggles expansion to show all 99 levels', () => {
    render(<LevelProgression currentLevel={5} />);

    expect(screen.queryByTestId('level-reward-99')).not.toBeInTheDocument();

    const toggleBtn = screen.getByRole('button', {
      name: /Show all 99 levels/i,
    });
    fireEvent.click(toggleBtn);

    expect(screen.getByText('Show less')).toBeInTheDocument();
    expect(screen.getByTestId('level-reward-35')).toBeInTheDocument();
    expect(screen.getByTestId('level-reward-45')).toBeInTheDocument();
    expect(screen.getByTestId('level-reward-99')).toBeInTheDocument();
    expect(screen.getByText('Mythic Star')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Show less/i }));
    expect(screen.queryByTestId('level-reward-99')).not.toBeInTheDocument();
  });
});
