import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DailyLeaderboardModal } from '../DailyLeaderboardModal';

describe('DailyLeaderboardModal', () => {
  it('does not render when closed', () => {
    const { container } = render(
      <DailyLeaderboardModal
        isOpen={false}
        onClose={vi.fn()}
        dateStr="2026-09-24"
        puzzleId="daily-2026-09-24"
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders leaderboard and personal best when open', () => {
    const onClose = vi.fn();
    render(
      <DailyLeaderboardModal
        isOpen={true}
        onClose={onClose}
        dateStr="2026-09-24"
        puzzleId="daily-2026-09-24"
        lastSolveTimeMs={12500}
      />,
    );

    expect(screen.getByTestId('daily-leaderboard-modal')).toBeDefined();
    expect(screen.getByTestId('user-speed-pb-card')).toBeDefined();
    expect(screen.getAllByText('12.5s').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Speed Demon/).length).toBeGreaterThan(0);

    const closeBtn = screen.getByTestId('close-leaderboard-btn');
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });
});
