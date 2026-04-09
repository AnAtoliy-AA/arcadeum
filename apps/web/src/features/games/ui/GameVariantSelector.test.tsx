import { render as rtlRender, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TamaguiProvider } from 'tamagui';
import { GameVariantSelector } from './GameVariantSelector';
import { gamesApi } from '../api';
import { LanguageProvider } from '@/app/i18n/LanguageProvider';
import config from '@/shared/config/tamagui.config';

// Mock dependencies
vi.mock('../api', () => ({
  gamesApi: {
    updateRoomOptions: vi.fn(),
  },
}));

interface MockSelectProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options?: { label: string; value: string; disabled?: boolean }[];
  disabled?: boolean;
  'aria-label'?: string;
  id?: string;
}

interface MockButtonProps {
  children?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

vi.mock('@arcadeum/ui', () => ({
  Select: ({
    value,
    onChange,
    options,
    disabled,
    'aria-label': ariaLabel,
    id,
  }: MockSelectProps) => (
    <select
      id={id}
      value={value}
      onChange={onChange}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {options?.map((opt) => (
        <option key={opt.value} value={opt.value} disabled={opt.disabled}>
          {opt.label}
        </option>
      ))}
    </select>
  ),
  Button: ({ children, onClick, disabled }: MockButtonProps) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

vi.mock('@/entities/session/model/useSessionTokens', () => ({
  useSessionTokens: () => ({
    snapshot: { accessToken: 'fake-token' },
  }),
}));

// Mock custom useMutation hook
vi.mock('@/shared/hooks/useMutation', () => ({
  useMutation: ({
    mutationFn,
  }: {
    mutationFn: (variables: unknown) => Promise<unknown>;
  }) => ({
    mutate: (variables: unknown) => mutationFn(variables),
    mutateAsync: (variables: unknown) => mutationFn(variables),
    isLoading: false,
    isPending: false,
    error: null,
    data: null,
    isSuccess: false,
    isError: false,
    reset: vi.fn(),
  }),
}));

const render = (ui: React.ReactElement) => {
  return rtlRender(
    <LanguageProvider>
      <TamaguiProvider config={config} defaultTheme="dark">
        {ui}
      </TamaguiProvider>
    </LanguageProvider>,
  );
};

describe('GameVariantSelector', () => {
  const mockVariants = [
    { id: 'variant1', name: 'Variant 1' },
    { id: 'variant2', name: 'Variant 2' },
  ];

  it('renders correctly with a valid variant', () => {
    render(
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
    render(
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
    render(
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
