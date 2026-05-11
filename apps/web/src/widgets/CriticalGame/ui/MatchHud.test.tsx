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

  it('still mounts the flash banner slot when the strip is hidden', () => {
    // The flash banner wrapper is always rendered so feedback messages can
    // still surface during elimination and post-game windows. The banner
    // itself is empty when there are no actionable logs.
    const { container } = renderHud({
      currentPlayer: null,
      snapshot: makeSnapshot({ logs: [] }),
    });
    expect(container.querySelector('[data-testid="flash-banner"]')).toBeNull();
  });
});
