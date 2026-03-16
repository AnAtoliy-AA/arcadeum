import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ChatInput } from './ChatInput';

const meta: Meta<typeof ChatInput> = {
  title: 'Shared/Chat/ChatInput',
  component: ChatInput,
  tags: ['autodocs'],
  argTypes: {
    value: { control: 'text' },
    disabled: { control: 'boolean' },
    placeholder: { control: 'text' },
    sendText: { control: 'text' },
    onChange: { action: 'onChange' },
    onSend: { action: 'onSend' },
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

export default meta;
type Story = StoryObj<typeof ChatInput>;

export const Default: Story = {
  args: {
    value: '',
    placeholder: 'Type a message...',
    sendText: 'Send',
  },
};

export const Filled: Story = {
  args: {
    value: 'Hello world!',
  },
};

export const Disabled: Story = {
  args: {
    value: '',
    disabled: true,
  },
};
