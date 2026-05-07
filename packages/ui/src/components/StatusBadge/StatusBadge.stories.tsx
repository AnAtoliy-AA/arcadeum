import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { StatusBadge } from './StatusBadge';

const meta: Meta<typeof StatusBadge> = {
  title: 'Shared/StatusBadge',
  component: StatusBadge,
  tags: ['autodocs'],
  argTypes: {
    active: { control: 'boolean' },
    onLabel: { control: 'text' },
    offLabel: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof StatusBadge>;

export const Active: Story = {
  args: { active: true },
};

export const Inactive: Story = {
  args: { active: false },
};

export const CustomLabels: Story = {
  args: { active: true, onLabel: 'LIVE', offLabel: 'IDLE' },
};
