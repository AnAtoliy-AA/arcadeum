import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { PetGiftPresent } from '../lib/arcade-pet-economy';
import { mockUseTranslation } from '../test/mock-translation';
import { ArcadePetPresentsList } from './ArcadePetPresentsList';

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => mockUseTranslation(),
}));

const present = (over: Partial<PetGiftPresent> = {}): PetGiftPresent => ({
  id: 'p1',
  senderId: 'u2',
  senderName: 'Ann',
  species: 'dragon',
  theme: 'fantasy',
  petName: 'Ember',
  message: 'Enjoy',
  isOpened: false,
  createdAt: 1,
  ...over,
});

describe('ArcadePetPresentsList', () => {
  it('shows a loading skeleton while syncing with nothing cached', () => {
    render(
      <ArcadePetPresentsList
        presents={[]}
        syncStatus="syncing"
        onRetry={vi.fn()}
        onClaim={vi.fn()}
      />,
    );
    expect(screen.getByTestId('presents-loading')).toHaveAttribute(
      'aria-label',
      'Loading your presents...',
    );
  });

  it('shows an error with retry when the sync failed', () => {
    const onRetry = vi.fn();
    render(
      <ArcadePetPresentsList
        presents={[]}
        syncStatus="error"
        onRetry={onRetry}
        onClaim={vi.fn()}
      />,
    );
    expect(screen.getByTestId('presents-error')).toHaveTextContent(
      'Could not load your presents.',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('shows the empty state when idle with no presents', () => {
    render(
      <ArcadePetPresentsList
        presents={[]}
        syncStatus="synced"
        onRetry={vi.fn()}
        onClaim={vi.fn()}
      />,
    );
    expect(screen.getByTestId('presents-empty')).toBeInTheDocument();
  });

  it('keeps showing cached presents even when the sync failed', () => {
    render(
      <ArcadePetPresentsList
        presents={[present()]}
        syncStatus="error"
        onRetry={vi.fn()}
        onClaim={vi.fn()}
      />,
    );
    expect(screen.getByTestId('present-item-p1')).toBeInTheDocument();
    expect(screen.queryByTestId('presents-error')).toBeNull();
  });

  it('claims an unopened present', () => {
    const onClaim = vi.fn();
    render(
      <ArcadePetPresentsList
        presents={[present()]}
        syncStatus="synced"
        onRetry={vi.fn()}
        onClaim={onClaim}
      />,
    );
    fireEvent.click(screen.getByTestId('claim-present-p1'));
    expect(onClaim).toHaveBeenCalledWith('p1');
  });
});
