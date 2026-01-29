import type { Meta, StoryObj } from '@storybook/react';
import { EmptyState } from './EmptyState';
import { Button } from '../Button';

const meta: Meta<typeof EmptyState> = {
  title: 'Feedback/EmptyState',
  component: EmptyState,
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
  args: {
    message: 'No items found',
  },
};

export const WithIcon: Story = {
  args: {
    message: 'No games available',
    icon: '🎮',
  },
};

export const WithAction: Story = {
  args: {
    message: 'No chats yet',
    icon: '💬',
    action: <Button size="sm">Start a conversation</Button>,
  },
};

export const NoData: Story = {
  args: {
    message: 'Your history is empty. Play some games to see them here!',
    icon: '📜',
  },
};
