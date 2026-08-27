import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReplayControls } from './ReplayControls';
import { useReplayStore } from '../store/replayStore';
import type { ReplayDetail } from '../lib/types';

const mockReplay: ReplayDetail = {
  replayId: 'rep-1',
  roomId: 'room-1',
  sessionId: 'sess-1',
  gameId: 'chess_v1',
  playerIds: ['p1', 'p2'],
  players: [
    { id: 'p1', displayName: 'Player 1' },
    { id: 'p2', displayName: 'Player 2' },
  ],
  initialState: {},
  actions: [
    { action: 'move', userId: 'p1', timestamp: '2026-01-01T00:00:00Z' },
    { action: 'move', userId: 'p2', timestamp: '2026-01-01T00:01:00Z' },
  ],
  totalMoves: 2,
  durationMs: 60000,
  createdAt: '2026-01-01T00:00:00Z',
};

describe('ReplayControls', () => {
  const mockT = vi.fn(
    (key: string, params?: Record<string, string | number>) => {
      if (key === 'games.replay.controls.stepCounter' && params) {
        return `Move ${params.current} / ${params.total}`;
      }
      return key;
    },
  );

  beforeEach(() => {
    useReplayStore.getState().reset();
    useReplayStore.getState().loadReplay(mockReplay);
    mockT.mockClear();
  });

  it('renders control buttons and step counter', () => {
    render(<ReplayControls t={mockT} />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByText(/Move 0 \/ 2/i)).toBeInTheDocument();
  });

  it('navigates forward and backward', () => {
    render(<ReplayControls t={mockT} />);

    const nextBtn = screen.getByLabelText('games.replay.controls.next');
    fireEvent.click(nextBtn);

    expect(useReplayStore.getState().currentStep).toBe(1);

    const prevBtn = screen.getByLabelText('games.replay.controls.prev');
    fireEvent.click(prevBtn);

    expect(useReplayStore.getState().currentStep).toBe(0);
  });

  it('changes playback speed on click', () => {
    render(<ReplayControls t={mockT} />);

    const speed2x = screen.getByText('2x');
    fireEvent.click(speed2x);

    expect(useReplayStore.getState().playbackSpeed).toBe(2);
  });
});
