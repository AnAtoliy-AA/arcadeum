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
      options={{ cardVariant: 'cyberpunk' } as never}
      onChange={vi.fn()}
    />,
  );
}

describe('Critical CreationConfig — variant visibility filter', () => {
  it('hides variants not present in /games/catalog', async () => {
    vi.mocked(gamesApi.getCatalog).mockResolvedValueOnce({
      games: [
        {
          gameId: 'critical_v1',
          comingSoon: false,
          variants: [
            { id: 'cyberpunk', comingSoon: false },
            { id: 'galaxy', comingSoon: false },
          ],
          rules: [],
        }, // crime hidden
      ],
    });

    renderConfig();

    await waitFor(() => {
      expect(screen.queryByText(/games\.themes\.crime\.name/)).toBeNull();
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
        screen.getByText(/games\.themes\.crime\.name/),
      ).toBeInTheDocument();
    });
  });

  it('renders a coming-soon variant as a disabled tile with a "Coming soon" badge', async () => {
    const onChangeSpy = vi.fn();

    vi.mocked(gamesApi.getCatalog).mockResolvedValueOnce({
      games: [
        {
          gameId: 'critical_v1',
          comingSoon: false,
          variants: [
            { id: 'cyberpunk', comingSoon: false },
            { id: 'crime', comingSoon: true },
          ],
          rules: [],
        },
      ],
    });

    render(
      <CreationConfig
        options={{ cardVariant: 'cyberpunk' } as never}
        onChange={onChangeSpy}
      />,
    );

    // Wait for the catalog effect to settle and cyberpunk tile to appear
    await waitFor(() => {
      expect(
        screen.getAllByTestId('theme-cyberpunk').length,
      ).toBeGreaterThanOrEqual(1);
    });

    // cyberpunk: interactive (not aria-disabled)
    const cyberpunkTile = screen.getAllByTestId('theme-cyberpunk')[0];
    expect(cyberpunkTile).not.toHaveAttribute('aria-disabled', 'true');

    // crime: disabled with a coming-soon badge
    const crimeTile = screen
      .getAllByTestId('theme-crime')
      .find((el) => el.querySelector('[data-testid="coming-soon-badge"]'))!;
    expect(crimeTile).toHaveAttribute('aria-disabled', 'true');
    // The identity t() mock returns the key itself; the key used for the badge is games.create.comingSoon
    expect(
      within(crimeTile).getByTestId('coming-soon-badge'),
    ).toBeInTheDocument();

    // Clicking crime is a no-op — onChange is not called with crime as cardVariant
    fireEvent.click(crimeTile);
    expect(onChangeSpy).not.toHaveBeenCalledWith(
      expect.objectContaining({ cardVariant: 'crime' }),
    );
  });
});
