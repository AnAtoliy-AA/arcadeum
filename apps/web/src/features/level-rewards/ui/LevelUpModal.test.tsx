import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LevelUpModal } from './LevelUpModal';
import { useLevelUpModalStore } from '../store/levelUpModalStore';

const mockClaimAction = vi.fn();

vi.mock('../api/level-rewards.api', () => ({
  claimLevelRewards: () => mockClaimAction(),
  getLevelRewardsStatus: vi.fn(),
}));

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string, params?: { level?: string }) => {
      if (params?.level)
        return `Congratulations! You reached Level ${params.level}!`;
      const map: Record<string, string> = {
        'stats.levelUp': 'LEVEL UP!',
        'stats.coinsReward': 'Coins Reward',
        'stats.milestoneBadgeUnlocked': 'Milestone Badge Unlocked!',
        'stats.claimReward': 'Claim Reward',
        'stats.rewardClaimed': 'Claimed!',
        'pages.shop.items.badge.scout.name': 'Scout',
      };
      return map[key] ?? key;
    },
  }),
}));

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <span data-testid="badge-image" data-src={src} aria-label={alt} />
  ),
}));

describe('LevelUpModal', () => {
  beforeEach(() => {
    mockClaimAction.mockReset();
    useLevelUpModalStore.setState({
      isOpen: false,
      level: 5,
      coinAmount: 250,
      badgeId: null,
      isClaiming: false,
      isClaimed: false,
    });
  });

  it('renders nothing when closed', () => {
    render(<LevelUpModal />);
    expect(screen.queryByTestId('level-up-modal')).not.toBeInTheDocument();
  });

  it('renders level up celebration and coins reward when open', () => {
    useLevelUpModalStore.setState({
      isOpen: true,
      level: 5,
      coinAmount: 250,
      badgeId: 'badge-scout',
    });

    render(<LevelUpModal />);

    expect(screen.getByTestId('level-up-modal')).toBeInTheDocument();
    expect(screen.getByText('LEVEL UP!')).toBeInTheDocument();
    expect(
      screen.getByText('Congratulations! You reached Level 5!'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('level-up-coins-reward')).toHaveTextContent(
      '+250',
    );
    expect(screen.getByTestId('level-up-badge-reward')).toBeInTheDocument();
    expect(screen.getByText('Scout')).toBeInTheDocument();
  });

  it('claims rewards when claim button is clicked', async () => {
    mockClaimAction.mockResolvedValue({
      ok: true,
      data: {
        currentLevel: 5,
        claimedLevel: 5,
        coinsAwarded: 250,
        badgesAwarded: ['badge-scout'],
        alreadyClaimed: false,
      },
    });

    useLevelUpModalStore.setState({
      isOpen: true,
      level: 5,
      coinAmount: 250,
      badgeId: null,
    });

    render(<LevelUpModal />);

    const claimBtn = screen.getByTestId('level-up-claim-btn');
    expect(claimBtn).toHaveTextContent('Claim Reward');

    fireEvent.click(claimBtn);

    await waitFor(() => {
      expect(mockClaimAction).toHaveBeenCalled();
      expect(claimBtn).toHaveTextContent('Claimed!');
    });
  });

  it('closes modal when close button is clicked', () => {
    useLevelUpModalStore.setState({
      isOpen: true,
      level: 5,
      coinAmount: 250,
      badgeId: null,
    });

    render(<LevelUpModal />);

    const closeBtn = screen.getByTestId('level-up-close-btn');
    fireEvent.click(closeBtn);

    expect(useLevelUpModalStore.getState().isOpen).toBe(false);
  });
});
