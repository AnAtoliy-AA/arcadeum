import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { GameMoveHistory } from './GameMoveHistory';

const now = Date.now();

const meta: Meta<typeof GameMoveHistory> = {
  title: 'Games/Shared/GameMoveHistory',
  component: GameMoveHistory,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: {
    logs: [
      {
        id: '1',
        type: 'system',
        message: 'Game started',
        createdAt: new Date(now - 90000).toISOString(),
      },
      {
        id: '2',
        type: 'action',
        message: 'drew a Strike',
        createdAt: new Date(now - 60000).toISOString(),
        senderId: 'p1',
        senderName: 'Alice',
      },
      {
        id: '3',
        type: 'action',
        message: 'played a Targeted Attack on Bob',
        createdAt: new Date(now - 30000).toISOString(),
        senderId: 'p2',
        senderName: 'Bob',
      },
      {
        id: '4',
        type: 'message',
        message: 'hello everyone',
        createdAt: new Date(now - 10000).toISOString(),
        senderId: 'p3',
        senderName: 'Carol',
      },
    ],
    formatMessage: (m) => m ?? '',
    resolveDisplayName: (id, fallback) => fallback,
  },
};

export default meta;
type Story = StoryObj<typeof GameMoveHistory>;

export const RecentMoves: Story = {};

export const Empty: Story = {
  args: {
    logs: [
      {
        id: '1',
        type: 'message',
        message: 'only chat noise',
        createdAt: new Date().toISOString(),
      },
    ],
  },
};

export const Limited: Story = {
  args: {
    limit: 2,
  },
};
