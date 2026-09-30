import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { AdminSeaBattleBlitzControl } from './AdminSeaBattleBlitzControl';

const mockMutate = vi.fn();
const mockMutateAsync = vi.fn().mockResolvedValue({ ok: true });
let mockStatusData: {
  enabled: boolean;
  prizePoolCoins: number;
  prizeDescription: string;
} | null = {
  enabled: true,
  prizePoolCoins: 500,
  prizeDescription: '500 Coins + Admiral Trophy',
};
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
  useUpdateSeaBattleBlitzConfig: () => ({
    mutateAsync: mockMutateAsync,
    isPending: mockIsPending,
  }),
}));

describe('AdminSeaBattleBlitzControl', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStatusData = {
      enabled: true,
      prizePoolCoins: 500,
      prizeDescription: '500 Coins + Admiral Trophy',
    };
    mockIsLoading = false;
    mockIsPending = false;
  });

  it('renders title, active status pill, and prizes when enabled', () => {
    render(<AdminSeaBattleBlitzControl />);

    expect(screen.getByText('Weekly Sea Battle Blitz Cup')).toBeDefined();
    const pill = screen.getByTestId('admin-blitz-status-pill');
    expect(pill.textContent).toContain('Active');
    const toggle = screen.getByTestId('admin-blitz-toggle');
    expect(toggle.getAttribute('aria-checked')).toBe('true');
    expect(screen.getByTestId('admin-blitz-prize-pool').textContent).toContain(
      '500 Coins',
    );
    expect(screen.getByTestId('admin-blitz-prize-desc').textContent).toContain(
      '500 Coins + Admiral Trophy',
    );
  });

  it('renders paused status pill when disabled', () => {
    mockStatusData = {
      enabled: false,
      prizePoolCoins: 500,
      prizeDescription: '500 Coins + Admiral Trophy',
    };
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

  it('allows editing and saving prizes', async () => {
    render(<AdminSeaBattleBlitzControl />);

    const editBtn = screen.getByTestId('admin-blitz-edit-prizes');
    fireEvent.click(editBtn);

    const coinsInput = screen.getByTestId(
      'admin-blitz-coins-input',
    ) as HTMLInputElement;
    const descInput = screen.getByTestId(
      'admin-blitz-desc-input',
    ) as HTMLInputElement;

    expect(coinsInput.value).toBe('500');
    expect(descInput.value).toBe('500 Coins + Admiral Trophy');

    fireEvent.change(coinsInput, { target: { value: '1000' } });
    fireEvent.change(descInput, {
      target: { value: '1000 Coins + Grand Fleet' },
    });

    const saveBtn = screen.getByTestId('admin-blitz-save-prizes');
    await act(async () => {
      fireEvent.click(saveBtn);
    });

    expect(mockMutateAsync).toHaveBeenCalledWith({
      prizePoolCoins: 1000,
      prizeDescription: '1000 Coins + Grand Fleet',
    });
  });

  it('cancels editing without saving', () => {
    render(<AdminSeaBattleBlitzControl />);

    const editBtn = screen.getByTestId('admin-blitz-edit-prizes');
    fireEvent.click(editBtn);

    expect(screen.getByTestId('admin-blitz-edit-section')).toBeDefined();

    const cancelBtn = screen.getByTestId('admin-blitz-cancel-prizes');
    fireEvent.click(cancelBtn);

    expect(screen.queryByTestId('admin-blitz-edit-section')).toBeNull();
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });
});
