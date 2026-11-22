import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { mockUseTranslation } from '../test/mock-translation';
import { ArcadePetCollectionList } from './ArcadePetCollectionList';

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => mockUseTranslation(),
}));

describe('ArcadePetCollectionList', () => {
  it('shows an empty state when there are no pets', () => {
    render(
      <ArcadePetCollectionList
        pets={[]}
        activePetId={null}
        onSelectPet={vi.fn()}
      />,
    );
    expect(screen.getByTestId('pet-collection-empty')).toHaveTextContent(
      'No pets yet',
    );
  });
});
