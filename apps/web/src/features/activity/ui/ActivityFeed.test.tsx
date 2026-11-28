import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ActivityFeed } from './ActivityFeed';
import * as api from '@/shared/api/activity';

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('@/shared/api/activity');

describe('ActivityFeed', () => {
  it('explains the empty state in plain words', async () => {
    vi.mocked(api.fetchActivityFeed).mockResolvedValue([]);
    render(<ActivityFeed />);
    await waitFor(() =>
      expect(
        screen.getByText('home.homeRecentActivityEmpty'),
      ).toBeInTheDocument(),
    );
  });

  it('shows a clear error message when loading fails', async () => {
    vi.mocked(api.fetchActivityFeed).mockRejectedValue(new Error('x'));
    render(<ActivityFeed />);
    await waitFor(() =>
      expect(
        screen.getByText('home.homeRecentActivityError'),
      ).toBeInTheDocument(),
    );
  });
});
