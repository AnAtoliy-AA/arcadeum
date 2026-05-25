'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  type Board,
  type BoardSize,
  type Cell,
  type WinResult,
  checkWinner,
  createEmptyBoard,
  isDraw,
  winLengthFor,
} from './game-logic';

export type Player = Exclude<Cell, null>;

export interface Score {
  X: number;
  O: number;
  draws: number;
}

const INITIAL_SCORE: Score = { X: 0, O: 0, draws: 0 };

export interface UseTicTacToeResult {
  size: BoardSize;
  winLength: number;
  board: Board;
  currentPlayer: Player;
  winner: WinResult | null;
  draw: boolean;
  score: Score;
  changeSize: (next: BoardSize) => void;
  handleCellClick: (index: number) => void;
  resetGame: () => void;
  resetScore: () => void;
}

export function useTicTacToe(initialSize: BoardSize = 3): UseTicTacToeResult {
  const [size, setSize] = useState<BoardSize>(initialSize);
  const [board, setBoard] = useState<Board>(() =>
    createEmptyBoard(initialSize),
  );
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [score, setScore] = useState<Score>(INITIAL_SCORE);

  const winLength = useMemo(() => winLengthFor(size), [size]);
  const winner = useMemo(
    () => checkWinner(board, size, winLength),
    [board, size, winLength],
  );
  const draw = useMemo(() => isDraw(board, winner), [board, winner]);

  const handleCellClick = useCallback(
    (index: number) => {
      if (winner || draw) return;
      if (board[index] !== null) return;

      const next = board.slice();
      next[index] = currentPlayer;
      const nextWinner = checkWinner(next, size, winLength);
      const nextDraw = isDraw(next, nextWinner);

      setBoard(next);
      setCurrentPlayer((p) => (p === 'X' ? 'O' : 'X'));

      if (nextWinner) {
        setScore((s) => ({
          ...s,
          [nextWinner.winner]: s[nextWinner.winner] + 1,
        }));
      } else if (nextDraw) {
        setScore((s) => ({ ...s, draws: s.draws + 1 }));
      }
    },
    [board, currentPlayer, draw, size, winLength, winner],
  );

  const resetGame = useCallback(() => {
    setBoard(createEmptyBoard(size));
    setCurrentPlayer('X');
  }, [size]);

  const changeSize = useCallback((next: BoardSize) => {
    setSize(next);
    setBoard(createEmptyBoard(next));
    setCurrentPlayer('X');
  }, []);

  const resetScore = useCallback(() => {
    setScore(INITIAL_SCORE);
  }, []);

  return {
    size,
    winLength,
    board,
    currentPlayer,
    winner,
    draw,
    score,
    changeSize,
    handleCellClick,
    resetGame,
    resetScore,
  };
}
