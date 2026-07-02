import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BoardSizeSelector } from './BoardSizeSelector';
import { TamaguiProvider, createTamagui } from 'tamagui';
import { defaultConfig } from '@tamagui/config/v4';

const tamaguiConfig = createTamagui(defaultConfig);

const mockEmit = vi.fn();
vi.mock('@/shared/lib/socket', () => ({
  gameSocket: { emit: (...args: unknown[]) => mockEmit(...args) },
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
    mockEmit.mockClear();
  });

  it('renders all four board sizes', () => {
    renderWithProvider(<BoardSizeSelector roomId="r1" currentSize={3} />);
    [3, 5, 7, 9].forEach((size) => {
      expect(screen.getByTestId(`ttt-board-size-${size}`)).toBeInTheDocument();
    });
  });

  it('emits games.room.set_option when a different size is picked', () => {
    renderWithProvider(
      <BoardSizeSelector roomId="r1" hostId="host-1" currentSize={3} />,
    );
    fireEvent.click(screen.getByTestId('ttt-board-size-5'));
    expect(mockEmit).toHaveBeenCalledWith('games.room.set_option', {
      roomId: 'r1',
      userId: 'host-1',
      options: { boardSize: 5 },
    });
  });

  it('does not emit when clicking the already-active size', () => {
    renderWithProvider(<BoardSizeSelector roomId="r1" currentSize={3} />);
    fireEvent.click(screen.getByTestId('ttt-board-size-3'));
    expect(mockEmit).not.toHaveBeenCalled();
  });

  it('is non-interactive when disabled', () => {
    renderWithProvider(
      <BoardSizeSelector roomId="r1" currentSize={3} disabled />,
    );
    fireEvent.click(screen.getByTestId('ttt-board-size-5'));
    expect(mockEmit).not.toHaveBeenCalled();
  });
});
