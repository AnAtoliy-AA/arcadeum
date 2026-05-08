import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ActivityTicker } from './ActivityTicker';

const meta: Meta<typeof ActivityTicker> = {
  title: 'Shared/ActivityTicker',
  component: ActivityTicker,
  tags: ['autodocs'],
  argTypes: {
    interval: {
      control: { type: 'number' },
      description: 'Milliseconds between rotations',
    },
    label: {
      control: 'text',
      description: 'Optional label shown on the left side of the ticker',
    },
    pauseOnHover: {
      control: 'boolean',
      description: 'Whether rotation pauses while hovered',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ActivityTicker>;

const sample = [
  { tag: 'support', who: 'Maria', what: 'answered a ticket', when: '12s ago', color: '#22d3ee' },
  { tag: 'release', who: 'v2.41', what: 'shipped to production', when: '4m ago', color: '#a78bfa' },
  { tag: 'bug', who: 'Anatoliy', what: 'fixed lobby latency', when: '11m ago', color: '#f472b6' },
  { tag: 'support', who: 'Sergey', what: 'joined office hours', when: '23m ago', color: '#22d3ee' },
  { tag: 'status', who: 'All systems', what: 'operational · 99.98% uptime', when: '—', color: '#34d399' },
];

export const Default: Story = {
  args: {
    items: sample,
    label: 'HQ live feed',
    interval: 3200,
  },
};

export const Fast: Story = {
  args: {
    items: sample,
    interval: 1200,
  },
};

export const NoLabel: Story = {
  args: {
    items: sample,
  },
};
