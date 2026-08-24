import {
  BOARD_SIZES,
  INFINITY_MARGIN_OPTIONS,
  INFINITY_WIN_LENGTH_OPTIONS,
} from './tic-tac-toe.constants';
import { isAiDifficulty } from '../../lib/ai-difficulty';

export function validateTicTacToeConfig(
  config: Record<string, unknown>,
): boolean {
  const options = config.options as Record<string, unknown> | undefined;
  const difficulty = options?.aiDifficulty ?? config.aiDifficulty;
  if (difficulty !== undefined && !isAiDifficulty(difficulty)) {
    return false;
  }

  const boardSize = options?.boardSize;

  if (boardSize !== undefined) {
    const isNumber = typeof boardSize === 'number';
    const isInfinity = boardSize === 'infinity';
    if (
      (!isNumber && !isInfinity) ||
      (isNumber && !(BOARD_SIZES as readonly number[]).includes(boardSize))
    ) {
      return false;
    }
  }

  const margin = options?.expansionMargin;
  if (margin !== undefined) {
    if (
      typeof margin !== 'number' ||
      !(INFINITY_MARGIN_OPTIONS as readonly number[]).includes(margin)
    ) {
      return false;
    }
  }

  const winLen = options?.infinityWinLength;
  if (winLen !== undefined) {
    if (
      typeof winLen !== 'number' ||
      !(INFINITY_WIN_LENGTH_OPTIONS as readonly number[]).includes(winLen)
    ) {
      return false;
    }
  }

  return true;
}
