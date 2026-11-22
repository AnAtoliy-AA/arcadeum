import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RoomHeaderBar } from './RoomHeaderBar';

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string, vars?: Record<string, unknown>) =>
      vars ? `${key}:${JSON.stringify(vars)}` : key,
  }),
}));

describe('RoomHeaderBar', () => {
  it('shows name, waiting chip, count and back link', () => {
    render(
      <RoomHeaderBar
        roomName="Friday night"
        status="lobby"
        playerCount={2}
        maxPlayers={4}
      />,
    );
    expect(screen.getByText('Friday night')).toBeInTheDocument();
    expect(screen.getByTestId('room-status-chip')).toHaveTextContent(
      'games.lobby.statusWaiting',
    );
    expect(screen.getByTestId('room-player-count')).toHaveTextContent(
      'games.lobby.playersCount',
    );
    expect(screen.getByTestId('room-back-link')).toHaveAttribute(
      'href',
      '/games',
    );
  });

  it.each([
    ['in_progress', 'games.lobby.statusInProgress'],
    ['completed', 'games.lobby.statusFinished'],
  ] as const)('maps %s status to its label', (status, label) => {
    render(<RoomHeaderBar status={status} playerCount={3} maxPlayers={null} />);
    expect(screen.getByTestId('room-status-chip')).toHaveTextContent(label);
    expect(screen.getByTestId('room-player-count')).toHaveTextContent('3');
    expect(screen.queryByTestId('room-header-name')).toBeNull();
  });
});
