import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ScenePaletteProvider } from '../ScenePaletteContext';
import { getVariantStyles } from '../styles/variants';

vi.mock('@/shared/lib/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, string | number>) => {
      if (key === 'games.table.players.yourMove') return 'Your move';
      if (key === 'games.table.players.playerTurn') {
        return `${params?.name ?? ''}'s turn`;
      }
      return key;
    },
  }),
}));

import { ArenaCenter } from './ArenaCenter';
import type { CriticalCard } from '../../types';

const palette = getVariantStyles('cyberpunk').scene;

function renderCenter(
  override: Partial<React.ComponentProps<typeof ArenaCenter>> = {},
) {
  const props: React.ComponentProps<typeof ArenaCenter> = {
    isMyTurn: override.isMyTurn ?? true,
    currentPlayerName: override.currentPlayerName ?? 'Alice',
    pendingDraws: override.pendingDraws ?? 1,
    hand: override.hand ?? (['strike', 'evade'] as CriticalCard[]),
    allowActionCardCombos: override.allowActionCardCombos ?? false,
    combo: override.combo,
    onClearSelection: override.onClearSelection,
    deck: override.deck ?? (['strike'] as CriticalCard[]),
    serverOverloadOdds: override.serverOverloadOdds,
    criticalsRemaining: override.criticalsRemaining,
    hiddenCount: override.hiddenCount,
    logs: override.logs ?? [],
    formatLogMessage:
      override.formatLogMessage ?? ((m?: string | null) => m ?? ''),
    resolveDisplayName: override.resolveDisplayName,
  };
  return render(
    <ScenePaletteProvider palette={palette}>
      <ArenaCenter
        isMyTurn={props.isMyTurn}
        currentPlayerName={props.currentPlayerName}
        pendingDraws={props.pendingDraws}
        hand={props.hand}
        allowActionCardCombos={props.allowActionCardCombos}
        combo={props.combo}
        onClearSelection={props.onClearSelection}
        deck={props.deck}
        serverOverloadOdds={props.serverOverloadOdds}
        criticalsRemaining={props.criticalsRemaining}
        hiddenCount={props.hiddenCount}
        logs={props.logs}
        formatLogMessage={props.formatLogMessage}
        resolveDisplayName={props.resolveDisplayName}
      />
    </ScenePaletteProvider>,
  );
}

describe('ArenaCenter', () => {
  it('renders turn banner, combo card, threat strip, and flash slot', () => {
    renderCenter();
    expect(screen.getByTestId('arena-center')).toBeInTheDocument();
    expect(screen.getByTestId('turn-banner')).toBeInTheDocument();
    expect(screen.getByTestId('combo-card')).toBeInTheDocument();
    expect(screen.getByTestId('threat-strip')).toBeInTheDocument();
    expect(screen.getByTestId('arena-flash-slot')).toBeInTheDocument();
  });

  it('renders the flash slot as a child of arena-center so the overlay can position relative to it', () => {
    const { container } = renderCenter();
    const center = container.querySelector('[data-testid="arena-center"]');
    expect(center).not.toBeNull();
    expect(
      center?.querySelector('[data-testid="arena-flash-slot"]'),
    ).not.toBeNull();
  });
});
