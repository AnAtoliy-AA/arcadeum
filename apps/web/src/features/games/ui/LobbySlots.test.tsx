import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { LobbySegmented } from './LobbySegmented';
import { LobbyStatusChip } from './LobbyChips';
import { LobbyStartButton } from './LobbyStartButton';
import { LobbySidebarPlayers } from './LobbySidebarPlayers';
import type { GameRoomSummary } from '@/shared/types/games';

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('./InGameAvatar', () => ({ InGameAvatar: () => <span /> }));

describe('LobbySegmented', () => {
  it('is a radiogroup and reports selection', () => {
    const onChange = vi.fn();
    render(
      <LobbySegmented
        aria-label="Bots"
        value="1"
        onChange={onChange}
        items={[
          { id: '1', label: '1', testId: 'b1' },
          { id: '2', label: '2', testId: 'b2' },
        ]}
      />,
    );
    expect(
      screen.getByRole('radiogroup', { name: 'Bots' }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('b1')).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(screen.getByTestId('b2'));
    expect(onChange).toHaveBeenCalledWith('2');
  });
});

describe('LobbyStatusChip', () => {
  it('exposes the phase', () => {
    render(<LobbyStatusChip phase="ready" />);
    expect(screen.getByTestId('lobby-status-chip')).toHaveAttribute(
      'data-phase',
      'ready',
    );
  });
});

describe('LobbyStartButton', () => {
  const props = {
    startBusy: false,
    startDisabled: false,
    enableBots: false,
    botCount: 1,
    startLabel: 'Start',
    startingLabel: 'Starting',
    startWithBotsLabel: 'Bots {{count}}',
    onStart: vi.fn(),
  };

  it('disables start and shows a reason when players are missing', () => {
    render(<LobbyStartButton {...props} playerCount={1} minPlayers={2} />);
    expect(screen.getByTestId('start-with-bots-button')).toBeDisabled();
    expect(screen.getByTestId('lobby-start-hint')).toHaveTextContent(
      'games.lobby.subtitleNeedPlayers',
    );
  });

  it('enables start when ready', () => {
    render(<LobbyStartButton {...props} playerCount={2} minPlayers={2} />);
    expect(screen.getByTestId('start-with-bots-button')).toBeEnabled();
    expect(screen.getByTestId('lobby-start-hint')).toHaveTextContent(
      'games.lobby.startHintReady',
    );
  });
});

describe('LobbySidebarPlayers slots', () => {
  const room = {
    id: 'r1',
    gameId: 'go_v1',
    name: 'R',
    hostId: 'u1',
    visibility: 'public',
    playerCount: 1,
    maxPlayers: 3,
    createdAt: '',
    status: 'lobby',
  } as GameRoomSummary;
  const members = [
    { id: 'u1', displayName: 'Host' },
  ] as Required<GameRoomSummary>['members'];

  it('renders open seats with add bot and invite for the host', () => {
    const onAddBot = vi.fn();
    const onInvite = vi.fn();
    render(
      <LobbySidebarPlayers
        room={room}
        isHost
        minPlayers={2}
        members={members}
        showReorderControls={false}
        maxPlayers={3}
        canAddBots
        canRemoveBots
        playersLabel="Players"
        waitingForPlayerLabel="Waiting"
        onRequestKick={vi.fn()}
        onAddBot={onAddBot}
        onInvite={onInvite}
        userId="u1"
      />,
    );
    expect(screen.getAllByTestId('lobby-empty-slot')).toHaveLength(2);
    fireEvent.click(screen.getByTestId('add-bot-button'));
    fireEvent.click(screen.getByTestId('invite-slot-button'));
    expect(onAddBot).toHaveBeenCalled();
    expect(onInvite).toHaveBeenCalled();
    expect(screen.getByText('games.lobby.hostBadge')).toBeInTheDocument();
    expect(screen.getByText('games.lobby.youBadge')).toBeInTheDocument();
  });

  it('hides slot actions for non-hosts', () => {
    render(
      <LobbySidebarPlayers
        room={room}
        isHost={false}
        minPlayers={2}
        members={members}
        showReorderControls={false}
        maxPlayers={3}
        canAddBots={false}
        canRemoveBots={false}
        playersLabel="Players"
        waitingForPlayerLabel="Waiting"
        onRequestKick={vi.fn()}
      />,
    );
    expect(screen.queryByTestId('add-bot-button')).not.toBeInTheDocument();
    expect(screen.queryByTestId('invite-slot-button')).not.toBeInTheDocument();
  });
});
