import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReusableGameLobby } from './ReusableGameLobby';
import { gameSocket } from '@/shared/lib/socket';
import { saveStoredSettings } from '@/shared/lib/settings-storage';
import type { GameRoomSummary } from '@/shared/types/games';

vi.mock('@/features/games/api', () => ({
  gamesApi: { getCatalog: vi.fn(() => Promise.resolve({ games: [] })) },
}));
vi.mock('@/shared/lib/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('@/shared/lib/socket', () => ({
  gameSocket: { on: vi.fn(), off: vi.fn(), emit: vi.fn() },
}));
vi.mock('@/shared/lib/settings-storage', () => ({
  loadStoredSettings: vi.fn(() => ({})),
  saveStoredSettings: vi.fn(),
}));
vi.mock('./LobbySidebar', () => ({
  LobbySidebar: () => <div data-testid="sidebar" />,
}));
vi.mock('./LobbyMobileSidebar', () => ({
  LobbyMobileSidebar: () => <div data-testid="mobile-sidebar" />,
}));
vi.mock('./HouseRulesSection', () => ({
  HouseRulesSection: () => <div data-testid="rules" />,
}));
vi.mock('./ConfirmationModal', () => ({
  ConfirmationModal: () => <div data-testid="confirm" />,
}));
vi.mock('./LobbyStartButton', () => ({
  LobbyStartButton: () => <div data-testid="start" />,
}));

const ROOM: GameRoomSummary = {
  id: 'room-1',
  gameId: 'tic_tac_toe_v1',
  name: 'Test Room',
  hostId: 'user-1',
  visibility: 'public',
  playerCount: 1,
  maxPlayers: 2,
  createdAt: new Date().toISOString(),
  status: 'lobby',
  gameOptions: {},
};

function renderLobby(overrides: { showDifficulty?: boolean } = {}) {
  return render(
    <ReusableGameLobby
      room={ROOM}
      userId="user-1"
      isHost
      startBusy={false}
      onStartGame={vi.fn()}
      gameName="Tic-Tac-Toe"
      gameIcon="❌⭕"
      minPlayers={2}
      maxPlayers={2}
      enableBots
      showDifficulty={overrides.showDifficulty}
    />,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ReusableGameLobby difficulty', () => {
  it('renders all four difficulty options when bots are enabled', () => {
    renderLobby();
    for (const d of ['easy', 'medium', 'hard', 'expert']) {
      expect(screen.getByTestId(`difficulty-${d}`)).toBeInTheDocument();
    }
  });

  it('persists the selected difficulty to localStorage and as a room option', () => {
    renderLobby();
    fireEvent.click(screen.getByTestId('difficulty-expert'));
    expect(saveStoredSettings).toHaveBeenCalledWith({
      aiDifficulty: 'expert',
    });
    expect(gameSocket.emit).toHaveBeenCalledWith('games.room.set_option', {
      roomId: 'room-1',
      userId: 'user-1',
      options: { aiDifficulty: 'expert' },
    });
  });

  it('shows a difficulty badge reflecting the current selection', () => {
    renderLobby();
    expect(screen.getByTestId('difficulty-badge')).toHaveTextContent('Medium');
    fireEvent.click(screen.getByTestId('difficulty-expert'));
    expect(screen.getByTestId('difficulty-badge')).toHaveTextContent('Expert');
  });

  it('hides the selector and badge when showDifficulty is false', () => {
    renderLobby({ showDifficulty: false });
    expect(screen.queryByTestId('difficulty-easy')).not.toBeInTheDocument();
    expect(screen.queryByTestId('difficulty-badge')).not.toBeInTheDocument();
  });
});
