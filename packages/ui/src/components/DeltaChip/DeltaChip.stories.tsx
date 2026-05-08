import { Meta, StoryObj } from '@storybook/react';
import { XStack } from 'tamagui';
import { DeltaChip } from './DeltaChip';

const meta: Meta<typeof DeltaChip> = {
  title: 'Leaderboards/DeltaChip',
  component: DeltaChip,
};
export default meta;

type Story = StoryObj<typeof DeltaChip>;

export const Variants: Story = {
  render: () => (
    <XStack gap="$3" flexWrap="wrap">
      <DeltaChip from={22} to={16} />
      <DeltaChip from={5} to={5} />
      <DeltaChip from={47} to={62} />
    </XStack>
  ),
};
