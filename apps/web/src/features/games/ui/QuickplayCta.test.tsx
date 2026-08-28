import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QuickplayCta } from './QuickplayCta';

const joinQueueMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/features/games/api', () => ({
  gamesApi: {
    quickplay: vi.fn().mockResolvedValue({ room: { id: 'room-1' } }),
    findHumanMatch: vi.fn(),
  },
}));

vi.mock('@/shared/config/useRoutes', () => ({
  useRoutes: () => ({ gameRoom: (id: string) => `/rooms/${id}` }),
}));

vi.mock('@/entities/session/model/useSessionTokens', () => ({
  useSessionTokens: () => ({
    snapshot: { accessToken: 'token', userId: 'u1' },
  }),
}));

vi.mock('@/features/games/ui/MatchmakingQueue', () => ({
  useMatchmaking: () => ({ joinQueue: joinQueueMock }),
}));

vi.mock('@arcadeum/ui', () => ({
  Button: ({
    children,
    onClick,
    disabled,
    loading,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    loading?: boolean;
  }) => (
    <button type="button" onClick={onClick} disabled={disabled || loading}>
      {children}
    </button>
  ),
}));

import { gamesApi } from '@/features/games/api';

describe('QuickplayCta theme pass-through', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('passes the theme to the AI quickplay request', async () => {
    render(
      <QuickplayCta
        gameId="sea_battle_v1"
        ctaQuickplay="Play vs AI now"
        ctaQuickplayError="Error"
        theme="cyberpunk"
      />,
    );
    fireEvent.click(screen.getByText('Play vs AI now'));
    await waitFor(() =>
      expect(gamesApi.quickplay).toHaveBeenCalledWith(
        'sea_battle_v1',
        { variant: undefined, theme: 'cyberpunk' },
        { token: 'token' },
      ),
    );
  });

  it('does not send the theme to human matchmaking (theme stays random)', () => {
    render(
      <QuickplayCta
        gameId="sea_battle_v1"
        ctaQuickplay="Play vs AI now"
        ctaQuickplayError="Error"
        ctaPlayHuman="Find a human opponent"
        theme="underwater"
      />,
    );
    fireEvent.click(screen.getByText('Find a human opponent'));
    expect(joinQueueMock).toHaveBeenCalledWith('sea_battle_v1', undefined);
  });

  it('omits the theme when none is selected', async () => {
    render(
      <QuickplayCta
        gameId="sea_battle_v1"
        ctaQuickplay="Play vs AI now"
        ctaQuickplayError="Error"
      />,
    );
    fireEvent.click(screen.getByText('Play vs AI now'));
    await waitFor(() =>
      expect(gamesApi.quickplay).toHaveBeenCalledWith(
        'sea_battle_v1',
        { variant: undefined, theme: undefined },
        { token: 'token' },
      ),
    );
  });
});
