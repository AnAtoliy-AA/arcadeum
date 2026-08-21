import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BackgammonLobby } from './BackgammonLobby';
import type { GameRoomSummary } from '@/shared/types/games';

vi.mock('@/features/games/hooks/useRoomOptions', () => ({
  useRoomOptions: () => ({
    setOption: vi.fn(),
  }),
}));

describe('BackgammonLobby', () => {
  const room: GameRoomSummary = {
    id: 'room-1',
    name: 'Backgammon Room',
    gameId: 'backgammon_v1',
    hostId: 'user-1',
    status: 'lobby',
    visibility: 'public',
    playerCount: 1,
    maxPlayers: 2,
    members: [{ id: 'user-1', displayName: 'Player 1', isHost: true }],
    gameOptions: {
      theme: 'cyberpunk',
      ruleVariant: 'standard',
    },
    createdAt: new Date().toISOString(),
  };

  it('renders rule variants without errors', () => {
    render(
      <BackgammonLobby
        room={room}
        userId="user-1"
        isHost={true}
        startBusy={false}
        onStartGame={vi.fn()}
        showRulesOpen={false}
        onShowRulesClose={vi.fn()}
      />,
    );

    expect(screen.getByText('Backgammon Room')).toBeDefined();
  });
});
