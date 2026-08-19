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
      options={{ variant: 'classic' } as never}
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
            { id: 'classic', comingSoon: false },
            { id: 'pixel', comingSoon: false },
          ],
          rules: [],
        }, // cyber hidden
      ],
    });

    renderConfig();

    await waitFor(() => {
      expect(
        screen.queryByText(/games\.sea_battle_v1\.variants\.cyber\.name/),
      ).toBeNull();
    });
    expect(
      screen.getByText(/games\.sea_battle_v1\.variants\.classic\.name/),
    ).toBeInTheDocument();
  });

  it('renders the full list when the catalog fetch fails (silent failure)', async () => {
    vi.mocked(gamesApi.getCatalog).mockRejectedValueOnce(new Error('offline'));

    renderConfig();

    await waitFor(() => {
      expect(
        screen.getByText(/games\.sea_battle_v1\.variants\.cyber\.name/),
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
            { id: 'classic', comingSoon: false },
            { id: 'cyber', comingSoon: true },
          ],
          rules: [],
        },
      ],
    });

    render(
      <CreationConfig
        options={{ variant: 'classic' } as never}
        onChange={onChangeSpy}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('theme-classic')).toBeInTheDocument();
    });

    // classic: interactive
    const classicTile = screen.getByTestId('theme-classic');
    expect(classicTile).not.toHaveAttribute('aria-disabled', 'true');

    // cyber: disabled with badge
    const cyberTile = screen.getByTestId('theme-cyber');
    expect(cyberTile).toHaveAttribute('aria-disabled', 'true');
    expect(
      within(cyberTile).getByTestId('coming-soon-badge'),
    ).toBeInTheDocument();

    // Click is a no-op
    fireEvent.click(cyberTile);
    expect(onChangeSpy).not.toHaveBeenCalledWith(
      expect.objectContaining({ variant: 'cyber' }),
    );
  });
});
