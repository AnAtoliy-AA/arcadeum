import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';

const claimAchievementMock = vi.hoisted(() => vi.fn());

vi.mock('../actions', () => ({
  claimAchievement: claimAchievementMock,
}));

interface ChildrenProps {
  children?: ReactNode;
  className?: string;
  'data-testid'?: string;
}

vi.mock('@arcadeum/ui', () => ({
  GlassCard: ({
    children,
    className,
    'data-testid': dataTestId,
  }: ChildrenProps) => (
    <div className={className} data-testid={dataTestId}>
      {children}
    </div>
  ),
  Button: ({
    children,
    onClick,
    disabled,
    loading,
    'data-testid': dataTestId,
  }: ChildrenProps & {
    onClick?: () => void;
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
    variant?: string;
    size?: string;
    'data-testid'?: string;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      data-testid={dataTestId}
    >
      {children}
    </button>
  ),
  ProgressBar: ({ value }: { value: number }) => (
    <div
      role="progressbar"
      data-testid="progress-bar"
      aria-valuenow={Math.round(value)}
    />
  ),
  TrophyIcon: () => <svg aria-hidden />,
  LockIcon: () => <svg aria-hidden />,
}));

import { AchievementGrid } from '../ui/AchievementGrid';
import type { Achievement } from '../server/achievements.types';
import type { AchievementGridLabels } from '../ui/AchievementGrid';

const LABELS: AchievementGridLabels = {
  claim: 'Claim',
  claimed: '✓ Claimed',
  lockedTooltip: 'Locked — keep playing to unlock',
  error: "Couldn't claim. Please try again.",
  categories: {
    gameplay: 'Gameplay',
    social: 'Social',
    collection: 'Collection',
    competitive: 'Competitive',
  },
  rarities: {
    common: 'Common',
    rare: 'Rare',
    epic: 'Epic',
    legendary: 'Legendary',
  },
  rewards: { xp: 'XP', coins: 'Coins', gems: 'Gems' },
};

function makeAchievement(overrides: Partial<Achievement> = {}): Achievement {
  return {
    achievementId: 'first_win',
    name: 'First Blood',
    description: 'Win your first game',
    category: 'gameplay',
    rarity: 'rare',
    unlocked: true,
    claimed: false,
    xpReward: 100,
    coinReward: 50,
    gemReward: 0,
    progress: 1,
    targetProgress: 1,
    ...overrides,
  };
}

describe('AchievementGrid', () => {
  beforeEach(() => {
    claimAchievementMock.mockReset();
  });

  it('renders an unlocked unclaimed card with a claim button; claiming shows the claimed chip', async () => {
    claimAchievementMock.mockResolvedValue({
      ok: true,
      result: {
        achievementId: 'first_win',
        xpReward: 100,
        coinReward: 50,
        gemReward: 0,
        totalXpEarned: 100,
      },
    });

    render(
      <AchievementGrid achievements={[makeAchievement()]} labels={LABELS} />,
    );

    const claimBtn = screen.getByTestId('achievement-claim-first_win');
    expect(screen.queryByTestId('achievement-claimed-first_win')).toBeNull();

    fireEvent.click(claimBtn);
    expect(claimAchievementMock).toHaveBeenCalledWith('first_win');

    await waitFor(() =>
      expect(
        screen.getByTestId('achievement-claimed-first_win'),
      ).toBeInTheDocument(),
    );
    expect(screen.queryByTestId('achievement-claim-first_win')).toBeNull();
  });

  it('renders a locked card with a lock icon and no claim button', () => {
    render(
      <AchievementGrid
        achievements={[
          makeAchievement({
            unlocked: false,
            progress: 3,
            targetProgress: 10,
          }),
        ]}
        labels={LABELS}
      />,
    );

    expect(screen.getByTestId('achievement-icon-lock')).toBeInTheDocument();
    expect(screen.queryByTestId('achievement-claim-first_win')).toBeNull();
    expect(screen.queryByTestId('achievement-claimed-first_win')).toBeNull();
  });

  it('renders a progress bar when progress is below target', () => {
    render(
      <AchievementGrid
        achievements={[
          makeAchievement({
            unlocked: false,
            progress: 3,
            targetProgress: 10,
          }),
        ]}
        labels={LABELS}
      />,
    );

    const bar = screen.getByTestId('progress-bar');
    expect(bar).toHaveAttribute('aria-valuenow', '30');
  });

  it('marks the card claimed when the server reports already_claimed', async () => {
    claimAchievementMock.mockResolvedValue({
      ok: false,
      code: 'already_claimed',
    });

    render(
      <AchievementGrid achievements={[makeAchievement()]} labels={LABELS} />,
    );

    fireEvent.click(screen.getByTestId('achievement-claim-first_win'));

    await waitFor(() =>
      expect(
        screen.getByTestId('achievement-claimed-first_win'),
      ).toBeInTheDocument(),
    );
  });

  it('shows an error label on generic claim failure without marking claimed', async () => {
    claimAchievementMock.mockResolvedValue({ ok: false, code: 'unknown' });

    render(
      <AchievementGrid achievements={[makeAchievement()]} labels={LABELS} />,
    );

    fireEvent.click(screen.getByTestId('achievement-claim-first_win'));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(LABELS.error),
    );
    expect(screen.queryByTestId('achievement-claimed-first_win')).toBeNull();
  });
});
