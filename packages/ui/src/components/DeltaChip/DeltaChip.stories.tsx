import { Meta, StoryObj } from '@storybook/react';
import { DeltaChip } from './DeltaChip';

const meta: Meta<typeof DeltaChip> = {
  title: 'Leaderboards/DeltaChip',
  component: DeltaChip,
};
export default meta;

type Story = StoryObj<typeof DeltaChip>;

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <DeltaChip from={22} to={16} />
      <DeltaChip from={5} to={5} />
      <DeltaChip from={47} to={62} />
    </div>
  ),
};
