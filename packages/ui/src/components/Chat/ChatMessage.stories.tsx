import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ChatMessage } from './ChatMessage';

const meta: Meta<typeof ChatMessage> = {
  title: 'Shared/Chat/ChatMessage',
  component: ChatMessage,
  tags: ['autodocs'],
  argTypes: {
    content: { control: 'text' },
    senderName: { control: 'text' },
    timestamp: { control: 'text' },
    isOwn: { control: 'boolean' },
    isEncrypted: { control: 'boolean' },
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

export default meta;
type Story = StoryObj<typeof ChatMessage>;

export const OtherMessage: Story = {
  args: {
    content: 'Hey, are you ready for the game?',
    senderName: 'Alice',
    timestamp: '10:30 AM',
    isOwn: false,
  },
};

export const OwnMessage: Story = {
  args: {
    content: 'Yes! Just finishing my preparations.',
    senderName: 'You',
    timestamp: '10:32 AM',
    isOwn: true,
  },
};

export const Encrypted: Story = {
  args: {
    content: '',
    senderName: 'Alice',
    timestamp: '10:35 AM',
    isOwn: false,
    isEncrypted: true,
  },
};

export const WithAvatar: Story = {
  args: {
    content: 'Check out my new avatar!',
    senderName: 'Bob',
    timestamp: '10:40 AM',
    isOwn: false,
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
  },
};
