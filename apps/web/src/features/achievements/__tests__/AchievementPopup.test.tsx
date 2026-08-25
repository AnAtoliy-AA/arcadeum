import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@/shared/lib/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

import { AchievementPopup } from '../ui/AchievementPopup';
import {
  useAchievementsPopupStore,
  type PopupAchievement,
} from '../store/achievementsPopupStore';

function makeItem(overrides: Partial<PopupAchievement> = {}): PopupAchievement {
  return {
    achievementId: 'first_win',
    name: 'First Blood',
    rarity: 'legendary',
    xpReward: 100,
    ...overrides,
  };
}

const LABELS = {
  title: 'Achievement unlocked!',
  unlocked: 'New achievement unlocked',
  dismiss: 'Dismiss',
  xp: 'XP',
};

describe('AchievementPopup', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useAchievementsPopupStore.setState({ queue: [] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders queued achievements with name and xp reward', () => {
    act(() => {
      useAchievementsPopupStore.getState().enqueueMany([
        makeItem(),
        makeItem({
          achievementId: 'win_10',
          name: 'Ten Wins',
          rarity: 'epic',
          xpReward: 250,
        }),
      ]);
    });

    render(<AchievementPopup labels={LABELS} />);

    expect(screen.getByTestId('achievement-popup-first_win')).toHaveTextContent(
      'First Blood',
    );
    expect(screen.getByTestId('achievement-popup-first_win')).toHaveTextContent(
      '+100 XP',
    );
    expect(screen.getByTestId('achievement-popup-win_10')).toBeInTheDocument();
  });

  it('dismiss removes the entry from the queue and the DOM', () => {
    act(() => {
      useAchievementsPopupStore.getState().enqueueMany([makeItem()]);
    });
    render(<AchievementPopup labels={LABELS} />);
    expect(
      screen.getByTestId('achievement-popup-first_win'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('achievement-popup-dismiss-first_win'));

    expect(screen.queryByTestId('achievement-popup-first_win')).toBeNull();
    expect(useAchievementsPopupStore.getState().queue).toHaveLength(0);
  });

  it('auto-dismisses each entry after 6 seconds', () => {
    act(() => {
      useAchievementsPopupStore.getState().enqueueMany([makeItem()]);
    });
    render(<AchievementPopup labels={LABELS} />);
    expect(
      screen.getByTestId('achievement-popup-first_win'),
    ).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(6000);
    });

    expect(screen.queryByTestId('achievement-popup-first_win')).toBeNull();
  });

  it('renders nothing when the queue is empty', () => {
    render(<AchievementPopup labels={LABELS} />);
    expect(document.querySelector('[role="status"]')).toBeNull();
  });
});
