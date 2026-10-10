import type { Meta, StoryObj } from '@storybook/react';
import { BoardDiagram } from './BoardDiagram';

const meta: Meta<typeof BoardDiagram> = {
  title: 'Components/BoardDiagram',
  component: BoardDiagram,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof BoardDiagram>;

export const SeaBattlePerimeter: Story = {
  args: {
    gameId: 'sea-battle',
    title: 'Perimeter (Shoreline) Placement Scheme',
    caption:
      'Large vessels hug the perimeter to push 50% of their buffer dead zones off the grid, keeping the ocean center open.',
    grid: [
      'SSSS.SSS..',
      '..........',
      'SSS.......',
      '..........',
      'SS........',
      '..........',
      'SS........',
      '..........',
      'SS........',
      '..S.S.S.S.',
    ],
    legend: [
      { variant: 'ship', label: 'Fleet Ships' },
      { variant: 'deadzone', label: 'Buffer Zones' },
    ],
  },
};

export const ChessTrap: Story = {
  args: {
    gameId: 'chess',
    title: "Scholar's Mate Final Position",
    caption: 'White delivers 4-move checkmate on f7 using Queen and Bishop.',
    grid: [
      'r.bqkb.r',
      'pppp.Qpp',
      '..n..n..',
      '....p...',
      '..B.P...',
      '........',
      'PPPP.PPP',
      'RNB.K.NR',
    ],
    legend: [
      { variant: 'white', label: 'White Pieces' },
      { variant: 'black', label: 'Black Pieces' },
    ],
  },
};
