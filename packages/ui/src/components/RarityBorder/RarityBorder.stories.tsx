import type { Meta, StoryObj } from '@storybook/react';
import { YStack, Text } from 'tamagui';
import { RarityBorder } from './RarityBorder';

const meta: Meta<typeof RarityBorder> = {
  title: 'Shop/RarityBorder',
  component: RarityBorder,
};

export default meta;
type Story = StoryObj<typeof RarityBorder>;

function Sample() {
  return (
    <YStack
      width={120}
      height={120}
      backgroundColor="$backgroundHover"
      alignItems="center"
      justifyContent="center"
      borderRadius="$3"
    >
      <Text fontSize="$2">item preview</Text>
    </YStack>
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
