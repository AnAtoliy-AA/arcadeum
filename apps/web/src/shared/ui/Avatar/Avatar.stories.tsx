import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from './Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'Data Display/Avatar',
  component: Avatar,
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Default: Story = {
  args: {
    name: 'John Doe',
    size: 'md',
  },
};

export const Small: Story = {
  args: {
    name: 'Alice',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    name: 'Bob Smith',
    size: 'lg',
  },
};

export const ExtraLarge: Story = {
  args: {
    name: 'Charlie Brown',
    size: 'xl',
  },
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <Avatar name="User" size="sm" />
      <Avatar name="User" size="md" />
      <Avatar name="User" size="lg" />
      <Avatar name="User" size="xl" />
    </div>
  ),
};

export const MultipleUsers: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <Avatar name="Alice Johnson" size="md" />
      <Avatar name="Bob Smith" size="md" />
      <Avatar name="Charlie" size="md" />
      <Avatar name="Diana Prince" size="md" />
    </div>
  ),
};
