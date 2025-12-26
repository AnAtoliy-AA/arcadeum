import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'Shared/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['success', 'warning', 'error', 'info', 'neutral'],
      description: 'Badge color variant',
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
      description: 'Badge size',
    },
    children: {
      control: 'text',
      description: 'Badge content',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Success: Story = {
  args: {
    variant: 'success',
    children: 'LOBBY',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    children: 'IN PROGRESS',
  },
};

export const Error: Story = {
  args: {
    variant: 'error',
    children: 'ENDED',
  },
};

export const Info: Story = {
  args: {
    variant: 'info',
    children: 'NEW',
  },
};

export const Neutral: Story = {
  args: {
    variant: 'neutral',
    children: 'CLOSED',
  },
};

export const Small: Story = {
  args: {
    variant: 'success',
    size: 'sm',
    children: 'ONLINE',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
      <Badge variant="success">SUCCESS</Badge>
      <Badge variant="warning">WARNING</Badge>
      <Badge variant="error">ERROR</Badge>
      <Badge variant="info">INFO</Badge>
      <Badge variant="neutral">NEUTRAL</Badge>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
      <Badge variant="success" size="sm">
        SMALL
      </Badge>
      <Badge variant="success" size="md">
        MEDIUM
      </Badge>
    </div>
  ),
};

export const GameStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Badge variant="success">LOBBY</Badge>
        <span>Players can join</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Badge variant="warning">IN PROGRESS</Badge>
        <span>Game is running</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Badge variant="neutral">ENDED</Badge>
        <span>Game has finished</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Badge variant="info">SPECTATING</Badge>
        <span>Watching as spectator</span>
      </div>
    </div>
  ),
};

export const InlineWithText: Story = {
  render: () => (
    <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      Exploding Kittens <Badge variant="success">LOBBY</Badge> • 3/4 players
    </p>
  ),
};
