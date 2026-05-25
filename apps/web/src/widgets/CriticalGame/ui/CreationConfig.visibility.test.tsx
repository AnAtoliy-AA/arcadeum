import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  render,
  screen,
  waitFor,
  fireEvent,
  within,
} from '@testing-library/react';
import { TamaguiProvider } from 'tamagui';
import tamaguiConfig from '@/shared/config/tamagui.config';
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
    <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
      <CreationConfig
        options={{ cardVariant: 'cyberpunk' } as never}
        onChange={vi.fn()}
      />
    </TamaguiProvider>,
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
        }, // crime hidden
      ],
    });

    renderConfig();

    await waitFor(() => {
      expect(
        screen.queryByText(/games\.critical_v1\.variants\.crime\.name/),
      ).toBeNull();
    });
    expect(
      screen.getByText(/games\.critical_v1\.variants\.cyberpunk\.name/),
    ).toBeInTheDocument();
  });

  it('renders the full list when the catalog fetch fails (silent failure)', async () => {
    vi.mocked(gamesApi.getCatalog).mockRejectedValueOnce(new Error('offline'));

    renderConfig();

    await waitFor(() => {
      expect(
        screen.getByText(/games\.critical_v1\.variants\.crime\.name/),
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
        },
      ],
    });

    render(
      <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
        <CreationConfig
          options={{ cardVariant: 'cyberpunk' } as never}
          onChange={onChangeSpy}
        />
      </TamaguiProvider>,
    );

    // Wait for the catalog effect to settle and cyberpunk tile to appear
    await waitFor(() => {
      expect(screen.getByTestId('variant-tile-cyberpunk')).toBeInTheDocument();
    });

    // cyberpunk: interactive (not aria-disabled)
    const cyberpunkTile = screen.getByTestId('variant-tile-cyberpunk');
    expect(cyberpunkTile).not.toHaveAttribute('aria-disabled', 'true');

    // crime: disabled with a coming-soon badge
    const crimeTile = screen.getByTestId('variant-tile-crime');
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
