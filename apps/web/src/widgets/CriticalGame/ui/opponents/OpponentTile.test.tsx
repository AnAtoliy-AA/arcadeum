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

  it('fires onSelect when the tile is clicked (alive opponent)', () => {
    const onSelect = vi.fn();
    renderTile({ onSelect });
    // Tamagui maps `onPress` to a `click` listener on the web.
    screen.getByTestId('opponent-tile-p1').click();
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('exposes role=button and aria-pressed when interactive', () => {
    const onSelect = vi.fn();
    renderTile({ onSelect, isTarget: true });
    const tile = screen.getByTestId('opponent-tile-p1');
    expect(tile).toHaveAttribute('role', 'button');
    expect(tile).toHaveAttribute('aria-pressed', 'true');
  });

  it('is non-interactive when opponent is eliminated', () => {
    const onSelect = vi.fn();
    renderTile({
      player: makePlayer({ alive: false }),
      onSelect,
    });
    const tile = screen.getByTestId('opponent-tile-p1');
    expect(tile).not.toHaveAttribute('role', 'button');
    tile.click();
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('exposes a single state suffix in the accessible name (target beats turn)', () => {
    // §3.2 — visual ring states (turn, target, eliminated) are mirrored
    // in the aria-label so screen-reader users get the same context as
    // sighted players. Priority matches the visual ring: dead beats
    // target beats current-turn. The tile border only paints one ring
    // colour at a time; the label exposes one suffix at a time.
    renderTile({
      player: makePlayer({ playerId: 'alice' }),
      resolveDisplayName: () => 'Alice',
      isCurrentTurn: true,
      isTarget: true,
      onSelect: vi.fn(),
    });
    const tile = screen.getByTestId('opponent-tile-alice');
    const label = tile.getAttribute('aria-label') ?? '';
    expect(label).toContain('Alice');
    expect(label).toContain('games.table.players.a11yState.armedTarget');
    expect(label).not.toContain('games.table.players.a11yState.currentTurn');
  });

  it('falls back to currentTurn suffix when not armed as a target', () => {
    renderTile({
      player: makePlayer({ playerId: 'alice' }),
      resolveDisplayName: () => 'Alice',
      isCurrentTurn: true,
      onSelect: vi.fn(),
    });
    const tile = screen.getByTestId('opponent-tile-alice');
    expect(tile.getAttribute('aria-label')).toContain(
      'games.table.players.a11yState.currentTurn',
    );
  });

  it('includes the eliminated suffix in the aria-label for dead tiles', () => {
    renderTile({
      player: makePlayer({ playerId: 'bob', alive: false, hand: [] }),
      resolveDisplayName: () => 'Bob',
    });
    const tile = screen.getByTestId('opponent-tile-bob');
    const label = tile.getAttribute('aria-label') ?? '';
    expect(label).toContain('Bob');
    expect(label).toContain('games.table.players.a11yState.eliminated');
  });
});
