import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// ─── Mock server actions before importing components ──────────────────────────
vi.mock('../server/economy.actions', () => ({
  setEconomyValueAction: vi.fn(),
  resetEconomyValueAction: vi.fn(),
}));

import { EconomyEditDialog } from './EconomyEditDialog';
import {
  setEconomyValueAction,
  resetEconomyValueAction,
} from '../server/economy.actions';

const labels = {
  title: 'Edit {{key}}',
  currentLabel: 'Current',
  newValueLabel: 'New value',
  save: 'Save',
  cancel: 'Cancel',
  reset: 'Reset to default',
  errorInvalidValue: 'Value must be a positive integer up to 1,000,000.',
  errorGeneric: 'Could not save. Please retry.',
  errorForbidden: 'You do not have permission.',
  errorNotFound: 'Unknown setting.',
  toastSaved: 'Saved {{key}} = {{value}}.',
  toastReset: 'Reset {{key}} to default.',
};

function renderDialog(
  props: Partial<Parameters<typeof EconomyEditDialog>[0]> = {},
) {
  return render(
    <EconomyEditDialog
      open={true}
      onClose={vi.fn()}
      economyKey="game_win_coin_reward"
      currentValue={50}
      defaultValue={50}
      labels={labels}
      {...props}
    />,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('EconomyEditDialog', () => {
  it('renders when open=true', () => {
    renderDialog();
    expect(screen.getByTestId('economy-edit-dialog')).toBeTruthy();
  });

  it('does not render when open=false', () => {
    renderDialog({ open: false });
    expect(screen.queryByTestId('economy-edit-dialog')).toBeNull();
  });

  it('shows the key name in the title', () => {
    renderDialog({ economyKey: 'gem_to_coin_rate' });
    expect(screen.getByText(/gem_to_coin_rate/)).toBeTruthy();
  });

  it('shows current and default values', () => {
    renderDialog({ currentValue: 77, defaultValue: 50 });
    expect(screen.getByText('77')).toBeTruthy();
    expect(screen.getByText('50')).toBeTruthy();
  });

  it('shows input pre-filled with current value', () => {
    renderDialog({ currentValue: 77 });
    const input = screen.getByTestId('economy-value-input') as HTMLInputElement;
    expect(input.value).toBe('77');
  });

  it('shows validation error for empty/zero value on submit', async () => {
    renderDialog();

    const input = screen.getByTestId('economy-value-input');
    fireEvent.change(input, { target: { value: '0' } });
    // Submit via the form element directly
    fireEvent.submit(input.closest('form')!);

    await waitFor(() => {
      expect(screen.getByTestId('economy-validation-error')).toBeTruthy();
    });

    expect(
      screen.getByTestId('economy-validation-error').textContent,
    ).toContain('positive integer');
    expect(setEconomyValueAction).not.toHaveBeenCalled();
  });

  it('shows validation error for negative value', async () => {
    renderDialog();

    const input = screen.getByTestId('economy-value-input');
    fireEvent.change(input, { target: { value: '-5' } });
    fireEvent.submit(input.closest('form')!);

    await waitFor(() => {
      expect(screen.getByTestId('economy-validation-error')).toBeTruthy();
    });

    expect(setEconomyValueAction).not.toHaveBeenCalled();
  });

  it('calls setEconomyValueAction with valid integer and calls onSuccess', async () => {
    vi.mocked(setEconomyValueAction).mockResolvedValueOnce({
      ok: true,
      data: {
        key: 'game_win_coin_reward',
        currentValue: 100,
        defaultValue: 50,
        source: 'override',
        updatedAt: '2026-05-10T00:00:00Z',
        updatedByLabel: 'Alice',
      },
    });

    const onSuccess = vi.fn();
    renderDialog({ onSuccess });

    const input = screen.getByTestId('economy-value-input');
    fireEvent.change(input, { target: { value: '100' } });
    fireEvent.click(screen.getByTestId('economy-save-btn'));

    await waitFor(() => {
      expect(setEconomyValueAction).toHaveBeenCalledWith({
        key: 'game_win_coin_reward',
        value: 100,
      });
    });
  });

  it('shows server error on validation error from server', async () => {
    vi.mocked(setEconomyValueAction).mockResolvedValueOnce({
      ok: false,
      error: 'validation',
    });

    renderDialog();

    const input = screen.getByTestId('economy-value-input');
    fireEvent.change(input, { target: { value: '100' } });
    fireEvent.click(screen.getByTestId('economy-save-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('economy-validation-error')).toBeTruthy();
    });
  });

  it('shows server error on generic error', async () => {
    vi.mocked(setEconomyValueAction).mockResolvedValueOnce({
      ok: false,
      error: 'generic',
    });

    renderDialog();

    const input = screen.getByTestId('economy-value-input');
    fireEvent.change(input, { target: { value: '100' } });
    fireEvent.click(screen.getByTestId('economy-save-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('economy-server-error')).toBeTruthy();
    });
    expect(screen.getByTestId('economy-server-error').textContent).toContain(
      'Could not save',
    );
  });

  it('calls onClose when cancel is clicked', () => {
    const onClose = vi.fn();
    renderDialog({ onClose });
    fireEvent.click(screen.getByTestId('economy-cancel-btn'));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls resetEconomyValueAction when reset button is clicked', async () => {
    vi.mocked(resetEconomyValueAction).mockResolvedValueOnce({
      ok: true,
      data: { reset: true },
    });

    renderDialog();
    fireEvent.click(screen.getByTestId('economy-reset-btn'));

    await waitFor(() => {
      expect(resetEconomyValueAction).toHaveBeenCalledWith({
        key: 'game_win_coin_reward',
      });
    });
  });

  it('shows error on forbidden reset', async () => {
    vi.mocked(resetEconomyValueAction).mockResolvedValueOnce({
      ok: false,
      error: 'forbidden',
    });

    renderDialog();
    fireEvent.click(screen.getByTestId('economy-reset-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('economy-server-error')).toBeTruthy();
    });
    expect(screen.getByTestId('economy-server-error').textContent).toContain(
      'permission',
    );
  });
});
