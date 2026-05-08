import { Meta, StoryObj } from '@storybook/react';
import { RunnerUpCard } from './RunnerUpCard';

const meta: Meta<typeof RunnerUpCard> = {
  title: 'Leaderboards/RunnerUpCard',
  component: RunnerUpCard,
};
export default meta;

type Story = StoryObj<typeof RunnerUpCard>;

export const Second: Story = {
  args: {
    place: 2,
    name: 'Frostbyte',
    rating: 2806,
    wins: 92,
    winrate: 0.71,
    region: 'Europe',
  },
};

export const Third: Story = {
  args: {
    place: 3,
    name: 'VoidPriest',
    rating: 2750,
    wins: 88,
    winrate: 0.68,
    region: 'North America',
  },
};
