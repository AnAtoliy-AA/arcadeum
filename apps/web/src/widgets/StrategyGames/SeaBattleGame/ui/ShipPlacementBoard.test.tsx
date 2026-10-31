import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ShipPlacementBoard } from './ShipPlacementBoard';
import { SeaBattleThemeProvider } from '../lib/SeaBattleThemeContext';
import type { SeaBattlePlayerState, Ship } from '../types';

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const mockEmptyPlayer: SeaBattlePlayerState = {
  playerId: 'user-1',
  alive: true,
  placementComplete: false,
  shipsRemaining: 2,
  board: Array(10)
    .fill(null)
    .map(() => Array(10).fill(0)),
  ships: [],
};

const defaultShips: Ship[] = [
  {
    id: 'battleship-1',
    name: 'Battleship',
    size: 4,
    cells: [
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 0, col: 2 },
      { row: 0, col: 3 },
    ],
    hits: 0,
    sunk: false,
  },
  {
    id: 'cruiser-1',
    name: 'Cruiser',
    size: 3,
    cells: [
      { row: 2, col: 0 },
      { row: 2, col: 1 },
      { row: 2, col: 2 },
    ],
    hits: 0,
    sunk: false,
  },
];

describe('ShipPlacementBoard', () => {
  it('does not reset placed ships when server snapshot is received with identical ships', () => {
    const onConfirmPlacement = vi.fn();
    const onResetPlacement = vi.fn();
    const onMoveShip = vi.fn();
    const onPlaceShip = vi.fn();

    const { rerender } = render(
      <SeaBattleThemeProvider>
        <ShipPlacementBoard
          currentPlayer={{
            ...mockEmptyPlayer,
            ships: defaultShips,
          }}
          onPlaceShip={onPlaceShip}
          onMoveShip={onMoveShip}
          onConfirmPlacement={onConfirmPlacement}
          onResetPlacement={onResetPlacement}
          isPlacementComplete={false}
          gridSize={10}
          shipCount={2}
        />
      </SeaBattleThemeProvider>,
    );

    const confirmButton = screen.getByRole('button', {
      name: /games.sea_battle_v1.table.actions.confirmPlacement/i,
    });
    expect(confirmButton).not.toBeDisabled();

    fireEvent.click(confirmButton);
    expect(onConfirmPlacement).toHaveBeenCalledWith([
      {
        shipId: 'battleship-1',
        cells: [
          { row: 0, col: 0 },
          { row: 0, col: 1 },
          { row: 0, col: 2 },
          { row: 0, col: 3 },
        ],
      },
      {
        shipId: 'cruiser-1',
        cells: [
          { row: 2, col: 0 },
          { row: 2, col: 1 },
          { row: 2, col: 2 },
        ],
      },
    ]);

    rerender(
      <SeaBattleThemeProvider>
        <ShipPlacementBoard
          currentPlayer={{
            ...mockEmptyPlayer,
            ships: defaultShips.map((s) => ({ ...s, cells: [...s.cells] })),
          }}
          onPlaceShip={onPlaceShip}
          onMoveShip={onMoveShip}
          onConfirmPlacement={onConfirmPlacement}
          onResetPlacement={onResetPlacement}
          isPlacementComplete={false}
          gridSize={10}
          shipCount={2}
        />
      </SeaBattleThemeProvider>,
    );

    expect(confirmButton).not.toBeDisabled();
    fireEvent.click(confirmButton);
    expect(onConfirmPlacement).toHaveBeenCalledTimes(2);
  });

  it('preserves moved ship when another player confirmation snapshot arrives', () => {
    const onConfirmPlacement = vi.fn();
    const onResetPlacement = vi.fn();
    const onMoveShip = vi.fn();
    const onPlaceShip = vi.fn();

    const { container, rerender } = render(
      <SeaBattleThemeProvider>
        <ShipPlacementBoard
          currentPlayer={{
            ...mockEmptyPlayer,
            ships: defaultShips,
          }}
          onPlaceShip={onPlaceShip}
          onMoveShip={onMoveShip}
          onConfirmPlacement={onConfirmPlacement}
          onResetPlacement={onResetPlacement}
          isPlacementComplete={false}
          gridSize={10}
          shipCount={2}
        />
      </SeaBattleThemeProvider>,
    );

    const cellToClick = container.querySelector('[data-row="0"][data-col="0"]');
    expect(cellToClick).toBeDefined();
    if (cellToClick) fireEvent.click(cellToClick);

    const destinationCell = container.querySelector(
      '[data-row="5"][data-col="0"]',
    );
    expect(destinationCell).toBeDefined();
    if (destinationCell) fireEvent.click(destinationCell);

    expect(onMoveShip).toHaveBeenCalledWith('battleship-1', [
      { row: 5, col: 0 },
      { row: 5, col: 1 },
      { row: 5, col: 2 },
      { row: 5, col: 3 },
    ]);

    rerender(
      <SeaBattleThemeProvider>
        <ShipPlacementBoard
          currentPlayer={{
            ...mockEmptyPlayer,
            ships: defaultShips.map((s) => ({ ...s, cells: [...s.cells] })),
          }}
          onPlaceShip={onPlaceShip}
          onMoveShip={onMoveShip}
          onConfirmPlacement={onConfirmPlacement}
          onResetPlacement={onResetPlacement}
          isPlacementComplete={false}
          gridSize={10}
          shipCount={2}
        />
      </SeaBattleThemeProvider>,
    );

    const confirmButton = screen.getByRole('button', {
      name: /games.sea_battle_v1.table.actions.confirmPlacement/i,
    });
    fireEvent.click(confirmButton);

    expect(onConfirmPlacement).toHaveBeenCalledWith([
      {
        shipId: 'battleship-1',
        cells: [
          { row: 5, col: 0 },
          { row: 5, col: 1 },
          { row: 5, col: 2 },
          { row: 5, col: 3 },
        ],
      },
      {
        shipId: 'cruiser-1',
        cells: [
          { row: 2, col: 0 },
          { row: 2, col: 1 },
          { row: 2, col: 2 },
        ],
      },
    ]);
  });
});
