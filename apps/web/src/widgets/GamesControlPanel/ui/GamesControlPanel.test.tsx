import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { GamesControlPanel } from './GamesControlPanel';
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
      useGameRematchStore.getState().reset();
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
});
