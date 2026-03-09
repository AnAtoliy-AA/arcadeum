import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ChatMessagePopup } from './ChatMessagePopup';

const meta: Meta<typeof ChatMessagePopup> = {
  title: 'SeaBattle/ChatMessagePopup',
  component: ChatMessagePopup,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#0f172a' }],
    },
  },
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', width: 600, height: 400 }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    onDismiss: { action: 'dismissed' },
  },
};

export default meta;
type Story = StoryObj<typeof ChatMessagePopup>;

export const Default: Story = {
  args: {
    senderName: 'Captain Hook',
    message: 'Your fleet is going down! 🚢',
    visible: true,
  },
};

export const LongMessage: Story = {
  args: {
    senderName: 'Admiral Nelson',
    message:
      'I have placed all my ships and I am ready for battle. You better watch out because my strategy is unbeatable this time around!',
    visible: true,
  },
};

export const ShortMessage: Story = {
  args: {
    senderName: 'Player2',
    message: 'GG!',
    visible: true,
  },
};
