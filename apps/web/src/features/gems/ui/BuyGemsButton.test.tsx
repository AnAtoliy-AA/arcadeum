import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BuyGemsButton } from './BuyGemsButton';

// Mock the server action
const mockBuyGemsAction = vi.fn();
vi.mock('../server/gems.actions', () => ({
  buyGemsAction: (...args: unknown[]) => mockBuyGemsAction(...args),
}));

// Mock window.location.href assignment
const locationMock = { href: '' };
Object.defineProperty(window, 'location', {
  value: locationMock,
  writable: true,
});

// Mock alert
const alertMock = vi.fn();
window.alert = alertMock;

beforeEach(() => {
  vi.clearAllMocks();
  locationMock.href = '';
});

describe('BuyGemsButton', () => {
  it('renders with default label', () => {
    render(<BuyGemsButton packageId="pkg-1" />);
    expect(screen.getByTestId('buy-gems-btn-pkg-1').textContent).toBe(
      'Buy with PayPal',
    );
  });

  it('renders with custom label', () => {
    render(<BuyGemsButton packageId="pkg-1" label="Purchase" />);
    expect(screen.getByTestId('buy-gems-btn-pkg-1').textContent).toBe(
      'Purchase',
    );
  });

  it('calls buyGemsAction with correct packageId on click', async () => {
    mockBuyGemsAction.mockResolvedValue({
      ok: true,
      approveUrl: 'https://paypal.com/approve/PP-123',
      paypalOrderId: 'PP-123',
    });

    render(<BuyGemsButton packageId="pkg-1" />);
    fireEvent.click(screen.getByTestId('buy-gems-btn-pkg-1'));

    await waitFor(() => {
      expect(mockBuyGemsAction).toHaveBeenCalledWith({ packageId: 'pkg-1' });
    });
  });

  it('redirects to approveUrl on success', async () => {
    mockBuyGemsAction.mockResolvedValue({
      ok: true,
      approveUrl: 'https://paypal.com/approve/PP-123',
      paypalOrderId: 'PP-123',
    });

    render(<BuyGemsButton packageId="pkg-1" />);
    fireEvent.click(screen.getByTestId('buy-gems-btn-pkg-1'));

    await waitFor(() => {
      expect(locationMock.href).toBe('https://paypal.com/approve/PP-123');
    });
  });

  it('shows alert on error', async () => {
    mockBuyGemsAction.mockResolvedValue({
      ok: false,
      error: 'unavailable',
    });

    render(<BuyGemsButton packageId="pkg-1" />);
    fireEvent.click(screen.getByTestId('buy-gems-btn-pkg-1'));

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith(
        'PayPal is unavailable. Please try again later.',
      );
    });
  });

  it('shows not_found error message', async () => {
    mockBuyGemsAction.mockResolvedValue({ ok: false, error: 'not_found' });

    render(<BuyGemsButton packageId="pkg-1" />);
    fireEvent.click(screen.getByTestId('buy-gems-btn-pkg-1'));

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Package not found.');
    });
  });

  it('redirects to /auth when not authenticated, without calling the action', async () => {
    render(<BuyGemsButton packageId="pkg-1" isAuthenticated={false} />);
    fireEvent.click(screen.getByTestId('buy-gems-btn-pkg-1'));

    await waitFor(() => {
      expect(locationMock.href).toBe('/auth');
    });
    expect(mockBuyGemsAction).not.toHaveBeenCalled();
  });

  it('redirects to /auth when the action returns unauthorized', async () => {
    mockBuyGemsAction.mockResolvedValue({ ok: false, error: 'unauthorized' });

    render(<BuyGemsButton packageId="pkg-1" />);
    fireEvent.click(screen.getByTestId('buy-gems-btn-pkg-1'));

    await waitFor(() => {
      expect(locationMock.href).toBe('/auth');
    });
    expect(alertMock).not.toHaveBeenCalled();
  });
});
