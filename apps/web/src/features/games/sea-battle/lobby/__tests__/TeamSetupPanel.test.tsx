import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';

const emitSetTeamConfig = vi.fn();
const emitToggleHideShips = vi.fn();

vi.mock('../team-mode.api', () => ({
  emitSetTeamConfig: (...args: unknown[]) => emitSetTeamConfig(...args),
  emitToggleHideShips: (...args: unknown[]) => emitToggleHideShips(...args),
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
  Input: ({ value, onChange, placeholder, ...rest }: InputProps) => (
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      data-testid={rest['data-testid']}
      aria-label={rest['aria-label']}
    />
  ),
  Typography: ({ children }: ChildrenProps) => <span>{children}</span>,
  XStack: ({ children }: ChildrenProps) => <div>{children}</div>,
  YStack: ({ children }: ChildrenProps) => <div>{children}</div>,
}));

interface SwitchProps {
  checked?: boolean;
  onCheckedChange?: (next: boolean) => void;
  'aria-label'?: string;
  'data-testid'?: string;
  children?: ReactNode;
}

vi.mock('tamagui', () => {
  const Switch = ({ checked, onCheckedChange, ...rest }: SwitchProps) => (
    <button
      role="switch"
      aria-checked={!!checked}
      aria-label={rest['aria-label']}
      data-testid={rest['data-testid']}
      onClick={() => onCheckedChange?.(!checked)}
    />
  );
  const SwitchThumb = () => null;
  SwitchThumb.displayName = 'SwitchThumb';
  Switch.Thumb = SwitchThumb;
  return { Switch };
});

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
    emitToggleHideShips.mockClear();
  });

  it('renders nothing for non-host viewers', () => {
    const { container } = render(
      <TeamSetupPanel
        roomId={ROOM}
        userId="player-2"
        hostId={HOST}
        teams={makeTeams(MIN_TEAMS)}
        hideShipsFromTeammates={false}
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
        hideShipsFromTeammates={false}
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
        hideShipsFromTeammates={false}
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
        hideShipsFromTeammates={false}
      />,
    );
    expect(screen.getByTestId('team-setup-validation')).toBeInTheDocument();
  });

  it('emits hide-ships toggle when host flips the switch', () => {
    render(
      <TeamSetupPanel
        roomId={ROOM}
        userId={HOST}
        hostId={HOST}
        teams={makeTeams(MIN_TEAMS)}
        hideShipsFromTeammates={false}
      />,
    );
    fireEvent.click(screen.getByTestId('hide-ships-switch'));
    expect(emitToggleHideShips).toHaveBeenCalledWith({
      roomId: ROOM,
      userId: HOST,
      enabled: true,
    });
  });
});
