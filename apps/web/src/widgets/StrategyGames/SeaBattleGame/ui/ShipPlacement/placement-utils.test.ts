import { describe, it, expect } from 'vitest';
import {
  createEmptyBoard,
  deriveBoard,
  areShipsEqual,
  getCellsForPlacement,
} from './placement-utils';
import { CELL_STATE } from '../../types';
import type { Ship } from '../../types';

describe('placement-utils', () => {
  it('creates empty board of correct dimensions', () => {
    const board = createEmptyBoard(10);
    expect(board).toHaveLength(10);
    expect(board[0]).toHaveLength(10);
    expect(board[0][0]).toBe(CELL_STATE.EMPTY);
  });

  it('derives board from ships correctly', () => {
    const ships: Ship[] = [
      {
        id: 'submarine-1',
        name: 'Submarine',
        size: 1,
        hits: 0,
        sunk: false,
        cells: [{ row: 2, col: 3 }],
      },
      {
        id: 'destroyer-1',
        name: 'Destroyer',
        size: 2,
        hits: 0,
        sunk: false,
        cells: [
          { row: 5, col: 5 },
          { row: 5, col: 6 },
        ],
      },
    ];
    const board = deriveBoard(ships, 10);
    expect(board[2][3]).toBe(CELL_STATE.SHIP);
    expect(board[5][5]).toBe(CELL_STATE.SHIP);
    expect(board[5][6]).toBe(CELL_STATE.SHIP);
    expect(board[0][0]).toBe(CELL_STATE.EMPTY);
  });

  it('correctly compares ships for equality', () => {
    const shipsA: Ship[] = [
      {
        id: 'destroyer-1',
        name: 'Destroyer',
        size: 2,
        hits: 0,
        sunk: false,
        cells: [
          { row: 0, col: 0 },
          { row: 0, col: 1 },
        ],
      },
    ];
    const shipsB: Ship[] = [
      {
        id: 'destroyer-1',
        name: 'Destroyer',
        size: 2,
        hits: 0,
        sunk: false,
        cells: [
          { row: 0, col: 1 },
          { row: 0, col: 0 },
        ],
      },
    ];
    const shipsC: Ship[] = [
      {
        id: 'destroyer-1',
        name: 'Destroyer',
        size: 2,
        hits: 0,
        sunk: false,
        cells: [
          { row: 1, col: 0 },
          { row: 1, col: 1 },
        ],
      },
    ];

    expect(areShipsEqual(shipsA, shipsB)).toBe(true);
    expect(areShipsEqual(shipsA, shipsC)).toBe(false);
    expect(areShipsEqual([], [])).toBe(true);
    expect(areShipsEqual(shipsA, [])).toBe(false);
  });

  it('calculates cells for placement correctly', () => {
    const horizontal = getCellsForPlacement(0, 0, 3, false, 10);
    expect(horizontal).toEqual([
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 0, col: 2 },
    ]);

    const vertical = getCellsForPlacement(0, 0, 3, true, 10);
    expect(vertical).toEqual([
      { row: 0, col: 0 },
      { row: 1, col: 0 },
      { row: 2, col: 0 },
    ]);

    const outOfBounds = getCellsForPlacement(9, 9, 3, false, 10);
    expect(outOfBounds).toBeNull();
  });
});
