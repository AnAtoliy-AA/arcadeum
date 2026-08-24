import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReplayHeader } from './ReplayHeader';
import type { ReplayDetail } from '../lib/types';

const mockReplay: ReplayDetail = {
  replayId: 'rep-1',
  roomId: 'room-1',
  sessionId: 'sess-1',
  gameId: 'chess_v1',
  playerIds: ['p1', 'p2'],
  players: [
    { id: 'p1', displayName: 'Alice' },
    { id: 'p2', displayName: 'Bob' },
  ],
  initialState: {},
  actions: [
    { action: 'move', userId: 'p1', timestamp: '2026-01-01T00:00:00Z' },
    { action: 'move', userId: 'p2', timestamp: '2026-01-01T00:01:00Z' },
  ],
  result: { winnerIds: ['p1'], isDraw: false },
  totalMoves: 2,
  durationMs: 125000,
  createdAt: '2026-01-01T00:00:00Z',
};

describe('ReplayHeader', () => {
  const mockT = vi.fn(
    (key: string, params?: Record<string, string | number>) => {
      if (key === 'games.replay.header.moves' && params) {
        return `${params.count} moves`;
      }
      if (key === 'games.replay.header.winner' && params) {
        return `${params.name} won`;
      }
      return key;
    },
  );

  it('renders player names and game info', () => {
    render(<ReplayHeader replay={mockReplay} t={mockT} />);

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText(/2 moves/i)).toBeInTheDocument();
  });
});
