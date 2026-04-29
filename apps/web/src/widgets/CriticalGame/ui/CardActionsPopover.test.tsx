import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TamaguiProvider } from 'tamagui';
import tamaguiConfig from '../../../shared/config/tamagui.config';
import { CardActionsPopover } from './CardActionsPopover';
import type { CriticalCard } from '../types';

type SetupOverrides = {
  card?: CriticalCard;
  count?: number;
  isMyTurn?: boolean;
  canAct?: boolean;
  allowActionCardCombos?: boolean;
  hasOpponents?: boolean;
  cardVariant?: string;
  onPlay?: () => void;
  onPlayCombo?: () => void;
  onClose?: () => void;
};

function setup(overrides: SetupOverrides = {}) {
  const onPlay = overrides.onPlay ?? vi.fn();
  const onPlayCombo = overrides.onPlayCombo ?? vi.fn();
  const onClose = overrides.onClose ?? vi.fn();
  const t = (key: string, params?: Record<string, string | number>) =>
    params ? `${key}:${JSON.stringify(params)}` : key;

  render(
    <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
      <CardActionsPopover
        card={overrides.card ?? 'insight'}
        count={overrides.count ?? 1}
        isMyTurn={overrides.isMyTurn ?? true}
        canAct={overrides.canAct ?? true}
        allowActionCardCombos={overrides.allowActionCardCombos ?? false}
        hasOpponents={overrides.hasOpponents ?? true}
        cardVariant={overrides.cardVariant}
        t={t}
        onPlay={onPlay}
        onPlayCombo={onPlayCombo}
        onClose={onClose}
      />
    </TamaguiProvider>,
  );
  return { onPlay, onPlayCombo, onClose };
}

describe('CardActionsPopover', () => {
  it('renders Play and Close for a special card (insight)', () => {
    setup({ card: 'insight' });
    expect(screen.getByTestId('card-actions-play')).toBeInTheDocument();
    expect(screen.getByTestId('card-actions-close')).toBeInTheDocument();
    expect(screen.queryByTestId('card-actions-combo')).not.toBeInTheDocument();
  });

  it('renders Combo button when count >= 2 and combos are allowed', () => {
    setup({
      card: 'strike',
      count: 3,
      allowActionCardCombos: true,
      hasOpponents: true,
    });
    expect(screen.getByTestId('card-actions-combo')).toBeInTheDocument();
  });

  it('hides Play and Combo when canAct is false', () => {
    setup({
      card: 'strike',
      count: 3,
      allowActionCardCombos: true,
      canAct: false,
    });
    expect(screen.queryByTestId('card-actions-play')).not.toBeInTheDocument();
    expect(screen.queryByTestId('card-actions-combo')).not.toBeInTheDocument();
    expect(screen.getByTestId('card-actions-close')).toBeInTheDocument();
  });

  it('calls onPlay when Play is pressed', () => {
    const onPlay = vi.fn();
    setup({ card: 'insight', onPlay });
    fireEvent.click(screen.getByTestId('card-actions-play'));
    expect(onPlay).toHaveBeenCalledTimes(1);
  });
});
