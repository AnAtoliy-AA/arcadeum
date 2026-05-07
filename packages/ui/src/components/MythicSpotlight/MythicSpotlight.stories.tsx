import { Meta, StoryObj } from '@storybook/react';
import { MythicSpotlight } from './MythicSpotlight';

const meta: Meta<typeof MythicSpotlight> = {
  title: 'Leaderboards/MythicSpotlight',
  component: MythicSpotlight,
};
export default meta;

type Story = StoryObj<typeof MythicSpotlight>;

export const Default: Story = {
  args: {
    rank: 1,
    name: 'Nightblade',
    rating: 2870,
    ratingDelta: 64,
    streak: 11,
    region: 'eu',
    streakLabel: '11-game streak',
    leadLabel: '+64 over #2',
    ctaLabel: 'View profile',
  },
};
