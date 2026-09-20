import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ComboModal from './ComboModal';
import type { CriticalCard, EventComboModalState } from '../../types';

describe('ComboModal UI/UX', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    comboModal: {
      availableComboCards: [
        { card: 'cancel', availableModes: ['pair'] as ('pair' | 'trio')[] },
      ],
      selectedComboCard: 'cancel' as CriticalCard,
      fiverAvailable: false,
    } as EventComboModalState,
    selectedMode: 'pair' as const,
    selectedTarget: null,
    selectedCard: null,
    selectedIndex: null,
    selectedDiscardCard: null,
    selectedFiverCards: [] as CriticalCard[],
    aliveOpponents: [
      {
        playerId: 'p2',
        hand: ['strike', 'evade', 'trade'] as CriticalCard[],
      },
    ],
    selfHand: ['cancel', 'cancel'] as CriticalCard[],
    discardPile: [] as CriticalCard[],
    onSelectComboCard: vi.fn(),
    onSelectMode: vi.fn(),
    onSelectTarget: vi.fn(),
    onSelectCard: vi.fn(),
    onSelectIndex: vi.fn(),
    onSelectDiscardCard: vi.fn(),
    onToggleFiverCard: vi.fn(),
    onConfirm: vi.fn(),
    resolveDisplayName: (_id?: string, fallback?: string) =>
      fallback || 'Player',
    t: (key: string) => key,
  };

  it('renders pair combo cleanly without 🚫 icon and auto-targets single opponent', () => {
    render(<ComboModal {...defaultProps} />);

    expect(screen.queryByText('🚫')).toBeNull();
    expect(screen.getByText(/🎴🎴/)).toBeDefined();

    expect(defaultProps.onSelectTarget).toHaveBeenCalledWith('p2');

    expect(screen.getByTestId('blind-card-picker')).toBeDefined();
    expect(screen.getByTestId('blind-card-0')).toBeDefined();
    expect(screen.getByTestId('blind-card-1')).toBeDefined();
    expect(screen.getByTestId('blind-card-2')).toBeDefined();

    const confirmBtn = screen.getByTestId('combo-confirm-button');
    expect(confirmBtn).toBeDisabled();

    fireEvent.click(screen.getByTestId('blind-card-1'));
    expect(defaultProps.onSelectIndex).toHaveBeenCalledWith(1);
  });

  it('confirms pair combo when index is selected', () => {
    const onConfirm = vi.fn();
    render(
      <ComboModal
        {...defaultProps}
        selectedTarget="p2"
        selectedIndex={1}
        onConfirm={onConfirm}
      />,
    );

    const confirmBtn = screen.getByTestId('combo-confirm-button');
    expect(confirmBtn).not.toBeDisabled();
    fireEvent.click(confirmBtn);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('renders trio combo and selects requested card', () => {
    const onSelectCard = vi.fn();
    const onConfirm = vi.fn();
    render(
      <ComboModal
        {...defaultProps}
        comboModal={{
          availableComboCards: [
            { card: 'strike', availableModes: ['pair', 'trio'] },
          ],
          selectedComboCard: 'strike',
          fiverAvailable: false,
        }}
        selectedMode="trio"
        selectedTarget="p2"
        onSelectCard={onSelectCard}
        onConfirm={onConfirm}
      />,
    );

    expect(screen.getByText(/🎴🎴🎴/)).toBeDefined();
    expect(screen.getByTestId('trio-card-picker')).toBeDefined();

    const targetCard = screen.getByTestId('trio-card-evade');
    fireEvent.click(targetCard);
    expect(onSelectCard).toHaveBeenCalledWith('evade');
  });

  it('renders fiver combo directly with discard pile when 5 cards already selected', () => {
    const onSelectDiscardCard = vi.fn();
    const onConfirm = vi.fn();
    const selectedFiverCards: CriticalCard[] = [
      'strike',
      'evade',
      'trade',
      'reorder',
      'cancel',
    ];
    const discardPile: CriticalCard[] = ['neutralizer', 'targeted_strike'];

    render(
      <ComboModal
        {...defaultProps}
        comboModal={{
          availableComboCards: [],
          selectedComboCard: null,
          fiverAvailable: true,
        }}
        selectedMode="fiver"
        selectedFiverCards={selectedFiverCards}
        discardPile={discardPile}
        onSelectDiscardCard={onSelectDiscardCard}
        onConfirm={onConfirm}
      />,
    );

    expect(screen.getByText(/✨/)).toBeDefined();
    expect(screen.getByText(/5 cards selected/)).toBeDefined();
    expect(screen.queryByTestId('fiver-hand-cards')).toBeNull();

    expect(screen.getByTestId('fiver-discard-cards')).toBeDefined();
    fireEvent.click(screen.getByTestId('discard-card-0'));
    expect(onSelectDiscardCard).toHaveBeenCalledWith('neutralizer');
  });

  it('enables confirm in fiver combo once discard card is chosen', () => {
    const onConfirm = vi.fn();
    const selectedFiverCards: CriticalCard[] = [
      'strike',
      'evade',
      'trade',
      'reorder',
      'cancel',
    ];

    render(
      <ComboModal
        {...defaultProps}
        comboModal={{
          availableComboCards: [],
          selectedComboCard: null,
          fiverAvailable: true,
        }}
        selectedMode="fiver"
        selectedFiverCards={selectedFiverCards}
        selectedDiscardCard="neutralizer"
        discardPile={['neutralizer']}
        onConfirm={onConfirm}
      />,
    );

    const confirmBtn = screen.getByTestId('combo-confirm-button');
    expect(confirmBtn).not.toBeDisabled();
    fireEvent.click(confirmBtn);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('triggers onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<ComboModal {...defaultProps} onClose={onClose} />);

    const closeBtn = screen.getByTestId('combo-modal-close-button');
    expect(closeBtn).toBeDefined();
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders blind card picker with numbered badges and selection state matching board cards', () => {
    render(
      <ComboModal
        {...defaultProps}
        cardVariant="cyberpunk"
        selectedIndex={0}
      />,
    );

    const firstCard = screen.getByTestId('blind-card-0');
    expect(firstCard.getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByText('#1')).toBeDefined();
    expect(screen.getByText('#2')).toBeDefined();
    expect(screen.getByText('#3')).toBeDefined();
  });
});
