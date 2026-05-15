import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VerifyGemPurchaseButton } from './VerifyGemPurchaseButton';

const mockFinalize = vi.fn();
vi.mock('../server/gems.actions', () => ({
  finalizeGemPurchaseAction: (...args: unknown[]) => mockFinalize(...args),
}));

const mockRouterRefresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mockRouterRefresh }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('VerifyGemPurchaseButton', () => {
  it('renders verify button', () => {
    render(<VerifyGemPurchaseButton orderId="PP-123" />);
    expect(screen.getByTestId('verify-btn-PP-123')).toBeTruthy();
    expect(screen.getByTestId('verify-btn-PP-123').textContent).toBe('Verify');
  });

  it('calls finalizeGemPurchaseAction with orderId on click', async () => {
    mockFinalize.mockResolvedValue({
      ok: true,
      gemsCredited: 100,
      newBalance: { coins: 0, gems: 100 },
    });

    render(<VerifyGemPurchaseButton orderId="PP-123" />);
    fireEvent.click(screen.getByTestId('verify-btn-PP-123'));

    await waitFor(() => {
      expect(mockFinalize).toHaveBeenCalledWith({ orderId: 'PP-123' });
    });
  });

  it('shows success message and calls router.refresh on success', async () => {
    mockFinalize.mockResolvedValue({
      ok: true,
      gemsCredited: 100,
      newBalance: { coins: 0, gems: 100 },
    });

    render(<VerifyGemPurchaseButton orderId="PP-123" />);
    fireEvent.click(screen.getByTestId('verify-btn-PP-123'));

    await waitFor(() => {
      expect(screen.getByTestId('verify-success-PP-123').textContent).toBe(
        '+100 gems credited',
      );
      expect(mockRouterRefresh).toHaveBeenCalledOnce();
    });
  });

  it('shows inline error on not_captured', async () => {
    mockFinalize.mockResolvedValue({
      ok: false,
      error: 'not_captured',
    });

    render(<VerifyGemPurchaseButton orderId="PP-123" />);
    fireEvent.click(screen.getByTestId('verify-btn-PP-123'));

    await waitFor(() => {
      expect(screen.getByTestId('verify-error-PP-123')).toBeTruthy();
      expect(screen.getByTestId('verify-error-PP-123').textContent).toContain(
        'not captured',
      );
    });
  });

  it('shows inline error on generic failure', async () => {
    mockFinalize.mockResolvedValue({
      ok: false,
      error: 'generic',
    });

    render(<VerifyGemPurchaseButton orderId="PP-456" />);
    fireEvent.click(screen.getByTestId('verify-btn-PP-456'));

    await waitFor(() => {
      expect(screen.getByTestId('verify-error-PP-456')).toBeTruthy();
      expect(mockRouterRefresh).not.toHaveBeenCalled();
    });
  });

  it('shows "already credited" message when gemsCredited is 0 (idempotent)', async () => {
    mockFinalize.mockResolvedValue({
      ok: true,
      gemsCredited: 0,
      newBalance: { coins: 0, gems: 50 },
    });

    render(<VerifyGemPurchaseButton orderId="PP-789" />);
    fireEvent.click(screen.getByTestId('verify-btn-PP-789'));

    await waitFor(() => {
      expect(screen.getByTestId('verify-success-PP-789').textContent).toBe(
        'Purchase already credited',
      );
      expect(mockRouterRefresh).toHaveBeenCalledOnce();
    });
  });
});
