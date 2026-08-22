import type { Meta, StoryObj } from '@storybook/react';
import { AnimatedDice } from './AnimatedDice';

const meta: Meta<typeof AnimatedDice> = {
  title: 'Components/AnimatedDice',
  component: AnimatedDice,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AnimatedDice>;

export const Default: Story = {
  args: {
    values: [3, 5],
    isRolling: false,
    size: 'md',
  },
};

export const Rolling: Story = {
  args: {
    values: [1, 6],
    isRolling: true,
    size: 'md',
  },
};

export const Doubles: Story = {
  args: {
    values: [6, 6, 6, 6],
    isRolling: false,
    isDoubles: true,
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    values: [4, 2],
    isRolling: false,
    size: 'lg',
  },
};

export const Small: Story = {
  args: {
    values: [5, 3],
    isRolling: false,
    size: 'sm',
  },
};
