import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ConvertGemsForm } from './ConvertGemsForm';

const mockConvertAction = vi.fn();
vi.mock('../server/gems.actions', () => ({
  convertGemsAction: (...args: unknown[]) => mockConvertAction(...args),
}));

const mockRouterRefresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mockRouterRefresh }),
}));

// Mock crypto.randomUUID
const mockUUID = '550e8400-e29b-41d4-a716-446655440000';
vi.stubGlobal('crypto', {
  randomUUID: () => mockUUID,
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ConvertGemsForm', () => {
  it('renders with rate and currentGems info', () => {
    render(<ConvertGemsForm rate={100} currentGems={50} />);
    expect(screen.getByTestId('convert-gems-form')).toBeTruthy();
    expect(screen.getByTestId('gems-input')).toBeTruthy();
  });

  it('shows coins preview with correct math: gems=5, rate=100 → coins=500', () => {
    render(<ConvertGemsForm rate={100} currentGems={50} />);

    fireEvent.change(screen.getByTestId('gems-input'), {
      target: { value: '5' },
    });

    const preview = screen.getByTestId('coins-preview');
    expect(preview.textContent).toContain('500');
  });

  it('shows coins preview: gems=10, rate=250 → coins=2500', () => {
    render(<ConvertGemsForm rate={250} currentGems={100} />);

    fireEvent.change(screen.getByTestId('gems-input'), {
      target: { value: '10' },
    });

    const preview = screen.getByTestId('coins-preview');
    expect(preview.textContent).toContain('2,500');
  });

  it('calls convertGemsAction with gems and a v4-style UUID on submit', async () => {
    mockConvertAction.mockResolvedValue({
      ok: true,
      data: {
        gemsDebited: 5,
        coinsCredited: 500,
        newBalance: { coins: 500, gems: 45 },
        rate: 100,
      },
    });

    render(<ConvertGemsForm rate={100} currentGems={50} />);
    fireEvent.change(screen.getByTestId('gems-input'), {
      target: { value: '5' },
    });
    fireEvent.click(screen.getByTestId('convert-submit'));

    await waitFor(() => {
      expect(mockConvertAction).toHaveBeenCalledWith({
        gems: 5,
        conversionId: mockUUID,
      });
    });
  });

  it('shows success message and calls router.refresh on success', async () => {
    mockConvertAction.mockResolvedValue({
      ok: true,
      data: {
        gemsDebited: 5,
        coinsCredited: 500,
        newBalance: { coins: 500, gems: 45 },
        rate: 100,
      },
    });

    render(<ConvertGemsForm rate={100} currentGems={50} />);
    fireEvent.change(screen.getByTestId('gems-input'), {
      target: { value: '5' },
    });
    fireEvent.click(screen.getByTestId('convert-submit'));

    await waitFor(() => {
      expect(screen.getByTestId('convert-success').textContent).toContain(
        'Converted 5 gems to 500 coins',
      );
      expect(mockRouterRefresh).toHaveBeenCalledOnce();
    });
  });

  it('shows insufficient inline error when error is insufficient', async () => {
    mockConvertAction.mockResolvedValue({ ok: false, error: 'insufficient' });

    render(<ConvertGemsForm rate={100} currentGems={50} />);
    fireEvent.change(screen.getByTestId('gems-input'), {
      target: { value: '5' },
    });
    fireEvent.click(screen.getByTestId('convert-submit'));

    await waitFor(() => {
      expect(screen.getByTestId('convert-error').textContent).toContain(
        'Not enough gems',
      );
    });
  });

  it('shows inline error when currentGems is less than input', async () => {
    render(<ConvertGemsForm rate={100} currentGems={3} />);

    fireEvent.change(screen.getByTestId('gems-input'), {
      target: { value: '10' },
    });
    fireEvent.click(screen.getByTestId('convert-submit'));

    // Client-side validation fires before calling action
    expect(screen.getByTestId('convert-error').textContent).toContain(
      'Not enough gems',
    );
    expect(mockConvertAction).not.toHaveBeenCalled();
  });

  it('shows invalid error on invalid input', async () => {
    mockConvertAction.mockResolvedValue({ ok: false, error: 'invalid' });

    render(<ConvertGemsForm rate={100} currentGems={50} />);
    fireEvent.change(screen.getByTestId('gems-input'), {
      target: { value: '5' },
    });
    fireEvent.click(screen.getByTestId('convert-submit'));

    await waitFor(() => {
      expect(screen.getByTestId('convert-error').textContent).toContain(
        'Invalid amount',
      );
    });
  });

  it('shows "Buy more gems" link when insufficient error shown', async () => {
    mockConvertAction.mockResolvedValue({ ok: false, error: 'insufficient' });

    render(<ConvertGemsForm rate={100} currentGems={50} />);
    fireEvent.change(screen.getByTestId('gems-input'), {
      target: { value: '5' },
    });
    fireEvent.click(screen.getByTestId('convert-submit'));

    await waitFor(() => {
      const errorEl = screen.getByTestId('convert-error');
      expect(errorEl.textContent).toContain('Buy more gems');
    });
  });
});
