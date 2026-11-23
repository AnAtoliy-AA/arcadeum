import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LobbySidebar } from './LobbySidebar';
import type { GameRoomSummary } from '@/shared/types/games';

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('./InGameAvatar', () => ({ InGameAvatar: () => <span /> }));

type Member = Required<GameRoomSummary>['members'][number];

function member(id: string, isHost = false): Member {
  return { id, userId: id, displayName: id, isHost } as Member;
}

function renderSidebar(members: Member[], maxPlayers: number | null) {
  const room = {
    id: 'room-1',
    gameId: 'pachisi_v1',
    name: 'Pachisi room',
    hostId: 'host',
    visibility: 'public',
    playerCount: members.length,
    maxPlayers,
    createdAt: new Date().toISOString(),
    status: 'lobby',
    members,
    gameOptions: {},
  } as unknown as GameRoomSummary;
  return render(
    <LobbySidebar
      room={room}
      userId="host"
      isHost
      minPlayers={2}
      isFastMode={false}
      labels={{}}
      showReorderControls={false}
      showInvitedPlayers={false}
      members={members}
      deleteRoomLabel="Delete"
      enableBots
      maxPlayers={4}
      onAddBot={vi.fn()}
      onRemoveBot={vi.fn()}
    />,
  );
}

describe('LobbySidebar add bot (Pachisi 4th player regression)', () => {
  it('still offers add-bot when one bot is already seated and seats remain', () => {
    renderSidebar([member('host', true), member('bot-aaa'), member('u2')], 4);
    expect(screen.getByTestId('add-bot-button')).toBeInTheDocument();
  });

  it('offers add-bot for rooms created with auto players (maxPlayers null)', () => {
    renderSidebar(
      [member('host', true), member('bot-aaa'), member('bot-bbb')],
      null,
    );
    expect(screen.getByTestId('add-bot-button')).toBeInTheDocument();
  });

  it('hides add-bot once all 4 seats are taken', () => {
    renderSidebar(
      [
        member('host', true),
        member('bot-aaa'),
        member('bot-bbb'),
        member('bot-ccc'),
      ],
      null,
    );
    expect(screen.queryByTestId('add-bot-button')).not.toBeInTheDocument();
  });
});
