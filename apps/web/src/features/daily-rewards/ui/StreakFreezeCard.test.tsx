import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StreakFreezeCard } from './StreakFreezeCard';

const buyFreezeActionMock = vi.fn();
vi.mock('../server/buy-freeze.actions', () => ({
  buyFreezeAction: (q?: number) => buyFreezeActionMock(q),
}));

describe('StreakFreezeCard', () => {
  it('renders active status with tokens count when tokens > 0', () => {
    render(<StreakFreezeCard initialFreezeTokens={2} currentStreak={5} />);

    expect(screen.getByText('Streak Freeze Shield')).toBeInTheDocument();
    expect(screen.getByTestId('streak-freeze-status-badge')).toHaveTextContent(
      '2 Shield Tokens Active',
    );
    expect(
      screen.getByText(/Protecting your 5-day streak/),
    ).toBeInTheDocument();
  });

  it('renders inactive status when tokens is 0', () => {
    render(<StreakFreezeCard initialFreezeTokens={0} currentStreak={0} />);

    expect(screen.getByTestId('streak-freeze-status-badge')).toHaveTextContent(
      'No Active Shield (Unprotected)',
    );
  });

  it('handles buy freeze success and updates token status', async () => {
    buyFreezeActionMock.mockResolvedValueOnce({
      ok: true,
      result: { freezeTokens: 1, coinsSpent: 100 },
    });

    render(<StreakFreezeCard initialFreezeTokens={0} />);

    const buyBtn = screen.getByTestId('buy-streak-freeze-button');
    fireEvent.click(buyBtn);

    await waitFor(() => {
      expect(screen.getByTestId('streak-freeze-feedback')).toHaveTextContent(
        'Streak freeze purchased! 🛡️',
      );
    });

    expect(screen.getByTestId('streak-freeze-status-badge')).toHaveTextContent(
      '1 Shield Token Active',
    );
  });

  it('handles insufficient coins error', async () => {
    buyFreezeActionMock.mockResolvedValueOnce({
      ok: false,
      code: 'insufficient_funds',
    });

    render(<StreakFreezeCard initialFreezeTokens={0} />);

    const buyBtn = screen.getByTestId('buy-streak-freeze-button');
    fireEvent.click(buyBtn);

    await waitFor(() => {
      expect(screen.getByTestId('streak-freeze-feedback')).toHaveTextContent(
        'Need 100 coins to buy streak freeze.',
      );
    });
  });
});
