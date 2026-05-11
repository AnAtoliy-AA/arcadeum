import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TamaguiProvider } from 'tamagui';
import tamaguiConfig from '../../../../shared/config/tamagui.config';

vi.mock('@/shared/lib/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      if (key === 'games.table.players.eliminated') return 'Eliminated';
      return key;
    },
  }),
}));

vi.mock('@/features/games/store/gameStore', () => ({
  useGameStore: (selector: (s: unknown) => unknown) =>
    selector({ idlePlayers: [] }),
}));

vi.mock('@/shared/ui', () => ({
  IdleBadge: () => <span data-testid="idle-badge">idle</span>,
}));

import { OpponentTile } from './OpponentTile';
import type { CriticalCard, CriticalPlayerTableState } from '../../types';

function makePlayer(
  override: Partial<CriticalPlayerTableState> = {},
): CriticalPlayerTableState {
  return {
    playerId: 'p1',
    alive: true,
    hand: ['strike', 'evade'] as CriticalCard[],
    ...override,
  };
}

function renderTile(
  override: Partial<React.ComponentProps<typeof OpponentTile>> = {},
) {
  const props: React.ComponentProps<typeof OpponentTile> = {
    player: makePlayer(),
    isCurrentTurn: false,
    resolveDisplayName: (_id, fb) => fb,
    ...override,
  };
  return render(
    <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
      <OpponentTile {...props} />
    </TamaguiProvider>,
  );
}

describe('OpponentTile', () => {
  it('renders display name and hand count for an alive opponent', () => {
    renderTile({
      player: makePlayer({
        playerId: 'alice',
        hand: ['strike', 'evade', 'trade'] as CriticalCard[],
      }),
      resolveDisplayName: () => 'Alice',
    });
    expect(screen.getByTestId('opponent-tile-name-alice')).toHaveTextContent(
      'Alice',
    );
    expect(screen.getByTestId('opponent-tile-count-alice')).toHaveTextContent(
      '3',
    );
  });

  it('shows the eliminated state when alive is false', () => {
    renderTile({
      player: makePlayer({ playerId: 'p1', alive: false, hand: [] }),
    });
    expect(
      screen.getByTestId('opponent-tile-eliminated-p1'),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId('opponent-tile-count-p1'),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId('opponent-tile-p1')).toHaveAttribute(
      'data-alive',
      'false',
    );
  });

  it('flags the current turn via data-current-turn', () => {
    renderTile({ isCurrentTurn: true });
    expect(screen.getByTestId('opponent-tile-p1')).toHaveAttribute(
      'data-current-turn',
      'true',
    );
  });

  it('flags the armed target via data-target', () => {
    renderTile({ isTarget: true });
    expect(screen.getByTestId('opponent-tile-p1')).toHaveAttribute(
      'data-target',
      'true',
    );
  });
});
