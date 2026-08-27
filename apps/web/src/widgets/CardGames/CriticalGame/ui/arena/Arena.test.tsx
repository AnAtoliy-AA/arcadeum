import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ScenePaletteProvider } from '../ScenePaletteContext';
import { getVariantStyles } from '../styles/variants';

vi.mock('@/shared/lib/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// DeckDisplay and LastPlayedCardDisplay pull in the cards sprite pipeline
// which isn't worth booting just to assert the Arena composition.
vi.mock('../DeckDisplay', () => ({
  DeckDisplay: () => <div data-testid="deck-display-stub" />,
}));
vi.mock('../LastPlayedCardDisplay', () => ({
  LastPlayedCardDisplay: () => <div data-testid="last-played-stub" />,
}));

import { Arena } from './Arena';
import type { CriticalCard } from '../../types';

const palette = getVariantStyles('cyberpunk').scene;

function renderArena(
  override: Partial<React.ComponentProps<typeof Arena>> = {},
) {
  const props: React.ComponentProps<typeof Arena> = {
    deck: override.deck ?? (['strike', 'evade', 'trade'] as CriticalCard[]),
    discardPile: override.discardPile ?? (['strike'] as CriticalCard[]),
    cardVariant: override.cardVariant ?? 'cyberpunk',
    isMyTurn: override.isMyTurn ?? true,
    isGameOver: override.isGameOver ?? false,
    onDrawAndEnd: override.onDrawAndEnd ?? vi.fn(),
    onClearSelection: override.onClearSelection,
    hand: override.hand ?? (['strike'] as CriticalCard[]),
    allowActionCardCombos: override.allowActionCardCombos ?? false,
    combo: override.combo,
    currentPlayerName: override.currentPlayerName ?? 'Alice',
    pendingDraws: override.pendingDraws ?? 1,
    logs: override.logs ?? [],
    formatLogMessage:
      override.formatLogMessage ?? ((m?: string | null) => m ?? ''),
    resolveDisplayName: override.resolveDisplayName,
    serverOverloadOdds: override.serverOverloadOdds,
    criticalsRemaining: override.criticalsRemaining,
    hiddenCount: override.hiddenCount,
  };
  return render(
    <ScenePaletteProvider palette={palette}>
      <Arena
        deck={props.deck}
        discardPile={props.discardPile}
        cardVariant={props.cardVariant}
        isMyTurn={props.isMyTurn}
        isGameOver={props.isGameOver}
        onDrawAndEnd={props.onDrawAndEnd}
        onClearSelection={props.onClearSelection}
        hand={props.hand}
        allowActionCardCombos={props.allowActionCardCombos}
        combo={props.combo}
        currentPlayerName={props.currentPlayerName}
        pendingDraws={props.pendingDraws}
        logs={props.logs}
        formatLogMessage={props.formatLogMessage}
        resolveDisplayName={props.resolveDisplayName}
        serverOverloadOdds={props.serverOverloadOdds}
        criticalsRemaining={props.criticalsRemaining}
        hiddenCount={props.hiddenCount}
      />
    </ScenePaletteProvider>,
  );
}

describe('Arena', () => {
  it('renders draw pile, center placeholder, and discard pile', () => {
    renderArena();
    expect(screen.getByTestId('arena')).toBeInTheDocument();
    expect(screen.getByTestId('arena-draw-pile')).toBeInTheDocument();
    expect(screen.getByTestId('arena-center')).toBeInTheDocument();
    expect(screen.getByTestId('arena-discard-pile')).toBeInTheDocument();
  });

  it('shows the deck count', () => {
    renderArena({ deck: ['strike', 'evade'] as CriticalCard[] });
    expect(screen.getByTestId('arena-draw-pile-count')).toHaveTextContent('2');
  });

  it('shows the discard count', () => {
    renderArena({
      discardPile: ['strike', 'evade', 'trade'] as CriticalCard[],
    });
    expect(screen.getByTestId('arena-discard-pile-count')).toHaveTextContent(
      '3',
    );
  });

  it('fires onDrawAndEnd when the draw pile is clicked on your turn', () => {
    const onDrawAndEnd = vi.fn();
    renderArena({ isMyTurn: true, onDrawAndEnd });
    fireEvent.click(screen.getByTestId('arena-draw-pile'));
    expect(onDrawAndEnd).toHaveBeenCalledTimes(1);
  });

  it('does not fire onDrawAndEnd when it is not your turn', () => {
    const onDrawAndEnd = vi.fn();
    renderArena({ isMyTurn: false, onDrawAndEnd });
    fireEvent.click(screen.getByTestId('arena-draw-pile'));
    expect(onDrawAndEnd).not.toHaveBeenCalled();
  });

  it('disables the draw pile when the game is over', () => {
    const onDrawAndEnd = vi.fn();
    renderArena({ isMyTurn: true, isGameOver: true, onDrawAndEnd });
    fireEvent.click(screen.getByTestId('arena-draw-pile'));
    expect(onDrawAndEnd).not.toHaveBeenCalled();
    expect(screen.getByTestId('arena-draw-pile')).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  it('uses CSS grid with named areas for layout (§4.3)', () => {
    // The layout (3-col desktop / re-stacked mobile) lives in CSS via
    // .match-arena + data-area instead of a JS isNarrow branch.
    renderArena();
    const arena = screen.getByTestId('arena');
    expect(arena).toHaveClass('match-arena');
    expect(arena.querySelector('[data-area="draw"]')).not.toBeNull();
    expect(arena.querySelector('[data-area="center"]')).not.toBeNull();
    expect(arena.querySelector('[data-area="discard"]')).not.toBeNull();
  });

  it('renders the top discard card description as an overlay', () => {
    // Played card on the discard pile carries the same description hand
    // cards do — name alone lost context for action cards like Hack /
    // Targeted Strike. Mocked `t` echoes the i18n key.
    renderArena({ discardPile: ['strike'] as CriticalCard[] });
    const scrim = screen.getByTestId('arena-discard-pile-description');
    expect(scrim.textContent).toMatch(/strike/);
  });
});
