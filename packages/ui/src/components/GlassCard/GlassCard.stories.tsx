import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { GlassCard } from './GlassCard';
import { Typography } from '../Typography/Typography';

const meta: Meta<typeof GlassCard> = {
  title: 'Shared/GlassCard',
  component: GlassCard,
  tags: ['autodocs'],
  argTypes: {
    animated: {
      control: 'boolean',
      description: 'Enable subtle entrance animation',
    },
    children: {
      control: 'text',
      description: 'Card content',
    },
  },
  parameters: {
    backgrounds: {
      default: 'dark',
    },
  },
};

export default meta;
type Story = StoryObj<typeof GlassCard>;

export const Default: Story = {
  args: {
    animated: true,
    children: (
      <div className="flex flex-col gap-4">
        <Typography variant="heading" uiSize="2xl">Glass Card Title</Typography>
        <Typography variant="body">
          This is a premium glassmorphic card component used throughout the application for a modern aesthetic.
        </Typography>
      </div>
    ),
  },
};

export const Static: Story = {
  args: {
    animated: false,
    children: (
      <div className="flex flex-col gap-4">
        <Typography variant="heading" uiSize="xl">Static Card</Typography>
        <Typography variant="body">
          Animation is disabled for this variation.
        </Typography>
      </div>
    ),
  },
};

export const CustomContent: Story = {
  args: {
    animated: true,
    className: 'p-10',
    children: (
      <div className="flex flex-col items-center gap-6">
        <Typography variant="heading" uiSize="3xl" color="$primary">
          Premium Experience
        </Typography>
        <Typography variant="body" uiSize="sm" className="text-center">
          Custom padding and centered content demonstration.
        </Typography>
      </div>
    ),
  },
};
