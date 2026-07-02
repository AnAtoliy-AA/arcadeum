import { render as rtlRender, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TamaguiProvider } from 'tamagui';
import { GameVariantSelector } from './GameVariantSelector';
import { LanguageProvider } from '@/app/i18n/LanguageProvider';
import { config } from '@/shared/config/tamagui.config';

const mockEmit = vi.fn();
vi.mock('@/shared/lib/socket', () => ({
  gameSocket: { emit: (...args: unknown[]) => mockEmit(...args) },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => '/en',
  useSearchParams: () => new URLSearchParams(),
}));

interface MockSelectProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options?: { label: string; value: string; disabled?: boolean }[];
  disabled?: boolean;
  'aria-label'?: string;
  id?: string;
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
}));

const render = (ui: React.ReactElement) => {
  return rtlRender(
    <LanguageProvider locale="en">
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
        hostId="host-1"
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
        hostId="host-1"
        currentVariant="invalid-variant"
        variants={mockVariants}
      />,
    );

    expect(screen.getByText(/Unknown Variant/i)).toBeInTheDocument();
  });

  it('emits games.room.set_option when variant changes', () => {
    render(
      <GameVariantSelector
        roomId="room-123"
        hostId="host-1"
        currentVariant="variant1"
        variants={mockVariants}
      />,
    );

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'variant2' } });

    expect(mockEmit).toHaveBeenCalledWith('games.room.set_option', {
      roomId: 'room-123',
      userId: 'host-1',
      options: { variant: 'variant2' },
    });
  });
});
