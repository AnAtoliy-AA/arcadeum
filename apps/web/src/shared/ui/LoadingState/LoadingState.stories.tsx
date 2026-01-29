import type { Meta, StoryObj } from '@storybook/react';
import { LoadingState } from './LoadingState';

const meta: Meta<typeof LoadingState> = {
  title: 'Feedback/LoadingState',
  component: LoadingState,
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof LoadingState>;

export const Default: Story = {
  args: {
    message: 'Loading...',
  },
};

export const CustomMessage: Story = {
  args: {
    message: 'Fetching data, please wait...',
  },
};

export const Large: Story = {
  args: {
    message: 'Loading your content',
    size: 'lg',
  },
};

export const Small: Story = {
  args: {
    message: 'Processing',
    size: 'sm',
  },
};
