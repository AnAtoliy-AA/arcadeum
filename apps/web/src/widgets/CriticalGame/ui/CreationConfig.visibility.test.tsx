import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
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
});
