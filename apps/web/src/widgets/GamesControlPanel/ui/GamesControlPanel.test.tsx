import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { GamesControlPanel } from './GamesControlPanel';
import { useGameResultStore } from '@/features/games/store/gameResultStore';
import { useGameRematchStore } from '@/features/games/store/gameRematchStore';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock('@/shared/lib/useTranslation', () => ({
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

describe('GamesControlPanel', () => {
  beforeEach(() => {
    act(() => {
      useGameResultStore.getState().reset();
      useGameRematchStore.getState().reset();
    });
  });

  it('renders control buttons', () => {
    render(<GamesControlPanel isFullscreen={false} />);
    expect(screen.getByTestId('games-control-panel')).toBeInTheDocument();
    expect(screen.getByTestId('fullscreen-button')).toBeInTheDocument();
    expect(screen.getByTestId('sound-toggle-button')).toBeInTheDocument();
    expect(screen.getByTestId('music-toggle-button')).toBeInTheDocument();
  });

  it('renders and toggles game result button via Zustand store', () => {
    render(<GamesControlPanel isGameOver={false} />);
    expect(
      screen.queryByTestId('show-game-result-button'),
    ).not.toBeInTheDocument();

    act(() => {
      useGameResultStore.getState().setHasResult(true);
    });

    expect(screen.getByTestId('show-game-result-button')).toBeInTheDocument();
    expect(useGameResultStore.getState().isOpen).toBe(false);

    act(() => {
      fireEvent.click(screen.getByTestId('show-game-result-button'));
    });
    expect(useGameResultStore.getState().isOpen).toBe(true);

    act(() => {
      fireEvent.click(screen.getByTestId('show-game-result-button'));
    });
    expect(useGameResultStore.getState().isOpen).toBe(false);
  });

  it('renders game result button when isGameOver prop is true', () => {
    render(<GamesControlPanel isGameOver={true} />);
    expect(screen.getByTestId('show-game-result-button')).toBeInTheDocument();
  });
});
