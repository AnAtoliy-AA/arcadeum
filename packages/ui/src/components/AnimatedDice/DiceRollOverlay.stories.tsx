import type { Meta, StoryObj } from '@storybook/react';
import { DiceRollOverlay } from './DiceRollOverlay';

const meta: Meta<typeof DiceRollOverlay> = {
  title: 'Components/DiceRollOverlay',
  component: DiceRollOverlay,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DiceRollOverlay>;

export const ReadyToRoll: Story = {
  args: {
    canRoll: true,
    isRolling: false,
    onRoll: () => {},
    rollLabel: 'Roll Dice',
    subtitle: 'Spacebar to roll',
  },
};

export const Rolling: Story = {
  args: {
    canRoll: false,
    isRolling: true,
    onRoll: () => {},
    values: [1],
  },
};

export const Result: Story = {
  args: {
    canRoll: false,
    isRolling: false,
    onRoll: () => {},
    values: [5],
    resultLabel: 'Moved 5 spaces',
  },
};
