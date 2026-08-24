import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { AttackPlayerBoard } from './AttackPlayerBoard';
import { getTheme } from '../../lib/theme';
import { CELL_STATE } from '../../types';
import type {
  CellState,
  SeaBattlePlayerState,
} from '../../types';

const theme = getTheme('cyberpunk');

function makePlayer(board: CellState[][]): SeaBattlePlayerState {
  return {
    playerId: 'opponent-1',
    alive: true,
    board,
    ships: [],
    shipsRemaining: 0,
    placementComplete: true,
  };
}

const emptyBoard = (): CellState[][] =>
  Array.from({ length: 10 }, () =>
    Array.from({ length: 10 }, () => CELL_STATE.EMPTY),
  );

function renderBoard(
  board: CellState[][],
  onAttack: (playerId: string, row: number, col: number) => void,
  overrides: Partial<Parameters<typeof AttackPlayerBoard>[0]> = {},
) {
  return render(
    <AttackPlayerBoard
      player={makePlayer(board)}
      isMe={false}
      theme={theme}
      resolveDisplayName={(id: string) => id}
      idlePlayers={[]}
      isMyTurn={true}
      isCurrentTurn={true}
      disabled={false}
      onAttack={onAttack}
      t={(key: string) => key as never}
      {...overrides}
    />,
  );
}

describe('AttackPlayerBoard keyboard navigation', () => {
  it('fires an attack on Enter from a keyboard-focused cell', () => {
    const onAttack = vi.fn();
    renderBoard(emptyBoard(), onAttack);

    const grid = screen.getByRole('grid');
    fireEvent.keyDown(grid, { key: 'ArrowRight' });
    fireEvent.keyDown(grid, { key: 'ArrowDown' });
    fireEvent.keyDown(grid, { key: 'Enter' });

    expect(onAttack).toHaveBeenCalledWith('opponent-1', 1, 1);
  });

  it('does not fire on already-attacked cells without weapon mode', () => {
    const board = emptyBoard();
    board[0][0] = CELL_STATE.MISS;
    const onAttack = vi.fn();
    renderBoard(board, onAttack);

    // Clamp focus onto cell 0:0 (the MISS cell), then try to fire.
    const grid = screen.getByRole('grid');
    fireEvent.keyDown(grid, { key: 'ArrowLeft' });
    fireEvent.keyDown(grid, { key: 'Enter' });
    expect(onAttack).not.toHaveBeenCalled();

    cleanup();

    // Weapon mode allows targeting any cell
    renderBoard(emptyBoard(), onAttack, { weaponMode: true });
    fireEvent.keyDown(screen.getByRole('grid'), { key: 'ArrowRight' });
    fireEvent.keyDown(screen.getByRole('grid'), { key: 'Enter' });
    expect(onAttack).toHaveBeenCalledWith('opponent-1', 0, 1);
  });

  it('ignores keys while targeting is disabled', () => {
    const onAttack = vi.fn();
    renderBoard(emptyBoard(), onAttack, {
      isMyTurn: false,
      isCurrentTurn: false,
    });

    const grid = screen.getByRole('grid');
    fireEvent.keyDown(grid, { key: 'ArrowRight' });
    fireEvent.keyDown(grid, { key: 'Enter' });
    expect(onAttack).not.toHaveBeenCalled();
  });
});
