import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TamaguiProvider } from 'tamagui';
import tamaguiConfig from '../../../shared/config/tamagui.config';

vi.mock('@/shared/lib/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

import { MatchHud } from './MatchHud';
import type {
  CriticalCard,
  CriticalPlayerState,
  CriticalSnapshot,
} from '../types';

const identityFormat = (m?: string | null) => m ?? '';

function makeSnapshot(
  override: Partial<CriticalSnapshot> = {},
): CriticalSnapshot {
  return {
    deck: [],
    discardPile: [],
    playerOrder: ['p1'],
    currentTurnIndex: 0,
    pendingDraws: 1,
    pendingDefuse: null,
    pendingFavor: null,
    pendingAlter: null,
    pendingAction: null,
    players: [],
    logs: [],
    allowActionCardCombos: false,
    ...override,
  };
}

function makePlayer(
  override: Partial<CriticalPlayerState> = {},
): CriticalPlayerState {
  return {
    playerId: 'p1',
    hand: ['strike'] as CriticalCard[],
    alive: true,
    ...override,
  };
}

function renderHud(props: {
  snapshot?: CriticalSnapshot;
  currentPlayer: CriticalPlayerState | null;
  isGameOver?: boolean;
}) {
  return render(
    <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
      <MatchHud
        snapshot={props.snapshot ?? makeSnapshot()}
        currentPlayer={props.currentPlayer}
        isGameOver={props.isGameOver ?? false}
        formatLogMessage={identityFormat}
      />
    </TamaguiProvider>,
  );
}

describe('MatchHud', () => {
  it('renders threat strip and combo hints when player is alive and game is not over', () => {
    renderHud({ currentPlayer: makePlayer() });
    expect(screen.getByTestId('threat-strip')).toBeInTheDocument();
    expect(screen.getByTestId('combo-hints')).toBeInTheDocument();
  });

  it('hides threat strip and combo hints when currentPlayer is null', () => {
    renderHud({ currentPlayer: null });
    expect(screen.queryByTestId('threat-strip')).not.toBeInTheDocument();
    expect(screen.queryByTestId('combo-hints')).not.toBeInTheDocument();
  });

  it('hides threat strip when player is eliminated', () => {
    renderHud({ currentPlayer: makePlayer({ alive: false }) });
    expect(screen.queryByTestId('threat-strip')).not.toBeInTheDocument();
    expect(screen.queryByTestId('combo-hints')).not.toBeInTheDocument();
  });

  it('hides threat strip when the game is over', () => {
    renderHud({ currentPlayer: makePlayer(), isGameOver: true });
    expect(screen.queryByTestId('threat-strip')).not.toBeInTheDocument();
    expect(screen.queryByTestId('combo-hints')).not.toBeInTheDocument();
  });

  it('does not render an empty flash slot when there is nothing to show', () => {
    // FlashBanner owns its own wrapper and returns null when no log warrants
    // a flash, so MatchHud should not reserve any visible band post-game.
    const { container } = renderHud({
      currentPlayer: null,
      snapshot: makeSnapshot({ logs: [] }),
    });
    expect(container.querySelector('[data-testid="flash-banner"]')).toBeNull();
    expect(container.querySelector('[data-testid="threat-strip"]')).toBeNull();
  });
});
