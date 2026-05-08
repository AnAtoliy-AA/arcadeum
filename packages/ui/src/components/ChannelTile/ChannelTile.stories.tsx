import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ChannelTile } from './ChannelTile';

const meta: Meta<typeof ChannelTile> = {
  title: 'Shared/ChannelTile',
  component: ChannelTile,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    sub: { control: 'text' },
    gradient: { control: 'text' },
    href: { control: 'text' },
    external: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof ChannelTile>;

const placeholderIcon = (
  <span style={{ fontSize: 18, color: '#fff' }}>★</span>
);

export const Discord: Story = {
  args: {
    icon: placeholderIcon,
    title: 'Discord',
    sub: 'Live chat · 12.4k members',
    href: 'https://discord.com',
    external: true,
    gradient: 'linear-gradient(135deg,#5865f2 0%,#8b5cf6 100%)',
  },
};

export const GitHub: Story = {
  args: {
    icon: placeholderIcon,
    title: 'GitHub Issues',
    sub: 'Bugs & feature requests',
    href: 'https://github.com',
    external: true,
    gradient: 'linear-gradient(135deg,#1f2328 0%,#6e40c9 100%)',
  },
};

export const NoGradient: Story = {
  args: {
    icon: placeholderIcon,
    title: 'Email support',
    sub: 'arcadeum.care@gmail.com',
    href: 'mailto:arcadeum.care@gmail.com',
  },
};
