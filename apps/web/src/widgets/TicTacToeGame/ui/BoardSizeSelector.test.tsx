import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BoardSizeSelector } from './BoardSizeSelector';
import { TamaguiProvider, createTamagui } from 'tamagui';
import { defaultConfig } from '@tamagui/config/v4';

const tamaguiConfig = createTamagui(defaultConfig);

const mockUpdate = vi.fn();
vi.mock('@/features/games/api', () => ({
  gamesApi: {
    updateRoomOptions: (...args: unknown[]) => {
      mockUpdate(...args);
      return Promise.resolve({});
    },
  },
}));

vi.mock('@/entities/session/model/useSessionTokens', () => ({
  useSessionTokens: () => ({ snapshot: { accessToken: 'tok' } }),
}));

vi.mock('@/shared/lib/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

function renderWithProvider(ui: React.ReactElement) {
  return render(
    <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
      {ui}
    </TamaguiProvider>,
  );
}

describe('BoardSizeSelector', () => {
  beforeEach(() => {
    mockUpdate.mockClear();
  });

  it('renders all four board sizes', () => {
    renderWithProvider(<BoardSizeSelector roomId="r1" currentSize={3} />);
    [3, 5, 7, 9].forEach((size) => {
      expect(screen.getByTestId(`ttt-board-size-${size}`)).toBeInTheDocument();
    });
  });

  it('calls gamesApi.updateRoomOptions when a different size is picked', async () => {
    renderWithProvider(<BoardSizeSelector roomId="r1" currentSize={3} />);
    fireEvent.click(screen.getByTestId('ttt-board-size-5'));
    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith(
        'r1',
        { boardSize: 5 },
        { token: 'tok' },
      );
    });
  });

  it('does not call API when clicking the already-active size', () => {
    renderWithProvider(<BoardSizeSelector roomId="r1" currentSize={3} />);
    fireEvent.click(screen.getByTestId('ttt-board-size-3'));
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('is non-interactive when disabled', () => {
    renderWithProvider(
      <BoardSizeSelector roomId="r1" currentSize={3} disabled />,
    );
    fireEvent.click(screen.getByTestId('ttt-board-size-5'));
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});
