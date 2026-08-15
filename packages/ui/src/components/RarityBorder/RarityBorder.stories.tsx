import type { Meta, StoryObj } from '@storybook/react';
import { RarityBorder } from './RarityBorder';

const meta: Meta<typeof RarityBorder> = {
  title: 'Shop/RarityBorder',
  component: RarityBorder,
};

export default meta;
type Story = StoryObj<typeof RarityBorder>;

function Sample() {
  return (
    <div
      className="flex items-center justify-center rounded-xl bg-[var(--backgroundHover)]"
      style={{ width: 120, height: 120 }}
    >
      <span className="text-[14px] leading-[18px]">item preview</span>
    </div>
  );
}

export const Common: Story = {
  render: () => (
    <RarityBorder rarity="common">
      <Sample />
    </RarityBorder>
  ),
};

export const Rare: Story = {
  render: () => (
    <RarityBorder rarity="rare">
      <Sample />
    </RarityBorder>
  ),
};

export const Epic: Story = {
  render: () => (
    <RarityBorder rarity="epic">
      <Sample />
    </RarityBorder>
  ),
};

export const Legendary: Story = {
  render: () => (
    <RarityBorder rarity="legendary">
      <Sample />
    </RarityBorder>
  ),
};
