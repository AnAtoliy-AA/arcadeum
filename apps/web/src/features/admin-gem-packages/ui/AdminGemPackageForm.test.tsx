import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdminGemPackageForm } from './AdminGemPackageForm';
import type { GemPackageAdmin } from '../server/admin-gems.types';

const mockAction = vi.fn();

const samplePackage: GemPackageAdmin = {
  id: 'pkg-1',
  name: 'Starter Pack',
  gems: 100,
  bonusGems: 10,
  priceUsdCents: 999,
  displayOrder: 0,
  active: true,
  createdAt: '2026-05-10T00:00:00.000Z',
  updatedAt: '2026-05-10T00:00:00.000Z',
};

describe('AdminGemPackageForm', () => {
  it('renders all inputs in create mode', () => {
    render(
      <AdminGemPackageForm
        onSuccess={vi.fn()}
        onCancel={vi.fn()}
        submitAction={mockAction}
      />,
    );

    expect(screen.getByTestId('form-name')).toBeTruthy();
    expect(screen.getByTestId('form-gems')).toBeTruthy();
    expect(screen.getByTestId('form-bonusGems')).toBeTruthy();
    expect(screen.getByTestId('form-priceUsdDollars')).toBeTruthy();
    expect(screen.getByTestId('form-displayOrder')).toBeTruthy();
    expect(screen.getByTestId('form-active')).toBeTruthy();
    expect(screen.getByTestId('form-submit')).toBeTruthy();
    expect(screen.getByTestId('form-cancel')).toBeTruthy();
  });

  it('pre-fills fields when initial package provided', () => {
    render(
      <AdminGemPackageForm
        initial={samplePackage}
        onSuccess={vi.fn()}
        onCancel={vi.fn()}
        submitAction={mockAction}
      />,
    );

    expect((screen.getByTestId('form-name') as HTMLInputElement).value).toBe(
      'Starter Pack',
    );
    expect((screen.getByTestId('form-gems') as HTMLInputElement).value).toBe(
      '100',
    );
    expect(
      (screen.getByTestId('form-bonusGems') as HTMLInputElement).value,
    ).toBe('10');
    expect(
      (screen.getByTestId('form-priceUsdDollars') as HTMLInputElement).value,
    ).toBe('9.99');
    expect(
      (screen.getByTestId('form-active') as HTMLInputElement).checked,
    ).toBe(true);
  });

  it('shows validation errors when name is empty and submit clicked', async () => {
    render(
      <AdminGemPackageForm
        onSuccess={vi.fn()}
        onCancel={vi.fn()}
        submitAction={mockAction}
      />,
    );

    // Fill in valid gems and price to trigger only name error
    fireEvent.change(screen.getByTestId('form-gems'), {
      target: { value: '100' },
    });
    fireEvent.change(screen.getByTestId('form-priceUsdDollars'), {
      target: { value: '9.99' },
    });

    expect(screen.getByTestId('form-errors')).toBeTruthy();
    expect(screen.getByTestId('form-submit')).toBeDisabled();
  });

  it('submit button is disabled when form has client errors', () => {
    render(
      <AdminGemPackageForm
        onSuccess={vi.fn()}
        onCancel={vi.fn()}
        submitAction={mockAction}
      />,
    );

    // With empty name, should be disabled
    expect(screen.getByTestId('form-submit')).toBeDisabled();
  });

  it('calls submitAction with cents on submit', async () => {
    mockAction.mockResolvedValue({ ok: true, data: samplePackage });
    const onSuccess = vi.fn();

    render(
      <AdminGemPackageForm
        onSuccess={onSuccess}
        onCancel={vi.fn()}
        submitAction={mockAction}
      />,
    );

    fireEvent.change(screen.getByTestId('form-name'), {
      target: { value: 'Test Pack' },
    });
    fireEvent.change(screen.getByTestId('form-gems'), {
      target: { value: '200' },
    });
    fireEvent.change(screen.getByTestId('form-priceUsdDollars'), {
      target: { value: '4.99' },
    });

    fireEvent.click(screen.getByTestId('form-submit'));

    await waitFor(() => {
      expect(mockAction).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Pack',
          gems: 200,
          priceUsdCents: 499,
        }),
      );
    });
  });

  it('calls onSuccess after successful submit', async () => {
    mockAction.mockResolvedValue({ ok: true, data: samplePackage });
    const onSuccess = vi.fn();

    render(
      <AdminGemPackageForm
        onSuccess={onSuccess}
        onCancel={vi.fn()}
        submitAction={mockAction}
      />,
    );

    fireEvent.change(screen.getByTestId('form-name'), {
      target: { value: 'Pack' },
    });
    fireEvent.change(screen.getByTestId('form-gems'), {
      target: { value: '50' },
    });
    fireEvent.change(screen.getByTestId('form-priceUsdDollars'), {
      target: { value: '1.99' },
    });

    fireEvent.click(screen.getByTestId('form-submit'));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(samplePackage);
    });
  });

  it('shows server error on failed submit', async () => {
    mockAction.mockResolvedValue({ ok: false, error: 'generic' });

    render(
      <AdminGemPackageForm
        onSuccess={vi.fn()}
        onCancel={vi.fn()}
        submitAction={mockAction}
      />,
    );

    fireEvent.change(screen.getByTestId('form-name'), {
      target: { value: 'Pack' },
    });
    fireEvent.change(screen.getByTestId('form-gems'), {
      target: { value: '50' },
    });
    fireEvent.change(screen.getByTestId('form-priceUsdDollars'), {
      target: { value: '1.99' },
    });

    fireEvent.click(screen.getByTestId('form-submit'));

    await waitFor(() => {
      expect(screen.getByTestId('server-error')).toBeTruthy();
    });
  });

  it('calls onCancel when cancel button clicked', () => {
    const onCancel = vi.fn();

    render(
      <AdminGemPackageForm
        onSuccess={vi.fn()}
        onCancel={onCancel}
        submitAction={mockAction}
      />,
    );

    fireEvent.click(screen.getByTestId('form-cancel'));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('converts dollars to cents correctly: $9.99 → 999 cents', async () => {
    mockAction.mockResolvedValue({ ok: true, data: samplePackage });

    render(
      <AdminGemPackageForm
        onSuccess={vi.fn()}
        onCancel={vi.fn()}
        submitAction={mockAction}
      />,
    );

    fireEvent.change(screen.getByTestId('form-name'), {
      target: { value: 'Pack' },
    });
    fireEvent.change(screen.getByTestId('form-gems'), {
      target: { value: '100' },
    });
    fireEvent.change(screen.getByTestId('form-priceUsdDollars'), {
      target: { value: '9.99' },
    });

    fireEvent.click(screen.getByTestId('form-submit'));

    await waitFor(() => {
      expect(mockAction).toHaveBeenCalledWith(
        expect.objectContaining({ priceUsdCents: 999 }),
      );
    });
  });
});
