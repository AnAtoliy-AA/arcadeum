import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TamaguiProvider } from 'tamagui';
import tamaguiConfig from '../../../../shared/config/tamagui.config';
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
    deck: ['strike', 'evade', 'trade'] as CriticalCard[],
    discardPile: ['strike'] as CriticalCard[],
    cardVariant: 'cyberpunk',
    isMyTurn: true,
    isGameOver: false,
    onDrawAndEnd: vi.fn(),
    ...override,
  };
  return render(
    <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
      <ScenePaletteProvider palette={palette}>
        <Arena {...props} />
      </ScenePaletteProvider>
    </TamaguiProvider>,
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
});
