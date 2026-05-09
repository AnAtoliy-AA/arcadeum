import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TamaguiProvider } from 'tamagui';
import config from '@/shared/config/tamagui.config';
import {
  AdminTournamentForm,
  type AdminTournamentFormLabels,
} from './AdminTournamentForm';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <TamaguiProvider config={config} defaultTheme="dark">
    {children}
  </TamaguiProvider>
);

const labels: AdminTournamentFormLabels = {
  sections: { settings: 'Settings', content: 'Content' },
  gameType: 'Game type',
  gameTypeLabels: { critical_v1: 'Critical', sea_battle_v1: 'Sea Battle' },
  scheduledAt: 'Scheduled at',
  registrationOpensAt: 'Registration opens',
  registrationClosesAt: 'Registration closes',
  optional: 'optional',
  maxPlayers: 'Max players',
  prizeDescription: 'Prize',
  entryFeeLabel: 'Entry fee (coins)',
  prizePoolLabel: 'Prize pool (coins)',
  tabs: { en: 'EN', ru: 'RU', es: 'ES', fr: 'FR', by: 'BY' },
  name: 'Name',
  description: 'Description',
  errors: {
    nameRequired: 'English name is required.',
    capacityRange: 'Capacity must be between 2 and 256.',
    windowOrder: 'Registration close time must be after open time.',
  },
  cancel: 'Cancel',
  save: 'Save',
};

const renderForm = (onSubmit = vi.fn()) =>
  render(
    <Wrapper>
      <AdminTournamentForm
        onSubmit={onSubmit}
        onCancel={() => undefined}
        labels={labels}
      />
    </Wrapper>,
  );

describe('AdminTournamentForm – entry fee & prize pool', () => {
  it('renders entry fee and prize pool inputs with default 0', () => {
    renderForm();
    const feeInput = screen.getByTestId('form-entryFeeCoins');
    const prizeInput = screen.getByTestId('form-prizePoolCoins');
    expect(feeInput).toBeInTheDocument();
    expect(prizeInput).toBeInTheDocument();
    expect((feeInput as HTMLInputElement).value).toBe('0');
    expect((prizeInput as HTMLInputElement).value).toBe('0');
  });

  it('submits with entryFeeCoins and prizePoolCoins when form is valid', () => {
    const onSubmit = vi.fn();
    renderForm(onSubmit);

    // Fill required EN name so form is valid
    fireEvent.change(screen.getByTestId('form-name-en'), {
      target: { value: 'My Tournament' },
    });
    // Set entry fee
    fireEvent.change(screen.getByTestId('form-entryFeeCoins'), {
      target: { value: '50' },
    });
    // Set prize pool
    fireEvent.change(screen.getByTestId('form-prizePoolCoins'), {
      target: { value: '200' },
    });

    fireEvent.click(screen.getByTestId('form-submit'));

    expect(onSubmit).toHaveBeenCalledOnce();
    const body = onSubmit.mock.calls[0][0];
    expect(body.entryFeeCoins).toBe(50);
    expect(body.prizePoolCoins).toBe(200);
  });

  it('initialises inputs from initial tournament data', () => {
    const initial = {
      id: 't1',
      status: 'scheduled' as const,
      gameType: 'critical_v1' as const,
      scheduledAt: '2026-06-01T12:00:00Z',
      registrationOpensAt: null,
      registrationClosesAt: null,
      maxPlayers: 32,
      prizeDescription: null,
      resultText: null,
      entryFeeCoins: 100,
      prizePoolCoins: 500,
      winnerUserId: null,
      content: { en: { name: 'Existing' } },
      registeredCount: 0,
      waitlistCount: 0,
      createdBy: null,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    };
    render(
      <Wrapper>
        <AdminTournamentForm
          initial={initial}
          onSubmit={() => undefined}
          onCancel={() => undefined}
          labels={labels}
        />
      </Wrapper>,
    );
    expect(
      (screen.getByTestId('form-entryFeeCoins') as HTMLInputElement).value,
    ).toBe('100');
    expect(
      (screen.getByTestId('form-prizePoolCoins') as HTMLInputElement).value,
    ).toBe('500');
  });
});
