import type { Meta, StoryObj } from '@storybook/react';
import { ErrorState } from './ErrorState';

const meta: Meta<typeof ErrorState> = {
  title: 'Feedback/ErrorState',
  component: ErrorState,
};

export default meta;
type Story = StoryObj<typeof ErrorState>;

export const Default: Story = {
  args: {
    message: 'Something went wrong',
  },
};

export const WithTitle: Story = {
  args: {
    title: 'Connection Error',
    message:
      'Unable to connect to the server. Please check your internet connection.',
  },
};

export const WithRetry: Story = {
  args: {
    title: 'Failed to Load',
    message: 'Could not load the data. Please try again.',
    onRetry: () => alert('Retrying...'),
    retryLabel: 'Retry',
  },
};

export const NetworkError: Story = {
  args: {
    title: 'Network Error',
    message: 'Please check your connection and try again.',
    onRetry: () => console.log('Retry clicked'),
  },
};
