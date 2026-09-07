import type { ChessState } from '../chess.types';

export interface ThreeCheckState extends ChessState {
  checkCount: {
    white: number;
    black: number };
}

export function createThreeCheckState(base: ChessState): ThreeCheckState {
  return {
    ...base,
    checkCount: { white: 0, black: 0 },
  };
}

export function recordCheck(
  state: ThreeCheckState,
  checkedColor: 'white' | 'black',
): ThreeCheckState {
  const newCheckCount = { ...state.checkCount };
  newCheckCount[checkedColor]++;
  return { ...state, checkCount: newCheckCount };
}

export function checkThreeCheckWin(
  state: ThreeCheckState,
): 'white' | 'black' | null {
  if (state.checkCount.white >= 3) return 'black';
  if (state.checkCount.black >= 3) return 'white';
  return null;
}
