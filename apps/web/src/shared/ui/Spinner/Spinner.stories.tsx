import type { Meta, StoryObj } from '@storybook/react';
import { Spinner } from './Spinner';

const meta: Meta<typeof Spinner> = {
  title: 'Shared/Spinner',
  component: Spinner,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Spinner size',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Spinner>;

export const Default: Story = {
  args: {
    size: 'md',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
  },
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
      <div style={{ textAlign: 'center' }}>
        <Spinner size="sm" />
        <p style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>Small</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Spinner size="md" />
        <p style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>Medium</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Spinner size="lg" />
        <p style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>Large</p>
      </div>
    </div>
  ),
};

export const WithText: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <Spinner size="sm" />
      <span>Loading...</span>
    </div>
  ),
};

export const CenteredLoading: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        padding: '3rem',
      }}
    >
      <Spinner size="lg" />
      <span style={{ opacity: 0.7 }}>Loading game data...</span>
    </div>
  ),
};
