import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LobbySetupSection } from './LobbySetupSection';
import type { GameRoomSummary } from '@/shared/types/games';

vi.mock('./HouseRulesSection', () => ({
  HouseRulesSection: () => <div data-testid="house-rules" />,
}));

const room = {
  id: 'r1',
  gameId: 'hearts_v1',
  name: 'Room',
  hostId: 'u1',
  visibility: 'public',
  playerCount: 1,
  maxPlayers: 4,
  status: 'lobby',
} as unknown as GameRoomSummary;

function props(over: Record<string, unknown> = {}) {
  return {
    room,
    isHost: true,
    enableBots: true,
    showDifficulty: true,
    showHostBots: true,
    maxPlayers: 4,
    botCount: 2,
    setBotCount: vi.fn(),
    difficulty: 'medium' as const,
    setDifficulty: vi.fn(),
    ruleComingSoon: new Map<string, boolean>(),
    setOption: vi.fn(),
    hostControlsLabel: 'Host controls',
    botCountLabel: 'Bots',
    difficultyLabel: 'Difficulty',
    difficultyEasyLabel: 'Easy',
    difficultyMediumLabel: 'Medium',
    difficultyHardLabel: 'Hard',
    difficultyExpertLabel: 'Expert',
    ...over,
  };
}

describe('LobbySetupSection', () => {
  it('renders nothing for a non-host without options', () => {
    const { container } = render(
      <LobbySetupSection {...props({ isHost: false })} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders the options slot card', () => {
    render(
      <LobbySetupSection
        {...props({ isHost: false, optionsSlot: <div>opts</div> })}
      />,
    );
    expect(screen.getByTestId('lobby-game-settings-card')).toBeTruthy();
    expect(screen.getByText('opts')).toBeTruthy();
  });

  it('shows one bot count button per open seat with pressed state', () => {
    const setBotCount = vi.fn();
    render(<LobbySetupSection {...props({ setBotCount })} />);
    expect(screen.queryByTestId('bot-count-4')).toBeNull();
    expect(screen.getByTestId('bot-count-2').getAttribute('aria-pressed')).toBe(
      'true',
    );
    expect(screen.getByTestId('bot-count-1').getAttribute('aria-pressed')).toBe(
      'false',
    );
    fireEvent.click(screen.getByTestId('bot-count-3'));
    expect(setBotCount).toHaveBeenCalledWith(3);
  });

  it('changes difficulty and reflects the selection', () => {
    const setDifficulty = vi.fn();
    render(<LobbySetupSection {...props({ setDifficulty })} />);
    expect(
      screen.getByTestId('difficulty-medium').getAttribute('aria-pressed'),
    ).toBe('true');
    fireEvent.click(screen.getByTestId('difficulty-expert'));
    expect(setDifficulty).toHaveBeenCalledWith('expert');
    expect(screen.getByTestId('difficulty-badge').textContent).toContain(
      'Medium',
    );
  });

  it('hides bot controls when host bots are disabled but keeps house rules', () => {
    render(<LobbySetupSection {...props({ showHostBots: false })} />);
    expect(screen.queryByTestId('bot-count-1')).toBeNull();
    expect(screen.getByTestId('house-rules')).toBeTruthy();
  });
});
