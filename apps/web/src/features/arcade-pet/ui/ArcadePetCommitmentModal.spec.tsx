import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ArcadePetCommitmentModal } from './ArcadePetCommitmentModal';

describe('ArcadePetCommitmentModal', () => {
  it('renders modal with title, pledge checkbox, and disabled adopt button initially', () => {
    render(
      <ArcadePetCommitmentModal
        open={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );

    expect(
      screen.getByTestId('arcade-pet-commitment-modal'),
    ).toBeInTheDocument();
    expect(screen.getByText('Adopt Your First Companion')).toBeInTheDocument();
    expect(screen.getByTestId('care-commitment-checkbox')).not.toBeChecked();

    const adoptBtn = screen.getByTestId('confirm-adopt-pet-btn');
    expect(adoptBtn).toBeDisabled();
  });

  it('enables adopt button when checking commitment checkbox and triggers onConfirm', () => {
    const handleConfirm = vi.fn();
    const handleClose = vi.fn();

    render(
      <ArcadePetCommitmentModal
        open={true}
        onClose={handleClose}
        onConfirm={handleConfirm}
      />,
    );

    const checkbox = screen.getByTestId('care-commitment-checkbox');
    const adoptBtn = screen.getByTestId('confirm-adopt-pet-btn');

    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
    expect(adoptBtn).not.toBeDisabled();

    fireEvent.click(adoptBtn);
    expect(handleConfirm).toHaveBeenCalledTimes(1);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when clicking cancel button', () => {
    const handleClose = vi.fn();

    render(
      <ArcadePetCommitmentModal
        open={true}
        onClose={handleClose}
        onConfirm={vi.fn()}
      />,
    );

    const cancelBtn = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
