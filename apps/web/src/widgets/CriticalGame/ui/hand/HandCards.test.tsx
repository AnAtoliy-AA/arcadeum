import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TamaguiProvider } from 'tamagui';
import tamaguiConfig from '../../../../shared/config/tamagui.config';

vi.mock('@/shared/lib/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

import { HandCards } from './HandCards';
import { handWithUids } from '../../lib/combo';
import type { CriticalCard } from '../../types';

function renderCards(
  props: Partial<React.ComponentProps<typeof HandCards>> = {},
) {
  const merged: React.ComponentProps<typeof HandCards> = {
    cards: handWithUids(['strike', 'strike', 'evade'] as CriticalCard[]),
    selectedUids: [],
    onToggleSelect: vi.fn(),
    ...props,
  };
  return {
    ...render(
      <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
        <HandCards {...merged} />
      </TamaguiProvider>,
    ),
    props: merged,
  };
}

describe('HandCards', () => {
  it('renders one tile per hand instance, even for duplicate card types', () => {
    renderCards();
    expect(screen.getByTestId('hand-card-strike-0')).toBeInTheDocument();
    expect(screen.getByTestId('hand-card-strike-1')).toBeInTheDocument();
    expect(screen.getByTestId('hand-card-evade-2')).toBeInTheDocument();
  });

  it('flags the selected card via data-selected', () => {
    renderCards({ selectedUids: ['strike-1'] });
    expect(screen.getByTestId('hand-card-strike-0')).toHaveAttribute(
      'data-selected',
      'false',
    );
    expect(screen.getByTestId('hand-card-strike-1')).toHaveAttribute(
      'data-selected',
      'true',
    );
  });

  it('fires onToggleSelect when a card is clicked', () => {
    const onToggleSelect = vi.fn();
    renderCards({ onToggleSelect });
    fireEvent.click(screen.getByTestId('hand-card-evade-2'));
    expect(onToggleSelect).toHaveBeenCalledWith('evade-2');
  });

  it('does not call onToggleSelect when disabled', () => {
    const onToggleSelect = vi.fn();
    renderCards({ onToggleSelect, disabled: true });
    fireEvent.click(screen.getByTestId('hand-card-evade-2'));
    expect(onToggleSelect).not.toHaveBeenCalled();
  });
});
