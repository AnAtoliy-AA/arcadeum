import { render as rtlRender, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TamaguiProvider } from 'tamagui';
import config from '@/shared/config/tamagui.config';
import { TurnIndicator, resolveTurnStatus } from './TurnIndicator';
import { useGameChatStore } from '@/widgets/GameChat';

// Translate keys to their final form with `{{name}}` interpolation so we can
// assert on rendered copy without coupling to a specific locale string.
vi.mock('@/shared/lib/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, string | number>) => {
      const labels: Record<string, string> = {
        'games.table.turn.yourTurn': 'Your turn',
        'games.table.turn.otherTurn': "{{name}}'s turn",
        'games.table.turn.waiting': 'Waiting…',
        'games.table.turn.gameOver': 'Game over',
      };
      const base = labels[key] ?? key;
      return params
        ? Object.entries(params).reduce(
            (s, [k, v]) => s.replace(`{{${k}}}`, String(v)),
            base,
          )
        : base;
    },
  }),
}));

// InGameAvatar reaches into the game store + cosmetics hook; stub it to a marker
// so this test focuses on TurnIndicator's own logic (name + label + status).
vi.mock('./InGameAvatar', () => ({
  InGameAvatar: ({ name }: { name: string }) => (
    <div data-testid="turn-indicator-avatar">{name}</div>
  ),
}));

const render = (ui: React.ReactElement) =>
  rtlRender(
    <TamaguiProvider config={config} defaultTheme="dark">
      {ui}
    </TamaguiProvider>,
  );

describe('resolveTurnStatus', () => {
  it('maps game over → completed regardless of turn', () => {
    expect(
      resolveTurnStatus({
        onClockUserId: 'u-1',
        isMyTurn: true,
        isGameOver: true,
      }),
    ).toBe('completed');
  });

  it('maps my turn → yourTurn', () => {
    expect(resolveTurnStatus({ onClockUserId: 'u-1', isMyTurn: true })).toBe(
      'yourTurn',
    );
  });

  it('maps another player on the clock → waiting', () => {
    expect(resolveTurnStatus({ onClockUserId: 'u-2', isMyTurn: false })).toBe(
      'waiting',
    );
  });

  it('maps nobody on the clock → default', () => {
    expect(resolveTurnStatus({ onClockUserId: null, isMyTurn: false })).toBe(
      'default',
    );
  });
});

describe('TurnIndicator', () => {
  beforeEach(() => {
    useGameChatStore.setState({
      resolveDisplayName: (id?: string) => (id === 'u-2' ? 'Jane' : undefined),
      fallbackResolveDisplayName: null,
    });
  });

  it("shows 'Your turn' and the on-clock avatar when it is the local player's turn", () => {
    render(<TurnIndicator turn={{ onClockUserId: 'u-1', isMyTurn: true }} />);
    expect(screen.getByTestId('turn-indicator-label')).toHaveTextContent(
      'Your turn',
    );
    // The on-clock avatar still renders (it's the local player on the clock).
    expect(screen.getByTestId('turn-indicator-avatar')).toBeInTheDocument();
  });

  it("shows the other player's name + avatar when waiting on them", () => {
    render(<TurnIndicator turn={{ onClockUserId: 'u-2', isMyTurn: false }} />);
    expect(screen.getByTestId('turn-indicator-label')).toHaveTextContent(
      "Jane's turn",
    );
    expect(screen.getByTestId('turn-indicator-avatar')).toHaveTextContent(
      'Jane',
    );
  });

  it("shows 'Waiting…' and no avatar when nobody is on the clock", () => {
    render(<TurnIndicator turn={{ onClockUserId: null, isMyTurn: false }} />);
    expect(screen.getByTestId('turn-indicator-label')).toHaveTextContent(
      'Waiting…',
    );
    expect(screen.queryByTestId('turn-indicator-avatar')).not.toBeInTheDocument();
  });

  it("shows 'Game over' and no avatar when the game is finished", () => {
    render(
      <TurnIndicator
        turn={{ onClockUserId: 'u-2', isMyTurn: false, isGameOver: true }}
      />,
    );
    expect(screen.getByTestId('turn-indicator-label')).toHaveTextContent(
      'Game over',
    );
    expect(
      screen.queryByTestId('turn-indicator-avatar'),
    ).not.toBeInTheDocument();
  });

  it('honors an explicit onClockName override', () => {
    render(
      <TurnIndicator
        turn={{ onClockUserId: 'u-9', isMyTurn: false, onClockName: 'Bot 9' }}
      />,
    );
    expect(screen.getByTestId('turn-indicator-label')).toHaveTextContent(
      "Bot 9's turn",
    );
  });
});
