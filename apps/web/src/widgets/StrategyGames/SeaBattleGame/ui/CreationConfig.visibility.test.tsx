import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  render,
  screen,
  waitFor,
  fireEvent,
  within,
} from '@testing-library/react';
import CreationConfig from './CreationConfig';
import { gamesApi } from '@/features/games/api';

vi.mock('@/features/games/api', () => ({
  gamesApi: { getCatalog: vi.fn() },
}));
vi.mock('@/shared/lib/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

function renderConfig() {
  return render(
    <CreationConfig
      options={{ variant: 'cyberpunk' } as never}
      onChange={vi.fn()}
    />,
  );
}

describe('Sea Battle CreationConfig — variant visibility filter', () => {
  it('hides variants not present in /games/catalog', async () => {
    vi.mocked(gamesApi.getCatalog).mockResolvedValueOnce({
      games: [
        {
          gameId: 'sea_battle_v1',
          comingSoon: false,
          variants: [
            { id: 'cyberpunk', comingSoon: false },
            { id: 'fantasy', comingSoon: false },
          ],
          rules: [],
        },
      ],
    });

    renderConfig();

    await waitFor(() => {
      expect(screen.queryByText(/games\.themes\.underwater\.name/)).toBeNull();
    });
    expect(
      screen.getAllByText(/games\.themes\.cyberpunk\.name/).length,
    ).toBeGreaterThanOrEqual(1);
  });

  it('renders the full list when the catalog fetch fails (silent failure)', async () => {
    vi.mocked(gamesApi.getCatalog).mockRejectedValueOnce(new Error('offline'));

    renderConfig();

    await waitFor(() => {
      expect(
        screen.getByText(/games\.themes\.underwater\.name/),
      ).toBeInTheDocument();
    });
  });

  it('renders a coming-soon variant as a disabled tile with a "Coming soon" badge', async () => {
    const onChangeSpy = vi.fn();

    vi.mocked(gamesApi.getCatalog).mockResolvedValue({
      games: [
        {
          gameId: 'sea_battle_v1',
          comingSoon: false,
          variants: [
            { id: 'cyberpunk', comingSoon: false },
            { id: 'underwater', comingSoon: true },
          ],
          rules: [],
        },
      ],
    });

    render(
      <CreationConfig
        options={{ variant: 'cyberpunk' } as never}
        onChange={onChangeSpy}
      />,
    );

    await waitFor(() => {
      expect(
        screen.getAllByTestId('theme-cyberpunk').length,
      ).toBeGreaterThanOrEqual(1);
    });

    const cyberpunkTile = screen.getAllByTestId('theme-cyberpunk')[0];
    expect(cyberpunkTile).not.toHaveAttribute('aria-disabled', 'true');

    const underwaterTile = screen
      .getAllByTestId('theme-underwater')
      .find((el) => el.querySelector('[data-testid="coming-soon-badge"]'))!;
    expect(underwaterTile).toHaveAttribute('aria-disabled', 'true');
    expect(
      within(underwaterTile).getByTestId('coming-soon-badge'),
    ).toBeInTheDocument();

    fireEvent.click(underwaterTile);
    expect(onChangeSpy).not.toHaveBeenCalledWith(
      expect.objectContaining({ variant: 'underwater' }),
    );
  });
});
