import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';

const emitAssignTeam = vi.fn();
const emitAddBotToTeam = vi.fn();
const emitRemoveBotFromTeam = vi.fn();
const emitSetTeamConfig = vi.fn();

vi.mock('../team-mode.api', () => ({
  emitAssignTeam: (...args: unknown[]) => emitAssignTeam(...args),
  emitAddBotToTeam: (...args: unknown[]) => emitAddBotToTeam(...args),
  emitRemoveBotFromTeam: (...args: unknown[]) => emitRemoveBotFromTeam(...args),
  emitSetTeamConfig: (...args: unknown[]) => emitSetTeamConfig(...args),
}));

vi.mock('../team-controls', () => ({
  ColorPalette: () => null,
  SizeStepper: () => null,
}));

vi.mock('@/shared/lib/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, string | number>) =>
      params ? `${key}:${JSON.stringify(params)}` : key,
  }),
}));

interface ChildrenProps {
  children?: ReactNode;
}

interface ButtonProps extends ChildrenProps {
  onClick?: () => void;
  disabled?: boolean;
  'data-testid'?: string;
  'aria-label'?: string;
}

vi.mock('@arcadeum/ui', () => ({
  Card: ({ children, ...rest }: ChildrenProps & { 'data-testid'?: string }) => (
    <div data-testid={rest['data-testid']}>{children}</div>
  ),
  Button: ({ children, onClick, disabled, ...rest }: ButtonProps) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-testid={rest['data-testid']}
      aria-label={rest['aria-label']}
    >
      {children}
    </button>
  ),
  Avatar: ({ name }: { name?: string }) => <span>{name}</span>,
  PlayerAvatar: ({ name }: { name?: string }) => <span>{name}</span>,
  Input: (
    props: { value?: string; onChange?: (e: unknown) => void } & Record<
      string,
      unknown
    >,
  ) => (
    <input
      value={props.value ?? ''}
      onChange={props.onChange as (e: unknown) => void}
    />
  ),
  Badge: ({ children }: ChildrenProps) => <span>{children}</span>,
  Typography: ({ children }: ChildrenProps) => <span>{children}</span>,
  XStack: ({
    children,
    ...rest
  }: ChildrenProps & { 'data-testid'?: string }) => (
    <div data-testid={rest['data-testid']}>{children}</div>
  ),
  YStack: ({ children }: ChildrenProps) => <div>{children}</div>,
}));

import { TeamSlotsBoard } from '../TeamSlotsBoard';
import type { SeaBattleTeam } from '../team-mode.types';

const ROOM = 'room-1';
const HOST = 'host-1';
const PLAYER_2 = 'player-2';
const PLAYER_3 = 'player-3';
const BOT_ID = 'bot-abc';

function makeTeams(): SeaBattleTeam[] {
  return [
    {
      id: 't1',
      name: 'Red',
      color: '#E11D48',
      targetSize: 3,
      playerIds: [HOST, BOT_ID],
    },
    {
      id: 't2',
      name: 'Blue',
      color: '#2563EB',
      targetSize: 3,
      playerIds: [PLAYER_2],
    },
  ];
}

const MEMBERS = [
  { userId: HOST, displayName: 'Host' },
  { userId: PLAYER_2, displayName: 'Two' },
  { userId: PLAYER_3, displayName: 'Three' },
];

describe('TeamSlotsBoard', () => {
  beforeEach(() => {
    emitAssignTeam.mockClear();
    emitAddBotToTeam.mockClear();
    emitRemoveBotFromTeam.mockClear();
  });

  it("emits assign_team with viewer's userId when clicking an empty slot", () => {
    render(
      <TeamSlotsBoard
        roomId={ROOM}
        userId={PLAYER_3}
        hostId={HOST}
        teams={makeTeams()}
        members={MEMBERS}
        maxTotalPlayers={8}
      />,
    );

    // Team t2 has 1 of 3 filled => 2 empty slots; click first empty.
    fireEvent.click(screen.getByTestId('join-t2-0'));
    expect(emitAssignTeam).toHaveBeenCalledWith({
      roomId: ROOM,
      userId: PLAYER_3,
      teamId: 't2',
    });
  });

  it('shows bot remove × button only for the host and emits remove_bot_from_team', () => {
    // First render as non-host: × button must NOT exist.
    const { unmount } = render(
      <TeamSlotsBoard
        roomId={ROOM}
        userId={PLAYER_2}
        hostId={HOST}
        teams={makeTeams()}
        members={MEMBERS}
        maxTotalPlayers={8}
      />,
    );
    expect(screen.queryByTestId(`bot-remove-${BOT_ID}`)).toBeNull();
    unmount();

    // Now render as host: × button must exist and emit remove.
    render(
      <TeamSlotsBoard
        roomId={ROOM}
        userId={HOST}
        hostId={HOST}
        teams={makeTeams()}
        members={MEMBERS}
        maxTotalPlayers={8}
      />,
    );
    fireEvent.click(screen.getByTestId(`bot-remove-${BOT_ID}`));
    expect(emitRemoveBotFromTeam).toHaveBeenCalledWith({
      roomId: ROOM,
      userId: HOST,
      targetUserId: BOT_ID,
    });
  });

  it('emits assign_team with targetUserId when host clicks "Move to" on another player', () => {
    render(
      <TeamSlotsBoard
        roomId={ROOM}
        userId={HOST}
        hostId={HOST}
        teams={makeTeams()}
        members={MEMBERS}
        maxTotalPlayers={8}
      />,
    );

    fireEvent.click(screen.getByTestId(`move-${PLAYER_2}-to-t1`));
    expect(emitAssignTeam).toHaveBeenCalledWith({
      roomId: ROOM,
      userId: HOST,
      targetUserId: PLAYER_2,
      teamId: 't1',
    });
  });

  it('does not render "Move to" buttons for non-host viewers', () => {
    render(
      <TeamSlotsBoard
        roomId={ROOM}
        userId={PLAYER_3}
        hostId={HOST}
        teams={makeTeams()}
        members={MEMBERS}
        maxTotalPlayers={8}
      />,
    );

    expect(screen.queryByTestId(`move-${HOST}-to-t2`)).toBeNull();
    expect(screen.queryByTestId(`move-${PLAYER_2}-to-t1`)).toBeNull();
  });
});
