import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';
import {
  PlayIcon,
  PauseIcon,
  StopIcon,
  SkipBackIcon,
  SkipForwardIcon,
} from './MediaIcons';

interface IconStoryArgs {
  size: number;
  color?: string;
}

const meta: Meta<IconStoryArgs> = {
  title: 'Shared/Icons/Media',
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

const ICONS: ReadonlyArray<{
  name: string;
  Icon: (props: { size?: number }) => React.JSX.Element;
}> = [
  { name: 'SkipBackIcon', Icon: SkipBackIcon },
  { name: 'PlayIcon', Icon: PlayIcon },
  { name: 'PauseIcon', Icon: PauseIcon },
  { name: 'StopIcon', Icon: StopIcon },
  { name: 'SkipForwardIcon', Icon: SkipForwardIcon },
];

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
      {ICONS.map(({ name, Icon }) => (
        <div
          key={name}
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
            <Icon size={args.size} />
          </div>
          <span style={{ fontSize: '12px', fontFamily: 'monospace' }}>
            {`<${name} />`}
          </span>
        </div>
      ))}
    </div>
  ),
};

/** The icons laid out as they appear in the in-game music transport bar. */
export const TransportBar: Story = {
  render: (args) => (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 14px',
        borderRadius: '16px',
        background: 'rgba(15,17,26,0.9)',
        border: '1px solid rgba(255,255,255,0.12)',
        color: args.color ?? '#ffffff',
      }}
    >
      <SkipBackIcon size={args.size} />
      <PlayIcon size={args.size} />
      <StopIcon size={args.size} />
      <SkipForwardIcon size={args.size} />
    </div>
  ),
};
