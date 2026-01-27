import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { MaximizeIcon, MinimizeIcon } from './index';
import React from 'react';

// Define the args we want to use in Storybook, including custom controls (color)
// that aren't strictly part of the component props but used in the render function.
interface IconStoryArgs {
  size: number;
  color?: string;
}

const meta: Meta<IconStoryArgs> = {
  title: 'Shared/Icons',
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'number', min: 12, max: 64, step: 4 },
      description: 'Size of the icon in pixels',
    },
    color: {
      control: 'color',
      description: 'Color of the icon (via CSS color property)',
    },
  },
  args: {
    size: 24,
  },
  parameters: {
    controls: { expanded: true },
  },
};

export default meta;
type Story = StoryObj<IconStoryArgs>;

export const Gallery: Story = {
  render: (args) => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
        gap: '2rem',
        padding: '2rem',
        color: args.color,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div
          style={{
            padding: '1rem',
            border: '1px solid #333',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaximizeIcon size={args.size} />
        </div>
        <span style={{ fontSize: '12px', fontFamily: 'monospace' }}>
          &lt;MaximizeIcon /&gt;
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div
          style={{
            padding: '1rem',
            border: '1px solid #333',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MinimizeIcon size={args.size} />
        </div>
        <span style={{ fontSize: '12px', fontFamily: 'monospace' }}>
          &lt;MinimizeIcon /&gt;
        </span>
      </div>
    </div>
  ),
};

export const Maximize: Story = {
  render: (args) => (
    <div style={{ color: args.color }}>
      <MaximizeIcon size={args.size} />
    </div>
  ),
};

export const Minimize: Story = {
  render: (args) => (
    <div style={{ color: args.color }}>
      <MinimizeIcon size={args.size} />
    </div>
  ),
};
