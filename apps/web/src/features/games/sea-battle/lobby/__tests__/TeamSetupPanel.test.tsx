import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';

const emitSetTeamConfig = vi.fn();

interface SetTeamConfigEnv {
  roomId: string;
  userId: string;
  teams: Array<{
    id?: string;
    name: string;
    color: string;
    targetSize: number;
  }>;
  hideShipsFromTeammates?: boolean;
  maxTotalPlayers?: number;
}

vi.mock('../team-mode.api', () => ({
  emitSetTeamConfig: (env: SetTeamConfigEnv) => emitSetTeamConfig(env),
}));

vi.mock('@/shared/lib/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, string | number>): string => {
      if (!params) return key;
      return `${key}:${JSON.stringify(params)}`;
    },
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

interface InputProps {
  value?: string;
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  'aria-label'?: string;
  'data-testid'?: string;
}

vi.mock('@arcadeum/ui', () => ({
  Card: ({
    children,
    'data-testid': testId,
  }: ChildrenProps & { 'data-testid'?: string }) => (
    <div data-testid={testId}>{children}</div>
  ),
  Button: ({
    children,
    onClick,
    disabled,
    'data-testid': testId,
    'aria-label': ariaLabel,
  }: ButtonProps) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-testid={testId}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  ),
  Input: ({
    value,
    onChange,
    placeholder,
    'data-testid': testId,
    'aria-label': ariaLabel,
  }: InputProps) => (
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      data-testid={testId}
      aria-label={ariaLabel}
    />
  ),
  Typography: ({ children }: ChildrenProps) => <span>{children}</span>,
}));

import { TeamSetupPanel } from '../TeamSetupPanel';
import { MAX_TEAMS, MIN_TEAMS } from '../team-mode.types';

const HOST = 'host-1';
const ROOM = 'room-1';

function makeTeams(count: number, targetSize = 2) {
  return Array.from({ length: count }, (_, i) => ({
    id: `t${i + 1}`,
    name: `Team ${i + 1}`,
    color: '#E11D48',
    targetSize,
    playerIds: [],
  }));
}

describe('TeamSetupPanel', () => {
  beforeEach(() => {
    emitSetTeamConfig.mockClear();
  });

  it('renders nothing for non-host viewers', () => {
    const { container } = render(
      <TeamSetupPanel
        roomId={ROOM}
        userId="player-2"
        hostId={HOST}
        teams={makeTeams(MIN_TEAMS)}
        maxTotalPlayers={8}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('disables the add-team button at MAX_TEAMS', () => {
    render(
      <TeamSetupPanel
        roomId={ROOM}
        userId={HOST}
        hostId={HOST}
        teams={makeTeams(MAX_TEAMS)}
        maxTotalPlayers={8}
      />,
    );
    const addBtn = screen.getByTestId('team-add-btn');
    expect(addBtn).toBeDisabled();
  });

  it('hides remove-team buttons at MIN_TEAMS', () => {
    render(
      <TeamSetupPanel
        roomId={ROOM}
        userId={HOST}
        hostId={HOST}
        teams={makeTeams(MIN_TEAMS)}
        maxTotalPlayers={8}
      />,
    );
    expect(screen.queryByTestId('team-remove-t1')).toBeNull();
    expect(screen.queryByTestId('team-remove-t2')).toBeNull();
  });

  it('shows the validation banner when total slots exceed the cap', () => {
    // 4 teams × 3 players = 12 > MAX_TOTAL_PLAYERS (8)
    render(
      <TeamSetupPanel
        roomId={ROOM}
        userId={HOST}
        hostId={HOST}
        teams={makeTeams(MAX_TEAMS, 3)}
        maxTotalPlayers={8}
      />,
    );
    expect(screen.getByTestId('team-setup-validation')).toBeInTheDocument();
  });

  it('emits team config when host adds a team', () => {
    render(
      <TeamSetupPanel
        roomId={ROOM}
        userId={HOST}
        hostId={HOST}
        teams={makeTeams(MIN_TEAMS)}
        maxTotalPlayers={8}
      />,
    );
    fireEvent.click(screen.getByTestId('team-add-btn'));
    expect(emitSetTeamConfig).toHaveBeenCalled();
    const lastArg = emitSetTeamConfig.mock.calls.at(-1)?.[0] as {
      roomId: string;
      userId: string;
      teams: unknown[];
    };
    expect(lastArg.roomId).toBe(ROOM);
    expect(lastArg.userId).toBe(HOST);
    expect(lastArg.teams).toHaveLength(MIN_TEAMS + 1);
  });
});
