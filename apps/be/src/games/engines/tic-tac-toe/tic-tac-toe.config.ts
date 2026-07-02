import { BOARD_SIZES } from './tic-tac-toe.constants';

export function validateTicTacToeConfig(
  config: Record<string, unknown>,
): boolean {
  const options = config.options as Record<string, unknown> | undefined;
  const boardSize = options?.boardSize;

  if (boardSize !== undefined) {
    if (
      typeof boardSize !== 'number' ||
      !(BOARD_SIZES as readonly number[]).includes(boardSize)
    ) {
      return false;
    }
  }

  return true;
}
