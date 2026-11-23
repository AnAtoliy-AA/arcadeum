import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PachisiTeamsPanel, teamSeats } from './PachisiTeamsPanel';

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string, p?: Record<string, unknown>) =>
      p ? `${key}:${JSON.stringify(p)}` : key,
  }),
}));

const members = [
  { id: 'u1', displayName: 'Ann' },
  { id: 'u2', displayName: 'Bob' },
  { id: 'u3', displayName: 'Cy' },
];

describe('PachisiTeamsPanel', () => {
  it('maps partners to opposite seats', () => {
    expect(teamSeats(0)).toEqual([0, 2]);
    expect(teamSeats(1)).toEqual([1, 3]);
  });

  it('lets the host toggle teams on', () => {
    const onChange = vi.fn();
    render(
      <PachisiTeamsPanel
        enabled={false}
        isHost
        members={members}
        onChange={onChange}
      />,
    );
    expect(screen.queryByTestId('pachisi-team-preview')).toBeNull();
    fireEvent.click(screen.getByTestId('pachisi-teams-on'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('shows who is on which team and marks empty seats as bots', () => {
    render(
      <PachisiTeamsPanel enabled isHost members={members} onChange={vi.fn()} />,
    );
    expect(screen.getByTestId('pachisi-team-0')).toHaveTextContent('Ann');
    expect(screen.getByTestId('pachisi-team-0')).toHaveTextContent('Cy');
    expect(screen.getByTestId('pachisi-team-1')).toHaveTextContent('Bob');
    expect(screen.getByTestId('pachisi-team-seat-3')).toHaveTextContent(
      'games.pachisi_v1.lobby.teams.openSeat',
    );
  });

  it('is read-only for guests', () => {
    const onChange = vi.fn();
    render(
      <PachisiTeamsPanel
        enabled
        isHost={false}
        members={members}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByTestId('pachisi-teams-off'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('cannot be enabled in a room that is not 4 players', () => {
    render(
      <PachisiTeamsPanel
        enabled={false}
        isHost
        members={members}
        maxPlayers={3}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByTestId('pachisi-teams-on')).toBeDisabled();
  });
});
