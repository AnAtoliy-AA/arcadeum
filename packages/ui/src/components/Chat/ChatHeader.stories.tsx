import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ChatHeader } from './ChatHeader';

const meta: Meta<typeof ChatHeader> = {
  title: 'Shared/Chat/ChatHeader',
  component: ChatHeader,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    isConnected: { control: 'boolean' },
    statusText: { control: 'text' },
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

export default meta;
type Story = StoryObj<typeof ChatHeader>;

export const Connected: Story = {
  args: {
    title: 'General Chat',
    isConnected: true,
    statusText: 'Connected',
  },
};

export const Disconnected: Story = {
  args: {
    title: 'General Chat',
    isConnected: false,
    statusText: 'Connecting...',
  },
};
