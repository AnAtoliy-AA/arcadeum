import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Card } from './Card';

const meta: Meta<typeof Card> = {
  title: 'Shared/Card',
  component: Card,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'elevated', 'outlined'],
      description: 'Card style variant',
    },
    padding: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
      description: 'Card padding',
    },
    interactive: {
      control: 'boolean',
      description: 'Enable hover effects',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    variant: 'default',
    padding: 'md',
    children: (
      <div>
        <h3 style={{ margin: '0 0 0.5rem 0' }}>Card Title</h3>
        <p style={{ margin: 0, opacity: 0.7 }}>This is the card content.</p>
      </div>
    ),
  },
};

export const Elevated: Story = {
  args: {
    variant: 'elevated',
    padding: 'lg',
    children: (
      <div>
        <h3 style={{ margin: '0 0 0.5rem 0' }}>Elevated Card</h3>
        <p style={{ margin: 0, opacity: 0.7 }}>
          This card has a more prominent shadow.
        </p>
      </div>
    ),
  },
};

export const Outlined: Story = {
  args: {
    variant: 'outlined',
    padding: 'md',
    children: (
      <div>
        <h3 style={{ margin: '0 0 0.5rem 0' }}>Outlined Card</h3>
        <p style={{ margin: 0, opacity: 0.7 }}>
          This card has no background fill.
        </p>
      </div>
    ),
  },
};

export const Interactive: Story = {
  args: {
    variant: 'default',
    padding: 'md',
    interactive: true,
    children: (
      <div>
        <h3 style={{ margin: '0 0 0.5rem 0' }}>🎮 Game Room</h3>
        <p style={{ margin: 0, opacity: 0.7 }}>Click to join this room</p>
      </div>
    ),
  },
};

export const NoPadding: Story = {
  args: {
    variant: 'default',
    padding: 'none',
    children: (
      <div
        style={{
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          padding: '2rem',
          borderRadius: '16px',
        }}
      >
        <h3 style={{ margin: '0 0 0.5rem 0', color: 'white' }}>
          Full Bleed Content
        </h3>
        <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)' }}>
          Content fills the entire card.
        </p>
      </div>
    ),
  },
};

export const AllVariants: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        maxWidth: '400px',
      }}
    >
      <Card variant="default">
        <strong>Default</strong> - Standard card with subtle shadow
      </Card>
      <Card variant="elevated">
        <strong>Elevated</strong> - More prominent shadow and gradient
      </Card>
      <Card variant="outlined">
        <strong>Outlined</strong> - Transparent with border only
      </Card>
    </div>
  ),
};

export const GameRoomCards: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '1rem',
      }}
    >
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} variant="elevated" interactive>
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <strong>Room {i}</strong>
              <span
                style={{
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.5rem',
                  background: '#10b981',
                  color: 'white',
                  borderRadius: '4px',
                }}
              >
                LOBBY
              </span>
            </div>
            <span style={{ fontSize: '0.85rem', opacity: 0.7 }}>
              Exploding Kittens • {i + 1}/4
            </span>
          </div>
        </Card>
      ))}
    </div>
  ),
};
