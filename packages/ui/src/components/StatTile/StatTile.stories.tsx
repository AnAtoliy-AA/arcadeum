import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { StatTile } from './StatTile';

const meta: Meta<typeof StatTile> = {
  title: 'Shared/StatTile',
  component: StatTile,
  tags: ['autodocs'],
  argTypes: {
    value: { control: 'text' },
    label: { control: 'text' },
    sparkline: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof StatTile>;

export const Tickets: Story = {
  args: { value: '2,840', label: 'Tickets resolved this month' },
};

export const Rating: Story = {
  args: { value: '4.9 ★', label: 'Avg. support rating' },
};

export const Sla: Story = {
  args: { value: '98%', label: 'SLA hit rate' },
};

export const NoSparkline: Story = {
  args: { value: '5', label: 'Languages supported', sparkline: false },
};
