import { Meta, StoryObj } from '@storybook/react';
import { XStack } from 'tamagui';
import { TrendPill } from './TrendPill';

const meta: Meta<typeof TrendPill> = {
  title: 'Leaderboards/TrendPill',
  component: TrendPill,
};
export default meta;

type Story = StoryObj<typeof TrendPill>;

export const Variants: Story = {
  render: () => (
    <XStack gap="$3">
      <TrendPill rank={6} prevRank={12} />
      <TrendPill rank={42} prevRank={42} />
      <TrendPill rank={28} prevRank={11} />
    </XStack>
  ),
};
