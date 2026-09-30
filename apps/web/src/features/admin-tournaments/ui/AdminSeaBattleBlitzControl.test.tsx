import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdminSeaBattleBlitzControl } from './AdminSeaBattleBlitzControl';

const mockMutate = vi.fn();
let mockStatusData: { enabled: boolean } | null = { enabled: true };
let mockIsLoading = false;
let mockIsPending = false;

vi.mock('../hooks', () => ({
  useSeaBattleBlitzAdminStatus: () => ({
    data: mockStatusData,
    isLoading: mockIsLoading,
  }),
  useToggleSeaBattleBlitz: () => ({
    mutate: mockMutate,
    isPending: mockIsPending,
  }),
}));

describe('AdminSeaBattleBlitzControl', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStatusData = { enabled: true };
    mockIsLoading = false;
    mockIsPending = false;
  });

  it('renders title and active status pill when enabled', () => {
    render(<AdminSeaBattleBlitzControl />);

    expect(screen.getByText('Weekly Sea Battle Blitz Cup')).toBeDefined();
    const pill = screen.getByTestId('admin-blitz-status-pill');
    expect(pill.textContent).toContain('Active');
    const toggle = screen.getByTestId('admin-blitz-toggle');
    expect(toggle.getAttribute('aria-checked')).toBe('true');
  });

  it('renders paused status pill when disabled', () => {
    mockStatusData = { enabled: false };
    render(<AdminSeaBattleBlitzControl />);

    const pill = screen.getByTestId('admin-blitz-status-pill');
    expect(pill.textContent).toContain('Paused');
    const toggle = screen.getByTestId('admin-blitz-toggle');
    expect(toggle.getAttribute('aria-checked')).toBe('false');
  });

  it('triggers toggle mutation when clicked', () => {
    render(<AdminSeaBattleBlitzControl />);

    const toggle = screen.getByTestId('admin-blitz-toggle');
    fireEvent.click(toggle);

    expect(mockMutate).toHaveBeenCalledWith({ enabled: false });
  });

  it('disables toggle button when mutation is pending', () => {
    mockIsPending = true;
    render(<AdminSeaBattleBlitzControl />);

    const toggle = screen.getByTestId(
      'admin-blitz-toggle',
    ) as HTMLButtonElement;
    expect(toggle.disabled).toBe(true);
  });
});
