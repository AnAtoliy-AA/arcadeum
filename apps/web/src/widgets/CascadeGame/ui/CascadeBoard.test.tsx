import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TamaguiProvider, createTamagui } from 'tamagui';
import { defaultConfig } from '@tamagui/config/v4';

const tamaguiConfig = createTamagui(defaultConfig);
import { CascadeBoard } from './CascadeBoard';
import { CascadeThemeProvider } from '../lib/CascadeThemeContext';
import type { CascadeClientState } from '../types';

function makeSnapshot(
  overrides: Partial<CascadeClientState> = {},
): CascadeClientState {
  return {
    phase: 'playing',
    options: {
      variant: 'cosmic',
      mode: 'classic',
      stackingEnabled: true,
      lastCardCallEnabled: true,
    },
    players: [
      {
        playerId: 'me',
        alive: true,
        hand: [
          { id: 'r5', color: 'R', kind: 'NUMBER', value: 5 },
          { id: 'b3', color: 'B', kind: 'NUMBER', value: 3 },
        ],
      },
      {
        playerId: 'bot-1',
        alive: true,
        hand: [
          { id: 'h1', color: 'G', kind: 'NUMBER', value: 1 },
          { id: 'h2', color: 'Y', kind: 'NUMBER', value: 4 },
          { id: 'h3', color: 'B', kind: 'SKIP' },
        ],
      },
    ],
    playerOrder: ['me', 'bot-1'],
    currentTurnIndex: 0,
    direction: 1,
    drawPile: [],
    discardPile: [{ id: 'top', color: 'R', kind: 'NUMBER', value: 9 }],
    topCard: { id: 'top', color: 'R', kind: 'NUMBER', value: 9 },
    activeColor: 'R',
    pendingDraw: 0,
    pendingStackKind: null,
    pendingAction: 'none',
    lastCardWindow: null,
    winnerId: null,
    logs: [],
    ...overrides,
  };
}

function renderBoard(props: React.ComponentProps<typeof CascadeBoard>) {
  return render(
    <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
      <CascadeThemeProvider variant="cosmic">
        <CascadeBoard {...props} />
      </CascadeThemeProvider>
    </TamaguiProvider>,
  );
}

describe('CascadeBoard', () => {
  // First Tamagui render pays a one-time setup cost — give it room.
  it('renders my hand and the discard top card', { timeout: 20000 }, () => {
    const snapshot = makeSnapshot();
    renderBoard({
      snapshot,
      currentUserId: 'me',
      myHand: snapshot.players[0].hand,
      myTurn: true,
      disabled: false,
      onPlayCard: vi.fn(),
      onDraw: vi.fn(),
    });

    // My two hand cards + the discard top + the Draw button.
    expect(screen.getByRole('button', { name: /red 5/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /blue 3/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /red 9/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /draw a card/i }),
    ).toBeInTheDocument();
  });

  it('shows opponent card count, not their hand contents', () => {
    const snapshot = makeSnapshot();
    renderBoard({
      snapshot,
      currentUserId: 'me',
      myHand: snapshot.players[0].hand,
      myTurn: true,
      disabled: false,
      onPlayCard: vi.fn(),
      onDraw: vi.fn(),
    });
    expect(screen.getByText(/3 cards/i)).toBeInTheDocument();
    // Specific bot card ids must NOT leak into the board.
    expect(screen.queryByRole('button', { name: /green 1/i })).toBeNull();
  });

  it('fires onPlayCard for a non-wild playable card', () => {
    const onPlayCard = vi.fn();
    const snapshot = makeSnapshot();
    renderBoard({
      snapshot,
      currentUserId: 'me',
      myHand: snapshot.players[0].hand,
      myTurn: true,
      disabled: false,
      onPlayCard,
      onDraw: vi.fn(),
    });
    // r5 matches the R-color top so it's playable.
    fireEvent.click(screen.getByRole('button', { name: /red 5/i }));
    expect(onPlayCard).toHaveBeenCalledWith('r5');
  });

  it('does not call onPlayCard for an unplayable card', () => {
    const onPlayCard = vi.fn();
    const snapshot = makeSnapshot();
    renderBoard({
      snapshot,
      currentUserId: 'me',
      myHand: snapshot.players[0].hand,
      myTurn: true,
      disabled: false,
      onPlayCard,
      onDraw: vi.fn(),
    });
    // b3 doesn't match R-color or value 9 — should be ignored.
    fireEvent.click(screen.getByRole('button', { name: /blue 3/i }));
    expect(onPlayCard).not.toHaveBeenCalled();
  });

  it('fires onDraw on draw-pile click', () => {
    const onDraw = vi.fn();
    const snapshot = makeSnapshot();
    renderBoard({
      snapshot,
      currentUserId: 'me',
      myHand: snapshot.players[0].hand,
      myTurn: true,
      disabled: false,
      onPlayCard: vi.fn(),
      onDraw,
    });
    fireEvent.click(screen.getByRole('button', { name: /draw a card/i }));
    expect(onDraw).toHaveBeenCalledTimes(1);
  });
});
