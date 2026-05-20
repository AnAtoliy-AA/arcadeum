import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { PlayerAvatar } from './PlayerAvatar';

const meta: Meta<typeof PlayerAvatar> = {
  title: 'Data Display/PlayerAvatar',
  component: PlayerAvatar,
  argTypes: {
    size: {
      control: 'select',
      options: ['icon', 'sm', 'md', 'card'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof PlayerAvatar>;

export const Icon: Story = {
  args: { name: 'Jane Doe', size: 'icon' },
};

export const Sm: Story = {
  args: {
    name: 'Jane Doe',
    size: 'sm',
    badgeUrl: '/shop/badges/star.png',
    frameColor: '#6366f1',
  },
};

export const Md: Story = {
  args: {
    name: 'Jane Doe',
    size: 'md',
    badgeUrl: '/shop/badges/star.png',
    frameColor: '#22d3ee',
    auraColor: 'rgba(34, 211, 238, 0.6)',
  },
};

export const Card: Story = {
  args: {
    name: 'Jane Doe',
    size: 'card',
    badgeUrl: '/shop/badges/star.png',
    frameColor: '#a855f7',
    auraColor: 'rgba(168, 85, 247, 0.6)',
    bannerColor: 'linear-gradient(135deg, #1e293b 0%, #6366f1 100%)',
    nameColor: 'linear-gradient(90deg, #f59e0b, #ef4444)',
    presenceLine: 'Level 42',
  },
};

export const LoadingFromCatalog: Story = {
  args: {
    name: 'Jane Doe',
    size: 'md',
  },
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
      <PlayerAvatar name="J" size="icon" />
      <PlayerAvatar name="Jane" size="sm" frameColor="#6366f1" />
      <PlayerAvatar
        name="Jane"
        size="md"
        frameColor="#22d3ee"
        auraColor="#22d3ee"
      />
      <PlayerAvatar
        name="Jane"
        size="card"
        frameColor="#a855f7"
        auraColor="#a855f7"
        bannerColor="#1e293b"
        presenceLine="Online"
      />
    </div>
  ),
};
