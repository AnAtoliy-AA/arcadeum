import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReusableGameLobby } from './ReusableGameLobby';
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

function makeRoom(maxPlayers: number): GameRoomSummary {
  return {
    id: 'room-1',
    gameId: 'hearts_v1',
    name: 'Test Room',
    hostId: 'user-1',
    visibility: 'public',
    playerCount: 1,
    maxPlayers,
    createdAt: new Date().toISOString(),
    status: 'lobby',
    gameOptions: {},
  };
}

function renderLobby(minPlayers: number, maxPlayers: number) {
  return render(
    <ReusableGameLobby
      room={makeRoom(maxPlayers)}
      userId="user-1"
      isHost
      startBusy={false}
      onStartGame={vi.fn()}
      gameName="Hearts"
      gameIcon="♥"
      minPlayers={minPlayers}
      maxPlayers={maxPlayers}
      enableBots
    />,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ReusableGameLobby bot count preselection', () => {
  it('preselects every bot needed to reach a 4-player minimum (Hearts)', () => {
    renderLobby(4, 4);
    expect(screen.getByTestId('bot-count-3')).toHaveAttribute(
      'data-active',
      'on',
    );
    expect(screen.getByTestId('bot-count-1')).not.toHaveAttribute(
      'data-active',
    );
    expect(screen.getByTestId('bot-count-2')).not.toHaveAttribute(
      'data-active',
    );
  });

  it('defaults to 1 bot for 2-player games (backwards compatible)', () => {
    renderLobby(2, 2);
    expect(screen.getByTestId('bot-count-1')).toHaveAttribute(
      'data-active',
      'on',
    );
  });
});
