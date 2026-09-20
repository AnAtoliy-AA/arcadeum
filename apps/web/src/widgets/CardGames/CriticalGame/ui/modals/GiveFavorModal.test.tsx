import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import GiveFavorModal from './GiveFavorModal';
import type { CriticalCard } from '../../types';

describe('GiveFavorModal', () => {
  const defaultCards: CriticalCard[] = [
    'neutralizer',
    'evade',
    'collection_alpha',
  ];

  const defaultProps = {
    isOpen: true,
    requesterName: 'Bot 1',
    myHand: defaultCards,
    onGiveCard: vi.fn(),
    onCancel: vi.fn(),
    t: (key: string, params?: Record<string, string | number>) => {
      if (params?.player) return `${params.player} requested a favor`;
      return key;
    },
    cardVariant: 'adventure',
  };

  it('does not render when isOpen is false', () => {
    render(<GiveFavorModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByTestId('give-favor-modal')).not.toBeInTheDocument();
  });

  it('renders modal with title, requester message, and hand cards', () => {
    render(<GiveFavorModal {...defaultProps} />);
    expect(screen.getByTestId('give-favor-modal')).toBeInTheDocument();
    expect(screen.getByText(/Bot 1 requested a favor/i)).toBeInTheDocument();
    expect(screen.getByTestId('give-favor-card-0')).toBeInTheDocument();
    expect(screen.getByTestId('give-favor-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('give-favor-card-2')).toBeInTheDocument();
  });

  it('disables give card button until a card is selected', () => {
    const onGiveCard = vi.fn();
    render(<GiveFavorModal {...defaultProps} onGiveCard={onGiveCard} />);
    const confirmButton = screen.getByTestId('give-favor-confirm');
    expect(confirmButton).toBeDisabled();

    fireEvent.click(screen.getByTestId('give-favor-card-1'));
    expect(confirmButton).not.toBeDisabled();

    fireEvent.click(confirmButton);
    expect(onGiveCard).toHaveBeenCalledTimes(1);
    expect(onGiveCard).toHaveBeenCalledWith('evade');
  });

  it('calls onCancel when clicking cancel button', () => {
    const onCancel = vi.fn();
    render(<GiveFavorModal {...defaultProps} onCancel={onCancel} />);
    fireEvent.click(screen.getByTestId('give-favor-cancel'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when clicking close button in header', () => {
    const onCancel = vi.fn();
    render(<GiveFavorModal {...defaultProps} onCancel={onCancel} />);
    fireEvent.click(screen.getByTestId('modal-close-button'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
