import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// ─── Mock server-only and listEconomySettings ─────────────────────────────────
vi.mock('server-only', () => ({}));
vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({ get: () => undefined })),
}));
vi.mock('../server/economy.server', () => ({
  listEconomySettings: vi.fn(),
}));
// Mock client components to avoid needing full DOM setup for dialogs
vi.mock('./EconomyRow', () => ({
  EconomyRow: ({
    setting,
    name,
  }: {
    setting: { key: string };
    name: string;
  }) => (
    <tr data-testid={`economy-row-${setting.key}`}>
      <td data-testid={`economy-row-name-${setting.key}`}>{name}</td>
    </tr>
  ),
}));

import { AdminEconomyTable } from './AdminEconomyTable';
import { listEconomySettings } from '../server/economy.server';
import type { EconomySettingView } from '../server/economy.types';

const ALL_KEYS = [
  'game_win_coin_reward',
  'gem_to_coin_rate',
  'referral_reward_coins_per',
  'referral_tier_1_bonus_coins',
  'referral_tier_2_bonus_coins',
  'referral_tier_3_bonus_coins',
] as const;

function makeSetting(
  key: EconomySettingView['key'],
  overrides: Partial<EconomySettingView> = {},
): EconomySettingView {
  return {
    key,
    currentValue: 50,
    defaultValue: 50,
    source: 'default',
    updatedAt: null,
    updatedByLabel: null,
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('AdminEconomyTable', () => {
  it('renders a row for each of the 6 economy keys', async () => {
    const settings = ALL_KEYS.map((k) => makeSetting(k));
    vi.mocked(listEconomySettings).mockResolvedValue(settings);

    const element = await AdminEconomyTable();
    render(element);

    for (const key of ALL_KEYS) {
      expect(screen.getByTestId(`economy-row-${key}`)).toBeTruthy();
    }
  });

  it('shows the table element when settings are loaded', async () => {
    const settings = ALL_KEYS.map((k) => makeSetting(k));
    vi.mocked(listEconomySettings).mockResolvedValue(settings);

    const element = await AdminEconomyTable();
    render(element);

    expect(screen.getByTestId('economy-table')).toBeTruthy();
  });

  it('shows empty state when no settings returned', async () => {
    vi.mocked(listEconomySettings).mockResolvedValue([]);

    const element = await AdminEconomyTable();
    render(element);

    expect(screen.getByTestId('economy-table-empty')).toBeTruthy();
  });

  it('renders all column headers', async () => {
    const settings = ALL_KEYS.map((k) => makeSetting(k));
    vi.mocked(listEconomySettings).mockResolvedValue(settings);

    const element = await AdminEconomyTable();
    render(element);

    expect(screen.getByText('Setting')).toBeTruthy();
    expect(screen.getByText('Current value')).toBeTruthy();
    expect(screen.getByText('Default')).toBeTruthy();
    expect(screen.getByText('Source')).toBeTruthy();
    expect(screen.getByText('Last changed')).toBeTruthy();
    expect(screen.getByText('Actions')).toBeTruthy();
  });

  it('calls listEconomySettings once', async () => {
    const settings = ALL_KEYS.map((k) => makeSetting(k));
    vi.mocked(listEconomySettings).mockResolvedValue(settings);

    await AdminEconomyTable();

    expect(listEconomySettings).toHaveBeenCalledOnce();
  });
});
