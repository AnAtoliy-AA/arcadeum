import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { GamesControlPanel } from './GamesControlPanel';
import { useGameRematchStore } from '@/features/games/store/gameRematchStore';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/shared/hooks/useSoundSetting', () => ({
  useSoundSetting: () => ({ soundEnabled: true, setSoundEnabled: vi.fn() }),
}));

vi.mock('@/shared/hooks/useMusicSetting', () => ({
  useMusicSetting: () => ({ musicEnabled: true, setMusicEnabled: vi.fn() }),
}));

vi.mock('@/entities/session/model/useSessionTokens', () => ({
  useSessionTokens: () => ({ snapshot: { userId: 'user-1' } }),
}));

const mockUseActiveClanWarMatch = vi.fn(() => ({
  activeWar: null,
  isClanWarMatch: false,
  myClan: null,
}));

vi.mock('@/features/clans', async () => {
  const actual =
    await vi.importActual<Record<string, unknown>>('@/features/clans');
  return {
    ...actual,
    useActiveClanWarMatch: () => mockUseActiveClanWarMatch(),
  };
});

describe('GamesControlPanel', () => {
  beforeEach(() => {
    act(() => {
      useGameRematchStore.getState().reset();
    });
    mockUseActiveClanWarMatch.mockReturnValue({
      activeWar: null,
      isClanWarMatch: false,
      myClan: null,
    });
  });

  it('renders control buttons including exit and leave', () => {
    render(<GamesControlPanel isFullscreen={false} />);
    expect(screen.getByTestId('games-control-panel')).toBeInTheDocument();
    expect(screen.getByTestId('fullscreen-button')).toBeInTheDocument();
    expect(screen.getByTestId('sound-toggle-button')).toBeInTheDocument();
    expect(screen.getByTestId('music-toggle-button')).toBeInTheDocument();
    expect(screen.getByTestId('exit-room-button')).toBeInTheDocument();
    expect(screen.getByTestId('leave-game-button')).toBeInTheDocument();
  });

  it('renders rematch button when isGameOver and onRematch are active', () => {
    render(<GamesControlPanel isGameOver={true} onRematch={() => {}} />);
    expect(screen.getByTestId('rematch-button')).toBeInTheDocument();
  });

  it('renders ClanWarMatchHud when active clan war match is present', () => {
    mockUseActiveClanWarMatch.mockReturnValue({
      activeWar: {
        id: 'war-panel-1',
        initiatorClanId: 'clan-1',
        initiatorClanName: 'Knights',
        initiatorClanTag: 'KNG',
        initiatorScore: 3,
        targetClanId: 'clan-2',
        targetClanName: 'Shadows',
        targetClanTag: 'SHD',
        targetClanScore: 2,
        targetScore: 5,
        gameId: 'all',
        status: 'active',
        winnerClanId: null,
        expiresAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        matchLogs: [],
      },
      isClanWarMatch: true,
      myClan: null,
    });

    render(<GamesControlPanel opponentUserId="opponent-user" gameId="chess" />);
    expect(screen.getByTestId('clan-war-match-hud')).toBeInTheDocument();
    expect(screen.getByText('[KNG]')).toBeInTheDocument();
    expect(screen.getByText('[SHD]')).toBeInTheDocument();
  });
});
