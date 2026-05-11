import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ─── Mock server actions before importing components ──────────────────────────
vi.mock('../server/economy.actions', () => ({
  loadEconomyHistoryAction: vi.fn(),
}));

import { EconomyAuditDrawer } from './EconomyAuditDrawer';
import { loadEconomyHistoryAction } from '../server/economy.actions';

const labels = {
  title: 'History for {{key}}',
  empty: 'No changes yet.',
  from: 'From',
  to: 'To',
};

const sampleRows = [
  {
    id: 'audit-1',
    fromValue: 50,
    toValue: 100,
    adminLabel: 'Alice',
    changedAt: '2026-05-10T10:00:00Z',
  },
  {
    id: 'audit-2',
    fromValue: 100,
    toValue: 75,
    adminLabel: 'Bob',
    changedAt: '2026-05-11T10:00:00Z',
  },
];

function renderDrawer(
  props: Partial<Parameters<typeof EconomyAuditDrawer>[0]> = {},
) {
  return render(
    <EconomyAuditDrawer
      open={true}
      onClose={vi.fn()}
      economyKey="game_win_coin_reward"
      labels={labels}
      {...props}
    />,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('EconomyAuditDrawer', () => {
  it('does not render when open=false', () => {
    vi.mocked(loadEconomyHistoryAction).mockResolvedValue({
      ok: true,
      data: [],
    });
    renderDrawer({ open: false });
    expect(screen.queryByTestId('economy-audit-drawer')).toBeNull();
  });

  it('renders when open=true', async () => {
    vi.mocked(loadEconomyHistoryAction).mockResolvedValue({
      ok: true,
      data: [],
    });
    renderDrawer();
    expect(screen.getByTestId('economy-audit-drawer')).toBeTruthy();
  });

  it('shows the key name in the title', async () => {
    vi.mocked(loadEconomyHistoryAction).mockResolvedValue({
      ok: true,
      data: [],
    });
    renderDrawer({ economyKey: 'gem_to_coin_rate' });
    expect(screen.getByText(/gem_to_coin_rate/)).toBeTruthy();
  });

  it('shows empty state when no rows returned', async () => {
    vi.mocked(loadEconomyHistoryAction).mockResolvedValue({
      ok: true,
      data: [],
    });
    renderDrawer();

    await waitFor(() => {
      expect(screen.getByTestId('economy-audit-empty')).toBeTruthy();
    });
    expect(screen.getByTestId('economy-audit-empty').textContent).toContain(
      'No changes yet',
    );
  });

  it('renders audit rows when data is returned', async () => {
    vi.mocked(loadEconomyHistoryAction).mockResolvedValue({
      ok: true,
      data: sampleRows,
    });
    renderDrawer();

    await waitFor(() => {
      expect(screen.getByTestId('economy-audit-list')).toBeTruthy();
    });

    expect(screen.getByTestId('economy-audit-row-audit-1')).toBeTruthy();
    expect(screen.getByTestId('economy-audit-row-audit-2')).toBeTruthy();
  });

  it('shows from and to values in rows', async () => {
    vi.mocked(loadEconomyHistoryAction).mockResolvedValue({
      ok: true,
      data: sampleRows,
    });
    renderDrawer();

    await waitFor(() => {
      expect(screen.getByTestId('economy-audit-list')).toBeTruthy();
    });

    // Check row 1 contains 50 (fromValue) and row 2 contains 75 (toValue)
    const row1 = screen.getByTestId('economy-audit-row-audit-1');
    const row2 = screen.getByTestId('economy-audit-row-audit-2');
    expect(row1.textContent).toContain('50');
    expect(row2.textContent).toContain('75');
    // Both rows together contain admin labels
    expect(row1.textContent).toContain('Alice');
    expect(row2.textContent).toContain('Bob');
  });

  it('shows error state when action fails', async () => {
    vi.mocked(loadEconomyHistoryAction).mockResolvedValue({
      ok: false,
      error: 'generic',
    });
    renderDrawer();

    await waitFor(() => {
      expect(screen.getByTestId('economy-audit-error')).toBeTruthy();
    });
  });

  it('calls loadEconomyHistoryAction with the economy key', async () => {
    vi.mocked(loadEconomyHistoryAction).mockResolvedValue({
      ok: true,
      data: [],
    });
    renderDrawer({ economyKey: 'gem_to_coin_rate' });

    await waitFor(() => {
      expect(loadEconomyHistoryAction).toHaveBeenCalledWith({
        key: 'gem_to_coin_rate',
      });
    });
  });

  it('close button calls onClose', async () => {
    vi.mocked(loadEconomyHistoryAction).mockResolvedValue({
      ok: true,
      data: [],
    });
    const onClose = vi.fn();
    renderDrawer({ onClose });

    const closeBtn = screen.getByTestId('economy-audit-close-btn');
    await userEvent.click(closeBtn);

    expect(onClose).toHaveBeenCalled();
  });
});
