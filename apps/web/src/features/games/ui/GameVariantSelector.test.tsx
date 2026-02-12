import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ThemeProvider } from 'styled-components';
import { GameVariantSelector } from './GameVariantSelector';
import { gamesApi } from '../api';
import { getThemeTokens } from '@/shared/config/theme';

// Mock dependencies
vi.mock('../api', () => ({
  gamesApi: {
    updateRoomOptions: vi.fn(),
  },
}));

vi.mock('@/entities/session/model/useSessionTokens', () => ({
  useSessionTokens: () => ({
    snapshot: { accessToken: 'fake-token' },
  }),
}));

// Mock useMutation from @tanstack/react-query
vi.mock('@tanstack/react-query', () => ({
  useMutation: ({
    mutationFn,
  }: {
    mutationFn: (variables: unknown) => unknown;
  }) => ({
    mutate: (variables: unknown) => mutationFn(variables),
    isPending: false,
  }),
}));

const theme = getThemeTokens('dark');

const renderWithTheme = (component: React.ReactNode) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('GameVariantSelector', () => {
  const mockVariants = [
    { id: 'variant1', name: 'Variant 1' },
    { id: 'variant2', name: 'Variant 2' },
  ];

  it('renders correctly with a valid variant', () => {
    renderWithTheme(
      <GameVariantSelector
        roomId="room-123"
        currentVariant="variant1"
        variants={mockVariants}
      />,
    );

    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('variant1');
    expect(screen.getByText('Variant 1')).toBeInTheDocument();
  });

  it('renders unknown variant option when currentVariant is invalid', () => {
    renderWithTheme(
      <GameVariantSelector
        roomId="room-123"
        currentVariant="invalid-variant"
        variants={mockVariants}
      />,
    );

    // Check if the "invalid-variant" is somehow represented or if we have a fallback.
    // The desired behavior is to see "Unknown Variant".
    expect(screen.getByText(/Unknown Variant/i)).toBeInTheDocument();
  });

  it('allows changing variant when valid', () => {
    renderWithTheme(
      <GameVariantSelector
        roomId="room-123"
        currentVariant="variant1"
        variants={mockVariants}
      />,
    );

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'variant2' } });

    expect(gamesApi.updateRoomOptions).toHaveBeenCalledWith(
      'room-123',
      { variant: 'variant2' },
      expect.anything(),
    );
  });
});
