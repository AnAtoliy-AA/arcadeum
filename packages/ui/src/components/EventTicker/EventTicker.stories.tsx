import { Meta, StoryObj } from '@storybook/react';
import { EventTicker } from './EventTicker';

const meta: Meta<typeof EventTicker> = {
  title: 'Leaderboards/EventTicker',
  component: EventTicker,
};
export default meta;

type Story = StoryObj<typeof EventTicker>;

export const Default: Story = {
  args: {
    events: [
      { who: 'Nightblade', what: 'won the Mythic streak — +12 rating', color: '#ec4899' },
      { who: 'Frostbyte', what: 'climbed into the Top 10 in Mafia', color: '#22d3ee' },
      { who: 'EmberQueen', what: 'started a 6-game win streak', color: '#34d399' },
    ],
    intervalMs: 1800,
  },
};

export const SingleEvent: Story = {
  args: {
    events: [
      { who: 'OracleX', what: 'qualified for the Autumn Cup quarterfinals' },
    ],
  },
};
