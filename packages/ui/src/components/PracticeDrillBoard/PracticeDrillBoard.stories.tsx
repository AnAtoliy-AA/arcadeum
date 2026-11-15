import type { Meta, StoryObj } from '@storybook/react';
import { PracticeDrillBoard } from './PracticeDrillBoard';

const meta: Meta<typeof PracticeDrillBoard> = {
  title: 'Components/PracticeDrillBoard',
  component: PracticeDrillBoard,
  tags: ['autodocs'],
  argTypes: {
    gameId: {
      control: 'select',
      options: [
        'tic-tac-toe',
        'chess',
        'checkers',
        'sea-battle',
        'minesweeper',
        'sudoku',
        'go',
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof PracticeDrillBoard>;

export const TicTacToeFork: Story = {
  args: {
    gameId: 'tic-tac-toe',
    grid: ['X..', '.O.', '..X'],
    solvedIndex: 2,
  },
};

export const ChessCheckmateDrill: Story = {
  args: {
    gameId: 'chess',
    grid: [
      'r.bqk.nr',
      'pppp.ppp',
      '..n.....',
      '..B.p...',
      '....P...',
      '.....Q..',
      'PPPP.PPP',
      'RNB.K.NR',
    ],
    solvedIndex: 13,
  },
};

export const SeaBattleClusterHunt: Story = {
  args: {
    gameId: 'sea-battle',
    grid: [
      'M.........',
      '.M........',
      '..H.......',
      '...M......',
      '..........',
      '..........',
    ],
    colLabels: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
    rowLabels: ['1', '2', '3', '4', '5', '6'],
    solvedIndex: 22,
  },
};

export const MinesweeperSafeProbe: Story = {
  args: {
    gameId: 'minesweeper',
    grid: ['111', '1.1', '111'],
    solvedIndex: 4,
  },
};
