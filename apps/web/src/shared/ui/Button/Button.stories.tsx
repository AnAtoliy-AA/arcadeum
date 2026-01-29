import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Shared/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'primary',
        'secondary',
        'danger',
        'ghost',
        'glass',
        'neutral',
        'success',
        'warning',
        'info',
        'icon',
        'link',
        'chip',
        'listItem',
      ],
      description: 'Visual style variant',
    },
    gameVariant: {
      control: 'select',
      options: ['cyberpunk', 'underwater'],
      description: 'Game-specific styling',
    },
    pulse: {
      control: 'boolean',
      description: 'Enable pulse animation',
    },
    uppercase: {
      control: 'boolean',
      description: 'Force uppercase text',
    },
    $active: {
      control: 'boolean',
      description: 'Active state for toggles',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Button size',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Make button full width',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the button',
    },
    children: {
      control: 'text',
      description: 'Button content',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'Danger Button',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost Button',
  },
};

export const Glass: Story = {
  args: {
    variant: 'glass',
    children: 'Glass Button',
  },
  globals: {
    backgrounds: {
      value: 'dark',
    },
  },
};

export const Link: Story = {
  args: {
    variant: 'link',
    children: 'Link Button',
  },
};

export const Chip: Story = {
  args: {
    variant: 'chip',
    children: 'Chip Button',
    $active: false,
  },
};

export const ListItem: Story = {
  args: {
    variant: 'listItem',
    children: 'List Item Button',
    fullWidth: true,
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small Button',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large Button',
  },
};

export const FullWidth: Story = {
  args: {
    fullWidth: true,
    children: 'Full Width Button',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled Button',
  },
};

export const WithIcon: Story = {
  args: {
    children: '🚀 Launch',
  },
};

export const IconVariant: Story = {
  args: {
    variant: 'icon',
    children: '🔔',
    'aria-label': 'Notifications',
  },
};

export const GameCyberpunk: Story = {
  args: {
    gameVariant: 'cyberpunk',
    children: 'Cyberpunk Action',
    uppercase: true,
  },
  globals: {
    backgrounds: {
      value: 'dark',
    },
  },
};

export const GameUnderwater: Story = {
  args: {
    gameVariant: 'underwater',
    children: 'Underwater Action',
    uppercase: true,
  },
  globals: {
    backgrounds: {
      value: 'dark',
    },
  },
};

export const Pulsing: Story = {
  args: {
    variant: 'primary',
    children: 'Start Game',
    pulse: true,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        padding: '1rem',
        background: '#333',
      }}
    >
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="danger">Danger</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="glass">Glass</Button>
      <Button variant="neutral">Neutral</Button>
      <Button variant="success">Success</Button>
      <Button variant="warning">Warning</Button>
      <Button variant="info">Info</Button>
      <Button variant="link">Link</Button>
      <Button variant="chip">Chip</Button>
      <Button variant="chip" $active>
        Active Chip
      </Button>
      <Button variant="icon">🔍</Button>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};
