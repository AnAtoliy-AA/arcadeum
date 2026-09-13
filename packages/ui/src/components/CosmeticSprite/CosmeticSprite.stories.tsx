import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { CosmeticSprite } from './CosmeticSprite';

const meta: Meta<typeof CosmeticSprite> = {
  title: 'Data Display/CosmeticSprite',
  component: CosmeticSprite,
  argTypes: {
    size: {
      control: 'number',
    },
  },
};

export default meta;
type Story = StoryObj<typeof CosmeticSprite>;

export const BadgeSprite: Story = {
  args: {
    src: '/shop/badges/scout.png',
    size: 64,
    alt: 'Scout Badge',
  },
};

export const AvatarSprite: Story = {
  args: {
    src: '/shop/avatars/fox-01.png',
    size: 64,
    alt: 'Fox Avatar',
  },
};

export const FallbackImage: Story = {
  args: {
    src: 'https://example.com/custom-badge.png',
    size: 48,
    alt: 'External Custom',
  },
};
